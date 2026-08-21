import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

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
            const { provider, apiKey, from, to, subject, html, text } = body;

            if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 5) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Chave de API não configurada ou inválida.' }));
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

            if (provider === 'sendgrid') {
              const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
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

            // Default: Resend API
            const fromStr = typeof from === 'string'
              ? from
              : `${from?.name || 'KIVORA ERP'} <${from?.email || 'onboarding@resend.dev'}>`;

            const resendRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey.trim()}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: fromStr,
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
                text,
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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    devEmailPlugin(),
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
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'vendor-icons': ['lucide-react'],
          'vendor-charts': ['recharts'],
        }
      }
    }
  }
});



