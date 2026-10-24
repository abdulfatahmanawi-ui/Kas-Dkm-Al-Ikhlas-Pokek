export type TransactionType = 'in' | 'out';

export type FundType = 'operasional' | 'pembangunan' | 'sosial';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType; // 'in' = Pemasukan, 'out' = Pengeluaran
  amount: number;
  category: string;
  fundType: FundType;
  description: string;
  donorName?: string;
  receiptNumber: string;
  createdAt: number;
  recordedBy?: string;
}

export interface AppConfig {
  mosqueName: string;
  locationDetails: string;
  addressLine: string;
  rtRw: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  postalCode: string;
  ketuaDkm: string;
  bendahara: string;
  sekretaris?: string;
  adminPassword: string; // Stored password (default: 'ikhlas123')
  phone?: string;
  customLogoUrl?: string;
}

export interface FilterOptions {
  search: string;
  type: 'all' | 'in' | 'out';
  fundType: 'all' | FundType;
  category: string;
  period: 'all' | 'this_month' | 'last_month' | 'this_year' | 'custom';
  startDate: string;
  endDate: string;
}

export interface PdfExportOptions {
  title: string;
  periodLabel: string;
  fundType: 'all' | FundType;
  type: 'all' | 'in' | 'out';
  startDate?: string;
  endDate?: string;
  includeSignatures: boolean;
  notes?: string;
}
