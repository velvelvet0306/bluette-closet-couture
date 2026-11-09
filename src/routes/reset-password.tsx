import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { BluetteLogo, PuffyStar } from "@/components/bluette/BrandDecorations";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — bluette" },
      { name: "description", content: "Set a new password for your bluette closet account." },
      { property: "og:title", content: "Choose a new password — bluette" },
      { property: "og:description", content: "Set a new password for your bluette closet account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session || isRecovery) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/", replace: true });
  };

  const INPUT =
    "w-full rounded-2xl border-2 border-ice bg-paper px-4 py-3 font-round text-sm text-ink placeholder:text-fog focus:border-sky focus:outline-hidden focus:ring-4 focus:ring-sky/30";

  return (
    <div className="min-h-screen bg-mist text-ink bg-halftone-dots flex items-center justify-center px-5 py-10">
      <div className="relative w-full max-w-md sticker-card bg-paper rounded-[2rem] border-2 border-ice p-7 sm:p-9">
        <div className="absolute -top-5 -right-3 rotate-12">
          <PuffyStar color="yellow" size={34} />
        </div>
        <div className="flex justify-center mb-4">
          <BluetteLogo size="md" />
        </div>
        <h1 className="text-center font-whimsical text-2xl mb-6">Choose a new password</h1>
        {!ready ? (
          <p className="text-center font-round text-sm text-dusk">
            Open this page from the reset link in your email to choose a new password.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="password"
              aria-label="New password"
              className={INPUT}
              placeholder="New password (6+ characters)"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <input
              type="password"
              aria-label="Repeat new password"
              className={INPUT}
              placeholder="Repeat new password"
              minLength={6}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
            {error && (
              <p role="alert" className="rounded-2xl bg-blush border-2 border-blush-line px-4 py-2.5 font-round text-xs font-bold">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="puffy-btn-blue w-full text-paper py-3 rounded-full font-round font-bold text-sm disabled:opacity-60"
            >
              {busy ? "Saving..." : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
