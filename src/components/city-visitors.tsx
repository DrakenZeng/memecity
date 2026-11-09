"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { loopPoint } from "@/lib/metropolis";
// Small human pedestrians are background visitors, not additional token agents.
export default function CityVisitors({ paused }: { paused: boolean }) {
  const heads = useRef<THREE.InstancedMesh>(null),
    bodies = useRef<THREE.InstancedMesh>(null),
    feet = useRef<THREE.InstancedMesh>(null),
    time = useRef(0);
  const people = useMemo(
    () =>
      [
        [
          [-29, -11],
          [-11, -11],
          [-11, 11],
          [-29, 11],
        ],
        [
          [-11, -29],
          [11, -29],
          [11, -11],
          [-11, -11],
        ],
        [
          [-29, 11],
          [-11, 11],
          [-11, 29],
          [-29, 29],
        ],
        [
          [11, 11],
          [21, 11],
          [21, 29],
          [11, 29],
        ],
      ].flatMap((points, route) =>
        Array.from({ length: 8 }, (_, i) => ({
          points: points as [number, number][],
          offset: i * 7.8,
          speed: 0.34 + (i % 3) * 0.045,
          route,
        })),
      ),
    [],
  );
  const tmp = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      p: new THREE.Vector3(),
      s: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      axis: new THREE.Vector3(0, 1, 0),
    }),
    [],
  );
  useLayoutEffect(() => {
    people.forEach((_, i) => {
      bodies.current?.setColorAt(
        i,
        new THREE.Color(["#8c91bc", "#be9aab", "#97b2a0", "#c0ae91"][i % 4]),
      );
      heads.current?.setColorAt(
        i,
        new THREE.Color(["#c5a88d", "#af9787", "#d4bba1"][i % 3]),
      );
    });
    for (const r of [bodies, heads])
      if (r.current?.instanceColor) r.current.instanceColor.needsUpdate = true;
  }, [people]);
  useFrame((_, dt) => {
    if (!paused) time.current += Math.min(dt, 0.05);
    const { m, p, s, q, axis } = tmp;
    people.forEach((v, i) => {
      const point = loopPoint(v.points, v.offset + time.current * v.speed);
      q.setFromAxisAngle(axis, point.rotation);
      p.set(
        point.x,
        0.5 + Math.abs(Math.sin(time.current * 7 + i)) * 0.015,
        point.z,
      );
      s.set(0.085, 0.085, 0.085);
      m.compose(p, q, s);
      heads.current?.setMatrixAt(i, m);
      p.y = 0.32;
      s.set(0.16, 0.26, 0.12);
      m.compose(p, q, s);
      bodies.current?.setMatrixAt(i, m);
      for (let side = 0; side < 2; side++) {
        const offset = (side === 0 ? -1 : 1) * 0.05;
        p.set(
          point.x + Math.cos(point.rotation) * offset,
          0.12,
          point.z -
            Math.sin(point.rotation) * offset +
            Math.sin(time.current * 7 + i + side * Math.PI) * 0.035,
        );
        s.set(0.045, 0.17, 0.07);
        m.compose(p, q, s);
        feet.current?.setMatrixAt(i * 2 + side, m);
      }
    });
    for (const r of [heads, bodies, feet])
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh
        ref={heads}
        args={[undefined, undefined, people.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial />
      </instancedMesh>
      <instancedMesh
        ref={bodies}
        args={[undefined, undefined, people.length]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial />
      </instancedMesh>
      <instancedMesh
        ref={feet}
        args={[undefined, undefined, people.length * 2]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial color="#444451" />
      </instancedMesh>
    </>
  );
}
