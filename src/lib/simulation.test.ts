import { describe, expect, test } from "bun:test";
import {
  act,
  advance,
  createAgent,
  initialState,
  loadState,
  MAX_AGENTS,
} from "./simulation";
describe("simulation rules", () => {
  test("buybacks debit treasury and add token holdings without changing the input", () => {
    const s = initialState();
    const before = s.agents[0];
    const next = act(s, "roast", "buyback");
    expect(next.agents[0].treasury).toBe(before.treasury - 120);
    expect(next.agents[0].holdings).toBe(before.holdings + 12000);
    expect(s.agents[0]).toBe(before);
    expect(s.events.length).toBe(6);
  });
  test("buybacks are capped by the available balance", () => {
    const s = initialState();
    s.agents[0].treasury = 30;
    const next = act(s, "roast", "buyback");
    expect(next.agents[0].treasury).toBe(0);
    expect(next.agents[0].buybacks).toBe(s.agents[0].buybacks + 30);
  });
  test("sleep prevents research, posting, trading and burning", () => {
    let s = act(initialState(), "roast", "sleep");
    for (const action of ["research", "post", "buyback", "burn"] as const)
      expect(act(s, "roast", action)).toBe(s);
  });
  test("waking reads pending notes without mutating originals", () => {
    const s = initialState();
    s.agents[5].notes = [
      { id: "note", text: "Read this when awake", read: false },
    ];
    const next = act(s, "dozer", "wake");
    expect(next.agents[5].notes[0].read).toBe(true);
    expect(s.agents[5].notes[0].read).toBe(false);
    expect(next.events[0].text).toContain("Read 1 holder note");
  });
  test("burning consumes only held tokens", () => {
    const s = initialState();
    s.agents[0].holdings = 7;
    const next = act(s, "roast", "burn");
    expect(next.agents[0].holdings).toBe(0);
    expect(next.agents[0].burned).toBe(7);
    expect(next.agents[0].treasury).toBe(s.agents[0].treasury);
  });
  test("tax income is split between compute and treasury", () => {
    const s = initialState();
    const next = act(s, "roast", "tax");
    expect(next.agents[0].treasury - s.agents[0].treasury).toBe(80);
    expect(next.agents[0].compute - s.agents[0].compute).toBe(20);
  });
  test("no compute means no research or posting", () => {
    const s = initialState();
    s.agents[0].compute = 0;
    expect(act(s, "roast", "research")).toBe(s);
    expect(act(s, "roast", "post")).toBe(s);
  });
  test("new agents are unfunded, waiting, and limited by the demo population cap, independently of buildings", () => {
    let s = initialState();
    for (let i = 0; i < MAX_AGENTS; i++)
      s = createAgent(s, {
        name: "MOCHI",
        symbol: "mch",
        personality: "Curious",
        goal: "Explore",
        strategy: "Balanced",
        color: "#a594ff",
      });
    expect(s.agents.length).toBe(MAX_AGENTS);
    expect(s.agents[9].status).toBe("waiting");
    expect(s.agents[9].treasury).toBe(0);
    expect(s.agents[9].symbol).toBe("MCH");
  });
  test("long-running simulation preserves nonnegative balances and bounded history", () => {
    let s = initialState();
    for (let i = 0; i < 1800; i++) s = advance(s);
    expect(s.events.length).toBeLessThanOrEqual(80);
    for (const a of s.agents) {
      expect(a.treasury).toBeGreaterThanOrEqual(0);
      expect(a.compute).toBeGreaterThanOrEqual(0);
      expect(a.holdings).toBeGreaterThanOrEqual(0);
    }
  });
  test("saved state validates structure and rejects corrupted records", () => {
    const s = initialState();
    expect(loadState(JSON.stringify(s))).toEqual(s);
    expect(loadState("bad json")).toBeNull();
    expect(loadState(JSON.stringify({ ...s, agents: [] }))).toBeNull();
    s.agents[0].treasury = -10;
    expect(loadState(JSON.stringify(s))).toBeNull();
  });
});
