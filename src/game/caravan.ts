import { OFFLINE_CAP_MS } from "./constants";
import { DUNGEONS } from "./content";
import { isDungeonUnlocked } from "./expeditions";
import { addXp } from "./heroes";
import { cloneState } from "./state";
import type { ActionResult, CaravanFocusDefinition, CaravanFocusId, CaravanRewardSummary, GameState } from "./types";

export const CARAVAN_MIN_DURATION_MS = 60 * 60 * 1000;
export const CARAVAN_MAX_DURATION_MS = OFFLINE_CAP_MS;

export const CARAVAN_FOCUS_DEFINITIONS: CaravanFocusDefinition[] = [
  {
    id: "xp",
    label: "XP",
    unlockLevel: 1,
    description: "Training drills while away. Best when you are pushing hero level gates."
  },
  {
    id: "gold",
    label: "Gold",
    unlockLevel: 3,
    description: "Merchant errands for town and forge spending."
  },
  {
    id: "ore",
    label: "Ore",
    unlockLevel: 5,
    description: "Supply wagons for early crafting and upgrades."
  },
  {
    id: "crystal",
    label: "Crystal",
    unlockLevel: 15,
    description: "Survey crews for midgame forge costs."
  },
  {
    id: "rune",
    label: "Runes",
    unlockLevel: 20,
    description: "Quiet relic hunts for advanced forge work."
  }
];

function getBestUnlockedDungeon(state: GameState) {
  const unlocked = DUNGEONS.filter((dungeon) => !dungeon.boss && isDungeonUnlocked(state, dungeon));
  if (unlocked.length === 0) {
    return DUNGEONS[0];
  }
  return unlocked.reduce((best, current) => (current.lootLevel > best.lootLevel ? current : best), unlocked[0]);
}

export function getCaravanFocusDefinition(focusId: CaravanFocusId): CaravanFocusDefinition {
  return CARAVAN_FOCUS_DEFINITIONS.find((focus) => focus.id === focusId) ?? CARAVAN_FOCUS_DEFINITIONS[0];
}

export function isCaravanFocusUnlocked(state: GameState, focusId: CaravanFocusId): boolean {
  return state.hero.level >= getCaravanFocusDefinition(focusId).unlockLevel;
}

export function getUnlockedCaravanFocuses(state: GameState): CaravanFocusDefinition[] {
  return CARAVAN_FOCUS_DEFINITIONS.filter((focus) => isCaravanFocusUnlocked(state, focus.id));
}

export function clampCaravanDurationMs(durationMs: number): number {
  if (!Number.isFinite(durationMs)) {
    return CARAVAN_MIN_DURATION_MS;
  }
  const snappedHours = Math.round(durationMs / CARAVAN_MIN_DURATION_MS);
  return Math.min(CARAVAN_MAX_DURATION_MS, Math.max(CARAVAN_MIN_DURATION_MS, snappedHours * CARAVAN_MIN_DURATION_MS));
}

function emptyRewards(): CaravanRewardSummary {
  return {
    xp: 0,
    gold: 0,
    materials: {}
  };
}

function calculateCaravanRewards(state: GameState, focusId: CaravanFocusId, durationMs: number, enforceMinimum: boolean): CaravanRewardSummary {
  const hours = Math.max(0, durationMs) / CARAVAN_MIN_DURATION_MS;
  const dungeon = getBestUnlockedDungeon(state);
  const heroLevel = state.hero.level;
  const rewards = emptyRewards();
  const normalize = (value: number) => (enforceMinimum ? Math.max(1, Math.floor(value)) : Math.max(0, Math.floor(value)));

  switch (focusId) {
    case "xp": {
      const tavernBoost = 1 + state.town.tavern * 0.08;
      rewards.xp = normalize((dungeon.baseXp * 0.18 + heroLevel * 4) * hours * tavernBoost);
      break;
    }
    case "gold": {
      const marketBoost = 1 + state.town.market * 0.08;
      rewards.gold = normalize((dungeon.baseGold * 0.45 + heroLevel * 3) * hours * marketBoost);
      break;
    }
    case "ore": {
      rewards.materials.ore = normalize((4 + dungeon.lootLevel * 0.7 + state.town.mine * 3) * hours);
      break;
    }
    case "crystal": {
      rewards.materials.crystal = normalize((1.5 + dungeon.lootLevel * 0.28 + Math.max(0, state.town.mine - 1) * 1.2) * hours);
      break;
    }
    case "rune": {
      rewards.materials.rune = normalize((0.45 + dungeon.lootLevel * 0.12 + state.town.library * 0.3) * hours);
      break;
    }
  }

  return rewards;
}

export function estimateCaravanRewards(state: GameState, focusId: CaravanFocusId, durationMs: number): CaravanRewardSummary {
  return calculateCaravanRewards(state, focusId, clampCaravanDurationMs(durationMs), true);
}

export function formatCaravanRewardText(rewards: CaravanRewardSummary): string {
  const parts = [
    rewards.xp > 0 ? `${rewards.xp} XP` : null,
    rewards.gold > 0 ? `${rewards.gold} Gold` : null,
    (rewards.materials.ore ?? 0) > 0 ? `${rewards.materials.ore} Ore` : null,
    (rewards.materials.crystal ?? 0) > 0 ? `${rewards.materials.crystal} Crystal` : null,
    (rewards.materials.rune ?? 0) > 0 ? `${rewards.materials.rune} Runes` : null
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "no rewards";
}

function addCaravanRewards(state: GameState, rewards: CaravanRewardSummary): number[] {
  const { levelUps } = rewards.xp > 0 ? addXp(state, rewards.xp) : { levelUps: [] };
  state.resources.gold += rewards.gold;
  state.resources.ore += rewards.materials.ore ?? 0;
  state.resources.crystal += rewards.materials.crystal ?? 0;
  state.resources.rune += rewards.materials.rune ?? 0;
  return levelUps;
}

export function startCaravanJob(state: GameState, focusId: CaravanFocusId, durationMs: number, now: number): ActionResult {
  if (!state.settings.heroCreated) {
    return { ok: false, state, error: "Create your hero before planning a Caravan." };
  }

  if (state.caravan.activeJob) {
    return { ok: false, state, error: "A Caravan is already active. Cancel it before starting another." };
  }

  if (!CARAVAN_FOCUS_DEFINITIONS.some((focus) => focus.id === focusId)) {
    return { ok: false, state, error: "Unknown Caravan focus." };
  }

  if (!isCaravanFocusUnlocked(state, focusId)) {
    const focus = getCaravanFocusDefinition(focusId);
    return { ok: false, state, error: `${focus.label} Caravan unlocks at hero level ${focus.unlockLevel}.` };
  }

  const duration = clampCaravanDurationMs(durationMs);
  const next = cloneState(state);
  next.caravan.activeJob = {
    focusId,
    durationMs: duration,
    startedAt: now,
    endsAt: now + duration
  };
  next.updatedAt = now;

  const focus = getCaravanFocusDefinition(focusId);
  return { ok: true, state: next, message: `Caravan set: ${focus.label} focus for ${Math.round(duration / CARAVAN_MIN_DURATION_MS)}h.` };
}

export function cancelCaravanJob(state: GameState, now: number): ActionResult {
  if (!state.caravan.activeJob) {
    return { ok: false, state, error: "No active Caravan to cancel." };
  }

  const next = cloneState(state);
  next.caravan.activeJob = null;
  next.updatedAt = now;
  return { ok: true, state: next, message: "Caravan canceled. No rewards collected." };
}

export function applyCaravanOfflineProgress(state: GameState, now: number, offlineStartedAt: number) {
  const activeJob = state.caravan.activeJob;
  if (!activeJob) {
    return null;
  }

  const jobOfflineStart = Math.max(activeJob.startedAt, offlineStartedAt);
  const effectiveEnd = Math.min(now, activeJob.endsAt, jobOfflineStart + OFFLINE_CAP_MS);
  const elapsedMs = Math.max(0, effectiveEnd - jobOfflineStart);
  if (elapsedMs <= 0) {
    return null;
  }

  const completed = effectiveEnd >= activeJob.endsAt;
  const rewards = completed ? calculateCaravanRewards(state, activeJob.focusId, activeJob.durationMs, false) : emptyRewards();
  const levelUps = completed ? addCaravanRewards(state, rewards) : [];
  if (completed) {
    state.caravan.activeJob = null;
  }

  return {
    focusId: activeJob.focusId,
    rewards,
    elapsedMs,
    completed,
    levelUps
  };
}
