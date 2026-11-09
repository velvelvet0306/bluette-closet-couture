import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { ClothingItem, SavedOutfit } from '@/lib/bluette/types';
import {
  loadWardrobeFromDB,
  saveWardrobeToDB,
  loadSavedOutfitsFromDB,
  saveSavedOutfitsToDB,
  processAndCompressImage,
} from '@/lib/bluette/storage';
import { analyzeClothing } from '@/lib/bluette/stylist.functions';
import { DEFAULT_ACCENT } from '@/lib/bluette/outfit-rules';

interface BluetteContextValue {
  wardrobe: ClothingItem[];
  savedOutfits: SavedOutfit[];
  currentGeneratorOutfit: SavedOutfit | null;
  isInitializing: boolean;
  toastMessage: string | null;
  setCurrentGeneratorOutfit: (outfit: SavedOutfit) => void;
  uploadPhotos: (files: FileList | File[]) => void;
  triggerUpload: () => void;
  deleteItem: (itemId: string) => void;
  toggleFavoriteItem: (itemId: string) => void;
  saveOutfit: (outfit: SavedOutfit) => void;
  deleteOutfit: (outfitId: string) => void;
  toggleFavoriteOutfit: (outfitId: string) => void;
}

const BluetteContext = createContext<BluetteContextValue | null>(null);

export function useBluette() {
  const ctx = useContext(BluetteContext);
  if (!ctx) throw new Error('useBluette must be used inside <BluetteProvider>');
  return ctx;
}

export function BluetteProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [currentGeneratorOutfit, setCurrentGeneratorOutfit] = useState<SavedOutfit | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Load persistent closet data from this browser's IndexedDB
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storedWardrobe, storedOutfits] = await Promise.all([
          loadWardrobeFromDB(),
          loadSavedOutfitsFromDB(),
        ]);
        if (cancelled) return;
        // Pieces interrupted mid-analysis on a previous visit get a friendly default.
        setWardrobe(
          (storedWardrobe || []).map((i) =>
            i.isAnalyzing ? { ...i, name: 'Uploaded Piece', colorName: 'Soft Tone', isAnalyzing: false } : i,
          ),
        );
        setSavedOutfits(storedOutfits || []);
        const firstOutfit = storedOutfits?.[0];
        if (firstOutfit) setCurrentGeneratorOutfit(firstOutfit);
      } catch (err) {
        console.warn('Initialization error', err);
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Persist whenever state changes
  useEffect(() => {
    if (!isInitializing) saveWardrobeToDB(wardrobe);
  }, [wardrobe, isInitializing]);

  useEffect(() => {
    if (!isInitializing) saveSavedOutfitsToDB(savedOutfits);
  }, [savedOutfits, isInitializing]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const markRecognitionFailed = useCallback((itemId: string) => {
    setWardrobe((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              name: 'Uploaded Piece',
              category: 'Tops',
              colorName: 'Soft Tone',
              colorHex: DEFAULT_ACCENT,
              isAnalyzing: false,
            }
          : item,
      ),
    );
  }, []);

  // AI recognition of garment type, colour and name
  const recognizeClothingItem = useCallback(
    async (itemId: string, base64: string) => {
      try {
        const data = await analyzeClothing({ data: { imageBase64: base64 } });
        if (data.success) {
          setWardrobe((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    name: data.item.name,
                    category: data.item.category,
                    colorName: data.item.colorName,
                    colorHex: data.item.colorHex,
                    isAnalyzing: false,
                  }
                : item,
            ),
          );
          showToast(`Identified: "${data.item.name}" (${data.item.category}) ★`);
        } else {
          markRecognitionFailed(itemId);
        }
      } catch (error) {
        console.warn('AI recognition network error:', error);
        markRecognitionFailed(itemId);
      }
    },
    [markRecognitionFailed, showToast],
  );

  // 3. Multi-photo upload
  const uploadPhotos = useCallback(
    async (files: FileList | File[]) => {
      if (!files || files.length === 0) return;
      const filesArray = Array.from(files);
      showToast(`Uploading ${filesArray.length} photo${filesArray.length > 1 ? 's' : ''}...`);

      for (const file of filesArray) {
        try {
          const { base64 } = await processAndCompressImage(file);
          const tempId = `garment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const newItem: ClothingItem = {
            id: tempId,
            name: 'Analyzing piece...',
            category: 'Tops',
            photoUrl: base64,
            colorName: 'Analyzing...',
            colorHex: DEFAULT_ACCENT,
            dateAdded: 'Today',
            isFavorite: false,
            isAnalyzing: true,
          };
          setWardrobe((prev) => [newItem, ...prev]);
          recognizeClothingItem(tempId, base64);
        } catch (err) {
          console.error('Error processing uploaded file:', err);
        }
      }
    },
    [recognizeClothingItem, showToast],
  );

  const triggerUpload = useCallback(() => {
    navigate({ to: '/' });
    hiddenFileInputRef.current?.click();
  }, [navigate]);

  const deleteItem = useCallback(
    (itemId: string) => {
      setWardrobe((prev) => prev.filter((i) => i.id !== itemId));
      showToast('Piece removed from wardrobe');
    },
    [showToast],
  );

  const toggleFavoriteItem = useCallback((itemId: string) => {
    setWardrobe((prev) => prev.map((i) => (i.id === itemId ? { ...i, isFavorite: !i.isFavorite } : i)));
  }, []);

  const saveOutfit = useCallback(
    (outfit: SavedOutfit) => {
      const exists = savedOutfits.some((o) => o.id === outfit.id || o.title === outfit.title);
      if (!exists) {
        setSavedOutfits([outfit, ...savedOutfits]);
        showToast(`Lookbook saved: "${outfit.title}" ★`);
      } else {
        showToast('Look is already in your lookbook');
      }
    },
    [savedOutfits, showToast],
  );

  const deleteOutfit = useCallback(
    (outfitId: string) => {
      setSavedOutfits((prev) => prev.filter((o) => o.id !== outfitId));
      showToast('Look removed from lookbook');
    },
    [showToast],
  );

  const toggleFavoriteOutfit = useCallback((outfitId: string) => {
    setSavedOutfits((prev) => prev.map((o) => (o.id === outfitId ? { ...o, isFavorite: !o.isFavorite } : o)));
  }, []);

  const value: BluetteContextValue = {
    wardrobe,
    savedOutfits,
    currentGeneratorOutfit,
    isInitializing,
    toastMessage,
    setCurrentGeneratorOutfit,
    uploadPhotos,
    triggerUpload,
    deleteItem,
    toggleFavoriteItem,
    saveOutfit,
    deleteOutfit,
    toggleFavoriteOutfit,
  };

  return (
    <BluetteContext.Provider value={value}>
      {/* Hidden file input for the global upload button in the header */}
      <input
        type="file"
        ref={hiddenFileInputRef}
        multiple
        accept="image/*"
        className="hidden"
        aria-label="Upload clothing photos"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            uploadPhotos(files);
            e.target.value = '';
          }
        }}
      />
      {children}
    </BluetteContext.Provider>
  );
}
