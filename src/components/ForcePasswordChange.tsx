// ============= Full file contents =============

// Shown over the signed-in shell while the account still uses a temporary password.
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { passwordChangeError } from "@/lib/team-admin";

export function ForcePasswordChange() {
  const { user, loading } = useAuth();
  const [mustChange, setMustChange] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    void supabase
      .from("profiles")
      .select("must_change_password")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setMustChange(Boolean(data?.must_change_password)));
  }, [loading, user]);

  if (!user || !mustChange) return null;

  async function save(e: FormEvent) {
    e.preventDefault();
    const invalid = passwordChangeError(current, next, confirm);
    if (invalid) { toast.error(invalid); return; }
    setBusy(true);
    const uid = user!.id;
    const { error } = await supabase.auth.updateUser({ password: next, current_password: current });
    if (error) { setBusy(false); toast.error(error.message); return; }
    await supabase.from("profiles").update({ must_change_password: false }).eq("id", uid);
    toast.success("Password updated");
    setMustChange(false);
  }

  const field = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <div role="dialog" aria-modal="true" aria-label="Set a new password" className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 px-4">
      <form onSubmit={save} className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-lg">
        <h2 className="font-display text-xl font-semibold">Set a new password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account was created with a temporary password. Choose your own before continuing.
        </p>
        <label className="mt-5 block text-sm font-semibold">Temporary password
          <input type="password" autoComplete="current-password" className={`${field} mt-1.5 font-normal`} value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </label>
        <label className="mt-4 block text-sm font-semibold">New password
          <input type="password" autoComplete="new-password" className={`${field} mt-1.5 font-normal`} value={next} onChange={(e) => setNext(e.target.value)} required />
        </label>
        <label className="mt-4 block text-sm font-semibold">Confirm new password
          <input type="password" autoComplete="new-password" className={`${field} mt-1.5 font-normal`} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </label>
        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full justify-center disabled:opacity-60">
          {busy ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}
