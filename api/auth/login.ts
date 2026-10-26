/**
 * login.ts — Vercel Serverless Function (/api/auth/login)
 * Autenticação segura de clientes, parceiros e administradores.
 * Valida as credenciais em ambiente de servidor seguro e emite
 * um Firebase Custom Token (RS256) oficial para fechar brechas do DevTools.
 */

import crypto from 'crypto';

// In-memory rate limiting map (IP -> timestamps[])
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(clientIp: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(clientIp) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    return true;
  }

  timestamps.push(now);
  rateLimitMap.set(clientIp, timestamps);

  if (rateLimitMap.size > 1000) {
    for (const [ip, list] of rateLimitMap.entries()) {
      const active = list.filter((t) => now - t < windowMs);
      if (active.length === 0) rateLimitMap.delete(ip);
      else rateLimitMap.set(ip, active);
    }
  }

  return false;
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Cache do token OAuth2 do Google (evita chamadas repetidas)
let cachedOAuthToken: { token: string; expiresAt: number } | null = null;

function cleanPrivateKey(rawKey: string): crypto.KeyObject | string {
  if (!rawKey) return '';
  let str = String(rawKey).trim();

  // 1. Se for JSON completo da Service Account colado como string
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const parsedJson = JSON.parse(str);
      if (parsedJson.private_key) {
        return cleanPrivateKey(parsedJson.private_key);
      }
    } catch {}
  }

  // 2. Remove aspas envolventes se foram coladas na Vercel
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }

  // 3. Normaliza quebras escapadas e quebras Windows
  str = str.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r\n/g, '\n');

  const beginMarker = '-----BEGIN PRIVATE KEY-----';
  const endMarker = '-----END PRIVATE KEY-----';

  if (str.includes(beginMarker) && str.includes(endMarker)) {
    const startIdx = str.indexOf(beginMarker) + beginMarker.length;
    const endIdx = str.indexOf(endMarker);
    let base64Body = str.slice(startIdx, endIdx).replace(/[^A-Za-z0-9+/=]/g, '');

    // Auto-cura: Remove qualquer caractere espúrio antes do prefixo PKCS#8 ASN.1 (MII...)
    const miiIdx = base64Body.indexOf('MII');
    if (miiIdx > 0) {
      base64Body = base64Body.slice(miiIdx);
    }

    // Auto-cura: Repara quebra de linha onde a barra invertida foi perdida no paste (\n -> n)
    if (base64Body.includes('usYmvnuG/K')) {
      base64Body = base64Body.replace('usYmvnuG/K', 'usYmvuG/K');
    }

    // Auto-cura: Trunca caracteres espúrios após o padding '=' (ex: '\n' colado sem barra invertida como 'n')
    const paddingIdx = base64Body.indexOf('=');
    if (paddingIdx !== -1) {
      if (base64Body[paddingIdx + 1] === '=') {
        base64Body = base64Body.slice(0, paddingIdx + 2);
      } else {
        base64Body = base64Body.slice(0, paddingIdx + 1);
      }
    } else {
      const rem = base64Body.length % 4;
      if (rem !== 0) {
        base64Body = base64Body.slice(0, base64Body.length - rem);
      }
    }

    // MÉTODO 1: Decodificação binária direta de ASN.1 DER PKCS#8 (Imune a OpenSSL)
    try {
      const derBuf = Buffer.from(base64Body, 'base64');
      return crypto.createPrivateKey({ key: derBuf, format: 'der', type: 'pkcs8' });
    } catch {}

    // MÉTODO 2: Reconstrução canónica de PEM em 64 colunas
    const chunked = base64Body.match(/.{1,64}/g)?.join('\n') || base64Body;
    const formattedPem = `${beginMarker}\n${chunked}\n${endMarker}\n`;
    try {
      return crypto.createPrivateKey({ key: formattedPem, format: 'pem' });
    } catch {}
    try {
      return crypto.createPrivateKey(formattedPem);
    } catch {}
  }

  // 5. Se for string Base64 do PEM ou do JSON
  try {
    const decoded = Buffer.from(str.replace(/\s+/g, ''), 'base64').toString('utf8');
    if (decoded.includes(beginMarker) || (decoded.startsWith('{') && decoded.includes('private_key'))) {
      return cleanPrivateKey(decoded);
    }
  } catch {}

  // 6. Tentativa final como PEM
  try {
    return crypto.createPrivateKey({ key: str, format: 'pem' });
  } catch (err: any) {
    throw new Error(`Chave privada Firebase inválida: ${err.message}`);
  }
}

function getServiceAccount() {
  const email = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@faturasimples.iam.gserviceaccount.com';
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
  const parsedKey = cleanPrivateKey(rawKey);

  return {
    projectId: process.env.FIREBASE_PROJECT_ID || 'faturasimples',
    clientEmail: email,
    privateKey: parsedKey,
  };
}

async function getGoogleAdminAccessToken(clientEmail: string, privateKey: crypto.KeyObject | string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  if (cachedOAuthToken && cachedOAuthToken.expiresAt > now + 60) {
    return cachedOAuthToken.token;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/identitytoolkit',
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  signer.end();

  const signature = signer.sign(privateKey);
  const jwt = `${signatureInput}.${base64url(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Falha ao obter Google OAuth2 Access Token: ${JSON.stringify(data)}`);
  }

  cachedOAuthToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in || 3600),
  };

  return data.access_token;
}

function createFirebaseCustomToken(
  clientEmail: string,
  privateKey: crypto.KeyObject | string,
  uid: string,
  claims: Record<string, any> = {}
): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now,
    exp: now + 3600,
    uid: String(uid),
    claims,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  signer.end();

  const signature = signer.sign(privateKey);
  return `${signatureInput}.${base64url(signature)}`;
}

function hashKivoraPassword(cleanPass: string): string {
  const salt = 'KIVORA_SECURE_AUTH_SALT_v2_2026';
  const combined = `${salt}:${cleanPass}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

function verifyPasswordMatch(
  stored: { password?: string; passwordHash?: string; password_hash?: string; tempPassword?: string },
  inputPass: string
): boolean {
  const clean = inputPass.trim();
  if (!clean) return false;

  const targetHash = stored.passwordHash || stored.password_hash;
  if (targetHash) {
    const computed = hashKivoraPassword(clean);
    if (targetHash === computed) return true;
  }

  if (stored.tempPassword && stored.tempPassword === clean) {
    return true;
  }

  if (stored.password && stored.password === clean) {
    return true;
  }

  return false;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Blindagem de autenticação (v2.1): identidade de parceiro inequívoca,
 * verificação estrita de credenciais, bloqueio persistente anti força-bruta
 * e token de sessão assinado pelo servidor.
 * ────────────────────────────────────────────────────────────────────────── */

const MASTER_ADMIN_EMAILS = [
  'admin@kivora.ao',
  'kivora.angola@gmail.com',
  'narcisomarcos826@gmail.com',
  'comercial@kivora.ao',
  'suporte@kivora.ao',
  'investidores@kivora.ao',
  'parceiros@kivora.ao',
];

const MAX_FAILED_ATTEMPTS = 7;
const LOCKOUT_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

/** Identifica e-mails reservados à administração — nunca podem autenticar como cliente/parceiro. */
function isAdminLikeEmail(value: string): boolean {
  const v = value.trim().toLowerCase();
  return MASTER_ADMIN_EMAILS.includes(v) || v.endsWith('@kivora.ao');
}

/** Comparação em tempo constante para evitar ataques de temporização sobre hashes/senhas. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/**
 * Verificação ESTRITA de credencial de parceiro: se existe hash, só o hash conta
 * (senhas em texto claro antigas/obsoletas deixam de ser aceites). Só quando não há
 * hash é que se aceita o legado em texto claro, que é migrado para hash no login.
 */
function verifyCredentialStrict(
  stored: { password?: string; passwordHash?: string; password_hash?: string; tempPassword?: string },
  inputPass: string
): boolean {
  const clean = inputPass.trim();
  if (!clean) return false;

  const targetHash = stored.passwordHash || stored.password_hash;
  if (targetHash) {
    return safeEqual(String(targetHash), hashKivoraPassword(clean));
  }

  if (stored.tempPassword && safeEqual(String(stored.tempPassword), clean)) return true;
  if (stored.password && safeEqual(String(stored.password), clean)) return true;
  return false;
}

/** Segredo de assinatura de sessão derivado da chave privada do servidor (nunca exposta ao browser). */
function getSessionSecret(): Buffer {
  return crypto
    .createHash('sha256')
    .update('KIVORA_API_SESSION_V1|' + (process.env.FIREBASE_PRIVATE_KEY || ''))
    .digest();
}

/** Emite token de sessão HMAC-SHA256 verificável pelos endpoints protegidos (emissão, troca de senha). */
function signSessionToken(payload: { uid: string; role: string; pc: string }): string {
  const now = Date.now();
  const body = base64url(JSON.stringify({ v: 1, ...payload, iat: now, exp: now + SESSION_TTL_MS }));
  const sig = base64url(crypto.createHmac('sha256', getSessionSecret()).update(body).digest());
  return `${body}.${sig}`;
}

function fsFilter(field: string, value: string) {
  return { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } } };
}

interface FsDoc {
  id: string;
  data: Record<string, any>;
}

/** Consulta OR numa coleção. Falha de forma FECHADA (lança) para nunca tratar erro de leitura como "não existe". */
async function queryCollectionOr(
  firestoreBase: string,
  accessToken: string,
  collectionId: string,
  filters: any[]
): Promise<FsDoc[]> {
  const where = filters.length > 1 ? { compositeFilter: { op: 'OR', filters } } : filters[0];
  const res = await fetch(`${firestoreBase}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId }], where } }),
  });
  if (!res.ok) {
    throw new Error(`Falha ao consultar ${collectionId} (HTTP ${res.status}).`);
  }
  const rows = await res.json();
  const out: FsDoc[] = [];
  if (Array.isArray(rows)) {
    for (const row of rows) {
      if (row.document && row.document.fields) {
        out.push({
          id: row.document.name.split('/').pop() || '',
          data: parseFirestoreFields(row.document.fields),
        });
      }
    }
  }
  return out;
}

async function getDocById(
  firestoreBase: string,
  accessToken: string,
  collectionId: string,
  docId: string
): Promise<FsDoc | null> {
  const res = await fetch(`${firestoreBase}/${collectionId}/${encodeURIComponent(docId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Falha ao ler ${collectionId}/${docId} (HTTP ${res.status}).`);
  const json = await res.json();
  return json.fields ? { id: docId, data: parseFirestoreFields(json.fields) } : null;
}

function dedupeDocs(docs: FsDoc[]): FsDoc[] {
  const seen = new Set<string>();
  return docs.filter((d) => (seen.has(d.id) ? false : (seen.add(d.id), true)));
}

/** Estado persistente de tentativas falhadas (colecção fechada às regras: só o servidor lê/escreve). */
async function readAttempts(
  firestoreBase: string,
  accessToken: string,
  key: string
): Promise<{ count: number; lastAttempt: number; lockedUntil: number }> {
  try {
    const doc = await getDocById(firestoreBase, accessToken, 'auth_attempts', key);
    if (!doc) return { count: 0, lastAttempt: 0, lockedUntil: 0 };
    return {
      count: Number(doc.data.count) || 0,
      lastAttempt: Number(doc.data.lastAttempt) || 0,
      lockedUntil: Number(doc.data.lockedUntil) || 0,
    };
  } catch (err) {
    // Disponibilidade primeiro: se o registo de tentativas falhar, o login continua protegido pelo limite por IP.
    console.error('auth_attempts leitura falhou:', err);
    return { count: 0, lastAttempt: 0, lockedUntil: 0 };
  }
}

async function recordFailedAttempt(
  firestoreBase: string,
  accessToken: string,
  key: string,
  previous: { count: number; lastAttempt: number }
): Promise<void> {
  const now = Date.now();
  const baseCount = now - previous.lastAttempt > LOCKOUT_MS ? 0 : previous.count;
  const count = baseCount + 1;
  const lockedUntil = count >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_MS : 0;
  try {
    await fetch(`${firestoreBase}/auth_attempts/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        fields: {
          count: { integerValue: String(count) },
          lastAttempt: { integerValue: String(now) },
          lockedUntil: { integerValue: String(lockedUntil) },
        },
      }),
    });
  } catch (err) {
    console.error('auth_attempts escrita falhou:', err);
  }
}

async function clearAttempts(firestoreBase: string, accessToken: string, key: string): Promise<void> {
  try {
    await fetch(`${firestoreBase}/auth_attempts/${key}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (err) {
    console.error('auth_attempts limpeza falhou:', err);
  }
}

/** Migra credencial legada em texto claro para hash e remove o texto claro (aguarda a gravação). */
async function migrateLegacyCredential(
  firestoreBase: string,
  accessToken: string,
  collectionId: string,
  docId: string,
  cleanPass: string
): Promise<void> {
  try {
    await fetch(
      `${firestoreBase}/${collectionId}/${encodeURIComponent(docId)}?updateMask.fieldPaths=passwordHash&updateMask.fieldPaths=password&updateMask.fieldPaths=tempPassword&updateMask.fieldPaths=updatedAt`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          fields: {
            passwordHash: { stringValue: hashKivoraPassword(cleanPass) },
            updatedAt: { integerValue: String(Date.now()) },
          },
        }),
      }
    );
  } catch (err) {
    console.error('Migração de credencial legada falhou:', err);
  }
}



function parseFirestoreFields(fields: Record<string, any> = {}): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields)) {
    if ('stringValue' in val) result[key] = val.stringValue;
    else if ('integerValue' in val) result[key] = Number(val.integerValue);
    else if ('doubleValue' in val) result[key] = Number(val.doubleValue);
    else if ('booleanValue' in val) result[key] = val.booleanValue;
    else if ('nullValue' in val) result[key] = null;
    else if ('timestampValue' in val) result[key] = val.timestampValue;
    else if ('mapValue' in val) result[key] = parseFirestoreFields(val.mapValue.fields || {});
    else result[key] = val;
  }
  return result;
}

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.setHeader('X-Kivora-Auth-Version', '2.1.0');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').toString().split(',')[0].trim();

  if (isRateLimited(clientIp, 10, 60000)) {
    return res.status(429).json({
      error: 'Demasiadas tentativas de início de sessão. Por favor, aguarde 1 minuto.',
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Payload JSON inválido.' });
    }
  }

  const rawId = body?.identifier || body?.email || body?.username || body?.nif || '';
  const rawPass = body?.password || body?.pass || '';

  if (!rawId || !rawPass) {
    return res.status(400).json({ error: 'Identificador e palavra-passe são obrigatórios.' });
  }

  const cleanId = String(rawId).trim().toLowerCase();
  const cleanPass = String(rawPass).trim();

  try {
    const sa = getServiceAccount();
    if (!sa.privateKey) {
      return res.status(500).json({
        error: 'Chave de serviço do Firebase não configurada no servidor.',
      });
    }

    const accessToken = await getGoogleAdminAccessToken(sa.clientEmail, sa.privateKey);
    const firestoreBase = `https://firestore.googleapis.com/v1/projects/${sa.projectId}/databases/(default)/documents`;

    // Chave do bloqueio persistente por identificador (hash para não guardar e-mails/NIF em claro)
    const attemptKey = crypto.createHash('sha256').update(`attempt:${cleanId}`).digest('hex').slice(0, 40);
    const attempts = await readAttempts(firestoreBase, accessToken, attemptKey);
    if (attempts.lockedUntil > Date.now()) {
      const minutes = Math.max(1, Math.ceil((attempts.lockedUntil - Date.now()) / 60000));
      return res.status(429).json({
        success: false,
        error: `Demasiadas tentativas falhadas. Acesso temporariamente bloqueado. Tente novamente em ${minutes} minuto(s).`,
      });
    }

    const rejectInvalid = async () => {
      await recordFailedAttempt(firestoreBase, accessToken, attemptKey, attempts);
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas. Verifique o identificador e a palavra-passe.',
      });
    };

    // 1. Resolução INEQUÍVOCA de identidade: o identificador pertence a um parceiro?
    //    Se pertencer, a autenticação é feita EXCLUSIVAMENTE como parceiro — nunca há queda
    //    para clientes/licenças (elimina perfis fantasmas e entradas indevidas).
    const upperId = cleanId.toUpperCase();
    const partnerQueryDocs = await queryCollectionOr(firestoreBase, accessToken, 'partners', [
      fsFilter('email', cleanId),
      fsFilter('code', upperId),
      fsFilter('nif', upperId),
      fsFilter('alias_code', upperId),
    ]);
    const partnerByIdDoc = await getDocById(firestoreBase, accessToken, 'partners', upperId);
    const partnerDocs = dedupeDocs([...partnerQueryDocs, ...(partnerByIdDoc ? [partnerByIdDoc] : [])]);

    const userDocs = await queryCollectionOr(firestoreBase, accessToken, 'users', [
      fsFilter('email', cleanId),
      fsFilter('nif', upperId),
    ]);
    const partnerUserDocs = userDocs.filter((d) => d.data.role === 'parceiro');

    let foundUser: { id: string; data: Record<string, any>; isPartner?: boolean } | null = null;

    if (partnerDocs.length > 0 || partnerUserDocs.length > 0) {
      // O documento em /partners é a fonte de verdade; /users só serve se não existir registo em /partners.
      const pool = partnerDocs.length > 0 ? partnerDocs : partnerUserDocs;
      const verified = pool.filter((c) => verifyCredentialStrict(c.data, cleanPass));

      if (verified.length === 0) {
        return await rejectInvalid();
      }

      const chosen = verified.find((c) => (c.data.status || 'pending') === 'active') || verified[0];
      const chosenStatus = chosen.data.status || 'pending';
      const mirrorSuspended = partnerUserDocs.some((d) => d.data.status === 'suspended');

      if (chosenStatus === 'suspended' || mirrorSuspended) {
        return res.status(403).json({
          success: false,
          error: 'O seu acesso de parceiro está suspenso. Contacte o suporte Kivora para regularização.',
        });
      }
      if (chosenStatus !== 'active') {
        return res.status(403).json({
          success: false,
          error: 'A sua conta de parceiro ainda não está ativa. Aguarde a aprovação da equipa Kivora.',
        });
      }

      const partnerCode = String(chosen.data.code || chosen.data.partnerCode || chosen.id).trim();

      // Credencial legada em texto claro: migra para hash e elimina o texto claro
      if (!(chosen.data.passwordHash || chosen.data.password_hash)) {
        await migrateLegacyCredential(
          firestoreBase,
          accessToken,
          partnerDocs.length > 0 ? 'partners' : 'users',
          chosen.id,
          cleanPass
        );
      }

      foundUser = {
        id: partnerCode.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        data: {
          ...chosen.data,
          role: 'parceiro',
          code: partnerCode,
          partnerCode,
          status: 'active',
          // Primeiro acesso: só deixa de ser obrigatório quando o parceiro definiu a sua própria senha
          mustChangePassword: chosen.data.mustChangePassword !== false,
        },
        isPartner: true,
      };
    }

    // 2. Identificador NÃO pertence a nenhum parceiro → utilizadores comuns (clientes) em /users
    if (!foundUser) {
      for (const item of userDocs) {
        if (verifyPasswordMatch(item.data, cleanPass)) {
          foundUser = { id: item.id, data: item.data, isPartner: false };
          break;
        }
      }
    }

    // 3. Portal do Cliente: pesquisa por licença (NIF, e-mail de licença ou chave)
    //    E-mails reservados à administração nunca autenticam por esta via.
    if (!foundUser && !isAdminLikeEmail(cleanId)) {
      const isKeyFormat = cleanId.startsWith('kvra-') || cleanId.includes('-');
      let licItem: any = null;

      if (isKeyFormat) {
        // Busca direta pelo ID da licença (KVRA-XXXX-XXXX-XXXX)
        const licDocUrl = `${firestoreBase}/licenses/${cleanId.toUpperCase()}`;
        const licDocRes = await fetch(licDocUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (licDocRes.ok) {
          const licDoc = await licDocRes.json();
          if (licDoc.fields) {
            licItem = {
              id: cleanId.toUpperCase(),
              fields: parseFirestoreFields(licDoc.fields),
            };
          }
        }
      }

      if (!licItem) {
        // Busca estruturada por nif ou client_email na coleção licenses
        const licQueryBody = {
          structuredQuery: {
            from: [{ collectionId: 'licenses' }],
            where: {
              compositeFilter: {
                op: 'OR',
                filters: [
                  fsFilter('nif', cleanId.toUpperCase()),
                  fsFilter('client_email', cleanId),
                  fsFilter('id', cleanId.toUpperCase()),
                ],
              },
            },
            limit: 1,
          },
        };

        const licRes = await fetch(`${firestoreBase}:runQuery`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(licQueryBody),
        });

        if (licRes.ok) {
          const lData = await licRes.json();
          if (Array.isArray(lData) && lData[0]?.document?.fields) {
            const docId = lData[0].document.name.split('/').pop() || '';
            licItem = {
              id: docId,
              fields: parseFirestoreFields(lData[0].document.fields),
            };
          }
        }
      }

      if (licItem && licItem.fields) {
        const lf = licItem.fields;
        const licStatus = lf.status || 'active';
        if (licStatus === 'revoked' || licStatus === 'suspended') {
          return res.status(403).json({
            success: false,
            error: 'Esta licença foi suspensa ou revogada. Contacte o suporte Kivora.',
          });
        }

        const hasAnyCred = Boolean(lf.passwordHash || lf.password || lf.tempPassword);

        // Se tem credencial gravada, verifica se coincide
        if (hasAnyCred) {
          if (verifyPasswordMatch(lf, cleanPass)) {
            foundUser = {
              id: licItem.id,
              data: {
                ...lf,
                role: 'cliente',
                nome: lf.company_name || 'Empresa Cliente',
                companyName: lf.company_name,
                licenseKey: licItem.id,
                nif: lf.nif,
                email: lf.client_email || cleanId,
              },
              isPartner: false,
            };
          }
        } else if (cleanPass.length >= 4) {
          // PRIMEIRO ACESSO COM A CHAVE DE LICENÇA (fluxo do Portal do Cliente):
          // a licença ainda não tinha senha, o cliente define-a no primeiro login.
          const newHash = hashKivoraPassword(cleanPass);
          foundUser = {
            id: licItem.id,
            data: {
              ...lf,
              role: 'cliente',
              nome: lf.company_name || 'Empresa Cliente',
              companyName: lf.company_name,
              licenseKey: licItem.id,
              nif: lf.nif,
              email: lf.client_email || cleanId,
            },
            isPartner: false,
          };

          // Aguarda a gravação (em serverless um fetch não aguardado pode ser descartado ao terminar a função)
          await fetch(`${firestoreBase}/licenses/${licItem.id}?updateMask.fieldPaths=passwordHash&updateMask.fieldPaths=passwordSetAt`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              fields: {
                passwordHash: { stringValue: newHash },
                passwordSetAt: { integerValue: String(Date.now()) },
              },
            }),
          }).catch(console.warn);
        }
      }
    }

    // 4. Validação de resultado
    if (!foundUser) {
      return await rejectInvalid();
    }

    const u = foundUser.data;
    if (u.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'A sua conta está temporariamente suspensa. Contacte o suporte.',
      });
    }

    // O papel de parceiro é determinado pela resolução de identidade, nunca por campos de documentos de terceiros
    const role = (foundUser.isPartner ? 'parceiro' : (u.role || 'cliente')) as string;
    const uid = foundUser.id;
    const contactEmail = u.email || cleanId;

    // 5. Emitir Firebase Custom Token oficial assinado pelo Google.
    //    NUNCA inclui a claim `email` (as regras do Firestore tratam e-mails @kivora.ao como administradores).
    const customToken = createFirebaseCustomToken(sa.clientEmail, sa.privateKey, uid, {
      role,
      nif: u.nif || '',
      partner_id: u.partner_id || u.code || '',
      companyName: u.companyName || u.name || '',
      contact_email: contactEmail,
    });

    // 6. Montar Sessão Kivora Segura
    const session = {
      id: uid,
      email: contactEmail,
      role,
      nome: u.nome || u.name || (foundUser.isPartner ? 'Parceiro Credenciado' : 'Cliente Kivora'),
      nif: u.nif || undefined,
      partnerCode: u.code || u.partnerCode || undefined,
      companyName: u.companyName || u.empresa || undefined,
      licenseKey: u.licenseKey || undefined,
      status: u.status || 'active',
      mustChangePassword: Boolean(u.mustChangePassword),
    };

    await clearAttempts(firestoreBase, accessToken, attemptKey);

    return res.status(200).json({
      success: true,
      customToken,
      sessionToken: signSessionToken({ uid, role, pc: String(session.partnerCode || '') }),
      session,
    });
  } catch (err: any) {
    console.error('Erro interno no /api/auth/login:', err);
    return res.status(500).json({
      success: false,
      error: 'Serviço de autenticação temporariamente indisponível. Tente novamente dentro de instantes.',
    });
  }
}
