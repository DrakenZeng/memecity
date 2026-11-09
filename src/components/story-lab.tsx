"use client";
import { useState } from "react";
import type { Agent } from "@/lib/simulation";
import {
  CATEGORIES,
  STORIES,
  getDefinition,
  getProfile,
  priceLabel,
  shareCardSvg,
  type StoryBook,
  type StoryRecord,
  type StoryRun,
} from "@/lib/stories";
export function downloadStory(r: StoryRecord) {
  const url = URL.createObjectURL(
    new Blob([shareCardSvg(r)], { type: "image/svg+xml" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `meme-city-${r.symbol}-${r.eventId}.svg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function MarketTape({ agent, book }: { agent: Agent; book: StoryBook }) {
  const p = getProfile(agent, book),
    values = p.history.length > 1 ? p.history : [p.price, p.price],
    min = Math.min(...values),
    range = Math.max(...values) - min || p.price * 0.1;
  return (
    <div className="market-tape">
      <span>MOCK MARKET · {p.mood.toUpperCase()}</span>
      <strong>
        {priceLabel(p.price)}{" "}
        <small className={p.change < 0 ? "negative" : "positive"}>
          {p.change >= 0 ? "+" : ""}
          {p.change}%
        </small>
      </strong>
      <svg viewBox="0 0 280 40" aria-label="Mock event price history">
        <polyline
          points={values
            .map(
              (v, i) =>
                `${(i / (values.length - 1)) * 280},${35 - ((v - min) / range) * 30}`,
            )
            .join(" ")}
          fill="none"
          stroke={p.change < 0 ? "#e69aaa" : "#9bd1b1"}
          strokeWidth="2"
        />
      </svg>
      <small>
        Dev wallet {p.devHolding.toFixed(2)}% · {p.badges.length} keepsakes
      </small>
      {p.badges.length > 0 && (
        <p className="keepsakes">
          {p.badges.slice(-4).map((b) => (
            <span key={b}>✦ {b}</span>
          ))}
        </p>
      )}
    </div>
  );
}
export function StoryPlayer({
  run,
  remaining,
  paused,
  onWatch,
  onSkip,
  onReplay,
  onRestore,
}: {
  run: StoryRun;
  remaining: number;
  paused: boolean;
  onWatch: () => void;
  onSkip: () => void;
  onReplay: () => void;
  onRestore: () => void;
}) {
  const stage =
    remaining > 12000
      ? "SOMETHING IS HAPPENING"
      : remaining > 6000
        ? "THE AGENT HAS THOUGHTS"
        : "A LITTLE CITY MEMORY";
  return (
    <aside className="story-player panel" aria-label="Active mock event">
      <div className="story-player-top">
        <span>● MOCK SCENE {run.replay ? " / VISUAL REPLAY" : ""}</span>
        <button onClick={onSkip} aria-label="Skip event">
          ×
        </button>
      </div>
      <div className="story-title">
        <span>{run.definition.emoji}</span>
        <div>
          <small>{paused ? "PAUSED" : stage}</small>
          <h3>{run.definition.title}</h3>
        </div>
      </div>
      <p>{run.definition.subtitle}</p>
      <blockquote>
        <b>{run.record.agentName}</b> “{run.record.quote}”
      </blockquote>
      {run.record.partnerName && (
        <div className="story-reply">
          <b>{run.record.partnerName}</b> “{run.record.partnerQuote}”{" "}
          <small>Neighborhood radio · remote conversation</small>
        </div>
      )}
      <div className="story-facts">
        {run.record.facts.map((f) => (
          <span key={f}>{f}</span>
        ))}
      </div>
      <progress max={18000} value={18000 - remaining} />
      <div className="story-buttons">
        <button onClick={onWatch}>Locate agent ↗</button>
        <button onClick={onReplay}>Replay</button>
        <button onClick={onRestore}>Undo figures</button>
        <button onClick={() => downloadStory(run.record)}>Save card ↓</button>
      </div>
    </aside>
  );
}
export default function StoryLab({
  agents,
  book,
  selected,
  busy,
  start,
  replay,
  restore,
  settings,
  onTopic,
}: {
  agents: Agent[];
  book: StoryBook;
  selected: string | null;
  busy: boolean;
  start: (eventId?: string, agentId?: string) => void;
  replay: (r: StoryRecord) => void;
  restore: (r: StoryRecord) => void;
  settings: (auto: boolean, interval: number) => void;
  onTopic: (id: string, text: string) => void;
}) {
  const [target, setTarget] = useState(selected ?? agents[0].id),
    [category, setCategory] = useState("all"),
    [tab, setTab] = useState("Scenes"),
    [topic, setTopic] = useState("");
  const agent = agents.find((a) => a.id === target) ?? agents[0],
    profile = getProfile(agent, book);
  const records = book.records.filter((r) => r.agentId === agent.id);
  return (
    <div className="story-lab">
      <p className="lab-intro">
        A tiny world with a very dramatic imagination. Every scene and every
        figure here is simulated.
      </p>
      <div className="lab-settings">
        <label>
          Starring
          <select value={agent.id} onChange={(e) => setTarget(e.target.value)}>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} / ${a.symbol}
              </option>
            ))}
          </select>
        </label>
        <label className="lab-auto">
          <input
            type="checkbox"
            checked={book.settings.auto}
            onChange={(e) => settings(e.target.checked, book.settings.interval)}
          />{" "}
          Random events
        </label>
        <label>
          Quiet time
          <select
            value={book.settings.interval}
            onChange={(e) =>
              settings(book.settings.auto, Number(e.target.value))
            }
          >
            {[12, 18, 30, 60].map((n) => (
              <option key={n} value={n}>
                {n}s between scenes
              </option>
            ))}
          </select>
        </label>
      </div>
      <nav className="lab-tabs">
        {["Scenes", "Chronicle", "Daily paper"].map((t) => (
          <button
            key={t}
            className={t === tab ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      {tab === "Scenes" && (
        <>
          <div className="lab-categories">
            <button
              className={category === "all" ? "active" : ""}
              onClick={() => setCategory("all")}
            >
              All {STORIES.length}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={category === c.id ? "active" : ""}
                onClick={() => setCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
          <button
            className="lab-surprise"
            disabled={busy}
            onClick={() => start(undefined, agent.id)}
          >
            ✦ Surprise {agent.name}
          </button>
          <div className="scene-grid">
            {STORIES.filter(
              (s) => category === "all" || s.category === category,
            ).map((s) => (
              <button
                key={s.id}
                disabled={busy}
                onClick={() => start(s.id, agent.id)}
              >
                <span>{s.emoji}</span>
                <div>
                  <strong>{s.title}</strong>
                  <small>{s.subtitle}</small>
                </div>
                <em>↗</em>
              </button>
            ))}
          </div>
          {busy && (
            <p className="lab-notice">
              The Exchange is hatching an agent. Scenes resume after the
              arrival.
            </p>
          )}
        </>
      )}
      {tab === "Chronicle" && (
        <>
          <MarketTape agent={agent} book={book} />
          <p className="agent-motto">“{profile.motto}”</p>
          <div className="relationship-list">
            {Object.entries(book.relationships)
              .filter(([key]) => key.split("|").includes(agent.id))
              .map(([key, n]) => (
                <span key={key}>
                  ☕{" "}
                  {agents.find(
                    (a) =>
                      a.id === key.split("|").find((id) => id !== agent.id),
                  )?.name ?? "Neighbor"}{" "}
                  · {n} shared moment{n > 1 ? "s" : ""}
                </span>
              ))}
          </div>
          <form
            className="topic-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (topic.trim()) {
                onTopic(agent.id, topic.trim());
                setTopic("");
              }
            }}
          >
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={160}
              placeholder="Pin a research topic for this agent…"
              aria-label="Research topic"
            />
            <button disabled={!topic.trim()}>Pin topic</button>
          </form>
          {profile.topics.map((t) => (
            <p className="pinned-topic" key={t.id}>
              {t.read ? "✓" : "⌕"} {t.text}{" "}
              <small>{t.read ? "Reviewed" : "Queued"}</small>
            </p>
          ))}
          <div className="chronicle-list">
            {records.length === 0 ? (
              <p>No memories yet. Give this little mind a story.</p>
            ) : (
              records.map((r) => (
                <article key={r.id}>
                  <small>
                    {new Date(r.time).toLocaleTimeString()} · {r.source} · MOCK
                  </small>
                  <h4>
                    {getDefinition(r.eventId)?.emoji}{" "}
                    {getDefinition(r.eventId)?.title}
                  </h4>
                  <p>“{r.quote}”</p>
                  <small>{r.facts.join(" · ")}</small>
                  <div className="story-buttons">
                    <button disabled={busy} onClick={() => replay(r)}>
                      Visual replay
                    </button>
                    <button
                      disabled={r.restored || busy || records[0]?.id !== r.id}
                      title="Only the latest event for this agent can be undone"
                      onClick={() => restore(r)}
                    >
                      {r.restored ? "Figures restored" : "Undo latest figures"}
                    </button>
                    <button onClick={() => downloadStory(r)}>
                      Save card ↓
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </>
      )}
      {tab === "Daily paper" && (
        <div className="city-newspaper">
          <span>THE MOCK EDITION · {new Date().toLocaleDateString()}</span>
          <h3>The Meme City Gazette</h3>
          <p className="paper-deck">
            {book.records.length} small dramas.{" "}
            {Object.keys(book.relationships).length} neighborhood connections.
            Zero dull little minds.
          </p>
          {book.records.slice(0, 8).map((r, i) => (
            <article key={r.id}>
              <small>
                {i === 0 ? "FRONT PAGE" : "AROUND THE NEIGHBORHOOD"} · $
                {r.symbol}
              </small>
              <h4>{getDefinition(r.eventId)?.title}</h4>
              <p>
                “{r.quote}” — {r.agentName}
              </p>
              <button onClick={() => downloadStory(r)}>
                Keep this moment ↓
              </button>
            </article>
          ))}
          {!book.records.length && (
            <p>The presses are waiting for the first city story.</p>
          )}
          <footer>
            Fictional city news · All wallet activity and market figures are
            mock data.
          </footer>
        </div>
      )}
    </div>
  );
}
