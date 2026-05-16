import { DEBUG_DURATION_MULTIPLIER, DEBUG_REWARD_MULTIPLIER, RARITY_MULTIPLIER } from "./constants";
import {
  getAffixEffectTotal,
  getItemAffixEffectScore,
  getMaterialResourceAffixMultipliers,
  getZoneGoldAffixBonus
} from "./affixes";
import { applyBossThreatsToSuccessChance } from "./bosses";
import { BUILDINGS, DUNGEONS, HERO_CLASSES } from "./content";
import {
  getBossSuccessPassiveBonus,
  getDurationPassiveMultiplier,
  getGoldPassiveMultiplier,
  getLootPassiveBonus,
  getNonBossSuccessPassiveBonus
} from "./heroes";
import { getFamilyDurationReduction } from "./traits";
import type { DerivedStats, DungeonDefinition, ExpeditionThreatId, GameState, HeroClassId, Item, ItemRarity, MaterialBundle, Stats } from "./types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getHeroClass(classId: HeroClassId) {
  const heroClass = HERO_CLASSES.find((entry) => entry.id === classId);
  if (!heroClass) {
    throw new Error(`Unknown hero class: ${classId}`);
  }
  return heroClass;
}

export function getDungeon(dungeonId: string): DungeonDefinition {
  const dungeon = DUNGEONS.find((entry) => entry.id === dungeonId);
  if (!dungeon) {
    throw new Error(`Unknown dungeon: ${dungeonId}`);
  }
  return dungeon;
}

export function addStats(base: Stats, addition: Partial<Stats>): Stats {
  return {
    power: base.power + (addition.power ?? 0),
    defense: base.defense + (addition.defense ?? 0),
    speed: base.speed + (addition.speed ?? 0),
    luck: base.luck + (addition.luck ?? 0),
    stamina: base.stamina + (addition.stamina ?? 0)
  };
}

export function xpToNextLevel(level: number): number {
  return Math.floor(45 * Math.pow(level, 1.55));
}

export function getDerivedStats(state: GameState): DerivedStats {
  let stats: Stats = { ...state.hero.baseStats };

  Object.values(state.equipment).forEach((item) => {
    if (item) {
      stats = addStats(stats, item.stats);
    }
  });

  stats.power += state.town.forge * 3;
  stats.defense += state.town.forge;
  stats.luck += state.town.library;
  stats.stamina += state.town.tavern * 4;
  stats.power += state.prestige.upgrades.guildLegacy * 2;
  stats.luck += state.prestige.upgrades.treasureOath;

  const powerScore =
    stats.power +
    stats.defense * 0.55 +
    stats.speed * 0.7 +
    stats.luck * 0.5 +
    stats.stamina * 0.03 +
    state.town.shrine * 2 +
    state.prestige.upgrades.guildLegacy * 2;

  return {
    ...stats,
    powerScore: Math.floor(powerScore)
  };
}

export function getPrestigeMultiplier(state: GameState): number {
  return 1 + state.prestige.upgrades.guildLegacy * 0.05;
}

export function getDurationMs(state: GameState, dungeon: DungeonDefinition): number {
  if (state.settings.debugBalance || state.mode === "debug") {
    return Math.max(5_000, Math.floor(dungeon.durationMs * DEBUG_DURATION_MULTIPLIER));
  }

  const speedUpgradeReduction = Math.min(0.4, state.prestige.upgrades.swiftCharters * 0.05);
  const speedStatReduction = Math.min(0.08, getDerivedStats(state).speed * 0.0006);
  const affixDurationReduction = Math.min(0.15, getAffixEffectTotal(state, "durationReduction"));
  const familyDurationReduction = getFamilyDurationReduction(state, dungeon.zoneId);
  const passiveMultiplier = getDurationPassiveMultiplier(state);
  const multiplier = Math.max(0.35, (1 - speedUpgradeReduction - speedStatReduction - affixDurationReduction - familyDurationReduction) * passiveMultiplier);
  return Math.max(10_000, Math.floor(dungeon.durationMs * multiplier));
}

export function getRewardMultiplier(state: GameState): number {
  const debug = state.settings.debugBalance || state.mode === "debug" ? DEBUG_REWARD_MULTIPLIER : 1;
  return debug * getPrestigeMultiplier(state);
}

export function getXpMultiplier(state: GameState): number {
  return getRewardMultiplier(state) * (1 + state.town.tavern * 0.04 + getAffixEffectTotal(state, "xpMultiplier"));
}

export function getGoldMultiplier(state: GameState, dungeon?: DungeonDefinition): number {
  return (
    getRewardMultiplier(state) *
    (1 + state.town.market * 0.05 + getAffixEffectTotal(state, "goldMultiplier") + getZoneGoldAffixBonus(state, dungeon)) *
    getGoldPassiveMultiplier(state)
  );
}

export function getMaterialMultiplier(state: GameState): number {
  return getRewardMultiplier(state) * (1 + state.town.mine * 0.08 + getAffixEffectTotal(state, "materialMultiplier"));
}

export function getSellMultiplier(state: GameState): number {
  return 1 + state.town.market * 0.1 + getAffixEffectTotal(state, "sellMultiplier");
}

export function getSuccessChance(
  state: GameState,
  dungeon: DungeonDefinition,
  options: { bossPrepCoverage?: Partial<Record<ExpeditionThreatId, number>> } = {}
): number {
  const stats = getDerivedStats(state);
  const classModifier = dungeon.classModifiers[state.hero.classId] ?? 0;
  const libraryBonus = Math.min(0.048, state.town.library * 0.004);
  const passiveBonus = dungeon.boss ? getBossSuccessPassiveBonus(state) : getNonBossSuccessPassiveBonus(state);
  const bossAttunementBonus = dungeon.boss ? state.prestige.upgrades.bossAttunement * 0.02 : 0;
  const bossAffixBonus = dungeon.boss ? getAffixEffectTotal(state, "bossSuccessChance") : 0;
  const shortMissionAffixBonus = dungeon.durationMs <= 5 * 60 * 1000 ? getAffixEffectTotal(state, "shortMissionSuccessChance") : 0;
  const baseChance = clamp(
    0.5 +
      ((stats.powerScore - dungeon.power) / dungeon.power) * 0.25 +
      stats.luck * 0.002 +
      classModifier +
      passiveBonus +
      bossAttunementBonus +
      libraryBonus +
      getAffixEffectTotal(state, "successChance") +
      bossAffixBonus +
      shortMissionAffixBonus,
    0.15,
    0.96
  );
  return applyBossThreatsToSuccessChance(state, dungeon, baseChance, options.bossPrepCoverage);
}

export function getLootChance(state: GameState, dungeon: DungeonDefinition): number {
  const stats = getDerivedStats(state);
  const longMissionBonus = dungeon.durationMs >= 30 * 60 * 1000 ? getAffixEffectTotal(state, "longMissionLootChance") : 0;
  return clamp(
    0.65 +
      dungeon.zoneIndex * 0.02 +
      stats.luck * 0.001 +
      state.prestige.upgrades.treasureOath * 0.004 +
      getLootPassiveBonus(state) +
      getAffixEffectTotal(state, "lootChance") +
      longMissionBonus,
    0.35,
    0.85
  );
}

export function getItemScore(item: Item | null): number {
  if (!item) {
    return 0;
  }
  const stats = item.stats;
  const statScore =
    (stats.power ?? 0) +
      (stats.defense ?? 0) * 0.5 +
      (stats.speed ?? 0) * 0.75 +
      (stats.luck ?? 0) * 0.6 +
      (stats.stamina ?? 0) * 0.03;
  return Math.floor(statScore + getItemAffixEffectScore(item));
}

export function getRarityMultiplier(rarity: ItemRarity): number {
  return RARITY_MULTIPLIER[rarity];
}

export function scaleMaterials(
  materials: Partial<MaterialBundle>,
  multiplier: number,
  resourceMultipliers: Partial<Record<keyof MaterialBundle, number>> = {}
): Partial<MaterialBundle> {
  const scaled: Partial<MaterialBundle> = {};
  (Object.keys(materials) as (keyof MaterialBundle)[]).forEach((key) => {
    const value = materials[key] ?? 0;
    if (value > 0) {
      scaled[key] = Math.max(1, Math.floor(value * multiplier * (resourceMultipliers[key] ?? 1)));
    }
  });
  return scaled;
}

export function getEquippedMaterialResourceMultipliers(state: GameState): Partial<Record<keyof MaterialBundle, number>> {
  return getMaterialResourceAffixMultipliers(state);
}

export function getBuildingLevelTotal(state: GameState): number {
  return BUILDINGS.reduce((total, building) => total + state.town[building.id], 0);
}
