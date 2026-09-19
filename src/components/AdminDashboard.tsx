import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  User,
  LogOut,
  BarChart3,
  FolderPlus,
  Image as ImageIcon,
  Eye,
  EyeOff,
  KeyRound,
  Database,
  RefreshCw,
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  ArrowLeft,
  Calendar,
  Sparkles,
  Layers,
  Save,
  RotateCcw,
  Clock,
  Flame,
  Activity,
  TrendingUp,
  Search,
  Bell,
  Mail,
  Play,
  Pause,
  Square,
  Settings,
  HelpCircle,
  Users,
  Check,
  Menu,
  X,
  Zap,
  Radio
} from 'lucide-react';
import {
  fetchAnalyticsMetrics,
  fetchRecentVisitorLogs,
  pruneOldTrafficLogs,
  fetchProjectsFromFirestore,
  saveProjectToFirestore,
  deleteProjectFromFirestore,
  fetchSiteSettings,
  saveSiteSettings,
  VisitorAnalyticsSummary,
  VisitorLogEntry,
  SiteImageSettings
} from '../lib/firebase';
import { Project } from '../types';
import { getProjectsData } from '../data/portfolioData';

interface Props {
  onBackToSite: () => void;
  onProjectsUpdated?: () => void;
  onSettingsUpdated?: () => void;
}

export const AdminDashboard: React.FC<Props> = ({
  onBackToSite,
  onProjectsUpdated,
  onSettingsUpdated,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('jason_admin_auth') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Active Admin Tab (Dashboard added as the default)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'analytics' | 'images'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [trafficTimeframe, setTrafficTimeframe] = useState<'realtime' | '24h' | '7d'>('realtime');

  // Search task / project query
  const [searchQuery, setSearchQuery] = useState('');

  // Live stopwatch timer
  const [time, setTime] = useState(5048); // representing 01:24:08
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Live Stopwatch ticks
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Team Collaboration state
  const [teamMembers, setTeamMembers] = useState([
    { name: "Alexandra Deff", role: "Github Project Repository", status: "Completed", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" },
    { name: "Edwin Adenike", role: "Integrate User Authentication System", status: "In Progress", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" },
    { name: "Isaac Oluwatemilorun", role: "Develop Search and Filter Functionality", status: "Pending", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=100" },
    { name: "David Oshodi", role: "Responsive Layout for Homepage", status: "In Progress", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" }
  ]);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberStatus, setNewMemberStatus] = useState<'Completed' | 'In Progress' | 'Pending'>('In Progress');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim()) return;
    setTeamMembers([
      ...teamMembers,
      {
        name: newMemberName,
        role: newMemberRole,
        status: newMemberStatus,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100`
      }
    ]);
    setNewMemberName('');
    setNewMemberRole('');
    setIsAddMemberOpen(false);
    showToast(`Kolaborator "${newMemberName}" berhasil ditambahkan.`);
  };

  // Analytics State
  const [analytics, setAnalytics] = useState<VisitorAnalyticsSummary | null>(null);
  const [recentLogs, setRecentLogs] = useState<VisitorLogEntry[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isPruning, setIsPruning] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const filteredProjects = projects.filter(p =>
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.tech || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Site Images State
  const [siteImages, setSiteImages] = useState<SiteImageSettings>({});
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isSavingImages, setIsSavingImages] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check and Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setAuthError('');

    setTimeout(() => {
      if (usernameInput.trim() === 'admin' && passwordInput === 'Semarang20') {
        sessionStorage.setItem('jason_admin_auth', 'true');
        setIsAuthenticated(true);
        showToast('Login berhasil sebagai Admin');
      } else {
        setAuthError('Username atau password salah. Silakan coba lagi.');
      }
      setIsSubmittingAuth(false);
    }, 400);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('jason_admin_auth');
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  // Load Data When Authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    loadAnalytics();
    loadProjects();
    loadSiteImages();
  }, [isAuthenticated]);

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await fetchAnalyticsMetrics();
      const logs = await fetchRecentVisitorLogs(25);
      setAnalytics(data);
      setRecentLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handlePruneLogs = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus semua catatan traffic/visitor yang berusia lebih dari 90 hari dari Firestore?')) return;
    setIsPruning(true);
    try {
      const count = await pruneOldTrafficLogs();
      await loadAnalytics();
      showToast(`Pembersihan sukses: ${count} log traffic tua (>90 hari) telah dihapus dari database.`);
    } catch (err) {
      alert('Gagal membersihkan log: ' + String(err));
    } finally {
      setIsPruning(false);
    }
  };

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const dbProjects = await fetchProjectsFromFirestore();
      if (dbProjects.length > 0) {
        setProjects(dbProjects);
      } else {
        // Fallback to default projects if database is fresh
        const defaults = getProjectsData('id');
        setProjects(defaults);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadSiteImages = async () => {
    setIsLoadingImages(true);
    try {
      const settings = await fetchSiteSettings();
      if (settings) {
        setSiteImages(settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Seed default projects to Firestore
  const handleSeedDefaults = async () => {
    if (!confirm('Simpan 3 proyek default (Zylo, Trufin, Krig Studio) ke Firestore agar bisa diedit secara fleksibel?')) return;
    try {
      const defaults = getProjectsData('id');
      for (let i = 0; i < defaults.length; i++) {
        const p = defaults[i];
        await saveProjectToFirestore({
          ...p,
          order: i + 1,
        });
      }
      await loadProjects();
      showToast('3 proyek default berhasil disinkronkan ke Firestore');
      if (onProjectsUpdated) onProjectsUpdated();
    } catch (err) {
      alert('Gagal menyinkronkan proyek: ' + String(err));
    }
  };

  // Save Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.title) return;

    const projectId = editingProject.id?.trim() || 'project-' + Date.now().toString(36);
    const newProject: Project = {
      id: projectId,
      title: editingProject.title || 'Untitled Project',
      client: editingProject.client || '',
      company: editingProject.company || '',
      category: editingProject.category || 'Web Application',
      year: editingProject.year || new Date().getFullYear().toString(),
      description: editingProject.description || '',
      summary: editingProject.summary || editingProject.description || '',
      role: editingProject.role || 'Design & Engineering',
      type: editingProject.type || editingProject.category || 'Product Design',
      tech: editingProject.tech || 'React, TypeScript, Tailwind CSS',
      deliverables: editingProject.deliverables || ['Web Platform', 'UI/UX Design'],
      problem: editingProject.problem || '',
      decisions: editingProject.decisions || '',
      impact: editingProject.impact || '',
      achievements: editingProject.achievements || [],
      screens: editingProject.screens || [],
      metrics: editingProject.metrics || [],
      imageType: editingProject.imageType || 'zylo',
      imageUrl: editingProject.imageUrl || '/zylo.webp',
      liveUrl: editingProject.liveUrl || '',
      accentColor: editingProject.accentColor || '#18181b',
      nextProjectId: editingProject.nextProjectId || 'zylo',
      nextProjectTitle: editingProject.nextProjectTitle || 'Next Project',
      order: editingProject.order ?? projects.length + 1,
      featured: editingProject.featured ?? true,
    };

    try {
      await saveProjectToFirestore(newProject);
      await loadProjects();
      setIsProjectModalOpen(false);
      setEditingProject(null);
      showToast('Proyek berhasil disimpan ke Firestore');
      if (onProjectsUpdated) onProjectsUpdated();
    } catch (err) {
      alert('Gagal menyimpan proyek: ' + String(err));
    }
  };

  // Delete Project
  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Hapus proyek "${title}" dari Firestore?`)) return;
    try {
      await deleteProjectFromFirestore(id);
      await loadProjects();
      showToast(`Proyek "${title}" telah dihapus`);
      if (onProjectsUpdated) onProjectsUpdated();
    } catch (err) {
      alert('Gagal menghapus proyek: ' + String(err));
    }
  };

  // Save Site Images
  const handleSaveImages = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingImages(true);
    try {
      await saveSiteSettings(siteImages);
      showToast('Pengaturan gambar berhasil disimpan ke Firestore');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err) {
      alert('Gagal menyimpan gambar: ' + String(err));
    } finally {
      setIsSavingImages(false);
    }
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 py-12 text-zinc-900 selection:bg-zinc-950 selection:text-white relative">
        {/* Subtle decorative grid background to add texture without being noisy */}
        <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

        <div className="w-full max-w-md bg-white rounded-[24px] border border-zinc-200/80 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] p-8 sm:p-10 relative z-10 space-y-8">
          
          {/* Top navigation row */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <button
              onClick={onBackToSite}
              className="group inline-flex items-center gap-1.5 text-[11px] font-mono-code text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>[kembali ke situs]</span>
            </button>
            <span className="text-[10px] font-mono-code bg-zinc-50 border border-zinc-200/80 text-zinc-600 font-bold px-2 py-0.5 rounded-md">
              sec-access
            </span>
          </div>

          {/* Header Brand */}
          <div className="space-y-2">
            <h1 className="font-serif text-[26px] font-normal tracking-tight text-zinc-950 leading-tight">
              Sign In as Admin
            </h1>
            <p className="text-xs text-zinc-500 font-mono-code leading-relaxed">
              Enter credentials to access jason's portfolio dashboard and live visitor telemetry log.
            </p>
          </div>

          {/* Error Alert */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-mono-code flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span className="leading-relaxed">{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider font-mono-code block">
                Username
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin"
                required
                className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-950 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all font-mono-code"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider font-mono-code block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-3.5 pr-11 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-950 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all font-mono-code"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-zinc-400 leading-normal font-mono-code pt-1">
              Protected by standard database security rules. Session expires after inactivation.
            </p>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full py-3 bg-zinc-950 hover:bg-black text-white font-bold text-xs font-mono-code uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-sm"
            >
              {isSubmittingAuth ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <KeyRound className="w-3.5 h-3.5 text-white" />
              )}
              <span>Sign In</span>
            </button>
          </form>

          {/* Bottom Metas */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono-code text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firestore Connected
            </span>
            <span className="font-bold">v2.5.0</span>
          </div>

        </div>
      </div>
    );
  }

  // --- AUTHENTICATED DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#ececec] p-0 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center justify-start font-sans selection:bg-[#0f5132] selection:text-white w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white text-xs font-mono-code px-4 py-3 rounded-xl shadow-2xl border border-zinc-700 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE SLIDE-OVER DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 flex backdrop-blur-xs animate-fade-in">
          <div className="w-4/5 max-w-xs bg-white h-full p-6 flex flex-col justify-between shadow-2xl relative overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0f5132] text-white flex items-center justify-center font-bold shadow-md shadow-[#0f5132]/10">
                    <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-base text-zinc-900 block leading-none">Donezo</span>
                    <span className="text-[10px] font-semibold text-[#0f5132] tracking-wider uppercase">Admin Portal</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Menu List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase block px-2">Menu</span>
                <nav className="space-y-1">
                  <button
                    onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'dashboard'
                        ? 'bg-[#eef6f0] text-[#0f5132]'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <Activity className="w-4 h-4 shrink-0" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('projects'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'projects'
                        ? 'bg-[#eef6f0] text-[#0f5132]'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <FolderPlus className="w-4 h-4 shrink-0" />
                    <span>Tasks & Projects ({projects.length})</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'analytics'
                        ? 'bg-[#eef6f0] text-[#0f5132]'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 shrink-0" />
                    <span>Analytics Metrics</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('images'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'images'
                        ? 'bg-[#eef6f0] text-[#0f5132]'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>Site Images & Settings</span>
                  </button>
                </nav>
              </div>

              {/* Drawer General Actions */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase block px-2">General</span>
                <nav className="space-y-1">
                  <button
                    onClick={() => { onBackToSite(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all text-left"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span>Lihat Web Live</span>
                  </button>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all text-left"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* App Card in Mobile Drawer */}
            <div className="bg-[#f4f6f4] rounded-2xl p-4 border border-zinc-200/50 mt-6 relative overflow-hidden">
              <h4 className="text-xs font-bold text-zinc-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0f5132]" />
                Mobile App Available
              </h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed mb-3">
                Donezo App ready for your daily tasks.
              </p>
              <button
                onClick={() => alert('Fitur download aplikasi seluler akan tersedia di Google Play Store dan Apple App Store segera!')}
                className="w-full py-2 bg-[#0f5132] hover:bg-[#0c4027] text-white text-[10px] font-bold rounded-lg transition-all"
              >
                Download App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donezo Main Curved Outer Frame */}
      <div className="w-full max-w-7xl bg-[#f4f6f4] rounded-none sm:rounded-[32px] overflow-visible md:overflow-hidden shadow-none sm:shadow-[0_30px_70px_rgba(0,0,0,0.12)] border-0 sm:border border-zinc-200/60 flex flex-col md:flex-row min-h-screen md:min-h-[850px] relative">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex md:w-64 bg-white border-r border-zinc-200/80 p-6 flex-col justify-between shrink-0">
          <div className="space-y-8">
            {/* Logo / Branding */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0f5132] text-white flex items-center justify-center shadow-md shadow-[#0f5132]/10 shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-zinc-900 block leading-none">Donezo</span>
                <span className="text-[10px] font-semibold text-[#0f5132] tracking-wider uppercase">Admin Portal</span>
              </div>
            </div>

            {/* Navigation Menus */}
            <div className="space-y-6">
              {/* Menu Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase block px-3">Menu</span>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'dashboard'
                        ? 'bg-[#eef6f0] text-[#0f5132]'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <Activity className="w-4 h-4 shrink-0" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'projects'
                        ? 'bg-[#eef6f0] text-[#0f5132]'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <FolderPlus className="w-4 h-4 shrink-0" />
                    <span>Tasks & Projects ({projects.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'analytics'
                        ? 'bg-[#eef6f0] text-[#0f5132]'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 shrink-0" />
                    <span>Analytics Metrics</span>
                  </button>
                </nav>
              </div>

              {/* General Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase block px-3">General</span>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('images')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'images'
                        ? 'bg-[#eef6f0] text-[#0f5132]'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>Site Images & Settings</span>
                  </button>
                  <button
                    onClick={onBackToSite}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all text-left"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span>Lihat Web Live</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all text-left"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Download Mobile App Sidebar Card */}
          <div className="bg-[#f4f6f4] rounded-2xl p-4 border border-zinc-200/50 mt-6 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#0f5132]/5 rounded-full" />
            <h4 className="text-xs font-bold text-zinc-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0f5132]" />
              Mobile App Available
            </h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed mb-3">
              Manage your tasks and view live telemetry logs on the go with Donezo App.
            </p>
            <button
              onClick={() => alert('Fitur download aplikasi seluler akan tersedia di Google Play Store dan Apple App Store segera!')}
              className="w-full py-2 bg-[#0f5132] hover:bg-[#0c4027] text-white text-[10px] font-bold rounded-lg transition-all"
            >
              Download App
            </button>
          </div>
        </aside>

        {/* MAIN BODY CONTAINER */}
        <div className="flex-grow flex flex-col min-w-0 w-full">
          
          {/* TOP BAR */}
          <header className="bg-white border-b border-zinc-200/80 h-16 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
            {/* Left: Mobile Menu button & Search */}
            <div className="flex items-center gap-2 sm:gap-3 flex-grow max-w-xs sm:max-w-md">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 shrink-0 cursor-pointer"
                title="Buka Menu"
                aria-label="Toggle Mobile Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative w-full">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects... ⌘F"
                  className="w-full pl-9 pr-8 sm:pr-12 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] transition-all"
                />
                <span className="text-[9px] font-mono-code text-zinc-400 border border-zinc-200 bg-white px-1.5 py-0.5 rounded absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline">
                  ⌘F
                </span>
              </div>
            </div>

            {/* Icons & User Profile details */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button className="text-zinc-500 hover:text-zinc-800 p-1.5 rounded-lg hover:bg-zinc-50 relative">
                <Mail className="w-4.5 h-4.5" />
                <span className="w-1.5 h-1.5 bg-[#0f5132] rounded-full absolute top-1.5 right-1.5" />
              </button>
              <button className="text-zinc-500 hover:text-zinc-800 p-1.5 rounded-lg hover:bg-zinc-50">
                <Bell className="w-4.5 h-4.5" />
              </button>

              <div className="h-6 w-px bg-zinc-200 hidden sm:block" />

              {/* User Avatar & Info */}
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-zinc-900 block leading-none">Totok Michael</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">matchboxdevelopment@gmail.com</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#0f5132] text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  TM
                </div>
              </div>
            </div>
          </header>

          {/* MOBILE QUICK TABS (Shown on small screens for fast one-tap switching) */}
          <div className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 bg-zinc-100/80 border-b border-zinc-200/80 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'dashboard' ? 'bg-[#0f5132] text-white shadow-xs' : 'text-zinc-600 bg-white border border-zinc-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'projects' ? 'bg-[#0f5132] text-white shadow-xs' : 'text-zinc-600 bg-white border border-zinc-200'
              }`}
            >
              Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'analytics' ? 'bg-[#0f5132] text-white shadow-xs' : 'text-zinc-600 bg-white border border-zinc-200'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'images' ? 'bg-[#0f5132] text-white shadow-xs' : 'text-zinc-600 bg-white border border-zinc-200'
              }`}
            >
              Settings
            </button>
          </div>

          {/* MAIN PANELS AND CONTENT SCREEN (Fully scrollable without viewport clipping) */}
          <main className="flex-grow p-4 sm:p-6 overflow-y-visible md:overflow-y-auto w-full">
        {/* TAB 0: DONEZO DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header section with actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
                <p className="text-xs text-zinc-500 mt-1">Plan, prioritize, and accomplish your tasks with ease.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSeedDefaults}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 rounded-xl transition-colors cursor-pointer"
                  title="Sinkronkan proyek default dari portfolio"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#0f5132]" />
                  <span>Import Data</span>
                </button>
                <button
                  onClick={() => {
                    setEditingProject({
                      id: 'proj-' + Math.random().toString(36).substring(2, 8),
                      title: '',
                      category: 'Infrastruktur Cloud & Web',
                      year: new Date().getFullYear().toString(),
                      client: '',
                      company: '',
                      description: '',
                      summary: '',
                      role: 'lead design engineer',
                      type: 'web application',
                      tech: 'react, typescript, tailwind css',
                      deliverables: ['Web Application', 'UI/UX Design System'],
                      imageUrl: '/zylo.webp',
                      imageType: 'zylo',
                      liveUrl: '',
                      accentColor: '#18181b',
                      featured: true,
                    });
                    setIsProjectModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-[#0f5132] hover:bg-[#0c4027] text-white rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add Project</span>
                </button>
              </div>
            </div>

            {/* STAT CARDS GRID WITH TOTAL TRAFFIC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: TOTAL TRAFFIC */}
              <div className="bg-[#0f5132] text-white p-5 rounded-[24px] shadow-sm relative overflow-hidden flex flex-col justify-between h-36 group">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-300" />
                    Total Traffic
                  </span>
                  <span className="flex items-center gap-1 text-[9px] bg-white/15 text-emerald-200 font-mono-code px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-bold tracking-tight">
                    {analytics?.totalVisits ? analytics.totalVisits.toLocaleString('id-ID') : '1,429'}
                  </div>
                  <div className="text-[10px] text-white/70 mt-0.5 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-emerald-300" />
                    <span className="font-semibold text-emerald-200">+18.4%</span>
                    <span>vs bulan lalu</span>
                  </div>
                </div>
                <div className="text-[10px] text-white/80 font-mono-code pt-2 border-t border-white/10 flex items-center justify-between">
                  <span>{analytics?.uniqueVisitors || 842} Unique Visitors</span>
                  <span
                    className="text-emerald-300 font-semibold cursor-pointer hover:underline"
                    onClick={() => setActiveTab('analytics')}
                  >
                    Detail →
                  </span>
                </div>
              </div>

              {/* Card 2: Total Projects */}
              <div className="bg-white border border-zinc-200/80 p-5 rounded-[24px] shadow-2xs relative overflow-hidden flex flex-col justify-between h-36">
                <div className="absolute right-4 top-4 w-7 h-7 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                  <FolderPlus className="w-4 h-4 text-[#0f5132]" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-zinc-450 uppercase tracking-wider block">Total Projects</span>
                  <div className="text-3xl font-bold mt-1 text-zinc-900">{projects.length}</div>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono-code pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-emerald-600 font-bold">+5 Added</span>
                  <span>portfolio projects</span>
                </div>
              </div>

              {/* Card 3: Ended Projects */}
              <div className="bg-white border border-zinc-200/80 p-5 rounded-[24px] shadow-2xs relative overflow-hidden flex flex-col justify-between h-36">
                <div className="absolute right-4 top-4 w-7 h-7 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-zinc-450 uppercase tracking-wider block">Ended Projects</span>
                  <div className="text-3xl font-bold mt-1 text-zinc-900">
                    {projects.filter(p => p.featured || p.liveUrl).length || 10}
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono-code pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-emerald-600 font-bold">+6 Increased</span>
                  <span>from last month</span>
                </div>
              </div>

              {/* Card 4: Realtime Visitors */}
              <div className="bg-white border border-zinc-200/80 p-5 rounded-[24px] shadow-2xs relative overflow-hidden flex flex-col justify-between h-36">
                <div className="absolute right-4 top-4 w-7 h-7 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                  <Activity className="w-4 h-4 text-[#0f5132]" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-zinc-450 uppercase tracking-wider block">Realtime Visitors</span>
                  <div className="text-3xl font-bold mt-1 text-zinc-900 flex items-center gap-2">
                    <span>{Math.max(1, Math.min(18, recentLogs.length > 0 ? recentLogs.slice(0, 8).length : 3))}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      active
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono-code pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-emerald-600 font-bold">Auto-synced</span>
                  <span>Firestore telemetry</span>
                </div>
              </div>
            </div>

            {/* BENTO GRID: ROW 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Column 1 & 2: Project Analytics & REALTIME TRAFFIC GRAPH */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* GRAFIK TRAFFIC REALTIME (Live Waveform & Activity Rate) */}
                <div className="bg-white border border-zinc-200/80 p-6 rounded-[24px] shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-zinc-900">Grafik Traffic Realtime</h3>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-[#eef6f0] text-[#0f5132] px-2.5 py-0.5 rounded-full border border-[#d1e7dd]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0f5132] animate-ping" />
                          Live Stream
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Volume pengunjung, request per menit, dan status traffic portfolio</p>
                    </div>

                    {/* Timeframe selector */}
                    <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl self-start sm:self-auto">
                      <button
                        onClick={() => setTrafficTimeframe('realtime')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                          trafficTimeframe === 'realtime' ? 'bg-white text-[#0f5132] shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        Realtime
                      </button>
                      <button
                        onClick={() => setTrafficTimeframe('24h')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                          trafficTimeframe === '24h' ? 'bg-white text-[#0f5132] shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        24 Jam
                      </button>
                      <button
                        onClick={() => setTrafficTimeframe('7d')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                          trafficTimeframe === '7d' ? 'bg-white text-[#0f5132] shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        7 Hari
                      </button>
                    </div>
                  </div>

                  {/* Realtime Smooth SVG Line & Area Graph */}
                  <div className="relative pt-2">
                    <div className="h-44 w-full relative">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="trafficGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#0f5132" stopOpacity="0.25" />
                            <stop offset="60%" stopColor="#0f5132" stopOpacity="0.06" />
                            <stop offset="100%" stopColor="#0f5132" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Grid lines */}
                        <line x1="0" y1="25" x2="500" y2="25" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="0" y1="65" x2="500" y2="65" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="0" y1="105" x2="500" y2="105" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4 4" />

                        {/* Area Path */}
                        <path
                          d="M 0,120 Q 40,95 80,110 T 160,75 T 240,90 T 320,38 T 400,52 T 480,20 L 500,25 L 500,150 L 0,150 Z"
                          fill="url(#trafficGradient)"
                        />

                        {/* Line Stroke */}
                        <path
                          d="M 0,120 Q 40,95 80,110 T 160,75 T 240,90 T 320,38 T 400,52 T 480,20 L 500,25"
                          fill="none"
                          stroke="#0f5132"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Live pulsating dot at current live point */}
                        <circle cx="480" cy="20" r="4.5" fill="#0f5132" className="animate-pulse" />
                        <circle cx="480" cy="20" r="10" fill="#0f5132" opacity="0.2" className="animate-ping" />

                        {/* Point nodes */}
                        <circle cx="80" cy="110" r="3" fill="#0f5132" />
                        <circle cx="160" cy="75" r="3" fill="#0f5132" />
                        <circle cx="240" cy="90" r="3" fill="#0f5132" />
                        <circle cx="320" cy="38" r="3" fill="#0f5132" />
                        <circle cx="400" cy="52" r="3" fill="#0f5132" />
                      </svg>
                    </div>

                    {/* Timeline Axis Labels */}
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono-code pt-2 border-t border-zinc-100">
                      <span>-60 min</span>
                      <span>-45 min</span>
                      <span>-30 min</span>
                      <span>-15 min</span>
                      <span>-5 min</span>
                      <span className="font-bold text-[#0f5132] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0f5132]" />
                        Sekarang (Live)
                      </span>
                    </div>

                    {/* Realtime Metrics Summary Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-100">
                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150/60">
                        <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Kecepatan Hit</span>
                        <span className="text-xs font-bold text-zinc-900 mt-0.5 block font-mono-code">28 req/min</span>
                      </div>
                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150/60">
                        <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Rata-rata Respon</span>
                        <span className="text-xs font-bold text-emerald-700 mt-0.5 block font-mono-code">38 ms (Optimal)</span>
                      </div>
                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150/60">
                        <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Top Device</span>
                        <span className="text-xs font-bold text-zinc-900 mt-0.5 block font-mono-code">Mobile (62%)</span>
                      </div>
                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150/60">
                        <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Halaman Aktif</span>
                        <span className="text-xs font-bold text-zinc-900 mt-0.5 block font-mono-code truncate">/ (Home Portfolio)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Analytics Bar Chart */}
                <div className="bg-white border border-zinc-200/80 p-6 rounded-[24px] shadow-2xs">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">Project Analytics</h3>
                      <p className="text-[11px] text-zinc-500">Weekly activity metric status</p>
                    </div>
                    {/* Tooltip percentage indicator */}
                    <span className="text-xs font-bold bg-[#eef6f0] text-[#0f5132] px-2.5 py-1 rounded-full border border-[#d1e7dd]">
                      74% Completed
                    </span>
                  </div>

                  {/* High-fidelity visual CSS bar chart */}
                  <div className="h-40 flex items-end justify-between px-4 pt-4 border-b border-zinc-150 relative">
                    {/* Horizontal gridlines */}
                    <div className="absolute inset-x-0 top-1/4 border-t border-zinc-100 pointer-events-none" />
                    <div className="absolute inset-x-0 top-2/4 border-t border-zinc-100 pointer-events-none" />
                    <div className="absolute inset-x-0 top-3/4 border-t border-zinc-100 pointer-events-none" />

                    {[
                      { day: 'S', height: '65%', active: false, striped: true },
                      { day: 'M', height: '80%', active: false, striped: false },
                      { day: 'T', height: '40%', active: false, striped: true },
                      { day: 'W', height: '95%', active: true, striped: false },
                      { day: 'T', height: '55%', active: false, striped: false },
                      { day: 'F', height: '70%', active: false, striped: true },
                      { day: 'S', height: '85%', active: false, striped: false },
                    ].map((bar, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 group relative z-10 w-12">
                        {/* Hover Tooltip percentage */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded-lg pointer-events-none transition-opacity whitespace-nowrap">
                          {bar.height} Load
                        </div>

                        {/* Bar */}
                        <div className="w-5 h-24 flex items-end">
                          <div
                            style={{ height: bar.height }}
                            className={`w-full rounded-t-md transition-all ${
                              bar.active
                                ? 'bg-[#0f5132]'
                                : bar.striped
                                ? 'bg-[#c3dfcb] bg-[linear-gradient(45deg,rgba(15,81,50,0.15)_25%,transparent_25%,transparent_50%,rgba(15,81,50,0.15)_50%,rgba(15,81,50,0.15)_75%,transparent_75%,transparent)] bg-[size:10px_10px]'
                                : 'bg-zinc-100 group-hover:bg-[#eef6f0]'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-500">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 3: Reminders, Project Progress Gauge, and Time Tracker */}
              <div className="space-y-6">
                {/* Reminders box */}
                <div className="bg-[#eef6f0] border border-[#d1e7dd] p-5 rounded-[24px] shadow-3xs relative overflow-hidden">
                  <span className="text-[10px] font-bold text-[#0f5132] tracking-widest uppercase block mb-1">Reminders</span>
                  <h3 className="text-sm font-bold text-zinc-900">Meeting with Arc Company</h3>
                  <div className="text-xs text-zinc-600 mt-1 mb-4 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>02.00 pm - 04.00 pm</span>
                  </div>
                  <button
                    onClick={() => alert('Memulai meeting virtual dengan Arc Company...')}
                    className="w-full py-2 bg-[#0f5132] hover:bg-[#0c4027] text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
                  >
                    Start Meeting
                  </button>
                </div>

                {/* Project Progress Gauge */}
                <div className="bg-white border border-zinc-200/80 p-6 rounded-[24px] shadow-2xs flex flex-col items-center justify-center">
                  <h3 className="text-sm font-bold text-zinc-900 w-full mb-3 text-left">Project Progress</h3>
                  
                  {/* Gauge display arc */}
                  <div className="relative w-36 h-20 flex items-end justify-center overflow-hidden">
                    {/* Background Arc */}
                    <div className="absolute w-36 h-36 border-[12px] border-zinc-100 rounded-full" />
                    {/* Semicircle Fill Arc for 41% */}
                    <div
                      className="absolute w-36 h-36 border-[12px] border-[#0f5132] rounded-full"
                      style={{
                        clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
                        transform: 'rotate(74deg)',
                      }}
                    />
                    {/* Text Label inside */}
                    <div className="absolute bottom-1 text-center">
                      <span className="text-2xl font-bold text-zinc-900">41%</span>
                      <span className="text-[9px] text-zinc-400 block -mt-1 uppercase font-semibold">Ended</span>
                    </div>
                  </div>

                  {/* Semicircle Legend info */}
                  <div className="flex items-center gap-3 mt-4 text-[10px] text-zinc-500 font-semibold w-full justify-center">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#0f5132]" />
                      Completed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#c3dfcb]" />
                      In Progress
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-zinc-100 border border-zinc-200" />
                      Pending
                    </span>
                  </div>
                </div>

                {/* Time Tracker Stopwatch Container */}
                <div className="bg-gradient-to-br from-[#0f5132] to-[#0c4027] text-white p-6 rounded-[24px] shadow-md relative overflow-hidden">
                  {/* Subtle vector mesh/grid overlays for high fidelity */}
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

                  <span className="text-[10px] font-bold text-white/70 tracking-widest uppercase block mb-1">Time Tracker</span>
                  <div className="text-3xl font-mono font-bold tracking-tight mb-4 select-none">
                    {formatTime(time)}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="flex-grow py-2.5 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-white" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Resume</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTime(0);
                        showToast('Stopwatch telah direset.');
                      }}
                      className="p-2.5 bg-red-600/35 hover:bg-red-600/50 text-white rounded-xl transition-all cursor-pointer"
                      title="Reset Tracker"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* BENTO GRID: ROW 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Project Task List */}
              <div className="bg-white border border-zinc-200/80 p-6 rounded-[24px] shadow-2xs lg:col-span-2">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Active Project Portfolio List</h3>
                    <p className="text-[11px] text-zinc-500">Click to edit or manage project details</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="text-xs font-semibold text-[#0f5132] hover:underline"
                  >
                    Manage Grid
                  </button>
                </div>

                <div className="space-y-3">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.slice(0, 5).map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => {
                          setEditingProject({ ...proj });
                          setIsProjectModalOpen(true);
                        }}
                        className="p-3.5 bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">
                            {proj.category}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-800 truncate mt-0.5">{proj.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-zinc-500 font-mono-code">{proj.year}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef6f0] text-[#0f5132] border border-[#d1e7dd]">
                            Active
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 py-4 text-center">No projects match the query.</p>
                  )}
                </div>
              </div>

              {/* Team Collaboration Panel */}
              <div className="bg-white border border-zinc-200/80 p-6 rounded-[24px] shadow-2xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Team Collaboration</h3>
                    <p className="text-[11px] text-zinc-500">Active project participants</p>
                  </div>
                  <button
                    onClick={() => setIsAddMemberOpen(true)}
                    className="text-xs font-semibold text-[#0f5132] hover:underline"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-zinc-800 block truncate leading-tight">{member.name}</span>
                          <span className="text-[10px] text-zinc-400 truncate block mt-0.5">{member.role}</span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                          member.status === 'Completed'
                            ? 'bg-[#eef6f0] text-[#0f5132] border border-[#d1e7dd]'
                            : member.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {member.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ADD MEMBER MODAL */}
            {isAddMemberOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 w-full max-w-sm space-y-4">
                  <h3 className="font-bold text-sm text-zinc-900">Add Team Member</h3>
                  <form onSubmit={handleAddMember} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Nama Member</label>
                      <input
                        type="text"
                        required
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Alexandra Deff"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-[#0f5132] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Peran / Tugas</label>
                      <input
                        type="text"
                        required
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        placeholder="Integrate User Authentication"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-[#0f5132] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Status</label>
                      <select
                        value={newMemberStatus}
                        onChange={(e: any) => setNewMemberStatus(e.target.value)}
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-[#0f5132] focus:outline-none"
                      >
                        <option value="Completed">Completed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddMemberOpen(false)}
                        className="px-3.5 py-1.5 border border-zinc-200 rounded-lg text-xs text-zinc-500 hover:bg-zinc-50"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#0f5132] text-white rounded-lg text-xs font-semibold"
                      >
                        Add Member
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: ANALYTICS & WEB TRAFFIC */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Analytics Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-950 font-mono-code flex items-center gap-2">
                  <Activity className="w-5 h-5 text-zinc-900" />
                  Analitik Visitor & Traffic Website
                </h2>
                <p className="text-xs font-mono-code text-zinc-500 mt-1">
                  Pencatatan otomatis setiap kunjungan halaman dengan penyimpanan otomatis di Google Cloud Firestore.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePruneLogs}
                  disabled={isPruning}
                  className="flex items-center gap-2 text-xs font-mono-code px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Hapus otomatis log kunjungan yang sudah lebih dari 90 hari"
                >
                  <Trash2 className={`w-3.5 h-3.5 ${isPruning ? 'animate-spin' : ''}`} />
                  <span>Hapus Traffic &gt; 90 Hari</span>
                </button>

                <button
                  onClick={loadAnalytics}
                  disabled={isLoadingAnalytics}
                  className="flex items-center gap-2 text-xs font-mono-code px-3.5 py-2.5 bg-zinc-950 hover:bg-black text-white font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
                  <span>Refresh Telemetri</span>
                </button>
              </div>
            </div>

            {/* Total Traffic by Time Windows (30 Mnt, 1 Hari, 30 Hari, 90 Hari) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono-code font-bold uppercase tracking-wider text-zinc-600">
                  Ringkasan Traffic Menurut Rentang Waktu
                </h3>
                <span className="text-[11px] font-mono-code text-zinc-400">Auto-prune: &gt;90 hari dihapus</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 30 Menit Terakhir */}
                <div className="bg-white border-2 border-zinc-900 rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] relative overflow-hidden group transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono-code font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-zinc-900 animate-ping" />
                      Traffic 30 Menit
                    </span>
                    <Clock className="w-4 h-4 text-zinc-800" />
                  </div>
                  <div className="text-3xl font-black text-zinc-950 font-mono-code">
                    {analytics ? analytics.traffic30Min.toLocaleString() : '...'}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono-code mt-2 flex items-center justify-between border-t border-zinc-200 pt-2">
                    <span>Pengunjung aktif terkini</span>
                    <span className="font-bold text-zinc-950">Realtime</span>
                  </div>
                </div>

                {/* 1 Hari (24 Jam) */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs relative overflow-hidden group hover:border-zinc-400 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono-code font-bold text-zinc-600 uppercase tracking-wider">
                      Traffic 1 Hari (24 Jam)
                    </span>
                    <Calendar className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="text-3xl font-black text-zinc-950 font-mono-code">
                    {analytics ? analytics.traffic1Day.toLocaleString() : '...'}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono-code mt-2 flex items-center justify-between border-t border-zinc-100 pt-2">
                    <span>Aktivitas harian</span>
                    <span className="font-medium text-zinc-800">24 Jam terakhir</span>
                  </div>
                </div>

                {/* 30 Hari Terakhir */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs relative overflow-hidden group hover:border-zinc-400 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono-code font-bold text-zinc-600 uppercase tracking-wider">
                      Traffic 30 Hari
                    </span>
                    <TrendingUp className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="text-3xl font-black text-zinc-950 font-mono-code">
                    {analytics ? analytics.traffic30Days.toLocaleString() : '...'}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono-code mt-2 flex items-center justify-between border-t border-zinc-100 pt-2">
                    <span>Akumulasi bulanan</span>
                    <span className="font-medium text-zinc-800">30 Hari terakhir</span>
                  </div>
                </div>

                {/* 90 Hari Terakhir */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs relative overflow-hidden group hover:border-zinc-400 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono-code font-bold text-zinc-600 uppercase tracking-wider">
                      Traffic 90 Hari
                    </span>
                    <Globe className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="text-3xl font-black text-zinc-950 font-mono-code">
                    {analytics ? analytics.traffic90Days.toLocaleString() : '...'}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono-code mt-2 flex items-center justify-between border-t border-zinc-100 pt-2">
                    <span>Batas simpan maksimum</span>
                    <span className="font-bold text-zinc-800">Maks 90 Hari</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Visited Pages & Device/Referrers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* TOP VISITED PAGES (Halaman mana yang paling banyak visitor) */}
              <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-5 border-b border-zinc-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 font-mono-code flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      Halaman Paling Banyak Visitor / Traffic
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono-code mt-0.5">
                      Peringkat halaman yang paling sering dikunjungi oleh pengguna
                    </p>
                  </div>
                  <span className="text-[11px] font-mono-code bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-md border border-zinc-200">
                    Most Visited
                  </span>
                </div>

                <div className="space-y-4">
                  {analytics && analytics.topPages && analytics.topPages.length > 0 ? (
                    analytics.topPages.map((pageItem, idx) => {
                      const rankColors = [
                        'bg-amber-500 text-white',
                        'bg-zinc-800 text-white',
                        'bg-zinc-600 text-white',
                        'bg-zinc-200 text-zinc-700',
                        'bg-zinc-100 text-zinc-600',
                      ];

                      return (
                        <div key={idx} className="p-3.5 bg-zinc-50/80 hover:bg-zinc-50 rounded-lg border border-zinc-200/80 transition-all space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono-code">
                            <div className="flex items-center gap-2.5 font-semibold text-zinc-900 min-w-0">
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${rankColors[idx] || 'bg-zinc-100 text-zinc-600'}`}>
                                {idx + 1}
                              </span>
                              <span className="truncate font-mono-code">{pageItem.path}</span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-zinc-500 text-[11px]">{pageItem.percentage}% share</span>
                              <span className="bg-zinc-900 text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold">
                                {pageItem.visits.toLocaleString()} visits
                              </span>
                            </div>
                          </div>

                          {/* Visual progress bar */}
                          <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              style={{ width: `${Math.max(pageItem.percentage, 5)}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-zinc-900' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs font-mono-code text-zinc-400 py-4 text-center">Belum ada data halaman terpopuler.</p>
                  )}
                </div>
              </div>

              {/* Device Breakdown & Referrers Sidebar */}
              <div className="space-y-6">
                {/* Device Breakdown */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs">
                  <h3 className="text-sm font-bold text-zinc-950 font-mono-code mb-4">
                    Komposisi Perangkat Visitor
                  </h3>

                  <div className="space-y-3.5 text-xs font-mono-code">
                    <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
                      <span className="flex items-center gap-2 text-zinc-700">
                        <Laptop className="w-4 h-4 text-zinc-600" />
                        Desktop
                      </span>
                      <span className="font-bold text-zinc-900">
                        {analytics ? analytics.deviceBreakdown.desktop : 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
                      <span className="flex items-center gap-2 text-zinc-700">
                        <Smartphone className="w-4 h-4 text-indigo-600" />
                        Mobile
                      </span>
                      <span className="font-bold text-zinc-900">
                        {analytics ? analytics.deviceBreakdown.mobile : 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
                      <span className="flex items-center gap-2 text-zinc-700">
                        <Tablet className="w-4 h-4 text-amber-600" />
                        Tablet
                      </span>
                      <span className="font-bold text-zinc-900">
                        {analytics ? analytics.deviceBreakdown.tablet : 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Traffic Referrers */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs">
                  <h3 className="text-sm font-bold text-zinc-950 font-mono-code mb-4">
                    Sumber Rujukan / Referrer
                  </h3>
                  <div className="space-y-2.5 text-xs font-mono-code">
                    {analytics &&
                      Object.entries(analytics.referrers)
                        .sort((a, b) => Number(b[1]) - Number(a[1]))
                        .slice(0, 5)
                        .map(([ref, count], idx) => (
                          <div key={idx} className="flex items-center justify-between py-1.5 border-b border-zinc-100 last:border-0">
                            <span className="text-zinc-700 truncate max-w-[160px]">{ref}</span>
                            <span className="font-semibold text-zinc-900">{count} visits</span>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Traffic Bar Chart */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 font-mono-code">
                    Grafik Tren Visitor Harian (14 Hari Terakhir)
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono-code mt-0.5">
                    Tayangan halaman (hitam) dan pengunjung unik (hijau) per hari
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono-code text-zinc-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-zinc-900 inline-block rounded-xs" />
                    Pageviews
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-emerald-500 inline-block rounded-xs" />
                    Unique
                  </span>
                </div>
              </div>

              {/* Bar Chart Visualizer */}
              <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 items-end h-48 pt-6 border-b border-zinc-200">
                {analytics?.dailyTrend.map((item, idx) => {
                  const maxVisits = Math.max(...(analytics.dailyTrend.map((d) => d.visits) || [1]), 10);
                  const barHeight = Math.max(8, (item.visits / maxVisits) * 100);
                  const uniqueHeight = Math.max(4, (item.unique / maxVisits) * 100);

                  return (
                    <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 bg-zinc-900 text-white text-[10px] font-mono-code px-2 py-1 rounded pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-md">
                        {item.visits} visits ({item.unique} unik)
                      </div>
                      <div className="w-full flex items-end justify-center gap-1 h-36">
                        <div
                          style={{ height: `${barHeight}%` }}
                          className="w-full max-w-[12px] bg-zinc-900 group-hover:bg-black rounded-t-xs transition-all"
                        />
                        <div
                          style={{ height: `${uniqueHeight}%` }}
                          className="w-full max-w-[12px] bg-emerald-500 group-hover:bg-emerald-400 rounded-t-xs transition-all"
                        />
                      </div>
                      <span className="text-[10px] font-mono-code text-zinc-400 mt-2">
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Visitor Logs Table */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 font-mono-code">
                    Log Sesi Kunjungan Terkini
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono-code mt-0.5">
                    Daftar 25 aktivitas kunjungan terakhir di Firestore database
                  </p>
                </div>
                <span className="text-[11px] font-mono-code text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
                  Live Feed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-code">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Waktu</th>
                      <th className="py-3 px-4">Halaman Path</th>
                      <th className="py-3 px-4">Perangkat</th>
                      <th className="py-3 px-4">Browser</th>
                      <th className="py-3 px-4">Referrer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {recentLogs.length > 0 ? (
                      recentLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-3 px-4 text-zinc-500">
                            {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-4 font-bold text-zinc-950">{log.path}</td>
                          <td className="py-3 px-4 flex items-center gap-1.5">
                            {log.deviceType === 'mobile' ? (
                              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                            ) : log.deviceType === 'tablet' ? (
                              <Tablet className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <Laptop className="w-3.5 h-3.5 text-zinc-700" />
                            )}
                            <span className="capitalize">{log.deviceType}</span>
                          </td>
                          <td className="py-3 px-4">{log.browser}</td>
                          <td className="py-3 px-4 text-zinc-500">{log.referrer}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-400 font-mono-code">
                          Belum ada data aktivitas terkini di Firestore.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PORTFOLIO PROJECTS MANAGEMENT */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 lowercase">
                  [manajemen proyek portfolio]
                </h2>
                <p className="text-xs font-mono-code text-zinc-500 mt-1">
                  tambah, edit, atau hapus proyek yang tampil di beranda dan halaman /projects
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSeedDefaults}
                  className="flex items-center gap-1.5 text-xs font-mono-code px-3 py-2 bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-700 transition-colors"
                  title="Simpan proyek default ke Firestore"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Sinkronkan Default
                </button>
                <button
                  onClick={() => {
                    setEditingProject({
                      id: 'proj-' + Math.random().toString(36).substring(2, 8),
                      title: '',
                      category: 'Infrastruktur Cloud & Web',
                      year: new Date().getFullYear().toString(),
                      client: '',
                      company: '',
                      description: '',
                      summary: '',
                      role: 'lead design engineer',
                      type: 'web application',
                      tech: 'react, typescript, tailwind css',
                      deliverables: ['Web Application', 'UI/UX Design System'],
                      imageUrl: '/zylo.webp',
                      imageType: 'zylo',
                      liveUrl: '',
                      accentColor: '#18181b',
                      featured: true,
                    });
                    setIsProjectModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-mono-code px-4 py-2 bg-zinc-900 hover:bg-black text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Proyek Baru
                </button>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="bg-white border border-zinc-200 shadow-2xs overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Preview */}
                    <div className="aspect-video w-full bg-zinc-100 overflow-hidden relative border-b border-zinc-200">
                      <img
                        src={proj.imageUrl || (proj.imageType ? `/${proj.imageType}.webp` : '/zylo.webp')}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/zylo.webp';
                        }}
                      />
                      <span className="absolute top-2 left-2 bg-black/80 text-white text-[10px] font-mono-code px-2 py-0.5">
                        0{idx + 1}
                      </span>
                      <span className="absolute top-2 right-2 bg-white/95 text-zinc-800 text-[10px] font-mono-code px-2 py-0.5 border border-zinc-200">
                        {proj.year}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="text-[10px] font-mono-code text-zinc-400 uppercase">
                        {proj.category || 'Portfolio Item'}
                      </div>
                      <h4 className="font-bold text-sm tracking-tight text-zinc-900 lowercase line-clamp-2">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">
                        {proj.description || proj.summary}
                      </p>

                      <div className="pt-2 text-[11px] font-mono-code text-zinc-400">
                        tech: <span className="text-zinc-700">{proj.tech}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setEditingProject({ ...proj });
                        setIsProjectModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-xs font-mono-code text-zinc-700 hover:text-zinc-900 px-2.5 py-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteProject(proj.id, proj.title)}
                      className="flex items-center gap-1.5 text-xs font-mono-code text-red-600 hover:text-red-700 px-2.5 py-1.5 border border-red-200 bg-white hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WEBSITE IMAGE ASSET MANAGEMENT */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 lowercase">
                  [ganti semua gambar & foto situs]
                </h2>
                <p className="text-xs font-mono-code text-zinc-500 mt-1">
                  ubah URL foto profil hero, portrait about me, dan mockup proyek secara live tanpa redeploy
                </p>
              </div>

              <button
                onClick={handleSaveImages}
                disabled={isSavingImages}
                className="flex items-center gap-2 text-xs font-mono-code px-5 py-2.5 bg-zinc-900 hover:bg-black text-white transition-colors disabled:opacity-50"
              >
                {isSavingImages ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Semua Perubahan
              </button>
            </div>

            <form onSubmit={handleSaveImages} className="space-y-8">
              {/* Profile Images Section */}
              <div className="bg-white border border-zinc-200 p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-zinc-900 font-mono-code lowercase mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Foto Profil & Portrait Pengembang
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Hero Photo */}
                  <div className="border border-zinc-100 p-4 bg-zinc-50/50 flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        1. Foto Profil Utama (Hero Section)
                      </label>
                      <p className="text-[11px] font-mono-code text-zinc-500 mb-3">
                        Menggantikan <code>/profile-3.webp</code> di beranda utama.
                      </p>

                      <div className="mb-4">
                        <input
                          type="text"
                          value={siteImages.heroImage || ''}
                          onChange={(e) => setSiteImages({ ...siteImages, heroImage: e.target.value })}
                          placeholder="/profile-3.webp atau URL gambar kustom"
                          className="w-full text-xs font-mono-code p-2.5 bg-white border border-zinc-200 focus:border-zinc-900 outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <div className="w-20 h-20 bg-zinc-200 overflow-hidden border border-zinc-300">
                        <img
                          src={siteImages.heroImage || '/profile-3.webp'}
                          alt="Hero preview"
                          className="w-full h-full object-cover grayscale"
                          onError={(e) => ((e.target as HTMLImageElement).src = '/profile-3.webp')}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSiteImages({ ...siteImages, heroImage: '' })}
                        className="text-[11px] font-mono-code text-zinc-500 hover:text-zinc-900 underline"
                      >
                        Reset ke Default
                      </button>
                    </div>
                  </div>

                  {/* About Me Photo */}
                  <div className="border border-zinc-100 p-4 bg-zinc-50/50 flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        2. Foto Portrait (About Me & Footer)
                      </label>
                      <p className="text-[11px] font-mono-code text-zinc-500 mb-3">
                        Menggantikan <code>/profile-2.webp</code> pada halaman tentang saya.
                      </p>

                      <div className="mb-4">
                        <input
                          type="text"
                          value={siteImages.aboutImage || ''}
                          onChange={(e) => setSiteImages({ ...siteImages, aboutImage: e.target.value })}
                          placeholder="/profile-2.webp atau URL gambar kustom"
                          className="w-full text-xs font-mono-code p-2.5 bg-white border border-zinc-200 focus:border-zinc-900 outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <div className="w-16 h-20 bg-zinc-200 overflow-hidden border border-zinc-300">
                        <img
                          src={siteImages.aboutImage || '/profile-2.webp'}
                          alt="About preview"
                          className="w-full h-full object-cover grayscale"
                          onError={(e) => ((e.target as HTMLImageElement).src = '/profile-2.webp')}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSiteImages({ ...siteImages, aboutImage: '' })}
                        className="text-[11px] font-mono-code text-zinc-500 hover:text-zinc-900 underline"
                      >
                        Reset ke Default
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Mockup Covers Section */}
              <div className="bg-white border border-zinc-200 p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-zinc-900 font-mono-code lowercase mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Gambar Sampul 3 Proyek Utama
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Zylo */}
                  <div className="border border-zinc-200 p-4 bg-zinc-50/50 space-y-3">
                    <label className="block text-xs font-bold text-zinc-800">Zylo Cover Image</label>
                    <input
                      type="text"
                      value={siteImages.zyloImage || ''}
                      onChange={(e) => setSiteImages({ ...siteImages, zyloImage: e.target.value })}
                      placeholder="/zylo.webp atau URL"
                      className="w-full text-xs font-mono-code p-2 bg-white border border-zinc-200 focus:border-zinc-900 outline-hidden"
                    />
                    <div className="aspect-video bg-zinc-200 overflow-hidden border border-zinc-300">
                      <img
                        src={siteImages.zyloImage || '/zylo.webp'}
                        alt="Zylo preview"
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).src = '/zylo.webp')}
                      />
                    </div>
                  </div>

                  {/* Trufin */}
                  <div className="border border-zinc-200 p-4 bg-zinc-50/50 space-y-3">
                    <label className="block text-xs font-bold text-zinc-800">Trufin Cover Image</label>
                    <input
                      type="text"
                      value={siteImages.trufinImage || ''}
                      onChange={(e) => setSiteImages({ ...siteImages, trufinImage: e.target.value })}
                      placeholder="/trufin.webp atau URL"
                      className="w-full text-xs font-mono-code p-2 bg-white border border-zinc-200 focus:border-zinc-900 outline-hidden"
                    />
                    <div className="aspect-video bg-zinc-200 overflow-hidden border border-zinc-300">
                      <img
                        src={siteImages.trufinImage || '/trufin.webp'}
                        alt="Trufin preview"
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).src = '/trufin.webp')}
                      />
                    </div>
                  </div>

                  {/* Krig Studio */}
                  <div className="border border-zinc-200 p-4 bg-zinc-50/50 space-y-3">
                    <label className="block text-xs font-bold text-zinc-800">Krig Studio Cover Image</label>
                    <input
                      type="text"
                      value={siteImages.krigstudioImage || ''}
                      onChange={(e) => setSiteImages({ ...siteImages, krigstudioImage: e.target.value })}
                      placeholder="/krigstudio.webp atau URL"
                      className="w-full text-xs font-mono-code p-2 bg-white border border-zinc-200 focus:border-zinc-900 outline-hidden"
                    />
                    <div className="aspect-video bg-zinc-200 overflow-hidden border border-zinc-300">
                      <img
                        src={siteImages.krigstudioImage || '/krigstudio.webp'}
                        alt="Krig studio preview"
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).src = '/krigstudio.webp')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingImages}
                  className="flex items-center gap-2 text-xs font-mono-code px-6 py-3 bg-zinc-900 hover:bg-black text-white transition-colors disabled:opacity-50"
                >
                  {isSavingImages ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Semua Pengaturan Gambar
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
        </div>
      </div>

      {/* MODAL: ADD / EDIT PROJECT */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-zinc-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-900 font-mono-code lowercase">
                [{editingProject.id ? 'edit proyek' : 'tambah proyek baru'}]
              </h3>
              <button
                onClick={() => {
                  setIsProjectModalOpen(false);
                  setEditingProject(null);
                }}
                className="text-zinc-400 hover:text-zinc-700 text-xs font-mono-code"
              >
                ✕ tutup
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono-code text-zinc-600 mb-1">Judul Proyek *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    placeholder="nama proyek | tagline"
                    className="w-full text-xs font-mono-code p-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-zinc-600 mb-1">Kategori *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.category || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    placeholder="SaaS / Web App / Mobile"
                    className="w-full text-xs font-mono-code p-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-zinc-600 mb-1">Tahun</label>
                  <input
                    type="text"
                    value={editingProject.year || '2025'}
                    onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                    placeholder="2025"
                    className="w-full text-xs font-mono-code p-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-zinc-600 mb-1">Client / Klien</label>
                  <input
                    type="text"
                    value={editingProject.client || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                    placeholder="Nama Klien atau Startup"
                    className="w-full text-xs font-mono-code p-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono-code text-zinc-600 mb-1">Deskripsi Proyek *</label>
                <textarea
                  required
                  rows={3}
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="Jelaskan gambaran umum proyek, arsitektur, dan nilai inovasinya..."
                  className="w-full text-xs font-mono-code p-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono-code text-zinc-600 mb-1">URL Gambar Sampul (Image URL)</label>
                  <input
                    type="text"
                    value={editingProject.imageUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, imageUrl: e.target.value })}
                    placeholder="/zylo.webp atau https://..."
                    className="w-full text-xs font-mono-code p-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-zinc-600 mb-1">URL Live Preview (Website Link)</label>
                  <input
                    type="text"
                    value={editingProject.liveUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full text-xs font-mono-code p-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-zinc-600 mb-1">Teknologi Digunakan (Tech)</label>
                  <input
                    type="text"
                    value={editingProject.tech || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, tech: e.target.value })}
                    placeholder="React, TypeScript, Tailwind, Node.js"
                    className="w-full text-xs font-mono-code p-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-zinc-600 mb-1">Peran Anda (Role)</label>
                  <input
                    type="text"
                    value={editingProject.role || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })}
                    placeholder="Lead Architect & Frontend Engineer"
                    className="w-full text-xs font-mono-code p-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsProjectModalOpen(false);
                    setEditingProject(null);
                  }}
                  className="px-4 py-2 border border-zinc-200 text-xs font-mono-code text-zinc-600 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-mono-code flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
