import { EQUIPMENT_SLOTS } from "./constants";
import type {
  EquipmentSlot,
  FamilyResonanceSummary,
  GameState,
  Item,
  ItemFamilyDefinition,
  ItemFamilyId,
  ItemTraitDefinition,
  ItemTraitId,
  ItemRarity,
  ExpeditionThreatId,
  RegionMaterialId
} from "./types";
import type { Rng } from "./rng";

export const ITEM_TRAITS: ItemTraitDefinition[] = [
  {
    id: "piercing",
    name: "Piercing",
    category: "tactical",
    description: "Counters armored threats; +2% success on armored routes.",
    slots: ["weapon", "relic"],
    stats: { power: 4, speed: 3 },
    countersThreatId: "armored",
    effects: { successChance: 0.02 }
  },
  {
    id: "guarded",
    name: "Guarded",
    category: "tactical",
    description: "Counters brutal threats; +3% rewards from failed expeditions.",
    slots: ["helm", "armor", "boots"],
    stats: { defense: 4, stamina: 10 },
    countersThreatId: "brutal",
    effects: { failureRewardScale: 0.03 }
  },
  {
    id: "flame-sealed",
    name: "Flame-Sealed",
    category: "tactical",
    description: "Counters regenerating threats; +3% Ember Resin yield.",
    slots: ["weapon", "armor", "relic"],
    stats: { power: 3, defense: 4 },
    countersThreatId: "regenerating",
    effects: { regionalMaterialMultiplier: { emberResin: 0.03 } }
  },
  {
    id: "antivenom",
    name: "Antivenom",
    category: "tactical",
    description: "Counters venom threats.",
    slots: ["helm", "armor", "relic"],
    stats: { defense: 3, luck: 4 },
    countersThreatId: "venom"
  },
  {
    id: "trailwise",
    name: "Trailwise",
    category: "tactical",
    description: "Counters elusive threats; -3% expedition duration.",
    slots: ["boots", "relic"],
    stats: { speed: 4, luck: 2 },
    countersThreatId: "elusive",
    effects: { durationReduction: 0.03 }
  },
  {
    id: "ward-bound",
    name: "Ward-Bound",
    category: "tactical",
    description: "Counters cursed threats; +3% collection chance.",
    slots: ["helm", "armor", "relic"],
    stats: { luck: 4, stamina: 8 },
    countersThreatId: "cursed",
    effects: { collectionChance: 0.03 }
  },
  {
    id: "sunlit-surveyor",
    name: "Sunlit Surveyor",
    category: "regional",
    description: "+3% Sunlit Timber yield and +2% Sunlit Mastery XP.",
    slots: ["weapon", "boots", "relic"],
    stats: { speed: 3, luck: 3 },
    regionId: "sunlit-marches",
    effects: { regionalMaterialMultiplier: { sunlitTimber: 0.03 }, masteryXpMultiplier: { "sunlit-marches": 0.02 } }
  },
  {
    id: "ember-seeker",
    name: "Ember Seeker",
    category: "regional",
    description: "+3% Ember Resin yield and +4% Emberwood Gold.",
    slots: ["weapon", "armor", "relic"],
    stats: { power: 3, luck: 3 },
    regionId: "emberwood",
    effects: { regionalMaterialMultiplier: { emberResin: 0.03 }, zoneGoldMultiplier: { emberwood: 0.04 } }
  },
  {
    id: "route-scholar",
    name: "Route Scholar",
    category: "progress",
    description: "+3% Account XP from expedition progress.",
    slots: ["helm", "relic"],
    stats: { luck: 5 },
    effects: { accountXpMultiplier: 0.03 }
  },
  {
    id: "guild-appraiser",
    name: "Guild Appraiser",
    category: "progress",
    description: "+6% sell and salvage value.",
    slots: ["helm", "relic"],
    stats: { luck: 3, defense: 2 },
    effects: { sellMultiplier: 0.06, salvageMultiplier: 0.06 }
  }
];

export const ITEM_FAMILIES: ItemFamilyDefinition[] = [
  {
    id: "sunlitCharter",
    name: "Sunlit Charter",
    regionId: "sunlit-marches",
    active: true,
    rank1Text: "+2% Sunlit Mastery XP.",
    rank2Text: "+4% Sunlit Timber yield and -1 Focus scout cost in Sunlit bosses."
  },
  {
    id: "emberboundKit",
    name: "Emberbound Kit",
    regionId: "emberwood",
    active: true,
    rank1Text: "+2% Ember Resin yield.",
    rank2Text: "-10% Emberwood prep material cost and +0.25 coverage against Regenerating."
  },
  {
    id: "azureLedger",
    name: "Azure Ledger",
    regionId: "azure-vaults",
    active: false,
    rank1Text: "Dormant until Azure Vaults expansion.",
    rank2Text: "Dormant until Azure Vaults expansion."
  },
  {
    id: "stormglassSurvey",
    name: "Stormglass Survey",
    regionId: "stormglass-peaks",
    active: false,
    rank1Text: "Dormant until Stormglass expansion.",
    rank2Text: "Dormant until Stormglass expansion."
  },
  {
    id: "firstForgeOath",
    name: "First Forge Oath",
    regionId: "first-forge",
    active: false,
    rank1Text: "Dormant until First Forge expansion.",
    rank2Text: "Dormant until First Forge expansion."
  }
];

const TACTICAL_TRAIT_IDS = new Set<ItemTraitId>(ITEM_TRAITS.filter((trait) => trait.category === "tactical").map((trait) => trait.id));
const LEGACY_TRAIT_AFFIX_IDS = new Set<string>(ITEM_TRAITS.map((trait) => trait.id));

export function isLegacyTraitAffixId(affixId: string): boolean {
  return LEGACY_TRAIT_AFFIX_IDS.has(affixId);
}

export function isItemTraitId(value: unknown): value is ItemTraitId {
  return typeof value === "string" && ITEM_TRAITS.some((trait) => trait.id === value);
}

export function isItemFamilyId(value: unknown): value is ItemFamilyId {
  return typeof value === "string" && ITEM_FAMILIES.some((family) => family.id === value);
}

export function getItemTraitDefinition(traitId: ItemTraitId | string | null | undefined): ItemTraitDefinition | null {
  if (!traitId) return null;
  return ITEM_TRAITS.find((trait) => trait.id === traitId) ?? null;
}

export function getItemFamilyDefinition(familyId: ItemFamilyId | string | null | undefined): ItemFamilyDefinition | null {
  if (!familyId) return null;
  return ITEM_FAMILIES.find((family) => family.id === familyId) ?? null;
}

export function getEquippedItemTraits(state: GameState): ItemTraitDefinition[] {
  return EQUIPMENT_SLOTS.map((slot) => getItemTraitDefinition(state.equipment[slot]?.traitId)).filter((trait): trait is ItemTraitDefinition => Boolean(trait));
}

export function getEquippedTraitEffectTotal(state: GameState, key: keyof NonNullable<ItemTraitDefinition["effects"]>): number {
  return getEquippedItemTraits(state).reduce((total, trait) => {
    const value = trait.effects?.[key];
    return total + (typeof value === "number" ? value : 0);
  }, 0);
}

export function getEquippedTraitRegionalMaterialBonus(state: GameState, materialId: RegionMaterialId): number {
  return getEquippedItemTraits(state).reduce((total, trait) => total + (trait.effects?.regionalMaterialMultiplier?.[materialId] ?? 0), 0);
}

export function getEquippedTraitMasteryBonus(state: GameState, regionId: string): number {
  return getEquippedItemTraits(state).reduce((total, trait) => total + (trait.effects?.masteryXpMultiplier?.[regionId] ?? 0), 0);
}

export function getEquippedTraitAccountXpBonus(state: GameState): number {
  return getEquippedTraitEffectTotal(state, "accountXpMultiplier");
}

export function getEquippedTraitCollectionChanceBonus(state: GameState): number {
  return getEquippedTraitEffectTotal(state, "collectionChance");
}

export function getEquippedTraitThreatCoverage(state: GameState, threatId: ExpeditionThreatId): number {
  return getEquippedItemTraits(state).some((trait) => trait.countersThreatId === threatId) ? 1 : 0;
}

function getFamilyEquippedCount(state: GameState, familyId: ItemFamilyId): number {
  return EQUIPMENT_SLOTS.reduce((count, slot) => count + (state.equipment[slot]?.familyId === familyId ? 1 : 0), 0);
}

export function getFamilyResonanceSummaries(state: GameState): FamilyResonanceSummary[] {
  return ITEM_FAMILIES.map((family) => {
    const equippedCount = getFamilyEquippedCount(state, family.id);
    return {
      family,
      equippedCount,
      rank: equippedCount >= 3 ? 2 : equippedCount >= 2 ? 1 : 0
    };
  });
}

export function getActiveFamilyResonance(state: GameState): FamilyResonanceSummary | null {
  const summaries = getFamilyResonanceSummaries(state).filter((summary) => summary.family.active && summary.rank > 0);
  if (summaries.length === 0) return null;
  const selectedFamilyId = state.accountShowcase.selectedFamilyId;
  const selected = summaries.find((summary) => summary.family.id === selectedFamilyId);
  if (selected) return selected;
  return summaries.sort((a, b) => b.rank - a.rank || b.family.active.toString().localeCompare(a.family.active.toString()))[0];
}

export function getFamilyRegionalMaterialBonus(state: GameState, regionId: string, materialId: RegionMaterialId): number {
  const resonance = getActiveFamilyResonance(state);
  if (!resonance || resonance.family.regionId !== regionId) return 0;
  if (resonance.family.id === "sunlitCharter" && materialId === "sunlitTimber" && resonance.rank >= 2) return 0.04;
  if (resonance.family.id === "emberboundKit" && materialId === "emberResin" && resonance.rank >= 1) return 0.02;
  return 0;
}

export function getFamilyMasteryBonus(state: GameState, regionId: string): number {
  const resonance = getActiveFamilyResonance(state);
  if (resonance?.family.id === "sunlitCharter" && resonance.family.regionId === regionId && resonance.rank >= 1) return 0.02;
  return 0;
}

export function getFamilyScoutCostReduction(state: GameState, regionId: string): number {
  const resonance = getActiveFamilyResonance(state);
  if (resonance?.family.id === "sunlitCharter" && resonance.family.regionId === regionId && resonance.rank >= 2) return 1;
  return 0;
}

export function getFamilyPrepMaterialMultiplier(state: GameState, regionId: string): number {
  const resonance = getActiveFamilyResonance(state);
  if (resonance?.family.id === "emberboundKit" && resonance.family.regionId === regionId && resonance.rank >= 2) return 0.9;
  return 1;
}

export function getFamilyThreatCoverage(state: GameState, regionId: string, threatId: ExpeditionThreatId): number {
  const resonance = getActiveFamilyResonance(state);
  if (resonance?.family.id === "emberboundKit" && resonance.family.regionId === regionId && resonance.rank >= 2 && threatId === "regenerating") return 0.25;
  return 0;
}

export function getTraitContextScore(item: Item, context: { regionId?: string; threatIds?: ExpeditionThreatId[] } = {}): number {
  const trait = getItemTraitDefinition(item.traitId);
  const family = getItemFamilyDefinition(item.familyId);
  let score = 0;
  if (trait) {
    score += trait.category === "tactical" ? 45 : trait.category === "regional" ? 30 : 22;
    if (trait.countersThreatId && context.threatIds?.includes(trait.countersThreatId)) score += 180;
    if (trait.regionId && trait.regionId === context.regionId) score += 70;
  }
  if (family?.active && family.regionId === context.regionId) {
    score += 45;
  }
  return score;
}

function getBossPrepUnlocked(state: GameState): boolean {
  return Object.keys(state.bossPrep).length > 0 || Object.values(state.dungeonClears).some((clears) => clears > 0);
}

function traitChanceByRarity(rarity: ItemRarity): { tactical: number; utility: number } {
  switch (rarity) {
    case "legendary":
      return { tactical: 1, utility: 0 };
    case "epic":
      return { tactical: 0.7, utility: 0.2 };
    case "rare":
      return { tactical: 0.35, utility: 0.25 };
    case "common":
      return { tactical: 0, utility: 0.16 };
  }
}

function familyChanceByRarity(rarity: ItemRarity): number {
  switch (rarity) {
    case "legendary":
      return 0.55;
    case "epic":
      return 0.22;
    case "rare":
      return 0.08;
    case "common":
      return 0;
  }
}

function pickTraitFromPool(rng: Rng, slot: EquipmentSlot, pool: ItemTraitDefinition[]): ItemTraitId | null {
  const candidates = pool.filter((trait) => trait.slots.includes(slot));
  if (candidates.length === 0) return null;
  return rng.pick(candidates).id;
}

export function rollItemTrait(state: GameState, slot: EquipmentSlot, rarity: ItemRarity, regionId: string, rng: Rng): ItemTraitId | null {
  const chances = traitChanceByRarity(rarity);
  const bossPrepUnlocked = getBossPrepUnlocked(state);
  if (bossPrepUnlocked && rng.next() <= chances.tactical) {
    return pickTraitFromPool(rng, slot, ITEM_TRAITS.filter((trait) => TACTICAL_TRAIT_IDS.has(trait.id)));
  }
  if (rarity === "legendary") {
    return pickTraitFromPool(rng, slot, ITEM_TRAITS.filter((trait) => TACTICAL_TRAIT_IDS.has(trait.id)));
  }
  if (rng.next() <= chances.utility) {
    const regionPool = ITEM_TRAITS.filter((trait) => trait.category === "regional" && trait.regionId === regionId);
    const progressPool = ITEM_TRAITS.filter((trait) => trait.category === "progress");
    return pickTraitFromPool(rng, slot, [...regionPool, ...progressPool]);
  }
  return null;
}

export function rollItemFamily(regionId: string, rarity: ItemRarity, rng: Rng): ItemFamilyId | null {
  if (rng.next() > familyChanceByRarity(rarity)) return null;
  const regionFamily = ITEM_FAMILIES.find((family) => family.active && family.regionId === regionId);
  return regionFamily?.id ?? null;
}

export function recordItemIdentityDiscovery(state: GameState, item: Item) {
  const trait = getItemTraitDefinition(item.traitId);
  if (trait) {
    const existing = state.traitCodex[trait.id];
    if (!existing?.discovered) {
      state.accountPersonalRecords.legendaryTraitsDiscovered += 1;
    }
    state.traitCodex[trait.id] = {
      traitId: trait.id,
      discovered: true,
      bestValueSeen: Math.max(existing?.bestValueSeen ?? 0, item.itemLevel),
      timesFound: (existing?.timesFound ?? 0) + 1
    };
  }

  const family = getItemFamilyDefinition(item.familyId);
  if (family) {
    const existing = state.familyCodex[family.id];
    const discoveredSlots = Array.from(new Set([...(existing?.discoveredSlots ?? []), item.slot]));
    state.familyCodex[family.id] = {
      familyId: family.id,
      discoveredSlots,
      highestResonanceReached: existing?.highestResonanceReached ?? 0
    };
  }
}

export function refreshFamilyResonanceCodex(state: GameState) {
  getFamilyResonanceSummaries(state).forEach((summary) => {
    if (summary.rank <= 0) return;
    const existing = state.familyCodex[summary.family.id];
    state.familyCodex[summary.family.id] = {
      familyId: summary.family.id,
      discoveredSlots: existing?.discoveredSlots ?? [],
      highestResonanceReached: Math.max(existing?.highestResonanceReached ?? 0, summary.rank) as 0 | 1 | 2
    };
  });
}
