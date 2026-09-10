/**
 * issue-credit-license.ts — Vercel Serverless Function
 * Endpoint seguro para parceiros homologados com privilégio 'auto_instant'
 * emitirem licenças a crédito sem necessidade de aprovação manual do Admin.
 *
 * Invariantes rigorosos:
 * 1. O parceiro DEVE ter 'credit_issuance_mode == auto_instant' no Firestore.
 * 2. O parceiro DEVE ter quota de slots livres e nenhuma dívida vencida > 15 dias.
 * 3. NUNCA envia e-mails ou WhatsApp aos clientes finais.
 */

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

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `KVRA-${seg()}-${seg()}-${seg()}`;
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

    // 1. Consultar dados do parceiro no Firestore via REST API
    const partnerRes = await fetch(`${FIRESTORE_BASE_URL}/partners/${encodeURIComponent(partnerCode)}`);
    if (!partnerRes.ok) {
      return res.status(404).json({
        error: `Parceiro com código ${partnerCode} não encontrado no sistema.`
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

    // 2. Verificar Modo de Emissão (Trava de Segurança: auto_instant)
    const issuanceMode = pFields.credit_issuance_mode?.stringValue || 'manual_approval';
    if (issuanceMode !== 'auto_instant') {
      return res.status(403).json({
        requiresManualApproval: true,
        error: 'O seu perfil de parceiro requer aprovação manual pelo Administrador para emissão a crédito. Submeta a solicitação pelo portal.'
      });
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
                  value: { stringValue: partnerCode }
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(debtsQueryBody)
    });

    let unpaidDebts: any[] = [];
    if (debtsRes.ok) {
      const debtsData = await debtsRes.json();
      unpaidDebts = Array.isArray(debtsData)
        ? debtsData.filter((item: any) => item.document && item.document.fields)
        : [];
    }

    const activeSlotsInUse = unpaidDebts.length;
    if (activeSlotsInUse >= creditSlotsLimit) {
      return res.status(403).json({
        error: `A sua quota de ${creditSlotsLimit} slots de crédito está esgotada (${activeSlotsInUse} em uso). Proceda à liquidação de faturas anteriores para libertar slots.`
      });
    }

    // Verificar atrasos (> 15 dias)
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

    // 5. Emitir Licença no Firestore via REST API
    const licenseDocUrl = `${FIRESTORE_BASE_URL}/licenses/${key}`;
    const licensePayload = {
      fields: {
        id: { stringValue: key },
        company_name: { stringValue: companyName.trim() },
        nif: { stringValue: nif.trim() },
        client_email: { stringValue: (clientEmail || '').trim().toLowerCase() },
        plan_type: { stringValue: planType },
        status: { stringValue: 'active' },
        created_at: { integerValue: String(now) },
        expires_at: { integerValue: String(expiresAt) },
        price_aoa: { integerValue: String(priceAoa || 0) },
        notes: { stringValue: `Emitida via API Instantânea para Parceiro ${partnerCode}.` },
        partner_id: { stringValue: partnerCode },
        extra_seats: { integerValue: String(extraSeats || 0) },
        is_provisional: { booleanValue: Boolean(isProv) },
        max_users: { integerValue: String(1 + (extraSeats || 0)) },
      }
    };

    const licCreateRes = await fetch(licenseDocUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(licensePayload)
    });

    if (!licCreateRes.ok) {
      const errDetail = await licCreateRes.text();
      console.error('Erro ao gravar licença no Firestore REST:', errDetail);
      return res.status(500).json({
        error: 'Erro ao gerar documento de licença no banco de dados central.'
      });
    }

    // 6. Registar Débito em /partner_debts
    const debtId = `DEBT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const debtDocUrl = `${FIRESTORE_BASE_URL}/partner_debts/${debtId}`;
    const debtPayload = {
      fields: {
        id: { stringValue: debtId },
        partner_id: { stringValue: partnerCode },
        partner_name: { stringValue: pFields.name?.stringValue || partnerCode },
        license_id: { stringValue: key },
        company_name: { stringValue: companyName.trim() },
        plan_type: { stringValue: planType },
        cost_aoa: { integerValue: String(costAoa || 0) },
        client_price_aoa: { integerValue: String(priceAoa || 0) },
        created_at: { integerValue: String(now) },
        paid: { booleanValue: false },
        payment_method: { stringValue: 'credit' },
        is_provisional: { booleanValue: Boolean(isProv) },
      }
    };

    await fetch(debtDocUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(debtPayload)
    });

    // 7. Retorno de Sucesso (Sem envio de mensagem automática ao cliente)
    return res.status(200).json({
      success: true,
      licenseId: key,
      expiresAt,
      isProvisional: isProv,
      message: 'Licença gerada com sucesso via API Instantânea. Forneça a chave manualmente ao cliente.'
    });
  } catch (err: any) {
    console.error('Erro no endpoint issue-credit-license:', err);
    return res.status(500).json({
      error: 'Erro interno ao processar emissão de licença: ' + (err.message || 'Erro desconhecido')
    });
  }
}
