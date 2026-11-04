import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { MakerOnly } from "@/components/MakerOnly";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMakerStash } from "@/hooks/useMakerStash";
import { colourUsage } from "@/lib/maker-insights";
import { isSamplePattern } from "@/lib/profile-info";
import { useStore } from "@/lib/store";
import { YARNS, yarnById } from "@/lib/yarn-palette";
import { NEW_YARN, hookForWeight, HOOK_SIZES } from "@/lib/yarn-form";
import { YARN_WEIGHTS, YARN_WEIGHT_SOURCE, yarnWeight } from "@/lib/yarn-weights";

export const Route = createFileRoute("/my-yarn")({
  head: () => ({
    meta: [
      { title: "My Yarn — SimplyStitch" },
      { name: "description", content: "Your SimplyStitch yarn stash: every yarn you own with its colour, weight, hook size and brand." },
      { property: "og:title", content: "My Yarn — SimplyStitch" },
      { property: "og:description", content: "List the yarns you own, with colour, weight, hook size and brand." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <MakerOnly>
      <MyYarnPage />
    </MakerOnly>
  ),
});

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function MyYarnPage() {
  const { stash, ready, addYarn, removeYarn } = useMakerStash();
  const library = useStore((s) => s.library);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

  const usage = useMemo(() => colourUsage(library.filter((p) => !isSamplePattern(p.id))), [library]);
  const shown = stash.filter((y) => `${yarnById(y.color_id).name} ${y.brand}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <AccountLayout>
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">My Yarn</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every yarn you own, with its colour, weight, hook size and brand.</p>
        </div>
        <button type="button" className="btn-primary inline-flex items-center gap-1.5" onClick={() => setAdding(true)}>
          <Plus size={16} /> Add yarn
        </button>
      </div>

      <section className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">
            Yarn stash <span className="text-muted-foreground">({stash.length})</span>
          </h2>
          <label className="relative w-full sm:w-64">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-lg border border-input bg-background py-1.5 pl-8 pr-3 text-sm"
              placeholder="Search yarns"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                {["Colour", "Brand", "Weight", "Hook", "Used in", ""].map((h) => (
                  <th key={h} className="px-4 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shown.map((y) => {
                const c = yarnById(y.color_id);
                const w = yarnWeight(y.yarn_weight);
                const used = usage[y.color_id] ?? 0;
                return (
                  <tr key={y.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span aria-hidden className="h-5 w-5 shrink-0 rounded-full border border-border" style={{ background: c.hex }} />
                        <span className="font-semibold">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{y.brand || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{w.category} {w.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{y.hook_size}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{used} pattern{used === 1 ? "" : "s"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        aria-label={`Remove ${c.name}`}
                        onClick={() => void removeYarn(y.id)}
                        className="rounded p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {ready ? (stash.length === 0 ? "No yarns yet — add the yarns you own." : "No yarns match that search.") : "Loading…"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AddYarnDialog
        open={adding}
        onOpenChange={setAdding}
        onAdd={async (input) => {
          const ok = await addYarn(input);
          if (ok) setAdding(false);
          return ok;
        }}
      />
    </div>
    </AccountLayout>
  );
}

function AddYarnDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (input: { color_id: string; yarn_weight: string; hook_size: string; brand: string }) => Promise<boolean>;
}) {
  const [form, setForm] = useState(NEW_YARN);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onAdd(form);
      setForm(NEW_YARN);
    } finally {
      setBusy(false);
    }
  }

  const weight = yarnWeight(form.yarn_weight);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add yarn</DialogTitle>
          <DialogDescription>Tell us what you have in your basket.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">Colour
            <select className={field} value={form.color_id} onChange={(e) => setForm({ ...form, color_id: e.target.value })}>
              {YARNS.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">Brand
            <input className={field} value={form.brand} maxLength={60} placeholder="e.g. Scheepjes Catona" onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">Yarn weight
            <select
              className={field}
              value={form.yarn_weight}
              onChange={(e) => setForm({ ...form, yarn_weight: e.target.value, hook_size: hookForWeight(e.target.value) })}
            >
              {YARN_WEIGHTS.map((w) => <option key={w.id} value={w.id}>{w.category} {w.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">Recommended hook
            <select className={field} value={form.hook_size} onChange={(e) => setForm({ ...form, hook_size: e.target.value })}>
              {HOOK_SIZES.map((h) => <option key={h}>{h}</option>)}
            </select>
          </label>
          <p className="text-[11px] text-muted-foreground">CYC recommends {weight.hookMetric} for {weight.name}. {YARN_WEIGHT_SOURCE}</p>
          <DialogFooter>
            <button type="button" className="btn-ghost" onClick={() => onOpenChange(false)}>Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">{busy ? "Adding…" : "Add yarn"}</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
