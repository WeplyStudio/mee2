import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
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

// Initialize Firebase App singleton
const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use named database if specified in config, otherwise default
export const db = firebaseConfigJson.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

// Test Firestore Connection on Boot (per Firebase Skill Guideline)
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is offline or unreachable. Using cached/local state.');
    }
    return false;
  }
}

// Call test connection gracefully in background
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
 * Log page view event to Firestore (Records 100% of traffic, requests, selenium, automation, and visitors)
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
    const todayStr = new Date().toISOString().split('T')[0];

    // Add event to analytics_events collection
    await addDoc(collection(db, 'analytics_events'), {
      visitorId: vid,
      path: path || '/',
      deviceType: device,
      browser,
      referrer,
      createdAt: serverTimestamp(),
      dateStr: todayStr,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.debug('Analytics log error:', err);
  }
}

/**
 * Prune / Delete Traffic Logs older than 90 days from Firestore
 */
export async function pruneOldTrafficLogs(): Promise<number> {
  try {
    const cutoffMs = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days ago
    const eventsRef = collection(db, 'analytics_events');
    const snapshot = await getDocs(query(eventsRef, limit(300)));

    let deletedCount = 0;
    const deletePromises: Promise<void>[] = [];

    snapshot.docs.forEach((d) => {
      const data = d.data();
      const tsStr = data.timestamp;
      let tsMs = 0;
      if (typeof tsStr === 'string') {
        tsMs = new Date(tsStr).getTime();
      } else if (data.createdAt && typeof data.createdAt.toMillis === 'function') {
        tsMs = data.createdAt.toMillis();
      }

      if (tsMs > 0 && tsMs < cutoffMs) {
        deletePromises.push(deleteDoc(doc(db, 'analytics_events', d.id)));
        deletedCount++;
      }
    });

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
    return deletedCount;
  } catch (err) {
    console.warn('Prune traffic logs error:', err);
    return 0;
  }
}

/**
 * Extract millisecond timestamp accurately from doc data
 */
function extractDocTimestamp(data: Record<string, any>): number {
  if (data.timestamp) {
    const parsed = new Date(data.timestamp).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  if (data.createdAt) {
    if (typeof data.createdAt.toMillis === 'function') return data.createdAt.toMillis();
    if (typeof data.createdAt.toDate === 'function') return data.createdAt.toDate().getTime();
    if (typeof data.createdAt.seconds === 'number') return data.createdAt.seconds * 1000;
    if (typeof data.createdAt === 'string') {
      const parsed = new Date(data.createdAt).getTime();
      if (!isNaN(parsed)) return parsed;
    }
  }
  if (data.dateStr) {
    const parsed = new Date(data.dateStr).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return Date.now();
}

/**
 * Compute Visitor Analytics from Firestore Document snapshots
 */
export function computeAnalyticsFromDocs(docs: any[]): VisitorAnalyticsSummary {
  const nowMs = Date.now();
  const ms30Min = 30 * 60 * 1000;
  const ms1Day = 24 * 60 * 60 * 1000;
  const ms30Days = 30 * 24 * 60 * 60 * 1000;
  const ms90Days = 90 * 24 * 60 * 60 * 1000;

  let traffic30Min = 0;
  let traffic1Day = 0;
  let traffic30Days = 0;
  let traffic90Days = 0;

  const uniqueVisitors = new Set<string>();
  const pageCounts: Record<string, number> = {};
  const referrers: Record<string, number> = {};
  const dailyMap: Record<string, { visits: number; uniqueSet: Set<string> }> = {};

  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;

  // Initialize last 14 days in dailyMap
  for (let i = 13; i >= 0; i--) {
    const d = new Date(nowMs - i * 24 * 60 * 60 * 1000);
    const ds = d.toISOString().split('T')[0];
    dailyMap[ds] = { visits: 0, uniqueSet: new Set() };
  }

  docs.forEach((docSnap) => {
    const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap;
    const vid = data.visitorId || (docSnap.id ? docSnap.id : 'anon');
    uniqueVisitors.add(vid);

    const eventTime = extractDocTimestamp(data);
    const ageMs = Math.max(0, nowMs - eventTime);

    // Calculate time windows based on actual time elapsed
    if (ageMs <= ms30Min) traffic30Min++;
    if (ageMs <= ms1Day) traffic1Day++;
    if (ageMs <= ms30Days) traffic30Days++;
    if (ageMs <= ms90Days) traffic90Days++;

    const path = data.path || '/';
    pageCounts[path] = (pageCounts[path] || 0) + 1;

    const ref = data.referrer || 'Direct';
    referrers[ref] = (referrers[ref] || 0) + 1;

    if (data.deviceType === 'mobile') mobileCount++;
    else if (data.deviceType === 'tablet') tabletCount++;
    else desktopCount++;

    const itemDate = data.dateStr || new Date(eventTime).toISOString().split('T')[0];
    if (dailyMap[itemDate]) {
      dailyMap[itemDate].visits++;
      dailyMap[itemDate].uniqueSet.add(vid);
    }
  });

  const totalEvents = docs.length;

  const topPagesArray: TopPageEntry[] = Object.entries(pageCounts)
    .map(([path, visits]) => ({
      path,
      visits,
      percentage: totalEvents > 0 ? Math.round((visits / totalEvents) * 100) : 0,
    }))
    .sort((a, b) => b.visits - a.visits);

  const dailyTrend = Object.keys(dailyMap)
    .sort()
    .map((date) => ({
      date: date.slice(5), // MM-DD
      visits: dailyMap[date].visits,
      unique: dailyMap[date].uniqueSet.size,
    }));

  return {
    totalVisits: totalEvents,
    totalUniqueVisitors: uniqueVisitors.size,
    uniqueVisitors: uniqueVisitors.size,
    traffic30Min,
    traffic1Day,
    traffic30Days,
    traffic90Days,
    topPages: topPagesArray,
    referrers,
    deviceBreakdown: {
      mobile: mobileCount,
      desktop: desktopCount,
      tablet: tabletCount,
    },
    dailyTrend,
    lastPrunedCount: 0,
  };
}

/**
 * Fetch Analytics Summary & Metrics for the Admin Dashboard
 */
export async function fetchAnalyticsMetrics(): Promise<VisitorAnalyticsSummary> {
  try {
    const eventsRef = collection(db, 'analytics_events');
    const q = query(eventsRef, limit(2000));
    const snapshot = await getDocs(q);
    return computeAnalyticsFromDocs(snapshot.docs);
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    return {
      totalVisits: 0,
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
    };
  }
}

/**
 * Real-time subscription to analytics events for live dashboard telemetry
 */
export function subscribeToAnalytics(
  onMetrics: (metrics: VisitorAnalyticsSummary) => void,
  onRecentLogs?: (logs: VisitorLogEntry[]) => void
): () => void {
  try {
    const eventsRef = collection(db, 'analytics_events');
    const q = query(eventsRef, limit(2000));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const metrics = computeAnalyticsFromDocs(snapshot.docs);
        onMetrics(metrics);

        if (onRecentLogs) {
          // Sort recent logs by timestamp desc
          const sortedDocs = [...snapshot.docs].sort((a, b) => {
            const timeA = extractDocTimestamp(a.data());
            const timeB = extractDocTimestamp(b.data());
            return timeB - timeA;
          });

          const logs: VisitorLogEntry[] = sortedDocs.slice(0, 25).map((d) => {
            const data = d.data();
            return {
              id: d.id,
              visitorId: data.visitorId || 'anon',
              path: data.path || '/',
              deviceType: data.deviceType || 'desktop',
              browser: data.browser || 'Unknown',
              referrer: data.referrer || 'Direct',
              timestamp: data.timestamp || (data.createdAt?.toMillis ? new Date(data.createdAt.toMillis()).toISOString() : new Date().toISOString()),
            };
          });
          onRecentLogs(logs);
        }
      },
      (error) => {
        console.error('Real-time analytics subscription error:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to analytics:', err);
    return () => {};
  }
}

/**
 * Fetch Recent Visitor Activity Logs
 */
export async function fetchRecentVisitorLogs(limitCount = 20): Promise<VisitorLogEntry[]> {
  try {
    const eventsRef = collection(db, 'analytics_events');
    const q = query(eventsRef, limit(limitCount * 2));
    const snapshot = await getDocs(q);

    const sortedDocs = [...snapshot.docs].sort((a, b) => {
      const timeA = extractDocTimestamp(a.data());
      const timeB = extractDocTimestamp(b.data());
      return timeB - timeA;
    });

    return sortedDocs.slice(0, limitCount).map((d) => {
      const data = d.data();
      return {
        id: d.id,
        visitorId: data.visitorId || 'anon',
        path: data.path || '/',
        deviceType: data.deviceType || 'desktop',
        browser: data.browser || 'Unknown',
        referrer: data.referrer || 'Direct',
        timestamp: data.timestamp || new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}

/**
 * Fetch Team Members from Firestore
 */
export async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    const colRef = collection(db, 'team_members');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    return snapshot.docs.map((d) => ({
      id: d.id,
      name: d.data().name || '',
      role: d.data().role || '',
      status: d.data().status || 'In Progress',
      avatar: d.data().avatar || '',
      createdAt: d.data().createdAt || '',
    }));
  } catch (err) {
    console.error('Error fetching team members:', err);
    return [];
  }
}

/**
 * Save or Add Team Member to Firestore
 */
export async function saveTeamMember(member: Partial<TeamMember> & { name: string; role: string }): Promise<string> {
  const memberId = member.id || 'member_' + Date.now().toString(36);
  const docRef = doc(db, 'team_members', memberId);
  await setDoc(
    docRef,
    {
      id: memberId,
      name: member.name,
      role: member.role,
      status: member.status || 'In Progress',
      avatar: member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      createdAt: member.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  return memberId;
}

/**
 * Delete Team Member from Firestore
 */
export async function deleteTeamMember(memberId: string): Promise<void> {
  const docRef = doc(db, 'team_members', memberId);
  await deleteDoc(docRef);
}

/**
 * Fetch Dashboard Reminder from Firestore
 */
export async function fetchDashboardReminder(): Promise<DashboardReminder | null> {
  try {
    const docRef = doc(db, 'dashboard_reminders', 'current');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as DashboardReminder;
    }
    return null;
  } catch (err) {
    console.error('Error fetching reminder:', err);
    return null;
  }
}

/**
 * Save Dashboard Reminder to Firestore
 */
export async function saveDashboardReminder(reminder: Partial<DashboardReminder>): Promise<void> {
  const docRef = doc(db, 'dashboard_reminders', 'current');
  await setDoc(
    docRef,
    {
      id: 'current',
      title: reminder.title || 'Meeting with Arc Company',
      time: reminder.time || '02.00 pm - 04.00 pm',
      actionUrl: reminder.actionUrl || '',
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Fetch Portfolio Projects from Firestore
 */
export async function fetchProjectsFromFirestore(): Promise<Project[]> {
  try {
    const projectsCol = collection(db, 'portfolio_projects');
    const q = query(projectsCol, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: data.id || d.id,
        title: data.title || '',
        client: data.client || '',
        company: data.company || '',
        category: data.category || '',
        year: data.year || '2025',
        description: data.description || '',
        summary: data.summary || data.description || '',
        role: data.role || 'designer & engineer',
        type: data.type || data.category || '',
        tech: data.tech || 'react, typescript, tailwind css',
        deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
        problem: data.problem || '',
        decisions: data.decisions || '',
        impact: data.impact || '',
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
        screens: Array.isArray(data.screens) ? data.screens : [],
        metrics: Array.isArray(data.metrics) ? data.metrics : [],
        imageType: data.imageType || 'zylo',
        imageUrl: data.imageUrl || '',
        liveUrl: data.liveUrl || '',
        accentColor: data.accentColor || '#6366f1',
        nextProjectId: data.nextProjectId || '',
        nextProjectTitle: data.nextProjectTitle || '',
      } as Project;
    });
  } catch (error) {
    console.error('Error fetching projects from Firestore:', error);
    return [];
  }
}

/**
 * Save / Update a Project in Firestore
 */
export async function saveProjectToFirestore(project: Partial<Project> & { id: string }): Promise<void> {
  const docRef = doc(db, 'portfolio_projects', project.id);
  await setDoc(
    docRef,
    {
      ...project,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Delete a Project from Firestore
 */
export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  const docRef = doc(db, 'portfolio_projects', projectId);
  await deleteDoc(docRef);
}

/**
 * Fetch Global Site Settings / Image Overrides from Firestore
 */
export async function fetchSiteSettings(): Promise<SiteImageSettings | null> {
  try {
    const docRef = doc(db, 'site_settings', 'images');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SiteImageSettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
}

/**
 * Save / Update Global Site Settings / Images in Firestore
 */
export async function saveSiteSettings(settings: Partial<SiteImageSettings>): Promise<void> {
  const docRef = doc(db, 'site_settings', 'images');
  await setDoc(
    docRef,
    {
      ...settings,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
