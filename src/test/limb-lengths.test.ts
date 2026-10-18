import { expect, it } from "vitest";
import { configKey, DEFAULT_CONFIG, migratePartColors } from "@/lib/character";
import { createLayeredCharacter } from "@/lib/character-layers";
import { limbLengths, limbScale, normalizeLimbLength } from "@/lib/limb-lengths";
import { JOINED_BODY, joinedBodyDistance, joinedBodyShape } from "@/lib/joined-body";
import { generatePattern } from "@/lib/pattern";

const config = (arms = 100, legs = 100) => ({ ...DEFAULT_CONFIG, layered: createLayeredCharacter(), lengths: { arms, legs } });
const sections = (arms: number, legs: number) => generatePattern(config(arms, legs)).sections;

it("defaults old characters to 100% and clamps lengths to 100%–170%", () => {
  expect(limbLengths(DEFAULT_CONFIG)).toEqual({ arms: 100, legs: 100, torso: 100 });
  expect(normalizeLimbLength(70)).toBe(100);
  expect(normalizeLimbLength(200)).toBe(170);
  expect(normalizeLimbLength(NaN)).toBe(100);
  expect(migratePartColors(config(70, 200)).lengths).toEqual({ arms: 100, legs: 170, torso: 100 });
});

it("170% arms add four straight rounds at 8 stitches without changing legs", () => {
  const scaled = sections(170, 100);
  expect(scaled.find((s) => s.title.startsWith("Arms"))?.rounds.at(-1)).toEqual({ label: "R3–R10", text: "sc around for 8 rounds", count: 8 });
  expect(scaled.find((s) => s.title.startsWith("Legs"))).toEqual(sections(100, 100).find((s) => s.title.startsWith("Legs")));
  expect(limbScale(config(170), "arms")).toBe(10 / 6);
});

it("170% legs end at R12 with 12 stitches and shift body numbering without widening it", () => {
  const scaled = sections(100, 170);
  expect(scaled.find((s) => s.title.startsWith("Legs"))?.rounds.at(-1)).toEqual({ label: "R3–R12", text: "sc around for 10 rounds", count: 12 });
  const body = scaled.find((s) => s.title.startsWith("Body"));
  expect(body?.rounds.map((r) => r.label)).toEqual(["Join", "R13–R17", "R18", "R19", "R20"]);
  expect(body?.rounds.map((r) => r.count)).toEqual([24, 24, 20, 16, 12]);
  expect(limbScale(config(100, 170), "legs")).toBe(12 / 7);
});

it("keeps paw colour changes at arm R4 and leg R5 for elongated limbs", () => {
  const c = { ...config(170, 170), colors: { ...DEFAULT_CONFIG.colors, hands: "caramel", feet: "caramel" } };
  const generated = generatePattern(c).sections;
  expect(generated.find((s) => s.title.startsWith("Arms"))?.rounds[3]).toMatchObject({ label: "R4", text: "switch to Peach, sc around", count: 8 });
  expect(generated.find((s) => s.title.startsWith("Legs"))?.rounds[3]).toMatchObject({ label: "R5", text: "switch to Peach, sc around", count: 12 });
});

it("extends feet away from the torso while preserving continuous attachment and thickness", () => {
  const shape = joinedBodyShape(limbScale(config(100, 170), "legs"));
  expect(shape.leg.bottom).toBeCloseTo(-0.39142857);
  expect(shape.leg.top).toBe(JOINED_BODY.leg.top);
  expect(shape.leg.radius).toBe(JOINED_BODY.leg.radius);
  expect(shape.torso).toEqual(JOINED_BODY.torso);
  expect(joinedBodyDistance(0.22, -0.3, 0, shape)).toBeLessThan(0);
  expect(joinedBodyDistance(0.22, 0.5, 0, shape)).toBeLessThan(0);
});

it("includes normalized lengths in pattern keys without changing the original config", () => {
  expect(configKey(config(170))).not.toBe(configKey(config()));
  expect(configKey(config(100, 170))).not.toBe(configKey(config()));
  const old = { ...DEFAULT_CONFIG, layered: createLayeredCharacter() };
  expect(configKey(old)).toBe(configKey(config()));
  expect(old).not.toHaveProperty("lengths");
});

it("also scales legacy patterns without changing stitch counts", () => {
  const legacy = generatePattern({ ...DEFAULT_CONFIG, lengths: { arms: 170, legs: 170 } });
  expect(legacy.sections.find((s) => s.title.startsWith("Arms"))?.rounds.at(-1)).toMatchObject({ label: "R3–19", count: 12 });
  expect(legacy.sections.find((s) => s.title.startsWith("Legs"))?.rounds.at(-1)).toMatchObject({ label: "R4–19", count: 18 });
});
it("torso height at 170% adds 4 body rounds and keeps default keys unchanged", async () => {
  const { generateDollPattern } = await import("@/lib/doll-pattern");
  const { DEFAULT_CONFIG: D, configKey: key } = await import("@/lib/character");
  const body = generateDollPattern({ ...D, lengths: { torso: 170 } }).sections.find((s) => s.title.startsWith("Body"))!;
  expect(body.rounds[1]!.label).toBe("R8–R16");
  expect(body.rounds.at(-1)!.label).toBe("R19");
  expect(key({ ...D, lengths: { torso: 100 } })).toBe(key(D));
});
