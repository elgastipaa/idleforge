import { BUILDINGS } from "./content";
import { refreshAchievements } from "./achievements";
import { applyDailyProgress, ensureDailies } from "./dailies";
import { cloneState } from "./state";
import type { ActionResult, BuildingId, GameState, ResourceState } from "./types";
import { regenerateVigor } from "./vigor";

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
  const cost: Partial<ResourceState> = {};
  (Object.keys(building.baseCost) as (keyof ResourceState)[]).forEach((resource) => {
    const base = building.baseCost[resource] ?? 0;
    if (base > 0) {
      const exponent = resource === "gold" ? 1.62 : 1.53;
      cost[resource] = Math.floor(base * Math.pow(exponent, level));
    }
  });
  return cost;
}

export function canAfford(resources: ResourceState, cost: Partial<ResourceState>): boolean {
  return (Object.keys(cost) as (keyof ResourceState)[]).every((resource) => resources[resource] >= (cost[resource] ?? 0));
}

export function buyBuildingUpgrade(state: GameState, buildingId: BuildingId, now: number): ActionResult {
  const building = getBuildingDefinition(buildingId);
  if (state.town[buildingId] >= building.maxLevel) {
    return { ok: false, state, error: `${building.name} is already at max level.` };
  }

  const cost = getBuildingCost(state, buildingId);
  if (!canAfford(state.resources, cost)) {
    return { ok: false, state, error: `Not enough resources to upgrade ${building.name}.` };
  }

  const next = cloneState(state);
  regenerateVigor(next, now);
  const dailyPrepared = ensureDailies(next, now);
  const working = dailyPrepared.state;
  (Object.keys(cost) as (keyof ResourceState)[]).forEach((resource) => {
    working.resources[resource] -= cost[resource] ?? 0;
  });
  working.town[buildingId] += 1;
  const progressed = applyDailyProgress(working, now, { upgrade_building: 1 });
  const progressedState = progressed.state;
  progressedState.updatedAt = now;
  const achievements = refreshAchievements(progressedState, now);
  return { ok: true, state: achievements.state, message: `${building.name} upgraded to level ${progressedState.town[buildingId]}.` };
}
