# Meme City

An interactive frontend demo of the Pieverse Meme Agent city, built with Next.js App Router, TypeScript, Three.js, and React Three Fiber. Dependencies are managed with Bun.

## Requirements

- Node.js 20.9 or later.
- Bun (the project declares version `1.4.2`; dependencies are locked in `bun.lock`).
- A modern browser with WebGL support to render the 3D city.

## Getting Started

```sh
git clone https://github.com/DrakenZeng/memecity.git
cd memecity
bun install
bun run dev --port 3015
```

Open the URL printed in your terminal, typically `http://localhost:3015` for the command above. The default port is 3000; use `--port` to override it.

No wallet, API keys, or environment variables are required for the current demo. All data is simulated locally in your browser. See [Simulation Boundaries](#simulation-boundaries) for details.

## Available Commands

| Command | Description |
| --- | --- |
| `bun run dev` | Start the local development server |
| `bun run typecheck` | Run TypeScript type checks |
| `bun test` | Run the test suite |
| `bun run build` | Create a production build |
| `bun run start` | Start the production server after building |
| `bun run export` | Export a static site to `out/` |

## Checks and Production Builds

```sh
bun run typecheck
bun test
bun run build
```

After a standard Next.js build, run `bun run start` to serve the application. For static hosting, run `bun run export` and deploy the generated `out/` directory. After a static export, run `bun run build` again before using `bun run start`.

Dependencies (`node_modules/`), build output (`.next/` and `out/`), temporary caches, and environment variable files are excluded from Git. Hosting the repository on GitHub does not deploy the website; a hosting service must be configured separately.

## Exploring the Demo

### City and Navigation

- Explore a 68 × 68 map, roughly 12 times the area of the original city, with nine districts: the central Exchange, night market, residential area, research campus, industrial zone, gardens, amusement area, station, and waterfront.
- Select **Whole city** in the bottom-right corner to see the entire map. Use **City Map** on the right to navigate by clicking a location or selecting a district. Select **Exchange** to return to the center. The zoom range is 2.5–90; the number of ordinary buildings and facilities is independent of the agent population.
- The outer city adds 70 buildings, market stalls, a Ferris wheel, a lake, gazebos, a train, warehouses, cranes, bridges, docks, boats, and an airship. The city contains 61 road vehicles and 32 ordinary pedestrians. These pedestrians are background characters, not token agents.
- Drag to pan. Use the mouse wheel or trackpad to zoom around the pointer, or pinch to zoom on touchscreens. Bottom-right controls also provide zoom, reset, and whole-city views.
- The city center retains six background buildings, the Exchange, a cafe, a park, a fountain, sculptures, benches, streetlights, a bus stop, a ring road, taxis, a night bus, traffic lights, delivery drones, and cats. The outer districts use a separate static layout.

### Agents and the Genesis Gate

- Click a walking agent, its name label, or its bottom card to open its details. Ordinary buildings are shared facilities and are not assigned to individual agents.
- Use **Launch** to configure identity, personality, and strategy, then confirm. Each launch creates one agent without adding a building. The demo supports up to 24 residents.
- After mint confirmation, the arrival sequence takes approximately 11 seconds: mint confirmation → internal initialization and scanning lights → front doors open → the agent walks down the steps into the plaza. Its details open when the sequence finishes.
- Select **Demo the Genesis Gate** below the Exchange sign to replay the arrival animation without adding residents or changing funds or notes. **Skip** is available.
- Automatic research and trading are deferred during arrivals, while existing residents can continue roaming. Scheduling resumes after the sequence finishes.
- Agents that are not sleeping choose public destinations, follow the pedestrian network, and stop for coffee, reading, greetings, dancing, or waiting for transport. Actions appear overhead, and street events are added to the activity feed. Agents awaiting work activation can still roam; sleeping agents stop walking.
- A welcome story plays after a new agent completes its arrival.

### Stories and City Life

- Select **Surprise me** in **City Pulse** to trigger a random agent story. The top-right **Scene Lab** lets you select an agent and choose from 43 stories across six categories. Background events include fountain coins, plaza dances, and meteors; they are deferred while an agent story is playing.
- Stories cover market moves, developer buying and selling, developer exits, treasury deliveries, compute energy, buybacks and burns, permission warnings, community mail, research topics, neighbor interactions, and anniversaries. Props such as umbrellas, blankets, empty chairs, rocket balloons, and cakes follow the characters. Neighbors communicate over city radio without duplicating or teleporting characters.
- Random stories are enabled by default. Each lasts 18 seconds, with configurable gaps of 12, 18, 30, or 60 seconds. Automatic stories do not move the camera; use **Locate agent** to find the subject. Manual demonstrations in Scene Lab locate the character automatically. Pausing stops both story timers and animations.
- Story cards support skipping, visual replay, restoring simulated values from before the latest story, and downloading an SVG keepsake card. Replays do not apply numerical changes again. Only the latest event for each agent can be restored; restoration preserves notes written afterward and badges already earned.
- **Chronicle** shows mood, simulated price history, developer holdings, badges, neighbor relationships, and event records. You can submit research topics for research stories to read. **Daily paper** summarizes the eight most recent city news items.

### Agent Controls and Persistence

- Agent details include **Overview**, **Activity**, **Treasury**, and **Notes**, with controls for research, posting, buybacks, burns, tax income, sleeping, and waking.
- New agents start with no funds. **Fund agent** simulates tax income, and **Wake up** activates the agent's work state.
- Notes are marked as read the next time the agent wakes, with a preset acknowledgment added to the activity log.
- **Pause simulation** pauses automatic research and trading, resident movement, vehicles, and environmental animations. The arrival demo completes independently. **Reset** asks for confirmation before resetting the simulation.
- Data is stored in the current browser's localStorage and does not sync across devices. Camera state, positions, random activities, and pause state are not persisted.

## Project Structure

```text
src/app/                                  Pages, metadata, and responsive styles
src/components/city-scene.tsx             City layout, Exchange, projected labels, and camera
src/components/city-environment.tsx       Shared facilities, vehicles, and city effects
src/components/metropolis-environment.tsx Outer districts, traffic, attractions, and waterfront
src/components/metropolis-buildings.tsx   Outer buildings and instanced rendering
src/components/city-visitors.tsx          Background pedestrians
src/components/world-navigator.tsx        Minimap and district navigation
src/components/roaming-agent.tsx          Resident movement and random activities
src/components/agent-avatar.tsx           Characters and limb animations
src/components/hatch-effect.tsx           Delayed arrival sequence
src/components/meme-city.tsx              UI, agent creation, details, and simulation controls
src/lib/city-life.ts                      Scene constants, public places, and pedestrian network
src/lib/metropolis.ts                     Districts, building layouts, and traffic routes
src/lib/simulation.ts                     Funds, work states, and save rules
src/lib/stories.ts                        43 stories, personality reactions, snapshots, saves, and card export
src/hooks/use-stories.ts                  Story scheduling, timing, replay, and persistence
src/components/story-lab.tsx              Scene Lab, event cards, chronicle, and newspaper
src/components/story-effects.tsx          3D story props that follow agents
src/lib/*.test.ts                         Tests for navigation, arrival timing, simulation rules, and stories
```

## Simulation Boundaries

All market data, funds, research, and posts are simulated. There are no real wallets, on-chain transactions, X posts, or AI integrations. Personalities and strategies are for demonstration; work events use preset text, while street destinations and actions are selected randomly.

- Buybacks are capped at $120 per transaction and cannot exceed the treasury balance. The simulated token price is $0.01 per token.
- Tax events add $80 in operating funds and $20 in compute funds.
- Research and posting cost $2 and $3 in compute funds, respectively, and are skipped if the balance is insufficient.
- Each burn is capped at 10,000 tokens and can only consume tokens already held.
- Agents do not initiate research, posts, or trades while sleeping or awaiting work activation.
- Roaming and background city effects do not affect funds. Agent stories explicitly labeled **MOCK** may change simulated market values, developer holdings, compute funds, or treasury balances. Story-driven buybacks and burns still respect available balances and per-transaction limits.
- History is limited to 80 activity entries, 120 story events, 30 price points per agent, and 12 research topics. The demo does not implement real daily budgets, market-threshold wake-ups, US stock trading, or return calculations.

The 3D scene requires WebGL. If WebGL is unavailable, a notice is shown while cards and detail panels remain usable. System fonts are used automatically if Google Fonts is unavailable.
