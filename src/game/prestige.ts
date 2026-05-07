import { DEBUG_REINCARNATION_MULTIPLIER, REINCARNATION_GATE_BOSS_ID, REINCARNATION_UPGRADE_MAX } from "./constants";
import { refreshAchievements } from "./achievements";
import { DUNGEONS } from "./content";
import { cloneState, createEmptyDailies, createEmptyEquipment, createEmptyTown } from "./state";
import { getHeroClass } from "./balance";
import type { ActionResult, GameState, PrestigeResult, RenownUpgrades } from "./types";

export type RenownUpgradeId = keyof RenownUpgrades;

export const RENOWN_UPGRADES: { id: RenownUpgradeId; name: string; description: string }[] = [
  { id: "swiftCharters", name: "Echo Tempo", description: "Faster expedition timers for every new run." },
  { id: "guildLegacy", name: "Soul Prosperity", description: "Higher XP and resource gains each cycle." },
  { id: "treasureOath", name: "Relic Wisdom", description: "Better loot quality and drop consistency." },
  { id: "bossAttunement", name: "Boss Attunement", description: "Steadier success odds against boss milestones." }
];

export function canPrestige(state: GameState): boolean {
  return state.hero.level >= 18 && (state.dungeonClears[REINCARNATION_GATE_BOSS_ID] ?? 0) > 0;
}

export function calculatePrestigeRenown(state: GameState): number {
  const highestRegion = DUNGEONS.reduce((highest, dungeon) => {
    if ((state.dungeonClears[dungeon.id] ?? 0) > 0) {
      return Math.max(highest, dungeon.zoneIndex);
    }
    return highest;
  }, 1);
  const bossClears = DUNGEONS.filter((dungeon) => dungeon.boss).reduce((count, dungeon) => count + (state.dungeonClears[dungeon.id] ?? 0), 0);
  const base = Math.max(1, Math.floor(highestRegion * 2 + bossClears + state.hero.level / 4));
  const shrineBonus = 1 + state.town.shrine * 0.04;
  const withShrine = Math.max(1, Math.floor(base * shrineBonus));
  if (state.settings.debugBalance || state.mode === "debug") {
    return Math.max(1, Math.floor(withShrine * DEBUG_REINCARNATION_MULTIPLIER));
  }
  return withShrine;
}

export function performPrestige(state: GameState, now: number): PrestigeResult {
  if (!canPrestige(state)) {
    return { ok: false, state, error: "Reincarnation requires level 18 and a Region 3 boss clear." };
  }

  const renownGained = calculatePrestigeRenown(state);
  let next = cloneState(state);
  const heroClass = getHeroClass(next.hero.classId);
  next.hero.level = 1;
  next.hero.xp = 0;
  next.hero.baseStats = { ...heroClass.baseStats };
  next.resources = {
    gold: 0,
    ore: 0,
    crystal: 0,
    rune: 0,
    relicFragment: 0,
    renown: next.resources.renown + renownGained
  };
  next.vigor.current = 40;
  next.vigor.lastTickAt = now;
  next.inventory = [];
  next.equipment = createEmptyEquipment();
  next.activeExpedition = null;
  next.dungeonClears = {};
  next.town = createEmptyTown();
  next.dailies = createEmptyDailies(now);
  next.prestige.totalPrestiges += 1;
  next.prestige.renownEarned += renownGained;
  next.updatedAt = now;
  const achievements = refreshAchievements(next, now);
  next = achievements.state;
  return { ok: true, state: next, renownGained, achievementsUnlocked: achievements.unlocked };
}

export function getRenownUpgradeCost(state: GameState, upgradeId: RenownUpgradeId): number {
  return state.prestige.upgrades[upgradeId] + 1;
}

export function buyRenownUpgrade(state: GameState, upgradeId: RenownUpgradeId, now: number): ActionResult {
  const current = state.prestige.upgrades[upgradeId];
  if (current >= REINCARNATION_UPGRADE_MAX) {
    return { ok: false, state, error: "That Soul Mark upgrade is already maxed." };
  }

  const cost = getRenownUpgradeCost(state, upgradeId);
  if (state.resources.renown < cost) {
    return { ok: false, state, error: "Not enough Soul Marks." };
  }

  const next = cloneState(state);
  next.resources.renown -= cost;
  next.prestige.upgrades[upgradeId] += 1;
  next.updatedAt = now;
  return { ok: true, state: next, message: "Renown upgrade purchased." };
}
