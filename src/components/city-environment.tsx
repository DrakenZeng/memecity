"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box } from "./city-primitives";
import { InstanceBoxes, type InstanceBox } from "./metropolis-buildings";
import { type CityMoment } from "@/lib/city-life";

function Tree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0.08, z]} scale={scale}>
      <Box position={[0, 0.24, 0]} size={[0.1, 0.48, 0.1]} color="#715147" />
      <mesh position={[0, 0.7, 0]}>
        <coneGeometry args={[0.43, 1.05, 6]} />
        <meshStandardMaterial color="#32645d" />
      </mesh>
      <mesh position={[0, 1.06, 0]}>
        <coneGeometry args={[0.3, 0.7, 6]} />
        <meshStandardMaterial color="#39796a" />
      </mesh>
    </group>
  );
}
function Bench({
  x,
  z,
  rotation = 0,
}: {
  x: number;
  z: number;
  rotation?: number;
}) {
  return (
    <group position={[x, 0.14, z]} rotation={[0, rotation, 0]}>
      <Box position={[0, 0.2, 0]} size={[1.05, 0.08, 0.35]} color="#92705c" />
      <Box
        position={[0, 0.48, -0.17]}
        size={[1.05, 0.43, 0.06]}
        color="#a78164"
      />
      {[-0.4, 0.4].map((a) => (
        <Box
          key={a}
          position={[a, 0.08, 0]}
          size={[0.06, 0.3, 0.3]}
          color="#34414a"
        />
      ))}
    </group>
  );
}
function Lamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.05, z]}>
      <Box position={[0, 0.7, 0]} size={[0.045, 1.4, 0.045]} color="#606477" />
      <Box
        position={[0, 1.42, 0]}
        size={[0.22, 0.06, 0.22]}
        color="#f9dba6"
        glow
      />
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.37, 24]} />
        <meshBasicMaterial
          color="#e4c58c"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
function Fountain({ paused }: { paused: boolean }) {
  const water = useRef<THREE.Group>(null),
    t = useRef(0);
  useFrame((_, dt) => {
    if (paused) return;
    t.current += Math.min(dt, 0.05);
    water.current?.children.forEach((drop, i) => {
      const p = (t.current * 0.55 + i / 12) % 1;
      const angle = i * 2.4;
      drop.position.set(
        Math.cos(angle) * p * 0.65,
        0.65 + Math.sin(p * Math.PI) * 1.1,
        Math.sin(angle) * p * 0.65,
      );
      drop.scale.setScalar(0.55 + Math.sin(p * Math.PI) * 0.45);
    });
  });
  return (
    <group position={[-3.5, 0.08, 3.3]}>
      <mesh>
        <cylinderGeometry args={[1.05, 1.12, 0.28, 48]} />
        <meshStandardMaterial color="#4f566e" />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.04, 48]} />
        <meshBasicMaterial color="#318fa8" transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.3, 0.7, 16]} />
        <meshStandardMaterial color="#a1a7ba" />
      </mesh>
      <group ref={water}>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshBasicMaterial color="#8ae5ec" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.68, 0.71, 48]} />
        <meshBasicMaterial color="#85e2e4" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
function Cafe() {
  return (
    <group position={[-6, 0.08, 5.7]}>
      <Box position={[0, 0.6, 0]} size={[1.9, 1.2, 1.35]} color="#513b4d" />
      <Box position={[0, 1.25, 0]} size={[2.1, 0.15, 1.55]} color="#c2869c" />
      <Box
        position={[0, 0.6, 0.69]}
        size={[1.35, 0.6, 0.02]}
        color="#f2c789"
        glow
      />
      {Array.from({ length: 7 }, (_, i) => (
        <Box
          key={i}
          position={[-0.9 + i * 0.3, 1.04, 1]}
          size={[0.3, 0.08, 0.65]}
          color={i % 2 ? "#e3c6a0" : "#936d93"}
          rotation={[-0.15, 0, 0]}
        />
      ))}
      <Box
        position={[0.7, 0.35, 0.73]}
        size={[0.3, 0.7, 0.08]}
        color="#281d30"
      />
      {[-1.1, 1.1].map((x) => (
        <group key={x} position={[x, 0, -1.2]}>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.08, 16]} />
            <meshStandardMaterial color="#b88e73" />
          </mesh>
          <Box
            position={[0, 0.2, 0]}
            size={[0.06, 0.4, 0.06]}
            color="#636070"
          />
          {[-0.48, 0.48].map((z) => (
            <Box
              key={z}
              position={[0, 0.17, z]}
              size={[0.29, 0.34, 0.28]}
              color="#897385"
            />
          ))}
        </group>
      ))}
    </group>
  );
}
function TokenStatue({ paused }: { paused: boolean }) {
  const coin = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!paused && coin.current) coin.current.rotation.y += dt * 0.6;
  });
  return (
    <group position={[4.7, 0.1, 3.1]}>
      <Box position={[0, 0.18, 0]} size={[1.2, 0.36, 1.3]} color="#36344d" />
      <Box
        position={[0, 0.39, 0]}
        size={[1.25, 0.05, 1.4]}
        color="#a594ff"
        glow
      />
      <group ref={coin} position={[0, 1.2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.14, 32]} />
          <meshStandardMaterial
            color="#e9c68c"
            metalness={0.6}
            roughness={0.3}
            emissive="#e9c68c"
            emissiveIntensity={0.12}
          />
        </mesh>
        <Box position={[0, 0, 0.09]} size={[0.13, 0.6, 0.03]} color="#6a4c3b" />
        <Box position={[0, 0, 0.09]} size={[0.4, 0.12, 0.04]} color="#6a4c3b" />
      </group>
    </group>
  );
}
function Traffic({ paused }: { paused: boolean }) {
  const cars = useRef<THREE.Group>(null),
    signal = useRef<THREE.Mesh>(null),
    time = useRef(0);
  const distances = useRef(Array.from({ length: 11 }, (_, i) => (i * 64) / 11));
  useFrame((_, dt) => {
    if (paused) return;
    const delta = Math.min(dt, 0.05);
    time.current += delta;
    const red = time.current % 15 < 5;
    if (signal.current)
      (signal.current.material as THREE.MeshBasicMaterial).color.set(
        red ? "#fa7c92" : "#77dfac",
      );
    cars.current?.children.forEach((car, i) => {
      let d = distances.current[i] % 64;
      const stopping = red && d > 38.7 && d < 39.4;
      if (!stopping) distances.current[i] += delta * (i === 0 ? 0.6 : 1.05);
      d = distances.current[i] % 64;
      if (d < 16) {
        car.position.set(-8 + d, 0.3, -8);
        car.rotation.y = Math.PI / 2;
      } else if (d < 32) {
        car.position.set(8, 0.3, -8 + d - 16);
        car.rotation.y = 0;
      } else if (d < 48) {
        car.position.set(8 - (d - 32), 0.3, 8);
        car.rotation.y = -Math.PI / 2;
      } else {
        car.position.set(-8, 0.3, 8 - (d - 48));
        car.rotation.y = Math.PI;
      }
    });
  });
  const colors = [
    "#8cb9cb",
    "#efc36b",
    "#b4a0d9",
    "#db8b9e",
    "#87c7b3",
    "#c1bad5",
  ];
  return (
    <>
      <group ref={cars}>
        {Array.from({ length: 11 }, (_, i) => (
          <group key={i}>
            <Box
              position={[0, 0, 0]}
              size={[i === 0 ? 0.48 : 0.33, 0.2, i === 0 ? 1.15 : 0.67]}
              color={colors[i % 6]}
            />
            <Box
              position={[0, 0.19, -0.03]}
              size={[
                i === 0 ? 0.44 : 0.27,
                i === 0 ? 0.34 : 0.18,
                i === 0 ? 0.95 : 0.34,
              ]}
              color={i === 0 ? "#7397ba" : "#8da7bc"}
            />
            {i !== 0 && i % 3 === 1 && (
              <Box
                position={[0, 0.32, 0]}
                size={[0.14, 0.045, 0.12]}
                color="#ffe49b"
                glow
              />
            )}
            {[-1, 1].map((side) => (
              <group key={side}>
                <Box
                  position={[side * 0.12, 0.02, i === 0 ? 0.59 : 0.35]}
                  size={[0.07, 0.06, 0.02]}
                  color="#ffebc0"
                  glow
                />
                <Box
                  position={[side * 0.12, 0.02, i === 0 ? -0.59 : -0.35]}
                  size={[0.07, 0.04, 0.02]}
                  color="#eb6a87"
                  glow
                />
                {[-1, 1].map((end) => (
                  <mesh
                    key={end}
                    position={[
                      side * (i === 0 ? 0.24 : 0.17),
                      -0.1,
                      end * (i === 0 ? 0.38 : 0.2),
                    ]}
                    rotation={[0, 0, Math.PI / 2]}
                  >
                    <cylinderGeometry args={[0.085, 0.085, 0.055, 10]} />
                    <meshStandardMaterial color="#161923" />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        ))}
      </group>
      <group position={[1.1, 0.1, 7.3]}>
        <Box position={[0, 0.65, 0]} size={[0.06, 1.3, 0.06]} color="#53576d" />
        <Box position={[0, 1.4, 0]} size={[0.23, 0.5, 0.18]} color="#202235" />
        <mesh ref={signal} position={[0, 1.5, 0.1]}>
          <sphereGeometry args={[0.065, 10, 10]} />
          <meshBasicMaterial color="#77dfac" />
        </mesh>
      </group>
    </>
  );
}
function Drone({ paused }: { paused: boolean }) {
  const drone = useRef<THREE.Group>(null),
    rotors = useRef<THREE.Group>(null),
    time = useRef(0);
  useFrame((_, dt) => {
    if (paused) return;
    time.current += Math.min(dt, 0.05);
    const t = time.current;
    if (drone.current) {
      drone.current.position.set(
        Math.sin(t * 0.15) * 6,
        3.1 + Math.sin(t) * 0.15,
        2 + Math.cos(t * 0.15) * 4,
      );
      drone.current.rotation.y = -t * 0.15;
    }
    rotors.current?.children.forEach((r) => (r.rotation.y += dt * 25));
  });
  return (
    <group ref={drone}>
      <Box position={[0, 0, 0]} size={[0.25, 0.1, 0.25]} color="#c5becc" />
      <Box position={[0, -0.2, 0]} size={[0.18, 0.24, 0.18]} color="#e1bb83" />
      <group ref={rotors}>
        {[
          [-0.25, -0.25],
          [0.25, 0.25],
          [-0.25, 0.25],
          [0.25, -0.25],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0.03, z]}>
            <Box
              position={[0, 0, 0]}
              size={[0.35, 0.02, 0.035]}
              color="#8682a4"
            />
          </group>
        ))}
      </group>
      <mesh position={[0, -0.34, 0]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#86e4a8" />
      </mesh>
    </group>
  );
}
function MomentEffect({
  moment,
  paused,
}: {
  moment: CityMoment;
  paused: boolean;
}) {
  const refs = useRef<THREE.Group>(null),
    time = useRef(0);
  useFrame((_, dt) => {
    if (paused) return;
    time.current += Math.min(dt, 0.05);
    refs.current?.children.forEach((item, i) => {
      const t = (time.current * 0.4 + i / 24) % 1;
      if (moment.kind === "coins") {
        item.position.set(
          -3.5 + Math.sin(i * 4) * t * 2,
          0.4 + Math.sin(t * Math.PI) * 3,
          3.3 + Math.cos(i * 4) * t * 2,
        );
        item.rotation.y += dt * 4;
      } else if (moment.kind === "party") {
        item.position.set(
          Math.sin(i * 2.4) * (0.5 + t * 2.5),
          0.2 + Math.sin(t * Math.PI) * 1.2,
          4 + Math.cos(i * 2.4) * (0.5 + t * 2.5),
        );
        item.scale.setScalar(1 - t * 0.7);
      } else {
        item.position.set(
          8 - time.current * 1.5 + i * 0.15,
          8 - time.current * 0.2,
          -5 + i * 0.06,
        );
        item.scale.setScalar(1 - i / 30);
      }
    });
  });
  return (
    <group ref={refs}>
      {Array.from({ length: 24 }, (_, i) => (
        <mesh key={i}>
          <sphereGeometry
            args={[moment.kind === "coins" ? 0.09 : 0.055, 8, 8]}
          />
          <meshBasicMaterial
            color={
              moment.kind === "coins"
                ? "#f6d489"
                : ["#a594ff", "#ff729e", "#86e4a8"][i % 3]
            }
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
function CentralRoads() {
  const batches = useMemo(() => {
    const roads: InstanceBox[] = [],
      paint: InstanceBox[] = [];
    for (const n of [-8, 8]) {
      roads.push(
        { position: [n, 0.04, 0], size: [1.1, 0.04, 17], color: "#222638" },
        { position: [0, 0.04, n], size: [17, 0.04, 1.1], color: "#222638" },
      );
      for (let i = 0; i < 22; i++) {
        const v = i * 0.75 - 7.9;
        paint.push(
          {
            position: [n, 0.067, v],
            size: [0.025, 0.01, 0.28],
            color: "#a99eae",
          },
          {
            position: [v, 0.067, n],
            size: [0.28, 0.01, 0.025],
            color: "#a99eae",
          },
        );
      }
    }
    return { roads, paint };
  }, []);
  return (
    <>
      <InstanceBoxes items={batches.roads} />
      <InstanceBoxes items={batches.paint} />
    </>
  );
}
export default function CityEnvironment({
  paused,
  moment,
}: {
  paused: boolean;
  moment: CityMoment | null;
}) {
  return (
    <>
      {/* Ring road. Everything inside is a pedestrian district. */}
      <CentralRoads />
      <Box position={[0, 0.04, 3.05]} size={[14, 0.035, 7.8]} color="#252334" />
      <Box
        position={[0, 0.065, 1.75]}
        size={[1.7, 0.025, 5.8]}
        color="#3a3447"
      />
      {[-5.4, -2.7, 0, 2.7, 5.4].map((x) => (
        <Box
          key={x}
          position={[x, 0.068, 4.9]}
          size={[0.025, 0.01, 7.3]}
          color="#42394d"
        />
      ))}
      <Box position={[-5.7, 0.07, 0.4]} size={[3.1, 0.1, 2]} color="#203d37" />
      <Fountain paused={paused} />
      <Cafe />
      <TokenStatue paused={paused} />
      {[
        [-6.5, -0.1],
        [-5.4, 0.15],
        [-6.7, 1.2],
        [-7, 3.4],
        [7, 3.5],
        [-4.6, 6.8],
        [4.5, 6.7],
        [-7, -6],
        [7, -6],
        [-3, -7],
        [3, -7],
      ].map(([x, z], i) => (
        <Tree key={i} x={x} z={z} scale={i % 3 === 0 ? 1.1 : 0.8} />
      ))}
      <Bench x={-4.7} z={3.3} rotation={Math.PI / 2} />
      <Bench x={-2} z={3.3} rotation={-Math.PI / 2} />
      <Bench x={-5.6} z={0.5} />
      <Bench x={3} z={0.2} />
      <Bench x={5.9} z={5.8} />
      {[
        [-6.8, 4.8],
        [-2, 6.2],
        [2.2, 6.2],
        [6.8, 4.8],
        [-3, -0.5],
        [3, -0.5],
      ].map(([x, z], i) => (
        <Lamp key={i} x={x} z={z} />
      ))}
      {/* Bus shelter and open-air music corner. */}
      <group position={[6.5, 0.1, 6.5]}>
        <Box position={[0, 0.88, 0]} size={[1.8, 0.07, 0.8]} color="#867baa" />
        {[-0.8, 0.8].map((x) => (
          <Box
            key={x}
            position={[x, 0.45, 0]}
            size={[0.04, 0.9, 0.04]}
            color="#797588"
          />
        ))}
        <Box
          position={[0, 0.4, -0.3]}
          size={[1.65, 0.75, 0.025]}
          color="#4f6d83"
        />
        <Box
          position={[0, 0.25, 0.03]}
          size={[1.4, 0.07, 0.25]}
          color="#af8f7c"
        />
      </group>
      <group position={[2.1, 0.1, 5.9]}>
        {[-0.7, 0.7].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <Box
              position={[0, 0.35, 0]}
              size={[0.4, 0.7, 0.32]}
              color="#29283e"
            />
            <mesh position={[0, 0.4, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
              <meshStandardMaterial color="#bc8dd6" />
            </mesh>
          </group>
        ))}
        <Box
          position={[0, 0.13, 0]}
          size={[0.65, 0.25, 0.45]}
          color="#715988"
        />
      </group>
      {/* The cat belongs to the café, not to a token. */}
      <group position={[-4.7, 0.27, 5.8]}>
        <mesh>
          <sphereGeometry args={[0.18, 12, 8]} />
          <meshStandardMaterial color="#d4a67a" />
        </mesh>
        <mesh position={[0, 0.15, 0.15]}>
          <sphereGeometry args={[0.13, 12, 8]} />
          <meshStandardMaterial color="#d4a67a" />
        </mesh>
        {[-0.09, 0.09].map((x) => (
          <mesh key={x} position={[x, 0.29, 0.14]}>
            <coneGeometry args={[0.06, 0.14, 3]} />
            <meshStandardMaterial color="#d4a67a" />
          </mesh>
        ))}
      </group>
      <Traffic paused={paused} />
      <Drone paused={paused} />
      {moment && (
        <MomentEffect key={moment.key} moment={moment} paused={paused} />
      )}
    </>
  );
}
