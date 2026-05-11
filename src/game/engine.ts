import { INVENTORY_LIMIT } from "./constants";
import { VIGOR_EXPEDITION_BOOST_MULTIPLIER } from "./constants";
import {
  getBossRewardAffixMultiplier,
  getFailureRewardAffixBonus,
  getItemAffixEffectScore,
  getRuneAffixMultiplier,
  getSalvageAffixMultiplier,
  getVigorBoostCost
} from "./affixes";
import { DUNGEONS, ZONES } from "./content";
import { refreshAchievements } from "./achievements";
import {
  clamp,
  getDerivedStats,
  getDungeon,
  getDurationMs,
  getEquippedMaterialResourceMultipliers,
  getGoldMultiplier,
  getItemScore,
  getMaterialMultiplier,
  getSuccessChance,
  getXpMultiplier,
  scaleMaterials
} from "./balance";
import { applyDailyProgress, ensureDailies } from "./dailies";
import { isDungeonUnlocked } from "./expeditions";
import { addXp } from "./heroes";
import { getBossXpPassiveMultiplier, getFailureRewardScaleBonus, getRuneGainPassiveMultiplier } from "./heroes";
import { inventoryHasSpace, maybeGenerateLoot, recordLootDrop, recordLootMiss } from "./loot";
import { createRng } from "./rng";
import { cloneState } from "./state";
import type { ActionResult, DungeonDefinition, GameState, Item, ItemComparisonSummary, ResolveExpeditionOptions, ResolveResult, RewardSummary } from "./types";
import { regenerateVigor } from "./vigor";

export function startExpedition(state: GameState, dungeonId: string, now: number): ActionResult {
  const dungeon = DUNGEONS.find((entry) => entry.id === dungeonId);
  if (!dungeon) {
    return { ok: false, state, error: "Unknown dungeon." };
  }

  if (!state.settings.heroCreated) {
    return { ok: false, state, error: "Create your hero before starting expeditions." };
  }

  if (state.activeExpedition) {
    return { ok: false, state, error: "An expedition is already underway." };
  }

  if (state.caravan.activeJob) {
    return { ok: false, state, error: "Cancel the active Caravan before starting a new expedition." };
  }

  if (!isDungeonUnlocked(state, dungeon)) {
    return { ok: false, state, error: "That dungeon is still locked." };
  }

  let next = cloneState(state);
  regenerateVigor(next, now);
  next = ensureDailies(next, now).state;

  const runId = next.nextRunId;
  next.nextRunId += 1;
  next.activeExpedition = {
    dungeonId,
    runId,
    startedAt: now,
    endsAt: now + getDurationMs(next, dungeon),
    vigorBoost: false
  };
  next.lifetime.expeditionsStarted += 1;
  next.updatedAt = now;
  const achievements = refreshAchievements(next, now);
  return { ok: true, state: achievements.state, message: `${dungeon.name} expedition started.` };
}

export function canResolveExpedition(state: GameState, now: number): boolean {
  return Boolean(state.activeExpedition && now >= state.activeExpedition.endsAt);
}

function calculateRewards(state: GameState, success: boolean, dungeonId: string, vigorBoostUsed: boolean): RewardSummary {
  const dungeon = getDungeon(dungeonId);
  const vigorMultiplier = vigorBoostUsed ? VIGOR_EXPEDITION_BOOST_MULTIPLIER : 1;
  const baseFailureScale = 0.35;
  const failureScale = clamp(baseFailureScale + getFailureRewardScaleBonus(state) + getFailureRewardAffixBonus(state), baseFailureScale, 0.75);
  const successScale = success ? 1 : failureScale;
  const xpMultiplier = getXpMultiplier(state) * vigorMultiplier;
  const bossXpMultiplier = success && dungeon.boss ? getBossXpPassiveMultiplier(state) : 1;
  const goldMultiplier = getGoldMultiplier(state, dungeon) * vigorMultiplier;
  const materialsMultiplier = getMaterialMultiplier(state) * vigorMultiplier;
  const bossRewardMultiplier = success && dungeon.boss ? getBossRewardAffixMultiplier(state) : 1;
  const scaledMaterials = success
    ? scaleMaterials(dungeon.materials, materialsMultiplier * bossRewardMultiplier, getEquippedMaterialResourceMultipliers(state))
    : {
        ore: Math.max(1, Math.floor((dungeon.materials.ore ?? 0) * 0.25))
      };

  return {
    xp: Math.floor(dungeon.baseXp * successScale * xpMultiplier * bossXpMultiplier * bossRewardMultiplier),
    gold: Math.floor(dungeon.baseGold * successScale * goldMultiplier * bossRewardMultiplier),
    materials: scaledMaterials
  };
}

function addMaterials(state: GameState, materials: RewardSummary["materials"]) {
  const runeMultiplier = getRuneGainPassiveMultiplier(state) * getRuneAffixMultiplier(state);
  state.resources.ore += materials.ore ?? 0;
  state.resources.crystal += materials.crystal ?? 0;
  state.resources.rune += Math.floor((materials.rune ?? 0) * runeMultiplier);
  state.resources.relicFragment += materials.relicFragment ?? 0;
}

function addSalvagedItemResources(state: GameState, item: Item) {
  const salvageMultiplier = getSalvageAffixMultiplier(state);
  const runeMultiplier = getRuneGainPassiveMultiplier(state) * getRuneAffixMultiplier(state);
  state.resources.ore += Math.floor((item.salvageValue.ore ?? 0) * salvageMultiplier);
  state.resources.crystal += Math.floor((item.salvageValue.crystal ?? 0) * salvageMultiplier);
  state.resources.rune += Math.floor((item.salvageValue.rune ?? 0) * salvageMultiplier * runeMultiplier);
  state.resources.relicFragment += Math.floor((item.salvageValue.relicFragment ?? 0) * salvageMultiplier);
}

function getUnlockedDungeonIds(state: GameState): Set<string> {
  return new Set(DUNGEONS.filter((dungeon) => isDungeonUnlocked(state, dungeon)).map((dungeon) => dungeon.id));
}

function getNewlyUnlockedDungeons(before: GameState, after: GameState): DungeonDefinition[] {
  const beforeIds = getUnlockedDungeonIds(before);
  return DUNGEONS.filter((dungeon) => !beforeIds.has(dungeon.id) && isDungeonUnlocked(after, dungeon));
}

function getNewlyUnlockedZones(before: GameState, unlockedDungeons: DungeonDefinition[]) {
  const beforeZoneIds = new Set(DUNGEONS.filter((dungeon) => isDungeonUnlocked(before, dungeon)).map((dungeon) => dungeon.zoneId));
  const newlyUnlockedZoneIds = new Set(unlockedDungeons.map((dungeon) => dungeon.zoneId).filter((zoneId) => !beforeZoneIds.has(zoneId)));
  return ZONES.filter((zone) => newlyUnlockedZoneIds.has(zone.id));
}

function summarizeItemComparison(state: GameState, item: Item | null): ItemComparisonSummary | null {
  if (!item) {
    return null;
  }

  const equipped = state.equipment[item.slot];
  const equippedScore = getItemScore(equipped);
  const itemScore = getItemScore(item);
  const delta = itemScore - equippedScore;
  const statDeltas: Partial<Record<keyof Item["stats"], number>> = {};
  (["power", "defense", "speed", "luck", "stamina"] as const).forEach((stat) => {
    const value = (item.stats[stat] ?? 0) - (equipped?.stats[stat] ?? 0);
    if (value !== 0) {
      statDeltas[stat] = value;
    }
  });
  return {
    equippedItemId: equipped?.id ?? null,
    equippedItemName: equipped?.name ?? null,
    equippedScore,
    itemScore,
    delta,
    statDeltas,
    effectScoreDelta: getItemAffixEffectScore(item) - getItemAffixEffectScore(equipped),
    isBetter: delta > 0
  };
}

export function resolveExpedition(state: GameState, now: number, options: ResolveExpeditionOptions = {}): ResolveResult {
  let prepared = cloneState(state);
  regenerateVigor(prepared, now);
  prepared = ensureDailies(prepared, now).state;

  if (!prepared.activeExpedition) {
    return { ok: false, state: prepared, error: "No expedition is active." };
  }

  if (now < prepared.activeExpedition.endsAt) {
    return { ok: false, state: prepared, error: "The expedition is not complete yet." };
  }

  const active = prepared.activeExpedition;
  const useVigorBoost = Boolean(options.useVigorBoost);
  const vigorBoostCost = getVigorBoostCost(prepared);
  if (useVigorBoost && prepared.vigor.current < vigorBoostCost) {
    return { ok: false, state: prepared, error: "Not enough Vigor for a boost." };
  }
  const dungeon = getDungeon(active.dungeonId);
  const rng = createRng(`${prepared.seed}:${active.dungeonId}:${active.runId}`);
  const successChance = getSuccessChance(prepared, dungeon);
  const success = rng.next() <= successChance;
  const rewards = calculateRewards(prepared, success, active.dungeonId, useVigorBoost);
  const bossFirstClear = success && dungeon.boss && (prepared.dungeonClears[dungeon.id] ?? 0) === 0;
  let next = cloneState(prepared);
  let item = null;
  let autoSalvagedItem = null;

  if (useVigorBoost) {
    next.vigor.current -= vigorBoostCost;
  }

  next.activeExpedition = null;
  next.resources.gold += rewards.gold;
  next.lifetime.totalGoldEarned += rewards.gold;
  addMaterials(next, rewards.materials);

  const { levelUps } = addXp(next, rewards.xp);

  if (success) {
    next.dungeonClears[dungeon.id] = (next.dungeonClears[dungeon.id] ?? 0) + 1;
    next.lifetime.expeditionsSucceeded += 1;
    if (dungeon.boss) {
      next.lifetime.bossesDefeated += 1;
    }
    if (dungeon.id === "crown-of-the-first-forge") {
      next.lifetime.finalBossClears += 1;
    }
    item = maybeGenerateLoot(next, dungeon, rng, active.runId, { forceDrop: dungeon.boss, bossBonus: dungeon.boss });
    if (item) {
      recordLootDrop(next, item.slot);
      next.lifetime.totalItemsFound += 1;
      if (item.rarity === "legendary") {
        next.lifetime.legendaryItemsFound += 1;
      }
      if (inventoryHasSpace(next)) {
        next.inventory.push(item);
      } else {
        autoSalvagedItem = item;
        addSalvagedItemResources(next, item);
        next.lifetime.totalItemsSalvaged += 1;
      }
    } else {
      recordLootMiss(next);
    }
  } else {
    next.lifetime.expeditionsFailed += 1;
  }

  const powerScore = getDerivedStats(next).powerScore;
  if (powerScore > next.lifetime.highestPowerScore) {
    next.lifetime.highestPowerScore = powerScore;
  }

  next.updatedAt = now;
  const dailyProgress = applyDailyProgress(next, now, {
    complete_expeditions: 1,
    win_expeditions: success ? 1 : 0,
    defeat_boss: success && dungeon.boss ? 1 : 0,
    spend_vigor: useVigorBoost ? vigorBoostCost : 0
  });
  next = dailyProgress.state;
  const achievementResult = refreshAchievements(next, now);
  next = achievementResult.state;
  const unlockedDungeons = getNewlyUnlockedDungeons(prepared, next);
  const unlockedZones = getNewlyUnlockedZones(prepared, unlockedDungeons);

  const combatReport = success
    ? `${next.hero.name} cleared ${dungeon.name} with ${Math.floor(successChance * 100)}% success odds.`
    : `${next.hero.name} retreated from ${dungeon.name} and salvaged what they could.`;

  return {
    ok: true,
    state: next,
    summary: {
      success,
      dungeon,
      rewards,
      item,
      autoSalvagedItem,
      itemComparison: summarizeItemComparison(prepared, item),
      vigorBoostUsed: useVigorBoost,
      levelUps,
      bossClear: success && dungeon.boss,
      bossFirstClear,
      firstGuaranteedWeapon: success && prepared.lifetime.totalItemsFound === 0 && dungeon.id === "tollroad-of-trinkets" && item?.slot === "weapon",
      unlockedDungeons,
      unlockedZones,
      achievementsUnlocked: achievementResult.unlocked,
      combatReport
    }
  };
}

export function getInventoryCountText(state: GameState): string {
  return `${state.inventory.length}/${INVENTORY_LIMIT}`;
}
