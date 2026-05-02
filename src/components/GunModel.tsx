import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { WeaponPlatform } from "../data/armory";
import { parts } from "../data/armory";
import type { BuildSelections } from "../lib/build";

type Props = {
  platform: WeaponPlatform;
  selections: BuildSelections;
};

export function GunViewer({ platform, selections }: Props) {
  return (
    <Canvas shadows gl={{ preserveDrawingBuffer: true }} camera={{ position: [4.4, 2.45, 4.7], fov: 34 }}>
      <color attach="background" args={["#101412"]} />
      <fog attach="fog" args={["#101412", 8, 16]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={3.1} castShadow shadow-mapSize={1024} />
      <spotLight position={[-3, 4, -2]} intensity={1.45} angle={0.45} penumbra={0.5} />
      <GunModel platform={platform} selections={selections} />
      <mesh position={[0, -1.2, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#161b18" roughness={0.84} metalness={0.08} />
      </mesh>
      <OrbitControls enablePan={false} minDistance={4.2} maxDistance={8.5} target={[0, 0.12, 0]} />
    </Canvas>
  );
}

function GunModel({ platform, selections }: Props) {
  const group = useRef<Group>(null);
  const selected = Object.fromEntries(
    Object.entries(selections).map(([slot, id]) => [slot, parts.find((part) => part.id === id)]),
  );
  const isPistol = platform.tags.includes("pistol");
  const short = platform.tags.includes("sbr") || selected.barrel?.tags.includes("short_barrel");
  const length = isPistol ? 1.35 : short ? 2.65 : 3.35;
  const receiverLength = isPistol ? 1.05 : 1.35;
  const barrelStart = receiverLength / 2 + 0.12;
  const barrelLength = isPistol ? 0.82 : short ? 1.42 : 1.98;

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={group} position={[isPistol ? 0 : -0.25, 0.28, 0]} rotation={[0, -0.25, 0]} scale={1.12}>
      <PartBox position={[0, 0, 0]} scale={[receiverLength, 0.42, 0.28]} color="#28302c" />
      <PartBox position={[0.08, 0.31, 0]} scale={[receiverLength * 0.82, 0.16, 0.22]} color="#1d2322" />

      <Barrel x={barrelStart + barrelLength / 2} length={barrelLength} radius={isPistol ? 0.055 : 0.07} color={selected.barrel?.color ?? "#525a51"} />

      {!isPistol && (
        <PartBox
          position={[barrelStart + barrelLength * 0.34, 0.02, 0]}
          scale={[barrelLength * 0.68, 0.34, 0.34]}
          color={selected.handguard?.color ?? "#3a413b"}
        />
      )}

      {selected.muzzle && (
        <Barrel
          x={barrelStart + barrelLength + (selected.muzzle.tags.includes("suppressor") ? 0.34 : 0.12)}
          length={selected.muzzle.tags.includes("suppressor") ? 0.68 : 0.24}
          radius={selected.muzzle.tags.includes("suppressor") ? 0.11 : 0.082}
          color={selected.muzzle.color ?? "#202528"}
        />
      )}

      {!isPistol && (
        <>
          <PartBox position={[-receiverLength / 2 - 0.62, -0.02, 0]} scale={[1.08, 0.28, 0.24]} color={selected.stock?.color ?? "#303632"} />
          <PartBox position={[-receiverLength / 2 - 1.08, -0.04, 0]} scale={[0.18, 0.52, 0.36]} color={selected.stock?.color ?? "#303632"} />
        </>
      )}

      <group rotation={[0, 0, isPistol ? -0.26 : -0.42]} position={[isPistol ? -0.28 : -0.18, -0.48, 0]}>
        <PartBox position={[0, 0, 0]} scale={[isPistol ? 0.28 : 0.34, isPistol ? 0.84 : 0.72, 0.22]} color={selected.pistolGrip?.color ?? "#202424"} />
      </group>

      <group rotation={[0, 0, isPistol ? -0.05 : -0.18]} position={[isPistol ? 0.14 : 0.38, -0.62, 0]}>
        <PartBox
          position={[0, 0, 0]}
          scale={[isPistol ? 0.24 : 0.34, selected.magazine?.tags.includes("extended_mag") ? 1.05 : isPistol ? 0.62 : 0.92, 0.2]}
          color={selected.magazine?.color ?? "#22272a"}
        />
      </group>

      {selected.opticMount && (
        <PartBox position={[isPistol ? 0.08 : 0.04, isPistol ? 0.58 : 0.58, 0]} scale={[isPistol ? 0.42 : 0.78, 0.1, 0.2]} color={selected.opticMount.color ?? "#1b2022"} />
      )}

      {selected.optic && (
        <group position={[isPistol ? 0.12 : 0.24, isPistol ? 0.76 : 0.78, 0]}>
          {selected.optic.tags.includes("magnified") ? (
            <>
              <Barrel x={0} length={0.62} radius={0.13} color={selected.optic.color ?? "#161b1d"} />
              <PartBox position={[0, -0.12, 0]} scale={[0.18, 0.18, 0.12]} color="#101416" />
            </>
          ) : (
            <PartBox position={[0, 0, 0]} scale={[0.38, 0.22, 0.24]} color={selected.optic.color ?? "#15191c"} />
          )}
        </group>
      )}

      {selected.underbarrelAdapter && (
        <PartBox position={[barrelStart + barrelLength * 0.34, -0.25, 0]} scale={[0.58, 0.06, 0.24]} color={selected.underbarrelAdapter.color ?? "#24292c"} />
      )}

      {selected.sideRailAdapter && (
        <PartBox position={[barrelStart + barrelLength * 0.42, 0.05, -0.24]} scale={[0.5, 0.08, 0.08]} color={selected.sideRailAdapter.color ?? "#24292c"} />
      )}

      {selected.foregrip && (
        <group rotation={[0, 0, selected.foregrip.id.includes("angled") ? -0.45 : 0]} position={[barrelStart + barrelLength * 0.38, -0.58, 0]}>
          <PartBox position={[0, 0, 0]} scale={[0.2, 0.55, 0.18]} color={selected.foregrip.color ?? "#1e2326"} />
        </group>
      )}

      {selected.laser && (
        <PartBox position={[barrelStart + barrelLength * 0.48, 0.23, -0.31]} scale={[0.36, 0.14, 0.16]} color={selected.laser.color ?? "#363126"} />
      )}

      {selected.tactical && (
        <Barrel x={barrelStart + barrelLength * 0.45} length={0.38} radius={0.09} color={selected.tactical.color ?? "#15191c"} z={isPistol ? -0.2 : 0.32} y={isPistol ? -0.04 : 0.02} />
      )}

      <PartBox position={[length * 0.12, -1.13, 0]} scale={[length + 0.8, 0.04, 1.2]} color="#222820" opacity={0.45} />
    </group>
  );
}

function PartBox({
  position,
  scale,
  color,
  opacity = 1,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity?: number;
}) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.34} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}

function Barrel({ x, length, radius, color, y = 0.05, z = 0 }: { x: number; length: number; radius: number; color: string; y?: number; z?: number }) {
  return (
    <mesh position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, length, 28]} />
      <meshStandardMaterial color={color} roughness={0.52} metalness={0.62} />
    </mesh>
  );
}
