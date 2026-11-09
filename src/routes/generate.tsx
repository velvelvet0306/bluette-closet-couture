import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OutfitGenerator } from "@/components/bluette/OutfitGenerator";
import { useBluette } from "@/components/bluette/BluetteProvider";

export const Route = createFileRoute("/generate")({
  head: () => ({
    meta: [
      { title: "Generate Outfit Studio — bluette" },
      {
        name: "description",
        content:
          "Pick a vibe and bluette's AI stylist pairs pieces from your real wardrobe into a dreamy, harmonised outfit.",
      },
      { property: "og:title", content: "Generate Outfit Studio — bluette" },
      {
        property: "og:description",
        content: "AI outfit ideas styled only from the clothes you already own.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GeneratePage,
});

function GeneratePage() {
  const { wardrobe, currentGeneratorOutfit, setCurrentGeneratorOutfit, saveOutfit } = useBluette();
  const navigate = useNavigate();

  return (
    <OutfitGenerator
      wardrobe={wardrobe}
      currentOutfit={currentGeneratorOutfit}
      onUpdateOutfit={setCurrentGeneratorOutfit}
      onSaveOutfit={saveOutfit}
      onNavigateToSaved={() => navigate({ to: "/saved" })}
      onNavigateToUpload={() => navigate({ to: "/" })}
    />
  );
}
