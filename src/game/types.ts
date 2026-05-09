export type HeroClassId = "warrior" | "rogue" | "mage";

export type EquipmentSlot = "weapon" | "helm" | "armor" | "boots" | "relic";

export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export type BuildingId = "forge" | "mine" | "tavern" | "library" | "market" | "shrine";

export type GameMode = "standard" | "debug";

export type MaterialId = "ore" | "crystal" | "rune" | "relicFragment";

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
  vigorBoostCostReduction?: number;
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
  vigorBoost: boolean;
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

export type VigorState = {
  current: number;
  max: number;
  lastTickAt: number;
};

export type DailyTaskKind =
  | "complete_expeditions"
  | "win_expeditions"
  | "defeat_boss"
  | "salvage_items"
  | "sell_items"
  | "craft_item"
  | "upgrade_building"
  | "spend_vigor";

export type DailyReward = {
  gold: number;
  materials: Partial<MaterialBundle>;
  vigor: number;
};

export type DailyTaskState = {
  id: string;
  kind: DailyTaskKind;
  label: string;
  target: number;
  progress: number;
  claimed: boolean;
  reward: DailyReward;
};

export type DailyState = {
  windowStartAt: number;
  nextResetAt: number;
  tasks: DailyTaskState[];
  lastTaskSetKey: string | null;
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
  vigor: VigorState;
  inventory: Item[];
  equipment: EquipmentState;
  activeExpedition: ActiveExpedition | null;
  dungeonClears: Record<string, number>;
  town: BuildingState;
  dailies: DailyState;
  achievements: Record<string, AchievementState>;
  prestige: PrestigeState;
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
  vigorBoostUsed: boolean;
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
  mineGains: Partial<MaterialBundle>;
  vigorGained: number;
  dailyReset: boolean;
};

export type OfflineSummary = {
  state: GameState;
  summary: OfflineDeltaSummary | null;
  capped: boolean;
};

export type ActionResult<T = GameState> =
  | { ok: true; state: T; message?: string }
  | { ok: false; state: GameState; error: string };

export type ResolveResult =
  | { ok: true; state: GameState; summary: ResolveSummary }
  | { ok: false; state: GameState; error: string };

export type PrestigeResult =
  | { ok: true; state: GameState; renownGained: number; achievementsUnlocked: AchievementDefinition[] }
  | { ok: false; state: GameState; error: string };

export type ImportResult =
  | { ok: true; state: GameState; message: string }
  | { ok: false; error: string };

export type StartExpeditionOptions = {
  useVigorBoost?: boolean;
};
