// Vercel Serverless Function: Telegram Notification Handler

// 3 MB raw file → ~4 MB base64, safely under Vercel's 4.5 MB request body limit
const MAX_FILE_BASE64_LENGTH = Math.ceil((3 * 1024 * 1024 * 4) / 3) + 1024;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body || {};
    const {
      name,
      company,
      email,
      phone,
      city,
      medium,
      notes,
      fileAttached,
      fileName,
      fileType,
      fileData,
      timestamp
    } = data;

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

    // Clean phone number for tel: and WhatsApp direct link
    const cleanPhone = (phone || '').replace(/[^\d+]/g, '');

    // Format Structured HTML Message for Telegram
    const formattedMessage = `
⚡ <b>ახალი საინჟინრო შეკვეთა — VECTOR HUB</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>დამკვეთი:</b> ${escapeHtml(name || 'არ არის მითითებული')}
🏢 <b>კომპანია:</b> ${escapeHtml(company || '—')}
📞 <b>ტელეფონი:</b> <code>${escapeHtml(phone || '—')}</code>
✉️ <b>ელ-ფოსტა:</b> ${escapeHtml(email || '—')}
📍 <b>ქალაქი/მისამართი:</b> ${escapeHtml(city || 'თბილისი')}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 <b>პროდუქციის ტიპი:</b> <b>${escapeHtml((medium || '3D ასოები').toUpperCase())}</b>
📝 <b>სპეციფიკაცია & შენიშვნები:</b>
<pre>${escapeHtml(notes || 'დეტალები არ არის მითითებული')}</pre>
${fileAttached || fileName ? `📎 <b>მიმაგრებული ფაილი:</b> <code>${escapeHtml(fileName || fileAttached)}</code>\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ <b>დრო:</b> ${escapeHtml(timestamp || new Date().toISOString())}
`;

    // Inline Keyboard Buttons for One-Click Response (Telegram requires http/https)
    const inlineKeyboard = cleanPhone ? {
      inline_keyboard: [
        [
          {
            text: '💬 WhatsApp-ში მიწერა',
            url: `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent('გამარჯობა ' + (name || '') + ', გიკავშირდებით Vector Hub Georgia-დან თქვენს შეკვეთასთან დაკავშირებით.')}`
          }
        ]
      ]
    } : undefined;

    // Send payload to Telegram Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: inlineKeyboard && inlineKeyboard.inline_keyboard[0].length > 0 ? inlineKeyboard : undefined
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
    let docError = null;
    if (fileData) {
      try {
        const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
        const fileBuffer = Buffer.from(base64Data, 'base64');
        const effectiveFileName = fileName || fileAttached || 'blueprint.pdf';
        const effectiveMimeType = fileType || 'application/octet-stream';
        const blob = new Blob([fileBuffer], { type: effectiveMimeType });

        const docFormData = new FormData();
        docFormData.append('chat_id', chatId);
        docFormData.append('document', blob, effectiveFileName);
        docFormData.append('caption', `📎 <b>${escapeHtml(effectiveFileName)}</b>\n👤 ${escapeHtml(name || 'კლიენტი')}${company ? ` • ${escapeHtml(company)}` : ''}`);
        docFormData.append('parse_mode', 'HTML');

        const docRes = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
          method: 'POST',
          body: docFormData
        });
        const docResult = await docRes.json();
        docSent = docResult.ok;
        if (!docResult.ok) {
          console.warn('Telegram sendDocument warning:', docResult);
          docError = docResult.description;
        }
      } catch (docErr) {
        console.error('Error forwarding document to Telegram:', docErr);
        docError = docErr.message;
      }
    }

    return res.status(200).json({
      success: true,
      messageId: result.result?.message_id,
      docSent,
      docError
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
