import { OFFLINE_CAP_MS } from "./constants";
import { DUNGEONS, ZONES } from "./content";
import { applyDailyProgress } from "./dailies";
import { isDungeonUnlocked } from "./expeditions";
import { addXp } from "./heroes";
import { getOutpostCaravanMaterialMultiplier } from "./outposts";
import { applyAccountXp, REGION_MATERIAL_LABELS } from "./progression";
import { cloneState } from "./state";
import type {
  ActionResult,
  CaravanFocusDefinition,
  CaravanFocusId,
  CaravanMasteryState,
  CaravanMasterySummary,
  CaravanMasteryTierDefinition,
  CaravanRewardSummary,
  GameState,
  RegionMaterialId,
  ZoneDefinition
} from "./types";

export const CARAVAN_MIN_DURATION_MS = 60 * 60 * 1000;
export const CARAVAN_MAX_DURATION_MS = OFFLINE_CAP_MS;
export const CARAVAN_MASTERY_REGIONAL_MATERIAL_BONUS = 1;
export const CARAVAN_MASTERY_ACCOUNT_XP_BONUS = 0.1;
export const CARAVAN_MASTERY_DURATION_REDUCTION = 0.15;

export const CARAVAN_FOCUS_DEFINITIONS: CaravanFocusDefinition[] = [
  {
    id: "xp",
    label: "XP",
    unlockLevel: 1,
    description: "Training drills while away. Best when you are pushing hero level gates."
  },
  {
    id: "gold",
    label: "Gold",
    unlockLevel: 3,
    description: "Merchant errands for town and forge spending."
  },
  {
    id: "fragments",
    label: "Fragments",
    unlockLevel: 5,
    description: "Supply wagons for crafting, upgrades, and town projects."
  }
];

export const CARAVAN_MASTERY_TIERS: CaravanMasteryTierDefinition[] = [
  {
    tier: 1,
    xpRequired: 4,
    label: "Trusted Route",
    effectText: "+1 regional material from completed Caravans in this region."
  },
  {
    tier: 2,
    xpRequired: 12,
    label: "Guild Contract",
    effectText: "+10% Account XP from completed Caravans in this region."
  },
  {
    tier: 3,
    xpRequired: 24,
    label: "Fast Relay",
    effectText: "Caravans return 15% sooner for the same selected reward duration."
  }
];

const CARAVAN_REGION_MATERIAL_BY_REGION_ID: Partial<Record<string, RegionMaterialId>> = {
  "sunlit-marches": "sunlitTimber",
  emberwood: "emberResin",
  "azure-vaults": "archiveGlyph",
  "stormglass-peaks": "stormglassShard",
  "first-forge": "oathEmber"
};

function getBestUnlockedDungeon(state: GameState) {
  const unlocked = DUNGEONS.filter((dungeon) => !dungeon.boss && isDungeonUnlocked(state, dungeon));
  if (unlocked.length === 0) {
    return DUNGEONS[0];
  }
  return unlocked.reduce((best, current) => (current.lootLevel > best.lootLevel ? current : best), unlocked[0]);
}

export function getCaravanFocusDefinition(focusId: CaravanFocusId): CaravanFocusDefinition {
  return CARAVAN_FOCUS_DEFINITIONS.find((focus) => focus.id === focusId) ?? CARAVAN_FOCUS_DEFINITIONS[0];
}

export function isCaravanFocusUnlocked(state: GameState, focusId: CaravanFocusId): boolean {
  return state.hero.level >= getCaravanFocusDefinition(focusId).unlockLevel;
}

export function getUnlockedCaravanFocuses(state: GameState): CaravanFocusDefinition[] {
  return CARAVAN_FOCUS_DEFINITIONS.filter((focus) => isCaravanFocusUnlocked(state, focus.id));
}

export function getCaravanRegionMaterialId(regionId: string): RegionMaterialId | null {
  return CARAVAN_REGION_MATERIAL_BY_REGION_ID[regionId] ?? null;
}

export function getCaravanRegionDefinition(regionId: string): ZoneDefinition {
  return ZONES.find((zone) => zone.id === regionId) ?? ZONES[0];
}

export function getUnlockedCaravanRegions(state: GameState): ZoneDefinition[] {
  const regions = ZONES.filter((zone) => DUNGEONS.some((dungeon) => dungeon.zoneId === zone.id && !dungeon.boss && isDungeonUnlocked(state, dungeon)));
  return regions.length > 0 ? regions : [ZONES[0]];
}

function isCaravanRegionUnlocked(state: GameState, regionId: string): boolean {
  return getUnlockedCaravanRegions(state).some((region) => region.id === regionId);
}

export function clampCaravanDurationMs(durationMs: number): number {
  if (!Number.isFinite(durationMs)) {
    return CARAVAN_MIN_DURATION_MS;
  }
  const snappedHours = Math.round(durationMs / CARAVAN_MIN_DURATION_MS);
  return Math.min(CARAVAN_MAX_DURATION_MS, Math.max(CARAVAN_MIN_DURATION_MS, snappedHours * CARAVAN_MIN_DURATION_MS));
}

function getReadOnlyCaravanMasteryState(state: GameState, regionId: string): CaravanMasteryState {
  const current = state.caravan.mastery?.[regionId];
  return {
    regionId,
    caravansSent: Math.max(0, Math.floor(current?.caravansSent ?? 0)),
    masteryXp: Math.max(0, Math.floor(current?.masteryXp ?? 0)),
    claimedTiers: Array.from(new Set((current?.claimedTiers ?? []).filter((tier) => CARAVAN_MASTERY_TIERS.some((definition) => definition.tier === tier)))).sort(
      (a, b) => a - b
    )
  };
}

function ensureCaravanMasteryState(state: GameState, regionId: string): CaravanMasteryState {
  const normalized = getReadOnlyCaravanMasteryState(state, regionId);
  state.caravan.mastery ??= {};
  state.caravan.mastery[regionId] = normalized;
  return normalized;
}

function hasClaimedCaravanMasteryTier(state: GameState, regionId: string, tier: number): boolean {
  return getReadOnlyCaravanMasteryState(state, regionId).claimedTiers.includes(tier);
}

export function getCaravanActualDurationMs(state: GameState, regionId: string, rewardDurationMs: number): number {
  const rewardDuration = clampCaravanDurationMs(rewardDurationMs);
  const reduction = hasClaimedCaravanMasteryTier(state, regionId, 3) ? CARAVAN_MASTERY_DURATION_REDUCTION : 0;
  return Math.max(CARAVAN_MIN_DURATION_MS, Math.floor(rewardDuration * (1 - reduction)));
}

export function getCaravanMasterySummary(state: GameState, regionId: string): CaravanMasterySummary {
  const mastery = getReadOnlyCaravanMasteryState(state, regionId);
  const region = getCaravanRegionDefinition(regionId);
  const claimableTiers = CARAVAN_MASTERY_TIERS.filter((tier) => mastery.masteryXp >= tier.xpRequired && !mastery.claimedTiers.includes(tier.tier));
  const nextTier = CARAVAN_MASTERY_TIERS.find((tier) => !mastery.claimedTiers.includes(tier.tier)) ?? null;
  const previousTierXp = CARAVAN_MASTERY_TIERS.filter((tier) => mastery.claimedTiers.includes(tier.tier)).at(-1)?.xpRequired ?? 0;
  const progressPercent = nextTier
    ? Math.floor(((mastery.masteryXp - previousTierXp) / Math.max(1, nextTier.xpRequired - previousTierXp)) * 100)
    : 100;
  return {
    regionId,
    regionName: region.name,
    caravansSent: mastery.caravansSent,
    masteryXp: mastery.masteryXp,
    claimedTiers: mastery.claimedTiers,
    highestClaimedTier: mastery.claimedTiers.at(-1) ?? 0,
    claimableTiers,
    nextTier,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
    activeBonusText: CARAVAN_MASTERY_TIERS.filter((tier) => mastery.claimedTiers.includes(tier.tier)).map((tier) => tier.effectText)
  };
}

export function getCaravanMasterySummaries(state: GameState): CaravanMasterySummary[] {
  const regionIds = new Set([...getUnlockedCaravanRegions(state).map((region) => region.id), ...Object.keys(state.caravan.mastery ?? {})]);
  return [...regionIds].map((regionId) => getCaravanMasterySummary(state, regionId));
}

function emptyRewards(): CaravanRewardSummary {
  return {
    xp: 0,
    gold: 0,
    materials: {},
    accountXp: 0,
    regionalMaterials: {}
  };
}

function calculateCaravanRewards(state: GameState, focusId: CaravanFocusId, regionId: string, durationMs: number, enforceMinimum: boolean): CaravanRewardSummary {
  const hours = Math.max(0, durationMs) / CARAVAN_MIN_DURATION_MS;
  const dungeon = getBestUnlockedDungeon(state);
  const region = getCaravanRegionDefinition(regionId);
  const materialId = getCaravanRegionMaterialId(region.id);
  const heroLevel = state.hero.level;
  const rewards = emptyRewards();
  const normalize = (value: number) => (enforceMinimum ? Math.max(1, Math.floor(value)) : Math.max(0, Math.floor(value)));
  const regionTier = Math.max(1, region.index);
  const marketBoost = 1 + state.town.market * 0.05;
  const mineBoost = 1 + state.town.mine * 0.04;

  rewards.gold = normalize((12 + regionTier * 5 + heroLevel * 0.8) * hours * marketBoost);
  rewards.accountXp = normalize((3 + regionTier * 1.5) * hours);
  if (materialId) {
    rewards.regionalMaterials[materialId] = normalize((1.8 + regionTier * 0.8) * hours * mineBoost * getOutpostCaravanMaterialMultiplier(state, region.id));
    if (hasClaimedCaravanMasteryTier(state, region.id, 1) && (rewards.regionalMaterials[materialId] ?? 0) > 0) {
      rewards.regionalMaterials[materialId] = (rewards.regionalMaterials[materialId] ?? 0) + CARAVAN_MASTERY_REGIONAL_MATERIAL_BONUS;
    }
  }
  if (hasClaimedCaravanMasteryTier(state, region.id, 2) && rewards.accountXp > 0) {
    rewards.accountXp = Math.max(rewards.accountXp + 1, Math.floor(rewards.accountXp * (1 + CARAVAN_MASTERY_ACCOUNT_XP_BONUS)));
  }

  switch (focusId) {
    case "xp": {
      const tavernBoost = 1 + state.town.tavern * 0.08;
      rewards.xp = normalize((dungeon.baseXp * 0.18 + heroLevel * 4) * hours * tavernBoost);
      break;
    }
    case "gold": {
      rewards.gold += normalize((dungeon.baseGold * 0.35 + heroLevel * 2.4) * hours * (1 + state.town.market * 0.08));
      break;
    }
    case "fragments": {
      rewards.materials.fragments = normalize((4 + dungeon.lootLevel * 0.9 + state.town.mine * 3) * hours);
      break;
    }
  }

  return rewards;
}

export function estimateCaravanRewards(state: GameState, focusId: CaravanFocusId, durationMs: number): CaravanRewardSummary {
  const regionId = state.caravan.activeJob?.regionId ?? getUnlockedCaravanRegions(state)[0].id;
  return estimateCaravanRewardsForRegion(state, focusId, regionId, durationMs);
}

export function estimateCaravanRewardsForRegion(state: GameState, focusId: CaravanFocusId, regionId: string, durationMs: number): CaravanRewardSummary {
  return calculateCaravanRewards(state, focusId, regionId, clampCaravanDurationMs(durationMs), true);
}

export function formatCaravanRewardText(rewards: CaravanRewardSummary): string {
  const parts = [
    rewards.xp > 0 ? `${rewards.xp} XP` : null,
    rewards.gold > 0 ? `${rewards.gold} Gold` : null,
    (rewards.materials.fragments ?? 0) > 0 ? `${rewards.materials.fragments} Fragments` : null,
    rewards.accountXp > 0 ? `${rewards.accountXp} Account XP` : null,
    ...Object.entries(rewards.regionalMaterials).map(([materialId, amount]) =>
      (amount ?? 0) > 0 ? `${amount} ${REGION_MATERIAL_LABELS[materialId as RegionMaterialId] ?? materialId}` : null
    )
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "no rewards";
}

function addCaravanRewards(state: GameState, rewards: CaravanRewardSummary, now: number): number[] {
  const { levelUps } = rewards.xp > 0 ? addXp(state, rewards.xp) : { levelUps: [] };
  state.resources.gold += rewards.gold;
  state.resources.fragments += rewards.materials.fragments ?? 0;
  (Object.keys(rewards.regionalMaterials) as RegionMaterialId[]).forEach((materialId) => {
    state.regionProgress.materials[materialId] = (state.regionProgress.materials[materialId] ?? 0) + (rewards.regionalMaterials[materialId] ?? 0);
  });
  if (rewards.accountXp > 0) {
    applyAccountXp(state, rewards.accountXp, now);
  }
  return levelUps;
}

function addCaravanMasteryProgress(state: GameState, regionId: string, rewardDurationMs: number): number {
  const mastery = ensureCaravanMasteryState(state, regionId);
  const masteryXpGained = Math.max(1, Math.round(clampCaravanDurationMs(rewardDurationMs) / CARAVAN_MIN_DURATION_MS));
  mastery.caravansSent += 1;
  mastery.masteryXp += masteryXpGained;
  return masteryXpGained;
}

export function claimCaravanMasteryTier(state: GameState, regionId: string, now: number): ActionResult {
  if (!isCaravanRegionUnlocked(state, regionId) && !state.caravan.mastery?.[regionId]) {
    return { ok: false, state, error: "That Caravan region is not unlocked yet." };
  }
  const summary = getCaravanMasterySummary(state, regionId);
  const tier = summary.claimableTiers[0];
  if (!tier) {
    return { ok: false, state, error: "No Caravan Mastery tier is ready to claim." };
  }

  const next = cloneState(state);
  const mastery = ensureCaravanMasteryState(next, regionId);
  mastery.claimedTiers = Array.from(new Set([...mastery.claimedTiers, tier.tier])).sort((a, b) => a - b);
  next.updatedAt = now;
  return { ok: true, state: next, message: `${summary.regionName} Caravan Mastery ${tier.tier} claimed: ${tier.label}.` };
}

export function startCaravanJob(state: GameState, focusId: CaravanFocusId, durationMs: number, now: number, regionId?: string): ActionResult {
  if (!state.settings.heroCreated) {
    return { ok: false, state, error: "Create your hero before planning a Caravan." };
  }

  if (state.caravan.activeJob) {
    return { ok: false, state, error: "A Caravan is already active. Cancel it before starting another." };
  }

  if (state.activeExpedition) {
    return { ok: false, state, error: "An expedition is active. Finish it before sending the Caravan offline." };
  }

  if (!CARAVAN_FOCUS_DEFINITIONS.some((focus) => focus.id === focusId)) {
    return { ok: false, state, error: "Unknown Caravan focus." };
  }

  if (!isCaravanFocusUnlocked(state, focusId)) {
    const focus = getCaravanFocusDefinition(focusId);
    return { ok: false, state, error: `${focus.label} Caravan unlocks at hero level ${focus.unlockLevel}.` };
  }

  const targetRegionId = regionId ?? getUnlockedCaravanRegions(state)[0].id;
  if (!isCaravanRegionUnlocked(state, targetRegionId)) {
    return { ok: false, state, error: "That Caravan region is not unlocked yet." };
  }
  const duration = clampCaravanDurationMs(durationMs);
  const actualDuration = getCaravanActualDurationMs(state, targetRegionId, duration);

  const next = cloneState(state);
  next.caravan.activeJob = {
    focusId,
    regionId: targetRegionId,
    durationMs: actualDuration,
    rewardDurationMs: duration,
    startedAt: now,
    endsAt: now + actualDuration
  };
  next.updatedAt = now;

  const focus = getCaravanFocusDefinition(focusId);
  const region = getCaravanRegionDefinition(targetRegionId);
  const returnText = actualDuration < duration ? ` Returns in ${Math.round(actualDuration / 60_000)}m with ${Math.round(duration / CARAVAN_MIN_DURATION_MS)}h rewards.` : "";
  return { ok: true, state: next, message: `Caravan set: ${region.name}, ${focus.label} focus for ${Math.round(duration / CARAVAN_MIN_DURATION_MS)}h.${returnText}` };
}

export function cancelCaravanJob(state: GameState, now: number): ActionResult {
  if (!state.caravan.activeJob) {
    return { ok: false, state, error: "No active Caravan to cancel." };
  }

  const next = cloneState(state);
  next.caravan.activeJob = null;
  next.updatedAt = now;
  return { ok: true, state: next, message: "Caravan canceled. No rewards collected." };
}

export function claimCaravanJob(state: GameState, now: number): ActionResult {
  const activeJob = state.caravan.activeJob;
  if (!activeJob) {
    return { ok: false, state, error: "No active Caravan to claim." };
  }
  if (now < activeJob.endsAt) {
    return { ok: false, state, error: "The Caravan is still traveling." };
  }

  const next = cloneState(state);
  const rewardDurationMs = activeJob.rewardDurationMs ?? activeJob.durationMs;
  const rewards = calculateCaravanRewards(next, activeJob.focusId, activeJob.regionId, rewardDurationMs, false);
  const levelUps = addCaravanRewards(next, rewards, now);
  const masteryXpGained = addCaravanMasteryProgress(next, activeJob.regionId, rewardDurationMs);
  next.caravan.activeJob = null;
  const progressed = applyDailyProgress(next, now, { complete_caravan: 1 });
  progressed.state.updatedAt = now;
  const focus = getCaravanFocusDefinition(activeJob.focusId);
  const region = getCaravanRegionDefinition(activeJob.regionId);
  const levelText = levelUps.length > 0 ? ` Hero reached level ${levelUps[levelUps.length - 1]}.` : "";
  return { ok: true, state: progressed.state, message: `${region.name} Caravan returned with ${focus.label} rewards and +${masteryXpGained} Mastery XP.${levelText}` };
}

export function applyCaravanOfflineProgress(state: GameState, now: number, offlineStartedAt: number) {
  const activeJob = state.caravan.activeJob;
  if (!activeJob) {
    return null;
  }

  const jobOfflineStart = Math.max(activeJob.startedAt, offlineStartedAt);
  const effectiveEnd = Math.min(now, activeJob.endsAt, jobOfflineStart + OFFLINE_CAP_MS);
  const elapsedMs = Math.max(0, effectiveEnd - jobOfflineStart);
  if (elapsedMs <= 0) {
    return null;
  }

  const completed = effectiveEnd >= activeJob.endsAt;
  const rewardDurationMs = activeJob.rewardDurationMs ?? activeJob.durationMs;
  const rewards = completed ? calculateCaravanRewards(state, activeJob.focusId, activeJob.regionId, rewardDurationMs, false) : emptyRewards();
  const levelUps = completed ? addCaravanRewards(state, rewards, now) : [];
  const masteryXpGained = completed ? addCaravanMasteryProgress(state, activeJob.regionId, rewardDurationMs) : 0;
  if (completed) {
    state.caravan.activeJob = null;
    const progressed = applyDailyProgress(state, now, { complete_caravan: 1 });
    Object.assign(state, progressed.state);
  }

  return {
    focusId: activeJob.focusId,
    regionId: activeJob.regionId,
    rewards,
    elapsedMs,
    completed,
    levelUps,
    masteryXpGained
  };
}
