import { expect, it } from "vitest";
import { sectionBody, withSectionBody } from "@/lib/pattern-reader";

const src = [
  "# Pattern",
  "",
  "## Head — yarn: Peach",
  "R1: 6 sc in magic ring (6)",
  "R2: inc around (12)",
  "",
  "## Ears (make 2) — yarn: Peach",
  "R1: 4 sc (4)",
  "",
  "## Assembly",
  "1. Sew the ears to the head.",
].join("\n");

it("extracts only the requested section body", () => {
  expect(sectionBody(src, 0)).toBe("R1: 6 sc in magic ring (6)\nR2: inc around (12)");
  expect(sectionBody(src, 1)).toBe("R1: 4 sc (4)");
  expect(sectionBody(src, 2)).toBe("1. Sew the ears to the head.");
  expect(sectionBody(src, 9)).toBe("");
});

it("replaces one section and leaves every other section byte-identical", () => {
  const next = withSectionBody(src, 1, "R1: 5 sc (5)\nR2: sc around (5)");
  expect(sectionBody(next, 1)).toBe("R1: 5 sc (5)\nR2: sc around (5)");
  expect(sectionBody(next, 0)).toBe("R1: 6 sc in magic ring (6)\nR2: inc around (12)");
  expect(sectionBody(next, 2)).toBe("1. Sew the ears to the head.");
  expect(next.split("\n").filter((l) => l.startsWith("## "))).toEqual(src.split("\n").filter((l) => l.startsWith("## ")));
  expect(next.startsWith("# Pattern")).toBe(true);
});

it("keeps heading text and yarn labels untouched when a body is edited", () => {
  const next = withSectionBody(src, 0, "R1: 7 sc in magic ring (7)");
  expect(next).toContain("## Head — yarn: Peach");
  expect(next).toContain("R1: 7 sc in magic ring (7)");
  expect(next).not.toContain("R2: inc around (12)");
});
