/** Independent crochet-inspired shape inputs; no stitch counts or pattern rules. */
export type BodyVolume = {
  center: readonly [number, number, number];
  radii: readonly [number, number, number];
};
export const JOINED_BODY = {
  torso: { center: [0, 0.64, 0], radii: [0.49, 0.45, 0.44] },
  leftLeg: { center: [0.22, 0.25, 0], radii: [0.205, 0.27, 0.255] },
  rightLeg: { center: [-0.22, 0.25, 0], radii: [0.205, 0.27, 0.255] },
} satisfies Record<string, BodyVolume>;

function volumeDistance(x: number, y: number, z: number, volume: BodyVolume) {
  const [cx, cy, cz] = volume.center;
  const [rx, ry, rz] = volume.radii;
  return (Math.hypot((x - cx) / rx, (y - cy) / ry, (z - cz) / rz) - 1) * Math.min(rx, ry, rz);
}
function smoothUnion(a: number, b: number, blend: number) {
  const h = Math.max(blend - Math.abs(a - b), 0) / blend;
  return Math.min(a, b) - h * h * blend * 0.25;
}
export function joinedBodyDistance(x: number, y: number, z: number, shape = JOINED_BODY) {
  const left = volumeDistance(x, y, z, shape.leftLeg);
  const right = volumeDistance(x, y, z, shape.rightLeg);
  return smoothUnion(volumeDistance(x, y, z, shape.torso), smoothUnion(left, right, 0.06), 0.16);
}
/** Same continuous surface, smoothly interpolated yarn regions at the leg join. */
export function bodyColorWeights(x: number, y: number) {
  const t = Math.max(0, Math.min(1, (y - 0.28) / 0.22));
  const torso = t * t * (3 - 2 * t);
  const left = Math.max(0, Math.min(1, (x + 0.04) / 0.08));
  return { torso, leftLeg: (1 - torso) * left, rightLeg: (1 - torso) * (1 - left) };
}