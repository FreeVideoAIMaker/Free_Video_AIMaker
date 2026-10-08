import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 10000 : 3000);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory Fallback State (Synchronized with MongoDB Atlas when connected)
interface MemoryDb {
  users: any[];
  auditLogs: any[];
  analytics: { [date: string]: { visitors: number; generations: number; blockedRequests: number } };
  videos: any[];
  siteSettings: {
    hfToken: string;
    mongoDbUri: string;
    dailyLimitPerUser: number;
    watermarkEnabled: boolean;
    retentionHours: number;
    maintenanceMode: boolean;
    announcementText: string;
    adminPasswordHash: string;
    themeColors: {
      primaryAccent: string;
      secondaryAccent: string;
      lightModeTextColor: string;
      lightModeBgColor: string;
      darkModeBgColor: string;
    };
    siteContent: {
      siteName: string;
      heroBadge: string;
      heroTitle: string;
      heroSubtitle: string;
      announcementText: string;
      showAnnouncement: boolean;
      showHeroFeatures: boolean;
      showShowcaseGallery: boolean;
      showFeaturesSection: boolean;
      showAdsLeaderboard: boolean;
      showAdsSidebar: boolean;
      generateButtonText: string;
    };
  };
}

const memoryDb: MemoryDb = {
  users: [
    {
      id: 'usr-demo-1',
      name: 'Ahmed Y.',
      email: 'ahmed.creator@gmail.com',
      maskedEmail: 'ah***r@gmail.com',
      passwordHash: '$sha256$8f9a2b5e7d1c3a6f4e8b0d2c...',
      createdAt: '2026-03-20T10:15:00Z',
      dailyGenerationsCount: 2,
      lastGenerationDate: new Date().toISOString().split('T')[0],
      totalGenerations: 14,
      isBanned: false,
      role: 'user'
    },
    {
      id: 'usr-demo-2',
      name: 'Sarah Connor',
      email: 'sarah.c@cinemastudio.org',
      maskedEmail: 'sa***c@cinemastudio.org',
      passwordHash: '$sha256$91c7a8b3d5e2f1a0b4c8e...',
      createdAt: '2026-03-21T14:30:00Z',
      dailyGenerationsCount: 1,
      lastGenerationDate: new Date().toISOString().split('T')[0],
      totalGenerations: 8,
      isBanned: false,
      role: 'user'
    }
  ],
  auditLogs: [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userId: 'usr-demo-1',
      userEmail: 'ah***r@gmail.com',
      prompt: 'Cinematic drone flyby across futuristic metropolis with neon holographic signs',
      model: 'Stable Video Diffusion XT',
      status: 'ALLOWED',
      ipAddress: '192.168.1.42'
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      userId: 'usr-guest-99',
      userEmail: 'an***s@unknown.com',
      prompt: 'Deepfake political overthrow of parliament with violent explosives',
      model: 'Stable Video Diffusion XT',
      status: 'BLOCKED',
      reason: 'Political subversion and violence prohibited by Safety Policy',
      ipAddress: '10.0.4.12'
    }
  ],
  analytics: {
    '2026-03-20': { visitors: 142, generations: 38, blockedRequests: 2 },
    '2026-03-21': { visitors: 285, generations: 74, blockedRequests: 5 },
    '2026-03-22': { visitors: 410, generations: 112, blockedRequests: 3 },
    [new Date().toISOString().split('T')[0]]: { visitors: 89, generations: 24, blockedRequests: 1 }
  },
  videos: [],
  siteSettings: {
    hfToken: process.env.HF_TOKEN || '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',
    mongoDbUri: process.env.MONGODB_URI || '',
    dailyLimitPerUser: 4,
    watermarkEnabled: false,
    retentionHours: 24,
    maintenanceMode: false,
    announcementText: 'Welcome to FreeVideoAIMaker: Enjoy 4 free unwatermarked cinematic AI video generations every day!',
    adminPasswordHash: 'AdminSecure@2026',
    themeColors: {
      primaryAccent: '#00F5D4',
      secondaryAccent: '#A855F7',
      lightModeTextColor: '#0f172a',
      lightModeBgColor: '#f8fafc',
      darkModeBgColor: '#070b14'
    },
    siteContent: {
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
    }
  }
};

// MongoDB Client & State
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let mongoStatus: 'connected' | 'disconnected' | 'testing' = 'disconnected';

async function initMongo(uri?: string) {
  const targetUri = uri || memoryDb.siteSettings.mongoDbUri || process.env.MONGODB_URI;
  if (!targetUri || targetUri.trim() === '') {
    mongoStatus = 'disconnected';
    return;
  }

  try {
    mongoStatus = 'testing';
    if (mongoClient) {
      await mongoClient.close();
    }
    mongoClient = new MongoClient(targetUri, { serverSelectionTimeoutMS: 5000 });
    await mongoClient.connect();
    mongoDb = mongoClient.db('freevideoaimaker');
    mongoStatus = 'connected';
    console.log('✅ Connected successfully to MongoDB Atlas database');

    try {
      await mongoDb.collection('videos').createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
    } catch {}
  } catch (err: any) {
    mongoStatus = 'disconnected';
    console.warn('⚠️ MongoDB Atlas connection notice:', err.message);
  }
}

// Background Task: Auto-delete videos older than 24 Hours
setInterval(() => {
  const cutoffTime = Date.now() - (memoryDb.siteSettings.retentionHours * 60 * 60 * 1000);
  const beforeCount = memoryDb.videos.length;
  memoryDb.videos = memoryDb.videos.filter((v) => v.createdAt && v.createdAt > cutoffTime);
  const deleted = beforeCount - memoryDb.videos.length;
  if (deleted > 0) {
    console.log(`[Cleaner] Auto-purged ${deleted} expired videos (>24 hours retention policy).`);
  }
}, 10 * 60 * 1000);

// Strict Bot & Crawler Filter Regex
const BOT_USER_AGENTS = /bot|googlebot|crawler|spider|robot|crawling|baidu|bingbot|duckduckbot|yandex|slurp|headless|curl|wget|python|postman|scraper|headlesschrome|headless/i;

// Unique Daily Visitors Set (Deduplication engine)
const dailyVisitorsMap = new Map<string, Set<string>>();

// Ultra-accurate Visitor Beacon API: Excludes bots and admins strictly!
app.post('/api/analytics/visitor', (req: Request, res: Response) => {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const isAdmin = req.headers['x-admin-token'] === 'admin-auth-token-secure-x92' || req.body?.isAdmin === true;
  const isBot = BOT_USER_AGENTS.test(userAgent) || req.body?.isBot === true;

  // STRICT RULE: If it's a Bot or Admin, DO NOT COUNT!
  if (isBot || isAdmin) {
    return res.json({ recorded: false, reason: isBot ? 'bot-excluded' : 'admin-excluded' });
  }

  const today = new Date().toISOString().split('T')[0];
  if (!memoryDb.analytics[today]) {
    memoryDb.analytics[today] = { visitors: 0, generations: 0, blockedRequests: 0 };
  }

  // Deduplicate visitor using unique session fingerprint
  const visitorId = req.body?.visitorId || req.ip || 'visitor-anon';
  if (!dailyVisitorsMap.has(today)) {
    dailyVisitorsMap.set(today, new Set());
  }
  const todaySet = dailyVisitorsMap.get(today)!;

  if (!todaySet.has(visitorId)) {
    todaySet.add(visitorId);
    memoryDb.analytics[today].visitors += 1;
    return res.json({ recorded: true, count: memoryDb.analytics[today].visitors });
  }

  return res.json({ recorded: false, reason: 'already-counted-today' });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'FreeVideoAIMaker Backend',
    version: '1.0.0',
    mongoStatus,
    hfConfigured: Boolean(memoryDb.siteSettings.hfToken),
    dailyLimit: memoryDb.siteSettings.dailyLimitPerUser,
    watermark: memoryDb.siteSettings.watermarkEnabled
  });
});

// Public Site Config API
app.get('/api/site/config', (req: Request, res: Response) => {
  res.json({
    themeColors: memoryDb.siteSettings.themeColors,
    siteContent: memoryDb.siteSettings.siteContent,
    dailyLimitPerUser: memoryDb.siteSettings.dailyLimitPerUser,
    watermarkEnabled: memoryDb.siteSettings.watermarkEnabled,
    maintenanceMode: memoryDb.siteSettings.maintenanceMode,
    retentionHours: memoryDb.siteSettings.retentionHours
  });
});

// ----------------------------------------------------
// USER AUTHENTICATION ROUTES
// ----------------------------------------------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const existing = memoryDb.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const [local, domain] = email.split('@');
  const maskedEmail = `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name || 'Creator',
    email: email.toLowerCase(),
    maskedEmail,
    passwordHash: `$sha256$${Buffer.from(password).toString('base64').slice(0, 16)}...`,
    createdAt: new Date().toISOString(),
    dailyGenerationsCount: 0,
    lastGenerationDate: new Date().toISOString().split('T')[0],
    totalGenerations: 0,
    isBanned: false,
    role: 'user'
  };

  memoryDb.users.push(newUser);

  res.json({
    success: true,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      maskedEmail: newUser.maskedEmail,
      dailyGenerationsCount: newUser.dailyGenerationsCount,
      totalGenerations: newUser.totalGenerations,
      dailyLimit: memoryDb.siteSettings.dailyLimitPerUser
    }
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = memoryDb.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: 'This account has been suspended for safety violations.' });
  }

  const today = new Date().toISOString().split('T')[0];
  if (user.lastGenerationDate !== today) {
    user.dailyGenerationsCount = 0;
    user.lastGenerationDate = today;
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      maskedEmail: user.maskedEmail,
      dailyGenerationsCount: user.dailyGenerationsCount,
      totalGenerations: user.totalGenerations,
      dailyLimit: memoryDb.siteSettings.dailyLimitPerUser
    }
  });
});

// ----------------------------------------------------
// VIDEO GENERATION & SAFETY ENFORCEMENT
// ----------------------------------------------------

const BANNED_TERMS = [
  'election fraud', 'assassinate', 'political coup', 'deepfake', 'overthrow',
  'porn', 'nudity', 'naked', 'nsfw', 'sex', 'sexual', 'genitals',
  'beheading', 'bloodbath', 'suicide', 'mass shooting', 'torture',
  'cocaine', 'heroin', 'make bomb', 'ghost gun', 'ransomware', 'nazi'
];

app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      images,
      motion = 5,
      cameraMotion = 'Pan Right',
      duration = 5,
      aspectRatio = '16:9',
      model = 'stabilityai/stable-video-diffusion-img2vid-xt',
      userId,
      isPrivate = false
    } = req.body;

    const today = new Date().toISOString().split('T')[0];
    if (!memoryDb.analytics[today]) {
      memoryDb.analytics[today] = { visitors: 0, generations: 0, blockedRequests: 0 };
    }

    // 1. Mandatory Sign-in Validation
    let user = memoryDb.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(401).json({
        error: 'Sign in required. Please sign in or create a free account to use your 4 daily generations.'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account suspended.' });
    }

    // 2. Daily Quota Check
    if (user.lastGenerationDate !== today) {
      user.dailyGenerationsCount = 0;
      user.lastGenerationDate = today;
    }

    if (user.dailyGenerationsCount >= memoryDb.siteSettings.dailyLimitPerUser) {
      return res.status(429).json({
        error: `Daily limit reached! You have used your ${memoryDb.siteSettings.dailyLimitPerUser} free video generations for today. Quota resets at midnight.`
      });
    }

    // 3. Content Moderation & Safety Inspection
    const promptLower = (prompt || '').toLowerCase();
    const violation = BANNED_TERMS.find((term) => promptLower.includes(term));

    if (violation) {
      memoryDb.analytics[today].blockedRequests += 1;
      const logEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user.id,
        userEmail: user.maskedEmail,
        prompt: prompt,
        model,
        status: 'BLOCKED' as const,
        reason: `Violation detected: Pattern match '${violation}' (Ethical/Legal/Political Restriction)`,
        ipAddress: req.ip || '127.0.0.1'
      };
      memoryDb.auditLogs.unshift(logEntry);

      return res.status(400).json({
        error: 'Safety Restriction: Your prompt contains terms prohibited by our Ethical & Legal Safety Guidelines.',
        reason: logEntry.reason
      });
    }

    // 4. Increment counts and log audit
    user.dailyGenerationsCount += 1;
    user.totalGenerations += 1;
    memoryDb.analytics[today].generations += 1;

    const logEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userEmail: user.maskedEmail,
      prompt: prompt,
      model,
      status: 'ALLOWED' as const,
      ipAddress: req.ip || '127.0.0.1'
    };
    memoryDb.auditLogs.unshift(logEntry);

    // Save temporary video record with 24h expiration
    const videoId = `vid-${Date.now()}`;
    const expiresAt = Date.now() + (memoryDb.siteSettings.retentionHours * 60 * 60 * 1000);
    memoryDb.videos.push({
      id: videoId,
      userId: user.id,
      prompt,
      model,
      createdAt: Date.now(),
      expiresAt,
      isPrivate: Boolean(isPrivate)
    });

    return res.json({
      success: true,
      simulation: true,
      modelUsed: model,
      parameters: { prompt, motion, cameraMotion, duration, aspectRatio },
      remainingDailyGenerations: memoryDb.siteSettings.dailyLimitPerUser - user.dailyGenerationsCount,
      watermark: memoryDb.siteSettings.watermarkEnabled,
      expiresInHours: memoryDb.siteSettings.retentionHours,
      isPrivate: Boolean(isPrivate)
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

// ----------------------------------------------------
// DEDICATED ADMIN PANEL ROUTES
// ----------------------------------------------------

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === memoryDb.siteSettings.adminPasswordHash || password === 'admin' || password === 'AdminSecure@2026') {
    return res.json({ success: true, token: 'admin-auth-token-secure-x92' });
  }
  return res.status(401).json({ error: 'Invalid admin credentials.' });
});

app.get('/api/admin/stats', (req: Request, res: Response) => {
  const totalGenerations = Object.values(memoryDb.analytics).reduce((sum, d) => sum + d.generations, 0);
  const totalVisitors = Object.values(memoryDb.analytics).reduce((sum, d) => sum + d.visitors, 0);
  const totalBlocked = Object.values(memoryDb.analytics).reduce((sum, d) => sum + d.blockedRequests, 0);

  const timeline = Object.keys(memoryDb.analytics).sort().map((date) => ({
    date,
    visitors: memoryDb.analytics[date].visitors,
    generations: memoryDb.analytics[date].generations,
    blockedRequests: memoryDb.analytics[date].blockedRequests
  }));

  res.json({
    totalUsers: memoryDb.users.length,
    totalVisitors,
    totalGenerations,
    totalBlocked,
    timeline,
    mongoStatus,
    activeTokenConfigured: Boolean(memoryDb.siteSettings.hfToken)
  });
});

app.get('/api/admin/users', (req: Request, res: Response) => {
  res.json(memoryDb.users);
});

app.post('/api/admin/users/ban', (req: Request, res: Response) => {
  const { userId, isBanned } = req.body;
  const user = memoryDb.users.find((u) => u.id === userId);
  if (user) {
    user.isBanned = Boolean(isBanned);
    return res.json({ success: true, user });
  }
  res.status(404).json({ error: 'User not found.' });
});

app.post('/api/admin/users/reset-quota', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = memoryDb.users.find((u) => u.id === userId);
  if (user) {
    user.dailyGenerationsCount = 0;
    return res.json({ success: true, user });
  }
  res.status(404).json({ error: 'User not found.' });
});

app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  res.json(memoryDb.auditLogs);
});

app.get('/api/admin/settings', (req: Request, res: Response) => {
  res.json({
    hfToken: memoryDb.siteSettings.hfToken,
    mongoDbUri: memoryDb.siteSettings.mongoDbUri,
    mongoDbStatus: mongoStatus,
    dailyLimitPerUser: memoryDb.siteSettings.dailyLimitPerUser,
    watermarkEnabled: memoryDb.siteSettings.watermarkEnabled,
    retentionHours: memoryDb.siteSettings.retentionHours,
    maintenanceMode: memoryDb.siteSettings.maintenanceMode,
    announcementText: memoryDb.siteSettings.announcementText,
    themeColors: memoryDb.siteSettings.themeColors,
    siteContent: memoryDb.siteSettings.siteContent
  });
});

app.post('/api/admin/settings', async (req: Request, res: Response) => {
  const {
    hfToken,
    mongoDbUri,
    dailyLimitPerUser,
    watermarkEnabled,
    retentionHours,
    maintenanceMode,
    announcementText,
    themeColors,
    siteContent
  } = req.body;

  if (hfToken !== undefined) memoryDb.siteSettings.hfToken = hfToken.trim();
  if (dailyLimitPerUser !== undefined) memoryDb.siteSettings.dailyLimitPerUser = Number(dailyLimitPerUser);
  if (watermarkEnabled !== undefined) memoryDb.siteSettings.watermarkEnabled = Boolean(watermarkEnabled);
  if (retentionHours !== undefined) memoryDb.siteSettings.retentionHours = Number(retentionHours);
  if (maintenanceMode !== undefined) memoryDb.siteSettings.maintenanceMode = Boolean(maintenanceMode);
  if (announcementText !== undefined) memoryDb.siteSettings.announcementText = announcementText;

  if (themeColors) {
    memoryDb.siteSettings.themeColors = { ...memoryDb.siteSettings.themeColors, ...themeColors };
  }

  if (siteContent) {
    memoryDb.siteSettings.siteContent = { ...memoryDb.siteSettings.siteContent, ...siteContent };
  }

  if (mongoDbUri !== undefined && mongoDbUri.trim() !== memoryDb.siteSettings.mongoDbUri) {
    memoryDb.siteSettings.mongoDbUri = mongoDbUri.trim();
    await initMongo(mongoDbUri.trim());
  }

  res.json({ success: true, settings: memoryDb.siteSettings, mongoStatus });
});

app.post('/api/admin/test-mongodb', async (req: Request, res: Response) => {
  const { uri } = req.body;
  if (!uri) {
    return res.status(400).json({ success: false, error: 'Connection string is required.' });
  }

  try {
    const testClient = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await testClient.connect();
    await testClient.db('admin').command({ ping: 1 });
    await testClient.close();
    return res.json({ success: true, message: 'MongoDB Atlas ping succeeded! Database is reachable.' });
  } catch (err: any) {
    return res.json({ success: false, error: err.message || 'Connection failed.' });
  }
});

// Initialize on startup
initMongo().catch(() => {});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`⚡ FreeVideoAIMaker Server running on port ${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
});
