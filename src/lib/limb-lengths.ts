import type { CharacterConfig } from "./character";
import { JOINED_BODY } from "./joined-body";

/** Length multipliers; 1 is the reference anatomy. */
export const LIMB_RANGE = { min: 0.7, max: 1.4, step: 0.05 } as const;
export const ARM_BASE_LENGTH = 0.25;
const ARM_TILT = 0.35;

const clamp = (v: unknown) => typeof v === "number" && Number.isFinite(v) ? Math.min(LIMB_RANGE.max, Math.max(LIMB_RANGE.min, v)) : 1;

export function limbLengths(config: CharacterConfig) {
  return { arms: clamp(config.limbs?.arms), legs: clamp(config.limbs?.legs) };
}

/** Feet stay on the ground; longer legs lift the torso and everything above it. */
export function legShape(legs: number) {
  const base = JOINED_BODY.leftLeg;
  const ry = base.radii[1] * legs;
  const bottom = base.center[1] - base.radii[1];
  const lift = 2 * (ry - base.radii[1]);
  const leg = (x: number) => ({ center: [x, bottom + ry, 0] as const, radii: [base.radii[0], ry, base.radii[2]] as const });
  return {
    lift,
    shape: {
      torso: { center: [0, JOINED_BODY.torso.center[1] + lift, 0] as const, radii: JOINED_BODY.torso.radii },
      leftLeg: leg(base.center[0]),
      rightLeg: leg(-base.center[0]),
    },
  };
}

/** Shoulder end stays fixed; the arm grows outward along its tilt. */
export function armLayout(side: 1 | -1, arms: number) {
  const length = ARM_BASE_LENGTH * arms;
  const shift = (length - ARM_BASE_LENGTH) / 2;
  return {
    length,
    offset: [side * Math.cos(ARM_TILT) * shift, Math.sin(ARM_TILT) * shift] as const,
    rotationZ: side * (Math.PI / 2 + ARM_TILT),
    pawShift: -shift,
  };
}
