import { DEBUG_REINCARNATION_MULTIPLIER, REINCARNATION_GATE_BOSS_ID, REINCARNATION_LEVEL_REQUIREMENT, REINCARNATION_UPGRADE_MAX } from "./constants";
import { refreshAchievements } from "./achievements";
import { DUNGEONS, HERO_CLASSES } from "./content";
import { cloneState, createEmptyDailies, createEmptyEquipment, createEmptyLootState } from "./state";
import { getHeroClass } from "./balance";
import { applyAccountXp } from "./progression";
import type { ActionResult, GameState, HeroClassId, PrestigeResult, RenownUpgrades } from "./types";

export type RenownUpgradeId = keyof RenownUpgrades;

export const CLASS_CHANGE_SOUL_MARK_COST = 3;
export const CLASS_CHANGE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const RENOWN_UPGRADES: { id: RenownUpgradeId; name: string; description: string; effectText: (level: number) => string }[] = [
  {
    id: "swiftCharters",
    name: "Echo Tempo",
    description: "Faster expedition timers make repeat runs move sooner.",
    effectText: (level) => (level <= 0 ? "No timer bonus" : `-${Math.min(40, level * 5)}% expedition duration cap contribution`)
  },
  {
    id: "guildLegacy",
    name: "Soul Prosperity",
    description: "More XP, gold, and materials make the next cycle snowball earlier.",
    effectText: (level) => (level <= 0 ? "No reward bonus" : `+${level * 5}% XP/gold/material reward multiplier`)
  },
  {
    id: "treasureOath",
    name: "Relic Wisdom",
    description: "Better loot quality and drop consistency create earlier gear spikes.",
    effectText: (level) => (level <= 0 ? "No loot bonus" : `+${(level * 0.4).toFixed(1)}% loot chance plus rarity weighting`)
  },
  {
    id: "bossAttunement",
    name: "Boss Attunement",
    description: "Steadier boss odds reduce stalls at region gates.",
    effectText: (level) => (level <= 0 ? "No boss bonus" : `+${level * 2}% boss success chance`)
  },
  {
    id: "horizonCartography",
    name: "Horizon Cartography",
    description: "Mapped distant routes make regional material economies scale across the full world.",
    effectText: (level) => (level <= 0 ? "No regional material bonus" : `+${level * 2}% regional material rewards`)
  },
  {
    id: "forgeInheritance",
    name: "Forge Inheritance",
    description: "Remembered forge technique turns salvage and crafting loops into stronger Fragment income.",
    effectText: (level) => (level <= 0 ? "No Fragment bonus" : `+${level * 3}% Fragment gains`)
  }
];

export function canPrestige(state: GameState): boolean {
  return state.hero.level >= REINCARNATION_LEVEL_REQUIREMENT && (state.dungeonClears[REINCARNATION_GATE_BOSS_ID] ?? 0) > 0;
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
    return { ok: false, state, error: `Reincarnation requires level ${REINCARNATION_LEVEL_REQUIREMENT} and a Region 3 boss clear.` };
  }

  const renownGained = calculatePrestigeRenown(state);
  let next = cloneState(state);
  const heroClass = getHeroClass(next.hero.classId);
  next.hero.level = 1;
  next.hero.xp = 0;
  next.hero.baseStats = { ...heroClass.baseStats };
  next.resources = {
    gold: 0,
    fragments: 0,
    renown: next.resources.renown + renownGained
  };
  next.inventory = [];
  next.equipment = createEmptyEquipment();
  next.loot = createEmptyLootState();
  next.activeExpedition = null;
  next.dungeonClears = {};
  Object.keys(next.bossPrep).forEach((dungeonId) => {
    next.bossPrep[dungeonId] = {
      ...next.bossPrep[dungeonId],
      prepCharges: {}
    };
  });
  next.dailies = createEmptyDailies(now);
  next.prestige.totalPrestiges += 1;
  next.prestige.renownEarned += renownGained;
  next.rebirth.totalRebirths += 1;
  next.rebirth.lastRebirthAt = now;
  next.soulMarks.current += renownGained;
  next.soulMarks.lifetimeEarned += renownGained;
  next.soulMarks.upgradesClaimed = { ...next.prestige.upgrades };
  next.soulMarks.discovered = true;
  applyAccountXp(next, 100, now);
  next.accountPersonalRecords.totalRebirths = next.rebirth.totalRebirths;
  next.updatedAt = now;
  const achievements = refreshAchievements(next, now);
  next = achievements.state;
  return { ok: true, state: next, renownGained, achievementsUnlocked: achievements.unlocked };
}

function applyHeroClass(next: GameState, classId: HeroClassId) {
  const heroClass = HERO_CLASSES.find((entry) => entry.id === classId);
  if (!heroClass) return false;
  next.hero.classId = heroClass.id;
  next.hero.baseStats = { ...heroClass.baseStats };
  return true;
}

export function changeHeroClassWithLaunchRules(state: GameState, classId: HeroClassId, now: number): ActionResult {
  if (state.hero.classId === classId) {
    return { ok: false, state, error: "That class is already selected." };
  }
  const heroClass = HERO_CLASSES.find((entry) => entry.id === classId);
  if (!heroClass) {
    return { ok: false, state, error: "Unknown hero class." };
  }

  const pristineSelection = state.lifetime.expeditionsStarted === 0 && state.hero.level === 1;
  if (pristineSelection) {
    const next = cloneState(state);
    applyHeroClass(next, classId);
    next.updatedAt = now;
    return { ok: true, state: next, message: `Class changed to ${heroClass.name}.` };
  }

  const rebirthUnlocked = canPrestige(state);
  if (!rebirthUnlocked && state.rebirth.totalRebirths === 0) {
    if (state.classChange.freeChangeUsed) {
      return { ok: false, state, error: "Your early free class change has already been used. Unlock Reincarnation to change again." };
    }
    const next = cloneState(state);
    applyHeroClass(next, classId);
    next.classChange.freeChangeUsed = true;
    next.classChange.lastChangedAt = now;
    next.updatedAt = now;
    return { ok: true, state: next, message: `Class changed to ${heroClass.name}. Early free respec used.` };
  }

  if (!rebirthUnlocked) {
    return { ok: false, state, error: `Class change now requires Reincarnation: level ${REINCARNATION_LEVEL_REQUIREMENT} and a Region 3 boss clear.` };
  }

  if (state.classChange.lastChangedAt && now - state.classChange.lastChangedAt < CLASS_CHANGE_COOLDOWN_MS) {
    const remaining = CLASS_CHANGE_COOLDOWN_MS - (now - state.classChange.lastChangedAt);
    const hours = Math.ceil(remaining / (60 * 60 * 1000));
    return { ok: false, state, error: `Class change cooldown: ${hours}h remaining.` };
  }

  const usesFreeSlot = !state.classChange.freeChangeUsed;
  const soulMarksAfterRebirth = state.resources.renown + calculatePrestigeRenown(state);
  if (!usesFreeSlot && soulMarksAfterRebirth < CLASS_CHANGE_SOUL_MARK_COST) {
    return { ok: false, state, error: `Class change costs ${CLASS_CHANGE_SOUL_MARK_COST} Soul Marks.` };
  }

  const rebirth = performPrestige(state, now);
  if (!rebirth.ok) {
    return { ok: false, state: rebirth.state, error: rebirth.error };
  }

  const next = cloneState(rebirth.state);
  if (!usesFreeSlot) {
    next.resources.renown = Math.max(0, next.resources.renown - CLASS_CHANGE_SOUL_MARK_COST);
    next.soulMarks.current = Math.max(0, next.soulMarks.current - CLASS_CHANGE_SOUL_MARK_COST);
  }
  applyHeroClass(next, classId);
  next.classChange.freeChangeUsed = true;
  next.classChange.lastChangedAt = now;
  next.updatedAt = now;
  return {
    ok: true,
    state: next,
    message: `Reincarnation complete. Class changed to ${heroClass.name}.${usesFreeSlot ? " First class change was free." : ` -${CLASS_CHANGE_SOUL_MARK_COST} Soul Marks.`}`
  };
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
  next.soulMarks.current = Math.max(0, next.soulMarks.current - cost);
  next.soulMarks.upgradesClaimed[upgradeId] = next.prestige.upgrades[upgradeId];
  next.soulMarks.discovered = true;
  next.updatedAt = now;
  return { ok: true, state: next, message: "Soul Mark upgrade purchased." };
}
