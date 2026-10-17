import * as THREE from "three";
import { JOINED_BODY } from "./joined-body";

export const HEAD = {
  // Tuck the head into the shoulder volume, not just tangent to its top.
  y: JOINED_BODY.torso.center[1] + JOINED_BODY.torso.radii[1] + 0.94 - 0.14,
  scale: [1.02, 0.94, 0.96] as [number, number, number],
};
export const HEAD_ATTACHMENT_OFFSET = HEAD.y - 1.95;

/** A circular cap with a raised centre and a softly tapering, surface-hugging rim. */
export function createBlushGeometry() {
  const angle = 0.3;
  const geometry = new THREE.SphereGeometry(1, 48, 16, 0, Math.PI * 2, 0, angle);
  const positions = geometry.getAttribute("position");
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    const theta = Math.acos(Math.max(-1, Math.min(1, y)));
    const falloff = Math.max(0, 1 - (theta / angle) ** 2);
    const radius = 1.008 + 0.035 * falloff ** 2;
    positions.setXYZ(i, x * radius, y * radius, z * radius);
  }
  geometry.computeVertexNormals();
  return geometry;
}