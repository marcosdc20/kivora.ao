import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import nodemailer from 'nodemailer';

let devCachedTransporter: any = null;
let devLastTransporterKey = '';

function devEmailPlugin(): Plugin {
  return {
    name: 'dev-email-server',
    configureServer(server) {
      server.middlewares.use('/api/send-email', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Método não permitido' }));
          return;
        }

        let bodyRaw = '';
        req.on('data', (chunk) => {
          bodyRaw += chunk;
        });

        req.on('end', async () => {
          try {
            const body = JSON.parse(bodyRaw || '{}');
            const { provider, apiKey, from, to, subject, html, text, smtpHost, smtpPort, smtpUser, smtpPass, senderEmail, senderName } = body;

            const loadedEnv = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
            const envPass = (loadedEnv.SMTP_PASS || loadedEnv.VITE_SMTP_PASS || process.env.SMTP_PASS || process.env.VITE_SMTP_PASS || '').trim();
            const envUser = (loadedEnv.SMTP_USER || loadedEnv.VITE_SMTP_USER || process.env.SMTP_USER || 'kivora.angola@gmail.com').trim();

            const effectiveProvider = provider || 'gmail';
            const effectiveKey = (apiKey || smtpPass || envPass).trim();
            const effectiveSenderEmail = (senderEmail || envUser).trim();
            const effectiveSenderName = (senderName || 'KIVORA SOFT').trim();
            const effectiveHost = smtpHost || (effectiveProvider === 'gmail' ? 'smtp.gmail.com' : 'smtp.gmail.com');
            const effectivePort = Number(smtpPort) || 465;
            const effectiveUser = (smtpUser || effectiveSenderEmail || envUser).trim();

            if (!effectiveKey && effectiveProvider !== 'smtp') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Chave de API ou palavra-passe do e-mail não configurada no servidor.' }));
              return;
            }

            const recipients: string[] = Array.isArray(to) ? to : (typeof to === 'string' ? [to] : []);
            if (recipients.length === 0 || recipients.length > 50) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Lista de destinatários inválida (máximo 50 por envio).' }));
              return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            for (const r of recipients) {
              if (typeof r !== 'string' || !emailRegex.test(r.trim()) || r.length > 254) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `Endereço de e-mail inválido: ${String(r).slice(0, 30)}` }));
                return;
              }
            }

            if (!subject || typeof subject !== 'string' || subject.length > 300) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Assunto inválido ou excede 300 caracteres.' }));
              return;
            }

            const plainText = text || (html ? html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '');

            // 1. Google Gmail Oficial ou SMTP com Pooling
            if (effectiveProvider === 'gmail' || effectiveProvider === 'smtp') {
              const isSecure = effectivePort === 465;
              const cleanPass = effectiveKey.replace(/\s+/g, '');
              const transporterKey = `${effectiveHost}:${effectivePort}:${effectiveUser}:${cleanPass}`;

              if (!devCachedTransporter || devLastTransporterKey !== transporterKey) {
                devCachedTransporter = nodemailer.createTransport({
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
                devLastTransporterKey = transporterKey;
              }

              const mailOptions: any = {
                from: typeof from === 'string' && from.includes('@') ? from : `"${effectiveSenderName}" <${effectiveUser}>`,
                subject,
                html,
                text: plainText,
                replyTo: effectiveUser,
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

              const info = await devCachedTransporter.sendMail(mailOptions);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, messageId: info.messageId || `gmail-${Date.now()}` }));
              return;
            }

            // 2. SendGrid
            if (effectiveProvider === 'sendgrid') {
              const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
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

              if (!sgRes.ok) {
                const errData: any = await sgRes.json().catch(() => ({}));
                res.statusCode = sgRes.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: errData?.errors?.[0]?.message || `Erro no SendGrid (HTTP ${sgRes.status})` }));
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, messageId: `sg-${Date.now()}` }));
              return;
            }

            // 3. Resend API
            const fromStr = typeof from === 'string'
              ? from
              : `"${effectiveSenderName}" <${effectiveSenderEmail}>`;

            const resendRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${effectiveKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: fromStr,
                to: recipients,
                reply_to: effectiveUser,
                subject,
                html,
                text: plainText,
              }),
            });

            const data: any = await resendRes.json().catch(() => ({}));
            if (!resendRes.ok) {
              res.statusCode = resendRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: data.message || `Erro no Resend (HTTP ${resendRes.status})` }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, messageId: data.id }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Erro interno no envio de e-mail.' }));
          }
        });
      });
    }
  };
}

function devPartnerApiPlugin(): Plugin {
  return {
    name: 'dev-partner-api-server',
    configureServer(server) {
      server.middlewares.use('/api/partner/issue-credit-license', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Método não permitido' }));
          return;
        }

        let bodyRaw = '';
        req.on('data', (chunk) => {
          bodyRaw += chunk;
        });

        req.on('end', async () => {
          try {
            const body = JSON.parse(bodyRaw || '{}');
            const handlerModule = await import('./api/partner/issue-credit-license');
            const handler = handlerModule.default;

            const resHelper = {
              setHeader: (k: string, v: string) => res.setHeader(k, v),
              status: (code: number) => {
                res.statusCode = code;
                return {
                  json: (data: any) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  },
                  end: () => res.end(),
                };
              },
            };

            await handler({ ...req, body }, resHelper);
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Erro no endpoint de emissão instantânea.' }));
          }
        });
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    devEmailPlugin(),
    devPartnerApiPlugin(),
    ViteImageOptimizer({
      // PNG: reduz para 80% qualidade (de 2MB para ~400KB)
      png: {
        quality: 80,
      },
      // JPG/JPEG: reduz para 85% qualidade mantendo boa resolução
      jpg: {
        quality: 85,
      },
      jpeg: {
        quality: 85,
      },
      // WebP: qualidade alta com compressão superior
      webp: {
        lossless: false,
        quality: 82,
        alphaQuality: 85,
        force: false,
      },
    }),
  ],
  server: {
    port: 3000,
    host: true,
    watch: {
      ignored: ['**/imagens/**', '**/dist/**']
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'vendor-icons';
            }
            if (id.includes('framer-motion') || id.includes('lenis')) {
              return 'vendor-motion';
            }
          }
        }
      }
    }
  }
});



