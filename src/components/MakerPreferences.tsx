import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMakerStash } from "@/hooks/useMakerStash";
import { useStore } from "@/lib/store";
import { yarnById } from "@/lib/yarn-palette";
import { TERMS } from "@/lib/yarn-form";
import { yarnWeight } from "@/lib/yarn-weights";
import { derivePreferences } from "@/lib/maker-insights";

const select = "rounded-md border border-input bg-background px-2 py-1.5 text-sm";

/** Stitching preferences worked out from the maker's saved patterns and yarn stash. */
export function MakerPreferences() {
  const { user } = useAuth();
  const library = useStore((s) => s.library);
  const { stash } = useMakerStash();
  const [terms, setTerms] = useState("US");

  useEffect(() => {
    if (!user) return;
    void supabase.from("maker_preferences").select("written_terms").eq("user_id", user.id).maybeSingle().then(({ data }) => data && setTerms(data.written_terms));
  }, [user]);

  const mine = useMemo(() => library.filter((p) => !isSample(p.id)), [library]);
  const derived = useMemo(() => derivePreferences(mine, stash), [mine, stash]);

  // Keep the account's preference record in step with what the maker actually uses.
  useEffect(() => {
    if (!user) return;
    const { usage: _u, ...prefs } = derived;
    void supabase.from("maker_preferences").upsert({ user_id: user.id, written_terms: terms, ...prefs, updated_at: new Date().toISOString() });
  }, [user, derived, terms]);

  const weight = yarnWeight(derived.yarn_weight);

  return (
    <section className="panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-semibold">My preferences</h2>
          <p className="text-sm text-muted-foreground">Worked out from your saved patterns and the yarns they use.</p>
        </div>
        <Link to="/my-yarn" className="btn-ghost">My yarn ({stash.length})</Link>
      </div>
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
  );
}

const isSample = (id: string) => id === "sample-berry-bunny" || id.startsWith("sample");
