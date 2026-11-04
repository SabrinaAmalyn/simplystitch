import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { roleLabel, useAuth, type AppRole } from "@/hooks/useAuth";
import { isTeamRow, useTeamData, type TeamMemberRow } from "@/hooks/useTeamData";
import { createTeamMember } from "@/lib/team-admin.functions";
import { MIN_PASSWORD } from "@/lib/team-admin";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/team")({
  head: () => ({
    meta: [
      { title: "Team members — SimplyStitch Team" },
      { name: "description", content: "Manage SimplyStitch team accounts and admin access." },
      { property: "og:title", content: "Team members — SimplyStitch Team" },
      { property: "og:description", content: "Manage SimplyStitch team accounts and admin access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { user, isSuperAdmin } = useAuth();
  const { members, ready, reload } = useTeamData();
  const [adding, setAdding] = useState(false);
  const team = members.filter(isTeamRow);

  async function removeAdmin(m: TeamMemberRow) {
    if (!confirm(`Remove admin access for ${m.email}?`)) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", m.id).eq("role", "admin");
    if (error) { toast.error(error.message); return; }
    toast.success("Admin access removed");
    reload();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Team members</h1>
          <p className="mt-1 text-sm text-muted-foreground">People with access to the team console.</p>
        </div>
        {isSuperAdmin && (
          <button className="btn-primary inline-flex items-center gap-2" onClick={() => setAdding(true)}>
            <UserPlus size={16} /> Add member
          </button>
        )}
      </header>

      <section className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Member</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Status</th>
              {isSuperAdmin && <th className="px-4 py-2 text-right font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {team.map((m) => {
              const isSuper = m.roles.includes("super_admin");
              return (
                <tr key={m.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{m.displayName ?? m.email}{m.id === user?.id && <span className="font-normal text-muted-foreground"> (you)</span>}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-primary">{roleLabel(m.roles as AppRole[])}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {m.mustChangePassword
                      ? <span className="text-muted-foreground">Invited · awaiting first sign-in</span>
                      : <span className="font-medium text-foreground">Active</span>}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-4 py-3 text-right">
                      {!isSuper && (
                        <button className="text-xs font-semibold text-destructive hover:underline" onClick={() => removeAdmin(m)}>Remove</button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {team.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">{ready ? "No team members yet." : "Loading…"}</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {isSuperAdmin && <AddMemberDialog open={adding} onOpenChange={setAdding} onAdded={reload} />}
    </div>
  );
}

function AddMemberDialog({ open, onOpenChange, onAdded }: { open: boolean; onOpenChange: (o: boolean) => void; onAdded: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const create = useServerFn(createTeamMember);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await create({ data: { email, password } });
      toast.success(`Account created for ${email}. Share the temporary password with them.`);
      setEmail("");
      setPassword("");
      onOpenChange(false);
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create that account.");
    } finally {
      setBusy(false);
    }
  }

  const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add team member</DialogTitle>
          <DialogDescription>They'll be asked to choose a new password the first time they sign in.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">Email
            <input type="email" required className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">Temporary password
            <input type="text" required minLength={MIN_PASSWORD} className={field} placeholder={`At least ${MIN_PASSWORD} characters`} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => onOpenChange(false)}>Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">{busy ? "Creating…" : "Create account"}</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
