import { expect, it } from "vitest";
import { PATTERN_WEIGHT_LABEL, YARN_WEIGHTS, yarnWeight } from "@/lib/yarn-weights";
import { generateDollPattern } from "@/lib/doll-pattern";
import { DEFAULT_CONFIG } from "@/lib/character";

// Chart values are taken verbatim from Craft Yarn Council's Standard Yarn Weight System.
const CHART: [number, string, string, string, string, string][] = [
  [0, "Lace", "Fingering, 10-count crochet thread", "32–42 double crochets", "Steel 1.6–1.4 mm, regular hook 2.25 mm", "Steel 6, 7, 8, regular hook B–1"],
  [1, "Super Fine", "Sock, Fingering, Baby", "21–32 sts", "2.25–3.5 mm", "B–1 to E–4"],
  [2, "Fine", "Sport, Baby", "16–20 sts", "3.5–4.5 mm", "E–4 to 7"],
  [3, "Light", "DK, Light Worsted", "12–17 sts", "4.5–5.5 mm", "7 to I–9"],
  [4, "Medium", "Worsted, Afghan, Aran", "11–14 sts", "5.5–6.5 mm", "I–9 to K–10½"],
  [5, "Bulky", "Chunky, Craft, Rug", "8–11 sts", "6.5–9 mm", "K–10½ to M–13"],
  [6, "Super Bulky", "Super Bulky, Roving", "7–9 sts", "9–15 mm", "M–13 to Q"],
  [7, "Jumbo", "Jumbo, Roving", "6 sts and fewer", "15 mm and larger", "Q and larger"],
];

it("offers exactly the eight CYC categories with the chart's own symbol number, names, gauge and hook ranges", () => {
  expect(YARN_WEIGHTS.map((w) => [w.category, w.name, w.alsoKnownAs, w.crochetGauge, w.hookMetric, w.hookUs])).toEqual(CHART);
});

it("resolves weights saved before the CYC system was adopted to their category", () => {
  expect({
    "Fingering": yarnWeight("Fingering").id,
    "Sport": yarnWeight("Sport").id,
    "DK cotton": yarnWeight("DK cotton").id,
    "Worsted": yarnWeight("Worsted").id,
    "Chunky": yarnWeight("Chunky").id,
    "Velvet / chenille": yarnWeight("Velvet / chenille").id,
  }).toEqual({
    "Fingering": "1 Super Fine",
    "Sport": "2 Fine",
    "DK cotton": "3 Light",
    "Worsted": "4 Medium",
    "Chunky": "5 Bulky",
    "Velvet / chenille": "5 Bulky",
  });
});

it("accepts plain symbol numbers and category names without changing the stored selection", () => {
  expect(yarnWeight("0").id).toBe("0 Lace");
  expect(yarnWeight("7").id).toBe("7 Jumbo");
  expect(yarnWeight("medium").id).toBe("4 Medium");
  expect(yarnWeight("3 Light").id).toBe("3 Light");
});

it("falls back to CYC 3 Light for blank or unrecognised values", () => {
  for (const value of ["", "   ", null, undefined, "aran cotton", "8"]) expect(yarnWeight(value).id).toBe("3 Light");
});

it("names the CYC category in generated materials and in the booklet wording source", () => {
  expect(PATTERN_WEIGHT_LABEL).toBe("Light (CYC 3, DK, Light Worsted)");
  expect(generateDollPattern(DEFAULT_CONFIG).materials[0]).toContain("Light (CYC 3, DK, Light Worsted)");
});
