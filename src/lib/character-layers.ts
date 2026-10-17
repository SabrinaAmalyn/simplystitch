import humanFront from "@/assets/character/views/human-front.png.asset.json";
import humanSide from "@/assets/character/views/human-side.png.asset.json";
import humanBack from "@/assets/character/views/human-back.png.asset.json";
import dogFront from "@/assets/character/views/dog-front.png.asset.json";
import dogSide from "@/assets/character/views/dog-side.png.asset.json";
import dogBack from "@/assets/character/views/dog-back.png.asset.json";
import catFront from "@/assets/character/views/cat-front.png.asset.json";
import catSide from "@/assets/character/views/cat-side.png.asset.json";
import catBack from "@/assets/character/views/cat-back.png.asset.json";
import bearFront from "@/assets/character/views/bear-front.png.asset.json";
import bearSide from "@/assets/character/views/bear-side.png.asset.json";
import bearBack from "@/assets/character/views/bear-back.png.asset.json";
import bunnyFront from "@/assets/character/views/bunny-front.png.asset.json";
import bunnySide from "@/assets/character/views/bunny-side.png.asset.json";
import bunnyBack from "@/assets/character/views/bunny-back.png.asset.json";
import hairBack from "@/assets/character/hair-back.svg.asset.json";
import hairFront from "@/assets/character/hair-front.svg.asset.json";
import freckles from "@/assets/character/face-freckles.svg.asset.json";
import vest from "@/assets/character/outfit-vest.svg.asset.json";
import scarf from "@/assets/character/accessory-scarf.svg.asset.json";
import bow from "@/assets/character/accessory-bow.png.asset.json";

export const LAYER_SLOTS = ["ears", "hair", "face", "outfit", "accessory", "tail"] as const;
export type LayerSlot = (typeof LAYER_SLOTS)[number];
export type LayerSelections = Record<LayerSlot, string | null>;
export const BASE_ID = "reference-v2" as const;
export type LayeredCharacter = { version: 1; baseId: typeof BASE_ID; selections: LayerSelections };

/** Rotation views. "left" mirrors the drawn side view (the reference shows one profile). */
export const VIEWS = ["front", "right", "back", "left"] as const;
export type View = (typeof VIEWS)[number];
export type ViewSprites = { front: string; side: string; back: string };
export const spriteFor = (s: ViewSprites, view: View) => (view === "front" ? s.front : view === "back" ? s.back : s.side);

// The reference sheet column for the plain character is the single source of truth for the base.
export const BASE_ART = {
  id: BASE_ID,
  sprites: { front: humanFront.url, side: humanSide.url, back: humanBack.url } as ViewSprites,
  url: humanFront.url,
  canvas: { width: 256, height: 360 },
  patternRuleId: null,
};
export const LAYER_ORDER = { behind: 10, base: 20, face: 30, outfit: 40, hair: 50, accessory: 60 } as const;
export type OverlayAsset = { id: string; url: string; order: number };
export type CustomizationItem = {
  id: string; slot: LayerSlot; label: string; placeholder: boolean;
  component: string; patternRuleId: string | null; assets: OverlayAsset[];
  /** Full-character views from the reference; when set, they replace the base sprite (used by ears). */
  sprites?: ViewSprites;
};
const ear = (id: string, label: string, f: { url: string }, s: { url: string }, b: { url: string }): CustomizationItem => ({
  id: `ears-${id}`, slot: "ears", label, placeholder: false, component: `ears.${id}`, patternRuleId: null, assets: [],
  sprites: { front: f.url, side: s.url, back: b.url },
});
export const CUSTOMIZATION_ITEMS: CustomizationItem[] = [
  ear("human", "Monkey", humanFront, humanSide, humanBack),
  ear("dog", "Dog", dogFront, dogSide, dogBack),
  ear("cat", "Cat", catFront, catSide, catBack),
  ear("bear", "Bear", bearFront, bearSide, bearBack),
  ear("bunny", "Bunny", bunnyFront, bunnySide, bunnyBack),
  { id: "tail-round", slot: "tail", label: "Round", placeholder: false, component: "tail.round", patternRuleId: null, assets: [] },
  { id: "tail-long", slot: "tail", label: "Long", placeholder: false, component: "tail.long", patternRuleId: null, assets: [] },
  { id: "sample-hair", slot: "hair", label: "Long hair", placeholder: true, component: "hair.long", patternRuleId: null, assets: [{ id: "hair-back", url: hairBack.url, order: LAYER_ORDER.behind }, { id: "hair-front", url: hairFront.url, order: LAYER_ORDER.hair }] },
  { id: "sample-freckles", slot: "face", label: "Freckles", placeholder: true, component: "face.freckles", patternRuleId: null, assets: [{ id: "freckles", url: freckles.url, order: LAYER_ORDER.face }] },
  { id: "sample-vest", slot: "outfit", label: "Vest", placeholder: true, component: "outfit.vest", patternRuleId: null, assets: [{ id: "vest", url: vest.url, order: LAYER_ORDER.outfit }] },
  { id: "sample-scarf", slot: "accessory", label: "Scarf", placeholder: true, component: "accessory.scarf", patternRuleId: null, assets: [{ id: "scarf", url: scarf.url, order: LAYER_ORDER.accessory }] },
  { id: "sample-bow", slot: "accessory", label: "Bow", placeholder: true, component: "accessory.bow", patternRuleId: null, assets: [{ id: "bow", url: bow.url, order: LAYER_ORDER.accessory }] },
];
export const createLayeredCharacter = (): LayeredCharacter => ({ version: 1, baseId: BASE_ID, selections: { ears: null, hair: null, face: null, outfit: null, accessory: null, tail: null } });
export function normalizeLayers(value?: { selections?: Partial<LayerSelections> }): LayeredCharacter {
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
export type RenderLayer = { id: string; url: string; order: number; base: boolean };
/** Exactly one character sprite is drawn; ears swap it, so ears never duplicate. Placeholder overlays only exist for the front view. */
export function renderLayers(current: LayeredCharacter, view: View = "front"): RenderLayer[] {
  const items = selectedItems(current);
  const sprites = items.find((i) => i.sprites)?.sprites ?? BASE_ART.sprites;
  const overlays = view === "front" ? items.flatMap((item) => item.assets.map((asset) => ({ ...asset, base: false }))) : [];
  return [{ id: BASE_ID, url: spriteFor(sprites, view), order: LAYER_ORDER.base, base: true }, ...overlays]
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
export function characterRecord(current: LayeredCharacter) {
  return { ...normalizeLayers(current), coordinateSystem: BASE_ART.canvas, components: selectedItems(current).map(({ id, slot, component, placeholder, patternRuleId }) => ({ assetId: id, slot, component, placeholder, patternRuleId })), basePatternRuleId: BASE_ART.patternRuleId };
}
export function patternBlockers(current: LayeredCharacter): string[] {
  return [
    ...(BASE_ART.patternRuleId === null ? ["The supplied base artwork has no defined crochet pattern rule yet."] : []),
    ...selectedItems(current).filter((item) => item.placeholder || item.patternRuleId === null).map((item) => `${item.label}: crochet rule not defined.`),
  ];
}
