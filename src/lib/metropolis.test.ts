import { expect, test } from "bun:test";
import {
  cityBlocks,
  DISTRICTS,
  MAP_HALF,
  TRAFFIC_LOOPS,
  loopPoint,
} from "./metropolis";
import { CITY_NODES, PLACES, streetRoute } from "./city-life";
test("the outer city is deterministic, bounded and preserves the launch plaza", () => {
  const blocks = cityBlocks();
  expect(blocks.length).toBeGreaterThan(60);
  expect(cityBlocks()).toEqual(blocks);
  for (const b of blocks) {
    expect(Math.abs(b.x) + b.w / 2).toBeLessThan(MAP_HALF);
    expect(Math.abs(b.z) + b.d / 2).toBeLessThan(MAP_HALF);
    expect(Math.abs(b.x) > 9.5 || Math.abs(b.z) > 9.5).toBe(true);
  }
  expect(new Set(blocks.map((b) => b.kind)).size).toBe(5);
  expect(DISTRICTS.length).toBe(9);
});
test("the extended pedestrian routes stay outside building footprints", () => {
  for (const p of CITY_NODES)
    for (const b of cityBlocks())
      expect(
        Math.abs(p[0] - b.x) < b.w / 2 + 0.25 &&
          Math.abs(p[1] - b.z) < b.d / 2 + 0.25,
      ).toBe(false);
  expect(PLACES.some((p) => CITY_NODES[p.node][0] > 25)).toBe(true);
});
test("traffic wraps continuously and remains on the outer road network", () => {
  for (const loop of TRAFFIC_LOOPS) {
    const length = loop.points.reduce((sum, a, i) => {
      const b = loop.points[(i + 1) % loop.points.length];
      return sum + Math.hypot(b[0] - a[0], b[1] - a[1]);
    }, 0);
    expect(loopPoint(loop.points, 0)).toEqual(loopPoint(loop.points, length));
    for (let d = -50; d < 350; d += 0.7) {
      const p = loopPoint(loop.points, d);
      expect(Math.abs(p.x)).toBeLessThan(MAP_HALF);
      expect(Math.abs(p.z)).toBeLessThan(MAP_HALF);
      expect([p.x, p.z, p.rotation].every(Number.isFinite)).toBe(true);
    }
  }
});
test("agents can traverse complete routes without cutting through any outer building", () => {
  const edges = new Set<string>();
  for (let from = 0; from < CITY_NODES.length; from++)
    for (const place of PLACES) {
      const route = [from, ...streetRoute(from, place.node)];
      for (let i = 1; i < route.length; i++)
        edges.add([route[i - 1], route[i]].sort((a, b) => a - b).join(","));
    }
  const collisions: string[] = [];
  for (const edge of edges) {
    const [from, to] = edge.split(",").map(Number),
      a = CITY_NODES[from],
      c = CITY_NODES[to];
    for (const b of cityBlocks()) {
      let low = 0,
        high = 1,
        intersects = true;
      for (const [origin, delta, min, max] of [
        [a[0], c[0] - a[0], b.x - b.w / 2 - 0.2, b.x + b.w / 2 + 0.2],
        [a[1], c[1] - a[1], b.z - b.d / 2 - 0.2, b.z + b.d / 2 + 0.2],
      ]) {
        if (Math.abs(delta) < 1e-8) {
          if (origin < min || origin > max) {
            intersects = false;
            break;
          }
        } else {
          const t1 = (min - origin) / delta,
            t2 = (max - origin) / delta;
          low = Math.max(low, Math.min(t1, t2));
          high = Math.min(high, Math.max(t1, t2));
          if (low > high) {
            intersects = false;
            break;
          }
        }
      }
      if (intersects)
        collisions.push(`edge ${edge} intersects ${b.kind} at ${b.x},${b.z}`);
    }
  }
  expect(collisions).toEqual([]);
});
