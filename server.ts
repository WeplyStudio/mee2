import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing middlewares
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

// Trust proxy for accurate client IP resolution behind Cloud Run / Nginx
app.set('trust proxy', true);

// Server-side ONLY secrets (Never exposed to client browser / bundle)
const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || '8459837666:AAHY7tsADTJ9jvpDYfXKQXXvog3Cwo4Mwf0';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '6196850470';

// In-Memory Rate Limiting & Anti-Flood Map (IP -> timestamps array)
interface RateLimitRecord {
  timestamps: number[];
  blockedUntil?: number;
}
const ipRateLimits = new Map<string, RateLimitRecord>();
const globalSubmissions: number[] = [];

// Cleanup stale rate limit records every 10 minutes
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  for (const [ip, record] of ipRateLimits.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0 && (!record.blockedUntil || record.blockedUntil < now)) {
      ipRateLimits.delete(ip);
    }
  }
}, 10 * 60 * 1000);

/**
 * HTML Entity sanitizer to prevent formatting injections in Telegram HTML parse_mode
 */
function sanitizeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Secure Contact Form Submission Endpoint
 * Protects Telegram Bot Token server-side and prevents spamming/tampering
 */
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
    const now = Date.now();

    // 1. Check Global Flood Protection (Max 30 submissions per 5 minutes across all IPs)
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    while (globalSubmissions.length > 0 && globalSubmissions[0] < fiveMinutesAgo) {
      globalSubmissions.shift();
    }
    if (globalSubmissions.length >= 30) {
      return res.json({
        ok: false,
        error: 'Sistem sedang sibuk. Silakan coba kembali dalam beberapa saat.',
      });
    }

    // 2. Check Per-IP Rate Limiting (Max 5 submissions per 10 minutes per IP)
    const tenMinutesAgo = now - 10 * 60 * 1000;
    let ipRecord = ipRateLimits.get(clientIp);
    if (!ipRecord) {
      ipRecord = { timestamps: [] };
      ipRateLimits.set(clientIp, ipRecord);
    }

    // Filter recent timestamps
    ipRecord.timestamps = ipRecord.timestamps.filter((ts) => ts > tenMinutesAgo);

    if (ipRecord.blockedUntil && ipRecord.blockedUntil > now) {
      const waitSeconds = Math.ceil((ipRecord.blockedUntil - now) / 1000);
      return res.json({
        ok: false,
        error: `Terlalu banyak percobaan. Harap tunggu ${waitSeconds} detik lagi.`,
      });
    }

    if (ipRecord.timestamps.length >= 5) {
      ipRecord.blockedUntil = now + 15 * 60 * 1000; // Block for 15 minutes
      return res.json({
        ok: false,
        error: 'Batas pengiriman tercapai. Silakan coba kembali setelah 15 menit.',
      });
    }

    // 3. Honeypot Check (Catches automated spam bots filling hidden fields)
    const honeypot = req.body.honeypot || req.body.website_url_hp || req.body._gotcha || '';
    if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
      // Silently drop bot submissions and return success to avoid tipping off bots
      return res.json({ ok: true, message: 'Message sent successfully.' });
    }

    // 4. Form Timing Check (Rejects submissions submitted faster than humanly possible: < 1.0s)
    const formLoadTime = Number(req.body.formLoadTime);
    if (formLoadTime && now - formLoadTime < 1000) {
      return res.json({ ok: true, message: 'Message received.' });
    }

    // 5. Input Validation & Bounds Check
    const name = String(req.body.name || '').trim().slice(0, 100);
    const email = String(req.body.email || '').trim().slice(0, 120);
    const company = String(req.body.company || '').trim().slice(0, 100);
    const phone = String(req.body.phone || '').trim().slice(0, 50);
    const subject = String(req.body.subject || '').trim().slice(0, 150);
    const message = String(req.body.message || '').trim().slice(0, 3000);
    const source = String(req.body.source || 'Portfolio Form').trim().slice(0, 80);

    if (!name || name.length < 1) {
      return res.json({ ok: false, error: 'Nama wajib diisi.' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({ ok: false, error: 'Format email tidak valid.' });
    }

    if (!message || message.length < 2) {
      return res.json({ ok: false, error: 'Pesan terlalu pendek.' });
    }

    // Record submission for rate limiting
    ipRecord.timestamps.push(now);
    globalSubmissions.push(now);

    // 6. Format Structured Telegram Notification Message
    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const formattedTelegramText = `
✨ <b>PESAN BARU DARI PORTOFOLIO</b>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Nama:</b> ${sanitizeHtml(name)}
📧 <b>Email:</b> ${sanitizeHtml(email)}
🏢 <b>Perusahaan:</b> ${sanitizeHtml(company || '-')}
📱 <b>Telepon:</b> ${sanitizeHtml(phone || '-')}
📌 <b>Subjek:</b> ${sanitizeHtml(subject || 'Diskusi Proyek')}
🌐 <b>Sumber Form:</b> ${sanitizeHtml(source)}
🔒 <b>IP Pengirim:</b> <code>${sanitizeHtml(clientIp)}</code>
⏰ <b>Waktu:</b> <code>${timestamp} WIB</code>
━━━━━━━━━━━━━━━━━━━━━
💬 <b>Pesan:</b>
${sanitizeHtml(message)}
`.trim();

    // 7. Dispatch securely to Telegram Bot API from server-side
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return res.json({ ok: true, message: 'Message logged.' });
    }

    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const tgResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: formattedTelegramText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const tgData = (await tgResponse.json()) as { ok?: boolean; description?: string };

    if (!tgResponse.ok || !tgData.ok) {
      // Do not leak telegram errors to client
      return res.json({
        ok: false,
        error: 'Gagal meneruskan pesan ke server notifikasi. Silakan hubungi langsung via email.',
      });
    }

    return res.json({ ok: true, message: 'Pesan berhasil terkirim.' });
  } catch {
    return res.json({
      ok: false,
      error: 'Terjadi kesalahan pada server saat memproses pesan.',
    });
  }
});

/**
 * Start Express Server with Vite Middleware in Development
 */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
