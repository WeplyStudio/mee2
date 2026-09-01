/**
 * Secure Telegram Notification Service
 * Sends structured contact form inquiries through the backend server proxy (/api/contact)
 * to prevent token leakage and prevent unauthorized bot hijacking / spam.
 */

export interface ContactMessagePayload {
  name: string;
  email: string;
  message: string;
  company?: string;
  phone?: string;
  subject?: string;
  source?: string;
  honeypot?: string;
  formLoadTime?: number;
}

export interface SendNotificationResult {
  success: boolean;
  error?: string;
}

/**
 * Dispatches contact message to backend server proxy securely
 */
export async function sendTelegramNotification(
  payload: ContactMessagePayload
): Promise<SendNotificationResult> {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        message: payload.message,
        company: payload.company,
        phone: payload.phone,
        subject: payload.subject,
        source: payload.source || 'Portfolio Website',
        honeypot: payload.honeypot || '',
        formLoadTime: payload.formLoadTime || Date.now(),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      return {
        success: false,
        error: data.error || 'Gagal mengirim pesan.',
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: 'Terjadi masalah koneksi ke server.',
    };
  }
}
