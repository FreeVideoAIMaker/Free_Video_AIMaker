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

// MongoDB Atlas URI Cloud String Connection Matrix
const mongoURI = "mongodb+srv://projectfinance94_db_user:cNJ9FA1AlUxsoM4m@cluster0.qdrozb.mongodb.net/freevideoaimaker?retryWrites=true&w=majority&appName=Cluster0";

let db: Db | null = null;
let client: MongoClient | null = null;

let siteSettings = {
  adminPassword: "AdminSecure@2026",
  whatsappNumber: "00963900000000",
  dailyLimitPerUser: 4,
  supabaseUrl: "https://supabase.co", // Dynamic Cloud Storage Endpoint linked with projectfinance94@gmail.com
  supabaseKey: ""
};

async function connectDatabase() {
  try {
    client = new MongoClient(mongoURI);
    await client.connect();
    db = client.db('freevideoaimaker');
    console.log('SUCCESS: Connection stable with MongoDB Atlas.');
    
    const configColl = db.collection('config');
    const savedConfig = await configColl.findOne({});
    if (!savedConfig) {
      await configColl.insertOne(siteSettings);
    } else {
      siteSettings = { ...siteSettings, ...savedConfig as any };
    }
  } catch (err: any) {
    console.error('Database connection crash:', err.message);
    db = null;
  }
}

// ----------------------------------------------------
// ANTI-SLEEP KEEP-ALIVE LOOP (EVERY 10 MINUTES)
// ----------------------------------------------------
setInterval(() => {
  if (process.env.NODE_ENV === 'production' && process.env.APP_URL) {
    http.get(`${process.env.APP_URL}/api/system/keep-alive`, (res) => {
      console.log(`[Anti-Sleep]: Server awake node ping hit: ${res.statusCode}`);
    }).on('error', () => {});
  }
}, 10 * 60 * 1000);

app.get('/api/system/keep-alive', (req: Request, res: Response) => {
  res.json({ status: "alive", tracked: false });
});

// ----------------------------------------------------
// DYNAMIC COMPREHENSIVE CONTROL & PURGE API ROUTERS
// ----------------------------------------------------
app.post('/api/admin/reset-all-analytics', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  if (req.body.masterPassword !== siteSettings.adminPassword) return res.status(401).json({ error: "Denied" });

  await db.collection('videos').deleteMany({});
  await db.collection('analytics').deleteMany({});
  await db.collection('users').deleteMany({ role: { '\$ne': 'admin' } });
  res.json({ success: true });
});

app.post('/api/admin/update-settings', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { newPassword, whatsappNumber, supabaseUrl, supabaseKey } = req.body;

  if (newPassword && newPassword.trim().length >= 4) siteSettings.adminPassword = newPassword.trim();
  if (whatsappNumber !== undefined) siteSettings.whatsappNumber = whatsappNumber.trim();
  if (supabaseUrl !== undefined) siteSettings.supabaseUrl = supabaseUrl.trim();
  if (supabaseKey !== undefined) siteSettings.supabaseKey = supabaseKey.trim();

  await db.collection('config').updateOne({}, { '\$set': siteSettings }, { upsert: true });
  res.json({ success: true, settings: siteSettings });
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
  await db.collection('users').updateOne({ _id: new ObjectId(req.body.userId) }, { '\$set': { isBanned: Boolean(req.body.isBanned) } });
  res.json({ success: true });
});

app.get('/api/site/config', (req: Request, res: Response) => {
  res.json({
    mongoStatus: db ? "connected" : "disconnected",
    whatsappNumber: siteSettings.whatsappNumber,
    supabaseUrl: siteSettings.supabaseUrl
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => { res.sendFile(path.join(__dirname, 'dist', 'index.html')); });
}

app.listen(PORT, async () => { await connectDatabase(); });
