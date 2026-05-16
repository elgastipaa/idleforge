import { INVENTORY_LIMIT } from "./constants";
import { getFragmentsAffixMultiplier, getSalvageAffixMultiplier } from "./affixes";
import { refreshAchievements } from "./achievements";
import { getDerivedStats, getDungeon, getItemScore, getSellMultiplier } from "./balance";
import { getBossDefinitionForDungeon } from "./bosses";
import { applyDailyProgress, ensureDailies } from "./dailies";
import { recordRegionDiaryProgress } from "./diaries";
import { getFragmentGainPassiveMultiplier } from "./heroes";
import { cloneState } from "./state";
import { getTraitContextScore, refreshFamilyResonanceCodex } from "./traits";
import type { ActionResult, BuildPresetId, EquipmentSlot, ExpeditionThreatId, GameState, Item, MaterialBundle } from "./types";
import { regenerateFocus } from "./focus";

function findInventoryItem(state: GameState, itemId: string): { item: Item; index: number } | null {
  const index = state.inventory.findIndex((item) => item.id === itemId);
  if (index < 0) {
    return null;
  }
  return { item: state.inventory[index], index };
}

function findAnyItem(state: GameState, itemId: string): { item: Item; source: "inventory" | "equipment"; index?: number; slot?: EquipmentSlot } | null {
  const inventoryItem = findInventoryItem(state, itemId);
  if (inventoryItem) return { ...inventoryItem, source: "inventory" };
  const slot = (Object.keys(state.equipment) as EquipmentSlot[]).find((equipmentSlot) => state.equipment[equipmentSlot]?.id === itemId);
  return slot && state.equipment[slot] ? { item: state.equipment[slot], source: "equipment", slot } : null;
}

function addSalvage(resources: GameState["resources"], salvage: Partial<MaterialBundle>) {
  resources.fragments += salvage.fragments ?? 0;
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
  regenerateFocus(next, now);
  const dailyPrepared = ensureDailies(next, now);
  const working = dailyPrepared.state;
  const beforePower = getDerivedStats(working).powerScore;
  const [item] = working.inventory.splice(found.index, 1);
  const oldItem = working.equipment[slot];
  working.equipment[slot] = item;
  if (oldItem) {
    working.inventory.push(oldItem);
  }
  refreshFamilyResonanceCodex(working);
  working.updatedAt = now;
  const afterPower = getDerivedStats(working).powerScore;
  const powerDelta = afterPower - beforePower;
  const powerText = powerDelta === 0 ? " Power unchanged." : ` Power ${powerDelta > 0 ? "+" : ""}${powerDelta}.`;
  const progressed = applyDailyProgress(working, now, { equip_item: 1 });
  const progressedState = progressed.state;
  progressedState.updatedAt = now;
  const achievements = refreshAchievements(progressedState, now);
  return { ok: true, state: achievements.state, message: `${item.name} equipped.${powerText}` };
}

export function sellItem(state: GameState, itemId: string, now: number): ActionResult {
  const found = findInventoryItem(state, itemId);
  if (!found) {
    return { ok: false, state, error: "Item not found in inventory." };
  }

  const next = cloneState(state);
  regenerateFocus(next, now);
  const dailyPrepared = ensureDailies(next, now);
  const working = dailyPrepared.state;
  const [item] = working.inventory.splice(found.index, 1);
  if (item.locked) {
    return { ok: false, state, error: "Locked items cannot be sold." };
  }
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
  regenerateFocus(next, now);
  const dailyPrepared = ensureDailies(next, now);
  const working = dailyPrepared.state;
  const [item] = working.inventory.splice(found.index, 1);
  if (item.locked) {
    return { ok: false, state, error: "Locked items cannot be salvaged." };
  }
  const salvageMultiplier = getSalvageAffixMultiplier(working);
  const fragmentsMultiplier = getFragmentGainPassiveMultiplier(working) * getFragmentsAffixMultiplier(working);
  const salvage = {
    fragments: Math.floor((item.salvageValue.fragments ?? 0) * salvageMultiplier * fragmentsMultiplier)
  };
  addSalvage(working.resources, salvage);
  working.lifetime.totalItemsSalvaged += 1;
  recordRegionDiaryProgress(working, now, { kind: "salvage_item", sourceDungeonId: item.sourceDungeonId });
  const progressed = applyDailyProgress(working, now, { salvage_items: 1 });
  const progressedState = progressed.state;
  progressedState.updatedAt = now;
  const achievements = refreshAchievements(progressedState, now);
  return { ok: true, state: achievements.state, message: `${item.name} salvaged.` };
}

export function toggleItemLock(state: GameState, itemId: string, now: number): ActionResult {
  const found = findAnyItem(state, itemId);
  if (!found) {
    return { ok: false, state, error: "Item not found." };
  }
  const next = cloneState(state);
  const target = found.source === "inventory" && found.index !== undefined ? next.inventory[found.index] : found.slot ? next.equipment[found.slot] : null;
  if (!target) {
    return { ok: false, state, error: "Item not found." };
  }
  target.locked = !target.locked;
  next.updatedAt = now;
  return { ok: true, state: next, message: target.locked ? `${target.name} locked.` : `${target.name} unlocked.` };
}

function getAllItemsWithLocation(state: GameState): Array<{ item: Item; source: "inventory" | "equipment"; slot: EquipmentSlot }> {
  const inventory = state.inventory.map((item) => ({ item, source: "inventory" as const, slot: item.slot }));
  const equipment = (Object.keys(state.equipment) as EquipmentSlot[])
    .map((slot) => (state.equipment[slot] ? { item: state.equipment[slot] as Item, source: "equipment" as const, slot } : null))
    .filter((entry): entry is { item: Item; source: "equipment"; slot: EquipmentSlot } => Boolean(entry));
  return [...inventory, ...equipment];
}

function applyEquipmentSelection(state: GameState, selectedBySlot: Partial<Record<EquipmentSlot, Item>>) {
  const allItems = getAllItemsWithLocation(state).map((entry) => entry.item);
  const selectedIds = new Set(Object.values(selectedBySlot).filter(Boolean).map((item) => item.id));
  (Object.keys(state.equipment) as EquipmentSlot[]).forEach((slot) => {
    state.equipment[slot] = selectedBySlot[slot] ?? null;
  });
  state.inventory = allItems.filter((item) => !selectedIds.has(item.id));
  refreshFamilyResonanceCodex(state);
}

function getContextForDungeon(state: GameState, dungeonId?: string, regionId?: string): { regionId?: string; threatIds?: ExpeditionThreatId[]; label: string } {
  if (!dungeonId) {
    return { regionId, threatIds: [], label: regionId ? "region" : "general" };
  }
  const dungeon = getDungeon(dungeonId);
  const boss = getBossDefinitionForDungeon(dungeon.id);
  return {
    regionId: dungeon.zoneId,
    threatIds: boss?.threats.map((threat) => threat.id) ?? [],
    label: dungeon.boss ? "boss" : "route"
  };
}

export function equipBestForContext(state: GameState, now: number, options: { dungeonId?: string; regionId?: string } = {}): ActionResult {
  const context = getContextForDungeon(state, options.dungeonId, options.regionId);
  const allItems = getAllItemsWithLocation(state).map((entry) => entry.item);
  const selectedBySlot: Partial<Record<EquipmentSlot, Item>> = {};
  (Object.keys(state.equipment) as EquipmentSlot[]).forEach((slot) => {
    const candidates = allItems.filter((item) => item.slot === slot);
    if (candidates.length === 0) return;
    selectedBySlot[slot] = candidates.reduce((best, item) => {
      const score = getItemScore(item) + getTraitContextScore(item, { regionId: context.regionId, threatIds: context.threatIds });
      const bestScore = getItemScore(best) + getTraitContextScore(best, { regionId: context.regionId, threatIds: context.threatIds });
      return score > bestScore ? item : best;
    }, candidates[0]);
  });

  const next = cloneState(state);
  regenerateFocus(next, now);
  const beforePower = getDerivedStats(next).powerScore;
  applyEquipmentSelection(next, selectedBySlot);
  const afterPower = getDerivedStats(next).powerScore;
  next.updatedAt = now;
  const powerDelta = afterPower - beforePower;
  const powerText = powerDelta === 0 ? " Power unchanged." : ` Power ${powerDelta > 0 ? "+" : ""}${powerDelta}.`;
  return { ok: true, state: next, message: `Best ${context.label} build equipped.${powerText}` };
}

export function saveBuildPreset(state: GameState, presetId: BuildPresetId, now: number): ActionResult {
  const preset = state.buildPresets[presetId];
  if (!preset) {
    return { ok: false, state, error: "Unknown build preset." };
  }
  const next = cloneState(state);
  next.buildPresets[presetId] = {
    ...preset,
    equipmentItemIds: (Object.keys(next.equipment) as EquipmentSlot[]).reduce<Partial<Record<EquipmentSlot, string>>>((ids, slot) => {
      const itemId = next.equipment[slot]?.id;
      if (itemId) ids[slot] = itemId;
      return ids;
    }, {})
  };
  next.updatedAt = now;
  return { ok: true, state: next, message: `${preset.name} saved.` };
}

export function equipBuildPreset(state: GameState, presetId: BuildPresetId, now: number): ActionResult {
  const preset = state.buildPresets[presetId];
  if (!preset) {
    return { ok: false, state, error: "Unknown build preset." };
  }
  const allItems = getAllItemsWithLocation(state).map((entry) => entry.item);
  const selectedBySlot = (Object.keys(preset.equipmentItemIds) as EquipmentSlot[]).reduce<Partial<Record<EquipmentSlot, Item>>>((selection, slot) => {
    const itemId = preset.equipmentItemIds[slot];
    const item = allItems.find((candidate) => candidate.id === itemId && candidate.slot === slot);
    if (item) selection[slot] = item;
    return selection;
  }, {});
  if (Object.keys(selectedBySlot).length === 0) {
    return { ok: false, state, error: `${preset.name} has no available items.` };
  }

  const next = cloneState(state);
  regenerateFocus(next, now);
  const beforePower = getDerivedStats(next).powerScore;
  applyEquipmentSelection(next, selectedBySlot);
  const afterPower = getDerivedStats(next).powerScore;
  next.updatedAt = now;
  const powerDelta = afterPower - beforePower;
  const powerText = powerDelta === 0 ? " Power unchanged." : ` Power ${powerDelta > 0 ? "+" : ""}${powerDelta}.`;
  return { ok: true, state: next, message: `${preset.name} equipped.${powerText}` };
}
