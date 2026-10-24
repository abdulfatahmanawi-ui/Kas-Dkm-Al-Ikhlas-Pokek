import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Receipt, 
  Edit3, 
  Trash2, 
  Calendar,
  User,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { Transaction } from '../types';
import { formatDateIndo, formatDateShort, formatRupiah, getCategoryBadgeColor } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  isAuthenticated: boolean;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onViewReceipt: (tx: Transaction) => void;
  onOpenAddModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isAuthenticated,
  onEdit,
  onDelete,
  onViewReceipt,
  onOpenAddModal,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Belum Ada Transaksi yang Cocok
        </h3>
        <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1">
          Tidak ditemukan catatan kas yang sesuai dengan kata kunci atau filter pencarian saat ini.
        </p>
        {isAuthenticated && (
          <button
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
          >
            + Tambah Transaksi Kas Baru
          </button>
        )}
      </div>
    );
  }

  // Calculate filtered totals
  let filteredIn = 0;
  let filteredOut = 0;
  transactions.forEach((t) => {
    if (t.type === 'in') filteredIn += t.amount;
    else filteredOut += t.amount;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      
      {/* Table Header Summary Bar */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Daftar Catatan Kas Masjid Al-Ikhlas
          </h3>
          <p className="text-xs text-slate-500">
            Transparansi buku kas penerimaan & pengeluaran Dusun Pokek RW 004
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Masuk: {formatRupiah(filteredIn)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Keluar: {formatRupiah(filteredOut)}</span>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">No</th>
              <th className="py-3.5 px-4 w-32">Tanggal & Bukti</th>
              <th className="py-3.5 px-4">Uraian Transaksi & Donatur</th>
              <th className="py-3.5 px-4 w-44">Kategori & Pos Kas</th>
              <th className="py-3.5 px-4 w-36 text-right">Nominal (Rp)</th>
              <th className="py-3.5 px-4 w-28 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx, idx) => {
              const isIncome = tx.type === 'in';
              const badgeClass = getCategoryBadgeColor(tx.category, tx.type);

              return (
                <tr 
                  key={tx.id} 
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Index */}
                  <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                    {idx + 1}
                  </td>

                  {/* Date & Receipt */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDateShort(tx.date)}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {tx.receiptNumber}
                    </div>
                  </td>

                  {/* Description & Donor */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900 text-sm">
                      {tx.description}
                    </div>
                    {tx.donorName && tx.donorName !== '-' && (
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Oleh/Kepada: <strong className="text-slate-700">{tx.donorName}</strong></span>
                      </div>
                    )}
                  </td>

                  {/* Category & Fund */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${badgeClass} mb-1`}>
                      {tx.category}
                    </span>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        tx.fundType === 'pembangunan' ? 'bg-amber-500' :
                        tx.fundType === 'sosial' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} />
                      <span className="capitalize">
                        {tx.fundType === 'pembangunan' ? 'Kas Pembangunan' :
                         tx.fundType === 'sosial' ? 'Kas Sosial Yatim' : 'Kas Operasional'}
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right">
                    <div className={`font-bold text-sm flex items-center justify-end gap-1 ${
                      isIncome ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{isIncome ? '+' : '-'}{formatRupiah(tx.amount)}</span>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                      isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* View / Print Kwitansi (Public) */}
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Lihat / Cetak Kwitansi Transaksi"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>

                      {/* Admin Controls */}
                      {isAuthenticated && (
                        <>
                          <button
                            onClick={() => onEdit(tx)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Data Transaksi"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(tx.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden divide-y divide-slate-100">
        {transactions.map((tx, idx) => {
          const isIncome = tx.type === 'in';
          const badgeClass = getCategoryBadgeColor(tx.category, tx.type);

          return (
            <div key={tx.id} className="p-4 space-y-2 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-xs text-slate-800">
                      {formatDateIndo(tx.date)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono ml-2">
                      #{tx.receiptNumber}
                    </span>
                  </div>
                </div>

                <div className={`font-bold text-sm ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
                </div>
              </div>

              <div>
                <p className="font-medium text-slate-900 text-xs sm:text-sm">
                  {tx.description}
                </p>
                {tx.donorName && tx.donorName !== '-' && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Oleh: <strong className="text-slate-700">{tx.donorName}</strong>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${badgeClass}`}>
                    {tx.category}
                  </span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {tx.fundType}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewReceipt(tx)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    <Receipt className="w-3 h-3" />
                    Kwitansi
                  </button>
                  {isAuthenticated && (
                    <>
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1 text-slate-600 hover:text-blue-600"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(tx.id)}
                        className="p-1 text-slate-600 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
