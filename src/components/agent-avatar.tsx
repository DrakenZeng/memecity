"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Box } from "./city-primitives";
import type { StreetPose } from "@/lib/city-life";
export default function AgentAvatar({
  color,
  pose = "idle",
  paused = false,
  selected = false,
}: {
  color: string;
  pose?: StreetPose;
  paused?: boolean;
  selected?: boolean;
}) {
  const body = useRef<THREE.Group>(null),
    arms = useRef<THREE.Group>(null),
    legs = useRef<THREE.Group>(null),
    time = useRef(0);
  useFrame((_, delta) => {
    if (paused) return;
    time.current += Math.min(delta, 0.05);
    const t = time.current;
    if (body.current) {
      body.current.rotation.z =
        pose === "sleep" ? 0.18 : pose === "dance" ? Math.sin(t * 7) * 0.16 : 0;
      body.current.position.y =
        pose === "walking"
          ? Math.abs(Math.sin(t * 9)) * 0.07
          : pose === "dance"
            ? Math.abs(Math.sin(t * 6)) * 0.17
            : Math.sin(t * 2) * 0.025;
    }
    if (arms.current)
      arms.current.children.forEach((arm, i) => {
        arm.rotation.z =
          pose === "wave" && i === 1
            ? -1.3 + Math.sin(t * 10) * 0.35
            : pose === "dance"
              ? Math.sin(t * 7 + i) * 0.8
              : pose === "coffee" && i === 1
                ? -0.8
                : 0;
      });
    if (legs.current)
      legs.current.children.forEach((leg, i) => {
        leg.rotation.x =
          pose === "walking" ? Math.sin(t * 9 + i * Math.PI) * 0.6 : 0;
      });
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <circleGeometry args={[0.39, 24]} />
        <meshBasicMaterial
          color={selected ? color : "#080812"}
          transparent
          opacity={selected ? 0.4 : 0.35}
          depthWrite={false}
        />
      </mesh>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.475, 0]}>
          <ringGeometry args={[0.45, 0.49, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      )}
      <group ref={body}>
        <RoundedBox args={[0.56, 0.6, 0.44]} radius={0.16} smoothness={3}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={pose === "sleep" ? 0.06 : 0.35}
          />
        </RoundedBox>
        {[-0.13, 0.13].map((x) => (
          <Box
            key={x}
            position={[x, 0.035, 0.23]}
            size={[0.06, pose === "sleep" ? 0.025 : 0.115, 0.025]}
            color="#fff8e4"
            glow
          />
        ))}
        <Box
          position={[0, 0.38, 0]}
          size={[0.035, 0.17, 0.035]}
          color={color}
          glow
        />
        <mesh position={[0, 0.47, 0]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <group ref={arms}>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.32, 0.02, 0]}>
              <RoundedBox
                args={[0.12, 0.29, 0.15]}
                position={[0, -0.1, 0]}
                radius={0.05}
                smoothness={2}
              >
                <meshStandardMaterial color={color} />
              </RoundedBox>
            </group>
          ))}
        </group>
        <group ref={legs}>
          {[-0.16, 0.16].map((x) => (
            <group key={x} position={[x, -0.28, 0]}>
              <Box
                position={[0, -0.1, 0.02]}
                size={[0.14, 0.2, 0.2]}
                color={color}
              />
            </group>
          ))}
        </group>
        {pose === "coffee" && (
          <group position={[0.38, -0.03, 0.2]}>
            <mesh>
              <cylinderGeometry args={[0.08, 0.065, 0.17, 12]} />
              <meshStandardMaterial color="#f0d8b2" />
            </mesh>
            <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.065, 12]} />
              <meshBasicMaterial color="#533327" />
            </mesh>
          </group>
        )}
        {pose === "read" && (
          <Box
            position={[0, -0.08, 0.4]}
            size={[0.37, 0.24, 0.035]}
            color="#72c9df"
            glow
            rotation={[-0.25, 0, 0]}
          />
        )}
      </group>
    </group>
  );
}
