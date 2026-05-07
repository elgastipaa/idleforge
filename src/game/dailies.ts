import { DAILY_RESET_HOUR_UTC, DAILY_TASK_COUNT, DAY_MS, VIGOR_MAX } from "./constants";
import { DAILY_TASK_POOL, DUNGEONS } from "./content";
import { isDungeonUnlocked } from "./expeditions";
import { createRng } from "./rng";
import { cloneState } from "./state";
import type { ActionResult, DailyTaskKind, DailyTaskState, GameState, MaterialBundle } from "./types";

export function getDailyWindowStartAt(now: number): number {
  const date = new Date(now);
  const resetCandidate = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    DAILY_RESET_HOUR_UTC,
    0,
    0,
    0
  );
  return now >= resetCandidate ? resetCandidate : resetCandidate - DAY_MS;
}

export function getNextDailyResetAt(now: number): number {
  return getDailyWindowStartAt(now) + DAY_MS;
}

function clampProgress(progress: number, target: number): number {
  return Math.max(0, Math.min(target, progress));
}

function getTaskSetKey(tasks: DailyTaskState[]): string {
  return tasks.map((task) => task.kind).sort().join("|");
}

function pickUniqueKinds(seed: string, previousKey: string | null): DailyTaskKind[] {
  const definitions = DAILY_TASK_POOL.map((task) => task.kind);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const rng = createRng(`${seed}:daily:${attempt}`);
    const pool = [...definitions];
    const picked: DailyTaskKind[] = [];
    while (picked.length < DAILY_TASK_COUNT && pool.length > 0) {
      const index = rng.int(0, pool.length - 1);
      picked.push(pool[index]);
      pool.splice(index, 1);
    }
    const key = [...picked].sort().join("|");
    if (!previousKey || key !== previousKey || attempt === 5) {
      return picked;
    }
  }
  return definitions.slice(0, DAILY_TASK_COUNT);
}

function addScaledMaterials(materials: Partial<MaterialBundle>, ratio: number): Partial<MaterialBundle> {
  const output: Partial<MaterialBundle> = {};
  (Object.keys(materials) as (keyof MaterialBundle)[]).forEach((key) => {
    const value = materials[key] ?? 0;
    if (value > 0) {
      output[key] = Math.max(1, Math.floor(value * ratio));
    }
  });
  return output;
}

function getBestUnlockedNonBossDungeon(state: GameState) {
  const candidates = DUNGEONS.filter((dungeon) => !dungeon.boss && isDungeonUnlocked(state, dungeon));
  if (candidates.length === 0) {
    return DUNGEONS[0];
  }
  return candidates.reduce((best, current) => {
    if (current.baseGold > best.baseGold) return current;
    return best;
  }, candidates[0]);
}

function createDailyTasks(state: GameState, now: number, previousKey: string | null): DailyTaskState[] {
  const windowStartAt = getDailyWindowStartAt(now);
  const kinds = pickUniqueKinds(`${state.seed}:${windowStartAt}`, previousKey);
  const bestDungeon = getBestUnlockedNonBossDungeon(state);
  const rng = createRng(`${state.seed}:daily-reward:${windowStartAt}`);

  return kinds.map((kind, index) => {
    const definition = DAILY_TASK_POOL.find((entry) => entry.kind === kind) ?? DAILY_TASK_POOL[0];
    const ratio = rng.pick([0.08, 0.1, 0.12]);
    const rewardGold = Math.max(1, Math.floor(bestDungeon.baseGold * ratio));
    const rewardMaterials = addScaledMaterials(bestDungeon.materials, ratio);
    const rewardVigor = rng.int(8, 12);
    return {
      id: `${windowStartAt}-${kind}-${index}`,
      kind: definition.kind,
      label: definition.label,
      target: definition.target,
      progress: 0,
      claimed: false,
      reward: {
        gold: rewardGold,
        materials: rewardMaterials,
        vigor: rewardVigor
      }
    };
  });
}

export function ensureDailies(state: GameState, now: number): { state: GameState; reset: boolean } {
  const needsReset = now >= state.dailies.nextResetAt || state.dailies.tasks.length !== DAILY_TASK_COUNT;
  if (!needsReset) {
    return { state, reset: false };
  }

  const next = cloneState(state);
  const previousKey = state.dailies.tasks.length === DAILY_TASK_COUNT ? getTaskSetKey(state.dailies.tasks) : state.dailies.lastTaskSetKey;
  const tasks = createDailyTasks(next, now, previousKey);
  next.dailies.windowStartAt = getDailyWindowStartAt(now);
  next.dailies.nextResetAt = getNextDailyResetAt(now);
  next.dailies.lastTaskSetKey = getTaskSetKey(tasks);
  next.dailies.tasks = tasks;
  next.updatedAt = now;
  return { state: next, reset: true };
}

export function applyDailyProgress(
  state: GameState,
  now: number,
  progressByKind: Partial<Record<DailyTaskKind, number>>
): { state: GameState; reset: boolean; progressed: boolean } {
  const ensured = ensureDailies(state, now);
  let next = ensured.state;
  let progressed = false;

  const taskUpdates = next.dailies.tasks.map((task) => {
    const delta = progressByKind[task.kind] ?? 0;
    if (delta <= 0 || task.progress >= task.target) {
      return task;
    }
    progressed = true;
    return {
      ...task,
      progress: clampProgress(task.progress + delta, task.target)
    };
  });

  if (!progressed) {
    return { state: next, reset: ensured.reset, progressed: false };
  }

  if (next === state) {
    next = cloneState(state);
  }
  next.dailies.tasks = taskUpdates;
  next.updatedAt = now;
  return { state: next, reset: ensured.reset, progressed: true };
}

function addMaterials(state: GameState, materials: Partial<MaterialBundle>) {
  state.resources.ore += materials.ore ?? 0;
  state.resources.crystal += materials.crystal ?? 0;
  state.resources.rune += materials.rune ?? 0;
  state.resources.relicFragment += materials.relicFragment ?? 0;
}

export function claimDailyTask(state: GameState, taskId: string, now: number): ActionResult {
  const ensured = ensureDailies(state, now);
  const taskIndex = ensured.state.dailies.tasks.findIndex((task) => task.id === taskId);
  if (taskIndex < 0) {
    return { ok: false, state: ensured.state, error: "Daily task not found." };
  }

  const task = ensured.state.dailies.tasks[taskIndex];
  if (task.claimed) {
    return { ok: false, state: ensured.state, error: "Daily reward already claimed." };
  }

  if (task.progress < task.target) {
    return { ok: false, state: ensured.state, error: "Daily task is not complete yet." };
  }

  const next = cloneState(ensured.state);
  next.dailies.tasks[taskIndex].claimed = true;
  next.resources.gold += task.reward.gold;
  addMaterials(next, task.reward.materials);
  next.vigor.current = Math.min(VIGOR_MAX, next.vigor.current + task.reward.vigor);
  next.lifetime.totalDailyClaims += 1;
  next.updatedAt = now;
  return { ok: true, state: next, message: `Daily claimed: ${task.label}.` };
}
