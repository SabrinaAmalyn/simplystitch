import { expect, it } from "vitest";
import { BLUSH_POSITION, HEAD, createBlushGeometry } from "@/lib/doll-anatomy";
import { JOINED_BODY, joinedBodyDistance } from "@/lib/joined-body";

it("makes oval blush smaller and wider than tall, nearer the eye line", () => {
  const round = createBlushGeometry();
  const oval = createBlushGeometry("oval");
  round.computeBoundingBox();
  oval.computeBoundingBox();
  const rb = round.boundingBox;
  const ob = oval.boundingBox;
  if (!rb || !ob) throw new Error("Missing blush bounds");
  expect(ob.max.x - ob.min.x).toBeLessThan(rb.max.x - rb.min.x);
  expect(ob.max.z - ob.min.z).toBeLessThan((ob.max.x - ob.min.x) * 0.6);
  expect(Math.abs(BLUSH_POSITION.oval[1])).toBeLessThan(Math.abs(BLUSH_POSITION.round[1]));
  const positions = oval.getAttribute("position");
  for (let i = 0; i < positions.count; i++) {
    expect(Math.hypot(positions.getX(i), positions.getY(i), positions.getZ(i))).toBeGreaterThan(1);
  }
  round.dispose();
  oval.dispose();
});

it("keeps the head inside the torso shoulder rather than leaving a gap", () => {
  const bottom = HEAD.y - HEAD.scale[1];
  expect(JOINED_BODY.torso.center[1] + JOINED_BODY.torso.radii[1] - bottom).toBeCloseTo(0.14);
  expect(joinedBodyDistance(0, bottom, 0)).toBeLessThan(0);
  for (const x of [-0.15, 0, 0.15]) {
    const headBottom = HEAD.y - HEAD.scale[1] * Math.sqrt(1 - (x / HEAD.scale[0]) ** 2);
    expect(joinedBodyDistance(x, headBottom, 0)).toBeLessThan(0);
  }
});

it("raises the round blush centre while keeping every edge outside the head", () => {
  const geometry = createBlushGeometry();
  const positions = geometry.getAttribute("position");
  let minimum = Infinity, maximum = 0;
  for (let i = 0; i < positions.count; i++) {
    const radius = Math.hypot(positions.getX(i), positions.getY(i), positions.getZ(i));
    minimum = Math.min(minimum, radius);
    maximum = Math.max(maximum, radius);
  }
  expect(minimum).toBeCloseTo(1.008, 5);
  expect(maximum).toBeCloseTo(1.043, 5);
  geometry.dispose();
});

it("keeps the oval blush flat with no raised centre", () => {
  const geometry = createBlushGeometry("oval");
  const positions = geometry.getAttribute("position");
  let minimum = Infinity, maximum = 0;
  for (let i = 0; i < positions.count; i++) {
    const radius = Math.hypot(positions.getX(i), positions.getY(i), positions.getZ(i));
    minimum = Math.min(minimum, radius);
    maximum = Math.max(maximum, radius);
  }
  expect(minimum).toBeCloseTo(1.008, 5);
  expect(maximum).toBeCloseTo(1.008, 5);
  geometry.dispose();
});