import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { partYarn, yarnById, type BodyPart, type CharacterConfig } from "@/lib/character";

export type EarType = "human" | "dog" | "cat" | "bear" | "bunny" | null;

function Yarn({ color }: { color: string }) {
  return <meshStandardMaterial color={color} roughness={0.95} />;
}

// Doll faces +z; the doll's left side is +x (named from the doll's perspective).
function Ear({ type, side, color }: { type: Exclude<EarType, null>; side: 1 | -1; color: string }) {
  const m = <Yarn color={color} />;
  switch (type) {
    case "human":
      return <mesh position={[side * 0.98, 1.5, 0]} scale={[0.12, 0.2, 0.16]}><sphereGeometry args={[1, 24, 16]} />{m}</mesh>;
    case "bear":
      return <mesh position={[side * 0.62, 2.3, -0.05]} scale={[0.28, 0.28, 0.14]}><sphereGeometry args={[1, 24, 16]} />{m}</mesh>;
    case "cat":
      return <mesh position={[side * 0.55, 2.35, 0]} rotation={[0, 0, -side * 0.35]}><coneGeometry args={[0.28, 0.5, 4]} />{m}</mesh>;
    case "bunny":
      return <mesh position={[side * 0.35, 2.75, -0.05]} rotation={[0, 0, -side * 0.12]} scale={[0.17, 0.6, 0.1]}><sphereGeometry args={[1, 24, 16]} />{m}</mesh>;
    case "dog":
      return <mesh position={[side * 0.95, 1.55, 0]} rotation={[0, 0, side * 0.25]} scale={[0.16, 0.42, 0.24]}><sphereGeometry args={[1, 24, 16]} />{m}</mesh>;
  }
}

function Doll({ config, ears }: { config: CharacterConfig; ears: EarType }) {
  const c = (p: BodyPart) => partYarn(config, p).hex;
  const eye = yarnById(config.colors.eyes).hex;
  return (
    <group position={[0, -1.1, 0]}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]} scale={[1, 0.92, 0.95]} castShadow><sphereGeometry args={[0.95, 48, 32]} /><Yarn color={c("head")} /></mesh>
      {/* Sleepy eyes */}
      {[-1, 1].map((s) => (
        <mesh key={`e${s}`} position={[s * 0.32, 1.55, 0.86]} rotation={[0, s * 0.3, Math.PI]}><torusGeometry args={[0.09, 0.025, 8, 16, Math.PI]} /><meshStandardMaterial color={eye} /></mesh>
      ))}
      {/* Blush cheeks */}
      {config.face.cheeks && [-1, 1].map((s) => (
        <mesh key={`c${s}`} position={[s * 0.5, 1.38, 0.74]} rotation={[0, s * 0.55, 0]} scale={[1, 0.6, 0.2]}><sphereGeometry args={[0.12, 16, 12]} /><meshStandardMaterial color="#f29a9a" roughness={1} /></mesh>
      ))}
      {/* Body */}
      <mesh position={[0, 0.5, 0]} scale={[0.55, 0.5, 0.48]} castShadow><sphereGeometry args={[1, 32, 24]} /><Yarn color={c("body")} /></mesh>
      {/* Arms */}
      <mesh position={[0.55, 0.6, 0]} rotation={[0, 0, 0.35]} castShadow><capsuleGeometry args={[0.13, 0.35, 8, 16]} /><Yarn color={c("leftArm")} /></mesh>
      <mesh position={[-0.55, 0.6, 0]} rotation={[0, 0, -0.35]} castShadow><capsuleGeometry args={[0.13, 0.35, 8, 16]} /><Yarn color={c("rightArm")} /></mesh>
      {/* Legs */}
      <mesh position={[0.22, 0.05, 0]} castShadow><capsuleGeometry args={[0.15, 0.3, 8, 16]} /><Yarn color={c("leftLeg")} /></mesh>
      <mesh position={[-0.22, 0.05, 0]} castShadow><capsuleGeometry args={[0.15, 0.3, 8, 16]} /><Yarn color={c("rightLeg")} /></mesh>
      {ears && <Ear type={ears} side={1} color={c("leftEar")} />}
      {ears && <Ear type={ears} side={-1} color={c("rightEar")} />}
    </group>
  );
}

export default function Doll3D({ config, ears }: { config: CharacterConfig; ears: EarType }) {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.6, 5.2], fov: 40 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} castShadow />
      <Environment>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color="#ffe8d6" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      <Doll config={config} ears={ears} />
      <ContactShadows position={[0, -1.32, 0]} opacity={0.35} blur={2.5} scale={5} />
      <OrbitControls enablePan={false} minDistance={3.5} maxDistance={8} minPolarAngle={0.5} maxPolarAngle={1.9} target={[0, 0.3, 0]} />
    </Canvas>
  );
}
