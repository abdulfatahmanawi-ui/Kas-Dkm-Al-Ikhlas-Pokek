import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  Calendar, 
  Layers, 
  Filter, 
  CheckCircle,
  Eye
} from 'lucide-react';
import { AppConfig, FundType, Transaction } from '../types';
import { generateKasPdfReport } from '../utils/pdfGenerator';
import { formatRupiah } from '../utils/formatters';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  config: AppConfig;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  config,
}) => {
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'this_year' | 'all' | 'custom'>('this_month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [fundType, setFundType] = useState<'all' | FundType>('all');
  const [txType, setTxType] = useState<'all' | 'in' | 'out'>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  // Filter transactions based on options
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const filteredTransactions = transactions.filter((tx) => {
    // Type filter
    if (txType !== 'all' && tx.type !== txType) return false;

    // Fund filter
    if (fundType !== 'all' && tx.fundType !== fundType) return false;

    // Period filter
    const txDate = new Date(tx.date + 'T00:00:00');
    if (period === 'this_month') {
      return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
    }
    if (period === 'last_month') {
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      return (
        txDate.getFullYear() === lastMonthDate.getFullYear() &&
        txDate.getMonth() === lastMonthDate.getMonth()
      );
    }
    if (period === 'this_year') {
      return txDate.getFullYear() === currentYear;
    }
    if (period === 'custom') {
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;
    }

    return true;
  });

  let totalIn = 0;
  let totalOut = 0;
  filteredTransactions.forEach((t) => {
    if (t.type === 'in') totalIn += t.amount;
    else totalOut += t.amount;
  });
  const balance = totalIn - totalOut;

  const getPeriodLabel = (): string => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    if (period === 'this_month') return `Bulan ${monthNames[currentMonth]} ${currentYear}`;
    if (period === 'last_month') {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return `Bulan ${monthNames[lastMonth]} ${lastYear}`;
    }
    if (period === 'this_year') return `Tahun ${currentYear}`;
    if (period === 'custom') {
      return `${startDate || 'Awal'} s.d. ${endDate || 'Sekarang'}`;
    }
    return 'Seluruh Riwayat Transaksi';
  };

  const getFundLabel = (): string => {
    if (fundType === 'operasional') return 'Kas Operasional & Masjid';
    if (fundType === 'pembangunan') return 'Kas Pembangunan & Renovasi';
    if (fundType === 'sosial') return 'Kas Sosial & Santunan Yatim';
    return 'Semua Pos Kas (Gabungan)';
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const doc = await generateKasPdfReport({
        transactions: filteredTransactions,
        config,
        periodLabel: getPeriodLabel(),
        fundTypeLabel: getFundLabel(),
      });
      const filename = `Laporan_Kas_DKM_Al-Ikhlas_Pokek_${period}_${Date.now()}.pdf`;
      doc.save(filename);
      onClose();
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewPdf = async () => {
    setIsGenerating(true);
    try {
      const doc = await generateKasPdfReport({
        transactions: filteredTransactions,
        config,
        periodLabel: getPeriodLabel(),
        fundTypeLabel: getFundLabel(),
      });
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Failed to preview PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center mx-auto mb-2 text-amber-300">
            <FileText className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-extrabold tracking-tight">
            Cetak Laporan Kas DKM Al-Ikhlas (PDF)
          </h3>
          <p className="text-emerald-200 text-xs mt-1">
            Dusun Pokek RW 004 Desa Kawunganten Kec. Cikaum Kab. Subang
          </p>
        </div>

        {/* Configuration Options */}
        <div className="p-6 space-y-4">
          
          {/* Period Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Pilih Periode Laporan:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPeriod('this_month')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  period === 'this_month'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Bulan Ini (Oktober)
              </button>
              <button
                type="button"
                onClick={() => setPeriod('last_month')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  period === 'last_month'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Bulan Lalu (September)
              </button>
              <button
                type="button"
                onClick={() => setPeriod('this_year')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  period === 'this_year'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tahun Ini (2026)
              </button>
              <button
                type="button"
                onClick={() => setPeriod('all')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  period === 'all'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Seluruh Waktu
              </button>
            </div>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setPeriod('custom')}
                className={`w-full py-1.5 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  period === 'custom'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Rentang Tanggal Khusus...
              </button>
            </div>
          </div>

          {/* Custom Date Inputs */}
          {period === 'custom' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-600 block mb-1">Mulai Tanggal:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Sampai Tanggal:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Pos Kas Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Pos Kas:
              </label>
              <select
                value={fundType}
                onChange={(e) => setFundType(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="all">Semua Pos Kas</option>
                <option value="operasional">Kas Operasional Masjid</option>
                <option value="pembangunan">Kas Pembangunan</option>
                <option value="sosial">Kas Sosial Yatim</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Jenis Arus:
              </label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="all">Semua (Masuk & Keluar)</option>
                <option value="in">Hanya Pemasukan (+)</option>
                <option value="out">Hanya Pengeluaran (-)</option>
              </select>
            </div>
          </div>

          {/* Report Summary Preview */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Data yang akan dicetak:</span>
              <strong className="text-slate-800">{filteredTransactions.length} Transaksi</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-medium">Total Pemasukan:</span>
              <span className="font-bold text-emerald-800">{formatRupiah(totalIn)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-700 font-medium">Total Pengeluaran:</span>
              <span className="font-bold text-rose-800">{formatRupiah(totalOut)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-bold">Saldo Akhir Periode:</span>
              <span className="font-extrabold text-sm text-emerald-800">{formatRupiah(balance)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={handlePreviewPdf}
              disabled={isGenerating || filteredTransactions.length === 0}
              className="w-full sm:w-1/2 py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              <span>Preview PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating || filteredTransactions.length === 0}
              className="w-full sm:w-1/2 py-2.5 px-4 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>{isGenerating ? 'Membuat PDF...' : 'Unduh Laporan PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
