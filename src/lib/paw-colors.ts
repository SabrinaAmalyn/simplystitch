import { partYarn, yarnById, type BodyPart, type CharacterConfig } from "./character";

export const PAW_REGIONS = ["hands", "feet"] as const;
export type PawRegion = (typeof PAW_REGIONS)[number];
/** Individual paw tips, named from the doll's perspective. */
export const PAW_SIDES = ["leftHand", "rightHand", "leftFoot", "rightFoot"] as const;
export type PawSide = (typeof PAW_SIDES)[number];
export const PAW_SIDE_REGION: Record<PawSide, PawRegion> = { leftHand: "hands", rightHand: "hands", leftFoot: "feet", rightFoot: "feet" };
/** Local arm -Y points away from the shoulder on both mirrored arms. */
export const PAW_BOUNDARY = { hands: -0.05, feet: 0.2 } as const;

const isSide = (key: PawRegion | PawSide): key is PawSide => key in PAW_SIDE_REGION;

/** Side colour falls back to the legacy shared hands/feet colour, then the body yarn. */
export function pawYarn(config: CharacterConfig, key: PawRegion | PawSide) {
  const shared = config.colors[isSide(key) ? PAW_SIDE_REGION[key] : key];
  const own = isSide(key) ? config.colors[key] : undefined;
  return yarnById(own ?? shared ?? partYarn(config, "body").id);
}

export function pawMarked(config: CharacterConfig, side: PawSide) {
  return Boolean(config.colors[side] ?? config.colors[PAW_SIDE_REGION[side]]);
}

/** Paw markings only override tips; the rest retains the individual limb yarn. */
export function limbSurfaceYarn(config: CharacterConfig, part: BodyPart, _region: PawRegion) {
  return partYarn(config, part);
}

export function isPawTip(region: PawRegion, localY: number) {
  return localY < PAW_BOUNDARY[region];
}
