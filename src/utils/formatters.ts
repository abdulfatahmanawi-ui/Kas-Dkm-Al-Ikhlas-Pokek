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

export const terbilang = (angka: number): string => {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  let hasil = '';
  const n = Math.abs(Math.floor(angka));

  if (n < 12) {
    hasil = ' ' + bilangan[n];
  } else if (n < 20) {
    hasil = terbilang(n - 10) + ' Belas';
  } else if (n < 100) {
    hasil = terbilang(Math.floor(n / 10)) + ' Puluh' + terbilang(n % 10);
  } else if (n < 200) {
    hasil = ' Seratus' + terbilang(n - 100);
  } else if (n < 1000) {
    hasil = terbilang(Math.floor(n / 100)) + ' Ratus' + terbilang(n % 100);
  } else if (n < 2000) {
    hasil = ' Seribu' + terbilang(n - 100);
  } else if (n < 1000000) {
    hasil = terbilang(Math.floor(n / 1000)) + ' Ribu' + terbilang(n % 1000);
  } else if (n < 1000000000) {
    hasil = terbilang(Math.floor(n / 1000000)) + ' Juta' + terbilang(n % 1000000);
  } else if (n < 1000000000000) {
    hasil = terbilang(Math.floor(n / 1000000000)) + ' Milyar' + terbilang(n % 1000000000);
  }

  return (hasil.trim() + ' Rupiah').replace(/\s+/g, ' ');
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
