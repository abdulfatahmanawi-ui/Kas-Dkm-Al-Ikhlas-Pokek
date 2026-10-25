/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  CheckCircle2,
  UserCheck,
  Users,
  RotateCw,
  Wifi,
  CloudCheck
} from 'lucide-react';
import { AdminAccount, AppConfig, FilterOptions, FundType, Transaction } from './types';
import { 
  DEFAULT_CONFIG, 
  INITIAL_TRANSACTIONS, 
  generateReceiptNumber, 
  loadStoredAdmins,
  loadStoredActiveAdmin,
  loadStoredConfig, 
  loadStoredTransactions, 
  saveStoredAdmins,
  saveStoredActiveAdmin,
  saveStoredConfig, 
  saveStoredTransactions 
} from './utils/storage';
import { 
  apiDeleteTransaction, 
  apiResetDatabase, 
  apiRestoreDatabase, 
  apiSaveAdmins, 
  apiSaveConfig, 
  apiSaveTransaction, 
  fetchSharedData 
} from './utils/api';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { TransactionFilters } from './components/TransactionFilters';
import { TransactionList } from './components/TransactionList';
import { AuthModal } from './components/AuthModal';
import { TransactionModal } from './components/TransactionModal';
import { PdfExportModal } from './components/PdfExportModal';
import { ReceiptModal } from './components/ReceiptModal';
import { SettingsModal } from './components/SettingsModal';
import { ShareModal } from './components/ShareModal';

export default function App() {
  const [config, setConfig] = useState<AppConfig>(loadStoredConfig);
  const [transactions, setTransactions] = useState<Transaction[]>(loadStoredTransactions);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(loadStoredAdmins);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(() => {
    return loadStoredActiveAdmin(loadStoredAdmins());
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Baru saja');
  const [syncSuccess, setSyncSuccess] = useState<boolean>(true);

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Synchronize with centralized server
  const syncWithServer = useCallback(async (showIndicator = true) => {
    if (showIndicator) setIsSyncing(true);
    try {
      const serverData = await fetchSharedData();
      if (serverData) {
        if (Array.isArray(serverData.transactions)) {
          setTransactions(serverData.transactions);
          saveStoredTransactions(serverData.transactions);
        }
        if (serverData.config) {
          setConfig(serverData.config);
          saveStoredConfig(serverData.config);
        }
        if (Array.isArray(serverData.adminAccounts)) {
          setAdminAccounts(serverData.adminAccounts);
          saveStoredAdmins(serverData.adminAccounts);
        }
        setSyncSuccess(true);
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(timeStr);
      }
    } catch (err) {
      console.warn('Sync warning:', err);
    } finally {
      if (showIndicator) {
        setTimeout(() => setIsSyncing(false), 400);
      }
    }
  }, []);

  // Sync on initial mount & periodic polling
  useEffect(() => {
    syncWithServer(true);

    // Auto-poll every 12 seconds so shared links stay up to date across all devices
    const interval = setInterval(() => {
      syncWithServer(false);
    }, 12000);

    // Sync on tab focus
    const onFocus = () => syncWithServer(false);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') syncWithServer(false);
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [syncWithServer]);

  // Sync active admin session to storage
  useEffect(() => {
    saveStoredActiveAdmin(currentAdmin);
  }, [currentAdmin]);

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
          const matchRecorder = tx.recordedBy?.toLowerCase().includes(q);
          if (!matchDesc && !matchDonor && !matchReceipt && !matchCategory && !matchRecorder) return false;
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
    if (!currentAdmin) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    if (!currentAdmin) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!currentAdmin) {
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
      saveStoredTransactions(transactions.filter((t) => t.id !== id));
      await apiDeleteTransaction(id);
      syncWithServer(false);
    }
  };

  const handleSaveTransaction = async (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let targetTx: Transaction;

    if (existingId) {
      // Edit
      const existing = transactions.find(t => t.id === existingId);
      targetTx = {
        ...txData,
        id: existingId,
        createdAt: existing?.createdAt || Date.now(),
      };
      setTransactions((prev) => {
        const next = prev.map((item) => (item.id === existingId ? targetTx : item));
        saveStoredTransactions(next);
        return next;
      });
    } else {
      // Add
      targetTx = {
        ...txData,
        id: 'tx-' + Date.now(),
        createdAt: Date.now(),
      };
      setTransactions((prev) => {
        const next = [targetTx, ...prev];
        saveStoredTransactions(next);
        return next;
      });
    }

    // Save to server database immediately so all users see it
    await apiSaveTransaction(targetTx);
    syncWithServer(false);
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

  const handleAdminLogin = (admin: AdminAccount) => {
    setCurrentAdmin(admin);
    const updated = adminAccounts.map((a) =>
      a.id === admin.id ? { ...a, lastLoginAt: Date.now() } : a
    );
    setAdminAccounts(updated);
    apiSaveAdmins(updated);
  };

  const handleAdminLogout = () => {
    setCurrentAdmin(null);
  };

  const handleSaveConfig = async (newCfg: AppConfig) => {
    setConfig(newCfg);
    saveStoredConfig(newCfg);
    await apiSaveConfig(newCfg);
    syncWithServer(false);
  };

  const handleSaveAdmins = async (newAdmins: AdminAccount[]) => {
    setAdminAccounts(newAdmins);
    saveStoredAdmins(newAdmins);
    await apiSaveAdmins(newAdmins);
    syncWithServer(false);
  };

  const handleRestoreDatabase = async (newTx: Transaction[]) => {
    setTransactions(newTx);
    saveStoredTransactions(newTx);
    await apiRestoreDatabase({ transactions: newTx });
    syncWithServer(false);
  };

  const handleResetDatabase = async () => {
    setTransactions(INITIAL_TRANSACTIONS);
    saveStoredTransactions(INITIAL_TRANSACTIONS);
    await apiResetDatabase();
    syncWithServer(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* 1. Header with Mosque Logo and Admin Info */}
      <Header
        config={config}
        currentAdmin={currentAdmin}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleAdminLogout}
        onOpenAddModal={handleOpenAddModal}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Real-time synchronization status pill */}
      <div className="bg-emerald-900/10 border-b border-emerald-200/50 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-slate-600">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSyncing ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-600'}`}></span>
            </span>
            <span className="text-[11px] font-medium text-slate-700">
              Database Terpusat Aktif: <strong>Data Tersinkronisasi Otomatis Antar Perangkat & Link Share</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[11px]">
            <span className="hidden sm:inline text-slate-400">
              Sinkronisasi: {lastSyncTime}
            </span>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 font-bold text-teal-900 hover:text-teal-950 bg-teal-100 hover:bg-teal-200/80 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer border border-teal-300/60"
              title="Bagikan tautan kas ke jamaah & WhatsApp"
            >
              <Share2 className="w-3 h-3 text-teal-700" />
              <span>Bagikan Link Kas</span>
            </button>
            <button
              onClick={() => syncWithServer(true)}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200/80 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer"
              title="Perbarui data terbaru dari server"
            >
              <RotateCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-amber-600' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Segarkan Data'}</span>
            </button>
          </div>
        </div>
      </div>

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

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>Unduh Laporan PDF</span>
              </button>

              {!currentAdmin && (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-950" />
                  <span>Masuk Admin</span>
                </button>
              )}
            </div>
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
          isAuthenticated={!!currentAdmin}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onViewReceipt={handleViewReceipt}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Informative Notice for Jamaah & Admin */}
        <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80 text-xs text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">
                Transparansi & Akuntabilitas Kas Masjid Al-Ikhlas Pokek RW 004
              </p>
              <p className="text-emerald-800 text-[11px]">
                {currentAdmin ? (
                  <span>Anda masuk sebagai <strong>{currentAdmin.fullName}</strong> ({currentAdmin.roleLabel}). Setiap transaksi baru yang Anda simpan otomatis tersinkronisasi ke server dan dapat dilihat oleh seluruh jamaah pada link share.</span>
                ) : (
                  <span>Seluruh jamaah Dusun Pokek dapat memantau dan mencetak laporan kas kapan saja secara terbuka melalui link ini. Data selalu terhubung ke server terpusat DKM.</span>
                )}
              </p>
            </div>
          </div>

          {!currentAdmin ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-300 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Masuk Akun Admin</span>
            </button>
          ) : (
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-300 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kelola Akun Admin</span>
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
              Dusun Pokek RW 004 Desa Kawunganten, Kec. Cikaum, Kab. Subang - Jawa Barat 41266
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
            {currentAdmin ? (
              <button
                onClick={handleAdminLogout}
                className="text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Keluar ({currentAdmin.fullName})
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                Masuk Akun Admin
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        adminAccounts={adminAccounts}
        onSuccess={handleAdminLogin}
        onRegisterAdmin={(newAdmin) => handleSaveAdmins([...adminAccounts, newAdmin])}
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
        currentAdmin={currentAdmin}
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
        onSaveConfig={handleSaveConfig}
        transactions={transactions}
        onRestoreTransactions={handleRestoreDatabase}
        onResetTransactions={handleResetDatabase}
        adminAccounts={adminAccounts}
        onSaveAdmins={handleSaveAdmins}
        currentAdmin={currentAdmin}
        onUpdateCurrentAdmin={(updated) => setCurrentAdmin(updated)}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        config={config}
      />
    </div>
  );
}
