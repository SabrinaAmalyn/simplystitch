import { describe, expect, it } from "vitest";
import { BASE_ART, CUSTOMIZATION_ITEMS, characterRecord, createLayeredCharacter, normalizeLayers, patternBlockers, renderLayers, selectLayer } from "@/lib/character-layers";
import { configKey, DEFAULT_CONFIG } from "@/lib/character";
import { generatePattern } from "@/lib/pattern";

describe("layered characters", () => {
  it("starts with the original base and no optional layers", () => {
    const character = createLayeredCharacter();
    expect(Object.values(character.selections)).toEqual([null, null, null, null, null]);
    expect(renderLayers(character)).toEqual([{ id: "lined-front-v1", url: BASE_ART.url, order: 20, base: true }]);
  });
  it("selects, replaces and removes one item per slot without changing the base", () => {
    const original = createLayeredCharacter();
    const first = selectLayer(original, "ears", "sample-round-ears");
    const replaced = selectLayer(first, "ears", "sample-long-ears");
    expect(replaced.selections.ears).toBe("sample-long-ears");
    expect(renderLayers(replaced).map((layer) => layer.id)).toEqual(["long-ears", "lined-front-v1"]);
    expect(selectLayer(replaced, "ears", null)).toEqual(original);
    expect(original.selections.ears).toBeNull();
    expect(replaced.baseId).toBe(original.baseId);
    expect(renderLayers(replaced).find((layer) => layer.base)?.url).toBe(BASE_ART.url);
  });
  it("orders hairstyle pieces behind and in front of the base", () => {
    const layers = renderLayers(selectLayer(createLayeredCharacter(), "hair", "sample-hair"));
    expect(layers.map((layer) => layer.id)).toEqual(["hair-back", "lined-front-v1", "hair-front"]);
  });
  it("rejects missing assets and assets from other slots", () => {
    const character = createLayeredCharacter();
    expect(selectLayer(character, "ears", "sample-bow")).toBe(character);
    expect(selectLayer(character, "ears", "unknown")).toBe(character);
    expect(normalizeLayers({ ...character, selections: { ...character.selections, face: "sample-hair" } })).toEqual(character);
    expect(new Set(CUSTOMIZATION_ITEMS.map((item) => item.id)).size).toBe(CUSTOMIZATION_ITEMS.length);
  });
  it("exports structured components and pending rule references", () => {
    const record = characterRecord(selectLayer(createLayeredCharacter(), "accessory", "sample-bow"));
    expect(record.components).toEqual([{ assetId: "sample-bow", slot: "accessory", component: "accessory.bow", placeholder: true, patternRuleId: null }]);
    expect(record.coordinateSystem).toEqual({ width: 256, height: 360 });
    expect(record.basePatternRuleId).toBeNull();
  });
  it("blocks unsupported pattern instructions even when called directly", () => {
    const layered = selectLayer(createLayeredCharacter(), "outfit", "sample-vest");
    expect(patternBlockers(layered)).toHaveLength(2);
    expect(() => generatePattern({ ...DEFAULT_CONFIG, layered })).toThrow("no defined crochet pattern rule");
  });
  it("versions selections in pattern keys independently of legacy body geometry", () => {
    const layered = createLayeredCharacter();
    const config = { ...DEFAULT_CONFIG, layered };
    expect(configKey(config)).not.toBe(configKey(DEFAULT_CONFIG));
    expect(configKey({ ...config, layered: selectLayer(layered, "hair", "sample-hair") })).not.toBe(configKey(config));
    expect(configKey({ ...config, body: "tall" })).toBe(configKey(config));
  });
});