import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/lib/store";
import { YARNS, yarnById } from "@/lib/yarn-palette";
import { YARN_WEIGHTS, YARN_WEIGHT_DEFAULT, YARN_WEIGHT_SOURCE, yarnWeight } from "@/lib/yarn-weights";
import { derivePreferences, PATTERN_HOOK_DEFAULT, type StashYarn } from "@/lib/maker-insights";

export const TERMS = ["US", "UK"];
export const HOOK_SIZES = ["2.0 mm", "2.5 mm", "3.0 mm", "3.5 mm", "4.0 mm", "4.5 mm", "5.0 mm", "5.5 mm", "6.0 mm", "8.0 mm", "10.0 mm"];

const NEW_YARN = { color_id: YARNS[0]?.id ?? "peach", yarn_weight: YARN_WEIGHT_DEFAULT, hook_size: PATTERN_HOOK_DEFAULT, brand: "" };
const select = "rounded-md border border-input bg-background px-2 py-1.5 text-sm";

/** Yarn stash plus preferences calculated from the maker's saved patterns. */
export function MakerPreferences() {
  const { user } = useAuth();
  const library = useStore((s) => s.library);
  const [terms, setTerms] = useState("US");
  const [stash, setStash] = useState<StashYarn[]>([]);
  const [form, setForm] = useState(NEW_YARN);

  useEffect(() => {
    if (!user) return;
    void supabase.from("maker_preferences").select("written_terms").eq("user_id", user.id).maybeSingle().then(({ data }) => data && setTerms(data.written_terms));
    void supabase.from("maker_yarns").select("id, color_id, yarn_weight, hook_size, brand").eq("user_id", user.id).order("created_at").then(({ data }) => data && setStash(data));
  }, [user]);

  const mine = useMemo(() => library.filter((p) => p.id !== "sample-berry-bunny" && !p.id.startsWith("sample")), [library]);
  const derived = useMemo(() => derivePreferences(mine, stash), [mine, stash]);

  // Keep the account's preference record in step with what the maker actually uses.
  useEffect(() => {
    if (!user) return;
    const { usage: _u, ...prefs } = derived;
    void supabase.from("maker_preferences").upsert({ user_id: user.id, written_terms: terms, ...prefs, updated_at: new Date().toISOString() });
  }, [user, derived, terms]);

  async function addYarn() {
    if (!user) { toast.error("Log in to save your yarns"); return; }
    const { data, error } = await supabase.from("maker_yarns").insert({ user_id: user.id, ...form, brand: form.brand.trim() }).select("id, color_id, yarn_weight, hook_size, brand").single();
    if (error || !data) { toast.error("Couldn't add that yarn"); return; }
    setStash((s) => [...s, data]);
    setForm({ ...NEW_YARN, yarn_weight: form.yarn_weight, hook_size: form.hook_size, brand: form.brand });
  }

  async function removeYarn(id: string) {
    setStash((s) => s.filter((y) => y.id !== id));
    const { error } = await supabase.from("maker_yarns").delete().eq("id", id);
    if (error) toast.error("Couldn't remove that yarn");
  }

  const weight = yarnWeight(derived.yarn_weight);

  return (
    <>
      <section className="panel">
        <h2 className="mb-1 font-display text-xl font-semibold">My yarns</h2>
        <p className="mb-4 text-sm text-muted-foreground">List the yarns you own.</p>
        {stash.length > 0 && (
          <ul className="mb-4 divide-y divide-border rounded-md border border-border">
            {stash.map((y) => {
              const c = yarnById(y.color_id);
              const used = derived.usage[y.color_id] ?? 0;
              return (
                <li key={y.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span aria-hidden className="h-6 w-6 shrink-0 rounded-full border border-border" style={{ background: c.hex }} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{c.name}{y.brand && <span className="font-normal text-muted-foreground"> · {y.brand}</span>}</p>
                    <p className="text-xs text-muted-foreground">{yarnWeight(y.yarn_weight).category} {yarnWeight(y.yarn_weight).name} · {y.hook_size} hook · used in {used} pattern{used === 1 ? "" : "s"}</p>
                  </div>
                  <button type="button" aria-label={`Remove ${c.name}`} onClick={() => removeYarn(y.id)} className="rounded p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">Colour
            <select className={select} value={form.color_id} onChange={(e) => setForm({ ...form, color_id: e.target.value })}>
              {YARNS.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">Brand
            <input className={select} value={form.brand} maxLength={60} placeholder="e.g. Scheepjes Catona" onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">Yarn weight
            <select className={select} value={form.yarn_weight} onChange={(e) => {
              const w = yarnWeight(e.target.value);
              setForm({ ...form, yarn_weight: w.id, hook_size: HOOK_SIZES.find((h) => w.hookMetric.startsWith(h.replace(" mm", "").replace(/\.0$/, ""))) ?? form.hook_size });
            }}>
              {YARN_WEIGHTS.map((w) => <option key={w.id} value={w.id}>{w.category} {w.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">Recommended hook
            <select className={select} value={form.hook_size} onChange={(e) => setForm({ ...form, hook_size: e.target.value })}>
              {HOOK_SIZES.map((h) => <option key={h}>{h}</option>)}
            </select>
          </label>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">CYC recommends {yarnWeight(form.yarn_weight).hookMetric} for {yarnWeight(form.yarn_weight).name}. {YARN_WEIGHT_SOURCE}</p>
        <button type="button" onClick={addYarn} className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Add yarn</button>
      </section>

      <section className="panel">
        <h2 className="mb-1 font-display text-xl font-semibold">My preferences</h2>
        <p className="mb-4 text-sm text-muted-foreground">Worked out from your saved patterns and the yarns they use.</p>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
            <dt className="text-muted-foreground">Written terms</dt>
            <dd>
              <select value={terms} onChange={(e) => setTerms(e.target.value)} className={`${select} font-semibold`}>
                {TERMS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-border pb-3"><dt className="text-muted-foreground">Yarn weight</dt><dd className="font-semibold">{weight.category} {weight.name}</dd></div>
          <div className="flex justify-between gap-2 border-b border-border pb-3"><dt className="text-muted-foreground">Hook size</dt><dd className="font-semibold">{derived.hook_size}</dd></div>
          <div>
            <dt className="mb-2 text-muted-foreground">Most-used colours</dt>
            <dd>
              {derived.favourite_yarns.length === 0 ? <p className="text-muted-foreground">Save a pattern to see your favourites.</p> : (
                <ul className="flex flex-wrap gap-2">
                  {derived.favourite_yarns.map((id) => {
                    const y = yarnById(id);
                    return (
                      <li key={id} className="flex items-center gap-2 rounded-full border border-border px-3 py-1">
                        <span aria-hidden className="h-4 w-4 rounded-full border border-border" style={{ background: y.hex }} />
                        {y.name} <span className="text-xs text-muted-foreground">×{derived.usage[id]}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </dd>
          </div>
        </dl>
        {!user && <p className="mt-3 text-xs text-muted-foreground">Log in to keep these on your account.</p>}
      </section>
    </>
  );
}
