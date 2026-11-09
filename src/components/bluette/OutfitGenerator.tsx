import React, { useState } from 'react';
import type { ClothingItem, SavedOutfit } from '@/lib/bluette/types';
import { PuffyStar, PuffyPlanet, CandyWashiTape } from './BrandDecorations';
import { Sparkles, RefreshCw, Bookmark, Heart, Check, ArrowRight, Plus } from 'lucide-react';
import { recommendOutfit } from '@/lib/bluette/stylist.functions';

interface OutfitGeneratorProps {
  wardrobe: ClothingItem[];
  currentOutfit: SavedOutfit | null;
  onUpdateOutfit: (outfit: SavedOutfit) => void;
  onSaveOutfit: (outfit: SavedOutfit) => void;
  onNavigateToSaved: () => void;
  onNavigateToUpload: () => void;
}

const VIBES = [
  'All Vibes',
  'Soft Blue Coquette',
  'Buttercup Morning',
  'Dreamy Sunlit Stroll',
  'Chic Picnic Afternoon',
  'Minimalist Tailored',
];

export const OutfitGenerator: React.FC<OutfitGeneratorProps> = ({
  wardrobe,
  currentOutfit,
  onUpdateOutfit,
  onSaveOutfit,
  onNavigateToSaved,
  onNavigateToUpload,
}) => {
  const [selectedVibe, setSelectedVibe] = useState('All Vibes');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedPieceToSwap, setSelectedPieceToSwap] = useState<ClothingItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Actual AI Outfit Recommendation using Gemini backend route
  const handleGenerate = async () => {
    if (wardrobe.length < 2 && !wardrobe.some(i => i.category === 'Dresses')) {
      setErrorMessage('Please upload at least 2 pieces in your wardrobe to generate outfit combinations.');
      return;
    }

    if (wardrobe.every(i => i.isAnalyzing)) {
      setErrorMessage('Your pieces are still being identified — try again in a moment.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      // Only garment details go to the stylist — photos stay on this device.
      const data = await recommendOutfit({
        data: {
          wardrobe: wardrobe
            .filter((i) => !i.isAnalyzing)
            .map(({ id, name, category, colorName, colorHex }) => ({ id, name, category, colorName, colorHex })),
          ...(selectedVibe !== 'All Vibes' ? { vibe: selectedVibe } : {}),
        },
      });

      const items = data.success
        ? data.outfit.itemIds
            .map((id) => wardrobe.find((i) => i.id === id))
            .filter((i): i is ClothingItem => Boolean(i))
        : [];

      if (data.success && items.length > 0) {
        onUpdateOutfit({
          id: data.outfit.id,
          title: data.outfit.title,
          vibe: data.outfit.vibe,
          date: 'Just now',
          items,
          aestheticNotes: data.outfit.aestheticNotes,
          accentColor: data.outfit.accentColor,
          isFavorite: false,
        });
      } else {
        setErrorMessage((!data.success && data.error) || 'Could not generate outfit with current clothes.');
      }
    } catch (error) {
      console.error('Error generating outfit:', error);
      setErrorMessage('Failed to connect to AI styling engine. Please check connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!currentOutfit) return;
    onSaveOutfit(currentOutfit);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2400);
  };

  const handleSwapPiece = (newItem: ClothingItem) => {
    if (!selectedPieceToSwap || !currentOutfit) return;
    const updatedItems = currentOutfit.items.map(item => 
      item.id === selectedPieceToSwap.id ? newItem : item
    );
    onUpdateOutfit({
      ...currentOutfit,
      items: updatedItems,
    });
    setSelectedPieceToSwap(null);
  };

  // Case 1: Empty Wardrobe
  if (wardrobe.length === 0) {
    return (
      <div className="space-y-10 pb-20 pt-8 text-center max-w-lg mx-auto">
        <div className="sticker-card p-10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-cream to-butter border-2 border-paper flex items-center justify-center mx-auto shadow-[0_4px_0_var(--color-honey)]">
            <Sparkles className="w-8 h-8 text-ink" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-whimsical text-2xl font-bold text-ink">
              Your wardrobe is currently empty
            </h2>
            <p className="font-helvetica text-xs text-dusk leading-relaxed">
              Upload photos of your real clothes in My Wardrobe. Bluette will analyze their styles, colors, and cuts to curate personalized outfit combinations.
            </p>
          </div>
          <button
            onClick={onNavigateToUpload}
            className="puffy-btn-blue text-paper px-8 py-3 rounded-full text-xs font-round font-bold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Upload Clothes to Start</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      
      {/* Whimsical Header */}
      <div className="text-center space-y-3 pt-4 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-paper border-2 border-ice rounded-full text-xs font-round font-bold text-ocean shadow-[0_3px_0_var(--color-sky)]">
          <PuffyStar color="yellow" size={16} />
          <span>Gemini AI styling engine</span>
          <span className="text-sky">·</span>
          <span>{wardrobe.length} real pieces available</span>
        </div>

        <h1 className="font-whimsical text-4xl sm:text-5xl font-bold text-ink tracking-tight filter drop-shadow-[0_2px_0_var(--color-sky)]">
          Generate Outfit <span className="text-butter underline decoration-butter decoration-wavy decoration-2">Studio</span>
        </h1>

        <p className="font-helvetica text-xs sm:text-sm text-denim max-w-lg mx-auto font-normal leading-relaxed">
          Actual AI recommendations pairing your real clothes based on category synergy, tonal harmony, and silhouette balance.
        </p>
      </div>

      {/* Control Bar (Dimensional 3D Controls) */}
      <div className="max-w-2xl mx-auto rounded-[32px] bg-paper border-3 border-paper p-4 shadow-[0_8px_0_var(--color-sky),0_16px_28px_color-mix(in_oklab,var(--color-sky)_35%,transparent)] flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Vibe Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <PuffyStar color="blue" size={20} />
          <select
            value={selectedVibe}
            onChange={(e) => setSelectedVibe(e.target.value)}
            className="w-full sm:w-auto bg-mist border-2 border-ice rounded-full px-4 py-2 text-xs font-round font-bold text-ink focus:outline-hidden focus:border-sky-bright"
          >
            {VIBES.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="puffy-btn-blue text-paper px-6 py-2.5 rounded-full text-xs font-round font-bold flex items-center justify-center gap-2 flex-1 sm:flex-initial disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Styling with AI...' : currentOutfit ? 'Shuffle Outfit' : 'Generate Outfit'}</span>
          </button>

          {currentOutfit && (
            <button
              onClick={handleSave}
              className="puffy-btn-yellow text-ink px-6 py-2.5 rounded-full text-xs font-round font-bold flex items-center gap-2 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Saved Look!</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 text-ink fill-paper" />
                  <span>Save Look</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

      {/* Error Message if too few items */}
      {errorMessage && (
        <div className="max-w-md mx-auto p-3 bg-blush border-2 border-blush-line rounded-2xl text-center text-xs font-helvetica text-rose-deep">
          {errorMessage}
        </div>
      )}

      {/* When Outfit is Generated: Dimensional Flatlay Showcase */}
      {currentOutfit ? (
        <div className="sticker-card p-6 sm:p-10 relative overflow-hidden bg-gradient-to-b from-paper via-cloud to-cloud-deep">
          
          {/* Background Celestial Sticker Elements */}
          <div className="absolute top-6 right-6 pointer-events-none opacity-80">
            <PuffyPlanet className="w-12 h-12" />
          </div>
          <div className="absolute bottom-6 left-6 pointer-events-none opacity-80">
            <PuffyStar color="yellow" size={32} />
          </div>

          {/* Header Title */}
          <div className="text-center space-y-1.5 mb-8 relative z-10">
            <span className="inline-block bg-ice border border-paper px-3.5 py-0.5 rounded-full text-[11px] font-round font-bold uppercase tracking-wider text-ocean shadow-[0_2px_0_var(--color-sky)]">
              {currentOutfit.vibe}
            </span>
            <h2 className="font-whimsical text-2xl sm:text-3xl font-bold text-ink">
              {currentOutfit.title}
            </h2>
            <p className="font-helvetica text-xs sm:text-sm text-denim max-w-lg mx-auto italic font-normal leading-relaxed">
              "{currentOutfit.aestheticNotes}"
            </p>
          </div>

          {/* Flatlay Clothing Cards with Real Uploaded Photographs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto relative z-10">
            {currentOutfit.items.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="sticker-card p-3 flex flex-col justify-between relative bg-paper"
              >
                {/* Candy Washi Tape Pin */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  <CandyWashiTape 
                    color={idx % 2 === 0 ? 'yellow' : 'blue'} 
                    className="w-12 h-3" 
                    rotate={idx % 2 === 0 ? '-3deg' : '3deg'} 
                  />
                </div>

                {/* Garment Visual (Real user photo) */}
                <div className="h-48 w-full rounded-2xl overflow-hidden bg-mist border-2 border-ice flex items-center justify-center relative shadow-inner">
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-paper px-2.5 py-0.5 rounded-full text-[9px] font-round font-bold text-ink border border-ice shadow-[0_1px_0_var(--color-sky)]">
                    {item.category}
                  </div>
                </div>

                {/* Card Label & Tactile Swap Button */}
                <div className="mt-3 space-y-2">
                  <div className="text-center">
                    <h4 className="font-round text-xs font-bold text-ink truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-center gap-1.5 font-helvetica text-[10px] text-fog">
                      <span 
                        className="w-2 h-2 rounded-full border border-black/10 inline-block" 
                        style={{ backgroundColor: item.colorHex }} 
                      />
                      <span>{item.colorName}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPieceToSwap(item)}
                    className="w-full py-1.5 text-[10px] font-round font-bold text-ocean hover:text-ink bg-ice hover:bg-sky-pale rounded-full border border-paper shadow-[0_2px_0_var(--color-sky)] transition-all active:translate-y-0.5"
                  >
                    Swap Piece ⇄
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t-2 border-ice flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-helvetica text-fog relative z-10">
            <div className="flex items-center gap-2">
              <PuffyStar color="yellow" size={16} />
              <span>Recommended by Gemini using your uploaded wardrobe pieces</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                className="puffy-btn-yellow text-ink px-5 py-2 rounded-full text-xs font-round font-bold flex items-center gap-2"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Saved Look!</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 text-ink fill-paper" />
                    <span>Save this Look</span>
                  </>
                )}
              </button>
              <button
                onClick={onNavigateToSaved}
                className="flex items-center gap-1.5 text-ocean font-round font-bold hover:underline"
              >
                <span>Open Saved Outfits Journal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Prompt to Generate First Outfit */
        <div className="sticker-card p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-cream to-butter border-2 border-paper flex items-center justify-center mx-auto shadow-[0_4px_0_var(--color-honey)]">
            <Sparkles className="w-7 h-7 text-ink" />
          </div>
          <div className="space-y-1">
            <h3 className="font-whimsical text-xl font-bold text-ink">
              Ready to generate an outfit?
            </h3>
            <p className="font-helvetica text-xs text-dusk">
              You have {wardrobe.length} clothing items. Click "Generate Outfit" to let Gemini curate a color-harmonized combination.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="puffy-btn-blue text-paper px-8 py-2.5 rounded-full text-xs font-round font-bold shadow-xs inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Curate Outfit Now</span>
          </button>
        </div>
      )}

      {/* Swap Piece Selection Modal */}
      {selectedPieceToSwap && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper rounded-[32px] border-4 border-paper max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-[0_16px_40px_color-mix(in_oklab,var(--color-cornflower)_40%,transparent)]">
            <div className="flex items-center justify-between border-b-2 border-ice pb-3">
              <div>
                <h3 className="font-whimsical text-lg font-bold text-ink">
                  Swap {selectedPieceToSwap.category}
                </h3>
                <p className="font-helvetica text-xs text-dusk">
                  Select another {selectedPieceToSwap.category.toLowerCase()} from your uploaded clothes.
                </p>
              </div>
              <button
                onClick={() => setSelectedPieceToSwap(null)}
                className="w-8 h-8 rounded-full bg-mist text-xs font-bold text-ink"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wardrobe
                .filter(i => i.category === selectedPieceToSwap.category && i.id !== selectedPieceToSwap.id)
                .map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => handleSwapPiece(alt)}
                    className="cursor-pointer rounded-2xl bg-mist border-2 border-ice p-2 hover:border-sky-bright transition-all space-y-1.5 hover:-translate-y-1 shadow-xs"
                  >
                    <div className="h-28 w-full rounded-xl overflow-hidden bg-paper">
                      <img
                        src={alt.photoUrl}
                        alt={alt.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="font-round text-xs font-bold text-ink truncate">
                      {alt.name}
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-2 border-t-2 border-ice">
              <button
                onClick={() => setSelectedPieceToSwap(null)}
                className="puffy-btn-white text-ink px-5 py-2 rounded-full text-xs font-round font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
