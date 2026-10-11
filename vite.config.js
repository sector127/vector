import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Mirrors Vercel's 4.5 MB request body cap so oversized uploads fail the same way locally
const DEV_BODY_LIMIT = 4.5 * 1024 * 1024;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      {
        // Runs the real api/inquiry.js handler behind a tiny Vercel-style req/res shim,
        // so local testing exercises exactly the code that ships.
        name: 'api-inquiry-dev-middleware',
        configureServer(server) {
          server.middlewares.use('/api/inquiry', async (req, res) => {
            const send = (status, body) => {
              res.statusCode = status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(body));
            };

            const chunks = [];
            let size = 0;
            for await (const chunk of req) {
              size += chunk.length;
              if (size > DEV_BODY_LIMIT) {
                res.statusCode = 413;
                res.end('Request Entity Too Large');
                return;
              }
              chunks.push(chunk);
            }

            let body = {};
            try {
              body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
            } catch {
              send(400, { success: false, error: 'invalid' });
              return;
            }

            const env = loadEnv(mode, process.cwd(), '');
            const token = env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
            const chatId = env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

            // Dev convenience only: without credentials, pretend delivery worked
            // (production answers 503 so leads are never silently dropped)
            if (!token || !chatId) {
              send(200, {
                success: true,
                simulated: true,
                description: 'Local simulation — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local for live Telegram alerts.'
              });
              return;
            }
            process.env.TELEGRAM_BOT_TOKEN = token;
            process.env.TELEGRAM_CHAT_ID = chatId;

            const { default: handler } = await server.ssrLoadModule('/api/inquiry.js');
            const vercelRes = {
              status(code) { res.statusCode = code; return vercelRes; },
              json(payload) { send(res.statusCode, payload); return vercelRes; }
            };
            await handler(Object.assign(req, { body }), vercelRes);
          });
        }
      }
    ]
  };
});
