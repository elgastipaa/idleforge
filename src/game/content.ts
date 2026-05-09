import type {
  AchievementDefinition,
  Affix,
  BuildingDefinition,
  DailyTaskKind,
  DungeonDefinition,
  EquipmentSlot,
  HeroClassDefinition,
  ItemRarity,
  ZoneDefinition
} from "./types";

export const HERO_CLASSES: HeroClassDefinition[] = [
  {
    id: "warrior",
    name: "Warrior",
    tagline: "Armored, steady, boss-ready.",
    description: "A front-line champion who turns defense and stamina into reliable clears.",
    baseStats: { power: 10, defense: 9, speed: 4, luck: 3, stamina: 115 },
    growth: { power: 3, defense: 3, speed: 1, luck: 1, stamina: 12 }
  },
  {
    id: "rogue",
    name: "Rogue",
    tagline: "Fast, lucky, and suspiciously good at finding treasure.",
    description: "A nimble scout with strong speed and luck for better odds and richer loot.",
    baseStats: { power: 8, defense: 5, speed: 10, luck: 8, stamina: 90 },
    growth: { power: 2, defense: 1, speed: 3, luck: 2, stamina: 8 }
  },
  {
    id: "mage",
    name: "Mage",
    tagline: "Explosive relic knowledge in a practical robe.",
    description: "A scholar of dangerous magic with high power and excellent relic synergy.",
    baseStats: { power: 11, defense: 4, speed: 6, luck: 7, stamina: 85 },
    growth: { power: 4, defense: 1, speed: 1, luck: 2, stamina: 7 }
  }
];

export const CLASS_PASSIVE_TEXT: Record<
  HeroClassDefinition["id"],
  { level: 5 | 10 | 15; name: string; effect: string }[]
> = {
  warrior: [
    { level: 5, name: "Iron Oath", effect: "+5% success chance on boss expeditions." },
    { level: 10, name: "Unbroken", effect: "-10% expedition failure penalty." },
    { level: 15, name: "War Banner", effect: "+8% XP from boss clears." }
  ],
  rogue: [
    { level: 5, name: "Quick Hands", effect: "+8% gold from expeditions." },
    { level: 10, name: "Treasure Nose", effect: "+6% loot chance." },
    { level: 15, name: "Shadow Cartography", effect: "-8% expedition duration." }
  ],
  mage: [
    { level: 5, name: "Runic Focus", effect: "-8% forge material costs." },
    { level: 10, name: "Arcane Survey", effect: "+5% success chance on non-boss expeditions." },
    { level: 15, name: "Grand Formula", effect: "+10% rune gains." }
  ]
};

export const ZONES: ZoneDefinition[] = [
  { id: "sunlit-marches", name: "Sunlit Marches", subtitle: "Training roads, shiny rumors, and suspiciously brave apprentices.", index: 1 },
  { id: "emberwood", name: "Emberwood", subtitle: "A bright forest where relic sparks sleep under old roots.", index: 2 },
  { id: "azure-vaults", name: "Azure Vaults", subtitle: "Blue-lit halls packed with locked shelves and magical opinions.", index: 3 },
  { id: "stormglass-peaks", name: "Stormglass Peaks", subtitle: "High ruins where every bridge hums with stored thunder.", index: 4 },
  { id: "first-forge", name: "First Forge", subtitle: "The ancient guild-forge that started every legend worth arguing about.", index: 5 }
];

export const DUNGEONS: DungeonDefinition[] = [
  {
    id: "tollroad-of-trinkets",
    zoneId: "sunlit-marches",
    zoneIndex: 1,
    indexInZone: 1,
    name: "Tollroad of Trinkets",
    description: "A quick sweep along a merchant road glittering with misplaced relic bits.",
    boss: false,
    durationMs: 20_000,
    power: 8,
    baseXp: 18,
    baseGold: 14,
    materials: { ore: 1 },
    lootLevel: 1,
    classModifiers: { rogue: 0.03 },
    minLevel: 1
  },
  {
    id: "mossbright-cellar",
    zoneId: "sunlit-marches",
    zoneIndex: 1,
    indexInZone: 2,
    name: "Mossbright Cellar",
    description: "Damp stairs, glowing jars, and enough creaking wood to keep everyone polite.",
    boss: false,
    durationMs: 70_000,
    power: 14,
    baseXp: 38,
    baseGold: 30,
    materials: { ore: 2 },
    lootLevel: 2,
    classModifiers: { mage: 0.03 },
    minLevel: 1,
    previousDungeonId: "tollroad-of-trinkets"
  },
  {
    id: "relic-bandit-cache",
    zoneId: "sunlit-marches",
    zoneIndex: 1,
    indexInZone: 3,
    name: "Relic Bandit Cache",
    description: "A hidden stash where the locks are theatrical but the rewards are real.",
    boss: false,
    durationMs: 240_000,
    power: 24,
    baseXp: 120,
    baseGold: 72,
    materials: { ore: 5, crystal: 1 },
    lootLevel: 4,
    classModifiers: { rogue: 0.02, warrior: 0.01 },
    minLevel: 2,
    previousDungeonId: "mossbright-cellar"
  },
  {
    id: "copper-crown-champion",
    zoneId: "sunlit-marches",
    zoneIndex: 1,
    indexInZone: 4,
    name: "Copper Crown Champion",
    description: "The first boss trial, mostly pomp, partially danger, entirely worth looting.",
    boss: true,
    durationMs: 576_000,
    power: 42,
    baseXp: 160,
    baseGold: 135,
    materials: { ore: 8, crystal: 2 },
    lootLevel: 6,
    classModifiers: { warrior: 0.04 },
    minLevel: 3,
    previousDungeonId: "relic-bandit-cache"
  },
  {
    id: "lanternroot-path",
    zoneId: "emberwood",
    zoneIndex: 2,
    indexInZone: 1,
    name: "Lanternroot Path",
    description: "A warm trail where roots glow like tavern signs and point both ways.",
    boss: false,
    durationMs: 180_000,
    power: 55,
    baseXp: 210,
    baseGold: 175,
    materials: { ore: 10, crystal: 3 },
    lootLevel: 8,
    classModifiers: { rogue: 0.03 },
    minLevel: 3,
    previousDungeonId: "copper-crown-champion"
  },
  {
    id: "saffron-sigil-grove",
    zoneId: "emberwood",
    zoneIndex: 2,
    indexInZone: 2,
    name: "Saffron Sigil Grove",
    description: "Old stones pulse with sigils that insist they are decorative. They are not.",
    boss: false,
    durationMs: 210_000,
    power: 70,
    baseXp: 285,
    baseGold: 235,
    materials: { ore: 12, crystal: 5 },
    lootLevel: 10,
    classModifiers: { mage: 0.04 },
    minLevel: 4,
    previousDungeonId: "lanternroot-path"
  },
  {
    id: "cinderleaf-crossing",
    zoneId: "emberwood",
    zoneIndex: 2,
    indexInZone: 3,
    name: "Cinderleaf Crossing",
    description: "A relic bridge crossing a stream of warm sparks and questionable engineering.",
    boss: false,
    durationMs: 240_000,
    power: 90,
    baseXp: 380,
    baseGold: 310,
    materials: { ore: 16, crystal: 6, rune: 1 },
    lootLevel: 13,
    classModifiers: { warrior: 0.02, rogue: 0.02 },
    minLevel: 5,
    previousDungeonId: "saffron-sigil-grove"
  },
  {
    id: "emberwood-heart",
    zoneId: "emberwood",
    zoneIndex: 2,
    indexInZone: 4,
    name: "Emberwood Heart",
    description: "A boss chamber grown around a living coal and guarded by very dramatic roots.",
    boss: true,
    durationMs: 270_000,
    power: 118,
    baseXp: 520,
    baseGold: 440,
    materials: { ore: 20, crystal: 9, rune: 2 },
    lootLevel: 16,
    classModifiers: { mage: 0.03, warrior: 0.02 },
    minLevel: 5,
    previousDungeonId: "cinderleaf-crossing"
  },
  {
    id: "index-of-whispers",
    zoneId: "azure-vaults",
    zoneIndex: 3,
    indexInZone: 1,
    name: "Index of Whispers",
    description: "The entry hall catalogues relics, dangers, and several overdue fines.",
    boss: false,
    durationMs: 180_000,
    power: 140,
    baseXp: 650,
    baseGold: 560,
    materials: { crystal: 12, rune: 3 },
    lootLevel: 19,
    classModifiers: { mage: 0.04 },
    minLevel: 6,
    previousDungeonId: "emberwood-heart"
  },
  {
    id: "mirror-script-hall",
    zoneId: "azure-vaults",
    zoneIndex: 3,
    indexInZone: 2,
    name: "Mirror-Script Hall",
    description: "Every inscription reads back with notes, corrections, and mild sarcasm.",
    boss: false,
    durationMs: 210_000,
    power: 170,
    baseXp: 820,
    baseGold: 710,
    materials: { crystal: 15, rune: 4 },
    lootLevel: 22,
    classModifiers: { rogue: 0.02, mage: 0.02 },
    minLevel: 7,
    previousDungeonId: "index-of-whispers"
  },
  {
    id: "astral-ledger-stacks",
    zoneId: "azure-vaults",
    zoneIndex: 3,
    indexInZone: 3,
    name: "Astral Ledger Stacks",
    description: "Relic accounts written in starlight, guarded by arithmetic that bites.",
    boss: false,
    durationMs: 240_000,
    power: 210,
    baseXp: 1020,
    baseGold: 910,
    materials: { crystal: 18, rune: 6 },
    lootLevel: 26,
    classModifiers: { warrior: 0.02, mage: 0.03 },
    minLevel: 8,
    previousDungeonId: "mirror-script-hall"
  },
  {
    id: "curator-of-blue-fire",
    zoneId: "azure-vaults",
    zoneIndex: 3,
    indexInZone: 4,
    name: "Curator of Blue Fire",
    description: "A boss trial that stamps every permit in triplicate, including the painful ones.",
    boss: true,
    durationMs: 420_000,
    power: 265,
    baseXp: 1280,
    baseGold: 1180,
    materials: { crystal: 22, rune: 8, relicFragment: 1 },
    lootLevel: 30,
    classModifiers: { mage: 0.04 },
    minLevel: 9,
    previousDungeonId: "astral-ledger-stacks"
  },
  {
    id: "thunderchain-ascent",
    zoneId: "stormglass-peaks",
    zoneIndex: 4,
    indexInZone: 1,
    name: "Thunderchain Ascent",
    description: "A climb through glassy switchbacks where the railings hum helpful warnings.",
    boss: false,
    durationMs: 1_800_000,
    power: 398,
    baseXp: 1550,
    baseGold: 1420,
    materials: { crystal: 24, rune: 10, relicFragment: 1 },
    lootLevel: 34,
    classModifiers: { warrior: 0.03 },
    minLevel: 12,
    previousDungeonId: "curator-of-blue-fire"
  },
  {
    id: "skybell-ruins",
    zoneId: "stormglass-peaks",
    zoneIndex: 4,
    indexInZone: 2,
    name: "Skybell Ruins",
    description: "Bells ring only when relic hunters lie about being careful.",
    boss: false,
    durationMs: 1_800_000,
    power: 472,
    baseXp: 1880,
    baseGold: 1710,
    materials: { rune: 13, relicFragment: 2 },
    lootLevel: 38,
    classModifiers: { rogue: 0.03 },
    minLevel: 13,
    previousDungeonId: "thunderchain-ascent"
  },
  {
    id: "opalfang-bridge",
    zoneId: "stormglass-peaks",
    zoneIndex: 4,
    indexInZone: 3,
    name: "Opalfang Bridge",
    description: "A narrow relic bridge that looks expensive and deeply unconcerned.",
    boss: false,
    durationMs: 1_800_000,
    power: 560,
    baseXp: 2260,
    baseGold: 2050,
    materials: { rune: 16, relicFragment: 2 },
    lootLevel: 43,
    classModifiers: { warrior: 0.02, mage: 0.02 },
    minLevel: 14,
    previousDungeonId: "skybell-ruins"
  },
  {
    id: "stormglass-regent",
    zoneId: "stormglass-peaks",
    zoneIndex: 4,
    indexInZone: 4,
    name: "Stormglass Regent",
    description: "A boss trial above the clouds, with lightning arranged like court etiquette.",
    boss: true,
    durationMs: 1_800_000,
    power: 665,
    baseXp: 2760,
    baseGold: 2520,
    materials: { rune: 20, relicFragment: 3 },
    lootLevel: 49,
    classModifiers: { warrior: 0.04 },
    minLevel: 15,
    previousDungeonId: "opalfang-bridge"
  },
  {
    id: "ashdoor-antechamber",
    zoneId: "first-forge",
    zoneIndex: 5,
    indexInZone: 1,
    name: "Ashdoor Antechamber",
    description: "The first gate of the ancient forge opens for guilds with excellent paperwork.",
    boss: false,
    durationMs: 3_600_000,
    power: 760,
    baseXp: 3260,
    baseGold: 3020,
    materials: { rune: 23, relicFragment: 4 },
    lootLevel: 55,
    classModifiers: { mage: 0.03 },
    minLevel: 16,
    previousDungeonId: "stormglass-regent"
  },
  {
    id: "bellows-of-memory",
    zoneId: "first-forge",
    zoneIndex: 5,
    indexInZone: 2,
    name: "Bellows of Memory",
    description: "Every breath of the forge remembers an older guild and judges your boots.",
    boss: false,
    durationMs: 3_600_000,
    power: 875,
    baseXp: 3860,
    baseGold: 3600,
    materials: { rune: 26, relicFragment: 5 },
    lootLevel: 62,
    classModifiers: { rogue: 0.02, mage: 0.02 },
    minLevel: 17,
    previousDungeonId: "ashdoor-antechamber"
  },
  {
    id: "anvil-of-bright-oaths",
    zoneId: "first-forge",
    zoneIndex: 5,
    indexInZone: 3,
    name: "Anvil of Bright Oaths",
    description: "A relic anvil that improves promises by hitting them very hard.",
    boss: false,
    durationMs: 3_600_000,
    power: 1010,
    baseXp: 4550,
    baseGold: 4300,
    materials: { rune: 30, relicFragment: 6 },
    lootLevel: 70,
    classModifiers: { warrior: 0.03 },
    minLevel: 18,
    previousDungeonId: "bellows-of-memory"
  },
  {
    id: "crown-of-the-first-forge",
    zoneId: "first-forge",
    zoneIndex: 5,
    indexInZone: 4,
    name: "Crown of the First Forge",
    description: "The final v1.0 boss milestone: a crown-shaped furnace with legendary standards.",
    boss: true,
    durationMs: 3_600_000,
    power: 1160,
    baseXp: 5400,
    baseGold: 5200,
    materials: { rune: 38, relicFragment: 9 },
    lootLevel: 80,
    classModifiers: { warrior: 0.02, rogue: 0.02, mage: 0.02 },
    minLevel: 18,
    previousDungeonId: "anvil-of-bright-oaths"
  }
];

function formatPercent(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export const BUILDINGS: BuildingDefinition[] = [
  {
    id: "forge",
    name: "Forge",
    description: "Improves future gear and adds raw hero power.",
    purpose: "Craft gear, upgrade item level, salvage inventory, and reroll affixes.",
    maxLevel: 12,
    baseCost: { gold: 40, ore: 3 },
    effectText: (level) => `+${level * 3} power, +${level} defense, +${level * 2} item stat budget`,
    milestones: [
      { level: 0, label: "Craft random gear by slot" },
      { level: 1, label: "Upgrade gear into higher item levels" },
      { level: 3, label: "Reroll one affix at a time" },
      { level: 6, label: "+12 item stat budget for new gear" }
    ]
  },
  {
    id: "mine",
    name: "Mine",
    description: "Increases materials recovered from successful expeditions.",
    purpose: "Boost expedition materials and generate passive offline materials.",
    maxLevel: 12,
    baseCost: { gold: 75, ore: 4 },
    effectText: (level) => `+${level * 8}% expedition materials`,
    milestones: [
      { level: 1, label: "Offline ore generation" },
      { level: 2, label: "Offline crystal generation" },
      { level: 5, label: "Offline rune generation" },
      { level: 9, label: "Offline fragment generation" }
    ]
  },
  {
    id: "tavern",
    name: "Tavern",
    description: "Keeps heroes rested, famous, and suspiciously well-fed.",
    purpose: "Support dailies, XP momentum, stamina, and next-goal rumors.",
    maxLevel: 12,
    baseCost: { gold: 90, ore: 4, crystal: 1 },
    effectText: (level) => `+${level * 4}% XP, +${level * 4} stamina`,
    milestones: [
      { level: 0, label: "Daily task board and rumor prompts" },
      { level: 1, label: "XP and stamina training" },
      { level: 6, label: "+24% XP from expeditions" },
      { level: 12, label: "Maximum Tavern training bonus" }
    ]
  },
  {
    id: "library",
    name: "Library",
    description: "Turns dusty relic notes into better success chances and luck.",
    purpose: "Improve success, luck, class knowledge, and region unlock hints.",
    maxLevel: 12,
    baseCost: { gold: 150, crystal: 4 },
    effectText: (level) => `+${formatPercent(Math.min(4.8, level * 0.4))}% success, +${level} luck`,
    milestones: [
      { level: 0, label: "Region unlock hints" },
      { level: 1, label: "Success and luck research" },
      { level: 5, label: "+5 luck for class builds" },
      { level: 12, label: "Success bonus cap reached" }
    ]
  },
  {
    id: "market",
    name: "Market",
    description: "Improves gold rewards and sell prices.",
    purpose: "Improve sell value, gold income, and inventory pressure decisions.",
    maxLevel: 12,
    baseCost: { gold: 85, ore: 4 },
    effectText: (level) => `+${level * 5}% gold, +${level * 10}% sell value`,
    milestones: [
      { level: 0, label: "Sell items and track inventory pressure" },
      { level: 1, label: "+10% item sell value" },
      { level: 6, label: "+60% item sell value" },
      { level: 12, label: "Maximum Market sell bonus" }
    ]
  },
  {
    id: "shrine",
    name: "Shrine",
    description: "Focuses guild legacy into prestige momentum and steady power.",
    purpose: "Support reincarnation, Soul Marks, permanent upgrades, and power score.",
    maxLevel: 12,
    baseCost: { gold: 220, crystal: 5, rune: 1 },
    effectText: (level) => `+${level * 2} power score, +${level * 4}% Soul Marks on reincarnation`,
    milestones: [
      { level: 0, label: "Reincarnation readiness tracking" },
      { level: 1, label: "+4% Soul Marks on reincarnation" },
      { level: 6, label: "+24% Soul Marks on reincarnation" },
      { level: 12, label: "Maximum Shrine reincarnation bonus" }
    ]
  }
];

export const SLOT_BASE_NAMES: Record<EquipmentSlot, string[]> = {
  weapon: ["Warblade", "Runesaber", "Sun Hammer", "Ash Wand", "Vault Staff", "Storm Pike"],
  helm: ["Greathelm", "Runecowl", "Crown", "Visor", "Oath Hood", "Signal Mask"],
  armor: ["Hauberk", "Battle Robe", "Plate", "Brigandine", "Mantle", "Guardmail"],
  boots: ["Greaves", "Path Treads", "March Boots", "Sandals", "Sabatons", "Trailstriders"],
  relic: ["Sigil", "Compass", "Lantern", "Charm", "Icon", "Guildstone"]
};

export const RARITY_PREFIX: Record<ItemRarity, string[]> = {
  common: ["Trusty", "Polished", "Stout", "Bright", "Tempered"],
  rare: ["Runesung", "Gleaming", "Valiant", "Enchanted", "Moon-Etched"],
  epic: ["Starforged", "Mythic", "Guildblessed", "Aurelian", "Storm-Vowed"],
  legendary: ["Legendary", "Dynasty-Bound", "First-Forged", "Crownlit", "World-Anvil"]
};

export const AFFIX_POOL: Affix[] = [
  { id: "might", name: "Might", suffix: "of Might", stats: { power: 8 }, description: "+Power" },
  { id: "bulwark", name: "Bulwark", suffix: "of the Bulwark", stats: { defense: 8 }, description: "+Defense" },
  { id: "quickstep", name: "Quickstep", suffix: "of Quickstep", stats: { speed: 7 }, description: "+Speed" },
  { id: "fortune", name: "Fortune", suffix: "of Fortune", stats: { luck: 7 }, description: "+Luck" },
  { id: "vitality", name: "Vitality", suffix: "of Vitality", stats: { stamina: 24 }, description: "+Stamina" },
  {
    id: "warlord",
    name: "Warlord",
    prefix: "War-Sung",
    suffix: "of Warlords",
    stats: { power: 5, defense: 4 },
    description: "+Power and +Defense"
  },
  {
    id: "emberheart",
    name: "Emberheart",
    prefix: "Emberheart",
    suffix: "of Embers",
    stats: { power: 5, luck: 4 },
    effects: { zoneGoldMultiplier: { emberwood: 0.08 } },
    description: "+Power, +Luck, +8% Gold in Emberwood"
  },
  {
    id: "stoneguard",
    name: "Stoneguard",
    prefix: "Stoneguard",
    suffix: "of Oaths",
    stats: { defense: 5, stamina: 16 },
    description: "+Defense and +Stamina"
  },
  {
    id: "fleetstrider",
    name: "Fleetstrider",
    prefix: "Fleetstrider",
    suffix: "of Fast Roads",
    stats: { speed: 5, stamina: 10 },
    effects: { durationReduction: 0.03 },
    description: "+Speed, +Stamina, -3% expedition duration"
  },
  {
    id: "ledger-scholar",
    name: "Ledger Scholar",
    prefix: "Scholar's",
    suffix: "of the Ledger",
    stats: { luck: 5, defense: 4 },
    effects: { xpMultiplier: 0.04 },
    description: "+Luck, +Defense, +4% XP from expeditions"
  },
  {
    id: "lessons",
    name: "Lessons",
    prefix: "Lesson-Bound",
    suffix: "of Lessons",
    stats: { luck: 3 },
    effects: { xpMultiplier: 0.07 },
    description: "+7% XP from expeditions"
  },
  {
    id: "grove-greed",
    name: "Grove Greed",
    prefix: "Grove-Taxed",
    suffix: "of Grove Spoils",
    stats: { luck: 4 },
    effects: { zoneGoldMultiplier: { emberwood: 0.14 } },
    description: "+14% Gold in Emberwood forest expeditions"
  },
  {
    id: "blue-spark",
    name: "Blue Spark",
    prefix: "Blue-Spark",
    suffix: "of the Blue Spark",
    stats: { luck: 5 },
    effects: { rareDropChance: 0.025 },
    description: "+Rare drop chance"
  },
  {
    id: "crown-hunger",
    name: "Crown Hunger",
    prefix: "Crown-Hungry",
    suffix: "of Boss Trophies",
    stats: { power: 4 },
    effects: { bossRewardMultiplier: 0.1 },
    description: "+10% boss rewards"
  },
  {
    id: "tempered-costs",
    name: "Tempered Costs",
    prefix: "Tempered",
    suffix: "of Tempered Costs",
    stats: { defense: 3 },
    effects: { craftingDiscount: 0.08 },
    description: "-8% forge material costs"
  },
  {
    id: "deep-breath",
    name: "Deep Breath",
    prefix: "Deep-Breath",
    suffix: "of Deep Breath",
    stats: { stamina: 18 },
    effects: { vigorBoostCostReduction: 0.12 },
    description: "-12% Vigor boost cost"
  },
  {
    id: "orebound",
    name: "Orebound",
    prefix: "Orebound",
    suffix: "of Rich Veins",
    stats: { defense: 4 },
    effects: { materialResourceMultiplier: { ore: 0.14 } },
    description: "+14% Ore from expeditions"
  },
  {
    id: "scout",
    name: "Scout",
    prefix: "Scout's",
    suffix: "of Quick Routes",
    stats: { speed: 5 },
    effects: { shortMissionSuccessChance: 0.04 },
    description: "+4% success chance in short missions"
  },
  {
    id: "long-hunt",
    name: "Long Hunt",
    prefix: "Long-Hunt",
    suffix: "of Long Hunts",
    stats: { luck: 5 },
    effects: { longMissionLootChance: 0.05 },
    description: "+5% loot chance in long missions"
  },
  {
    id: "coinfall",
    name: "Coinfall",
    prefix: "Coinfall",
    suffix: "of Coinfall",
    stats: { luck: 4 },
    effects: { goldMultiplier: 0.08 },
    description: "+8% Gold from expeditions"
  },
  {
    id: "open-locks",
    name: "Open Locks",
    prefix: "Lock-Open",
    suffix: "of Open Locks",
    stats: { luck: 6 },
    effects: { lootChance: 0.035 },
    description: "+Loot chance"
  },
  {
    id: "prospector",
    name: "Prospector",
    prefix: "Prospector's",
    suffix: "of Surveying",
    stats: { stamina: 10 },
    effects: { materialMultiplier: 0.06 },
    description: "+6% expedition materials"
  },
  {
    id: "runic-echo",
    name: "Runic Echo",
    prefix: "Echo-Runed",
    suffix: "of Runic Echoes",
    stats: { power: 3, luck: 4 },
    effects: { runeMultiplier: 0.08 },
    description: "+8% Rune gains"
  },
  {
    id: "scrap-savvy",
    name: "Scrap Savvy",
    prefix: "Scrap-Savvy",
    suffix: "of Useful Scraps",
    stats: { defense: 3 },
    effects: { salvageMultiplier: 0.12 },
    description: "+12% salvage materials"
  },
  {
    id: "market-kissed",
    name: "Market-Kissed",
    prefix: "Market-Kissed",
    suffix: "of Good Bids",
    stats: { luck: 3 },
    effects: { sellMultiplier: 0.1 },
    description: "+10% sell value"
  },
  {
    id: "giantbreaker",
    name: "Giantbreaker",
    prefix: "Giantbreaker",
    suffix: "of Giantbreakers",
    stats: { power: 5, defense: 3 },
    effects: { bossSuccessChance: 0.045 },
    description: "+4.5% boss success chance"
  },
  {
    id: "sure-steps",
    name: "Sure Steps",
    prefix: "Sure-Step",
    suffix: "of Sure Steps",
    stats: { speed: 3, defense: 3 },
    effects: { successChance: 0.025 },
    description: "+2.5% expedition success chance"
  },
  {
    id: "retreat-maps",
    name: "Retreat Maps",
    prefix: "Map-Marked",
    suffix: "of Retreat Maps",
    stats: { luck: 3, stamina: 8 },
    effects: { failureRewardScale: 0.05 },
    description: "+5% rewards when an expedition fails"
  },
  {
    id: "wayfinder",
    name: "Wayfinder",
    prefix: "Wayfinder",
    suffix: "of Straight Roads",
    stats: { speed: 4, luck: 2 },
    effects: { durationReduction: 0.04 },
    description: "-4% expedition duration"
  },
  {
    id: "prism-sealed",
    name: "Prism-Sealed",
    prefix: "Prism-Sealed",
    suffix: "of Prism Spoils",
    stats: { luck: 4 },
    effects: { materialResourceMultiplier: { crystal: 0.12 } },
    description: "+12% Crystal from expeditions"
  },
  {
    id: "ancient-shards",
    name: "Ancient Shards",
    prefix: "Shard-Hungry",
    suffix: "of Ancient Shards",
    stats: { luck: 4, power: 2 },
    effects: { materialResourceMultiplier: { relicFragment: 0.1 } },
    description: "+10% Relic Fragment gains"
  },
  {
    id: "storm-cache",
    name: "Storm Cache",
    prefix: "Storm-Cache",
    suffix: "of Storm Caches",
    stats: { speed: 3, luck: 4 },
    effects: { materialResourceMultiplier: { rune: 0.1 }, lootChance: 0.015 },
    description: "+10% Rune gains and +Loot chance"
  }
];

export const DAILY_TASK_POOL: { kind: DailyTaskKind; label: string; target: number }[] = [
  { kind: "complete_expeditions", label: "Complete 3 expeditions", target: 3 },
  { kind: "win_expeditions", label: "Win 2 expeditions", target: 2 },
  { kind: "defeat_boss", label: "Defeat 1 boss", target: 1 },
  { kind: "salvage_items", label: "Salvage 3 items", target: 3 },
  { kind: "sell_items", label: "Sell 3 items", target: 3 },
  { kind: "craft_item", label: "Craft 1 item", target: 1 },
  { kind: "upgrade_building", label: "Upgrade 1 building", target: 1 },
  { kind: "spend_vigor", label: "Spend 20 Vigor", target: 20 }
];

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "first-charter", title: "First Charter", description: "Start your first expedition." },
  { id: "first-clear", title: "First Clear", description: "Complete a successful expedition." },
  { id: "five-clears", title: "Five Fine Outings", description: "Complete 5 successful expeditions." },
  { id: "first-boss", title: "Boss Ledger Opened", description: "Defeat your first boss dungeon." },
  { id: "sunlit-boss", title: "Copper Crown Claimed", description: "Clear the Sunlit Marches boss." },
  { id: "emberwood-boss", title: "Heartwood Heroics", description: "Clear the Emberwood boss." },
  { id: "azure-boss", title: "Vault Curator", description: "Clear the Azure Vaults boss." },
  { id: "stormglass-boss", title: "Above the Thunder", description: "Clear the Stormglass Peaks boss." },
  { id: "first-forge-boss", title: "First Forge Victor", description: "Clear the final v1.0 boss." },
  { id: "first-loot", title: "Loot Looks Good", description: "Find your first item." },
  { id: "rare-find", title: "Rare Shine", description: "Find a rare item." },
  { id: "epic-find", title: "Epic Guild Gossip", description: "Find an epic item." },
  { id: "legendary-find", title: "Legendary Bragging Rights", description: "Find a legendary item." },
  { id: "first-sale", title: "Market Manners", description: "Sell an item." },
  { id: "first-salvage", title: "Useful Scraps", description: "Salvage an item." },
  { id: "first-upgrade", title: "Town Improvements", description: "Upgrade any building." },
  { id: "all-buildings", title: "Respectable Guild Town", description: "Upgrade every building at least once." },
  { id: "level-five", title: "Apprentice No More", description: "Reach hero level 5." },
  { id: "level-twelve", title: "Dungeon Professional", description: "Reach hero level 12." },
  { id: "first-prestige", title: "Dynasty Begins", description: "Prestige once." }
];
