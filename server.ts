import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, 'dist');
const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
const isProduction = process.env.NODE_ENV === 'production' || (hasDist && process.env.npm_lifecycle_event !== 'dev');

// In AI Studio Cloud Run container, NGINX is reverse proxy on port 8080 forwarding to 3000.
// Express must bind to port 3000 on host 0.0.0.0.
const DEFAULT_PORT = 3000;
const port = (process.env.NGINX_PORT || process.env.DEFAULT_APP_PORT || process.env.PORT === '8080')
  ? DEFAULT_PORT
  : (Number(process.env.PORT) || DEFAULT_PORT);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Enable CORS for shared access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// File-based persistent storage
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'kas_dkm_db.json');

// Initial seed data
const INITIAL_DB = {
  config: {
    mosqueName: 'DEWAN KEMAKMURAN MASJID (DKM) AL-IKHLAS',
    locationDetails: 'Dusun Pokek RT/RW 004',
    addressLine: 'Dusun Pokek RW 004',
    rtRw: 'RW 004',
    village: 'Desa Kawunganten',
    district: 'Kecamatan Cikaum',
    regency: 'Kabupaten Subang',
    province: 'Jawa Barat',
    postalCode: '41266',
    ketuaDkm: 'Ust. H. Syarif Hidayatullah',
    bendahara: 'Bpk. Ridwan Fauzi (Bendahara DKM)',
    sekretaris: 'Bpk. Dedi Supriadi',
    adminPassword: 'ikhlas123',
    phone: '082323080878',
  },
  adminAccounts: [
    {
      id: 'admin-01',
      username: 'admin',
      fullName: 'Abdul Fatah',
      email: 'abdulfatahmanawi@gmail.com',
      role: 'superadmin',
      roleLabel: 'Administrator Utama',
      password: 'admin123',
      phone: '082323080878',
      avatarColor: 'emerald',
      createdAt: 1727827200000,
    },
    {
      id: 'admin-02',
      username: 'bendahara',
      fullName: 'Bpk. Ridwan Fauzi',
      email: 'bendahara.alikhlas@dkm.id',
      role: 'bendahara',
      roleLabel: 'Bendahara Kas RW 004',
      password: 'ikhlas123',
      phone: '082323080878',
      avatarColor: 'amber',
      createdAt: 1727827200000,
    },
    {
      id: 'admin-03',
      username: 'ketua',
      fullName: 'Ust. H. Syarif Hidayatullah',
      email: 'ketua.alikhlas@dkm.id',
      role: 'ketua',
      roleLabel: 'Ketua DKM Al-Ikhlas',
      password: 'ketua123',
      phone: '082323080878',
      avatarColor: 'teal',
      createdAt: 1727827200000,
    },
  ],
  transactions: []
};

// Helper: Read DB
function readDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      config: { ...INITIAL_DB.config, ...parsed.config },
      adminAccounts: parsed.adminAccounts || INITIAL_DB.adminAccounts,
      transactions: parsed.transactions || INITIAL_DB.transactions,
    };
  } catch (err) {
    console.error('Error reading database:', err);
    return INITIAL_DB;
  }
}

// Helper: Write DB
function writeDb(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

// --- API ENDPOINTS ---

// 1. Get entire shared data
app.get('/api/data', (_req, res) => {
  const db = readDb();
  res.json({
    success: true,
    data: db,
    updatedAt: Date.now(),
  });
});

// 2. Add or update single transaction
app.post('/api/transactions', (req, res) => {
  const newTx = req.body;
  if (!newTx || !newTx.amount || !newTx.description) {
    return res.status(400).json({ success: false, message: 'Data transaksi tidak lengkap' });
  }

  const db = readDb();
  const txId = newTx.id || ('tx-' + Date.now());
  const formattedTx = {
    ...newTx,
    id: txId,
    createdAt: newTx.createdAt || Date.now(),
  };

  const existingIndex = db.transactions.findIndex((t: any) => t.id === txId);
  if (existingIndex >= 0) {
    db.transactions[existingIndex] = formattedTx;
  } else {
    db.transactions.unshift(formattedTx);
  }

  writeDb(db);
  res.json({ success: true, transaction: formattedTx, transactions: db.transactions });
});

// 3. Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.transactions = db.transactions.filter((t: any) => t.id !== id);
  writeDb(db);
  res.json({ success: true, transactions: db.transactions });
});

// 4. Update mosque config
app.post('/api/config', (req, res) => {
  const newConfig = req.body;
  const db = readDb();
  db.config = { ...db.config, ...newConfig };
  writeDb(db);
  res.json({ success: true, config: db.config });
});

// 5. Update admin accounts
app.post('/api/admins', (req, res) => {
  const { adminAccounts } = req.body;
  if (!Array.isArray(adminAccounts)) {
    return res.status(400).json({ success: false, message: 'Daftar admin tidak valid' });
  }
  const db = readDb();
  db.adminAccounts = adminAccounts;
  writeDb(db);
  res.json({ success: true, adminAccounts: db.adminAccounts });
});

// 6. Restore / Import entire database
app.post('/api/restore', (req, res) => {
  const { transactions, config, adminAccounts } = req.body;
  const db = readDb();
  if (Array.isArray(transactions)) db.transactions = transactions;
  if (config) db.config = { ...db.config, ...config };
  if (Array.isArray(adminAccounts)) db.adminAccounts = adminAccounts;
  writeDb(db);
  res.json({ success: true, data: db });
});

// 7. Reset to default
app.post('/api/reset', (_req, res) => {
  writeDb(INITIAL_DB);
  res.json({ success: true, data: INITIAL_DB });
});

// Mount Vite or serve static in production
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath, { maxAge: '1h', index: false }));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server Kas DKM Al-Ikhlas running at http://0.0.0.0:${port} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer();
