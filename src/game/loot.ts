import { INVENTORY_LIMIT, RARITY_MULTIPLIER } from "./constants";
import { AFFIX_POOL, RARITY_PREFIX, SLOT_BASE_NAMES } from "./content";
import { getLootChance, getRarityMultiplier } from "./balance";
import type { Affix, DungeonDefinition, EquipmentSlot, GameState, Item, ItemRarity, MaterialBundle, Stats } from "./types";
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
    { value: "common" as const, weight: 70 },
    { value: "rare" as const, weight: 22 },
    { value: "epic" as const, weight: 7 },
    { value: "legendary" as const, weight: 1 }
  ];

  if (bossBonus) {
    entries[1].weight += 5;
    entries[2].weight += 2;
    entries[3].weight += 0.5;
  }

  const qualityBonus = state.prestige.upgrades.treasureOath;
  entries[0].weight = Math.max(40, entries[0].weight - qualityBonus * 1.2);
  entries[1].weight += qualityBonus * 0.7;
  entries[2].weight += qualityBonus * 0.35;
  entries[3].weight += qualityBonus * 0.15;

  return weightedPick(rng, entries);
}

export function rollSlot(rng: Rng): EquipmentSlot {
  return weightedPick(
    rng,
    SLOT_WEIGHTS.map((entry) => ({ value: entry.slot, weight: entry.weight }))
  );
}

function affixCountForRarity(rarity: ItemRarity): number {
  if (rarity === "legendary") return 4;
  if (rarity === "epic") return 3;
  if (rarity === "rare") return 2;
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

function pickAffixes(rng: Rng, count: number): Affix[] {
  const pool = [...AFFIX_POOL];
  const affixes: Affix[] = [];
  while (affixes.length < count && pool.length > 0) {
    const index = rng.int(0, pool.length - 1);
    affixes.push(pool[index]);
    pool.splice(index, 1);
  }
  return affixes;
}

export function createItem(
  state: GameState,
  dungeon: DungeonDefinition,
  rng: Rng,
  runId: number,
  forced?: Partial<Pick<Item, "slot" | "rarity">>,
  options?: { bossBonus?: boolean }
): Item {
  const rarity = forced?.rarity ?? rollRarity(state, rng, options?.bossBonus);
  const slot = forced?.slot ?? rollSlot(rng);
  const baseName = rng.pick(SLOT_BASE_NAMES[slot]);
  const prefix = rng.pick(RARITY_PREFIX[rarity]);
  const affixes = pickAffixes(rng, affixCountForRarity(rarity));
  const itemLevel = dungeon.lootLevel;
  const rarityMultiplier = getRarityMultiplier(rarity);
  const budget = Math.floor((itemLevel * 3 + dungeon.zoneIndex * 5 + state.town.forge * 2) * rarityMultiplier);
  let stats = slotStats(slot, budget);
  affixes.forEach((affix) => {
    stats = mergeStats(stats, affix.stats, Math.max(1, itemLevel / 8) * (rarity === "legendary" ? 1.25 : 1));
  });
  stats = compactStats(stats);

  const affixName = rarity === "common" ? affixes[0]?.name ?? "" : affixes.slice(0, 2).map((affix) => affix.name).join(" ");
  const name = `${prefix} ${baseName}${affixName ? ` ${affixName}` : ""}`;
  const sellValue = Math.floor((12 + itemLevel * 7) * RARITY_MULTIPLIER[rarity]);
  const salvageValue: Partial<MaterialBundle> = {
    ore: Math.max(1, Math.floor(itemLevel * rarityMultiplier * (1 + state.town.mine * 0.05))),
    crystal: rarity === "common" ? 0 : Math.floor(itemLevel * 0.45 * rarityMultiplier),
    rune: rarity === "epic" || rarity === "legendary" ? Math.max(1, Math.floor(itemLevel * 0.16 * rarityMultiplier)) : 0,
    relicFragment: rarity === "legendary" ? Math.max(1, Math.floor(itemLevel / 12)) : 0
  };

  return {
    id: `item-${runId}-${dungeon.id}-${Math.floor(rng.next() * 1_000_000)}`,
    name,
    slot,
    rarity,
    itemLevel,
    upgradeLevel: 0,
    stats,
    affixes,
    sellValue,
    salvageValue,
    sourceDungeonId: dungeon.id,
    createdAtRunId: runId
  };
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

  if (options.forceDrop || rng.next() <= getLootChance(state, dungeon)) {
    return createItem(state, dungeon, rng, runId, undefined, options);
  }

  return null;
}

export function inventoryHasSpace(state: GameState): boolean {
  return state.inventory.length < INVENTORY_LIMIT;
}
