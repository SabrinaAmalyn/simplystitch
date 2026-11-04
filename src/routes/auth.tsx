import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SocialButtons } from "@/components/SocialButtons";

type Mode = "login" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } =>
    s["mode"] === "signup" ? { mode: "signup" } : s["mode"] === "login" ? { mode: "login" } : {},
  head: () => ({
    meta: [
      { title: "Log in or sign up — SimplyStitch" },
      { name: "description", content: "Create your SimplyStitch maker account to save and track crochet patterns." },
      { property: "og:title", content: "Log in or sign up — SimplyStitch" },
      { property: "og:description", content: "Create your SimplyStitch maker account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(search.mode ?? "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  // Hide the form until we know nobody is signed in, so returning from Google never flashes sign-up.
  const [checking, setChecking] = useState(true);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/my-patterns", data: { display_name: name } },
      });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      if (data.session) navigate({ to: "/my-patterns" });
      else setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      navigate({ to: "/my-patterns" });
    }
  }

  // Signed-in visitors (including those returning from Google/Lovable) go straight to their page.
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) navigate({ to: "/my-patterns", replace: true });
      else setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/my-patterns", replace: true });
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  async function social(provider: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (r.error) { toast.error(r.error.message ?? "Sign in failed"); return; }
    if (r.redirected) return;
    navigate({ to: "/my-patterns" });
  }

  const field = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4">
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-logo mb-6 block text-center text-2xl uppercase">SimplyStitch</Link>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
          {sent ? (
            <p className="text-center text-sm text-muted-foreground">
              Check <strong className="text-foreground">{email}</strong> for a confirmation link.
            </p>
          ) : (
            <>
              <h1 className="text-xl font-semibold">{mode === "signup" ? "Create an account" : "Log in"}</h1>
              <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
                {mode === "signup" && (
                  <label className="text-sm font-medium">Name
                    <input className={field + " mt-1.5"} value={name} onChange={(e) => setName(e.target.value)} required />
                  </label>
                )}
                <label className="text-sm font-medium">Email
                  <input type="email" className={field + " mt-1.5"} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label className="text-sm font-medium">Password
                  <input type="password" minLength={6} className={field + " mt-1.5"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <button className="btn-primary mt-1 w-full justify-center" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Sign up" : "Log in"}</button>
              </form>
              <SocialButtons onPick={social} />
            </>
          )}
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
          <button type="button" className="font-semibold text-primary" onClick={() => { setSent(false); setMode(mode === "signup" ? "login" : "signup"); }}>
            {mode === "signup" ? "Log in" : "Sign up"}
          </button>
        </p>
        <p className="mt-2 text-center text-xs"><Link to="/team-login" className="text-muted-foreground hover:text-primary">Team sign in</Link></p>
      </div>
    </div>
  );
}
