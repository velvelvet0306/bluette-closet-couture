import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SavedOutfits } from "@/components/bluette/SavedOutfits";
import { useBluette } from "@/components/bluette/BluetteProvider";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Outfits Lookbook — bluette" },
      {
        name: "description",
        content: "Your bluette lookbook: every outfit you've saved, with favourites and styling notes.",
      },
      { property: "og:title", content: "Saved Outfits Lookbook — bluette" },
      {
        property: "og:description",
        content: "Revisit and favourite the dreamy outfits you've styled with bluette.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { savedOutfits, deleteOutfit, toggleFavoriteOutfit } = useBluette();
  const navigate = useNavigate();

  return (
    <SavedOutfits
      savedOutfits={savedOutfits}
      onDeleteOutfit={deleteOutfit}
      onToggleFavorite={toggleFavoriteOutfit}
      onNavigateToGenerate={() => navigate({ to: "/generate" })}
    />
  );
}
