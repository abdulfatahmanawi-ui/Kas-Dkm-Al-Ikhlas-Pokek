import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Eye, 
  MessageCircle,
  QrCode,
  Building2,
  Lock
} from 'lucide-react';
import { AppConfig } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Clean shareable URL
  const currentUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';

  const waMessage = `*TRANSPARANSI KAS MASJID DKM AL-IKHLAS*\n` +
    `Dusun Pokek RW 004, Desa Kawunganten, Kec. Cikaum, Kab. Subang\n\n` +
    `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
    `Bapak/Ibu/Saudara Jamaah dan Warga Dusun Pokek RW 004 yang dirahmati Allah SWT, berikut kami bagikan tautan laporan kas keuangan Masjid Al-Ikhlas yang dapat dipantau langsung secara terbuka & transparan:\n\n` +
    `🌐 *Link Transparansi Kas:* \n${currentUrl}\n\n` +
    `Fitur untuk Jamaah:\n` +
    `• Pantau Saldo Kas Terkini (Operasional, Pembangunan, Sosial)\n` +
    `• Lihat rincian infaq & pengeluaran secara real-time\n` +
    `• Cetak & unduh Laporan PDF resmi DKM\n\n` +
    `Semoga infaq dan sedekah seluruh jamaah menjadi amal jariyah dan dibalas berlipat ganda oleh Allah SWT. Aamiin Yaa Rabbal 'Alamiin.\n\n` +
    `_Pengurus DKM Al-Ikhlas Pokek RW 004_`;

  const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Kas DKM Al-Ikhlas Dusun Pokek RW 004`,
          text: `Laporan Transparansi Kas Masjid DKM Al-Ikhlas Dusun Pokek RW 004 Desa Kawunganten, Cikaum - Subang`,
          url: currentUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Bagikan Tautan Kas Masjid</h2>
              <p className="text-emerald-200 text-xs">
                DKM Al-Ikhlas Dusun Pokek RW 004, Desa Kawunganten
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Transparency & Security Guarantee */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-950">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-emerald-900 text-sm">
                Aman & Terbuka untuk Seluruh Jamaah
              </p>
              <p className="text-emerald-800 leading-relaxed">
                Tautan ini dapat diakses oleh seluruh warga & jamaah tanpa perlu login. Jamaah dapat melihat saldo terkini dan mencetak laporan keuangan. Fitur tambah atau ubah transaksi tetap terlindungi kata sandi petugas DKM.
              </p>
            </div>
          </div>

          {/* Link Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tautan Transparansi Kas (URL)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-mono truncate select-all">
                {currentUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Tautan berhasil disalin ke papan klip (clipboard). Siap dibagikan!
              </p>
            )}
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* WhatsApp Share Button */}
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 text-xs text-center cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Bagikan ke WhatsApp</span>
            </a>

            {/* Native Mobile Share / Copy */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 text-xs text-center cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>Bagikan Lewat HP / Media Lain</span>
            </button>
          </div>

          {/* Quick info note */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Informasi bagi Pengurus & Jamaah:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              <li>Data kas tersinkronisasi otomatis secara terpusat antar perangkat pengurus dan jamaah.</li>
              <li>Ketika bendahara atau admin mencatat infaq baru, seluruh jamaah yang membuka link ini akan otomatis melihat data terbarukan.</li>
              <li>Laporan PDF dapat dicetak langsung dari smartphone atau komputer oleh siapa saja.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            DKM Al-Ikhlas • Subang, Jawa Barat 41266
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
