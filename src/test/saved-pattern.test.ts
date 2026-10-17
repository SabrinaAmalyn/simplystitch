import { beforeEach, expect, it, vi } from "vitest";
import { DEFAULT_CONFIG } from "@/lib/character";

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

function readLibrary() {
  return JSON.parse(localStorage.getItem("stitchling-state-v1") ?? "{}").library;
}

it("saves the edited text as the pattern shown in the library", async () => {
  const { setState, savePatternToLibrary } = await import("@/lib/store");
  setState(() => ({
    config: DEFAULT_CONFIG,
    draft: { text: "Generated rounds", configKey: "k", edited: false, generatedAt: 100 },
    previous: null,
    library: [],
  }));
  setState((s) => ({
    ...s,
    draft: s.draft && { ...s.draft, initialText: s.draft.text, text: "My edited rounds", edited: true, saved: false },
  }));
  savePatternToLibrary("Bunny");
  expect(readLibrary()[0].text).toBe("My edited rounds");
});

it("saves the generated text unchanged when nothing was edited", async () => {
  const { setState, savePatternToLibrary } = await import("@/lib/store");
  setState(() => ({
    config: DEFAULT_CONFIG,
    draft: { text: "Generated rounds", configKey: "k", edited: false, generatedAt: 100 },
    previous: null,
    library: [],
  }));
  savePatternToLibrary("Bunny");
  expect(readLibrary()[0].text).toBe("Generated rounds");
});
