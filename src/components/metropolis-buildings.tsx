"use client";
import { memo, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { cityBlocks } from "@/lib/metropolis";
export type InstanceBox = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  rotation?: number;
};
export function InstanceBoxes({
  items,
  glow = false,
}: {
  items: InstanceBox[];
  glow?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4(),
      q = new THREE.Quaternion(),
      axis = new THREE.Vector3(0, 1, 0);
    items.forEach((v, i) => {
      q.setFromAxisAngle(axis, v.rotation ?? 0);
      matrix.compose(
        new THREE.Vector3(...v.position),
        q,
        new THREE.Vector3(...v.size),
      );
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, new THREE.Color(v.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <boxGeometry args={[1, 1, 1]} />
      {glow ? (
        <meshBasicMaterial toneMapped={false} />
      ) : (
        <meshStandardMaterial roughness={0.8} />
      )}
    </instancedMesh>
  );
}
export default memo(function MetropolisBuildings() {
  const batches = useMemo(() => {
    const solid: InstanceBox[] = [],
      lights: InstanceBox[] = [];
    for (const b of cityBlocks()) {
      solid.push({
        position: [b.x, b.h / 2 + 0.1, b.z],
        size: [b.w, b.h, b.d],
        color:
          b.kind === "shop"
            ? "#393048"
            : b.kind === "house"
              ? "#282d41"
              : "#25283b",
      });
      solid.push({
        position: [b.x, b.h + 0.15, b.z],
        size: [b.w + 0.1, 0.13, b.d + 0.1],
        color: "#3d3c52",
      });
      lights.push({
        position: [b.x, b.h + 0.1, b.z],
        size: [b.w + 0.12, 0.035, b.d + 0.12],
        color: b.color,
      });
      solid.push({
        position: [b.x, b.h + 0.2, b.z],
        size: [b.w - 0.05, 0.1, b.d - 0.05],
        color: "#2a283c",
      });
      if (b.kind === "house") {
        solid.push({
          position: [b.x, b.h + 0.36, b.z],
          size: [b.w * 0.7, 0.28, b.d * 0.7],
          color: "#51465d",
        });
      }
      if (b.kind === "shop") {
        lights.push({
          position: [b.x, b.h * 0.5, b.z + b.d / 2 + 0.015],
          size: [b.w * 0.74, b.h * 0.36, 0.03],
          color: b.color,
        });
        for (let i = 0; i < 6; i++)
          solid.push({
            position: [
              b.x - b.w / 2 + ((i + 0.5) * b.w) / 6,
              b.h * 0.8,
              b.z + b.d / 2 + 0.25,
            ],
            size: [b.w / 6, 0.07, 0.5],
            color: i % 2 ? b.color : "#625167",
          });
        solid.push({
          position: [b.x, b.h + 0.36, b.z],
          size: [b.w * 0.7, 0.35, 0.1],
          color: "#242435",
        });
        lights.push({
          position: [b.x, b.h + 0.36, b.z + 0.055],
          size: [b.w * 0.5, 0.05, 0.02],
          color: b.color,
        });
      } else if (b.kind === "warehouse") {
        solid.push({
          position: [b.x, b.h * 0.4, b.z + b.d / 2 + 0.015],
          size: [b.w * 0.7, b.h * 0.65, 0.03],
          color: "#74778a",
        });
        for (let i = 0; i < 3; i++)
          lights.push({
            position: [
              b.x - b.w * 0.25 + i * b.w * 0.25,
              b.h * 0.85,
              b.z + b.d / 2 + 0.025,
            ],
            size: [0.25, 0.15, 0.02],
            color: "#c0c9bd",
          });
        solid.push({
          position: [b.x + 0.5, b.h + 0.35, b.z - 0.5],
          size: [0.25, 0.5, 0.25],
          color: "#69667b",
        });
      } else {
        const rows = Math.floor((b.h - 0.1) / 0.35),
          cols = Math.floor((b.w - 0.15) / 0.28),
          depth = Math.floor((b.d - 0.15) / 0.28);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++)
            if ((r * 7 + c * 3 + Math.floor(b.x)) % 5 !== 0)
              lights.push({
                position: [
                  b.x - b.w / 2 + 0.2 + c * 0.28,
                  0.3 + r * 0.35,
                  b.z + b.d / 2 + 0.012,
                ],
                size: [0.085, 0.14, 0.02],
                color: (r + c) % 7 === 0 ? b.color : "#c6c2a6",
              });
          for (let c = 0; c < depth; c++)
            if ((r * 3 + c * 7) % 4 !== 0)
              lights.push({
                position: [
                  b.x + b.w / 2 + 0.012,
                  0.3 + r * 0.35,
                  b.z - b.d / 2 + 0.2 + c * 0.28,
                ],
                size: [0.02, 0.14, 0.085],
                color: (r + c) % 7 === 0 ? b.color : "#bfc2b4",
              });
        }
        if (b.kind === "lab") {
          solid.push({
            position: [b.x + 0.5, b.h + 0.3, b.z],
            size: [0.5, 0.3, 0.5],
            color: "#8da7b2",
          });
          lights.push({
            position: [b.x - b.w / 2 - 0.015, b.h / 2, b.z + b.d / 2],
            size: [0.04, b.h, 0.04],
            color: b.color,
          });
        }
      }
    }
    return { solid, lights };
  }, []);
  return (
    <>
      <InstanceBoxes items={batches.solid} />
      <InstanceBoxes items={batches.lights} glow />
    </>
  );
});
