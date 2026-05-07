import { INVENTORY_LIMIT } from "./constants";
import { refreshAchievements } from "./achievements";
import { getSellMultiplier } from "./balance";
import { applyDailyProgress, ensureDailies } from "./dailies";
import { getRuneGainPassiveMultiplier } from "./heroes";
import { cloneState } from "./state";
import type { ActionResult, EquipmentSlot, GameState, Item, MaterialBundle } from "./types";
import { regenerateVigor } from "./vigor";

function findInventoryItem(state: GameState, itemId: string): { item: Item; index: number } | null {
  const index = state.inventory.findIndex((item) => item.id === itemId);
  if (index < 0) {
    return null;
  }
  return { item: state.inventory[index], index };
}

function addSalvage(resources: GameState["resources"], salvage: Partial<MaterialBundle>) {
  resources.ore += salvage.ore ?? 0;
  resources.crystal += salvage.crystal ?? 0;
  resources.rune += salvage.rune ?? 0;
  resources.relicFragment += salvage.relicFragment ?? 0;
}

export function equipItem(state: GameState, itemId: string, now: number): ActionResult {
  const found = findInventoryItem(state, itemId);
  if (!found) {
    return { ok: false, state, error: "Item not found in inventory." };
  }

  const slot: EquipmentSlot = found.item.slot;
  const previous = state.equipment[slot];
  if (previous && state.inventory.length >= INVENTORY_LIMIT) {
    return { ok: false, state, error: "Inventory is full, so the equipped item has nowhere to go." };
  }

  const next = cloneState(state);
  regenerateVigor(next, now);
  const dailyPrepared = ensureDailies(next, now);
  const working = dailyPrepared.state;
  const [item] = working.inventory.splice(found.index, 1);
  const oldItem = working.equipment[slot];
  working.equipment[slot] = item;
  if (oldItem) {
    working.inventory.push(oldItem);
  }
  working.updatedAt = now;
  const achievements = refreshAchievements(working, now);
  return { ok: true, state: achievements.state, message: `${item.name} equipped.` };
}

export function sellItem(state: GameState, itemId: string, now: number): ActionResult {
  const found = findInventoryItem(state, itemId);
  if (!found) {
    return { ok: false, state, error: "Item not found in inventory." };
  }

  const next = cloneState(state);
  regenerateVigor(next, now);
  const dailyPrepared = ensureDailies(next, now);
  const working = dailyPrepared.state;
  const [item] = working.inventory.splice(found.index, 1);
  const payout = Math.max(1, Math.floor(item.sellValue * getSellMultiplier(working)));
  working.resources.gold += payout;
  working.lifetime.totalItemsSold += 1;
  working.lifetime.totalGoldEarned += payout;
  const progressed = applyDailyProgress(working, now, { sell_items: 1 });
  const progressedState = progressed.state;
  progressedState.updatedAt = now;
  const achievements = refreshAchievements(progressedState, now);
  return { ok: true, state: achievements.state, message: `${item.name} sold for ${payout} gold.` };
}

export function salvageItem(state: GameState, itemId: string, now: number): ActionResult {
  const found = findInventoryItem(state, itemId);
  if (!found) {
    return { ok: false, state, error: "Item not found in inventory." };
  }

  const next = cloneState(state);
  regenerateVigor(next, now);
  const dailyPrepared = ensureDailies(next, now);
  const working = dailyPrepared.state;
  const [item] = working.inventory.splice(found.index, 1);
  const runeMultiplier = getRuneGainPassiveMultiplier(working);
  const salvage = { ...item.salvageValue, rune: Math.floor((item.salvageValue.rune ?? 0) * runeMultiplier) };
  addSalvage(working.resources, salvage);
  working.lifetime.totalItemsSalvaged += 1;
  const progressed = applyDailyProgress(working, now, { salvage_items: 1 });
  const progressedState = progressed.state;
  progressedState.updatedAt = now;
  const achievements = refreshAchievements(progressedState, now);
  return { ok: true, state: achievements.state, message: `${item.name} salvaged.` };
}
