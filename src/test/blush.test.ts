import { expect, it } from "vitest";
import { configKey, DEFAULT_CONFIG, migratePartColors, partYarn } from "@/lib/character";
import { createLayeredCharacter } from "@/lib/character-layers";

it("keeps the selected blush colour when cheeks are removed and restored", () => {
  const hidden = migratePartColors({ ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors, blush: "sky" }, face: { ...DEFAULT_CONFIG.face, cheeks: false } });
  expect(hidden.face.cheeks).toBe(false);
  expect(partYarn(hidden, "blush").id).toBe("sky");
  const restored = { ...hidden, face: { ...hidden.face, cheeks: true } };
  expect(partYarn(restored, "blush").id).toBe("sky");
});

it("distinguishes visible and removed blush in layered character keys", () => {
  const shown = { ...DEFAULT_CONFIG, layered: createLayeredCharacter() };
  const hidden = { ...shown, face: { ...shown.face, cheeks: false } };
  expect(configKey(shown)).not.toBe(configKey(hidden));
});