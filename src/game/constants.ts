import type { BuildingId, EquipmentSlot, ItemRarity, ResourceState, Stats } from "./types";

export const SAVE_KEY = "relic-forge-idle:v1";
export const SAVE_GAME_NAME = "Relic Forge Idle";
export const SAVE_VERSION = 1;
export const GAME_VERSION = 1;
export const INVENTORY_LIMIT = 30;
export const INVENTORY_NEAR_FULL_THRESHOLD = 24;
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;
export const LEVEL_CAP = 30;
export const FINAL_DUNGEON_ID = "crown-of-the-first-forge";
export const REINCARNATION_GATE_BOSS_ID = "curator-of-blue-fire";
export const REINCARNATION_LEVEL_REQUIREMENT = 10;
export const DAILY_TASK_COUNT = 3;
export const DAILY_RESET_HOUR_LOCAL = 23;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const VIGOR_MAX = 100;
export const VIGOR_REGEN_INTERVAL_MS = 5 * 60 * 1000;
export const VIGOR_EXPEDITION_BOOST_COST = 20;
export const VIGOR_EXPEDITION_BOOST_MULTIPLIER = 2;
export const FORGE_AFFIX_REROLL_REQUIRED_LEVEL = 3;
export const REINCARNATION_UPGRADE_MAX = 15;
export const LOOT_DROP_PITY_THRESHOLD = 3;
export const LOOT_FOCUS_SLOT_WEIGHT_MULTIPLIER = 3;
export const LOOT_EARLY_ANTI_DUPLICATE_ITEM_COUNT = 10;
export const LOOT_RECENT_SLOT_MEMORY = 2;

export const EMPTY_STATS: Stats = {
  power: 0,
  defense: 0,
  speed: 0,
  luck: 0,
  stamina: 0
};

export const EMPTY_RESOURCES: ResourceState = {
  gold: 0,
  ore: 0,
  crystal: 0,
  rune: 0,
  relicFragment: 0,
  renown: 0
};

export const EQUIPMENT_SLOTS: EquipmentSlot[] = ["weapon", "helm", "armor", "boots", "relic"];

export const BUILDING_IDS: BuildingId[] = ["forge", "mine", "tavern", "library", "market", "shrine"];

export const RARITIES: ItemRarity[] = ["common", "rare", "epic", "legendary"];

export const RARITY_MULTIPLIER: Record<ItemRarity, number> = {
  common: 1,
  rare: 1.7,
  epic: 2.55,
  legendary: 4.15
};

export const RARITY_LABEL: Record<ItemRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary"
};

export const RENOWN_UPGRADE_MAX = 10;

export const DEBUG_DURATION_MULTIPLIER = 0.16;
export const DEBUG_REWARD_MULTIPLIER = 4;
export const DEBUG_REINCARNATION_MULTIPLIER = 2;
