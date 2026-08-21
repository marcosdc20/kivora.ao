import nodemailer from 'nodemailer';

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

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  }

  const { provider, apiKey, from, to, subject, html, text, smtpHost, smtpPort, smtpUser, smtpPass, senderEmail } = body || {};

  const effectiveKey = (apiKey || smtpPass || '').trim();
  if (!effectiveKey && provider !== 'smtp') {
    return res.status(400).json({ error: 'Chave de API ou palavra-passe do e-mail não informada.' });
  }

  // 1. Validação estrita de destinatários (Prevenção de Open-Relay / Spam)
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

  // 2. Validação de Assunto e Tamanho do Conteúdo
  if (!subject || typeof subject !== 'string' || subject.length > 300) {
    return res.status(400).json({ error: 'Assunto do e-mail inválido ou excede 300 caracteres.' });
  }

  const bodyContent = (html || '') + (text || '');
  if (bodyContent.length > 500000) {
    return res.status(413).json({ error: 'Conteúdo do e-mail excede o limite de segurança de 500KB.' });
  }

  try {
    // ── PROVEDOR 1: GOOGLE GMAIL OFICIAL OU SMTP DIRETO ─────────────────────────
    if (provider === 'gmail' || provider === 'smtp') {
      const host = smtpHost || (provider === 'gmail' ? 'smtp.gmail.com' : 'smtp.gmail.com');
      const port = Number(smtpPort) || 465;
      const isSecure = port === 465;
      const user = (smtpUser || senderEmail || 'kivora.angola@gmail.com').trim();
      const pass = (smtpPass || apiKey || '').replace(/\s+/g, '');

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const mailOptions: any = {
        from: typeof from === 'string' && from.includes('@') ? from : `"KIVORA ERP" <${user}>`,
        subject,
        html,
        text,
        replyTo: user,
      };

      if (recipients.length === 1) {
        mailOptions.to = recipients[0];
      } else {
        mailOptions.to = user;
        mailOptions.bcc = recipients;
      }

      const info = await transporter.sendMail(mailOptions);
      return res.status(200).json({ success: true, messageId: info.messageId || `gmail-${Date.now()}` });
    }

    // ── PROVEDOR 2: SENDGRID API ────────────────────────────────────────────────
    if (provider === 'sendgrid') {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: recipients.map((e: string) => ({ email: e })) }],
          from: typeof from === 'string' ? { email: from } : from,
          reply_to: { email: senderEmail || 'kivora.angola@gmail.com' },
          subject,
          content: [{ type: 'text/html', value: html }],
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
    const fromResend = typeof from === 'string' ? from : `${from?.name || 'KIVORA ERP'} <${from?.email || 'kivora.angola@gmail.com'}>`;
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromResend,
        to: recipients,
        reply_to: senderEmail || 'kivora.angola@gmail.com',
        subject,
        html,
        text,
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
