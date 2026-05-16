import { DUNGEONS } from "./content";
import { applyAccountXp, unlockTitle, unlockTrophy } from "./progression";
import { cloneState } from "./state";
import type {
  ActionResult,
  GameState,
  RegionDiaryDefinition,
  RegionDiaryRewardDefinition,
  RegionDiaryState,
  RegionDiarySummary,
  RegionDiaryTaskDefinition,
  RegionDiaryTaskSummary,
  RegionMaterialId
} from "./types";

export type RegionDiaryProgressEvent =
  | { kind: "salvage_item"; sourceDungeonId: string }
  | { kind: "town_upgrade"; regionalMaterials: Partial<Record<RegionMaterialId, number>> }
  | { kind: "prepare_boss"; regionId: string };

export const REGION_DIARIES: RegionDiaryDefinition[] = [
  {
    id: "sunlit-marches-tier-1",
    regionId: "sunlit-marches",
    tier: 1,
    name: "Sunlit Marches Diary I",
    tasks: [
      {
        id: "sunlit-clear-expeditions",
        kind: "clear_region_expeditions",
        label: "Clear every Sunlit expedition",
        description: "Clear Tollroad, Mossbright, Bandit Cache, and Bramblecrown once.",
        target: 4,
        dungeonIds: ["tollroad-of-trinkets", "mossbright-cellar", "relic-bandit-cache", "copper-crown-champion"]
      },
      {
        id: "sunlit-tollroad-mastery-1",
        kind: "claim_mastery_tier",
        label: "Map Tollroad of Trinkets",
        description: "Claim mastery tier 1 on Tollroad of Trinkets.",
        target: 1,
        dungeonId: "tollroad-of-trinkets",
        masteryTier: 1
      },
      {
        id: "sunlit-salvage-3",
        kind: "salvage_region_items",
        label: "Salvage 3 Sunlit items",
        description: "Salvage items found in Sunlit Marches expeditions.",
        target: 3
      },
      {
        id: "sunlit-upgrade-town-timber",
        kind: "upgrade_town_with_material",
        label: "Use Sunlit Timber in town",
        description: "Complete one building upgrade paid with Sunlit Timber.",
        target: 1,
        materialId: "sunlitTimber"
      }
    ],
    reward: {
      id: "sunlit-diary-tier-1",
      name: "Sunlit Route Notes",
      description: "+2% Sunlit mastery XP, 10 Sunlit Timber, and the Sunlit Diarist title.",
      accountXp: 35,
      regionalMaterials: { sunlitTimber: 10 },
      masteryXpBonus: { "sunlit-marches": 0.02 },
      titleId: "title-sunlit-diarist"
    }
  },
  {
    id: "emberwood-tier-1",
    regionId: "emberwood",
    tier: 1,
    name: "Emberwood Diary I",
    tasks: [
      {
        id: "emberwood-clear-expeditions",
        kind: "clear_region_expeditions",
        label: "Clear every Emberwood expedition",
        description: "Clear Lanternroot, Sigil Grove, Cinderleaf, and Cindermaw once.",
        target: 4,
        dungeonIds: ["lanternroot-path", "saffron-sigil-grove", "cinderleaf-crossing", "emberwood-heart"]
      },
      {
        id: "emberwood-lanternroot-mastery-1",
        kind: "claim_mastery_tier",
        label: "Map Lanternroot Path",
        description: "Claim mastery tier 1 on Lanternroot Path.",
        target: 1,
        dungeonId: "lanternroot-path",
        masteryTier: 1
      },
      {
        id: "emberwood-salvage-3",
        kind: "salvage_region_items",
        label: "Salvage 3 Emberwood items",
        description: "Salvage items found in Emberwood expeditions.",
        target: 3
      },
      {
        id: "emberwood-prepare-boss",
        kind: "prepare_region_boss",
        label: "Prepare for Cindermaw",
        description: "Prepare one scouted Cindermaw threat.",
        target: 1
      }
    ],
    reward: {
      id: "emberwood-diary-tier-1",
      name: "Emberwood Field Notes",
      description: "+2% Ember Resin yield, 10 Ember Resin, and the Emberwood Diarist title.",
      accountXp: 45,
      regionalMaterials: { emberResin: 10 },
      regionalMaterialYieldBonus: { emberResin: 0.02 },
      titleId: "title-emberwood-diarist"
    }
  }
];

function uniqueStrings(value: unknown): string[] {
  return Array.isArray(value) ? Array.from(new Set(value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0))) : [];
}

function normalizeTaskProgress(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, number>>((progress, [taskId, amount]) => {
    if (typeof taskId !== "string" || taskId.length === 0 || typeof amount !== "number" || !Number.isFinite(amount)) return progress;
    progress[taskId] = Math.max(0, Math.floor(amount));
    return progress;
  }, {});
}

function getDungeonRegionId(dungeonId: string): string | null {
  return DUNGEONS.find((dungeon) => dungeon.id === dungeonId)?.zoneId ?? null;
}

function getRegionDiaryDefinition(regionId: string): RegionDiaryDefinition | null {
  return REGION_DIARIES.find((diary) => diary.regionId === regionId) ?? null;
}

export function getRegionDiaryDefinitions(regionId?: string): RegionDiaryDefinition[] {
  return regionId ? REGION_DIARIES.filter((diary) => diary.regionId === regionId) : REGION_DIARIES;
}

export function ensureRegionDiaryState(state: GameState, regionId: string): RegionDiaryState {
  const current = (state.regionProgress.diaries[regionId] ?? {}) as Partial<RegionDiaryState>;
  const normalized: RegionDiaryState = {
    completedTaskIds: uniqueStrings(current.completedTaskIds),
    claimedRewardIds: uniqueStrings(current.claimedRewardIds),
    taskProgress: normalizeTaskProgress(current.taskProgress)
  };
  state.regionProgress.diaries[regionId] = normalized;
  return normalized;
}

function getStoredTaskProgress(diaryState: RegionDiaryState, task: RegionDiaryTaskDefinition): number {
  if (diaryState.completedTaskIds.includes(task.id)) return task.target;
  return Math.min(task.target, Math.max(0, Math.floor(diaryState.taskProgress[task.id] ?? 0)));
}

function getTaskProgress(state: GameState, diaryState: RegionDiaryState, task: RegionDiaryTaskDefinition): number {
  if (diaryState.completedTaskIds.includes(task.id)) return task.target;
  if (task.kind === "clear_region_expeditions") {
    const dungeonIds = task.dungeonIds ?? [];
    return Math.min(task.target, dungeonIds.filter((dungeonId) => (state.dungeonClears[dungeonId] ?? 0) > 0).length);
  }
  if (task.kind === "claim_mastery_tier") {
    const claimedTiers = task.dungeonId ? state.dungeonMastery[task.dungeonId]?.claimedTiers ?? [] : [];
    return task.masteryTier && claimedTiers.includes(task.masteryTier) ? task.target : 0;
  }
  return getStoredTaskProgress(diaryState, task);
}

function summarizeTask(state: GameState, diaryState: RegionDiaryState, task: RegionDiaryTaskDefinition): RegionDiaryTaskSummary {
  const progress = getTaskProgress(state, diaryState, task);
  return {
    ...task,
    progress,
    completed: progress >= task.target || diaryState.completedTaskIds.includes(task.id)
  };
}

export function getRegionDiarySummary(state: GameState, regionId: string): RegionDiarySummary | null {
  const diary = getRegionDiaryDefinition(regionId);
  if (!diary) return null;
  const diaryState = (state.regionProgress.diaries[regionId] ?? { completedTaskIds: [], claimedRewardIds: [], taskProgress: {} }) as RegionDiaryState;
  const normalizedDiaryState: RegionDiaryState = {
    completedTaskIds: uniqueStrings(diaryState.completedTaskIds),
    claimedRewardIds: uniqueStrings(diaryState.claimedRewardIds),
    taskProgress: normalizeTaskProgress(diaryState.taskProgress)
  };
  const tasks = diary.tasks.map((task) => summarizeTask(state, normalizedDiaryState, task));
  const completedTasks = tasks.filter((task) => task.completed).length;
  const claimed = normalizedDiaryState.claimedRewardIds.includes(diary.reward.id);
  return {
    diaryId: diary.id,
    regionId: diary.regionId,
    tier: diary.tier,
    name: diary.name,
    tasks,
    completedTasks,
    totalTasks: tasks.length,
    completionPercent: Math.floor((completedTasks / Math.max(1, tasks.length)) * 100),
    readyToClaim: completedTasks === tasks.length && !claimed,
    claimed,
    reward: diary.reward
  };
}

function incrementDiaryTask(diaryState: RegionDiaryState, task: RegionDiaryTaskDefinition, amount: number) {
  if (amount <= 0 || diaryState.completedTaskIds.includes(task.id)) return;
  const nextProgress = Math.min(task.target, Math.max(0, Math.floor(diaryState.taskProgress[task.id] ?? 0)) + amount);
  diaryState.taskProgress[task.id] = nextProgress;
  if (nextProgress >= task.target) {
    diaryState.completedTaskIds = Array.from(new Set([...diaryState.completedTaskIds, task.id]));
  }
}

export function recordRegionDiaryProgress(state: GameState, now: number, event: RegionDiaryProgressEvent): GameState {
  if (event.kind === "salvage_item") {
    const regionId = getDungeonRegionId(event.sourceDungeonId);
    if (!regionId) return state;
    const diary = getRegionDiaryDefinition(regionId);
    if (!diary) return state;
    const diaryState = ensureRegionDiaryState(state, regionId);
    diary.tasks.filter((task) => task.kind === "salvage_region_items").forEach((task) => incrementDiaryTask(diaryState, task, 1));
    state.updatedAt = now;
    return state;
  }

  if (event.kind === "town_upgrade") {
    REGION_DIARIES.forEach((diary) => {
      const matchingTasks = diary.tasks.filter(
        (task) => task.kind === "upgrade_town_with_material" && task.materialId && (event.regionalMaterials[task.materialId] ?? 0) > 0
      );
      if (matchingTasks.length === 0) return;
      const diaryState = ensureRegionDiaryState(state, diary.regionId);
      matchingTasks.forEach((task) => incrementDiaryTask(diaryState, task, 1));
    });
    state.updatedAt = now;
    return state;
  }

  const diary = getRegionDiaryDefinition(event.regionId);
  if (!diary) return state;
  const diaryState = ensureRegionDiaryState(state, event.regionId);
  diary.tasks.filter((task) => task.kind === "prepare_region_boss").forEach((task) => incrementDiaryTask(diaryState, task, 1));
  state.updatedAt = now;
  return state;
}

function getClaimedDiaryRewards(state: GameState): RegionDiaryRewardDefinition[] {
  return REGION_DIARIES.flatMap((diary) => {
    const diaryState = state.regionProgress.diaries[diary.regionId];
    return Array.isArray(diaryState?.claimedRewardIds) && diaryState.claimedRewardIds.includes(diary.reward.id) ? [diary.reward] : [];
  });
}

export function getRegionDiaryMasteryXpBonus(state: GameState, regionId: string): number {
  return getClaimedDiaryRewards(state).reduce((total, reward) => total + (reward.masteryXpBonus?.[regionId] ?? 0), 0);
}

export function getRegionDiaryRegionalMaterialYieldBonus(state: GameState, materialId: RegionMaterialId): number {
  return getClaimedDiaryRewards(state).reduce((total, reward) => total + (reward.regionalMaterialYieldBonus?.[materialId] ?? 0), 0);
}

export function claimRegionDiaryReward(state: GameState, regionId: string, now: number): ActionResult {
  const diary = getRegionDiaryDefinition(regionId);
  if (!diary) {
    return { ok: false, state, error: "That region has no diary yet." };
  }
  const summary = getRegionDiarySummary(state, regionId);
  if (!summary) {
    return { ok: false, state, error: "That region has no diary yet." };
  }
  if (summary.claimed) {
    return { ok: false, state, error: "This region diary reward is already claimed." };
  }
  if (!summary.readyToClaim) {
    return { ok: false, state, error: "Complete every diary task before claiming this reward." };
  }

  const next = cloneState(state);
  const diaryState = ensureRegionDiaryState(next, regionId);
  summary.tasks.forEach((task) => {
    if (!task.completed) return;
    diaryState.completedTaskIds = Array.from(new Set([...diaryState.completedTaskIds, task.id]));
    diaryState.taskProgress[task.id] = task.target;
  });
  diaryState.claimedRewardIds = Array.from(new Set([...diaryState.claimedRewardIds, diary.reward.id]));

  applyAccountXp(next, diary.reward.accountXp, now);
  Object.entries(diary.reward.regionalMaterials ?? {}).forEach(([materialId, amount]) => {
    const normalizedAmount = Math.max(0, Math.floor(amount ?? 0));
    if (normalizedAmount <= 0) return;
    const typedMaterialId = materialId as RegionMaterialId;
    next.regionProgress.materials[typedMaterialId] = (next.regionProgress.materials[typedMaterialId] ?? 0) + normalizedAmount;
  });
  if (diary.reward.titleId) {
    unlockTitle(next, diary.reward.titleId, now);
  }
  if (diary.reward.trophyId) {
    unlockTrophy(next, diary.reward.trophyId, now);
  }
  next.updatedAt = now;

  return { ok: true, state: next, message: `${diary.name} claimed.` };
}
