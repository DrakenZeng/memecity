export type HatchRun = {
  agentId: string;
  startedAt: number;
  key: string;
  isNew: boolean;
};
export const HATCH_DURATION = 11000;
export const HATCH_STAGE_TIMES = [1400, 4300, 7200] as const;
export const HATCH_STAGES = [
  "Mint confirmed. Preparing a new mind…",
  "Inside the Exchange. Something is waking up…",
  "The Genesis Gate is opening",
  "Hello, world. One more meme on the streets.",
] as const;
export function hatchStage(elapsed: number) {
  return elapsed < 1400 ? 0 : elapsed < 4300 ? 1 : elapsed < 7200 ? 2 : 3;
}
export function hatchTravel(elapsed: number) {
  return Math.max(0, Math.min(1, (elapsed - 4300) / 5700));
}
