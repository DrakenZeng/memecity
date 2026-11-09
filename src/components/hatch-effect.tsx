"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Agent } from "@/lib/simulation";
import { GATE } from "@/lib/city-life";
import { hatchTravel, type HatchRun } from "@/lib/hatching";
import AgentAvatar from "./agent-avatar";
export default function HatchEffect({
  agent,
  run,
  children,
}: {
  agent: Agent;
  run: HatchRun;
  children?: React.ReactNode;
}) {
  const bot = useRef<THREE.Group>(null),
    rings = useRef<THREE.Group>(null),
    particles = useRef<THREE.Group>(null);
  useFrame(() => {
    const elapsed = performance.now() - run.startedAt;
    const travel = hatchTravel(elapsed);
    if (bot.current) {
      bot.current.visible = elapsed > 4400;
      bot.current.position.set(0, 0.64, GATE[1] + travel * (1.7 - GATE[1]));
      bot.current.rotation.y =
        travel > 0.95 ? Math.sin(elapsed * 0.003) * 0.2 : 0;
    }
    rings.current?.children.forEach((ring, i) => {
      const p = (elapsed / 1700 + i / 3) % 1;
      ring.scale.setScalar(0.6 + p * 0.7);
      (
        ring as THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>
      ).material.opacity =
        elapsed < 4300 ? (1 - p) * 0.65 : (1 - travel) * 0.35;
    });
    particles.current?.children.forEach((particle, i) => {
      const p = (elapsed / 1800 + i / 16) % 1;
      particle.position.set(
        Math.sin(i * 2.4) * (0.5 + travel * 0.3),
        0.2 + p * 1.8,
        GATE[1] + 0.35 + travel * 2,
      );
      particle.scale.setScalar(
        elapsed > 1400 && elapsed < 7800 ? (1 - p) * 0.7 : 0,
      );
    });
  });
  return (
    <group>
      <group ref={rings} position={[0, 0.09, GATE[1] + 0.5]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 0.74, 48]} />
            <meshBasicMaterial
              color={agent.color}
              transparent
              opacity={0.5}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      <group ref={particles}>
        {Array.from({ length: 16 }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? "#ffe8b7" : agent.color}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      <group ref={bot} visible={false}>
        <AgentAvatar color={agent.color} pose="walking" />
        {children}
      </group>
    </group>
  );
}
