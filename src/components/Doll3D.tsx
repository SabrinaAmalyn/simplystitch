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
function Vinyl({ color, side }: { color: string; side?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.7}
      sheen={1}
      sheenRoughness={0.45}
      sheenColor="#fff1e6"
      clearcoat={0.15}
      clearcoatRoughness={0.6}
      side={side}
    />
  );
}

type Ears = Exclude<EarType, null>;

// Doll faces +z; the doll's left side is +x (named from the doll's perspective).
function Ear({ type, side, color, inner }: { type: Ears; side: 1 | -1; color: string; inner: string }) {
  switch (type) {
    case "human":
      return (
        <group position={[side * 1.14, 1.55, 0]}>
          <mesh scale={[0.1, 0.2, 0.15]}><sphereGeometry args={[1, 24, 16]} /><Vinyl color={color} /></mesh>
          <mesh position={[side * 0.05, 0, 0.02]} scale={[0.05, 0.13, 0.09]}><sphereGeometry args={[1, 20, 14]} /><Vinyl color={inner} /></mesh>
        </group>
      );
    case "bear":
      return (
        <group position={[side * 0.72, 2.3, -0.05]} rotation={[0, 0, -side * 0.35]}>
          <mesh scale={[0.3, 0.3, 0.15]} castShadow><sphereGeometry args={[1, 28, 18]} /><Vinyl color={color} /></mesh>
          <mesh position={[0, -0.02, 0.1]} scale={[0.17, 0.17, 0.06]}><sphereGeometry args={[1, 24, 16]} /><Vinyl color={inner} /></mesh>
        </group>
      );
    case "cat":
      return (
        <group position={[side * 0.68, 2.3, 0]} rotation={[0, 0, -side * 0.4]}>
          <mesh scale={[1, 1, 0.55]} castShadow><coneGeometry args={[0.3, 0.55, 24]} /><Vinyl color={color} /></mesh>
          <mesh position={[0, -0.05, 0.1]} scale={[1, 1, 0.3]}><coneGeometry args={[0.18, 0.36, 24]} /><Vinyl color={inner} /></mesh>
        </group>
      );
    case "bunny":
      return (
        <group position={[side * 0.4, 2.75, -0.05]} rotation={[0, 0, -side * 0.12]}>
          <mesh scale={[0.19, 0.62, 0.12]} castShadow><sphereGeometry args={[1, 28, 18]} /><Vinyl color={color} /></mesh>
          <mesh position={[0, -0.03, 0.08]} scale={[0.1, 0.48, 0.05]}><sphereGeometry args={[1, 24, 16]} /><Vinyl color={inner} /></mesh>
        </group>
      );
    case "dog":
      return (
        <group position={[side * 1.08, 1.6, 0.05]} rotation={[0, 0, side * 0.22]}>
          <mesh scale={[0.17, 0.45, 0.26]} castShadow><sphereGeometry args={[1, 28, 18]} /><Vinyl color={color} /></mesh>
          <mesh position={[0, -0.03, 0.17]} scale={[0.1, 0.32, 0.1]}><sphereGeometry args={[1, 24, 16]} /><Vinyl color={inner} /></mesh>
        </group>
      );
  }
}

function Doll({ config, ears }: { config: CharacterConfig; ears: EarType }) {
  const c = (p: BodyPart) => partYarn(config, p).hex;
  const eye = yarnById(config.colors.eyes).hex;
  return (
    <group position={[0, -1.1, 0]}>
      {/* Head: wide, slightly squashed */}
      <mesh position={[0, 1.6, 0]} scale={[1.12, 0.9, 0.95]} castShadow><sphereGeometry args={[1, 64, 48]} /><Vinyl color={c("head")} /></mesh>
      {/* Pill eyes, wide and low */}
      {[-1, 1].map((s) => (
        <mesh key={`e${s}`} position={[s * 0.4, 1.42, 0.87]} rotation={[-0.15, s * 0.42, 0]}><capsuleGeometry args={[0.065, 0.1, 8, 16]} /><meshPhysicalMaterial color={eye} roughness={0.25} clearcoat={1} /></mesh>
      ))}
      {/* Blush patches */}
      {config.face.cheeks && [-1, 1].map((s) => (
        <mesh key={`c${s}`} position={[s * 0.66, 1.26, 0.72]} rotation={[0, s * 0.72, 0]} scale={[1, 0.75, 0.18]}><sphereGeometry args={[0.17, 24, 16]} /><meshPhysicalMaterial color={c("blush")} roughness={1} transparent opacity={0.85} /></mesh>
      ))}
      {/* Teardrop torso */}
      <mesh position={[0, 0.48, 0]} scale={[0.56, 0.52, 0.5]} castShadow><sphereGeometry args={[1, 40, 28]} /><Vinyl color={c("body")} /></mesh>
      <mesh position={[0, 0.82, 0]} scale={[0.38, 0.25, 0.36]}><sphereGeometry args={[1, 32, 20]} /><Vinyl color={c("body")} /></mesh>
      {/* Stubby arms close to the body */}
      <mesh position={[0.5, 0.55, 0.02]} rotation={[0, 0, 0.22]} castShadow><capsuleGeometry args={[0.12, 0.22, 8, 16]} /><Vinyl color={c("leftArm")} /></mesh>
      <mesh position={[-0.5, 0.55, 0.02]} rotation={[0, 0, -0.22]} castShadow><capsuleGeometry args={[0.12, 0.22, 8, 16]} /><Vinyl color={c("rightArm")} /></mesh>
      {/* Short rounded legs */}
      <mesh position={[0.2, 0.02, 0]} castShadow><capsuleGeometry args={[0.15, 0.18, 8, 16]} /><Vinyl color={c("leftLeg")} /></mesh>
      <mesh position={[-0.2, 0.02, 0]} castShadow><capsuleGeometry args={[0.15, 0.18, 8, 16]} /><Vinyl color={c("rightLeg")} /></mesh>
      {ears && <Ear type={ears} side={1} color={c("leftEar")} inner={c("leftInnerEar")} />}
      {ears && <Ear type={ears} side={-1} color={c("rightEar")} inner={c("rightInnerEar")} />}
    </group>
  );
}

export default function Doll3D({ config, ears }: { config: CharacterConfig; ears: EarType }) {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.6, 5.4], fov: 40 }} gl={{ toneMappingExposure: 1.05 }}>
      <hemisphereLight args={["#fff4ea", "#f3d9e6", 0.8]} />
      {/* Warm key */}
      <directionalLight position={[3, 5, 4]} intensity={1.6} color="#fff0e0" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      {/* Soft fill */}
      <directionalLight position={[-4, 2, 3]} intensity={0.5} color="#e8f0ff" />
      {/* Rim light for the glowing silhouette */}
      <directionalLight position={[0, 3, -5]} intensity={2.2} color="#ffe6f0" />
      <Environment>
        <Lightformer intensity={1.2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color="#ffe8d6" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
        <Lightformer intensity={1.5} color="#ffdff0" position={[0, 1, -6]} scale={[12, 4, 1]} />
      </Environment>
      <Doll config={config} ears={ears} />
      <ContactShadows position={[0, -1.3, 0]} opacity={0.28} blur={3} scale={5} far={2} />
      <OrbitControls enablePan={false} minDistance={3.5} maxDistance={8} minPolarAngle={0.5} maxPolarAngle={1.9} target={[0, 0.3, 0]} />
    </Canvas>
  );
}
