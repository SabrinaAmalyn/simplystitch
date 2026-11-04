import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { isTeamRow, useTeamData } from "@/hooks/useTeamData";
import { yarnById } from "@/lib/yarn-palette";

export const Route = createFileRoute("/_authenticated/admin/makers")({
  head: () => ({
    meta: [
      { title: "Makers — SimplyStitch Team" },
      { name: "description", content: "Directory of SimplyStitch maker accounts with patterns, stash and preferences." },
      { property: "og:title", content: "Makers — SimplyStitch Team" },
      { property: "og:description", content: "Directory of SimplyStitch maker accounts with patterns, stash and preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MakersPage,
});

function MakersPage() {
  const { members, ready } = useTeamData();
  const [query, setQuery] = useState("");
  const makers = members.filter((m) => !isTeamRow(m));
  const shown = makers.filter((m) => `${m.displayName ?? ""} ${m.email ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold">Makers</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every maker account, their patterns, yarn stash and stitching preferences.</p>
      </header>
      <section className="mt-6 rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Makers <span className="text-muted-foreground">({makers.length})</span></h2>
          <label className="relative w-full sm:w-64">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="w-full rounded-lg border border-input bg-background py-1.5 pl-8 pr-3 text-sm" placeholder="Search makers" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                {["Maker", "Patterns", "Yarns", "Weight", "Hook", "Terms", "Favourite colours"].map((h) => (
                  <th key={h} className="px-4 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shown.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{m.displayName ?? "Unnamed"}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </td>
                  <td className="px-4 py-3">{m.patternCount}</td>
                  <td className="px-4 py-3">{m.yarnsListed}</td>
                  <td className="px-4 py-3">{m.yarnWeight ?? "—"}</td>
                  <td className="px-4 py-3">{m.hookSize ?? "—"}</td>
                  <td className="px-4 py-3">{m.writtenTerms ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {m.topColours.length === 0 ? "—" : m.topColours.slice(0, 5).map(([id]) => (
                        <span key={id} title={yarnById(id).name} className="h-4 w-4 rounded-full border border-border" style={{ background: yarnById(id).hex }} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{ready ? "No makers found." : "Loading…"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
