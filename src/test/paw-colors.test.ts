import { expect, it } from "vitest";
import { DEFAULT_CONFIG, BODY_PARTS, configKey, migratePartColors } from "@/lib/character";
import { isPawTip, limbSurfaceYarn, pawYarn } from "@/lib/paw-colors";

it("keeps independent left and right arm colours when shared hand markings are selected", () => {
  const c = { ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, body: "sage", hands: "teal", leftArm: "sky", rightArm: "cocoa" } };
  expect(pawYarn(c, "hands").id).toBe("teal");
  expect(limbSurfaceYarn(c, "leftArm", "hands").id).toBe("sky");
  expect(limbSurfaceYarn(c, "rightArm", "hands").id).toBe("cocoa");
});

it("keeps independent left and right leg colours when shared foot markings are selected", () => {
  const c = { ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, body: "cream", hands: "teal", feet: "blush", leftLeg: "sage", rightLeg: "sky" } };
  expect(pawYarn(c, "feet").id).toBe("blush");
  expect(limbSurfaceYarn(c, "leftLeg", "feet").id).toBe("sage");
  expect(limbSurfaceYarn(c, "rightLeg", "feet").id).toBe("sky");
});

it("bounds hands to distal caps and feet to bottom tips, never shoulders or torso", () => {
  expect(isPawTip("hands", -0.3)).toBe(true);
  expect(isPawTip("hands", -0.1)).toBe(true);
  expect(isPawTip("hands", 0)).toBe(false);
  expect(isPawTip("hands", 0.3)).toBe(false);
  expect(isPawTip("feet", 0)).toBe(true);
  expect(isPawTip("feet", 0.15)).toBe(true);
  expect(isPawTip("feet", 0.25)).toBe(false);
  expect(isPawTip("feet", 0.6)).toBe(false);
});

it("preserves legacy colours and does not introduce extra body parts on migration", () => {
  const original = { ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, leftArm: "sky", rightLeg: "cocoa" } };
  const c = migratePartColors(original);
  expect(c.colors.hands).toBeUndefined();
  expect(c.colors.feet).toBeUndefined();
  expect(limbSurfaceYarn(c, "leftArm", "hands").id).toBe("sky");
  expect(limbSurfaceYarn(c, "rightLeg", "feet").id).toBe("cocoa");
  expect(original.colors).not.toHaveProperty("hands");
  expect(BODY_PARTS).not.toContain("hands");
  expect(BODY_PARTS).not.toContain("feet");
});

it("preserves both paw selections through migration and distinguishes configuration keys", () => {
  const c = migratePartColors({ ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, hands: "sky", feet: "cocoa" } });
  expect(c.colors.hands).toBe("sky");
  expect(c.colors.feet).toBe("cocoa");
  expect(configKey(c)).not.toBe(configKey({ ...c, colors: { ...c.colors, hands: "teal" } }));
  expect(configKey(c)).not.toBe(configKey({ ...c, colors: { ...c.colors, feet: "cream" } }));
});
it("colours each hand and foot paw independently, falling back to the shared paw colour", async () => {
  const { generateDollPattern } = await import("@/lib/doll-pattern");
  const { pawMarked } = await import("@/lib/paw-colors");
  const c = { ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, hands: "teal", leftHand: "sky", rightFoot: "cocoa" } };
  expect(pawYarn(c, "leftHand").id).toBe("sky");
  expect(pawYarn(c, "rightHand").id).toBe("teal");
  expect(pawYarn(c, "rightFoot").id).toBe("cocoa");
  expect(pawMarked(c, "leftFoot")).toBe(false);
  const titles = generateDollPattern(c).sections.map((s) => s.title);
  expect(titles).toContain("Left arm (make 1)");
  expect(titles).toContain("Right arm (make 1)");
  expect(titles).toContain("Left leg (make 1)");
  expect(titles).toContain("Right leg (make 1)");
});
