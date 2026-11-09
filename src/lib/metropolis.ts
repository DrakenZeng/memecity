export const MAP_HALF = 34;
export const MIN_ZOOM = 2.5;
export const MAX_ZOOM = 90;
export type MapFocus = { x: number; z: number; key: string };
export type MapView = { x: number; z: number; zoom: number };
export const DISTRICTS = [
  {
    id: "genesis",
    name: "Genesis Exchange",
    tag: "GENESIS DISTRICT",
    x: 0,
    z: 0,
    color: "#e9c68c",
    zoom: 28,
    rect: [-9.5, -9.5, 19, 19],
  },
  {
    id: "market",
    name: "Neon Market",
    tag: "NEON MARKET",
    x: -20,
    z: -2,
    color: "#ea91bc",
    zoom: 25,
    rect: [-27, -9, 16, 18],
  },
  {
    id: "heights",
    name: "Meme Heights",
    tag: "MEME HEIGHTS",
    x: -20,
    z: -20,
    color: "#aaa3e9",
    zoom: 21,
    rect: [-27, -27, 16, 16],
  },
  {
    id: "labs",
    name: "Research Campus",
    tag: "RESEARCH CAMPUS",
    x: 0,
    z: -20,
    color: "#8acccf",
    zoom: 22,
    rect: [-9, -27, 18, 16],
  },
  {
    id: "works",
    name: "The Foundry",
    tag: "THE FOUNDRY",
    x: 16,
    z: -20,
    color: "#d8ad80",
    zoom: 22,
    rect: [11, -27, 10, 16],
  },
  {
    id: "gardens",
    name: "Moonlight Gardens",
    tag: "MOONLIGHT GARDENS",
    x: -20,
    z: 20,
    color: "#8ccaa8",
    zoom: 21,
    rect: [-27, 11, 16, 16],
  },
  {
    id: "carnival",
    name: "After Hours",
    tag: "AFTER HOURS",
    x: 0,
    z: 20,
    color: "#e7a3cb",
    zoom: 19,
    rect: [-9, 11, 18, 16],
  },
  {
    id: "station",
    name: "Central Station",
    tag: "CENTRAL STATION",
    x: 16,
    z: 20,
    color: "#91b3da",
    zoom: 22,
    rect: [11, 11, 10, 16],
  },
  {
    id: "waterfront",
    name: "Bluewater Quay",
    tag: "BLUEWATER QUAY",
    x: 27,
    z: 12,
    color: "#7fc7db",
    zoom: 19,
    rect: [23, -9, 10, 40],
  },
] as const;
export type CityBlock = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: string;
  kind: "tower" | "shop" | "lab" | "warehouse" | "house";
};
// A seeded layout stays identical across refreshes and independent of agent count.
export function cityBlocks(): CityBlock[] {
  const blocks: CityBlock[] = [];
  const add = (
    x: number,
    z: number,
    w: number,
    d: number,
    h: number,
    color: string,
    kind: CityBlock["kind"],
  ) => blocks.push({ x, z, w, d, h, color, kind });
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 4; col++) {
      const n = row * 4 + col;
      add(
        -25 + col * 3.5,
        -25 + row * 3.5,
        1.7 + (n % 3) * 0.2,
        1.8,
        1.6 + ((n * 7) % 11) * 0.31,
        ["#9d95ca", "#8aa5be", "#b393a8"][n % 3],
        n % 4 === 0 ? "tower" : "house",
      );
    }
  for (let side = 0; side < 2; side++)
    for (let i = 0; i < 6; i++)
      add(
        -25 + i * 2.4,
        side === 0 ? -5.8 : 5.7,
        1.7,
        2.1,
        0.85 + (i % 3) * 0.3,
        ["#df92ad", "#d8bd86", "#9bc8c0"][i % 3],
        "shop",
      );
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 4; col++)
      add(
        -6.6 + col * 4.3,
        -24 + row * 4.6,
        2.3,
        2.1,
        1.1 + ((row + col) % 3) * 0.8,
        "#86b5bd",
        "lab",
      );
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 2; col++)
      add(
        13.5 + col * 4.5,
        -24 + row * 4.7,
        2.8,
        2.5,
        1.4 + (row % 2) * 0.5,
        "#b79a85",
        "warehouse",
      );
  for (let i = 0; i < 6; i++)
    add(
      13 + (i % 2) * 5.3,
      -7 + Math.floor(i / 2) * 5.5,
      2.2,
      2.3,
      1.8 + (i % 3) * 0.5,
      ["#7fa2b8", "#a09ac6"][i % 2],
      "shop",
    );
  for (let i = 0; i < 5; i++)
    add(
      i === 2 ? 7.3 : -6 + i * 3,
      i === 2 ? 16 : 13.7,
      1.8,
      1.7,
      0.9 + (i % 2) * 0.35,
      ["#d59dbb", "#a1c1ba", "#d2b889"][i % 3],
      "shop",
    );
  for (let i = 0; i < 5; i++)
    add(
      -25 + i * 3.1,
      30.5,
      1.8,
      1.65,
      1.3 + (i % 3) * 0.55,
      "#8d9ab8",
      "house",
    );
  for (let i = 0; i < 4; i++)
    add(-31, -23 + i * 7, 1.8, 2.3, 1.7 + (i % 3) * 0.6, "#8a90ac", "tower");
  for (let i = 0; i < 4; i++)
    add(-5 + i * 6, -31, 2.2, 1.8, 2 + (i % 3) * 0.7, "#9b9ec0", "tower");
  return blocks;
}
export type TrafficLoop = {
  points: readonly (readonly [number, number])[];
  color: string;
  count: number;
};
export const TRAFFIC_LOOPS: TrafficLoop[] = [
  {
    points: [
      [-28, -28],
      [10, -28],
      [10, -10],
      [-28, -10],
    ],
    color: "#c6abc9",
    count: 13,
  },
  {
    points: [
      [-28, -10],
      [-10, -10],
      [-10, 28],
      [-28, 28],
    ],
    color: "#a8c1b4",
    count: 12,
  },
  {
    points: [
      [-10, 10],
      [22, 10],
      [22, 28],
      [-10, 28],
    ],
    color: "#a6bedb",
    count: 12,
  },
  {
    points: [
      [-10, -28],
      [22, -28],
      [22, 10],
      [-10, 10],
    ],
    color: "#d2bd97",
    count: 13,
  },
];
export function loopPoint(points: TrafficLoop["points"], distance: number) {
  const lengths = points.map((a, i) => {
    const b = points[(i + 1) % points.length];
    return Math.hypot(b[0] - a[0], b[1] - a[1]);
  });
  const total = lengths.reduce((a, b) => a + b, 0);
  let n = ((distance % total) + total) % total;
  for (let i = 0; i < lengths.length; i++) {
    if (n <= lengths[i]) {
      const a = points[i],
        b = points[(i + 1) % points.length],
        t = n / lengths[i];
      return {
        x: a[0] + (b[0] - a[0]) * t,
        z: a[1] + (b[1] - a[1]) * t,
        rotation: Math.atan2(b[0] - a[0], b[1] - a[1]),
      };
    }
    n -= lengths[i];
  }
  return { x: points[0][0], z: points[0][1], rotation: 0 };
}
