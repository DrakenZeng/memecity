"use client";
import { memo, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box } from "./city-primitives";
import CityVisitors from "./city-visitors";
import MetropolisBuildings, {
  InstanceBoxes,
  type InstanceBox,
} from "./metropolis-buildings";
import { DISTRICTS, TRAFFIC_LOOPS, loopPoint } from "@/lib/metropolis";

function Forest({ trees }: { trees: [number, number, number][] }) {
  const leaves = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!leaves.current) return;
    const m = new THREE.Matrix4(),
      q = new THREE.Quaternion();
    trees.forEach(([x, z, s], i) => {
      m.compose(
        new THREE.Vector3(x, 0.7 * s, z),
        q,
        new THREE.Vector3(s, s, s),
      );
      leaves.current!.setMatrixAt(i, m);
      leaves.current!.setColorAt(
        i,
        new THREE.Color(["#31695c", "#3c7865", "#2b5756", "#477465"][i % 4]),
      );
    });
    leaves.current.instanceMatrix.needsUpdate = true;
    if (leaves.current.instanceColor)
      leaves.current.instanceColor.needsUpdate = true;
    leaves.current.computeBoundingSphere();
  }, [trees]);
  const trunks = useMemo(
    () =>
      trees.map(([x, z, s]) => ({
        position: [x, 0.25 * s, z] as [number, number, number],
        size: [0.1 * s, 0.5 * s, 0.1 * s] as [number, number, number],
        color: "#69534c",
      })),
    [trees],
  );
  return (
    <>
      <InstanceBoxes items={trunks} />
      <instancedMesh ref={leaves} args={[undefined, undefined, trees.length]}>
        <coneGeometry args={[0.45, 1.15, 6]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
    </>
  );
}
function Streets() {
  const batches = useMemo(() => {
    const paving: InstanceBox[] = [],
      paint: InstanceBox[] = [],
      posts: InstanceBox[] = [],
      lights: InstanceBox[] = [];
    const box = (
      target: InstanceBox[],
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      color: string,
    ) => target.push({ position: [x, y, z], size: [w, h, d], color });
    for (const district of DISTRICTS) {
      if (district.id === "genesis" || district.id === "waterfront") continue;
      const [x, z, w, d] = district.rect;
      box(
        paving,
        x + w / 2,
        0.045,
        z + d / 2,
        w,
        0.03,
        d,
        district.id === "gardens"
          ? "#253e37"
          : district.id === "market"
            ? "#302637"
            : "#242639",
      );
    }
    for (const x of [-28, -10, 10, 22]) {
      box(paving, x, 0.07, 0, 1.5, 0.045, 64, "#242a3c");
      for (let z = -31; z <= 31; z += 0.9)
        box(paint, x, 0.1, z, 0.035, 0.01, 0.35, "#857d97");
    }
    for (const z of [-28, -10, 10, 28]) {
      box(paving, 0, 0.071, z, 64, 0.045, 1.5, "#242a3c");
      for (let x = -31; x <= 31; x += 0.9)
        box(paint, x, 0.103, z, 0.35, 0.01, 0.035, "#857d97");
    }
    // Market high street and links into the existing Exchange district.
    box(paving, -19, 0.07, 0, 18, 0.045, 1.4, "#28283c");
    box(paving, 9, 0.07, 0, 3, 0.045, 0.9, "#28283c");
    box(paving, -9, 0.07, 0, 3, 0.045, 0.9, "#28283c");
    box(paving, 0, 0.07, 9, 0.9, 0.045, 3, "#28283c");
    for (let x = -26; x <= -12; x += 0.8)
      box(paint, x, 0.11, 0, 0.3, 0.01, 0.03, "#af859d");
    for (const z of [8, 10])
      for (let x = -0.65; x <= 0.65; x += 0.22)
        box(paint, x, 0.12, z, 0.1, 0.012, 1.1, "#a69eaf");
    for (const x of [-10, 10])
      for (const z of [-21, -1, 20])
        for (let a = -0.6; a <= 0.6; a += 0.22)
          box(paint, x, 0.12, z + a, 1.1, 0.012, 0.1, "#a69eaf");
    for (const x of [-27, -9, 11, 23])
      for (let z = -26; z < 29; z += 5) {
        posts.push({
          position: [x, 0.8, z],
          size: [0.045, 1.6, 0.045],
          color: "#5a5e72",
        });
        lights.push({
          position: [x, 1.62, z],
          size: [0.24, 0.055, 0.24],
          color: x === -27 ? "#e2bdd4" : "#dfd0a4",
        });
      }
    for (const z of [-27, 11, 29])
      for (let x = -24; x < 22; x += 5) {
        posts.push({
          position: [x, 0.8, z],
          size: [0.045, 1.6, 0.045],
          color: "#5a5e72",
        });
        lights.push({
          position: [x, 1.62, z],
          size: [0.24, 0.055, 0.24],
          color: "#dfd0a4",
        });
      }
    // Park footpaths and carnival plaza.
    box(paving, -25, 0.08, 19, 1.2, 0.04, 17, "#566057");
    box(paving, -20, 0.08, 25, 11, 0.04, 1, "#566057");
    box(paving, 0, 0.08, 19, 17, 0.04, 14, "#342c42");
    box(paving, 0, 0.11, 14, 1.4, 0.03, 6, "#51415d");
    return { paving, paint, posts, lights };
  }, []);
  return (
    <>
      <InstanceBoxes items={batches.paving} />
      <InstanceBoxes items={batches.paint} />
      <InstanceBoxes items={batches.posts} />
      <InstanceBoxes items={batches.lights} glow />
    </>
  );
}
function Fleet({ paused }: { paused: boolean }) {
  const bodies = useRef<THREE.InstancedMesh>(null),
    cabins = useRef<THREE.InstancedMesh>(null),
    headlights = useRef<THREE.InstancedMesh>(null),
    taillights = useRef<THREE.InstancedMesh>(null),
    clock = useRef(0);
  const vehicles = useMemo(
    () =>
      TRAFFIC_LOOPS.flatMap((loop, route) =>
        Array.from({ length: loop.count }, (_, i) => ({
          loop,
          offset: i * 9.2,
          speed: 1.2 + route * 0.12,
          bus: i % 11 === 0,
          color: ["#c39bba", "#d8bd79", "#9bbed0", "#9dc6af", "#b0a2cc"][i % 5],
        })),
      ),
    [],
  );
  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      rotation: new THREE.Quaternion(),
      position: new THREE.Vector3(),
      size: new THREE.Vector3(),
      axis: new THREE.Vector3(0, 1, 0),
    }),
    [],
  );
  useLayoutEffect(() => {
    vehicles.forEach((v, i) => {
      bodies.current?.setColorAt(i, new THREE.Color(v.color));
      cabins.current?.setColorAt(
        i,
        new THREE.Color(v.bus ? "#7599ba" : "#7f9eae"),
      );
    });
    for (const r of [bodies, cabins])
      if (r.current?.instanceColor) r.current.instanceColor.needsUpdate = true;
  }, [vehicles]);
  useFrame((_, dt) => {
    if (!paused) clock.current += Math.min(dt, 0.05);
    const { matrix, rotation, position, size, axis } = scratch;
    vehicles.forEach((v, i) => {
      const p = loopPoint(v.loop.points, v.offset + clock.current * v.speed);
      rotation.setFromAxisAngle(axis, p.rotation);
      const set = (
        mesh: THREE.InstancedMesh | null,
        y: number,
        localZ: number,
        w: number,
        h: number,
        d: number,
      ) => {
        if (!mesh) return;
        position.set(
          p.x + Math.sin(p.rotation) * localZ,
          y,
          p.z + Math.cos(p.rotation) * localZ,
        );
        size.set(w, h, d);
        matrix.compose(position, rotation, size);
        mesh.setMatrixAt(i, matrix);
      };
      set(
        bodies.current,
        0.26,
        0,
        v.bus ? 0.48 : 0.33,
        0.22,
        v.bus ? 1.3 : 0.67,
      );
      set(
        cabins.current,
        0.45,
        -0.03,
        v.bus ? 0.44 : 0.27,
        v.bus ? 0.3 : 0.16,
        v.bus ? 1.07 : 0.34,
      );
      set(headlights.current, 0.29, v.bus ? 0.66 : 0.35, 0.25, 0.055, 0.025);
      set(taillights.current, 0.28, v.bus ? -0.66 : -0.35, 0.24, 0.045, 0.025);
    });
    for (const r of [bodies, cabins, headlights, taillights])
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      {[bodies, cabins].map((ref, i) => (
        <instancedMesh
          key={i}
          ref={ref}
          args={[undefined, undefined, vehicles.length]}
          frustumCulled={false}
        >
          <boxGeometry />
          <meshStandardMaterial roughness={0.65} />
        </instancedMesh>
      ))}
      {[headlights, taillights].map((ref, i) => (
        <instancedMesh
          key={i}
          ref={ref}
          args={[undefined, undefined, vehicles.length]}
          frustumCulled={false}
        >
          <boxGeometry />
          <meshBasicMaterial
            color={i === 0 ? "#ffedbe" : "#e77992"}
            toneMapped={false}
          />
        </instancedMesh>
      ))}
    </>
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
    <group position={[x, 0.08, z]} rotation={[0, rotation, 0]}>
      <Box position={[0, 0.3, 0]} size={[1.1, 0.09, 0.35]} color="#977d6a" />
      <Box
        position={[0, 0.55, -0.16]}
        size={[1.1, 0.4, 0.065]}
        color="#9b806d"
      />
      {[-0.4, 0.4].map((a) => (
        <Box
          key={a}
          position={[a, 0.15, 0]}
          size={[0.06, 0.3, 0.25]}
          color="#545569"
        />
      ))}
    </group>
  );
}
function FerrisWheel({ paused }: { paused: boolean }) {
  const wheel = useRef<THREE.Group>(null),
    cabins = useRef<THREE.Group>(null),
    t = useRef(0);
  useFrame((_, dt) => {
    if (paused) return;
    t.current += Math.min(dt, 0.05) * 0.12;
    if (wheel.current) wheel.current.rotation.z = t.current;
    cabins.current?.children.forEach((c, i) => {
      const a = (i / 10) * Math.PI * 2 + t.current;
      c.position.set(Math.cos(a) * 3.25, 4.2 + Math.sin(a) * 3.25, 0);
    });
  });
  return (
    <group position={[3, 0.1, 21]}>
      <Box position={[0, 0.1, 0]} size={[6.8, 0.2, 3.2]} color="#4d3b59" />
      {[-1, 1].map((side) => (
        <Box
          key={side}
          position={[side * 0.9, 2.1, 0.3]}
          size={[0.14, 4.6, 0.18]}
          color="#9b8da8"
          rotation={[0, 0, -side * 0.42]}
        />
      ))}
      <group position={[0, 4.2, 0]}>
        <group ref={wheel}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[3.25, 0.065, 6, 64]} />
            <meshBasicMaterial color="#dc9aca" toneMapped={false} />
          </mesh>
          <mesh>
            <torusGeometry args={[2.95, 0.035, 6, 64]} />
            <meshBasicMaterial color="#a594df" />
          </mesh>
          {Array.from({ length: 10 }, (_, i) => (
            <group key={i} rotation={[0, 0, (i / 10) * Math.PI * 2]}>
              <Box
                position={[1.62, 0, 0]}
                size={[3.25, 0.035, 0.035]}
                color="#c9b6cc"
                glow
              />
            </group>
          ))}
        </group>
        <mesh>
          <cylinderGeometry args={[0.23, 0.23, 0.8, 16]} />
          <meshStandardMaterial color="#c9b5d0" />
        </mesh>
      </group>
      <group ref={cabins}>
        {Array.from({ length: 10 }, (_, i) => (
          <group key={i}>
            <Box
              position={[0, -0.2, 0]}
              size={[0.56, 0.48, 0.55]}
              color={["#e7a3cb", "#e7c78d", "#9ccdc3"][i % 3]}
            />
            <Box
              position={[0, 0.03, 0]}
              size={[0.62, 0.05, 0.6]}
              color="#d2c1d7"
            />
          </group>
        ))}
      </group>
    </group>
  );
}
function Station({ paused }: { paused: boolean }) {
  const train = useRef<THREE.Group>(null),
    time = useRef(0);
  useFrame((_, dt) => {
    if (!paused) time.current += Math.min(dt, 0.05);
    if (train.current)
      train.current.position.z = 19 + Math.sin(time.current * 0.09) * 5;
  });
  return (
    <group>
      <Box position={[14, 0.12, 20]} size={[3.8, 0.24, 15]} color="#555165" />
      <Box position={[13, 0.9, 20]} size={[1.4, 1.55, 8]} color="#41435a" />
      <Box position={[13, 1.75, 20]} size={[2, 0.16, 9]} color="#7c8fa8" />{" "}
      {[-1, 1].map((side) => (
        <Box
          key={side}
          position={[17 + side * 0.27, 0.1, 20]}
          size={[0.06, 0.06, 17]}
          color="#8592a4"
        />
      ))}
      <group ref={train} position={[17, 0.2, 19]}>
        {[-1.5, 0, 1.5].map((z, i) => (
          <group key={i} position={[0, 0, z]}>
            <Box
              position={[0, 0.38, 0]}
              size={[0.72, 0.65, 1.38]}
              color="#a6c0d3"
            />
            <Box
              position={[0, 0.68, 0]}
              size={[0.76, 0.13, 1.45]}
              color="#687c9b"
            />
            {[-0.37, 0.37].map((x) => (
              <Box
                key={x}
                position={[x, 0.44, 0]}
                size={[0.025, 0.25, 1.02]}
                color="#3d5e81"
              />
            ))}
          </group>
        ))}
      </group>
      <Box
        position={[20.2, 0.8, 19]}
        size={[0.05, 1.6, 0.05]}
        color="#7d8292"
      />
      <Box
        position={[20.2, 1.5, 19]}
        size={[0.6, 0.38, 0.04]}
        color="#a4c8dc"
        glow
      />
    </group>
  );
}
function Waterfront({ paused }: { paused: boolean }) {
  const fleet = useRef<THREE.Group>(null),
    water = useRef<THREE.Group>(null),
    time = useRef(0);
  useFrame((_, dt) => {
    if (paused) return;
    time.current += Math.min(dt, 0.05);
    const t = time.current;
    fleet.current?.children.forEach((boat, i) => {
      boat.position.z =
        (i === 0 ? 19 : i === 1 ? -1 : 19) +
        Math.sin(t * 0.055 + i) * (i === 0 ? 5 : 6);
      boat.position.y = 0.18 + Math.sin(t * 1.7 + i) * 0.035;
      boat.rotation.y = Math.cos(t * 0.055 + i) > 0 ? 0 : Math.PI;
    });
    if (water.current) water.current.position.z = Math.sin(t * 0.3) * 0.12;
  });
  const ripples = useMemo(
    () =>
      Array.from({ length: 64 }, (_, i) => ({
        position: [
          24.7 + (i % 5) * 1.7,
          0.105,
          -11 + Math.floor(i / 5) * 3.1,
        ] as [number, number, number],
        size: [0.45 + (i % 3) * 0.18, 0.012, 0.025] as [number, number, number],
        color: i % 3 ? "#446f89" : "#6a91a4",
      })),
    [],
  );
  return (
    <>
      <Box
        position={[28.9, 0.065, 9]}
        size={[9.8, 0.045, 46]}
        color="#234256"
      />
      <group ref={water}>
        <InstanceBoxes items={ripples} glow />
      </group>
      <Box position={[23.1, 0.1, 9]} size={[1.7, 0.2, 44]} color="#596075" />
      {[-10, 28].map((z) => (
        <group key={z}>
          <Box
            position={[28, 0.18, z]}
            size={[12, 0.25, 2.8]}
            color="#5e617a"
          />
          {[-1.3, 1.3].map((d) => (
            <Box
              key={d}
              position={[28, 0.6, z + d]}
              size={[12, 0.06, 0.05]}
              color="#8b93ac"
            />
          ))}
        </group>
      ))}
      <Box position={[28.5, 0.15, 26]} size={[7, 0.3, 2]} color="#817369" />
      <Box
        position={[30.7, 0.8, 25.8]}
        size={[2.1, 1.2, 1.5]}
        color="#637c94"
      />
      <Box
        position={[30.7, 1.45, 25.8]}
        size={[2.4, 0.14, 1.8]}
        color="#a3bec8"
      />
      <group ref={fleet}>
        {[0, 1, 2].map((i) => (
          <group
            key={i}
            position={[i === 1 ? 26 : 29.5, 0.18, i === 1 ? -1 : 19]}
          >
            <Box
              position={[0, 0, 0]}
              size={[i === 0 ? 0.8 : 0.48, 0.25, i === 0 ? 1.8 : 1.1]}
              color={["#b3c8d1", "#b19ebd", "#d4b994"][i]}
            />
            <Box
              position={[0, 0.25, -0.1]}
              size={[i === 0 ? 0.62 : 0.34, 0.35, i === 0 ? 1.05 : 0.55]}
              color="#7192ac"
            />
            <Box
              position={[0, 0.5, 0]}
              size={[0.035, 0.5, 0.035]}
              color="#dccfc0"
            />
          </group>
        ))}
      </group>
    </>
  );
}
function MarketDetails() {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <group
          key={i}
          position={[
            -25 + (i % 6) * 2.4,
            0.08,
            Math.floor(i / 6) === 0 ? -2.2 : 2.7,
          ]}
        >
          <Box
            position={[0, 0.4, 0]}
            size={[1.15, 0.75, 0.55]}
            color={["#bd849d", "#b69d73", "#81b2ab"][i % 3]}
          />
          <Box
            position={[0, 1.35, 0]}
            size={[1.5, 0.08, 0.95]}
            color={["#c191b2", "#c5ac7d", "#91bdb4"][i % 3]}
          />
          {[-0.63, 0.63].map((x) => (
            <Box
              key={x}
              position={[x, 0.75, 0]}
              size={[0.035, 1.3, 0.035]}
              color="#8d7a8d"
            />
          ))}
          {[-0.32, 0, 0.32].map((x) => (
            <mesh key={x} position={[x, 0.85, 0.07]}>
              <sphereGeometry args={[0.115, 8, 8]} />
              <meshStandardMaterial color={i % 2 ? "#a9c29a" : "#d3a889"} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}
function Campus() {
  return (
    <>
      <group position={[0, 0.2, -19.4]}>
        <mesh>
          <cylinderGeometry args={[1.6, 1.8, 0.3, 32]} />
          <meshStandardMaterial color="#52616e" />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.9, 16, 12]} />
          <meshStandardMaterial
            color="#80aab5"
            wireframe
            emissive="#75a5b8"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      {[-5, 5].map((x) => (
        <group key={x} position={[x, 0.4, -13.8]}>
          <Box position={[0, 0.75, 0]} size={[2.4, 1.5, 1.5]} color="#536576" />
          <Box
            position={[0, 1.55, 0]}
            size={[2.6, 0.13, 1.7]}
            color="#84b7bf"
            glow
          />
          <Box
            position={[0, 0.8, 0.77]}
            size={[1.8, 0.45, 0.04]}
            color="#9ac8ca"
            glow
          />
        </group>
      ))}
    </>
  );
}
function Industrial() {
  return (
    <>
      {Array.from({ length: 16 }, (_, i) => (
        <group
          key={i}
          position={[
            12.8 + (i % 4) * 1.9,
            0.2,
            -14.3 + Math.floor(i / 4) * 0.65,
          ]}
        >
          <Box
            position={[0, 0.25, 0]}
            size={[1.55, 0.5, 0.55]}
            color={["#a78386", "#74969c", "#a39878", "#8386a0"][i % 4]}
          />
          <Box
            position={[0, 0.52, 0]}
            size={[1.58, 0.04, 0.58]}
            color="#b3a8ab"
          />
        </group>
      ))}
      <group position={[19, 0.1, -17]}>
        <Box position={[0, 1.8, 0]} size={[0.12, 3.6, 0.12]} color="#ae946c" />
        <Box
          position={[-1.2, 3.6, 0]}
          size={[3.6, 0.12, 0.12]}
          color="#c5a570"
        />
        <Box
          position={[-2.6, 2.7, 0]}
          size={[0.025, 1.8, 0.025]}
          color="#aeb1bc"
        />
      </group>
    </>
  );
}
function Airship({ paused }: { paused: boolean }) {
  const ref = useRef<THREE.Group>(null),
    time = useRef(0);
  useFrame((_, dt) => {
    if (paused) return;
    time.current += Math.min(dt, 0.05);
    if (ref.current) {
      ref.current.position.set(
        -8 + Math.sin(time.current * 0.035) * 14,
        7.5 + Math.sin(time.current * 0.5) * 0.15,
        -19,
      );
      ref.current.rotation.y =
        Math.cos(time.current * 0.035) > 0 ? Math.PI / 2 : -Math.PI / 2;
    }
  });
  return (
    <group ref={ref}>
      <mesh scale={[0.65, 0.65, 2.3]}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshStandardMaterial
          color="#81719e"
          emissive="#81719e"
          emissiveIntensity={0.08}
        />
      </mesh>
      <Box position={[0, -0.7, 0]} size={[0.4, 0.35, 0.75]} color="#cab5cc" />
      <Box position={[0, 0.1, -2]} size={[0.08, 0.95, 0.6]} color="#a391b5" />
      <Box
        position={[0, -0.9, 0.1]}
        size={[0.2, 0.05, 0.3]}
        color="#d5bf98"
        glow
      />
    </group>
  );
}
export default memo(function MetropolisEnvironment({
  paused,
}: {
  paused: boolean;
}) {
  const trees = useMemo(() => {
    const list: [number, number, number][] = [];
    for (let i = 0; i < 88; i++) {
      const x = -26 + (i % 8) * 1.7,
        z = 12 + Math.floor(i / 8) * 1.35;
      if (Math.hypot(x + 19.5, z - 20) < 3.9 || Math.abs(x + 25) < 0.6)
        continue;
      list.push([x, z, 0.75 + (i % 4) * 0.16]);
    }
    for (let z = -25; z < 29; z += 3.3)
      for (const x of [-30, -8.5, 9, 24])
        list.push([x, z, 0.65 + (Math.floor(z + 30) % 3) * 0.1]);
    for (let x = -25; x < 24; x += 3.5)
      for (const z of [-30, 30]) list.push([x, z, 0.8]);
    return list;
  }, []);
  return (
    <>
      <Streets />
      <MetropolisBuildings />
      <Forest trees={trees} />
      <MarketDetails />
      <Campus />
      <Industrial />
      <FerrisWheel paused={paused} />
      <Station paused={paused} />
      <Waterfront paused={paused} />
      <Fleet paused={paused} />
      <CityVisitors paused={paused} />
      <Airship paused={paused} />
      <mesh position={[-19.5, 0.08, 20]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.3, 48]} />
        <meshBasicMaterial color="#3e7380" />
      </mesh>
      <mesh position={[-19.5, 0.085, 20]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.3, 3.6, 48]} />
        <meshStandardMaterial color="#668276" />
      </mesh>
      <group position={[-18, 0.15, 26]}>
        <Box position={[0, 0.15, 0]} size={[3, 0.3, 2.3]} color="#7c766b" />
        {[-1.25, 1.25].map((x) => (
          <group key={x}>
            <Box
              position={[x, 1.2, -0.9]}
              size={[0.1, 2.1, 0.1]}
              color="#92918a"
            />
            <Box
              position={[x, 1.2, 0.9]}
              size={[0.1, 2.1, 0.1]}
              color="#92918a"
            />
          </group>
        ))}
        <mesh position={[0, 2.35, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[2.2, 1, 4]} />
          <meshStandardMaterial color="#786b8e" />
        </mesh>
      </group>
      {[
        [-26, 14],
        [-26, 21],
        [-14, 25],
        [-12, 14],
        [22.8, 15],
        [22.8, 22],
        [-7, 17],
        [7, 17],
      ].map(([x, z], i) => (
        <Bench key={i} x={x} z={z} rotation={i % 2 ? Math.PI / 2 : 0} />
      ))}
    </>
  );
});
