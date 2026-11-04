import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";

type Mode = "login" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } =>
    s.mode === "signup" ? { mode: "signup" } : s.mode === "login" ? { mode: "login" } : {},
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

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/my-patterns", data: { display_name: name } },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      if (data.session) navigate({ to: "/my-patterns" });
      else setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error(error.message);
      navigate({ to: "/my-patterns" });
    }
  }

  async function social(provider: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (r.error) return toast.error(r.error.message ?? "Sign in failed");
    if (r.redirected) return;
    navigate({ to: "/my-patterns" });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <Link to="/" className="font-logo block text-center text-2xl uppercase">SimplyStitch</Link>
        {sent ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Check <strong className="text-foreground">{email}</strong> for a confirmation link, then come back and log in.
          </p>
        ) : (
          <>
            <h1 className="mt-4 text-center text-lg font-semibold">{mode === "signup" ? "Create your maker account" : "Welcome back"}</h1>
            <div className="mt-5 flex flex-col gap-2">
              <button type="button" className="btn-ghost w-full justify-center" onClick={() => social("google")}>Continue with Google</button>
              <button type="button" className="lovable-auth-button" onClick={() => social("lovable")}>Continue with Lovable</button>
            </div>
            <div className="my-4 text-center text-xs text-muted-foreground">or with email</div>
            <form onSubmit={submit} className="flex flex-col gap-3">
              {mode === "signup" && (
                <input className="rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              )}
              <input type="email" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" minLength={6} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button className="btn-primary w-full justify-center" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Sign up" : "Log in"}</button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "signup" ? "Already have an account? " : "New here? "}
              <button type="button" className="font-semibold text-primary" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
                {mode === "signup" ? "Log in" : "Sign up"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
