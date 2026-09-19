import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import compression from 'compression';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable HTTP response compression (gzip / deflate) for faster asset transmission
app.use(
  compression({
    level: 6,
    threshold: 0, // Compress all text responses regardless of size
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// High-efficiency long-term cache headers for all static files (images, scripts, styles, fonts)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.path.match(/\.(js|css|webp|jpeg|jpg|png|svg|woff2?|ttf|eot|ico)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
});

// Body parsing middlewares
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

// CORS & Preflight handler for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Trust proxy for accurate client IP resolution behind Cloud Run / Nginx
app.set('trust proxy', true);

// Server-side ONLY secrets (Never exposed to client browser / bundle)
const ACTIVE_TELEGRAM_BOT_TOKEN = '8459837666:AAHY7tsADTJ9jvpDYfXKQXXvog3Cwo4Mwf0';
const envToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
// Disregard the old revoked token if present in container environment
const TELEGRAM_BOT_TOKEN =
  envToken && !envToken.includes('AAGIgAT71O9EbNaMsQK1n9yNND6AW6-AyoU')
    ? envToken
    : ACTIVE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID?.trim() || '6196850470';

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
 * Dynamic robots.txt
 * Ensures Sitemap always specifies fully qualified absolute URL with protocol (RFC 9309 compliant)
 */
app.get('/robots.txt', (req: Request, res: Response) => {
  const host = req.get('host') || 'itsjason.my.id';
  const proto = req.get('x-forwarded-proto') || (req.protocol === 'https' ? 'https' : 'https');
  const origin = `${proto}://${host}`;
  res.type('text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(`# Robots.txt for Jason Portfolio
User-agent: *
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

# Sitemaps & LLM Context
Sitemap: ${origin}/sitemap.xml
Sitemap: https://itsjason.my.id/sitemap.xml
Sitemap: https://www.itsjason.my.id/sitemap.xml
`);
});

/**
 * Valid XML Sitemap endpoint with proper Content-Type
 */
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const sitemapFile = path.join(process.cwd(), 'public', 'sitemap.xml');
  res.type('application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  if (fs.existsSync(sitemapFile)) {
    return res.sendFile(sitemapFile);
  }
  res.status(404).send('Sitemap not found');
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

    // 4. Input Validation & Bounds Check
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
    const indexPath = path.join(distPath, 'index.html');
    let cachedIndexHtml: string | null = null;
    try {
      if (fs.existsSync(indexPath)) {
        cachedIndexHtml = fs.readFileSync(indexPath, 'utf-8');
      }
    } catch {
      cachedIndexHtml = null;
    }

    // Aggressive caching for hashed build assets (JS, CSS, images, fonts)
    app.use(
      express.static(distPath, {
        maxAge: '1y',
        immutable: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          } else if (filePath.match(/\.(js|css|webp|jpeg|jpg|png|svg|woff2?|ttf|eot)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
    app.get('*', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      if (cachedIndexHtml) {
        res.send(cachedIndexHtml);
      } else {
        res.sendFile(indexPath);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
