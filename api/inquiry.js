// Vercel Serverless Function: Telegram Notification Handler
// Also mounted by the Vite dev server (vite.config.js), so dev and prod run the same code.

// 3 MB raw file → ~4 MB base64, safely under Vercel's 4.5 MB request body limit
const MAX_FILE_BASE64_LENGTH = Math.ceil((3 * 1024 * 1024 * 4) / 3) + 1024;

const FIELD_LIMITS = { name: 120, company: 160, email: 160, phone: 40, city: 160, medium: 40, notes: 5000, fileName: 200 };

// Best-effort flood guard. Serverless instances are short-lived and not shared,
// so this only stops bursts hitting one warm instance — not a substitute for a real limiter.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const recentByIp = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (recentByIp.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  hits.push(now);
  recentByIp.set(ip, hits);
  if (recentByIp.size > 1000) recentByIp.clear();
  return hits.length > RATE_MAX;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body || {};

    // Honeypot: the "website" field is hidden from people, so only bots fill it.
    // Answer as if delivered so they don't retry with a different strategy.
    if (data.website) {
      return res.status(200).json({ success: true });
    }

    const field = (key) => (typeof data[key] === 'string' ? data[key].trim().slice(0, FIELD_LIMITS[key] || 200) : '');
    const name = field('name');
    const company = field('company');
    const email = field('email');
    const phone = field('phone');
    const city = field('city');
    const medium = field('medium');
    const notes = field('notes');
    const fileName = field('fileName');
    const fileType = typeof data.fileType === 'string' ? data.fileType.slice(0, 100) : '';
    const fileData = typeof data.fileData === 'string' ? data.fileData : null;

    if (!name || (!phone && !email)) {
      return res.status(400).json({ success: false, error: 'invalid' });
    }

    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    if (isRateLimited(ip)) {
      return res.status(429).json({ success: false, error: 'rate_limited' });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Never report success when the inquiry can't actually be delivered —
    // the client falls back to WhatsApp / phone instead of losing the lead.
    if (!token || !chatId) {
      console.error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured — inquiry not delivered.');
      return res.status(503).json({
        success: false,
        error: 'not_configured'
      });
    }

    // Base64 inflates files by ~33%; reject before Vercel's 4.5 MB body cap truncates the request
    if (fileData && fileData.length > MAX_FILE_BASE64_LENGTH) {
      return res.status(413).json({
        success: false,
        error: 'file_too_large'
      });
    }

    // Clean phone number for the WhatsApp direct link
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const receivedAt = new Date().toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi' });

    // Format Structured HTML Message for Telegram
    const formattedMessage = `
⚡ <b>ახალი საინჟინრო შეკვეთა — VECTOR HUB</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>დამკვეთი:</b> ${escapeHtml(name)}
🏢 <b>კომპანია:</b> ${escapeHtml(company || '—')}
📞 <b>ტელეფონი:</b> <code>${escapeHtml(phone || '—')}</code>
✉️ <b>ელ-ფოსტა:</b> ${escapeHtml(email || '—')}
📍 <b>ქალაქი/მისამართი:</b> ${escapeHtml(city || 'თბილისი')}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 <b>პროდუქციის ტიპი:</b> <b>${escapeHtml((medium || '3D ასოები').toUpperCase())}</b>
📝 <b>სპეციფიკაცია & შენიშვნები:</b>
<pre>${escapeHtml(notes || 'დეტალები არ არის მითითებული')}</pre>
${fileName ? `📎 <b>მიმაგრებული ფაილი:</b> <code>${escapeHtml(fileName)}</code>\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ <b>დრო:</b> ${escapeHtml(receivedAt)}
`;

    // Inline Keyboard Buttons for One-Click Response (Telegram requires http/https)
    const inlineKeyboard = cleanPhone ? {
      inline_keyboard: [
        [
          {
            text: '💬 WhatsApp-ში მიწერა',
            url: `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent('გამარჯობა ' + name + ', გიკავშირდებით Vector Hub Georgia-დან თქვენს შეკვეთასთან დაკავშირებით.')}`
          }
        ]
      ]
    } : undefined;

    // Send payload to Telegram Bot API
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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

    const result = await response.json();

    if (!result.ok) {
      console.error('Telegram API Error:', result);
      return res.status(502).json({
        success: false,
        error: 'dispatch_failed'
      });
    }

    // If a physical blueprint file was attached, dispatch it via sendDocument
    let docSent = false;
    if (fileData) {
      try {
        const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
        const fileBuffer = Buffer.from(base64Data, 'base64');
        const effectiveFileName = fileName || 'blueprint.pdf';
        const blob = new Blob([fileBuffer], { type: fileType || 'application/octet-stream' });

        const docFormData = new FormData();
        docFormData.append('chat_id', chatId);
        docFormData.append('document', blob, effectiveFileName);
        docFormData.append('caption', `📎 <b>${escapeHtml(effectiveFileName)}</b>\n👤 ${escapeHtml(name)}${company ? ` • ${escapeHtml(company)}` : ''}`);
        docFormData.append('parse_mode', 'HTML');

        const docRes = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
          method: 'POST',
          body: docFormData
        });
        const docResult = await docRes.json();
        docSent = docResult.ok;
        if (!docResult.ok) {
          console.warn('Telegram sendDocument warning:', docResult);
        }
      } catch (docErr) {
        console.error('Error forwarding document to Telegram:', docErr);
      }
    }

    return res.status(200).json({
      success: true,
      messageId: result.result?.message_id,
      docSent
    });
  } catch (error) {
    console.error('Server error processing inquiry:', error);
    return res.status(500).json({
      success: false,
      error: 'server_error'
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
