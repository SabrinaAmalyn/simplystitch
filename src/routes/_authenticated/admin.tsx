import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AccountLayout } from "@/components/AccountLayout";
import { roleLabel, useAuth, type AppRole } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Team — SimplyStitch Admin" },
      { name: "description", content: "Manage SimplyStitch makers and the admin team." },
      { property: "og:title", content: "Team — SimplyStitch Admin" },
      { property: "og:description", content: "Manage SimplyStitch makers and the admin team." },
    ],
  }),
  component: AdminPage,
});

type Member = { id: string; display_name: string | null; email: string | null; roles: AppRole[] };

function AdminPage() {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email").order("created_at"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setMembers((profiles ?? []).map((p) => ({
      ...p,
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as AppRole),
    })));
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  async function setAdmin(m: Member, on: boolean) {
    const { error } = on
      ? await supabase.from("user_roles").insert({ user_id: m.id, role: "admin" })
      : await supabase.from("user_roles").delete().eq("user_id", m.id).eq("role", "admin");
    if (error) return toast.error(error.message);
    toast.success(on ? `${m.display_name ?? m.email} is now an Admin` : "Admin access removed");
    load();
  }

  if (loading) return <AccountLayout><p className="text-sm text-muted-foreground">Loading…</p></AccountLayout>;
  if (!isAdmin) return (
    <AccountLayout>
      <h1 className="text-2xl font-bold">No access</h1>
      <p className="mt-2 text-sm text-muted-foreground">This page is only for the SimplyStitch team.</p>
      <Link to="/my-patterns" className="btn-ghost mt-4 inline-flex">Back to my patterns</Link>
    </AccountLayout>
  );

  const shown = members.filter((m) => `${m.display_name} ${m.email}`.toLowerCase().includes(query.toLowerCase()));
  const count = (r: AppRole) => members.filter((m) => m.roles.includes(r)).length;

  return (
    <AccountLayout>
      <h1 className="text-2xl font-bold">Team</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isSuperAdmin ? "Add or remove admins from the SimplyStitch team." : "Everyone with a SimplyStitch account."}
      </p>
      <div className="mt-5 grid grid-cols-3 gap-3 sm:max-w-md">
        {([["Makers", members.length], ["Admins", count("admin")], ["Super Admins", count("super_admin")]] as const).map(([l, n]) => (
          <div key={l} className="rounded-xl border border-border bg-card p-3">
            <div className="text-2xl font-bold text-primary">{n}</div>
            <div className="text-xs text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
      <input className="mt-6 w-full max-w-md rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Search by name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
        {shown.map((m) => {
          const isStaff = m.roles.includes("admin");
          const isSuper = m.roles.includes("super_admin");
          return (
            <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{m.display_name ?? "Unnamed"}{m.id === user?.id && " (you)"}</div>
                <div className="truncate text-xs text-muted-foreground">{m.email}</div>
              </div>
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-primary">{roleLabel(m.roles)}</span>
              {isSuperAdmin && !isSuper && (
                <button className={isStaff ? "btn-ghost" : "btn-primary"} onClick={() => setAdmin(m, !isStaff)}>
                  {isStaff ? "Remove admin" : "Make admin"}
                </button>
              )}
            </li>
          );
        })}
        {shown.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">No members found.</li>}
      </ul>
    </AccountLayout>
  );
}
