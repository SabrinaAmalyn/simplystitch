# Character artwork contract

The original uploaded sheet is immutable. The display mask is separate and only hides its background, labels and other views. No color filters, anatomy transforms, or painted replacements are applied to the base.

All overlay files are transparent PNG or SVG, authored on the same 256 × 360 canvas. Coordinates correspond to the original sheet's top-left front view at native scale: head around (127, 113), neck (127, 177), torso (127, 220), feet around y=321. Left/right mean the doll's own sides. SVG viewBox must be `0 0 256 360`; PNG dimensions must be 256 × 360. Transparent space must not be trimmed.

Sample overlays use dashed outlines and are labeled placeholders in the registry and interface. They are alignment fixtures, not final character artwork or approved crochet components. The bow additionally exercises transparent PNG rendering. The hairstyle has separately ordered back and front pieces.

Add uploaded artwork through Lovable Assets, import its pointer in `src/lib/character-layers.ts`, and register an item with stable ID, slot, component, and ordered asset pieces. Do not reuse IDs when artwork or rules change incompatibly. A slot holds one item, which may contain multiple front/back assets.

No supplied crochet rules exist for this base or sample items. Their patternRuleId values remain null, and generation is blocked. Before enabling a new base, implement explicit rule dispatch with tests; never fall back to the old approximate doll pattern.