import {
  EQUIPMENT_SLOTS,
  INVENTORY_LIMIT,
  LOOT_DROP_PITY_THRESHOLD,
  LOOT_EARLY_ANTI_DUPLICATE_ITEM_COUNT,
  LOOT_FOCUS_SLOT_WEIGHT_MULTIPLIER,
  LOOT_RECENT_SLOT_MEMORY,
  RARITY_MULTIPLIER
} from "./constants";
import { getAffixEffectTotal } from "./affixes";
import { AFFIX_POOL, RARITY_PREFIX, SLOT_BASE_NAMES } from "./content";
import { getLootChance, getRarityMultiplier } from "./balance";
import { getItemTraitDefinition, isLegacyTraitAffixId, recordItemIdentityDiscovery, rollItemFamily, rollItemTrait } from "./traits";
import { cloneState } from "./state";
import type { ActionResult, Affix, DungeonDefinition, EquipmentSlot, GameState, Item, ItemRarity, LootFocusId, MaterialBundle, Stats } from "./types";
import type { Rng } from "./rng";

const SLOT_WEIGHTS: { slot: EquipmentSlot; weight: number }[] = [
  { slot: "weapon", weight: 28 },
  { slot: "helm", weight: 18 },
  { slot: "armor", weight: 24 },
  { slot: "boots", weight: 16 },
  { slot: "relic", weight: 14 }
];

function weightedPick<T extends string>(rng: Rng, entries: { value: T; weight: number }[]): T {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng.next() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.value;
    }
  }
  return entries[entries.length - 1].value;
}

export function rollRarity(state: GameState, rng: Rng, bossBonus = false): ItemRarity {
  const entries = [
    { value: "common" as const, weight: 35 },
    { value: "rare" as const, weight: 45 },
    { value: "epic" as const, weight: 15 },
    { value: "legendary" as const, weight: 5 }
  ];

  if (bossBonus) {
    entries[1].weight += 8;
    entries[2].weight += 4;
    entries[3].weight += 1.5;
  }

  const qualityBonus = state.prestige.upgrades.treasureOath;
  entries[0].weight = Math.max(25, entries[0].weight - qualityBonus * 1.2);
  entries[1].weight += qualityBonus * 0.7;
  entries[2].weight += qualityBonus * 0.35;
  entries[3].weight += qualityBonus * 0.15;

  const rareDropBonus = getAffixEffectTotal(state, "rareDropChance") * 100;
  entries[0].weight = Math.max(28, entries[0].weight - rareDropBonus);
  entries[1].weight += rareDropBonus * 0.64;
  entries[2].weight += rareDropBonus * 0.26;
  entries[3].weight += rareDropBonus * 0.1;

  return weightedPick(rng, entries);
}

export function rollSlot(rng: Rng): EquipmentSlot {
  return weightedPick(
    rng,
    SLOT_WEIGHTS.map((entry) => ({ value: entry.slot, weight: entry.weight }))
  );
}

export function isLootFocusId(value: unknown): value is LootFocusId {
  return value === "any" || EQUIPMENT_SLOTS.includes(value as EquipmentSlot);
}

export function setLootFocus(state: GameState, focusSlot: LootFocusId, now: number): ActionResult {
  if (!isLootFocusId(focusSlot)) {
    return { ok: false, state, error: "Unknown loot focus." };
  }

  const next = cloneState(state);
  next.loot.focusSlot = focusSlot;
  next.updatedAt = now;
  return { ok: true, state: next, message: focusSlot === "any" ? "Loot focus cleared." : `Loot focus set to ${focusSlot}.` };
}

export function getLootSlotWeights(state: GameState): { slot: EquipmentSlot; weight: number }[] {
  const focusSlot = isLootFocusId(state.loot?.focusSlot) ? state.loot.focusSlot : "any";
  const earlyAntiDuplicate = state.lifetime.totalItemsFound < LOOT_EARLY_ANTI_DUPLICATE_ITEM_COUNT;
  const recentSlots = new Set((state.loot?.recentSlots ?? []).slice(0, LOOT_RECENT_SLOT_MEMORY));
  return SLOT_WEIGHTS.map((entry) => {
    let weight = entry.weight;
    if (focusSlot === entry.slot) {
      weight *= LOOT_FOCUS_SLOT_WEIGHT_MULTIPLIER;
    }
    if (earlyAntiDuplicate && recentSlots.has(entry.slot) && focusSlot !== entry.slot) {
      weight *= 0.35;
    }
    if (earlyAntiDuplicate && !state.equipment[entry.slot]) {
      weight *= 1.25;
    }
    return { slot: entry.slot, weight };
  });
}

function rollDirectedSlot(state: GameState, rng: Rng): EquipmentSlot {
  return weightedPick(
    rng,
    getLootSlotWeights(state).map((entry) => ({ value: entry.slot, weight: entry.weight }))
  );
}

export function recordLootDrop(state: GameState, slot: EquipmentSlot) {
  state.loot.missesSinceDrop = 0;
  state.loot.recentSlots = [slot, ...state.loot.recentSlots.filter((recentSlot) => recentSlot !== slot)].slice(0, LOOT_RECENT_SLOT_MEMORY);
}

export function recordLootMiss(state: GameState) {
  state.loot.missesSinceDrop = Math.min(LOOT_DROP_PITY_THRESHOLD, state.loot.missesSinceDrop + 1);
}

function affixCountForRarity(rarity: ItemRarity): number {
  if (rarity === "legendary") return 3;
  if (rarity === "epic") return 2;
  if (rarity === "rare") return 1;
  return 1;
}

function slotStats(slot: EquipmentSlot, budget: number): Partial<Stats> {
  switch (slot) {
    case "weapon":
      return { power: Math.ceil(budget * 0.78), speed: Math.floor(budget * 0.22) };
    case "helm":
      return { defense: Math.ceil(budget * 0.45), luck: Math.floor(budget * 0.25), stamina: Math.floor(budget * 1.8) };
    case "armor":
      return { defense: Math.ceil(budget * 0.7), stamina: Math.floor(budget * 3) };
    case "boots":
      return { speed: Math.ceil(budget * 0.65), defense: Math.floor(budget * 0.25) };
    case "relic":
      return { power: Math.ceil(budget * 0.45), luck: Math.ceil(budget * 0.35), defense: Math.floor(budget * 0.2) };
  }
}

function mergeStats(base: Partial<Stats>, addition: Partial<Stats>, scale = 1): Partial<Stats> {
  return {
    power: Math.floor((base.power ?? 0) + (addition.power ?? 0) * scale),
    defense: Math.floor((base.defense ?? 0) + (addition.defense ?? 0) * scale),
    speed: Math.floor((base.speed ?? 0) + (addition.speed ?? 0) * scale),
    luck: Math.floor((base.luck ?? 0) + (addition.luck ?? 0) * scale),
    stamina: Math.floor((base.stamina ?? 0) + (addition.stamina ?? 0) * scale)
  };
}

function compactStats(stats: Partial<Stats>): Partial<Stats> {
  const next: Partial<Stats> = {};
  (Object.keys(stats) as (keyof Stats)[]).forEach((key) => {
    const value = stats[key] ?? 0;
    if (value > 0) {
      next[key] = value;
    }
  });
  return next;
}

function pickAffixes(rng: Rng, count: number, slot: EquipmentSlot): Affix[] {
  const pool = AFFIX_POOL.filter((affix) => !isLegacyTraitAffixId(affix.id) && (!affix.slots || affix.slots.includes(slot)));
  const affixes: Affix[] = [];
  while (affixes.length < count && pool.length > 0) {
    const index = rng.int(0, pool.length - 1);
    affixes.push(pool[index]);
    pool.splice(index, 1);
  }
  return affixes;
}

export function formatItemName(prefix: string, baseName: string, affixes: Affix[]): string {
  const affixPrefix = affixes.find((affix) => affix.prefix)?.prefix;
  const affixSuffix = affixes.find((affix) => affix.suffix)?.suffix;
  return [prefix, affixPrefix, baseName, affixSuffix].filter(Boolean).join(" ");
}

export function createItem(
  state: GameState,
  dungeon: DungeonDefinition,
  rng: Rng,
  runId: number,
  forced?: Partial<Pick<Item, "slot" | "rarity">>,
  options?: { bossBonus?: boolean; useLootDirection?: boolean }
): Item {
  const rarity = forced?.rarity ?? rollRarity(state, rng, options?.bossBonus);
  const slot = forced?.slot ?? (options?.useLootDirection ? rollDirectedSlot(state, rng) : rollSlot(rng));
  const baseName = rng.pick(SLOT_BASE_NAMES[slot]);
  const prefix = rng.pick(RARITY_PREFIX[rarity]);
  const affixes = pickAffixes(rng, affixCountForRarity(rarity), slot);
  const traitId = rollItemTrait(state, slot, rarity, dungeon.zoneId, rng);
  const trait = getItemTraitDefinition(traitId);
  const familyId = rollItemFamily(dungeon.zoneId, rarity, rng);
  const itemLevel = dungeon.lootLevel;
  const rarityMultiplier = getRarityMultiplier(rarity);
  const budget = Math.floor((itemLevel * 3 + dungeon.zoneIndex * 5 + state.town.forge * 2) * rarityMultiplier);
  let stats = slotStats(slot, budget);
  affixes.forEach((affix) => {
    stats = mergeStats(stats, affix.stats, Math.max(1, itemLevel / 8) * (rarity === "legendary" ? 1.25 : 1));
  });
  if (trait) {
    stats = mergeStats(stats, trait.stats, Math.max(1, itemLevel / 10) * (rarity === "legendary" ? 1.2 : 1));
  }
  stats = compactStats(stats);

  const name = formatItemName(prefix, baseName, affixes);
  const sellValue = Math.floor((12 + itemLevel * 7) * RARITY_MULTIPLIER[rarity]);
  const salvageValue: Partial<MaterialBundle> = {
    fragments: Math.max(1, Math.floor(itemLevel * rarityMultiplier * (1 + state.town.mine * 0.05)))
  };

  const item: Item = {
    id: `item-${runId}-${dungeon.id}-${Math.floor(rng.next() * 1_000_000)}`,
    name,
    slot,
    rarity,
    itemLevel,
    upgradeLevel: 0,
    stats,
    affixes,
    traitId,
    familyId,
    locked: false,
    sellValue,
    salvageValue,
    sourceDungeonId: dungeon.id,
    createdAtRunId: runId
  };
  recordItemIdentityDiscovery(state, item);
  return item;
}

export function maybeGenerateLoot(
  state: GameState,
  dungeon: DungeonDefinition,
  rng: Rng,
  runId: number,
  options: { forceDrop?: boolean; bossBonus?: boolean } = {}
): Item | null {
  const firstRunForced = state.lifetime.totalItemsFound === 0 && dungeon.id === "tollroad-of-trinkets";
  if (firstRunForced) {
    return createItem(state, dungeon, rng, runId, { slot: "weapon", rarity: "common" }, options);
  }

  const pityDrop = state.loot.missesSinceDrop >= LOOT_DROP_PITY_THRESHOLD;
  if (options.forceDrop || pityDrop || rng.next() <= getLootChance(state, dungeon)) {
    return createItem(state, dungeon, rng, runId, undefined, { ...options, useLootDirection: true });
  }

  return null;
}

export function inventoryHasSpace(state: GameState): boolean {
  return state.inventory.length < INVENTORY_LIMIT;
}
