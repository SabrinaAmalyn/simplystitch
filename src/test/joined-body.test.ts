import { expect, it } from "vitest";
import { bodyColorWeights, joinedBodyDistance } from "@/lib/joined-body";

it("joins both upper legs continuously into the torso", () => {
  for (const side of [-1, 1]) {
    for (let y = 0.2; y <= 0.9; y += 0.025) {
      expect(joinedBodyDistance(side * 0.22, y, 0)).toBeLessThan(0);
    }
  }
});
it("keeps two distinguishable feet with a small bottom gap", () => {
  expect(joinedBodyDistance(0, 0.055, 0)).toBeGreaterThan(0);
  expect(joinedBodyDistance(0.22, 0.055, 0)).toBeLessThan(0);
  expect(joinedBodyDistance(-0.22, 0.055, 0)).toBeLessThan(0);
});
it("keeps the joined body symmetric from front and back", () => {
  for (let y = 0; y < 1.2; y += 0.05) {
    expect(joinedBodyDistance(0.28, y, 0.15)).toBeCloseTo(joinedBodyDistance(-0.28, y, -0.15), 8);
  }
});
it("retains independent leg yarns and the torso yarn", () => {
  expect(bodyColorWeights(0.22, 0.1)).toEqual({ torso: 0, leftLeg: 1, rightLeg: 0 });
  expect(bodyColorWeights(-0.22, 0.1)).toEqual({ torso: 0, leftLeg: 0, rightLeg: 1 });
  expect(bodyColorWeights(0, 0.8)).toEqual({ torso: 1, leftLeg: 0, rightLeg: 0 });
});