import { LEVEL_CAP } from "./constants";
import { getHeroClass, xpToNextLevel } from "./balance";
import type { GameState } from "./types";

export function addXp(state: GameState, xp: number): { levelUps: number[] } {
  const levelUps: number[] = [];
  state.hero.xp += xp;

  while (state.hero.level < LEVEL_CAP && state.hero.xp >= xpToNextLevel(state.hero.level)) {
    state.hero.xp -= xpToNextLevel(state.hero.level);
    state.hero.level += 1;
    const growth = getHeroClass(state.hero.classId).growth;
    state.hero.baseStats.power += growth.power;
    state.hero.baseStats.defense += growth.defense;
    state.hero.baseStats.speed += growth.speed;
    state.hero.baseStats.luck += growth.luck;
    state.hero.baseStats.stamina += growth.stamina;
    levelUps.push(state.hero.level);
  }

  if (state.hero.level > state.lifetime.highestLevel) {
    state.lifetime.highestLevel = state.hero.level;
  }

  return { levelUps };
}

function hasLevelPassive(state: GameState, minimumLevel: 5 | 10 | 15): boolean {
  return state.hero.level >= minimumLevel;
}

export function getBossSuccessPassiveBonus(state: GameState): number {
  if (state.hero.classId === "warrior" && hasLevelPassive(state, 5)) {
    return 0.05;
  }
  return 0;
}

export function getNonBossSuccessPassiveBonus(state: GameState): number {
  if (state.hero.classId === "mage" && hasLevelPassive(state, 10)) {
    return 0.05;
  }
  return 0;
}

export function getFailureRewardScaleBonus(state: GameState): number {
  if (state.hero.classId === "warrior" && hasLevelPassive(state, 10)) {
    // Base failure scale is 0.35, and this passive removes 10% of the 0.65 penalty.
    return 0.065;
  }
  return 0;
}

export function getBossXpPassiveMultiplier(state: GameState): number {
  if (state.hero.classId === "warrior" && hasLevelPassive(state, 15)) {
    return 1.08;
  }
  return 1;
}

export function getGoldPassiveMultiplier(state: GameState): number {
  if (state.hero.classId === "rogue" && hasLevelPassive(state, 5)) {
    return 1.08;
  }
  return 1;
}

export function getLootPassiveBonus(state: GameState): number {
  if (state.hero.classId === "rogue" && hasLevelPassive(state, 10)) {
    return 0.06;
  }
  return 0;
}

export function getDurationPassiveMultiplier(state: GameState): number {
  if (state.hero.classId === "rogue" && hasLevelPassive(state, 15)) {
    return 0.92;
  }
  return 1;
}

export function getCraftMaterialDiscount(state: GameState): number {
  if (state.hero.classId === "mage" && hasLevelPassive(state, 5)) {
    return 0.08;
  }
  return 0;
}

export function getFragmentGainPassiveMultiplier(state: GameState): number {
  const classMultiplier = state.hero.classId === "mage" && hasLevelPassive(state, 15) ? 1.1 : 1;
  return classMultiplier * (1 + state.prestige.upgrades.forgeInheritance * 0.03);
}
