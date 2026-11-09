import { describe, expect, test } from "bun:test";
import { initialState } from "./simulation";
import {
  STORIES,
  applyStory,
  emptyBook,
  figures,
  getProfile,
  loadStoryBook,
  pickRandomStory,
  reaction,
  restoreStory,
  shareCardSvg,
} from "./stories";
describe("mock city stories", () => {
  test("every scene can run without mutating its input or producing negative balances", () => {
    for (const definition of STORIES) {
      const city = initialState(),
        book = emptyBook(),
        snapshot = JSON.stringify({ city, book });
      const result = applyStory(city, book, city.agents[0].id, definition.id)!;
      expect(result).not.toBeNull();
      expect(JSON.stringify({ city, book })).toBe(snapshot);
      for (const a of result.city.agents) {
        expect(a.treasury).toBeGreaterThanOrEqual(0);
        expect(a.compute).toBeGreaterThanOrEqual(0);
        expect(a.holdings).toBeGreaterThanOrEqual(0);
      }
      expect(result.book.records).toHaveLength(1);
    }
  });
  test("dev exit clears the marked mock wallet without draining the agent treasury", () => {
    const city = initialState(),
      a = city.agents[0];
    const result = applyStory(city, emptyBook(), a.id, "dev-exit")!;
    expect(getProfile(a, result.book).devHolding).toBe(0);
    expect(result.city.agents[0].treasury).toBe(a.treasury);
    expect(result.city.agents[0].marketCap).toBeLessThan(a.marketCap);
  });
  test("blocked and reverted executions cannot debit funds", () => {
    const c = initialState();
    for (const id of ["budget-limit", "execution-failed"]) {
      const result = applyStory(c, emptyBook(), c.agents[0].id, id)!;
      expect(figures(result.city.agents[0])).toEqual(figures(c.agents[0]));
    }
  });
  test("buybacks respect available balance and cap, burns require held tokens", () => {
    const c = initialState();
    c.agents[0].treasury = 7;
    c.agents[0].holdings = 0;
    const result = applyStory(c, emptyBook(), c.agents[0].id, "buyback")!;
    expect(result.city.agents[0].treasury).toBe(0);
    expect(result.city.agents[0].buybacks - c.agents[0].buybacks).toBe(7);
    const burned = applyStory(
      result.city,
      result.book,
      c.agents[0].id,
      "burn",
    )!;
    expect(burned.city.agents[0].holdings).toBe(0);
    expect(burned.city.agents[0].burned - c.agents[0].burned).toBe(700);
  });
  test("restoring figures preserves notes written afterwards and other agents", () => {
    const c = initialState(),
      result = applyStory(c, emptyBook(), c.agents[0].id, "crash")!;
    result.city.agents[0].notes.push({
      id: "user-note",
      text: "Please keep this",
      read: false,
    });
    const restored = restoreStory(result.city, result.book, result.record);
    expect(figures(restored.city.agents[0])).toEqual(figures(c.agents[0]));
    expect(
      restored.city.agents[0].notes.some((n) => n.id === "user-note"),
    ).toBe(true);
    expect(restored.city.agents[1]).toEqual(c.agents[1]);
    expect(restored.book.profiles[c.agents[0].id].badges).toContain(
      "Still here",
    );
  });
  test("mail is read and a queued research topic is consumed", () => {
    const c = initialState();
    c.agents[0].notes = [{ id: "real", text: "Read the sources", read: false }];
    const mail = applyStory(c, emptyBook(), c.agents[0].id, "morning-mail")!;
    expect(mail.city.agents[0].notes[0].read).toBe(true);
    const topic = applyStory(
      mail.city,
      mail.book,
      c.agents[0].id,
      "research-topic",
    )!;
    const research = applyStory(
      topic.city,
      topic.book,
      c.agents[0].id,
      "first-research",
    )!;
    expect(research.book.profiles[c.agents[0].id].topics[0].read).toBe(true);
  });
  test("neighbors have reciprocal memory and different personalities react differently", () => {
    const c = initialState(),
      b = applyStory(c, emptyBook(), c.agents[0].id, "coffee-meet")!;
    expect(b.record.partnerId).not.toBe(c.agents[0].id);
    expect(Object.values(b.book.relationships)).toEqual([1]);
    const def = STORIES.find((s) => s.id === "crash")!;
    expect(reaction(def, c.agents[0])).not.toBe(reaction(def, c.agents[1]));
  });
  test("random selection avoids the last four scenes for the selected agent", () => {
    let c = initialState(),
      b = emptyBook();
    for (const id of ["dip", "crash", "dev-exit", "pump"]) {
      const result = applyStory(c, b, c.agents[0].id, id)!;
      c = result.city;
      b = result.book;
    }
    for (const value of [0, 0.3, 0.6, 0.99])
      expect(["dip", "crash", "dev-exit", "pump"]).not.toContain(
        pickRandomStory(b, c.agents[0].id, () => value).id,
      );
  });
  test("saved stories roundtrip while corrupt snapshots are rejected", () => {
    const c = initialState(),
      b = applyStory(c, emptyBook(), c.agents[0].id, "dev-exit")!.book;
    expect(loadStoryBook(JSON.stringify(b))).toEqual(b);
    b.records[0].before.treasury = -1;
    expect(loadStoryBook(JSON.stringify(b))).toBeNull();
    expect(loadStoryBook("{oops")).toBeNull();
    expect(loadStoryBook('{"version":1}')).toBeNull();
  });
  test("share cards escape names and quotes instead of injecting SVG markup", () => {
    const c = initialState(),
      r = applyStory(c, emptyBook(), c.agents[0].id, "dip")!.record;
    r.agentName = "<script>alert(1)</script>";
    r.quote = 'Hello <image href="bad"/>';
    const svg = shareCardSvg(r);
    expect(svg).not.toContain("<script>");
    expect(svg).not.toContain("<image");
    expect(svg).toContain("&lt;script&gt;");
    expect(svg).toContain("FICTIONAL DEMO");
  });
});
