import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type CharacterConfig } from "@/lib/character";
import { BASE_ART, CUSTOMIZATION_ITEMS, createLayeredCharacter, selectLayer, type LayerSlot } from "@/lib/character-layers";

const TABS = [
  { label: "Body", slot: null }, { label: "Ears", slot: "ears" },
  { label: "Hair", slot: "hair" }, { label: "Face", slot: "face" },
  { label: "Outfits", slot: "outfit" }, { label: "Accessories", slot: "accessory" },
] as const;

export function CustomizerPanel({ config, onChange }: { config: CharacterConfig; onChange: (c: CharacterConfig) => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const layered = config.layered ?? createLayeredCharacter();
  const pick = (slot: LayerSlot, id: string | null) => onChange({ ...config, layered: selectLayer(layered, slot, id) });
  return (
    <div className="panel flex flex-col gap-5">
      <div role="tablist" aria-label="Character options" className="flex flex-wrap gap-1 rounded-full bg-muted p-1">
        {TABS.map((item) => (
          <Button key={item.label} variant="ghost" role="tab" aria-selected={tab.label === item.label} aria-controls="character-options" onClick={() => setTab(item)} className={tab.label === item.label ? "tab tab-on" : "tab"}>{item.label}</Button>
        ))}
      </div>
      <div id="character-options" role="tabpanel" aria-label={tab.label} className="flex flex-col gap-4">
        {tab.slot === null ? (
          <div className="flex items-center gap-4">
            <svg viewBox="50 45 155 280" className="h-32 w-20 shrink-0" aria-hidden="true"><image href={BASE_ART.url} width="768" height="877" /></svg>
            <div><h3 className="font-semibold">Original lined body</h3><p className="text-sm text-muted-foreground">Front view · Original artwork</p></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" aria-pressed={layered.selections[tab.slot] === null} onClick={() => { if (tab.slot) pick(tab.slot, null); }} className={`h-auto whitespace-normal ${layered.selections[tab.slot] === null ? "choice choice-on" : "choice"}`}>
                <span className="font-semibold">None</span><span className="text-xs text-muted-foreground">Original artwork</span>
              </Button>
              {CUSTOMIZATION_ITEMS.filter((item) => item.slot === tab.slot).map((item) => (
                <Button variant="ghost" key={item.id} aria-label={`${item.label} — ${item.placeholder ? "Sample placeholder" : "Artwork"}`} aria-pressed={layered.selections[item.slot] === item.id} onClick={() => pick(item.slot, item.id)} className={`h-auto whitespace-normal ${layered.selections[item.slot] === item.id ? "choice choice-on" : "choice"}`}>
                  <span className="font-semibold">{item.label}</span><span className="text-xs text-muted-foreground">{item.placeholder ? "Sample placeholder" : "Artwork"}</span>
                </Button>
              ))}
            </div>
            {layered.selections[tab.slot] && <Button variant="outline" onClick={() => { if (tab.slot) pick(tab.slot, null); }} className="self-start">Remove {tab.label.toLowerCase()}</Button>}
          </>
        )}
      </div>
    </div>
  );
}
