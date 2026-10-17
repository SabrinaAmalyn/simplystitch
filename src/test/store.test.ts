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

it("retains the renamed ear selection and drafts across the joined anatomy update", async () => {
  const { createLayeredCharacter, selectLayer } = await import("@/lib/character-layers");
  const { configKey } = await import("@/lib/character");
  const config = { ...DEFAULT_CONFIG, layered: selectLayer(createLayeredCharacter(), "ears", "ears-human") };
  const oldKey = JSON.stringify({ base: "reference-v2", colorSchema: 2, colors: config.colors, layered: config.layered });
  const draft = { text: "Keep these edited rounds", configKey: oldKey, edited: true, generatedAt: 120 };
  const previous = { ...draft, text: "Keep my earlier draft", generatedAt: 100 };
  localStorage.setItem("stitchling-doll-base-v2", "true");
  localStorage.setItem("stitchling-state-v1", JSON.stringify({ config, draft, previous }));
  const { hydrateStore } = await import("@/lib/store");
  hydrateStore();
  const saved = JSON.parse(localStorage.getItem("stitchling-state-v1") ?? "{}");
  expect(saved.config.layered.selections.ears).toBe("ears-human");
  expect(saved.draft).toEqual(draft);
  expect(saved.previous).toEqual(previous);
  expect(configKey(saved.config)).not.toBe(oldKey);
  expect(JSON.parse(configKey(saved.config)).anatomy).toBe("joined-body-v2");
});