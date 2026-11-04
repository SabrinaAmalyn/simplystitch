import { describe, expect, it } from "vitest";
import { focusForSection } from "../lib/part-focus";

describe("crochet piece close-ups", () => {
  it("selects disconnected legs, not the joined body, for leg sections", () => {
    for (const title of ["Legs (make 2)", "Left leg", "Right leg"]) {
      expect(focusForSection(title)).toBe("legs");
    }
  });
  it("retains the joined body view for body instructions", () => {
    expect(focusForSection("Body (join legs)")).toBe("legs");
    expect(focusForSection("Body")).toBe("body");
  });
});