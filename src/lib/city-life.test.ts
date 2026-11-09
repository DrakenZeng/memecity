import { expect, test } from "bun:test";
import { CITY_NODES, PLACES, streetRoute, nearestNode } from "./city-life";
import { hatchTravel, HATCH_DURATION } from "./hatching";
test("every public place is reachable without a building being assigned to an agent", () => {
  for (let from = 0; from < CITY_NODES.length; from++)
    for (const place of PLACES) {
      const route = streetRoute(from, place.node);
      if (from === place.node) expect(route).toEqual([]);
      else {
        expect(route.at(-1)).toBe(place.node);
        expect(new Set(route).size).toBe(route.length);
      }
    }
});
test("walking routes avoid the fountain basin and token plinth", () => {
  const obstacles = [
    { x: -3.5, z: 3.3, r: 1.3 },
    { x: 4.7, z: 3.1, r: 0.86 },
  ];
  for (let from = 0; from < CITY_NODES.length; from++)
    for (const place of PLACES) {
      const path = [from, ...streetRoute(from, place.node)];
      for (let i = 1; i < path.length; i++) {
        const a = CITY_NODES[path[i - 1]],
          b = CITY_NODES[path[i]];
        for (const o of obstacles) {
          const dx = b[0] - a[0],
            dz = b[1] - a[1];
          const t = Math.max(
            0,
            Math.min(
              1,
              ((o.x - a[0]) * dx + (o.z - a[1]) * dz) / (dx * dx + dz * dz),
            ),
          );
          expect(
            Math.hypot(a[0] + dx * t - o.x, a[1] + dz * t - o.z),
          ).toBeGreaterThan(o.r);
        }
      }
    }
});
test("old saved spawn positions resolve to public walkways", () => {
  for (const point of [
    [-7, -6],
    [4, -4],
    [7, 6],
    [0, 1.7],
  ])
    expect(CITY_NODES[nearestNode(point)]).toBeDefined();
});
test("a new agent remains inside after mint, then finishes walking out before the sequence completes", () => {
  expect(hatchTravel(0)).toBe(0);
  expect(hatchTravel(4200)).toBe(0);
  expect(hatchTravel(7000)).toBeGreaterThan(0);
  expect(hatchTravel(HATCH_DURATION)).toBe(1);
});
