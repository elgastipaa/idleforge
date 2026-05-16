import { DAILY_RESET_HOUR_LOCAL, DAILY_TASK_COUNT, DAY_MS } from "./constants";
import { REGION_COLLECTIONS, isCollectionVisible } from "./collections";
import { DUNGEONS, ZONES } from "./content";
import { getEventBannerSummary } from "./events";
import { isDungeonUnlocked } from "./expeditions";
import { applyAccountXp, getFirstClaimableMasteryRoute, unlockTitle, unlockTrophy } from "./progression";
import { createRng } from "./rng";
import { cloneState, createEmptyWeeklyQuest } from "./state";
import type {
  ActionResult,
  DailyMissionDifficulty,
  DailyReward,
  DailyTaskKind,
  DailyTaskRole,
  DailyTaskState,
  GameState,
  MaterialBundle,
  RegionMaterialId,
  WeeklyQuestReward,
  WeeklyQuestState,
  WeeklyQuestStepKind
} from "./types";

const WEEKLY_CONTRACT_TARGETS = [3, 9, 15] as const;
const DAILY_FOCUS_MAX_CHARGES = 3;
const DAILY_FOCUS_TARGET_EXPEDITIONS = 3;
const DAILY_FOCUS_REWARD = 10;

type DailyMissionTemplate = {
  kind: DailyTaskKind;
  difficulty: DailyMissionDifficulty;
  label: string;
  target: number;
  accountXp: number;
  regionalMaterialAmount?: number;
  fragments?: number;
  getRegionId?: (state: GameState) => string | undefined;
  isAvailable: (state: GameState) => boolean;
};

export type OrdersBoardOrderSource = "daily_focus" | "daily" | "weekly" | "event" | "construction" | "caravan" | "mastery" | "boss";
export type OrdersBoardOrderStatus = "ready" | "active" | "blocked" | "claimed" | "locked";

export type OrdersBoardOrder = {
  id: string;
  source: OrdersBoardOrderSource;
  label: string;
  detail: string;
  progress: number;
  target: number;
  status: OrdersBoardOrderStatus;
  rewardLabel: string | null;
  ctaTab: "expeditions" | "town" | "dailies" | "forge" | "hero" | "inventory" | "account" | "reincarnation" | "settings";
  priority: number;
};

export type OrdersBoardSummary = {
  orders: OrdersBoardOrder[];
  readyCount: number;
  activeCount: number;
  claimableDailyCount: number;
  dailyResetAt: number;
  weeklyResetAt: number;
};

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

function getLocalDateKey(now: number): string {
  const date = new Date(now);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDateKey(dateKey: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0).getTime();
}

function getElapsedCalendarDays(fromDateKey: string, toDateKey: string): number {
  const from = parseLocalDateKey(fromDateKey);
  const to = parseLocalDateKey(toDateKey);
  if (from === null || to === null || to <= from) {
    return 0;
  }
  return Math.floor((to - from) / DAY_MS);
}

function clampProgress(progress: number, target: number): number {
  return Math.max(0, Math.min(target, progress));
}

function getTaskSetKey(tasks: DailyTaskState[]): string {
  return tasks.map((task) => `${task.difficulty}:${task.kind}:${task.regionId ?? "any"}`).sort().join("|");
}

function hasAnyItem(state: GameState): boolean {
  return state.lifetime.totalItemsFound > 0 || state.inventory.length > 0 || Object.values(state.equipment).some(Boolean);
}

function getHighestUnlockedActiveRegionId(state: GameState): string {
  const unlockedActiveZones = ZONES.filter((zone) =>
    DUNGEONS.some((dungeon) => dungeon.zoneId === zone.id && !dungeon.boss && isDungeonUnlocked(state, dungeon))
  );
  return unlockedActiveZones.at(-1)?.id ?? "sunlit-marches";
}

function getActiveRegionMaterialId(state: GameState, regionId = getHighestUnlockedActiveRegionId(state)): RegionMaterialId {
  if (regionId === "emberwood") {
    return "emberResin";
  }
  return "sunlitTimber";
}

function getRegionName(regionId: string): string {
  return ZONES.find((zone) => zone.id === regionId)?.name ?? "active region";
}

function hasCollectionSystemsUnlocked(state: GameState): boolean {
  return REGION_COLLECTIONS.some((collection) => isCollectionVisible(state, collection));
}

function hasBossAttemptAvailable(state: GameState): boolean {
  return DUNGEONS.some((dungeon) => dungeon.boss && isDungeonUnlocked(state, dungeon));
}

function hasCaravanDailyObjectiveUnlocked(state: GameState): boolean {
  if (state.accountRank.accountRank < 2 || state.hero.level < 3) {
    return false;
  }
  return DUNGEONS.some((dungeon) => !dungeon.boss && isDungeonUnlocked(state, dungeon));
}

const DAILY_MISSION_TEMPLATES: DailyMissionTemplate[] = [
  {
    kind: "win_expeditions",
    difficulty: "easy",
    label: "Win 2 expeditions.",
    target: 2,
    accountXp: 5,
    regionalMaterialAmount: 1,
    isAvailable: () => true
  },
  {
    kind: "salvage_items",
    difficulty: "easy",
    label: "Salvage 3 items.",
    target: 3,
    accountXp: 5,
    fragments: 6,
    isAvailable: hasAnyItem
  },
  {
    kind: "equip_item",
    difficulty: "easy",
    label: "Equip a new item.",
    target: 1,
    accountXp: 5,
    isAvailable: (state) => state.inventory.length > 0
  },
  {
    kind: "gain_mastery_xp",
    difficulty: "medium",
    label: "Gain 200 Mastery XP.",
    target: 200,
    accountXp: 8,
    regionalMaterialAmount: 2,
    isAvailable: () => true
  },
  {
    kind: "win_region_expeditions",
    difficulty: "medium",
    label: "Win 4 expeditions in one active region.",
    target: 4,
    accountXp: 8,
    regionalMaterialAmount: 3,
    getRegionId: getHighestUnlockedActiveRegionId,
    isAvailable: () => true
  },
  {
    kind: "claim_mastery_milestone",
    difficulty: "medium",
    label: "Claim a mastery milestone.",
    target: 1,
    accountXp: 10,
    regionalMaterialAmount: 2,
    isAvailable: (state) => getFirstClaimableMasteryRoute(state) !== null
  },
  {
    kind: "collection_eligible_runs",
    difficulty: "hard",
    label: "Make 5 collection-eligible runs.",
    target: 5,
    accountXp: 12,
    isAvailable: hasCollectionSystemsUnlocked
  },
  {
    kind: "advance_collection_pity",
    difficulty: "hard",
    label: "Advance collection pity 3 times.",
    target: 3,
    accountXp: 12,
    isAvailable: hasCollectionSystemsUnlocked
  },
  {
    kind: "attempt_boss",
    difficulty: "hard",
    label: "Attempt any boss.",
    target: 1,
    accountXp: 12,
    isAvailable: hasBossAttemptAvailable
  },
  {
    kind: "complete_caravan",
    difficulty: "hard",
    label: "Complete a Caravan.",
    target: 1,
    accountXp: 12,
    regionalMaterialAmount: 3,
    isAvailable: hasCaravanDailyObjectiveUnlocked
  }
];

function createDailyReward(state: GameState, template: DailyMissionTemplate, regionId?: string): DailyReward {
  const regionalMaterials: Partial<Record<RegionMaterialId, number>> = {};
  const materialAmount = template.regionalMaterialAmount ?? 0;
  if (materialAmount > 0) {
    regionalMaterials[getActiveRegionMaterialId(state, regionId)] = materialAmount;
  }
  return {
    gold: 0,
    materials: {},
    focus: 0,
    accountXp: template.accountXp,
    regionalMaterials,
    fragments: template.fragments ?? 0
  };
}

function pickTemplate(
  rng: ReturnType<typeof createRng>,
  templates: DailyMissionTemplate[],
  usedKinds: Set<DailyTaskKind>
): DailyMissionTemplate | null {
  const candidates = templates.filter((template) => !usedKinds.has(template.kind));
  if (candidates.length === 0) {
    return null;
  }
  return candidates[rng.int(0, candidates.length - 1)];
}

function getEligibleTemplates(state: GameState, difficulty: DailyMissionDifficulty): DailyMissionTemplate[] {
  return DAILY_MISSION_TEMPLATES.filter((template) => template.difficulty === difficulty && template.isAvailable(state));
}

function createDailyTasks(state: GameState, now: number, previousKey: string | null): DailyTaskState[] {
  if (state.accountRank.accountRank < 2) {
    return [];
  }

  const windowStartAt = getDailyWindowStartAt(now);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const rng = createRng(`${state.seed}:daily-missions:${windowStartAt}:${attempt}`);
    const usedKinds = new Set<DailyTaskKind>();
    const picked: DailyMissionTemplate[] = [];
    const easy = pickTemplate(rng, getEligibleTemplates(state, "easy"), usedKinds);
    if (easy) {
      picked.push(easy);
      usedKinds.add(easy.kind);
    }
    const medium = pickTemplate(rng, getEligibleTemplates(state, "medium"), usedKinds);
    if (medium) {
      picked.push(medium);
      usedKinds.add(medium.kind);
    }
    const hard = pickTemplate(rng, getEligibleTemplates(state, "hard"), usedKinds) ?? pickTemplate(rng, getEligibleTemplates(state, "medium"), usedKinds);
    if (hard) {
      picked.push(hard);
      usedKinds.add(hard.kind);
    }

    const tasks = picked.slice(0, DAILY_TASK_COUNT).map((template, index) => {
      const regionId = template.getRegionId?.(state);
      const label =
        template.kind === "win_region_expeditions" && regionId
          ? `Win 4 expeditions in ${getRegionName(regionId)}.`
          : template.label;
      const role: DailyTaskRole = index === 0 ? "primary" : "secondary";
      return {
        id: `${windowStartAt}-${template.kind}-${regionId ?? "any"}-${index}`,
        kind: template.kind,
        role,
        difficulty: template.difficulty,
        label,
        target: template.target,
        progress: 0,
        claimed: false,
        reward: createDailyReward(state, template, regionId),
        regionId
      };
    });

    const key = getTaskSetKey(tasks);
    if (!previousKey || key !== previousKey || attempt === 5) {
      return tasks;
    }
  }
  return [];
}

function createWeeklyContracts(now: number) {
  const windowStartAt = getWeeklyWindowStartAt(now);
  return {
    windowStartAt,
    nextResetAt: getNextWeeklyResetAt(now),
    progress: 0,
    milestones: WEEKLY_CONTRACT_TARGETS.map((target) => ({
      target,
      claimed: false,
      reward: { gold: 0, materials: {}, focus: 0, accountXp: 0, regionalMaterials: {}, fragments: 0 }
    }))
  };
}

function createWeeklyQuest(state: GameState, now: number): WeeklyQuestState {
  const weekStartAt = getWeeklyWindowStartAt(now);
  const materialId = getActiveRegionMaterialId(state, "sunlit-marches");
  return {
    ...createEmptyWeeklyQuest(now),
    weekStartDate: getLocalDateKey(weekStartAt),
    weekStartAt,
    nextResetAt: getNextWeeklyResetAt(now),
    questId: "weekly-onboarding-charter",
    title: "Complete your first weekly charter.",
    steps: [
      { kind: "clear_expeditions", label: "Clear 15 expeditions", target: 15, progress: 0 },
      { kind: "claim_mastery_milestone", label: "Claim 1 mastery milestone", target: 1, progress: 0 }
    ],
    reward: {
      accountXp: 25,
      regionalMaterials: { [materialId]: 10 },
      fragments: 0,
      titleId: "title-steady-regular"
    },
    questProgress: 0,
    questClaimed: false,
    recapSeen: false
  };
}

function ensureDailyFocus(state: GameState, now: number): { state: GameState; reset: boolean } {
  const dateKey = getLocalDateKey(now);
  const focus = state.dailyFocus;
  const elapsedDays = getElapsedCalendarDays(focus.date, dateKey);
  const invalid =
    typeof focus.date !== "string" ||
    !Number.isFinite(focus.focusChargesBanked) ||
    !Number.isFinite(focus.focusChargeProgress) ||
    focus.focusChargesBanked < 0 ||
    focus.focusChargeProgress < 0;
  if (!invalid && elapsedDays <= 0) {
    return { state, reset: false };
  }
  const next = cloneState(state);
  next.dailyFocus.date = dateKey;
  next.dailyFocus.focusChargesBanked = Math.min(
    DAILY_FOCUS_MAX_CHARGES,
    Math.max(0, invalid ? 1 : next.dailyFocus.focusChargesBanked) + Math.max(0, elapsedDays)
  );
  next.dailyFocus.focusChargeProgress = clampProgress(
    invalid ? 0 : next.dailyFocus.focusChargeProgress,
    DAILY_FOCUS_TARGET_EXPEDITIONS
  );
  next.updatedAt = now;
  return { state: next, reset: elapsedDays > 0 || invalid };
}

function ensureWeeklyQuest(state: GameState, now: number): { state: GameState; reset: boolean } {
  const weekStartAt = getWeeklyWindowStartAt(now);
  const weekly = state.weeklyQuest;
  const invalid =
    !weekly ||
    weekly.weekStartAt !== weekStartAt ||
    weekly.nextResetAt !== getNextWeeklyResetAt(now) ||
    weekly.questId !== "weekly-onboarding-charter" ||
    !Array.isArray(weekly.steps) ||
    weekly.steps.length === 0 ||
    !weekly.reward;

  if (!invalid) {
    return { state, reset: false };
  }

  const next = cloneState(state);
  next.weeklyQuest = createWeeklyQuest(next, now);
  next.updatedAt = now;
  return { state: next, reset: true };
}

export function ensureDailies(state: GameState, now: number): { state: GameState; reset: boolean } {
  const dailyFocus = ensureDailyFocus(state, now);
  let next = dailyFocus.state;
  const windowStartAt = getDailyWindowStartAt(now);
  const weeklyWindowStartAt = getWeeklyWindowStartAt(now);
  const missionsUnlocked = next.accountRank.accountRank >= 2;
  const needsDailyWindowRefresh = now >= next.dailies.nextResetAt || next.dailies.windowStartAt !== windowStartAt;
  const needsMissionReset =
    !missionsUnlocked
      ? next.dailies.tasks.length > 0 || needsDailyWindowRefresh
      : needsDailyWindowRefresh || next.dailies.tasks.length !== DAILY_TASK_COUNT;
  const legacyWeekly = next.dailies.weekly;
  const needsLegacyWeeklyReset =
    !legacyWeekly ||
    now >= legacyWeekly.nextResetAt ||
    legacyWeekly.windowStartAt !== weeklyWindowStartAt ||
    legacyWeekly.milestones.length !== WEEKLY_CONTRACT_TARGETS.length;
  const weeklyQuest = ensureWeeklyQuest(next, now);
  next = weeklyQuest.state;

  if (!needsMissionReset && !needsLegacyWeeklyReset) {
    return { state: next, reset: dailyFocus.reset || weeklyQuest.reset };
  }

  if (next === state || next === dailyFocus.state) {
    next = cloneState(next);
  }
  if (needsLegacyWeeklyReset) {
    next.dailies.weekly = createWeeklyContracts(now);
  }
  if (needsMissionReset) {
    const previousKey = next.dailies.tasks.length === DAILY_TASK_COUNT ? getTaskSetKey(next.dailies.tasks) : next.dailies.lastTaskSetKey;
    const tasks = missionsUnlocked ? createDailyTasks(next, now, previousKey) : [];
    next.dailies.windowStartAt = windowStartAt;
    next.dailies.nextResetAt = getNextDailyResetAt(now);
    next.dailies.lastTaskSetKey = tasks.length > 0 ? getTaskSetKey(tasks) : null;
    next.dailies.tasks = tasks;
  }
  next.updatedAt = now;
  return { state: next, reset: dailyFocus.reset || weeklyQuest.reset || needsMissionReset || needsLegacyWeeklyReset };
}

function getOrderStatus(progress: number, target: number, claimed = false): OrdersBoardOrderStatus {
  if (claimed) return "claimed";
  return progress >= target ? "ready" : "active";
}

export function getOrdersBoardSummary(state: GameState, now: number): OrdersBoardSummary {
  const orders: OrdersBoardOrder[] = [];
  const dailyFocusTarget = DAILY_FOCUS_TARGET_EXPEDITIONS;
  const dailyFocusProgress = Math.min(state.dailyFocus.focusChargeProgress, dailyFocusTarget);
  if (state.dailyFocus.focusChargesBanked > 0) {
    orders.push({
      id: "daily-focus",
      source: "daily_focus",
      label: "Daily Focus",
      detail: `Complete ${dailyFocusTarget} expeditions to claim +${DAILY_FOCUS_REWARD} Focus.`,
      progress: dailyFocusProgress,
      target: dailyFocusTarget,
      status: dailyFocusProgress >= dailyFocusTarget ? "ready" : "active",
      rewardLabel: `+${DAILY_FOCUS_REWARD} Focus`,
      ctaTab: "dailies",
      priority: dailyFocusProgress >= dailyFocusTarget ? 100 : 40
    });
  }

  state.dailies.tasks.forEach((task, index) => {
    const status = getOrderStatus(task.progress, task.target, task.claimed);
    orders.push({
      id: task.id,
      source: "daily",
      label: task.label,
      detail: `${task.difficulty} daily order.`,
      progress: Math.min(task.progress, task.target),
      target: task.target,
      status,
      rewardLabel: task.reward.accountXp > 0 ? `+${task.reward.accountXp} Account XP` : null,
      ctaTab: "dailies",
      priority: status === "ready" ? 95 - index : status === "active" ? 35 - index : 5
    });
  });

  const weeklyTarget = state.weeklyQuest.steps.reduce((total, step) => total + step.target, 0);
  const weeklyProgress = state.weeklyQuest.steps.reduce((total, step) => total + Math.min(step.progress, step.target), 0);
  const weeklyStatus = getOrderStatus(weeklyProgress, weeklyTarget, state.weeklyQuest.questClaimed);
  orders.push({
    id: state.weeklyQuest.questId,
    source: "weekly",
    label: "Weekly Charter",
    detail: state.weeklyQuest.title,
    progress: weeklyProgress,
    target: weeklyTarget,
    status: weeklyStatus,
    rewardLabel: state.weeklyQuest.reward.accountXp > 0 ? `+${state.weeklyQuest.reward.accountXp} Account XP` : null,
    ctaTab: "dailies",
    priority: weeklyStatus === "ready" ? 90 : weeklyStatus === "active" ? 30 : 4
  });

  const event = getEventBannerSummary(state, now);
  const claimableEventTier = event?.tiers.find((tier) => tier.claimable);
  const nextEventTier = event?.tiers.find((tier) => !tier.claimed) ?? event?.tiers.at(-1) ?? null;
  if (event && nextEventTier) {
    orders.push({
      id: `${event.event.id}-${nextEventTier.rewardIndex}`,
      source: "event",
      label: event.event.name,
      detail: claimableEventTier ? `${claimableEventTier.label} is ready to claim.` : nextEventTier.label,
      progress: Math.min(event.progress.participation, nextEventTier.targetParticipation),
      target: nextEventTier.targetParticipation,
      status: claimableEventTier ? "ready" : "active",
      rewardLabel: "Festival tier reward",
      ctaTab: "dailies",
      priority: claimableEventTier ? 98 : 45
    });
  }

  if (state.construction.activeBuildingId) {
    const constructionReadyAt =
      state.construction.completedAt ??
      (state.construction.startedAt !== null ? state.construction.startedAt + Math.max(0, state.construction.baseDurationMs - state.construction.focusSpentMs) : Number.POSITIVE_INFINITY);
    const constructionReady = constructionReadyAt <= now;
    orders.push({
      id: "guild-project",
      source: "construction",
      label: "Guild Project",
      detail: constructionReady ? "Construction is ready to complete." : "A guild project is under construction.",
      progress: constructionReady ? 1 : 0,
      target: 1,
      status: constructionReady ? "ready" : "active",
      rewardLabel: state.construction.targetLevel ? `Level ${state.construction.targetLevel}` : null,
      ctaTab: "town",
      priority: constructionReady ? 96 : 25
    });
  }

  if (state.caravan.activeJob) {
    const ready = state.caravan.activeJob.endsAt <= now;
    orders.push({
      id: "caravan",
      source: "caravan",
      label: "Caravan Order",
      detail: ready ? "Caravan returned and is ready to claim." : "Caravan is traveling offline.",
      progress: ready ? 1 : 0,
      target: 1,
      status: ready ? "ready" : "active",
      rewardLabel: state.caravan.activeJob.focusId,
      ctaTab: "expeditions",
      priority: ready ? 94 : 28
    });
  } else {
    orders.push({
      id: "caravan-ready",
      source: "caravan",
      label: "Plan a Caravan",
      detail: state.activeExpedition ? "Finish the active expedition before sending the Caravan." : "Send a Caravan when you are ready to step away.",
      progress: 0,
      target: 1,
      status: state.activeExpedition ? "blocked" : "active",
      rewardLabel: "Offline job",
      ctaTab: "expeditions",
      priority: state.activeExpedition ? 8 : 18
    });
  }

  const claimableMastery = getFirstClaimableMasteryRoute(state);
  if (claimableMastery) {
    orders.push({
      id: `mastery-${claimableMastery.dungeon.id}`,
      source: "mastery",
      label: "Claim Route Mastery",
      detail: `${claimableMastery.tier.label} is ready.`,
      progress: 1,
      target: 1,
      status: "ready",
      rewardLabel: "Account XP",
      ctaTab: "expeditions",
      priority: 88
    });
  }

  if (hasBossAttemptAvailable(state)) {
    orders.push({
      id: "boss-prep",
      source: "boss",
      label: "War Room Review",
      detail: "A boss route is available. Check scouting and threat prep.",
      progress: 0,
      target: 1,
      status: "active",
      rewardLabel: "Boss progress",
      ctaTab: "expeditions",
      priority: 20
    });
  }

  const sortedOrders = orders.sort((a, b) => b.priority - a.priority);
  return {
    orders: sortedOrders,
    readyCount: sortedOrders.filter((order) => order.status === "ready").length,
    activeCount: sortedOrders.filter((order) => order.status === "active").length,
    claimableDailyCount: state.dailies.tasks.filter((task) => task.progress >= task.target && !task.claimed).length,
    dailyResetAt: state.dailies.nextResetAt,
    weeklyResetAt: state.weeklyQuest.nextResetAt
  };
}

function addMaterials(state: GameState, materials: Partial<MaterialBundle>) {
  state.resources.fragments += materials.fragments ?? 0;
}

function addRegionalMaterials(state: GameState, materials: Partial<Record<RegionMaterialId, number>>) {
  (Object.entries(materials) as [RegionMaterialId, number][]).forEach(([materialId, amount]) => {
    if (amount > 0) {
      state.regionProgress.materials[materialId] = (state.regionProgress.materials[materialId] ?? 0) + amount;
    }
  });
}

function addDailyReward(state: GameState, reward: DailyReward | WeeklyQuestReward, now: number) {
  state.resources.gold += "gold" in reward ? reward.gold : 0;
  addMaterials(state, "materials" in reward ? reward.materials : {});
  state.focus.current = Math.min(state.focus.cap, state.focus.current + ("focus" in reward ? reward.focus : 0));
  state.resources.fragments += reward.fragments;
  addRegionalMaterials(state, reward.regionalMaterials);
  if (reward.accountXp > 0) {
    applyAccountXp(state, reward.accountXp, now);
  }
}

function getTaskProgressDelta(task: DailyTaskState, progressByKind: Partial<Record<DailyTaskKind, number>>, regionId?: string): number {
  if (task.kind === "win_region_expeditions") {
    if (task.regionId && regionId && task.regionId !== regionId) {
      return 0;
    }
    return progressByKind.win_region_expeditions ?? 0;
  }
  return progressByKind[task.kind] ?? 0;
}

function getWeeklyStepDelta(kind: WeeklyQuestStepKind, progressByKind: Partial<Record<DailyTaskKind, number>>): number {
  switch (kind) {
    case "clear_expeditions":
      return progressByKind.complete_expeditions ?? 0;
    case "claim_mastery_milestone":
      return progressByKind.claim_mastery_milestone ?? 0;
    case "collection_eligible_runs":
      return progressByKind.collection_eligible_runs ?? 0;
    case "attempt_boss":
      return progressByKind.attempt_boss ?? 0;
  }
}

function updateWeeklyQuestProgress(weeklyQuest: WeeklyQuestState, progressByKind: Partial<Record<DailyTaskKind, number>>): boolean {
  let changed = false;
  weeklyQuest.steps = weeklyQuest.steps.map((step) => {
    const delta = getWeeklyStepDelta(step.kind, progressByKind);
    if (delta <= 0 || step.progress >= step.target) {
      return step;
    }
    changed = true;
    return {
      ...step,
      progress: clampProgress(step.progress + delta, step.target)
    };
  });
  weeklyQuest.questProgress = weeklyQuest.steps.reduce((total, step) => total + Math.min(step.progress, step.target), 0);
  return changed;
}

export function applyDailyProgress(
  state: GameState,
  now: number,
  progressByKind: Partial<Record<DailyTaskKind, number>>,
  context: { regionId?: string } = {}
): { state: GameState; reset: boolean; progressed: boolean } {
  const ensured = ensureDailies(state, now);
  const hasProgressInput = Object.values(progressByKind).some((value) => (value ?? 0) > 0);
  if (!hasProgressInput) {
    return { state: ensured.state, reset: ensured.reset, progressed: false };
  }

  const next = cloneState(ensured.state);
  let progressed = false;

  const expeditionCompletions = progressByKind.complete_expeditions ?? 0;
  if (expeditionCompletions > 0 && next.dailyFocus.focusChargesBanked > 0 && next.dailyFocus.focusChargeProgress < DAILY_FOCUS_TARGET_EXPEDITIONS) {
    next.dailyFocus.focusChargeProgress = clampProgress(next.dailyFocus.focusChargeProgress + expeditionCompletions, DAILY_FOCUS_TARGET_EXPEDITIONS);
    progressed = true;
  }

  const taskUpdates = next.dailies.tasks.map((task) => {
    const delta = getTaskProgressDelta(task, progressByKind, context.regionId);
    if (delta <= 0 || task.progress >= task.target) {
      return task;
    }
    progressed = true;
    return {
      ...task,
      progress: clampProgress(task.progress + delta, task.target)
    };
  });

  const weeklyProgressed = updateWeeklyQuestProgress(next.weeklyQuest, progressByKind);
  progressed = progressed || weeklyProgressed;

  if (!progressed) {
    return { state: ensured.state, reset: ensured.reset, progressed: false };
  }

  next.dailies.tasks = taskUpdates;
  next.updatedAt = now;
  return { state: next, reset: ensured.reset, progressed: true };
}

export function claimDailyFocus(state: GameState, now: number): ActionResult {
  const ensured = ensureDailies(state, now);
  const focus = ensured.state.dailyFocus;
  if (focus.focusChargesBanked <= 0) {
    return { ok: false, state: ensured.state, error: "No Daily Focus charges are banked." };
  }
  if (focus.focusChargeProgress < DAILY_FOCUS_TARGET_EXPEDITIONS) {
    return { ok: false, state: ensured.state, error: "Complete 3 expeditions to claim Daily Focus." };
  }

  const next = cloneState(ensured.state);
  next.dailyFocus.focusChargesBanked -= 1;
  next.dailyFocus.focusChargeProgress = 0;
  next.focus.current = Math.min(next.focus.cap, next.focus.current + DAILY_FOCUS_REWARD);
  next.updatedAt = now;
  return { ok: true, state: next, message: `Daily Focus claimed: +${DAILY_FOCUS_REWARD} Focus.` };
}

export function claimDailyTask(state: GameState, taskId: string, now: number): ActionResult {
  const ensured = ensureDailies(state, now);
  if (ensured.state.accountRank.accountRank < 2) {
    return { ok: false, state: ensured.state, error: "Daily Missions unlock at Account Rank 2." };
  }

  const taskIndex = ensured.state.dailies.tasks.findIndex((task) => task.id === taskId);
  if (taskIndex < 0) {
    return { ok: false, state: ensured.state, error: "Daily Mission not found." };
  }

  const task = ensured.state.dailies.tasks[taskIndex];
  if (task.claimed) {
    return { ok: false, state: ensured.state, error: "Daily Mission reward already claimed." };
  }

  if (task.progress < task.target) {
    return { ok: false, state: ensured.state, error: "Daily Mission is not complete yet." };
  }

  const next = cloneState(ensured.state);
  next.dailies.tasks[taskIndex].claimed = true;
  addDailyReward(next, task.reward, now);
  next.lifetime.totalDailyClaims += 1;
  next.updatedAt = now;
  return { ok: true, state: next, message: `Daily Mission claimed: ${task.label}` };
}

export function claimWeeklyQuest(state: GameState, now: number): ActionResult {
  const ensured = ensureDailies(state, now);
  const weeklyQuest = ensured.state.weeklyQuest;
  if (weeklyQuest.questClaimed) {
    return { ok: false, state: ensured.state, error: "Weekly Quest reward already claimed." };
  }
  if (weeklyQuest.steps.some((step) => step.progress < step.target)) {
    return { ok: false, state: ensured.state, error: "Weekly Quest is not complete yet." };
  }

  const next = cloneState(ensured.state);
  next.weeklyQuest.questClaimed = true;
  addDailyReward(next, weeklyQuest.reward, now);
  if (weeklyQuest.reward.titleId) {
    unlockTitle(next, weeklyQuest.reward.titleId, now);
  }
  if (weeklyQuest.reward.trophyId) {
    unlockTrophy(next, weeklyQuest.reward.trophyId, now);
  }
  next.updatedAt = now;
  return { ok: true, state: next, message: "Weekly Quest claimed." };
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
  addDailyReward(next, milestone.reward, now);
  next.updatedAt = now;
  return { ok: true, state: next, message: `Weekly contract milestone claimed: ${milestone.target}.` };
}
