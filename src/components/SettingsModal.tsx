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
  Image as ImageIcon,
  UserPlus,
  Trash2,
  Edit2,
  ShieldCheck,
  UserCheck,
  Mail,
  Briefcase
} from 'lucide-react';
import { AdminAccount, AdminRole, AppConfig, Transaction } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  transactions: Transaction[];
  onRestoreTransactions: (importedTransactions: Transaction[]) => void;
  onResetTransactions: () => void;
  adminAccounts: AdminAccount[];
  onSaveAdmins: (admins: AdminAccount[]) => void;
  currentAdmin: AdminAccount | null;
  onUpdateCurrentAdmin?: (admin: AdminAccount) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  transactions,
  onRestoreTransactions,
  onResetTransactions,
  adminAccounts,
  onSaveAdmins,
  currentAdmin,
  onUpdateCurrentAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'admins' | 'profile' | 'backup'>('admins');
  const [formData, setFormData] = useState<AppConfig>({ ...config });

  // State for adding/editing admin
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  
  const [adminForm, setAdminForm] = useState<{
    fullName: string;
    username: string;
    role: AdminRole;
    email: string;
    password: string;
  }>({
    fullName: '',
    username: '',
    role: 'petugas',
    email: '',
    password: '',
  });

  const [adminError, setAdminError] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    showNotification('Data masjid & pengurus berhasil disimpan!');
  };

  const handleOpenAddAdmin = () => {
    setEditingAdminId(null);
    setAdminForm({
      fullName: '',
      username: '',
      role: 'petugas',
      email: '',
      password: '',
    });
    setAdminError('');
    setIsAddingAdmin(true);
  };

  const handleOpenEditAdmin = (acc: AdminAccount) => {
    setIsAddingAdmin(false);
    setEditingAdminId(acc.id);
    setAdminForm({
      fullName: acc.fullName,
      username: acc.username,
      role: acc.role,
      email: acc.email || '',
      password: acc.password,
    });
    setAdminError('');
  };

  const handleSaveAdminForm = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (!adminForm.fullName.trim()) {
      setAdminError('Nama lengkap pengurus wajib diisi');
      return;
    }
    const cleanUsername = adminForm.username.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUsername || cleanUsername.length < 3) {
      setAdminError('Username minimal 3 karakter tanpa spasi');
      return;
    }

    // Check duplicate username if adding or changing username
    const duplicate = adminAccounts.find(
      (a) => a.username.toLowerCase() === cleanUsername && a.id !== editingAdminId
    );
    if (duplicate) {
      setAdminError(`Username "${cleanUsername}" sudah digunakan akun lain!`);
      return;
    }

    if (!adminForm.password || adminForm.password.length < 4) {
      setAdminError('Kata sandi minimal 4 karakter');
      return;
    }

    const roleLabels: Record<AdminRole, string> = {
      superadmin: 'Administrator Utama',
      bendahara: 'Bendahara Kas DKM',
      ketua: 'Ketua DKM Al-Ikhlas',
      petugas: 'Petugas Pencatat Kas',
    };

    if (editingAdminId) {
      // Edit existing
      const updated = adminAccounts.map((a) => {
        if (a.id === editingAdminId) {
          const mod: AdminAccount = {
            ...a,
            fullName: adminForm.fullName.trim(),
            username: cleanUsername,
            role: adminForm.role,
            roleLabel: roleLabels[adminForm.role],
            email: adminForm.email.trim() || undefined,
            password: adminForm.password,
          };
          if (currentAdmin && currentAdmin.id === a.id && onUpdateCurrentAdmin) {
            onUpdateCurrentAdmin(mod);
          }
          return mod;
        }
        return a;
      });
      onSaveAdmins(updated);
      setEditingAdminId(null);
      showNotification('Akun admin berhasil diperbarui!');
    } else {
      // Add new
      const newAcc: AdminAccount = {
        id: 'admin-' + Date.now(),
        fullName: adminForm.fullName.trim(),
        username: cleanUsername,
        role: adminForm.role,
        roleLabel: roleLabels[adminForm.role],
        email: adminForm.email.trim() || undefined,
        password: adminForm.password,
        createdAt: Date.now(),
      };
      onSaveAdmins([...adminAccounts, newAcc]);
      setIsAddingAdmin(false);
      showNotification(`Akun admin "${newAcc.fullName}" berhasil ditambahkan!`);
    }
  };

  const handleDeleteAdmin = (id: string, name: string) => {
    if (adminAccounts.length <= 1) {
      alert('Tidak dapat menghapus! Minimal harus ada 1 akun admin aktif.');
      return;
    }
    if (currentAdmin && currentAdmin.id === id) {
      alert('Anda sedang masuk dengan akun ini. Silakan keluar atau gunakan akun lain untuk menghapusnya.');
      return;
    }

    if (confirm(`Yakin ingin menghapus akun admin "${name}"?`)) {
      const filtered = adminAccounts.filter((a) => a.id !== id);
      onSaveAdmins(filtered);
      showNotification(`Akun "${name}" telah dihapus.`);
    }
  };

  // Export JSON
  const handleExportBackup = () => {
    const backupData = {
      version: '1.2',
      exportedAt: new Date().toISOString(),
      config,
      adminAccounts,
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
            onSaveConfig({ ...config, ...parsed.config });
            setFormData({ ...config, ...parsed.config });
          }
          if (parsed.adminAccounts && Array.isArray(parsed.adminAccounts)) {
            onSaveAdmins(parsed.adminAccounts);
          }
          alert(`Berhasil memulihkan ${parsed.transactions.length} data transaksi dan akun admin!`);
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

  // Handle Logo Upload
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
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Pengaturan Sistem Kas DKM Al-Ikhlas
              </h3>
              <p className="text-[11px] text-slate-400">
                Kelola Akun Admin, Profil Masjid Pokek RW 004, & Cadangan Data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            className={`flex-1 py-3 px-4 border-b-2 text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'admins'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Kelola Akun Admin ({adminAccounts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 border-b-2 text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Profil Masjid & Kop</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-3 px-4 border-b-2 text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Cadangan & Pulihkan</span>
          </button>
        </div>

        {notification && (
          <div className="bg-emerald-50 text-emerald-800 px-5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* TAB 1: KELOLA AKUN ADMIN */}
        {activeTab === 'admins' && (
          <div className="p-6 space-y-4">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  Daftar Akun Pengurus & Petugas Kas
                </h4>
                <p className="text-xs text-slate-500">
                  Akun yang berhak mencatat, mengedit, dan menghapus transaksi kas masjid.
                </p>
              </div>

              {!isAddingAdmin && !editingAdminId && (
                <button
                  type="button"
                  onClick={handleOpenAddAdmin}
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Buat Akun Admin</span>
                </button>
              )}
            </div>

            {/* Form for Add / Edit Admin */}
            {(isAddingAdmin || editingAdminId) && (
              <form onSubmit={handleSaveAdminForm} className="bg-slate-50 border border-emerald-300 rounded-2xl p-4.5 space-y-3.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    {editingAdminId ? 'Ubah Data Akun Admin' : 'Form Pembuatan Akun Admin Baru'}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setIsAddingAdmin(false); setEditingAdminId(null); }}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Lengkap Pengurus: *
                    </label>
                    <input
                      type="text"
                      value={adminForm.fullName}
                      onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                      placeholder="Contoh: Abdul Fatah / Bpk. Fulan"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Username: *
                    </label>
                    <input
                      type="text"
                      value={adminForm.username}
                      onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value.toLowerCase() })}
                      placeholder="admin_pokek"
                      className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Jabatan / Peran: *
                    </label>
                    <select
                      value={adminForm.role}
                      onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as AdminRole })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    >
                      <option value="superadmin">Administrator Utama</option>
                      <option value="bendahara">Bendahara Kas DKM</option>
                      <option value="ketua">Ketua DKM Al-Ikhlas</option>
                      <option value="petugas">Petugas Pencatat Kas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kata Sandi: *
                    </label>
                    <input
                      type="text"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      placeholder="Minimal 4 karakter"
                      className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Email (Opsional):
                    </label>
                    <input
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      placeholder="pengurus@gmail.com"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {adminError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {adminError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setIsAddingAdmin(false); setEditingAdminId(null); }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl shadow-sm"
                  >
                    Simpan Akun Admin
                  </button>
                </div>
              </form>
            )}

            {/* List of Admin Accounts */}
            <div className="space-y-2.5">
              {adminAccounts.map((acc) => {
                const isCurrent = currentAdmin?.id === acc.id || currentAdmin?.username === acc.username;

                return (
                  <div 
                    key={acc.id} 
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        acc.role === 'superadmin' ? 'bg-emerald-100 text-emerald-800' :
                        acc.role === 'bendahara' ? 'bg-amber-100 text-amber-800' :
                        acc.role === 'ketua' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {acc.fullName.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {acc.fullName}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full border border-emerald-300">
                              Sedang Aktif
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {acc.roleLabel}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-slate-600">user: <strong>{acc.username}</strong></span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">sandi: <strong>{acc.password}</strong></span>
                          {acc.email && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400">{acc.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAdmin(acc)}
                        className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                        title="Edit Akun Admin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAdmin(acc.id, acc.fullName)}
                        disabled={isCurrent || adminAccounts.length <= 1}
                        className="p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title={isCurrent ? "Tidak dapat menghapus akun yang sedang aktif" : "Hapus Akun Admin"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PROFIL MASJID & KOP PDF */}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kode Pos:
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="41266"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Kontak / WhatsApp DKM:
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="082323080878"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
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

        {/* TAB 3: BACKUP & RESTORE */}
        {activeTab === 'backup' && (
          <div className="p-6 space-y-5 text-xs">
            {/* Export */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Unduh File Cadangan (Backup JSON)</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Simpan seluruh data kas ({transactions.length} transaksi) dan akun admin ({adminAccounts.length} akun) ke file JSON di perangkat Anda.
              </p>
              <button
                type="button"
                onClick={handleExportBackup}
                className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Backup Lengkap (.json)</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Pulihkan Data dari File Cadangan (Restore)</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Pilih file JSON hasil backup sebelumnya untuk memulihkan seluruh data kas dan akun admin.
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
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs cursor-pointer"
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
