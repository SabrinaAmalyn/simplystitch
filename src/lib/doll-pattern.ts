// Explicit crochet rules for the joined-body base doll ("base.doll-v1") and its supported features.
// Every stitch count here comes from the designer's supplied patterns; never invent new rules.
import { type CharacterConfig, partYarn } from "./character";
import { pawYarn } from "./paw-colors";
import type { Pattern, Round, Section } from "./pattern";

const R = (label: string, text: string, count?: number): Round => (count === undefined ? { label, text } : { label, text, count });

export const HEAD_ROUNDS: Round[] = [
  R("R1", "6 sc in MR", 6),
  R("R2", "inc × 6", 12),
  ...[1, 2, 3, 4, 5, 6, 7].map((k, i) => R(`R${i + 3}`, `(inc, ${k} sc) × 6`, 18 + 6 * i)),
  R("R10–R18", "sc around for 9 rounds", 54),
  ...[7, 6, 5, 4, 3, 2, 1].map((k, i) => R(`R${i + 19}`, `(dec, ${k} sc) × 6`, 48 - 6 * i)),
];

export const LEG_ROUNDS: Round[] = [R("R1", "6 sc in MR", 6), R("R2", "inc × 6", 12), R("R3–R7", "sc around for 5 rounds", 12)];
export const BODY_ROUNDS: Round[] = [
  R("Join", "on the second leg, do not cut yarn; sc onto the first leg and continue around both legs", 24),
  R("R8–R12", "sc around for 5 rounds", 24),
  R("R13", "(4 sc, dec) × 4", 20),
  R("R14", "(3 sc, dec) × 4", 16),
  R("R15", "(2 sc, dec) × 4", 12),
];
export const ARM_ROUNDS: Round[] = [R("R1", "6 sc in MR", 6), R("R2", "(2 sc, inc) × 2", 8), R("R3–R6", "sc around for 4 rounds", 8)];

const LONG_EAR: Round[] = [R("R1", "6 sc in MR", 6), R("R2", "inc × 6", 12), R("R3", "(inc, 1 sc) × 6", 18), R("R4–R12", "sc around for 9 rounds", 18)];
const ROUND_EAR: Round[] = [R("R1", "6 sc in MR", 6), R("R2", "inc × 6", 12), R("R3", "(inc, 1 sc) × 6", 18), R("R4–R6", "sc around for 3 rounds", 18)];
const CAT_EAR: Round[] = [
  R("R1", "6 sc in MR", 6),
  ...[1, 2, 3, 4, 5].map((k) => R(`R${k + 1}`, `(${k} sc, inc) × 3`, 6 + 3 * k)),
  R("R7", "sc around", 21),
];

export const EAR_RULES: Record<string, { name: string; rounds: Round[]; finish: string; attach: string }> = {
  "ears-bunny": { name: "Bunny ears", rounds: LONG_EAR, finish: "Stuff lightly. Fasten off, leaving a long yarn tail.", attach: "Sew the bunny ears onto the top of the head, between R1 and R5–R6." },
  "ears-dog": { name: "Dog ears", rounds: LONG_EAR, finish: "Do not stuff. Flatten each ear and fasten off, leaving a long yarn tail.", attach: "Sew the dog ears onto the sides of the head between R10 and R11." },
  "ears-cat": { name: "Cat ears", rounds: CAT_EAR, finish: "Lightly stuff, or leave unstuffed and flattened. Fasten off, leaving a long yarn tail.", attach: "Sew the cat ears on top of the head between R1 and R9, evenly spaced." },
  "ears-bear": { name: "Bear ears", rounds: ROUND_EAR, finish: "Lightly stuff, or leave unstuffed and flattened. Fasten off, leaving a long yarn tail.", attach: "Sew the bear ears onto the head between R5 and R11, evenly spaced." },
  "ears-human": { name: "Monkey ears", rounds: ROUND_EAR, finish: "Lightly stuff, or leave unstuffed and flattened. Fasten off, leaving a long yarn tail.", attach: "Sew the monkey ears onto the sides of the head between R11 and R18, evenly spaced." },
};

export const TAIL_RULES: Record<string, { name: string; rounds: Round[]; finish: string }> = {
  "tail-round": {
    name: "Round tail",
    rounds: [R("R1", "3 sc in MR", 3), R("R2", "inc × 3", 6), R("R3", "(1 sc, inc) × 3", 9), R("R4", "sc around", 9), R("R5", "(1 sc, dec) × 3", 6)],
    finish: "Lightly stuff if desired. Fasten off, close the opening securely and leave a long yarn tail.",
  },
  "tail-long": {
    name: "Long tail",
    rounds: [R("R1", "6 sc in MR", 6), R("R2–R6", "sc around for 5 rounds", 6)],
    finish: "Add more rounds for a longer tail. Fasten off, leaving a long yarn tail.",
  },
};

export const BLUSH_RULES = {
  round: { name: "Big blush", rounds: [R("R1", "6 sc in MR", 6), R("R2", "(1 sc, inc) × 3", 9)], attach: "Sew the blush onto the face between R14 and R18 of the head, about 10 stitches apart." },
  oval: {
    name: "Small oval blush",
    rounds: [R("R1", "ch 4. Starting in the 2nd ch from hook, 2 sc, then 3 sc in the last ch. Working along the opposite side of the chain, 1 sc, then 2 sc in the last ch", 8)],
    attach: "Sew the small oval blush onto the face between R14 and R15 of the head, about 10 stitches apart, keeping both sides symmetrical.",
  },
} as const;

const PAW_LABEL = " (paw) + ";
function pair(title: string, left: string, right: string, base: (yarn: string) => Omit<Section, "title" | "yarn">, paw: string | null = null): Section[] {
  const label = (limb: string) => (paw && paw !== limb ? `${paw}${PAW_LABEL}${limb}` : limb);
  if (left === right) return [{ ...base(left), title: `${title} (make 2)`, yarn: label(left) }];
  return [
    { ...base(left), title: `Left ${title.toLowerCase().replace(/s$/, "")} (make 1)`, yarn: label(left) },
    { ...base(right), title: `Right ${title.toLowerCase().replace(/s$/, "")} (make 1)`, yarn: label(right) },
  ];
}

// Paw colours: hands are worked in the paw colour for R1–R3, feet for R1–R4,
// then each piece switches to its own arm/leg yarn.
const armRounds = (paw: string | null, limb: string): Round[] =>
  paw
    ? [
        R("R1", `6 sc in MR — work in ${paw} (paw colour)`, 6),
        R("R2", `(2 sc, inc) × 2 — in ${paw}`, 8),
        R("R3", `sc around — in ${paw}`, 8),
        R("R4", `switch to ${limb}, sc around`, 8),
        R("R5–R6", "sc around for 2 rounds", 8),
      ]
    : ARM_ROUNDS;

const legRounds = (paw: string | null, limb: string): Round[] =>
  paw
    ? [
        R("R1", `6 sc in MR — work in ${paw} (paw colour)`, 6),
        R("R2", `inc × 6 — in ${paw}`, 12),
        R("R3–R4", `sc around for 2 rounds — in ${paw}`, 12),
        R("R5", `switch to ${limb}, sc around`, 12),
        R("R6–R7", "sc around for 2 rounds", 12),
      ]
    : LEG_ROUNDS;

export function generateDollPattern(c: CharacterConfig): Pattern {
  const sel = c.layered!.selections;
  const face = c.face;
  const y = (p: Parameters<typeof partYarn>[1]) => partYarn(c, p).name;
  const hands = c.colors.hands ? pawYarn(c, "hands").name : null;
  const feet = c.colors.feet ? pawYarn(c, "feet").name : null;
  const ear = sel.ears ? EAR_RULES[sel.ears] : undefined;
  const tail = sel.tail ? TAIL_RULES[sel.tail] : undefined;
  const blush = face.cheeks ? BLUSH_RULES[face.blushShape ?? "round"] : undefined;

  const legL = y("leftLeg"), legR = y("rightLeg");
  const sections: Section[] = [
    { title: "Head (make 1)", yarn: y("head"), rounds: HEAD_ROUNDS, note: "Stuff the head firmly with fiberfill before fastening off. Fasten off without leaving a long tail." },
    ...pair("Legs", legL, legR, (yarn) => ({ rounds: legRounds(feet, yarn), note: "After completing the first leg, fasten off. Keep the second leg on the hook to join." }), feet),
    { title: "Body (continues from the legs)", yarn: y("body"), rounds: BODY_ROUNDS, note: "Stuff the legs and body firmly as you crochet. Fasten off, leaving a long yarn tail for sewing the body onto the head." },
    ...pair("Arms", y("leftArm"), y("rightArm"), (yarn) => ({ rounds: armRounds(hands, yarn), note: "Lightly stuff. Fasten off, leaving a long yarn tail for sewing." }), hands),
  ];
  if (ear) sections.push(...pair(ear.name, y("leftEar"), y("rightEar"), () => ({ rounds: ear.rounds, note: ear.finish })));
  if (tail) sections.push({ title: `${tail.name} (make 1)`, yarn: y("tail"), rounds: tail.rounds, note: tail.finish });
  if (blush) sections.push(...pair(blush.name, y("leftBlush"), y("rightBlush"), () => ({ rounds: [...blush.rounds], note: "Fasten off, leaving a long yarn tail to sew the blush onto the face." })));

  const eyes = `${y("leftEye")}${y("leftEye") === y("rightEye") ? "" : ` / ${y("rightEye")}`}`;
  const brow = face.brow ?? "none";
  const nose = face.nose ?? "none";
  const mouth = face.mouth ?? "none";
  const assembly = [
    "Left and right refer to the doll's own sides.",
    face.eyeStyle === "sleepy"
      ? `Eyes: embroider closed sleepy curves in ${eyes} between R12 and R13, each across 2 stitches, leaving 8 stitches between the eyes.`
      : `Eyes: place the eyes (${eyes}) between R12 and R13, each across 2 stitches, leaving 8 stitches between the eyes.`,
    ...(brow !== "none" ? [`Eyebrows (${brow.replace("-", " ")}): embroider in ${y("brows")} 1–2 stitches above the eyes. Adjust angle and spacing to taste.`] : []),
    ...(nose !== "none" ? [`Nose (${nose === "teddy" ? "teddy bear T" : nose}): embroider in the centre around R13–R14.`] : []),
    ...(mouth !== "none" ? [`Mouth (${mouth === "x" ? "X" : mouth === "w" ? "cat 3" : "smile"}): embroider centred around R14–R16.`] : []),
    ...(face.whiskers ? ["Whiskers: embroider on each side of the face between R13 and R17."] : []),
    ...(blush ? [blush.attach] : []),
    "Align the 12-stitch top of the body with the 12-stitch opening of the head and sew together stitch for stitch.",
    "Sew the arms onto the sides of the body just below the neck.",
    ...(ear ? [ear.attach] : []),
    ...(tail ? ["Sew the tail low on the back, centred just above and between the legs."] : []),
  ];

  const yarns = new Set<string>(sections.flatMap((s) => s.yarn!.split(PAW_LABEL)).concat(hands ?? [], feet ?? []));
  return {
    title: `Stitchling ${ear ? ear.name.replace(" ears", "") : "Doll"}`,
    materials: [
      `DK / light worsted yarn in ${Array.from(yarns).join(", ")}`,
      `${eyes} for the eyes${brow !== "none" ? ` and ${y("brows")} for embroidery` : ""}`,
      "Crochet hook to suit your yarn, fiberfill, stitch marker, tapestry needle",
    ],
    abbreviations: ["MR — magic ring", "ch — chain", "sc — single crochet", "inc — 2 sc in the same stitch", "dec — sc 2 stitches together", "[n] — stitch count at the end of the round"],
    sections,
    assembly,
  };
}
