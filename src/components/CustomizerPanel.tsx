import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { YARNS, partYarn, type BodyPart, type CharacterConfig } from "@/lib/character";
import { CUSTOMIZATION_ITEMS, createLayeredCharacter, selectLayer } from "@/lib/character-layers";

const TABS = ["Body", "Ears", "Tail"] as const;
const PART_LABEL: Record<BodyPart, string> = {
  head: "Head", body: "Body", leftArm: "Left arm", rightArm: "Right arm",
  leftLeg: "Left leg", rightLeg: "Right leg", leftEar: "Left ear", rightEar: "Right ear",
  leftInnerEar: "Left inner ear", rightInnerEar: "Right inner ear", blush: "Blush cheeks", tail: "Tail",
};
const TAB_PARTS: Record<(typeof TABS)[number], BodyPart[]> = {
  Body: ["head", "body", "leftArm", "rightArm", "leftLeg", "rightLeg", "blush"],
  Ears: ["leftEar", "leftInnerEar", "rightEar", "rightInnerEar"],
  Tail: ["tail"],
};

function ColorRow({ part, config, onChange }: { part: BodyPart; config: CharacterConfig; onChange: (c: CharacterConfig) => void }) {
  const current = partYarn(config, part);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{PART_LABEL[part]} <span className="font-normal text-muted-foreground">· {current.name}</span></p>
        {part === "blush" && <Switch aria-label="Show blush" checked={config.face.cheeks} onCheckedChange={(cheeks) => onChange({ ...config, face: { ...config.face, cheeks } })} />}
      </div>
      {(part !== "blush" || config.face.cheeks) && <div className="flex flex-wrap gap-1.5">
        {YARNS.map((y) => (
          <Button key={y.id} variant="ghost" type="button" aria-label={`${PART_LABEL[part]}: ${y.name}`} aria-pressed={current.id === y.id}
            onClick={() => onChange({ ...config, colors: { ...config.colors, [part]: y.id } })}
            className={`h-7 w-7 rounded-full border border-border p-0 transition ${current.id === y.id ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : ""}`}
            style={{ backgroundColor: y.hex }} />
        ))}
      </div>}
    </div>
  );
}

export function CustomizerPanel({ config, onChange }: { config: CharacterConfig; onChange: (c: CharacterConfig) => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Body");
  const layered = config.layered ?? createLayeredCharacter();
  const pickEars = (id: string | null) => onChange({ ...config, layered: selectLayer(layered, "ears", id) });
  const earItems = CUSTOMIZATION_ITEMS.filter((i) => i.slot === "ears");
  const tailItems = CUSTOMIZATION_ITEMS.filter((i) => i.slot === "tail");
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
        {tab === "Tail" && (
          <div className="grid grid-cols-3 gap-2">
            <Button variant="ghost" aria-pressed={!layered.selections.tail} onClick={() => onChange({ ...config, layered: selectLayer(layered, "tail", null) })} className={!layered.selections.tail ? "choice choice-on" : "choice"}>None</Button>
            {tailItems.map((item) => (
              <Button key={item.id} variant="ghost" aria-pressed={layered.selections.tail === item.id} onClick={() => onChange({ ...config, layered: selectLayer(layered, "tail", item.id) })} className={layered.selections.tail === item.id ? "choice choice-on" : "choice"}>{item.label}</Button>
            ))}
          </div>
        )}
        {(tab === "Body" || (tab === "Ears" && layered.selections.ears) || (tab === "Tail" && layered.selections.tail)) && TAB_PARTS[tab].map((p) => <ColorRow key={p} part={p} config={config} onChange={onChange} />)}
      </div>
    </div>
  );
}
