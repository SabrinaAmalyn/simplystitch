// ============= Full file contents =============

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AccountLayout } from "@/components/AccountLayout";
import { roleLabel, useAuth, type AppRole } from "@/hooks/useAuth";
import { yarnById } from "@/lib/yarn-palette";
import { memberStats, teamSummary, type MemberStats, type PatternRow, type PrefsRow, type RoleRow, type YarnRow } from "@/lib/team-stats";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Maker stats — SimplyStitch Team" },
      { name: "description", content: "SimplyStitch team console: see what makers save, their colours, yarns and stitching preferences." },
      { property: "og:title", content: "Maker stats — SimplyStitch Team" },
      { property: "og:description", content: "See what makers save, their colours, yarns and stitching preferences." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [patterns, setPatterns] = useState<PatternRow[]>([]);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const [{ data: profiles }, { data: roleRows }, { data: patternRows }, { data: prefs }, { data: yarns }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email").order("created_at"),
      supabase.from("user_roles").select("user_id, role") as PromiseLike<{ data: RoleRow[] | null }>,
      supabase.from("patterns").select("user_id, config") as PromiseLike<{ data: PatternRow[] | null }>,
      supabase.from("maker_preferences").select("user_id, written_terms, yarn_weight, hook_size") as PromiseLike<{ data: PrefsRow[] | null }>,
      supabase.from("maker_yarns").select("user_id") as PromiseLike<{ data: YarnRow[] | null }>,
    ]);
    const rows = {
      profiles: profiles ?? [],
      roleRows: roleRows ?? [],
      patterns: (patternRows ?? []).map((p) => ({ user_id: p.user_id, config: p.config as unknown as PatternRow["config"] })),
      prefs: prefs ?? [],
      yarns: yarns ?? [],
    };
    setPatterns(rows.patterns);
    setMembers(memberStats(rows));
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  async function setAdmin(m: MemberStats, on: boolean) {
    const { error } = on
      ? await supabase.from("user_roles").insert({ user_id: m.id, role: "admin" })
      : await supabase.from("user_roles").delete().eq("user_id", m.id).eq("role", "admin");
    if (error) { toast.error(error.message); return; }
    toast.success(on ? `${m.displayName ?? m.email} is now an Admin` : "Admin access removed");
    load();
  }

  if (loading) return <AccountLayout><p className="text-sm text-muted-foreground">Loading…</p></AccountLayout>;
  if (!isAdmin) return (
    <AccountLayout>
      <h1 className="text-2xl font-bold">No access</h1>
      <p className="mt-2 text-sm text-muted-foreground">This page is only for the SimplyStitch team.</p>
      <a href="/my-patterns" className="btn-ghost mt-4 inline-flex">Back to my patterns</a>
    </AccountLayout>
  );

  const summary = teamSummary(members, patterns);
  const shown = members.filter((m) => `${m.displayName} ${m.email}`.toLowerCase().includes(query.toLowerCase()));

  const breakdown = (title: string, tally: Record<string, number>) => (
    <section key={title} className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {Object.keys(tally).length === 0
        ? <p className="mt-2 text-xs text-muted-foreground">Nothing recorded yet.</p>
        : (
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            {Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([value, n]) => (
              <div key={value} className="flex items-center justify-between gap-2">
                <dt className="truncate">{value}</dt>
                <dd className="font-semibold text-primary">{n}</dd>
              </div>
            ))}
          </dl>
        )}
    </section>
  );

  return (
    <AccountLayout>
      <h1 className="text-2xl font-bold">Maker stats</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        What makers save in their personal accounts: patterns, colours, yarns and stitching preferences.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-xl md:grid-cols-4">
        {([["Makers", summary.accounts], ["Admins", summary.admins], ["Super Admins", summary.superAdmins], ["Saved patterns", summary.patterns]] as const).map(([l, n]) => (
          <div key={l} className="rounded-xl border border-border bg-card p-3">
            <div className="text-2xl font-bold text-primary">{n}</div>
            <div className="text-xs text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Most-used colours</h2>
          {summary.topColours.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">No saved patterns yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {summary.topColours.map(([id, n]) => (
                <li key={id} className="flex items-center gap-2">
                  <span aria-hidden className="h-4 w-4 rounded-full border border-border" style={{ background: yarnById(id).hex }} />
                  <span className="truncate">{yarnById(id).name}</span>
                  <span className="ml-auto font-semibold text-primary">×{n}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        {breakdown("Yarn weights", summary.yarnWeights)}
        {breakdown("Hook sizes", summary.hookSizes)}
        {breakdown("Written terms", summary.writtenTerms)}
      </div>

      <h2 className="mt-8 text-lg font-bold">Makers</h2>
      <input className="mt-3 w-full max-w-md rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Search by name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
        {shown.map((m) => {
          const isStaff = m.roles.includes("admin");
          const isSuper = m.roles.includes("super_admin");
          return (
            <li key={m.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{m.displayName ?? "Unnamed"}{m.id === user?.id && " (you)"}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.email}</div>
                </div>
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-primary">{roleLabel(m.roles as AppRole[])}</span>
                {isSuperAdmin && !isSuper && (
                  <button className={isStaff ? "btn-ghost" : "btn-primary"} onClick={() => setAdmin(m, !isStaff)}>
                    {isStaff ? "Remove admin" : "Make admin"}
                  </button>
                )}
              </div>
              <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                <div>Patterns saved: <span className="font-semibold text-foreground">{m.patternCount}</span></div>
                <div>Yarns listed: <span className="font-semibold text-foreground">{m.yarnsListed}</span></div>
                <div>Weight: <span className="font-semibold text-foreground">{m.yarnWeight ?? "—"}</span></div>
                <div>Hook: <span className="font-semibold text-foreground">{m.hookSize ?? "—"}</span></div>
                <div>Terms: <span className="font-semibold text-foreground">{m.writtenTerms ?? "—"}</span></div>
                {m.topColours.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    Favourite colours:
                    {m.topColours.slice(0, 4).map(([id]) => (
                      <span key={id} title={yarnById(id).name} aria-label={yarnById(id).name} className="inline-block h-3.5 w-3.5 rounded-full border border-border align-middle" style={{ background: yarnById(id).hex }} />
                    ))}
                  </div>
                )}
              </dl>
            </li>
          );
        })}
        {shown.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">No members found.</li>}
      </ul>
    </AccountLayout>
  );
}
