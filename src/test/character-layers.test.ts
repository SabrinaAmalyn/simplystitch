import { describe, expect, it } from "vitest";
import { BASE_ART, CUSTOMIZATION_ITEMS, characterRecord, createLayeredCharacter, normalizeLayers, patternBlockers, renderLayers, selectLayer } from "@/lib/character-layers";
import { configKey, DEFAULT_CONFIG } from "@/lib/character";
import { generatePattern } from "@/lib/pattern";

describe("layered characters", () => {
  it("starts with the reference base and no ears", () => {
    const character = createLayeredCharacter();
    expect(Object.values(character.selections)).toEqual([null, null, null, null, null, null]);
    expect(renderLayers(character)).toEqual([{ id: "reference-v2", url: BASE_ART.sprites.front, order: 20, base: true }]);
  });
  it.each(["human", "dog", "cat", "bear", "bunny"])("%s ears replace previous ears with a single character", (kind) => {
    const withBear = selectLayer(createLayeredCharacter(), "ears", "ears-bear");
    const next = selectLayer(withBear, "ears", `ears-${kind}`);
    const item = CUSTOMIZATION_ITEMS.find((i) => i.id === `ears-${kind}`)!;
    for (const view of ["front", "right", "back", "left"] as const) {
      const layers = renderLayers(next, view);
      expect(layers).toHaveLength(1);
      expect(layers[0]!.url).toBe(view === "front" ? item.sprites!.front : view === "back" ? item.sprites!.back : item.sprites!.side);
    }
  });
  it("removing ears restores the base in every view", () => {
    const next = selectLayer(selectLayer(createLayeredCharacter(), "ears", "ears-cat"), "ears", null);
    expect(renderLayers(next, "back")[0]!.url).toBe(BASE_ART.sprites.back);
  });
  it("orders hairstyle pieces behind and in front of the base", () => {
    const layers = renderLayers(selectLayer(createLayeredCharacter(), "hair", "sample-hair"));
    expect(layers.map((layer) => layer.id)).toEqual(["hair-back", "reference-v2", "hair-front"]);
  });
  it("rejects missing assets and assets from other slots", () => {
    const character = createLayeredCharacter();
    expect(selectLayer(character, "ears", "sample-bow")).toBe(character);
    expect(normalizeLayers({ selections: { ears: "sample-round-ears" } })).toEqual(character);
    expect(new Set(CUSTOMIZATION_ITEMS.map((item) => item.id)).size).toBe(CUSTOMIZATION_ITEMS.length);
  });
  it("exports structured components", () => {
    const record = characterRecord(selectLayer(createLayeredCharacter(), "accessory", "sample-bow"));
    expect(record.components).toEqual([{ assetId: "sample-bow", slot: "accessory", component: "accessory.bow", placeholder: true, patternRuleId: null }]);
  });
  it("blocks unsupported pattern instructions", () => {
    const layered = selectLayer(createLayeredCharacter(), "outfit", "sample-vest");
    expect(() => generatePattern({ ...DEFAULT_CONFIG, layered })).toThrow("Vest: crochet rule not defined");
  });
  it("versions selections in pattern keys", () => {
    const layered = createLayeredCharacter();
    const config = { ...DEFAULT_CONFIG, layered };
    expect(configKey({ ...config, layered: selectLayer(layered, "ears", "ears-dog") })).not.toBe(configKey(config));
    expect(patternBlockers(layered)).toHaveLength(0);
  });
  it("replaces round tails with long tails independently of ears", () => {
    const ears = selectLayer(createLayeredCharacter(), "ears", "ears-cat");
    const round = selectLayer(ears, "tail", "tail-round");
    const long = selectLayer(round, "tail", "tail-long");
    expect(long.selections.tail).toBe("tail-long");
    expect(long.selections.ears).toBe("ears-cat");
    expect(characterRecord(long).components.filter((item) => item.slot === "tail")).toEqual([
      { assetId: "tail-long", slot: "tail", component: "tail.long", placeholder: false, patternRuleId: "tail.long" },
    ]);
    expect(configKey({ ...DEFAULT_CONFIG, layered: round })).not.toBe(configKey({ ...DEFAULT_CONFIG, layered: long }));
  });
  it("removes tails without removing ears", () => {
    const current = selectLayer(selectLayer(createLayeredCharacter(), "ears", "ears-bear"), "tail", "tail-round");
    const removed = selectLayer(current, "tail", null);
    expect(removed.selections.tail).toBeNull();
    expect(removed.selections.ears).toBe("ears-bear");
  });
  it("backfills missing tails in legacy selections", () => {
    const migrated = normalizeLayers({ selections: { ears: "ears-human" } });
    expect(migrated.selections.tail).toBeNull();
    expect(migrated.selections.ears).toBe("ears-human");
  });
  it.each(["tail-round", "tail-long"])("allows %s now that its crochet rule exists", (tail) => {
    const layered = selectLayer(createLayeredCharacter(), "tail", tail);
    expect(patternBlockers(layered)).toEqual([]);
  });
});
