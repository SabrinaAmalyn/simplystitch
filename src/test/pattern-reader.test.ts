import { describe, expect, it } from "vitest";
import { expandRange, parsePatternText, sectionRowKeys } from "@/lib/pattern-reader";

const TEXT = `# Stitchling Bunny
DRAFT — auto-generated.

## Materials
- Cream

## Head (make 1) — yarn: Cream
R1: 6 sc in MR (6)
R10–R18: sc around for 9 rounds (54)
Note: Stuff firmly.

## Assembly
1. Sew the head on.`;

describe("pattern reader parser", () => {
  it("expands R4–R6 into three rounds", () => {
    expect(expandRange("R4–R6")).toEqual([4, 5, 6]);
  });

  it("groups a repeated range with one row per round, keeping text and count", () => {
    const head = parsePatternText(TEXT).sections.find((s) => s.title.startsWith("Head"))!;
    const group = head.items.find((i) => i.kind === "group");
    expect(group && group.kind === "group" && group.rows.map((r) => r.badge)).toEqual(["10", "11", "12", "13", "14", "15", "16", "17", "18"]);
    expect(group && group.kind === "group" && group.rows[0]?.count).toBe(54);
    expect(sectionRowKeys(head)).toHaveLength(10);
  });

  it("keeps notes, yarn and assembly steps", () => {
    const doc = parsePatternText(TEXT);
    expect(doc.sections.some((s) => s.title === "Introduction")).toBe(false);
    const head = doc.sections.find((s) => s.title.startsWith("Head"))!;
    expect(head.yarn).toBe("Cream");
    expect(head.items.some((i) => i.kind === "note" && i.text === "Stuff firmly.")).toBe(true);
    expect(sectionRowKeys(doc.sections.find((s) => s.title === "Assembly")!)).toHaveLength(1);
    expect(sectionRowKeys(doc.sections.find((s) => s.title === "Materials")!)).toHaveLength(0);
  });
});
