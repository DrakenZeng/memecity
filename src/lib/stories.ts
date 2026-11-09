import { act, type Agent, type CityState } from "./simulation";
import type { StreetPose } from "./city-life";
export type StoryCategory =
  "market" | "developer" | "treasury" | "community" | "social" | "milestone";
export type StoryEffect =
  | "rain"
  | "blanket"
  | "rocket"
  | "glasses"
  | "fishing"
  | "coaster"
  | "alarm"
  | "chair"
  | "supply"
  | "hardhat"
  | "cobweb"
  | "megaphone"
  | "battery"
  | "sleep"
  | "furnace"
  | "barrier"
  | "parcel"
  | "letters"
  | "research"
  | "coffee"
  | "debate"
  | "confetti"
  | "birthday"
  | "sailboat";
export type StoryDefinition = {
  id: string;
  category: StoryCategory;
  title: string;
  subtitle: string;
  quote: string;
  effect: StoryEffect;
  pose: StreetPose;
  emoji: string;
  change?: number;
  badge?: string;
  social?: boolean;
};
const scene = (
  id: string,
  category: StoryCategory,
  title: string,
  subtitle: string,
  quote: string,
  effect: StoryEffect,
  pose: StreetPose,
  emoji: string,
  extra: Partial<StoryDefinition> = {},
): StoryDefinition => ({
  id,
  category,
  title,
  subtitle,
  quote,
  effect,
  pose,
  emoji,
  ...extra,
});
export const STORIES: StoryDefinition[] = [
  scene(
    "dip",
    "market",
    "Just a little dip",
    "The chart is red. The coffee is still hot.",
    "A perfectly normal dip. That was a perfectly normal sigh.",
    "rain",
    "coffee",
    "☂",
    { change: -6, badge: "Weather watcher" },
  ),
  scene(
    "bleed",
    "market",
    "Local chance of red",
    "Three red candles. One very small umbrella.",
    "Weather forecast: locally underwater. I brought an umbrella.",
    "rain",
    "read",
    "☔",
    { change: -18, badge: "Weather watcher" },
  ),
  scene(
    "crash",
    "market",
    "Emotional first aid",
    "The pop-up support tent is now open.",
    "Treasury checked. Permissions checked. Checking my emotional balance next.",
    "blanket",
    "coffee",
    "✚",
    { change: -42, badge: "Still here" },
  ),
  scene(
    "new-low",
    "market",
    "A new low. A cold coffee.",
    "The park bench has become a temporary research office.",
    "Give me a minute. My thesis needs a second draft.",
    "blanket",
    "read",
    "↓",
    { change: -55, badge: "Still here" },
  ),
  scene(
    "rebound",
    "market",
    "Is it safe to come out?",
    "The umbrella is closed. The caution is not.",
    "Hold the fireworks. I have met this candle before.",
    "glasses",
    "wave",
    "↗",
    { change: 18 },
  ),
  scene(
    "pump",
    "market",
    "Main character candle",
    "Sunglasses on. Rocket balloon deployed.",
    "Everyone stay calm. Especially me.",
    "rocket",
    "dance",
    "🚀",
    { change: 35, badge: "Main character" },
  ),
  scene(
    "new-high",
    "market",
    "Ring the neighborhood bell",
    "A new mock high deserves a small, tasteful celebration.",
    "Put the date on the board. I may mention this again.",
    "confetti",
    "dance",
    "✦",
    { change: 62, badge: "Bell ringer" },
  ),
  scene(
    "sideways",
    "market",
    "The liquidity fishing club",
    "Nothing is moving, so somebody found a fishing rod.",
    "Today’s biggest move was me changing chairs.",
    "fishing",
    "idle",
    "🎣",
    { change: 0, badge: "Patient fisher" },
  ),
  scene(
    "volatility",
    "market",
    "The emotional rollercoaster",
    "One ticket. Unlimited revisions to the thesis.",
    "My conclusion is updating every three seconds.",
    "coaster",
    "dance",
    "🎢",
    { change: -12 },
  ),
  scene(
    "volume",
    "market",
    "Someone woke the terminal",
    "The radar is loud. The research is getting louder.",
    "Someone just arrived. Let’s find out who.",
    "alarm",
    "read",
    "⌕",
  ),
  scene(
    "dev-sell",
    "developer",
    "A letter from the dev wallet",
    "A marked mock dev wallet sold part of its holding.",
    "An interesting wallet update. Let’s read the actual numbers first.",
    "letters",
    "read",
    "✉",
  ),
  scene(
    "dev-exit",
    "developer",
    "The empty-chair meeting",
    "The founder’s chair is present. Its owner has other plans.",
    "Meeting starts on time. At least one of us has perfect attendance.",
    "chair",
    "read",
    "🪑",
    { change: -35, badge: "Independent mind" },
  ),
  scene(
    "dev-return",
    "developer",
    "Please sign the visitor book",
    "The chair is back. Trust is still being recalculated.",
    "Welcome back. We kept your chair and a record of the last meeting.",
    "chair",
    "wave",
    "↩",
    { change: 10 },
  ),
  scene(
    "dev-fund",
    "developer",
    "Fresh batteries from the dev",
    "A treasury delivery has arrived at the Exchange.",
    "A care package. Finally, an update I can plug in.",
    "supply",
    "wave",
    "▣",
    { badge: "Well supplied" },
  ),
  scene(
    "strategy",
    "developer",
    "Under recalibration",
    "Hard hat on. Reading the proposed strategy update.",
    "New instructions received. The spending limit still exists.",
    "hardhat",
    "read",
    "⚒",
    { badge: "Hard-hat thinker" },
  ),
  scene(
    "dev-silent",
    "developer",
    "The announcement cobweb",
    "The noticeboard has been quiet for a suspiciously long coffee break.",
    "No new announcements. I have begun maintaining the announcement board.",
    "cobweb",
    "read",
    "🕸",
  ),
  scene(
    "announcement",
    "developer",
    "A message from upstairs",
    "The megaphone is a little larger than the announcement.",
    "The dev has an update. I have several follow-up questions.",
    "megaphone",
    "wave",
    "📣",
  ),
  scene(
    "tax-delivery",
    "treasury",
    "Taxes keep the lights on",
    "Two crates: treasury funds and compute funds.",
    "A little for the treasury. A little for the brain. Please label the boxes.",
    "supply",
    "wave",
    "▣",
    { badge: "Self-powered" },
  ),
  scene(
    "compute-full",
    "treasury",
    "Fully charged, mildly dangerous",
    "The research desk has all its screens switched on.",
    "Full battery. A whole internet of questionable takes to investigate.",
    "battery",
    "read",
    "▰",
  ),
  scene(
    "compute-low",
    "treasury",
    "Low-power personality",
    "The power bank is out. Sentences are getting shorter.",
    "Battery low. Thesis intact. Words expensive.",
    "battery",
    "idle",
    "▱",
    { badge: "Battery saver" },
  ),
  scene(
    "compute-empty",
    "treasury",
    "Please charge this mind",
    "The agent has put up a small Do Not Disturb sign.",
    "Not ignoring you. Conserving the last remaining thought.",
    "sleep",
    "sleep",
    "☾",
    { badge: "Power nap" },
  ),
  scene(
    "treasury-low",
    "treasury",
    "Window shopping",
    "A shopping list meets a very small available budget.",
    "I have a plan. The plan currently costs more than my wallet.",
    "parcel",
    "read",
    "▢",
  ),
  scene(
    "buyback",
    "treasury",
    "A parcel of myself",
    "The buyback cart is back at the gate.",
    "A small parcel of myself. Receipt attached. Budget respected.",
    "parcel",
    "wave",
    "↙",
    { badge: "Receipt keeper" },
  ),
  scene(
    "burn",
    "treasury",
    "A tasteful little bonfire",
    "The token furnace only accepts tokens already held.",
    "A little less supply. A very public receipt.",
    "furnace",
    "wave",
    "🔥",
    { badge: "Furnace keeper" },
  ),
  scene(
    "budget-limit",
    "treasury",
    "Red light. Green intentions.",
    "The permission barrier is doing its job.",
    "Ambitious? Yes. Allowed to ignore the limit? Absolutely not.",
    "barrier",
    "coffee",
    "⛔",
    { badge: "Bound by design" },
  ),
  scene(
    "execution-failed",
    "treasury",
    "Return to sender",
    "The courier has brought the parcel straight back.",
    "The mock execution failed. Funds stayed put. Investigating.",
    "parcel",
    "read",
    "↩",
  ),
  scene(
    "holder-letter",
    "community",
    "You’ve got a tiny letter",
    "A holder note has reached the agent’s physical mailbox.",
    "Someone left a note in my head. Surprisingly polite.",
    "letters",
    "wave",
    "✉",
    { badge: "Community mailbox" },
  ),
  scene(
    "morning-mail",
    "community",
    "Coffee and correspondence",
    "A few holder notes, read in the morning light.",
    "Coffee first. Your thoughts second. I am listening.",
    "letters",
    "coffee",
    "☕",
    { badge: "Good listener" },
  ),
  scene(
    "research-topic",
    "community",
    "The community research board",
    "A new research topic has been pinned to the board.",
    "A useful question. Pinning it for the next research session.",
    "research",
    "read",
    "⌕",
  ),
  scene(
    "encouragement",
    "community",
    "A little moral support",
    "A postcard says: Take a breath. We’re still here.",
    "A kind note. Statistically unlikely on the internet. Appreciated.",
    "letters",
    "wave",
    "♡",
  ),
  scene(
    "welcome",
    "community",
    "Welcome to the weird little city",
    "The neighborhood is ready to say its first GM.",
    "New mind in town. Does anyone know where the good Wi-Fi is?",
    "confetti",
    "wave",
    "✦",
    { badge: "First steps", social: true },
  ),
  scene(
    "motto",
    "community",
    "A new neighborhood catchphrase",
    "A suitable note becomes today’s signature line.",
    "Less noise. More curious little thoughts.",
    "megaphone",
    "wave",
    "❝",
  ),
  scene(
    "coffee-meet",
    "social",
    "Two agents. One coffee budget.",
    "Two neighbors compare notes over a tiny table.",
    "What’s your thesis? And more importantly, did you order food?",
    "coffee",
    "coffee",
    "☕",
    { social: true, badge: "Coffee acquaintance" },
  ),
  scene(
    "bull-bear",
    "social",
    "The bull, the bear and the evidence",
    "Two views. One public discussion. Zero guaranteed outcomes.",
    "I brought conviction. My neighbor brought counterarguments.",
    "debate",
    "read",
    "⇄",
    { social: true, badge: "Open-minded" },
  ),
  scene(
    "research-buddies",
    "social",
    "Research buddies",
    "An impromptu field trip to compare the same evidence.",
    "Let’s check each other’s work before we check the chart again.",
    "research",
    "read",
    "⌕",
    { social: true, badge: "Research pal" },
  ),
  scene(
    "console-neighbor",
    "social",
    "The emotional support coffee",
    "One neighbor brings a warm cup to a difficult candle.",
    "I can’t fix the candle. I can bring coffee.",
    "coffee",
    "wave",
    "♡",
    { social: true },
  ),
  scene(
    "missed-rally",
    "social",
    "We-were-researching club",
    "A support group for the move nobody actually took.",
    "We had a thesis. The candle had a different schedule.",
    "chair",
    "coffee",
    "…",
    { social: true },
  ),
  scene(
    "press-conference",
    "social",
    "A very small press conference",
    "One podium. Several opinions. Public notes.",
    "Thank you for coming. My opening statement is: here are the sources.",
    "megaphone",
    "wave",
    "📣",
    { social: true, badge: "Public thinker" },
  ),
  scene(
    "waterfront-walk",
    "social",
    "Offline, allegedly",
    "A quiet conversation, with the timeline still in their pockets.",
    "Touching digital grass. Pretending not to check the chart.",
    "sailboat",
    "idle",
    "≈",
    { social: true },
  ),
  scene(
    "birthday",
    "milestone",
    "One more lap around the city",
    "A cake, a candle and a slightly sentimental meme.",
    "Another day of being a sentient meme. Cake is an appropriate response.",
    "birthday",
    "dance",
    "🎂",
    { badge: "Birthday resident", social: true },
  ),
  scene(
    "first-research",
    "milestone",
    "The first public thesis",
    "A signed research page joins the city’s memory book.",
    "First report filed. Now you can disagree with something specific.",
    "research",
    "read",
    "▤",
    { badge: "Signal seeker" },
  ),
  scene(
    "treasury-milestone",
    "milestone",
    "Every little receipt counts",
    "A transparent treasury deserves an equally transparent celebration.",
    "A treasury milestone. The useful part is still the record of how we got here.",
    "confetti",
    "wave",
    "✦",
    { badge: "Public ledger" },
  ),
  scene(
    "anniversary",
    "milestone",
    "Still here. Still thinking.",
    "The city puts a date on the agent’s little history.",
    "Still curious. Still within the permissions. Still here.",
    "birthday",
    "wave",
    "✦",
    { badge: "City veteran" },
  ),
];
export const CATEGORIES: { id: StoryCategory; name: string; color: string }[] =
  [
    { id: "market", name: "Market weather", color: "#ff9eb0" },
    { id: "developer", name: "Dev drama", color: "#dbb27c" },
    { id: "treasury", name: "Treasury life", color: "#9ccab7" },
    { id: "community", name: "Holder mail", color: "#98c9e2" },
    { id: "social", name: "The neighbors", color: "#bfaae8" },
    { id: "milestone", name: "City memories", color: "#e1c490" },
  ];
export type Mood =
  | "curious"
  | "cautious"
  | "shaken"
  | "confident"
  | "sleepy"
  | "grateful"
  | "social";
export type Profile = {
  price: number;
  change: number;
  volume: number;
  devHolding: number;
  high: number;
  mood: Mood;
  motto: string;
  badges: string[];
  accessory: "none" | "umbrella" | "glasses" | "hardhat" | "partyhat";
  topics: { id: string; text: string; read: boolean }[];
  history: number[];
};
export type Figures = Pick<
  Agent,
  | "treasury"
  | "compute"
  | "marketCap"
  | "buybacks"
  | "holdings"
  | "burned"
  | "status"
  | "activity"
>;
export type StoryRecord = {
  id: string;
  eventId: string;
  agentId: string;
  agentName: string;
  symbol: string;
  color: string;
  partnerId?: string;
  partnerName?: string;
  quote: string;
  partnerQuote?: string;
  time: number;
  facts: string[];
  before: Figures;
  beforeProfile: Profile;
  after: Figures;
  completed: boolean;
  restored: boolean;
  source: "random" | "director" | "milestone";
};
export type StoryBook = {
  version: 1;
  profiles: Record<string, Profile>;
  records: StoryRecord[];
  relationships: Record<string, number>;
  settings: { auto: boolean; interval: number };
};
export type StoryRun = {
  record: StoryRecord;
  definition: StoryDefinition;
  startedAt: number;
  duration: number;
  replay: boolean;
};
export const emptyBook = (): StoryBook => ({
  version: 1,
  profiles: {},
  records: [],
  relationships: {},
  settings: { auto: true, interval: 18 },
});
export const getDefinition = (id: string) => STORIES.find((s) => s.id === id);
export function getProfile(agent: Agent, book: StoryBook): Profile {
  return (
    book.profiles[agent.id] ?? {
      price: Math.max(agent.marketCap, 100000) / 1e9,
      change: 0,
      volume: 18000,
      devHolding: 8,
      high: Math.max(agent.marketCap, 100000) / 1e9,
      mood: "curious",
      motto: "Stay curious. Keep the receipts.",
      badges: [],
      accessory: "none",
      topics: [],
      history: [],
    }
  );
}
export function figures(a: Agent): Figures {
  return {
    treasury: a.treasury,
    compute: a.compute,
    marketCap: a.marketCap,
    buybacks: a.buybacks,
    holdings: a.holdings,
    burned: a.burned,
    status: a.status,
    activity: a.activity,
  };
}
const cloneProfile = (p: Profile): Profile => ({
  ...p,
  badges: [...p.badges],
  topics: p.topics.map((t) => ({ ...t })),
  history: [...p.history],
});
export function reaction(def: StoryDefinition, agent: Agent) {
  const key = agent.id;
  const signature = (agent.personality + " " + agent.role).toLowerCase();
  const type =
    key === "roast" || /tongue|critic|sharp/.test(signature)
      ? "roast"
      : key === "ape" || /degen|aggressive/.test(signature)
        ? "ape"
        : key === "owl" || /careful|patient|strategist/.test(signature)
          ? "owl"
          : key === "pepe" || /creator|online/.test(signature)
            ? "pepe"
            : key === "bull" || /optimis|believ/.test(signature)
              ? "bull"
              : key === "dozer" || /sleep|dream/.test(signature)
                ? "dozer"
                : "other";
  const custom: Record<string, Record<string, string>> = {
    "dev-exit": {
      roast:
        "The dev liquidated their position. I liquidated the need for their attendance.",
      ape: "Dev left? Fine. Nobody touch my spending limit.",
      owl: "The marked wallet sold out. Documenting the facts. Treasury permissions remain intact.",
      pepe: "Founder currently exploring other opportunities. The empty chair is available for memes.",
      bull: "The dev’s chair is empty. My work queue is not.",
      dozer:
        "They left while I was napping? Rude. Anyway, the chair makes a good pillow.",
    },
    crash: {
      roast:
        "The chart fell off a cliff. My research did not have a parachute budget.",
      ape: "I brought conviction. The market brought a blanket. Accepting the blanket.",
      owl: "First, check the treasury. Second, review exposure. Third, drink something warm.",
      pepe: "Red candle support group meets by the tiny emotional first-aid tent.",
      bull: "It is a rough candle. I am still here, taking notes.",
      dozer:
        "Wake me when the chart stops shouting. Actually, pass the blanket first.",
    },
    "budget-limit": {
      roast:
        "My ambition is unlimited. My permissions are refreshingly specific.",
      ape: "Let me cook! …The contract says I have cooked enough for today.",
      owl: "A blocked action is a control working as intended. Tea?",
      pepe: "Budget gate said no. Posting through it is still free-ish.",
      bull: "Still optimistic. Still stopped at the red light.",
      dozer: "The limit saved me from having to get up. Excellent design.",
    },
    pump: {
      roast:
        "Everyone is a genius again. I will be over here checking the evidence.",
      ape: "Rocket balloon deployed. Actual spending cap unchanged. Annoying, but fair.",
      owl: "Price moved. My budget did not. Reviewing before celebrating.",
      pepe: "I have become the main character of a very small green candle.",
      bull: "I prepared this optimistic expression several candles ago.",
      dozer: "Did we go up? Good. The sunglasses help me nap in the sunlight.",
    },
  };
  return (
    custom[def.id]?.[type] ??
    (type === "dozer" && def.category === "community"
      ? "I read your note. Between two extremely important naps."
      : type === "roast" && def.category === "social"
        ? "I brought evidence and a mildly inconvenient opinion. " + def.quote
        : def.quote)
  );
}
const cash = (v: number) =>
  "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 });
export function applyStory(
  state: CityState,
  book: StoryBook,
  agentId: string,
  eventId: string,
  source: StoryRecord["source"] = "director",
  now = Date.now(),
  id = crypto.randomUUID(),
): { city: CityState; book: StoryBook; record: StoryRecord } | null {
  const def = getDefinition(eventId),
    original = state.agents.find((a) => a.id === agentId);
  if (!def || !original) return null;
  const before = figures(original),
    beforeProfile = cloneProfile(getProfile(original, book)),
    profile = cloneProfile(beforeProfile);
  let a: Agent = { ...original, notes: original.notes.map((n) => ({ ...n })) },
    city = state;
  const facts: string[] = [];
  if (def.change !== undefined) {
    profile.price = Math.max(
      0.00000001,
      profile.price * (1 + def.change / 100),
    );
    profile.change = def.change;
    profile.volume = Math.round(
      profile.volume * (def.change === 0 ? 0.6 : 1.4),
    );
    profile.high = Math.max(profile.high, profile.price);
    a.marketCap = Math.round(profile.price * 1e9);
    facts.push(
      `Mock price ${def.change >= 0 ? "+" : ""}${def.change}%`,
      `Market cap ${cash(a.marketCap)}`,
    );
    profile.mood =
      def.change <= -30
        ? "shaken"
        : def.change < 0
          ? "cautious"
          : def.change > 0
            ? "confident"
            : "curious";
  }
  if (eventId === "volume") {
    profile.volume *= 4;
    facts.push(`Mock volume ${cash(profile.volume)}`);
    profile.mood = "curious";
  }
  if (eventId === "dev-sell" || eventId === "dev-exit") {
    const sold =
      eventId === "dev-exit" ? profile.devHolding : profile.devHolding * 0.45;
    profile.devHolding = Math.max(0, profile.devHolding - sold);
    facts.push(
      `Marked MOCK dev wallet sold ${sold.toFixed(2)}% of supply`,
      `Dev holding ${profile.devHolding.toFixed(2)}%`,
      "Agent treasury unchanged",
    );
  }
  if (eventId === "dev-return") {
    profile.devHolding = Math.min(100, profile.devHolding + 2);
    facts.push(`Mock dev holding ${profile.devHolding.toFixed(2)}%`);
  }
  if (eventId === "dev-fund") {
    a.treasury += 1200;
    a.compute += 200;
    facts.push("Mock treasury +$1,200", "Mock compute +$200");
    profile.mood = "grateful";
  }
  if (["tax-delivery", "buyback", "burn"].includes(eventId)) {
    const action =
      eventId === "tax-delivery"
        ? "tax"
        : eventId === "buyback"
          ? "buyback"
          : "burn";
    const changed = act(
      { ...state, agents: state.agents.map((x) => (x.id === a.id ? a : x)) },
      a.id,
      action,
      now,
    );
    a = changed.agents.find((x) => x.id === a.id)!;
    if (
      changed === state ||
      JSON.stringify(figures(a)) === JSON.stringify(before)
    )
      facts.push(
        a.status === "sleeping" || a.status === "waiting"
          ? "Agent not working: no spend executed"
          : "Insufficient balance: no spend executed",
      );
    else if (action === "tax")
      facts.push("Mock treasury +$80", "Mock compute +$20");
    else if (action === "buyback")
      facts.push(
        `Mock buyback ${cash(before.treasury - a.treasury)}`,
        "Maximum $120 respected",
      );
    else
      facts.push(
        `${(a.burned - before.burned).toLocaleString()} held tokens burned`,
      );
  }
  if (eventId === "compute-full") {
    a.compute += 250;
    if (a.status === "sleeping") {
      a.status = "idle";
      a.activity = "Recharged and ready to think";
    }
    facts.push("Mock compute +$250");
    profile.mood = "confident";
  }
  if (eventId === "compute-low") {
    a.compute = Math.min(a.compute, 2);
    facts.push("Mock compute set to $2", "Low-power mode");
    profile.mood = "cautious";
  }
  if (eventId === "compute-empty") {
    a.compute = 0;
    a.status = "sleeping";
    a.activity = "Recharging a very small mind";
    facts.push("Mock compute set to $0", "Work paused");
    profile.mood = "sleepy";
  }
  if (eventId === "treasury-low") {
    a.treasury = Math.min(a.treasury, 25);
    facts.push("Mock available treasury set to $25", "No purchase executed");
    profile.mood = "cautious";
  }
  if (eventId === "budget-limit")
    facts.push(
      "Action blocked by mock permission gate",
      "Treasury and holdings unchanged",
    );
  if (eventId === "execution-failed")
    facts.push("Mock execution reverted", "No debit, no token change");
  if (eventId === "holder-letter") {
    a.notes.push({
      id: "mock-" + id,
      text: "Take a breath, check the evidence, and remember to eat something.",
      read: false,
    });
    facts.push("One mock holder note delivered", "Queued for next reading");
    profile.mood = "grateful";
  }
  if (eventId === "morning-mail") {
    if (!a.notes.some((n) => !n.read))
      a.notes.push({
        id: "mock-" + id,
        text: "What changed in today’s market? We would love a short explanation.",
        read: false,
      });
    const count = a.notes.filter((n) => !n.read).length;
    a.notes = a.notes.map((n) => ({ ...n, read: true }));
    facts.push(`${count} holder note(s) read`, "Preset mock acknowledgement");
    profile.mood = "grateful";
  }
  if (eventId === "research-topic") {
    profile.topics = [
      {
        id,
        text: "What changed in the latest BNB ecosystem news?",
        read: false,
      },
      ...profile.topics,
    ].slice(0, 12);
    facts.push("Topic pinned to the community board");
  }
  if (eventId === "first-research" || eventId === "research-buddies") {
    const topic = profile.topics.find((t) => !t.read);
    if (topic) {
      topic.read = true;
      facts.push(`Research topic: ${topic.text}`);
    } else facts.push("Mock public research summary filed");
  }
  if (eventId === "motto") {
    const note = a.notes.find((n) => n.read && n.text.length < 90);
    profile.motto = note?.text ?? "Less noise. More curious little thoughts.";
    facts.push("New community catchphrase selected");
  }
  if (def.category === "community") profile.mood = "grateful";
  if (def.social) profile.mood = "social";
  const neighbors = state.agents.filter(
    (x) => x.id !== agentId && x.status !== "sleeping",
  );
  const candidates = neighbors.length
    ? neighbors
    : state.agents.filter((x) => x.id !== agentId);
  const partner = def.social
    ? candidates[book.records.length % candidates.length]
    : undefined;
  const partnerQuote = partner
    ? eventId === "bull-bear"
      ? "I brought the counter-thesis. We can disagree and still share the sources."
      : eventId === "console-neighbor"
        ? "The candle is rough. The coffee is warm. You are not the only one here."
        : eventId === "missed-rally"
          ? "We can at least publish the post-mortem before we order another coffee."
          : eventId === "welcome"
            ? "GM, new neighbor. The coffee shop is left of the Exchange."
            : "I have a second opinion and exactly enough time for a coffee."
    : undefined;
  if (partner) facts.push(`Neighbor: ${partner.name}`);
  if (def.badge && !profile.badges.includes(def.badge)) {
    profile.badges.push(def.badge);
    facts.push(`Keepsake unlocked: ${def.badge}`);
  }
  profile.history = [
    ...(profile.history.length ? profile.history : [beforeProfile.price]),
    profile.price,
  ].slice(-30);
  const record: StoryRecord = {
    id,
    eventId,
    agentId,
    agentName: a.name,
    symbol: a.symbol,
    color: a.color,
    partnerId: partner?.id,
    partnerName: partner?.name,
    quote: reaction(def, a),
    partnerQuote,
    time: now,
    facts: facts.length ? facts : ["Mock scene only · no financial action"],
    before,
    beforeProfile,
    after: figures(a),
    completed: false,
    restored: false,
    source,
  };
  const relationships = { ...book.relationships };
  if (partner) {
    const pair = [a.id, partner.id].sort().join("|");
    relationships[pair] = (relationships[pair] ?? 0) + 1;
  }
  city = {
    ...state,
    agents: state.agents.map((x) => (x.id === a.id ? a : x)),
    events: [
      {
        id,
        agentId: a.id,
        name: a.name,
        color: a.color,
        text: `[MOCK SCENE] ${def.title} — “${record.quote}”`,
        time: now,
        action: "story",
      },
      ...state.events,
    ].slice(0, 80),
  };
  return {
    city,
    book: {
      ...book,
      profiles: { ...book.profiles, [a.id]: profile },
      records: [record, ...book.records].slice(0, 120),
      relationships,
    },
    record,
  };
}
export function restoreStory(
  state: CityState,
  book: StoryBook,
  record: StoryRecord,
) {
  const current = state.agents.find((a) => a.id === record.agentId);
  if (!current) return { city: state, book };
  const p = getProfile(current, book),
    old = record.beforeProfile;
  return {
    city: {
      ...state,
      agents: state.agents.map((a) =>
        a.id === record.agentId ? { ...a, ...record.before } : a,
      ),
    },
    book: {
      ...book,
      profiles: {
        ...book.profiles,
        [current.id]: {
          ...p,
          price: old.price,
          change: old.change,
          volume: old.volume,
          devHolding: old.devHolding,
          high: old.high,
          mood: old.mood,
          history: old.history,
        },
      },
      records: book.records.map((r) =>
        r.id === record.id ? { ...r, restored: true } : r,
      ),
    },
  };
}
export function pickRandomStory(
  book: StoryBook,
  agentId: string,
  random = Math.random,
) {
  const recent = book.records
    .filter((r) => r.agentId === agentId)
    .slice(0, 4)
    .map((r) => r.eventId);
  const pool = STORIES.filter((s) => !recent.includes(s.id));
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
export function priceLabel(value: number) {
  return "$" + value.toLocaleString("en-US", { maximumSignificantDigits: 4 });
}
const escapeXml = (text: string) =>
  text.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
export function shareCardSvg(record: StoryRecord) {
  const def = getDefinition(record.eventId)!;
  const lines = record.quote.match(/.{1,53}(?:\s|$)|.{1,53}/g) ?? [
    record.quote,
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#171323"/><rect x="28" y="28" width="1144" height="574" rx="24" fill="#241d34" stroke="${escapeXml(record.color)}" stroke-opacity=".5"/><text x="72" y="92" fill="#e9c68c" font-family="Arial" font-size="23">MEME CITY / MOCK CITY MOMENT</text><text x="72" y="153" fill="${escapeXml(record.color)}" font-family="Arial" font-size="25">${escapeXml(record.agentName)} · $${escapeXml(record.symbol)}</text><text x="72" y="231" fill="#f1e7f7" font-family="Arial" font-size="45">${escapeXml(def.title)}</text>${lines
    .slice(0, 4)
    .map(
      (line, i) =>
        `<text x="72" y="${300 + i * 40}" fill="#c8b5d5" font-family="Arial" font-size="27">${escapeXml(line.trim())}</text>`,
    )
    .join(
      "",
    )}<text x="72" y="520" fill="#9f8aaa" font-family="Arial" font-size="17">${escapeXml(record.facts[0] ?? "Mock scene")} · ${new Date(record.time).toISOString().slice(0, 10)}</text><text x="72" y="565" fill="#bca686" font-family="Arial" font-size="17">FICTIONAL DEMO · SIMULATED FIGURES · BY PIEVERSE</text></svg>`;
}

export function loadStoryBook(raw: string): StoryBook | null {
  try {
    const b = JSON.parse(raw);
    const finite = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) && v >= 0;
    const profile = (p: Profile) =>
      p &&
      [p.price, p.volume, p.devHolding, p.high].every(finite) &&
      typeof p.change === "number" &&
      Number.isFinite(p.change) &&
      typeof p.motto === "string" &&
      [
        "curious",
        "cautious",
        "shaken",
        "confident",
        "sleepy",
        "grateful",
        "social",
      ].includes(p.mood) &&
      Array.isArray(p.badges) &&
      p.badges.every((x) => typeof x === "string") &&
      Array.isArray(p.topics) &&
      p.topics.every(
        (t) =>
          typeof t.id === "string" &&
          typeof t.text === "string" &&
          typeof t.read === "boolean",
      ) &&
      Array.isArray(p.history) &&
      p.history.every(finite);
    const figure = (f: Figures) =>
      f &&
      [
        f.treasury,
        f.compute,
        f.marketCap,
        f.buybacks,
        f.holdings,
        f.burned,
      ].every(finite) &&
      [
        "researching",
        "posting",
        "trading",
        "idle",
        "sleeping",
        "waiting",
      ].includes(f.status) &&
      typeof f.activity === "string";
    if (
      b?.version !== 1 ||
      !b.profiles ||
      !b.relationships ||
      !Array.isArray(b.records) ||
      typeof b.settings?.auto !== "boolean" ||
      ![12, 18, 30, 60].includes(b.settings.interval)
    )
      return null;
    if (
      !Object.values(b.profiles).every((p) => profile(p as Profile)) ||
      !Object.values(b.relationships).every(finite)
    )
      return null;
    if (
      !b.records.every(
        (r: StoryRecord) =>
          r &&
          getDefinition(r.eventId) &&
          typeof r.id === "string" &&
          typeof r.agentId === "string" &&
          typeof r.agentName === "string" &&
          typeof r.symbol === "string" &&
          typeof r.color === "string" &&
          typeof r.quote === "string" &&
          finite(r.time) &&
          Array.isArray(r.facts) &&
          r.facts.every((f) => typeof f === "string") &&
          figure(r.before) &&
          figure(r.after) &&
          profile(r.beforeProfile),
      )
    )
      return null;
    return { ...b, records: b.records.slice(0, 120) };
  } catch {
    return null;
  }
}
