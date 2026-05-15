import { FORGE_AFFIX_REROLL_REQUIRED_LEVEL, INVENTORY_LIMIT, RARITY_MULTIPLIER } from "./constants";
import { getCraftingAffixDiscount, getFragmentsAffixMultiplier, getSalvageAffixMultiplier } from "./affixes";
import { AFFIX_POOL, DUNGEONS, RARITY_PREFIX, SLOT_BASE_NAMES } from "./content";
import { applyDailyProgress, ensureDailies } from "./dailies";
import { getDerivedStats } from "./balance";
import { getCraftMaterialDiscount, getFragmentGainPassiveMultiplier } from "./heroes";
import { createItem, formatItemName } from "./loot";
import { createRng } from "./rng";
import { cloneState } from "./state";
import type { ActionResult, Affix, EquipmentSlot, GameState, Item, ResourceState, Stats } from "./types";
import { regenerateFocus } from "./focus";
import { isDungeonUnlocked } from "./expeditions";

type ForgeCraftOptions = {
  slot?: EquipmentSlot;
  classBias?: boolean;
};

function getAnchorDungeon(state: GameState) {
  const unlocked = DUNGEONS.filter((dungeon) => isDungeonUnlocked(state, dungeon));
  if (unlocked.length === 0) {
    return DUNGEONS[0];
  }
  return unlocked.reduce((best, current) => {
    if (current.lootLevel > best.lootLevel) return current;
    return best;
  }, unlocked[0]);
}

function classBiasedSlot(state: GameState, rng: ReturnType<typeof createRng>): EquipmentSlot {
  if (state.hero.classId === "warrior") {
    return rng.pick(["weapon", "armor", "helm", "boots", "relic"]);
  }
  if (state.hero.classId === "rogue") {
    return rng.pick(["weapon", "boots", "relic", "helm", "armor"]);
  }
  return rng.pick(["weapon", "relic", "helm", "armor", "boots"]);
}

function applyMaterialDiscount(state: GameState, cost: Partial<ResourceState>): Partial<ResourceState> {
  const discount = Math.min(0.5, getCraftMaterialDiscount(state) + getCraftingAffixDiscount(state));
  if (discount <= 0) {
    return cost;
  }
  const discounted = { ...cost };
  (["fragments"] as const).forEach((resource) => {
    const value = discounted[resource] ?? 0;
    if (value > 0) {
      discounted[resource] = Math.max(1, Math.floor(value * (1 - discount)));
    }
  });
  return discounted;
}

function canAfford(resources: ResourceState, cost: Partial<ResourceState>): boolean {
  return (Object.keys(cost) as (keyof ResourceState)[]).every((resource) => resources[resource] >= (cost[resource] ?? 0));
}

function deductCost(state: GameState, cost: Partial<ResourceState>) {
  (Object.keys(cost) as (keyof ResourceState)[]).forEach((resource) => {
    state.resources[resource] -= cost[resource] ?? 0;
  });
}

export function getCraftCost(state: GameState): Partial<ResourceState> {
  const dungeon = getAnchorDungeon(state);
  const level = dungeon.lootLevel;
  const base: Partial<ResourceState> = {
    gold: Math.floor(45 + level * 12),
    fragments: Math.floor(
      3 +
        level * 0.9 +
        Math.max(0, level - 8) * 0.9 +
        Math.max(0, level - 18) * 1.1 +
        Math.max(0, level - 40) * 1.2
    )
  };
  return applyMaterialDiscount(state, base);
}

function addSalvage(state: GameState, item: Item) {
  const salvageMultiplier = getSalvageAffixMultiplier(state);
  const fragmentsMultiplier = getFragmentGainPassiveMultiplier(state) * getFragmentsAffixMultiplier(state);
  state.resources.fragments += Math.floor((item.salvageValue.fragments ?? 0) * salvageMultiplier * fragmentsMultiplier);
}

export function craftItem(state: GameState, now: number, options: ForgeCraftOptions = {}): ActionResult {
  let next = cloneState(state);
  regenerateFocus(next, now);
  next = ensureDailies(next, now).state;

  const cost = getCraftCost(next);
  if (!canAfford(next.resources, cost)) {
    return { ok: false, state, error: "Not enough resources to craft." };
  }

  deductCost(next, cost);
  const runId = next.nextRunId;
  next.nextRunId += 1;
  const anchor = getAnchorDungeon(next);
  const rng = createRng(`${next.seed}:forge-craft:${runId}`);
  const forcedSlot = options.slot ?? (options.classBias ? classBiasedSlot(next, rng) : undefined);
  const crafted = createItem(next, anchor, rng, runId, forcedSlot ? { slot: forcedSlot } : undefined);
  crafted.sourceDungeonId = "forge-craft";

  next.lifetime.totalItemsCrafted += 1;
  next.lifetime.totalItemsFound += 1;
  let overflow = false;
  if (next.inventory.length < INVENTORY_LIMIT) {
    next.inventory.push(crafted);
  } else {
    addSalvage(next, crafted);
    overflow = true;
  }

  const progress = applyDailyProgress(next, now, { craft_item: 1 });
  next = progress.state;
  next.updatedAt = now;

  return {
    ok: true,
    state: next,
    message: overflow ? `${crafted.name} crafted and auto-salvaged because inventory is full.` : `${crafted.name} crafted.`
  };
}

function scaleItemStats(item: Item): Item {
  const next: Item = structuredClone(item) as Item;
  next.upgradeLevel += 1;
  next.itemLevel += 1;
  (Object.keys(next.stats) as (keyof Item["stats"])[]).forEach((key) => {
    const value = next.stats[key] ?? 0;
    if (value > 0) {
      next.stats[key] = Math.max(value + 1, Math.floor(value * 1.08));
    }
  });
  next.sellValue = Math.max(1, Math.floor(next.sellValue * 1.12));
  next.salvageValue = {
    fragments: Math.max(1, Math.floor((next.salvageValue.fragments ?? 0) * 1.12))
  };
  return next;
}

function findItem(state: GameState, itemId: string): { source: "inventory" | "equipment"; index?: number; slot?: EquipmentSlot; item: Item } | null {
  const inventoryIndex = state.inventory.findIndex((item) => item.id === itemId);
  if (inventoryIndex >= 0) {
    return { source: "inventory", index: inventoryIndex, item: state.inventory[inventoryIndex] };
  }

  const slot = (Object.keys(state.equipment) as EquipmentSlot[]).find((equipmentSlot) => state.equipment[equipmentSlot]?.id === itemId);
  if (!slot) return null;
  const item = state.equipment[slot];
  if (!item) return null;
  return { source: "equipment", slot, item };
}

export function getItemUpgradeCost(state: GameState, item: Item): Partial<ResourceState> {
  const level = item.upgradeLevel;
  const base: Partial<ResourceState> = {
    gold: Math.floor(40 * Math.pow(1.45, level) + item.itemLevel * 12),
    fragments:
      Math.floor(4 * Math.pow(1.4, level) + item.itemLevel * 0.8) +
      (item.rarity === "epic" || item.rarity === "legendary" ? Math.max(1, Math.floor(item.itemLevel * 0.25 + level)) : 0) +
      (item.rarity === "legendary" ? Math.max(1, Math.floor(level / 2)) : 0)
  };
  return applyMaterialDiscount(state, base);
}

export function getAffixRerollCost(state: GameState, item: Item): Partial<ResourceState> {
  const rarityMultiplier = RARITY_MULTIPLIER[item.rarity];
  const base: Partial<ResourceState> = {
    gold: Math.floor((30 + item.itemLevel * 9 + item.upgradeLevel * 18) * rarityMultiplier),
    fragments:
      Math.max(1, Math.floor((2 + item.itemLevel * 0.55 + item.upgradeLevel) * rarityMultiplier)) +
      (item.rarity === "epic" || item.rarity === "legendary" ? Math.max(1, Math.floor(item.itemLevel * 0.2 + item.upgradeLevel * 0.7)) : 0) +
      (item.rarity === "legendary" ? Math.max(1, Math.floor(item.upgradeLevel / 3)) : 0)
  };
  return applyMaterialDiscount(state, base);
}

function getAffixStatScale(item: Item): number {
  return Math.max(1, item.itemLevel / 8) * (item.rarity === "legendary" ? 1.25 : 1);
}

function getScaledAffixStats(item: Item, affix: Affix): Partial<Stats> {
  const scale = getAffixStatScale(item);
  const stats: Partial<Stats> = {};
  (Object.keys(affix.stats) as (keyof Stats)[]).forEach((stat) => {
    const value = affix.stats[stat] ?? 0;
    if (value > 0) {
      stats[stat] = Math.floor(value * scale);
    }
  });
  return stats;
}

function applyAffixStatDelta(item: Item, previous: Affix, replacement: Affix): Item {
  const next = structuredClone(item) as Item;
  const previousStats = getScaledAffixStats(item, previous);
  const replacementStats = getScaledAffixStats(item, replacement);
  const stats: Partial<Stats> = { ...next.stats };

  (["power", "defense", "speed", "luck", "stamina"] as const).forEach((stat) => {
    const value = (stats[stat] ?? 0) - (previousStats[stat] ?? 0) + (replacementStats[stat] ?? 0);
    if (value > 0) {
      stats[stat] = value;
    } else {
      delete stats[stat];
    }
  });

  next.stats = stats;
  return next;
}

function pickReplacementAffix(item: Item, affixIndex: number, rng: ReturnType<typeof createRng>): Affix | null {
  const existingIds = new Set(item.affixes.map((affix) => affix.id));
  const current = item.affixes[affixIndex];
  if (!current) return null;
  const pool = AFFIX_POOL.filter((affix) => (!affix.slots || affix.slots.includes(item.slot)) && !existingIds.has(affix.id));
  if (pool.length === 0) return null;
  return rng.pick(pool);
}

function renameRerolledItem(item: Item, rng: ReturnType<typeof createRng>): string {
  return formatItemName(rng.pick(RARITY_PREFIX[item.rarity]), rng.pick(SLOT_BASE_NAMES[item.slot]), item.affixes);
}

export function upgradeItem(state: GameState, itemId: string, now: number): ActionResult {
  let next = cloneState(state);
  regenerateFocus(next, now);
  next = ensureDailies(next, now).state;
  const beforePower = getDerivedStats(next).powerScore;

  const located = findItem(next, itemId);
  if (!located) {
    return { ok: false, state, error: "Item not found." };
  }
  if (located.item.upgradeLevel >= 10) {
    return { ok: false, state, error: "That item is already at max forge upgrades." };
  }

  const cost = getItemUpgradeCost(next, located.item);
  if (!canAfford(next.resources, cost)) {
    return { ok: false, state, error: "Not enough resources to upgrade this item." };
  }
  deductCost(next, cost);
  const upgraded = scaleItemStats(located.item);
  if (located.source === "inventory" && typeof located.index === "number") {
    next.inventory[located.index] = upgraded;
  } else if (located.source === "equipment" && located.slot) {
    next.equipment[located.slot] = upgraded;
  }
  next.updatedAt = now;
  const afterPower = getDerivedStats(next).powerScore;
  const powerDelta = afterPower - beforePower;
  const powerText = located.source === "equipment" && powerDelta !== 0 ? ` Power ${powerDelta > 0 ? "+" : ""}${powerDelta}.` : "";
  return { ok: true, state: next, message: `${upgraded.name} upgraded to +${upgraded.upgradeLevel}.${powerText}` };
}

export function rerollItemAffix(state: GameState, itemId: string, affixIndex: number, now: number): ActionResult {
  let next = cloneState(state);
  regenerateFocus(next, now);
  next = ensureDailies(next, now).state;
  const beforePower = getDerivedStats(next).powerScore;

  if (next.town.forge < FORGE_AFFIX_REROLL_REQUIRED_LEVEL) {
    return { ok: false, state, error: `Forge level ${FORGE_AFFIX_REROLL_REQUIRED_LEVEL} required to reroll affixes.` };
  }

  const located = findItem(next, itemId);
  if (!located) {
    return { ok: false, state, error: "Item not found." };
  }
  if (!Number.isInteger(affixIndex) || affixIndex < 0 || affixIndex >= located.item.affixes.length) {
    return { ok: false, state, error: "Affix not found." };
  }

  const cost = getAffixRerollCost(next, located.item);
  if (!canAfford(next.resources, cost)) {
    return { ok: false, state, error: "Not enough resources to reroll this affix." };
  }

  const runId = next.nextRunId;
  next.nextRunId += 1;
  const rng = createRng(`${next.seed}:forge-reroll:${runId}:${itemId}:${affixIndex}`);
  const replacement = pickReplacementAffix(located.item, affixIndex, rng);
  if (!replacement) {
    return { ok: false, state, error: "No eligible replacement affix is available for this item." };
  }

  deductCost(next, cost);
  const previous = located.item.affixes[affixIndex];
  const rerolled = applyAffixStatDelta(located.item, previous, replacement);
  rerolled.affixes[affixIndex] = replacement;
  rerolled.name = renameRerolledItem(rerolled, rng);

  if (located.source === "inventory" && typeof located.index === "number") {
    next.inventory[located.index] = rerolled;
  } else if (located.source === "equipment" && located.slot) {
    next.equipment[located.slot] = rerolled;
  }

  next.updatedAt = now;
  const afterPower = getDerivedStats(next).powerScore;
  const powerDelta = located.source === "equipment" && afterPower !== beforePower ? ` Power ${afterPower > beforePower ? "+" : ""}${afterPower - beforePower}.` : "";
  return { ok: true, state: next, message: `${previous.name} rerolled into ${replacement.name} on ${rerolled.name}.${powerDelta}` };
}
