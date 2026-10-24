import React from 'react';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building, 
  HeartHandshake, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';

interface StatsOverviewProps {
  transactions: Transaction[];
  onSelectFundFilter: (fund: 'all' | 'operasional' | 'pembangunan' | 'sosial') => void;
  selectedFund: 'all' | 'operasional' | 'pembangunan' | 'sosial';
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  transactions,
  onSelectFundFilter,
  selectedFund,
}) => {
  // Compute overall totals
  let totalIncome = 0;
  let totalExpense = 0;

  // Compute breakdown by fund
  const fundTotals = {
    operasional: { in: 0, out: 0, balance: 0 },
    pembangunan: { in: 0, out: 0, balance: 0 },
    sosial: { in: 0, out: 0, balance: 0 },
  };

  transactions.forEach((tx) => {
    if (tx.type === 'in') {
      totalIncome += tx.amount;
      if (fundTotals[tx.fundType]) fundTotals[tx.fundType].in += tx.amount;
    } else {
      totalExpense += tx.amount;
      if (fundTotals[tx.fundType]) fundTotals[tx.fundType].out += tx.amount;
    }
  });

  fundTotals.operasional.balance = fundTotals.operasional.in - fundTotals.operasional.out;
  fundTotals.pembangunan.balance = fundTotals.pembangunan.in - fundTotals.pembangunan.out;
  fundTotals.sosial.balance = fundTotals.sosial.in - fundTotals.sosial.out;

  const totalBalance = totalIncome - totalExpense;

  return (
    <section className="space-y-4">
      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Saldo Utama */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-xl shadow-emerald-950/20 border border-emerald-600/40">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-200 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Sisa Saldo Kas Bersih
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-amber-300 border border-white/15">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-1">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {formatRupiah(totalBalance)}
            </h2>
            <p className="text-emerald-200 text-xs mt-1.5 flex items-center gap-1 font-medium">
              <span>Dana akumulasi dari seluruh pos kas DKM Al-Ikhlas</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-600/40 flex items-center justify-between text-xs text-emerald-200">
            <span>Total Transaksi: <strong>{transactions.length} Data</strong></span>
            <span className="text-amber-300 font-semibold">Kas Aktif</span>
          </div>
        </div>

        {/* Card 2: Total Pemasukan */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
              Total Pemasukan
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-1">
            <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
              {formatRupiah(totalIncome)}
            </div>
            <p className="text-slate-500 text-xs mt-1.5">
              Infaq Jumat, donasi, zakat, & kotak amal
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Pemasukan tercatat:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              +{transactions.filter(t => t.type === 'in').length} transaksi
            </span>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60">
              Total Pengeluaran
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-1">
            <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
              {formatRupiah(totalExpense)}
            </div>
            <p className="text-slate-500 text-xs mt-1.5">
              Operasional, listrik PLN, santunan & perbaikan
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Pengeluaran tercatat:</span>
            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              -{transactions.filter(t => t.type === 'out').length} transaksi
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Fund Classification Cards (Clickable for quick filter) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Rincian Saldo Per Rekening Pos Kas
              </h3>
              <p className="text-slate-500 text-xs">
                Klik pos kas di bawah untuk menyaring riwayat transaksi terkait
              </p>
            </div>
          </div>

          {selectedFund !== 'all' && (
            <button
              onClick={() => onSelectFundFilter('all')}
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition-colors"
            >
              Tampilkan Semua Pos Kas
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Pos Operasional */}
          <button
            type="button"
            onClick={() => onSelectFundFilter(selectedFund === 'operasional' ? 'all' : 'operasional')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedFund === 'operasional'
                ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Kas Operasional & Perawatan
              </span>
              <span className="text-[11px] text-slate-500">Masjid</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-lg font-bold text-slate-900">
                {formatRupiah(fundTotals.operasional.balance)}
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-emerald-700 font-medium">Masuk: {formatRupiah(fundTotals.operasional.in)}</span>
              <span className="text-rose-600 font-medium">Keluar: {formatRupiah(fundTotals.operasional.out)}</span>
            </div>
          </button>

          {/* Pos Pembangunan */}
          <button
            type="button"
            onClick={() => onSelectFundFilter(selectedFund === 'pembangunan' ? 'all' : 'pembangunan')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedFund === 'pembangunan'
                ? 'bg-amber-50/80 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-600" />
                Kas Pembangunan & Renovasi
              </span>
              <span className="text-[11px] text-slate-500">Khusus</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-lg font-bold text-slate-900">
                {formatRupiah(fundTotals.pembangunan.balance)}
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-emerald-700 font-medium">Masuk: {formatRupiah(fundTotals.pembangunan.in)}</span>
              <span className="text-rose-600 font-medium">Keluar: {formatRupiah(fundTotals.pembangunan.out)}</span>
            </div>
          </button>

          {/* Pos Sosial */}
          <button
            type="button"
            onClick={() => onSelectFundFilter(selectedFund === 'sosial' ? 'all' : 'sosial')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedFund === 'sosial'
                ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
                Kas Sosial & Santunan Yatim
              </span>
              <span className="text-[11px] text-slate-500">RW 004</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-lg font-bold text-slate-900">
                {formatRupiah(fundTotals.sosial.balance)}
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-emerald-700 font-medium">Masuk: {formatRupiah(fundTotals.sosial.in)}</span>
              <span className="text-rose-600 font-medium">Keluar: {formatRupiah(fundTotals.sosial.out)}</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};
