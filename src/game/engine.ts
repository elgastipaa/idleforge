import { INVENTORY_LIMIT } from "./constants";
import { VIGOR_EXPEDITION_BOOST_COST, VIGOR_EXPEDITION_BOOST_MULTIPLIER } from "./constants";
import { DUNGEONS } from "./content";
import { refreshAchievements } from "./achievements";
import {
  clamp,
  getDerivedStats,
  getDungeon,
  getDurationMs,
  getGoldMultiplier,
  getMaterialMultiplier,
  getSuccessChance,
  getXpMultiplier,
  scaleMaterials
} from "./balance";
import { applyDailyProgress, ensureDailies } from "./dailies";
import { isDungeonUnlocked } from "./expeditions";
import { addXp } from "./heroes";
import { getBossXpPassiveMultiplier, getFailureRewardScaleBonus, getRuneGainPassiveMultiplier } from "./heroes";
import { inventoryHasSpace, maybeGenerateLoot } from "./loot";
import { createRng } from "./rng";
import { cloneState } from "./state";
import type { ActionResult, GameState, ResolveResult, RewardSummary, StartExpeditionOptions } from "./types";
import { regenerateVigor } from "./vigor";

export function startExpedition(state: GameState, dungeonId: string, now: number, options: StartExpeditionOptions = {}): ActionResult {
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

  if (!isDungeonUnlocked(state, dungeon)) {
    return { ok: false, state, error: "That dungeon is still locked." };
  }

  let next = cloneState(state);
  regenerateVigor(next, now);
  next = ensureDailies(next, now).state;

  if (options.useVigorBoost && next.vigor.current < VIGOR_EXPEDITION_BOOST_COST) {
    return { ok: false, state: next, error: "Not enough Vigor for a boost." };
  }

  if (options.useVigorBoost) {
    next.vigor.current -= VIGOR_EXPEDITION_BOOST_COST;
    next = applyDailyProgress(next, now, { spend_vigor: VIGOR_EXPEDITION_BOOST_COST }).state;
  }

  const runId = next.nextRunId;
  next.nextRunId += 1;
  next.activeExpedition = {
    dungeonId,
    runId,
    startedAt: now,
    endsAt: now + getDurationMs(next, dungeon),
    vigorBoost: Boolean(options.useVigorBoost)
  };
  next.lifetime.expeditionsStarted += 1;
  next.updatedAt = now;
  const achievements = refreshAchievements(next, now);
  return { ok: true, state: achievements.state, message: `${dungeon.name} expedition started.` };
}

export function canResolveExpedition(state: GameState, now: number): boolean {
  return Boolean(state.activeExpedition && now >= state.activeExpedition.endsAt);
}

function calculateRewards(state: GameState, success: boolean, dungeonId: string): RewardSummary {
  const dungeon = getDungeon(dungeonId);
  const vigorMultiplier = state.activeExpedition?.vigorBoost ? VIGOR_EXPEDITION_BOOST_MULTIPLIER : 1;
  const baseFailureScale = 0.35;
  const failureScale = clamp(baseFailureScale + getFailureRewardScaleBonus(state), baseFailureScale, 0.75);
  const successScale = success ? 1 : failureScale;
  const xpMultiplier = getXpMultiplier(state) * vigorMultiplier;
  const bossXpMultiplier = success && dungeon.boss ? getBossXpPassiveMultiplier(state) : 1;
  const goldMultiplier = getGoldMultiplier(state) * vigorMultiplier;
  const materialsMultiplier = getMaterialMultiplier(state) * vigorMultiplier;
  const scaledMaterials = success
    ? scaleMaterials(dungeon.materials, materialsMultiplier)
    : {
        ore: Math.max(1, Math.floor((dungeon.materials.ore ?? 0) * 0.25))
      };

  return {
    xp: Math.floor(dungeon.baseXp * successScale * xpMultiplier * bossXpMultiplier),
    gold: Math.floor(dungeon.baseGold * successScale * goldMultiplier),
    materials: scaledMaterials
  };
}

function addMaterials(state: GameState, materials: RewardSummary["materials"]) {
  const runeMultiplier = getRuneGainPassiveMultiplier(state);
  state.resources.ore += materials.ore ?? 0;
  state.resources.crystal += materials.crystal ?? 0;
  state.resources.rune += Math.floor((materials.rune ?? 0) * runeMultiplier);
  state.resources.relicFragment += materials.relicFragment ?? 0;
}

export function resolveExpedition(state: GameState, now: number): ResolveResult {
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
  const dungeon = getDungeon(active.dungeonId);
  const rng = createRng(`${prepared.seed}:${active.dungeonId}:${active.runId}`);
  const successChance = getSuccessChance(prepared, dungeon);
  const success = rng.next() <= successChance;
  const rewards = calculateRewards(prepared, success, active.dungeonId);
  let next = cloneState(prepared);
  let item = null;
  let autoSalvagedItem = null;

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
      next.lifetime.totalItemsFound += 1;
      if (item.rarity === "legendary") {
        next.lifetime.legendaryItemsFound += 1;
      }
      if (inventoryHasSpace(next)) {
        next.inventory.push(item);
      } else {
        autoSalvagedItem = item;
        const runeMultiplier = getRuneGainPassiveMultiplier(next);
        next.resources.ore += item.salvageValue.ore ?? 0;
        next.resources.crystal += item.salvageValue.crystal ?? 0;
        next.resources.rune += Math.floor((item.salvageValue.rune ?? 0) * runeMultiplier);
        next.resources.relicFragment += item.salvageValue.relicFragment ?? 0;
        next.lifetime.totalItemsSalvaged += 1;
      }
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
    defeat_boss: success && dungeon.boss ? 1 : 0
  });
  next = dailyProgress.state;
  const achievementResult = refreshAchievements(next, now);
  next = achievementResult.state;

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
      vigorBoostUsed: active.vigorBoost,
      levelUps,
      achievementsUnlocked: achievementResult.unlocked,
      combatReport
    }
  };
}

export function getInventoryCountText(state: GameState): string {
  return `${state.inventory.length}/${INVENTORY_LIMIT}`;
}
