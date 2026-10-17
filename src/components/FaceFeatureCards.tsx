// Thumbnail cards for embroidered face features (noses and mouths).
import { yarnById, type BlushShape, type EyeStyle, type MouthStyle, type NoseStyle } from "@/lib/character";
import { Button } from "@/components/ui/button";

const STROKE = yarnById("charcoal").hex;

function EyeThumb({ style }: { style: EyeStyle }) {
  return style === "sleepy"
    ? <g fill="none" stroke={STROKE} strokeWidth="2" strokeLinecap="round"><path d="M 5 14 Q 10 21 15 14" /><path d="M 19 14 Q 24 21 29 14" /></g>
    : <g fill={STROKE}><circle cx="10" cy="16" r="3" /><circle cx="24" cy="16" r="3" /></g>;
}

function BlushThumb({ style }: { style: BlushShape }) {
  return style === "oval"
    ? <ellipse cx="16" cy="16" rx="7" ry="3" fill={yarnById("blush").hex} />
    : <circle cx="16" cy="16" r="8" fill={yarnById("blush").hex} />;
}

function NoseThumb({ style }: { style: NoseStyle }) {
  if (style === "none") return <line x1="10" y1="18" x2="22" y2="18" stroke={STROKE} strokeWidth="2" strokeLinecap="round" opacity="0.25" />;
  if (style === "teddy") return <g stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" fill="none"><line x1="9" y1="13" x2="23" y2="13" /><line x1="16" y1="13" x2="16" y2="24" /></g>;
  if (style === "cat") return <path d="M 9 12 Q 16 8 23 12 Q 20 19 16 21 Q 12 19 9 12 Z" fill={STROKE} strokeLinejoin="round" />;
  return <circle cx="16" cy="16" r="5" fill={STROKE} />;
}

function MouthThumb({ style }: { style: MouthStyle }) {
  if (style === "none") return <line x1="10" y1="18" x2="22" y2="18" stroke={STROKE} strokeWidth="2" strokeLinecap="round" opacity="0.25" />;
  if (style === "x") return <g stroke={STROKE} strokeWidth="2.4" strokeLinecap="round"><line x1="10" y1="10" x2="22" y2="22" /><line x1="22" y1="10" x2="10" y2="22" /></g>;
  if (style === "w") return <path d="M 6 12 Q 9.5 21 13 16 Q 16 10 19 16 Q 22.5 21 26 12" fill="none" stroke={STROKE} strokeWidth="2.4" strokeLinecap="round" />;
  if (style === "smile") return <path d="M 8 13 Q 16 24 24 13" fill="none" stroke={STROKE} strokeWidth="2.4" strokeLinecap="round" />;
  return null;
}

type CardProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onSelect: (v: T) => void;
  Thumb: (p: { style: T }) => React.ReactNode;
};

function FeatureCards<T extends string>({ label, options, value, onSelect, Thumb }: CardProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <Button
            variant="ghost"
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            aria-label={`${label}: ${o.label}`}
            title={o.label}
            onClick={() => onSelect(o.value)}
            className={`choice h-auto whitespace-normal flex flex-col items-center gap-1 px-1 py-2 [&_svg]:size-8 ${value === o.value ? "choice-on" : ""}`}
          >
            <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true"><Thumb style={o.value} /></svg>
            <span className="text-[10px] leading-tight">{o.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

export const NoseCards = (p: Omit<CardProps<NoseStyle>, "label" | "Thumb">) => <FeatureCards {...p} label="Nose" Thumb={NoseThumb} />;
export const MouthCards = (p: Omit<CardProps<MouthStyle>, "label" | "Thumb">) => <FeatureCards {...p} label="Mouth" Thumb={MouthThumb} />;
export const EyeCards = (p: Omit<CardProps<EyeStyle>, "label" | "Thumb">) => <FeatureCards {...p} label="Eyes" Thumb={EyeThumb} />;
export const BlushCards = (p: Omit<CardProps<BlushShape>, "label" | "Thumb">) => <FeatureCards {...p} label="Blush shape" Thumb={BlushThumb} />;
