import { FINAL_DUNGEON_ID } from "./constants";
import { ACHIEVEMENTS, DUNGEONS } from "./content";
import type { AchievementDefinition, GameState } from "./types";
import { cloneState } from "./state";

function hasCleared(state: GameState, dungeonId: string): boolean {
  return (state.dungeonClears[dungeonId] ?? 0) > 0;
}

function allBuildingsAtLeastOne(state: GameState): boolean {
  return Object.values(state.town).every((level) => level > 0);
}

function achievementIsUnlocked(state: GameState, id: string): boolean {
  return state.achievements[id]?.unlockedAt !== null && state.achievements[id]?.unlockedAt !== undefined;
}

export function getAchievementProgress(state: GameState, id: string): string {
  switch (id) {
    case "first-charter":
      return `${Math.min(1, state.lifetime.expeditionsStarted)}/1`;
    case "first-clear":
      return `${Math.min(1, state.lifetime.expeditionsSucceeded)}/1`;
    case "five-clears":
      return `${Math.min(5, state.lifetime.expeditionsSucceeded)}/5`;
    case "first-boss":
      return `${Math.min(1, state.lifetime.bossesDefeated)}/1`;
    case "sunlit-boss":
      return hasCleared(state, "copper-crown-champion") ? "1/1" : "0/1";
    case "emberwood-boss":
      return hasCleared(state, "emberwood-heart") ? "1/1" : "0/1";
    case "azure-boss":
      return hasCleared(state, "curator-of-blue-fire") ? "1/1" : "0/1";
    case "stormglass-boss":
      return hasCleared(state, "stormglass-regent") ? "1/1" : "0/1";
    case "first-forge-boss":
      return hasCleared(state, FINAL_DUNGEON_ID) ? "1/1" : "0/1";
    case "first-loot":
      return `${Math.min(1, state.lifetime.totalItemsFound)}/1`;
    case "rare-find":
      return state.inventory.some((item) => item.rarity === "rare") || Object.values(state.equipment).some((item) => item?.rarity === "rare") ? "1/1" : "0/1";
    case "epic-find":
      return state.inventory.some((item) => item.rarity === "epic") || Object.values(state.equipment).some((item) => item?.rarity === "epic") ? "1/1" : "0/1";
    case "legendary-find":
      return `${Math.min(1, state.lifetime.legendaryItemsFound)}/1`;
    case "first-sale":
      return `${Math.min(1, state.lifetime.totalItemsSold)}/1`;
    case "first-salvage":
      return `${Math.min(1, state.lifetime.totalItemsSalvaged)}/1`;
    case "first-upgrade":
      return Object.values(state.town).some((level) => level > 0) ? "1/1" : "0/1";
    case "all-buildings":
      return `${Object.values(state.town).filter((level) => level > 0).length}/6`;
    case "level-five":
      return `${Math.min(5, state.hero.level)}/5`;
    case "level-twelve":
      return `${Math.min(12, state.hero.level)}/12`;
    case "first-prestige":
      return `${Math.min(1, state.prestige.totalPrestiges)}/1`;
    default:
      return "0/1";
  }
}

export function isAchievementComplete(state: GameState, id: string): boolean {
  switch (id) {
    case "first-charter":
      return state.lifetime.expeditionsStarted >= 1;
    case "first-clear":
      return state.lifetime.expeditionsSucceeded >= 1;
    case "five-clears":
      return state.lifetime.expeditionsSucceeded >= 5;
    case "first-boss":
      return state.lifetime.bossesDefeated >= 1;
    case "sunlit-boss":
      return hasCleared(state, "copper-crown-champion");
    case "emberwood-boss":
      return hasCleared(state, "emberwood-heart");
    case "azure-boss":
      return hasCleared(state, "curator-of-blue-fire");
    case "stormglass-boss":
      return hasCleared(state, "stormglass-regent");
    case "first-forge-boss":
      return hasCleared(state, FINAL_DUNGEON_ID);
    case "first-loot":
      return state.lifetime.totalItemsFound >= 1;
    case "rare-find":
      return (
        state.inventory.some((item) => item.rarity === "rare") ||
        Object.values(state.equipment).some((item) => item?.rarity === "rare")
      );
    case "epic-find":
      return (
        state.inventory.some((item) => item.rarity === "epic") ||
        Object.values(state.equipment).some((item) => item?.rarity === "epic")
      );
    case "legendary-find":
      return state.lifetime.legendaryItemsFound >= 1;
    case "first-sale":
      return state.lifetime.totalItemsSold >= 1;
    case "first-salvage":
      return state.lifetime.totalItemsSalvaged >= 1;
    case "first-upgrade":
      return Object.values(state.town).some((level) => level > 0);
    case "all-buildings":
      return allBuildingsAtLeastOne(state);
    case "level-five":
      return state.hero.level >= 5;
    case "level-twelve":
      return state.hero.level >= 12;
    case "first-prestige":
      return state.prestige.totalPrestiges >= 1;
    default:
      return false;
  }
}

export function refreshAchievements(state: GameState, now: number): { state: GameState; unlocked: AchievementDefinition[] } {
  let next = state;
  const unlocked: AchievementDefinition[] = [];

  ACHIEVEMENTS.forEach((achievement) => {
    if (!next.achievements[achievement.id]) {
      if (next === state) {
        next = cloneState(state);
      }
      next.achievements[achievement.id] = { unlockedAt: null };
    }

    if (!achievementIsUnlocked(next, achievement.id) && isAchievementComplete(next, achievement.id)) {
      if (next === state) {
        next = cloneState(state);
      }
      next.achievements[achievement.id] = { unlockedAt: now };
      unlocked.push(achievement);
    }
  });

  return { state: next, unlocked };
}

export function getUnlockedAchievementCount(state: GameState): number {
  return ACHIEVEMENTS.filter((achievement) => achievementIsUnlocked(state, achievement.id)).length;
}

export function getBossDungeons() {
  return DUNGEONS.filter((dungeon) => dungeon.boss);
}
