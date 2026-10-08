import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient, Db, ObjectId } from 'mongodb';
import http from 'http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// STANDARD CONNECTION STRING - Fixes Render DNS Lookup completely by hitting nodes directly
const mongoURI = "mongodb://projectfinance94_db_user:cNJ9FA1AlUxsoM4m@cluster0-shard-00-00.qdrozb.mongodb.net:27017,cluster0-shard-00-01.qdrozb.mongodb.net:27017,cluster0-shard-00-02.qdrozb.mongodb.net:27017/sample_mflix?ssl=true&replicaSet=atlas-13o89r-shard-0&authSource=admin&retryWrites=true&w=majority";

let db: Db | null = null;
let client: MongoClient | null = null;

let siteSettings = {
  adminPassword: "AdminSecure@2026",
  whatsappNumber: "00963900000000",
  dailyLimitPerUser: 4,
  watermarkEnabled: false,
  retentionHours: 24
};

async function connectDatabase() {
  try {
    console.log('Initiating direct cluster node connection to MongoDB Atlas...');
    client = new MongoClient(mongoURI);
    await client.connect();
    
    // Binding directly to your live database container from your screenshot
    db = client.db('sample_mflix'); 
    console.log('SUCCESS: Active database tunnel established with catalog: sample_mflix');
    
    const configColl = db.collection('config');
    const savedConfig = await configColl.findOne({});
    if (!savedConfig) {
      await configColl.insertOne(siteSettings);
    } else {
      siteSettings = { ...siteSettings, ...savedConfig as any };
    }
  } catch (err: any) {
    console.error('CRITICAL MONGO PIPELINE FAILURE:', err.message);
    db = null;
  }
}

// ----------------------------------------------------
// NATIVE ANTI-SLEEP TRIGGER (RUNS INTERNALLY EVERY 10 MINUTES)
// ----------------------------------------------------
setInterval(() => {
  if (process.env.NODE_ENV === 'production' && process.env.APP_URL) {
    http.get(`${process.env.APP_URL}/api/system/keep-alive`, (res) => {
      console.log(`[Anti-Sleep]: Sync check responded: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('[Anti-Sleep]: Trigger connection dropped:', err.message);
    });
  }
}, 10 * 60 * 1000);

app.get('/api/system/keep-alive', (req: Request, res: Response) => {
  res.json({ status: "alive", tracked: false });
});

// ----------------------------------------------------
// SYSTEM CMS MANAGEMENT PLATFORM CHANNELS
// ----------------------------------------------------
app.post('/api/admin/reset-all-analytics', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { masterPassword } = req.body;
  if (masterPassword !== siteSettings.adminPassword) return res.status(401).json({ error: "Unauthorized." });
  
  await db.collection('videos').deleteMany({});
  await db.collection('analytics').deleteMany({});
  await db.collection('users').deleteMany({ role: { '\$ne': 'admin' } });
  res.json({ success: true });
});

app.post('/api/admin/update-settings', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { newPassword, whatsappNumber, dailyLimit } = req.body;
  const updateFields: any = {};
  if (newPassword && newPassword.trim().length >= 4) { siteSettings.adminPassword = newPassword.trim(); updateFields.adminPassword = siteSettings.adminPassword; }
  if (whatsappNumber !== undefined) { siteSettings.whatsappNumber = whatsappNumber.trim(); updateFields.whatsappNumber = siteSettings.whatsappNumber; }
  if (dailyLimit !== undefined) { siteSettings.dailyLimitPerUser = Number(dailyLimit); updateFields.dailyLimitPerUser = siteSettings.dailyLimitPerUser; }
  await db.collection('config').updateOne({}, { '\$set': updateFields }, { upsert: true });
  res.json({ success: true, settings: siteSettings });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { email, password } = req.body;
  const user = await db.collection('users').findOne({ email: email.toLowerCase(), password });
  if (!user) return res.status(401).json({ error: 'Invalid login.' });
  await db.collection('users').updateOne({ _id: user._id }, { '\$set': { lastLoginAt: new Date().toISOString() } });
  res.json({ success: true, user });
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { name, email, password } = req.body;
  const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ error: 'Identity operational.' });
  const newUser = { name, email: email.toLowerCase(), password, createdAt: new Date().toISOString(), role: 'user', isBanned: false, dailyGenerationsCount: 0, lastGenerationDate: new Date().toISOString().split('T') };
  const result = await db.collection('users').insertOne(newUser);
  res.json({ success: true, user: { id: result.insertedId, name, email } });
});

app.get('/api/admin/stats', async (req: Request, res: Response) => {
  if (!db) return res.json({ totalUsers: 0, totalGenerations: 0, totalVisitors: 0, whatsappNumber: siteSettings.whatsappNumber });
  const totalUsers = await db.collection('users').countDocuments({ role: { '\$ne': 'admin' } });
  const totalVideos = await db.collection('videos').countDocuments({});
  res.json({ totalUsers, totalGenerations: totalVideos, totalVisitors: totalUsers * 2, whatsappNumber: siteSettings.whatsappNumber });
});

app.get('/api/admin/users', async (req: Request, res: Response) => {
  if (!db) return res.json([]);
  const users = await db.collection('users').find({}).toArray();
  res.json(users.map(u => ({ id: u._id, ...u })));
});

app.post('/api/admin/users/ban', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { userId, isBanned } = req.body;
  await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { '\$set': { isBanned: Boolean(isBanned) } });
  res.json({ success: true });
});

app.get('/api/site/config', (req: Request, res: Response) => {
  res.json({
    mongoStatus: db ? "connected" : "disconnected",
    whatsappNumber: siteSettings.whatsappNumber,
    dailyLimitPerUser: siteSettings.dailyLimitPerUser
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// INVOKES SERVER PROCESS LOGIC AND STABILIZES HANDSHAKE AUTOMATICALLY ON BOOT
app.listen(PORT, async () => {
  console.log(`Active server operating on network node port: ${PORT}`);
  await connectDatabase();
});
