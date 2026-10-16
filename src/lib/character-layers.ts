import baseAsset from "@/assets/character/base-reference.png.asset.json";
import roundAsset from "@/assets/character/ears-round.svg.asset.json";
import longAsset from "@/assets/character/ears-long.svg.asset.json";
import hairBack from "@/assets/character/hair-back.svg.asset.json";
import hairFront from "@/assets/character/hair-front.svg.asset.json";
import freckles from "@/assets/character/face-freckles.svg.asset.json";
import vest from "@/assets/character/outfit-vest.svg.asset.json";
import scarf from "@/assets/character/accessory-scarf.svg.asset.json";
import bow from "@/assets/character/accessory-bow.png.asset.json";

export const LAYER_SLOTS = ["ears", "hair", "face", "outfit", "accessory"] as const;
export type LayerSlot = (typeof LAYER_SLOTS)[number];
export type LayerSelections = Record<LayerSlot, string | null>;
export type LayeredCharacter = { version: 1; baseId: "lined-front-v1"; selections: LayerSelections };
export const BASE_ART = {
  id: "lined-front-v1" as const, url: baseAsset.url,
  canvas: { width: 256, height: 360 },
  source: { width: 768, height: 877 },
  // A display-only crop: original image bytes, colors and geometry are untouched.
  crop: { x: 50, y: 45, width: 155, height: 280 },
  patternRuleId: null,
};
export const LAYER_ORDER = { behind: 10, base: 20, face: 30, outfit: 40, hair: 50, accessory: 60 } as const;
export type OverlayAsset = { id: string; url: string; order: number };
export type CustomizationItem = {
  id: string; slot: LayerSlot; label: string; placeholder: boolean;
  component: string; patternRuleId: string | null; assets: OverlayAsset[];
};
export const CUSTOMIZATION_ITEMS: CustomizationItem[] = [
  { id: "sample-round-ears", slot: "ears", label: "Round ears", placeholder: true, component: "ears.round", patternRuleId: null, assets: [{ id: "round-ears", url: roundAsset.url, order: LAYER_ORDER.behind }] },
  { id: "sample-long-ears", slot: "ears", label: "Long ears", placeholder: true, component: "ears.long", patternRuleId: null, assets: [{ id: "long-ears", url: longAsset.url, order: LAYER_ORDER.behind }] },
  { id: "sample-hair", slot: "hair", label: "Long hair", placeholder: true, component: "hair.long", patternRuleId: null, assets: [{ id: "hair-back", url: hairBack.url, order: LAYER_ORDER.behind }, { id: "hair-front", url: hairFront.url, order: LAYER_ORDER.hair }] },
  { id: "sample-freckles", slot: "face", label: "Freckles", placeholder: true, component: "face.freckles", patternRuleId: null, assets: [{ id: "freckles", url: freckles.url, order: LAYER_ORDER.face }] },
  { id: "sample-vest", slot: "outfit", label: "Vest", placeholder: true, component: "outfit.vest", patternRuleId: null, assets: [{ id: "vest", url: vest.url, order: LAYER_ORDER.outfit }] },
  { id: "sample-scarf", slot: "accessory", label: "Scarf", placeholder: true, component: "accessory.scarf", patternRuleId: null, assets: [{ id: "scarf", url: scarf.url, order: LAYER_ORDER.accessory }] },
  { id: "sample-bow", slot: "accessory", label: "Bow", placeholder: true, component: "accessory.bow", patternRuleId: null, assets: [{ id: "bow", url: bow.url, order: LAYER_ORDER.accessory }] },
];
export const createLayeredCharacter = (): LayeredCharacter => ({ version: 1, baseId: BASE_ART.id, selections: { ears: null, hair: null, face: null, outfit: null, accessory: null } });
export function normalizeLayers(value?: LayeredCharacter): LayeredCharacter {
  const next = createLayeredCharacter();
  for (const slot of LAYER_SLOTS) {
    const id = value?.selections?.[slot];
    if (CUSTOMIZATION_ITEMS.some((item) => item.id === id && item.slot === slot)) next.selections[slot] = id ?? null;
  }
  return next;
}
export function selectLayer(current: LayeredCharacter, slot: LayerSlot, itemId: string | null): LayeredCharacter {
  if (itemId !== null && !CUSTOMIZATION_ITEMS.some((item) => item.id === itemId && item.slot === slot)) return current;
  return { ...current, selections: { ...current.selections, [slot]: itemId } };
}
export function selectedItems(current: LayeredCharacter): CustomizationItem[] {
  return LAYER_SLOTS.flatMap((slot) => {
    const item = CUSTOMIZATION_ITEMS.find((entry) => entry.slot === slot && entry.id === current.selections[slot]);
    return item ? [item] : [];
  });
}
export function renderLayers(current: LayeredCharacter) {
  return [
    { id: BASE_ART.id, url: BASE_ART.url, order: LAYER_ORDER.base, base: true },
    ...selectedItems(current).flatMap((item) => item.assets.map((asset) => ({ ...asset, base: false }))),
  ].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
export function characterRecord(current: LayeredCharacter) {
  return { ...normalizeLayers(current), coordinateSystem: BASE_ART.canvas, components: selectedItems(current).map(({ id, slot, component, placeholder, patternRuleId }) => ({ assetId: id, slot, component, placeholder, patternRuleId })), basePatternRuleId: BASE_ART.patternRuleId };
}
export function patternBlockers(current: LayeredCharacter): string[] {
  return [
    ...(BASE_ART.patternRuleId === null ? ["The supplied base artwork has no defined crochet pattern rule yet."] : []),
    ...selectedItems(current).filter((item) => item.placeholder || item.patternRuleId === null).map((item) => `${item.label}: artwork placeholder; crochet rule not defined.`),
  ];
}