import { describe, it, expect } from "vitest";
import { buildSamplePattern } from "@/lib/store";
describe("sample pattern", () => {
  it("builds a non-empty bunny example", () => {
    const p = buildSamplePattern();
    expect(p.config.ears).toBe("long");
    expect(p.text.length).toBeGreaterThan(100);
  });
});
