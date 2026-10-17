import { Button } from "@/components/ui/button";
import { partYarn, type CharacterConfig } from "@/lib/character";
import { CUSTOMIZATION_ITEMS, type LayerSlot } from "@/lib/character-layers";

export function LayerThumb({ id, color }: { id: string | null; color: string }) {
  if (!id) return <path d="M24 32h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".35" />;
  if (id === "tail-round") return <circle cx="32" cy="32" r="13" fill={color} />;
  if (id === "tail-long") return <path d="M30 12C20 19 17 43 26 51C39 60 47 38 37 23C34 19 33 15 30 12Z" fill={color} />;
  return <g fill={color}>
    {id === "ears-bunny" && <><path d="M18 30V14a7 7 0 0114 0v16Z" /><path d="M33 30V14a7 7 0 0114 0v16Z" /></>}
    {id === "ears-cat" && <><path d="M13 31Q10 9 18 15L29 27Z" /><path d="M35 27L46 15Q54 9 51 31Z" /></>}
    {id === "ears-bear" && <><circle cx="17" cy="24" r="9" /><circle cx="47" cy="24" r="9" /></>}
    {id === "ears-human" && <><circle cx="12" cy="35" r="8" /><circle cx="52" cy="35" r="8" /></>}
    {id === "ears-dog" && <><ellipse cx="13" cy="42" rx="7" ry="16" /><ellipse cx="51" cy="42" rx="7" ry="16" /></>}
    <rect x="14" y="23" width="36" height="31" rx="14" />
    <g fill="currentColor"><circle cx="25" cy="37" r="2" /><circle cx="39" cy="37" r="2" /></g>
  </g>;
}

export function LayerFeatureCards({ slot, config, value, onSelect }: {
  slot: LayerSlot; config: CharacterConfig; value: string | null; onSelect: (id: string | null) => void;
}) {
  const options = [{ id: null, label: "None" }, ...CUSTOMIZATION_ITEMS.filter((item) => item.slot === slot)];
  const color = partYarn(config, slot === "tail" ? "tail" : "leftEar").hex;
  return <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={slot === "ears" ? "Ear style" : "Tail style"}>
    {options.map((item) => <Button key={item.id ?? "none"} variant="ghost" role="radio" aria-checked={value === item.id}
      aria-label={`${slot === "ears" ? "Ears" : "Tail"}: ${item.label}`} onClick={() => onSelect(item.id)}
      className={`feature-card ${value === item.id ? "choice-on" : ""}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true"><LayerThumb id={item.id} color={color} /></svg>
    </Button>)}
  </div>;
}