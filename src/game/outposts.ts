import { DUNGEONS } from "./content";
import { cloneState } from "./state";
import type { ActionResult, ExpeditionThreatId, GameState, RegionMaterialId, RegionOutpostBonusDefinition, RegionOutpostBonusId, RegionOutpostState } from "./types";

export const OUTPOST_BONUSES: RegionOutpostBonusDefinition[] = [
  {
    id: "supply-post",
    name: "Supply Post",
    description: "Turns local salvage routes into steadier construction material.",
    effectText: "+5% regional material from successful routes and Caravan returns."
  },
  {
    id: "watchtower",
    name: "Watchtower",
    description: "Keeps a standing scout crew watching the region boss.",
    effectText: "Boss Scout reveals +1 extra threat in this region."
  },
  {
    id: "relic-survey",
    name: "Relic Survey",
    description: "Maps where collection pieces are most likely to surface.",
    effectText: "+3% collection piece chance in this region."
  },
  {
    id: "training-yard",
    name: "Training Yard",
    description: "Drills blunt-force answers for the region's most punishing boss patterns.",
    effectText: "+0.25 coverage against Brutal boss threats in this region."
  }
];

export function getOutpostBonusDefinition(bonusId: string | null): RegionOutpostBonusDefinition | null {
  if (!bonusId) return null;
  return OUTPOST_BONUSES.find((bonus) => bonus.id === bonusId) ?? null;
}

export function getRegionOutpost(state: GameState, regionId: string): RegionOutpostState | null {
  return state.regionProgress.outposts[regionId] ?? null;
}

export function hasRegionOutpostBonus(state: GameState, regionId: string, bonusId: RegionOutpostBonusId): boolean {
  const outpost = getRegionOutpost(state, regionId);
  return Boolean(outpost && outpost.level > 0 && outpost.selectedBonusId === bonusId);
}

export function getRegionalMaterialYieldMultiplier(state: GameState, regionId: string): number {
  return hasRegionOutpostBonus(state, regionId, "supply-post") ? 1.05 : 1;
}

export function getOutpostCaravanMaterialMultiplier(state: GameState, regionId: string): number {
  return hasRegionOutpostBonus(state, regionId, "supply-post") ? 1.05 : 1;
}

export function getOutpostCollectionChanceBonus(state: GameState, regionId: string): number {
  return hasRegionOutpostBonus(state, regionId, "relic-survey") ? 0.03 : 0;
}

export function getOutpostScoutRevealBonus(state: GameState, regionId: string): number {
  return hasRegionOutpostBonus(state, regionId, "watchtower") ? 1 : 0;
}

export function getOutpostThreatCoverage(state: GameState, regionId: string, threatId: ExpeditionThreatId): number {
  return threatId === "brutal" && hasRegionOutpostBonus(state, regionId, "training-yard") ? 0.25 : 0;
}

function hasBossClearInRegion(state: GameState, regionId: string): boolean {
  return DUNGEONS.some((dungeon) => dungeon.zoneId === regionId && dungeon.boss && (state.dungeonClears[dungeon.id] ?? 0) > 0);
}

export function selectRegionOutpostBonus(state: GameState, regionId: string, bonusId: RegionOutpostBonusId, now: number): ActionResult {
  const bonus = getOutpostBonusDefinition(bonusId);
  if (!bonus) {
    return { ok: false, state, error: "Unknown outpost bonus." };
  }
  const existing = state.regionProgress.outposts[regionId];
  if (!existing && !hasBossClearInRegion(state, regionId)) {
    return { ok: false, state, error: "Defeat this region's boss before establishing an Outpost." };
  }

  const next = cloneState(state);
  next.regionProgress.outposts[regionId] = {
    selectedBonusId: bonus.id,
    level: Math.max(1, existing?.level ?? 0)
  };
  next.updatedAt = now;
  return { ok: true, state: next, message: `${bonus.name} assigned to this region's Outpost.` };
}

export function getRegionalMaterialWithOutpostBonus(state: GameState, regionId: string, materialId: RegionMaterialId, baseAmount: number): number {
  const multiplier = getRegionalMaterialYieldMultiplier(state, regionId);
  return Math.floor(baseAmount * multiplier);
}
