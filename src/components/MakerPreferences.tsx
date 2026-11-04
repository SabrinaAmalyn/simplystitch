import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { YARNS } from "@/lib/yarn-palette";
import { YARN_WEIGHTS, YARN_WEIGHT_DEFAULT, YARN_WEIGHT_SOURCE, yarnWeight } from "@/lib/yarn-weights";

export const TERMS = ["US", "UK"];
export const HOOK_SIZES = ["2.0 mm", "2.5 mm", "3.0 mm", "3.5 mm", "4.0 mm", "4.5 mm", "5.0 mm", "6.0 mm"];

type Prefs = { written_terms: string; yarn_weight: string; hook_size: string; favourite_yarns: string[] };
const DEFAULTS: Prefs = { written_terms: "US", yarn_weight: YARN_WEIGHT_DEFAULT, hook_size: "3.0 mm", favourite_yarns: [] };

/** Weights saved before the CYC system was adopted resolve to their CYC category. */
const migrate = (saved: Partial<Prefs>): Prefs => ({ ...DEFAULTS, ...saved, yarn_weight: yarnWeight(saved.yarn_weight).id, favourite_yarns: saved.favourite_yarns ?? [] });

/** Stitching preferences + favourite yarns, saved to the maker's account. */
export function MakerPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    if (!user) return;
    void supabase.from("maker_preferences").select("written_terms, yarn_weight, hook_size, favourite_yarns").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => data && setPrefs(migrate(data)));
  }, [user]);

  async function update(patch: Partial<Prefs>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    if (!user) return;
    const { error } = await supabase.from("maker_preferences").upsert({ user_id: user.id, ...next, updated_at: new Date().toISOString() });
    if (error) toast.error("Couldn't save your preferences");
  }

  const toggleYarn = (id: string) =>
    update({ favourite_yarns: prefs.favourite_yarns.includes(id) ? prefs.favourite_yarns.filter((y) => y !== id) : [...prefs.favourite_yarns, id] });

  const field = (label: string, key: "written_terms" | "hook_size", options: string[]) => (
    <label className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <select value={prefs[key]} onChange={(e) => update({ [key]: e.target.value })} className="rounded-md border border-input bg-background px-2 py-1 text-sm font-semibold">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );

  const weight = yarnWeight(prefs.yarn_weight);

  return (
    <>
      <section className="panel">
        <h2 className="mb-4 font-display text-xl font-semibold">Stitching preferences</h2>
        <div className="flex flex-col gap-3">
          {field("Written terms", "written_terms", TERMS)}
          <div role="group" aria-label="Yarn weight" className="border-b border-border pb-3">
            <p className="text-sm text-muted-foreground">Yarn weight</p>
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
              {YARN_WEIGHTS.map((w) => {
                const on = w.category === weight.category;
                return (
                  <button key={w.id} type="button" aria-pressed={on} title={`${w.name} — ${w.alsoKnownAs}`} onClick={() => update({ yarn_weight: w.id })}
                    className={`flex flex-col items-center gap-1 rounded-md border px-1 py-2 text-[11px] leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${on ? "border-primary bg-accent font-semibold text-foreground" : "border-border bg-background text-muted-foreground hover:border-ring"}`}>
                    <span aria-hidden className={`flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{w.category}</span>
                    {w.name}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {weight.name} — {weight.alsoKnownAs}. Crochet gauge {weight.crochetGauge} per 4&Prime;; CYC recommends {weight.hookMetric} ({weight.hookUs} U.S.). Amigurumi usually uses a smaller hook.
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{YARN_WEIGHT_SOURCE}</p>
          </div>
          {field("Hook size", "hook_size", HOOK_SIZES)}
        </div>
        {!user && <p className="mt-3 text-xs text-muted-foreground">Log in to keep these on your account.</p>}
      </section>
      <section className="panel">
        <h2 className="mb-4 font-display text-xl font-semibold">Favourite yarns</h2>
        <ul className="flex flex-wrap gap-2">
          {YARNS.map((y) => {
            const on = prefs.favourite_yarns.includes(y.id);
            return (
              <li key={y.id}>
                <button type="button" aria-pressed={on} onClick={() => toggleYarn(y.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${on ? "border-primary bg-accent font-semibold" : "border-border bg-background text-muted-foreground"}`}>
                  <span aria-hidden className="h-4 w-4 rounded-full border border-border" style={{ background: y.hex }} />
                  {y.name}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
