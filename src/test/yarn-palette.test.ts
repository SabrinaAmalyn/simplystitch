import { expect, it } from "vitest";
import { BLUSH_YARN_GROUPS, YARNS, yarnById } from "@/lib/yarn-palette";
import { DEFAULT_CONFIG, migratePartColors, partYarn, type BodyPart } from "@/lib/character";
import { pawYarn } from "@/lib/paw-colors";

const expected = {
  "Warm White": "#FFF9F0", Ivory: "#F5EAD7", Vanilla: "#EAD9B9", Oatmeal: "#D6C2A3", Stone: "#B9A58D",
  "Milk Tea": "#CBA889", Caramel: "#B78055", Cinnamon: "#995D3B", Chestnut: "#78462F", "Dark Cocoa": "#4B3028",
  Peach: "#F2B49A", Terracotta: "#D47A59", "Fox Red": "#C65A35", Rust: "#A9492D", Brick: "#873D32",
  "Blush Pink": "#EFA6A5", "Baby Pink": "#F6CDD0", "Butter Yellow": "#F1D78B", "Sage Green": "#A8B99A", "Powder Blue": "#A9CCDF",
  Moss: "#87966C", Olive: "#68784F", Eucalyptus: "#7EA69B", "Dusty Teal": "#588D8A", Lavender: "#B8A5CF",
};

it("offers exactly the requested 25 yarn colours with exact hex values", () => {
  expect(Object.fromEntries(YARNS.map((yarn) => [yarn.name, yarn.hex]))).toEqual(expected);
  expect(new Set(YARNS.map((yarn) => yarn.id)).size).toBe(25);
});

it("uses the same exact yarns for every body region and both paw selections", () => {
  const parts: BodyPart[] = ["head", "body", "leftArm", "rightArm", "leftLeg", "rightLeg", "leftEar", "rightEar", "tail"];
  for (const yarn of YARNS) {
    for (const part of parts) {
      const config = { ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, [part]: yarn.id, hands: yarn.id, feet: yarn.id } };
      expect(partYarn(config, part).hex).toBe(expected[yarn.name as keyof typeof expected]);
      expect(pawYarn(config, "hands").hex).toBe(yarn.hex);
      expect(pawYarn(config, "feet").hex).toBe(yarn.hex);
    }
  }
});

it("limits new blush choices to the dedicated pink and peach yarns", () => {
  expect(BLUSH_YARN_GROUPS.flatMap((group) => group.yarns.map((yarn) => [yarn.name, yarn.hex]))).toEqual([
    ["Blush Pink", "#EFA6A5"], ["Baby Pink", "#F6CDD0"], ["Peach", "#F2B49A"],
  ]);
});

it("retains all saved legacy yarn IDs and independent selections without mutating saved input", () => {
  const ids = ["peach", "oat", "cream", "blush", "terracotta", "mustard", "sage", "teal", "sky", "lilac", "cocoa", "charcoal"];
  for (const id of ids) expect(yarnById(id).id).toBe(id);
  const original = { ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, leftArm: "sky", rightArm: "teal", leftBlush: "sage" } };
  const before = JSON.stringify(original);
  const migrated = migratePartColors(original);
  expect(migrated.colors.leftArm).toBe("sky");
  expect(migrated.colors.rightArm).toBe("teal");
  expect(migrated.colors.leftBlush).toBe("sage");
  expect(JSON.stringify(original)).toBe(before);
});

it("resolves legacy dark eyes to Dark Cocoa instead of black", () => {
  expect(partYarn(DEFAULT_CONFIG, "leftEye").hex).toBe("#4B3028");
  expect(partYarn(DEFAULT_CONFIG, "rightEye").hex).toBe("#4B3028");
});