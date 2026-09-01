/**
 * Telegram Notification Service
 * Dispatches inquiry payloads to Telegram via Serverless API or direct fallback
 */

export async function sendInquiryNotification(inquiryData) {
  const payload = {
    ...inquiryData,
    timestamp: new Date().toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi' })
  };

  // 1. Try API Endpoint (/api/inquiry)
  try {
    const response = await fetch('/api/inquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (data.ok || data.success) {
        return { success: true, mode: 'api', data };
      } else {
        console.error('Telegram dispatch error from API:', data);
        return { success: false, error: data.description || data.error || 'Telegram dispatch failed' };
      }
    }
  } catch (err) {
    console.warn('API /api/inquiry request failed, attempting direct fallback:', err);
  }

  // 2. Client-side fallback if VITE_TELEGRAM_BOT_TOKEN & VITE_TELEGRAM_CHAT_ID are set
  const clientToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const clientChatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (clientToken && clientChatId) {
    try {
      const text = `
⚡ <b>ახალი შეკვეთა — VECTOR HUB</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>დამკვეთი:</b> ${escapeHtml(payload.name || '—')}
🏢 <b>კომპანია:</b> ${escapeHtml(payload.company || '—')}
📞 <b>ტელეფონი:</b> <code>${escapeHtml(payload.phone || '—')}</code>
✉️ <b>ელ-ფოსტა:</b> ${escapeHtml(payload.email || '—')}
📍 <b>ქალაქი:</b> ${escapeHtml(payload.city || 'თბილისი')}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 <b>პროდუქტი:</b> <b>${escapeHtml((payload.medium || '3D ასოები').toUpperCase())}</b>
📝 <b>შენიშვნები & CAD მონაცემები:</b>
<pre>${escapeHtml(payload.notes || '—')}</pre>
${payload.fileAttached ? `📎 <b>ფაილი:</b> <code>${escapeHtml(payload.fileAttached)}</code>\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ <b>დრო:</b> ${payload.timestamp}
`;

      const cleanPhone = (payload.phone || '').replace(/[^\d+]/g, '');
      const inlineKeyboard = cleanPhone ? {
        inline_keyboard: [
          [
            {
              text: '💬 WhatsApp-ში მიწერა',
              url: `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent('გამარჯობა ' + (payload.name || '') + ', გიკავშირდებით Vector Hub-დან.')}`
            }
          ]
        ]
      } : undefined;

      const directRes = await fetch(`https://api.telegram.org/bot${clientToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: clientChatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: inlineKeyboard
        })
      });

      const resData = await directRes.json();
      if (resData.ok) {
        return { success: true, mode: 'direct-telegram' };
      } else {
        console.error('Direct Telegram API Error:', resData);
        return { success: false, error: resData.description || 'Telegram API Error' };
      }
    } catch (err) {
      console.error('Client Telegram dispatch exception:', err);
      return { success: false, error: err.message };
    }
  }

  // 3. If no tokens are set, return descriptive error
  console.warn('[Vector Hub] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in .env.local');
  return {
    success: false,
    error: 'TELEGRAM_BOT_TOKEN ან TELEGRAM_CHAT_ID არ არის მითითებული .env.local ფაილში'
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
