import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  Tag, 
  Layers, 
  FileText, 
  User, 
  Hash,
  CheckCircle2
} from 'lucide-react';
import { FundType, Transaction, TransactionType } from '../types';
import { 
  DEFAULT_EXPENSE_CATEGORIES, 
  DEFAULT_INCOME_CATEGORIES, 
  formatRupiah, 
  terbilang 
} from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  initialData?: Transaction | null;
  suggestedReceiptNumber: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  suggestedReceiptNumber,
}) => {
  const [type, setType] = useState<TransactionType>('in');
  const [amountStr, setAmountStr] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [fundType, setFundType] = useState<FundType>('operasional');
  const [description, setDescription] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmountStr(String(initialData.amount));
      setDate(initialData.date);
      setFundType(initialData.fundType);
      setDescription(initialData.description);
      setDonorName(initialData.donorName || '');
      setReceiptNumber(initialData.receiptNumber);

      const defaultCats = initialData.type === 'in' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
      if (defaultCats.includes(initialData.category)) {
        setCategory(initialData.category);
        setCustomCategory('');
      } else {
        setCategory('custom');
        setCustomCategory(initialData.category);
      }
    } else {
      // Reset form
      setType('in');
      setAmountStr('');
      setDate(new Date().toISOString().slice(0, 10));
      setCategory(DEFAULT_INCOME_CATEGORIES[0]);
      setCustomCategory('');
      setFundType('operasional');
      setDescription('');
      setDonorName('');
      setReceiptNumber(suggestedReceiptNumber);
      setError('');
    }
  }, [initialData, suggestedReceiptNumber, isOpen]);

  // When type changes, update category selection
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (!initialData) {
      const cats = newType === 'in' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
      setCategory(cats[0]);
      setCustomCategory('');
    }
  };

  const currentCategories = type === 'in' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
  const parsedAmount = Number(amountStr.replace(/[^0-9]/g, '')) || 0;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (parsedAmount <= 0) {
      setError('Nominal harus lebih besar dari Rp 0');
      return;
    }

    const finalCategory = category === 'custom' ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Silakan pilih atau isi kategori transaksi');
      return;
    }

    if (!description.trim()) {
      setError('Uraian/Keterangan transaksi wajib diisi');
      return;
    }

    onSave({
      type,
      amount: parsedAmount,
      date,
      category: finalCategory,
      fundType,
      description: description.trim(),
      donorName: donorName.trim() || (type === 'in' ? 'Jamaah Dusun Pokek' : '-'),
      receiptNumber: receiptNumber.trim() || suggestedReceiptNumber,
      recordedBy: 'Pengurus Kas DKM'
    }, initialData?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          type === 'in'
            ? 'bg-gradient-to-r from-emerald-800 to-teal-800'
            : 'bg-gradient-to-r from-rose-800 to-red-800'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded border border-white/20">
                {type === 'in' ? 'Pemasukan Kas' : 'Pengeluaran Kas'}
              </span>
              <span className="text-xs text-white/80">
                {initialData ? 'Mode Edit Data' : 'Transaksi Baru'}
              </span>
            </div>
            <h3 className="text-lg font-extrabold mt-1">
              {initialData ? 'Ubah Catatan Kas Masjid' : 'Tambah Transaksi Kas DKM'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Toggle Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Jenis Arus Kas:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('in')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                  type === 'in'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowDownLeft className={`w-4 h-4 ${type === 'in' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>+ Pemasukan (Infaq/Donasi)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('out')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                  type === 'out'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight className={`w-4 h-4 ${type === 'out' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>- Pengeluaran (Biaya/Operasional)</span>
              </button>
            </div>
          </div>

          {/* Nominal Input & Live Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nominal Transaksi (Rp): *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-500">
                Rp
              </span>
              <input
                type="text"
                value={amountStr ? Number(amountStr.replace(/[^0-9]/g, '')).toLocaleString('id-ID') : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setAmountStr(raw);
                }}
                placeholder="0"
                className="w-full pl-11 pr-4 py-2.5 text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
              />
            </div>
            {parsedAmount > 0 && (
              <p className="text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg mt-1 border border-emerald-200/60 italic">
                Terbilang: {terbilang(parsedAmount)}
              </p>
            )}
          </div>

          {/* Date & Receipt Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Transaksi: *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                Nomor Bukti / Kwitansi:
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="KAS-IKH-..."
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Pos Kas & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Alokasi Pos Rekening Kas: *
              </label>
              <select
                value={fundType}
                onChange={(e) => setFundType(e.target.value as FundType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="operasional">Kas Operasional & Masjid</option>
                <option value="pembangunan">Kas Pembangunan & Renovasi</option>
                <option value="sosial">Kas Sosial & Santunan Yatim</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Kategori Transaksi: *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              >
                {currentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="custom">+ Kategori Lainnya (Ketik Manual)</option>
              </select>
            </div>
          </div>

          {/* Custom Category input if chosen */}
          {category === 'custom' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ketik Nama Kategori Baru:
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Contoh: Pengadaan Karpet Mihrab..."
                className="w-full px-3 py-2 text-xs bg-white border border-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}

          {/* Donor / Receiver Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {type === 'in' ? 'Nama Donatur / Penyetor:' : 'Dibayarkan Kepada / Penerima:'}
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder={type === 'in' ? 'Contoh: Hamba Allah / Jamaah Dusun Pokek / Bpk. Fulan' : 'Contoh: Toko Bangunan / Marbot / PLN Subang'}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Uraian & Rincian Transaksi: *
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Infaq keliling Sholat Jumat minggu ke-3 atau Pembelian pasir pasang 2 truk"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
                type === 'in'
                  ? 'bg-emerald-700 hover:bg-emerald-600'
                  : 'bg-rose-700 hover:bg-rose-600'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialData ? 'Simpan Perubahan' : 'Simpan Transaksi Kas'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
