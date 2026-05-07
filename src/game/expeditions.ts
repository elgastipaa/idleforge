import { FINAL_DUNGEON_ID, REINCARNATION_GATE_BOSS_ID } from "./constants";
import { DUNGEONS, ZONES } from "./content";
import { getDerivedStats, getDungeon, getDurationMs, getSuccessChance } from "./balance";
import type { DungeonDefinition, GameState } from "./types";

export function getZoneForDungeon(dungeon: DungeonDefinition) {
  return ZONES.find((zone) => zone.id === dungeon.zoneId) ?? ZONES[0];
}

export function hasClearedDungeon(state: GameState, dungeonId: string): boolean {
  return (state.dungeonClears[dungeonId] ?? 0) > 0;
}

export function isDungeonUnlocked(state: GameState, dungeon: DungeonDefinition): boolean {
  if (state.hero.level < dungeon.minLevel) {
    return false;
  }

  if (!dungeon.previousDungeonId) {
    return true;
  }

  return hasClearedDungeon(state, dungeon.previousDungeonId);
}

export function getUnlockText(state: GameState, dungeon: DungeonDefinition): string {
  if (isDungeonUnlocked(state, dungeon)) {
    return "Unlocked";
  }

  if (state.hero.level < dungeon.minLevel) {
    return `Reach level ${dungeon.minLevel}.`;
  }

  if (dungeon.previousDungeonId) {
    const previous = getDungeon(dungeon.previousDungeonId);
    return `Clear ${previous.name}.`;
  }

  return "Progress further through the guild charter.";
}

export function getAvailableDungeons(state: GameState): DungeonDefinition[] {
  return DUNGEONS.filter((dungeon) => isDungeonUnlocked(state, dungeon));
}

export function getNextLockedDungeon(state: GameState): DungeonDefinition | null {
  return DUNGEONS.find((dungeon) => !isDungeonUnlocked(state, dungeon)) ?? null;
}

export function getNextGoal(state: GameState): string {
  if ((state.dungeonClears[REINCARNATION_GATE_BOSS_ID] ?? 0) > 0 && state.hero.level >= 18) {
    return "Reincarnation is ready. Spend Soul Marks in the Reincarnation tab.";
  }

  const active = state.activeExpedition ? getDungeon(state.activeExpedition.dungeonId) : null;
  if (active) {
    return `Finish ${active.name}.`;
  }

  const nextLocked = getNextLockedDungeon(state);
  if (nextLocked) {
    return getUnlockText(state, nextLocked);
  }

  if ((state.dungeonClears[FINAL_DUNGEON_ID] ?? 0) > 0) {
    return "Final forge cleared. Push levels and prepare for reincarnation.";
  }

  return "Push deeper into the regions and clear boss milestones.";
}

export function getDungeonView(state: GameState, dungeon: DungeonDefinition) {
  const durationMs = getDurationMs(state, dungeon);
  const successChance = getSuccessChance(state, dungeon);
  const stats = getDerivedStats(state);
  return {
    dungeon,
    durationMs,
    successChance,
    unlocked: isDungeonUnlocked(state, dungeon),
    unlockText: getUnlockText(state, dungeon),
    clears: state.dungeonClears[dungeon.id] ?? 0,
    powerDelta: stats.powerScore - dungeon.power
  };
}
