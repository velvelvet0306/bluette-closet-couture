import React from 'react';

/**
 * Custom 3D Puffy Sticker Logo and Whimsical Celestial Elements for "bluette":
 * Directly inspired by the reference image (Heixx Space logo):
 * - Ringed pastel yellow Saturn planet
 * - Puffy bubbly lettering with white sticker borders, bubble shine & diagonal candy stripes
 * - Puffy celestial stars with thick white sticker contours
 * - Non-flat dimensional layered drop shadows
 */

export const BluetteLogo: React.FC<{ 
  className?: string; 
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}> = ({ 
  className = '', 
  size = 'md',
  showSubtitle = false
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const width = isSm ? 140 : isLg ? 260 : 185;
  const height = isSm ? 48 : isLg ? 90 : 64;

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 260 90"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible filter drop-shadow-[0_4px_10px_color-mix(in_oklab,var(--color-cornflower)_35%,transparent)]"
      >
        <defs>
          {/* Blue Letter Gradient */}
          <linearGradient id="bluetteBlueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C4EEFD" />
            <stop offset="50%" stopColor="#67B8ED" />
            <stop offset="100%" stopColor="#4592CC" />
          </linearGradient>

          {/* Yellow Letter Gradient */}
          <linearGradient id="bluetteYellowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF4C7" />
            <stop offset="50%" stopColor="#FEDD79" />
            <stop offset="100%" stopColor="#F5C744" />
          </linearGradient>

          {/* Planet Gradient */}
          <linearGradient id="planetGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF8D6" />
            <stop offset="100%" stopColor="#FEDD79" />
          </linearGradient>

          {/* Diagonal Candy Stripe Pattern for "ette" */}
          <pattern id="candyStripeYellow" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#FFF7D1" strokeWidth="5" />
            <line x1="6" y1="0" x2="6" y2="12" stroke="#FEDD79" strokeWidth="7" />
          </pattern>

          {/* Drop shadow for 3D sticker effect */}
          <filter id="stickerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="0" floodColor="#7AB1DA" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* 1. Behind: Pastel Saturn Planet with Rings */}
        <g transform="translate(18, 2)">
          {/* Back portion of ring */}
          <ellipse cx="44" cy="36" rx="42" ry="12" transform="rotate(-18 44 36)" stroke="#FFF2B8" strokeWidth="4" fill="none" opacity="0.9" />
          
          {/* Planet Sphere */}
          <circle cx="44" cy="36" r="26" fill="url(#planetGrad)" stroke="#FFFFFF" strokeWidth="3.5" />
          {/* Subtle planet craters / surface shimmer */}
          <circle cx="34" cy="28" r="4" fill="#FFFFFF" opacity="0.6" />
          <circle cx="56" cy="42" r="3" fill="#FFFFFF" opacity="0.4" />
          <path d="M28 34 C36 30, 52 30, 60 35" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

          {/* Front portion of ring */}
          <path d="M8 46 C16 56, 72 40, 80 26" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          <path d="M8 46 C16 56, 72 40, 80 26" stroke="#FEDD79" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* 2. Background Star Stickers */}
        {/* Soft blue star top right */}
        <g transform="translate(205, 12)">
          <path 
            d="M16 2 L20 12 L30 14 L22 21 L24 31 L15 26 L6 31 L8 21 L1 14 L11 12 Z" 
            fill="#DDF5FD" 
            stroke="#FFFFFF" 
            strokeWidth="3.5" 
            strokeLinejoin="round" 
          />
          <circle cx="15" cy="16" r="2" fill="#FFFFFF" />
        </g>

        {/* 3. Thick White Sticker Silhouette Backplate */}
        <g filter="url(#stickerShadow)">
          {/* Outer white bubble border for "blu" */}
          <text 
            x="28" 
            y="48" 
            fontFamily="'DynaPuff', 'Fredoka', cursive" 
            fontSize="46" 
            fontWeight="bold" 
            fill="#FFFFFF" 
            stroke="#FFFFFF" 
            strokeWidth="12" 
            strokeLinejoin="round"
          >
            blu
          </text>

          {/* Outer white bubble border for "ette" */}
          <text 
            x="85" 
            y="70" 
            fontFamily="'DynaPuff', 'Fredoka', cursive" 
            fontSize="46" 
            fontWeight="bold" 
            fill="#FFFFFF" 
            stroke="#FFFFFF" 
            strokeWidth="12" 
            strokeLinejoin="round"
          >
            ette
          </text>
        </g>

        {/* 4. Lettering Inner Fills with 3D strokes and highlights */}
        {/* "blu" - Powder / Sky Blue Bubbly Letters */}
        <g>
          {/* 3D bottom offset shadow */}
          <text 
            x="28" 
            y="50" 
            fontFamily="'DynaPuff', 'Fredoka', cursive" 
            fontSize="46" 
            fontWeight="bold" 
            fill="#4592CC"
          >
            blu
          </text>

          {/* Main gradient fill with blue outline */}
          <text 
            x="28" 
            y="48" 
            fontFamily="'DynaPuff', 'Fredoka', cursive" 
            fontSize="46" 
            fontWeight="bold" 
            fill="url(#bluetteBlueGrad)" 
            stroke="#4592CC" 
            strokeWidth="2.5"
          >
            blu
          </text>

          {/* Glossy top reflections for "blu" */}
          <ellipse cx="36" cy="22" rx="4" ry="7" fill="#FFFFFF" opacity="0.8" transform="rotate(-15 36 22)" />
          <ellipse cx="58" cy="26" rx="3.5" ry="5" fill="#FFFFFF" opacity="0.8" transform="rotate(-10 58 26)" />
          <ellipse cx="80" cy="30" rx="3.5" ry="5" fill="#FFFFFF" opacity="0.8" transform="rotate(-10 80 30)" />
        </g>

        {/* "ette" - Butter Yellow with Diagonal Candy Stripes */}
        <g>
          {/* 3D bottom offset shadow */}
          <text 
            x="85" 
            y="73" 
            fontFamily="'DynaPuff', 'Fredoka', cursive" 
            fontSize="46" 
            fontWeight="bold" 
            fill="#DAB545"
          >
            ette
          </text>

          {/* Candy stripe base fill */}
          <text 
            x="85" 
            y="70" 
            fontFamily="'DynaPuff', 'Fredoka', cursive" 
            fontSize="46" 
            fontWeight="bold" 
            fill="url(#candyStripeYellow)" 
            stroke="#DCBA4D" 
            strokeWidth="2.5"
          >
            ette
          </text>

          {/* Glossy reflection on yellow letters */}
          <ellipse cx="98" cy="46" rx="4" ry="6" fill="#FFFFFF" opacity="0.75" transform="rotate(-12 98 46)" />
          <ellipse cx="128" cy="46" rx="4" ry="6" fill="#FFFFFF" opacity="0.75" transform="rotate(-12 128 46)" />
          <ellipse cx="152" cy="46" rx="4" ry="6" fill="#FFFFFF" opacity="0.75" transform="rotate(-12 152 46)" />
          <ellipse cx="180" cy="48" rx="4" ry="6" fill="#FFFFFF" opacity="0.75" transform="rotate(-12 180 48)" />
        </g>

        {/* 5. Foreground Puffy Star Sticker (Bottom Left overlapping "blu") */}
        <g transform="translate(14, 42)">
          {/* Thick white sticker border & drop shadow */}
          <path 
            d="M18 4 L23 16 L35 18 L26 27 L28 39 L17 33 L6 39 L8 27 L0 18 L12 16 Z" 
            fill="#DDF5FD" 
            stroke="#FFFFFF" 
            strokeWidth="4" 
            strokeLinejoin="round" 
            filter="drop-shadow(0 3px 0 #7AB1DA)"
          />
          {/* Star glossy shine */}
          <circle cx="16" cy="18" r="3" fill="#FFFFFF" opacity="0.9" />
          <circle cx="21" cy="22" r="1.5" fill="#FFFFFF" opacity="0.8" />
        </g>

        {/* 6. Little Twinkle Sparkles */}
        <path d="M120 18 C120 15, 122 13, 125 13 C122 13, 120 11, 120 8 C120 11, 118 13, 115 13 C118 13, 120 15, 120 18 Z" fill="#FFFFFF" />
        <path d="M198 28 C198 25, 200 23, 203 23 C200 23, 198 21, 198 18 C198 21, 196 23, 193 23 C196 23, 198 25, 198 28 Z" fill="#FEDD79" />
      </svg>

      {showSubtitle && (
        <span className="ml-2 font-round text-xs font-semibold tracking-wider text-cornflower bg-ice px-2.5 py-0.5 rounded-full border border-paper shadow-2xs">
          fashion closet
        </span>
      )}
    </div>
  );
};

export const PuffyStar: React.FC<{ 
  color?: 'blue' | 'yellow' | 'white'; 
  className?: string;
  size?: number;
}> = ({ 
  color = 'yellow', 
  className = 'w-6 h-6',
  size = 24
}) => {
  const fill = color === 'yellow' ? '#FEDD79' : color === 'blue' ? '#A3DCF8' : '#FFFFFF';
  const shadow = color === 'yellow' ? '#DAB545' : color === 'blue' ? '#6BA4D2' : '#B4E1EB';

  return (
    <svg viewBox="0 0 32 32" className={className} width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M16 2 L19.8 11.2 L29.7 12.6 L22.5 19.6 L24.2 29.5 L15.3 24.8 L6.4 29.5 L8.1 19.6 L0.9 12.6 L10.8 11.2 Z" 
        fill={fill} 
        stroke="#FFFFFF" 
        strokeWidth="3" 
        strokeLinejoin="round" 
        className="filter drop-shadow-[0_2px_0_color-mix(in_oklab,var(--color-cornflower)_60%,transparent)]"
      />
      <circle cx="14" cy="14" r="2.5" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
};

export const PuffyPlanet: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="20" rx="18" ry="6" transform="rotate(-20 20 20)" stroke="#FFF0BA" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="11" fill="#FEDD79" stroke="#FFFFFF" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="2" fill="#FFFFFF" opacity="0.8" />
      <path d="M5 25 C9 30, 31 23, 35 15" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

export const CandyWashiTape: React.FC<{ 
  color?: 'yellow' | 'blue'; 
  className?: string; 
  rotate?: string 
}> = ({ 
  color = 'yellow', 
  className = 'w-14 h-4', 
  rotate = '-3deg' 
}) => {
  const bgClass = color === 'yellow' ? 'bg-candy-stripes-yellow' : 'bg-candy-stripes-blue';
  return (
    <div 
      className={`rounded-xs border border-paper/80 shadow-[0_2px_4px_color-mix(in_oklab,var(--color-cornflower)_25%,transparent)] ${bgClass} ${className}`} 
      style={{ transform: `rotate(${rotate})` }} 
    />
  );
};
