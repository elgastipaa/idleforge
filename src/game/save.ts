import { BUILDING_IDS, DAILY_TASK_COUNT, EQUIPMENT_SLOTS, INVENTORY_LIMIT, SAVE_GAME_NAME, SAVE_VERSION, VIGOR_MAX } from "./constants";
import { CARAVAN_FOCUS_DEFINITIONS, clampCaravanDurationMs } from "./caravan";
import { ACHIEVEMENTS, DAILY_TASK_POOL, DUNGEONS, HERO_CLASSES } from "./content";
import { createEmptyAchievements, createEmptyCaravan, createEmptyDailies, createEmptyLootState } from "./state";
import type { GameState, ImportResult } from "./types";

export type SaveEnvelope = {
  game: typeof SAVE_GAME_NAME;
  saveVersion: typeof SAVE_VERSION;
  exportedAt: number;
  state: GameState;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateState(state: unknown): state is GameState {
  if (!isRecord(state)) return false;
  if (state.version !== 1) return false;
  if (typeof state.seed !== "string") return false;
  const hero = state.hero;
  if (!isRecord(hero)) return false;
  if (!HERO_CLASSES.some((entry) => entry.id === hero.classId)) return false;
  if (!finiteNumber(hero.level) || hero.level < 1) return false;
  const resources = state.resources;
  if (!isRecord(resources)) return false;
  for (const resource of ["gold", "ore", "crystal", "rune", "relicFragment", "renown"]) {
    if (!finiteNumber(resources[resource]) || Number(resources[resource]) < 0) return false;
  }
  if (!Array.isArray(state.inventory) || state.inventory.length > INVENTORY_LIMIT) return false;
  const equipment = state.equipment;
  if (!isRecord(equipment)) return false;
  if (!EQUIPMENT_SLOTS.every((slot) => slot in equipment)) return false;
  if (state.loot !== undefined) {
    const loot = state.loot;
    if (!isRecord(loot)) return false;
    if (loot.focusSlot !== "any" && !EQUIPMENT_SLOTS.includes(loot.focusSlot as (typeof EQUIPMENT_SLOTS)[number])) return false;
    if (!finiteNumber(loot.missesSinceDrop) || Number(loot.missesSinceDrop) < 0) return false;
    if (!Array.isArray(loot.recentSlots)) return false;
    if (!loot.recentSlots.every((slot) => EQUIPMENT_SLOTS.includes(slot as (typeof EQUIPMENT_SLOTS)[number]))) return false;
  }
  const town = state.town;
  if (!isRecord(town)) return false;
  if (!BUILDING_IDS.every((id) => finiteNumber(town[id]) && Number(town[id]) >= 0)) return false;
  if (state.activeExpedition !== null) {
    const activeExpedition = state.activeExpedition;
    if (!isRecord(activeExpedition)) return false;
    if (!DUNGEONS.some((dungeon) => dungeon.id === activeExpedition.dungeonId)) return false;
    if (!finiteNumber(activeExpedition.startedAt) || !finiteNumber(activeExpedition.endsAt)) return false;
    if (typeof activeExpedition.vigorBoost !== "boolean") return false;
  }
  const caravan = state.caravan;
  if (caravan !== undefined) {
    if (!isRecord(caravan)) return false;
    if (caravan.activeJob !== null && caravan.activeJob !== undefined) {
      const activeJob = caravan.activeJob;
      if (!isRecord(activeJob)) return false;
      if (!CARAVAN_FOCUS_DEFINITIONS.some((focus) => focus.id === activeJob.focusId)) return false;
      if (!finiteNumber(activeJob.durationMs) || activeJob.durationMs !== clampCaravanDurationMs(activeJob.durationMs)) return false;
      if (!finiteNumber(activeJob.startedAt) || !finiteNumber(activeJob.endsAt)) return false;
      if (activeJob.endsAt <= activeJob.startedAt) return false;
    }
  }
  const vigor = state.vigor;
  if (!isRecord(vigor)) return false;
  if (!finiteNumber(vigor.current) || !finiteNumber(vigor.max) || !finiteNumber(vigor.lastTickAt)) return false;
  if (Number(vigor.max) <= 0 || Number(vigor.max) > VIGOR_MAX) return false;
  if (Number(vigor.current) < 0 || Number(vigor.current) > Number(vigor.max)) return false;
  const dailies = state.dailies;
  if (!isRecord(dailies)) return false;
  if (!finiteNumber(dailies.windowStartAt) || !finiteNumber(dailies.nextResetAt)) return false;
  if (!Array.isArray(dailies.tasks) || dailies.tasks.length !== DAILY_TASK_COUNT) return false;
  for (const task of dailies.tasks) {
    if (!isRecord(task)) return false;
    if (typeof task.id !== "string" || typeof task.label !== "string") return false;
    if (!DAILY_TASK_POOL.some((entry) => entry.kind === task.kind)) return false;
    if (task.role !== undefined && task.role !== "primary" && task.role !== "secondary") return false;
    if (!finiteNumber(task.target) || !finiteNumber(task.progress)) return false;
    if (typeof task.claimed !== "boolean") return false;
    if (!isRecord(task.reward)) return false;
  }
  if (dailies.weekly !== undefined) {
    const weekly = dailies.weekly;
    if (!isRecord(weekly)) return false;
    if (!finiteNumber(weekly.windowStartAt) || !finiteNumber(weekly.nextResetAt) || !finiteNumber(weekly.progress)) return false;
    if (!Array.isArray(weekly.milestones) || weekly.milestones.length !== 3) return false;
    for (const milestone of weekly.milestones) {
      if (!isRecord(milestone)) return false;
      if (!finiteNumber(milestone.target) || typeof milestone.claimed !== "boolean" || !isRecord(milestone.reward)) return false;
    }
  }
  const prestige = state.prestige;
  if (!isRecord(prestige) || !isRecord(prestige.upgrades)) return false;
  for (const key of ["guildLegacy", "swiftCharters", "treasureOath", "bossAttunement"]) {
    if (!finiteNumber(prestige.upgrades[key])) return false;
  }
  return true;
}

export function normalizeImportedState(state: GameState, now: number): GameState {
  const achievements = createEmptyAchievements();
  const emptyDailies = createEmptyDailies(now);
  ACHIEVEMENTS.forEach((achievement) => {
    achievements[achievement.id] = state.achievements?.[achievement.id] ?? { unlockedAt: null };
  });
  const tasks = Array.isArray(state.dailies?.tasks)
    ? state.dailies.tasks.slice(0, DAILY_TASK_COUNT).map((task, index) => ({
        ...task,
        role: task.role === "primary" || task.role === "secondary" ? task.role : index === 0 ? "primary" : "secondary"
      }))
    : [];
  const weekly = state.dailies?.weekly ?? emptyDailies.weekly;
  const loot = state.loot
    ? {
        focusSlot: state.loot.focusSlot === "any" || EQUIPMENT_SLOTS.includes(state.loot.focusSlot) ? state.loot.focusSlot : "any",
        missesSinceDrop: finiteNumber(state.loot.missesSinceDrop) ? Math.max(0, state.loot.missesSinceDrop) : 0,
        recentSlots: Array.isArray(state.loot.recentSlots)
          ? state.loot.recentSlots.filter((slot) => EQUIPMENT_SLOTS.includes(slot)).slice(0, 2)
          : []
      }
    : createEmptyLootState();

  return {
    ...state,
    achievements,
    vigor: {
      current: Math.max(0, Math.min(state.vigor?.max ?? VIGOR_MAX, state.vigor?.current ?? 40)),
      max: VIGOR_MAX,
      lastTickAt: finiteNumber(state.vigor?.lastTickAt) ? state.vigor.lastTickAt : now
    },
    dailies: {
      windowStartAt: finiteNumber(state.dailies?.windowStartAt) ? state.dailies.windowStartAt : now,
      nextResetAt: finiteNumber(state.dailies?.nextResetAt) ? state.dailies.nextResetAt : now,
      tasks,
      lastTaskSetKey: typeof state.dailies?.lastTaskSetKey === "string" ? state.dailies.lastTaskSetKey : null,
      weekly
    },
    loot,
    caravan: state.caravan?.activeJob ? { activeJob: state.caravan.activeJob } : createEmptyCaravan(),
    updatedAt: now,
    lifetime: {
      ...state.lifetime,
      totalItemsCrafted: state.lifetime?.totalItemsCrafted ?? 0,
      totalDailyClaims: state.lifetime?.totalDailyClaims ?? 0
    },
    prestige: {
      ...state.prestige,
      upgrades: {
        guildLegacy: state.prestige?.upgrades?.guildLegacy ?? 0,
        swiftCharters: state.prestige?.upgrades?.swiftCharters ?? 0,
        treasureOath: state.prestige?.upgrades?.treasureOath ?? 0,
        bossAttunement: state.prestige?.upgrades?.bossAttunement ?? 0
      }
    },
    settings: {
      reducedMotion: Boolean(state.settings?.reducedMotion),
      debugBalance: Boolean(state.settings?.debugBalance),
      onboardingDismissed: Boolean(state.settings?.onboardingDismissed),
      heroCreated: Boolean(state.settings?.heroCreated ?? true)
    }
  };
}

export function serializeSave(state: GameState, now: number): string {
  const envelope: SaveEnvelope = {
    game: SAVE_GAME_NAME,
    saveVersion: SAVE_VERSION,
    exportedAt: now,
    state
  };
  return JSON.stringify(envelope, null, 2);
}

export function importSave(raw: string, now: number): ImportResult {
  const parsedEnvelope = parseSaveEnvelope(raw);
  if (!parsedEnvelope.ok) {
    return parsedEnvelope;
  }

  return { ok: true, state: normalizeImportedState(parsedEnvelope.state, now), message: "Save imported." };
}

export function loadSave(raw: string): ImportResult {
  const parsedEnvelope = parseSaveEnvelope(raw);
  if (!parsedEnvelope.ok) {
    return parsedEnvelope;
  }

  return { ok: true, state: normalizeImportedState(parsedEnvelope.state, parsedEnvelope.state.updatedAt), message: "Save loaded." };
}

function parseSaveEnvelope(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Save import failed: invalid JSON." };
  }

  if (!isRecord(parsed)) {
    return { ok: false, error: "Save import failed: expected an object." };
  }

  if (parsed.game !== SAVE_GAME_NAME) {
    return { ok: false, error: "Save import failed: wrong game." };
  }

  if (parsed.saveVersion !== SAVE_VERSION) {
    return { ok: false, error: "Save import failed: unsupported save version." };
  }

  if (!validateState(parsed.state)) {
    return { ok: false, error: "Save import failed: save data is incomplete or unsafe." };
  }

  return { ok: true, state: parsed.state, message: "Save parsed." };
}
