import { describe, expect, it } from "vitest";
import { HOOK_SIZES, NEW_YARN, TERMS, hookForWeight } from "@/lib/yarn-form";

describe("hookForWeight", () => {
  it("picks the smallest offered hook inside the CYC range for each category", () => {
    expect(hookForWeight("0 Lace")).toBe("2.0 mm");
    expect(hookForWeight("1 Super Fine")).toBe("2.5 mm");
    expect(hookForWeight("2 Fine")).toBe("3.5 mm");
    expect(hookForWeight("3 Light")).toBe("4.5 mm");
    expect(hookForWeight("4 Medium")).toBe("5.5 mm");
    expect(hookForWeight("5 Bulky")).toBe("8.0 mm");
    expect(hookForWeight("6 Super Bulky")).toBe("10.0 mm");
  });

  it("stays within the offered hook sizes for jumbo yarn and unknown values", () => {
    expect(HOOK_SIZES).toContain(hookForWeight("7 Jumbo"));
    expect(HOOK_SIZES).toContain(hookForWeight("not a weight"));
  });
});

describe("stash form defaults", () => {
  it("starts a new yarn at the pattern's DK weight and US terms", () => {
    expect(NEW_YARN).toMatchObject({ yarn_weight: "3 Light", hook_size: "3.0 mm", brand: "" });
    expect(TERMS).toEqual(["US", "UK"]);
  });
});
