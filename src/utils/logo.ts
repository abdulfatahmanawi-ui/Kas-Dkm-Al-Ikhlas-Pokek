/**
 * Official Logo generator for DKM AL-IKHLAS
 * Dusun Pokek RW 004 Desa Kawunganten Kec. Cikaum Kab. Subang
 */

export const DEFAULT_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#065f46" />
      <stop offset="50%" stop-color="#047857" />
      <stop offset="100%" stop-color="#064e3b" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <radialGradient id="domeGrad" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#fef3c7" />
      <stop offset="70%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Outer Ring with Gold Border -->
  <circle cx="100" cy="100" r="94" fill="url(#shieldGrad)" stroke="url(#goldGrad)" stroke-width="5" filter="url(#shadow)"/>
  <circle cx="100" cy="100" r="87" fill="none" stroke="#fef08a" stroke-width="1.2" stroke-dasharray="3,2" opacity="0.8"/>

  <!-- Inner circular field -->
  <circle cx="100" cy="100" r="82" fill="#064e3b" />

  <!-- Stars around circle -->
  <g fill="#fbbf24">
    <circle cx="28" cy="100" r="2.5" />
    <circle cx="172" cy="100" r="2.5" />
    <circle cx="36" cy="65" r="2" />
    <circle cx="164" cy="65" r="2" />
    <circle cx="36" cy="135" r="2" />
    <circle cx="164" cy="135" r="2" />
  </g>

  <!-- Base / Mosque Structure -->
  <!-- Main Mosque Dome -->
  <path d="M 68 108 C 68 76, 100 60, 100 50 C 100 60, 132 76, 132 108 Z" fill="url(#domeGrad)" stroke="#fef3c7" stroke-width="1.5"/>

  <!-- Crescent & Star on top of Dome -->
  <path d="M 100 48 Q 103 43 100 38 Q 104 40 106 43 Q 107 46 100 48 Z" fill="#fbbf24"/>
  <circle cx="103" cy="41" r="1.5" fill="#fef08a"/>

  <!-- Left Minaret -->
  <rect x="52" y="74" width="9" height="38" rx="1.5" fill="#047857" stroke="url(#goldGrad)" stroke-width="1.2"/>
  <path d="M 50 74 L 56.5 62 L 63 74 Z" fill="url(#goldGrad)"/>
  <circle cx="56.5" cy="60" r="1" fill="#fef08a"/>

  <!-- Right Minaret -->
  <rect x="139" y="74" width="9" height="38" rx="1.5" fill="#047857" stroke="url(#goldGrad)" stroke-width="1.2"/>
  <path d="M 137 74 L 143.5 62 L 150 74 Z" fill="url(#goldGrad)"/>
  <circle cx="143.5" cy="60" r="1" fill="#fef08a"/>

  <!-- Mosque Wall / Arch Windows -->
  <rect x="65" y="106" width="70" height="20" fill="#022c22" stroke="url(#goldGrad)" stroke-width="1"/>
  <!-- Arch Doors -->
  <path d="M 92 126 L 92 113 Q 100 108 108 113 L 108 126 Z" fill="url(#domeGrad)"/>
  <path d="M 74 126 L 74 116 Q 79 112 84 116 L 84 126 Z" fill="#065f46" stroke="#f59e0b" stroke-width="0.8"/>
  <path d="M 116 126 L 116 116 Q 121 112 126 116 L 126 126 Z" fill="#065f46" stroke="#f59e0b" stroke-width="0.8"/>

  <!-- Open Quran Symbol at bottom front -->
  <g transform="translate(100, 133)">
    <!-- Base ribbon / plinth -->
    <path d="M -48 10 L 48 10 L 42 22 L -42 22 Z" fill="#065f46" stroke="url(#goldGrad)" stroke-width="1.2"/>
    <!-- Book Stand (Rehal) -->
    <path d="M -12 8 L 0 -1 L 12 8 L 8 13 L 0 5 L -8 13 Z" fill="url(#goldGrad)"/>
    <!-- Open Holy Quran Pages -->
    <path d="M -15 0 C -10 -4, -4 -3, 0 1 C 4 -3, 10 -4, 15 0 L 14 7 C 9 3, 4 4, 0 8 C -4 4, -9 3, -14 7 Z" fill="#f8fafc" stroke="#d97706" stroke-width="0.8"/>
  </g>

  <!-- Typography: Header Arc Text (DKM AL-IKHLAS) -->
  <path id="textArcTop" d="M 38 68 A 72 72 0 0 1 162 68" fill="none"/>
  <text font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="13" fill="#fef08a" letter-spacing="2">
    <textPath href="#textArcTop" startOffset="50%" text-anchor="middle">
      MASJID AL-IKHLAS
    </textPath>
  </text>

  <!-- Typography: Subtitle Arc Text (POKEK - KAWUNGANTEN) -->
  <path id="textArcBottom" d="M 32 144 A 72 72 0 0 0 168 144" fill="none"/>
  <text font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="9" fill="#fef08a" letter-spacing="1.2">
    <textPath href="#textArcBottom" startOffset="50%" text-anchor="middle">
      DUSUN POKEK • CIKAUM SUBANG
    </textPath>
  </text>
</svg>`;

let cachedLogoDataUrl: string | null = null;

/**
 * Returns a PNG Data URL representing the mosque logo,
 * suitable for both <img> src and jsPDF addImage().
 */
export const getLogoDataUrl = async (): Promise<string> => {
  if (cachedLogoDataUrl) {
    return cachedLogoDataUrl;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const svgBlob = new Blob([DEFAULT_LOGO_SVG], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 400, 400);
          ctx.drawImage(img, 0, 0, 400, 400);
          cachedLogoDataUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(blobURL);
          resolve(cachedLogoDataUrl);
        } else {
          URL.revokeObjectURL(blobURL);
          resolve('data:image/svg+xml;utf8,' + encodeURIComponent(DEFAULT_LOGO_SVG));
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(blobURL);
        resolve('data:image/svg+xml;utf8,' + encodeURIComponent(DEFAULT_LOGO_SVG));
      };

      img.src = blobURL;
    } catch {
      resolve('data:image/svg+xml;utf8,' + encodeURIComponent(DEFAULT_LOGO_SVG));
    }
  });
};
