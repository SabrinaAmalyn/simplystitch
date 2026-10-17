import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "@/lib/character";
import { createLayeredCharacter, selectLayer } from "@/lib/character-layers";
import { generatePattern, patternToText } from "@/lib/pattern";

const make = (ears: string | null, tail: string | null, face = {}) => {
  let layered = selectLayer(createLayeredCharacter(), "ears", ears);
  layered = selectLayer(layered, "tail", tail);
  return { ...DEFAULT_CONFIG, face: { ...DEFAULT_CONFIG.face, ...face }, layered };
};

describe("base doll pattern", () => {
  it("head peaks at 54 and closes to 12", () => {
    const head = generatePattern(make(null, null)).sections[0]!;
    expect(head.rounds.find((r) => r.label === "R9")?.count).toBe(54);
    expect(head.rounds.at(-1)).toMatchObject({ label: "R25", count: 12 });
  });
  it("body joins legs at 24 and ends at 12", () => {
    const body = generatePattern(make(null, null)).sections.find((s) => s.title.startsWith("Body"))!;
    expect(body.rounds[0]!.count).toBe(24);
    expect(body.rounds.at(-1)!.count).toBe(12);
  });
  it("arms are 8 stitches", () => {
    const text = patternToText(generatePattern(make(null, null)));
    expect(text).toContain("R3–R6: sc around for 4 rounds (8)");
  });
  it("cat ears reach 21 and sit between R1 and R9", () => {
    const text = patternToText(generatePattern(make("ears-cat", null)));
    expect(text).toContain("R7: sc around (21)");
    expect(text).toContain("between R1 and R9");
  });
  it("monkey ears sit between R11 and R18", () => {
    expect(patternToText(generatePattern(make("ears-human", null)))).toContain("between R11 and R18");
  });
  it("round tail starts with 3 sc", () => {
    expect(patternToText(generatePattern(make(null, "tail-round")))).toContain("R1: 3 sc in MR (3)");
  });
  it("small oval blush makes 8 stitches between R14 and R15", () => {
    const text = patternToText(generatePattern(make(null, null, { cheeks: true, blushShape: "oval" })));
    expect(text).toContain("(8)");
    expect(text).toContain("between R14 and R15");
  });
  it("eyes are placed between R12 and R13 with 8 stitches apart", () => {
    expect(patternToText(generatePattern(make(null, null)))).toContain("leaving 8 stitches between the eyes");
  });
});
