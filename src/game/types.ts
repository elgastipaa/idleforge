export type HeroClassId = "warrior" | "rogue" | "mage";

export type EquipmentSlot = "weapon" | "helm" | "armor" | "boots" | "relic";

export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export type BuildingId = "forge" | "mine" | "tavern" | "library" | "market" | "shrine";

export type GameMode = "standard" | "debug";

export type MaterialId = "ore" | "crystal" | "rune" | "relicFragment";

export type RegionMaterialId = "sunlitTimber" | "emberResin" | "archiveGlyph" | "stormglassShard" | "oathEmber";

export type ExpeditionThreatId = "armored" | "cursed" | "venom" | "elusive" | "regenerating" | "brutal";

export type ItemFamilyId = "sunlitCharter" | "emberboundKit" | "azureLedger" | "stormglassSurvey" | "firstForgeOath";

export type Stats = {
  power: number;
  defense: number;
  speed: number;
  luck: number;
  stamina: number;
};

export type ResourceState = {
  gold: number;
  ore: number;
  crystal: number;
  rune: number;
  relicFragment: number;
  renown: number;
};

export type MaterialBundle = Pick<ResourceState, MaterialId>;

export type HeroState = {
  name: string;
  classId: HeroClassId;
  level: number;
  xp: number;
  baseStats: Stats;
};

export type HeroClassDefinition = {
  id: HeroClassId;
  name: string;
  tagline: string;
  description: string;
  baseStats: Stats;
  growth: Stats;
};

export type AffixEffects = {
  xpMultiplier?: number;
  goldMultiplier?: number;
  zoneGoldMultiplier?: Record<string, number>;
  materialMultiplier?: number;
  materialResourceMultiplier?: Partial<Record<MaterialId, number>>;
  rareDropChance?: number;
  lootChance?: number;
  bossRewardMultiplier?: number;
  successChance?: number;
  bossSuccessChance?: number;
  shortMissionSuccessChance?: number;
  longMissionLootChance?: number;
  craftingDiscount?: number;
  focusBoostCostReduction?: number;
  sellMultiplier?: number;
  salvageMultiplier?: number;
  runeMultiplier?: number;
  durationReduction?: number;
  failureRewardScale?: number;
};

export type Affix = {
  id: string;
  name: string;
  stats: Partial<Stats>;
  effects?: AffixEffects;
  description: string;
  prefix?: string;
  suffix?: string;
  slots?: EquipmentSlot[];
};

export type Item = {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  itemLevel: number;
  upgradeLevel: number;
  stats: Partial<Stats>;
  affixes: Affix[];
  sellValue: number;
  salvageValue: Partial<MaterialBundle>;
  sourceDungeonId: string;
  createdAtRunId: number;
};

export type EquipmentState = Record<EquipmentSlot, Item | null>;

export type LootFocusId = "any" | EquipmentSlot;

export type LootState = {
  focusSlot: LootFocusId;
  missesSinceDrop: number;
  recentSlots: EquipmentSlot[];
};

export type BuildingState = Record<BuildingId, number>;

export type BuildingMilestone = {
  level: number;
  label: string;
};

export type BuildingDefinition = {
  id: BuildingId;
  name: string;
  description: string;
  purpose: string;
  maxLevel: number;
  baseCost: Partial<ResourceState>;
  effectText: (level: number) => string;
  milestones: BuildingMilestone[];
};

export type ZoneDefinition = {
  id: string;
  name: string;
  subtitle: string;
  index: number;
};

export type DungeonDefinition = {
  id: string;
  zoneId: string;
  zoneIndex: number;
  indexInZone: number;
  name: string;
  description: string;
  boss: boolean;
  durationMs: number;
  power: number;
  baseXp: number;
  baseGold: number;
  materials: Partial<MaterialBundle>;
  lootLevel: number;
  classModifiers: Partial<Record<HeroClassId, number>>;
  minLevel: number;
  previousDungeonId?: string;
};

export type ActiveExpedition = {
  dungeonId: string;
  runId: number;
  startedAt: number;
  endsAt: number;
  focusBoost: boolean;
};

export type AchievementState = {
  unlockedAt: number | null;
};

export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
};

export type RenownUpgrades = {
  guildLegacy: number;
  swiftCharters: number;
  treasureOath: number;
  bossAttunement: number;
};

export type PrestigeState = {
  totalPrestiges: number;
  renownEarned: number;
  upgrades: RenownUpgrades;
};

export type FocusState = {
  current: number;
  cap: number;
  lastRegenAt: number;
};

export type DungeonMasteryState = {
  masteryXp: number;
  claimedTiers: number[];
  failures: number;
};

export type MasteryTierNumber = 1 | 2 | 3;

export type MasteryTierDefinition = {
  tier: MasteryTierNumber;
  xp: number;
  label: string;
};

export type AccountRankState = {
  accountXp: number;
  accountRank: number;
  claimedRankRewards: number[];
};

export type AccountRankDefinition = {
  rank: number;
  xp: number;
  focusCap: number;
  label: string;
};

export type RebirthState = {
  totalRebirths: number;
  lastRebirthAt: number | null;
  classChangesUsedFreeSlot: boolean;
};

export type SoulMarksState = {
  current: number;
  lifetimeEarned: number;
  upgradesClaimed: RenownUpgrades;
  discovered: boolean;
};

export type AccountShowcaseState = {
  selectedTitleId: string | null;
  pinnedTrophyIds: string[];
  favoriteRegionId: string | null;
  featuredBossId: string | null;
  featuredFamilyId: ItemFamilyId | null;
  accountSignatureMode: "auto" | "manual";
  firstDiscoveryPopupShown: boolean;
  firstDiscoveryPopupDismissed: boolean;
};

export type AccountPersonalRecords = {
  lifetimeExpeditionsCompleted: number;
  lifetimeBossesDefeated: number;
  highestPowerReached: number;
  highestAccountRankReached: number;
  totalRebirths: number;
  totalMasteryTiersClaimed: number;
  totalCollectionsCompleted: number;
  legendaryTraitsDiscovered: number;
};

export type TitleState = {
  unlockedAt: number | null;
  progress: number;
  target: number;
};

export type TitleDefinition = {
  id: string;
  name: string;
  unlockCondition: string;
  target: number;
  showcasePriority: number;
  phase: number;
};

export type DailyFocusState = {
  date: string;
  focusChargesBanked: number;
  focusChargeProgress: number;
};

export type WeeklyQuestStepKind = "clear_expeditions" | "claim_mastery_milestone" | "collection_eligible_runs" | "attempt_boss";

export type WeeklyQuestStepState = {
  kind: WeeklyQuestStepKind;
  label: string;
  target: number;
  progress: number;
};

export type WeeklyQuestReward = {
  accountXp: number;
  regionalMaterials: Partial<Record<RegionMaterialId, number>>;
  fragments: number;
  titleId?: string;
  trophyId?: string;
};

export type WeeklyQuestState = {
  weekStartDate: string;
  weekStartAt: number;
  nextResetAt: number;
  questId: string;
  title: string;
  steps: WeeklyQuestStepState[];
  reward: WeeklyQuestReward;
  questProgress: number;
  questClaimed: boolean;
  recapSeen: boolean;
};

export type RegionCollectionState = {
  foundPieceIds: string[];
  missesSincePiece: number;
  completedAt: number | null;
};

export type RegionOutpostState = {
  selectedBonusId: string | null;
  level: number;
};

export type RegionDiaryState = {
  completedTaskIds: string[];
  claimedRewardIds: string[];
};

export type RegionProgressState = {
  activeMaterialIds: RegionMaterialId[];
  materials: Record<RegionMaterialId, number>;
  collections: Record<string, RegionCollectionState>;
  outposts: Record<string, RegionOutpostState>;
  diaries: Record<string, RegionDiaryState>;
};

export type BossPrepState = {
  revealedThreats: ExpeditionThreatId[];
  prepCharges: Partial<Record<ExpeditionThreatId, number>>;
  attempts: number;
  intel: number;
};

export type ConstructionState = {
  activeBuildingId: BuildingId | null;
  startedAt: number | null;
  targetLevel: number | null;
  baseDurationMs: number;
  focusSpentMs: number;
  completedAt: number | null;
};

export type ClassChangeState = {
  freeChangeUsed: boolean;
  lastChangedAt: number | null;
};

export type TraitDiscoveryState = {
  traitId: string;
  discovered: boolean;
  bestValueSeen: number;
  timesFound: number;
};

export type FamilyDiscoveryState = {
  familyId: ItemFamilyId;
  discoveredSlots: EquipmentSlot[];
  highestResonanceReached: 0 | 1 | 2;
};

export type TrophyState = {
  unlockedAt: number | null;
};

export type TrophyDefinition = {
  id: string;
  name: string;
  unlockCondition: string;
  target: number;
  showcasePriority: number;
  phase: number;
};

export type CaravanFocusId = "xp" | "gold" | "ore" | "crystal" | "rune";

export type CaravanFocusDefinition = {
  id: CaravanFocusId;
  label: string;
  unlockLevel: number;
  description: string;
};

export type CaravanRewardSummary = {
  xp: number;
  gold: number;
  materials: Partial<MaterialBundle>;
};

export type ActiveCaravanJob = {
  focusId: CaravanFocusId;
  durationMs: number;
  startedAt: number;
  endsAt: number;
};

export type CaravanState = {
  activeJob: ActiveCaravanJob | null;
};

export type DailyTaskKind =
  | "complete_expeditions"
  | "win_expeditions"
  | "defeat_boss"
  | "salvage_items"
  | "sell_items"
  | "equip_item"
  | "craft_item"
  | "upgrade_building"
  | "spend_focus"
  | "gain_mastery_xp"
  | "win_region_expeditions"
  | "claim_mastery_milestone"
  | "collection_eligible_runs"
  | "advance_collection_pity"
  | "attempt_boss"
  | "complete_caravan";

export type DailyReward = {
  gold: number;
  materials: Partial<MaterialBundle>;
  focus: number;
  accountXp: number;
  regionalMaterials: Partial<Record<RegionMaterialId, number>>;
  fragments: number;
};

export type DailyTaskRole = "primary" | "secondary";
export type DailyMissionDifficulty = "easy" | "medium" | "hard";

export type DailyTaskState = {
  id: string;
  kind: DailyTaskKind;
  role: DailyTaskRole;
  difficulty: DailyMissionDifficulty;
  label: string;
  target: number;
  progress: number;
  claimed: boolean;
  reward: DailyReward;
  regionId?: string;
};

export type WeeklyContractMilestone = {
  target: number;
  claimed: boolean;
  reward: DailyReward;
};

export type WeeklyContractState = {
  windowStartAt: number;
  nextResetAt: number;
  progress: number;
  milestones: WeeklyContractMilestone[];
};

export type DailyState = {
  windowStartAt: number;
  nextResetAt: number;
  tasks: DailyTaskState[];
  lastTaskSetKey: string | null;
  weekly: WeeklyContractState;
};

export type LifetimeStats = {
  expeditionsStarted: number;
  expeditionsSucceeded: number;
  expeditionsFailed: number;
  bossesDefeated: number;
  totalGoldEarned: number;
  totalItemsFound: number;
  totalItemsSold: number;
  totalItemsSalvaged: number;
  totalItemsCrafted: number;
  totalDailyClaims: number;
  legendaryItemsFound: number;
  highestPowerScore: number;
  highestLevel: number;
  finalBossClears: number;
};

export type SettingsState = {
  reducedMotion: boolean;
  debugBalance: boolean;
  onboardingDismissed: boolean;
  heroCreated: boolean;
};

export type GameState = {
  version: 1;
  seed: string;
  mode: GameMode;
  createdAt: number;
  updatedAt: number;
  nextRunId: number;
  hero: HeroState;
  resources: ResourceState;
  focus: FocusState;
  inventory: Item[];
  equipment: EquipmentState;
  loot: LootState;
  activeExpedition: ActiveExpedition | null;
  dungeonClears: Record<string, number>;
  town: BuildingState;
  caravan: CaravanState;
  dailies: DailyState;
  achievements: Record<string, AchievementState>;
  prestige: PrestigeState;
  dungeonMastery: Record<string, DungeonMasteryState>;
  accountRank: AccountRankState;
  rebirth: RebirthState;
  soulMarks: SoulMarksState;
  accountShowcase: AccountShowcaseState;
  accountPersonalRecords: AccountPersonalRecords;
  dailyFocus: DailyFocusState;
  weeklyQuest: WeeklyQuestState;
  eventProgress: Record<string, unknown>;
  regionProgress: RegionProgressState;
  bossPrep: Record<string, BossPrepState>;
  construction: ConstructionState;
  classChange: ClassChangeState;
  traitCodex: Record<string, TraitDiscoveryState>;
  familyCodex: Record<string, FamilyDiscoveryState>;
  titles: Record<string, TitleState>;
  trophies: Record<string, TrophyState>;
  lifetime: LifetimeStats;
  settings: SettingsState;
};

export type DerivedStats = Stats & {
  powerScore: number;
};

export type RewardSummary = {
  xp: number;
  gold: number;
  materials: Partial<MaterialBundle>;
};

export type MasteryTierProgressSummary = {
  tier: MasteryTierNumber;
  label: string;
  xpRequired: number;
  claimable: boolean;
};

export type AccountRankProgressSummary = {
  rank: number;
  xpRequired: number;
};

export type ExpeditionProgressSummary = {
  masteryXpGained: number;
  masteryXpBefore: number;
  masteryXpAfter: number;
  nextMasteryTier: MasteryTierProgressSummary | null;
  newlyClaimableMasteryTiers: MasteryTierProgressSummary[];
  accountXpGained: number;
  accountXpBefore: number;
  accountXpAfter: number;
  accountRankBefore: number;
  accountRankAfter: number;
  nextAccountRank: AccountRankProgressSummary | null;
  rankUps: number[];
  regionalMaterials: Partial<Record<RegionMaterialId, number>>;
  titlesUnlocked: TitleDefinition[];
  trophiesUnlocked: TrophyDefinition[];
};

export type ClaimMasteryTierSummary = {
  dungeonId: string;
  tier: MasteryTierDefinition;
  accountXpGained: number;
  accountRankBefore: number;
  accountRankAfter: number;
  rankUps: number[];
  regionalMaterials: Partial<Record<RegionMaterialId, number>>;
  relicFragmentsGained: number;
  titlesUnlocked: TitleDefinition[];
  trophiesUnlocked: TrophyDefinition[];
};

export type ItemComparisonSummary = {
  equippedItemId: string | null;
  equippedItemName: string | null;
  equippedScore: number;
  itemScore: number;
  delta: number;
  statDeltas: Partial<Stats>;
  effectScoreDelta: number;
  isBetter: boolean;
};

export type ResolveSummary = {
  success: boolean;
  dungeon: DungeonDefinition;
  rewards: RewardSummary;
  item: Item | null;
  autoSalvagedItem: Item | null;
  itemComparison: ItemComparisonSummary | null;
  progress: ExpeditionProgressSummary;
  focusBoostUsed: boolean;
  levelUps: number[];
  bossClear: boolean;
  bossFirstClear: boolean;
  firstGuaranteedWeapon: boolean;
  unlockedDungeons: DungeonDefinition[];
  unlockedZones: ZoneDefinition[];
  achievementsUnlocked: AchievementDefinition[];
  combatReport: string;
};

export type OfflineDeltaSummary = {
  expedition: ResolveSummary | null;
  expeditionReady: boolean;
  caravan: {
    focusId: CaravanFocusId;
    rewards: CaravanRewardSummary;
    elapsedMs: number;
    completed: boolean;
    levelUps: number[];
  } | null;
  mineGains: Partial<MaterialBundle>;
  focusGained: number;
  dailyReset: boolean;
  elapsedMs: number;
};

export type OfflineSummary = {
  state: GameState;
  summary: OfflineDeltaSummary | null;
  capped: boolean;
};

export type ActionResult<T = GameState> =
  | { ok: true; state: T; message?: string }
  | { ok: false; state: GameState; error: string };

export type ClaimMasteryTierResult =
  | { ok: true; state: GameState; summary: ClaimMasteryTierSummary; message: string }
  | { ok: false; state: GameState; error: string };

export type ResolveExpeditionOptions = {
  useFocusBoost?: boolean;
};

export type ResolveResult =
  | { ok: true; state: GameState; summary: ResolveSummary }
  | { ok: false; state: GameState; error: string };

export type PrestigeResult =
  | { ok: true; state: GameState; renownGained: number; achievementsUnlocked: AchievementDefinition[] }
  | { ok: false; state: GameState; error: string };

export type ImportResult =
  | { ok: true; state: GameState; message: string }
  | { ok: false; error: string };

export type StartExpeditionOptions = Record<string, never>;
