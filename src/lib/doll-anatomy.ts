import * as THREE from "three";
import { JOINED_BODY } from "./joined-body";
import type { BlushShape } from "./character";

export const BLUSH_POSITION = {
  round: [0.62, -0.54, 0.72],
  oval: [0.51, -0.23, 0.86],
} as const;

export const HEAD = {
  // Tuck the head into the shoulder volume, not just tangent to its top.
  y: JOINED_BODY.torso.center[1] + JOINED_BODY.torso.radii[1] + 0.94 - 0.14,
  scale: [1.02, 0.94, 0.96] as [number, number, number],
};
export const HEAD_ATTACHMENT_OFFSET = HEAD.y - 1.95;

/** A circular cap with a raised centre and a softly tapering, surface-hugging rim. */
export function createBlushGeometry(shape: BlushShape = "round") {
  const angle = 0.3;
  const geometry = new THREE.SphereGeometry(1, 48, 16, 0, Math.PI * 2, 0, angle);
  const positions = geometry.getAttribute("position");
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    const theta = Math.acos(Math.max(-1, Math.min(1, y)));
    // The round blush protrudes like the eyes; the oval blush stays flat —
    // a constant-thickness shell hugging the head with no raised centre.
    const raise = shape === "oval" ? 0 : 0.035 * falloff ** 2;
    const radius = 1.008 + raise;
    const tx = shape === "oval" ? x * 0.65 : x;
    const tz = shape === "oval" ? z * 0.32 : z;
    const ty = shape === "oval" ? Math.sqrt(Math.max(0, 1 - tx * tx - tz * tz)) : y;
    positions.setXYZ(i, tx * radius, ty * radius, tz * radius);
  }
  geometry.computeVertexNormals();
  return geometry;
}