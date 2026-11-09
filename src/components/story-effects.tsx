"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box } from "./city-primitives";
import type { StoryEffect } from "@/lib/stories";
export default function StoryEffects({
  effect,
  color,
  paused,
}: {
  effect: StoryEffect;
  color: string;
  paused: boolean;
}) {
  const animated = useRef<THREE.Group>(null),
    t = useRef(0),
    moving = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (paused || !animated.current) return;
    t.current += Math.min(dt, 0.05);
    animated.current.position.y = Math.sin(t.current * 2) * 0.06;
    animated.current.rotation.y = Math.sin(t.current * 0.7) * 0.12;
    if (effect === "coaster") {
      animated.current.rotation.z = Math.sin(t.current * 5) * 0.15;
    }
    if (moving.current) {
      moving.current.position.y =
        effect === "rocket"
          ? 0.8 + (Math.sin(t.current * 0.9) + 1) * 0.25
          : effect === "rain"
            ? -((t.current * 0.7) % 0.55)
            : 0.1 + Math.sin(t.current * 3) * 0.1;
    }
  });
  const panel = (c: string, w = 0.65, h = 0.45) => (
    <Box position={[0.65, 0.25, 0]} size={[w, h, 0.08]} color={c} />
  );
  return (
    <group ref={animated}>
      {effect === "rain" && (
        <>
          <mesh position={[0, 1.18, 0]}>
            <coneGeometry args={[0.65, 0.25, 12, 1, true]} />
            <meshStandardMaterial color="#99b9d3" side={THREE.DoubleSide} />
          </mesh>
          <Box
            position={[0.2, 0.75, 0]}
            size={[0.025, 0.85, 0.025]}
            color="#ddcdae"
          />
          <group ref={moving}>
            {Array.from({ length: 12 }, (_, i) => (
              <Box
                key={i}
                position={[
                  Math.sin(i * 2.4) * 0.85,
                  0.3 + (i % 4) * 0.29,
                  Math.cos(i * 2.4) * 0.65,
                ]}
                size={[0.012, 0.13, 0.012]}
                color="#94c8e5"
                glow
              />
            ))}
          </group>
        </>
      )}
      {effect === "blanket" && (
        <>
          <group position={[1.2, 0, -0.45]}>
            <Box
              position={[0, 0.4, 0]}
              size={[0.9, 0.8, 0.55]}
              color="#c9b0ad"
            />
            <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.8, 0.4, 4]} />
              <meshStandardMaterial color="#e5d5c2" />
            </mesh>
          </group>
          <Box
            position={[0, 0.27, 0.15]}
            size={[0.7, 0.38, 0.26]}
            color="#e1b8b0"
          />
          <Box
            position={[0.8, 0.35, 0]}
            size={[0.45, 0.55, 0.12]}
            color="#f0e6d8"
          />
          <Box
            position={[0.8, 0.36, 0.08]}
            size={[0.3, 0.07, 0.025]}
            color="#e38591"
          />
          <Box
            position={[0.8, 0.36, 0.08]}
            size={[0.07, 0.3, 0.025]}
            color="#e38591"
          />
        </>
      )}
      {["rocket", "glasses"].includes(effect) && (
        <>
          <Box
            position={[0, 0.06, 0.26]}
            size={[0.42, 0.12, 0.035]}
            color="#292235"
          />
          {effect === "rocket" && (
            <group
              ref={moving}
              position={[0.7, 0.8, 0]}
              rotation={[0, 0, -0.25]}
            >
              <mesh>
                <capsuleGeometry args={[0.14, 0.5, 4, 8]} />
                <meshStandardMaterial color="#eadac9" />
              </mesh>
              <mesh position={[0, 0.43, 0]}>
                <coneGeometry args={[0.16, 0.25, 8]} />
                <meshStandardMaterial color={color} />
              </mesh>
              <mesh position={[0, -0.45, 0]}>
                <coneGeometry args={[0.12, 0.3, 8]} />
                <meshBasicMaterial color="#ffbd77" />
              </mesh>
            </group>
          )}
        </>
      )}
      {effect === "fishing" && (
        <>
          <mesh position={[0.8, -0.02, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.5, 24]} />
            <meshStandardMaterial color="#70b5cf" />
          </mesh>
          <Box
            position={[0.45, 0.45, 0.3]}
            size={[0.025, 1, 0.025]}
            rotation={[0, 0, -0.65]}
            color="#b9a17c"
          />
          <Box
            position={[0.76, 0.3, 0.3]}
            size={[0.008, 0.65, 0.008]}
            color="#e0d8cb"
          />
        </>
      )}
      {effect === "chair" && (
        <group position={[0.8, 0, 0]}>
          <Box
            position={[0, 0.2, 0]}
            size={[0.45, 0.08, 0.4]}
            color="#bca0d1"
          />
          <Box
            position={[0, 0.45, -0.15]}
            size={[0.45, 0.5, 0.08]}
            color="#bca0d1"
          />
          {[-0.17, 0.17].map((x) => (
            <Box
              key={x}
              position={[x, 0.08, 0]}
              size={[0.05, 0.22, 0.3]}
              color="#88718b"
            />
          ))}
        </group>
      )}
      {["supply", "parcel"].includes(effect) &&
        [0, 1, 2].map((i) => (
          <group key={i} position={[0.6 + i * 0.24, 0.12, (i % 2) * 0.3]}>
            <Box
              position={[0, 0, 0]}
              size={[0.3, 0.27, 0.3]}
              color={i === 1 ? "#a5c8b0" : "#d5b98d"}
            />
            <Box
              position={[0, 0.14, 0]}
              size={[0.045, 0.012, 0.31]}
              color="#f7e4c8"
            />
          </group>
        ))}
      {effect === "battery" && (
        <group position={[0.7, 0.4, 0]}>
          <Box position={[0, 0, 0]} size={[0.35, 0.7, 0.2]} color="#4f5e64" />
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              position={[0, -0.2 + i * 0.2, 0.11]}
              size={[0.25, 0.12, 0.025]}
              color={i === 0 ? "#f1bc7d" : "#95d6ae"}
              glow
            />
          ))}
          <Box
            position={[0, 0.39, 0]}
            size={[0.16, 0.08, 0.13]}
            color="#acbbc1"
          />
        </group>
      )}
      {effect === "barrier" && (
        <>
          <Box
            position={[0.7, 0.3, 0]}
            size={[0.07, 0.6, 0.07]}
            color="#b8aaa0"
          />
          <Box
            position={[0.7, 0.58, 0]}
            size={[1, 0.12, 0.1]}
            color="#ea979d"
          />
          <mesh position={[0.7, 0.85, 0]}>
            <sphereGeometry args={[0.12, 12, 8]} />
            <meshBasicMaterial color="#ff7e8c" />
          </mesh>
        </>
      )}
      {effect === "furnace" && (
        <group position={[0.8, 0.15, 0]}>
          <Box position={[0, 0, 0]} size={[0.55, 0.32, 0.5]} color="#746572" />
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[(i - 1) * 0.13, 0.3, 0]}>
              <coneGeometry args={[0.13, 0.5 + i * 0.06, 7]} />
              <meshBasicMaterial color={i === 1 ? "#ffdd90" : "#ee9b7b"} />
            </mesh>
          ))}
        </group>
      )}
      {effect === "letters" && (
        <group position={[0.7, 0.25, 0]}>
          <Box position={[0, 0, 0]} size={[0.07, 0.6, 0.07]} color="#b59e8c" />
          <Box position={[0, 0.3, 0]} size={[0.4, 0.25, 0.3]} color="#a0bac8" />
          <Box
            position={[0, 0.32, 0.16]}
            size={[0.29, 0.025, 0.015]}
            color="#41374b"
          />
          <Box
            position={[-0.1, 0.55, 0.05]}
            size={[0.28, 0.17, 0.025]}
            rotation={[0, 0, 0.2]}
            color="#fff0d5"
          />
        </group>
      )}
      {["research", "debate"].includes(effect) && (
        <>
          {panel(effect === "debate" ? "#b7d0b5" : "#b2aecf")}
          <Box
            position={[0.65, 0.02, 0]}
            size={[0.07, 0.4, 0.07]}
            color="#b3a6aa"
          />
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              position={[0.65, 0.14 + i * 0.1, 0.05]}
              size={[0.45 - i * 0.07, 0.02, 0.015]}
              color="#eadfd9"
              glow
            />
          ))}
        </>
      )}
      {effect === "coffee" && (
        <group position={[0.65, 0.1, 0.1]}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.06, 16]} />
            <meshStandardMaterial color="#d0b48e" />
          </mesh>
          <Box position={[0, 0, 0]} size={[0.08, 0.4, 0.08]} color="#a29292" />
          {[-0.15, 0.15].map((x) => (
            <mesh key={x} position={[x, 0.27, 0]}>
              <cylinderGeometry args={[0.06, 0.05, 0.12, 10]} />
              <meshStandardMaterial color="#ede1d0" />
            </mesh>
          ))}
        </group>
      )}
      {effect === "birthday" && (
        <group position={[0.7, 0.15, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.24, 16]} />
            <meshStandardMaterial color="#e7b2c7" />
          </mesh>
          <Box
            position={[0, 0.26, 0]}
            size={[0.035, 0.25, 0.035]}
            color="#f5e7d2"
          />
          <mesh position={[0, 0.42, 0]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshBasicMaterial color="#ffd78b" />
          </mesh>
        </group>
      )}
      {effect === "megaphone" && (
        <group position={[0.7, 0.3, 0]} rotation={[0, 0, -0.35]}>
          <Box
            position={[0, -0.12, 0]}
            size={[0.06, 0.3, 0.07]}
            color="#8f7c9b"
          />
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.07, 0.4, 12, 1, true]} />
            <meshStandardMaterial color="#e4c492" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
      {effect === "alarm" && (
        <group position={[0.7, 0.3, 0]}>
          <Box position={[0, 0, 0]} size={[0.4, 0.5, 0.3]} color="#8f9caf" />
          <mesh position={[0, 0.37, 0]}>
            <sphereGeometry args={[0.15, 12, 8]} />
            <meshBasicMaterial color="#efb278" />
          </mesh>
        </group>
      )}
      {effect === "hardhat" && (
        <mesh position={[0, 0.31, 0]}>
          <sphereGeometry args={[0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#edc46d" />
        </mesh>
      )}
      {effect === "cobweb" &&
        Array.from({ length: 6 }, (_, i) => (
          <Box
            key={i}
            position={[0.7, 0.5, 0]}
            size={[0.8, 0.012, 0.012]}
            rotation={[0, 0, (i * Math.PI) / 6]}
            color="#c8c2cd"
          />
        ))}
      {effect === "coaster" && (
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0.3, 0]}>
          <torusGeometry args={[0.8, 0.035, 6, 24]} />
          <meshStandardMaterial color="#d6a6c4" />
        </mesh>
      )}
      {effect === "sailboat" && (
        <group position={[0.75, 0.1, 0]}>
          <Box position={[0, 0, 0]} size={[0.6, 0.12, 0.25]} color="#91becd" />
          <Box
            position={[0, 0.3, 0]}
            size={[0.025, 0.6, 0.025]}
            color="#dfcdb2"
          />
          <mesh position={[0.15, 0.35, 0]}>
            <coneGeometry args={[0.25, 0.45, 3]} />
            <meshStandardMaterial color="#f4e3c8" />
          </mesh>
        </group>
      )}
      {effect === "sleep" && (
        <mesh position={[0.45, 0.7, 0]} rotation={[0, 0, -0.35]}>
          <torusGeometry args={[0.2, 0.05, 8, 20, Math.PI * 1.5]} />
          <meshBasicMaterial color="#c7bcf0" />
        </mesh>
      )}
      {effect === "confetti" &&
        Array.from({ length: 18 }, (_, i) => (
          <Box
            key={i}
            position={[
              Math.sin(i * 2.3) * 0.9,
              0.4 + (i % 5) * 0.23,
              Math.cos(i * 2.3) * 0.7,
            ]}
            size={[0.055, 0.08, 0.03]}
            rotation={[i, i * 0.3, i]}
            color={["#e4b5d1", "#a9d4c0", "#ead094"][i % 3]}
            glow
          />
        ))}
    </group>
  );
}
