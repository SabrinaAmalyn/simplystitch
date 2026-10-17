// Simple, symmetrical, bold-outline badges for the landing "How it works" section.
const S = { stroke: "var(--ink)", strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Sparkle({ x, y, r = 9, fill = "var(--ill-white)" }: { x: number; y: number; r?: number; fill?: string }) {
  const k = r * 0.32;
  return <path d={`M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r}Z`} fill={fill} {...S} strokeWidth={4} />;
}

function flowerPath(cx: number, cy: number, R: number, petals: number, depth: number) {
  const n = 240;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = R - depth + depth * Math.abs(Math.cos((a * petals) / 2));
    d += `${i ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  }
  return d + "Z";
}

export function CustomizeArt() {
  return (
    <svg viewBox="0 0 240 240" className="h-auto w-full" role="img" aria-label="Character head with yarn colours">
      <path d={flowerPath(120, 120, 112, 6, 22)} fill="var(--ill-yellow)" {...S} />
      {/* ears */}
      <circle cx="86" cy="80" r="18" fill="var(--ill-cream)" {...S} />
      <circle cx="154" cy="80" r="18" fill="var(--ill-cream)" {...S} />
      {/* head */}
      <circle cx="120" cy="112" r="42" fill="var(--ill-cream)" {...S} />
      <circle cx="104" cy="110" r="5" fill="var(--ink)" />
      <circle cx="136" cy="110" r="5" fill="var(--ill-ink-dot)" />
      <ellipse cx="94" cy="124" rx="7" ry="4.5" fill="var(--ill-pink)" />
      <ellipse cx="146" cy="124" rx="7" ry="4.5" fill="var(--ill-pink)" />
      <path d="M112 124 Q120 131 128 124" fill="none" {...S} strokeWidth={4} />
      {/* swatches */}
      <circle cx="90" cy="180" r="13" fill="var(--ill-pink)" {...S} />
      <circle cx="120" cy="180" r="13" fill="var(--ill-green)" {...S} />
      <circle cx="150" cy="180" r="13" fill="var(--ill-blue)" {...S} />
      <Sparkle x={48} y={120} />
      <Sparkle x={192} y={120} />
    </svg>
  );
}

export function GenerateArt() {
  return (
    <svg viewBox="0 0 240 240" className="h-auto w-full" role="img" aria-label="Screen showing a crochet pattern">
      <circle cx="120" cy="120" r="108" fill="var(--ill-lilac)" {...S} />
      <rect x="62" y="68" width="116" height="82" rx="12" fill="var(--ill-white)" {...S} />
      <path d="M78 92h36M78 108h36M78 124h36" {...S} strokeWidth={5} fill="none" />
      <circle cx="148" cy="108" r="16" fill="var(--ill-yellow)" {...S} />
      <path d="M110 150v18M130 150v18" {...S} fill="none" />
      <rect x="90" y="166" width="60" height="12" rx="6" fill="var(--ill-pink)" {...S} />
      <Sparkle x={58} y={58} />
      <Sparkle x={182} y={58} />
    </svg>
  );
}

export function ReviewArt() {
  const w = 18; // wave amplitude for stamp edges
  const edge = (x0: number, y0: number, x1: number, y1: number, n: number) => {
    let d = "";
    for (let i = 1; i <= n; i++) {
      const t0 = (i - 1) / n, t1 = i / n, tm = (t0 + t1) / 2;
      const mx = x0 + (x1 - x0) * tm, my = y0 + (y1 - y0) * tm;
      const nx = (y1 - y0) === 0 ? 0 : (y1 > y0 ? 1 : -1), ny = (x1 - x0) === 0 ? 0 : (x1 > x0 ? -1 : 1);
      d += `Q${mx + nx * w} ${my + ny * w} ${x0 + (x1 - x0) * t1} ${y0 + (y1 - y0) * t1}`;
    }
    return d;
  };
  const a = 30, b = 210;
  const stamp = `M${a} ${a}${edge(a, a, b, a, 4)}${edge(b, a, b, b, 4)}${edge(b, b, a, b, 4)}${edge(a, b, a, a, 4)}Z`;
  return (
    <svg viewBox="0 0 240 240" className="h-auto w-full" role="img" aria-label="Pattern sheet with a tick">
      <path d={stamp} fill="var(--ill-blue)" {...S} />
      <rect x="78" y="58" width="84" height="110" rx="10" fill="var(--ill-white)" {...S} />
      <path d="M96 84h48M96 102h48M96 120h30" {...S} fill="none" />
      <circle cx="120" cy="170" r="22" fill="var(--ill-green)" {...S} />
      <path d="M109 170l8 8 14-15" {...S} fill="none" stroke="var(--ill-white)" strokeWidth={5} />
      <Sparkle x={58} y={120} />
      <Sparkle x={182} y={120} />
    </svg>
  );
}
