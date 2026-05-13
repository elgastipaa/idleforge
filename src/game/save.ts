import { BUILDING_IDS, DAILY_TASK_COUNT, EQUIPMENT_SLOTS, INVENTORY_LIMIT, SAVE_GAME_NAME, SAVE_VERSION, FOCUS_MAX } from "./constants";
import { CARAVAN_FOCUS_DEFINITIONS, clampCaravanDurationMs } from "./caravan";
import { ACHIEVEMENTS, DAILY_TASK_POOL, DUNGEONS, HERO_CLASSES } from "./content";
import { ACCOUNT_RANKS, getAccountRankForXp } from "./progression";
import {
  createEmptyAccountPersonalRecords,
  createEmptyAccountRank,
  createEmptyAccountShowcase,
  createEmptyAchievements,
  createEmptyCaravan,
  createEmptyClassChange,
  createEmptyConstruction,
  createEmptyDailyFocus,
  createEmptyDailies,
  createEmptyLootState,
  createEmptyRebirth,
  createEmptyRegionProgress,
  createEmptySoulMarks,
  createEmptyTitles,
  createEmptyWeeklyQuest
} from "./state";
import type {
  AccountShowcaseState,
  DailyMissionDifficulty,
  DailyReward,
  DailyTaskKind,
  DailyTaskRole,
  DailyFocusState,
  GameState,
  ImportResult,
  ItemFamilyId,
  MaterialBundle,
  RegionCollectionState,
  RegionDiaryState,
  RegionMaterialId,
  RegionOutpostState,
  TitleState,
  WeeklyQuestReward,
  WeeklyQuestState,
  WeeklyQuestStepKind
} from "./types";

const LEGACY_ACTION_RESOURCE_FIELD = ["vi", "gor"].join("");
const LEGACY_ACTION_BOOST_FIELD = `${LEGACY_ACTION_RESOURCE_FIELD}Boost`;
const LEGACY_ACTION_SPEND_KIND = `spend_${LEGACY_ACTION_RESOURCE_FIELD}`;
const LEGACY_ACTION_RESOURCE_LABEL = ["Vi", "gor"].join("");
const REGION_MATERIAL_IDS: RegionMaterialId[] = ["sunlitTimber", "emberResin", "archiveGlyph", "stormglassShard", "oathEmber"];
const ITEM_FAMILY_IDS: ItemFamilyId[] = ["sunlitCharter", "emberboundKit", "azureLedger", "stormglassSurvey", "firstForgeOath"];
const DAILY_TASK_KINDS: DailyTaskKind[] = [
  "complete_expeditions",
  "win_expeditions",
  "defeat_boss",
  "salvage_items",
  "sell_items",
  "equip_item",
  "craft_item",
  "upgrade_building",
  "spend_focus",
  "gain_mastery_xp",
  "win_region_expeditions",
  "claim_mastery_milestone",
  "collection_eligible_runs",
  "advance_collection_pity",
  "attempt_boss",
  "complete_caravan"
];
const WEEKLY_QUEST_STEP_KINDS: WeeklyQuestStepKind[] = ["clear_expeditions", "claim_mastery_milestone", "collection_eligible_runs", "attempt_boss"];
const MAX_FOCUS_CAP = Math.max(FOCUS_MAX, ...ACCOUNT_RANKS.map((rank) => rank.focusCap));

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

function normalizeNumber(value: unknown, fallback: number): number {
  return finiteNumber(value) ? value : fallback;
}

function normalizeRegionMaterials(value: unknown): Partial<Record<RegionMaterialId, number>> {
  const output: Partial<Record<RegionMaterialId, number>> = {};
  if (!isRecord(value)) {
    return output;
  }
  REGION_MATERIAL_IDS.forEach((materialId) => {
    const amount = normalizeNumber(value[materialId], 0);
    if (amount > 0) {
      output[materialId] = amount;
    }
  });
  return output;
}

function normalizeDailyReward(reward: unknown): DailyReward {
  if (!isRecord(reward)) {
    return { gold: 0, materials: {}, focus: 0, accountXp: 0, regionalMaterials: {}, fragments: 0 };
  }
  return {
    gold: Math.max(0, normalizeNumber(reward.gold, 0)),
    materials: isRecord(reward.materials) ? (reward.materials as Partial<MaterialBundle>) : {},
    focus: Math.max(0, normalizeNumber(reward.focus, normalizeNumber(reward[LEGACY_ACTION_RESOURCE_FIELD], 0))),
    accountXp: Math.max(0, normalizeNumber(reward.accountXp, 0)),
    regionalMaterials: normalizeRegionMaterials(reward.regionalMaterials),
    fragments: Math.max(0, normalizeNumber(reward.fragments, 0))
  };
}

function normalizeWeeklyQuestReward(reward: unknown, fallback: WeeklyQuestReward): WeeklyQuestReward {
  if (!isRecord(reward)) {
    return fallback;
  }
  return {
    accountXp: Math.max(0, normalizeNumber(reward.accountXp, fallback.accountXp)),
    regionalMaterials: normalizeRegionMaterials(reward.regionalMaterials),
    fragments: Math.max(0, normalizeNumber(reward.fragments, fallback.fragments)),
    titleId: typeof reward.titleId === "string" ? reward.titleId : fallback.titleId,
    trophyId: typeof reward.trophyId === "string" ? reward.trophyId : fallback.trophyId
  };
}

function normalizeDailyTaskKind(kind: unknown): DailyTaskKind {
  if (kind === LEGACY_ACTION_SPEND_KIND) return "spend_focus";
  if (DAILY_TASK_KINDS.includes(kind as DailyTaskKind)) return kind as DailyTaskKind;
  if (DAILY_TASK_POOL.some((entry) => entry.kind === kind)) return kind as DailyTaskKind;
  return "complete_expeditions";
}

function normalizeDailyTaskRole(role: unknown, index: number): DailyTaskRole {
  return role === "primary" || role === "secondary" ? role : index === 0 ? "primary" : "secondary";
}

function normalizeDailyMissionDifficulty(difficulty: unknown, index: number): DailyMissionDifficulty {
  if (difficulty === "easy" || difficulty === "medium" || difficulty === "hard") return difficulty;
  return index === 0 ? "easy" : "medium";
}

function normalizeDailyFocusState(value: unknown, now: number): DailyFocusState {
  const fallback = createEmptyDailyFocus(now);
  if (!isRecord(value)) {
    return fallback;
  }
  return {
    date: typeof value.date === "string" ? value.date : fallback.date,
    focusChargesBanked: Math.max(0, Math.min(3, normalizeNumber(value.focusChargesBanked, fallback.focusChargesBanked))),
    focusChargeProgress: Math.max(0, Math.min(3, normalizeNumber(value.focusChargeProgress, fallback.focusChargeProgress)))
  };
}

function normalizeWeeklyQuestState(value: unknown, now: number): WeeklyQuestState {
  const fallback = createEmptyWeeklyQuest(now);
  if (!isRecord(value)) {
    return fallback;
  }
  const fallbackSteps = fallback.steps;
  const steps = Array.isArray(value.steps)
    ? value.steps
        .map((step, index) => {
          if (!isRecord(step)) return fallbackSteps[index] ?? null;
          const kind = WEEKLY_QUEST_STEP_KINDS.includes(step.kind as WeeklyQuestStepKind) ? (step.kind as WeeklyQuestStepKind) : fallbackSteps[index]?.kind;
          if (!kind) return null;
          const target = Math.max(1, normalizeNumber(step.target, fallbackSteps[index]?.target ?? 1));
          return {
            kind,
            label: typeof step.label === "string" ? step.label : fallbackSteps[index]?.label ?? "Weekly task",
            target,
            progress: Math.max(0, Math.min(target, normalizeNumber(step.progress, 0)))
          };
        })
        .filter((step): step is WeeklyQuestState["steps"][number] => step !== null && step !== undefined)
    : fallbackSteps;
  return {
    weekStartDate: typeof value.weekStartDate === "string" ? value.weekStartDate : fallback.weekStartDate,
    weekStartAt: normalizeNumber(value.weekStartAt, fallback.weekStartAt),
    nextResetAt: normalizeNumber(value.nextResetAt, fallback.nextResetAt),
    questId: typeof value.questId === "string" && value.questId.length > 0 ? value.questId : fallback.questId,
    title: typeof value.title === "string" && value.title.length > 0 ? value.title : fallback.title,
    steps: steps.length > 0 ? steps : fallback.steps,
    reward: normalizeWeeklyQuestReward(value.reward, fallback.reward),
    questProgress: Math.max(0, normalizeNumber(value.questProgress, 0)),
    questClaimed: Boolean(value.questClaimed),
    recapSeen: Boolean(value.recapSeen)
  };
}

function normalizeStringArray(value: unknown, limit?: number): string[] {
  const normalized = Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
  const unique = normalized.filter((entry, index, entries) => entries.indexOf(entry) === index);
  return typeof limit === "number" ? unique.slice(0, limit) : unique;
}

function normalizeAccountShowcase(value: unknown): AccountShowcaseState {
  const fallback = createEmptyAccountShowcase();
  if (!isRecord(value)) {
    return fallback;
  }
  return {
    selectedTitleId: typeof value.selectedTitleId === "string" ? value.selectedTitleId : null,
    pinnedTrophyIds: normalizeStringArray(value.pinnedTrophyIds, 3),
    favoriteRegionId: typeof value.favoriteRegionId === "string" ? value.favoriteRegionId : null,
    featuredBossId: typeof value.featuredBossId === "string" ? value.featuredBossId : null,
    featuredFamilyId: ITEM_FAMILY_IDS.includes(value.featuredFamilyId as ItemFamilyId) ? (value.featuredFamilyId as ItemFamilyId) : null,
    accountSignatureMode: value.accountSignatureMode === "manual" ? "manual" : "auto",
    firstDiscoveryPopupShown: Boolean(value.firstDiscoveryPopupShown),
    firstDiscoveryPopupDismissed: Boolean(value.firstDiscoveryPopupDismissed)
  };
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
    if (typeof activeExpedition.focusBoost !== "boolean") return false;
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
  const focus = state.focus;
  if (!isRecord(focus)) return false;
  if (!finiteNumber(focus.current) || !finiteNumber(focus.cap) || !finiteNumber(focus.lastRegenAt)) return false;
  if (Number(focus.cap) <= 0 || Number(focus.cap) > MAX_FOCUS_CAP) return false;
  if (Number(focus.current) < 0 || Number(focus.current) > Number(focus.cap)) return false;
  const dailies = state.dailies;
  if (!isRecord(dailies)) return false;
  if (!finiteNumber(dailies.windowStartAt) || !finiteNumber(dailies.nextResetAt)) return false;
  if (!Array.isArray(dailies.tasks) || (dailies.tasks.length !== 0 && dailies.tasks.length !== DAILY_TASK_COUNT)) return false;
  for (const task of dailies.tasks) {
    if (!isRecord(task)) return false;
    if (typeof task.id !== "string" || typeof task.label !== "string") return false;
    if (!DAILY_TASK_KINDS.includes(task.kind as DailyTaskKind)) return false;
    if (task.role !== undefined && task.role !== "primary" && task.role !== "secondary") return false;
    if (task.difficulty !== undefined && task.difficulty !== "easy" && task.difficulty !== "medium" && task.difficulty !== "hard") return false;
    if (!finiteNumber(task.target) || !finiteNumber(task.progress)) return false;
    if (typeof task.claimed !== "boolean") return false;
    if (!isRecord(task.reward)) return false;
    if (!finiteNumber(task.reward.focus)) return false;
    if (!finiteNumber(task.reward.accountXp)) return false;
  }
  if (dailies.weekly !== undefined) {
    const weekly = dailies.weekly;
    if (!isRecord(weekly)) return false;
    if (!finiteNumber(weekly.windowStartAt) || !finiteNumber(weekly.nextResetAt) || !finiteNumber(weekly.progress)) return false;
    if (!Array.isArray(weekly.milestones) || weekly.milestones.length !== 3) return false;
    for (const milestone of weekly.milestones) {
      if (!isRecord(milestone)) return false;
      if (!finiteNumber(milestone.target) || typeof milestone.claimed !== "boolean" || !isRecord(milestone.reward)) return false;
      if (!finiteNumber(milestone.reward.focus)) return false;
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
  const looseState = state as GameState & Record<string, unknown>;
  const achievements = createEmptyAchievements();
  const emptyDailies = createEmptyDailies(now);
  ACHIEVEMENTS.forEach((achievement) => {
    achievements[achievement.id] = state.achievements?.[achievement.id] ?? { unlockedAt: null };
  });
  const tasks = Array.isArray(state.dailies?.tasks)
    ? state.dailies.tasks.slice(0, DAILY_TASK_COUNT).map((task, index) => ({
        id: typeof task.id === "string" ? task.id : `${now}-${index}`,
        kind: normalizeDailyTaskKind(task.kind),
        role: normalizeDailyTaskRole(task.role, index),
        difficulty: normalizeDailyMissionDifficulty(task.difficulty, index),
        label: typeof task.label === "string" ? task.label.replace(LEGACY_ACTION_RESOURCE_LABEL, "Focus") : "Complete expeditions",
        target: Math.max(1, normalizeNumber(task.target, 1)),
        progress: Math.max(0, normalizeNumber(task.progress, 0)),
        claimed: Boolean(task.claimed),
        reward: normalizeDailyReward(task.reward),
        regionId: typeof task.regionId === "string" ? task.regionId : undefined
      }))
    : [];
  const paddedTasks = tasks.length === DAILY_TASK_COUNT ? tasks : [];
  const weeklySource = isRecord(state.dailies?.weekly) ? state.dailies.weekly : emptyDailies.weekly;
  const weekly = {
    windowStartAt: normalizeNumber(weeklySource.windowStartAt, emptyDailies.weekly.windowStartAt),
    nextResetAt: normalizeNumber(weeklySource.nextResetAt, emptyDailies.weekly.nextResetAt),
    progress: Math.max(0, normalizeNumber(weeklySource.progress, 0)),
    milestones: Array.isArray(weeklySource.milestones)
      ? weeklySource.milestones.slice(0, 3).map((milestone, index) => {
          if (!isRecord(milestone)) return emptyDailies.weekly.milestones[index];
          return {
            target: Math.max(1, normalizeNumber(milestone.target, emptyDailies.weekly.milestones[index]?.target ?? 1)),
            claimed: Boolean(milestone.claimed),
            reward: normalizeDailyReward(milestone.reward)
          };
        })
      : emptyDailies.weekly.milestones
  };
  while (weekly.milestones.length < 3) {
    weekly.milestones.push(emptyDailies.weekly.milestones[weekly.milestones.length]);
  }
  const loot = state.loot
    ? {
        focusSlot: state.loot.focusSlot === "any" || EQUIPMENT_SLOTS.includes(state.loot.focusSlot) ? state.loot.focusSlot : "any",
        missesSinceDrop: finiteNumber(state.loot.missesSinceDrop) ? Math.max(0, state.loot.missesSinceDrop) : 0,
        recentSlots: Array.isArray(state.loot.recentSlots)
          ? state.loot.recentSlots.filter((slot) => EQUIPMENT_SLOTS.includes(slot)).slice(0, 2)
          : []
      }
    : createEmptyLootState();
  const focusSource: Record<string, unknown> = isRecord(state.focus)
    ? (state.focus as unknown as Record<string, unknown>)
    : isRecord(looseState[LEGACY_ACTION_RESOURCE_FIELD])
      ? looseState[LEGACY_ACTION_RESOURCE_FIELD]
      : {};
  const accountRankSource: Record<string, unknown> = isRecord(state.accountRank) ? (state.accountRank as unknown as Record<string, unknown>) : {};
  const accountXp = Math.max(0, normalizeNumber(accountRankSource.accountXp, 0));
  const accountRankValue = getAccountRankForXp(accountXp);
  const accountRankFocusCap = Math.max(
    FOCUS_MAX,
    ACCOUNT_RANKS.reduce((cap, rank) => (accountRankValue >= rank.rank ? Math.max(cap, rank.focusCap) : cap), FOCUS_MAX)
  );
  const focusSourceCap = normalizeNumber(focusSource.cap, normalizeNumber(focusSource.max, accountRankFocusCap));
  const focusCap = Math.max(accountRankFocusCap, Math.min(MAX_FOCUS_CAP, focusSourceCap));
  const focusCurrent = Math.max(0, Math.min(focusCap, normalizeNumber(focusSource.current, FOCUS_MAX)));
  const activeExpeditionSource: Record<string, unknown> | null = isRecord(state.activeExpedition) ? state.activeExpedition : null;
  const activeExpedition = activeExpeditionSource
    ? {
        dungeonId: typeof activeExpeditionSource.dungeonId === "string" ? activeExpeditionSource.dungeonId : DUNGEONS[0].id,
        runId: normalizeNumber(activeExpeditionSource.runId, 0),
        startedAt: normalizeNumber(activeExpeditionSource.startedAt, now),
        endsAt: normalizeNumber(activeExpeditionSource.endsAt, now),
        focusBoost: Boolean(activeExpeditionSource.focusBoost ?? activeExpeditionSource[LEGACY_ACTION_BOOST_FIELD])
      }
    : null;
  const prestigeUpgrades = {
    guildLegacy: state.prestige?.upgrades?.guildLegacy ?? 0,
    swiftCharters: state.prestige?.upgrades?.swiftCharters ?? 0,
    treasureOath: state.prestige?.upgrades?.treasureOath ?? 0,
    bossAttunement: state.prestige?.upgrades?.bossAttunement ?? 0
  };
  const emptyRegionProgress = createEmptyRegionProgress();
  const regionProgressSource: Record<string, unknown> = isRecord(state.regionProgress) ? (state.regionProgress as unknown as Record<string, unknown>) : {};
  const regionMaterials: Record<string, unknown> = isRecord(regionProgressSource.materials) ? regionProgressSource.materials : {};

  return {
    ...state,
    achievements,
    activeExpedition,
    focus: {
      current: focusCurrent,
      cap: focusCap,
      lastRegenAt: normalizeNumber(focusSource.lastRegenAt, normalizeNumber(focusSource.lastTickAt, now))
    },
    dailies: {
      windowStartAt: finiteNumber(state.dailies?.windowStartAt) ? state.dailies.windowStartAt : now,
      nextResetAt: finiteNumber(state.dailies?.nextResetAt) ? state.dailies.nextResetAt : now,
      tasks: paddedTasks,
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
      totalPrestiges: state.prestige?.totalPrestiges ?? 0,
      renownEarned: state.prestige?.renownEarned ?? 0,
      upgrades: prestigeUpgrades
    },
    dungeonMastery: isRecord(state.dungeonMastery) ? state.dungeonMastery : {},
    accountRank: {
      accountXp,
      accountRank: accountRankValue,
      claimedRankRewards: Array.isArray(accountRankSource.claimedRankRewards)
        ? accountRankSource.claimedRankRewards.filter((rank): rank is number => finiteNumber(rank))
        : createEmptyAccountRank().claimedRankRewards
    },
    rebirth: state.rebirth ?? {
      ...createEmptyRebirth(),
      totalRebirths: state.prestige?.totalPrestiges ?? 0
    },
    soulMarks: state.soulMarks ?? {
      ...createEmptySoulMarks(),
      current: state.resources?.renown ?? 0,
      lifetimeEarned: state.prestige?.renownEarned ?? 0,
      upgradesClaimed: prestigeUpgrades,
      discovered: (state.resources?.renown ?? 0) > 0 || (state.prestige?.renownEarned ?? 0) > 0
    },
    accountShowcase: normalizeAccountShowcase(state.accountShowcase),
    accountPersonalRecords: state.accountPersonalRecords ?? {
      ...createEmptyAccountPersonalRecords(),
      lifetimeExpeditionsCompleted: (state.lifetime?.expeditionsSucceeded ?? 0) + (state.lifetime?.expeditionsFailed ?? 0),
      lifetimeBossesDefeated: state.lifetime?.bossesDefeated ?? 0,
      highestPowerReached: state.lifetime?.highestPowerScore ?? 0,
      totalRebirths: state.prestige?.totalPrestiges ?? 0,
      legendaryTraitsDiscovered: state.lifetime?.legendaryItemsFound ?? 0
    },
    dailyFocus: normalizeDailyFocusState(state.dailyFocus, now),
    weeklyQuest: normalizeWeeklyQuestState(state.weeklyQuest, now),
    eventProgress: isRecord(state.eventProgress) ? state.eventProgress : {},
    regionProgress: {
      activeMaterialIds: emptyRegionProgress.activeMaterialIds,
      materials: REGION_MATERIAL_IDS.reduce(
        (materials, materialId) => {
          materials[materialId] = Math.max(0, normalizeNumber(regionMaterials[materialId], 0));
          return materials;
        },
        {} as Record<RegionMaterialId, number>
      ),
      collections: isRecord(regionProgressSource.collections) ? (regionProgressSource.collections as Record<string, RegionCollectionState>) : {},
      outposts: isRecord(regionProgressSource.outposts) ? (regionProgressSource.outposts as Record<string, RegionOutpostState>) : {},
      diaries: isRecord(regionProgressSource.diaries) ? (regionProgressSource.diaries as Record<string, RegionDiaryState>) : {}
    },
    bossPrep: isRecord(state.bossPrep) ? state.bossPrep : {},
    construction: state.construction ?? createEmptyConstruction(),
    classChange: state.classChange ?? createEmptyClassChange(),
    traitCodex: isRecord(state.traitCodex) ? state.traitCodex : {},
    familyCodex: isRecord(state.familyCodex) ? state.familyCodex : {},
    titles: isRecord(state.titles) ? (state.titles as Record<string, TitleState>) : createEmptyTitles(),
    trophies: isRecord(state.trophies) ? state.trophies : {},
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
  const parsedEnvelope = parseSaveEnvelope(raw, now);
  if (!parsedEnvelope.ok) {
    return parsedEnvelope;
  }

  return { ok: true, state: parsedEnvelope.state, message: "Save imported." };
}

export function loadSave(raw: string): ImportResult {
  const parsedEnvelope = parseSaveEnvelope(raw);
  if (!parsedEnvelope.ok) {
    return parsedEnvelope;
  }

  return { ok: true, state: parsedEnvelope.state, message: "Save loaded." };
}

function parseSaveEnvelope(raw: string, nowOverride?: number): ImportResult {
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

  if (!isRecord(parsed.state)) {
    return { ok: false, error: "Save import failed: save data is incomplete or unsafe." };
  }

  const stateUpdatedAt = finiteNumber(parsed.state.updatedAt) ? parsed.state.updatedAt : finiteNumber(parsed.exportedAt) ? parsed.exportedAt : Date.now();
  const normalized = normalizeImportedState(parsed.state as GameState, nowOverride ?? stateUpdatedAt);

  if (!validateState(normalized)) {
    return { ok: false, error: "Save import failed: save data is incomplete or unsafe." };
  }

  return { ok: true, state: normalized, message: "Save parsed." };
}
