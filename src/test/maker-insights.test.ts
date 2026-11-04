import { describe, expect, it } from "vitest";
import { derivePreferences } from "@/lib/maker-insights";

const p = (colors: Record<string, string>) => ({ config: { colors } });

describe("derivePreferences", () => {
  it("ranks favourite colours by how many patterns use them", () => {
    const r = derivePreferences([p({ main: "peach", eyes: "charcoal" }), p({ main: "peach", accent: "cream" })], []);
    expect(r.favourite_yarns[0]).toBe("peach");
    expect(r.usage.peach).toBe(2);
  });
  it("takes weight and hook from stash yarns used in patterns", () => {
    const stash = [
      { id: "1", color_id: "peach", yarn_weight: "4 Medium", hook_size: "3.5 mm", brand: "A" },
      { id: "2", color_id: "mint", yarn_weight: "6 Super Bulky", hook_size: "6.0 mm", brand: "B" },
    ];
    const r = derivePreferences([p({ main: "peach" })], stash);
    expect(r.yarn_weight).toBe("4 Medium");
    expect(r.hook_size).toBe("3.5 mm");
  });
  it("falls back to the pattern standard with nothing used", () => {
    const r = derivePreferences([], []);
    expect(r.yarn_weight).toBe("3 Light");
    expect(r.hook_size).toBe("3.0 mm");
  });
});
