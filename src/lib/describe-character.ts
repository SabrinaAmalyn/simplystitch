// Pure mapping between an AI description result and a CharacterConfig. Shared by server and client.
import { BLUSH_OPTIONS, BROW_OPTIONS, DEFAULT_CONFIG, EYE_OPTIONS, MOUTH_OPTIONS, NOSE_OPTIONS, type CharacterConfig } from "./character";
import { createLayeredCharacter } from "./character-layers";
import { YARNS } from "./yarn-palette";
import { LIMB_LENGTH_MAX, LIMB_LENGTH_MIN } from "./limb-lengths";

export const EAR_CHOICES = ["none", "ears-human", "ears-dog", "ears-cat", "ears-bear", "ears-bunny"] as const;
export const TAIL_CHOICES = ["none", "tail-round", "tail-long"] as const;
export const YARN_IDS = YARNS.map((y) => y.id);

export type DescribeResult = {
  ears: string; tail: string;
  body: string; head: string; arms: string; legs: string; ears_color: string; tail_color: string; hands: string; feet: string; eyes: string; blush: string;
  cheeks: boolean; whiskers: boolean; eyeStyle: string; brow: string; nose: string; mouth: string;
  armLength: number; legLength: number; torsoLength: number;
  note: string;
};

const enumOf = (values: readonly string[]) => ({ type: "string", enum: [...values] });
const yarn = enumOf(YARN_IDS);
const len = { type: "integer", minimum: LIMB_LENGTH_MIN, maximum: LIMB_LENGTH_MAX };

export const DESCRIBE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    ears: enumOf(EAR_CHOICES), tail: enumOf(TAIL_CHOICES),
    body: yarn, head: yarn, arms: yarn, legs: yarn, ears_color: yarn, tail_color: yarn, hands: yarn, feet: yarn, eyes: yarn, blush: yarn,
    cheeks: { type: "boolean" }, whiskers: { type: "boolean" },
    eyeStyle: enumOf(EYE_OPTIONS.map((o) => o.value)), brow: enumOf(BROW_OPTIONS.map((o) => o.value)),
    nose: enumOf(NOSE_OPTIONS.map((o) => o.value)), mouth: enumOf(MOUTH_OPTIONS.map((o) => o.value)),
    armLength: len, legLength: len, torsoLength: len,
    note: { type: "string", description: "One short sentence about anything requested that the customizer cannot make (e.g. hats)." },
  },
  required: ["ears", "tail", "body", "head", "arms", "legs", "ears_color", "tail_color", "hands", "feet", "eyes", "blush", "cheeks", "whiskers", "eyeStyle", "brow", "nose", "mouth", "armLength", "legLength", "torsoLength", "note"],
} as const;

export function describePrompt(): string {
  return [
    "You turn a description of a crochet amigurumi doll into settings for a fixed customizer.",
    "Only use the allowed values. Pick the closest yarn colours: " + YARNS.map((y) => `${y.id} (${y.name})`).join(", ") + ".",
    "Ears: bunny/rabbit → ears-bunny, cat/kitten/fox → ears-cat, bear/teddy/mouse → ears-bear, dog/puppy → ears-dog, plain human → ears-human or none.",
    "Tails: rabbit/bear → tail-round, cat/dog/fox/monkey → tail-long, humans → none.",
    `Lengths are percentages ${LIMB_LENGTH_MIN}–${LIMB_LENGTH_MAX} in steps of 10; chubby/short means near ${LIMB_LENGTH_MIN}, tall/lanky means higher.`,
    "Cheeks (blush) and whiskers are mutually exclusive. Use accessory colours (e.g. a red hat) as accents on ears, paws or blush when sensible.",
    "In note, briefly mention anything that could not be made, or leave it empty.",
  ].join("\n");
}

const pick = <T extends string>(value: string, allowed: readonly T[], fallback: T): T => (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
const step = (n: number) => Math.min(LIMB_LENGTH_MAX, Math.max(LIMB_LENGTH_MIN, Math.round(n / 10) * 10));

export function configFromDescription(r: DescribeResult): CharacterConfig {
  const y = (id: string) => pick(id, YARN_IDS, DEFAULT_CONFIG.colors.main);
  const layered = createLayeredCharacter();
  layered.selections.ears = r.ears === "none" ? null : pick(r.ears, EAR_CHOICES, "none") === "none" ? null : r.ears;
  layered.selections.tail = r.tail === "none" ? null : pick(r.tail, TAIL_CHOICES, "none") === "none" ? null : r.tail;
  const cheeks = !!r.cheeks;
  return {
    ...DEFAULT_CONFIG,
    colors: {
      ...DEFAULT_CONFIG.colors,
      main: y(r.body), body: y(r.body), head: y(r.head),
      leftArm: y(r.arms), rightArm: y(r.arms), leftLeg: y(r.legs), rightLeg: y(r.legs),
      leftEar: y(r.ears_color), rightEar: y(r.ears_color), tail: y(r.tail_color),
      hands: y(r.hands), feet: y(r.feet),
      leftEye: y(r.eyes), rightEye: y(r.eyes), brows: y(r.eyes), leftBlush: y(r.blush), rightBlush: y(r.blush),
    },
    face: {
      ...DEFAULT_CONFIG.face,
      cheeks, whiskers: cheeks ? false : !!r.whiskers,
      blushShape: BLUSH_OPTIONS[0]!.value,
      eyeStyle: pick(r.eyeStyle, EYE_OPTIONS.map((o) => o.value), "open"),
      brow: pick(r.brow, BROW_OPTIONS.map((o) => o.value), "none"),
      nose: pick(r.nose, NOSE_OPTIONS.map((o) => o.value), "none"),
      mouth: pick(r.mouth, MOUTH_OPTIONS.map((o) => o.value), "none"),
    },
    lengths: { arms: step(r.armLength), legs: step(r.legLength), torso: step(r.torsoLength) },
    layered,
  };
}
