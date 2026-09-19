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

  // 1. Remove aspas envolventes se foram coladas na Vercel
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }

  // 2. Normaliza quebras escapadas e quebras Windows
  str = str.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r\n/g, '\n');

  // 3. Se contém os delimitadores mas quebras foram transformadas em espaços pela interface web
  const beginMarker = '-----BEGIN PRIVATE KEY-----';
  const endMarker = '-----END PRIVATE KEY-----';
  if (str.includes(beginMarker) && str.includes(endMarker)) {
    const startIdx = str.indexOf(beginMarker) + beginMarker.length;
    const endIdx = str.indexOf(endMarker);
    const base64Body = str.slice(startIdx, endIdx).replace(/\s+/g, '');
    const chunked = base64Body.match(/.{1,64}/g)?.join('\n') || base64Body;
    const formattedPem = `${beginMarker}\n${chunked}\n${endMarker}\n`;
    try {
      return crypto.createPrivateKey({ key: formattedPem, format: 'pem' });
    } catch {}
  }

  // 4. Se já for PEM válido com quebras
  if (str.includes('-----BEGIN')) {
    try {
      return crypto.createPrivateKey({ key: str, format: 'pem' });
    } catch {}
  }

  // 5. Se for string Base64 do PEM
  try {
    const decoded = Buffer.from(str.replace(/\s+/g, ''), 'base64').toString('utf8');
    if (decoded.includes(beginMarker)) {
      return cleanPrivateKey(decoded);
    }
  } catch {}

  // 6. Tenta carregar diretamente como DER PKCS#8 se for Base64 puro
  try {
    const derBuf = Buffer.from(str.replace(/\s+/g, ''), 'base64');
    return crypto.createPrivateKey({ key: derBuf, format: 'der', type: 'pkcs8' });
  } catch {}

  // 7. Tentativa final como PEM
  try {
    return crypto.createPrivateKey({ key: str, format: 'pem' });
  } catch (err: any) {
    const preview = str.length > 20 ? `${str.slice(0, 15)}...${str.slice(-10)} (len: ${str.length})` : str;
    throw new Error(`Chave privada inválida ou corrompida: ${err.message}. Amostra: [${preview}]`);
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

  res.setHeader('X-Kivora-Auth-Version', '2.0.1');

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

    // 1. Pesquisa na coleção /users
    const userQueryBody = {
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: {
          compositeFilter: {
            op: 'OR',
            filters: [
              { fieldFilter: { field: { fieldPath: 'email' }, op: 'EQUAL', value: { stringValue: cleanId } } },
              { fieldFilter: { field: { fieldPath: 'nif' }, op: 'EQUAL', value: { stringValue: cleanId.toUpperCase() } } },
            ],
          },
        },
      },
    };

    const userRes = await fetch(`${firestoreBase}:runQuery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userQueryBody),
    });

    let foundUser: { id: string; data: Record<string, any>; isPartner?: boolean } | null = null;

    if (userRes.ok) {
      const uData = await userRes.json();
      if (Array.isArray(uData)) {
        for (const item of uData) {
          if (item.document && item.document.fields) {
            const fields = parseFirestoreFields(item.document.fields);
            if (verifyPasswordMatch(fields, cleanPass)) {
              const docId = item.document.name.split('/').pop() || '';
              foundUser = { id: docId, data: fields, isPartner: fields.role === 'parceiro' };
              break;
            }
          }
        }
      }
    }

    // 2. Se não encontrou em /users, pesquisa na coleção /partners
    if (!foundUser) {
      const partnerQueryBody = {
        structuredQuery: {
          from: [{ collectionId: 'partners' }],
          where: {
            compositeFilter: {
              op: 'OR',
              filters: [
                { fieldFilter: { field: { fieldPath: 'email' }, op: 'EQUAL', value: { stringValue: cleanId } } },
                { fieldFilter: { field: { fieldPath: 'code' }, op: 'EQUAL', value: { stringValue: cleanId.toUpperCase() } } },
                { fieldFilter: { field: { fieldPath: 'nif' }, op: 'EQUAL', value: { stringValue: cleanId.toUpperCase() } } },
              ],
            },
          },
        },
      };

      const partRes = await fetch(`${firestoreBase}:runQuery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(partnerQueryBody),
      });

      if (partRes.ok) {
        const pData = await partRes.json();
        if (Array.isArray(pData)) {
          for (const item of pData) {
            if (item.document && item.document.fields) {
              const fields = parseFirestoreFields(item.document.fields);
              if (verifyPasswordMatch(fields, cleanPass)) {
                const docId = item.document.name.split('/').pop() || '';
                foundUser = { id: docId, data: fields, isPartner: true };
                break;
              }
            }
          }
        }
      }
    }

    // 3. Validação de resultado
    if (!foundUser) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas. Verifique o identificador e a palavra-passe.',
      });
    }

    const u = foundUser.data;
    if (u.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'A sua conta está temporariamente suspensa. Contacte o suporte.',
      });
    }

    const role = (u.role || (foundUser.isPartner ? 'parceiro' : 'cliente')) as string;
    const uid = foundUser.id;

    // 4. Emitir Firebase Custom Token oficial assinado pelo Google
    const customToken = createFirebaseCustomToken(sa.clientEmail, sa.privateKey, uid, {
      role,
      nif: u.nif || '',
      partner_id: u.partner_id || u.code || '',
      companyName: u.companyName || u.name || '',
      email: u.email || cleanId,
    });

    // 5. Montar Sessão Kivora Segura
    const session = {
      id: uid,
      email: u.email || cleanId,
      role,
      nome: u.nome || u.name || (foundUser.isPartner ? 'Parceiro Homologado' : 'Cliente Kivora'),
      nif: u.nif || undefined,
      partnerCode: u.code || u.partnerCode || undefined,
      companyName: u.companyName || u.empresa || undefined,
      licenseKey: u.licenseKey || undefined,
      status: u.status || 'active',
      mustChangePassword: Boolean(u.mustChangePassword),
    };

    return res.status(200).json({
      success: true,
      customToken,
      session,
    });
  } catch (err: any) {
    console.error('Erro interno no /api/auth/login:', err);
    return res.status(500).json({
      success: false,
      error: 'Erro no servidor de autenticação segura: ' + (err.message || 'Erro desconhecido'),
    });
  }
}
