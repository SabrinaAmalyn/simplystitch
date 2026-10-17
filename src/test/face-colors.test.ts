import { expect, it } from "vitest";
import { DEFAULT_CONFIG, configKey, migratePartColors, partYarn } from "@/lib/character";

it("resolves independent blush colours and retains them when hidden", () => {
  const config = migratePartColors({ ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, leftBlush: "sky", rightBlush: "terracotta" }, face: { ...DEFAULT_CONFIG.face, cheeks: false } });
  expect(partYarn(config, "leftBlush").id).toBe("sky");
  expect(partYarn(config, "rightBlush").id).toBe("terracotta");
  expect(partYarn({ ...config, face: { ...config.face, cheeks: true } }, "leftBlush").id).toBe("sky");
});

it("resolves independent eye colours and distinguishes saved selections", () => {
  const config = { ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, leftEye: "teal", rightEye: "cocoa" } };
  expect(partYarn(config, "leftEye").id).toBe("teal");
  expect(partYarn(config, "rightEye").id).toBe("cocoa");
  expect(configKey(config)).not.toBe(configKey({ ...config, colors: { ...config.colors, rightEye: "charcoal" } }));
});

it("backfills each face side from saved shared colours without mutating the source", () => {
  const legacy = { ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, blush: "sage", eyes: "cocoa" } };
  const migrated = migratePartColors(legacy);
  expect(migrated.colors.leftBlush).toBe("sage");
  expect(migrated.colors.rightBlush).toBe("sage");
  expect(migrated.colors.leftEye).toBe("cocoa");
  expect(migrated.colors.rightEye).toBe("cocoa");
  expect(legacy.colors).not.toHaveProperty("leftEye");
  expect(partYarn(legacy, "leftBlush").id).toBe("sage");
});