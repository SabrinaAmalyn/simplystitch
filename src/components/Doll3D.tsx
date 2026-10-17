import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { JoinedBody } from "./JoinedBody";
import { HEAD, HEAD_ATTACHMENT_OFFSET, createBlushGeometry } from "@/lib/doll-anatomy";
import { partYarn, yarnById, type BodyPart, type CharacterConfig } from "@/lib/character";

// Dev tooling injects `data-tsd-source` onto JSX. R3F reads hyphenated props as
// nested paths (data.tsd.source) and throws. Declaring it as a flat, harmless
// property makes R3F set it directly instead.
if (!Object.prototype.hasOwnProperty.call(Object.prototype, "data-tsd-source")) {
  Object.defineProperty(Object.prototype, "data-tsd-source", { value: undefined, writable: true, configurable: true, enumerable: false });
}

export type EarType = "human" | "dog" | "cat" | "bear" | "bunny" | null;

/** Soft vinyl-toy material with a velvety sheen glow at the edges. */
function Vinyl({ color }: { color: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.55}
      sheen={1}
      sheenRoughness={0.45}
      sheenColor="#ffe4d2"
      clearcoat={0.15}
      clearcoatRoughness={0.6}
    />
  );
}

type Ears = Exclude<EarType, null>;

// Shared base anatomy. Each part is an independent component positioned
// against these constants so parts stay seamlessly attached.
const BLUSH_GEOMETRY = createBlushGeometry();

/** Point on the head's unit sphere (before scaling) as a quaternion turning +y toward it. */
function capRotation(x: number, y: number, z: number) {
  const d = new THREE.Vector3(x, y, z).normalize();
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
}

function Head({ color }: { color: string }) {
  return <mesh position={[0, HEAD.y, 0]} scale={HEAD.scale} castShadow><sphereGeometry args={[1, 64, 48]} /><Vinyl color={color} /></mesh>;
}

function Eyes({ color }: { color: string }) {
  return (
    <>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.34, HEAD.y, 0.9]} rotation={[0, s * 0.36, 0]} scale={[0.06, 0.09, 0.03]}><sphereGeometry args={[1, 20, 14]} /><meshPhysicalMaterial color={color} roughness={0.3} clearcoat={1} /></mesh>
      ))}
    </>
  );
}

/** Raised circular blush with a rim that stays on the head surface. */
function BlushPatch({ side, color }: { side: 1 | -1; color: string }) {
  return (
    <group position={[0, HEAD.y, 0]} scale={HEAD.scale}>
      <group quaternion={capRotation(side * 0.62, -0.54, 0.72)}>
        <mesh geometry={BLUSH_GEOMETRY}><meshPhysicalMaterial color={color} roughness={0.9} /></mesh>
      </group>
    </group>
  );
}

function Arm({ side, color }: { side: 1 | -1; color: string }) {
  // Horizontal T-pose: slimmer and a touch shorter, still tucked into the shoulders.
  return <mesh position={[side * 0.62, 0.74, 0.02]} rotation={[0, 0, side * Math.PI / 2]} castShadow><capsuleGeometry args={[0.19, 0.25, 12, 24]} /><Vinyl color={color} /></mesh>;
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

// Doll faces +z; the doll's left side is +x (named from the doll's perspective).
function Ear({ type, side, color, inner }: { type: Ears; side: 1 | -1; color: string; inner: string }) {
  switch (type) {
    case "human":
      return (
        <group position={[side * 1.0, 1.95, 0.05]} rotation={[0, side * 0.45, 0]}>
          <mesh scale={[0.38, 0.38, 0.18]} castShadow><sphereGeometry args={[1, 32, 20]} /><Vinyl color={color} /></mesh>
          <mesh position={[0, 0, 0.12]} scale={[0.22, 0.22, 0.08]}><sphereGeometry args={[1, 28, 18]} /><Vinyl color={inner} /></mesh>
        </group>
      );
    case "bear":
      return (
        <group position={[side * 0.78, 2.66, -0.05]} rotation={[0, 0, -side * 0.6]}>
          <mesh scale={[0.38, 0.38, 0.18]} castShadow><sphereGeometry args={[1, 32, 20]} /><Vinyl color={color} /></mesh>
          <mesh position={[0, 0, 0.12]} scale={[0.22, 0.22, 0.08]}><sphereGeometry args={[1, 28, 18]} /><Vinyl color={inner} /></mesh>
        </group>
      );
    case "cat":
      // Short, wide, soft rounded triangles; bases tucked behind the upper head.
      return (
        <group position={[side * 0.56, 2.72, 0.02]} rotation={[-0.06, 0, -side * 0.38]}>
          <mesh geometry={CAT_EAR} scale={[0.5, 0.46, 0.18]} castShadow><Vinyl color={color} /></mesh>
          <mesh geometry={CAT_EAR} position={[0, -0.03, 0.12]} scale={[0.32, 0.3, 0.08]}><Vinyl color={inner} /></mesh>
        </group>
      );
    case "bunny":
      // Genuine 3D capsules, upright, touching near the centre. No inner colour.
      return (
        <mesh position={[side * 0.2, 3.3, -0.05]} rotation={[0, 0, -side * 0.08]} castShadow>
          <capsuleGeometry args={[0.2, 0.75, 12, 24]} />
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

function Doll({ config, ears }: { config: CharacterConfig; ears: EarType }) {
  const c = (p: BodyPart) => partYarn(config, p).hex;
  return (
    <group position={[0, -1.1, 0]}>
      <Head color={c("head")} />
      <Eyes color={yarnById(config.colors.eyes).hex} />
      {config.face.cheeks && <><BlushPatch side={1} color={c("blush")} /><BlushPatch side={-1} color={c("blush")} /></>}
      <JoinedBody torso={c("body")} leftLeg={c("leftLeg")} rightLeg={c("rightLeg")} />
      <Arm side={1} color={c("leftArm")} />
      <Arm side={-1} color={c("rightArm")} />
      <group position={[0, HEAD_ATTACHMENT_OFFSET, 0]}>
        {ears && <Ear type={ears} side={1} color={c("leftEar")} inner={c("leftInnerEar")} />}
        {ears && <Ear type={ears} side={-1} color={c("rightEar")} inner={c("rightInnerEar")} />}
      </group>
    </group>
  );
}

export default function Doll3D({ config, ears }: { config: CharacterConfig; ears: EarType }) {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.9, 7], fov: 40 }} gl={{ toneMappingExposure: 1.05 }}>
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
      <Doll config={config} ears={ears} />
      <ContactShadows position={[0, -1.11, 0]} opacity={0.28} blur={3} scale={5} far={2} />
      <OrbitControls enablePan={false} minDistance={3.5} maxDistance={9} minPolarAngle={0.5} maxPolarAngle={1.9} target={[0, 0.65, 0]} />
    </Canvas>
  );
}
