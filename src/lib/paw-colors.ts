import { partYarn, yarnById, type BodyPart, type CharacterConfig } from "./character";

export const PAW_REGIONS = ["hands", "feet"] as const;
export type PawRegion = (typeof PAW_REGIONS)[number];
/** Local arm -Y points away from the shoulder on both mirrored arms. */
export const PAW_BOUNDARY = { hands: -0.05, feet: 0.2 } as const;

export function pawYarn(config: CharacterConfig, region: PawRegion) {
  return yarnById(config.colors[region] ?? partYarn(config, "body").id);
}

/** Paw markings only override tips; the rest retains the individual limb yarn. */
export function limbSurfaceYarn(config: CharacterConfig, part: BodyPart, _region: PawRegion) {
  return partYarn(config, part);
}

export function isPawTip(region: PawRegion, localY: number) {
  return localY < PAW_BOUNDARY[region];
}