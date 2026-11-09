import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import type { ClothingItem, SavedOutfit } from '@/lib/bluette/types';
import {
  loadWardrobeFromDB,
  loadSavedOutfitsFromDB,
  saveWardrobeToDB,
  saveSavedOutfitsToDB,
  processAndCompressImage,
} from '@/lib/bluette/storage';
import {
  deleteSavedOutfit,
  deleteWardrobeItem,
  fetchProfile,
  fetchSavedOutfits,
  fetchWardrobe,
  insertSavedOutfit,
  insertWardrobeItem,
  removeAvatarFile,
  saveProfile,
  updateSavedOutfitFavorite,
  updateWardrobeItem,
  uploadAvatar,
  uploadGarmentPhoto,
  type Profile,
} from '@/lib/bluette/cloud';
import { analyzeClothing } from '@/lib/bluette/stylist.functions';
import { DEFAULT_ACCENT } from '@/lib/bluette/outfit-rules';

interface BluetteContextValue {
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  wardrobe: ClothingItem[];
  savedOutfits: SavedOutfit[];
  currentGeneratorOutfit: SavedOutfit | null;
  isInitializing: boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  setCurrentGeneratorOutfit: (outfit: SavedOutfit) => void;
  uploadPhotos: (files: FileList | File[]) => void;
  triggerUpload: () => void;
  deleteItem: (itemId: string) => void;
  toggleFavoriteItem: (itemId: string) => void;
  saveOutfit: (outfit: SavedOutfit) => void;
  deleteOutfit: (outfitId: string) => void;
  toggleFavoriteOutfit: (outfitId: string) => void;
  updateDisplayName: (name: string) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  removeAvatar: () => Promise<void>;
}

const BluetteContext = createContext<BluetteContextValue | null>(null);

export function useBluette() {
  const ctx = useContext(BluetteContext);
  if (!ctx) throw new Error('useBluette must be used inside <BluetteProvider>');
  return ctx;
}

const LEGACY_IMPORT_FLAG = 'bluette_cloud_import_done';

/**
 * One-time move of a closet that was saved on this device before accounts existed.
 * Runs once per browser, then clears the on-device copy so nobody else imports it.
 */
async function importLegacyCloset(userId: string): Promise<number> {
  if (localStorage.getItem(LEGACY_IMPORT_FLAG)) return 0;
  const [items, outfits] = await Promise.all([loadWardrobeFromDB(), loadSavedOutfitsFromDB()]);
  if (items.length === 0 && outfits.length === 0) {
    localStorage.setItem(LEGACY_IMPORT_FLAG, '1');
    return 0;
  }

  const pathById: Record<string, string> = {};
  const uploadIfPhoto = async (item: ClothingItem) => {
    if (pathById[item.id] || !item.photoUrl?.startsWith('data:image')) return;
    try {
      pathById[item.id] = await uploadGarmentPhoto(userId, item.id, item.photoUrl);
    } catch (err) {
      console.warn('Could not move photo to the cloud', err);
    }
  };

  let moved = 0;
  for (const item of items) {
    await uploadIfPhoto(item);
    try {
      await insertWardrobeItem(userId, {
        ...item,
        photoPath: pathById[item.id],
        isAnalyzing: false,
        name: item.isAnalyzing ? 'Uploaded Piece' : item.name,
      });
      moved++;
    } catch (err) {
      console.warn('Could not move piece to the cloud', err);
    }
  }
  for (const outfit of outfits) {
    for (const item of outfit.items) await uploadIfPhoto(item);
    try {
      await insertSavedOutfit(userId, {
        ...outfit,
        items: outfit.items.map((i) => ({ ...i, photoPath: pathById[i.id] })),
      });
    } catch (err) {
      console.warn('Could not move outfit to the cloud', err);
    }
  }

  localStorage.setItem(LEGACY_IMPORT_FLAG, '1');
  await Promise.all([saveWardrobeToDB([]), saveSavedOutfitsToDB([])]);
  return moved;
}

export function BluetteProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [currentGeneratorOutfit, setCurrentGeneratorOutfit] = useState<SavedOutfit | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wardrobeRef = useRef<ClothingItem[]>([]);
  const outfitsRef = useRef<SavedOutfit[]>([]);
  wardrobeRef.current = wardrobe;
  outfitsRef.current = savedOutfits;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const reportError = useCallback(
    (msg: string, err: unknown) => {
      console.warn(msg, err);
      showToast(msg);
    },
    [showToast],
  );

  // 1. Load the signed-in person's closet from Lovable Cloud
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user || cancelled) return;
        setUserId(user.id);
        setEmail(user.email ?? null);

        const moved = await importLegacyCloset(user.id).catch((err) => {
          console.warn('Legacy closet import failed', err);
          return 0;
        });

        const [items, outfits, prof] = await Promise.all([
          fetchWardrobe(),
          fetchSavedOutfits(),
          fetchProfile(user.id),
        ]);
        if (cancelled) return;
        setWardrobe(items);
        setSavedOutfits(outfits);
        setProfile(prof);
        const firstOutfit = outfits[0];
        if (firstOutfit) setCurrentGeneratorOutfit(firstOutfit);
        if (moved > 0) showToast(`Moved ${moved} piece${moved > 1 ? 's' : ''} from this device into your account ★`);

        // Pieces whose naming got interrupted on a previous visit get a friendly default.
        for (const stuck of items.filter((i) => i.isAnalyzing)) {
          const patch = { name: 'Uploaded Piece', colorName: 'Soft Tone', isAnalyzing: false };
          setWardrobe((prev) => prev.map((i) => (i.id === stuck.id ? { ...i, ...patch } : i)));
          updateWardrobeItem(stuck.id, patch).catch(() => {});
        }
      } catch (err) {
        console.warn('Initialization error', err);
        if (!cancelled) showToast('Could not load your closet. Try refreshing.');
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const applyItemPatch = useCallback((itemId: string, patch: Partial<ClothingItem>) => {
    setWardrobe((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
    updateWardrobeItem(itemId, patch).catch((err) => console.warn('Could not save piece details', err));
  }, []);

  const markRecognitionFailed = useCallback(
    (itemId: string) => {
      applyItemPatch(itemId, {
        name: 'Uploaded Piece',
        category: 'Tops',
        colorName: 'Soft Tone',
        colorHex: DEFAULT_ACCENT,
        isAnalyzing: false,
      });
    },
    [applyItemPatch],
  );

  // AI recognition of garment type, colour and name
  const recognizeClothingItem = useCallback(
    async (itemId: string, base64: string) => {
      try {
        const data = await analyzeClothing({ data: { imageBase64: base64 } });
        if (data.success) {
          applyItemPatch(itemId, {
            name: data.item.name,
            category: data.item.category,
            colorName: data.item.colorName,
            colorHex: data.item.colorHex,
            isAnalyzing: false,
          });
          showToast(`Identified: "${data.item.name}" (${data.item.category}) ★`);
        } else {
          markRecognitionFailed(itemId);
        }
      } catch (error) {
        console.warn('AI recognition network error:', error);
        markRecognitionFailed(itemId);
      }
    },
    [applyItemPatch, markRecognitionFailed, showToast],
  );

  // 2. Multi-photo upload: photo goes to cloud storage, then the AI names it
  const uploadPhotos = useCallback(
    async (files: FileList | File[]) => {
      if (!files || files.length === 0 || !userId) return;
      const filesArray = Array.from(files);
      showToast(`Uploading ${filesArray.length} photo${filesArray.length > 1 ? 's' : ''}...`);

      for (const file of filesArray) {
        const tempId = `garment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        try {
          const { base64 } = await processAndCompressImage(file);
          const newItem: ClothingItem = {
            id: tempId,
            name: 'Analyzing piece...',
            category: 'Tops',
            photoUrl: base64,
            colorName: 'Analyzing...',
            colorHex: DEFAULT_ACCENT,
            dateAdded: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            isFavorite: false,
            isAnalyzing: true,
          };
          setWardrobe((prev) => [newItem, ...prev]);

          const photoPath = await uploadGarmentPhoto(userId, tempId, base64);
          await insertWardrobeItem(userId, { ...newItem, photoPath });
          setWardrobe((prev) => prev.map((i) => (i.id === tempId ? { ...i, photoPath } : i)));
          recognizeClothingItem(tempId, base64);
        } catch (err) {
          setWardrobe((prev) => prev.filter((i) => i.id !== tempId));
          reportError(`Couldn't upload "${file.name}". Please try again.`, err);
        }
      }
    },
    [recognizeClothingItem, reportError, showToast, userId],
  );

  const triggerUpload = useCallback(() => {
    navigate({ to: '/' });
    hiddenFileInputRef.current?.click();
  }, [navigate]);

  const deleteItem = useCallback(
    (itemId: string) => {
      const item = wardrobeRef.current.find((i) => i.id === itemId);
      if (!item) return;
      setWardrobe((prev) => prev.filter((i) => i.id !== itemId));
      // Keep the photo if a saved look still shows this piece.
      const usedInLook = outfitsRef.current.some((o) => o.items.some((i) => i.id === itemId));
      deleteWardrobeItem(item, usedInLook)
        .then(() => showToast('Piece removed from wardrobe'))
        .catch((err) => {
          setWardrobe((prev) => [item, ...prev]);
          reportError('Could not remove that piece. Please try again.', err);
        });
    },
    [reportError, showToast],
  );

  const toggleFavoriteItem = useCallback(
    (itemId: string) => {
      const item = wardrobeRef.current.find((i) => i.id === itemId);
      if (!item) return;
      applyItemPatch(itemId, { isFavorite: !item.isFavorite });
    },
    [applyItemPatch],
  );

  const saveOutfit = useCallback(
    (outfit: SavedOutfit) => {
      if (!userId) return;
      const exists = outfitsRef.current.some((o) => o.id === outfit.id || o.title === outfit.title);
      if (exists) {
        showToast('Look is already in your lookbook');
        return;
      }
      setSavedOutfits((prev) => [outfit, ...prev]);
      insertSavedOutfit(userId, outfit)
        .then(() => showToast(`Lookbook saved: "${outfit.title}" ★`))
        .catch((err) => {
          setSavedOutfits((prev) => prev.filter((o) => o.id !== outfit.id));
          reportError('Could not save that look. Please try again.', err);
        });
    },
    [reportError, showToast, userId],
  );

  const deleteOutfit = useCallback(
    (outfitId: string) => {
      const outfit = outfitsRef.current.find((o) => o.id === outfitId);
      setSavedOutfits((prev) => prev.filter((o) => o.id !== outfitId));
      deleteSavedOutfit(outfitId)
        .then(() => showToast('Look removed from lookbook'))
        .catch((err) => {
          if (outfit) setSavedOutfits((prev) => [outfit, ...prev]);
          reportError('Could not remove that look. Please try again.', err);
        });
    },
    [reportError, showToast],
  );

  const toggleFavoriteOutfit = useCallback((outfitId: string) => {
    const outfit = outfitsRef.current.find((o) => o.id === outfitId);
    if (!outfit) return;
    const next = !outfit.isFavorite;
    setSavedOutfits((prev) => prev.map((o) => (o.id === outfitId ? { ...o, isFavorite: next } : o)));
    updateSavedOutfitFavorite(outfitId, next).catch((err) => console.warn('Could not save favourite', err));
  }, []);

  const updateDisplayName = useCallback(
    async (name: string) => {
      if (!userId) return;
      const trimmed = name.trim().slice(0, 60);
      await saveProfile(userId, { displayName: trimmed });
      setProfile((prev) => (prev ? { ...prev, displayName: trimmed } : prev));
      showToast('Profile updated ★');
    },
    [showToast, userId],
  );

  const updateAvatar = useCallback(
    async (file: File) => {
      if (!userId) return;
      const { base64 } = await processAndCompressImage(file, 512);
      const oldPath = profile?.avatarPath;
      const path = await uploadAvatar(userId, base64);
      await saveProfile(userId, { avatarPath: path });
      if (oldPath) removeAvatarFile(oldPath).catch(() => {});
      setProfile((prev) => (prev ? { ...prev, avatarPath: path, avatarUrl: base64 } : prev));
      showToast('New profile photo ★');
    },
    [profile?.avatarPath, showToast, userId],
  );

  const removeAvatar = useCallback(async () => {
    if (!userId || !profile?.avatarPath) return;
    await saveProfile(userId, { avatarPath: null });
    removeAvatarFile(profile.avatarPath).catch(() => {});
    setProfile((prev) => (prev ? { ...prev, avatarPath: null, avatarUrl: null } : prev));
    showToast('Profile photo removed');
  }, [profile?.avatarPath, showToast, userId]);

  const value: BluetteContextValue = {
    userId,
    email,
    profile,
    wardrobe,
    savedOutfits,
    currentGeneratorOutfit,
    isInitializing,
    toastMessage,
    showToast,
    setCurrentGeneratorOutfit,
    uploadPhotos,
    triggerUpload,
    deleteItem,
    toggleFavoriteItem,
    saveOutfit,
    deleteOutfit,
    toggleFavoriteOutfit,
    updateDisplayName,
    updateAvatar,
    removeAvatar,
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
