import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MyWardrobe } from "@/components/bluette/MyWardrobe";
import { useBluette } from "@/components/bluette/BluetteProvider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Wardrobe — bluette dreamy digital closet" },
      {
        name: "description",
        content:
          "Upload photos of your clothes and bluette's AI names, colours and sorts every piece into your dreamy digital closet.",
      },
      { property: "og:title", content: "My Wardrobe — bluette dreamy digital closet" },
      {
        property: "og:description",
        content: "A cute, whimsical digital closet: upload clothing photos and let AI organise them for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WardrobePage,
});

function WardrobePage() {
  const { wardrobe, uploadPhotos, deleteItem, toggleFavoriteItem } = useBluette();
  const navigate = useNavigate();

  return (
    <MyWardrobe
      wardrobe={wardrobe}
      onUploadFiles={uploadPhotos}
      onDeleteItem={deleteItem}
      onToggleFavorite={toggleFavoriteItem}
      onNavigateToGenerate={() => navigate({ to: "/generate" })}
    />
  );
}
