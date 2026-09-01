import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      {
        name: 'api-inquiry-dev-middleware',
        configureServer(server) {
          server.middlewares.use('/api/inquiry', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }

            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const data = JSON.parse(body || '{}');
                const dynamicEnv = loadEnv(mode, process.cwd(), '');
                const token = dynamicEnv.TELEGRAM_BOT_TOKEN || dynamicEnv.VITE_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
                const chatId = dynamicEnv.TELEGRAM_CHAT_ID || dynamicEnv.VITE_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

                if (!token || !chatId) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    ok: false,
                    description: 'TELEGRAM_BOT_TOKEN ან TELEGRAM_CHAT_ID არ არის შევსებული .env.local ფაილში'
                  }));
                  return;
                }

                const cleanPhone = (data.phone || '').replace(/[^\d+]/g, '');
                const formattedMessage = `
⚡ <b>ახალი საინჟინრო შეკვეთა — VECTOR HUB</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>დამკვეთი:</b> ${escapeHtml(data.name || '—')}
🏢 <b>კომპანია:</b> ${escapeHtml(data.company || '—')}
📞 <b>ტელეფონი:</b> <code>${escapeHtml(data.phone || '—')}</code>
✉️ <b>ელ-ფოსტა:</b> ${escapeHtml(data.email || '—')}
📍 <b>ქალაქი:</b> ${escapeHtml(data.city || 'თბილისი')}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 <b>პროდუქცია:</b> <b>${escapeHtml((data.medium || '3D ასოები').toUpperCase())}</b>
📝 <b>სპეციფიკაცია & შენიშვნები:</b>
<pre>${escapeHtml(data.notes || '—')}</pre>
${data.fileAttached ? `📎 <b>მიმაგრებული ფაილი:</b> <code>${escapeHtml(data.fileAttached)}</code>\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ <b>დრო:</b> ${escapeHtml(data.timestamp || new Date().toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi' }))}
`;

                const inlineKeyboard = cleanPhone ? {
                  inline_keyboard: [
                    [
                      {
                        text: '💬 WhatsApp-ში მიწერა',
                        url: `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent('გამარჯობა ' + (data.name || '') + ', გიკავშირდებით Vector Hub Georgia-დან.')}`
                      }
                    ]
                  ]
                } : undefined;

                const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: formattedMessage,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: inlineKeyboard
                  })
                });

                const tgData = await tgRes.json();
                res.statusCode = tgData.ok ? 200 : 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(tgData));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, description: err.message }));
              }
            });
          });
        }
      }
    ]
  };
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
