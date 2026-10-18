import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, ContactShadows, Environment, Float, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { JoinedBody } from "./JoinedBody";
import { PawVinyl } from "./PawVinyl";
import { limbSurfaceYarn, pawMarked, pawYarn } from "@/lib/paw-colors";
import { HEAD, HEAD_ATTACHMENT_OFFSET, BLUSH_POSITION, createBlushGeometry } from "@/lib/doll-anatomy";
import { partYarn, yarnById, type BlushShape, type BrowStyle, type EyeStyle, type BodyPart, type CharacterConfig, type MouthStyle, type NoseStyle } from "@/lib/character";
import { limbScale } from "@/lib/limb-lengths";
import { JOINED_BODY, joinedBodyShape, torsoDrop } from "@/lib/joined-body";
import { PAW_BOUNDARY } from "@/lib/paw-colors";

// Dev tooling injects `data-tsd-source` onto JSX. R3F reads hyphenated props as
// nested paths (data.tsd.source) and throws. Declaring it as a flat, harmless
// property makes R3F set it directly instead.
if (!Object.prototype.hasOwnProperty.call(Object.prototype, "data-tsd-source")) {
  Object.defineProperty(Object.prototype, "data-tsd-source", { value: undefined, writable: true, configurable: true, enumerable: false });
}

export type EarType = "human" | "dog" | "cat" | "bear" | "bunny" | null;
/** A single crochet piece to show floating on its own; null shows the whole doll. */
export type PartFocus = "head" | "body" | "arm" | "ears" | "tail" | null;

/** Soft vinyl-toy material with a velvety sheen glow at the edges. */
function Vinyl({ color, sheenColor = "#ffe4d2" }: { color: string; sheenColor?: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.55}
      sheen={1}
      sheenRoughness={0.45}
      sheenColor={sheenColor}
      clearcoat={0.15}
      clearcoatRoughness={0.6}
    />
  );
}

type Ears = Exclude<EarType, null>;

// Shared base anatomy. Each part is an independent component positioned
// against these constants so parts stay seamlessly attached.
const BLUSH_GEOMETRY = createBlushGeometry();
const OVAL_BLUSH_GEOMETRY = createBlushGeometry("oval");

/** Point on the head's unit sphere (before scaling) as a quaternion turning +y toward it. */
function capRotation(x: number, y: number, z: number) {
  const d = new THREE.Vector3(x, y, z).normalize();
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
}

function Head({ color }: { color: string }) {
  return <mesh position={[0, HEAD.y, 0]} scale={HEAD.scale} castShadow><sphereGeometry args={[1, 64, 48]} /><Vinyl color={color} /></mesh>;
}

function Eyes({ left, right, style }: { left: string; right: string; style: EyeStyle }) {
  if (style === "sleepy") return <>{[-1, 1].map((side) => (
    <Stitch key={side} color={side === 1 ? left : right} radius={0.019}
      points={[[side * 0.34 - 0.09, 0.015], [side * 0.34 - 0.045, -0.024], [side * 0.34, -0.036], [side * 0.34 + 0.045, -0.024], [side * 0.34 + 0.09, 0.015]]} />
  ))}</>;
  return (
    <>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.34, HEAD.y, 0.9]} rotation={[0, s * 0.36, 0]} scale={[0.078, 0.084, 0.035]}><sphereGeometry args={[1, 24, 16]} /><meshPhysicalMaterial color={s === 1 ? left : right} roughness={0.3} clearcoat={1} /></mesh>
      ))}
    </>
  );
}

const STITCH = yarnById("charcoal").hex;

/** Project a face-space point (x right, y up from the eye line) onto the head front. */
function onFace(x: number, y: number, lift = 0.012) {
  const [sx, sy, sz] = HEAD.scale;
  const r = 1 - (x / sx) ** 2 - (y / sy) ** 2;
  const z = sz * Math.sqrt(Math.max(r, 0)) + lift;
  return new THREE.Vector3(x, HEAD.y + y, z);
}

/** One embroidered stitch line following the head surface. */
function Stitch({ points, radius = 0.02, color = STITCH, lift = 0.012 }: { points: [number, number][]; radius?: number; color?: string; lift?: number }) {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last || points.length < 2) return null;
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => onFace(x, y, lift)));
  return (
    <>
      <mesh><tubeGeometry args={[curve, 24, radius, 8, false]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
      {[first, last].map(([x, y], i) => (
        <mesh key={i} position={onFace(x, y, lift)}><sphereGeometry args={[radius, 8, 6]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
      ))}
    </>
  );
}

const NOSE_Y = -0.13;
const MOUTH_Y = -0.27;

function Nose({ style }: { style: NoseStyle }) {
  if (style === "teddy") return <><Stitch points={[[-0.08, NOSE_Y], [0.08, NOSE_Y]]} radius={0.026} /><Stitch points={[[0, NOSE_Y], [0, NOSE_Y - 0.05]]} radius={0.022} /></>;
  if (style === "cat") {
    // Softly rounded triangle: curved sides and a rounded tip, no sharp corners.
    const tri = new THREE.Shape();
    tri.moveTo(-0.065, 0.03);
    tri.quadraticCurveTo(0, 0.062, 0.065, 0.03);
    tri.quadraticCurveTo(0.045, -0.018, 0, -0.048);
    tri.quadraticCurveTo(-0.045, -0.018, -0.065, 0.03);
    return <mesh position={onFace(0, NOSE_Y, 0.006)}><extrudeGeometry args={[tri, { depth: 0.02, bevelEnabled: true, bevelSize: 0.014, bevelThickness: 0.014, bevelSegments: 4 }]} /><meshStandardMaterial color={STITCH} roughness={0.7} /></mesh>;
  }
  if (style === "round") return <mesh position={onFace(0, NOSE_Y, 0)} scale={[0.062, 0.056, 0.032]}><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color={STITCH} roughness={0.7} /></mesh>;
  return null;
}

function Mouth({ style }: { style: MouthStyle }) {
  const y = MOUTH_Y;
  // The X sits a little lower so it never touches the teddy nose stem above it.
  if (style === "x") return <><Stitch points={[[-0.065, y + 0.01], [0.065, y - 0.11]]} /><Stitch points={[[0.065, y + 0.01], [-0.065, y - 0.11]]} /></>;
  if (style === "w") return <Stitch points={[[-0.14, y + 0.05], [-0.1, y - 0.01], [-0.065, y - 0.045], [-0.03, y - 0.005], [0, y + 0.03], [0.03, y - 0.005], [0.065, y - 0.045], [0.1, y - 0.01], [0.14, y + 0.05]]} />;
  // Same gentle arc as a sleepy eye: drop 0.051 over half-width 0.09.
  if (style === "smile") return <Stitch points={[[-0.09, y + 0.015], [-0.045, y - 0.024], [0, y - 0.036], [0.045, y - 0.024], [0.09, y + 0.015]]} />;
  return null;
}

const BROW_Y = 0.3;

/** Embroidered eyebrows above the eyes; soft rounded stitches, mix-and-match with other face features. */
function Eyebrows({ style, color }: { style: BrowStyle; color: string }) {
  if (style === "none") return null;
  if (style === "dots") return <>{[-1, 1].map((s) => (
    <mesh key={s} position={onFace(s * 0.34, BROW_Y)} scale={[0.045, 0.045, 0.02]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
  ))}</>;
  const arc = (s: number, y: number, lift: number, half = 0.09): [number, number][] =>
    [[s * 0.34 - half, y], [s * 0.34, y + lift], [s * 0.34 + half, y]];
  if (style === "straight") return <>{[-1, 1].map((s) => <Stitch key={s} color={color} points={arc(s, BROW_Y, 0)} />)}</>;
  if (style === "soft-arch") return <>{[-1, 1].map((s) => <Stitch key={s} color={color} points={arc(s, BROW_Y, 0.035)} />)}</>;
  if (style === "high-arch") return <>{[-1, 1].map((s) => <Stitch key={s} color={color} points={arc(s, BROW_Y - 0.01, 0.075)} />)}</>;
  if (style === "thick") return <>{[-1, 1].map((s) => <Stitch key={s} color={color} radius={0.032} points={arc(s, BROW_Y, 0.03, 0.1)} />)}</>;
  // Angry: inner ends dip toward the nose; worried: inner ends rise.
  if (style === "angry") return <>{[-1, 1].map((s) => <Stitch key={s} color={color} points={[[s * 0.45, BROW_Y + 0.045], [s * 0.34, BROW_Y + 0.01], [s * 0.24, BROW_Y - 0.05]]} />)}</>;
  if (style === "worried") return <>{[-1, 1].map((s) => <Stitch key={s} color={color} points={[[s * 0.45, BROW_Y - 0.04], [s * 0.34, BROW_Y + 0.01], [s * 0.24, BROW_Y + 0.055]]} />)}</>;
  // Asymmetrical: doll's left brow raised and arched, right brow straight.
  return <>{[-1, 1].map((s) => s === 1
    ? <Stitch key={s} color={color} points={arc(s, BROW_Y + 0.07, 0.05)} />
    : <Stitch key={s} color={color} points={arc(s, BROW_Y, 0)} />)}</>;
}

/** Raised circular blush with a rim that stays on the head surface. */
// Whiskers lift over the blush when both are worn so neither hides the other.
function Whiskers({ overBlush = false }: { overBlush?: boolean }) {
  return <>{[-1, 1].flatMap((side) => [-0.04, -0.14, -0.24].map((y, i) => (
    <Stitch key={`${side}-${i}`} radius={0.013} lift={overBlush ? 0.07 : 0.012} points={[[side * 0.69, y], [side * 0.77, y + (1 - i) * 0.014], [side * 0.85, y + (1 - i) * 0.028]]} />
  )))}</>;
}

function BlushPatch({ side, color, shape }: { side: 1 | -1; color: string; shape: BlushShape }) {
  const [x, y, z] = BLUSH_POSITION[shape];
  const d = new THREE.Vector3(side * x, y, z).normalize();
  // Oval blush: align its long axis with the head's horizontal tangent so it
  // reads as straight from the front, not slanted downwards.
  const quat = useMemo(() => {
    if (shape !== "oval") return capRotation(side * x, y, z);
    const tangent = new THREE.Vector3(d.z, 0, -d.x).normalize();
    const normal = new THREE.Vector3().crossVectors(tangent, d).normalize();
    const m = new THREE.Matrix4().makeBasis(tangent, d, normal);
    return new THREE.Quaternion().setFromRotationMatrix(m);
  }, [side, shape, x, y, z]);
  return (
    <group position={[0, HEAD.y, 0]} scale={HEAD.scale}>
      <group quaternion={quat}>
        <mesh geometry={shape === "oval" ? OVAL_BLUSH_GEOMETRY : BLUSH_GEOMETRY}><meshPhysicalMaterial color={color} roughness={0.9} /></mesh>
      </group>
    </group>
  );
}

function Arm({ side, color, pawColor, marked, lengthScale = 1, down = false }: { side: 1 | -1; color: string; pawColor: string; marked: boolean; lengthScale?: number; down?: boolean }) {
  const extension = 0.63 * (lengthScale - 1);
  if (down) {
    // Preview-only pose: hanging from the shoulder, angled slightly away from the torso.
    const a = 0.3;
    const h = 0.125 + extension / 2;
    return <mesh position={[side * (0.5 + Math.sin(a) * h), 0.92 - Math.cos(a) * h, 0.02]} rotation={[0, 0, side * a]} castShadow><capsuleGeometry args={[0.19, 0.25 + extension, 12, 24]} /><PawVinyl color={color} pawColor={pawColor} region="hands" enabled={marked} boundary={PAW_BOUNDARY.hands - extension / 2} /></mesh>;
  }
  // Tilted up 20° and set high: the arm's top rests against the head's underside without sinking into it.
  const tilt = 0.35;
  return <mesh position={[side * (0.58 + Math.cos(tilt) * extension / 2), 0.818 + Math.sin(tilt) * extension / 2, 0.02]} rotation={[0, 0, side * (Math.PI / 2 + tilt)]} castShadow><capsuleGeometry args={[0.19, 0.25 + extension, 12, 24]} /><PawVinyl color={color} pawColor={pawColor} region="hands" enabled={marked} boundary={PAW_BOUNDARY.hands - extension / 2} /></mesh>;
}

/** Sphere tapered toward the top: a smooth, pillowy rounded triangle (like the bear ear, less round). */
function catEarGeometry() {
  const g = new THREE.SphereGeometry(1, 48, 32);
  const pos = g.attributes["position"] as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) + 1) / 2;
    pos.setX(i, pos.getX(i) * (1 - 0.62 * Math.pow(t, 1.3)));
  }
  g.computeVertexNormals();
  return g;
}
const CAT_EAR = catEarGeometry();

/** One continuous cat tail: rooted inside the lower back, even thickness, curving up and to the side. */
function longTailGeometry() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.5, -0.12),
    new THREE.Vector3(0, 0.44, -0.36),
    new THREE.Vector3(0.04, 0.42, -0.58),
    new THREE.Vector3(0.14, 0.52, -0.74),
    new THREE.Vector3(0.22, 0.74, -0.8),
    new THREE.Vector3(0.22, 0.96, -0.72),
  ]);
  const R = 0.085;
  const geometry = new THREE.SphereGeometry(1, 32, 128);
  const positions = geometry.attributes["position"] as THREE.BufferAttribute;
  const reference = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < positions.count; i++) {
    const t = 1 - (positions.getY(i) + 1) / 2;
    const center = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const right = new THREE.Vector3().crossVectors(reference, tangent).normalize();
    const up = new THREE.Vector3().crossVectors(right, tangent).normalize();
    const phi = Math.atan2(positions.getZ(i), positions.getX(i));
    // Constant radius, a gentle taper near the end, and rounded caps at both ends
    // (the base cap is buried inside the torso so the tail emerges seamlessly).
    const taper = 1 - 0.22 * THREE.MathUtils.smoothstep(t, 0.72, 0.94);
    const cap = (e: number) => Math.sqrt(Math.max(0, 1 - (1 - e) ** 2));
    const ends = Math.min(t < 0.06 ? cap(t / 0.06) : 1, t > 0.94 ? cap((1 - t) / 0.06) : 1);
    const r = R * taper * ends;
    center.addScaledVector(right, Math.cos(phi) * r);
    center.addScaledVector(up, Math.sin(phi) * r);
    positions.setXYZ(i, center.x, center.y, center.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}
const LONG_TAIL = longTailGeometry();

function Tail({ selection, color }: { selection?: string | null; color: string }) {
  if (selection === "tail-round") return <mesh position={[0, 0.38, -0.42]} castShadow><sphereGeometry args={[0.23, 40, 28]} /><Vinyl color={color} /></mesh>;
  if (selection === "tail-long") return <mesh geometry={LONG_TAIL} castShadow><Vinyl color={color} sheenColor={color} /></mesh>;
  return null;
}

/**
 * Bunny ear: a capsule with its lower rounded end cut off flat. The flat cut
 * is placed well inside the head, so only straight sides and a rounded top
 * ever show.
 */
function bunnyEarGeometry(straight: number, radius: number) {
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(radius, 0),
    new THREE.Vector2(radius, straight),
  ];
  const steps = 16;
  for (let i = 1; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    profile.push(
      new THREE.Vector2(Math.cos(a) * radius, straight + Math.sin(a) * radius),
    );
  }
  return new THREE.LatheGeometry(profile, 48);
}

// The cut base sits below the head's surface across its whole footprint, so it
// never shows. The ear stays shorter than the long capsule first modelled.
const BUNNY_EAR_RADIUS = 0.4;
const BUNNY_EAR_BOTTOM_Y = 2.3;
const BUNNY_EAR_TOP_Y = 3.75;
const BUNNY_EAR = bunnyEarGeometry(
  BUNNY_EAR_TOP_Y - BUNNY_EAR_BOTTOM_Y - BUNNY_EAR_RADIUS,
  BUNNY_EAR_RADIUS,
);

// Doll faces +z; the doll's left side is +x (named from the doll's perspective).
function Ear({ type, side, color }: { type: Ears; side: 1 | -1; color: string }) {
  switch (type) {
    case "human":
      return (
        <group position={[side * 1.0, 1.95, 0.05]} rotation={[0, side * 0.45, 0]}>
          <mesh scale={[0.38, 0.38, 0.18]} castShadow><sphereGeometry args={[1, 32, 20]} /><Vinyl color={color} /></mesh>
        </group>
      );
    case "bear":
      return (
        <group position={[side * 0.78, 2.66, -0.05]} rotation={[0, 0, -side * 0.6]}>
          <mesh scale={[0.38, 0.38, 0.18]} castShadow><sphereGeometry args={[1, 32, 20]} /><Vinyl color={color} /></mesh>
        </group>
      );
    case "cat":
      // Short, wide, soft rounded triangles; bases tucked behind the upper head.
      return (
        <group position={[side * 0.56, 2.72, 0.02]} rotation={[-0.06, 0, -side * 0.38]}>
          <mesh geometry={CAT_EAR} scale={[0.5, 0.46, 0.18]} castShadow><Vinyl color={color} /></mesh>
        </group>
      );
    case "bunny":
      // Perfectly vertical straight-sided capsule whose cut-off base hides
      // inside the head. No inner colour, no outward tilt.
      return (
        <mesh
          geometry={BUNNY_EAR}
          position={[side * 0.38, BUNNY_EAR_BOTTOM_Y, -0.05]}
          castShadow
        >
          <Vinyl color={color} />
        </mesh>
      );
    case "dog":
      // Solid floppy ear, no inner insert.
      return (
        <mesh position={[side * 1.08, 1.78, 0.1]} rotation={[0, side * 0.3, side * 0.3]} scale={[0.25, 0.84, 0.36]} castShadow>
          <sphereGeometry args={[1, 32, 20]} />
          <Vinyl color={color} />
        </mesh>
      );
  }
}

function Doll({ config, ears, focus = null, armsDown = false }: { config: CharacterConfig; ears: EarType; focus?: PartFocus; armsDown?: boolean }) {
  const c = (p: BodyPart) => partYarn(config, p).hex;
  const arms = limbScale(config, "arms");
  const legs = limbScale(config, "legs");
  const torsoH = limbScale(config, "torso");
  if (focus === "head") return (
    <group>
      <Head color={c("head")} />
      <Eyes left={c("leftEye")} right={c("rightEye")} style={config.face.eyeStyle ?? "open"} />
      <Eyebrows style={config.face.brow ?? "none"} color={c("brows")} />
      <Nose style={config.face.nose ?? "none"} />
      <Mouth style={config.face.mouth ?? "none"} />
      {config.face.whiskers && <Whiskers overBlush={config.face.cheeks} />}
      {config.face.cheeks && <><BlushPatch side={1} color={c("leftBlush")} shape={config.face.blushShape ?? "round"} /><BlushPatch side={-1} color={c("rightBlush")} shape={config.face.blushShape ?? "round"} /></>}
    </group>
  );
  if (focus === "body") return <JoinedBody lengthScale={legs} torsoScale={torsoH} torso={c("body")} leftLeg={limbSurfaceYarn(config, "leftLeg", "feet").hex} rightLeg={limbSurfaceYarn(config, "rightLeg", "feet").hex} pawColor={pawYarn(config, "leftFoot").hex} marked={pawMarked(config, "leftFoot")} rightPawColor={pawYarn(config, "rightFoot").hex} rightMarked={pawMarked(config, "rightFoot")} />;
  if (focus === "arm") return <Arm lengthScale={arms} side={1} color={limbSurfaceYarn(config, "leftArm", "hands").hex} pawColor={pawYarn(config, "leftHand").hex} marked={pawMarked(config, "leftHand")} />;
  if (focus === "tail") return <Tail selection={config.layered?.selections.tail ?? null} color={c("tail")} />;
  if (focus === "ears") return <group position={[0, HEAD_ATTACHMENT_OFFSET, 0]}>{ears && <><Ear type={ears} side={1} color={c("leftEar")} /><Ear type={ears} side={-1} color={c("rightEar")} /></>}</group>;
  return (
    <group position={[0, -1.1, 0]}>
      <Head color={c("head")} />
      <Eyes left={c("leftEye")} right={c("rightEye")} style={config.face.eyeStyle ?? "open"} />
      <Eyebrows style={config.face.brow ?? "none"} color={c("brows")} />
      <Nose style={config.face.nose ?? "none"} />
      <Mouth style={config.face.mouth ?? "none"} />
      {config.face.whiskers && <Whiskers overBlush={config.face.cheeks} />}
      {config.face.cheeks && <><BlushPatch side={1} color={c("leftBlush")} shape={config.face.blushShape ?? "round"} /><BlushPatch side={-1} color={c("rightBlush")} shape={config.face.blushShape ?? "round"} /></>}
      <JoinedBody lengthScale={legs} torsoScale={torsoH} torso={c("body")} leftLeg={limbSurfaceYarn(config, "leftLeg", "feet").hex} rightLeg={limbSurfaceYarn(config, "rightLeg", "feet").hex} pawColor={pawYarn(config, "leftFoot").hex} marked={pawMarked(config, "leftFoot")} rightPawColor={pawYarn(config, "rightFoot").hex} rightMarked={pawMarked(config, "rightFoot")} />
      <group position={[0, -torsoDrop(torsoH) / 2, 0]}><Tail selection={config.layered?.selections.tail ?? null} color={c("tail")} /></group>
      <Arm down={armsDown} lengthScale={arms} side={1} color={limbSurfaceYarn(config, "leftArm", "hands").hex} pawColor={pawYarn(config, "leftHand").hex} marked={pawMarked(config, "leftHand")} />
      <Arm down={armsDown} lengthScale={arms} side={-1} color={limbSurfaceYarn(config, "rightArm", "hands").hex} pawColor={pawYarn(config, "rightHand").hex} marked={pawMarked(config, "rightHand")} />
      <group position={[0, HEAD_ATTACHMENT_OFFSET, 0]}>
        {ears && <Ear type={ears} side={1} color={c("leftEar")} />}
        {ears && <Ear type={ears} side={-1} color={c("rightEar")} />}
      </group>
    </group>
  );
}

export default function Doll3D({ config, ears, focus = null, armsDown = false }: { config: CharacterConfig; ears: EarType; focus?: PartFocus; armsDown?: boolean }) {
  const footY = -1.11 + joinedBodyShape(limbScale(config, "legs"), limbScale(config, "torso")).leg.bottom - JOINED_BODY.leg.bottom;
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.9, 5.5], fov: 40 }} gl={{ toneMappingExposure: 1.05 }}>
      <hemisphereLight args={["#fff6ec", "#ffd9c4", 1.1]} />
      {/* Warm key */}
      <directionalLight position={[3, 5, 4]} intensity={1.6} color="#fff0e0" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      {/* Soft fill */}
      <directionalLight position={[-4, 2, 3]} intensity={0.5} color="#e8f0ff" />
      {/* Rim light for the glowing silhouette */}
      <directionalLight position={[0, 3, -5]} intensity={1.4} color="#fff0e4" />
      <Environment>
        <Lightformer intensity={1.2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color="#ffe8d6" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
        <Lightformer intensity={1.5} color="#ffdff0" position={[0, 1, -6]} scale={[12, 4, 1]} />
      </Environment>
      {focus ? (
        <>
          <Bounds key={focus} fit clip margin={1.2}>
            <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.4}>
              <Doll config={config} ears={ears} focus={focus} />
            </Float>
          </Bounds>
          <OrbitControls makeDefault enablePan={false} />
        </>
      ) : (
        <>
          <Bounds key={`${ears}-${limbScale(config, "arms")}-${limbScale(config, "legs")}-${limbScale(config, "torso")}-${armsDown}`} fit clip margin={1.2}>
            <Doll config={config} ears={ears} armsDown={armsDown} />
          </Bounds>
          <ContactShadows position={[0, footY, 0]} opacity={0.28} blur={3} scale={5} far={2} />
          <OrbitControls makeDefault enablePan={false} minDistance={3.5} maxDistance={9} minPolarAngle={0.5} maxPolarAngle={1.9} />
        </>
      )}
    </Canvas>
  );
}
