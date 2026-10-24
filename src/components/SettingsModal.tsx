import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  KeyRound, 
  Building2, 
  Users, 
  Database, 
  Download, 
  Upload, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import { AppConfig, Transaction } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  transactions: Transaction[];
  onRestoreTransactions: (importedTransactions: Transaction[]) => void;
  onResetTransactions: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  transactions,
  onRestoreTransactions,
  onResetTransactions,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'backup'>('profile');
  const [formData, setFormData] = useState<AppConfig>({ ...config });

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setNotification('Data masjid & pengurus berhasil disimpan!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (oldPassword !== config.adminPassword) {
      setPwdMsg({ text: 'Kata sandi lama salah!', isError: true });
      return;
    }
    if (newPassword.length < 4) {
      setPwdMsg({ text: 'Kata sandi baru minimal 4 karakter!', isError: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: 'Konfirmasi sandi baru tidak cocok!', isError: true });
      return;
    }

    const updated = { ...config, adminPassword: newPassword };
    onSaveConfig(updated);
    setFormData(updated);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPwdMsg({ text: 'Kata sandi berhasil diperbarui!', isError: false });
  };

  // Export JSON
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      config,
      transactions,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `Backup_KAS_DKM_Al-Ikhlas_Pokek_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          onRestoreTransactions(parsed.transactions);
          if (parsed.config) {
            onSaveConfig({ ...DEFAULT_CONFIG_FALLBACK, ...parsed.config });
            setFormData({ ...DEFAULT_CONFIG_FALLBACK, ...parsed.config });
          }
          alert(`Berhasil memulihkan ${parsed.transactions.length} data transaksi kas!`);
          onClose();
        } else {
          alert('Format file JSON tidak valid!');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const DEFAULT_CONFIG_FALLBACK = config;

  // Handle Logo Upload (Optional user replacement)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      setFormData({ ...formData, customLogoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Pengaturan Sistem Kas DKM Al-Ikhlas
              </h3>
              <p className="text-[11px] text-slate-400">
                Profil Masjid, Pengurus, Kata Sandi & Cadangan Data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 border-b-2 text-center transition-all ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Profil Masjid & Kop PDF
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 px-4 border-b-2 text-center transition-all ${
              activeTab === 'password'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Ganti Kata Sandi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-3 px-4 border-b-2 text-center transition-all ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Cadangan & Pulihkan
          </button>
        </div>

        {notification && (
          <div className="bg-emerald-50 text-emerald-800 px-5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {notification}
          </div>
        )}

        {/* Tab 1: Profile & Kop PDF */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Resmi Masjid:
                </label>
                <input
                  type="text"
                  value={formData.mosqueName}
                  onChange={(e) => setFormData({ ...formData, mosqueName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Dusun / Lingkungan:
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine}
                    onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Desa / Kelurahan:
                  </label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kecamatan:
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kabupaten:
                  </label>
                  <input
                    type="text"
                    value={formData.regency}
                    onChange={(e) => setFormData({ ...formData, regency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs mb-2">
                  Nama Penandatangan Laporan PDF Resmi:
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">
                      Ketua DKM Al-Ikhlas:
                    </label>
                    <input
                      type="text"
                      value={formData.ketuaDkm}
                      onChange={(e) => setFormData({ ...formData, ketuaDkm: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">
                      Bendahara Kas:
                    </label>
                    <input
                      type="text"
                      value={formData.bendahara}
                      onChange={(e) => setFormData({ ...formData, bendahara: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Logo custom upload */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  Ganti Gambar Logo DKM (Opsional):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {formData.customLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customLogoUrl: undefined })}
                      className="text-[11px] text-rose-600 hover:underline"
                    >
                      Reset ke Logo Asli
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl shadow cursor-pointer"
              >
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              Kata sandi ini digunakan pengurus untuk menambah, mengedit, atau menghapus transaksi kas masjid.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Lama:
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan sandi saat ini..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Baru:
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ulangi Sandi Baru:
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang sandi baru..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {pwdMsg && (
                <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                  pwdMsg.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {pwdMsg.text}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl shadow cursor-pointer"
              >
                Perbarui Kata Sandi
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="p-6 space-y-5 text-xs">
            {/* Export */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Unduh File Cadangan (Backup JSON)</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Simpan seluruh rekaman transaksi kas ({transactions.length} data) ke file JSON di komputer atau HP Anda agar data aman.
              </p>
              <button
                type="button"
                onClick={handleExportBackup}
                className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Backup Kas (.json)</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Pulihkan Data dari File Cadangan (Restore)</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Pilih file JSON hasil backup sebelumnya untuk memulihkan seluruh data kas.
              </p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Pilih File Backup JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {/* Reset to Default */}
            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Reset ke Data Contoh Awal</span>
              </div>
              <p className="text-rose-700 leading-relaxed text-[11px]">
                Mengembalikan transaksi ke contoh bawaan Masjid DKM Al-Ikhlas Dusun Pokek RW 004.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Yakin ingin mereset transaksi ke data contoh awal?')) {
                    onResetTransactions();
                    alert('Data transaksi telah direset ke contoh awal.');
                  }
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs"
              >
                Reset Transaksi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
