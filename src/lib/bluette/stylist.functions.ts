import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GARMENT_CATEGORIES } from "./outfit-rules";
import { analyzeGarmentPhoto, recommendOutfitFromWardrobe } from "./stylist.server";

const MAX_IMAGE_CHARS = 8_000_000; // ~6MB of image data; photos are compressed to 1400px in the browser

const analyzeInput = z.object({
  imageBase64: z
    .string()
    .max(MAX_IMAGE_CHARS)
    .regex(/^data:image\/(jpeg|jpg|png|webp|gif|heic|heif);base64,/i, "Must be an image data URL"),
});

export const analyzeClothing = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => analyzeInput.parse(data))
  .handler(async ({ data }) => analyzeGarmentPhoto(data.imageBase64));

const garmentSummary = z.object({
  id: z.string().min(1).max(100),
  name: z.string().max(120),
  category: z.enum(GARMENT_CATEGORIES as [string, ...string[]]),
  colorName: z.string().max(60),
  colorHex: z.string().max(16),
});

const recommendInput = z.object({
  wardrobe: z.array(garmentSummary).min(1).max(300),
  vibe: z.string().max(80).optional(),
});

export const recommendOutfit = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => recommendInput.parse(data))
  .handler(async ({ data }) => {
    const wardrobe = data.wardrobe.map((i) => ({
      ...i,
      category: i.category as (typeof GARMENT_CATEGORIES)[number],
    }));
    const outfit = await recommendOutfitFromWardrobe(wardrobe, data.vibe);
    return outfit
      ? { success: true as const, outfit }
      : { success: false as const, error: "Could not generate outfit with current clothes." };
  });
