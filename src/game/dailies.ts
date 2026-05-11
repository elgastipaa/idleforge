import { DAILY_RESET_HOUR_LOCAL, DAILY_TASK_COUNT } from "./constants";
import { DAILY_TASK_POOL, DUNGEONS } from "./content";
import { isDungeonUnlocked } from "./expeditions";
import { createRng } from "./rng";
import { cloneState } from "./state";
import type { ActionResult, DailyReward, DailyTaskKind, DailyTaskState, GameState, MaterialBundle, WeeklyContractState } from "./types";

const WEEKLY_CONTRACT_TARGETS = [3, 9, 15] as const;

export function getDailyWindowStartAt(now: number): number {
  const date = new Date(now);
  const resetCandidate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), DAILY_RESET_HOUR_LOCAL, 0, 0, 0).getTime();
  if (now >= resetCandidate) {
    return resetCandidate;
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, DAILY_RESET_HOUR_LOCAL, 0, 0, 0).getTime();
}

export function getNextDailyResetAt(now: number): number {
  const windowStart = new Date(getDailyWindowStartAt(now));
  return new Date(
    windowStart.getFullYear(),
    windowStart.getMonth(),
    windowStart.getDate() + 1,
    DAILY_RESET_HOUR_LOCAL,
    0,
    0,
    0
  ).getTime();
}

export function getWeeklyWindowStartAt(now: number): number {
  const dailyWindowStart = new Date(getDailyWindowStartAt(now));
  const daysSinceMonday = (dailyWindowStart.getDay() + 6) % 7;
  return new Date(
    dailyWindowStart.getFullYear(),
    dailyWindowStart.getMonth(),
    dailyWindowStart.getDate() - daysSinceMonday,
    DAILY_RESET_HOUR_LOCAL,
    0,
    0,
    0
  ).getTime();
}

export function getNextWeeklyResetAt(now: number): number {
  const windowStart = new Date(getWeeklyWindowStartAt(now));
  return new Date(
    windowStart.getFullYear(),
    windowStart.getMonth(),
    windowStart.getDate() + 7,
    DAILY_RESET_HOUR_LOCAL,
    0,
    0,
    0
  ).getTime();
}

function clampProgress(progress: number, target: number): number {
  return Math.max(0, Math.min(target, progress));
}

function getTaskSetKey(tasks: DailyTaskState[]): string {
  return tasks.map((task) => task.kind).sort().join("|");
}

function getEligibleTaskDefinitions(state: GameState): { kind: DailyTaskKind; label: string; target: number }[] {
  const bossAvailable = DUNGEONS.some((dungeon) => dungeon.boss && isDungeonUnlocked(state, dungeon));
  const hasAnyItem = state.lifetime.totalItemsFound > 0 || state.inventory.length > 0 || Object.values(state.equipment).some(Boolean);
  const canCraftSoon = state.hero.level >= 2 || state.lifetime.expeditionsSucceeded > 0 || state.town.forge > 0;

  const filtered = DAILY_TASK_POOL.filter((task) => {
    switch (task.kind) {
      case "defeat_boss":
        return bossAvailable;
      case "salvage_items":
      case "sell_items":
        return hasAnyItem;
      case "craft_item":
        return canCraftSoon;
      default:
        return true;
    }
  });

  if (filtered.length >= DAILY_TASK_COUNT) {
    return filtered;
  }

  const byKind = new Map(filtered.map((task) => [task.kind, task]));
  DAILY_TASK_POOL.forEach((task) => {
    if (task.kind === "defeat_boss" && !bossAvailable) return;
    if (!byKind.has(task.kind)) {
      byKind.set(task.kind, task);
    }
  });
  return [...byKind.values()];
}

function pickUniqueKinds(seed: string, previousKey: string | null, definitions: DailyTaskKind[]): DailyTaskKind[] {
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

function createWeeklyContracts(state: GameState, now: number): WeeklyContractState {
  const windowStartAt = getWeeklyWindowStartAt(now);
  const bestDungeon = getBestUnlockedNonBossDungeon(state);
  const rewardScales = [0.35, 0.75, 1.25];
  return {
    windowStartAt,
    nextResetAt: getNextWeeklyResetAt(now),
    progress: 0,
    milestones: WEEKLY_CONTRACT_TARGETS.map((target, index) => ({
      target,
      claimed: false,
      reward: {
        gold: Math.max(1, Math.floor(bestDungeon.baseGold * rewardScales[index])),
        materials: addScaledMaterials(bestDungeon.materials, rewardScales[index]),
        vigor: [15, 25, 40][index]
      }
    }))
  };
}

function createDailyTasks(state: GameState, now: number, previousKey: string | null): DailyTaskState[] {
  const windowStartAt = getDailyWindowStartAt(now);
  const definitions = getEligibleTaskDefinitions(state);
  const kinds = pickUniqueKinds(
    `${state.seed}:${windowStartAt}`,
    previousKey,
    definitions.map((definition) => definition.kind)
  );
  const bestDungeon = getBestUnlockedNonBossDungeon(state);
  const rng = createRng(`${state.seed}:daily-reward:${windowStartAt}`);

  return kinds.map((kind, index) => {
    const definition = DAILY_TASK_POOL.find((entry) => entry.kind === kind) ?? DAILY_TASK_POOL[0];
    const role = index === 0 ? "primary" : "secondary";
    const ratio = role === "primary" ? rng.pick([0.16, 0.18, 0.2]) : rng.pick([0.08, 0.1, 0.12]);
    const rewardGold = Math.max(1, Math.floor(bestDungeon.baseGold * ratio));
    const rewardMaterials = addScaledMaterials(bestDungeon.materials, ratio);
    const rewardVigor = role === "primary" ? rng.int(14, 18) : rng.int(8, 12);
    return {
      id: `${windowStartAt}-${kind}-${index}`,
      kind: definition.kind,
      role,
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
  const windowStartAt = getDailyWindowStartAt(now);
  const weeklyWindowStartAt = getWeeklyWindowStartAt(now);
  const needsReset = now >= state.dailies.nextResetAt || state.dailies.windowStartAt !== windowStartAt || state.dailies.tasks.length !== DAILY_TASK_COUNT;
  const weekly = state.dailies.weekly;
  const needsWeeklyReset =
    !weekly ||
    now >= weekly.nextResetAt ||
    weekly.windowStartAt !== weeklyWindowStartAt ||
    weekly.milestones.length !== WEEKLY_CONTRACT_TARGETS.length;
  if (!needsReset && !needsWeeklyReset) {
    return { state, reset: false };
  }

  const next = cloneState(state);
  if (needsWeeklyReset) {
    next.dailies.weekly = createWeeklyContracts(next, now);
  }
  if (needsReset) {
    const previousKey = state.dailies.tasks.length === DAILY_TASK_COUNT ? getTaskSetKey(state.dailies.tasks) : state.dailies.lastTaskSetKey;
    const tasks = createDailyTasks(next, now, previousKey);
    next.dailies.windowStartAt = windowStartAt;
    next.dailies.nextResetAt = getNextDailyResetAt(now);
    next.dailies.lastTaskSetKey = getTaskSetKey(tasks);
    next.dailies.tasks = tasks;
  }
  next.updatedAt = now;
  return { state: next, reset: needsReset };
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

function addDailyReward(state: GameState, reward: DailyReward) {
  state.resources.gold += reward.gold;
  addMaterials(state, reward.materials);
  state.vigor.current = Math.min(state.vigor.max, state.vigor.current + reward.vigor);
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
  addDailyReward(next, task.reward);
  const weeklyTarget = next.dailies.weekly.milestones.at(-1)?.target ?? WEEKLY_CONTRACT_TARGETS[WEEKLY_CONTRACT_TARGETS.length - 1];
  next.dailies.weekly.progress = Math.min(weeklyTarget, next.dailies.weekly.progress + 1);
  next.lifetime.totalDailyClaims += 1;
  next.updatedAt = now;
  return { ok: true, state: next, message: `Contract claimed: ${task.label}.` };
}

export function claimWeeklyContractMilestone(state: GameState, milestoneIndex: number, now: number): ActionResult {
  const ensured = ensureDailies(state, now);
  const milestone = ensured.state.dailies.weekly.milestones[milestoneIndex];
  if (!milestone) {
    return { ok: false, state: ensured.state, error: "Weekly milestone not found." };
  }

  if (milestone.claimed) {
    return { ok: false, state: ensured.state, error: "Weekly milestone already claimed." };
  }

  if (ensured.state.dailies.weekly.progress < milestone.target) {
    return { ok: false, state: ensured.state, error: "Weekly milestone is not complete yet." };
  }

  const next = cloneState(ensured.state);
  next.dailies.weekly.milestones[milestoneIndex].claimed = true;
  addDailyReward(next, milestone.reward);
  next.updatedAt = now;
  return { ok: true, state: next, message: `Weekly contract milestone claimed: ${milestone.target}.` };
}
