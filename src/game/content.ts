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
    durationMs: 15_000,
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
    durationMs: 30_000,
    power: 15,
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
    durationMs: 60_000,
    power: 28,
    baseXp: 78,
    baseGold: 62,
    materials: { ore: 4, crystal: 1 },
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
    durationMs: 180_000,
    power: 48,
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
    power: 62,
    baseXp: 210,
    baseGold: 175,
    materials: { ore: 10, crystal: 3 },
    lootLevel: 8,
    classModifiers: { rogue: 0.03 },
    minLevel: 4,
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
    durationMs: 300_000,
    power: 82,
    baseXp: 285,
    baseGold: 235,
    materials: { ore: 12, crystal: 5 },
    lootLevel: 10,
    classModifiers: { mage: 0.04 },
    minLevel: 5,
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
    durationMs: 300_000,
    power: 108,
    baseXp: 380,
    baseGold: 310,
    materials: { ore: 16, crystal: 6, rune: 1 },
    lootLevel: 13,
    classModifiers: { warrior: 0.02, rogue: 0.02 },
    minLevel: 6,
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
    durationMs: 300_000,
    power: 142,
    baseXp: 520,
    baseGold: 440,
    materials: { ore: 20, crystal: 9, rune: 2 },
    lootLevel: 16,
    classModifiers: { mage: 0.03, warrior: 0.02 },
    minLevel: 7,
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
    durationMs: 300_000,
    power: 170,
    baseXp: 650,
    baseGold: 560,
    materials: { crystal: 12, rune: 3 },
    lootLevel: 19,
    classModifiers: { mage: 0.04 },
    minLevel: 8,
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
    durationMs: 300_000,
    power: 214,
    baseXp: 820,
    baseGold: 710,
    materials: { crystal: 15, rune: 4 },
    lootLevel: 22,
    classModifiers: { rogue: 0.02, mage: 0.02 },
    minLevel: 9,
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
    durationMs: 300_000,
    power: 268,
    baseXp: 1020,
    baseGold: 910,
    materials: { crystal: 18, rune: 6 },
    lootLevel: 26,
    classModifiers: { warrior: 0.02, mage: 0.03 },
    minLevel: 10,
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
    durationMs: 600_000,
    power: 335,
    baseXp: 1280,
    baseGold: 1180,
    materials: { crystal: 22, rune: 8, relicFragment: 1 },
    lootLevel: 30,
    classModifiers: { mage: 0.04 },
    minLevel: 11,
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

export const BUILDINGS: BuildingDefinition[] = [
  {
    id: "forge",
    name: "Forge",
    description: "Improves future gear and adds raw hero power.",
    maxLevel: 12,
    baseCost: { gold: 80, ore: 8 },
    effectText: (level) => `+${level * 3} power, +${level * 2} item stat budget`
  },
  {
    id: "mine",
    name: "Mine",
    description: "Increases materials recovered from successful expeditions.",
    maxLevel: 12,
    baseCost: { gold: 95, ore: 10 },
    effectText: (level) => `+${level * 10}% expedition materials`
  },
  {
    id: "tavern",
    name: "Tavern",
    description: "Keeps heroes rested, famous, and suspiciously well-fed.",
    maxLevel: 12,
    baseCost: { gold: 120, ore: 10, crystal: 1 },
    effectText: (level) => `+${level * 6}% XP, +${level * 4} stamina`
  },
  {
    id: "library",
    name: "Library",
    description: "Turns dusty relic notes into better success chances and luck.",
    maxLevel: 12,
    baseCost: { gold: 150, crystal: 4 },
    effectText: (level) => `+${(level * 0.8).toFixed(1)}% success, +${level * 2} luck`
  },
  {
    id: "market",
    name: "Market",
    description: "Improves gold rewards and sell prices.",
    maxLevel: 12,
    baseCost: { gold: 110, ore: 6 },
    effectText: (level) => `+${level * 7}% gold, +${level * 12}% sell value`
  },
  {
    id: "shrine",
    name: "Shrine",
    description: "Focuses guild legacy into prestige momentum and steady power.",
    maxLevel: 12,
    baseCost: { gold: 220, crystal: 5, rune: 1 },
    effectText: (level) => `+${level * 2} power score, +${level * 4}% Renown on prestige`
  }
];

export const SLOT_BASE_NAMES: Record<EquipmentSlot, string[]> = {
  weapon: ["Blade", "Hammer", "Wand", "Saber", "Staff"],
  helm: ["Helm", "Cowl", "Crown", "Mask", "Hood"],
  armor: ["Mail", "Robe", "Plate", "Vest", "Mantle"],
  boots: ["Boots", "Greaves", "Treads", "Sandals", "Sabatons"],
  relic: ["Sigil", "Compass", "Lantern", "Charm", "Icon"]
};

export const RARITY_PREFIX: Record<ItemRarity, string[]> = {
  common: ["Trusty", "Polished", "Stout", "Bright"],
  rare: ["Runesung", "Gleaming", "Valiant", "Enchanted"],
  epic: ["Starforged", "Mythic", "Guildblessed", "Aurelian"],
  legendary: ["Legendary", "Dynasty-Bound", "First-Forged", "Crownlit"]
};

export const AFFIX_POOL: Affix[] = [
  { id: "might", name: "of Might", stats: { power: 8 } },
  { id: "guarding", name: "of Guarding", stats: { defense: 8 } },
  { id: "haste", name: "of Haste", stats: { speed: 7 } },
  { id: "fortune", name: "of Fortune", stats: { luck: 7 } },
  { id: "vitality", name: "of Vitality", stats: { stamina: 24 } },
  { id: "embers", name: "of Embers", stats: { power: 5, luck: 4 } },
  { id: "oaths", name: "of Oaths", stats: { defense: 5, stamina: 16 } },
  { id: "swift-relics", name: "of Swift Relics", stats: { speed: 5, power: 4 } },
  { id: "scholars", name: "of Scholars", stats: { luck: 5, defense: 4 } }
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
