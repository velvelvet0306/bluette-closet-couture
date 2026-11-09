import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, LogOut, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBluette } from "@/components/bluette/BluetteProvider";
import { AccountAvatar } from "@/components/bluette/AccountAvatar";
import { PuffyStar } from "@/components/bluette/BrandDecorations";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — bluette" },
      { name: "description", content: "Update your bluette name and profile photo." },
      { property: "og:title", content: "My Profile — bluette" },
      { property: "og:description", content: "Update your bluette name and profile photo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, email, wardrobe, savedOutfits, updateDisplayName, updateAvatar, removeAvatar, showToast } =
    useBluette();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    if (profile) setName(profile.displayName);
  }, [profile]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDisplayName(name);
    } catch {
      showToast("Could not save your name. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoBusy(true);
    try {
      await updateAvatar(file);
    } catch {
      showToast("Could not upload that photo. Please try another.");
    } finally {
      setPhotoBusy(false);
    }
  };

  const onRemovePhoto = async () => {
    setPhotoBusy(true);
    try {
      await removeAvatar();
    } finally {
      setPhotoBusy(false);
    }
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const displayName = profile?.displayName || email?.split("@")[0] || "";

  return (
    <div className="max-w-xl mx-auto pb-16">
      <div className="relative sticker-card bg-paper rounded-[2rem] border-2 border-ice p-7 sm:p-9">
        <div className="absolute -top-4 -right-3 rotate-12">
          <PuffyStar color="yellow" size={30} />
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <AccountAvatar name={displayName} url={profile?.avatarUrl} size={112} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              aria-label="Change profile photo"
              className="absolute -bottom-1 -right-1 puffy-btn-blue text-paper w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-60"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="Profile photo"
              onChange={(e) => {
                onPhoto(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
          {profile?.avatarPath && (
            <button
              type="button"
              onClick={onRemovePhoto}
              disabled={photoBusy}
              className="mt-3 inline-flex items-center gap-1.5 font-round text-[11px] font-bold text-cornflower hover:text-ink"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove photo
            </button>
          )}
          <h1 className="mt-4 font-whimsical text-2xl text-ink">{displayName || "Your profile"}</h1>
          <p className="font-round text-xs text-dusk">{email}</p>

          <div className="mt-4 flex gap-2 font-round text-[11px] font-bold">
            <span className="gloss-pill bg-mist border-2 border-ice rounded-full px-3 py-1">
              {wardrobe.length} piece{wardrobe.length !== 1 ? "s" : ""}
            </span>
            <span className="gloss-pill bg-butter-soft border-2 border-butter rounded-full px-3 py-1">
              {savedOutfits.length} saved look{savedOutfits.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <form onSubmit={onSave} className="mt-8 space-y-3">
          <label htmlFor="profileName" className="block font-round text-xs font-bold text-dusk">
            Display name
          </label>
          <input
            id="profileName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            required
            className="w-full rounded-2xl border-2 border-ice bg-paper px-4 py-3 font-round text-sm text-ink focus:border-sky focus:outline-hidden focus:ring-4 focus:ring-sky/30"
          />
          <button
            type="submit"
            disabled={saving || !name.trim() || name.trim() === profile?.displayName}
            className="puffy-btn-yellow w-full text-ink py-3 rounded-full font-round font-bold text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save name"}
          </button>
        </form>

        <button
          type="button"
          onClick={signOut}
          className="mt-6 w-full puffy-btn-white text-ink py-3 rounded-full font-round font-bold text-sm inline-flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
