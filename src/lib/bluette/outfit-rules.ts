import type { GarmentCategory } from "./types";

export const GARMENT_CATEGORIES: GarmentCategory[] = [
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Shoes",
  "Accessories",
];

/** Minimal garment info sent to the stylist — never the photo itself. */
export interface GarmentSummary {
  id: string;
  name: string;
  category: GarmentCategory;
  colorName: string;
  colorHex: string;
}

export interface OutfitSuggestion {
  id: string;
  title: string;
  vibe: string;
  aestheticNotes: string;
  accentColor: string;
  itemIds: string[];
}

export const DEFAULT_VIBE = "Soft Blue Coquette";
export const DEFAULT_ACCENT = "#A3DCF8";

export function normalizeCategory(value: unknown): GarmentCategory {
  return GARMENT_CATEGORIES.includes(value as GarmentCategory) ? (value as GarmentCategory) : "Tops";
}

/** Keeps only IDs that really exist in the wardrobe, in order, without duplicates. */
export function keepKnownIds(ids: unknown, wardrobe: GarmentSummary[]): string[] {
  if (!Array.isArray(ids)) return [];
  const valid = new Set(wardrobe.map((i) => i.id));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (typeof id === "string" && valid.has(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

/**
 * Rule-based outfit used when the AI stylist is unavailable:
 * a dress OR a top + bottom, plus the first outerwear, shoes and accessory.
 */
export function buildFallbackOutfit(
  wardrobe: GarmentSummary[],
  requestedVibe?: string,
  random: () => number = Math.random,
): OutfitSuggestion | null {
  if (wardrobe.length === 0) return null;

  const byCat = (c: GarmentCategory) => wardrobe.filter((i) => i.category === c);
  const tops = byCat("Tops");
  const bottoms = byCat("Bottoms");
  const dresses = byCat("Dresses");
  const picked: GarmentSummary[] = [];

  const firstDress = dresses[0];
  if (firstDress && (tops.length === 0 || bottoms.length === 0 || random() > 0.5)) {
    picked.push(firstDress);
  } else {
    if (tops[0]) picked.push(tops[0]);
    if (bottoms[0]) picked.push(bottoms[0]);
  }
  for (const c of ["Outerwear", "Shoes", "Accessories"] as const) {
    const first = byCat(c)[0];
    if (first) picked.push(first);
  }
  if (picked.length === 0) picked.push(...wardrobe.slice(0, 3));

  return {
    id: `outfit-${Date.now()}`,
    title: "Harmonized Daily Ensemble",
    vibe: requestedVibe && requestedVibe !== "All Vibes" ? requestedVibe : DEFAULT_VIBE,
    aestheticNotes:
      "Carefully coordinated for balanced proportions and tonal harmony using your real uploaded pieces.",
    accentColor: picked[0]?.colorHex || DEFAULT_ACCENT,
    itemIds: picked.map((i) => i.id),
  };
}
