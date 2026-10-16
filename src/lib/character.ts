// Character configuration: data only, no rendering or pattern logic.

export type Yarn = { id: string; name: string; hex: string };

export const YARNS: Yarn[] = [
  { id: "peach", name: "Peach", hex: "#ffddcb" },
  { id: "oat", name: "Oatmeal", hex: "#e9dcc4" },
  { id: "cream", name: "Cream", hex: "#f8f1e3" },
  { id: "blush", name: "Blush Pink", hex: "#f2b8b0" },
  { id: "terracotta", name: "Terracotta", hex: "#c8694a" },
  { id: "mustard", name: "Mustard", hex: "#e0a93b" },
  { id: "sage", name: "Sage", hex: "#a3b48c" },
  { id: "teal", name: "Deep Teal", hex: "#3f7a78" },
  { id: "sky", name: "Sky Blue", hex: "#9cc3dd" },
  { id: "lilac", name: "Lilac", hex: "#c3b2d6" },
  { id: "cocoa", name: "Cocoa", hex: "#7a5340" },
  { id: "charcoal", name: "Charcoal", hex: "#3c3a3a" },
];

export const yarnById = (id: string): Yarn => YARNS.find((y) => y.id === id) ?? { id: "peach", name: "Peach", hex: "#ffddcb" };

export type EarStyle = "none" | "round" | "long" | "pointy";
export type Expression = "happy" | "sleepy" | "surprised";
export type BodyShape = "chubby" | "standard" | "tall";
export type Accessory = "scarf" | "bow" | "beanie";

export type CharacterConfig = {
  colors: { main: string; accent: string; accessory: string; eyes: string };
  ears: EarStyle;
  face: { expression: Expression; cheeks: boolean };
  body: BodyShape;
  accessories: Accessory[];
};

export const DEFAULT_CONFIG: CharacterConfig = {
  colors: { main: "peach", accent: "cream", accessory: "terracotta", eyes: "charcoal" },
  ears: "none",
  face: { expression: "sleepy", cheeks: true },
  body: "standard",
  accessories: [],
};

export const EAR_OPTIONS: { value: EarStyle; label: string; hint: string }[] = [
  { value: "none", label: "None", hint: "Base doll" },
  { value: "round", label: "Round", hint: "Teddy-style" },
  { value: "long", label: "Long", hint: "Bunny-style" },
  { value: "pointy", label: "Pointy", hint: "Kitty-style" },
];

export const EXPRESSION_OPTIONS: { value: Expression; label: string }[] = [
  { value: "happy", label: "Happy" },
  { value: "sleepy", label: "Sleepy" },
  { value: "surprised", label: "Surprised" },
];

export const BODY_OPTIONS: { value: BodyShape; label: string; hint: string }[] = [
  { value: "chubby", label: "Chubby", hint: "Wide & short" },
  { value: "standard", label: "Standard", hint: "Balanced" },
  { value: "tall", label: "Tall", hint: "Slim & long" },
];

export const ACCESSORY_OPTIONS: { value: Accessory; label: string }[] = [
  { value: "scarf", label: "Scarf" },
  { value: "bow", label: "Bow" },
  { value: "beanie", label: "Beanie" },
];

export const configKey = (c: CharacterConfig) => JSON.stringify({ base: "doll-v2", ...c });
