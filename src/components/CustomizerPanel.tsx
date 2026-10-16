import { useState } from "react";
import {
  ACCESSORY_OPTIONS,
  BODY_OPTIONS,
  type CharacterConfig,
  EAR_OPTIONS,
  EXPRESSION_OPTIONS,
  YARNS,
} from "@/lib/character";

const TABS = ["Colors", "Ears", "Face", "Body", "Accessories"] as const;
type Tab = (typeof TABS)[number];

type Props = { config: CharacterConfig; onChange: (c: CharacterConfig) => void };

function Swatches({ value, onPick, label }: { value: string; onPick: (id: string) => void; label: string }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {YARNS.map((y) => (
          <button
            key={y.id}
            type="button"
            title={y.name}
            aria-label={`${label}: ${y.name}`}
            aria-pressed={value === y.id}
            onClick={() => onPick(y.id)}
            className={value === y.id ? "swatch swatch-on" : "swatch"}
            style={{ backgroundColor: y.hex }}
          />
        ))}
      </div>
    </div>
  );
}

function Choice({ on, onClick, label, hint }: { on: boolean; onClick: () => void; label: string; hint?: string }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={on ? "choice choice-on" : "choice"}>
      <span className="font-semibold">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </button>
  );
}

export function CustomizerPanel({ config, onChange }: Props) {
  const [tab, setTab] = useState<Tab>("Colors");
  const set = (patch: Partial<CharacterConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="panel flex flex-col gap-5">
      <div role="tablist" className="flex flex-wrap gap-1 rounded-full bg-muted p-1">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tab === t ? "tab tab-on" : "tab"}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Colors" && (
        <div className="flex flex-col gap-5">
          {(
            [
              ["main", "Main yarn"],
              ["accent", "Accent (belly & inner ears)"],
              ["accessory", "Accessories"],
              ["eyes", "Face details"],
            ] as const
          ).map(([k, l]) => (
            <Swatches key={k} label={l} value={config.colors[k]} onPick={(id) => set({ colors: { ...config.colors, [k]: id } })} />
          ))}
        </div>
      )}

      {tab === "Ears" && (
        <div className="grid grid-cols-3 gap-2">
          {EAR_OPTIONS.map((o) => (
            <Choice key={o.value} on={config.ears === o.value} onClick={() => set({ ears: o.value })} label={o.label} hint={o.hint} />
          ))}
        </div>
      )}

      {tab === "Face" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            {EXPRESSION_OPTIONS.map((o) => (
              <Choice key={o.value} on={config.face.expression === o.value} onClick={() => set({ face: { ...config.face, expression: o.value } })} label={o.label} />
            ))}
          </div>
          <Choice on={config.face.cheeks} onClick={() => set({ face: { ...config.face, cheeks: !config.face.cheeks } })} label={config.face.cheeks ? "Rosy cheeks: on" : "Rosy cheeks: off"} />
        </div>
      )}

      {tab === "Body" && (
        <div className="grid grid-cols-3 gap-2">
          {BODY_OPTIONS.map((o) => (
            <Choice key={o.value} on={config.body === o.value} onClick={() => set({ body: o.value })} label={o.label} hint={o.hint} />
          ))}
        </div>
      )}

      {tab === "Accessories" && (
        <div className="grid grid-cols-3 gap-2">
          {ACCESSORY_OPTIONS.map((o) => {
            const on = config.accessories.includes(o.value);
            return (
              <Choice
                key={o.value}
                on={on}
                hint={on ? "Added" : "Tap to add"}
                onClick={() => set({ accessories: on ? config.accessories.filter((a) => a !== o.value) : [...config.accessories, o.value] })}
                label={o.label}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
