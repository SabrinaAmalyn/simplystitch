// Deterministic crochet pattern generator: maps a CharacterConfig to templates.
import { CROCHET_PARTS, type CharacterConfig, partYarn, yarnById } from "./character";
import { patternBlockers } from "./character-layers";
import { generateDollPattern } from "./doll-pattern";

export type Round = { label: string; text: string; count?: number };
export type Section = { title: string; yarn?: string; note?: string; rounds: Round[] };
export type Pattern = {
  title: string;
  materials: string[];
  abbreviations: string[];
  sections: Section[];
  assembly: string[];
};

const incText = (k: number) => (k === 2 ? "inc × 6" : `(${k - 2} sc, inc) × 6`);
const decText = (k: number) => (k === 2 ? "dec × 6" : `(${k - 2} sc, dec) × 6`);

/** Sphere-ish piece: increase to 6*maxK, plain rounds, then decrease to 6. */
export function shapeRounds(maxK: number, plain: number, closeTo = 1): Round[] {
  const out: Round[] = [{ label: "R1", text: "6 sc in magic ring", count: 6 }];
  let r = 2;
  for (let k = 2; k <= maxK; k++) out.push({ label: `R${r++}`, text: incText(k), count: 6 * k });
  if (plain > 0) {
    const end = r + plain - 1;
    out.push({ label: plain > 1 ? `R${r}–${end}` : `R${r}`, text: `sc around`, count: 6 * maxK });
    r = end + 1;
  }
  for (let k = maxK; k > closeTo; k--) out.push({ label: `R${r++}`, text: decText(k), count: 6 * (k - 1) });
  return out;
}

const BODY = {
  chubby: { maxK: 8, plain: 6, size: "~11 cm" },
  standard: { maxK: 6, plain: 8, size: "~12 cm" },
  tall: { maxK: 5, plain: 13, size: "~14 cm" },
} as const;

function earSection(c: CharacterConfig, main: string, accent: string): Section[] {
  switch (c.ears) {
    case "none":
      return [];
    case "round":
      return [
        {
          title: "Ears (make 2 in main + 2 in accent)",
          yarn: `${main} / ${accent}`,
          rounds: [
            { label: "R1", text: "6 sc in magic ring", count: 6 },
            { label: "R2", text: "inc × 6", count: 12 },
            { label: "R3", text: "(sc, inc) × 6", count: 18 },
          ],
          note: `Hold one ${main} and one ${accent} circle together and sc around half the edge to join. Fold into a half-circle.`,
        },
      ];
    case "long":
      return [
        {
          title: "Long ears (make 2)",
          yarn: main,
          rounds: [
            { label: "R1", text: "6 sc in magic ring", count: 6 },
            { label: "R2", text: "(sc, inc) × 3", count: 9 },
            { label: "R3", text: "(2 sc, inc) × 3", count: 12 },
            { label: "R4–12", text: "sc around", count: 12 },
            { label: "R13", text: "(2 sc, dec) × 3", count: 9 },
            { label: "R14–16", text: "sc around", count: 9 },
          ],
          note: `Do not stuff. Flatten and fold the base in half. Embroider a long inner stripe in ${accent}.`,
        },
      ];
    case "pointy":
      return [
        {
          title: "Pointy ears (make 2)",
          yarn: main,
          rounds: [
            { label: "R1", text: "4 sc in magic ring", count: 4 },
            { label: "R2", text: "(sc, inc) × 2", count: 6 },
            { label: "R3", text: "(sc, inc) × 3", count: 9 },
            { label: "R4", text: "(2 sc, inc) × 3", count: 12 },
            { label: "R5", text: "(3 sc, inc) × 3", count: 15 },
            { label: "R6", text: "sc around", count: 15 },
          ],
          note: `Lightly stuff the tip. Embroider a small ${accent} triangle on the front.`,
        },
      ];
  }
}

function faceSteps(c: CharacterConfig, eyes: string, accent: string): string[] {
  const steps: string[] = [];
  if (c.face.expression === "happy")
    steps.push(`Eyes: insert 8 mm safety eyes between R10–11, 7 sts apart (or embroider in ${eyes}).`, `Mouth: embroider a small "w" smile in ${eyes} 2 rounds below the eyes.`);
  if (c.face.expression === "sleepy")
    steps.push(`Eyes: embroider two downward curves (4 sts wide) in ${eyes} between R10–11, 7 sts apart. No safety eyes.`, `Mouth: one short straight stitch in ${eyes}.`);
  if (c.face.expression === "surprised")
    steps.push(`Eyes: insert 10 mm safety eyes between R9–10, 7 sts apart.`, `Mouth: embroider a small "o" (4-st circle) in ${eyes} 3 rounds below the eyes.`);
  if (c.face.cheeks) steps.push(`Cheeks: embroider 3 horizontal stitches in blush-colored yarn (or ${accent}) under each eye.`);
  return steps;
}

function coloredEarSections(c: CharacterConfig, accent: string): Section[] {
  const left = partYarn(c, "leftEar").name;
  const right = partYarn(c, "rightEar").name;
  if (left === right) return earSection(c, left, accent);
  return ([['Left', left], ['Right', right]] as const).flatMap(([side, yarn]) =>
    earSection(c, yarn, accent).map((section) => ({
      ...section,
      title: `${side} ear${c.ears === "round" ? " (make 1 outer + 1 inner)" : " (make 1)"}`,
    })),
  );
}

function coloredPair(section: Section, left: string, right: string, part: string): Section[] {
  if (left === right) return [{ ...section, yarn: left }];
  return [
    { ...section, title: `Left ${part} (make 1)`, yarn: left },
    { ...section, title: `Right ${part} (make 1)`, yarn: right },
  ];
}

function accessorySections(c: CharacterConfig, acc: string, bodyK: number): Section[] {
  const out: Section[] = [];
  if (c.accessories.includes("scarf"))
    out.push({
      title: "Scarf",
      yarn: acc,
      rounds: [
        { label: "Foundation", text: `ch ${6 * bodyK + 16}` },
        { label: "Row 1", text: "hdc in 3rd ch from hook and across, turn", count: 6 * bodyK + 14 },
        { label: "Row 2", text: "ch 2, hdc across", count: 6 * bodyK + 14 },
      ],
      note: "Add 4 cm fringe to each end.",
    });
  if (c.accessories.includes("bow"))
    out.push({
      title: "Bow",
      yarn: acc,
      rounds: [
        { label: "Foundation", text: "ch 11" },
        { label: "Row 1–6", text: "sc in 2nd ch from hook and across, ch 1, turn", count: 10 },
      ],
      note: "Cinch the center by wrapping yarn 10 times; sew between the ears.",
    });
  if (c.accessories.includes("beanie"))
    out.push({
      title: "Beanie",
      yarn: acc,
      rounds: [
        ...shapeRounds(7, 0).slice(0, 7),
        { label: "R8–12", text: "sc around", count: 42 },
        { label: "R13", text: "BLO sc around (brim fold line)", count: 42 },
        { label: "R14–15", text: "sc around", count: 42 },
      ],
      note:
        c.ears === "round"
      ? "Leave ear holes: in R10 replace 4 sts with ch 4 at two points, 10 sts apart."
          : c.ears === "none" ? "Work every round continuously; no ear holes are needed." : "Leave ear holes: in R11 replace 3 sts with ch 3 at two points, 10 sts apart.",
    });
  return out;
}

export function generatePattern(c: CharacterConfig): Pattern {
  if (c.layered) {
    const blockers = patternBlockers(c.layered);
    if (blockers.length) throw new Error(blockers.join(" "));
    return generateDollPattern(c);
  }
  const main = partYarn(c, "body").name;
  const accent = yarnById(c.colors.accent).name;
  const acc = yarnById(c.colors.accessory).name;
  const eyes = yarnById(c.colors.eyes).name;
  const body = BODY[c.body];
  const hasAcc = c.accessories.length > 0;

  const partMaterials = new Map<string, string[]>();
  for (const part of CROCHET_PARTS) {
    if (c.ears === "none" && (part === "leftEar" || part === "rightEar")) continue;
    const name = partYarn(c, part).name;
    const label = part.replace(/([A-Z])/g, " $1").toLowerCase();
    partMaterials.set(name, [...(partMaterials.get(name) ?? []), label]);
  }

  const materials = [
    "DK / light worsted cotton yarn — ~60 g total for the doll (estimate)",
    ...Array.from(partMaterials, ([name, parts]) => `${name} (${parts.join(", ")})`),
    ...(c.ears !== "none" ? [`${accent} (inner ears, ~15 g)`] : []),
    ...(c.face.cheeks ? ["Blush Pink (cheeks, small amount)"] : []),
    ...(hasAcc ? [`${acc} (accessories, ~15 g)`] : []),
    `${eyes} (embroidery, small amount)`,
    "3.0 mm crochet hook",
    ...(c.face.expression === "sleepy" ? [] : [`${c.face.expression === "surprised" ? "10" : "8"} mm safety eyes (×2)`]),
    "Polyester fiberfill, stitch marker, yarn needle",
  ];

  const sections: Section[] = [
    { title: "Head", yarn: partYarn(c, "head").name, rounds: shapeRounds(10, 8, 2), note: "The oversized round head is worked in its selected yarn throughout. Embroider the face or fit safety eyes before stuffing and decreasing. Stuff firmly; leave the 12-stitch opening for the neck and a long sewing tail." },
    {
      title: `Body (${c.body}, ${body.size})`,
      yarn: main,
      rounds: [...shapeRounds(body.maxK, body.plain, 2), { label: "Neck (2 rounds)", text: "sc around for 2 rounds", count: 12 }],
      note: "Work from the rounded hip base upward in the body yarn only, with no belly patch or clothing. The decreases taper the shoulders into the short neck. Stuff firmly and leave the 12-stitch neck open with a sewing tail.",
    },
    ...coloredEarSections(c, accent),
    ...coloredPair({
      title: "Arms (make 2)",
      yarn: main,
      rounds: [
        { label: "R1", text: "6 sc in magic ring", count: 6 },
        { label: "R2", text: "inc × 6", count: 12 },
        { label: c.body === "tall" ? "R3–14" : "R3–11", text: "sc around", count: 12 },
      ],
      note: "Use the listed yarn throughout. Stuff lightly for relaxed arms, flatten the 12-stitch opening and sc through both layers across 6 sts. Leave a sewing tail; attach so the arms hang down beside the torso.",
    }, partYarn(c, "leftArm").name, partYarn(c, "rightArm").name, "arm"),
    ...coloredPair({
      title: "Legs (make 2)",
      yarn: main,
      rounds: [
        { label: "R1", text: "6 sc in magic ring", count: 6 },
        { label: "R2", text: "inc × 6", count: 12 },
        { label: "R3", text: "(sc, inc) × 6", count: 18 },
        { label: c.body === "tall" ? "R4–15" : c.body === "chubby" ? "R4–9" : "R4–11", text: "sc around", count: 18 },
      ],
      note: "Work in the listed yarn with no color change. These are straight legs with rounded ends, not separate shoes. Stuff firmly and leave the 18-stitch top open with a long tail for sewing to the hip base.",
    }, partYarn(c, "leftLeg").name, partYarn(c, "rightLeg").name, "leg"),
    ...accessorySections(c, acc, body.maxK),
  ];

  const assembly = [
    "Left and right refer to the doll's own sides. Attach each individually colored piece on its named side.",
    "Align the 12-stitch neck opening with the 12-stitch opening at the bottom of the head. Sew stitch for stitch, adding firm neck stuffing before closing the seam.",
    ...faceSteps(c, eyes, accent),
    ...(c.ears !== "none" ? [`Sew ears to the top of the head ${c.ears === "long" ? "close together, 3 sts apart" : "about 8 sts apart"}.`] : []),
    "Sew the arms to either side just below the neck, letting them hang down. Sew the open tops of the two legs side by side to the bottom of the torso, leaving a small gap between them; keep both rounded ends level.",
    ...(c.accessories.includes("scarf") ? ["Wrap the scarf around the neck and tack in place."] : []),
    ...(c.accessories.includes("beanie") ? ["Pull the beanie on, threading ears through the holes; fold the brim up."] : []),
    ...(c.accessories.includes("bow") ? ["Sew the bow to the head beside one ear."] : []),
  ];

  return {
    title: `Custom ${c.ears === "none" ? "Doll" : c.ears === "long" ? "Bunny" : c.ears === "pointy" ? "Kitty" : "Bear"} — ${main}`,
    materials,
    abbreviations: ["MR – magic ring", "ch – chain", "sc – single crochet", "hdc – half double crochet", "inc – 2 sc in same st", "dec – invisible decrease", "BLO – back loop only", "(n) – stitch count at end of round"],
    sections,
    assembly,
  };
}

export function patternToText(p: Pattern): string {
  const lines: string[] = [`# ${p.title}`, "", "DRAFT — this pattern is auto-generated and may need test-crocheting and refinement.", ""];
  lines.push("## Materials", ...p.materials.map((m) => `- ${m}`), "");
  lines.push("## Abbreviations", ...p.abbreviations.map((a) => `- ${a}`), "");
  for (const s of p.sections) {
    lines.push(`## ${s.title}${s.yarn ? ` — yarn: ${s.yarn}` : ""}`);
    for (const r of s.rounds) lines.push(`${r.label}: ${r.text}${r.count ? ` (${r.count})` : ""}`);
    if (s.note) lines.push(`Note: ${s.note}`);
    lines.push("");
  }
  lines.push("## Assembly", ...p.assembly.map((a, i) => `${i + 1}. ${a}`));
  return lines.join("\n");
}
