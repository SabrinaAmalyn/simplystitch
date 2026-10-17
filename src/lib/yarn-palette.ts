export type Yarn = { id: string; name: string; hex: string };
export type YarnGroup = { name: string; yarns: Yarn[] };

// Retain existing IDs so saved selections and edited drafts need no migration.
export const YARN_GROUPS: YarnGroup[] = [
  { name: "Creams & neutrals", yarns: [
    { id: "cream", name: "Warm White", hex: "#FFF9F0" },
    { id: "ivory", name: "Ivory", hex: "#F5EAD7" },
    { id: "vanilla", name: "Vanilla", hex: "#EAD9B9" },
    { id: "oat", name: "Oatmeal", hex: "#D6C2A3" },
    { id: "stone", name: "Stone", hex: "#B9A58D" },
  ] },
  { name: "Browns", yarns: [
    { id: "milk-tea", name: "Milk Tea", hex: "#CBA889" },
    { id: "caramel", name: "Caramel", hex: "#B78055" },
    { id: "cinnamon", name: "Cinnamon", hex: "#995D3B" },
    { id: "cocoa", name: "Chestnut", hex: "#78462F" },
    { id: "charcoal", name: "Dark Cocoa", hex: "#4B3028" },
  ] },
  { name: "Fox & autumn tones", yarns: [
    { id: "peach", name: "Peach", hex: "#F9CDB9" },
    { id: "terracotta", name: "Terracotta", hex: "#D47A59" },
    { id: "fox-red", name: "Fox Red", hex: "#C65A35" },
    { id: "rust", name: "Rust", hex: "#A9492D" },
    { id: "brick", name: "Brick", hex: "#873D32" },
  ] },
  { name: "Pastels", yarns: [
    { id: "blush", name: "Blush Pink", hex: "#EFA6A5" },
    { id: "baby-pink", name: "Baby Pink", hex: "#F6CDD0" },
    { id: "mustard", name: "Butter Yellow", hex: "#F1D78B" },
    { id: "sage", name: "Sage Green", hex: "#A8B99A" },
    { id: "sky", name: "Powder Blue", hex: "#A9CCDF" },
  ] },
  { name: "Woodland & muted colours", yarns: [
    { id: "moss", name: "Moss", hex: "#87966C" },
    { id: "olive", name: "Olive", hex: "#68784F" },
    { id: "eucalyptus", name: "Eucalyptus", hex: "#7EA69B" },
    { id: "teal", name: "Dusty Teal", hex: "#588D8A" },
    { id: "lilac", name: "Lavender", hex: "#B8A5CF" },
  ] },
];

export const YARNS = YARN_GROUPS.flatMap((group) => group.yarns);
const peach: Yarn = { id: "peach", name: "Peach", hex: "#F2B49A" };
export const yarnById = (id: string): Yarn => YARNS.find((yarn) => yarn.id === id) ?? peach;
export const BLUSH_YARN_GROUPS: YarnGroup[] = [{
  name: "Pinks & peach",
  yarns: ["blush", "baby-pink", "peach"].map(yarnById),
}];