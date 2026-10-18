import { describe, expect, it } from "vitest";
import { limbLengths, LIMB_LENGTH_MIN, LIMB_LENGTH_MAX } from "@/lib/limb-lengths";

/** Mirrors the Randomize length picker in customize.tsx: 10% steps from 100 to 170. */
const pickLength = () => 100 + 10 * Math.floor(Math.random() * 8);

describe("randomized limb lengths", () => {
  it("produces slider-reachable values on every draw", () => {
    for (let i = 0; i < 200; i++) {
      const lengths = { arms: pickLength(), legs: pickLength(), torso: pickLength() };
      const normalized = limbLengths(lengths);
      for (const value of Object.values(normalized)) {
        expect(value).toBeGreaterThanOrEqual(LIMB_LENGTH_MIN);
        expect(value).toBeLessThanOrEqual(LIMB_LENGTH_MAX);
        expect((value - LIMB_LENGTH_MIN) % 10).toBe(0);
      }
    }
  });
});
