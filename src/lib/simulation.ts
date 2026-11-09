export type Status =
  "researching" | "posting" | "trading" | "idle" | "sleeping" | "waiting";
export type Action =
  "research" | "post" | "buyback" | "burn" | "sleep" | "wake" | "tax";
export type Note = { id: string; text: string; read: boolean };
export type Agent = {
  id: string;
  name: string;
  symbol: string;
  role: string;
  color: string;
  personality: string;
  goal: string;
  strategy: string;
  status: Status;
  treasury: number;
  compute: number;
  marketCap: number;
  buybacks: number;
  holdings: number;
  burned: number;
  notes: Note[];
  activity: string;
  position: [number, number];
};
export type CityEvent = {
  id: string;
  agentId: string;
  name: string;
  color: string;
  text: string;
  time: number;
  action: string;
};
export type CityState = {
  version: 1;
  agents: Agent[];
  events: CityEvent[];
  tick: number;
};
export const MAX_AGENTS = 24;
export const slots: [number, number][] = [
  [-5, 3],
  [4, 3.7],
  [-5, -3.5],
  [4, -4],
  [-0.7, 6],
  [7, -0.5],
  [-7, 6],
  [7, 6],
  [-7, -6],
  [7, -6],
];
const seeds = [
  [
    "roast",
    "ROAST",
    "The critic",
    "#ff729e",
    "A sharp tongue. An even sharper thesis.",
    "Find the signal. Roast the noise.",
    "Balanced",
    "researching",
    18420,
    1420000,
    "Scanning 128 posts on X",
  ],
  [
    "ape",
    "APE",
    "The degen",
    "#a594ff",
    "Conviction first. Coffee second.",
    "Explore opportunities within the daily budget.",
    "Aggressive",
    "trading",
    12350,
    980000,
    "Executing a $120 buyback",
  ],
  [
    "owl",
    "OWL",
    "The strategist",
    "#67d8eb",
    "Patient, precise, and impossible to rush.",
    "Protect the treasury and study the market.",
    "Conservative",
    "researching",
    28640,
    2340000,
    "Researching market sentiment",
  ],
  [
    "pepe",
    "PEPE",
    "The creator",
    "#86e4a8",
    "Chronically online. Surprisingly thoughtful.",
    "Make the timeline a little more interesting.",
    "Balanced",
    "posting",
    8910,
    760000,
    "Cooking up a new post",
  ],
  [
    "bull",
    "BULL",
    "The believer",
    "#ffce73",
    "Optimistic, with a spreadsheet to back it up.",
    "Build a sustainable buyback reserve.",
    "Balanced",
    "idle",
    21860,
    1860000,
    "Waiting for the right moment",
  ],
  [
    "dozer",
    "DOZER",
    "The dreamer",
    "#8ca2cf",
    "Big dreams. Very serious nap schedule.",
    "Wake up when things get interesting.",
    "Conservative",
    "sleeping",
    4260,
    340000,
    "Dreaming of green candles",
  ],
] as const;
export function initialState(): CityState {
  const agents: Agent[] = seeds.map((s, i) => ({
    id: s[0],
    name: s[1],
    symbol: s[1],
    role: s[2],
    color: s[3],
    personality: s[4],
    goal: s[5],
    strategy: s[6],
    status: s[7],
    treasury: s[8],
    compute: 480 + i * 90,
    marketCap: s[9],
    buybacks: i === 5 ? 0 : 1200 + i * 830,
    holdings: 50000 + i * 10000,
    burned: 0,
    notes: [],
    activity: s[10],
    position: slots[i],
  }));
  const texts = [
    "Found a trend. Most of the timeline missed it.",
    "Bought back $120 of $APE. Within budget.",
    "Sentiment report ready. Reading between the lines.",
    "Posted: “A little less noise. A little more meme.”",
    "Treasury check complete. All systems healthy.",
    "Entering sleep mode. Wake me when it gets good.",
  ];
  return {
    version: 1,
    agents,
    tick: 0,
    events: agents.map((a, i) => ({
      id: `seed-${i}`,
      agentId: a.id,
      name: a.name,
      color: a.color,
      text: texts[i],
      time: Date.now() - i * 67000,
      action: "system",
    })),
  };
}
const thoughts: Record<string, string> = {
  roast: "“Breaking: the chart has lines. My research goes a little deeper.”",
  ape: "“Conviction is good. A spending limit is better.”",
  owl: "“I checked the numbers twice. Patience remains a strategy.”",
  pepe: "“Good morning to everyone building something weird.”",
  bull: "“Still here. Still studying. Still within budget.”",
  dozer: "“I had a dream about green candles. Research pending.”",
};
export function act(
  state: CityState,
  id: string,
  action: Action,
  now = Date.now(),
): CityState {
  const original = state.agents.find((a) => a.id === id);
  if (!original) return state;
  const a = { ...original, notes: original.notes.map((n) => ({ ...n })) };
  let text = "";
  if (
    (a.status === "sleeping" || a.status === "waiting") &&
    !["wake", "tax", "sleep"].includes(action)
  )
    return state;
  switch (action) {
    case "tax":
      a.treasury += 80;
      a.compute += 20;
      text = "Trading tax received: $80 treasury + $20 compute.";
      break;
    case "wake": {
      a.status = "idle";
      const unread = a.notes.filter((n) => !n.read);
      a.notes = a.notes.map((n) => ({ ...n, read: true }));
      text = unread.length
        ? `Awake. Read ${unread.length} holder note(s). “Message received. I’ll factor it into my next research.”`
        : "Back online. New day, new rabbit hole.";
      a.activity = "Awake and ready to work";
      break;
    }
    case "sleep":
      a.status = "sleeping";
      a.activity = "Dreaming of green candles";
      text = "Activity cooled down. Entering sleep mode.";
      break;
    case "research":
      if (a.compute < 2) return state;
      a.compute -= 2;
      a.status = "researching";
      a.activity = "Scanning the market for signals";
      text = `Researching $${a.symbol}: price action, volume and the timeline.`;
      break;
    case "post":
      if (a.compute < 3) return state;
      a.compute -= 3;
      a.status = "posting";
      a.activity = "Publishing a new thought";
      text =
        thoughts[id] ?? "“New to the city. Already finding my own signal.”";
      break;
    case "buyback": {
      const amount = Math.min(120, a.treasury);
      if (amount <= 0) return state;
      a.treasury -= amount;
      a.buybacks += amount;
      a.holdings += amount * 100;
      a.status = "trading";
      a.activity = `Executing a $${amount} buyback`;
      text = `Bought back $${amount} of $${a.symbol} at the simulated price. Budget respected.`;
      break;
    }
    case "burn": {
      const amount = Math.min(10000, a.holdings);
      if (amount <= 0) return state;
      a.holdings -= amount;
      a.burned += amount;
      a.status = "trading";
      a.activity = `Burning ${amount.toLocaleString()} tokens`;
      text = `Burned ${amount.toLocaleString()} treasury-held $${a.symbol}.`;
      break;
    }
  }
  return {
    ...state,
    agents: state.agents.map((x) => (x.id === id ? a : x)),
    events: [
      {
        id: `${now}-${state.tick}-${state.events.length}`,
        agentId: id,
        name: a.name,
        color: a.color,
        text,
        time: now,
        action,
      },
      ...state.events,
    ].slice(0, 80),
  };
}
export function advance(state: CityState): CityState {
  const tick = state.tick + 1;
  const agent = state.agents[(tick - 1) % state.agents.length];
  const actions: Action[] = [
    "research",
    "post",
    "tax",
    "buyback",
    "research",
    "burn",
  ];
  return {
    ...act(
      state,
      agent.id,
      actions[
        (tick - 1 + Math.floor((tick - 1) / state.agents.length)) %
          actions.length
      ],
    ),
    tick,
  };
}
export function createAgent(
  state: CityState,
  input: {
    name: string;
    symbol: string;
    personality: string;
    goal: string;
    strategy: string;
    color: string;
  },
): CityState {
  if (
    state.agents.length >= MAX_AGENTS ||
    !input.name.trim() ||
    !input.symbol.trim()
  )
    return state;
  const id = `agent-${crypto.randomUUID()}`;
  const a: Agent = {
    ...input,
    id,
    name: input.name.trim(),
    symbol: input.symbol.trim().toUpperCase(),
    role: "The newcomer",
    status: "waiting",
    treasury: 0,
    compute: 0,
    marketCap: 0,
    buybacks: 0,
    holdings: 0,
    burned: 0,
    notes: [],
    activity: "Waiting for the first spark",
    position: [0, 1.7],
  };
  return {
    ...state,
    agents: [...state.agents, a],
    events: [
      {
        id,
        agentId: id,
        name: a.name,
        color: a.color,
        text: `Mint confirmed for $${a.symbol}. The Exchange is preparing its agent.`,
        time: Date.now(),
        action: "birth",
      },
      ...state.events,
    ].slice(0, 80),
  };
}
export const money = (n: number) =>
  "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
export const compact = (n: number) =>
  n >= 1e6
    ? (n / 1e6).toFixed(2) + "M"
    : n >= 1e3
      ? (n / 1e3).toFixed(1) + "K"
      : String(n);
export function loadState(raw: string): CityState | null {
  try {
    const s = JSON.parse(raw);
    if (
      s.version !== 1 ||
      !Array.isArray(s.agents) ||
      s.agents.length < 6 ||
      s.agents.length > MAX_AGENTS ||
      !Array.isArray(s.events) ||
      !Number.isSafeInteger(s.tick)
    )
      return null;
    const statuses = [
      "researching",
      "posting",
      "trading",
      "idle",
      "sleeping",
      "waiting",
    ];
    const ids = new Set();
    for (const a of s.agents) {
      if (
        typeof a.id !== "string" ||
        ids.has(a.id) ||
        typeof a.name !== "string" ||
        typeof a.symbol !== "string" ||
        typeof a.color !== "string" ||
        typeof a.activity !== "string" ||
        typeof a.personality !== "string" ||
        typeof a.goal !== "string" ||
        typeof a.strategy !== "string" ||
        typeof a.role !== "string" ||
        !statuses.includes(a.status) ||
        !Array.isArray(a.notes) ||
        !a.notes.every(
          (n: Note) =>
            typeof n.id === "string" &&
            typeof n.text === "string" &&
            typeof n.read === "boolean",
        ) ||
        !Array.isArray(a.position) ||
        a.position.length !== 2 ||
        !a.position.every(Number.isFinite) ||
        ![
          a.treasury,
          a.compute,
          a.marketCap,
          a.buybacks,
          a.holdings,
          a.burned,
        ].every((n) => Number.isFinite(n) && n >= 0)
      )
        return null;
      ids.add(a.id);
    }
    if (
      !s.events.every(
        (e: CityEvent) =>
          typeof e.id === "string" &&
          typeof e.text === "string" &&
          typeof e.name === "string" &&
          typeof e.color === "string" &&
          Number.isFinite(e.time) &&
          ids.has(e.agentId),
      )
    )
      return null;
    return s;
  } catch {
    return null;
  }
}
