import { FOCUS_MAX } from "./constants";
import { DUNGEONS } from "./content";
import { cloneState } from "./state";
import type {
  AccountRankDefinition,
  ClaimMasteryTierResult,
  ClaimMasteryTierSummary,
  DungeonDefinition,
  DungeonMasteryState,
  ExpeditionProgressSummary,
  GameState,
  MasteryTierDefinition,
  MasteryTierNumber,
  MasteryTierProgressSummary,
  RegionMaterialId,
  TitleDefinition,
  TitleState,
  TrophyDefinition
} from "./types";

export const MASTERY_TIERS: MasteryTierDefinition[] = [
  { tier: 1, xp: 100, label: "Mapped" },
  { tier: 2, xp: 500, label: "Known Route" },
  { tier: 3, xp: 1500, label: "Mastered" }
];

export const ACCOUNT_RANKS: AccountRankDefinition[] = [
  { rank: 1, xp: 0, focusCap: 200, label: "Guild Account Created" },
  { rank: 2, xp: 100, focusCap: 200, label: "Showcase Discovered" },
  { rank: 3, xp: 260, focusCap: 200, label: "Weekly Board Upgraded" },
  { rank: 4, xp: 520, focusCap: 220, label: "Longer Return Window" },
  { rank: 5, xp: 900, focusCap: 220, label: "Trophy Shelf II" },
  { rank: 6, xp: 1400, focusCap: 220, label: "Pack Expansion" },
  { rank: 7, xp: 2050, focusCap: 240, label: "Second Build Preset" },
  { rank: 8, xp: 2850, focusCap: 240, label: "Region Filters" },
  { rank: 9, xp: 3800, focusCap: 240, label: "Trophy Shelf III" },
  { rank: 10, xp: 4900, focusCap: 260, label: "Mastery Codex" }
];

export const REGION_MATERIAL_LABELS: Record<RegionMaterialId, string> = {
  sunlitTimber: "Sunlit Timber",
  emberResin: "Ember Resin",
  archiveGlyph: "Archive Glyphs",
  stormglassShard: "Stormglass Shards",
  oathEmber: "Oath Embers"
};

const REGION_MATERIAL_ID_MAP: Record<string, RegionMaterialId> = {
  "sunlit-timber": "sunlitTimber",
  "ember-resin": "emberResin",
  "archive-glyphs": "archiveGlyph",
  "stormglass-shards": "stormglassShard",
  "oath-embers": "oathEmber"
};

type ExpeditionProgressReward = {
  phase: number;
  successMasteryXp: number;
  failureMasteryXp: number;
  successAccountXp: number;
  failureAccountXp: number;
  successRegionalMaterial?: { id: RegionMaterialId; amount: number };
  failureRegionalMaterial?: { id: RegionMaterialId; amount: number };
  fragmentSeedPhase2: number;
  firstClearAccountXp?: number;
  firstClearTitleId?: string;
  firstClearTrophyId?: string;
};

type MasteryTierReward = {
  accountXp?: number;
  regionalMaterials?: Partial<Record<RegionMaterialId, number>>;
  relicFragments?: number;
  titleId?: string;
  trophyId?: string;
};

export const EXPEDITION_PROGRESS_REWARDS: Record<string, ExpeditionProgressReward> = {
  "tollroad-of-trinkets": {
    phase: 1,
    successMasteryXp: 100,
    failureMasteryXp: 35,
    successAccountXp: 15,
    failureAccountXp: 5,
    successRegionalMaterial: { id: "sunlitTimber", amount: 1 },
    fragmentSeedPhase2: 0
  },
  "mossbright-cellar": {
    phase: 1,
    successMasteryXp: 80,
    failureMasteryXp: 28,
    successAccountXp: 18,
    failureAccountXp: 6,
    successRegionalMaterial: { id: "sunlitTimber", amount: 2 },
    fragmentSeedPhase2: 2
  },
  "relic-bandit-cache": {
    phase: 1,
    successMasteryXp: 75,
    failureMasteryXp: 26,
    successAccountXp: 22,
    failureAccountXp: 8,
    successRegionalMaterial: { id: "sunlitTimber", amount: 4 },
    failureRegionalMaterial: { id: "sunlitTimber", amount: 1 },
    fragmentSeedPhase2: 5
  },
  "lanternroot-path": {
    phase: 3,
    successMasteryXp: 75,
    failureMasteryXp: 26,
    successAccountXp: 26,
    failureAccountXp: 9,
    successRegionalMaterial: { id: "emberResin", amount: 2 },
    fragmentSeedPhase2: 2
  },
  "saffron-sigil-grove": {
    phase: 3,
    successMasteryXp: 70,
    failureMasteryXp: 25,
    successAccountXp: 30,
    failureAccountXp: 10,
    successRegionalMaterial: { id: "emberResin", amount: 3 },
    fragmentSeedPhase2: 4
  },
  "cinderleaf-crossing": {
    phase: 3,
    successMasteryXp: 70,
    failureMasteryXp: 25,
    successAccountXp: 34,
    failureAccountXp: 12,
    successRegionalMaterial: { id: "emberResin", amount: 5 },
    failureRegionalMaterial: { id: "emberResin", amount: 1 },
    fragmentSeedPhase2: 8
  },
  "copper-crown-champion": {
    phase: 4,
    successMasteryXp: 80,
    failureMasteryXp: 35,
    successAccountXp: 30,
    failureAccountXp: 12,
    successRegionalMaterial: { id: "sunlitTimber", amount: 6 },
    failureRegionalMaterial: { id: "sunlitTimber", amount: 2 },
    fragmentSeedPhase2: 12,
    firstClearAccountXp: 25,
    firstClearTitleId: "title-copper-crowned",
    firstClearTrophyId: "trophy-copper-crown"
  },
  "emberwood-heart": {
    phase: 4,
    successMasteryXp: 85,
    failureMasteryXp: 38,
    successAccountXp: 42,
    failureAccountXp: 16,
    successRegionalMaterial: { id: "emberResin", amount: 8 },
    failureRegionalMaterial: { id: "emberResin", amount: 2 },
    fragmentSeedPhase2: 20,
    firstClearAccountXp: 40,
    firstClearTitleId: "title-cindermaw-breaker",
    firstClearTrophyId: "trophy-cindermaw-fang"
  }
};

const MASTERY_TIER_REWARDS: Record<string, Partial<Record<MasteryTierNumber, MasteryTierReward>>> = {
  "tollroad-of-trinkets": {
    1: { accountXp: 5, regionalMaterials: { sunlitTimber: 2 } },
    2: { accountXp: 10, regionalMaterials: { sunlitTimber: 4 }, titleId: "title-known-route" },
    3: { accountXp: 20, regionalMaterials: { sunlitTimber: 8 }, titleId: "title-tollroad-mapper" }
  },
  "mossbright-cellar": {
    1: { accountXp: 5, regionalMaterials: { sunlitTimber: 2 } },
    2: { accountXp: 10, regionalMaterials: { sunlitTimber: 4 }, titleId: "title-known-route" },
    3: { accountXp: 20, regionalMaterials: { sunlitTimber: 8 }, titleId: "title-cellar-lantern" }
  },
  "relic-bandit-cache": {
    1: { accountXp: 6, regionalMaterials: { sunlitTimber: 3 }, relicFragments: 5 },
    2: { accountXp: 12, regionalMaterials: { sunlitTimber: 5 }, titleId: "title-known-route" },
    3: { accountXp: 24, regionalMaterials: { sunlitTimber: 10 }, trophyId: "trophy-bandit-cache-ledger" }
  },
  "lanternroot-path": {
    1: { accountXp: 7, regionalMaterials: { emberResin: 2 } },
    2: { accountXp: 12, regionalMaterials: { emberResin: 4 }, titleId: "title-known-route" },
    3: { accountXp: 24, regionalMaterials: { emberResin: 8 }, titleId: "title-lanternroot-guide" }
  },
  "saffron-sigil-grove": {
    1: { accountXp: 7, regionalMaterials: { emberResin: 2 } },
    2: { accountXp: 12, regionalMaterials: { emberResin: 5 }, titleId: "title-known-route" },
    3: { accountXp: 24, regionalMaterials: { emberResin: 10 }, titleId: "title-sigil-reader" }
  },
  "cinderleaf-crossing": {
    1: { accountXp: 8, regionalMaterials: { emberResin: 3 } },
    2: { accountXp: 14, regionalMaterials: { emberResin: 6 }, titleId: "title-known-route" },
    3: { accountXp: 28, regionalMaterials: { emberResin: 12 }, trophyId: "trophy-cinderleaf-bridge-token" }
  }
};

export const TITLE_DEFINITIONS: TitleDefinition[] = [
  { id: "title-first-charter", name: "First Charter", unlockCondition: "Start the first expedition.", target: 1, showcasePriority: 8, phase: 1 },
  { id: "title-known-route", name: "Known Route", unlockCondition: "Claim any Tier 2 mastery milestone.", target: 1, showcasePriority: 7, phase: 1 },
  { id: "title-tollroad-mapper", name: "Tollroad Mapper", unlockCondition: "Claim Tier 3 mastery for Tollroad of Trinkets.", target: 1, showcasePriority: 6, phase: 1 },
  { id: "title-cellar-lantern", name: "Cellar Lantern", unlockCondition: "Claim Tier 3 mastery for Mossbright Cellar.", target: 1, showcasePriority: 6, phase: 1 },
  { id: "title-lanternroot-guide", name: "Lanternroot Guide", unlockCondition: "Claim Tier 3 mastery for Lanternroot Path.", target: 1, showcasePriority: 5, phase: 3 },
  { id: "title-sigil-reader", name: "Sigil Reader", unlockCondition: "Claim Tier 3 mastery for Saffron Sigil Grove.", target: 1, showcasePriority: 5, phase: 3 },
  { id: "title-steady-regular", name: "Steady Regular", unlockCondition: "Claim the first Weekly Quest.", target: 1, showcasePriority: 7, phase: 2 },
  { id: "title-sunlit-collector", name: "Sunlit Collector", unlockCondition: "Complete Sunlit Road Relics.", target: 1, showcasePriority: 4, phase: 3 },
  { id: "title-ember-curator", name: "Ember Curator", unlockCondition: "Complete Emberwood Heartwood Relics.", target: 1, showcasePriority: 4, phase: 3 },
  { id: "title-copper-crowned", name: "Copper-Crowned", unlockCondition: "Defeat Bramblecrown.", target: 1, showcasePriority: 3, phase: 4 },
  { id: "title-cindermaw-breaker", name: "Cindermaw Breaker", unlockCondition: "Defeat Cindermaw.", target: 1, showcasePriority: 1, phase: 4 }
];

export const TROPHY_DEFINITIONS: TrophyDefinition[] = [
  { id: "trophy-first-clear-token", name: "First Clear Token", unlockCondition: "Win the first expedition.", target: 1, showcasePriority: 8, phase: 1 },
  { id: "trophy-mapped-route-medal", name: "Mapped Route Medal", unlockCondition: "Claim any Tier 1 mastery milestone.", target: 1, showcasePriority: 7, phase: 1 },
  { id: "trophy-bandit-cache-ledger", name: "Bandit Cache Ledger", unlockCondition: "Claim Tier 3 mastery for Relic Bandit Cache.", target: 1, showcasePriority: 5, phase: 1 },
  { id: "trophy-cinderleaf-bridge-token", name: "Cinderleaf Bridge Token", unlockCondition: "Claim Tier 3 mastery for Cinderleaf Crossing.", target: 1, showcasePriority: 5, phase: 3 },
  { id: "trophy-weekly-recap-ribbon", name: "Weekly Recap Ribbon", unlockCondition: "Claim the first Weekly Quest reward.", target: 1, showcasePriority: 6, phase: 2 },
  { id: "trophy-sunlit-relic-set", name: "Sunlit Relic Set", unlockCondition: "Complete Sunlit Road Relics.", target: 1, showcasePriority: 3, phase: 3 },
  { id: "trophy-emberwood-relic-set", name: "Emberwood Relic Set", unlockCondition: "Complete Emberwood Heartwood Relics.", target: 1, showcasePriority: 3, phase: 3 },
  { id: "trophy-boss-intel-scroll", name: "Boss Intel Scroll", unlockCondition: "Gain boss intel from a failed boss attempt.", target: 1, showcasePriority: 5, phase: 4 },
  { id: "trophy-copper-crown", name: "Copper Crown", unlockCondition: "Defeat Bramblecrown.", target: 1, showcasePriority: 2, phase: 4 },
  { id: "trophy-cindermaw-fang", name: "Cindermaw Fang", unlockCondition: "Defeat Cindermaw.", target: 1, showcasePriority: 1, phase: 4 }
];

function getTitleDefinition(titleId: string): TitleDefinition | null {
  return TITLE_DEFINITIONS.find((title) => title.id === titleId) ?? null;
}

function getTrophyDefinition(trophyId: string): TrophyDefinition | null {
  return TROPHY_DEFINITIONS.find((trophy) => trophy.id === trophyId) ?? null;
}

function createTitleState(definition: TitleDefinition, now: number): TitleState {
  return {
    unlockedAt: now,
    progress: definition.target,
    target: definition.target
  };
}

export function getRegionMaterialStateKey(authoredId: string): RegionMaterialId | null {
  return REGION_MATERIAL_ID_MAP[authoredId] ?? null;
}

export function getAccountRankForXp(accountXp: number): number {
  return ACCOUNT_RANKS.reduce((rank, definition) => (accountXp >= definition.xp ? definition.rank : rank), 1);
}

export function getNextAccountRankDefinition(accountXp: number): AccountRankDefinition | null {
  return ACCOUNT_RANKS.find((definition) => definition.xp > accountXp) ?? null;
}

function getAccountRankFocusCap(rank: number): number {
  const definition = [...ACCOUNT_RANKS].reverse().find((entry) => rank >= entry.rank);
  return definition ? Math.max(FOCUS_MAX, definition.focusCap) : FOCUS_MAX;
}

export function applyAccountXp(state: GameState, amount: number, now: number): { beforeXp: number; afterXp: number; beforeRank: number; afterRank: number; rankUps: number[] } {
  const beforeXp = state.accountRank.accountXp;
  const beforeRank = getAccountRankForXp(beforeXp);
  const afterXp = Math.max(0, beforeXp + Math.max(0, amount));
  const afterRank = getAccountRankForXp(afterXp);
  state.accountRank.accountXp = afterXp;
  state.accountRank.accountRank = afterRank;
  state.accountPersonalRecords.highestAccountRankReached = Math.max(state.accountPersonalRecords.highestAccountRankReached, afterRank);
  state.focus.cap = Math.max(state.focus.cap, getAccountRankFocusCap(afterRank));

  if (afterRank >= 2 && !state.accountShowcase.firstDiscoveryPopupShown) {
    state.accountShowcase.firstDiscoveryPopupShown = true;
  }

  const rankUps = ACCOUNT_RANKS.filter((definition) => definition.rank > beforeRank && definition.rank <= afterRank).map((definition) => definition.rank);
  if (rankUps.length > 0) {
    state.updatedAt = now;
  }
  return { beforeXp, afterXp, beforeRank, afterRank, rankUps };
}

function ensureMastery(state: GameState, dungeonId: string): DungeonMasteryState {
  const existing = state.dungeonMastery[dungeonId];
  if (existing) {
    existing.masteryXp = Math.max(0, existing.masteryXp);
    existing.claimedTiers = Array.from(new Set(existing.claimedTiers)).sort((a, b) => a - b);
    existing.failures = Math.max(0, existing.failures);
    return existing;
  }

  const mastery = { masteryXp: 0, claimedTiers: [], failures: 0 };
  state.dungeonMastery[dungeonId] = mastery;
  return mastery;
}

function summarizeTier(tier: MasteryTierDefinition, mastery: DungeonMasteryState): MasteryTierProgressSummary {
  return {
    tier: tier.tier,
    label: tier.label,
    xpRequired: tier.xp,
    claimable: mastery.masteryXp >= tier.xp && !mastery.claimedTiers.includes(tier.tier)
  };
}

export function getMasteryProgress(state: GameState, dungeonId: string): {
  masteryXp: number;
  nextTier: MasteryTierProgressSummary | null;
  claimableTiers: MasteryTierProgressSummary[];
} {
  const mastery = state.dungeonMastery[dungeonId] ?? { masteryXp: 0, claimedTiers: [], failures: 0 };
  const nextDefinition = MASTERY_TIERS.find((tier) => !mastery.claimedTiers.includes(tier.tier)) ?? null;
  return {
    masteryXp: mastery.masteryXp,
    nextTier: nextDefinition ? summarizeTier(nextDefinition, mastery) : null,
    claimableTiers: MASTERY_TIERS.filter((tier) => mastery.masteryXp >= tier.xp && !mastery.claimedTiers.includes(tier.tier)).map((tier) =>
      summarizeTier(tier, mastery)
    )
  };
}

export function getNextClaimableMasteryTier(state: GameState, dungeonId: string): MasteryTierDefinition | null {
  const mastery = state.dungeonMastery[dungeonId];
  if (!mastery) return null;
  return MASTERY_TIERS.find((tier) => mastery.masteryXp >= tier.xp && !mastery.claimedTiers.includes(tier.tier)) ?? null;
}

export function getFirstClaimableMasteryRoute(state: GameState): { dungeon: DungeonDefinition; tier: MasteryTierDefinition } | null {
  for (const dungeon of DUNGEONS) {
    const tier = getNextClaimableMasteryTier(state, dungeon.id);
    if (tier) {
      return { dungeon, tier };
    }
  }
  return null;
}

export function unlockTitle(state: GameState, titleId: string, now: number): TitleDefinition | null {
  const definition = getTitleDefinition(titleId);
  if (!definition) return null;
  const existing = state.titles[titleId];
  if (existing?.unlockedAt) return null;

  state.titles[titleId] = createTitleState(definition, now);
  if (state.accountShowcase.accountSignatureMode === "auto") {
    const selected = state.accountShowcase.selectedTitleId ? getTitleDefinition(state.accountShowcase.selectedTitleId) : null;
    if (!selected || definition.showcasePriority < selected.showcasePriority) {
      state.accountShowcase.selectedTitleId = definition.id;
    }
  }
  return definition;
}

export function unlockTrophy(state: GameState, trophyId: string, now: number): TrophyDefinition | null {
  const definition = getTrophyDefinition(trophyId);
  if (!definition) return null;
  const existing = state.trophies[trophyId];
  if (existing?.unlockedAt) return null;
  state.trophies[trophyId] = { unlockedAt: now };
  return definition;
}

function addRegionalMaterials(state: GameState, materials: Partial<Record<RegionMaterialId, number>>): Partial<Record<RegionMaterialId, number>> {
  const gained: Partial<Record<RegionMaterialId, number>> = {};
  (Object.keys(materials) as RegionMaterialId[]).forEach((materialId) => {
    const amount = Math.max(0, materials[materialId] ?? 0);
    if (amount <= 0) return;
    state.regionProgress.materials[materialId] = (state.regionProgress.materials[materialId] ?? 0) + amount;
    gained[materialId] = (gained[materialId] ?? 0) + amount;
  });
  return gained;
}

function mergeRegionalMaterials(
  target: Partial<Record<RegionMaterialId, number>>,
  addition: Partial<Record<RegionMaterialId, number>>
): Partial<Record<RegionMaterialId, number>> {
  (Object.keys(addition) as RegionMaterialId[]).forEach((materialId) => {
    const amount = addition[materialId] ?? 0;
    if (amount > 0) {
      target[materialId] = (target[materialId] ?? 0) + amount;
    }
  });
  return target;
}

export function applyExpeditionProgress(
  state: GameState,
  dungeon: DungeonDefinition,
  success: boolean,
  firstClear: boolean,
  now: number
): ExpeditionProgressSummary {
  const reward = EXPEDITION_PROGRESS_REWARDS[dungeon.id];
  const mastery = ensureMastery(state, dungeon.id);
  const masteryXpBefore = mastery.masteryXp;
  const accountXpBefore = state.accountRank.accountXp;
  const regionalMaterials: Partial<Record<RegionMaterialId, number>> = {};
  const titlesUnlocked: TitleDefinition[] = [];
  const trophiesUnlocked: TrophyDefinition[] = [];

  const masteryXpGained = reward ? (success ? reward.successMasteryXp : reward.failureMasteryXp) : 0;
  const baseAccountXpGained = reward ? (success ? reward.successAccountXp : reward.failureAccountXp) : 0;
  const firstClearAccountXp = success && firstClear ? (reward?.firstClearAccountXp ?? 0) : 0;
  const accountXpGained = baseAccountXpGained + firstClearAccountXp;

  mastery.masteryXp += masteryXpGained;
  if (!success) {
    mastery.failures += 1;
  }

  const regionalReward = reward ? (success ? reward.successRegionalMaterial : reward.failureRegionalMaterial) : undefined;
  if (regionalReward) {
    mergeRegionalMaterials(regionalMaterials, addRegionalMaterials(state, { [regionalReward.id]: regionalReward.amount }));
  }

  if (success && firstClear) {
    if (dungeon.id === "tollroad-of-trinkets") {
      const unlocked = unlockTrophy(state, "trophy-first-clear-token", now);
      if (unlocked) trophiesUnlocked.push(unlocked);
    }
    if (reward?.firstClearTitleId) {
      const unlocked = unlockTitle(state, reward.firstClearTitleId, now);
      if (unlocked) titlesUnlocked.push(unlocked);
    }
    if (reward?.firstClearTrophyId) {
      const unlocked = unlockTrophy(state, reward.firstClearTrophyId, now);
      if (unlocked) trophiesUnlocked.push(unlocked);
    }
  }

  const account = applyAccountXp(state, accountXpGained, now);
  const progress = getMasteryProgress(state, dungeon.id);
  const nextAccountRank = getNextAccountRankDefinition(account.afterXp);
  state.accountPersonalRecords.lifetimeExpeditionsCompleted += 1;

  return {
    masteryXpGained,
    masteryXpBefore,
    masteryXpAfter: mastery.masteryXp,
    nextMasteryTier: progress.nextTier,
    newlyClaimableMasteryTiers: progress.claimableTiers.filter((tier) => masteryXpBefore < tier.xpRequired),
    accountXpGained,
    accountXpBefore,
    accountXpAfter: account.afterXp,
    accountRankBefore: account.beforeRank,
    accountRankAfter: account.afterRank,
    nextAccountRank: nextAccountRank ? { rank: nextAccountRank.rank, xpRequired: nextAccountRank.xp } : null,
    rankUps: account.rankUps,
    regionalMaterials,
    titlesUnlocked,
    trophiesUnlocked
  };
}

export function claimMasteryTier(state: GameState, dungeonId: string, now: number): ClaimMasteryTierResult {
  const tier = getNextClaimableMasteryTier(state, dungeonId);
  if (!tier) {
    return { ok: false, state, error: "No mastery milestone is ready to claim." };
  }

  const next = cloneState(state);
  const mastery = ensureMastery(next, dungeonId);
  const reward = MASTERY_TIER_REWARDS[dungeonId]?.[tier.tier] ?? {};
  const regionalMaterials = addRegionalMaterials(next, reward.regionalMaterials ?? {});
  const titlesUnlocked: TitleDefinition[] = [];
  const trophiesUnlocked: TrophyDefinition[] = [];
  const account = applyAccountXp(next, reward.accountXp ?? 0, now);

  if (tier.tier === 1) {
    const unlocked = unlockTrophy(next, "trophy-mapped-route-medal", now);
    if (unlocked) trophiesUnlocked.push(unlocked);
  }
  if (tier.tier === 2) {
    const unlocked = unlockTitle(next, "title-known-route", now);
    if (unlocked) titlesUnlocked.push(unlocked);
  }
  if (reward.titleId) {
    const unlocked = unlockTitle(next, reward.titleId, now);
    if (unlocked) titlesUnlocked.push(unlocked);
  }
  if (reward.trophyId) {
    const unlocked = unlockTrophy(next, reward.trophyId, now);
    if (unlocked) trophiesUnlocked.push(unlocked);
  }

  const relicFragmentsGained = Math.max(0, reward.relicFragments ?? 0);
  if (relicFragmentsGained > 0) {
    next.resources.relicFragment += relicFragmentsGained;
  }

  mastery.claimedTiers = Array.from(new Set([...mastery.claimedTiers, tier.tier])).sort((a, b) => a - b);
  next.accountPersonalRecords.totalMasteryTiersClaimed += 1;
  next.updatedAt = now;

  const summary: ClaimMasteryTierSummary = {
    dungeonId,
    tier,
    accountXpGained: reward.accountXp ?? 0,
    accountRankBefore: account.beforeRank,
    accountRankAfter: account.afterRank,
    rankUps: account.rankUps,
    regionalMaterials,
    relicFragmentsGained,
    titlesUnlocked,
    trophiesUnlocked
  };

  return { ok: true, state: next, summary, message: `${tier.label} claimed.` };
}
