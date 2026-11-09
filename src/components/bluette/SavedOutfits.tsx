import React, { useState } from 'react';
import type { SavedOutfit, ClothingItem } from '@/lib/bluette/types';
import { GarmentVisual } from './GarmentVisual';
import { PuffyStar, PuffyPlanet, CandyWashiTape } from './BrandDecorations';
import { Trash2, Eye, Sparkles, Heart, Calendar } from 'lucide-react';

interface SavedOutfitsProps {
  savedOutfits: SavedOutfit[];
  onDeleteOutfit: (outfitId: string) => void;
  onToggleFavorite: (outfitId: string) => void;
  onNavigateToGenerate: () => void;
}

export const SavedOutfits: React.FC<SavedOutfitsProps> = ({
  savedOutfits,
  onDeleteOutfit,
  onToggleFavorite,
  onNavigateToGenerate,
}) => {
  const [selectedOutfitModal, setSelectedOutfitModal] = useState<SavedOutfit | null>(null);

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header */}
      <div className="text-center space-y-3 pt-4 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-paper border-2 border-ice rounded-full text-xs font-round font-bold text-ocean shadow-[0_3px_0_var(--color-sky)]">
          <Heart className="w-3.5 h-3.5 text-sky-bright fill-sky-bright" />
          <span>bluette lookbook</span>
          <span className="text-sky">·</span>
          <span>{savedOutfits.length} saved outfits</span>
        </div>

        <h1 className="font-whimsical text-4xl sm:text-5xl font-bold text-ink tracking-tight filter drop-shadow-[0_2px_0_var(--color-sky)]">
          Saved Outfits <span className="text-butter underline decoration-butter decoration-wavy decoration-2">Journal</span>
        </h1>

        <p className="font-helvetica text-xs sm:text-sm text-denim max-w-lg mx-auto font-normal leading-relaxed">
          Your archived daily inspirations, favorite combinations, and styling memories.
        </p>
      </div>

      {/* Empty State */}
      {savedOutfits.length === 0 ? (
        <div className="sticker-card p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-cream to-butter border-2 border-paper flex items-center justify-center mx-auto shadow-[0_4px_0_var(--color-honey)]">
            <PuffyStar color="blue" size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-whimsical text-xl font-bold text-ink">
              Your lookbook is waiting for looks
            </h3>
            <p className="font-helvetica text-xs text-dusk">
              Head to the outfit generator to curate and archive your favorite combinations.
            </p>
          </div>
          <button
            onClick={onNavigateToGenerate}
            className="puffy-btn-blue text-paper px-8 py-2.5 rounded-full text-xs font-round font-bold shadow-xs"
          >
            Generate an Outfit
          </button>
        </div>
      ) : (
        /* Saved Outfits Grid (3D Sticker Cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedOutfits.map((outfit, idx) => (
            <div
              key={outfit.id}
              className="group sticker-card p-5 flex flex-col justify-between space-y-4 relative bg-paper"
            >
              {/* Candy Washi Tape Pin */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <CandyWashiTape 
                  color={idx % 2 === 0 ? 'yellow' : 'blue'} 
                  className="w-12 h-3" 
                  rotate={idx % 2 === 0 ? '-3deg' : '3deg'} 
                />
              </div>

              <div className="space-y-3">
                {/* Header Information */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block bg-ice border border-paper px-2.5 py-0.5 rounded-full text-[10px] font-round font-bold uppercase tracking-wider text-ocean shadow-[0_1px_0_var(--color-sky)]">
                      {outfit.vibe}
                    </span>
                    <h3 className="font-round text-base font-bold text-ink line-clamp-1 mt-1">
                      {outfit.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => onToggleFavorite(outfit.id)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Heart 
                      className={`w-5 h-5 ${outfit.isFavorite ? 'text-sky-bright fill-sky-bright' : 'text-sky'}`} 
                    />
                  </button>
                </div>

                {/* Clothing Photos Mini Flatlay Strip */}
                <div 
                  onClick={() => setSelectedOutfitModal(outfit)}
                  className="cursor-pointer grid grid-cols-3 sm:grid-cols-4 gap-2 bg-mist p-2.5 rounded-2xl border-2 border-ice hover:border-sky-bright transition-colors shadow-inner"
                >
                  {outfit.items.slice(0, 4).map((item, i) => (
                    <div
                      key={`${item.id}-${i}`}
                      className="h-20 w-full rounded-xl overflow-hidden bg-paper border border-ice flex items-center justify-center relative shadow-xs"
                    >
                      <GarmentVisual item={item} className="h-full w-full" />
                    </div>
                  ))}
                </div>

                {/* Aesthetic Quote in Helvetica */}
                <p className="font-helvetica text-xs text-dusk italic line-clamp-2">
                  "{outfit.aestheticNotes}"
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t-2 border-mist flex items-center justify-between text-xs font-helvetica text-fog">
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-sky-bright" />
                  <span>{outfit.date}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedOutfitModal(outfit)}
                    className="puffy-btn-white text-ink px-3.5 py-1 text-xs font-round font-bold rounded-full"
                  >
                    View Look
                  </button>
                  <button
                    onClick={() => onDeleteOutfit(outfit.id)}
                    className="p-1.5 text-sky hover:text-rose hover:bg-mist rounded-full transition-colors"
                    title="Delete saved look"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Full Look Modal (3D Sticker Style) */}
      {selectedOutfitModal && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper rounded-[32px] border-4 border-paper max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-[0_16px_40px_color-mix(in_oklab,var(--color-cornflower)_40%,transparent)] relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-ice pb-4">
              <div className="space-y-1">
                <span className="inline-block bg-ice border border-paper px-2.5 py-0.5 rounded-full text-[10px] font-round font-bold uppercase tracking-wider text-ocean shadow-[0_1px_0_var(--color-sky)]">
                  {selectedOutfitModal.vibe}
                </span>
                <h3 className="font-whimsical text-2xl font-bold text-ink">
                  {selectedOutfitModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOutfitModal(null)}
                className="w-8 h-8 rounded-full bg-mist text-ink flex items-center justify-center font-bold text-xs hover:bg-ice"
              >
                ✕
              </button>
            </div>

            {/* Garments Collage */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {selectedOutfitModal.items.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="rounded-2xl bg-mist border-2 border-ice p-2.5 space-y-2 text-center shadow-xs"
                >
                  <div className="h-32 w-full rounded-xl overflow-hidden bg-paper border border-ice">
                    <GarmentVisual item={item} className="h-full w-full" />
                  </div>
                  <div className="text-[10px] text-ocean uppercase font-round font-bold">
                    {item.category}
                  </div>
                  <div className="font-round text-xs font-bold text-ink truncate">
                    {item.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Styling Note */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-ice to-cream border-2 border-paper space-y-1 text-center shadow-xs">
              <span className="text-[10px] uppercase font-round font-bold text-ocean">
                Aesthetic Curator Note
              </span>
              <p className="font-helvetica text-sm text-ink italic">
                "{selectedOutfitModal.aestheticNotes}"
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-ice">
              <button
                onClick={() => setSelectedOutfitModal(null)}
                className="puffy-btn-blue text-paper px-6 py-2 rounded-full text-xs font-round font-bold"
              >
                Close Look
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
