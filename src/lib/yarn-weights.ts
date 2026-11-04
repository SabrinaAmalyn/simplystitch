// Craft Yarn Council's Standard Yarn Weight System — categories 0 (Lace) to 7 (Jumbo).
// Source: Craft Yarn Council's www.YarnStandards.com
export type YarnWeight = {
  /** Stored value, e.g. "3 Light" — also the chart's "Yarn Weight Symbol & Category Names" cell. */
  id: string;
  /** The CYC symbol number, 0–7. */
  category: number;
  /** Category name, e.g. "Light". */
  name: string;
  /** Chart row "Type of Yarns in Category". */
  alsoKnownAs: string;
  /** Chart row "Crochet Gauge Ranges in Single Crochet to 4 inch". */
  crochetGauge: string;
  /** Chart row "Recommended Hook in Metric Size Range". */
  hookMetric: string;
  /** Chart row "Recommended Hook U.S. Size Range". */
  hookUs: string;
};

export const YARN_WEIGHT_SOURCE = "Source: Craft Yarn Council's www.YarnStandards.com";

export const YARN_WEIGHTS: YarnWeight[] = [
  { id: "0 Lace", category: 0, name: "Lace", alsoKnownAs: "Fingering, 10-count crochet thread", crochetGauge: "32–42 double crochets", hookMetric: "Steel 1.6–1.4 mm, regular hook 2.25 mm", hookUs: "Steel 6, 7, 8, regular hook B–1" },
  { id: "1 Super Fine", category: 1, name: "Super Fine", alsoKnownAs: "Sock, Fingering, Baby", crochetGauge: "21–32 sts", hookMetric: "2.25–3.5 mm", hookUs: "B–1 to E–4" },
  { id: "2 Fine", category: 2, name: "Fine", alsoKnownAs: "Sport, Baby", crochetGauge: "16–20 sts", hookMetric: "3.5–4.5 mm", hookUs: "E–4 to 7" },
  { id: "3 Light", category: 3, name: "Light", alsoKnownAs: "DK, Light Worsted", crochetGauge: "12–17 sts", hookMetric: "4.5–5.5 mm", hookUs: "7 to I–9" },
  { id: "4 Medium", category: 4, name: "Medium", alsoKnownAs: "Worsted, Afghan, Aran", crochetGauge: "11–14 sts", hookMetric: "5.5–6.5 mm", hookUs: "I–9 to K–10½" },
  { id: "5 Bulky", category: 5, name: "Bulky", alsoKnownAs: "Chunky, Craft, Rug", crochetGauge: "8–11 sts", hookMetric: "6.5–9 mm", hookUs: "K–10½ to M–13" },
  { id: "6 Super Bulky", category: 6, name: "Super Bulky", alsoKnownAs: "Super Bulky, Roving", crochetGauge: "7–9 sts", hookMetric: "9–15 mm", hookUs: "M–13 to Q" },
  { id: "7 Jumbo", category: 7, name: "Jumbo", alsoKnownAs: "Jumbo, Roving", crochetGauge: "6 sts and fewer", hookMetric: "15 mm and larger", hookUs: "Q and larger" },
];

/** Yarns that were offered before the CYC system was adopted, mapped to their CYC category. */
const LEGACY_WEIGHTS: Record<string, string> = {
  "fingering": "1 Super Fine",
  "sock": "1 Super Fine",
  "baby": "1 Super Fine",
  "sport": "2 Fine",
  "dk cotton": "3 Light",
  "dk": "3 Light",
  "light worsted": "3 Light",
  "worsted": "4 Medium",
  "aran": "4 Medium",
  "afghan": "4 Medium",
  "chunky": "5 Bulky",
  "craft": "5 Bulky",
  "rug": "5 Bulky",
  "velvet / chenille": "5 Bulky",
  "velvet": "5 Bulky",
  "chenille": "5 Bulky",
  "super bulky": "6 Super Bulky",
  "roving": "6 Super Bulky",
  "jumbo": "7 Jumbo",
  "lace": "0 Lace",
};

export const YARN_WEIGHT_DEFAULT = "3 Light";

const byId = (id: string) => YARN_WEIGHTS.find((weight) => weight.id === id) ?? YARN_WEIGHTS[3]!;

/** Resolves any saved or legacy yarn-weight string to a CYC category; unknown values fall back to the default. */
export function yarnWeight(value: string | null | undefined): YarnWeight {
  const v = (value ?? "").trim();
  if (!v) return byId(YARN_WEIGHT_DEFAULT);
  const lower = v.toLowerCase();
  return (
    YARN_WEIGHTS.find((weight) => weight.id.toLowerCase() === lower) ??
    (/^[0-7]$/.test(v) ? YARN_WEIGHTS.find((weight) => weight.category === Number(v)) : undefined) ??
    YARN_WEIGHTS.find((weight) => weight.name.toLowerCase() === lower) ??
    (LEGACY_WEIGHTS[lower] ? byId(LEGACY_WEIGHTS[lower]!) : undefined) ??
    byId(YARN_WEIGHT_DEFAULT)
  );
}

/** Chart-style label used wherever the app names a yarn weight. */
export const yarnWeightLabel = (weight: YarnWeight) => `${weight.name} (CYC ${weight.category}, ${weight.alsoKnownAs})`;

export const YARN_WEIGHT_OPTIONS = YARN_WEIGHTS.map((weight) => weight.id);

/** Every SimplyStitch pattern is written for CYC category 3 (DK / light worsted). */
export const PATTERN_WEIGHT = yarnWeight(YARN_WEIGHT_DEFAULT);
export const PATTERN_WEIGHT_LABEL = yarnWeightLabel(PATTERN_WEIGHT);
