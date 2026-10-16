import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
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

// Doll faces +z; the doll's left side is +x (named from the doll's perspective).
// Proportions follow the reference sheet: big round head, tiny body, nub limbs.
function Ear({ type, side, color, inner }: { type: Ears; side: 1 | -1; color: string; inner: string }) {
  switch (type) {
    case "human":
      // Same round cup as the bear, on the sides of the head, inner facing forward.
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
      // Wide, thick triangle with rounded edges; inner inset hugs the outer boundary.
      return (
        <group position={[side * 0.62, 2.62, 0]} rotation={[0, 0, -side * 0.45]}>
          <mesh scale={[0.5, 0.56, 0.3]} castShadow><coneGeometry args={[1, 1, 32, 1]} /><Vinyl color={color} /></mesh>
          <mesh position={[0, -0.07, 0.1]} scale={[0.36, 0.4, 0.2]}><coneGeometry args={[1, 1, 32, 1]} /><Vinyl color={inner} /></mesh>
        </group>
      );
    case "bunny":
      // Two smooth upright capsule ovals, side by side, touching near the centre. No inner colour.
      return (
        <mesh position={[side * 0.28, 3.45, -0.05]} rotation={[0, 0, -side * 0.1]} scale={[0.3, 0.85, 0.2]} castShadow>
          <sphereGeometry args={[1, 32, 20]} />
          <Vinyl color={color} />
        </mesh>
      );
    case "dog":
      // Long drooping ear; broad pink inset on the lower, inward-facing surface (toward the cheeks).
      return (
        <group position={[side * 1.08, 1.78, 0.1]} rotation={[0, side * 0.3, side * 0.3]}>
          <mesh scale={[0.25, 0.84, 0.36]} castShadow><sphereGeometry args={[1, 32, 20]} /><Vinyl color={color} /></mesh>
          <mesh position={[-side * 0.12, -0.28, 0.12]} rotation={[0, -side * 0.5, 0]} scale={[0.16, 0.5, 0.2]}><sphereGeometry args={[1, 28, 18]} /><Vinyl color={inner} /></mesh>
        </group>
      );
  }
}

function Doll({ config, ears }: { config: CharacterConfig; ears: EarType }) {
  const c = (p: BodyPart) => partYarn(config, p).hex;
  const eye = yarnById(config.colors.eyes).hex;
  return (
    <group position={[0, -1.1, 0]}>
      <mesh position={[0, 1.95, 0]} scale={[1.02, 0.94, 0.96]} castShadow><sphereGeometry args={[1, 64, 48]} /><Vinyl color={c("head")} /></mesh>
      {[-1, 1].map((s) => (
        <mesh key={`e${s}`} position={[s * 0.34, 1.95, 0.9]} rotation={[0, s * 0.36, 0]} scale={[0.06, 0.09, 0.03]}><sphereGeometry args={[1, 20, 14]} /><meshPhysicalMaterial color={eye} roughness={0.3} clearcoat={1} /></mesh>
      ))}
      {config.face.cheeks && [-1, 1].map((s) => (
        <mesh key={`c${s}`} position={[s * 0.62, 1.66, 0.68]} rotation={[0, s * 0.72, 0]} scale={[0.28, 0.28, 0.06]}><sphereGeometry args={[1, 28, 18]} /><meshPhysicalMaterial color={c("blush")} roughness={0.9} /></mesh>
      ))}
      {/* Torso, arms and legs ~28% larger than before */}
      <mesh position={[0, 0.66, 0]} scale={[0.49, 0.54, 0.44]} castShadow><sphereGeometry args={[1, 40, 28]} /><Vinyl color={c("body")} /></mesh>
      {/* Arms sit high and tucked in, connecting at the shoulder/neck area */}
      <mesh position={[0.42, 0.86, 0.02]} rotation={[0, 0, 0.5]} castShadow><capsuleGeometry args={[0.13, 0.23, 8, 16]} /><Vinyl color={c("leftArm")} /></mesh>
      <mesh position={[-0.42, 0.86, 0.02]} rotation={[0, 0, -0.5]} castShadow><capsuleGeometry args={[0.13, 0.23, 8, 16]} /><Vinyl color={c("rightArm")} /></mesh>
      {/* Legs symmetric at the lower left/right of the torso, centred on the body */}
      <mesh position={[0.2, 0.22, 0]} castShadow><capsuleGeometry args={[0.175, 0.14, 8, 16]} /><Vinyl color={c("leftLeg")} /></mesh>
      <mesh position={[-0.2, 0.22, 0]} castShadow><capsuleGeometry args={[0.175, 0.14, 8, 16]} /><Vinyl color={c("rightLeg")} /></mesh>
      {ears && <Ear type={ears} side={1} color={c("leftEar")} inner={c("leftInnerEar")} />}
      {ears && <Ear type={ears} side={-1} color={c("rightEar")} inner={c("rightInnerEar")} />}
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
