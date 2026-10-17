import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, MOUTH_OPTIONS, NOSE_OPTIONS, configKey, type CharacterConfig } from "@/lib/character";

describe("embroidered face features", () => {
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
});
