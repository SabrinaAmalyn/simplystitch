import { describe, it, expect } from "vitest";
import { buildSamplePattern } from "@/lib/store";
describe("sample pattern", () => {
  it("builds a non-empty bunny example", () => {
    const p = buildSamplePattern();
    expect(p.config.layered?.selections.ears).toBe("ears-bunny");
    expect(p.config.layered?.selections.tail).toBe("tail-round");
    expect(p.text).toMatch(/tail/i);
    expect(p.text.length).toBeGreaterThan(100);
  });
});
it("first visit seeds exactly one example, and it stays deleted", async () => {
  localStorage.clear();
  const { vi } = await import("vitest");
  vi.resetModules();
  const store = await import("@/lib/store");
  store.hydrateStore();
  expect(JSON.parse(localStorage.getItem("stitchling-state-v1")!).library).toHaveLength(1);
  store.deletePattern("sample-berry-bunny-v2");
  vi.resetModules();
  const again = await import("@/lib/store");
  again.hydrateStore();
  expect(JSON.parse(localStorage.getItem("stitchling-state-v1")!).library).toHaveLength(0);
});
