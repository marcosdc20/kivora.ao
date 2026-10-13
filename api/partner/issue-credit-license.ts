/**
 * issue-credit-license.ts — Vercel Serverless Function
 * Endpoint seguro para parceiros credenciados com privilégio 'auto_instant'
 * emitirem licenças a crédito sem necessidade de aprovação manual do Admin.
 *
 * Invariantes rigorosos:
 * 1. O parceiro DEVE ter 'credit_issuance_mode == auto_instant' no Firestore.
 * 2. O parceiro DEVE ter quota de slots livres e nenhuma dívida vencida > 15 dias.
 * 3. NUNCA envia e-mails ou WhatsApp aos clientes finais.
 */

import crypto from 'crypto';

// In-memory rate limiting (IP / partnerCode)
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(key: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    return true;
  }

  timestamps.push(now);
  rateLimitMap.set(key, timestamps);

  if (rateLimitMap.size > 1000) {
    for (const [k, list] of rateLimitMap.entries()) {
      const active = list.filter((t) => now - t < windowMs);
      if (active.length === 0) rateLimitMap.delete(k);
      else rateLimitMap.set(k, active);
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

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `KVRA-${seg()}-${seg()}-${seg()}`;
}

function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#!$';
  const all = upper + lower + digits + special;
  const rand = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
  const password = [
    rand(upper), rand(upper),
    rand(lower), rand(lower), rand(lower), rand(lower),
    rand(digits), rand(digits),
    rand(special),
    ...Array.from({ length: 1 }, () => rand(all)),
  ];
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }
  return password.join('');
}

function hashKivoraPassword(cleanPass: string): string {
  const salt = 'KIVORA_SECURE_AUTH_SALT_v2_2026';
  const combined = `${salt}:${cleanPass}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

async function getAdminToken(): Promise<string | null> {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
  if (!clientEmail || !rawKey) return null;

  if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
    rawKey = rawKey.slice(1, -1);
  }
  rawKey = rawKey.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');

  try {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: clientEmail,
      sub: clientEmail,
      aud: 'https://oauth2.googleapis.com/token',
      scope: 'https://www.googleapis.com/auth/datastore',
      iat: now,
      exp: now + 3600,
    };

    const headerB64 = base64url(JSON.stringify(header));
    const payloadB64 = base64url(JSON.stringify(payload));
    const sigInput = `${headerB64}.${payloadB64}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(sigInput);
    signer.end();
    const signature = signer.sign(rawKey);
    const jwt = `${sigInput}.${base64url(signature)}`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });
    const tokenData = await tokenRes.json().catch(() => ({}));
    return tokenData.access_token || null;
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  // CORS headers
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').toString().split(',')[0].trim();

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Payload JSON inválido.' });
    }
  }

  const {
    partnerCode,
    companyName,
    nif,
    clientEmail,
    planType,
    extraSeats,
    priceAoa,
    costAoa,
    isProvisional
  } = body || {};

  if (!partnerCode || !companyName || !nif || !planType) {
    return res.status(400).json({
      error: 'Campos obrigatórios em falta (partnerCode, companyName, nif, planType).'
    });
  }

  const rateKey = `${clientIp}_${partnerCode}`;
  if (isRateLimited(rateKey, 10, 60000)) {
    return res.status(429).json({
      error: 'Demasiadas solicitações de emissão. Por favor, aguarde 1 minuto.'
    });
  }

  try {
    const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'faturasimples';
    const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

    const adminToken = await getAdminToken();
    const authHeaders: Record<string, string> = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

    // 1. Consultar dados do parceiro no Firestore via REST API (usando partnerDocId prioritário)
    const targetPartnerId = (body.partnerDocId || partnerCode).trim();
    let partnerRes = await fetch(`${FIRESTORE_BASE_URL}/partners/${encodeURIComponent(targetPartnerId)}`, {
      headers: { ...authHeaders }
    });
    if (!partnerRes.ok && body.partnerDocId && body.partnerDocId !== partnerCode) {
      partnerRes = await fetch(`${FIRESTORE_BASE_URL}/partners/${encodeURIComponent(partnerCode)}`, {
        headers: { ...authHeaders }
      });
    }

    if (!partnerRes.ok) {
      return res.status(404).json({
        error: `Parceiro com identificador ${targetPartnerId} não encontrado no sistema.`
      });
    }

    const partnerDoc = await partnerRes.json();
    const pFields = partnerDoc.fields || {};

    const pStatus = pFields.status?.stringValue || 'pending';
    if (pStatus !== 'active') {
      return res.status(403).json({
        error: 'Conta de parceiro suspensa ou inativa. Emissão de licenças bloqueada.'
      });
    }

    const paymentMethod = body.paymentMethod || 'credit';
    const isWallet = paymentMethod === 'wallet';

    if (isWallet) {
      const walletBalance = Number(pFields.wallet_balance_aoa?.integerValue || pFields.wallet_balance_aoa?.doubleValue) || 0;
      if (walletBalance < Number(costAoa || 0)) {
        return res.status(400).json({
          error: `Saldo insuficiente na Carteira (${walletBalance} Kz). Custo: ${costAoa} Kz.`
        });
      }
    } else {
      // 2. Verificar Modo de Emissão (Trava de Segurança: auto_instant)
      const issuanceMode = pFields.credit_issuance_mode?.stringValue || 'auto_instant';
      if (issuanceMode === 'manual_approval') {
        return res.status(403).json({
          requiresManualApproval: true,
          error: 'O seu perfil de parceiro requer aprovação manual pelo Administrador para emissão a crédito. Submeta a solicitação pelo portal.'
        });
      }
    }

    // 3. Verificar Quotas de Slots e Débitos Vencidos
    const creditSlotsLimit = Number(pFields.credit_slots_limit?.integerValue || pFields.credit_slots_limit?.doubleValue) || 2;

    // Consultar débitos em aberto deste parceiro
    const debtsQueryUrl = `${FIRESTORE_BASE_URL}:runQuery`;
    const debtsQueryBody = {
      structuredQuery: {
        from: [{ collectionId: 'partner_debts' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: 'partner_id' },
                  op: 'EQUAL',
                  value: { stringValue: targetPartnerId }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: 'paid' },
                  op: 'EQUAL',
                  value: { booleanValue: false }
                }
              }
            ]
          }
        }
      }
    };

    const debtsRes = await fetch(debtsQueryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(debtsQueryBody)
    });

    let unpaidDebts: any[] = [];
    if (debtsRes.ok) {
      const debtsData = await debtsRes.json();
      if (Array.isArray(debtsData)) {
        unpaidDebts = debtsData.filter((item: any) => item.document && item.document.fields);
      }
    }

    if (!isWallet && unpaidDebts.length >= creditSlotsLimit) {
      return res.status(403).json({
        error: `Limite de crédito atingido (${unpaidDebts.length}/${creditSlotsLimit} licenças ativas em débito). Regularize pagamentos pendentes para emitir mais licenças.`
      });
    }

    // Trava de inadimplência: tolerância máxima de 15 dias para faturas a crédito
    const overdueToleranceDays = 15;
    const now = Date.now();
    const overdueThreshold = now - overdueToleranceDays * 86_400_000;

    for (const dItem of unpaidDebts) {
      const dFields = dItem.document.fields || {};
      const createdAt = Number(dFields.created_at?.integerValue || dFields.created_at?.doubleValue) || 0;
      if (createdAt > 0 && createdAt < overdueThreshold) {
        return res.status(403).json({
          error: `Emissão suspensa: possui licenças a crédito pendentes há mais de ${overdueToleranceDays} dias. Regularize o pagamento com a Kivora.`
        });
      }
    }

    // 4. Calcular Validade e Ativação Provisória
    const key = generateLicenseKey();
    const provisionalDays = 30;
    const isProv = isProvisional || planType === 'lifetime' || (extraSeats && extraSeats >= 3);

    let expiresAt: number;
    if (isProv) {
      expiresAt = now + provisionalDays * 86_400_000;
    } else {
      const daysMap: Record<string, number> = {
        daily: 1,
        weekly: 7,
        biweekly: 15,
        monthly: 30,
        quarterly: 90,
        semiannual: 180,
        annual: 365,
        quadrennial: 1460,
        lifetime: 36500,
      };
      const days = daysMap[planType] || 30;
      expiresAt = now + days * 86_400_000;
    }

    const cleanEmail = (clientEmail || '').trim().toLowerCase();
    const cleanNif = nif.trim().toUpperCase();
    const cleanCompany = companyName.trim();
    const tempPassword = generateTempPassword();
    const passwordHash = hashKivoraPassword(tempPassword);

    // 5. Emitir Licença no Firestore via REST API
    const licenseDocUrl = `${FIRESTORE_BASE_URL}/licenses/${key}`;
    const licensePayload = {
      fields: {
        id: { stringValue: key },
        company_name: { stringValue: cleanCompany },
        nif: { stringValue: cleanNif },
        client_email: { stringValue: cleanEmail },
        plan_type: { stringValue: planType },
        status: { stringValue: 'active' },
        created_at: { integerValue: String(now) },
        expires_at: { integerValue: String(expiresAt) },
        price_aoa: { integerValue: String(priceAoa || 0) },
        notes: { stringValue: `Emitida via API Instantânea para Parceiro ${partnerCode}.` },
        partner_id: { stringValue: targetPartnerId },
        partner_code: { stringValue: partnerCode },
        partner_name: { stringValue: pFields.name?.stringValue || partnerCode },
        extra_seats: { integerValue: String(extraSeats || 0) },
        is_provisional: { booleanValue: Boolean(isProv) },
        max_users: { integerValue: String(1 + (extraSeats || 0)) },
        passwordHash: { stringValue: passwordHash },
        tempPassword: { stringValue: tempPassword },
        passwordSetAt: { integerValue: String(now) },
      }
    };

    const licCreateRes = await fetch(licenseDocUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(licensePayload)
    });

    if (!licCreateRes.ok) {
      const errDetail = await licCreateRes.text();
      console.error('Erro ao gravar licença no Firestore REST:', errDetail);
      return res.status(500).json({
        error: 'Erro ao gerar documento de licença no banco de dados central.'
      });
    }

    const backgroundWrites: Promise<any>[] = [];

    // 6. Registar Débito em /partner_debts
    const debtId = `DEBT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const debtDocUrl = `${FIRESTORE_BASE_URL}/partner_debts/${debtId}`;
    const debtPayload = {
      fields: {
        id: { stringValue: debtId },
        partner_id: { stringValue: targetPartnerId },
        partner_code: { stringValue: partnerCode },
        partner_name: { stringValue: pFields.name?.stringValue || partnerCode },
        license_id: { stringValue: key },
        company_name: { stringValue: cleanCompany },
        plan_type: { stringValue: planType },
        cost_aoa: { integerValue: String(costAoa || 0) },
        client_price_aoa: { integerValue: String(priceAoa || 0) },
        created_at: { integerValue: String(now) },
        paid: { booleanValue: isWallet },
        payment_method: { stringValue: paymentMethod },
        is_provisional: { booleanValue: Boolean(isProv) },
      }
    };

    backgroundWrites.push(fetch(debtDocUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(debtPayload)
    }));

    // 7. Registar / Atualizar Empresa Cliente em /companies
    const companyDocUrl = `${FIRESTORE_BASE_URL}/companies/${encodeURIComponent(cleanNif)}`;
    backgroundWrites.push(fetch(companyDocUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        fields: {
          id: { stringValue: cleanNif },
          name: { stringValue: cleanCompany },
          nif: { stringValue: cleanNif },
          email: { stringValue: cleanEmail },
          phone: { stringValue: '' },
          address: { stringValue: `Parceiro: ${targetPartnerId}` },
          partner_id: { stringValue: targetPartnerId },
          partner_code: { stringValue: partnerCode },
          status: { stringValue: 'active' },
          createdAt: { integerValue: String(now) },
          updated_at: { integerValue: String(now) },
        }
      })
    }).catch(console.warn));

    // 8. Provisionar Conta de Acesso do Cliente em /users para o Portal do Cliente
    const userDocId = cleanEmail ? cleanEmail.replace(/[^a-z0-9]/g, '_') : `cli_${cleanNif.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const userDocUrl = `${FIRESTORE_BASE_URL}/users/${encodeURIComponent(userDocId)}`;
    backgroundWrites.push(fetch(userDocUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        fields: {
          email: { stringValue: cleanEmail },
          nome: { stringValue: cleanCompany },
          nif: { stringValue: cleanNif },
          role: { stringValue: 'cliente' },
          status: { stringValue: 'active' },
          licenseKey: { stringValue: key },
          partner_id: { stringValue: targetPartnerId },
          partnerCode: { stringValue: partnerCode },
          passwordHash: { stringValue: passwordHash },
          tempPassword: { stringValue: tempPassword },
          createdAt: { integerValue: String(now) },
          updatedAt: { integerValue: String(now) },
        }
      })
    }).catch(console.warn));

    // 9. Registar Fatura de Subscrição Oficial em /subscription_invoices
    const year = new Date(now).getFullYear();
    const invoiceDocId = `INV-PARTNER-${year}-${key.slice(-6).toUpperCase()}`;
    const invoiceDocUrl = `${FIRESTORE_BASE_URL}/subscription_invoices/${encodeURIComponent(invoiceDocId)}`;
    const invoicePayload = {
      fields: {
        id: { stringValue: invoiceDocId },
        invoice_number: { stringValue: `FT KVRA/${year}/${key.slice(-5).toUpperCase()}` },
        licenseId: { stringValue: key },
        license_id: { stringValue: key },
        company_name: { stringValue: cleanCompany },
        nif: { stringValue: cleanNif },
        plan_label: { stringValue: `KIVORA SOFT - ${planType.toUpperCase()}` },
        amount: { integerValue: String(priceAoa || 0) },
        totalAOA: { integerValue: String(priceAoa || 0) },
        status: { stringValue: 'paid' },
        payment_method: { stringValue: isWallet ? 'Carteira Parceiro Kivora' : (isProv ? 'Crédito Provisório Parceiro' : 'Parceiro Credenciado Kivora') },
        issue_date: { stringValue: new Date(now).toISOString().split('T')[0] },
        due_date: { stringValue: new Date(expiresAt).toISOString().split('T')[0] },
        partner_id: { stringValue: targetPartnerId },
        partner_code: { stringValue: partnerCode },
        partner_name: { stringValue: pFields.name?.stringValue || partnerCode },
        created_at: { integerValue: String(now) },
        updated_at: { integerValue: String(now) },
      }
    };
    backgroundWrites.push(fetch(invoiceDocUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(invoicePayload)
    }).catch(console.warn));

    if (isWallet) {
      const currentBal = Number(pFields.wallet_balance_aoa?.integerValue || pFields.wallet_balance_aoa?.doubleValue) || 0;
      const newBalance = Math.max(0, currentBal - Number(costAoa || 0));
      backgroundWrites.push(fetch(`${FIRESTORE_BASE_URL}/partners/${encodeURIComponent(targetPartnerId)}?updateMask.fieldPaths=wallet_balance_aoa&updateMask.fieldPaths=updatedAt`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          fields: {
            wallet_balance_aoa: { integerValue: String(newBalance) },
            updatedAt: { integerValue: String(now) }
          }
        })
      }).catch(console.warn));
    }

    await Promise.all(backgroundWrites);

    // Retorno de Sucesso com credenciais para o parceiro fornecer ao cliente
    return res.status(200).json({
      success: true,
      licenseId: key,
      expiresAt,
      isProvisional: isProv,
      tempPassword,
      message: 'Licença gerada com sucesso via API Instantânea.'
    });
  } catch (err: any) {
    console.error('Erro no endpoint issue-credit-license:', err);
    return res.status(500).json({
      error: 'Erro interno ao processar emissão de licença: ' + (err.message || 'Erro desconhecido')
    });
  }
}
