import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { isTeamMember, type AppRole } from "@/lib/roles";

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

  const field = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-logo mb-6 block text-center text-2xl uppercase">SimplyStitch</Link>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
          <h1 className="text-xl font-semibold">Team sign in</h1>
          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <label className="text-sm font-medium">Email
              <input type="email" className={field + " mt-1.5"} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="text-sm font-medium">Password
              <input type="password" minLength={6} className={field + " mt-1.5"} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button className="btn-primary mt-1 w-full justify-center" disabled={busy}>{busy ? "Please wait…" : "Sign in"}</button>
          </form>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" className="btn-ghost w-full justify-center" onClick={() => social("google")}>Continue with Google</button>
            <button type="button" className="btn-ghost w-full justify-center" onClick={() => social("lovable")}>Continue with Lovable</button>
          </div>
        </div>
        <p className="mt-5 text-center text-xs"><Link to="/auth" className="text-muted-foreground hover:text-primary">Maker sign in</Link></p>
      </div>
    </div>
  );
}
