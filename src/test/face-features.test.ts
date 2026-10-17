import { describe, expect, it } from "vitest";
import { BLUSH_OPTIONS, BROW_OPTIONS, EYE_OPTIONS, DEFAULT_CONFIG, MOUTH_OPTIONS, NOSE_OPTIONS, configKey, migratePartColors, type CharacterConfig } from "@/lib/character";

describe("embroidered face features", () => {
  it("offers round and small oval blush independently of other face features", () => {
    expect(BLUSH_OPTIONS.map((o) => o.value)).toEqual(["round", "oval"]);
    expect(configKey({ ...DEFAULT_CONFIG, face: { ...DEFAULT_CONFIG.face, blushShape: "oval" } })).not.toBe(configKey(DEFAULT_CONFIG));
  });

  it("offers closed sleepy eyes while keeping existing open eyes as default", () => {
    expect(EYE_OPTIONS.map((o) => o.value)).toEqual(["open", "sleepy"]);
    expect(DEFAULT_CONFIG.face.eyeStyle).toBe("open");
    expect(configKey({ ...DEFAULT_CONFIG, face: { ...DEFAULT_CONFIG.face, eyeStyle: "sleepy" } })).not.toBe(configKey(DEFAULT_CONFIG));
  });

  it("keeps whiskers optional and distinguishes them in the saved character key", () => {
    expect(DEFAULT_CONFIG.face.whiskers).toBe(false);
    expect(configKey({ ...DEFAULT_CONFIG, face: { ...DEFAULT_CONFIG.face, whiskers: true } })).not.toBe(configKey(DEFAULT_CONFIG));
  });

  it("offers independent nose and mouth options, each removable", () => {
    expect(NOSE_OPTIONS.map((o) => o.value)).toEqual(["none", "teddy", "cat", "round"]);
    expect(MOUTH_OPTIONS.map((o) => o.value)).toEqual(["none", "x", "w", "smile"]);
  });

  it("defaults to no nose and no mouth", () => {
    expect(DEFAULT_CONFIG.face.nose).toBe("none");
    expect(DEFAULT_CONFIG.face.mouth).toBe("none");
  });

  it("treats a missing nose/mouth in legacy saves as none without mutating the draft", () => {
    const legacy: CharacterConfig = { ...DEFAULT_CONFIG, face: { expression: "happy", cheeks: true } };
    expect(legacy.face.nose ?? "none").toBe("none");
    expect(legacy.face.mouth ?? "none").toBe("none");
    expect(legacy.face).not.toHaveProperty("nose");
  });

  it("changes the config key when a nose or mouth is selected", () => {
    const base = configKey(DEFAULT_CONFIG);
    expect(configKey({ ...DEFAULT_CONFIG, face: { ...DEFAULT_CONFIG.face, nose: "cat" } })).not.toBe(base);
    expect(configKey({ ...DEFAULT_CONFIG, face: { ...DEFAULT_CONFIG.face, mouth: "smile" } })).not.toBe(base);
  });

  it("offers eight eyebrow styles plus none, independent of other face features", () => {
    expect(BROW_OPTIONS.map((o) => o.value)).toEqual(["none", "straight", "soft-arch", "high-arch", "angry", "worried", "thick", "dots", "asymmetrical"]);
    expect(DEFAULT_CONFIG.face.brow).toBe("none");
    expect(configKey({ ...DEFAULT_CONFIG, face: { ...DEFAULT_CONFIG.face, brow: "angry" } })).not.toBe(configKey(DEFAULT_CONFIG));
  });

  it("defaults eyebrow colour to the eye colour and backfills legacy saves without mutating drafts", () => {
    const legacy: CharacterConfig = { ...DEFAULT_CONFIG, face: { expression: "happy", cheeks: true } };
    expect(legacy.face.brow ?? "none").toBe("none");
    expect(legacy.face).not.toHaveProperty("brow");
    const migrated = migratePartColors({ ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, eyes: "teal" } });
    expect(migrated.colors.brows).toBe("teal");
  });
});
