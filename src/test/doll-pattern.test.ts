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
  it("hands are the paw colour for R1–R3, then switch to the arm yarn", () => {
    const text = patternToText(generatePattern({ ...make(null, null), colors: { ...DEFAULT_CONFIG.colors, hands: "caramel" } }));
    expect(text).toContain("R1: 6 sc in MR — work in Caramel (paw colour) (6)");
    expect(text).toContain("R3: sc around — in Caramel (8)");
    expect(text).toContain("R4: switch to Peach, sc around (8)");
    expect(text).not.toContain("R3–R6: sc around for 4 rounds");
  });
  it("feet are the paw colour for R1–R4, then switch to the leg yarn", () => {
    const text = patternToText(generatePattern({ ...make(null, null), colors: { ...DEFAULT_CONFIG.colors, feet: "caramel" } }));
    expect(text).toContain("R1: 6 sc in MR — work in Caramel (paw colour) (6)");
    expect(text).toContain("R3–R4: sc around for 2 rounds — in Caramel (12)");
    expect(text).toContain("R5: switch to Peach, sc around (12)");
    expect(text).not.toContain("R3–R7: sc around for 5 rounds");
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

it("names the paw yarn alongside the limb yarn in arm and leg headings", async () => {
  const { DEFAULT_CONFIG } = await import("@/lib/character");
  const { generatePattern, patternToText } = await import("@/lib/pattern");
  const text = patternToText(generatePattern({ ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, leftArm: "sage", rightArm: "sage", leftLeg: "sage", rightLeg: "sage", hands: "teal", feet: "cocoa" } }));
  expect(text).toMatch(/## Arms \(make 2\) — yarn: .+ \(paw\) \+ /);
  expect(text).toMatch(/## Legs \(make 2\) — yarn: .+ \(paw\) \+ /);
});
