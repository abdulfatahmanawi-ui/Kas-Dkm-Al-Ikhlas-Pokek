import React from 'react';
import { 
  Building2, 
  FileText, 
  PlusCircle, 
  Lock, 
  Unlock, 
  Settings, 
  LogOut,
  Calendar,
  MapPin,
  CheckCircle2,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { AdminAccount, AppConfig } from '../types';
import { DEFAULT_LOGO_SVG } from '../utils/logo';
import { formatDateIndo } from '../utils/formatters';

interface HeaderProps {
  config: AppConfig;
  currentAdmin: AdminAccount | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAddModal: () => void;
  onOpenPdfModal: () => void;
  onOpenSettings: () => void;
  onOpenShareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  currentAdmin,
  onOpenAuth,
  onLogout,
  onOpenAddModal,
  onOpenPdfModal,
  onOpenSettings,
  onOpenShareModal,
}) => {
  const todayStr = formatDateIndo(new Date().toISOString().slice(0, 10));

  return (
    <header className="bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl border-b-4 border-amber-500">
      {/* Top Banner Ribbon */}
      <div className="bg-emerald-950/80 px-4 py-1.5 border-b border-emerald-700/50 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-emerald-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-700/60 text-emerald-100 px-2.5 py-0.5 rounded text-[11px] font-medium border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Sistem Transparansi Kas Terbuka Jamaah
            </span>
            <span className="hidden sm:inline text-emerald-400">•</span>
            <span className="hidden sm:flex items-center gap-1 text-emerald-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Dusun Pokek RW 004 Desa Kawunganten, Cikaum - Subang
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-200 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{todayStr}</span>
            </div>
            {currentAdmin ? (
              <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded text-[11px] font-semibold">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Petugas: <strong>{currentAdmin.fullName}</strong> ({currentAdmin.roleLabel})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-300 text-[11px]">
                <Lock className="w-3 h-3 text-slate-400" />
                Akses Publik / Jamaah
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Brand & Logo Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Mosque Logo & Name */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
            {/* Prominent Emblem Logo */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/10 p-1.5 shadow-2xl backdrop-blur border-2 border-amber-400/60 flex items-center justify-center transition-transform hover:scale-105 duration-200">
                {config.customLogoUrl ? (
                  <img
                    src={config.customLogoUrl}
                    alt="Logo DKM Al-Ikhlas"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: DEFAULT_LOGO_SVG }}
                  />
                )}
              </div>
              <div className="absolute -bottom-2 -right-1 bg-amber-500 text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-full shadow border border-white/50 tracking-wider">
                RW 004
              </div>
            </div>

            {/* Typography */}
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-amber-400 font-bold tracking-widest text-xs uppercase bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/30">
                  DEWAN KEMAKMURAN MASJID
                </span>
                <span className="text-emerald-300 text-xs hidden sm:inline">|</span>
                <span className="text-emerald-200 text-xs hidden sm:inline">Subang - Jawa Barat</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
                <span>MASJID AL-IKHLAS</span>
              </h1>
              <p className="text-emerald-100 text-sm sm:text-base font-medium mt-1">
                {config.addressLine}, {config.village}, {config.district}, {config.regency}
              </p>
              <p className="text-emerald-300/80 text-xs mt-0.5">
                Akuntabilitas, Amanah, dan Transparansi Pengelolaan Kas Rumah Allah SWT
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 w-full md:w-auto">
            {/* Cetak Laporan PDF (Always visible to public and admin) */}
            <button
              onClick={onOpenPdfModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-950/30 transition-all hover:shadow-amber-500/20 active:scale-95 text-sm cursor-pointer"
              title="Cetak Laporan Keuangan PDF Resmi"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>Cetak Laporan PDF</span>
            </button>

            {/* Bagikan Link Transparansi Kas */}
            <button
              onClick={onOpenShareModal}
              className="inline-flex items-center gap-2 bg-emerald-700/90 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl border border-emerald-500/50 shadow-md transition-all active:scale-95 text-sm cursor-pointer"
              title="Bagikan Tautan Transparansi Kas ke Jamaah & WhatsApp"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>Bagikan Link</span>
            </button>

            {/* Add Transaction Button & Admin Controls */}
            {currentAdmin ? (
              <>
                <button
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 transition-all active:scale-95 text-sm cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tambah Transaksi</span>
                </button>

                <button
                  onClick={onOpenSettings}
                  className="inline-flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-600/50 transition-all active:scale-95 text-sm cursor-pointer"
                  title="Kelola Akun Admin & Pengaturan Masjid"
                >
                  <Settings className="w-4 h-4 text-emerald-300" />
                  <span className="hidden lg:inline">Kelola Admin & Data</span>
                </button>

                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 px-3 py-2.5 rounded-xl border border-rose-700/50 transition-all active:scale-95 text-sm cursor-pointer"
                  title="Keluar dari Akun Admin"
                >
                  <LogOut className="w-4 h-4 text-rose-300" />
                  <span className="hidden lg:inline">Keluar</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-2 bg-emerald-800/90 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl border border-emerald-500/50 shadow-md transition-all active:scale-95 text-sm cursor-pointer"
                  title="Masuk menggunakan akun petugas kas"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Masuk Akun Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
