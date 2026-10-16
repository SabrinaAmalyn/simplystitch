// Deterministic crochet pattern generator: maps a CharacterConfig to templates.
import { type CharacterConfig, yarnById } from "./character";

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
          : "Leave ear holes: in R11 replace 3 sts with ch 3 at two points, 10 sts apart.",
    });
  return out;
}

export function generatePattern(c: CharacterConfig): Pattern {
  const main = yarnById(c.colors.main).name;
  const accent = yarnById(c.colors.accent).name;
  const acc = yarnById(c.colors.accessory).name;
  const eyes = yarnById(c.colors.eyes).name;
  const body = BODY[c.body];
  const hasAcc = c.accessories.length > 0;

  const materials = [
    `DK / light worsted cotton yarn — ${main} (main, ~60 g)`,
    `${accent} (accent, ~15 g)`,
    ...(hasAcc ? [`${acc} (accessories, ~15 g)`] : []),
    `${eyes} (embroidery, small amount)`,
    "3.0 mm crochet hook",
    ...(c.face.expression === "sleepy" ? [] : [`${c.face.expression === "surprised" ? "10" : "8"} mm safety eyes (×2)`]),
    "Polyester fiberfill, stitch marker, yarn needle",
  ];

  const sections: Section[] = [
    { title: "Head", yarn: main, rounds: shapeRounds(7, 7, 2), note: "Stuff firmly before the last decreases. Leave a long tail for sewing." },
    {
      title: `Body (${c.body}, ${body.size})`,
      yarn: main,
      rounds: shapeRounds(body.maxK, body.plain, 3),
      note: "Stuff as you go. Fasten off leaving a tail; the open end attaches to the head.",
    },
    {
      title: "Belly patch",
      yarn: accent,
      rounds: [
        { label: "Foundation", text: "ch 5" },
        { label: "R1", text: "sc in 2nd ch from hook, 2 sc, 3 sc in last ch; working along other side, 2 sc, 2 sc in last", count: 12 },
        { label: "R2", text: "inc, 2 sc, inc × 3, 2 sc, inc × 2", count: 18 },
        ...(c.body === "chubby" ? [{ label: "R3", text: "(2 sc, inc) × 6", count: 24 }] : []),
      ],
      note: `Color change: belly is worked separately in ${accent} and sewn flat to the body front.`,
    },
    ...earSection(c, main, accent),
    {
      title: "Arms (make 2)",
      yarn: main,
      rounds: [
        { label: "R1", text: "6 sc in magic ring", count: 6 },
        { label: "R2", text: "(sc, inc) × 3", count: 9 },
        { label: c.body === "tall" ? "R3–10" : "R3–7", text: "sc around", count: 9 },
      ],
      note: "Stuff the tips only; flatten and sew closed.",
    },
    ...accessorySections(c, acc, body.maxK),
  ];

  const assembly = [
    "Sew the body to the head over R13–15 of the head, stuffing the neck firmly.",
    ...faceSteps(c, eyes, accent),
    `Sew ears to the top of the head ${c.ears === "long" ? "close together, 3 sts apart" : "about 8 sts apart"}.`,
    "Sew the belly patch centered on the body front; sew arms at the top body rounds.",
    ...(c.accessories.includes("scarf") ? ["Wrap the scarf around the neck and tack in place."] : []),
    ...(c.accessories.includes("beanie") ? ["Pull the beanie on, threading ears through the holes; fold the brim up."] : []),
    ...(c.accessories.includes("bow") ? ["Sew the bow to the head beside one ear."] : []),
  ];

  return {
    title: `Custom ${c.ears === "long" ? "Bunny" : c.ears === "pointy" ? "Kitty" : "Bear"} — ${main}`,
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
