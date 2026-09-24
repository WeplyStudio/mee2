/**
 * Cloudflare Worker Native Backend with D1 Database Integration
 * Bindings: env.DB (Cloudflare D1 SQL Database)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Auto-initialize Cloudflare D1 SQL Schema if needed
    try {
      await env.DB.exec(`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id TEXT PRIMARY KEY,
          visitorId TEXT,
          path TEXT,
          deviceType TEXT,
          browser TEXT,
          referrer TEXT,
          dateStr TEXT,
          timestamp TEXT
        );

        CREATE TABLE IF NOT EXISTS visitor_logs (
          id TEXT PRIMARY KEY,
          visitorId TEXT NOT NULL,
          path TEXT NOT NULL,
          deviceType TEXT DEFAULT 'desktop',
          browser TEXT DEFAULT 'Unknown',
          referrer TEXT DEFAULT 'Direct',
          dateStr TEXT,
          timestamp TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS analytics_meta (
          id TEXT PRIMARY KEY,
          archivedVisits INTEGER DEFAULT 0,
          totalLifetimeVisits INTEGER DEFAULT 0,
          lastPrunedAt TEXT,
          lastPrunedCount INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS lifetime_stats (
          id TEXT PRIMARY KEY,
          archivedVisits INTEGER DEFAULT 0,
          totalLifetimeVisits INTEGER DEFAULT 0,
          lastPrunedAt TEXT,
          lastPrunedCount INTEGER DEFAULT 0,
          updatedAt TEXT
        );

        CREATE TABLE IF NOT EXISTS portfolio_projects (
          id TEXT PRIMARY KEY,
          title TEXT,
          client TEXT,
          company TEXT,
          category TEXT,
          year TEXT,
          description TEXT,
          summary TEXT,
          role TEXT,
          type TEXT,
          tech TEXT,
          deliverables TEXT,
          imageUrl TEXT,
          imageType TEXT,
          liveUrl TEXT,
          accentColor TEXT,
          project_order INTEGER,
          featured INTEGER
        );

        CREATE TABLE IF NOT EXISTS team_members (
          id TEXT PRIMARY KEY,
          name TEXT,
          role TEXT,
          status TEXT,
          avatar TEXT,
          createdAt TEXT
        );

        CREATE TABLE IF NOT EXISTS site_settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );
      `);

      // Ensure lifetime meta row exists
      const meta = await env.DB.prepare("SELECT id FROM analytics_meta WHERE id = 'lifetime'").first();
      if (!meta) {
        await env.DB.prepare("INSERT INTO analytics_meta (id, archivedVisits, totalLifetimeVisits) VALUES ('lifetime', 0, 0)").run();
        await env.DB.prepare("INSERT INTO lifetime_stats (id, archivedVisits, totalLifetimeVisits) VALUES ('lifetime', 0, 0)").run();
      }
    } catch (e) {
      console.error('D1 Schema Auto-Init Error:', e);
    }

    const path = url.pathname;

    // Automatic traffic recording for Cloudflare Worker requests
    const isStaticAsset = path.match(/\.(js|css|webp|jpeg|jpg|png|svg|woff2?|ttf|eot|ico|map|json)$/i);
    const isAnalyticsReadOrExplicitLog =
      path === '/api/analytics/metrics' ||
      path === '/api/analytics/recent' ||
      path === '/api/analytics/log' ||
      path === '/api/track-visit';

    if (!isStaticAsset && !isAnalyticsReadOrExplicitLog) {
      const userAgent = request.headers.get('user-agent') || 'custom-worker-fetch';
      const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
      const referrer = request.headers.get('referer') || 'Direct';
      const lowerUa = userAgent.toLowerCase();

      let browser = 'Other / Web Client';
      if (userAgent.includes('Selenium') || userAgent.includes('WebDriver')) browser = 'Selenium / WebDriver';
      else if (userAgent.includes('HeadlessChrome') || userAgent.includes('Puppeteer') || userAgent.includes('Playwright')) browser = 'Headless / Automation';
      else if (lowerUa.includes('python')) browser = 'Python / Script';
      else if (lowerUa.includes('curl')) browser = 'cURL / Script';
      else if (lowerUa.includes('postman')) browser = 'Postman / Script';
      else if (lowerUa.includes('axios') || lowerUa.includes('node-fetch') || lowerUa.includes('wget') || lowerUa.includes('httpclient') || lowerUa.includes('go-http-client')) browser = 'HTTP Fetch / Script';
      else if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Edge')) browser = 'Edge';
      else if (userAgent) browser = userAgent.slice(0, 30);

      let deviceType = 'desktop';
      if (/tablet|ipad|playbook|silk/i.test(userAgent)) deviceType = 'tablet';
      else if (/mobile|iphone|ipod|android/i.test(userAgent)) deviceType = 'mobile';

      const vidSeed = clientIp + userAgent;
      let hash = 0;
      for (let i = 0; i < vidSeed.length; i++) {
        hash = (hash << 5) - hash + vidSeed.charCodeAt(i);
        hash |= 0;
      }
      const vid = 'req_' + Math.abs(hash).toString(36) + '_' + clientIp.replace(/[^a-zA-Z0-9]/g, '').slice(-6);

      const nowIso = new Date().toISOString();
      const dateStr = nowIso.split('T')[0];
      const evtId = 'evt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);

      ctx.waitUntil(
        env.DB.batch([
          env.DB.prepare(
            'INSERT INTO analytics_events (id, visitorId, path, deviceType, browser, referrer, dateStr, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(evtId, vid, path, deviceType, browser, referrer, dateStr, nowIso),
          env.DB.prepare(
            'INSERT INTO visitor_logs (id, visitorId, path, deviceType, browser, referrer, dateStr, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(evtId, vid, path, deviceType, browser, referrer, dateStr, nowIso),
          env.DB.prepare("UPDATE analytics_meta SET totalLifetimeVisits = totalLifetimeVisits + 1 WHERE id = 'lifetime'"),
          env.DB.prepare(
            "UPDATE lifetime_stats SET archivedVisits = COALESCE((SELECT archivedVisits FROM analytics_meta WHERE id = 'lifetime'), 0), totalLifetimeVisits = COALESCE((SELECT totalLifetimeVisits FROM analytics_meta WHERE id = 'lifetime'), 1), updatedAt = ? WHERE id = 'lifetime'"
          ).bind(nowIso),
        ]).catch((e) => console.error('Worker bg traffic record error:', e))
      );
    }

    // Health check endpoint
    if (path === '/api/health') {
      return jsonResponse(
        { status: 'ok', database: 'Cloudflare Worker Native D1 Database', timestamp: new Date().toISOString() },
        corsHeaders
      );
    }

    // Analytics Log Endpoint
    if (path === '/api/analytics/log' || path === '/api/track-visit') {
      let body = {};
      if (request.method === 'POST') {
        try {
          body = await request.json();
        } catch (e) {}
      }
      const reqPath = body.path || url.searchParams.get('path') || '/';
      const visitorId =
        body.visitorId ||
        url.searchParams.get('visitorId') ||
        'vid_' + Math.random().toString(36).substring(2, 9);
      const deviceType = body.deviceType || url.searchParams.get('deviceType') || 'desktop';
      const browser = body.browser || url.searchParams.get('browser') || 'Web Browser';
      const referrer = body.referrer || url.searchParams.get('referrer') || 'Direct';

      const nowIso = new Date().toISOString();
      const dateStr = nowIso.split('T')[0];
      const evtId = 'evt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);

      await env.DB.batch([
        env.DB.prepare(
          'INSERT INTO analytics_events (id, visitorId, path, deviceType, browser, referrer, dateStr, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(evtId, visitorId, reqPath, deviceType, browser, referrer, dateStr, nowIso),
        env.DB.prepare(
          'INSERT INTO visitor_logs (id, visitorId, path, deviceType, browser, referrer, dateStr, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(evtId, visitorId, reqPath, deviceType, browser, referrer, dateStr, nowIso),
        env.DB.prepare("UPDATE analytics_meta SET totalLifetimeVisits = totalLifetimeVisits + 1 WHERE id = 'lifetime'"),
        env.DB.prepare(
          "UPDATE lifetime_stats SET totalLifetimeVisits = totalLifetimeVisits + 1, updatedAt = ? WHERE id = 'lifetime'"
        ).bind(nowIso),
      ]);

      const metaRow = await env.DB.prepare("SELECT totalLifetimeVisits FROM analytics_meta WHERE id = 'lifetime'").first();
      return jsonResponse(
        { ok: true, message: 'Logged in Cloudflare Worker D1', totalVisits: metaRow?.totalLifetimeVisits || 1 },
        corsHeaders
      );
    }

    // Analytics Metrics Endpoint
    if (path === '/api/analytics/metrics') {
      const nowMs = Date.now();
      const eventsRes = await env.DB.prepare('SELECT * FROM analytics_events ORDER BY timestamp DESC LIMIT 100000').all();
      const metaRow =
        (await env.DB.prepare("SELECT * FROM analytics_meta WHERE id = 'lifetime'").first()) || {
          archivedVisits: 0,
          totalLifetimeVisits: 0,
        };

      const events = eventsRes.results || [];
      let traffic30Min = 0,
        traffic1Day = 0,
        traffic30Days = 0,
        traffic90Days = 0;
      const uniqueVisitors = new Set();
      const pageCounts = {};
      const referrers = {};
      const dailyMap = {};
      let mobileCount = 0,
        desktopCount = 0,
        tabletCount = 0;

      for (let i = 13; i >= 0; i--) {
        const d = new Date(nowMs - i * 24 * 60 * 60 * 1000);
        const ds = d.toISOString().split('T')[0];
        dailyMap[ds] = { visits: 0, uniqueSet: new Set() };
      }

      events.forEach((evt) => {
        const vid = evt.visitorId || 'anon';
        uniqueVisitors.add(vid);
        const eventTime = new Date(evt.timestamp).getTime() || nowMs;
        const ageMs = Math.max(0, nowMs - eventTime);

        if (ageMs <= 30 * 60 * 1000) traffic30Min++;
        if (ageMs <= 24 * 60 * 60 * 1000) traffic1Day++;
        if (ageMs <= 30 * 24 * 60 * 60 * 1000) traffic30Days++;
        if (ageMs <= 90 * 24 * 60 * 60 * 1000) traffic90Days++;

        const p = evt.path || '/';
        pageCounts[p] = (pageCounts[p] || 0) + 1;
        const ref = evt.referrer || 'Direct';
        referrers[ref] = (referrers[ref] || 0) + 1;

        if (evt.deviceType === 'mobile') mobileCount++;
        else if (evt.deviceType === 'tablet') tabletCount++;
        else desktopCount++;

        const itemDate = evt.dateStr || new Date(eventTime).toISOString().split('T')[0];
        if (dailyMap[itemDate]) {
          dailyMap[itemDate].visits++;
          dailyMap[itemDate].uniqueSet.add(vid);
        }
      });

      const totalHits = Math.max(metaRow.totalLifetimeVisits || 0, (metaRow.archivedVisits || 0) + events.length);
      const topPagesArray = Object.entries(pageCounts)
        .map(([p, visits]) => ({
          path: p,
          visits,
          percentage: totalHits > 0 ? Math.round((visits / totalHits) * 100) : 0,
        }))
        .sort((a, b) => b.visits - a.visits);

      const dailyTrend = Object.keys(dailyMap)
        .sort()
        .map((date) => ({
          date: date.slice(5),
          visits: dailyMap[date].visits,
          unique: dailyMap[date].uniqueSet.size,
        }));

      return jsonResponse(
        {
          totalVisits: totalHits,
          totalLifetimeVisits: totalHits,
          archivedVisits: metaRow.archivedVisits || 0,
          totalUniqueVisitors: uniqueVisitors.size,
          uniqueVisitors: uniqueVisitors.size,
          traffic30Min,
          traffic1Day,
          traffic30Days,
          traffic90Days,
          topPages: topPagesArray,
          referrers,
          deviceBreakdown: { mobile: mobileCount, desktop: desktopCount, tablet: tabletCount },
          dailyTrend,
          lastPrunedCount: metaRow.lastPrunedCount || 0,
          lastPrunedAt: metaRow.lastPrunedAt,
          databaseEngine: 'Cloudflare Worker Native D1',
        },
        corsHeaders
      );
    }

    // Recent Logs Endpoint
    if (path === '/api/analytics/recent') {
      const limit = parseInt(url.searchParams.get('limit')) || 25;
      const res = await env.DB.prepare('SELECT * FROM visitor_logs ORDER BY timestamp DESC LIMIT ?').bind(limit).all();
      return jsonResponse({ ok: true, logs: res.results || [] }, corsHeaders);
    }

    // Prune Logs Endpoint
    if (path === '/api/analytics/prune') {
      const countRes = await env.DB.prepare('SELECT COUNT(*) as cnt FROM analytics_events').first();
      const totalLogsCount = countRes?.cnt || 0;
      const ONE_MILLION = 1000000;

      if (totalLogsCount > ONE_MILLION) {
        const excessToPrune = totalLogsCount - ONE_MILLION;
        await env.DB.batch([
          env.DB.prepare('DELETE FROM analytics_events WHERE id IN (SELECT id FROM analytics_events ORDER BY timestamp ASC LIMIT ?)').bind(excessToPrune),
          env.DB.prepare('DELETE FROM visitor_logs WHERE id IN (SELECT id FROM visitor_logs ORDER BY timestamp ASC LIMIT ?)').bind(excessToPrune),
          env.DB.prepare(
            'UPDATE analytics_meta SET archivedVisits = archivedVisits + ?, lastPrunedAt = ?, lastPrunedCount = ? WHERE id = "lifetime"'
          ).bind(excessToPrune, new Date().toISOString(), excessToPrune),
          env.DB.prepare(
            'UPDATE lifetime_stats SET archivedVisits = archivedVisits + ?, lastPrunedAt = ?, lastPrunedCount = ? WHERE id = "lifetime"'
          ).bind(excessToPrune, new Date().toISOString(), excessToPrune),
        ]);

        const metaRow = await env.DB.prepare("SELECT * FROM analytics_meta WHERE id = 'lifetime'").first();
        return jsonResponse(
          {
            ok: true,
            deletedCount: excessToPrune,
            newTotalLifetimeVisits: metaRow?.totalLifetimeVisits || 0,
            message: `Pembersihan Cloudflare Worker D1 sukses! ${excessToPrune} log visitor (>1 Juta) dipindahkan ke lifetime count.`,
          },
          corsHeaders
        );
      }

      const metaRow = await env.DB.prepare("SELECT * FROM analytics_meta WHERE id = 'lifetime'").first();
      return jsonResponse(
        {
          ok: true,
          deletedCount: 0,
          newTotalLifetimeVisits: metaRow?.totalLifetimeVisits || totalLogsCount,
          message: `Log visitor (${totalLogsCount} data) belum mencapai batas 1 Juta. Tidak ada data yang dihapus.`,
        },
        corsHeaders
      );
    }

    // Portfolio Projects API
    if (path === '/api/projects') {
      if (request.method === 'GET') {
        const res = await env.DB.prepare('SELECT * FROM portfolio_projects ORDER BY project_order ASC').all();
        const projects = (res.results || []).map((p) => ({
          ...p,
          deliverables: typeof p.deliverables === 'string' ? JSON.parse(p.deliverables || '[]') : p.deliverables,
          featured: Boolean(p.featured),
          order: p.project_order,
        }));
        return jsonResponse({ ok: true, projects }, corsHeaders);
      }
      if (request.method === 'POST') {
        const p = await request.json();
        await env.DB.prepare(`
          INSERT OR REPLACE INTO portfolio_projects (id, title, client, company, category, year, description, summary, role, type, tech, deliverables, imageUrl, imageType, liveUrl, accentColor, project_order, featured)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
          .bind(
            p.id,
            p.title || '',
            p.client || '',
            p.company || '',
            p.category || '',
            p.year || '2025',
            p.description || '',
            p.summary || '',
            p.role || '',
            p.type || '',
            p.tech || '',
            Array.isArray(p.deliverables) ? JSON.stringify(p.deliverables) : p.deliverables || '[]',
            p.imageUrl || '',
            p.imageType || 'zylo',
            p.liveUrl || '',
            p.accentColor || '#0f5132',
            p.order || 1,
            p.featured ? 1 : 0
          )
          .run();
        return jsonResponse({ ok: true, message: 'Project saved in Cloudflare Worker D1' }, corsHeaders);
      }
    }

    if (path.startsWith('/api/projects/') && request.method === 'DELETE') {
      const id = path.replace('/api/projects/', '');
      await env.DB.prepare('DELETE FROM portfolio_projects WHERE id = ?').bind(id).run();
      return jsonResponse({ ok: true, message: 'Project deleted from Cloudflare Worker D1' }, corsHeaders);
    }

    // Team API
    if (path === '/api/team') {
      if (request.method === 'GET') {
        const res = await env.DB.prepare('SELECT * FROM team_members ORDER BY createdAt DESC').all();
        return jsonResponse({ ok: true, members: res.results || [] }, corsHeaders);
      }
      if (request.method === 'POST') {
        const m = await request.json();
        const id = m.id || 'mem_' + Date.now().toString(36);
        await env.DB.prepare('INSERT OR REPLACE INTO team_members (id, name, role, status, avatar, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(id, m.name || '', m.role || '', m.status || 'In Progress', m.avatar || '', m.createdAt || new Date().toISOString())
          .run();
        return jsonResponse({ ok: true, id, message: 'Team member saved in Cloudflare Worker D1' }, corsHeaders);
      }
    }

    if (path.startsWith('/api/team/') && request.method === 'DELETE') {
      const id = path.replace('/api/team/', '');
      await env.DB.prepare('DELETE FROM team_members WHERE id = ?').bind(id).run();
      return jsonResponse({ ok: true, message: 'Member deleted from Cloudflare Worker D1' }, corsHeaders);
    }

    // Settings API
    if (path === '/api/settings') {
      if (request.method === 'GET') {
        const row = await env.DB.prepare("SELECT value FROM site_settings WHERE key = 'images'").first();
        const settings = row ? JSON.parse(row.value) : {};
        return jsonResponse({ ok: true, settings }, corsHeaders);
      }
      if (request.method === 'POST') {
        const body = await request.json();
        await env.DB.prepare("INSERT OR REPLACE INTO site_settings (key, value) VALUES ('images', ?)").bind(JSON.stringify(body || {})).run();
        return jsonResponse({ ok: true, message: 'Settings saved in Cloudflare Worker D1' }, corsHeaders);
      }
    }

    return jsonResponse({ error: 'Endpoint Not Found' }, corsHeaders, 404);
  },
};

function jsonResponse(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}
