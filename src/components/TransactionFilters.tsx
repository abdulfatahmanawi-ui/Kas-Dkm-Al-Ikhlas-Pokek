import React from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Calendar,
  Layers
} from 'lucide-react';
import { FilterOptions, FundType, TransactionType } from '../types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../utils/formatters';

interface TransactionFiltersProps {
  filters: FilterOptions;
  onChange: (newFilters: Partial<FilterOptions>) => void;
  onReset: () => void;
  totalFiltered: number;
  totalTransactions: number;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalFiltered,
  totalTransactions,
}) => {
  const allCategories = Array.from(
    new Set([...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES])
  ).sort();

  const isFiltered =
    filters.search ||
    filters.type !== 'all' ||
    filters.fundType !== 'all' ||
    filters.category ||
    filters.period !== 'all';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3.5">
      
      {/* Top Search Bar & Quick Buttons */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari uraian transaksi, nama donatur/penyetor, no. kwitansi..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/60 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/70 shrink-0">
          <button
            type="button"
            onClick={() => onChange({ type: 'all' })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filters.type === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => onChange({ type: 'in' })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              filters.type === 'in'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:text-emerald-800'
            }`}
          >
            + Pemasukan
          </button>
          <button
            type="button"
            onClick={() => onChange({ type: 'out' })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              filters.type === 'out'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-700 hover:text-rose-800'
            }`}
          >
            - Pengeluaran
          </button>
        </div>
      </div>

      {/* Filter Options Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
        
        {/* Period Picker */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-600" />
            Periode Waktu
          </label>
          <select
            value={filters.period}
            onChange={(e) => onChange({ period: e.target.value as any })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">Semua Waktu</option>
            <option value="this_month">Bulan Ini (Oktober 2026)</option>
            <option value="last_month">Bulan Lalu (September 2026)</option>
            <option value="this_year">Tahun Ini (2026)</option>
            <option value="custom">Rentang Tanggal Khusus</option>
          </select>
        </div>

        {/* Fund Type Picker */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-600" />
            Pos Rekening Kas
          </label>
          <select
            value={filters.fundType}
            onChange={(e) => onChange({ fundType: e.target.value as any })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">Semua Pos Kas</option>
            <option value="operasional">Kas Operasional & Masjid</option>
            <option value="pembangunan">Kas Pembangunan & Renovasi</option>
            <option value="sosial">Kas Sosial & Santunan Yatim</option>
          </select>
        </div>

        {/* Category Picker */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-emerald-600" />
            Kategori Transaksi
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">Semua Kategori</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-end justify-between gap-2">
          <div className="text-xs text-slate-500 pb-2">
            Menampilkan: <strong className="text-slate-800">{totalFiltered}</strong> dari {totalTransactions} data
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl border border-rose-200 transition-colors font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range if 'custom' selected */}
      {filters.period === 'custom' && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-amber-900">Pilih Rentang Tanggal:</span>
          <div className="flex items-center gap-2">
            <label className="text-slate-600">Dari:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-600">Sampai:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
