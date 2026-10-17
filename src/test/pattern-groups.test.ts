import { expect, it } from "vitest";
import { groupParts } from "@/components/PatternReader";
it("groups pieces like the customizer", () => {
  const g = groupParts(["Head (make 1)", "Legs (make 2)", "Body", "Arms (make 2)", "Bunny ears (make 2)", "Round tail (make 1)", "Big blush (make 2)"].map((title) => ({ title })));
  expect(g.map((x) => [x.label, x.parts.length])).toEqual([["Body", 4], ["Ears", 1], ["Tail", 1], ["Face", 1]]);
});
