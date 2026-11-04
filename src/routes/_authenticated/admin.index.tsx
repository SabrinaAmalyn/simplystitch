import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Users, Layers, Ruler } from "lucide-react";
import { isTeamRow, useTeamData } from "@/hooks/useTeamData";
import { teamSummary } from "@/lib/team-stats";
import { yarnById } from "@/lib/yarn-palette";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Maker analytics — SimplyStitch Team" },
      { name: "description", content: "Analytics on maker patterns, colours, yarns and stitching preferences." },
      { property: "og:title", content: "Maker analytics — SimplyStitch Team" },
      { property: "og:description", content: "Analytics on maker patterns, colours, yarns and stitching preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyticsPage,
});

const top = (t: Record<string, number>) => Object.entries(t).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

function AnalyticsPage() {
  const { members, patterns, ready } = useTeamData();
  const makers = members.filter((m) => !isTeamRow(m));
  const makerIds = new Set(makers.map((m) => m.id));
  const makerPatterns = patterns.filter((p) => makerIds.has(p.user_id));
  const s = teamSummary(makers, makerPatterns);
  const yarns = makers.reduce((n, m) => n + m.yarnsListed, 0);

  const kpis = [
    { label: "Makers", value: makers.length, icon: Users },
    { label: "Saved patterns", value: makerPatterns.length, icon: BookOpen },
    { label: "Yarns in stashes", value: yarns, icon: Layers },
    { label: "Top yarn weight", value: top(s.yarnWeights), icon: Ruler },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold">Maker analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Activity and preferences across all maker accounts.</p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              {label} <Icon size={16} />
            </div>
            <div className="mt-2 truncate text-2xl font-bold">{ready ? value : "—"}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card title="Most-used colours">
          {s.topColours.length === 0 ? <Empty /> : (
            <ul className="flex flex-col gap-2.5">
              {s.topColours.map(([id, n]) => (
                <Bar key={id} label={yarnById(id).name} value={n} max={s.topColours[0]![1]} swatch={yarnById(id).hex} />
              ))}
            </ul>
          )}
        </Card>
        <Breakdown title="Yarn weights" tally={s.yarnWeights} />
        <div className="grid gap-4">
          <Breakdown title="Hook sizes" tally={s.hookSizes} />
          <Breakdown title="Written terms" tally={s.writtenTerms} />
        </div>
      </div>

    </div>
  );
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export const Empty = () => <p className="text-xs text-muted-foreground">Nothing recorded yet.</p>;

export function Bar({ label, value, max, swatch }: { label: string; value: number; max: number; swatch?: string }) {
  return (
    <li className="text-sm">
      <div className="flex items-center gap-2">
        {swatch && <span className="h-3.5 w-3.5 rounded-full border border-border" style={{ background: swatch }} />}
        <span className="truncate">{label}</span>
        <span className="ml-auto font-semibold">{value}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </li>
  );
}

function Breakdown({ title, tally }: { title: string; tally: Record<string, number> }) {
  const rows = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  return (
    <Card title={title}>
      {rows.length === 0 ? <Empty /> : (
        <ul className="flex flex-col gap-2.5">
          {rows.map(([k, n]) => <Bar key={k} label={k} value={n} max={rows[0]![1]} />)}
        </ul>
      )}
    </Card>
  );
}
