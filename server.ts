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

// MongoDB Atlas Cloud Database - Directly mapped with user credentials
const mongoURI = "mongodb+srv://projectfinance94_db_user:cNJ9FA1AlUxsoM4m@cluster0.qdrozb.mongodb.net/freevideoaimaker?retryWrites=true&w=majority&appName=Cluster0";

let db: Db | null = null;
let client: MongoClient | null = null;

// Dynamic applet settings synchronized inside MongoDB
let siteSettings = {
  adminPassword: "AdminSecure@2026",
  whatsappNumber: "00963900000000",
  dailyLimitPerUser: 4,
  watermarkEnabled: false,
  retentionHours: 24
};

async function connectDatabase() {
  try {
    client = new MongoClient(mongoURI);
    await client.connect();
    db = client.db('freevideoaimaker');
    console.log('Successfully stabilized pipeline connection with MongoDB Atlas Cluster.');
    
    // Config setup block
    const configColl = db.collection('config');
    const savedConfig = await configColl.findOne({});
    if (!savedConfig) {
      await configColl.insertOne(siteSettings);
    } else {
      siteSettings = { ...siteSettings, ...savedConfig as any };
    }
  } catch (err: any) {
    console.error('Critical database tracking gateway offline:', err.message);
  }
}

// ----------------------------------------------------
// INTERNAL SELF-PING SYSTEM (KEEPS SERVICE AWAKE EVERY 10 MINUTES)
// ----------------------------------------------------
const appURL = process.env.APP_URL || `http://localhost:${PORT}`;

setInterval(() => {
  if (process.env.NODE_ENV === 'production' && process.env.APP_URL) {
    console.log('[System-Trigger]: Dispatching native anti-sleep ping node...');
    http.get(`${process.env.APP_URL}/api/system/keep-alive`, (res) => {
      console.log(`[System-Trigger]: Awake ping responded with status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('[System-Trigger]: Awake ping layout bypassed:', err.message);
    });
  }
}, 10 * 60 * 1000); // 10 Minutes precise sync checkpoint

// Isolated pathway strictly ignored by visitor counters analytics
app.get('/api/system/keep-alive', (req: Request, res: Response) => {
  res.json({ status: "alive", authenticatedBots: "filtered_out", tracked: false });
});

// ----------------------------------------------------
// MASTER SYSTEM ANALYTICS & DATABASE PURGE REMOVAL
// ----------------------------------------------------
app.post('/api/admin/reset-all-analytics', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { masterPassword } = req.body;

  if (masterPassword !== siteSettings.adminPassword) {
    return res.status(401).json({ error: "Invalid configuration credentials code." });
  }

  // Absolute hard wipe - flushes records from global cluster database completely
  await db.collection('videos').deleteMany({});
  await db.collection('analytics').deleteMany({});
  await db.collection('users').deleteMany({ role: { \$ne: 'admin' } }); // Flushes fake registered tokens completely
  
  res.json({ success: true, message: "Cloud schema statistics reset completely." });
});

// DYNAMIC CONTROL LOGIC FOR UPDATING PASSWORD AND WHATSAPP METRIC FROM ADMIN PORTAL
app.post('/api/admin/update-settings', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { newPassword, whatsappNumber, dailyLimit } = req.body;

  if (newPassword && newPassword.trim().length >= 4) siteSettings.adminPassword = newPassword.trim();
  if (whatsappNumber !== undefined) siteSettings.whatsappNumber = whatsappNumber.trim();
  if (dailyLimit !== undefined) siteSettings.dailyLimitPerUser = Number(dailyLimit);

  await db.collection('config').updateOne({}, { \$set: siteSettings }, { upsert: true });
  res.json({ success: true, settings: siteSettings });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { email, password } = req.body;
  const user = await db.collection('users').findOne({ email: email.toLowerCase(), password });
  if (!user) return res.status(401).json({ error: 'Invalid login matrix.' });
  res.json({ success: true, user });
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { name, email, password } = req.body;
  const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ error: 'Account identity already operational.' });
  const newUser = { name, email: email.toLowerCase(), password, createdAt: new Date().toISOString(), role: 'user', isBanned: false };
  const result = await db.collection('users').insertOne(newUser);
  res.json({ success: true, user: { id: result.insertedId, name, email } });
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

connectDatabase().then(() => {
  app.listen(PORT, () => { console.log(`Active server operating on network node: ${PORT}`); });
});
