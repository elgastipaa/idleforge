import { BUILDINGS } from "./content";
import { refreshAchievements } from "./achievements";
import { getDerivedStats } from "./balance";
import { applyDailyProgress, ensureDailies } from "./dailies";
import { cloneState, createEmptyConstruction } from "./state";
import type {
  ActionResult,
  BuildingConstructionCost,
  BuildingId,
  ConstructionProgressSummary,
  GameState,
  RegionMaterialId,
  ResourceState
} from "./types";
import { regenerateFocus } from "./focus";

const MINUTE_MS = 60 * 1000;

export const CONSTRUCTION_FOCUS_MS_PER_FOCUS = 4 * MINUTE_MS;
export const CONSTRUCTION_FOCUS_PER_HOUR = 15;
export const CONSTRUCTION_CANCEL_REFUND_RATE = 0.8;

type BuildingConstructionSeed = BuildingConstructionCost & {
  durationMs: number;
};

const BUILDING_CONSTRUCTION_SEEDS: Record<BuildingId, Record<number, BuildingConstructionSeed>> = {
  forge: {
    1: { resources: { gold: 40 }, regionalMaterials: { sunlitTimber: 2 }, durationMs: 2 * MINUTE_MS },
    2: { resources: { gold: 120 }, regionalMaterials: { emberResin: 6 }, durationMs: 5 * MINUTE_MS },
    3: { resources: { gold: 240 }, regionalMaterials: { emberResin: 12 }, durationMs: 15 * MINUTE_MS }
  },
  mine: {
    1: { resources: { gold: 60 }, regionalMaterials: { sunlitTimber: 3 }, durationMs: 2 * MINUTE_MS },
    2: { resources: { gold: 120 }, regionalMaterials: { sunlitTimber: 6 }, durationMs: 5 * MINUTE_MS },
    3: { resources: { gold: 260 }, regionalMaterials: { sunlitTimber: 10, emberResin: 3 }, durationMs: 15 * MINUTE_MS }
  },
  tavern: {
    1: { resources: { gold: 75 }, regionalMaterials: { sunlitTimber: 4 }, durationMs: 2 * MINUTE_MS },
    2: { resources: { gold: 140 }, regionalMaterials: { sunlitTimber: 8 }, durationMs: 5 * MINUTE_MS },
    3: { resources: { gold: 260 }, regionalMaterials: { sunlitTimber: 12 }, durationMs: 15 * MINUTE_MS }
  },
  library: {
    1: { resources: { gold: 110 }, regionalMaterials: { sunlitTimber: 5 }, durationMs: 2 * MINUTE_MS },
    2: { resources: { gold: 220 }, regionalMaterials: { sunlitTimber: 8, emberResin: 2 }, durationMs: 8 * MINUTE_MS },
    3: { resources: { gold: 380 }, regionalMaterials: { emberResin: 8 }, durationMs: 20 * MINUTE_MS }
  },
  market: {
    1: { resources: { gold: 75 }, regionalMaterials: { sunlitTimber: 4 }, durationMs: 2 * MINUTE_MS },
    2: { resources: { gold: 150 }, regionalMaterials: { sunlitTimber: 8 }, durationMs: 5 * MINUTE_MS },
    3: { resources: { gold: 280 }, regionalMaterials: { emberResin: 8 }, durationMs: 15 * MINUTE_MS }
  },
  shrine: {
    1: { resources: { gold: 250 }, regionalMaterials: { sunlitTimber: 8, emberResin: 4 }, durationMs: 10 * MINUTE_MS },
    2: { resources: { gold: 500 }, regionalMaterials: { emberResin: 12 }, durationMs: 30 * MINUTE_MS },
    3: { resources: { gold: 900 }, regionalMaterials: { emberResin: 20 }, durationMs: 60 * MINUTE_MS }
  }
};

const FALLBACK_REGIONAL_MATERIAL_BY_BUILDING: Record<BuildingId, RegionMaterialId[]> = {
  forge: ["emberResin"],
  mine: ["sunlitTimber"],
  tavern: ["sunlitTimber"],
  library: ["archiveGlyph", "emberResin"],
  market: ["sunlitTimber", "stormglassShard"],
  shrine: ["oathEmber", "emberResin"]
};

export function getBuildingDefinition(buildingId: BuildingId) {
  const building = BUILDINGS.find((entry) => entry.id === buildingId);
  if (!building) {
    throw new Error(`Unknown building: ${buildingId}`);
  }
  return building;
}

export function getBuildingCost(state: GameState, buildingId: BuildingId): Partial<ResourceState> {
  const building = getBuildingDefinition(buildingId);
  const level = state.town[buildingId];
  return getBuildingResourceCost(buildingId, level);
}

function getBuildingResourceCost(buildingId: BuildingId, currentLevel: number): Partial<ResourceState> {
  const building = getBuildingDefinition(buildingId);
  const cost: Partial<ResourceState> = {};
  (Object.keys(building.baseCost) as (keyof ResourceState)[]).forEach((resource) => {
    const base = building.baseCost[resource] ?? 0;
    if (base > 0) {
      const exponent = resource === "gold" ? 1.62 : 1.53;
      cost[resource] = Math.floor(base * Math.pow(exponent, currentLevel));
    }
  });
  return cost;
}

function cloneConstructionCost(cost: BuildingConstructionCost): BuildingConstructionCost {
  return {
    resources: { ...cost.resources },
    regionalMaterials: { ...cost.regionalMaterials }
  };
}

function getFallbackRegionalCost(buildingId: BuildingId, targetLevel: number): Partial<Record<RegionMaterialId, number>> {
  const materialIds = FALLBACK_REGIONAL_MATERIAL_BY_BUILDING[buildingId];
  const baseAmount = Math.max(1, Math.floor(8 * Math.pow(1.45, targetLevel - 3)));
  return materialIds.reduce<Partial<Record<RegionMaterialId, number>>>((cost, materialId, index) => {
    cost[materialId] = index === 0 ? baseAmount : Math.max(1, Math.floor(baseAmount * 0.45));
    return cost;
  }, {});
}

export function getBuildingConstructionCostForLevel(buildingId: BuildingId, targetLevel: number): BuildingConstructionCost {
  const seeded = BUILDING_CONSTRUCTION_SEEDS[buildingId][targetLevel];
  if (seeded) {
    return cloneConstructionCost(seeded);
  }
  return {
    resources: getBuildingResourceCost(buildingId, targetLevel - 1),
    regionalMaterials: getFallbackRegionalCost(buildingId, targetLevel)
  };
}

export function getBuildingConstructionCost(state: GameState, buildingId: BuildingId): BuildingConstructionCost {
  return getBuildingConstructionCostForLevel(buildingId, state.town[buildingId] + 1);
}

export function getBuildingConstructionDurationMs(buildingId: BuildingId, targetLevel: number): number {
  const seeded = BUILDING_CONSTRUCTION_SEEDS[buildingId][targetLevel];
  if (seeded) return seeded.durationMs;
  const levelOffset = Math.max(0, targetLevel - 4);
  return Math.min(8 * 60 * MINUTE_MS, Math.floor(30 * MINUTE_MS * Math.pow(1.75, levelOffset)));
}

export function canAfford(resources: ResourceState, cost: Partial<ResourceState>): boolean {
  return (Object.keys(cost) as (keyof ResourceState)[]).every((resource) => resources[resource] >= (cost[resource] ?? 0));
}

export function canAffordConstructionCost(state: GameState, cost: BuildingConstructionCost): boolean {
  const resourcesAffordable = canAfford(state.resources, cost.resources);
  const regionalAffordable = (Object.keys(cost.regionalMaterials) as RegionMaterialId[]).every(
    (materialId) => (state.regionProgress.materials[materialId] ?? 0) >= (cost.regionalMaterials[materialId] ?? 0)
  );
  return resourcesAffordable && regionalAffordable;
}

function deductConstructionCost(state: GameState, cost: BuildingConstructionCost) {
  (Object.keys(cost.resources) as (keyof ResourceState)[]).forEach((resource) => {
    state.resources[resource] -= cost.resources[resource] ?? 0;
  });
  (Object.keys(cost.regionalMaterials) as RegionMaterialId[]).forEach((materialId) => {
    state.regionProgress.materials[materialId] -= cost.regionalMaterials[materialId] ?? 0;
  });
}

function addConstructionCost(state: GameState, cost: BuildingConstructionCost) {
  (Object.keys(cost.resources) as (keyof ResourceState)[]).forEach((resource) => {
    state.resources[resource] += cost.resources[resource] ?? 0;
  });
  (Object.keys(cost.regionalMaterials) as RegionMaterialId[]).forEach((materialId) => {
    state.regionProgress.materials[materialId] += cost.regionalMaterials[materialId] ?? 0;
  });
}

function multiplyConstructionCost(cost: BuildingConstructionCost, multiplier: number): BuildingConstructionCost {
  const resources = (Object.keys(cost.resources) as (keyof ResourceState)[]).reduce<Partial<ResourceState>>((refund, resource) => {
    const amount = Math.floor((cost.resources[resource] ?? 0) * multiplier);
    if (amount > 0) refund[resource] = amount;
    return refund;
  }, {});
  const regionalMaterials = (Object.keys(cost.regionalMaterials) as RegionMaterialId[]).reduce<Partial<Record<RegionMaterialId, number>>>((refund, materialId) => {
    const amount = Math.floor((cost.regionalMaterials[materialId] ?? 0) * multiplier);
    if (amount > 0) refund[materialId] = amount;
    return refund;
  }, {});
  return { resources, regionalMaterials };
}

export function getActiveConstructionProgress(state: GameState, now: number): ConstructionProgressSummary | null {
  const construction = state.construction;
  if (!construction.activeBuildingId || construction.startedAt === null || construction.targetLevel === null || construction.baseDurationMs <= 0) {
    return null;
  }
  const rawElapsedMs = Math.max(0, now - construction.startedAt) + Math.max(0, construction.focusSpentMs);
  const elapsedMs = Math.min(construction.baseDurationMs, rawElapsedMs);
  const remainingMs = Math.max(0, construction.baseDurationMs - rawElapsedMs);
  const completedAt =
    construction.completedAt ??
    (remainingMs === 0 ? Math.min(now, construction.startedAt + Math.max(0, construction.baseDurationMs - construction.focusSpentMs)) : construction.startedAt + construction.baseDurationMs);
  return {
    buildingId: construction.activeBuildingId,
    targetLevel: construction.targetLevel,
    startedAt: construction.startedAt,
    completedAt,
    baseDurationMs: construction.baseDurationMs,
    elapsedMs,
    remainingMs,
    focusSpentMs: Math.max(0, construction.focusSpentMs),
    progress: construction.baseDurationMs === 0 ? 1 : Math.min(1, elapsedMs / construction.baseDurationMs),
    ready: remainingMs === 0
  };
}

export function markConstructionReady(state: GameState, now: number): ConstructionProgressSummary | null {
  const progress = getActiveConstructionProgress(state, now);
  if (progress?.ready && state.construction.completedAt === null) {
    state.construction.completedAt = progress.completedAt;
  }
  return progress;
}

export function getConstructionFocusCostToComplete(state: GameState, now: number): number {
  const progress = getActiveConstructionProgress(state, now);
  if (!progress || progress.ready) return 0;
  return Math.ceil(progress.remainingMs / CONSTRUCTION_FOCUS_MS_PER_FOCUS);
}

export function getConstructionCancelRefund(state: GameState): BuildingConstructionCost {
  return multiplyConstructionCost(
    {
      resources: state.construction.paidCostResources ?? {},
      regionalMaterials: state.construction.paidCostRegionalMaterials ?? {}
    },
    CONSTRUCTION_CANCEL_REFUND_RATE
  );
}

export function startBuildingConstruction(state: GameState, buildingId: BuildingId, now: number): ActionResult {
  const building = getBuildingDefinition(buildingId);
  if (state.town[buildingId] >= building.maxLevel) {
    return { ok: false, state, error: `${building.name} is already at max level.` };
  }
  if (state.construction.activeBuildingId) {
    const activeBuilding = getBuildingDefinition(state.construction.activeBuildingId);
    return { ok: false, state, error: `${activeBuilding.name} is already under construction.` };
  }

  const targetLevel = state.town[buildingId] + 1;
  const cost = getBuildingConstructionCost(state, buildingId);
  if (!canAffordConstructionCost(state, cost)) {
    return { ok: false, state, error: `Not enough resources to construct ${building.name}.` };
  }

  const next = cloneState(state);
  regenerateFocus(next, now);
  deductConstructionCost(next, cost);
  next.construction = {
    activeBuildingId: buildingId,
    startedAt: now,
    targetLevel,
    baseDurationMs: getBuildingConstructionDurationMs(buildingId, targetLevel),
    focusSpentMs: 0,
    completedAt: null,
    paidCostResources: { ...cost.resources },
    paidCostRegionalMaterials: { ...cost.regionalMaterials }
  };
  next.updatedAt = now;
  return { ok: true, state: next, message: `${building.name} construction started for level ${targetLevel}.` };
}

export function buyBuildingUpgrade(state: GameState, buildingId: BuildingId, now: number): ActionResult {
  return startBuildingConstruction(state, buildingId, now);
}

export function claimBuildingConstruction(state: GameState, now: number): ActionResult {
  const activeBuildingId = state.construction.activeBuildingId;
  if (!activeBuildingId || state.construction.targetLevel === null) {
    return { ok: false, state, error: "No construction is active." };
  }

  const progress = getActiveConstructionProgress(state, now);
  if (!progress?.ready) {
    return { ok: false, state, error: "Construction is not complete yet." };
  }

  const building = getBuildingDefinition(activeBuildingId);
  const next = cloneState(state);
  regenerateFocus(next, now);
  markConstructionReady(next, now);
  const dailyPrepared = ensureDailies(next, now);
  const working = dailyPrepared.state;
  const beforePower = getDerivedStats(working).powerScore;
  working.town[activeBuildingId] = Math.max(working.town[activeBuildingId], progress.targetLevel);
  working.construction = createEmptyConstruction();
  const progressed = applyDailyProgress(working, now, { upgrade_building: 1 });
  const progressedState = progressed.state;
  progressedState.updatedAt = now;
  const achievements = refreshAchievements(progressedState, now);
  const afterPower = getDerivedStats(achievements.state).powerScore;
  const powerDelta = afterPower - beforePower;
  const powerText = powerDelta === 0 ? "" : ` Power ${powerDelta > 0 ? "+" : ""}${powerDelta}.`;
  return { ok: true, state: achievements.state, message: `${building.name} upgraded to level ${progress.targetLevel}.${powerText}` };
}

export function accelerateBuildingConstruction(state: GameState, focusToSpend: number, now: number): ActionResult {
  if (!state.construction.activeBuildingId) {
    return { ok: false, state, error: "No construction is active." };
  }
  if (!Number.isFinite(focusToSpend) || focusToSpend <= 0) {
    return { ok: false, state, error: "Choose a positive Focus amount." };
  }
  const neededFocus = getConstructionFocusCostToComplete(state, now);
  if (neededFocus <= 0) {
    return { ok: false, state, error: "Construction is already ready to claim." };
  }
  const spend = Math.min(Math.floor(focusToSpend), neededFocus);
  const next = cloneState(state);
  regenerateFocus(next, now);
  const dailyPrepared = ensureDailies(next, now);
  const working = dailyPrepared.state;
  if (working.focus.current < spend) {
    return { ok: false, state, error: "Not enough Focus to accelerate construction." };
  }
  working.focus.current -= spend;
  working.construction.focusSpentMs += spend * CONSTRUCTION_FOCUS_MS_PER_FOCUS;
  markConstructionReady(working, now);
  const progressed = applyDailyProgress(working, now, { spend_focus: spend });
  progressed.state.updatedAt = now;
  const building = getBuildingDefinition(progressed.state.construction.activeBuildingId ?? state.construction.activeBuildingId);
  const skippedMinutes = Math.floor((spend * CONSTRUCTION_FOCUS_MS_PER_FOCUS) / MINUTE_MS);
  return { ok: true, state: progressed.state, message: `${building.name} construction accelerated by ${skippedMinutes} minutes.` };
}

export function cancelBuildingConstruction(state: GameState, now: number): ActionResult {
  const activeBuildingId = state.construction.activeBuildingId;
  if (!activeBuildingId) {
    return { ok: false, state, error: "No construction is active." };
  }
  const building = getBuildingDefinition(activeBuildingId);
  const next = cloneState(state);
  regenerateFocus(next, now);
  const refund = getConstructionCancelRefund(next);
  addConstructionCost(next, refund);
  next.construction = createEmptyConstruction();
  next.updatedAt = now;
  return { ok: true, state: next, message: `${building.name} construction canceled. 80% of paid materials were refunded.` };
}

export function applyConstructionOfflineProgress(state: GameState, now: number): { buildingId: BuildingId; targetLevel: number; completed: boolean } | null {
  const wasCompleted = Boolean(state.construction.completedAt);
  const progress = markConstructionReady(state, now);
  if (!progress?.ready || wasCompleted) return null;
  return {
    buildingId: progress.buildingId,
    targetLevel: progress.targetLevel,
    completed: true
  };
}
