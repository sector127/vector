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
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (data.ok || data.success) {
        return { 
          success: true, 
          mode: 'api', 
          simulated: Boolean(data.simulated),
          data 
        };
      } else {
        return { 
          success: false, 
          error: data.description || data.error || 'Telegram dispatch failed' 
        };
      }
    } else {
      return {
        success: false,
        error: `Server returned unexpected response (${response.status})`
      };
    }
  } catch (err) {
    console.error('Inquiry dispatch error:', err);
    return { 
      success: false, 
      error: err.message || 'Network error connecting to inquiry service' 
    };
  }
}

