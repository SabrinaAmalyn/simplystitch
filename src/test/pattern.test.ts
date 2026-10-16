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
      Math.max(...generatePattern({ ...DEFAULT_CONFIG, body: b }).sections[1]!.rounds.map((r) => r.count ?? 0));
    expect(max("chubby")).toBe(48);
    expect(max("tall")).toBe(30);
  });

  it("colors map to yarn names", () => {
    const t = patternToText(generatePattern({ ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, main: "teal" } }));
    expect(t).toContain("Deep Teal");
  });
});
