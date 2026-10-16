import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "@/lib/character";
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
    expect(t).toContain("Deep Teal");
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
});
