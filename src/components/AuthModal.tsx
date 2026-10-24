import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctPassword: string;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  correctPassword,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === correctPassword) {
      setError(false);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
      onSuccess();
      onClose();
      setPassword('');
    } else {
      setError(true);
      setErrorMessage('Kata sandi salah! Pastikan huruf besar/kecil sesuai.');
    }
  };

  const handleUseDefault = () => {
    setPassword(correctPassword);
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-lg text-amber-300">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-extrabold tracking-tight">
            Verifikasi Sandi Petugas Kas
          </h3>
          <p className="text-emerald-100 text-xs mt-1">
            DKM Masjid Al-Ikhlas Pokek RW 004 Kawunganten
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Dashboard dapat dipantau umum oleh jamaah. Hak penambahan dan pengeditan transaksi kas dilindungi kata sandi pengurus.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                Masukkan Kata Sandi Petugas
              </label>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Ketik kata sandi..."
                  autoFocus
                  className={`w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-rose-400 bg-rose-50/50 focus:ring-rose-400 text-rose-900'
                      : 'border-slate-300 bg-slate-50 focus:bg-white focus:ring-emerald-500/20 focus:border-emerald-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-rose-600 text-xs mt-1.5 font-medium flex items-center gap-1">
                  <span>•</span> {errorMessage}
                </p>
              )}
            </div>

            {/* Hint Box */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Sandi Default Awal:</span>
                <span className="font-mono font-bold text-slate-800 text-xs bg-slate-200/80 px-1.5 py-0.5 rounded">
                  {correctPassword}
                </span>
              </div>
              <button
                type="button"
                onClick={handleUseDefault}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Isi Otomatis
              </button>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl shadow-md transition-all active:scale-95"
              >
                Buka Akses Petugas
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
