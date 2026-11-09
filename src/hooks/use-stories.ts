"use client";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { CityState } from "@/lib/simulation";
import {
  applyStory,
  loadStoryBook,
  emptyBook,
  getDefinition,
  pickRandomStory,
  restoreStory,
  type StoryBook,
  type StoryRecord,
  type StoryRun,
} from "@/lib/stories";
const KEY = "meme-city-stories-v1";
export function useStories(
  city: CityState | null,
  setCity: Dispatch<SetStateAction<CityState | null>>,
  paused: boolean,
  blocked: boolean,
  suspendAuto = false,
) {
  const [book, setBook] = useState<StoryBook>(emptyBook),
    [run, setRun] = useState<StoryRun | null>(null),
    [remaining, setRemaining] = useState(0),
    [ready, setReady] = useState(false);
  const latest = useRef({ city, book, run });
  latest.current = { city, book, run };
  useEffect(() => {
    try {
      const value = loadStoryBook(localStorage.getItem(KEY) || "null");
      if (value) setBook(value);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(KEY, JSON.stringify(book));
      } catch {}
  }, [book, ready]);
  const start = (
    eventId?: string,
    agentId?: string,
    source: StoryRecord["source"] = "director",
  ) => {
    const c = latest.current.city,
      b = latest.current.book;
    if (!c || blocked) return;
    const a =
      c.agents.find((a) => a.id === agentId) ??
      c.agents[Math.floor(Math.random() * c.agents.length)];
    const result = applyStory(
      c,
      b,
      a.id,
      eventId ?? pickRandomStory(b, a.id).id,
      source,
    );
    if (!result) return;
    const next = {
      record: result.record,
      definition: getDefinition(result.record.eventId)!,
      startedAt: Date.now(),
      duration: 18000,
      replay: false,
    };
    latest.current = { city: result.city, book: result.book, run: next };
    setCity(result.city);
    setBook(result.book);
    setRemaining(18000);
    setRun(next);
  };
  const finish = () => {
    const active = latest.current.run;
    if (active && !active.replay)
      setBook((b) => ({
        ...b,
        records: b.records.map((r) =>
          r.id === active.record.id ? { ...r, completed: true } : r,
        ),
      }));
    setRun(null);
    latest.current.run = null;
    setRemaining(0);
  };
  useEffect(() => {
    if (!run || paused || blocked) return;
    let last = Date.now();
    const timer = setInterval(() => {
      const now = Date.now(),
        elapsed = now - last;
      last = now;
      setRemaining((r) => Math.max(0, r - elapsed));
    }, 1000);
    return () => clearInterval(timer);
  }, [run?.record.id, run?.startedAt, paused, blocked]);
  useEffect(() => {
    if (run && remaining <= 0) finish();
  }, [remaining, !!run]);
  useEffect(() => {
    if (
      !ready ||
      !city ||
      paused ||
      blocked ||
      run ||
      !book.settings.auto ||
      suspendAuto
    )
      return;
    const timer = setTimeout(
      () => start(undefined, undefined, "random"),
      book.records.length ? book.settings.interval * 1000 : 8000,
    );
    return () => clearTimeout(timer);
  }, [
    ready,
    !!city,
    paused,
    blocked,
    !!run,
    book.settings.auto,
    book.settings.interval,
    book.records.length,
    suspendAuto,
  ]);
  const replay = (record: StoryRecord) => {
    if (blocked) return;
    setRemaining(18000);
    setRun({
      record,
      definition: getDefinition(record.eventId)!,
      startedAt: Date.now(),
      duration: 18000,
      replay: true,
    });
  };
  const restore = (record: StoryRecord) => {
    const c = latest.current.city;
    if (
      !c ||
      latest.current.book.records.find((r) => r.agentId === record.agentId)
        ?.id !== record.id ||
      latest.current.book.records.find((r) => r.id === record.id)?.restored
    )
      return;
    const result = restoreStory(c, latest.current.book, record);
    setCity(result.city);
    setBook(result.book);
    setRun(null);
    latest.current = { city: result.city, book: result.book, run: null };
  };
  return {
    book,
    run,
    remaining,
    start,
    finish,
    replay,
    restore,
    setBook,
    reset: () => {
      setBook(emptyBook());
      setRun(null);
      setRemaining(0);
    },
  };
}
