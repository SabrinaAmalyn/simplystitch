import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "@/lib/character";
import { armLayout, legShape, limbLengths } from "@/lib/limb-lengths";

describe("limb lengths", () => {
  it("defaults saved characters without limbs to 100%", () => {
    expect(limbLengths(DEFAULT_CONFIG)).toEqual({ arms: 1, legs: 1 });
  });
  it("clamps slider values to 100%–140%", () => {
    expect(limbLengths({ ...DEFAULT_CONFIG, limbs: { arms: 3, legs: 0.1 } })).toEqual({ arms: 1.4, legs: 1 });
  });
  it("keeps feet on the ground when legs lengthen", () => {
    const base = legShape(1).shape.leftLeg, long = legShape(1.4).shape.leftLeg;
    expect(long.center[1] - long.radii[1]).toBeCloseTo(base.center[1] - base.radii[1]);
    expect(legShape(1.4).lift).toBeGreaterThan(0);
  });
  it("keeps the arm's shoulder end fixed", () => {
    expect(armLayout(1, 1).offset).toEqual([0, 0]);
    expect(armLayout(1, 1.4).length).toBeCloseTo(0.35);
  });
});
