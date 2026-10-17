import { describe, expect, it } from "vitest";
import { BODY_PARTS, CROCHET_PARTS, configKey, DEFAULT_CONFIG, migratePartColors, partYarn } from "@/lib/character";
import { generatePattern, patternToText } from "@/lib/pattern";

describe("pattern generation", () => {
  it("ear style changes the ear template", () => {
    const long = patternToText(generatePattern({ ...DEFAULT_CONFIG, ears: "long" }));
    const pointy = patternToText(generatePattern({ ...DEFAULT_CONFIG, ears: "pointy" }));
    expect(long).toContain("Long ears");
    expect(pointy).toContain("Pointy ears");
    expect(long).not.toContain("Pointy ears");
  });

  it("body shape changes max stitch count", () => {
    const max = (b: "chubby" | "tall") =>
      Math.max(...(generatePattern({ ...DEFAULT_CONFIG, body: b }).sections[1]?.rounds ?? []).map((r) => r.count ?? 0));
    expect(max("chubby")).toBe(48);
    expect(max("tall")).toBe(30);
  });

  it("colors map to yarn names", () => {
    const t = patternToText(generatePattern({ ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, main: "teal" } }));
    expect(t).toContain("Dusty Teal");
  });

  it("base doll has no ears", () => {
    expect(DEFAULT_CONFIG.ears).toBe("none");
    const p = generatePattern(DEFAULT_CONFIG);
    expect(p.sections.filter((s) => /ears/i.test(s.title))).toEqual([]);
    expect(p.assembly.some((s) => s.startsWith("Sew ears"))).toBe(false);
  });

  it("base doll has no clothing or belly patch", () => {
    expect(DEFAULT_CONFIG.accessories).toEqual([]);
    expect(generatePattern(DEFAULT_CONFIG).sections.map((s) => s.title)).toEqual([
      "Head", "Body (standard, ~12 cm)", "Arms (make 2)", "Legs (make 2)",
    ]);
  });

  it("base doll has an oversized head and matching open neck", () => {
    const p = generatePattern(DEFAULT_CONFIG);
    expect(Math.max(...(p.sections[0]?.rounds ?? []).map((r) => r.count ?? 0))).toBe(60);
    expect(p.sections[0]?.rounds.at(-1)?.count).toBe(12);
    expect(p.sections[1]?.rounds.at(-1)?.count).toBe(12);
  });

  it("base doll legs stay straight after the rounded end", () => {
    const legs = generatePattern(DEFAULT_CONFIG).sections.find((s) => s.title === "Legs (make 2)");
    expect(legs?.rounds.map((r) => r.count)).toEqual([6, 12, 18, 18]);
  });

  it.each(CROCHET_PARTS)("%s can have its own yarn in the pattern", (part) => {
    const config = { ...DEFAULT_CONFIG, ears: "long" as const, colors: { ...DEFAULT_CONFIG.colors, [part]: "teal" } };
    const p = generatePattern(config);
    const titles = { head: "Head", body: "Body (standard, ~12 cm)", leftArm: "Left arm (make 1)", rightArm: "Right arm (make 1)", leftLeg: "Left leg (make 1)", rightLeg: "Right leg (make 1)", leftEar: "Left ear (make 1)", rightEar: "Right ear (make 1)" };
    expect(p.sections.find((s) => s.title === titles[part])?.yarn).toBe("Dusty Teal");
    expect(partYarn(config, part).id).toBe("teal");
    expect(p.materials.some((m) => m.startsWith("Dusty Teal ("))).toBe(true);
    expect(configKey(config)).not.toBe(configKey(DEFAULT_CONFIG));
  });

  it("backfills old single-color choices while retaining explicit part colors", () => {
    const old = { ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, main: "sage", leftArm: "sky" } };
    const migrated = migratePartColors(old);
    expect(migrated.colors.leftArm).toBe("sky");
    for (const part of CROCHET_PARTS.filter((p) => p !== "leftArm")) expect(migrated.colors[part]).toBe("sage");
    for (const part of ["leftInnerEar", "rightInnerEar", "blush"] as const) expect(migrated.colors[part]).toBe("blush");
    expect(old.colors).not.toHaveProperty("head");
  });

  it.each(["round", "long", "pointy"] as const)("separates differently colored %s ears without changing their rounds", (ears) => {
    const p = generatePattern({ ...DEFAULT_CONFIG, ears, colors: { ...DEFAULT_CONFIG.colors, leftEar: "teal", rightEar: "sky" } });
    const pair = p.sections.filter((s) => /^(Left|Right) ear/.test(s.title));
    expect(pair.map((s) => s.yarn)).toEqual([ears === "round" ? "Dusty Teal / Warm White" : "Dusty Teal", ears === "round" ? "Powder Blue / Warm White" : "Powder Blue"]);
    expect(pair[0]?.rounds).toEqual(pair[1]?.rounds);
  });
});
