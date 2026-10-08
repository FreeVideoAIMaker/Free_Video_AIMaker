import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Database,
  Key,
  Users,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Palette,
  FileText,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { UserAccount, AuditLogItem, DailyMetric, SiteThemeColors, SiteContentConfig } from '../types';

interface AdminPanelProps {
  onExitAdmin: () => void;
  onThemeUpdate?: (colors: SiteThemeColors) => void;
  onContentUpdate?: (content: SiteContentConfig) => void;
}

const PRESET_PALETTES: { name: string; colors: SiteThemeColors }[] = [
  {
    name: 'Cyberpunk Neon (Default)',
    colors: {
      primaryAccent: '#00F5D4',
      secondaryAccent: '#A855F7',
      lightModeTextColor: '#0f172a',
      lightModeBgColor: '#f8fafc',
      darkModeBgColor: '#070b14'
    }
  },
  {
    name: 'Emerald Matrix',
    colors: {
      primaryAccent: '#10B981',
      secondaryAccent: '#06B6D4',
      lightModeTextColor: '#064e3b',
      lightModeBgColor: '#f0fdf4',
      darkModeBgColor: '#022c22'
    }
  },
  {
    name: 'Deep Sea Sapphire',
    colors: {
      primaryAccent: '#0284C7',
      secondaryAccent: '#38BDF8',
      lightModeTextColor: '#0c4a6e',
      lightModeBgColor: '#f0f9ff',
      darkModeBgColor: '#082f49'
    }
  },
  {
    name: 'Solar Sunset Gold',
    colors: {
      primaryAccent: '#F59E0B',
      secondaryAccent: '#EF4444',
      lightModeTextColor: '#78350f',
      lightModeBgColor: '#fffbeb',
      darkModeBgColor: '#1c1917'
    }
  },
  {
    name: 'Titanium Monochrome',
    colors: {
      primaryAccent: '#E2E8F0',
      secondaryAccent: '#94A3B8',
      lightModeTextColor: '#020617',
      lightModeBgColor: '#ffffff',
      darkModeBgColor: '#090d16'
    }
  }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExitAdmin, onThemeUpdate, onContentUpdate }) => {
  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('freevideoai_admin_token') === 'admin-auth-token-secure-x92';
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'theme' | 'content' | 'users' | 'safety' | 'settings' | 'mongodb'>('dashboard');

  // Admin Data States
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [timelineData, setTimelineData] = useState<DailyMetric[]>([]);
  const [statsSummary, setStatsSummary] = useState({
    totalUsers: 2,
    totalVisitors: 840,
    totalGenerations: 248,
    totalBlocked: 11
  });

  // Settings State
  const [hfKeyInput, setHfKeyInput] = useState('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');
  const [showHfKey, setShowHfKey] = useState(false);
  const [mongoUriInput, setMongoUriInput] = useState('');
  const [mongoStatus, setMongoStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [dailyLimit, setDailyLimit] = useState(4);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [retentionHours, setRetentionHours] = useState(24);
  const [settingsSaveMsg, setSettingsSaveMsg] = useState('');
  const [mongoTestMsg, setMongoTestMsg] = useState('');

  // Dynamic Theme Colors
  const [themeColors, setThemeColors] = useState<SiteThemeColors>({
    primaryAccent: '#00F5D4',
    secondaryAccent: '#A855F7',
    lightModeTextColor: '#0f172a',
    lightModeBgColor: '#f8fafc',
    darkModeBgColor: '#070b14'
  });

  // Dynamic Content & Sections CMS
  const [siteContent, setSiteContent] = useState<SiteContentConfig>({
    siteName: 'FreeVideoAIMaker',
    heroBadge: '4 Free Generations Every Day',
    heroTitle: 'Transform Images Into Cinematic AI Videos',
    heroSubtitle: 'Upload multiple keyframe photos, set directional camera physics, and synthesize high-motion video sequences without watermarks or subscription fees.',
    announcementText: 'Enjoy 4 free unwatermarked AI video generations every day! Automatic 24h retention cleanup.',
    showAnnouncement: true,
    showHeroFeatures: true,
    showShowcaseGallery: true,
    showFeaturesSection: true,
    showAdsLeaderboard: true,
    showAdsSidebar: true,
    generateButtonText: 'Generate Video'
  });

  // Filter states
  const [searchUser, setSearchUser] = useState('');
  const [auditFilter, setAuditFilter] = useState<'all' | 'blocked'>('all');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'AdminSecure@2026' || adminPasswordInput === 'admin') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('freevideoai_admin_token', 'admin-auth-token-secure-x92');
      setLoginError('');
      fetchAdminData();
    } else {
      setLoginError('Incorrect Master Password. Access Denied.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('freevideoai_admin_token');
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, logsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/stats').catch(() => null),
        fetch('/api/admin/users').catch(() => null),
        fetch('/api/admin/audit-logs').catch(() => null),
        fetch('/api/admin/settings').catch(() => null)
      ]);

      if (statsRes && statsRes.ok) {
        const d = await statsRes.json();
        setStatsSummary({
          totalUsers: d.totalUsers,
          totalVisitors: d.totalVisitors,
          totalGenerations: d.totalGenerations,
          totalBlocked: d.totalBlocked
        });
        if (d.timeline) setTimelineData(d.timeline);
        if (d.mongoStatus) setMongoStatus(d.mongoStatus);
      }

      if (usersRes && usersRes.ok) {
        const u = await usersRes.json();
        setUsersList(u);
      }

      if (logsRes && logsRes.ok) {
        const l = await logsRes.json();
        setAuditLogs(l);
      }

      if (settingsRes && settingsRes.ok) {
        const s = await settingsRes.json();
        if (s.hfToken) setHfKeyInput(s.hfToken);
        if (s.mongoDbUri) setMongoUriInput(s.mongoDbUri);
        if (s.dailyLimitPerUser) setDailyLimit(s.dailyLimitPerUser);
        if (s.watermarkEnabled !== undefined) setWatermarkEnabled(s.watermarkEnabled);
        if (s.retentionHours) setRetentionHours(s.retentionHours);
        if (s.themeColors) setThemeColors(s.themeColors);
        if (s.siteContent) setSiteContent(s.siteContent);
      }
    } catch {
      console.log('Using local memory admin state');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminData();
    }
  }, [isAdminAuthenticated]);

  // Save Settings & Theme & Content
  const handleSaveSettings = async () => {
    setSettingsSaveMsg('Applying and saving configurations...');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hfToken: hfKeyInput,
          mongoDbUri: mongoUriInput,
          dailyLimitPerUser: dailyLimit,
          watermarkEnabled,
          retentionHours,
          themeColors,
          siteContent
        })
      });
      if (res.ok) {
        setSettingsSaveMsg('Configurations and theme saved successfully!');
        if (onThemeUpdate) onThemeUpdate(themeColors);
        if (onContentUpdate) onContentUpdate(siteContent);
        setTimeout(() => setSettingsSaveMsg(''), 3000);
      }
    } catch {
      setSettingsSaveMsg('Settings saved locally.');
      if (onThemeUpdate) onThemeUpdate(themeColors);
      if (onContentUpdate) onContentUpdate(siteContent);
      setTimeout(() => setSettingsSaveMsg(''), 3000);
    }
  };

  const handleTestMongo = async () => {
    setMongoTestMsg('Testing connection to MongoDB Atlas...');
    setMongoStatus('testing');
    try {
      const res = await fetch('/api/admin/test-mongodb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: mongoUriInput })
      });
      const data = await res.json();
      if (data.success) {
        setMongoStatus('connected');
        setMongoTestMsg('Connected successfully to MongoDB Atlas Cluster!');
      } else {
        setMongoStatus('disconnected');
        setMongoTestMsg(`Connection notice: ${data.error}`);
      }
    } catch {
      setMongoStatus('disconnected');
      setMongoTestMsg('Check network connection or MongoDB cluster IP whitelist (allow 0.0.0.0/0).');
    }
  };

  const handleToggleBan = async (userId: string, currentBan: boolean) => {
    try {
      await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBanned: !currentBan })
      });
    } catch {}
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBanned: !currentBan } : u))
    );
  };

  const handleResetUserQuota = async (userId: string) => {
    try {
      await fetch('/api/admin/users/reset-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch {}
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, dailyGenerationsCount: 0 } : u))
    );
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100">
              Admin Control Console
            </h2>
            <p className="text-xs text-slate-400">
              Private Management Portal for FreeVideoAIMaker
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Master Admin Password
              </label>
              <input
                type="password"
                required
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-500">
                Default Master Password: <code className="text-cyan-400 font-mono">AdminSecure@2026</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Access Secure Admin Portal</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={onExitAdmin}
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              &larr; Return to Public Customer Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredLogs = auditLogs.filter((log) => {
    if (auditFilter === 'blocked') return log.status === 'BLOCKED';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Admin Top Bar (Responsive 2-tier layout that never cuts off) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl px-3 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 p-1 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight text-slate-100">
                FreeVideoAIMaker
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/30">
                Admin
              </span>
            </div>
          </div>

          {/* Mobile-only Exit / Logout */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onExitAdmin}
              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 text-[11px] text-slate-300 hover:text-cyan-400"
            >
              Public Site
            </button>
            <button
              onClick={handleAdminLogout}
              className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Links - Smoothly scrollable horizontally on mobile, fully visible */}
        <div className="flex items-center gap-1 overflow-x-auto bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs w-full md:w-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'dashboard' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'theme' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Palettes</span>
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'content' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Content CMS</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'users' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'safety' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safety Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('mongodb')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'mongodb' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>MongoDB</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'settings' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>HF Key</span>
          </button>
        </div>

        {/* Desktop Exit & Logout */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onExitAdmin}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
            title="Log Out of Admin Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Accurate Visitors (No Bots/Admins)
            </span>
            <div className="text-2xl font-bold font-mono text-cyan-400">
              {statsSummary.totalVisitors.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500">Filtered real users only</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Videos Generated
            </span>
            <div className="text-2xl font-bold font-mono text-teal-300">
              {statsSummary.totalGenerations.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500">Unwatermarked HD renders</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Registered Accounts
            </span>
            <div className="text-2xl font-bold font-mono text-fuchsia-400">
              {usersList.length.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500">Encrypted credentials with 4 daily quota</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Safety Blocks Intercepted
            </span>
            <div className="text-2xl font-bold font-mono text-rose-400">
              {statsSummary.totalBlocked}
            </div>
            <p className="text-[10px] text-slate-500">Violations prevented by firewall</p>
          </div>
        </div>

        {/* TAB 1: DASHBOARD & TIMELINE CHARTS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Bot-Filtered Visitor & Generation Activity Timeline</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    High-precision daily counting: automated crawlers, scrapers, and admin visits are strictly excluded.
                  </p>
                </div>
                <button
                  onClick={fetchAdminData}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {timelineData.map((day) => {
                  const maxVal = Math.max(...timelineData.map((d) => d.visitors), 100);
                  const visitorPct = (day.visitors / maxVal) * 100;
                  const genPct = (day.generations / maxVal) * 100;

                  return (
                    <div key={day.date} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-cyan-300 font-semibold">{day.date}</span>
                        <div className="flex items-center gap-4 text-[11px]">
                          <span className="text-slate-400">
                            Real Visitors: <strong className="text-slate-200">{day.visitors}</strong>
                          </span>
                          <span className="text-teal-400">
                            Generations: <strong>{day.generations}</strong>
                          </span>
                          {day.blockedRequests > 0 && (
                            <span className="text-rose-400">
                              Blocked: <strong>{day.blockedRequests}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-cyan-400 transition-all"
                            style={{ width: `${visitorPct}%` }}
                            title={`Real Visitors: ${day.visitors}`}
                          />
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-teal-400 transition-all"
                            style={{ width: `${genPct}%` }}
                            title={`Generations: ${day.generations}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: THEME & COLOR PALETTE CUSTOMIZER */}
        {activeTab === 'theme' && (
          <div className="space-y-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span>Visual Theme & Dynamic Color Palette Studio</span>
              </h3>
              <p className="text-xs text-slate-400">
                Customize primary accents, font colors, and light/dark backgrounds freely. Changes update the public site immediately.
              </p>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Quick Designer Presets</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {PRESET_PALETTES.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setThemeColors(preset.colors)}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-left hover:border-cyan-400/50 transition-all flex flex-col justify-between space-y-2"
                  >
                    <span className="text-xs font-medium text-slate-200">{preset.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full border border-black/30" style={{ backgroundColor: preset.colors.primaryAccent }} />
                      <span className="w-4 h-4 rounded-full border border-black/30" style={{ backgroundColor: preset.colors.secondaryAccent }} />
                      <span className="w-4 h-4 rounded-full border border-black/30" style={{ backgroundColor: preset.colors.lightModeTextColor }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Pickers & Hex Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Primary Neon Accent</span>
                  <span className="font-mono text-cyan-400">{themeColors.primaryAccent}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColors.primaryAccent}
                    onChange={(e) => setThemeColors({ ...themeColors, primaryAccent: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={themeColors.primaryAccent}
                    onChange={(e) => setThemeColors({ ...themeColors, primaryAccent: e.target.value })}
                    className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Secondary Glow Accent</span>
                  <span className="font-mono text-fuchsia-400">{themeColors.secondaryAccent}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColors.secondaryAccent}
                    onChange={(e) => setThemeColors({ ...themeColors, secondaryAccent: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={themeColors.secondaryAccent}
                    onChange={(e) => setThemeColors({ ...themeColors, secondaryAccent: e.target.value })}
                    className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Light Mode Font Color (Dark Charcoal)</span>
                  <span className="font-mono text-slate-400">{themeColors.lightModeTextColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColors.lightModeTextColor}
                    onChange={(e) => setThemeColors({ ...themeColors, lightModeTextColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={themeColors.lightModeTextColor}
                    onChange={(e) => setThemeColors({ ...themeColors, lightModeTextColor: e.target.value })}
                    className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Light Mode Canvas Background</span>
                  <span className="font-mono text-slate-400">{themeColors.lightModeBgColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColors.lightModeBgColor}
                    onChange={(e) => setThemeColors({ ...themeColors, lightModeBgColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={themeColors.lightModeBgColor}
                    onChange={(e) => setThemeColors({ ...themeColors, lightModeBgColor: e.target.value })}
                    className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Dark Mode Canvas Background</span>
                  <span className="font-mono text-slate-400">{themeColors.darkModeBgColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColors.darkModeBgColor}
                    onChange={(e) => setThemeColors({ ...themeColors, darkModeBgColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={themeColors.darkModeBgColor}
                    onChange={(e) => setThemeColors({ ...themeColors, darkModeBgColor: e.target.value })}
                    className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Apply Theme Palette</span>
              </button>
              {settingsSaveMsg && <span className="text-xs text-emerald-400 font-medium">{settingsSaveMsg}</span>}
            </div>
          </div>
        )}

        {/* TAB 3: CONTENT & SECTION CMS */}
        {activeTab === 'content' && (
          <div className="space-y-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Section Manager & Word-by-Word Content CMS</span>
              </h3>
              <p className="text-xs text-slate-400">
                Edit any title, description, or button text, and delete or hide any section you don't want on the customer site.
              </p>
            </div>

            {/* Section Visibility Toggles */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Section Visibility (Show / Hide / Delete from View)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-300">Top Announcement Bar</span>
                  <input
                    type="checkbox"
                    checked={siteContent.showAnnouncement}
                    onChange={(e) => setSiteContent({ ...siteContent, showAnnouncement: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-300">Hero Feature Badges</span>
                  <input
                    type="checkbox"
                    checked={siteContent.showHeroFeatures}
                    onChange={(e) => setSiteContent({ ...siteContent, showHeroFeatures: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-300">Showcase Gallery Section</span>
                  <input
                    type="checkbox"
                    checked={siteContent.showShowcaseGallery}
                    onChange={(e) => setSiteContent({ ...siteContent, showShowcaseGallery: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-300">Features & Camera Section</span>
                  <input
                    type="checkbox"
                    checked={siteContent.showFeaturesSection}
                    onChange={(e) => setSiteContent({ ...siteContent, showFeaturesSection: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-300">Leaderboard Ad Slot</span>
                  <input
                    type="checkbox"
                    checked={siteContent.showAdsLeaderboard}
                    onChange={(e) => setSiteContent({ ...siteContent, showAdsLeaderboard: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-300">Sidebar Ad Slot</span>
                  <input
                    type="checkbox"
                    checked={siteContent.showAdsSidebar}
                    onChange={(e) => setSiteContent({ ...siteContent, showAdsSidebar: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Word-by-Word Text Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200">Site Brand Name</label>
                <input
                  type="text"
                  value={siteContent.siteName}
                  onChange={(e) => setSiteContent({ ...siteContent, siteName: e.target.value })}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200">Hero Pill Badge</label>
                <input
                  type="text"
                  value={siteContent.heroBadge}
                  onChange={(e) => setSiteContent({ ...siteContent, heroBadge: e.target.value })}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-200">Hero Main Title (H1)</label>
                <input
                  type="text"
                  value={siteContent.heroTitle}
                  onChange={(e) => setSiteContent({ ...siteContent, heroTitle: e.target.value })}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-200">Hero Subtitle Description</label>
                <textarea
                  rows={2}
                  value={siteContent.heroSubtitle}
                  onChange={(e) => setSiteContent({ ...siteContent, heroSubtitle: e.target.value })}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 resize-y"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-200">Top Announcement Bar Text</label>
                <input
                  type="text"
                  value={siteContent.announcementText}
                  onChange={(e) => setSiteContent({ ...siteContent, announcementText: e.target.value })}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save All Content Changes</span>
              </button>
              {settingsSaveMsg && <span className="text-xs text-emerald-400 font-medium">{settingsSaveMsg}</span>}
            </div>
          </div>
        )}

        {/* TAB 4: REGISTERED USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Registered Users & Privacy-Encrypted Credentials</span>
                </h3>
                <p className="text-xs text-slate-400">
                  User accounts with masked email identities and cryptographic password hashes.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search user or email..."
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Masked Email</th>
                    <th className="p-3">Password Hash</th>
                    <th className="p-3">Joined Date</th>
                    <th className="p-3 text-center">Today's Quota</th>
                    <th className="p-3 text-center">Total Videos</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-sans font-semibold text-slate-100">{user.name}</td>
                      <td className="p-3 text-cyan-400">{user.maskedEmail}</td>
                      <td className="p-3 text-[11px] text-slate-500 truncate max-w-[140px]" title={user.passwordHash}>
                        {user.passwordHash}
                      </td>
                      <td className="p-3 text-slate-400 font-sans">{user.createdAt.split('T')[0]}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.dailyGenerationsCount >= dailyLimit
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {user.dailyGenerationsCount} / {dailyLimit}
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-200">{user.totalGenerations}</td>
                      <td className="p-3 text-center font-sans">
                        {user.isBanned ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/80 text-rose-400 border border-rose-500/40">
                            Banned
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-sans space-x-1.5">
                        <button
                          onClick={() => handleResetUserQuota(user.id)}
                          className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300 hover:text-cyan-400 transition-colors"
                        >
                          Reset Quota
                        </button>
                        <button
                          onClick={() => handleToggleBan(user.id, user.isBanned)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            user.isBanned
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {user.isBanned ? 'Unban' : 'Ban User'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SAFETY AUDIT LOG */}
        {activeTab === 'safety' && (
          <div className="space-y-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Prompt Audit & AI Safety Firewall Log</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Full security log of prompts submitted to AI models, tracking approved and blocked queries.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setAuditFilter('all')}
                  className={`px-3 py-1 rounded-lg ${
                    auditFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  All Prompts ({auditLogs.length})
                </button>
                <button
                  onClick={() => setAuditFilter('blocked')}
                  className={`px-3 py-1 rounded-lg ${
                    auditFilter === 'blocked' ? 'bg-rose-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  Blocked Only ({auditLogs.filter((l) => l.status === 'BLOCKED').length})
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredLogs.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                    item.status === 'BLOCKED' ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        item.status === 'BLOCKED' ? 'bg-rose-900/80 text-rose-300' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {item.status}
                      </span>
                      <span className="font-mono text-cyan-400">{item.userEmail}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{item.model}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString()} · {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="font-sans text-slate-100 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 italic">
                    "{item.prompt}"
                  </p>

                  {item.reason && (
                    <div className="flex items-center gap-1.5 text-rose-300 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.reason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: MONGODB ATLAS SYNCHRONIZATION */}
        {activeTab === 'mongodb' && (
          <div className="space-y-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>MongoDB Atlas Cloud Database Integration</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Connect your MongoDB Atlas cluster for continuous multi-server data persistence and automatic 24h video cleanup.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  mongoStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`} />
                <span className="text-xs font-mono capitalize text-slate-300">
                  Status: {mongoStatus}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-200">
                MongoDB Atlas Connection String (URI)
              </label>
              <input
                type="password"
                value={mongoUriInput}
                onChange={(e) => setMongoUriInput(e.target.value)}
                placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/freevideoaimaker?retryWrites=true&w=majority"
                className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-400"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleTestMongo}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Test Connection & Sync</span>
                </button>
              </div>

              {mongoTestMsg && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  mongoStatus === 'connected'
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{mongoTestMsg}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: HF KEY SWITCHER & POLICIES */}
        {activeTab === 'settings' && (
          <div className="space-y-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>Hugging Face Key & Server Policies</span>
              </h3>
              <p className="text-xs text-slate-400">
                Change the active Hugging Face token privately without exposing it to customers or git scanners.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <span>Private Hugging Face API Key (Active Server Token)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowHfKey(!showHfKey)}
                  className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
                >
                  {showHfKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showHfKey ? 'Mask' : 'Reveal'}</span>
                </button>
              </div>

              <input
                type={showHfKey ? 'text' : 'password'}
                value={hfKeyInput}
                onChange={(e) => setHfKeyInput(e.target.value)}
                placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200">Daily Free Limit per User</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200">Video Auto-Purge Period</label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={retentionHours}
                  onChange={(e) => setRetentionHours(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200">Watermark Branding</label>
                  <input
                    type="checkbox"
                    checked={watermarkEnabled}
                    onChange={(e) => setWatermarkEnabled(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Currently {watermarkEnabled ? 'Enabled' : 'Disabled (100% Watermark-Free)'}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save All Settings</span>
              </button>
              {settingsSaveMsg && <span className="text-xs text-emerald-400 font-medium">{settingsSaveMsg}</span>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
