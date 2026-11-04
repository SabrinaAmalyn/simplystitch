import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { isTeamMember, type AppRole } from "@/lib/roles";
import "@lovable.dev/cloud-auth-js/styles.css";

const TEAM_FLAG = "simplystitch-team-signin";
const NOT_TEAM = "This account isn't on the SimplyStitch team. Makers sign in on the regular page.";

export const Route = createFileRoute("/team-login")({
  head: () => ({
    meta: [
      { title: "Team sign in — SimplyStitch" },
      { name: "description", content: "Sign in for the SimplyStitch team: admins and super admins. Makers use the regular sign in." },
      { property: "og:title", content: "Team sign in — SimplyStitch" },
      { property: "og:description", content: "Sign in for the SimplyStitch team: admins and super admins." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeamLoginPage,
});

function TeamLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function admitOrReject(uid: string, rejectIfMaker: boolean) {
    const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    const roles = (roleRows ?? []).map((r) => r.role as AppRole);
    if (isTeamMember(roles)) { navigate({ to: "/admin", replace: true }); return true; }
    if (rejectIfMaker) {
      await supabase.auth.signOut();
      setError(NOT_TEAM);
      toast.error(NOT_TEAM);
    }
    return false;
  }

  // Team members already signed in (or returning from Google/Lovable) go straight to the Team page.
  useEffect(() => {
    let active = true;
    const check = async (uid: string) => {
      if (!active) return;
      const fromTeamDoor = sessionStorage.getItem(TEAM_FLAG) === "1";
      sessionStorage.removeItem(TEAM_FLAG);
      await admitOrReject(uid, fromTeamDoor);
    };
    supabase.auth.getUser().then(({ data }) => { if (data.user) check(data.user.id); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && sessionStorage.getItem(TEAM_FLAG) === "1") check(session.user.id);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function social(provider: "google" | "lovable") {
    setError("");
    sessionStorage.setItem(TEAM_FLAG, "1");
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/team-login" });
    if (r.error) { sessionStorage.removeItem(TEAM_FLAG); toast.error(r.error.message ?? "Sign in failed"); return; }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setBusy(false);
      setError(signInError.message);
      toast.error(signInError.message);
      return;
    }
    await admitOrReject(data.user?.id ?? "", true);
    setBusy(false);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <Link to="/" className="font-logo block text-center text-2xl uppercase">SimplyStitch</Link>
        <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-primary">Team</p>
        <h1 className="mt-3 text-center text-lg font-semibold">Team sign in</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">For SimplyStitch admins and super admins.</p>
        <div className="mt-5 flex flex-col gap-2">
          <button type="button" className="btn-ghost w-full justify-center" onClick={() => social("google")}>Continue with Google</button>
          <button type="button" className="lovable-auth-button" onClick={() => social("lovable")}>Continue with Lovable</button>
        </div>
        <div className="my-4 text-center text-xs text-muted-foreground">or with email</div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input type="email" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Team email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" minLength={6} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn-primary w-full justify-center" disabled={busy}>{busy ? "Please wait…" : "Sign in"}</button>
        </form>
        {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Not team?{" "}
          <Link to="/auth" className="font-semibold text-primary">Regular sign in</Link>
        </p>
      </div>
    </div>
  );
}
