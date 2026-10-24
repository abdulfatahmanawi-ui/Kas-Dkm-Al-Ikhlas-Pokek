import { TransactionType } from '../types';

export const formatRupiah = (value: number): string => {
  if (isNaN(value)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  if (isNaN(value)) return '0';
  return new Intl.NumberFormat('id-ID').format(value);
};

export const formatDateIndo = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

export const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!day || !month || !year) return dateStr;
  return `${day}/${month}/${year}`;
};

export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[monthIndex] || '';
};

const bilangAngka = (n: number): string => {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  const val = Math.floor(n);
  if (val < 12) {
    return bilangan[val];
  } else if (val < 20) {
    return bilangAngka(val - 10) + ' Belas';
  } else if (val < 100) {
    const sisa = val % 10;
    return bilangAngka(Math.floor(val / 10)) + ' Puluh' + (sisa ? ' ' + bilangAngka(sisa) : '');
  } else if (val < 200) {
    const sisa = val - 100;
    return 'Seratus' + (sisa ? ' ' + bilangAngka(sisa) : '');
  } else if (val < 1000) {
    const sisa = val % 100;
    return bilangAngka(Math.floor(val / 100)) + ' Ratus' + (sisa ? ' ' + bilangAngka(sisa) : '');
  } else if (val < 2000) {
    const sisa = val - 1000;
    return 'Seribu' + (sisa ? ' ' + bilangAngka(sisa) : '');
  } else if (val < 1000000) {
    const sisa = val % 1000;
    return bilangAngka(Math.floor(val / 1000)) + ' Ribu' + (sisa ? ' ' + bilangAngka(sisa) : '');
  } else if (val < 1000000000) {
    const sisa = val % 1000000;
    return bilangAngka(Math.floor(val / 1000000)) + ' Juta' + (sisa ? ' ' + bilangAngka(sisa) : '');
  } else if (val < 1000000000000) {
    const sisa = val % 1000000000;
    return bilangAngka(Math.floor(val / 1000000000)) + ' Miliar' + (sisa ? ' ' + bilangAngka(sisa) : '');
  } else if (val < 1000000000000000) {
    const sisa = val % 1000000000000;
    return bilangAngka(Math.floor(val / 1000000000000)) + ' Triliun' + (sisa ? ' ' + bilangAngka(sisa) : '');
  }

  return '';
};

export const terbilang = (angka: number): string => {
  if (isNaN(angka)) return 'Nol Rupiah';
  const n = Math.abs(Math.floor(angka));
  if (n === 0) return 'Nol Rupiah';

  const kata = bilangAngka(n).trim().replace(/\s+/g, ' ');
  return `${kata} Rupiah`;
};

export const DEFAULT_INCOME_CATEGORIES = [
  'Infaq Sholat Jumat',
  'Kotak Amal Harian / Keliling',
  'Donasi Pembangunan Masjid',
  'Infaq & Sedekah Warga Dusun Pokek',
  'Zakat Fitrah & Mal',
  'Wakaf Tunai',
  'Sumbangan Hari Besar Islam (PHBI)',
  'Lain-lain Pemasukan'
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Tagihan Listrik PLN & Air Masjid',
  'Honor Imam & Marbot',
  'Biaya Kebersihan & Alat Pembersih',
  'Perbaikan Sound System & Elektronik',
  'Pemeliharaan Bangunan & Tempat Wudhu',
  'Kegiatan Pengajian & Majelis Taklim',
  'Santunan Yatim & Duafa Dusun Pokek',
  'Konsumsi Kerja Bakti / Kegiatan Warga',
  'Alat Tulis Kantor & Fotokopi Laporan',
  'Lain-lain Pengeluaran'
];

export const getCategoryBadgeColor = (category: string, type: TransactionType) => {
  if (type === 'in') {
    if (category.includes('Pembangunan')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (category.includes('Jumat')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (category.includes('Zakat')) return 'bg-teal-100 text-teal-800 border-teal-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else {
    if (category.includes('Listrik')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (category.includes('Honor')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (category.includes('Bangunan') || category.includes('Perbaikan')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (category.includes('Santunan')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-red-50 text-red-700 border-red-200';
  }
};
