import { INVENTORY_LIMIT } from "./constants";
import { DUNGEONS } from "./content";
import { applyDailyProgress, ensureDailies } from "./dailies";
import { getCraftMaterialDiscount, getRuneGainPassiveMultiplier } from "./heroes";
import { createItem } from "./loot";
import { createRng } from "./rng";
import { cloneState } from "./state";
import type { ActionResult, EquipmentSlot, GameState, Item, ResourceState } from "./types";
import { regenerateVigor } from "./vigor";
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
  const discount = getCraftMaterialDiscount(state);
  if (discount <= 0) {
    return cost;
  }
  const discounted = { ...cost };
  (["ore", "crystal", "rune", "relicFragment"] as const).forEach((resource) => {
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
    gold: Math.floor(80 + level * 22),
    ore: Math.floor(6 + level * 0.9),
    crystal: Math.max(0, Math.floor((level - 8) * 0.45)),
    rune: Math.max(0, Math.floor((level - 18) * 0.22)),
    relicFragment: level >= 45 ? Math.max(1, Math.floor((level - 40) * 0.12)) : 0
  };
  return applyMaterialDiscount(state, base);
}

function addSalvage(state: GameState, item: Item) {
  const runeMultiplier = getRuneGainPassiveMultiplier(state);
  state.resources.ore += item.salvageValue.ore ?? 0;
  state.resources.crystal += item.salvageValue.crystal ?? 0;
  state.resources.rune += Math.floor((item.salvageValue.rune ?? 0) * runeMultiplier);
  state.resources.relicFragment += item.salvageValue.relicFragment ?? 0;
}

export function craftItem(state: GameState, now: number, options: ForgeCraftOptions = {}): ActionResult {
  let next = cloneState(state);
  regenerateVigor(next, now);
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
    ore: Math.max(1, Math.floor((next.salvageValue.ore ?? 0) * 1.12)),
    crystal: Math.floor((next.salvageValue.crystal ?? 0) * 1.12),
    rune: Math.floor((next.salvageValue.rune ?? 0) * 1.12),
    relicFragment: Math.floor((next.salvageValue.relicFragment ?? 0) * 1.06)
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
    ore: Math.floor(4 * Math.pow(1.4, level) + item.itemLevel * 0.6),
    crystal: Math.max(0, Math.floor(item.itemLevel * 0.2 + level)),
    rune: item.rarity === "epic" || item.rarity === "legendary" ? Math.max(1, Math.floor(item.itemLevel * 0.08 + level * 0.5)) : 0,
    relicFragment: item.rarity === "legendary" ? Math.max(1, Math.floor(level / 3)) : 0
  };
  return applyMaterialDiscount(state, base);
}

export function upgradeItem(state: GameState, itemId: string, now: number): ActionResult {
  let next = cloneState(state);
  regenerateVigor(next, now);
  next = ensureDailies(next, now).state;

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
  return { ok: true, state: next, message: `${upgraded.name} upgraded to +${upgraded.upgradeLevel}.` };
}
