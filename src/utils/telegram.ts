/**
 * Telegram Notification Service
 * Sends structured contact form inquiries directly to the configured Telegram bot & chat.
 */

const TELEGRAM_BOT_TOKEN = (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN || '8459837666:AAGIgAT71O9EbNaMsQK1n9yNND6AW6-AyoU';
const TELEGRAM_CHAT_ID = (import.meta as any).env?.VITE_TELEGRAM_CHAT_ID || '6196850470';

export interface ContactMessagePayload {
  name: string;
  email: string;
  message: string;
  company?: string;
  phone?: string;
  subject?: string;
  source?: string;
}

/**
 * Escapes HTML characters for Telegram HTML parse_mode
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sends a notification to Telegram Bot
 */
export async function sendTelegramNotification(payload: ContactMessagePayload): Promise<boolean> {
  const timestamp = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const formattedText = `
✨ <b>PESAN BARU DARI PORTOFOLIO</b>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Nama:</b> ${escapeHtml(payload.name || '-')}
📧 <b>Email:</b> ${escapeHtml(payload.email || '-')}
🏢 <b>Perusahaan:</b> ${escapeHtml(payload.company || '-')}
📱 <b>Telepon:</b> ${escapeHtml(payload.phone || '-')}
📌 <b>Subjek:</b> ${escapeHtml(payload.subject || 'Inquiry / Project Discussion')}
🌐 <b>Sumber Form:</b> ${escapeHtml(payload.source || 'Contact Page')}
⏰ <b>Waktu:</b> <code>${timestamp} WIB</code>
━━━━━━━━━━━━━━━━━━━━━
💬 <b>Pesan:</b>
${escapeHtml(payload.message || '-')}
`.trim();

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: formattedText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    // Return true or false without crashing client UI
    return false;
  }
}
