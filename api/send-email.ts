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

  const { provider, apiKey, from, to, subject, html, text } = body || {};

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 5) {
    return res.status(400).json({ error: 'Chave de API inválida ou não informada.' });
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
    if (provider === 'sendgrid') {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: (Array.isArray(to) ? to : [to]).map((e: string) => ({ email: e })) }],
          from: typeof from === 'string' ? { email: from } : from,
          subject,
          content: [{ type: 'text/html', value: html }],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return res.status(response.status).json({
          error: errData?.errors?.[0]?.message || `Erro no envio via SendGrid (HTTP ${response.status})`
        });
      }

      return res.status(200).json({ success: true, messageId: `sg-${Date.now()}` });
    }

    // Default: Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: typeof from === 'string' ? from : `${from?.name || 'KIVORA ERP'} <${from?.email || 'onboarding@resend.dev'}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      }),
    });

    const data = await response.json().catch(() => ({}));
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
