import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { BluetteLogo, PuffyStar, CandyWashiTape } from "@/components/bluette/BrandDecorations";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — bluette dreamy digital closet" },
      {
        name: "description",
        content: "Sign in or create your bluette account to keep your closet and saved looks on every device.",
      },
      { property: "og:title", content: "Sign in — bluette dreamy digital closet" },
      {
        property: "og:description",
        content: "Your dreamy digital closet and outfit studio, synced across all your devices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

const INPUT =
  "w-full rounded-2xl border-2 border-ice bg-paper px-4 py-3 font-round text-sm text-ink placeholder:text-fog focus:border-sky focus:outline-hidden focus:ring-4 focus:ring-sky/30";
const LABEL = "block font-round text-xs font-bold text-dusk mb-1.5";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Already signed in? Go straight to the closet.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        navigate({ to: "/", replace: true });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName.trim() },
          },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/", replace: true });
        } else {
          setNotice("Almost there! Check your email and tap the confirmation link to open your closet.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setNotice("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === "signin" ? "Welcome back to your closet" : mode === "signup" ? "Make your dreamy closet" : "Reset your password";

  return (
    <div className="min-h-screen bg-mist text-ink bg-halftone-dots flex items-center justify-center px-5 py-10">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-4 left-8 rotate-[-6deg] z-10">
          <CandyWashiTape />
        </div>
        <div className="absolute -top-5 -right-3 rotate-12 z-10">
          <PuffyStar color="yellow" size={34} />
        </div>

        <div className="sticker-card bg-paper rounded-[2rem] border-2 border-ice p-7 sm:p-9">
          <div className="flex justify-center mb-4">
            <BluetteLogo size="lg" />
          </div>
          <h1 className="text-center font-whimsical text-2xl text-ink mb-1">{title}</h1>
          <p className="text-center font-round text-sm text-dusk mb-6">
            {mode === "forgot"
              ? "We'll email you a link to pick a new one."
              : "Your wardrobe and saved looks, on every device."}
          </p>

          {mode !== "forgot" && (
            <div className="grid grid-cols-2 gap-1 p-1.5 mb-6 bg-mist rounded-full border-2 border-ice" role="tablist">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchMode(m)}
                  className={`py-2 rounded-full font-round text-xs font-bold transition-all ${
                    mode === m
                      ? "bg-paper text-ink border-2 border-sky shadow-[0_3px_0_var(--color-sky-bright)]"
                      : "text-cornflower hover:text-ink"
                  }`}
                >
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="displayName" className={LABEL}>
                  Your name
                </label>
                <input
                  id="displayName"
                  className={INPUT}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Evelyn"
                  maxLength={60}
                  required
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className={LABEL}>
                Email
              </label>
              <input
                id="email"
                type="email"
                className={INPUT}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            {mode !== "forgot" && (
              <div>
                <label htmlFor="password" className={LABEL}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={INPUT}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                  minLength={6}
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-2xl bg-blush border-2 border-blush-line px-4 py-2.5 font-round text-xs font-bold text-ink">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="rounded-2xl bg-butter-soft border-2 border-butter px-4 py-2.5 font-round text-xs font-bold text-ink">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="puffy-btn-blue w-full text-paper py-3 rounded-full font-round font-bold text-sm disabled:opacity-60"
            >
              {busy
                ? "One moment..."
                : mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create my closet"
                    : "Send reset link"}
            </button>
          </form>

          <div className="mt-5 text-center font-round text-xs font-bold">
            {mode === "signin" && (
              <button type="button" onClick={() => switchMode("forgot")} className="text-cornflower hover:text-ink">
                Forgot your password?
              </button>
            )}
            {mode === "forgot" && (
              <button type="button" onClick={() => switchMode("signin")} className="text-cornflower hover:text-ink">
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
