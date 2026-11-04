import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Download, Eye, MousePointerClick, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteOfficial, listAllOfficial, setFeatured, type OfficialPattern } from "@/lib/official-patterns";
import { DEFAULT_CONFIG } from "@/lib/character";
import { createLayeredCharacter } from "@/lib/character-layers";
import { setState } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/admin/showcase")({
  head: () => ({
    meta: [
      { title: "Official patterns — SimplyStitch Team" },
      { name: "description", content: "Design official SimplyStitch patterns and choose which appear on the landing page." },
      { property: "og:title", content: "Official patterns — SimplyStitch Team" },
      { property: "og:description", content: "Design official SimplyStitch patterns and choose which appear on the landing page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ShowcasePage,
});

const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "—");

function ShowcasePage() {
  const [rows, setRows] = useState<OfficialPattern[] | null>(null);
  const navigate = useNavigate();
  const load = useCallback(async () => setRows(await listAllOfficial()), []);
  useEffect(() => { void load(); }, [load]);

  const startNew = () => {
    setState((s) => ({ ...s, editingPatternId: null, draft: null, config: { ...DEFAULT_CONFIG, layered: createLayeredCharacter() } }));
    navigate({ to: "/customize" });
  };
  const toggle = async (p: OfficialPattern, v: boolean) => {
    setRows((r) => r?.map((x) => (x.id === p.id ? { ...x, is_featured: v } : x)) ?? r);
    try { await setFeatured(p.id, v); toast.success(v ? "Now on the landing page" : "Hidden from the landing page"); }
    catch { toast.error("Could not update"); void load(); }
  };
  const remove = async (p: OfficialPattern) => {
    if (!confirm(`Delete “${p.name}”? Its stats will be lost.`)) return;
    try { await deleteOfficial(p.id); setRows((r) => r?.filter((x) => x.id !== p.id) ?? r); }
    catch { toast.error("Could not delete"); }
  };

  const all = rows ?? [];
  const sum = (k: "view_count" | "click_count" | "customize_count" | "download_count") => all.reduce((a, p) => a + p[k], 0);
  const views = sum("view_count"), clicks = sum("click_count") + sum("customize_count"), downloads = sum("download_count");
  const KPIS = [
    { label: "Live on landing", value: all.filter((p) => p.is_featured).length, icon: Sparkles },
    { label: "Landing views", value: views, icon: Eye },
    { label: "Click-throughs", value: `${clicks} · ${pct(clicks, views)}`, icon: MousePointerClick },
    { label: "Saves to My Patterns", value: downloads, icon: Download },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Official patterns</h1>
          <p className="mt-1 text-sm text-muted-foreground">Designs by the SimplyStitch team. Toggle which appear on the landing page; team activity is never counted.</p>
        </div>
        <Button onClick={startNew}><Plus size={16} /> New pattern</Button>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">{label} <Icon size={16} /></div>
            <div className="mt-2 text-2xl font-bold">{rows ? value : "—"}</div>
          </div>
        ))}
      </div>

      <section className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        {rows && rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No official patterns yet. Press <strong>New pattern</strong> to design one.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pattern</TableHead>
                <TableHead>On landing page</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Opened</TableHead>
                <TableHead className="text-right">Customized</TableHead>
                <TableHead className="text-right">Saved</TableHead>
                <TableHead className="text-right">Click rate</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {all.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link to="/official/$patternId" params={{ patternId: p.id }} className="font-semibold hover:underline">{p.name}</Link>
                    <div className="text-xs text-muted-foreground">Created {new Date(p.created_at).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell><Switch aria-label={`Show ${p.name} on landing page`} checked={p.is_featured} onCheckedChange={(v) => void toggle(p, v)} /></TableCell>
                  <TableCell className="text-right">{p.view_count}</TableCell>
                  <TableCell className="text-right">{p.click_count}</TableCell>
                  <TableCell className="text-right">{p.customize_count}</TableCell>
                  <TableCell className="text-right">{p.download_count}</TableCell>
                  <TableCell className="text-right">{pct(p.click_count + p.customize_count, p.view_count)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" aria-label={`Delete ${p.name}`} onClick={() => void remove(p)}><Trash2 size={16} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
