"use client";
import dynamic from "next/dynamic";
import {
  useEffect,
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowRight,
  AudioLines,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Coins,
  Expand,
  Flame,
  Globe2,
  Maximize2,
  MessageSquare,
  Minus,
  Moon,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import {
  act,
  advance,
  compact,
  createAgent,
  initialState,
  loadState,
  money,
  MAX_AGENTS,
  type Action,
  type Agent,
  type CityState,
} from "@/lib/simulation";
const CityScene = dynamic(() => import("./city-scene"), {
  ssr: false,
  loading: () => (
    <div className="city-loading">
      <span className="loading-orbit" />
      Building your little corner of the internet…
    </div>
  ),
});
import {
  HATCH_DURATION,
  HATCH_STAGES,
  HATCH_STAGE_TIMES,
  type HatchRun,
} from "@/lib/hatching";
import {
  cityMoment,
  type CityMoment,
  type StreetActivity,
} from "@/lib/city-life";
import { useStories } from "@/hooks/use-stories";
import StoryLab, { StoryPlayer, MarketTape } from "./story-lab";
import { getProfile } from "@/lib/stories";
import WorldNavigator from "./world-navigator";
import {
  MIN_ZOOM,
  MAX_ZOOM,
  type MapFocus,
  type MapView,
} from "@/lib/metropolis";
const STORAGE = "pieverse-meme-city-v1";
const palette = [
  "#ff729e",
  "#a594ff",
  "#67d8eb",
  "#86e4a8",
  "#ffce73",
  "#8ca2cf",
];
function Badge({ status }: { status: Agent["status"] }) {
  return (
    <span className={`status ${status}`}>
      <i />
      {status === "idle"
        ? "Watching"
        : status === "waiting"
          ? "Not awake"
          : status[0].toUpperCase() + status.slice(1)}
    </span>
  );
}
function BotIcon({
  color,
  size = "normal",
  sleep = false,
}: {
  color: string;
  size?: string;
  sleep?: boolean;
}) {
  return (
    <span
      className={`bot-icon ${size} ${sleep ? "asleep" : ""}`}
      style={{ "--agent-color": color } as CSSProperties}
    >
      <span className="bot-antenna" />
      <span className="bot-eyes">
        <i />
        <i />
      </span>
    </span>
  );
}
function Sparkline({ color, index = 0 }: { color: string; index?: number }) {
  const paths = [
    "0,26 8,24 15,28 22,19 30,22 37,14 44,17 52,8 60,13 68,5 76,9 84,2",
    "0,28 8,22 15,24 23,14 31,18 39,17 47,9 55,15 64,6 72,10 84,3",
    "0,25 8,28 18,20 27,24 35,16 44,19 52,12 61,16 70,9 77,12 84,6",
  ];
  return (
    <svg className="sparkline" viewBox="0 0 84 34" aria-hidden>
      <polyline
        points={paths[index % 3]}
        fill="none"
        stroke={color}
        strokeWidth="1.7"
      />
    </svg>
  );
}
function useFocusTrap(open: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement;
    const timer = setTimeout(
      () =>
        ref.current
          ?.querySelector<HTMLElement>("button,input,textarea,select")
          ?.focus(),
      0,
    );
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab" && ref.current) {
        const nodes = Array.from(
          ref.current.querySelectorAll<HTMLElement>(
            'button:not(:disabled),input,textarea,select,[tabindex="0"]',
          ),
        );
        if (!nodes.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [open]);
  return ref;
}
export default function MemeCity() {
  const [city, setCity] = useState<CityState | null>(null),
    [selected, setSelected] = useState<string | null>(null),
    [paused, setPaused] = useState(false),
    [zen, setZen] = useState(false),
    [creating, setCreating] = useState(false),
    [help, setHelp] = useState(false),
    [resetConfirm, setResetConfirm] = useState(false),
    [zoom, setZoom] = useState(28),
    [cameraReset, setCameraReset] = useState(0),
    [toast, setToast] = useState(""),
    [tab, setTab] = useState("Overview"),
    [note, setNote] = useState(""),
    [filter, setFilter] = useState("all"),
    [hatching, setHatching] = useState<HatchRun | null>(null),
    [hatchPhase, setHatchPhase] = useState(0),
    [streetActivities, setStreetActivities] = useState<
      Record<string, StreetActivity>
    >({}),
    [moment, setMoment] = useState<CityMoment | null>(null),
    [mapFocus, setMapFocus] = useState<MapFocus | null>(null),
    [mapView, setMapView] = useState<MapView>({ x: 0, z: 0, zoom: 28 });
  const [lab, setLab] = useState(false);
  const [selectionKey, setSelectionKey] = useState(0);
  const stories = useStories(
    city,
    setCity,
    paused,
    !!hatching || creating,
    lab,
  );
  const previousHatch = useRef<HatchRun | null>(null);
  useEffect(() => {
    const previous = previousHatch.current;
    previousHatch.current = hatching;
    if (
      previous?.isNew &&
      !hatching &&
      city?.agents.some((a) => a.id === previous.agentId)
    )
      stories.start("welcome", previous.agentId, "milestone");
  }, [hatching?.key]);
  const worldRef = useRef<HTMLElement>(null);
  const onMapMove = useCallback((view: MapView) => setMapView(view), []);
  const onStreetActivity = useCallback(
    (id: string, activity: StreetActivity | null) => {
      setStreetActivities((old) => {
        if (!activity && !old[id]) return old;
        const next = { ...old };
        if (activity) next[id] = activity;
        else delete next[id];
        return next;
      });
      if (activity)
        setCity((s) => {
          const a = s?.agents.find((a) => a.id === id);
          if (!s || !a) return s;
          return {
            ...s,
            events: [
              {
                id: crypto.randomUUID(),
                agentId: id,
                name: a.name,
                color: a.color,
                text: activity.text,
                time: Date.now(),
                action: "street",
              },
              ...s.events,
            ].slice(0, 80),
          };
        });
    },
    [],
  );
  const triggerMoment = useCallback(() => {
    const next = cityMoment();
    setMoment(next);
    setCity((s) => {
      if (!s) return s;
      const a = s.agents.find((a) => a.status !== "sleeping") ?? s.agents[0];
      return {
        ...s,
        events: [
          {
            id: next.key,
            agentId: a.id,
            name: "CITY",
            color: "#e9c68c",
            text: next.title + " — " + next.description,
            time: Date.now(),
            action: "city",
          },
          ...s.events,
        ].slice(0, 80),
      };
    });
  }, []);
  useEffect(() => {
    if (!city || paused || hatching || stories.run) return;
    const first = setTimeout(triggerMoment, 13000);
    const timer = setInterval(triggerMoment, 31000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [!!city, paused, !!hatching, !!stories.run, triggerMoment]);
  useEffect(() => {
    if (!moment) return;
    const timer = setTimeout(() => setMoment(null), 9500);
    return () => clearTimeout(timer);
  }, [moment?.key]);
  const modalRef = useRef<HTMLDivElement>(null); // City details remain accessible alongside cards.
  useEffect(() => {
    let next = initialState();
    if (window.matchMedia("(max-width: 760px)").matches) setZoom(14);
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) next = loadState(saved) ?? next;
    } catch {}
    setCity(next);
    const timer = setTimeout(() => {
      try {
        if (sessionStorage.getItem("meme-exchange-intro")) return;
        sessionStorage.setItem("meme-exchange-intro", "1");
      } catch {}
      setHatching({
        agentId: next.agents[0].id,
        startedAt: performance.now(),
        key: crypto.randomUUID(),
        isNew: false,
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (city)
      try {
        localStorage.setItem(STORAGE, JSON.stringify(city));
      } catch {}
  }, [city]);
  useEffect(() => {
    if (paused || !city || hatching || stories.run) return;
    const timer = setInterval(() => setCity((s) => (s ? advance(s) : s)), 6500);
    return () => clearInterval(timer);
  }, [paused, !!city, !!hatching, !!stories.run]);
  useEffect(() => {
    if (!hatching) return;
    setHatchPhase(0);
    const timers = HATCH_STAGE_TIMES.map((time, i) =>
      setTimeout(() => setHatchPhase(i + 1), time),
    );
    timers.push(
      setTimeout(() => {
        setHatching(null);
        if (hatching.isNew) {
          setSelected(hatching.agentId);
          setTab("Overview");
          setCity((s) => {
            const a = s?.agents.find((a) => a.id === hatching.agentId);
            if (!s || !a) return s;
            return {
              ...s,
              events: [
                {
                  id: crypto.randomUUID(),
                  agentId: a.id,
                  name: a.name,
                  color: a.color,
                  text: `$${a.symbol} walked out of the Genesis Gate. One new meme, one new mind.`,
                  time: Date.now(),
                  action: "arrival",
                },
                ...s.events,
              ].slice(0, 80),
            };
          });
        }
        setToast(
          hatching.isNew
            ? "Your agent just walked out of the Exchange. Say GM!"
            : "Made in Meme Exchange. Every agent starts here.",
        );
      }, HATCH_DURATION),
    );
    return () => timers.forEach(clearTimeout);
  }, [hatching?.key]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setZen(false);
        setHelp(false);
        setResetConfirm(false);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  if (!city)
    return (
      <main className="initial-loading">
        <span className="brand-mark">
          m<span>✦</span>
        </span>
        <p>A city is waking up.</p>
      </main>
    );
  const current = city.agents.find((a) => a.id === selected),
    online = city.agents.filter(
      (a) => !["sleeping", "waiting"].includes(a.status),
    ).length,
    treasury = city.agents.reduce((s, a) => s + a.treasury, 0);
  const choose = (id: string | null) => {
    setSelected(id);
    if (id && zoom < 20) setZoom(24);
    setMapFocus(null);
    setTab("Overview");
    setNote("");
  };
  const startHatch = (agentId: string, isNew = false) => {
    if (hatching) return;
    stories.finish();
    choose(null);
    setZoom(window.matchMedia("(max-width:760px)").matches ? 14 : 28);
    setCameraReset((n) => n + 1);
    setHatching({
      agentId,
      startedAt: performance.now(),
      key: crypto.randomUUID(),
      isNew,
    });
  };
  const openCreate = () => {
    if (hatching) {
      setToast("The Exchange is finishing this hatch. Just a moment…");
      return;
    }
    setCreating(true);
  };
  const jumpMap = (x: number, z: number, preferredZoom?: number) => {
    setSelected(null);
    setMapFocus({ x, z, key: crypto.randomUUID() });
    if (preferredZoom)
      setZoom(
        window.matchMedia("(max-width:760px)").matches
          ? preferredZoom * 0.65
          : preferredZoom,
      );
  };
  const overview = () => {
    const bounds = worldRef.current?.getBoundingClientRect();
    const availableWidth =
      (bounds?.width ?? window.innerWidth) -
      (window.innerWidth > 760 ? 520 : 30);
    setZoom(
      Math.max(
        MIN_ZOOM,
        Math.min(availableWidth / 96, (bounds?.height ?? 550) / 65) * 0.9,
      ),
    );
    jumpMap(0, 0);
  };
  const execute = (id: string, action: Action) => {
    if (act(city, id, action) === city) {
      setToast(
        "Not enough funds or held tokens for this action. Try tax income first.",
      );
      return;
    }
    setCity((s) => (s ? act(s, id, action) : s));
    setToast(
      action === "wake"
        ? "Rise and shine. Your agent is back."
        : action === "sleep"
          ? "Lights out. Your agent is resting."
          : `Simulated ${action} event triggered.`,
    );
  };
  const visibleEvents = city.events.filter(
    (e) =>
      filter === "all" ||
      e.action === "buyback" ||
      e.action === "burn" ||
      e.action === "tax",
  );
  return (
    <main className={`city-app ${zen ? "zen-mode" : ""}`}>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Meme City home">
          <span className="brand-mark">
            m<span>✦</span>
          </span>
          <span>
            meme<span className="brand-light">city</span>
            <small>BY PIEVERSE</small>
          </span>
        </a>
        <div className="nav-divider" />
        <span className="district-tag">
          BNB CHAIN <ChevronDown size={11} />
        </span>
        <div className="header-stats">
          <div>
            <span>
              <i className="live-dot" />
              AGENTS ONLINE
            </span>
            <strong>
              {online}
              <em> / {city.agents.length}</em>
            </strong>
          </div>
          <div>
            <span>TOTAL TREASURY</span>
            <strong>
              {money(treasury)}
              <em className="positive">↗</em>
            </strong>
          </div>
          <div>
            <span>CITY ACTIVITY</span>
            <strong>
              {city.events.length}
              <em> events</em>
            </strong>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="secondary-button scene-lab-button"
            onClick={() => setLab(true)}
          >
            <Sparkles size={15} /> Scene Lab
          </button>
          <span className="demo-badge">
            <i /> SIMULATION
          </span>
          <button
            className="icon-btn help-btn"
            title="About this demo"
            aria-label="About this demo"
            onClick={() => setHelp(true)}
          >
            <CircleHelp size={17} />
          </button>
          <button className="primary-button" onClick={openCreate}>
            <Plus size={16} />
            Launch meme
          </button>
        </div>
      </header>
      <section className="world" ref={worldRef}>
        <div className="city-atmosphere" />
        <CityScene
          selectionKey={selectionKey}
          story={stories.run}
          agents={city.agents}
          focus={mapFocus}
          onMapMove={onMapMove}
          hatching={hatching}
          moment={stories.run ? null : moment}
          streetActivities={streetActivities}
          onStreetActivity={onStreetActivity}
          onReplayHatch={() =>
            startHatch(
              city.agents[Math.floor(Math.random() * city.agents.length)].id,
            )
          }
          onZoomChange={setZoom}
          selected={selected}
          onSelect={choose}
          onCreate={openCreate}
          zoom={zoom}
          reset={cameraReset}
          paused={paused}
        />
        <div className="world-heading">
          <div className="eyebrow">
            <span className="live-dot" /> A LIVING, BREATHING MEME ECONOMY
          </div>
          <h1>
            Small agents.
            <br />
            <span>Big main character energy.</span>
          </h1>
          <p>They think. They trade. They occasionally nap.</p>
        </div>
        {moment && !hatching && !stories.run && (
          <div className="city-moment" role="status">
            <Sparkles size={15} />
            <div>
              <small>RANDOM CITY MOMENT</small>
              <strong>{moment.title}</strong>
              <p>{moment.description}</p>
            </div>
            <button
              onClick={() => setMoment(null)}
              aria-label="Dismiss city moment"
            >
              <X size={13} />
            </button>
          </div>
        )}
        {!zen && (
          <aside className="left-stack">
            <section className="panel city-pulse">
              <div className="panel-heading">
                <span>
                  <Activity size={13} /> CITY PULSE
                </span>
                <button
                  className="live-text street-shuffle"
                  onClick={() => {
                    setMoment(null);
                    stories.start();
                  }}
                  disabled={!!hatching}
                >
                  ✦ SURPRISE ME
                </button>
              </div>
              <div className="pulse-main">
                <span className="eyebrow">A LITTLE CITY. A LOT HAPPENING.</span>
                <strong>
                  {online} agents <span>doing their thing.</span>
                </strong>
                <div className="mini-avatars">
                  {city.agents.slice(0, 6).map((a) => (
                    <button
                      key={a.id}
                      title={a.name}
                      onClick={() => choose(a.id)}
                      style={{
                        background: a.color + "19",
                        borderColor: a.color + "55",
                      }}
                    >
                      <BotIcon
                        color={a.color}
                        size="tiny"
                        sleep={a.status === "sleeping"}
                      />
                    </button>
                  ))}
                  <span>+ you?</span>
                </div>
              </div>
              <div className="pulse-bottom">
                <span>
                  <span className="live-dot" /> All systems feeling alive
                </span>
                <ShieldCheck size={14} />
              </div>
            </section>
            <section className="panel spotlight">
              <div className="panel-heading">
                <span>
                  <Sparkles size={13} /> THE NEIGHBORHOOD
                </span>
                <span className="muted">01 — 06</span>
              </div>
              <div className="spotlight-content">
                <span className="spotlight-tag">MEET YOUR NEXT OBSESSION</span>
                <div className="spotlight-character">
                  <BotIcon color="#a594ff" size="large" />
                  <span className="speech">
                    “I have a thesis.
                    <br />
                    And a spending limit.”
                  </span>
                  <span className="character-shadow" />
                </div>
                <div className="spotlight-title">
                  <div>
                    <h3>
                      APE <span>$APE</span>
                    </h3>
                    <p>High conviction. Low impulse control.</p>
                  </div>
                  <button
                    className="circle-button"
                    aria-label="Meet APE"
                    onClick={() => choose("ape")}
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </section>
            <div className="city-caption">
              <ShieldCheck size={15} />
              <p>
                Own treasury. Limited permissions.
                <br />
                <strong>Every move, out in the open.</strong>
              </p>
            </div>
          </aside>
        )}
        {!zen && (
          <aside className="right-stack">
            <section className="panel activity-panel">
              <div className="panel-heading">
                <span>
                  <Terminal size={13} /> CITY.LOG
                </span>
                <span className="live-text">
                  <i className={paused ? "paused-dot" : "live-dot"} />
                  {paused ? "PAUSED" : "LIVE"}
                </span>
              </div>
              <div className="feed-tabs">
                <button
                  className={filter === "all" ? "active" : ""}
                  onClick={() => setFilter("all")}
                >
                  All activity
                </button>
                <button
                  className={filter === "treasury" ? "active" : ""}
                  onClick={() => setFilter("treasury")}
                >
                  Treasury
                </button>
                <span>{visibleEvents.length}</span>
              </div>
              <div className="feed-list">
                {visibleEvents.length === 0 ? (
                  <p className="empty-state">
                    The treasury is quiet. Trigger an event below.
                  </p>
                ) : (
                  visibleEvents.slice(0, 8).map((event, i) => (
                    <button
                      className={`feed-item ${i === 0 ? "new-event" : ""}`}
                      key={event.id}
                      onClick={() => choose(event.agentId)}
                    >
                      <span className="feed-track">
                        <span style={{ background: event.color }} />
                      </span>
                      <div>
                        <div className="feed-meta">
                          <strong style={{ color: event.color }}>
                            {event.name}
                          </strong>
                          <time>
                            {new Date(event.time).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>
                        </div>
                        <p>{event.text}</p>
                        {event.action === "buyback" && (
                          <span className="event-tag">
                            <ArrowDownLeft size={10} /> BUYBACK
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="feed-footer">
                <span className="live-dot" />
                {paused
                  ? "The city is taking a breath."
                  : "The city never stops being interesting."}
              </div>
            </section>
            <WorldNavigator
              view={{ ...mapView, zoom }}
              onJump={jumpMap}
              onOverview={overview}
            />
          </aside>
        )}
        <div className="map-coordinate">
          <span>MEME CITY / NIGHT SHIFT</span>
          <small>25° 03′ N &nbsp; 121° 33′ E</small>
        </div>
        {hatching && (
          <div className="hatch-progress" role="status" aria-live="polite">
            <span className="hatch-progress-icon">
              <Sparkles size={20} />
            </span>
            <div>
              <small>
                MEME EXCHANGE / {hatching.isNew ? "NEW RESIDENT" : "MOCK HATCH"}
              </small>
              <strong>{HATCH_STAGES[hatchPhase]}</strong>
              <div className="hatch-progress-steps">
                {HATCH_STAGES.map((stage, i) => (
                  <i key={stage} className={i <= hatchPhase ? "active" : ""} />
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                const id = hatching.agentId;
                setHatching(null);
                choose(id);
              }}
            >
              Skip <ChevronRight size={12} />
            </button>
          </div>
        )}
        <div className="map-controls">
          <span className="map-hint">SCROLL TO ZOOM · DRAG TO EXPLORE</span>
          <button
            className="whole-city-button"
            onClick={overview}
            aria-label="Show whole city"
            title="Show whole city"
          >
            <Globe2 size={14} />
            <span>Whole city</span>
          </button>
          <div>
            <button
              aria-label="Zoom out"
              title="Zoom out"
              onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z / 1.2))}
            >
              <Minus size={15} />
            </button>
            <span>{Math.round((zoom / 28) * 100)}%</span>
            <button
              aria-label="Zoom in"
              title="Zoom in"
              onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z * 1.2))}
            >
              <Plus size={15} />
            </button>
          </div>
          <button
            aria-label="Reset camera"
            title="Reset camera"
            onClick={() => {
              setZoom(window.matchMedia("(max-width:760px)").matches ? 14 : 28);
              setCameraReset((n) => n + 1);
              choose(null);
            }}
          >
            <Maximize2 size={15} />
          </button>
          <button
            aria-label={zen ? "Exit cinematic view" : "Cinematic view"}
            title="Cinematic view"
            onClick={() => setZen((z) => !z)}
          >
            <Expand size={15} />
          </button>
        </div>
        {zen && (
          <button
            className="exit-zen secondary-button"
            onClick={() => setZen(false)}
          >
            <X size={14} /> Exit cinematic view
          </button>
        )}
      </section>
      {stories.run && !lab && !creating && (
        <StoryPlayer
          run={stories.run}
          remaining={stories.remaining}
          paused={paused}
          onWatch={() => {
            choose(stories.run!.record.agentId);
            setSelectionKey((n) => n + 1);
            setZoom(38);
          }}
          onSkip={stories.finish}
          onReplay={() => stories.replay(stories.run!.record)}
          onRestore={() => {
            if (
              stories.book.records.find(
                (r) => r.agentId === stories.run!.record.agentId,
              )?.id !== stories.run!.record.id
            ) {
              setToast("Only the latest event for this agent can be undone.");
              return;
            }
            stories.restore(stories.run!.record);
            setToast("Mock figures restored. Notes and keepsakes preserved.");
          }}
        />
      )}
      {!zen && (
        <section className="agents-section">
          <div className="agents-heading">
            <h2>
              THE RESIDENTS{" "}
              <span>{city.agents.length.toString().padStart(2, "0")}</span>
            </h2>
            <span>
              <i className="live-dot" /> Independently minded. Collectively
              unhinged.
            </span>
            <button onClick={openCreate}>
              Room for one more <Plus size={13} />
            </button>
          </div>
          <div className="agent-cards">
            {city.agents.map((a, i) => (
              <button
                key={a.id}
                className={`agent-card ${selected === a.id ? "selected" : ""}`}
                style={{ "--agent-color": a.color } as CSSProperties}
                onClick={() => choose(a.id)}
              >
                <div className="agent-card-top">
                  <BotIcon color={a.color} sleep={a.status === "sleeping"} />
                  <div>
                    <h3>
                      {a.name}
                      <span>${a.symbol}</span>
                    </h3>
                    <p>{a.role}</p>
                  </div>
                  <span className="card-arrow">↗</span>
                </div>
                {hatching?.isNew && hatching.agentId === a.id ? (
                  <span className="status waiting">
                    <i />
                    Incubating
                  </span>
                ) : (
                  <Badge status={a.status} />
                )}
                <p className="agent-task">
                  {hatching?.isNew && hatching.agentId === a.id
                    ? HATCH_STAGES[hatchPhase]
                    : stories.run?.record.agentId === a.id
                      ? stories.run.definition.title
                      : a.activity}
                </p>
                <div className="card-financials">
                  <div>
                    <small>TREASURY</small>
                    <strong>{money(a.treasury)}</strong>
                  </div>
                  <Sparkline color={a.color} index={i} />
                </div>
                <div className="card-meter">
                  <i
                    style={{
                      width: `${a.status === "sleeping" ? 8 : Math.min(95, 34 + i * 9)}%`,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
      <footer className="bottom-bar">
        <span>
          <span className="footer-star">✦</span> POWERED BY PIEVERSE{" "}
          <span className="footer-chain">ON BNB CHAIN</span>
        </span>
        <span className="demo-disclaimer">
          A simulated world. Real main character energy.
        </span>
        <div>
          <button onClick={() => setPaused((p) => !p)}>
            {paused ? <Play size={12} /> : <Pause size={12} />}{" "}
            {paused ? "Resume" : "Pause"} simulation
          </button>
          <button onClick={() => setResetConfirm(true)} title="Reset demo">
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </footer>
      {current && (
        <div
          className="detail-panel panel"
          ref={modalRef}
          role="region"
          aria-label={`${current.name} agent details`}
          style={{ "--agent-color": current.color } as CSSProperties}
        >
          <div className="detail-top">
            <span className="eyebrow">RESIDENT PROFILE / SIMULATED</span>
            <button
              className="icon-btn"
              onClick={() => choose(null)}
              aria-label="Close agent details"
            >
              <X size={18} />
            </button>
          </div>
          <div className="detail-identity">
            <BotIcon
              color={current.color}
              size="large"
              sleep={current.status === "sleeping"}
            />
            <div>
              <h2>
                {current.name}
                <span>${current.symbol}</span>
              </h2>
              <p>{current.role}</p>
              <Badge status={current.status} />
            </div>
          </div>
          <div className="detail-tabs">
            {["Overview", "Activity", "Treasury", "Notes"].map((t) => (
              <button
                key={t}
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t}
                {t === "Notes" && current.notes.length > 0 && (
                  <small>{current.notes.length}</small>
                )}
              </button>
            ))}
          </div>
          <div className="detail-body">
            {tab === "Overview" && (
              <>
                <MarketTape agent={current} book={stories.book} />
                <button className="lab-surprise" onClick={() => setLab(true)}>
                  ✦ Give this agent a story
                </button>
                <div className="personality-quote">“{current.personality}”</div>
                <span className="eyebrow">THE MISSION</span>
                <p className="detail-copy">{current.goal}</p>
                <div className="detail-stats">
                  <div>
                    <small>MARKET CAP</small>
                    <strong>${compact(current.marketCap)}</strong>
                  </div>
                  <div>
                    <small>TREASURY</small>
                    <strong>{money(current.treasury)}</strong>
                  </div>
                  <div>
                    <small>COMPUTE BALANCE</small>
                    <strong>{money(current.compute)}</strong>
                  </div>
                  <div>
                    <small>STRATEGY</small>
                    <strong>{current.strategy}</strong>
                  </div>
                </div>
                <div className="current-thought">
                  <AudioLines size={18} />
                  <div>
                    <small>RIGHT NOW</small>
                    <p>{current.activity}</p>
                  </div>
                </div>
                <p className="permissions">
                  <ShieldCheck size={14} /> Allowlisted actions · Simulated $120
                  max per buyback
                </p>
              </>
            )}
            {tab === "Activity" && (
              <div className="detail-events">
                {city.events
                  .filter((e) => e.agentId === current.id)
                  .map((e) => (
                    <article key={e.id}>
                      <span className="eyebrow">
                        {e.action.toUpperCase()} ·{" "}
                        {new Date(e.time).toLocaleTimeString("en-GB")}
                      </span>
                      <p>{e.text}</p>
                    </article>
                  ))}
              </div>
            )}
            {tab === "Treasury" && (
              <>
                <div className="treasury-hero">
                  <Wallet size={22} />
                  <small>AVAILABLE TREASURY</small>
                  <strong>{money(current.treasury)}</strong>
                  <span>Trading taxes keep the lights on.</span>
                </div>
                <div className="detail-stats">
                  <div>
                    <small>TOTAL BUYBACKS</small>
                    <strong>{money(current.buybacks)}</strong>
                  </div>
                  <div>
                    <small>TOKENS HELD</small>
                    <strong>{compact(current.holdings)}</strong>
                  </div>
                  <div>
                    <small>TOKENS BURNED</small>
                    <strong>{compact(current.burned)}</strong>
                  </div>
                  <div>
                    <small>COMPUTE FUNDS</small>
                    <strong>{money(current.compute)}</strong>
                  </div>
                </div>
                <div className="safety-note">
                  <ShieldCheck size={18} />
                  <p>
                    This demo allows research, posts, buybacks and burns. All
                    amounts and executions are simulated.
                  </p>
                </div>
              </>
            )}
            {tab === "Notes" && (
              <>
                <p className="detail-copy">
                  A little advice for your agent? Leave a note. They’ll read it
                  the next time they wake up.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!note.trim()) return;
                    setCity((s) =>
                      s
                        ? {
                            ...s,
                            agents: s.agents.map((a) =>
                              a.id === current.id
                                ? {
                                    ...a,
                                    notes: [
                                      ...a.notes,
                                      {
                                        id: crypto.randomUUID(),
                                        text: note.trim(),
                                        read: false,
                                      },
                                    ],
                                  }
                                : a,
                            ),
                          }
                        : s,
                    );
                    setNote("");
                    setToast("Note delivered. Waiting for the next wake-up.");
                  }}
                >
                  <textarea
                    aria-label="Note to agent"
                    placeholder="Hey, a thought for when you wake up…"
                    maxLength={280}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="note-submit">
                    <small>{note.length}/280 · Demo holder access</small>
                    <button className="primary-button" disabled={!note.trim()}>
                      <MessageSquare size={13} /> Leave note
                    </button>
                  </div>
                </form>
                <div className="notes-list">
                  {current.notes.length === 0 ? (
                    <div className="empty-state">
                      <MessageSquare size={23} />
                      <p>No notes yet. Be the first voice in their head.</p>
                    </div>
                  ) : (
                    current.notes.map((n) => (
                      <article key={n.id}>
                        <p>{n.text}</p>
                        <span>
                          {n.read ? (
                            <>
                              <Check size={11} /> Read on wake-up
                            </>
                          ) : (
                            <>
                              <Moon size={11} /> Waiting for next wake-up
                            </>
                          )}
                        </span>
                      </article>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
          <div className="demo-controls">
            <span className="eyebrow">
              <Zap size={11} /> TRY A SIMULATED EVENT
            </span>
            <div>
              {(["sleeping", "waiting"].includes(current.status)
                ? [
                    ["wake", "Wake up", Sun],
                    ["tax", "Fund agent", Coins],
                  ]
                : ([
                    ["research", "Research", Search],
                    ["post", "Post", MessageSquare],
                    ["buyback", "Buyback", TrendingUp],
                    ["burn", "Burn", Flame],
                    ["tax", "Tax income", Coins],
                    ["sleep", "Sleep", Moon],
                  ] as const)
              ).map(([action, label, Icon]) => (
                <button
                  key={String(action)}
                  onClick={() => execute(current.id, action as Action)}
                >
                  <Icon size={12} />
                  {label as string}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {creating && (
        <CreateModal
          close={() => setCreating(false)}
          full={city.agents.length >= MAX_AGENTS}
          onCreate={(input) => {
            const next = createAgent(city, input);
            setCity(next);
            setCreating(false);
            startHatch(next.agents[next.agents.length - 1].id, true);
            setToast("Mint confirmed. Your agent is getting ready inside…");
          }}
        />
      )}
      {lab && (
        <InfoModal
          close={() => setLab(false)}
          title="The little drama department"
        >
          <StoryLab
            agents={city.agents}
            book={stories.book}
            selected={selected}
            busy={!!hatching}
            start={(eventId, agentId) => {
              setMoment(null);
              stories.start(eventId, agentId);
              setLab(false);
              if (agentId) {
                choose(agentId);
                setSelectionKey((n) => n + 1);
                setZoom(38);
              }
            }}
            replay={(r) => {
              stories.replay(r);
              setLab(false);
              choose(r.agentId);
              setSelectionKey((n) => n + 1);
              setZoom(38);
            }}
            restore={(r) => {
              stories.restore(r);
              setToast("Mock figures restored. Notes and keepsakes preserved.");
            }}
            settings={(auto, interval) =>
              stories.setBook((b) => ({ ...b, settings: { auto, interval } }))
            }
            onTopic={(id, text) => {
              const a = city.agents.find((a) => a.id === id)!;
              stories.setBook((b) => ({
                ...b,
                profiles: {
                  ...b.profiles,
                  [id]: {
                    ...getProfile(a, b),
                    topics: [
                      { id: crypto.randomUUID(), text, read: false },
                      ...getProfile(a, b).topics,
                    ].slice(0, 12),
                  },
                },
              }));
            }}
          />
        </InfoModal>
      )}
      {(help || resetConfirm) && (
        <InfoModal
          close={() => {
            setHelp(false);
            setResetConfirm(false);
          }}
          title={
            resetConfirm
              ? "A fresh start for the city?"
              : "Welcome to the neighborhood."
          }
        >
          {resetConfirm ? (
            <>
              <p>
                This clears your created agents, notes and activity, and
                restores the six original residents.
              </p>
              <button
                className="primary-button"
                onClick={() => {
                  setHatching(null);
                  stories.reset();
                  setMoment(null);
                  setStreetActivities({});
                  setCity(initialState());
                  setSelected(null);
                  setPaused(false);
                  setResetConfirm(false);
                  setToast("Fresh city. Same main character energy.");
                }}
              >
                <RotateCcw size={14} /> Reset demo
              </button>
            </>
          ) : (
            <>
              <p>
                Every meme has a mind of its own. Explore the city, meet its
                agents, and watch their activity unfold.
              </p>
              <ul>
                <li>
                  Drag to explore. Scroll over the map to zoom toward your
                  cursor.
                </li>
                <li>
                  Click a walking agent or resident card to meet them. Buildings
                  are shared city scenery.
                </li>
                <li>Create an agent at Meme Exchange.</li>
                <li>Try events and leave notes in the agent profile.</li>
              </ul>
              <div className="safety-note">
                <ShieldCheck size={18} />
                <p>
                  Everything here is simulated. No wallet, live AI, real trading
                  or X publishing is connected. Your city is saved in this
                  browser.
                </p>
              </div>
            </>
          )}
        </InfoModal>
      )}
      {toast && (
        <div role="status" className="toast">
          <span>
            <Check size={15} />
          </span>
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </main>
  );
}
function InfoModal({
  close,
  title,
  children,
}: {
  close: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useFocusTrap(true, close);
  return (
    <div className="modal-backdrop" onClick={close}>
      <div
        className={`info-modal panel ${title === "The little drama department" ? "lab-modal" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close icon-btn"
          aria-label="Close dialog"
          onClick={close}
        >
          <X size={19} />
        </button>
        <span className="eyebrow">MEME CITY / DEMO</span>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
type Input = {
  name: string;
  symbol: string;
  personality: string;
  goal: string;
  strategy: string;
  color: string;
};
function CreateModal({
  close,
  onCreate,
  full,
}: {
  close: () => void;
  onCreate: (input: Input) => void;
  full: boolean;
}) {
  const [step, setStep] = useState(0),
    [input, setInput] = useState<Input>({
      name: "",
      symbol: "",
      color: palette[0],
      personality: "The sharp-tongued researcher",
      goal: "Find the signal. Build something worth watching.",
      strategy: "Balanced",
    });
  const ref = useFocusTrap(true, close);
  const update = (key: keyof Input, value: string) =>
    setInput((s) => ({ ...s, [key]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep((s) => s + 1);
    else onCreate(input);
  };
  return (
    <div className="modal-backdrop" onClick={close}>
      <div
        className="create-modal panel"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Create your agent"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close icon-btn"
          aria-label="Close creation"
          onClick={close}
        >
          <X size={20} />
        </button>
        <span className="eyebrow">
          <Sparkles size={12} /> MEME EXCHANGE
        </span>
        <h2>
          A meme.
          <br />
          <span>A mind of its own.</span>
        </h2>
        <p className="create-intro">Your next main character starts here.</p>
        {full ? (
          <>
            <p className="empty-state">
              The neighborhood is full. Reset the demo to make room for a new
              resident.
            </p>
            <button className="secondary-button" onClick={close}>
              Back to the city
            </button>
          </>
        ) : (
          <>
            <div className="create-steps">
              {["Identity", "Personality", "Strategy", "Launch"].map((s, i) => (
                <span
                  key={s}
                  className={step === i ? "active" : step > i ? "done" : ""}
                >
                  <i>{step > i ? <Check size={10} /> : i + 1}</i>
                  {s}
                </span>
              ))}
            </div>
            <form onSubmit={submit}>
              <div className="create-fields">
                {step === 0 && (
                  <>
                    <div className="create-avatar">
                      <BotIcon color={input.color} size="large" />
                      <div>
                        <span className="eyebrow">PICK YOUR COLOR</span>
                        <div className="color-options">
                          {palette.map((c) => (
                            <button
                              type="button"
                              aria-label={`Choose color ${c}`}
                              aria-pressed={input.color === c}
                              style={{ background: c }}
                              key={c}
                              className={input.color === c ? "active" : ""}
                              onClick={() => update("color", c)}
                            >
                              {input.color === c && <Check size={13} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <label>
                      Agent name
                      <input
                        required
                        maxLength={18}
                        placeholder="e.g. MOCHI"
                        value={input.name}
                        onChange={(e) => update("name", e.target.value)}
                      />
                    </label>
                    <label>
                      Token symbol
                      <div className="symbol-input">
                        <span>$</span>
                        <input
                          required
                          pattern="[A-Za-z0-9]{1,8}"
                          title="1–8 letters or numbers"
                          maxLength={8}
                          placeholder="MOCHI"
                          value={input.symbol}
                          onChange={(e) =>
                            update("symbol", e.target.value.toUpperCase())
                          }
                        />
                      </div>
                    </label>
                  </>
                )}
                {step === 1 && (
                  <>
                    <label>
                      Pick a personality
                      <select
                        value={input.personality}
                        onChange={(e) => update("personality", e.target.value)}
                      >
                        {[
                          "The sharp-tongued researcher",
                          "The optimistic degen",
                          "The careful strategist",
                          "The chronically online creator",
                          "The sleepy dreamer",
                        ].map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Give them a mission
                      <textarea
                        required
                        maxLength={180}
                        value={input.goal}
                        onChange={(e) => update("goal", e.target.value)}
                        placeholder="What should your agent care about?"
                      />
                    </label>
                    <p className="field-hint">
                      Their personality shapes the vibe. Their mission gives it
                      direction.
                    </p>
                  </>
                )}
                {step === 2 && (
                  <>
                    <span className="field-label">Treasury strategy</span>
                    {[
                      ["Conservative", "Watch closely. Spend carefully."],
                      ["Balanced", "A little conviction. A little restraint."],
                      ["Aggressive", "More action. Still within the limits."],
                    ].map(([title, desc]) => (
                      <button
                        type="button"
                        key={title}
                        className={`strategy-option ${input.strategy === title ? "active" : ""}`}
                        onClick={() => update("strategy", title)}
                      >
                        <div>
                          <strong>{title}</strong>
                          <small>{desc}</small>
                        </div>
                        <i>{input.strategy === title && <Check size={12} />}</i>
                      </button>
                    ))}
                    <div className="safety-note">
                      <ShieldCheck size={18} />
                      <p>
                        Strategy preferences are illustrative in this demo.
                        Every agent uses the same $120 maximum per buyback.
                      </p>
                    </div>
                  </>
                )}
                {step === 3 && (
                  <>
                    <div className="launch-preview">
                      <BotIcon color={input.color} size="large" />
                      <h3>
                        {input.name} <span>${input.symbol}</span>
                      </h3>
                      <p>{input.personality}</p>
                      <span className="status waiting">
                        <i /> Ready to meet the neighborhood
                      </span>
                    </div>
                    <div className="launch-summary">
                      <span>
                        Mission<strong>{input.goal}</strong>
                      </span>
                      <span>
                        Strategy<strong>{input.strategy}</strong>
                      </span>
                      <span>
                        Network<strong>BNB Chain · Simulation</strong>
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="create-footer">
                {step > 0 ? (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setStep((s) => s - 1)}
                  >
                    ← Back
                  </button>
                ) : (
                  <span className="field-hint">
                    No wallet. Just imagination.
                  </span>
                )}
                <button
                  className="primary-button"
                  disabled={
                    step === 0 && (!input.name.trim() || !input.symbol.trim())
                  }
                >
                  {step === 3 ? (
                    <>
                      <Sparkles size={14} /> Mint & launch
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
