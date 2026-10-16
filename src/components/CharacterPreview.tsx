import { type CharacterConfig, partYarn, yarnById } from "@/lib/character";

const BODY = {
  chubby: { shoulder: 28, hip: 47, bottom: 290, foot: 354 },
  standard: { shoulder: 24, hip: 36, bottom: 286, foot: 354 },
  tall: { shoulder: 22, hip: 30, bottom: 303, foot: 377 },
};

// Yarn colors are user data, so they are applied as SVG fills.
export function CharacterPreview({ config }: { config: CharacterConfig }) {
  const color = (part: Parameters<typeof partYarn>[1]) => partYarn(config, part).hex;
  const accent = yarnById(config.colors.accent).hex;
  const acc = yarnById(config.colors.accessory).hex;
  const eyes = yarnById(config.colors.eyes).hex;
  const b = BODY[config.body];
  const stroke = "var(--doll-outline)";
  const has = (a: CharacterConfig["accessories"][number]) => config.accessories.includes(a);

  const ears = () => {
    if (config.ears === "none") return null;
    if (config.ears === "round")
      return [95, 205].map((x, i) => (
        <g key={x}>
          <circle data-part={i ? "leftEar" : "rightEar"} cx={x} cy={75} r={30} fill={color(i ? "leftEar" : "rightEar")} stroke={stroke} strokeWidth={2} />
          <circle cx={x} cy={78} r={16} fill={accent} />
        </g>
      ));
    if (config.ears === "long")
      return [120, 180].map((x, i) => (
        <g key={x} transform={`rotate(${i ? 10 : -10} ${x} 80)`}>
          <ellipse data-part={i ? "leftEar" : "rightEar"} cx={x} cy={40} rx={20} ry={58} fill={color(i ? "leftEar" : "rightEar")} stroke={stroke} strokeWidth={2} />
          <ellipse cx={x} cy={44} rx={9} ry={42} fill={accent} />
        </g>
      ));
    return ([
      [80, 105, 100, 30, 140, 70],
      [220, 105, 200, 30, 160, 70],
    ] as [number, number, number, number, number, number][]).map(([x1, y1, x2, y2, x3, y3], i) => (
      <g key={i}>
        <polygon data-part={i ? "leftEar" : "rightEar"} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill={color(i ? "leftEar" : "rightEar")} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
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
            <path d="M139 164 q11 7 22 0" fill="none" strokeWidth={3} />
          </>
        )}
        {e === "surprised" && (
          <>
            <circle cx={122} cy={138} r={10} />
            <circle cx={178} cy={138} r={10} />
            <circle cx={125} cy={134} r={3} fill="var(--doll-eye-glint)" stroke="none" />
            <circle cx={181} cy={134} r={3} fill="var(--doll-eye-glint)" stroke="none" />
            <ellipse cx={150} cy={166} rx={6} ry={8} fill="none" strokeWidth={3} />
          </>
        )}
      </g>
    );
  };

  return (
    <svg viewBox="0 -30 300 440" className="h-full w-full drop-shadow-xl" role="img" aria-label="Crochet doll preview">
      <ellipse cx={150} cy={b.foot + 8} rx={65} ry={6} fill="var(--doll-shadow)" />
      {/* Left/right refer to the doll's own sides in this front view. */}
      {[150 - b.hip + 3, 155].map((x, i) => (
        <rect data-part={i ? "leftLeg" : "rightLeg"} key={x} x={x} y={b.bottom - 15} width={b.hip - 8} height={b.foot - b.bottom + 15} rx={10} fill={color(i ? "leftLeg" : "rightLeg")} stroke={stroke} strokeWidth={2} />
      ))}
      <path data-part="body" d={`M${150 - b.shoulder} 204 Q150 195 ${150 + b.shoulder} 204 Q${150 + b.hip} 238 ${150 + b.hip} ${b.bottom - 6} Q${150 + b.hip} ${b.bottom + 4} 150 ${b.bottom + 4} Q${150 - b.hip} ${b.bottom + 4} ${150 - b.hip} ${b.bottom - 6} Q${150 - b.hip} 238 ${150 - b.shoulder} 204 Z`} fill={color("body")} stroke={stroke} strokeWidth={2} />
      {[-1, 1].map((side) => (
        <rect data-part={side === 1 ? "leftArm" : "rightArm"} key={side} x={150 + side * (b.shoulder + 10) - 12} y={206} width={24} height={b.bottom - 211} rx={12} transform={`rotate(${-side * 16} ${150 + side * (b.shoulder + 10)} 212)`} fill={color(side === 1 ? "leftArm" : "rightArm")} stroke={stroke} strokeWidth={2} />
      ))}
      <rect x={138} y={185} width={24} height={31} rx={10} fill={color("body")} stroke={stroke} strokeWidth={2} />
      {/* scarf */}
      {has("scarf") && (
        <g fill={acc} stroke={stroke} strokeWidth={2}>
          <rect x={160} y={205} width={22} height={60} rx={6} transform="rotate(-8 170 210)" />
          <rect x={90} y={196} width={120} height={24} rx={12} />
        </g>
      )}
      {ears()}
      {/* head */}
      <circle data-part="head" cx={150} cy={135} r={80} fill={color("head")} stroke={stroke} strokeWidth={2} />
      {config.face.cheeks && (
        <g fill="var(--doll-cheeks)" opacity={0.55}>
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
