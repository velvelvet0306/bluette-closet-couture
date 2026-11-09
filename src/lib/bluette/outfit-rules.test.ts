import { describe, expect, it } from "vitest";
import { buildFallbackOutfit, keepKnownIds, normalizeCategory, type GarmentSummary } from "./outfit-rules";

const g = (id: string, category: GarmentSummary["category"]): GarmentSummary => ({
  id,
  name: id,
  category,
  colorName: "Blue",
  colorHex: "#A3DCF8",
});

describe("outfit rules", () => {
  it("drops IDs the AI invented and duplicates", () => {
    const wardrobe = [g("a", "Tops"), g("b", "Bottoms")];
    expect(keepKnownIds(["a", "zzz", "a", "b", 7], wardrobe)).toEqual(["a", "b"]);
  });

  it("unknown categories become Tops", () => {
    expect(normalizeCategory("Hats")).toBe("Tops");
    expect(normalizeCategory("Shoes")).toBe("Shoes");
  });

  it("fallback pairs a top + bottom plus outerwear, shoes and accessory", () => {
    const wardrobe = [g("t", "Tops"), g("b", "Bottoms"), g("o", "Outerwear"), g("s", "Shoes"), g("x", "Accessories")];
    expect(buildFallbackOutfit(wardrobe, undefined, () => 0)?.itemIds).toEqual(["t", "b", "o", "s", "x"]);
  });

  it("fallback uses a dress when no top/bottom pair exists", () => {
    const wardrobe = [g("t", "Tops"), g("d", "Dresses")];
    expect(buildFallbackOutfit(wardrobe, undefined, () => 0)?.itemIds).toEqual(["d"]);
  });

  it("fallback with only shoes/accessories includes up to 3 existing pieces", () => {
    const wardrobe = [g("s", "Shoes"), g("x", "Accessories")];
    expect(buildFallbackOutfit(wardrobe)?.itemIds).toEqual(["s", "x"]);
  });

  it("empty wardrobe gives no outfit", () => {
    expect(buildFallbackOutfit([])).toBeNull();
  });
});
