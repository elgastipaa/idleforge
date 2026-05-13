import { FINAL_DUNGEON_ID, REINCARNATION_GATE_BOSS_ID, REINCARNATION_LEVEL_REQUIREMENT } from "./constants";
import { BUILDINGS, DUNGEONS, ZONES } from "./content";
import { getDerivedStats, getDungeon, getDurationMs, getItemScore, getSuccessChance } from "./balance";
import { canAfford, getBuildingCost } from "./town";
import { getFirstClaimableMasteryRoute } from "./progression";
import type { DungeonDefinition, GameState, Item, ResourceState } from "./types";

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

function formatGoalDuration(ms: number): string {
  const seconds = Math.max(1, Math.ceil(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  return `${Math.ceil(seconds / 60)}m`;
}

function getBestBetterInventoryItem(state: GameState): { item: Item; delta: number } | null {
  return state.inventory.reduce<{ item: Item; delta: number } | null>((best, item) => {
    const delta = getItemScore(item) - getItemScore(state.equipment[item.slot]);
    if (delta <= 0) return best;
    if (!best || delta > best.delta) return { item, delta };
    return best;
  }, null);
}

function getAllItems(state: GameState): Item[] {
  return [...state.inventory, ...(Object.values(state.equipment).filter(Boolean) as Item[])];
}

function hasAnyItemUpgrade(state: GameState): boolean {
  return getAllItems(state).some((item) => item.upgradeLevel > 0);
}

function hasAnyTownUpgrade(state: GameState): boolean {
  return BUILDINGS.some((building) => state.town[building.id] > 0);
}

function canAffordLocal(resources: GameState["resources"], cost: Partial<ResourceState>): boolean {
  return (Object.keys(cost) as (keyof ResourceState)[]).every((resource) => resources[resource] >= (cost[resource] ?? 0));
}

function getStarterUpgradeCost(item: Item): Partial<ResourceState> {
  return {
    gold: Math.floor(40 * Math.pow(1.45, item.upgradeLevel) + item.itemLevel * 12),
    ore: Math.floor(4 * Math.pow(1.4, item.upgradeLevel) + item.itemLevel * 0.6),
    crystal: Math.max(0, Math.floor(item.itemLevel * 0.2 + item.upgradeLevel))
  };
}

function getAffordableGearUpgradeCandidate(state: GameState): Item | null {
  return getAllItems(state).find((item) => item.upgradeLevel < 10 && canAffordLocal(state.resources, getStarterUpgradeCost(item))) ?? null;
}

function getAffordableTownBuilding(state: GameState) {
  return BUILDINGS.find((building) => state.town[building.id] < building.maxLevel && canAfford(state.resources, getBuildingCost(state, building.id))) ?? null;
}

function getBestUnlockedDungeon(state: GameState): DungeonDefinition {
  const unlocked = DUNGEONS.filter((dungeon) => isDungeonUnlocked(state, dungeon));
  if (unlocked.length === 0) return DUNGEONS[0];
  return unlocked.reduce((best, current) => (current.lootLevel > best.lootLevel ? current : best), unlocked[0]);
}

function canAffordStarterCraft(state: GameState): boolean {
  const level = getBestUnlockedDungeon(state).lootLevel;
  return canAffordLocal(state.resources, {
    gold: Math.floor(45 + level * 12),
    ore: Math.floor(3 + level * 0.7),
    crystal: Math.max(0, Math.floor((level - 8) * 0.45))
  });
}

export function getNextGoal(state: GameState): string {
  if (!state.settings.heroCreated) {
    return "Create your hero to open the first expedition.";
  }

  if ((state.dungeonClears[REINCARNATION_GATE_BOSS_ID] ?? 0) > 0 && state.hero.level >= REINCARNATION_LEVEL_REQUIREMENT) {
    return "Reincarnation is ready. Spend Soul Marks in the Reincarnation tab.";
  }

  const active = state.activeExpedition ? getDungeon(state.activeExpedition.dungeonId) : null;
  if (active) {
    return `Finish ${active.name}.`;
  }

  if (state.caravan.activeJob) {
    return "Caravan is active. Wait for it to finish or cancel it from Expeditions.";
  }

  const firstDungeon = DUNGEONS[0];
  if (!hasClearedDungeon(state, firstDungeon.id)) {
    return `Start ${firstDungeon.name}; first loot arrives in ${formatGoalDuration(getDurationMs(state, firstDungeon))}.`;
  }

  const claimableMastery = getFirstClaimableMasteryRoute(state);
  if (claimableMastery) {
    return `Claim ${claimableMastery.tier.label} for ${claimableMastery.dungeon.name}.`;
  }

  const betterItem = getBestBetterInventoryItem(state);
  if (betterItem) {
    return `Equip ${betterItem.item.name} for +${betterItem.delta} gear power.`;
  }

  const upgradeCandidate = getAffordableGearUpgradeCandidate(state);
  if (!hasAnyItemUpgrade(state) && upgradeCandidate) {
    return `Upgrade ${upgradeCandidate.name} in the Forge for a visible Power bump.`;
  }

  const nextUncleared = getAvailableDungeons(state).find((dungeon) => !hasClearedDungeon(state, dungeon.id));
  if (!hasAnyItemUpgrade(state) && getAllItems(state).length > 0 && nextUncleared) {
    return `Clear ${nextUncleared.name} for ore to upgrade your gear.`;
  }

  const affordableBuilding = getAffordableTownBuilding(state);
  if (!hasAnyTownUpgrade(state) && affordableBuilding) {
    return `Upgrade the ${affordableBuilding.name} in Town to strengthen future runs.`;
  }

  if (!hasAnyTownUpgrade(state) && nextUncleared) {
    return `Clear ${nextUncleared.name} for your first Town upgrade.`;
  }

  const firstBoss = DUNGEONS.find((dungeon) => dungeon.boss);
  if (firstBoss && !hasClearedDungeon(state, firstBoss.id)) {
    if (isDungeonUnlocked(state, firstBoss)) {
      return `Challenge ${firstBoss.name}, the first boss milestone.`;
    }
    return `Unlock ${firstBoss.name}: ${getUnlockText(state, firstBoss)}`;
  }

  if (state.lifetime.totalItemsCrafted === 0) {
    if (canAffordStarterCraft(state)) {
      return "Craft a new item in the Forge with your boss rewards.";
    }
    return "Run the latest dungeon for the gold and ore needed to craft.";
  }

  if ((state.dungeonClears[FINAL_DUNGEON_ID] ?? 0) > 0) {
    return "Final forge cleared. Push levels and prepare for reincarnation.";
  }

  const nextLocked = getNextLockedDungeon(state);
  if (nextLocked) {
    return getUnlockText(state, nextLocked);
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
