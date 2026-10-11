/**
 * Telegram Notification Service
 * Dispatches inquiry payloads to Telegram via Serverless API (/api/inquiry)
 * Never exposes Telegram Bot Tokens on the client bundle
 */

export async function sendInquiryNotification(inquiryData) {
  const payload = {
    ...inquiryData,
    timestamp: new Date().toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi' })
  };

  try {
    const response = await fetch('/api/inquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;

    if (data && (data.ok || data.success)) {
      return {
        success: true,
        mode: 'api',
        simulated: Boolean(data.simulated),
        data
      };
    }

    // Vercel answers an oversized body with a plain-text 413 before our handler runs
    const code = data?.error || (response.status === 413 ? 'file_too_large' : 'dispatch_failed');
    console.error('Inquiry dispatch failed:', response.status, data);
    return { success: false, code };
  } catch (err) {
    console.error('Inquiry dispatch error:', err);
    return { success: false, code: 'network_error' };
  }
}

