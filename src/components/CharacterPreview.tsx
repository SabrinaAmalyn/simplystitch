import { type CharacterConfig, yarnById } from "@/lib/character";

const BODY = {
  chubby: { rx: 82, ry: 66, cy: 270 },
  standard: { rx: 66, ry: 72, cy: 272 },
  tall: { rx: 54, ry: 88, cy: 282 },
};

// Yarn colors are user data, so they are applied as SVG fills.
export function CharacterPreview({ config }: { config: CharacterConfig }) {
  const main = yarnById(config.colors.main).hex;
  const accent = yarnById(config.colors.accent).hex;
  const acc = yarnById(config.colors.accessory).hex;
  const eyes = yarnById(config.colors.eyes).hex;
  const b = BODY[config.body];
  const stroke = "rgba(60,40,30,0.25)";
  const has = (a: string) => config.accessories.includes(a as never);

  const ears = () => {
    if (config.ears === "round")
      return [95, 205].map((x) => (
        <g key={x}>
          <circle cx={x} cy={75} r={30} fill={main} stroke={stroke} strokeWidth={2} />
          <circle cx={x} cy={78} r={16} fill={accent} />
        </g>
      ));
    if (config.ears === "long")
      return [120, 180].map((x, i) => (
        <g key={x} transform={`rotate(${i ? 10 : -10} ${x} 80)`}>
          <ellipse cx={x} cy={40} rx={20} ry={58} fill={main} stroke={stroke} strokeWidth={2} />
          <ellipse cx={x} cy={44} rx={9} ry={42} fill={accent} />
        </g>
      ));
    return ([
      [80, 105, 100, 30, 140, 70],
      [220, 105, 200, 30, 160, 70],
    ] as [number, number, number, number, number, number][]).map(([x1, y1, x2, y2, x3, y3], i) => (
      <g key={i}>
        <polygon points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill={main} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        <polygon points={`${(x1 + x2 + x3) / 3 - (i ? -2 : 2)},${y1 - 15} ${x2 + (i ? 4 : -4)},${y2 + 25} ${(x1 + x3) / 2},${y3 + 18}`} fill={accent} />
      </g>
    ));
  };

  const face = () => {
    const e = config.face.expression;
    return (
      <g stroke={eyes} fill={eyes} strokeLinecap="round">
        {e === "happy" && (
          <>
            <circle cx={122} cy={140} r={7} />
            <circle cx={178} cy={140} r={7} />
            <path d="M140 160 q5 6 10 0 q5 6 10 0" fill="none" strokeWidth={3} />
          </>
        )}
        {e === "sleepy" && (
          <>
            <path d="M112 140 q10 9 20 0" fill="none" strokeWidth={4} />
            <path d="M168 140 q10 9 20 0" fill="none" strokeWidth={4} />
            <line x1={145} y1={163} x2={155} y2={163} strokeWidth={3} />
          </>
        )}
        {e === "surprised" && (
          <>
            <circle cx={122} cy={138} r={10} />
            <circle cx={178} cy={138} r={10} />
            <circle cx={125} cy={134} r={3} fill="#fff" stroke="none" />
            <circle cx={181} cy={134} r={3} fill="#fff" stroke="none" />
            <ellipse cx={150} cy={166} rx={6} ry={8} fill="none" strokeWidth={3} />
          </>
        )}
      </g>
    );
  };

  return (
    <svg viewBox="0 -30 300 410" className="h-full w-full drop-shadow-xl" role="img" aria-label="Crochet character preview">
      <ellipse cx={150} cy={368} rx={90} ry={8} fill="rgba(60,40,30,0.12)" />
      {/* feet */}
      <ellipse cx={b.cy > 275 ? 122 : 115} cy={b.cy + b.ry - 6} rx={22} ry={14} fill={main} stroke={stroke} strokeWidth={2} />
      <ellipse cx={b.cy > 275 ? 178 : 185} cy={b.cy + b.ry - 6} rx={22} ry={14} fill={main} stroke={stroke} strokeWidth={2} />
      {/* body */}
      <ellipse cx={150} cy={b.cy} rx={b.rx} ry={b.ry} fill={main} stroke={stroke} strokeWidth={2} />
      <ellipse cx={150} cy={b.cy + 10} rx={b.rx * 0.55} ry={b.ry * 0.6} fill={accent} />
      {/* arms */}
      <ellipse cx={150 - b.rx + 6} cy={b.cy - 15} rx={14} ry={30} fill={main} stroke={stroke} strokeWidth={2} transform={`rotate(20 ${150 - b.rx + 6} ${b.cy - 15})`} />
      <ellipse cx={150 + b.rx - 6} cy={b.cy - 15} rx={14} ry={30} fill={main} stroke={stroke} strokeWidth={2} transform={`rotate(-20 ${150 + b.rx - 6} ${b.cy - 15})`} />
      {/* scarf */}
      {has("scarf") && (
        <g fill={acc} stroke={stroke} strokeWidth={2}>
          <rect x={160} y={205} width={22} height={60} rx={6} transform="rotate(-8 170 210)" />
          <rect x={90} y={196} width={120} height={24} rx={12} />
        </g>
      )}
      {ears()}
      {/* head */}
      <circle cx={150} cy={135} r={80} fill={main} stroke={stroke} strokeWidth={2} />
      <ellipse cx={150} cy={160} rx={26} ry={18} fill={accent} opacity={0.9} />
      {config.face.cheeks && (
        <g fill="#f0928a" opacity={0.55}>
          <ellipse cx={108} cy={162} rx={12} ry={7} />
          <ellipse cx={192} cy={162} rx={12} ry={7} />
        </g>
      )}
      {face()}
      {has("beanie") && (
        <g stroke={stroke} strokeWidth={2}>
          <path d="M74 112 A78 70 0 0 1 226 112 Z" fill={acc} />
          <rect x={70} y={102} width={160} height={20} rx={10} fill={acc} />
          <circle cx={150} cy={40} r={14} fill={acc} />
        </g>
      )}
      {has("bow") && (
        <g fill={acc} stroke={stroke} strokeWidth={2} transform="translate(196 72) rotate(15)">
          <path d="M0 0 L-24 -14 L-24 14 Z" strokeLinejoin="round" />
          <path d="M0 0 L24 -14 L24 14 Z" strokeLinejoin="round" />
          <circle r={6} />
        </g>
      )}
    </svg>
  );
}
