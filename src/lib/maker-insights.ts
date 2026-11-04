import { YARN_WEIGHT_DEFAULT } from "@/lib/yarn-weights";

export type StashYarn = { id: string; color_id: string; yarn_weight: string; hook_size: string; brand: string };
type PatternLike = { config: { colors: Record<string, string | undefined> } };

export const PATTERN_HOOK_DEFAULT = "3.0 mm";

/** How many saved patterns use each yarn colour (counted once per pattern). */
export function colourUsage(patterns: PatternLike[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of patterns) {
    for (const id of new Set(Object.values(p.config.colors ?? {}).filter(Boolean) as string[])) counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

function top(tally: Record<string, number>, fallback: string) {
  const best = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : fallback;
}

/** Preferences derived from what the maker actually uses in their saved patterns. */
export function derivePreferences(patterns: PatternLike[], stash: StashYarn[]) {
  const usage = colourUsage(patterns);
  const favourite_yarns = Object.entries(usage).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
  const weights: Record<string, number> = {};
  const hooks: Record<string, number> = {};
  for (const y of stash) {
    const n = usage[y.color_id] ?? 0;
    if (!n) continue;
    weights[y.yarn_weight] = (weights[y.yarn_weight] ?? 0) + n;
    hooks[y.hook_size] = (hooks[y.hook_size] ?? 0) + n;
  }
  return {
    favourite_yarns,
    yarn_weight: top(weights, YARN_WEIGHT_DEFAULT),
    hook_size: top(hooks, PATTERN_HOOK_DEFAULT),
    usage,
  };
}
