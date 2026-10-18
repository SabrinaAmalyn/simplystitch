// Character configuration: data only, no rendering or pattern logic.
import { normalizeLayers, type LayeredCharacter } from "./character-layers";

import { yarnById } from "./yarn-palette";
import { limbLengths, type LimbLengths } from "./limb-lengths";
export { YARNS, yarnById, type Yarn } from "./yarn-palette";

export type EarStyle = "none" | "round" | "long" | "pointy";
export type Expression = "happy" | "sleepy" | "surprised";
export type BodyShape = "chubby" | "standard" | "tall";
export type Accessory = "scarf" | "bow" | "beanie";

export const BODY_PARTS = ["head", "body", "leftArm", "rightArm", "leftLeg", "rightLeg", "leftEar", "rightEar", "leftInnerEar", "rightInnerEar", "blush", "tail", "leftBlush", "rightBlush", "leftEye", "rightEye", "brows"] as const;
/** Parts that have crochet pattern rules; inner ears, blush and tails are preview-only details. */
export const CROCHET_PARTS = ["head", "body", "leftArm", "rightArm", "leftLeg", "rightLeg", "leftEar", "rightEar"] as const;
/** Detail parts default to their own yarn instead of the main yarn. */
export const DETAIL_DEFAULTS: Partial<Record<string, string>> = { leftInnerEar: "blush", rightInnerEar: "blush", blush: "blush" };
export type BodyPart = (typeof BODY_PARTS)[number];

/** Embroidered face features, mixed and matched independently. */
export type NoseStyle = "none" | "teddy" | "cat" | "round";
export type MouthStyle = "none" | "x" | "w" | "smile";
export type BlushShape = "round" | "oval";
export type EyeStyle = "open" | "sleepy";
export type BrowStyle = "none" | "straight" | "soft-arch" | "high-arch" | "angry" | "worried" | "thick" | "dots" | "asymmetrical";

export const BLUSH_OPTIONS: { value: BlushShape; label: string }[] = [
  { value: "round", label: "Round" },
  { value: "oval", label: "Small oval" },
];
export const EYE_OPTIONS: { value: EyeStyle; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "sleepy", label: "Sleepy" },
];
export const BROW_OPTIONS: { value: BrowStyle; label: string }[] = [
  { value: "none", label: "None" },
  { value: "straight", label: "Straight" },
  { value: "soft-arch", label: "Soft Arch" },
  { value: "high-arch", label: "High Arch" },
  { value: "angry", label: "Angry" },
  { value: "worried", label: "Worried" },
  { value: "thick", label: "Thick Rounded" },
  { value: "dots", label: "Tiny Dots" },
  { value: "asymmetrical", label: "Asymmetrical" },
];

export type CharacterConfig = {
  colors: { main: string; accent: string; accessory: string; eyes: string; hands?: string; feet?: string; leftHand?: string; rightHand?: string; leftFoot?: string; rightFoot?: string } & Partial<Record<BodyPart, string>>;
  ears: EarStyle;
  face: { expression: Expression; cheeks: boolean; nose?: NoseStyle; mouth?: MouthStyle; blushShape?: BlushShape; eyeStyle?: EyeStyle; whiskers?: boolean; brow?: BrowStyle };
  body: BodyShape;
  accessories: Accessory[];
  lengths?: Partial<LimbLengths>;
  layered?: LayeredCharacter;
};

export const DEFAULT_CONFIG: CharacterConfig = {
  colors: { main: "peach", accent: "cream", accessory: "terracotta", eyes: "charcoal" },
  ears: "none",
  face: { expression: "sleepy", cheeks: true, nose: "none", mouth: "none", blushShape: "round", eyeStyle: "open", whiskers: false, brow: "none" },
  body: "standard",
  accessories: [],
};

export const EAR_OPTIONS: { value: EarStyle; label: string; hint: string }[] = [
  { value: "none", label: "None", hint: "Base doll" },
  { value: "round", label: "Round", hint: "Teddy-style" },
  { value: "long", label: "Long", hint: "Bunny-style" },
  { value: "pointy", label: "Pointy", hint: "Kitty-style" },
];

export const NOSE_OPTIONS: { value: NoseStyle; label: string }[] = [
  { value: "none", label: "None" },
  { value: "teddy", label: "Teddy Bear" },
  { value: "cat", label: "Cat" },
  { value: "round", label: "Round" },
];

export const MOUTH_OPTIONS: { value: MouthStyle; label: string }[] = [
  { value: "none", label: "None" },
  { value: "x", label: "Miffy X" },
  { value: "w", label: "Cat W" },
  { value: "smile", label: "Happy" },
];

export const EXPRESSION_OPTIONS: { value: Expression; label: string }[] = [
  { value: "happy", label: "Happy" },
  { value: "sleepy", label: "Sleepy" },
  { value: "surprised", label: "Surprised" },
];

export const BODY_OPTIONS: { value: BodyShape; label: string; hint: string }[] = [
  { value: "chubby", label: "Chubby", hint: "Wide & short" },
  { value: "standard", label: "Standard", hint: "Balanced" },
  { value: "tall", label: "Tall", hint: "Slim & long" },
];

export const ACCESSORY_OPTIONS: { value: Accessory; label: string }[] = [
  { value: "scarf", label: "Scarf" },
  { value: "bow", label: "Bow" },
  { value: "beanie", label: "Beanie" },
];

function partColor(c: CharacterConfig, part: BodyPart): string {
  const legacy = part === "leftBlush" || part === "rightBlush"
    ? c.colors.blush ?? "blush"
    : part === "leftEye" || part === "rightEye" || part === "brows" ? c.colors.eyes : undefined;
  return c.colors[part] ?? legacy ?? DETAIL_DEFAULTS[part] ?? c.colors.main;
}

export const partYarn = (c: CharacterConfig, part: BodyPart) => yarnById(partColor(c, part));

/** Backfill saved colors without touching pattern drafts or existing part choices. */
export function migratePartColors(c: CharacterConfig): CharacterConfig {
  const colors = { ...DEFAULT_CONFIG.colors, ...c.colors };
  for (const part of BODY_PARTS) colors[part] = partColor({ ...c, colors }, part);
  return { ...c, colors, ...(c.lengths ? { lengths: limbLengths(c) } : {}) };
}

export const configKey = (c: CharacterConfig) => c.layered
  ? JSON.stringify({ base: "reference-v2", anatomy: "joined-body-v2", limbSchema: 1, lengths: limbLengths(c), colorSchema: 2, colors: c.colors, face: c.face, layered: normalizeLayers(c.layered) })
  : JSON.stringify({ base: "doll-v2", anatomy: "joined-body-v2", limbSchema: 1, colorSchema: 2, ...c, lengths: limbLengths(c) });
