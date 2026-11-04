import { PATTERN_HOOK_DEFAULT } from "@/lib/maker-insights";
import { yarnWeight } from "@/lib/yarn-weights";

export const TERMS = ["US", "UK"];

/** Hook sizes offered in the yarn stash form, smallest to largest. */
export const HOOK_SIZES = ["2.0 mm", "2.5 mm", "3.0 mm", "3.5 mm", "4.0 mm", "4.5 mm", "5.0 mm", "5.5 mm", "6.0 mm", "8.0 mm", "10.0 mm"];

/** Starting point for a new stash entry. */
export const NEW_YARN = { color_id: "peach", yarn_weight: "3 Light", hook_size: PATTERN_HOOK_DEFAULT, brand: "" };

const mm = (value: string) => Number.parseFloat(value);

/**
 * The smallest offered hook size inside the Craft Yarn Council's recommended
 * metric range for a weight; falls back to the largest offered hook below it.
 */
export function hookForWeight(weightId: string): string {
  const sizes = [...yarnWeight(weightId).hookMetric.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number.parseFloat(m[0]!));
  if (sizes.length === 0) return PATTERN_HOOK_DEFAULT;
  const min = Math.min(...sizes);
  const max = Math.max(...sizes);
  const inRange = HOOK_SIZES.filter((h) => mm(h) >= min && mm(h) <= max);
  if (inRange.length > 0) return inRange[0]!;
  return HOOK_SIZES.filter((h) => mm(h) <= max).pop() ?? HOOK_SIZES[0]!;
}
