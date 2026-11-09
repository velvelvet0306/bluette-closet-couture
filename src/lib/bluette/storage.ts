import type { ClothingItem, SavedOutfit } from './types';

/**
 * Robust IndexedDB Storage Utility for Bluette:
 * Prevents localStorage's 5MB QuotaExceededError by safely storing
 * full-fidelity uploaded photographs in IndexedDB.
 */

const DB_NAME = 'bluette_fashion_db';
const DB_VERSION = 1;
const STORE_WARDROBE = 'wardrobe_items';
const STORE_OUTFITS = 'saved_outfits';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_WARDROBE)) {
        db.createObjectStore(STORE_WARDROBE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_OUTFITS)) {
        db.createObjectStore(STORE_OUTFITS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- WARDROBE STORAGE ---

export async function loadWardrobeFromDB(): Promise<ClothingItem[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_WARDROBE, 'readonly');
      const store = tx.objectStore(STORE_WARDROBE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Could not read from IndexedDB, falling back to localStorage', error);
    try {
      const fallback = localStorage.getItem('bluette_wardrobe_backup');
      return fallback ? JSON.parse(fallback) : [];
    } catch {
      return [];
    }
  }
}

export async function saveWardrobeToDB(items: ClothingItem[]): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_WARDROBE, 'readwrite');
      const store = tx.objectStore(STORE_WARDROBE);
      
      // Clear and rewrite current state
      store.clear();
      items.forEach(item => store.put(item));

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Could not write to IndexedDB', error);
  }
}

// --- SAVED OUTFITS STORAGE ---

export async function loadSavedOutfitsFromDB(): Promise<SavedOutfit[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_OUTFITS, 'readonly');
      const store = tx.objectStore(STORE_OUTFITS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Could not read outfits from IndexedDB', error);
    try {
      const fallback = localStorage.getItem('bluette_outfits_backup');
      return fallback ? JSON.parse(fallback) : [];
    } catch {
      return [];
    }
  }
}

export async function saveSavedOutfitsToDB(outfits: SavedOutfit[]): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_OUTFITS, 'readwrite');
      const store = tx.objectStore(STORE_OUTFITS);
      
      store.clear();
      outfits.forEach(outfit => store.put(outfit));

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Could not write outfits to IndexedDB', error);
  }
}

// --- SMART CLIENT IMAGE COMPRESSION ---
// Automatically resizes massive phone camera images (e.g. 12MB photos)
// down to a crisp high-res 1400px canvas to prevent memory issues and speed up AI recognition.
export function processAndCompressImage(file: File, maxDimension = 1400): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ base64: e.target?.result as string, mimeType: file.type || 'image/jpeg' });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG with 0.88 quality for high visual fidelity and lightweight size
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve({
          base64: compressedDataUrl,
          mimeType: 'image/jpeg',
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
