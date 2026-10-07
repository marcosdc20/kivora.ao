import nodemailer from 'nodemailer';
import crypto from 'crypto';

// In-memory rate limiting map (IP -> timestamps[])
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(clientIp: string, maxRequests = 15, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(clientIp) || []).filter((t) => now - t < windowMs);
  
  if (timestamps.length >= maxRequests) {
    return true;
  }
  
  timestamps.push(now);
  rateLimitMap.set(clientIp, timestamps);

  // Periodic cleanup if map grows
  if (rateLimitMap.size > 1000) {
    for (const [ip, list] of rateLimitMap.entries()) {
      const active = list.filter((t) => now - t < windowMs);
      if (active.length === 0) rateLimitMap.delete(ip);
      else rateLimitMap.set(ip, active);
    }
  }

  return false;
}

interface ServerEmailConfig {
  provider: 'gmail' | 'resend' | 'sendgrid' | 'smtp';
  apiKey: string;
  smtpPass: string;
  senderEmail: string;
  senderName: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
}

let cachedServerConfig: { config: ServerEmailConfig; expiresAt: number } | null = null;
let cachedTransporter: any = null;
let lastTransporterKey = '';

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getFirestoreEmailConfig(): Promise<ServerEmailConfig | null> {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
  if (!clientEmail || !rawKey) return null;

  if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
    rawKey = rawKey.slice(1, -1);
  }
  rawKey = rawKey.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');

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
  if (!tokenRes.ok || !tokenData.access_token) return null;

  const proj = process.env.FIREBASE_PROJECT_ID || 'faturasimples';
  const docUrl = `https://firestore.googleapis.com/v1/projects/${proj}/databases/(default)/documents/settings/email_config`;
  const docResp = await fetch(docUrl, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!docResp.ok) return null;

  const data = await docResp.json().catch(() => ({}));
  const f = data.fields || {};

  return {
    provider: (f.provider?.stringValue || 'gmail') as any,
    apiKey: f.apiKey?.stringValue || '',
    smtpPass: f.smtpPass?.stringValue || f.apiKey?.stringValue || '',
    senderEmail: f.senderEmail?.stringValue || 'kivora.angola@gmail.com',
    senderName: f.senderName?.stringValue || 'KIVORA SOFT',
    smtpHost: f.smtpHost?.stringValue || 'smtp.gmail.com',
    smtpPort: Number(f.smtpPort?.integerValue) || 465,
    smtpUser: f.smtpUser?.stringValue || f.senderEmail?.stringValue || 'kivora.angola@gmail.com',
  };
}

async function resolveServerEmailConfig(): Promise<ServerEmailConfig> {
  const now = Date.now();
  if (cachedServerConfig && cachedServerConfig.expiresAt > now) {
    return cachedServerConfig.config;
  }

  try {
    const fsConfig = await getFirestoreEmailConfig();
    if (fsConfig && (fsConfig.apiKey || fsConfig.smtpPass)) {
      cachedServerConfig = { config: fsConfig, expiresAt: now + 5 * 60 * 1000 };
      return fsConfig;
    }
  } catch (err) {
    console.warn('Falha ao obter email_config do Firestore:', err);
  }

  const envPass = (process.env.SMTP_PASS || process.env.VITE_SMTP_PASS || '').trim();
  const envUser = (process.env.SMTP_USER || process.env.VITE_SMTP_USER || 'kivora.angola@gmail.com').trim();
  const envConfig: ServerEmailConfig = {
    provider: 'gmail',
    apiKey: envPass,
    smtpPass: envPass,
    senderEmail: envUser,
    senderName: 'KIVORA SOFT',
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: Number(process.env.SMTP_PORT) || 465,
    smtpUser: envUser,
  };

  cachedServerConfig = { config: envConfig, expiresAt: now + 60 * 1000 };
  return envConfig;
}

// Vercel Serverless Function: /api/send-email
export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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

  // 1. Rate Limiting Protection (Anti-DDoS / Anti-Brute-Force)
  if (isRateLimited(clientIp, 15, 60000)) {
    return res.status(429).json({ error: 'Demasiadas tentativas de envio. Por favor, aguarde um minuto e tente novamente.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  }

  const { provider, apiKey, from, to, subject, html, text, smtpHost, smtpPort, smtpUser, smtpPass, senderEmail, senderName, hp_field, website_url, _gotcha } = body || {};

  // 2. Honeypot Anti-Bot Filter (Se preenchido por um bot invisível, responder com sucesso simulado sem disparar SMTP)
  if (hp_field || website_url || _gotcha) {
    return res.status(200).json({ success: true, messageId: `filtered-${Date.now()}` });
  }

  // 3. Validação estrita de destinatários (Prevenção de Open-Relay / Spam)
  const recipients: string[] = Array.isArray(to) ? to : (typeof to === 'string' ? [to] : []);
  if (recipients.length === 0 || recipients.length > 50) {
    return res.status(400).json({ error: 'Lista de destinatários inválida (máximo 50 por envio).' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const r of recipients) {
    if (typeof r !== 'string' || !emailRegex.test(r.trim()) || r.length > 254) {
      return res.status(400).json({ error: `Endereço de e-mail inválido: ${String(r).slice(0, 30)}` });
    }
  }

  // 4. Validação de Assunto e Tamanho do Conteúdo
  if (!subject || typeof subject !== 'string' || subject.length > 300) {
    return res.status(400).json({ error: 'Assunto do e-mail inválido ou excede 300 caracteres.' });
  }

  const bodyContent = (html || '') + (text || '');
  if (bodyContent.length > 500000) {
    return res.status(413).json({ error: 'Conteúdo do e-mail excede o limite de segurança de 500KB.' });
  }

  // 5. Resolução Segura de Credenciais (Server-Side com Fallback Firestore / Env)
  const serverConfig = await resolveServerEmailConfig();
  const effectiveProvider = provider || serverConfig.provider || 'gmail';
  const effectiveKey = (apiKey || smtpPass || serverConfig.apiKey || serverConfig.smtpPass || '').trim();
  const effectiveSenderEmail = (senderEmail || serverConfig.senderEmail || 'kivora.angola@gmail.com').trim();
  const effectiveSenderName = (senderName || serverConfig.senderName || 'KIVORA SOFT').trim();
  const effectiveHost = smtpHost || serverConfig.smtpHost || 'smtp.gmail.com';
  const effectivePort = Number(smtpPort || serverConfig.smtpPort || 465);
  const effectiveUser = (smtpUser || serverConfig.smtpUser || effectiveSenderEmail).trim();

  if (!effectiveKey && effectiveProvider !== 'smtp') {
    return res.status(500).json({ error: 'Credenciais de e-mail não configuradas no servidor.' });
  }

  // 6. Geração de Texto Puro para Prevenção de Filtro Anti-Spam (MIME Multipart Completo)
  const plainText = text || (html ? html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '');

  try {
    // ── PROVEDOR 1: GOOGLE GMAIL OFICIAL OU SMTP DIRETO COM POOLING DE CONEXÃO ──
    if (effectiveProvider === 'gmail' || effectiveProvider === 'smtp') {
      const isSecure = effectivePort === 465;
      const cleanPass = effectiveKey.replace(/\s+/g, '');
      const transporterKey = `${effectiveHost}:${effectivePort}:${effectiveUser}:${cleanPass}`;

      if (!cachedTransporter || lastTransporterKey !== transporterKey) {
        cachedTransporter = nodemailer.createTransport({
          pool: true,
          maxConnections: 3,
          maxMessages: 100,
          rateLimit: 5,
          host: effectiveHost,
          port: effectivePort,
          secure: isSecure,
          auth: {
            user: effectiveUser,
            pass: cleanPass,
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        lastTransporterKey = transporterKey;
      }

      const mailOptions: any = {
        from: typeof from === 'string' && from.includes('@') ? from : `"${effectiveSenderName}" <${effectiveUser}>`,
        subject,
        html,
        text: plainText,
        replyTo: (typeof body.replyTo === 'string' && body.replyTo.includes('@')) ? body.replyTo : effectiveUser,
        headers: {
          'X-Mailer': 'KIVORA Soft Mailer v2.1',
          'X-Priority': '1',
          'Importance': 'high',
        }
      };

      if (recipients.length === 1) {
        mailOptions.to = recipients[0];
      } else {
        mailOptions.to = effectiveUser;
        mailOptions.bcc = recipients;
      }

      const info = await cachedTransporter.sendMail(mailOptions);
      return res.status(200).json({ success: true, messageId: info.messageId || `gmail-${Date.now()}` });
    }

    // ── PROVEDOR 2: SENDGRID API ────────────────────────────────────────────────
    if (effectiveProvider === 'sendgrid') {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: recipients.map((e: string) => ({ email: e })) }],
          from: typeof from === 'string' ? { email: from } : { email: effectiveSenderEmail, name: effectiveSenderName },
          reply_to: { email: effectiveUser },
          subject,
          content: [
            { type: 'text/plain', value: plainText },
            { type: 'text/html', value: html }
          ],
        }),
      });

      if (!response.ok) {
        const errData: any = await response.json().catch(() => ({}));
        return res.status(response.status).json({
          error: errData?.errors?.[0]?.message || `Erro no envio via SendGrid (HTTP ${response.status})`
        });
      }

      return res.status(200).json({ success: true, messageId: `sg-${Date.now()}` });
    }

    // ── PROVEDOR 3: RESEND API ──────────────────────────────────────────────────
    const fromResend = typeof from === 'string' ? from : `"${effectiveSenderName}" <${effectiveSenderEmail}>`;
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromResend,
        to: recipients,
        reply_to: effectiveUser,
        subject,
        html,
        text: plainText,
      }),
    });

    const data: any = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || `Erro no envio via Resend (HTTP ${response.status})`
      });
    }

    return res.status(200).json({ success: true, messageId: data.id });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Erro interno no servidor de envio.' });
  }
}
