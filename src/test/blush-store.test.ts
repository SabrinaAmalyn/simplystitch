import { beforeEach, expect, it, vi } from "vitest";
import { DEFAULT_CONFIG } from "@/lib/character";

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  localStorage.setItem("stitchling-doll-base-v2", "true");
});

it("restores removed blush and its selected colour without changing saved drafts", async () => {
  const draft = { text: "Keep my edited draft", configKey: "previous-anatomy", edited: true, generatedAt: 100 };
  const config = { ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, blush: "lilac" }, face: { ...DEFAULT_CONFIG.face, cheeks: false } };
  localStorage.setItem("stitchling-state-v1", JSON.stringify({ config, draft, previous: null }));
  const { hydrateStore } = await import("@/lib/store");
  hydrateStore();
  const saved = JSON.parse(localStorage.getItem("stitchling-state-v1") ?? "{}");
  expect(saved.config.face.cheeks).toBe(false);
  expect(saved.config.colors.blush).toBe("lilac");
  expect(saved.draft).toEqual(draft);
});

it("backfills missing blush visibility in legacy face settings", async () => {
  localStorage.setItem("stitchling-state-v1", JSON.stringify({ config: { ...DEFAULT_CONFIG, face: { expression: "sleepy" } }, draft: null, previous: null }));
  const { hydrateStore } = await import("@/lib/store");
  hydrateStore();
  const saved = JSON.parse(localStorage.getItem("stitchling-state-v1") ?? "{}");
  expect(saved.config.face.cheeks).toBe(true);
  expect(saved.config.colors.blush).toBe("blush");
});