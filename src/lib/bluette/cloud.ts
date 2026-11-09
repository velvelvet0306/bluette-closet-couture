import { supabase } from '@/integrations/supabase/client';
import type { ClothingItem, GarmentCategory, SavedOutfit } from './types';

/**
 * Cloud storage for each signed-in person's closet.
 * Rows are protected per user by the database, photos live in private buckets
 * under a `<userId>/` folder and are shown through short-lived signed links.
 */

export const PHOTO_BUCKET = 'closet-photos';
export const AVATAR_BUCKET = 'avatars';
const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // one week

export interface Profile {
  id: string;
  displayName: string;
  avatarPath: string | null;
  avatarUrl: string | null;
}

// --- helpers ---------------------------------------------------------------

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

async function signPaths(bucket: string, paths: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (unique.length === 0) return {};
  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(unique, SIGNED_URL_TTL);
  if (error || !data) {
    console.warn('Could not sign photo links', error);
    return {};
  }
  const map: Record<string, string> = {};
  for (const entry of data) {
    if (entry.path && entry.signedUrl) map[entry.path] = entry.signedUrl;
  }
  return map;
}

type ItemRow = {
  id: string;
  name: string;
  category: string;
  photo_path: string | null;
  color_name: string;
  color_hex: string;
  date_added: string;
  is_favorite: boolean;
  is_analyzing: boolean;
};

function rowToItem(row: ItemRow, urls: Record<string, string>): ClothingItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category as GarmentCategory,
    photoPath: row.photo_path ?? undefined,
    photoUrl: row.photo_path ? (urls[row.photo_path] ?? '') : '',
    colorName: row.color_name,
    colorHex: row.color_hex,
    dateAdded: row.date_added,
    isFavorite: row.is_favorite,
    isAnalyzing: row.is_analyzing,
  };
}

/** Snapshot stored inside a saved outfit: never keep signed links, they expire. */
function itemSnapshot(item: ClothingItem) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    photoPath: item.photoPath ?? null,
    colorName: item.colorName,
    colorHex: item.colorHex,
    dateAdded: item.dateAdded,
  };
}

// --- wardrobe --------------------------------------------------------------

export async function fetchWardrobe(): Promise<ClothingItem[]> {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .select('id, name, category, photo_path, color_name, color_hex, date_added, is_favorite, is_analyzing')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as ItemRow[];
  const urls = await signPaths(PHOTO_BUCKET, rows.map((r) => r.photo_path ?? ''));
  return rows.map((r) => rowToItem(r, urls));
}

export async function uploadGarmentPhoto(userId: string, itemId: string, dataUrl: string): Promise<string> {
  const path = `${userId}/${itemId}.jpg`;
  const blob = await dataUrlToBlob(dataUrl);
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: true });
  if (error) throw error;
  return path;
}

export async function insertWardrobeItem(userId: string, item: ClothingItem): Promise<void> {
  const { error } = await supabase.from('wardrobe_items').insert({
    id: item.id,
    user_id: userId,
    name: item.name,
    category: item.category,
    photo_path: item.photoPath ?? null,
    color_name: item.colorName,
    color_hex: item.colorHex,
    date_added: item.dateAdded,
    is_favorite: !!item.isFavorite,
    is_analyzing: !!item.isAnalyzing,
  });
  if (error) throw error;
}

export async function updateWardrobeItem(
  itemId: string,
  patch: Partial<Pick<ClothingItem, 'name' | 'category' | 'colorName' | 'colorHex' | 'isFavorite' | 'isAnalyzing'>>,
): Promise<void> {
  const row: {
    name?: string;
    category?: string;
    color_name?: string;
    color_hex?: string;
    is_favorite?: boolean;
    is_analyzing?: boolean;
  } = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.colorName !== undefined) row.color_name = patch.colorName;
  if (patch.colorHex !== undefined) row.color_hex = patch.colorHex;
  if (patch.isFavorite !== undefined) row.is_favorite = patch.isFavorite;
  if (patch.isAnalyzing !== undefined) row.is_analyzing = patch.isAnalyzing;
  const { error } = await supabase.from('wardrobe_items').update(row).eq('id', itemId);
  if (error) throw error;
}

export async function deleteWardrobeItem(item: ClothingItem, keepPhoto: boolean): Promise<void> {
  const { error } = await supabase.from('wardrobe_items').delete().eq('id', item.id);
  if (error) throw error;
  if (item.photoPath && !keepPhoto) {
    await supabase.storage.from(PHOTO_BUCKET).remove([item.photoPath]);
  }
}

// --- saved outfits ---------------------------------------------------------

type OutfitRow = {
  id: string;
  title: string;
  vibe: string;
  date: string;
  items: unknown;
  aesthetic_notes: string;
  accent_color: string;
  is_favorite: boolean;
};

type SnapshotItem = ReturnType<typeof itemSnapshot>;

export async function fetchSavedOutfits(): Promise<SavedOutfit[]> {
  const { data, error } = await supabase
    .from('saved_outfits')
    .select('id, title, vibe, date, items, aesthetic_notes, accent_color, is_favorite')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as OutfitRow[];
  const allPaths = rows.flatMap((r) =>
    (Array.isArray(r.items) ? (r.items as SnapshotItem[]) : []).map((i) => i.photoPath ?? ''),
  );
  const urls = await signPaths(PHOTO_BUCKET, allPaths);
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    vibe: r.vibe,
    date: r.date,
    aestheticNotes: r.aesthetic_notes,
    accentColor: r.accent_color,
    isFavorite: r.is_favorite,
    items: (Array.isArray(r.items) ? (r.items as SnapshotItem[]) : []).map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      photoPath: i.photoPath ?? undefined,
      photoUrl: i.photoPath ? (urls[i.photoPath] ?? '') : '',
      colorName: i.colorName,
      colorHex: i.colorHex,
      dateAdded: i.dateAdded,
    })),
  }));
}

export async function insertSavedOutfit(userId: string, outfit: SavedOutfit): Promise<void> {
  const { error } = await supabase.from('saved_outfits').insert({
    id: outfit.id,
    user_id: userId,
    title: outfit.title,
    vibe: outfit.vibe,
    date: outfit.date,
    items: outfit.items.map(itemSnapshot),
    aesthetic_notes: outfit.aestheticNotes,
    accent_color: outfit.accentColor,
    is_favorite: !!outfit.isFavorite,
  });
  if (error) throw error;
}

export async function updateSavedOutfitFavorite(outfitId: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase.from('saved_outfits').update({ is_favorite: isFavorite }).eq('id', outfitId);
  if (error) throw error;
}

export async function deleteSavedOutfit(outfitId: string): Promise<void> {
  const { error } = await supabase.from('saved_outfits').delete().eq('id', outfitId);
  if (error) throw error;
}

// --- profile ---------------------------------------------------------------

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_path')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const urls = data.avatar_path ? await signPaths(AVATAR_BUCKET, [data.avatar_path]) : {};
  return {
    id: data.id,
    displayName: data.display_name,
    avatarPath: data.avatar_path,
    avatarUrl: data.avatar_path ? (urls[data.avatar_path] ?? null) : null,
  };
}

export async function saveProfile(
  userId: string,
  patch: { displayName?: string; avatarPath?: string | null },
): Promise<void> {
  const row: { id: string; display_name?: string; avatar_path?: string | null } = { id: userId };
  if (patch.displayName !== undefined) row.display_name = patch.displayName;
  if (patch.avatarPath !== undefined) row.avatar_path = patch.avatarPath;
  const { error } = await supabase.from('profiles').upsert(row);
  if (error) throw error;
}

export async function uploadAvatar(userId: string, dataUrl: string): Promise<string> {
  const path = `${userId}/avatar-${Date.now()}.jpg`;
  const blob = await dataUrlToBlob(dataUrl);
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: true });
  if (error) throw error;
  return path;
}

export async function removeAvatarFile(path: string): Promise<void> {
  await supabase.storage.from(AVATAR_BUCKET).remove([path]);
}
