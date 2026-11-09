import React from 'react';
import type { MainSection } from '@/lib/bluette/types';
import { BluetteLogo, PuffyStar } from './BrandDecorations';
import { Plus } from 'lucide-react';

interface NavigationProps {
  currentSection: MainSection;
  onNavigate: (section: MainSection) => void;
  onTriggerUpload: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentSection,
  onNavigate,
  onTriggerUpload,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b-2 border-ice shadow-[0_4px_20px_color-mix(in_oklab,var(--color-sky)_30%,transparent)] px-6 lg:px-12 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
        
        {/* Zone 1: The Bubbly 3D "bluette" Sticker Logo */}
        <button
          onClick={() => onNavigate('wardrobe')}
          className="flex items-center text-left group shrink-0 focus:outline-hidden transition-transform hover:scale-102"
        >
          <BluetteLogo size="md" />
        </button>

        {/* Zone 2: 3 Core Navigation Tabs with Puffy Non-Flat States */}
        <nav className="flex items-center gap-2 sm:gap-3 p-1.5 bg-mist rounded-full border-2 border-ice shadow-inner">
          <button
            onClick={() => onNavigate('wardrobe')}
            className={`px-4 sm:px-5 py-2 text-xs font-round font-bold rounded-full transition-all whitespace-nowrap shrink-0 ${
              currentSection === 'wardrobe'
                ? 'bg-paper text-ink border-2 border-sky shadow-[0_3px_0_var(--color-sky-bright),0_4px_10px_color-mix(in_oklab,var(--color-sky-bright)_35%,transparent)]'
                : 'text-cornflower hover:text-ink hover:bg-paper/60'
            }`}
          >
            My Wardrobe
          </button>

          <button
            onClick={() => onNavigate('generate')}
            className={`px-4 sm:px-5 py-2 text-xs font-round font-bold rounded-full transition-all whitespace-nowrap shrink-0 ${
              currentSection === 'generate'
                ? 'bg-paper text-ink border-2 border-butter shadow-[0_3px_0_var(--color-honey),0_4px_10px_color-mix(in_oklab,var(--color-butter)_45%,transparent)]'
                : 'text-cornflower hover:text-ink hover:bg-paper/60'
            }`}
          >
            Generate Outfit
          </button>

          <button
            onClick={() => onNavigate('saved')}
            className={`px-4 sm:px-5 py-2 text-xs font-round font-bold rounded-full transition-all whitespace-nowrap shrink-0 ${
              currentSection === 'saved'
                ? 'bg-paper text-ink border-2 border-sky shadow-[0_3px_0_var(--color-sky-bright),0_4px_10px_color-mix(in_oklab,var(--color-sky-bright)_35%,transparent)]'
                : 'text-cornflower hover:text-ink hover:bg-paper/60'
            }`}
          >
            Saved Outfits
          </button>
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
