import { describe, expect, it } from "vitest";
import { focusForSection } from "../lib/part-focus";

describe("crochet piece close-ups", () => {
  it("shows separate blush pieces instead of a face", () => {
    expect(focusForSection("Blush (make 2)")).toBe("blush");
    expect(focusForSection("Left cheek")).toBe("blush");
    expect(focusForSection("Head")).toBe("head");
  });
  it("selects disconnected legs, not the joined body, for leg sections", () => {
    for (const title of ["Legs (make 2)", "Left leg", "Right leg"]) {
      expect(focusForSection(title)).toBe("legs");
    }
  });
  it("retains the joined body view for body instructions", () => {
    expect(focusForSection("Body (continues from the legs)")).toBe("body");
    expect(focusForSection("Body")).toBe("body");
  });
});