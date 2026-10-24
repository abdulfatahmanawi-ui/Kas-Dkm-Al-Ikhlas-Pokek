import { AdminAccount, AppConfig, Transaction } from '../types';

const TRANSACTIONS_KEY = 'kas_dkm_alikhlas_transactions_v1';
const CONFIG_KEY = 'kas_dkm_alikhlas_config_v1';
const ADMINS_KEY = 'kas_dkm_alikhlas_admins_v1';
const ACTIVE_ADMIN_KEY = 'kas_dkm_alikhlas_active_admin_v1';

export const DEFAULT_ADMIN_ACCOUNTS: AdminAccount[] = [
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
];

export const DEFAULT_CONFIG: AppConfig = {
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
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    date: '2026-10-02',
    type: 'in',
    amount: 1850000,
    category: 'Infaq Sholat Jumat',
    fundType: 'operasional',
    description: 'Infaq Kotak Keliling Sholat Jumat Pertama Bulan Oktober',
    donorName: 'Jamaah Sholat Jumat Dusun Pokek',
    receiptNumber: 'KAS-IKH-202610-001',
    createdAt: 1727827200000,
    recordedBy: 'Bendahara Kas'
  },
  {
    id: 'tx-002',
    date: '2026-10-04',
    type: 'out',
    amount: 420000,
    category: 'Tagihan Listrik PLN & Air Masjid',
    fundType: 'operasional',
    description: 'Pembayaran Rekening Listrik PLN Masjid Periode Oktober 2026',
    donorName: '-',
    receiptNumber: 'KAS-IKH-202610-002',
    createdAt: 1728000000000,
    recordedBy: 'Bendahara Kas'
  },
  {
    id: 'tx-003',
    date: '2026-10-05',
    type: 'in',
    amount: 5000000,
    category: 'Donasi Pembangunan Masjid',
    fundType: 'pembangunan',
    description: 'Wakaf donasi semen & renovasi area tempat wudhu putri Dusun Pokek',
    donorName: 'Hamba Allah (Keluarga Alm. H. Sanusi)',
    receiptNumber: 'KAS-IKH-202610-003',
    createdAt: 1728086400000,
    recordedBy: 'Bendahara Kas'
  },
  {
    id: 'tx-004',
    date: '2026-10-07',
    type: 'out',
    amount: 1750000,
    category: 'Pemeliharaan Bangunan & Tempat Wudhu',
    fundType: 'pembangunan',
    description: 'Pembelian 15 zak semen, pasir pasang, dan kran wudhu stainless 8 pcs',
    donorName: 'TB. Sinar Jaya Cikaum',
    receiptNumber: 'KAS-IKH-202610-004',
    createdAt: 1728259200000,
    recordedBy: 'Bendahara Kas'
  },
  {
    id: 'tx-005',
    date: '2026-10-09',
    type: 'in',
    amount: 1950000,
    category: 'Infaq Sholat Jumat',
    fundType: 'operasional',
    description: 'Infaq Kotak Keliling Sholat Jumat Kedua Bulan Oktober',
    donorName: 'Jamaah Sholat Jumat Dusun Pokek',
    receiptNumber: 'KAS-IKH-202610-005',
    createdAt: 1728432000000,
    recordedBy: 'Bendahara Kas'
  },
  {
    id: 'tx-006',
    date: '2026-10-10',
    type: 'in',
    amount: 1200000,
    category: 'Infaq & Sedekah Warga Dusun Pokek',
    fundType: 'sosial',
    description: 'Sedekah santunan anak yatim & duafa dari arisan bapak-bapak RW 004',
    donorName: 'Warga RW 004 Kawunganten',
    receiptNumber: 'KAS-IKH-202610-006',
    createdAt: 1728518400000,
    recordedBy: 'Bendahara Kas'
  },
  {
    id: 'tx-007',
    date: '2026-10-12',
    type: 'out',
    amount: 350000,
    category: 'Biaya Kebersihan & Alat Pembersih',
    fundType: 'operasional',
    description: 'Pembelian karbol wangi, sapu lidi, keset kaki baru, cairan pel, & pewangi ruangan',
    donorName: 'Toko Al-Berkah',
    receiptNumber: 'KAS-IKH-202610-007',
    createdAt: 1728691200000,
    recordedBy: 'Bendahara Kas'
  },
  {
    id: 'tx-008',
    date: '2026-10-14',
    type: 'out',
    amount: 800000,
    category: 'Honor Imam & Marbot',
    fundType: 'operasional',
    description: 'Bisyarah / Kafalah pemeliharaan masjid untuk Marbot dan Petugas Adzan',
    donorName: 'Mang Aep (Marbot Masjid)',
    receiptNumber: 'KAS-IKH-202610-008',
    createdAt: 1728864000000,
    recordedBy: 'Bendahara Kas'
  },
  {
    id: 'tx-009',
    date: '2026-10-16',
    type: 'in',
    amount: 2150000,
    category: 'Infaq Sholat Jumat',
    fundType: 'operasional',
    description: 'Infaq Kotak Sholat Jumat Ketiga Bulan Oktober 2026',
    donorName: 'Jamaah Masjid Al-Ikhlas',
    receiptNumber: 'KAS-IKH-202610-009',
    createdAt: 1729036800000,
    recordedBy: 'Bendahara Kas'
  },
  {
    id: 'tx-010',
    date: '2026-10-18',
    type: 'out',
    amount: 1000000,
    category: 'Santunan Yatim & Duafa Dusun Pokek',
    fundType: 'sosial',
    description: 'Penyaluran santunan beras dan amplop untuk 5 anak yatim di lingkungan RW 004',
    donorName: 'Penerima Yatim Pokek',
    receiptNumber: 'KAS-IKH-202610-010',
    createdAt: 1729209600000,
    recordedBy: 'Bendahara Kas'
  },
  {
    id: 'tx-011',
    date: '2026-10-21',
    type: 'in',
    amount: 750000,
    category: 'Kotak Amal Harian / Keliling',
    fundType: 'operasional',
    description: 'Pembukaan kotak amal pintu utama dan teras masjid',
    donorName: 'Jamaah Sholat Rawatib',
    receiptNumber: 'KAS-IKH-202610-011',
    createdAt: 1729468800000,
    recordedBy: 'Bendahara Kas'
  }
];

export const loadStoredTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_TRANSACTIONS;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
};

export const saveStoredTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions to localStorage', err);
  }
};

export const loadStoredConfig = (): AppConfig => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.postalCode || parsed.postalCode === '41253') {
      parsed.postalCode = '41266';
    }
    if (!parsed.phone || parsed.phone === '0812-3456-7890') {
      parsed.phone = '082323080878';
    }
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveStoredConfig = (config: AppConfig) => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save config to localStorage', err);
  }
};

export const generateReceiptNumber = (transactions: Transaction[]): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const count = transactions.length + 1;
  const padIndex = String(count).padStart(3, '0');
  return `KAS-IKH-${year}${month}-${padIndex}`;
};

export const loadStoredAdmins = (): AdminAccount[] => {
  try {
    const raw = localStorage.getItem(ADMINS_KEY);
    if (!raw) {
      localStorage.setItem(ADMINS_KEY, JSON.stringify(DEFAULT_ADMIN_ACCOUNTS));
      return DEFAULT_ADMIN_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_ADMIN_ACCOUNTS;
  } catch {
    return DEFAULT_ADMIN_ACCOUNTS;
  }
};

export const saveStoredAdmins = (admins: AdminAccount[]) => {
  try {
    localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
  } catch (err) {
    console.error('Failed to save admins to localStorage', err);
  }
};

export const loadStoredActiveAdmin = (availableAdmins: AdminAccount[]): AdminAccount | null => {
  try {
    const raw = localStorage.getItem(ACTIVE_ADMIN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id) {
      // Find matching current admin record to keep in sync
      const matched = availableAdmins.find((a) => a.id === parsed.id || a.username === parsed.username);
      return matched || parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const saveStoredActiveAdmin = (admin: AdminAccount | null) => {
  try {
    if (admin) {
      localStorage.setItem(ACTIVE_ADMIN_KEY, JSON.stringify(admin));
    } else {
      localStorage.removeItem(ACTIVE_ADMIN_KEY);
    }
  } catch (err) {
    console.error('Failed to save active admin session', err);
  }
};

