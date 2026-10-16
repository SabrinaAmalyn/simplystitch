import { beforeEach, expect, it, vi } from "vitest";
import { DEFAULT_CONFIG } from "@/lib/character";

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

it("migrates legacy colors without overwriting edited or recoverable drafts", async () => {
  const draft = { text: "My edited instructions", configKey: "old-key", edited: true, generatedAt: 100 };
  const previous = { ...draft, text: "Earlier edited instructions", generatedAt: 90 };
  localStorage.setItem("stitchling-doll-base-v2", "true");
  localStorage.setItem("stitchling-state-v1", JSON.stringify({ config: { ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, main: "sage" } }, draft, previous }));
  const { hydrateStore } = await import("@/lib/store");
  hydrateStore();
  const saved = JSON.parse(localStorage.getItem("stitchling-state-v1") ?? "{}");
  expect(saved.config.colors.head).toBe("sage");
  expect(saved.config.colors.leftLeg).toBe("sage");
  expect(saved.draft).toEqual(draft);
  expect(saved.previous).toEqual(previous);
  expect(saved.config.layered.baseId).toBe("reference-v2");
  expect(Object.values(saved.config.layered.selections)).toEqual([null, null, null, null, null]);
});

it("keeps selected layers when reopening a saved character", async () => {
  const { createLayeredCharacter, selectLayer } = await import("@/lib/character-layers");
  const layered = selectLayer(createLayeredCharacter(), "hair", "sample-hair");
  localStorage.setItem("stitchling-doll-base-v2", "true");
  localStorage.setItem("stitchling-state-v1", JSON.stringify({ config: { ...DEFAULT_CONFIG, layered }, draft: null, previous: null }));
  const { hydrateStore } = await import("@/lib/store");
  hydrateStore();
  expect(JSON.parse(localStorage.getItem("stitchling-state-v1") ?? "{}").config.layered).toEqual(layered);
});