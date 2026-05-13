import { EQUIPMENT_SLOTS, FOCUS_EXPEDITION_BOOST_COST } from "./constants";
import type { Affix, AffixEffects, DungeonDefinition, GameState, Item, MaterialId } from "./types";

const MATERIAL_IDS: MaterialId[] = ["ore", "crystal", "rune", "relicFragment"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getEquippedAffixes(state: GameState): Affix[] {
  return EQUIPMENT_SLOTS.flatMap((slot) => state.equipment[slot]?.affixes ?? []);
}

export function getAffixEffectTotal(state: GameState, key: keyof AffixEffects): number {
  return getEquippedAffixes(state).reduce((total, affix) => {
    const value = affix.effects?.[key];
    return total + (typeof value === "number" ? value : 0);
  }, 0);
}

export function getZoneGoldAffixBonus(state: GameState, dungeon?: DungeonDefinition): number {
  if (!dungeon) return 0;
  return getEquippedAffixes(state).reduce((total, affix) => total + (affix.effects?.zoneGoldMultiplier?.[dungeon.zoneId] ?? 0), 0);
}

export function getMaterialResourceAffixMultipliers(state: GameState): Partial<Record<MaterialId, number>> {
  return MATERIAL_IDS.reduce<Partial<Record<MaterialId, number>>>((multipliers, material) => {
    const resourceBonus = getEquippedAffixes(state).reduce((total, affix) => total + (affix.effects?.materialResourceMultiplier?.[material] ?? 0), 0);
    multipliers[material] = 1 + resourceBonus;
    return multipliers;
  }, {});
}

export function getBossRewardAffixMultiplier(state: GameState): number {
  return 1 + getAffixEffectTotal(state, "bossRewardMultiplier");
}

export function getRuneAffixMultiplier(state: GameState): number {
  return 1 + getAffixEffectTotal(state, "runeMultiplier");
}

export function getSalvageAffixMultiplier(state: GameState): number {
  return 1 + getAffixEffectTotal(state, "salvageMultiplier");
}

export function getCraftingAffixDiscount(state: GameState): number {
  return clamp(getAffixEffectTotal(state, "craftingDiscount"), 0, 0.35);
}

export function getFailureRewardAffixBonus(state: GameState): number {
  return getAffixEffectTotal(state, "failureRewardScale");
}

export function getFocusBoostCost(state: GameState): number {
  const reduction = clamp(getAffixEffectTotal(state, "focusBoostCostReduction"), 0, 0.5);
  return Math.max(5, Math.floor(FOCUS_EXPEDITION_BOOST_COST * (1 - reduction)));
}

export function getItemAffixEffectScore(item: Item | null): number {
  if (!item) return 0;

  const score = item.affixes.reduce((total, affix) => {
    const effects = affix.effects ?? {};
    const zoneGoldScore = Object.values(effects.zoneGoldMultiplier ?? {}).reduce((sum, value) => sum + value * 70, 0);
    const materialResourceScore = Object.values(effects.materialResourceMultiplier ?? {}).reduce((sum, value) => sum + value * 85, 0);

    return (
      total +
      zoneGoldScore +
      materialResourceScore +
      (effects.xpMultiplier ?? 0) * 100 +
      (effects.goldMultiplier ?? 0) * 95 +
      (effects.materialMultiplier ?? 0) * 105 +
      (effects.rareDropChance ?? 0) * 460 +
      (effects.lootChance ?? 0) * 330 +
      (effects.bossRewardMultiplier ?? 0) * 120 +
      (effects.successChance ?? 0) * 360 +
      (effects.bossSuccessChance ?? 0) * 280 +
      (effects.shortMissionSuccessChance ?? 0) * 240 +
      (effects.longMissionLootChance ?? 0) * 270 +
      (effects.craftingDiscount ?? 0) * 90 +
      (effects.focusBoostCostReduction ?? 0) * 75 +
      (effects.sellMultiplier ?? 0) * 55 +
      (effects.salvageMultiplier ?? 0) * 65 +
      (effects.runeMultiplier ?? 0) * 95 +
      (effects.durationReduction ?? 0) * 260 +
      (effects.failureRewardScale ?? 0) * 180
    );
  }, 0);

  return Math.floor(score);
}
