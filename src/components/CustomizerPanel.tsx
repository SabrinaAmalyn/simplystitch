import { useState } from "react";
import { Button } from "@/components/ui/button";
import { YARNS, partYarn, type BodyPart, type CharacterConfig } from "@/lib/character";
import { CUSTOMIZATION_ITEMS, createLayeredCharacter, selectLayer } from "@/lib/character-layers";

const TABS = ["Body", "Ears"] as const;
const PART_LABEL: Record<BodyPart, string> = {
  head: "Head", body: "Body", leftArm: "Left arm", rightArm: "Right arm",
  leftLeg: "Left leg", rightLeg: "Right leg", leftEar: "Left ear", rightEar: "Right ear",
  leftInnerEar: "Left inner ear", rightInnerEar: "Right inner ear", blush: "Blush cheeks",
};
const TAB_PARTS: Record<(typeof TABS)[number], BodyPart[]> = {
  Body: ["head", "body", "leftArm", "rightArm", "leftLeg", "rightLeg", "blush"],
  Ears: ["leftEar", "leftInnerEar", "rightEar", "rightInnerEar"],
};

function ColorRow({ part, config, onChange }: { part: BodyPart; config: CharacterConfig; onChange: (c: CharacterConfig) => void }) {
  const current = partYarn(config, part);
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-semibold">{PART_LABEL[part]} <span className="font-normal text-muted-foreground">· {current.name}</span></p>
      <div className="flex flex-wrap gap-1.5">
        {YARNS.map((y) => (
          <button key={y.id} type="button" aria-label={`${PART_LABEL[part]}: ${y.name}`} aria-pressed={current.id === y.id}
            onClick={() => onChange({ ...config, colors: { ...config.colors, [part]: y.id } })}
            className={`h-7 w-7 rounded-full border border-border transition ${current.id === y.id ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : ""}`}
            style={{ backgroundColor: y.hex }} />
        ))}
      </div>
    </div>
  );
}

export function CustomizerPanel({ config, onChange }: { config: CharacterConfig; onChange: (c: CharacterConfig) => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Body");
  const layered = config.layered ?? createLayeredCharacter();
  const pickEars = (id: string | null) => onChange({ ...config, layered: selectLayer(layered, "ears", id) });
  const earItems = CUSTOMIZATION_ITEMS.filter((i) => i.slot === "ears");
  return (
    <div className="panel flex flex-col gap-5">
      <div role="tablist" aria-label="Character options" className="flex flex-wrap gap-1 rounded-full bg-muted p-1">
        {TABS.map((t) => (
          <Button key={t} variant="ghost" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tab === t ? "tab tab-on" : "tab"}>{t}</Button>
        ))}
      </div>
      <div role="tabpanel" aria-label={tab} className="flex flex-col gap-4">
        {tab === "Ears" && (
          <div className="grid grid-cols-3 gap-2">
            <Button variant="ghost" aria-pressed={layered.selections.ears === null} onClick={() => pickEars(null)} className={layered.selections.ears === null ? "choice choice-on" : "choice"}>None</Button>
            {earItems.map((item) => (
              <Button key={item.id} variant="ghost" aria-pressed={layered.selections.ears === item.id} onClick={() => pickEars(item.id)} className={layered.selections.ears === item.id ? "choice choice-on" : "choice"}>{item.label}</Button>
            ))}
          </div>
        )}
        {(tab === "Body" || layered.selections.ears) && TAB_PARTS[tab].map((p) => <ColorRow key={p} part={p} config={config} onChange={onChange} />)}
      </div>
    </div>
  );
}
