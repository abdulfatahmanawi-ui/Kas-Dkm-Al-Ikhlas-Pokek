import React, { useState } from 'react';
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  X, 
  User, 
  UserPlus, 
  LogIn, 
  ShieldAlert,
  CheckCircle2,
  Mail,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdminAccount, AdminRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminAccounts: AdminAccount[];
  onSuccess: (admin: AdminAccount) => void;
  onRegisterAdmin?: (newAdmin: AdminAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  adminAccounts,
  onSuccess,
  onRegisterAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<AdminRole>('petugas');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const query = usernameOrEmail.trim().toLowerCase();
    const targetPassword = password.trim();

    // Find account by username, email, or fallback to legacy password
    const matchedAccount = adminAccounts.find(
      (acc) =>
        (acc.username.toLowerCase() === query ||
         (acc.email && acc.email.toLowerCase() === query)) &&
        acc.password === targetPassword
    );

    // Also support fallback if user just enters "ikhlas123" without matching username
    const fallbackAccount = !matchedAccount && targetPassword === 'ikhlas123'
      ? adminAccounts.find(a => a.username === 'bendahara') || adminAccounts[0]
      : null;

    const authenticatedAdmin = matchedAccount || fallbackAccount;

    if (authenticatedAdmin) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
      onSuccess(authenticatedAdmin);
      onClose();
      setPassword('');
      setErrorMessage('');
    } else {
      setErrorMessage('Username atau kata sandi tidak cocok. Silakan periksa kembali!');
    }
  };

  const handleSelectQuickAccount = (acc: AdminAccount) => {
    setUsernameOrEmail(acc.username);
    setPassword(acc.password);
    setErrorMessage('');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regFullName.trim()) {
      setRegError('Nama lengkap pengurus wajib diisi');
      return;
    }
    const cleanUsername = regUsername.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUsername || cleanUsername.length < 3) {
      setRegError('Username minimal 3 karakter tanpa spasi');
      return;
    }

    if (adminAccounts.some(a => a.username.toLowerCase() === cleanUsername)) {
      setRegError('Username tersebut sudah digunakan pengurus lain');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('Kata sandi minimal 4 karakter');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi kata sandi tidak cocok');
      return;
    }

    const roleLabels: Record<AdminRole, string> = {
      superadmin: 'Administrator Utama',
      bendahara: 'Bendahara Kas DKM',
      ketua: 'Ketua DKM Al-Ikhlas',
      petugas: 'Petugas Pencatat Kas'
    };

    const newAdmin: AdminAccount = {
      id: 'admin-' + Date.now(),
      username: cleanUsername,
      fullName: regFullName.trim(),
      email: regEmail.trim() || undefined,
      role: regRole,
      roleLabel: roleLabels[regRole],
      password: regPassword,
      createdAt: Date.now(),
    };

    if (onRegisterAdmin) {
      onRegisterAdmin(newAdmin);
    }
    onSuccess(newAdmin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center mx-auto mb-2.5 shadow-lg text-amber-300">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">
            Portal Akun Admin & Petugas Kas
          </h3>
          <p className="text-emerald-200 text-xs mt-1">
            DKM Masjid Al-Ikhlas Dusun Pokek RW 004 Kawunganten
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk Akun Admin</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setRegError(''); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Buat Akun Admin Baru</span>
          </button>
        </div>

        {/* Tab Content: LOGIN */}
        {activeTab === 'login' && (
          <div className="p-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Pilih akun admin di bawah untuk pengisian cepat atau ketik username dan kata sandi Anda.
              </p>
            </div>

            {/* Quick Account Picker */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Pilihan Akun Admin Terdaftar:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {adminAccounts.map((acc) => {
                  const isSelected = usernameOrEmail.toLowerCase() === acc.username.toLowerCase();
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectQuickAccount(acc)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-slate-800 truncate">{acc.fullName}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">{acc.roleLabel}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">user: {acc.username}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Username atau Email:
                </label>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => {
                    setUsernameOrEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Contoh: admin atau abdulfatahmanawi@gmail.com"
                  autoFocus
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  Kata Sandi:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Masukkan sandi akun..."
                    className="w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Petugas Kas</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Content: REGISTER / BUAT AKUN ADMIN */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                Daftarkan akun pengurus DKM Al-Ikhlas baru untuk pencatatan transaksi kas RW 004 Dusun Pokek.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Nama Lengkap Pengurus: *
              </label>
              <input
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Contoh: Ust. Abdul Fatah / Bpk. Fulan"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username: *
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase())}
                  placeholder="admin_baru"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  Jabatan / Peran: *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="petugas">Petugas Kas / Pencatat</option>
                  <option value="bendahara">Bendahara Kas DKM</option>
                  <option value="ketua">Ketua DKM Al-Ikhlas</option>
                  <option value="superadmin">Administrator Utama</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Pengurus (Opsional):
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="pengurus@gmail.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi: *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ulangi Sandi: *
                </label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang sandi"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {regError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {regError}
              </div>
            )}

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Kembali ke Masuk
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Simpan & Masuk</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
