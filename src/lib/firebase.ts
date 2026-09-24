/**
 * Cloudflare D1 SQL Client Module (Pure D1 Database Operations)
 * Replaces legacy Firestore with high-performance Cloudflare D1 SQL engine.
 */

import { Project } from '../types';

export interface SiteImageSettings {
  heroImage?: string;
  aboutImage?: string;
  zyloImage?: string;
  trufinImage?: string;
  krigstudioImage?: string;
  marqueeImages?: Array<{ src: string; title: string; link?: string }>;
  updatedAt?: string;
}

export interface TopPageEntry {
  path: string;
  visits: number;
  percentage: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  avatar: string;
  createdAt?: string;
}

export interface DashboardReminder {
  id: string;
  title: string;
  time: string;
  actionUrl?: string;
  updatedAt?: string;
}

export interface VisitorAnalyticsSummary {
  totalVisits: number;
  totalLifetimeVisits: number;
  archivedVisits: number;
  totalUniqueVisitors: number;
  uniqueVisitors: number;
  traffic30Min: number;
  traffic1Day: number;
  traffic30Days: number;
  traffic90Days: number;
  topPages: TopPageEntry[];
  referrers: Record<string, number>;
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
  dailyTrend: Array<{ date: string; visits: number; unique: number }>;
  lastPrunedCount?: number;
  lastPrunedAt?: string;
  databaseEngine?: string;
}

export interface VisitorLogEntry {
  id: string;
  visitorId: string;
  path: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  referrer: string;
  timestamp: string;
}

/**
 * Test D1 Connection on Boot
 */
export async function testConnection(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    return res.ok;
  } catch {
    return true;
  }
}

if (typeof window !== 'undefined') {
  testConnection().catch(() => {});
}

/**
 * Anonymous Visitor Identifier
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'server_' + Math.random().toString(36).substring(2, 9);
  try {
    const key = 'jason_portfolio_vid';
    let vid = localStorage.getItem(key);
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem(key, vid);
    }
    return vid;
  } catch {
    return 'v_anon_' + Math.random().toString(36).substring(2, 11);
  }
}

function detectDevice(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = (navigator.userAgent || '').toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function detectBrowser(): string {
  if (typeof window === 'undefined') return 'Server/Request';
  const ua = navigator.userAgent || '';
  if (navigator.webdriver || ua.includes('Selenium') || ua.includes('WebDriver')) return 'Selenium/WebDriver';
  if (ua.includes('HeadlessChrome') || ua.includes('Puppeteer') || ua.includes('Playwright')) return 'Headless/Automation';
  if (ua.includes('python') || ua.includes('curl') || ua.includes('Postman') || ua.includes('axios')) return 'Script/HTTP Client';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  return 'Other / Web Client';
}

/**
 * Log page view event to Cloudflare D1 SQL database
 */
export async function logVisitorPageView(path: string): Promise<void> {
  if (typeof window === 'undefined' || path.startsWith('/admin')) return;

  try {
    const vid = getOrCreateVisitorId();
    const device = detectDevice();
    const browser = detectBrowser();
    let referrer = 'Direct';
    try {
      if (document.referrer) {
        referrer = new URL(document.referrer).hostname || 'Direct';
      }
    } catch {
      referrer = 'Direct';
    }

    fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: vid,
        path: path || '/',
        deviceType: device,
        browser,
        referrer,
      }),
    }).catch(() => {});
  } catch (err) {
    console.debug('Analytics log error:', err);
  }
}

/**
 * Get Persistent Analytics Summary Metadata from Cloudflare D1 SQL
 */
export async function getAnalyticsMeta(): Promise<{
  archivedVisits: number;
  totalLifetimeVisits: number;
  lastPrunedAt?: string;
  lastPrunedCount?: number;
}> {
  try {
    const res = await fetch('/api/analytics/metrics');
    if (res.ok) {
      const data = await res.json();
      return {
        archivedVisits: data.archivedVisits || 0,
        totalLifetimeVisits: data.totalLifetimeVisits || 0,
        lastPrunedAt: data.lastPrunedAt,
        lastPrunedCount: data.lastPrunedCount,
      };
    }
  } catch (e) {
    console.debug('Error reading analytics meta:', e);
  }
  return { archivedVisits: 0, totalLifetimeVisits: 0 };
}

/**
 * Prune Traffic Logs when exceeding 1 Juta (1,000,000) Visitors in Cloudflare D1 SQL
 */
export async function pruneOld10DayTrafficLogs(): Promise<{ deletedCount: number; newTotalLifetimeVisits: number; message?: string }> {
  try {
    const res = await fetch('/api/analytics/prune', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      return {
        deletedCount: data.deletedCount || 0,
        newTotalLifetimeVisits: data.newTotalLifetimeVisits || 0,
        message: data.message,
      };
    }
  } catch (err) {
    console.warn('Prune Cloudflare D1 logs error:', err);
  }
  return { deletedCount: 0, newTotalLifetimeVisits: 0 };
}

export async function pruneOldTrafficLogs(): Promise<number> {
  const result = await pruneOld10DayTrafficLogs();
  return result.deletedCount;
}

/**
 * Fetch Analytics Summary & Metrics from Cloudflare D1 SQL DB
 */
export async function fetchAnalyticsMetrics(): Promise<VisitorAnalyticsSummary> {
  try {
    const res = await fetch('/api/analytics/metrics');
    if (res.ok) {
      const metrics = await res.json();
      return metrics as VisitorAnalyticsSummary;
    }
  } catch (error) {
    console.error('Error fetching Cloudflare D1 analytics metrics:', error);
  }
  return {
    totalVisits: 0,
    totalLifetimeVisits: 0,
    archivedVisits: 0,
    totalUniqueVisitors: 0,
    uniqueVisitors: 0,
    traffic30Min: 0,
    traffic1Day: 0,
    traffic30Days: 0,
    traffic90Days: 0,
    topPages: [],
    referrers: {},
    deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
    dailyTrend: [],
    lastPrunedCount: 0,
    databaseEngine: 'Cloudflare D1 SQL',
  };
}

/**
 * Real-time polling subscription to Cloudflare D1 SQL analytics telemetry
 */
export function subscribeToAnalytics(
  onMetrics: (metrics: VisitorAnalyticsSummary) => void,
  onRecentLogs?: (logs: VisitorLogEntry[]) => void
): () => void {
  let isMounted = true;

  const poll = async () => {
    if (!isMounted) return;
    try {
      const metrics = await fetchAnalyticsMetrics();
      if (isMounted) onMetrics(metrics);

      if (onRecentLogs && isMounted) {
        const logs = await fetchRecentVisitorLogs(100);
        if (isMounted) onRecentLogs(logs);
      }
    } catch (e) {
      console.debug('Polling error:', e);
    }
  };

  poll();
  const intervalId = setInterval(poll, 3000);

  return () => {
    isMounted = false;
    clearInterval(intervalId);
  };
}

/**
 * Fetch Recent Visitor Activity Logs from Cloudflare D1 SQL
 */
export async function fetchRecentVisitorLogs(limitCount = 100): Promise<VisitorLogEntry[]> {
  try {
    const res = await fetch(`/api/analytics/recent?limit=${limitCount}`);
    if (res.ok) {
      const data = await res.json();
      if (data.logs) return data.logs;
    }
  } catch (e) {
    console.debug('Error fetching recent logs:', e);
  }
  return [];
}

/**
 * Fetch Team Members from Cloudflare D1 SQL DB
 */
export async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    const res = await fetch('/api/team');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.members) && data.members.length > 0) {
        return data.members;
      }
    }
  } catch (err) {
    console.debug('Error fetching team members from D1 SQLite:', err);
  }
  return [];
}

/**
 * Save or Add Team Member to Cloudflare D1 SQL DB
 */
export async function saveTeamMember(member: Partial<TeamMember> & { name: string; role: string }): Promise<string> {
  const memberId = member.id || 'member_' + Date.now().toString(36);
  try {
    await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...member,
        id: memberId,
      }),
    });
  } catch (e) {
    console.debug('Save team member error:', e);
  }
  return memberId;
}

/**
 * Delete Team Member from Cloudflare D1 SQL DB
 */
export async function deleteTeamMember(memberId: string): Promise<void> {
  try {
    await fetch(`/api/team/${memberId}`, { method: 'DELETE' });
  } catch (e) {
    console.debug('Delete team member error:', e);
  }
}

/**
 * Fetch Dashboard Reminder from Cloudflare D1 SQL DB
 */
export async function fetchDashboardReminder(): Promise<DashboardReminder | null> {
  try {
    const res = await fetch('/api/reminder');
    if (res.ok) {
      const data = await res.json();
      if (data.reminder) return data.reminder as DashboardReminder;
    }
  } catch (err) {
    console.debug('Error fetching reminder from D1 SQLite:', err);
  }
  try {
    const local = localStorage.getItem('jason_dashboard_reminder');
    if (local) return JSON.parse(local);
  } catch {}
  return null;
}

/**
 * Save Dashboard Reminder to Cloudflare D1 SQL DB
 */
export async function saveDashboardReminder(reminder: Partial<DashboardReminder>): Promise<void> {
  const reminderData = {
    id: 'current',
    title: reminder.title || 'Meeting with Arc Company',
    time: reminder.time || '02.00 pm - 04.00 pm',
    actionUrl: reminder.actionUrl || '',
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem('jason_dashboard_reminder', JSON.stringify(reminderData));
  } catch {}

  try {
    await fetch('/api/reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminderData),
    });
  } catch (err) {
    console.debug('Error saving reminder to D1 SQLite:', err);
  }
}

/**
 * Fetch Portfolio Projects from Cloudflare D1 SQL DB
 */
export async function fetchProjectsFromFirestore(): Promise<Project[]> {
  try {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.projects) && data.projects.length > 0) {
        return data.projects as Project[];
      }
    }
  } catch (error) {
    console.debug('Error fetching projects from D1 SQLite:', error);
  }
  return [];
}

/**
 * Save / Update a Project in Cloudflare D1 SQL DB
 */
export async function saveProjectToFirestore(project: Partial<Project> & { id: string }): Promise<void> {
  try {
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
  } catch (err) {
    console.debug('Error saving project to D1 SQLite:', err);
  }
}

/**
 * Delete a Project from Cloudflare D1 SQL DB
 */
export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  try {
    await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
  } catch (err) {
    console.debug('Error deleting project from D1 SQLite:', err);
  }
}

/**
 * Fetch Global Site Settings / Image Overrides from Cloudflare D1 SQL DB
 */
export async function fetchSiteSettings(): Promise<SiteImageSettings | null> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.settings) return data.settings as SiteImageSettings;
    }
  } catch (error) {
    console.debug('Error fetching site settings from D1 SQLite:', error);
  }
  return null;
}

/**
 * Save / Update Global Site Settings / Images in Cloudflare D1 SQL DB
 */
export async function saveSiteSettings(settings: Partial<SiteImageSettings>): Promise<void> {
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  } catch (err) {
    console.debug('Error saving site settings to D1 SQLite:', err);
  }
}
