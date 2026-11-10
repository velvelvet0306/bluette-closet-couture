
import { GoogleGenAI } from "@google/genai";
import {
  DEFAULT_ACCENT,
  DEFAULT_VIBE,
  buildFallbackOutfit,
  keepKnownIds,
  normalizeCategory,
  type GarmentSummary,
  type OutfitSuggestion,
} from "./outfit-rules";
import type { GarmentCategory } from "./types";

const MODEL = "gemini-3.8-flash";
const AI_TIMEOUT_MS = 20_000;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  return new GoogleGenAI({ apiKey });
}

async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Gemini request timed out."));
    }, AI_TIMEOUT_MS);

    promise.then(
      (result) => {
        clearTimeout(timer);
        resolve(result);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export interface RecognizedGarment {
  name: string;
  category: GarmentCategory;
  colorName: string;
  colorHex: string;
}

export type AnalyzeResult =
  | { success: true; item: RecognizedGarment }
  | { success: false; reason: string; fallback: RecognizedGarment };

const FALLBACK_GARMENT: RecognizedGarment = {
  name: "Uploaded Garment",
  category: "Tops",
  colorName: "Soft Blue",
  colorHex: DEFAULT_ACCENT,
};

function logGeminiError(where: string, error: unknown) {
  console.error(`[stylist] ${where} Gemini error`, error);
}

function parseJson(text: unknown): Record<string, unknown> {
  if (typeof text !== "string") return {};

  try {
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "");

    const parsed: unknown = JSON.parse(cleaned);

    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

const str = (v: unknown, fallback: string) =>
  typeof v === "string" && v.trim() ? v.trim() : fallback;

const hex = (v: unknown, fallback: string) =>
  typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v.trim())
    ? v.trim()
    : fallback;

function parseImageDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s);

  if (!match) {
    throw new Error("Invalid image data URL.");
  }

  return {
    mimeType: match[1],
    data: match[2],
  };
}

export async function analyzeGarmentPhoto(
  dataUrl: string,
): Promise<AnalyzeResult> {
  const prompt = `You are a fashion specialist analyzing a clothing item photograph for an aesthetic digital closet app called "Bluette".
Analyze this image and identify:
1. "name": A concise, charming, descriptive name for this specific garment (e.g. "Cropped Powder Blue Cardigan", "High-Waist Pleated White Skirt", "Floral Midi Wrap Dress", "Vintage Denim Straight Jeans", "Satin Bow Ballet Flats", "Pearl Drop Ribbon Necklace"). Max 4-6 words.
2. "category": Must be strictly one of these 6 categories: "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories".
3. "colorName": The prominent color or aesthetic tone (e.g. "Powder Blue", "Butter Yellow", "Porcelain Cream", "Denim Blue", "Soft Rose", "Warm Ecru", "Midnight Navy").
4. "colorHex": The best matching aesthetic hex code for the dominant color (e.g. "#A3DCF8", "#FEDD79", "#F8FAFC", "#70A0CA", "#E297A9").`;

  try {
    const image = parseImageDataUrl(dataUrl);
    const ai = getGeminiClient();

    const response = await withTimeout(
      ai.models.generateContent({
        model: MODEL,
        contents: [
          {
            inlineData: {
              mimeType: image.mimeType,
              data: image.data,
            },
          },
          prompt,
        ],
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Short descriptive name of the garment.",
              },
              category: {
                type: "string",
                enum: [
                  "Tops",
                  "Bottoms",
                  "Dresses",
                  "Outerwear",
                  "Shoes",
                  "Accessories",
                ],
              },
              colorName: {
                type: "string",
                description: "Dominant color name.",
              },
              colorHex: {
                type: "string",
                description: "Dominant color hex code starting with #.",
              },
            },
            required: ["name", "category", "colorName", "colorHex"],
          },
        },
      }),
    );

    const parsed = parseJson(response.text);

    return {
      success: true,
      item: {
        name: str(parsed["name"], "Curated Garment"),
        category: normalizeCategory(parsed["category"]),
        colorName: str(parsed["colorName"], "Soft Blue"),
        colorHex: hex(parsed["colorHex"], DEFAULT_ACCENT),
      },
    };
  } catch (error) {
    logGeminiError("analyze", error);

    return {
      success: false,
      reason: "ANALYSIS_ERROR",
      fallback: FALLBACK_GARMENT,
    };
  }
}

export async function recommendOutfitFromWardrobe(
  wardrobe: GarmentSummary[],
  vibe?: string,
): Promise<OutfitSuggestion | null> {
  if (wardrobe.length === 0) return null;

  const wardrobeList = wardrobe.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    color: i.colorName,
    colorHex: i.colorHex,
  }));

  const prompt = `You are a high-fashion stylist for "Bluette", an art-directed aesthetic digital closet.
The user has uploaded the following REAL clothing pieces in their wardrobe:
${JSON.stringify(wardrobeList, null, 2)}

User's requested styling vibe or occasion: "${vibe || "Coquette Soft Blue & Chic"}".

STRICT RULES:
1. Select 2 to 5 items from the provided list to create one cohesive, beautifully styled outfit.
2. Structure:
   - Form an outfit around either (1 "Tops" + 1 "Bottoms") OR (1 "Dresses").
   - Include optional "Outerwear", "Shoes", and "Accessories" if available in the user's wardrobe.
3. CRITICAL: You must use the EXACT "id" strings from the provided list. NEVER invent or hallucinate new IDs or items.
4. Harmonize colors, textures, and proportions.
5. Create a charming, dreamy title (e.g. "Powder Blue Morning Reverie", "Buttercup Afternoon Stroll", "Denim & Ribbon Romance").
6. Write a thoughtful 1-2 sentence aesthetic styling note explaining why these specific pieces pair wonderfully together.`;

  try {
    const ai = getGeminiClient();

    const response = await withTimeout(
      ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: "object",
            properties: {
              selectedItemIds: {
                type: "array",
                items: { type: "string" },
                description: "Array of exact item IDs chosen from the wardrobe.",
              },
              title: {
                type: "string",
                description: "Charming title for this outfit.",
              },
              vibe: {
                type: "string",
                description: "Styling vibe or mood name.",
              },
              aestheticNotes: {
                type: "string",
                description: "Explanation of why these exact pieces work together.",
              },
              accentColor: {
                type: "string",
                description: "Hex accent color for the outfit card.",
              },
            },
            required: [
              "selectedItemIds",
              "title",
              "vibe",
              "aestheticNotes",
              "accentColor",
            ],
          },
        },
      }),
    );

    const parsed = parseJson(response.text);
    const itemIds = keepKnownIds(parsed["selectedItemIds"], wardrobe);

    if (itemIds.length === 0) {
      return buildFallbackOutfit(wardrobe, vibe);
    }

    return {
      id: `outfit-${Date.now()}`,
      title: str(parsed["title"], "Curated Ensemble"),
      vibe: str(parsed["vibe"], vibe || "Dreamy Chic"),
      aestheticNotes: str(
        parsed["aestheticNotes"],
        "A delicate, harmonious pairing crafted from your wardrobe.",
      ),
      accentColor: hex(parsed["accentColor"], DEFAULT_ACCENT),
      itemIds,
    };
  } catch (error) {
    logGeminiError("recommend", error);

    return buildFallbackOutfit(wardrobe, vibe ?? DEFAULT_VIBE);
  }
}
