/** Shared length limits and whole-round scaling for preview and crochet rules. */
export const LIMB_LENGTH_MIN = 100;
export const LIMB_LENGTH_MAX = 170;
export type LimbLengths = { arms: number; legs: number };
export type LimbGroup = keyof LimbLengths;
export const BASE_LIMB_ROUNDS: LimbLengths = { arms: 6, legs: 7 };

export function normalizeLimbLength(value?: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(LIMB_LENGTH_MIN, Math.min(LIMB_LENGTH_MAX, Math.round(value)))
    : LIMB_LENGTH_MIN;
}

export function limbLengths(config: { lengths?: Partial<LimbLengths> }): LimbLengths {
  return { arms: normalizeLimbLength(config.lengths?.arms), legs: normalizeLimbLength(config.lengths?.legs) };
}

export function scaledLimbRounds(baseRounds: number, percent: number): number {
  return Math.round(baseRounds * normalizeLimbLength(percent) / 100);
}

/** Render the same discrete length achievable with whole crochet rounds. */
export function limbScale(config: { lengths?: Partial<LimbLengths> }, group: LimbGroup): number {
  return scaledLimbRounds(BASE_LIMB_ROUNDS[group], limbLengths(config)[group]) / BASE_LIMB_ROUNDS[group];
}