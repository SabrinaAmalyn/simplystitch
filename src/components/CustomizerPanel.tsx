import { useState, type ReactNode } from "react";
import { Accessibility, Smile, Rabbit, Spline, Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { YARNS, partYarn, type BodyPart, type CharacterConfig } from "@/lib/character";
import { CUSTOMIZATION_ITEMS, createLayeredCharacter, selectLayer } from "@/lib/character-layers";
import { pawYarn, type PawRegion } from "@/lib/paw-colors";
import none from "@/assets/customizer/ear-none.jpg.asset.json";
import human from "@/assets/customizer/ear-monkey.jpg.asset.json";
import cat from "@/assets/customizer/ear-cat.jpg.asset.json";
import dog from "@/assets/customizer/ear-dog.jpg.asset.json";
import bear from "@/assets/customizer/ear-bear.jpg.asset.json";
import bunny from "@/assets/customizer/ear-bunny.jpg.asset.json";

const CATEGORIES = [{ name: "Body", icon: Accessibility }, { name: "Face", icon: Smile }, { name: "Ears", icon: Rabbit }, { name: "Tail", icon: Spline }] as const;
type Category = (typeof CATEGORIES)[number]["name"];
const LABELS: Partial<Record<BodyPart, string>> = { head: "Head", body: "Body", leftArm: "Left arm", rightArm: "Right arm", leftLeg: "Left leg", rightLeg: "Right leg", leftEar: "Left ear", rightEar: "Right ear", leftBlush: "Left blush", rightBlush: "Right blush", leftEye: "Left eye", rightEye: "Right eye", tail: "Tail" };
const EAR_CHOICES = [{ id: null, label: "None", image: none.url }, { id: "ears-human", label: "Human", image: human.url }, { id: "ears-cat", label: "Cat", image: cat.url }, { id: "ears-dog", label: "Dog", image: dog.url }, { id: "ears-bear", label: "Bear", image: bear.url }, { id: "ears-bunny", label: "Bunny", image: bunny.url }];

function ColorRow({ part, config, onChange }: { part: BodyPart | PawRegion; config: CharacterConfig; onChange: (c: CharacterConfig) => void }) {
  const isPaw = part === "hands" || part === "feet";
  const current = isPaw ? pawYarn(config, part) : partYarn(config, part);
  const label = part === "hands" ? "Hands / paws" : part === "feet" ? "Feet / paws" : LABELS[part] ?? part;
  return <div className="color-row">
    <div className="flex items-center justify-between gap-3"><span className="text-sm font-bold">{label}</span><span className="text-xs text-muted-foreground">{current.name}</span></div>
    <div className="flex flex-wrap gap-2" aria-label={`${label} colours`}>
      {YARNS.map((y) => <Button key={y.id} variant="ghost" type="button" title={y.name} aria-label={`${label}: ${y.name}`} aria-pressed={current.id === y.id}
        onClick={() => onChange({ ...config, colors: { ...config.colors, [part]: y.id } })}
        className={`yarn-swatch yarn-${y.id} ${current.id === y.id ? "yarn-swatch-selected" : ""}`}>
        {current.id === y.id && <span className="swatch-check"><Check strokeWidth={3} /></span>}
      </Button>)}
    </div>
  </div>;
}

function ColorGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="color-group"><h3 className="mb-4 text-xs font-bold uppercase text-muted-foreground">{title}</h3><div className="flex flex-col gap-5">{children}</div></section>;
}

export function CustomizerPanel({ config, onChange }: { config: CharacterConfig; onChange: (c: CharacterConfig) => void }) {
  const [tab, setTab] = useState<Category>("Body");
  const layered = config.layered ?? createLayeredCharacter();
  const colors = (parts: (BodyPart | PawRegion)[]) => parts.map((part) => <ColorRow key={part} part={part} config={config} onChange={onChange} />);
  return <div className="creator-controls">
    <div role="tablist" aria-label="Character options" className="category-tabs">
      {CATEGORIES.map(({ name, icon: Icon }) => <Button key={name} variant="ghost" role="tab" id={`category-${name}`} aria-controls="character-options" aria-selected={tab === name} onClick={() => setTab(name)} className={`category-tab ${tab === name ? "category-tab-active" : ""}`}><Icon /><span>{name}</span></Button>)}
    </div>
    <div role="tabpanel" id="character-options" aria-labelledby={`category-${tab}`} className="category-content">
      <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-2xl font-semibold">{tab === "Body" ? "A little colour, a lot of you" : tab === "Face" ? "Hello, little personality" : tab === "Ears" ? "Pick a pair" : "The finishing touch"}</h2><Palette className="size-5 shrink-0 text-primary" /></div>
      {tab === "Body" && <><ColorGroup title="Head & body">{colors(["head", "body"])}</ColorGroup><ColorGroup title="Arms & legs">{colors(["leftArm", "rightArm", "leftLeg", "rightLeg"])}</ColorGroup><ColorGroup title="Paw markings">{colors(["hands", "feet"])}</ColorGroup></>}
      {tab === "Face" && <><ColorGroup title="Eyes">{colors(["leftEye", "rightEye"])}</ColorGroup><ColorGroup title="Rosy cheeks"><div className="flex items-center justify-between"><label htmlFor="show-blush" className="text-sm font-bold">Show blush</label><Switch id="show-blush" aria-label="Show blush" checked={config.face.cheeks} onCheckedChange={(cheeks) => onChange({ ...config, face: { ...config.face, cheeks } })} /></div>{config.face.cheeks && colors(["leftBlush", "rightBlush"])}</ColorGroup></>}
      {tab === "Ears" && <><div className="ear-grid">{EAR_CHOICES.map((ear) => <Button key={ear.id ?? "none"} variant="ghost" aria-label={ear.label} aria-pressed={layered.selections.ears === ear.id} onClick={() => onChange({ ...config, layered: selectLayer(layered, "ears", ear.id) })} className={`ear-card ${layered.selections.ears === ear.id ? "ear-card-selected" : ""}`}><img src={ear.image} alt="" /><span className="ear-card-label">{ear.label}</span>{layered.selections.ears === ear.id && <span className="ear-check"><Check /></span>}</Button>)}</div>{layered.selections.ears && <ColorGroup title="Ear colours">{colors(["leftEar", "rightEar"])}</ColorGroup>}</>}
      {tab === "Tail" && <><div className="grid grid-cols-3 gap-3 mb-6">{[{ id: null, label: "None" }, ...CUSTOMIZATION_ITEMS.filter((item) => item.slot === "tail")].map((item) => <Button key={item.id ?? "none"} variant="ghost" aria-pressed={layered.selections.tail === item.id} onClick={() => onChange({ ...config, layered: selectLayer(layered, "tail", item.id) })} className={layered.selections.tail === item.id ? "choice choice-on" : "choice"}>{item.label}{layered.selections.tail === item.id && <Check />}</Button>)}</div>{layered.selections.tail && <ColorGroup title="Tail colour">{colors(["tail"])}</ColorGroup>}</>}
    </div>
  </div>;
}
