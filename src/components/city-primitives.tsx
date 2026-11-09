"use client";
export function Box({
  position,
  size,
  color = "#14182e",
  glow = false,
  rotation,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  glow?: boolean;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      {glow ? (
        <meshBasicMaterial color={color} toneMapped={false} />
      ) : (
        <meshStandardMaterial color={color} roughness={0.75} />
      )}
    </mesh>
  );
}
