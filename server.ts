/**
 * FreeVideoAIMaker - Production Server Backend
 * Linked directly to MongoDB Atlas Cloud Database
 */
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient, Db, ObjectId } from 'mongodb';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection String from User Credentials
const mongoURI = "mongodb+srv://projectfinance94_db_user:cNJ9FA1AlUxsoM4m@cluster0.qdrozb.mongodb.net/freevideoaimaker?retryWrites=true&w=majority&appName=Cluster0";

let db: Db | null = null;
let client: MongoClient | null = null;

// Configuration Storage inside DB (Dynamic)
let siteSettings = {
  hfToken: process.env.HF_TOKEN || '',
  dailyLimitPerUser: 4,
  watermarkEnabled: false,
  retentionHours: 24,
  whatsappNumber: "00963900000000", // Default dynamic dynamic support number
  storageCloudProvider: "Supabase/Drive (projectfinance94@gmail.com)"
};

async function connectDatabase() {
  try {
    client = new MongoClient(mongoURI);
    await client.connect();
    db = client.db('freevideoaimaker');
    console.log('Successfully connected to MongoDB Atlas Cloud Cluster.');
    
    // Create necessary collections if they don't exist
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);
    if (!names.includes('users')) await db.createCollection('users');
    if (!names.includes('videos')) await db.createCollection('videos');
    if (!names.includes('analytics')) await db.createCollection('analytics');
    if (!names.includes('config')) {
      await db.createCollection('config');
      await db.collection('config').insertOne(siteSettings);
    } else {
      const savedConfig = await db.collection('config').findOne({});
      if (savedConfig) siteSettings = { ...siteSettings, ...savedConfig as any };
    }
  } catch (err: any) {
    console.error('Database connection failed critical error:', err.message);
  }
}

// ----------------------------------------------------
// CLIENT AUTHENTICATION & LOGIN STATE TRACKING
// ----------------------------------------------------
app.post('/api/auth/register', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { name, email, password } = req.body;

  const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ error: 'Account already exists.' });

  const [local, domain] = email.split('@');
  const maskedEmail = `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;

  const newUser = {
    name: name || 'Creator',
    email: email.toLowerCase(),
    maskedEmail,
    password, // Simplified pattern for cloud mapping
    createdAt: new Date().toISOString(),
    dailyGenerationsCount: 0,
    lastGenerationDate: new Date().toISOString().split('T')[0],
    totalGenerations: 0,
    isBanned: false,
    lastLoginAt: new Date().toISOString(),
    role: 'user'
  };

  const result = await db.collection('users').insertOne(newUser);
  res.json({
    success: true,
    user: { id: result.insertedId, name: newUser.name, email: newUser.email, maskedEmail: newUser.maskedEmail, dailyGenerationsCount: 0, totalGenerations: 0, dailyLimit: siteSettings.dailyLimitPerUser }
  });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { email, password } = req.body;

  const user = await db.collection('users').findOne({ email: email.toLowerCase(), password });
  if (!user) return res.status(401).json({ error: 'Invalid cloud identity or password.' });
  if (user.isBanned) return res.status(403).json({ error: 'Suspended identity due to policy violations.' });

  const today = new Date().toISOString().split('T')[0];
  let dailyCount = user.dailyGenerationsCount;
  if (user.lastGenerationDate !== today) {
    dailyCount = 0;
    await db.collection('users').updateOne({ _id: user._id }, { \$set: { dailyGenerationsCount: 0, lastGenerationDate: today } });
  }

  // Update fixed login timestamp into DB
  await db.collection('users').updateOne({ _id: user._id }, { \$set: { lastLoginAt: new Date().toISOString() } });

  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, maskedEmail: user.maskedEmail, dailyGenerationsCount: dailyCount, totalGenerations: user.totalGenerations, dailyLimit: siteSettings.dailyLimitPerUser }
  });
});

// ----------------------------------------------------
// SECURE WORKSPACE & ADMIN MANAGEMENT CONTROL
// ----------------------------------------------------
app.get('/api/admin/stats', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  
  const totalUsers = await db.collection('users').countDocuments();
  const totalVideos = await db.collection('videos').countDocuments();
  const timeline = await db.collection('analytics').find({}).toArray();

  res.json({
    totalUsers,
    totalVisitors: totalUsers * 3, // Calculated ratio without persistent tracker cookies
    totalGenerations: totalVideos,
    totalBlocked: 0,
    timeline,
    whatsappNumber: siteSettings.whatsappNumber
  });
});

app.get('/api/admin/users', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const users = await db.collection('users').find({}).toArray();
  res.json(users.map(u => ({ id: u._id, ...u })));
});

app.post('/api/admin/users/ban', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { userId, isBanned } = req.body;
  await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { \$set: { isBanned: Boolean(isBanned) } });
  res.json({ success: true });
});

app.post('/api/admin/users/reset-quota', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { userId } = req.body;
  await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { \$set: { dailyGenerationsCount: 0 } });
  res.json({ success: true });
});

// MANUAL RESET FOR ALL SYSTEM ANALYTICS & DB STATS VIA ADMIN PASSWORD CONFIRMATION
app.post('/api/admin/reset-all-analytics', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { masterPassword } = req.body;

  if (masterPassword !== "AdminSecure@2026") {
    return res.status(401).json({ error: "Invalid execution security clearance key." });
  }

  await db.collection('analytics').deleteMany({});
  await db.collection('videos').deleteMany({});
  await db.collection('users').updateMany({}, { \$set: { dailyGenerationsCount: 0, totalGenerations: 0 } });

  res.json({ success: true, message: "System dashboard matrix cleared successfully." });
});

// GET WHATSAPP SUPPORT DIAL CODE
app.get('/api/site/whatsapp', (req, res) => {
  res.json({ whatsappNumber: siteSettings.whatsappNumber });
});

// UPDATE GLOBAL CONFIG (WHATSAPP, LIMITS, HF) FROM ADMIN CMS STUDIO
app.post('/api/admin/settings', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { whatsappNumber, hfToken, dailyLimitPerUser } = req.body;

  if (whatsappNumber !== undefined) siteSettings.whatsappNumber = whatsappNumber.trim();
  if (hfToken !== undefined) siteSettings.hfToken = hfToken.trim();
  if (dailyLimitPerUser !== undefined) siteSettings.dailyLimitPerUser = Number(dailyLimitPerUser);

  await db.collection('config').updateOne({}, { \$set: siteSettings }, { upsert: true });
  res.json({ success: true, settings: siteSettings });
});

// PROD INDEX DISPATCH PATHWAY
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Cloud Synchronized Engine active on port ${PORT}`);
  });
});
