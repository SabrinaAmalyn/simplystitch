import { beforeEach, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

async function setup() {
  const store = await import("@/lib/store");
  store.hydrateStore();
  store.setState((s) => ({ ...s, draft: { text: "v1", configKey: "a", edited: false, generatedAt: 1 } }));
  const id = store.savePatternToLibrary("Bunny")!;
  store.loadPatternIntoCustomizer(id);
  store.setState((s) => ({ ...s, draft: { text: "v2", configKey: "b", edited: false, generatedAt: 2 } }));
  return { store, id };
}

it("updating keeps the same pattern and archives the previous version", async () => {
  const { store, id } = await setup();
  store.updatePatternInLibrary(id);
  const lib = JSON.parse(localStorage.getItem("stitchling-state-v1")!).library;
  expect(lib).toHaveLength(1);
  expect(lib[0].id).toBe(id);
  expect(lib[0].text).toBe("v2");
  expect(lib[0].history.map((h: { text: string }) => h.text)).toEqual(["v1"]);
});

it("saving as a new copy leaves the original untouched", async () => {
  const { store, id } = await setup();
  store.savePatternToLibrary("Bunny copy");
  const lib = JSON.parse(localStorage.getItem("stitchling-state-v1")!).library;
  expect(lib).toHaveLength(2);
  expect(lib.find((p: { id: string }) => p.id === id).text).toBe("v1");
});
