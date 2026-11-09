import React, { useState, useRef } from 'react';
import type { ClothingItem, GarmentCategory } from '@/lib/bluette/types';
import { GarmentVisual } from './GarmentVisual';
import { PuffyStar, PuffyPlanet, CandyWashiTape } from './BrandDecorations';
import { UploadCloud, Plus, Sparkles, Trash2, Heart, Check, Image as ImageIcon } from 'lucide-react';

interface MyWardrobeProps {
  wardrobe: ClothingItem[];
  onUploadFiles: (files: FileList | File[]) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleFavorite: (itemId: string) => void;
  onNavigateToGenerate: () => void;
}

const CATEGORIES: ('All' | GarmentCategory)[] = [
  'All',
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
];

export const MyWardrobe: React.FC<MyWardrobeProps> = ({
  wardrobe,
  onUploadFiles,
  onDeleteItem,
  onToggleFavorite,
  onNavigateToGenerate,
}) => {
  const [activeCategory, setActiveCategory] = useState<'All' | GarmentCategory>('All');
  const [selectedItemForPreview, setSelectedItemForPreview] = useState<ClothingItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  const filteredItems = wardrobe.filter(item => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="space-y-10 pb-20">
      
      {/* Whimsical Hero Header */}
      <div className="relative text-center space-y-3 pt-4">
        
        {/* Floating Puffy Celestial Stars in Background */}
        <div className="absolute top-0 left-8 sm:left-24 -rotate-12 pointer-events-none animate-pulse duration-1000">
          <PuffyPlanet className="w-10 h-10" />
        </div>
        <div className="absolute top-2 right-8 sm:right-28 rotate-12 pointer-events-none animate-bounce duration-1000">
          <PuffyStar color="yellow" size={28} />
        </div>

        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-paper border-2 border-ice rounded-full text-xs font-round font-bold text-ocean shadow-[0_3px_0_var(--color-sky)]">
          <PuffyStar color="blue" size={16} />
          <span>bluette digital wardrobe</span>
          <span className="text-sky">·</span>
          <span>{wardrobe.length} piece{wardrobe.length !== 1 ? 's' : ''} in closet</span>
        </div>

        {/* Title in Dreaming Ocean Whimsical Font */}
        <h1 className="font-whimsical text-4xl sm:text-5xl font-bold text-ink tracking-tight filter drop-shadow-[0_2px_0_var(--color-sky)]">
          My Wardrobe <span className="text-butter underline decoration-butter decoration-wavy decoration-2">Gallery</span>
        </h1>

        {/* Body Text in Clean Helvetica */}
        <p className="font-helvetica text-xs sm:text-sm text-denim max-w-lg mx-auto font-normal leading-relaxed">
          Upload photographs of your clothes freely. Gemini AI automatically identifies garment types, colors, and styling attributes with zero forms!
        </p>
      </div>

      {/* Extremely Simple Multi-Photo Upload Dropzone (Form-Free!) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-[32px] p-8 text-center transition-all duration-200 relative overflow-hidden group border-3 ${
          isDragging 
            ? 'border-sky-bright bg-ice scale-[1.01] shadow-[0_10px_0_var(--color-cornflower),0_20px_30px_color-mix(in_oklab,var(--color-cornflower)_30%,transparent)]' 
            : 'border-paper bg-gradient-to-b from-paper to-mist hover:bg-paper shadow-[0_8px_0_var(--color-sky),0_16px_32px_color-mix(in_oklab,var(--color-sky)_40%,transparent)]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onUploadFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />

        {/* Background Candy Washi Accents */}
        <div className="absolute top-3 left-4 pointer-events-none">
          <CandyWashiTape color="yellow" className="w-12 h-3" rotate="-6deg" />
        </div>
        <div className="absolute top-3 right-4 pointer-events-none">
          <CandyWashiTape color="blue" className="w-12 h-3" rotate="6deg" />
        </div>

        <div className="flex flex-col items-center justify-center space-y-3 relative z-10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-cream to-butter border-2 border-paper flex items-center justify-center shadow-[0_4px_0_var(--color-honey),0_8px_16px_color-mix(in_oklab,var(--color-butter)_40%,transparent)] group-hover:scale-108 transition-transform">
            <UploadCloud className="w-7 h-7 text-ink" />
          </div>

          <div className="space-y-1">
            <p className="font-round text-base font-bold text-ink">
              Click to select clothing photos <span className="text-ocean font-medium">or drag & drop</span>
            </p>
            <p className="font-helvetica text-xs text-dusk">
              Supports multi-photo upload — AI automatically names and categorizes your clothes!
            </p>
          </div>

          <div className="inline-flex items-center gap-2 pt-1 text-xs font-round font-bold text-ink bg-butter-soft px-4 py-1.5 rounded-full border border-paper shadow-[0_2px_0_var(--color-honey)]">
            <Sparkles className="w-3.5 h-3.5 text-honey" />
            <span>Form-free upload · Powered by Gemini Vision</span>
          </div>
        </div>
      </div>

      {/* Tactile 3D Category Filter Pills */}
      {wardrobe.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {CATEGORIES.map((cat) => {
            const count = cat === 'All' 
              ? wardrobe.length 
              : wardrobe.filter(i => i.category === cat).length;
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-round font-bold rounded-full transition-all flex items-center gap-2 border-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-cornflower to-sky-bright text-paper border-paper shadow-[0_3px_0_var(--color-cobalt),0_6px_14px_color-mix(in_oklab,var(--color-cornflower)_35%,transparent)]'
                    : 'bg-paper text-dusk border-ice hover:border-sky-bright hover:text-ink shadow-[0_2px_0_var(--color-ice)]'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-paper text-ink' : 'bg-ice text-ocean'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State when Wardrobe is Empty */}
      {wardrobe.length === 0 ? (
        <div className="sticker-card p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-cream to-butter border-2 border-paper flex items-center justify-center mx-auto shadow-[0_4px_0_var(--color-honey)]">
            <ImageIcon className="w-8 h-8 text-ink" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-whimsical text-xl font-bold text-ink">
              Your wardrobe is waiting for you!
            </h3>
            <p className="font-helvetica text-xs text-dusk leading-relaxed">
              Upload photos of your tops, skirts, pants, dresses, or accessories above. Gemini AI will recognize them and assemble outfit recommendations!
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="puffy-btn-blue text-paper px-6 py-2.5 rounded-full text-xs font-round font-bold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Upload Your First Piece</span>
          </button>
        </div>
      ) : (
        /* Tactile 3D Sticker Cards Grid with Real Photographs */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className="group sticker-card p-3 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Candy Washi Tape Pin on top */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <CandyWashiTape 
                  color={idx % 2 === 0 ? 'yellow' : 'blue'} 
                  className="w-12 h-3" 
                  rotate={idx % 2 === 0 ? '-3deg' : '3deg'} 
                />
              </div>

              {/* Photo Container with rounded bevel */}
              <div 
                onClick={() => setSelectedItemForPreview(item)}
                className="cursor-pointer relative h-60 w-full rounded-2xl overflow-hidden bg-mist border-2 border-ice flex items-center justify-center shadow-inner"
              >
                <GarmentVisual item={item} className="h-full w-full" showBadge={false} />

                {/* Category Badge Pill with 3D shadow */}
                <div className="absolute bottom-2.5 left-2.5 bg-paper px-3 py-0.5 rounded-full text-[10px] font-round font-bold text-ink border border-ice shadow-[0_2px_0_var(--color-sky)]">
                  {item.category}
                </div>

                {/* 3D Heart Favorite Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-paper border border-ice flex items-center justify-center shadow-[0_2px_0_var(--color-sky)] transition-transform hover:scale-110 active:scale-95"
                >
                  <Heart 
                    className={`w-4 h-4 ${item.isFavorite ? 'text-sky-bright fill-sky-bright' : 'text-sky-bright'}`} 
                  />
                </button>
              </div>

              {/* Bottom Info Strip */}
              <div className="p-3 bg-paper flex items-center justify-between border-t-2 border-mist mt-1">
                <div className="space-y-0.5 max-w-[80%]">
                  <h3 
                    onClick={() => setSelectedItemForPreview(item)}
                    className="font-round text-xs font-bold text-ink hover:text-ocean transition-colors truncate cursor-pointer"
                  >
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1.5 font-helvetica text-[11px] text-fog">
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" 
                      style={{ backgroundColor: item.colorHex }} 
                    />
                    <span className="truncate">{item.colorName}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="text-sky hover:text-rose p-1.5 rounded-full hover:bg-mist transition-colors"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dimensional CTA Banner */}
      {wardrobe.length >= 2 && (
        <div className="sticker-card bg-gradient-to-r from-ice via-paper to-cream p-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <PuffyStar color="blue" size={24} />
            <h3 className="font-whimsical text-2xl font-bold text-ink">
              Ready to style an outfit from your clothes?
            </h3>
            <PuffyStar color="yellow" size={24} />
          </div>
          <p className="font-helvetica text-xs text-dusk max-w-md mx-auto">
            bluette uses Gemini AI to analyze your pieces and craft color-harmonized outfit combinations.
          </p>
          <button
            onClick={onNavigateToGenerate}
            className="puffy-btn-blue text-paper px-8 py-3 rounded-full text-xs font-round font-bold inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-butter" />
            <span>Generate Outfit with My Clothes</span>
          </button>
        </div>
      )}

      {/* Item Inspection Preview Modal */}
      {selectedItemForPreview && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper rounded-[32px] border-4 border-paper max-w-md w-full p-6 space-y-4 shadow-[0_16px_40px_color-mix(in_oklab,var(--color-cornflower)_40%,transparent)] relative">
            
            <div className="flex items-center justify-between border-b-2 border-ice pb-3">
              <div className="flex items-center gap-2">
                <PuffyStar color="yellow" size={20} />
                <h3 className="font-round text-base font-bold text-ink">
                  {selectedItemForPreview.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemForPreview(null)}
                className="w-8 h-8 rounded-full bg-mist hover:bg-ice text-ink flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="h-72 w-full rounded-2xl overflow-hidden bg-mist border-2 border-ice flex items-center justify-center shadow-inner">
              <GarmentVisual item={selectedItemForPreview} className="h-full w-full" />
            </div>

            <div className="space-y-1 font-helvetica text-xs text-dusk pt-1">
              <div className="flex items-center justify-between">
                <span>Category: <strong className="text-ink font-bold">{selectedItemForPreview.category}</strong></span>
                <div className="flex items-center gap-1.5">
                  <span 
                    className="w-3 h-3 rounded-full border border-black/10 inline-block shrink-0" 
                    style={{ backgroundColor: selectedItemForPreview.colorHex }} 
                  />
                  <strong className="text-ink font-bold">{selectedItemForPreview.colorName}</strong>
                </div>
              </div>
              <div className="text-[11px] text-fog">
                Added: {selectedItemForPreview.dateAdded}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => {
                  onDeleteItem(selectedItemForPreview.id);
                  setSelectedItemForPreview(null);
                }}
                className="px-4 py-2 border-2 border-rose/40 hover:bg-rose/10 text-rose rounded-full text-xs font-round font-bold"
              >
                Delete Photo
              </button>
              <button
                onClick={() => setSelectedItemForPreview(null)}
                className="puffy-btn-blue text-paper px-6 py-2 rounded-full text-xs font-round font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
