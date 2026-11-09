import React from 'react';
import { Link } from '@tanstack/react-router';
import { BluetteLogo } from './BrandDecorations';
import { Plus } from 'lucide-react';

interface NavigationProps {
  onTriggerUpload: () => void;
}

const TAB_BASE =
  'px-4 sm:px-5 py-2 text-xs font-round font-bold rounded-full transition-all whitespace-nowrap shrink-0';
const TAB_IDLE = 'text-cornflower hover:text-ink hover:bg-paper/60';
const TAB_ACTIVE_BLUE =
  'bg-paper text-ink border-2 border-sky shadow-[0_3px_0_var(--color-sky-bright),0_4px_10px_color-mix(in_oklab,var(--color-sky-bright)_35%,transparent)]';
const TAB_ACTIVE_YELLOW =
  'bg-paper text-ink border-2 border-butter shadow-[0_3px_0_var(--color-honey),0_4px_10px_color-mix(in_oklab,var(--color-butter)_45%,transparent)]';

export const Navigation: React.FC<NavigationProps> = ({ onTriggerUpload }) => {
  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b-2 border-ice shadow-[0_4px_20px_color-mix(in_oklab,var(--color-sky)_30%,transparent)] px-6 lg:px-12 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2">

        {/* Zone 1: The Bubbly 3D "bluette" Sticker Logo */}
        <Link
          to="/"
          aria-label="bluette home"
          className="flex items-center text-left group shrink-0 focus:outline-hidden transition-transform hover:scale-102"
        >
          <BluetteLogo size="md" />
        </Link>

        {/* Zone 2: 3 Core Navigation Tabs with Puffy Non-Flat States */}
        <nav className="order-3 md:order-none flex items-center gap-2 sm:gap-3 p-1.5 bg-mist rounded-full border-2 border-ice shadow-inner overflow-x-auto max-w-full">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className={TAB_BASE}
            activeProps={{ className: TAB_ACTIVE_BLUE }}
            inactiveProps={{ className: TAB_IDLE }}
          >
            My Wardrobe
          </Link>
          <Link
            to="/generate"
            className={TAB_BASE}
            activeProps={{ className: TAB_ACTIVE_YELLOW }}
            inactiveProps={{ className: TAB_IDLE }}
          >
            Generate Outfit
          </Link>
          <Link
            to="/saved"
            className={TAB_BASE}
            activeProps={{ className: TAB_ACTIVE_BLUE }}
            inactiveProps={{ className: TAB_IDLE }}
          >
            Saved Outfits
          </Link>
        </nav>

        {/* Zone 3: Tactile 3D Action Button (Upload Photos) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onTriggerUpload}
            className="puffy-btn-blue text-paper px-5 py-2.5 rounded-full text-xs font-round font-bold flex items-center gap-2 whitespace-nowrap shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Upload Photos</span>
          </button>
        </div>

      </div>
    </header>
  );
};
