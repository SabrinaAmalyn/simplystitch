import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isTeamMember, type AppRole } from "@/lib/roles";

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
    const uid = data.user?.id ?? "";
    const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    const roles = (roleRows ?? []).map((r) => r.role as AppRole);
    if (!isTeamMember(roles)) {
      await supabase.auth.signOut();
      setBusy(false);
      const msg = "This account isn't on the SimplyStitch team. Makers sign in on the regular page.";
      setError(msg);
      toast.error(msg);
      return;
    }
    navigate({ to: "/admin" });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <Link to="/" className="font-logo block text-center text-2xl uppercase">SimplyStitch</Link>
        <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-primary">Team</p>
        <h1 className="mt-3 text-center text-lg font-semibold">Team sign in</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">For SimplyStitch admins and super admins.</p>
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
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
