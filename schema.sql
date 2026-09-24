-- Cloudflare D1 SQL Database Migration Schema
-- Run via Wrangler: npx wrangler d1 execute portfolio-d1 --file=./schema.sql

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

INSERT OR IGNORE INTO analytics_meta (id, archivedVisits, totalLifetimeVisits) VALUES ('lifetime', 0, 0);
INSERT OR IGNORE INTO lifetime_stats (id, archivedVisits, totalLifetimeVisits) VALUES ('lifetime', 0, 0);
