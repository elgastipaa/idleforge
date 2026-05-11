import { BUILDING_IDS, DAILY_RESET_HOUR_LOCAL, DAILY_TASK_COUNT, EMPTY_RESOURCES, EQUIPMENT_SLOTS, GAME_VERSION, VIGOR_MAX } from "./constants";
import { ACHIEVEMENTS, HERO_CLASSES } from "./content";
import type { AchievementState, BuildingState, CaravanState, DailyState, EquipmentState, GameMode, GameState, HeroClassId, LootState } from "./types";

export function createEmptyEquipment(): EquipmentState {
  return EQUIPMENT_SLOTS.reduce((equipment, slot) => {
    equipment[slot] = null;
    return equipment;
  }, {} as EquipmentState);
}

export function createEmptyTown(): BuildingState {
  return BUILDING_IDS.reduce((town, id) => {
    town[id] = 0;
    return town;
  }, {} as BuildingState);
}

export function createEmptyAchievements(): Record<string, AchievementState> {
  return ACHIEVEMENTS.reduce<Record<string, AchievementState>>((state, achievement) => {
    state[achievement.id] = { unlockedAt: null };
    return state;
  }, {});
}

export function createEmptyCaravan(): CaravanState {
  return {
    activeJob: null
  };
}

export function createEmptyLootState(): LootState {
  return {
    focusSlot: "any",
    missesSinceDrop: 0,
    recentSlots: []
  };
}

export function createEmptyDailies(now: number): DailyState {
  const date = new Date(now);
  const weeklyWindowStartAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), DAILY_RESET_HOUR_LOCAL, 0, 0, 0).getTime();
  return {
    windowStartAt: now,
    nextResetAt: now,
    tasks: Array.from({ length: DAILY_TASK_COUNT }).map((_, index) => ({
      id: `pending-${index + 1}`,
      kind: "complete_expeditions",
      role: index === 0 ? "primary" : "secondary",
      label: "Preparing daily task...",
      target: 1,
      progress: 0,
      claimed: false,
      reward: { gold: 0, materials: {}, vigor: 0 }
    })),
    lastTaskSetKey: null,
    weekly: {
      windowStartAt: weeklyWindowStartAt,
      nextResetAt: weeklyWindowStartAt,
      progress: 0,
      milestones: [
        { target: 3, claimed: false, reward: { gold: 0, materials: {}, vigor: 0 } },
        { target: 9, claimed: false, reward: { gold: 0, materials: {}, vigor: 0 } },
        { target: 15, claimed: false, reward: { gold: 0, materials: {}, vigor: 0 } }
      ]
    }
  };
}

export function createInitialState(seed: string, now: number, classId: HeroClassId = "warrior", mode: GameMode = "standard"): GameState {
  const heroClass = HERO_CLASSES.find((entry) => entry.id === classId) ?? HERO_CLASSES[0];

  return {
    version: GAME_VERSION,
    seed,
    mode,
    createdAt: now,
    updatedAt: now,
    nextRunId: 1,
    hero: {
      name: "Relic Warden",
      classId: heroClass.id,
      level: 1,
      xp: 0,
      baseStats: { ...heroClass.baseStats }
    },
    resources: { ...EMPTY_RESOURCES },
    vigor: {
      current: 40,
      max: VIGOR_MAX,
      lastTickAt: now
    },
    inventory: [],
    equipment: createEmptyEquipment(),
    loot: createEmptyLootState(),
    activeExpedition: null,
    dungeonClears: {},
    town: createEmptyTown(),
    caravan: createEmptyCaravan(),
    dailies: createEmptyDailies(now),
    achievements: createEmptyAchievements(),
    prestige: {
      totalPrestiges: 0,
      renownEarned: 0,
      upgrades: {
        guildLegacy: 0,
        swiftCharters: 0,
        treasureOath: 0,
        bossAttunement: 0
      }
    },
    lifetime: {
      expeditionsStarted: 0,
      expeditionsSucceeded: 0,
      expeditionsFailed: 0,
      bossesDefeated: 0,
      totalGoldEarned: 0,
      totalItemsFound: 0,
      totalItemsSold: 0,
      totalItemsSalvaged: 0,
      totalItemsCrafted: 0,
      totalDailyClaims: 0,
      legendaryItemsFound: 0,
      highestPowerScore: 0,
      highestLevel: 1,
      finalBossClears: 0
    },
    settings: {
      reducedMotion: false,
      debugBalance: false,
      onboardingDismissed: false,
      heroCreated: false
    }
  };
}

export function cloneState(state: GameState): GameState {
  return structuredClone(state) as GameState;
}

export function changeHeroClass(state: GameState, classId: HeroClassId, now: number): GameState {
  if (state.lifetime.expeditionsStarted > 0 || state.hero.level > 1) {
    return state;
  }

  const heroClass = HERO_CLASSES.find((entry) => entry.id === classId);
  if (!heroClass) {
    return state;
  }

  const next = cloneState(state);
  next.hero.classId = classId;
  next.hero.baseStats = { ...heroClass.baseStats };
  next.updatedAt = now;
  return next;
}
