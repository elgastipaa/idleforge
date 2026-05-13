import { BUILDING_IDS, DAILY_RESET_HOUR_LOCAL, EMPTY_RESOURCES, EQUIPMENT_SLOTS, GAME_VERSION, FOCUS_MAX } from "./constants";
import { ACHIEVEMENTS, HERO_CLASSES } from "./content";
import type {
  AccountPersonalRecords,
  AccountRankState,
  AccountShowcaseState,
  AchievementState,
  BuildingState,
  CaravanState,
  ClassChangeState,
  ConstructionState,
  DailyFocusState,
  DailyState,
  EquipmentState,
  GameMode,
  GameState,
  HeroClassId,
  LootState,
  RebirthState,
  RegionMaterialId,
  RegionProgressState,
  RenownUpgrades,
  SoulMarksState,
  TitleState,
  WeeklyQuestState
} from "./types";

const REGION_MATERIAL_IDS: RegionMaterialId[] = ["sunlitTimber", "emberResin", "archiveGlyph", "stormglassShard", "oathEmber"];

function getLocalDateKey(now: number): string {
  const date = new Date(now);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createEmptyRenownUpgrades(): RenownUpgrades {
  return {
    guildLegacy: 0,
    swiftCharters: 0,
    treasureOath: 0,
    bossAttunement: 0
  };
}

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
    tasks: [],
    lastTaskSetKey: null,
    weekly: {
      windowStartAt: weeklyWindowStartAt,
      nextResetAt: weeklyWindowStartAt,
      progress: 0,
      milestones: [
        { target: 3, claimed: false, reward: { gold: 0, materials: {}, focus: 0, accountXp: 0, regionalMaterials: {}, fragments: 0 } },
        { target: 9, claimed: false, reward: { gold: 0, materials: {}, focus: 0, accountXp: 0, regionalMaterials: {}, fragments: 0 } },
        { target: 15, claimed: false, reward: { gold: 0, materials: {}, focus: 0, accountXp: 0, regionalMaterials: {}, fragments: 0 } }
      ]
    }
  };
}

export function createEmptyAccountRank(): AccountRankState {
  return {
    accountXp: 0,
    accountRank: 1,
    claimedRankRewards: []
  };
}

export function createEmptyRebirth(): RebirthState {
  return {
    totalRebirths: 0,
    lastRebirthAt: null,
    classChangesUsedFreeSlot: false
  };
}

export function createEmptySoulMarks(): SoulMarksState {
  return {
    current: 0,
    lifetimeEarned: 0,
    upgradesClaimed: createEmptyRenownUpgrades(),
    discovered: false
  };
}

export function createEmptyAccountShowcase(): AccountShowcaseState {
  return {
    selectedTitleId: null,
    pinnedTrophyIds: [],
    favoriteRegionId: null,
    featuredBossId: null,
    featuredFamilyId: null,
    accountSignatureMode: "auto",
    firstDiscoveryPopupShown: false,
    firstDiscoveryPopupDismissed: false
  };
}

export function createEmptyAccountPersonalRecords(): AccountPersonalRecords {
  return {
    lifetimeExpeditionsCompleted: 0,
    lifetimeBossesDefeated: 0,
    highestPowerReached: 0,
    highestAccountRankReached: 1,
    totalRebirths: 0,
    totalMasteryTiersClaimed: 0,
    totalCollectionsCompleted: 0,
    legendaryTraitsDiscovered: 0
  };
}

export function createEmptyTitles(): Record<string, TitleState> {
  return {};
}

export function createEmptyDailyFocus(now: number): DailyFocusState {
  return {
    date: getLocalDateKey(now),
    focusChargesBanked: 1,
    focusChargeProgress: 0
  };
}

export function createEmptyWeeklyQuest(now: number): WeeklyQuestState {
  const date = new Date(now);
  const resetCandidate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), DAILY_RESET_HOUR_LOCAL, 0, 0, 0).getTime();
  const dailyWindowStartAt =
    now >= resetCandidate
      ? resetCandidate
      : new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, DAILY_RESET_HOUR_LOCAL, 0, 0, 0).getTime();
  const dailyWindowStart = new Date(dailyWindowStartAt);
  const daysSinceMonday = (dailyWindowStart.getDay() + 6) % 7;
  const weekStartAt = new Date(
    dailyWindowStart.getFullYear(),
    dailyWindowStart.getMonth(),
    dailyWindowStart.getDate() - daysSinceMonday,
    DAILY_RESET_HOUR_LOCAL,
    0,
    0,
    0
  ).getTime();
  const weekStartDate = getLocalDateKey(weekStartAt);
  return {
    weekStartDate,
    weekStartAt,
    nextResetAt: new Date(new Date(weekStartAt).getFullYear(), new Date(weekStartAt).getMonth(), new Date(weekStartAt).getDate() + 7, DAILY_RESET_HOUR_LOCAL, 0, 0, 0).getTime(),
    questId: "weekly-onboarding-charter",
    title: "Complete your first weekly charter.",
    steps: [
      { kind: "clear_expeditions", label: "Clear 15 expeditions", target: 15, progress: 0 },
      { kind: "claim_mastery_milestone", label: "Claim 1 mastery milestone", target: 1, progress: 0 }
    ],
    reward: {
      accountXp: 25,
      regionalMaterials: { sunlitTimber: 10 },
      fragments: 0,
      titleId: "title-steady-regular"
    },
    questProgress: 0,
    questClaimed: false,
    recapSeen: false
  };
}

export function createEmptyRegionProgress(): RegionProgressState {
  return {
    activeMaterialIds: ["sunlitTimber", "emberResin"],
    materials: REGION_MATERIAL_IDS.reduce(
      (materials, materialId) => {
        materials[materialId] = 0;
        return materials;
      },
      {} as Record<RegionMaterialId, number>
    ),
    collections: {},
    outposts: {},
    diaries: {}
  };
}

export function createEmptyConstruction(): ConstructionState {
  return {
    activeBuildingId: null,
    startedAt: null,
    targetLevel: null,
    baseDurationMs: 0,
    focusSpentMs: 0,
    completedAt: null
  };
}

export function createEmptyClassChange(): ClassChangeState {
  return {
    freeChangeUsed: false,
    lastChangedAt: null
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
    focus: {
      current: FOCUS_MAX,
      cap: FOCUS_MAX,
      lastRegenAt: now
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
      upgrades: createEmptyRenownUpgrades()
    },
    dungeonMastery: {},
    accountRank: createEmptyAccountRank(),
    rebirth: createEmptyRebirth(),
    soulMarks: createEmptySoulMarks(),
    accountShowcase: createEmptyAccountShowcase(),
    accountPersonalRecords: createEmptyAccountPersonalRecords(),
    dailyFocus: createEmptyDailyFocus(now),
    weeklyQuest: createEmptyWeeklyQuest(now),
    eventProgress: {},
    regionProgress: createEmptyRegionProgress(),
    bossPrep: {},
    construction: createEmptyConstruction(),
    classChange: createEmptyClassChange(),
    traitCodex: {},
    familyCodex: {},
    titles: createEmptyTitles(),
    trophies: {},
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
