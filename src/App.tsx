/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Heart, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  FileText, 
  PlusCircle, 
  Calendar,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { AppConfig, FilterOptions, FundType, Transaction } from './types';
import { 
  DEFAULT_CONFIG, 
  INITIAL_TRANSACTIONS, 
  generateReceiptNumber, 
  loadStoredConfig, 
  loadStoredTransactions, 
  saveStoredConfig, 
  saveStoredTransactions 
} from './utils/storage';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { TransactionFilters } from './components/TransactionFilters';
import { TransactionList } from './components/TransactionList';
import { AuthModal } from './components/AuthModal';
import { TransactionModal } from './components/TransactionModal';
import { PdfExportModal } from './components/PdfExportModal';
import { ReceiptModal } from './components/ReceiptModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [config, setConfig] = useState<AppConfig>(loadStoredConfig);
  const [transactions, setTransactions] = useState<Transaction[]>(loadStoredTransactions);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    type: 'all',
    fundType: 'all',
    category: '',
    period: 'all',
    startDate: '',
    endDate: '',
  });

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [viewingReceiptTx, setViewingReceiptTx] = useState<Transaction | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sync to storage
  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredConfig(config);
  }, [config]);

  // Filtered transactions calculation
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions
      .filter((tx) => {
        // Search query
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchDesc = tx.description.toLowerCase().includes(q);
          const matchDonor = tx.donorName?.toLowerCase().includes(q);
          const matchReceipt = tx.receiptNumber.toLowerCase().includes(q);
          const matchCategory = tx.category.toLowerCase().includes(q);
          if (!matchDesc && !matchDonor && !matchReceipt && !matchCategory) return false;
        }

        // Type filter
        if (filters.type !== 'all' && tx.type !== filters.type) {
          return false;
        }

        // Fund filter
        if (filters.fundType !== 'all' && tx.fundType !== filters.fundType) {
          return false;
        }

        // Category filter
        if (filters.category && tx.category !== filters.category) {
          return false;
        }

        // Period filter
        const txDate = new Date(tx.date + 'T00:00:00');
        if (filters.period === 'this_month') {
          return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
        }
        if (filters.period === 'last_month') {
          const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
          return (
            txDate.getFullYear() === lastMonthDate.getFullYear() &&
            txDate.getMonth() === lastMonthDate.getMonth()
          );
        }
        if (filters.period === 'this_year') {
          return txDate.getFullYear() === currentYear;
        }
        if (filters.period === 'custom') {
          if (filters.startDate && tx.date < filters.startDate) return false;
          if (filters.endDate && tx.date > filters.endDate) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filters]);

  // Actions
  const handleOpenAddModal = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    if (
      confirm(
        `Yakin ingin menghapus catatan kas "${target.description}" sejumlah Rp ${target.amount.toLocaleString(
          'id-ID'
        )}?`
      )
    ) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Edit
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === existingId
            ? { ...item, ...txData }
            : item
        )
      );
    } else {
      // Add
      const newTx: Transaction = {
        ...txData,
        id: 'tx-' + Date.now(),
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleViewReceipt = (tx: Transaction) => {
    setViewingReceiptTx(tx);
    setIsReceiptModalOpen(true);
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      fundType: 'all',
      category: '',
      period: 'all',
      startDate: '',
      endDate: '',
    });
  };

  const handleSelectFundFilter = (fund: 'all' | 'operasional' | 'pembangunan' | 'sosial') => {
    handleFilterChange({ fundType: fund });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* 1. Header with Mosque Logo and Info */}
      <Header
        config={config}
        isAuthenticated={isAuthenticated}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={() => setIsAuthenticated(false)}
        onOpenAddModal={handleOpenAddModal}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Ayat / Spiritual Callout Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 rounded-2xl p-5 text-white shadow-sm border border-emerald-700/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-amber-300 font-arabic text-lg sm:text-xl font-bold tracking-wide">
                مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ
              </p>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium italic">
                &ldquo;Perumpamaan orang yang menafkahkan hartanya di jalan Allah seperti sebutir benih yang menumbuhkan tujuh bulir, pada tiap-tiap bulir seratus biji.&rdquo;
              </p>
              <p className="text-emerald-300/80 text-[11px] font-semibold">
                (QS. Al-Baqarah: 261) • Kas DKM Al-Ikhlas Dusun Pokek RW 004
              </p>
            </div>

            {/* Quick action button for PDF */}
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="shrink-0 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Unduh Laporan PDF</span>
            </button>
          </div>
        </div>

        {/* 3. Stats & Overview Cards */}
        <StatsOverview
          transactions={transactions}
          onSelectFundFilter={handleSelectFundFilter}
          selectedFund={filters.fundType}
        />

        {/* 4. Filter Toolbar */}
        <TransactionFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          totalFiltered={filteredTransactions.length}
          totalTransactions={transactions.length}
        />

        {/* 5. Transactions Table / List */}
        <TransactionList
          transactions={filteredTransactions}
          isAuthenticated={isAuthenticated}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onViewReceipt={handleViewReceipt}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Informative Notice for Jamaah */}
        <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80 text-xs text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">
                Transparansi & Akuntabilitas Kas Masjid Al-Ikhlas
              </p>
              <p className="text-emerald-800 text-[11px]">
                Seluruh jamaah Dusun Pokek dapat memantau dan mencetak laporan kas kapan saja.
                Untuk pencatatan infaq atau donasi, hubungi Bendahara DKM di Dusun Pokek RW 004.
              </p>
            </div>
          </div>

          {!isAuthenticated && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Akses Khusus Petugas (Sandi)</span>
            </button>
          )}
        </div>
      </main>

      {/* 6. Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-white font-bold text-sm">
              DEWAN KEMAKMURAN MASJID (DKM) AL-IKHLAS
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              Dusun Pokek RW 004 Desa Kawunganten, Kec. Cikaum, Kab. Subang - Jawa Barat
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
            >
              Cetak Laporan PDF
            </button>
            <span>•</span>
            {isAuthenticated ? (
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Keluar Mode Petugas
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                Masuk Petugas Kas
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        correctPassword={config.adminPassword}
        onSuccess={() => setIsAuthenticated(true)}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        suggestedReceiptNumber={generateReceiptNumber(transactions)}
      />

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        transactions={transactions}
        config={config}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setViewingReceiptTx(null);
        }}
        transaction={viewingReceiptTx}
        config={config}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={config}
        onSaveConfig={(newCfg) => setConfig(newCfg)}
        transactions={transactions}
        onRestoreTransactions={(newTx) => setTransactions(newTx)}
        onResetTransactions={() => setTransactions(INITIAL_TRANSACTIONS)}
      />
    </div>
  );
}
