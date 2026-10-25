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

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const loadStoredTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
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

