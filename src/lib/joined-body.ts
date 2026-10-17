/** Independent crochet-inspired shape inputs; no stitch counts or pattern rules. */
export type BodyVolume = {
  center: readonly [number, number, number];
  radii: readonly [number, number, number];
};
/** A vertical capsule: constant thickness with a rounded tip, like the arms. */
export type LegCapsule = {
  halfSpacing: number;
  /** Lowest point of the rounded foot. */
  bottom: number;
  /** Where the leg sinks into the torso. */
  top: number;
  radius: number;
};
export const JOINED_BODY = {
  torso: { center: [0, 0.6, 0], radii: [0.49, 0.42, 0.36] },
  leg: { halfSpacing: 0.22, bottom: -0.02, top: 0.5, radius: 0.21 },
} satisfies { torso: BodyVolume; leg: LegCapsule };

function volumeDistance(x: number, y: number, z: number, volume: BodyVolume) {
  const [cx, cy, cz] = volume.center;
  const [rx, ry, rz] = volume.radii;
  return (Math.hypot((x - cx) / rx, (y - cy) / ry, (z - cz) / rz) - 1) * Math.min(rx, ry, rz);
}
/** Exact distance to a mirrored vertical capsule leg with a hemispherical foot tip. */
function legDistance(x: number, y: number, z: number, leg: LegCapsule) {
  const clampedY = Math.max(leg.bottom + leg.radius, Math.min(leg.top, y));
  return Math.hypot(Math.abs(x) - leg.halfSpacing, y - clampedY, z) - leg.radius;
}
function smoothUnion(a: number, b: number, blend: number) {
  const h = Math.max(blend - Math.abs(a - b), 0) / blend;
  return Math.min(a, b) - h * h * blend * 0.25;
}
export function joinedBodyDistance(x: number, y: number, z: number, shape = JOINED_BODY) {
  const legs = smoothUnion(legDistance(x, y, z, shape.leg), legDistance(x, y, z, shape.leg), 0.06);
  return smoothUnion(volumeDistance(x, y, z, shape.torso), legs, 0.16);
}
/** Same continuous surface, smoothly interpolated yarn regions at the leg join. */
export function bodyColorWeights(x: number, y: number) {
  const t = Math.max(0, Math.min(1, (y - 0.28) / 0.22));
  const torso = t * t * (3 - 2 * t);
  const left = Math.max(0, Math.min(1, (x + 0.04) / 0.08));
  return { torso, leftLeg: (1 - torso) * left, rightLeg: (1 - torso) * (1 - left) };
}
