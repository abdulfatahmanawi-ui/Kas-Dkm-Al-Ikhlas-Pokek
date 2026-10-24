import React, { useState } from 'react';
import { X, Download, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import { AppConfig, Transaction } from '../types';
import { formatDateIndo, formatDateShort, formatRupiah, terbilang } from '../utils/formatters';
import { generateSingleReceiptPdf } from '../utils/pdfGenerator';
import { DEFAULT_LOGO_SVG } from '../utils/logo';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  config: AppConfig;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  config,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === 'in';

  const handleDownloadReceiptPdf = async () => {
    setIsDownloading(true);
    try {
      const doc = await generateSingleReceiptPdf(transaction, config);
      doc.save(`Kwitansi_${transaction.receiptNumber}.pdf`);
    } catch (err) {
      console.error('Failed to generate receipt PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header toolbar */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700">
              Bukti Transaksi Resmi Kas Masjid
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kwitansi Body (Paper Look) */}
        <div className="p-6 bg-slate-50">
          <div className="bg-white border-2 border-emerald-800/40 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {/* Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <div 
                className="w-48 h-48"
                dangerouslySetInnerHTML={{ __html: DEFAULT_LOGO_SVG }}
              />
            </div>

            {/* Kop Inside Kwitansi */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200">
              <div className="w-12 h-12 shrink-0">
                {config.customLogoUrl ? (
                  <img src={config.customLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <div 
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: DEFAULT_LOGO_SVG }}
                  />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-xs text-emerald-900 leading-tight">
                  {config.mosqueName}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {config.addressLine}, {config.village}, {config.district}, {config.regency}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {isIncome ? 'KWITANSI KAS' : 'BUKTI KELUAR'}
                </span>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  #{transaction.receiptNumber}
                </p>
              </div>
            </div>

            {/* Data Details */}
            <div className="mt-4 space-y-2.5 text-xs text-slate-700">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">
                  {isIncome ? 'Diterima Dari' : 'Dibayarkan Ke'}
                </span>
                <span className="col-span-2 font-bold text-slate-900">
                  : {transaction.donorName || (isIncome ? 'Jamaah Dusun Pokek' : '-')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Uang Sejumlah</span>
                <span className="col-span-2 font-semibold text-emerald-900 italic">
                  : {terbilang(transaction.amount)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Untuk Keperluan</span>
                <span className="col-span-2 text-slate-800">
                  : {transaction.description}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Kategori & Pos</span>
                <span className="col-span-2 text-slate-700">
                  : {transaction.category} ({transaction.fundType.toUpperCase()})
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Tanggal</span>
                <span className="col-span-2 text-slate-700">
                  : {formatDateIndo(transaction.date)}
                </span>
              </div>
            </div>

            {/* Amount Banner */}
            <div className="mt-5 p-3 rounded-xl bg-emerald-800 text-white flex items-center justify-between">
              <span className="text-xs uppercase font-medium text-emerald-200">
                Jumlah Nominal:
              </span>
              <span className="text-lg font-extrabold text-amber-300">
                {formatRupiah(transaction.amount)}
              </span>
            </div>

            {/* Signatures */}
            <div className="mt-6 pt-4 border-t border-dashed border-slate-200 flex justify-between text-[11px] text-slate-600">
              <div className="text-center w-28">
                <p>Mengetahui,</p>
                <div className="h-10"></div>
                <p className="font-bold text-slate-800">{config.ketuaDkm}</p>
                <p className="text-[10px] text-slate-400">Ketua DKM</p>
              </div>

              <div className="text-center w-28">
                <p>Kawunganten, {formatDateShort(transaction.date)}</p>
                <div className="h-10"></div>
                <p className="font-bold text-slate-800">{config.bendahara}</p>
                <p className="text-[10px] text-slate-400">Bendahara</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleDownloadReceiptPdf}
            disabled={isDownloading}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Membuat...' : 'Unduh Kwitansi PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
