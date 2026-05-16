export type HeroClassId = "warrior" | "rogue" | "mage";

export type EquipmentSlot = "weapon" | "helm" | "armor" | "boots" | "relic";

export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export type BuildingId = "forge" | "mine" | "tavern" | "library" | "market" | "shrine";

export type GameMode = "standard" | "debug";

export type MaterialId = "fragments";

export type RegionMaterialId = "sunlitTimber" | "emberResin" | "archiveGlyph" | "stormglassShard" | "oathEmber";

export type ExpeditionThreatId = "armored" | "cursed" | "venom" | "elusive" | "regenerating" | "brutal";

export type ItemFamilyId = "sunlitCharter" | "emberboundKit" | "azureLedger" | "stormglassSurvey" | "firstForgeOath";

export type ItemTraitId =
  | "piercing"
  | "guarded"
  | "flame-sealed"
  | "antivenom"
  | "trailwise"
  | "ward-bound"
  | "sunlit-surveyor"
  | "ember-seeker"
  | "archive-scribe"
  | "stormglass-runner"
  | "oathbound-smith"
  | "route-scholar"
  | "guild-appraiser";

export type ItemTraitCategory = "tactical" | "regional" | "progress";

export type ItemTraitDefinition = {
  id: ItemTraitId;
  name: string;
  category: ItemTraitCategory;
  description: string;
  slots: EquipmentSlot[];
  stats: Partial<Stats>;
  countersThreatId?: ExpeditionThreatId;
  regionId?: string;
  effects?: AffixEffects;
};

export type ItemFamilyDefinition = {
  id: ItemFamilyId;
  name: string;
  regionId: string | null;
  active: boolean;
  rank1Text: string;
  rank2Text: string;
};

export type FamilyResonanceSummary = {
  family: ItemFamilyDefinition;
  equippedCount: number;
  rank: 0 | 1 | 2;
};

export type Stats = {
  power: number;
  defense: number;
  speed: number;
  luck: number;
  stamina: number;
};

export type ResourceState = {
  gold: number;
  fragments: number;
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
  regionalMaterialMultiplier?: Partial<Record<RegionMaterialId, number>>;
  masteryXpMultiplier?: Record<string, number>;
  accountXpMultiplier?: number;
  collectionChance?: number;
  rareDropChance?: number;
  lootChance?: number;
  bossRewardMultiplier?: number;
  successChance?: number;
  bossSuccessChance?: number;
  shortMissionSuccessChance?: number;
  longMissionLootChance?: number;
  craftingDiscount?: number;
  focusBoostCostReduction?: number;
  bossScoutCostReduction?: Record<string, number>;
  bossPrepMaterialDiscount?: Record<string, number>;
  threatCoverage?: Partial<Record<ExpeditionThreatId, number>>;
  sellMultiplier?: number;
  salvageMultiplier?: number;
  fragmentsMultiplier?: number;
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
  traitId?: ItemTraitId | null;
  familyId?: ItemFamilyId | null;
  locked?: boolean;
  sellValue: number;
  salvageValue: Partial<MaterialBundle>;
  sourceDungeonId: string;
  createdAtRunId: number;
};

export type EquipmentState = Record<EquipmentSlot, Item | null>;

export type BuildPresetId = "preset-1" | "preset-2";

export type BuildPresetState = {
  id: BuildPresetId;
  name: string;
  equipmentItemIds: Partial<Record<EquipmentSlot, string>>;
};

export type BuildPresetMap = Record<BuildPresetId, BuildPresetState>;

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
  bossPrepCoverage?: Partial<Record<ExpeditionThreatId, number>>;
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
  horizonCartography: number;
  forgeInheritance: number;
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
  selectedFamilyId: ItemFamilyId | null;
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

export type EventBonusModifier =
  | { type: "extraRegionalMaterial"; regionId: string; multiplier: number }
  | { type: "extraMasteryXp"; multiplier: number }
  | { type: "guaranteedThreatReveal"; regionId: string }
  | { type: "bossDoubleRewards"; bossId: string };

export type EventReward = {
  gold: number;
  fragments: number;
  focus: number;
  regionalMaterials: Partial<Record<RegionMaterialId, number>>;
};

export type EventRewardTier = {
  tier: number;
  targetParticipation: number;
  label: string;
  reward: EventReward;
};

export type EventDefinition = {
  id: string;
  name: string;
  description: string;
  startsAt: number;
  endsAt: number;
  themeRegionId?: string;
  bonusModifiers: EventBonusModifier[];
  rewardScheduleId: string;
};

export type EventProgressState = {
  eventId: string;
  participation: number;
  claimedRewards: number[];
};

export type EventRewardTierStatus = EventRewardTier & {
  rewardIndex: number;
  claimed: boolean;
  claimable: boolean;
  remaining: number;
};

export type EventBannerSummary = {
  event: EventDefinition;
  progress: EventProgressState;
  tiers: EventRewardTierStatus[];
  active: boolean;
  startsInMs: number;
  endsInMs: number;
};

export type RegionCollectionState = {
  foundPieceIds: string[];
  missesSincePiece: number;
  completedAt: number | null;
  dust?: number;
};

export type CollectionPieceDefinition = {
  id: string;
  name: string;
};

export type RegionCollectionReward = {
  accountXp: number;
  regionalMaterialYieldBonus?: Partial<Record<RegionMaterialId, number>>;
  masteryXpBonus?: Record<string, number>;
  bossSuccessChanceBonus?: Record<string, number>;
  titleId?: string;
  trophyId?: string;
};

export type RegionCollectionDefinition = {
  id: string;
  name: string;
  regionId: string;
  materialId: RegionMaterialId;
  pieces: CollectionPieceDefinition[];
  eligibleDungeonIds: string[];
  normalSuccessChance: number;
  normalFailureChance: number;
  bossSuccessChance: number;
  pityThreshold: number;
  reward: RegionCollectionReward;
};

export type RegionCollectionSummary = {
  collectionId: string;
  name: string;
  regionId: string;
  materialId: RegionMaterialId;
  pieces: Array<CollectionPieceDefinition & { found: boolean }>;
  piecesFound: number;
  piecesTotal: number;
  completionPercent: number;
  missesSincePiece: number;
  pityThreshold: number;
  completedAt: number | null;
  dust: number;
  visible: boolean;
};

export type CollectionProgressSummary = {
  collectionId: string;
  collectionName: string;
  regionId: string;
  eligible: boolean;
  pieceId: string | null;
  pieceName: string | null;
  piecesFound: number;
  piecesTotal: number;
  missesSincePiece: number;
  pityThreshold: number;
  pityAdvanced: boolean;
  completed: boolean;
  dustGained: number;
  accountXpGained: number;
  accountXpBefore: number;
  accountXpAfter: number;
  accountRankBefore: number;
  accountRankAfter: number;
  rankUps: number[];
  titlesUnlocked: TitleDefinition[];
  trophiesUnlocked: TrophyDefinition[];
};

export type RegionOutpostState = {
  selectedBonusId: string | null;
  level: number;
};

export type RegionOutpostBonusId = "supply-post" | "watchtower" | "relic-survey" | "training-yard";

export type RegionOutpostBonusDefinition = {
  id: RegionOutpostBonusId;
  name: string;
  description: string;
  effectText: string;
};

export type RegionDiaryState = {
  completedTaskIds: string[];
  claimedRewardIds: string[];
  taskProgress: Record<string, number>;
};

export type RegionDiaryTaskKind =
  | "clear_region_expeditions"
  | "claim_mastery_tier"
  | "salvage_region_items"
  | "upgrade_town_with_material"
  | "prepare_region_boss";

export type RegionDiaryTaskDefinition = {
  id: string;
  kind: RegionDiaryTaskKind;
  label: string;
  description: string;
  target: number;
  dungeonIds?: string[];
  dungeonId?: string;
  masteryTier?: MasteryTierNumber;
  materialId?: RegionMaterialId;
};

export type RegionDiaryRewardDefinition = {
  id: string;
  name: string;
  description: string;
  accountXp: number;
  regionalMaterials?: Partial<Record<RegionMaterialId, number>>;
  masteryXpBonus?: Record<string, number>;
  regionalMaterialYieldBonus?: Partial<Record<RegionMaterialId, number>>;
  titleId?: string;
  trophyId?: string;
};

export type RegionDiaryDefinition = {
  id: string;
  regionId: string;
  tier: number;
  name: string;
  tasks: RegionDiaryTaskDefinition[];
  reward: RegionDiaryRewardDefinition;
};

export type RegionDiaryTaskSummary = RegionDiaryTaskDefinition & {
  progress: number;
  completed: boolean;
};

export type RegionDiarySummary = {
  diaryId: string;
  regionId: string;
  tier: number;
  name: string;
  tasks: RegionDiaryTaskSummary[];
  completedTasks: number;
  totalTasks: number;
  completionPercent: number;
  readyToClaim: boolean;
  claimed: boolean;
  reward: RegionDiaryRewardDefinition;
};

export type RegionalMaterialSinkReward = {
  gold?: number;
  fragments?: number;
};

export type RegionalMaterialSinkDefinition = {
  id: string;
  regionId: string;
  materialId: RegionMaterialId;
  name: string;
  description: string;
  cost: number;
  reward: RegionalMaterialSinkReward;
};

export type RegionCompletionSummary = {
  regionId: string;
  materialId: RegionMaterialId | null;
  materialAmount: number;
  routesCleared: number;
  routesTotal: number;
  masteryTiersClaimed: number;
  masteryTiersTotal: number;
  completionPercent: number;
  outpost: RegionOutpostState | null;
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

export type BossThreatDefinition = {
  id: ExpeditionThreatId;
  name: string;
  critical: boolean;
  traitAnswerId: string;
  traitAnswerName: string;
  prepName: string;
  prepMaterialCost: number;
  explanation: string;
};

export type BossDefinition = {
  id: string;
  dungeonId: string;
  regionId: string;
  name: string;
  title: string;
  fantasy: string;
  scoutCost: number;
  prepFocusCost: number;
  failureIntelText: string;
  threats: BossThreatDefinition[];
};

export type BossThreatStatus = {
  threat: BossThreatDefinition;
  revealed: boolean;
  coverage: number;
  equippedCovered: boolean;
  prepCoverage: number;
  prepCharges: number;
  successImpact: "covered" | "partial" | "uncovered";
};

export type BossViewSummary = {
  boss: BossDefinition;
  prepState: BossPrepState;
  statuses: BossThreatStatus[];
  adjustedSuccessChance: number;
};

export type BossResolveSummary = {
  bossId: string;
  name: string;
  title: string;
  failureIntelText: string | null;
  intelGained: number;
  newlyRevealedThreats: BossThreatDefinition[];
  revealedThreats: BossThreatDefinition[];
};

export type ConstructionState = {
  activeBuildingId: BuildingId | null;
  startedAt: number | null;
  targetLevel: number | null;
  baseDurationMs: number;
  focusSpentMs: number;
  completedAt: number | null;
  paidCostResources?: Partial<ResourceState>;
  paidCostRegionalMaterials?: Partial<Record<RegionMaterialId, number>>;
};

export type BuildingConstructionCost = {
  resources: Partial<ResourceState>;
  regionalMaterials: Partial<Record<RegionMaterialId, number>>;
};

export type ConstructionProgressSummary = {
  buildingId: BuildingId;
  targetLevel: number;
  startedAt: number;
  completedAt: number;
  baseDurationMs: number;
  elapsedMs: number;
  remainingMs: number;
  focusSpentMs: number;
  progress: number;
  ready: boolean;
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

export type CaravanFocusId = "xp" | "gold" | "fragments";

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
  accountXp: number;
  regionalMaterials: Partial<Record<RegionMaterialId, number>>;
};

export type ActiveCaravanJob = {
  focusId: CaravanFocusId;
  regionId: string;
  durationMs: number;
  rewardDurationMs: number;
  startedAt: number;
  endsAt: number;
};

export type CaravanMasteryState = {
  regionId: string;
  caravansSent: number;
  masteryXp: number;
  claimedTiers: number[];
};

export type CaravanMasteryTierDefinition = {
  tier: number;
  xpRequired: number;
  label: string;
  effectText: string;
};

export type CaravanMasterySummary = {
  regionId: string;
  regionName: string;
  caravansSent: number;
  masteryXp: number;
  claimedTiers: number[];
  highestClaimedTier: number;
  claimableTiers: CaravanMasteryTierDefinition[];
  nextTier: CaravanMasteryTierDefinition | null;
  progressPercent: number;
  activeBonusText: string[];
};

export type CaravanState = {
  activeJob: ActiveCaravanJob | null;
  mastery: Record<string, CaravanMasteryState>;
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
  completionNotificationsOptIn: boolean;
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
  buildPresets: BuildPresetMap;
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
  eventProgress: Record<string, EventProgressState>;
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
  collection: CollectionProgressSummary | null;
};

export type ClaimMasteryTierSummary = {
  dungeonId: string;
  tier: MasteryTierDefinition;
  accountXpGained: number;
  accountRankBefore: number;
  accountRankAfter: number;
  rankUps: number[];
  regionalMaterials: Partial<Record<RegionMaterialId, number>>;
  fragmentsGained: number;
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
  boss: BossResolveSummary | null;
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
    regionId: string;
    rewards: CaravanRewardSummary;
    elapsedMs: number;
    completed: boolean;
    levelUps: number[];
    masteryXpGained?: number;
  } | null;
  construction: {
    buildingId: BuildingId;
    targetLevel: number;
    completed: boolean;
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
