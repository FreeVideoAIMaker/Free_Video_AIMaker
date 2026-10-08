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
    console.log('Successfully connected to MongoDB Atlas Cluster.');
    
    const configColl = db.collection('config');
    const savedConfig = await configColl.findOne({});
    if (!savedConfig) {
      await configColl.insertOne(siteSettings);
    } else {
      siteSettings = { ...siteSettings, ...savedConfig as any };
    }
  } catch (err: any) {
    console.error('Database connection failed:', err.message);
  }
}

// ----------------------------------------------------
// INTERNAL SELF-PING SYSTEM (EVERY 10 MINUTES)
// ----------------------------------------------------
setInterval(() => {
  if (process.env.NODE_ENV === 'production' && process.env.APP_URL) {
    console.log('[System-Trigger]: Dispatching anti-sleep ping node...');
    http.get(`${process.env.APP_URL}/api/system/keep-alive`, (res) => {
      console.log(`[System-Trigger]: Ping responded with status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('[System-Trigger]: Ping error:', err.message);
    });
  }
}, 10 * 60 * 1000);

app.get('/api/system/keep-alive', (req: Request, res: Response) => {
  res.json({ status: "alive", tracked: false });
});

// ----------------------------------------------------
// MASTER SYSTEM ANALYTICS & DATABASE PURGE REMOVAL
// ----------------------------------------------------
app.post('/api/admin/reset-all-analytics', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { masterPassword } = req.body;

  if (masterPassword !== siteSettings.adminPassword) {
    return res.status(401).json({ error: "Invalid credentials code." });
  }

  await db.collection('videos').deleteMany({});
  await db.collection('analytics').deleteMany({});
  await db.collection('users').deleteMany({ role: { '\$ne': 'admin' } });
  
  res.json({ success: true, message: "Cloud statistics reset completely." });
});

// DYNAMIC CONTROL LOGIC FOR UPDATING PASSWORD AND WHATSAPP
app.post('/api/admin/update-settings', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { newPassword, whatsappNumber, dailyLimit } = req.body;

  const updateFields: any = {};
  if (newPassword && newPassword.trim().length >= 4) {
    siteSettings.adminPassword = newPassword.trim();
    updateFields.adminPassword = siteSettings.adminPassword;
  }
  if (whatsappNumber !== undefined) {
    siteSettings.whatsappNumber = whatsappNumber.trim();
    updateFields.whatsappNumber = siteSettings.whatsappNumber;
  }
  if (dailyLimit !== undefined) {
    siteSettings.dailyLimitPerUser = Number(dailyLimit);
    updateFields.dailyLimitPerUser = siteSettings.dailyLimitPerUser;
  }

  await db.collection('config').updateOne({}, { '\$set': updateFields }, { upsert: true });
  res.json({ success: true, settings: siteSettings });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { email, password } = req.body;
  const user = await db.collection('users').findOne({ email: email.toLowerCase(), password });
  if (!user) return res.status(401).json({ error: 'Invalid login matrix.' });
  
  await db.collection('users').updateOne({ _id: user._id }, { '\$set': { lastLoginAt: new Date().toISOString() } });
  res.json({ success: true, user });
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  if (!db) return res.status(500).json({ error: "Database offline" });
  const { name, email, password } = req.body;
  const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ error: 'Account already operational.' });
  
  const newUser = { name, email: email.toLowerCase(), password, createdAt: new Date().toISOString(), role: 'user', isBanned: false, dailyGenerationsCount: 0, lastGenerationDate: new Date().toISOString().split('T')[0] };
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
  app.listen(PORT, () => { console.log(`Active server operating on port: ${PORT}`); });
});
