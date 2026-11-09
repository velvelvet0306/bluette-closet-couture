import React, { useState } from 'react';
import type { ClothingItem } from '@/lib/bluette/types';

interface GarmentVisualProps {
  item: ClothingItem;
  className?: string;
  showBadge?: boolean;
}

export const GarmentVisual: React.FC<GarmentVisualProps> = ({
  item,
  className = 'w-full h-56',
  showBadge = false,
}) => {
  const [hasError, setHasError] = useState(false);

  // If item has a real image (e.g. uploaded photo or custom URL)
  if (item.photoUrl && !item.photoUrl.startsWith('svg-') && !hasError) {
    return (
      <div className={`relative overflow-hidden bg-porcelain flex items-center justify-center ${className}`}>
        <img
          src={item.photoUrl}
          alt={item.name}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {item.isAnalyzing && (
          <div className="absolute inset-0 bg-ice/40 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="bg-paper px-3 py-1 rounded-full text-[10px] font-round font-bold text-ocean border border-sky shadow-sm flex items-center gap-1.5 animate-pulse">
              <span className="text-butter">✦</span>
              <span>AI recognizing...</span>
            </div>
          </div>
        )}
        {showBadge && (
          <div className="absolute top-2.5 right-2.5 bg-paper/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] text-haze font-semibold border border-frost shadow-xs">
            {item.category}
          </div>
        )}
      </div>
    );
  }

  // Soft Blue Coquette Curated Vector Artworks
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-paper to-porcelain flex items-center justify-center p-3 select-none ${className}`}>
      <div className="absolute inset-0 opacity-40 bg-dots-soft pointer-events-none" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {renderAestheticIllustration(item)}
      </div>

      {showBadge && (
        <div className="absolute top-2.5 right-2.5 bg-paper/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] text-haze font-semibold border border-frost shadow-2xs">
          {item.category}
        </div>
      )}
    </div>
  );
};

function renderAestheticIllustration(item: ClothingItem) {
  const { category, photoUrl } = item;

  if (photoUrl === 'svg-top-blouse' || (category === 'Tops' && photoUrl.includes('blouse'))) {
    return (
      <svg viewBox="0 0 120 120" className="w-4/5 h-4/5 max-h-[160px]" fill="none">
        {/* Soft Powder Blue Silk Blouse with Delicate Ribbon Bow */}
        <path d="M48 22 C54 28, 66 28, 72 22 L76 30 C68 36, 52 36, 44 30 Z" fill="#FFFFFF" stroke="#95BDD7" strokeWidth="1.5" />
        <path d="M38 32 L20 48 L28 54 L36 42 L34 94 C48 98, 72 98, 86 94 L84 42 L92 54 L100 48 L82 32 C74 36, 46 36, 38 32 Z" 
              fill="#B4E1EB" stroke="#78A4CB" strokeWidth="1.8" />
        {/* Delicate Chiffon Ribbon Bow */}
        <path d="M60 28 C52 18, 38 20, 40 30 C42 36, 56 32, 60 28 Z" fill="#95BDD7" stroke="#78A4CB" strokeWidth="1.2" />
        <path d="M60 28 C68 18, 82 20, 80 30 C78 36, 64 32, 60 28 Z" fill="#95BDD7" stroke="#78A4CB" strokeWidth="1.2" />
        <circle cx="60" cy="28" r="3" fill="#78A4CB" />
        <path d="M58 31 C54 44, 46 52, 42 56" stroke="#95BDD7" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M62 31 C66 44, 74 52, 78 56" stroke="#95BDD7" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (photoUrl === 'svg-top-cardigan') {
    return (
      <svg viewBox="0 0 120 120" className="w-4/5 h-4/5 max-h-[160px]" fill="none">
        {/* Butter Yellow Cardigan with Pearl Buttons */}
        <path d="M36 30 L16 52 L26 58 L36 44 L36 94 C50 97, 70 97, 84 94 L84 44 L94 58 L104 52 L84 30 C76 34, 44 34, 36 30 Z" 
              fill="#F9E8A2" stroke="#E5CD6E" strokeWidth="1.8" />
        <path d="M46 30 C44 42, 60 42, 60 30" fill="#FFFFFF" stroke="#E5CD6E" strokeWidth="1.2" />
        <path d="M60 30 C60 42, 76 42, 74 30" fill="#FFFFFF" stroke="#E5CD6E" strokeWidth="1.2" />
        {/* Little pearl buttons */}
        <circle cx="60" cy="46" r="2.5" fill="#FFFFFF" stroke="#E5CD6E" strokeWidth="1" />
        <circle cx="60" cy="58" r="2.5" fill="#FFFFFF" stroke="#E5CD6E" strokeWidth="1" />
        <circle cx="60" cy="70" r="2.5" fill="#FFFFFF" stroke="#E5CD6E" strokeWidth="1" />
        <circle cx="60" cy="82" r="2.5" fill="#FFFFFF" stroke="#E5CD6E" strokeWidth="1" />
      </svg>
    );
  }

  if (photoUrl === 'svg-bottom-skirt') {
    return (
      <svg viewBox="0 0 120 120" className="w-4/5 h-4/5 max-h-[160px]" fill="none">
        {/* Soft Blue Pleated Skirt */}
        <path d="M42 26 H78 L80 34 H40 Z" fill="#FFFFFF" stroke="#78A4CB" strokeWidth="1.5" />
        <path d="M40 34 L22 96 C40 102, 80 102, 98 96 L80 34 Z" fill="#95BDD7" stroke="#78A4CB" strokeWidth="1.8" />
        {/* Pleat lines */}
        <path d="M46 34 L36 98" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
        <path d="M56 34 L52 99" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
        <path d="M64 34 L68 99" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
        <path d="M74 34 L84 98" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
        {/* Bow on waistband */}
        <circle cx="60" cy="30" r="2.5" fill="#F9E8A2" />
        <path d="M57 30 C52 26, 48 30, 52 32 Z" fill="#F9E8A2" />
        <path d="M63 30 C68 26, 72 30, 68 32 Z" fill="#F9E8A2" />
      </svg>
    );
  }

  if (photoUrl === 'svg-dress-yellow') {
    return (
      <svg viewBox="0 0 120 120" className="w-4/5 h-4/5 max-h-[160px]" fill="none">
        {/* Butter Yellow Broderie Anglaise Dress */}
        <path d="M44 20 C52 26, 68 26, 76 20 L86 38 L80 42 L72 38 L72 50 H48 L48 38 L40 42 L34 38 Z" 
              fill="#F9E8A2" stroke="#E5CD6E" strokeWidth="1.8" />
        {/* Puffed sleeves */}
        <ellipse cx="36" cy="34" rx="7" ry="9" fill="#F9E8A2" stroke="#E5CD6E" strokeWidth="1.5" />
        <ellipse cx="84" cy="34" rx="7" ry="9" fill="#F9E8A2" stroke="#E5CD6E" strokeWidth="1.5" />
        {/* Cinched Powder Blue Ribbon Sash */}
        <rect x="47" y="49" width="26" height="5" fill="#B4E1EB" stroke="#78A4CB" strokeWidth="1" />
        {/* Flowing Skirt */}
        <path d="M47 54 L26 104 C48 110, 72 110, 94 104 L73 54 Z" fill="#F9E8A2" stroke="#E5CD6E" strokeWidth="1.8" />
        <circle cx="60" cy="51.5" r="3" fill="#B4E1EB" />
      </svg>
    );
  }

  if (photoUrl === 'svg-dress-blue') {
    return (
      <svg viewBox="0 0 120 120" className="w-4/5 h-4/5 max-h-[160px]" fill="none">
        {/* Baby Blue Babydoll Slip Dress */}
        <path d="M44 22 L44 36 L48 42 H72 L76 36 L76 22" stroke="#78A4CB" strokeWidth="1.5" />
        <path d="M44 38 C54 44, 66 44, 76 38 L78 52 H42 Z" fill="#FFFFFF" stroke="#78A4CB" strokeWidth="1.5" />
        <path d="M42 52 L26 106 C50 112, 70 112, 94 106 L78 52 Z" fill="#B4E1EB" stroke="#78A4CB" strokeWidth="1.8" />
        {/* Scalloped hem */}
        <path d="M30 98 C46 102, 74 102, 90 98" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 2" />
        {/* Tiny Dainty Ribbon at Center */}
        <circle cx="60" cy="42" r="2.5" fill="#95BDD7" />
      </svg>
    );
  }

  if (photoUrl === 'svg-shoe-maryjane') {
    return (
      <svg viewBox="0 0 120 120" className="w-4/5 h-4/5 max-h-[160px]" fill="none">
        {/* Soft Blue Patent Mary Jane with Bow */}
        <path d="M22 66 C26 54, 46 54, 52 64 L72 68 C84 70, 94 76, 96 84 C84 87, 44 87, 24 84 C20 78, 20 70, 22 66 Z" 
              fill="#95BDD7" stroke="#78A4CB" strokeWidth="1.8" />
        <path d="M26 84 L26 94 L34 94 L36 84" fill="#78A4CB" />
        {/* Little Mary Jane instep strap & buckle */}
        <path d="M44 62 C50 68, 54 72, 60 67" stroke="#78A4CB" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="52" cy="67" r="2.5" fill="#F9E8A2" />
      </svg>
    );
  }

  if (photoUrl === 'svg-acc-bag') {
    return (
      <svg viewBox="0 0 120 120" className="w-4/5 h-4/5 max-h-[160px]" fill="none">
        {/* Satin Bow Handbag with Pearl Handle */}
        <path d="M44 48 C44 26, 76 26, 76 48" stroke="#B4E1EB" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M36 48 L28 92 C46 95, 74 95, 92 92 L84 48 Z" fill="#78A4CB" stroke="#5A88B3" strokeWidth="1.8" />
        <path d="M36 48 L40 68 C50 72, 70 72, 80 68 L84 48 Z" fill="#B4E1EB" stroke="#78A4CB" strokeWidth="1.5" />
        {/* Big Dainty Bow on Bag */}
        <circle cx="60" cy="69" r="4" fill="#F9E8A2" stroke="#E5CD6E" strokeWidth="1" />
        <path d="M56 69 C48 64, 46 72, 52 74 Z" fill="#F9E8A2" />
        <path d="M64 69 C72 64, 74 72, 68 74 Z" fill="#F9E8A2" />
      </svg>
    );
  }

  // Fallback cute coquette piece
  return (
    <svg viewBox="0 0 120 120" className="w-4/5 h-4/5 max-h-[160px]" fill="none">
      <circle cx="60" cy="60" r="32" fill="#B4E1EB" stroke="#78A4CB" strokeWidth="1.8" />
      <path d="M50 60 C50 54, 70 54, 70 60 C70 66, 50 66, 50 60 Z" fill="#FFFFFF" />
      <circle cx="60" cy="60" r="4" fill="#F9E8A2" />
    </svg>
  );
}
