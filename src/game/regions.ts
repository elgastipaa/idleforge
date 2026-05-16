import { DUNGEONS } from "./content";
import { MASTERY_TIERS } from "./progression";
import { cloneState } from "./state";
import type { ActionResult, GameState, RegionCompletionSummary, RegionMaterialId, RegionalMaterialSinkDefinition } from "./types";

const ACTIVE_REGION_MATERIAL_ENTRIES: { regionId: string; materialId: RegionMaterialId }[] = [
  { regionId: "sunlit-marches", materialId: "sunlitTimber" },
  { regionId: "emberwood", materialId: "emberResin" },
  { regionId: "azure-vaults", materialId: "archiveGlyph" },
  { regionId: "stormglass-peaks", materialId: "stormglassShard" },
  { regionId: "first-forge", materialId: "oathEmber" }
];

const REGION_MATERIAL_BY_REGION_ID: Partial<Record<string, RegionMaterialId>> = ACTIVE_REGION_MATERIAL_ENTRIES.reduce(
  (materialsByRegion, entry) => {
    materialsByRegion[entry.regionId] = entry.materialId;
    return materialsByRegion;
  },
  {} as Partial<Record<string, RegionMaterialId>>
);

export const REGIONAL_MATERIAL_SINKS: RegionalMaterialSinkDefinition[] = [
  {
    id: "sunlit-market-supplies",
    regionId: "sunlit-marches",
    materialId: "sunlitTimber",
    name: "Market Route Supplies",
    description: "Convert route timber into town trade goods.",
    cost: 6,
    reward: { gold: 45 }
  },
  {
    id: "emberwood-forge-fuel",
    regionId: "emberwood",
    materialId: "emberResin",
    name: "Forge Heat Fuel",
    description: "Burn resin into forge-ready Fragments.",
    cost: 6,
    reward: { fragments: 18 }
  },
  {
    id: "azure-archive-index",
    regionId: "azure-vaults",
    materialId: "archiveGlyph",
    name: "Archive Index",
    description: "File Archive Glyphs into sellable route ledgers.",
    cost: 8,
    reward: { gold: 95 }
  },
  {
    id: "stormglass-relay",
    regionId: "stormglass-peaks",
    materialId: "stormglassShard",
    name: "Stormglass Relay",
    description: "Cut stormglass into high-grade forge conduits.",
    cost: 10,
    reward: { fragments: 42 }
  },
  {
    id: "first-forge-ember-vow",
    regionId: "first-forge",
    materialId: "oathEmber",
    name: "Ember Vow",
    description: "Bank Oath Embers for a rich guild grant.",
    cost: 12,
    reward: { gold: 220, fragments: 65 }
  }
];

export function getRegionMaterialId(regionId: string): RegionMaterialId | null {
  return REGION_MATERIAL_BY_REGION_ID[regionId] ?? null;
}

export function getActiveRegionIds(state: GameState): string[] {
  return ACTIVE_REGION_MATERIAL_ENTRIES.filter((entry) => state.regionProgress.activeMaterialIds.includes(entry.materialId)).map(
    (entry) => entry.regionId
  );
}

export function isActiveRegion(state: GameState, regionId: string): boolean {
  return getActiveRegionIds(state).includes(regionId);
}

export function getRegionalMaterialSinks(regionId: string): RegionalMaterialSinkDefinition[] {
  return REGIONAL_MATERIAL_SINKS.filter((sink) => sink.regionId === regionId);
}

export function getRegionCompletionSummary(state: GameState, regionId: string): RegionCompletionSummary {
  const materialId = getRegionMaterialId(regionId);
  const dungeons = DUNGEONS.filter((dungeon) => dungeon.zoneId === regionId);
  const routesCleared = dungeons.filter((dungeon) => (state.dungeonClears[dungeon.id] ?? 0) > 0).length;
  const masteryTiersTotal = dungeons.length * MASTERY_TIERS.length;
  const masteryTiersClaimed = dungeons.reduce((total, dungeon) => total + (state.dungeonMastery[dungeon.id]?.claimedTiers.length ?? 0), 0);
  const routeProgress = dungeons.length > 0 ? routesCleared / dungeons.length : 0;
  const masteryProgress = masteryTiersTotal > 0 ? masteryTiersClaimed / masteryTiersTotal : 0;
  const completionPercent = Math.floor((routeProgress * 0.6 + masteryProgress * 0.4) * 100);

  return {
    regionId,
    materialId,
    materialAmount: materialId ? state.regionProgress.materials[materialId] ?? 0 : 0,
    routesCleared,
    routesTotal: dungeons.length,
    masteryTiersClaimed,
    masteryTiersTotal,
    completionPercent,
    outpost: state.regionProgress.outposts[regionId] ?? null
  };
}

function getRegionalMaterialSinkDefinition(sinkId: string): RegionalMaterialSinkDefinition | null {
  return REGIONAL_MATERIAL_SINKS.find((sink) => sink.id === sinkId) ?? null;
}

export function fundRegionalMaterialSink(state: GameState, sinkId: string, now: number): ActionResult {
  const sink = getRegionalMaterialSinkDefinition(sinkId);
  if (!sink) {
    return { ok: false, state, error: "Unknown regional project." };
  }

  if (!isActiveRegion(state, sink.regionId)) {
    return { ok: false, state, error: "That regional project is not active yet." };
  }

  const available = state.regionProgress.materials[sink.materialId] ?? 0;
  if (available < sink.cost) {
    return { ok: false, state, error: `Not enough regional material for ${sink.name}.` };
  }

  const next = cloneState(state);
  next.regionProgress.materials[sink.materialId] = available - sink.cost;
  next.resources.gold += sink.reward.gold ?? 0;
  next.resources.fragments += sink.reward.fragments ?? 0;
  next.updatedAt = now;

  return { ok: true, state: next, message: `${sink.name} funded.` };
}
