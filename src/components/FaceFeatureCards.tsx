// Thumbnail cards for embroidered face features (noses and mouths).
import type { MouthStyle, NoseStyle } from "@/lib/character";

const STROKE = "#4B3028";

function NoseThumb({ style }: { style: NoseStyle }) {
  if (style === "none") return <line x1="10" y1="18" x2="22" y2="18" stroke={STROKE} strokeWidth="2" strokeLinecap="round" opacity="0.25" />;
  if (style === "teddy") return <g stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" fill="none"><line x1="9" y1="13" x2="23" y2="13" /><line x1="16" y1="13" x2="16" y2="24" /></g>;
  if (style === "cat") return <path d="M 10 12 L 22 12 L 16 21 Z" fill={STROKE} strokeLinejoin="round" />;
  return <circle cx="16" cy="16" r="5" fill={STROKE} />;
}

function MouthThumb({ style }: { style: MouthStyle }) {
  if (style === "none") return <line x1="10" y1="18" x2="22" y2="18" stroke={STROKE} strokeWidth="2" strokeLinecap="round" opacity="0.25" />;
  if (style === "x") return <g stroke={STROKE} strokeWidth="2.4" strokeLinecap="round"><line x1="10" y1="10" x2="22" y2="22" /><line x1="22" y1="10" x2="10" y2="22" /></g>;
  if (style === "w") return <path d="M 7 13 Q 10 20 13 14 Q 16 21 19 14 Q 22 20 25 13" fill="none" stroke={STROKE} strokeWidth="2.4" strokeLinecap="round" />;
  if (style === "smile") return <path d="M 8 13 Q 16 24 24 13" fill="none" stroke={STROKE} strokeWidth="2.4" strokeLinecap="round" />;
  return <g stroke={STROKE} strokeWidth="2.4" strokeLinecap="round" fill="none"><path d="M 16 12 Q 8 14 11 19" /><path d="M 16 12 Q 24 14 21 19" /></g>;
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
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            aria-label={`${label}: ${o.label}`}
            title={o.label}
            onClick={() => onSelect(o.value)}
            className={`choice flex flex-col items-center gap-1 px-1 py-2 ${value === o.value ? "choice-on" : ""}`}
          >
            <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true"><Thumb style={o.value} /></svg>
            <span className="text-[10px] leading-tight">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const NoseCards = (p: Omit<CardProps<NoseStyle>, "label" | "Thumb">) => <FeatureCards {...p} label="Nose" Thumb={NoseThumb} />;
export const MouthCards = (p: Omit<CardProps<MouthStyle>, "label" | "Thumb">) => <FeatureCards {...p} label="Mouth" Thumb={MouthThumb} />;
