// Vercel Serverless Function: Telegram Notification Handler
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

    // If environment variables are not configured yet, return a graceful simulated response
    if (!token || !chatId) {
      console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured in environment variables.');
      return res.status(200).json({
        success: true,
        simulated: true,
        message: 'Inquiry received in local simulation mode. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to enable live Telegram alerts.'
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
        error: result.description || 'Telegram API dispatch failed'
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
      error: error.message || 'Internal Server Error'
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
