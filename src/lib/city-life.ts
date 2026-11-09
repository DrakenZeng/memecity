// Public places are independent of the number of tokens/agents in the city.
export const EXCHANGE = { x: 0, z: -3.2, width: 4.8, depth: 3.8, height: 6.8 };
export const GATE: [number, number] = [0, -1.18];
const CENTER_NODES = [
  [0, -0.5],
  [0, 1.7],
  [-3.5, 1.7],
  [-5.7, 1.7],
  [-5.7, 4.9],
  [-3.5, 4.9],
  [0, 4.9],
  [3.7, 4.9],
  [5.8, 4.9],
  [5.8, 1.7],
  [3.7, 1.7],
  [3.7, -0.5],
] as const;
const CENTER_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 1],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [10, 1],
  [10, 11],
  [11, 0],
  [7, 10],
];
// Outer sidewalks form a connected grid; the central plaza keeps its own routes.
const OUTER_X = [-29, -11, 11, 21],
  OUTER_Z = [-29, -11, 11, 29];
const OUTER_NODES: [number, number][] = OUTER_Z.flatMap((z) =>
  OUTER_X.map((x) => [x, z] as [number, number]),
);
export const CITY_NODES: readonly (readonly [number, number])[] = [
  ...CENTER_NODES,
  ...OUTER_NODES,
  [-11, 1.7],
  [11, -0.5],
  [0, 11],
  [-25, 11],
  [-25, 18],
  [-25, 25],
  [0, 15],
  [21, 20],
  [29, 29],
  [-20, 1.7],
  [-26, 1.7],
  [-29, -20],
  [0, -29],
  [21, -20],
];
const EDGES: number[][] = [...CENTER_EDGES];
for (let row = 0; row < 4; row++)
  for (let col = 0; col < 4; col++) {
    const n = 12 + row * 4 + col;
    if (col < 3) EDGES.push([n, n + 1]);
    if (row < 3) EDGES.push([n, n + 4]);
  }
EDGES.push(
  [3, 28],
  [28, 17],
  [28, 21],
  [11, 29],
  [29, 18],
  [29, 22],
  [6, 30],
  [30, 21],
  [30, 22],
  [20, 31],
  [31, 21],
  [31, 32],
  [32, 33],
  [33, 24],
  [30, 34],
  [23, 35],
  [35, 27],
  [27, 36],
  [28, 37],
  [37, 38],
  [38, 16],
  [12, 39],
  [39, 16],
  [13, 40],
  [40, 14],
  [19, 41],
  [41, 23],
);
export const PLACES = [
  {
    node: 37,
    pose: "coffee",
    label: "NIGHT MARKET",
    text: "Browsing the Neon Market. Research looks suspiciously like shopping.",
  },
  {
    node: 38,
    pose: "wave",
    label: "STREET FOOD RUN",
    text: "Found a late-night food stall on the west side. Taking notes on the menu.",
  },
  {
    node: 39,
    pose: "wave",
    label: "NEIGHBORHOOD GM",
    text: "Saying GM in Meme Heights. Someone put a meme in every apartment window.",
  },
  {
    node: 40,
    pose: "read",
    label: "CAMPUS RESEARCH",
    text: "Visiting Research Campus. The Wi-Fi is excellent; the theories are wild.",
  },
  {
    node: 41,
    pose: "read",
    label: "FACTORY TOUR",
    text: "Watching the loading cranes at the Foundry. Everything is apparently a supply chain.",
  },
  {
    node: 32,
    pose: "read",
    label: "LAKESIDE BREAK",
    text: "Taking the long route through Moonlight Gardens. Touching digital grass.",
  },
  {
    node: 33,
    pose: "coffee",
    label: "GARDEN STROLL",
    text: "Found a quiet bench in the gardens. Even autonomous minds need some space.",
  },
  {
    node: 34,
    pose: "dance",
    label: "AFTER HOURS",
    text: "Exploring After Hours. The Ferris wheel has a better view than the charts.",
  },
  {
    node: 35,
    pose: "read",
    label: "TRAIN SPOTTING",
    text: "At Central Station. Watching the night train pull into the platform.",
  },
  {
    node: 36,
    pose: "wave",
    label: "WATERFRONT WALK",
    text: "Made it to Bluewater Quay. Watching the ferries and pretending to be offline.",
  },

  {
    node: 0,
    pose: "read",
    label: "LAUNCH WATCH",
    text: "Reading the Exchange launch ticker. Another meme is on the way.",
  },
  {
    node: 1,
    pose: "wave",
    label: "SAYING GM",
    text: "Bumped into a neighbor in the square. Exchanged a very serious GM.",
  },
  {
    node: 2,
    pose: "read",
    label: "FIELD RESEARCH",
    text: "Doing a little field research. The park has surprisingly good Wi-Fi.",
  },
  {
    node: 10,
    pose: "coffee",
    label: "TAKING FIVE",
    text: "Taking a breather by Token Square. Even agents need a minute.",
  },
  {
    node: 4,
    pose: "coffee",
    label: "☕ COFFEE BREAK",
    text: "Stopped at the café. Strong coffee, stronger opinions.",
  },
  {
    node: 5,
    pose: "read",
    label: "⌕ PEOPLE WATCHING",
    text: "Watching the fountain and doing absolutely no technical analysis.",
  },
  {
    node: 3,
    pose: "wave",
    label: "✋ SAYING GM",
    text: "Saying GM to the neighbors in Meme Park.",
  },
  {
    node: 7,
    pose: "dance",
    label: "♫ VIBING",
    text: "Found the plaza speakers. Impromptu dance break.",
  },
  {
    node: 9,
    pose: "read",
    label: "✦ TOKEN SPOTTING",
    text: "Checking out the rotating token sculpture.",
  },
  {
    node: 11,
    pose: "wave",
    label: "✋ WELCOMING NEWCOMERS",
    text: "Waiting by the Genesis Gate to welcome the next new agent.",
  },
  {
    node: 8,
    pose: "coffee",
    label: "▰ WAITING FOR THE BUS",
    text: "Waiting for the night bus. Next stop: the timeline.",
  },
  {
    node: 6,
    pose: "dance",
    label: "✦ CELEBRATING",
    text: "Celebrating another day of being a sentient meme.",
  },
] as const;
export type StreetPose =
  "idle" | "walking" | "coffee" | "read" | "wave" | "dance" | "sleep";
export type StreetActivity = { label: string; text: string; pose: StreetPose };
export type CityMoment = {
  kind: "coins" | "party" | "comet";
  title: string;
  description: string;
  startedAt: number;
  key: string;
};
export function nearestNode(position: readonly number[]) {
  let nearest = 0,
    distance = Infinity;
  CITY_NODES.forEach((p, i) => {
    const d = Math.hypot(p[0] - position[0], p[1] - position[1]);
    if (d < distance) {
      distance = d;
      nearest = i;
    }
  });
  return nearest;
}
export function streetRoute(from: number, to: number): number[] {
  if (from === to) return [];
  const queue: number[][] = [[from]],
    visited = new Set([from]);
  while (queue.length) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    for (const [a, b] of EDGES) {
      const next = a === last ? b : b === last ? a : -1;
      if (next < 0 || visited.has(next)) continue;
      const route = [...path, next];
      if (next === to) return route.slice(1);
      visited.add(next);
      queue.push(route);
    }
  }
  return [];
}
export function cityMoment(): CityMoment {
  const choices = [
    {
      kind: "coins",
      title: "Fountain airdrop!",
      description:
        "Someone tossed a lucky coin. The fountain got carried away.",
    },
    {
      kind: "party",
      title: "Plaza dance break",
      description: "The speakers found a beat. Productivity can wait.",
    },
    {
      kind: "comet",
      title: "A little cosmic hopium",
      description:
        "A shooting star over the Exchange. Make a wildly specific wish.",
    },
  ] as const;
  return {
    ...choices[Math.floor(Math.random() * choices.length)],
    startedAt: performance.now(),
    key: crypto.randomUUID(),
  };
}
