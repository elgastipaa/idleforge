import { DUNGEONS, ZONES } from "./content";
import { getCaravanMasterySummaries } from "./caravan";
import { ACCOUNT_RANKS, TITLE_DEFINITIONS, TROPHY_DEFINITIONS, getNextAccountRankDefinition } from "./progression";
import { cloneState } from "./state";
import type { ActionResult, GameState, TitleDefinition, TrophyDefinition, ZoneDefinition } from "./types";

export const SHOWCASE_TROPHY_SLOT_COUNT = 3;

export type ShowcaseTitleEntry = {
  definition: TitleDefinition;
  unlockedAt: number | null;
  selected: boolean;
};

export type ShowcaseTrophyEntry = {
  definition: TrophyDefinition;
  unlockedAt: number | null;
  pinned: boolean;
};

export function getAccountRankDefinition(rank: number) {
  return [...ACCOUNT_RANKS].reverse().find((definition) => rank >= definition.rank) ?? ACCOUNT_RANKS[0];
}

export function getSelectedTitleDefinition(state: GameState): TitleDefinition | null {
  const selectedId = state.accountShowcase.selectedTitleId;
  if (!selectedId) return null;
  if (!state.titles[selectedId]?.unlockedAt) return null;
  return TITLE_DEFINITIONS.find((definition) => definition.id === selectedId) ?? null;
}

export function getUnlockedTitleEntries(state: GameState): ShowcaseTitleEntry[] {
  return TITLE_DEFINITIONS.map((definition) => ({
    definition,
    unlockedAt: state.titles[definition.id]?.unlockedAt ?? null,
    selected: state.accountShowcase.selectedTitleId === definition.id
  }))
    .filter((entry) => entry.unlockedAt !== null)
    .sort((a, b) => a.definition.showcasePriority - b.definition.showcasePriority || a.definition.name.localeCompare(b.definition.name));
}

export function getLockedTitleEntries(state: GameState): ShowcaseTitleEntry[] {
  return TITLE_DEFINITIONS.map((definition) => ({
    definition,
    unlockedAt: state.titles[definition.id]?.unlockedAt ?? null,
    selected: false
  }))
    .filter((entry) => entry.unlockedAt === null)
    .sort((a, b) => a.definition.showcasePriority - b.definition.showcasePriority || a.definition.name.localeCompare(b.definition.name));
}

export function getUnlockedTrophyEntries(state: GameState): ShowcaseTrophyEntry[] {
  const pinnedIds = new Set(state.accountShowcase.pinnedTrophyIds);
  return TROPHY_DEFINITIONS.map((definition) => ({
    definition,
    unlockedAt: state.trophies[definition.id]?.unlockedAt ?? null,
    pinned: pinnedIds.has(definition.id)
  }))
    .filter((entry) => entry.unlockedAt !== null)
    .sort((a, b) => a.definition.showcasePriority - b.definition.showcasePriority || a.definition.name.localeCompare(b.definition.name));
}

export function getLockedTrophyEntries(state: GameState): ShowcaseTrophyEntry[] {
  return TROPHY_DEFINITIONS.map((definition) => ({
    definition,
    unlockedAt: state.trophies[definition.id]?.unlockedAt ?? null,
    pinned: false
  }))
    .filter((entry) => entry.unlockedAt === null)
    .sort((a, b) => a.definition.showcasePriority - b.definition.showcasePriority || a.definition.name.localeCompare(b.definition.name));
}

export function getPinnedTrophyEntries(state: GameState): Array<ShowcaseTrophyEntry | null> {
  const byId = new Map(getUnlockedTrophyEntries(state).map((entry) => [entry.definition.id, entry]));
  const pinned: Array<ShowcaseTrophyEntry | null> = state.accountShowcase.pinnedTrophyIds
    .map((id) => byId.get(id) ?? null)
    .filter((entry): entry is ShowcaseTrophyEntry => entry !== null)
    .slice(0, SHOWCASE_TROPHY_SLOT_COUNT);
  while (pinned.length < SHOWCASE_TROPHY_SLOT_COUNT) {
    pinned.push(null);
  }
  return pinned;
}

export function selectShowcaseTitle(state: GameState, titleId: string | null, now: number): ActionResult {
  const next = cloneState(state);
  if (titleId === null) {
    next.accountShowcase.selectedTitleId = null;
    next.accountShowcase.accountSignatureMode = "auto";
    next.updatedAt = now;
    return { ok: true, state: next, message: "Showcase title set to auto." };
  }

  const definition = TITLE_DEFINITIONS.find((title) => title.id === titleId);
  if (!definition || !next.titles[titleId]?.unlockedAt) {
    return { ok: false, state, error: "That title is not unlocked." };
  }

  next.accountShowcase.selectedTitleId = titleId;
  next.accountShowcase.accountSignatureMode = "manual";
  next.updatedAt = now;
  return { ok: true, state: next, message: `${definition.name} selected for Account Showcase.` };
}

export function toggleShowcaseTrophy(state: GameState, trophyId: string, now: number): ActionResult {
  const definition = TROPHY_DEFINITIONS.find((trophy) => trophy.id === trophyId);
  if (!definition || !state.trophies[trophyId]?.unlockedAt) {
    return { ok: false, state, error: "That trophy is not unlocked." };
  }

  const next = cloneState(state);
  const current = next.accountShowcase.pinnedTrophyIds.filter((id, index, ids) => next.trophies[id]?.unlockedAt && ids.indexOf(id) === index);
  if (current.includes(trophyId)) {
    next.accountShowcase.pinnedTrophyIds = current.filter((id) => id !== trophyId);
    next.updatedAt = now;
    return { ok: true, state: next, message: `${definition.name} removed from the trophy shelf.` };
  }

  if (current.length >= SHOWCASE_TROPHY_SLOT_COUNT) {
    return { ok: false, state, error: "The trophy shelf has 3 slots. Unpin a trophy first." };
  }

  next.accountShowcase.pinnedTrophyIds = [...current, trophyId];
  next.updatedAt = now;
  return { ok: true, state: next, message: `${definition.name} pinned to the trophy shelf.` };
}

export function dismissAccountShowcaseDiscovery(state: GameState, now: number): GameState {
  const next = cloneState(state);
  next.accountShowcase.firstDiscoveryPopupDismissed = true;
  next.updatedAt = now;
  return next;
}

export function getFeaturedRegion(state: GameState): ZoneDefinition | null {
  const totals = new Map<string, number>();
  DUNGEONS.forEach((dungeon) => {
    const clears = state.dungeonClears[dungeon.id] ?? 0;
    if (clears > 0) {
      totals.set(dungeon.zoneId, (totals.get(dungeon.zoneId) ?? 0) + clears);
    }
  });
  const best = [...totals.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!best) return null;
  return ZONES.find((zone) => zone.id === best[0]) ?? null;
}

export function getFeaturedBoss(state: GameState) {
  return (
    DUNGEONS.filter((dungeon) => dungeon.boss && (state.dungeonClears[dungeon.id] ?? 0) > 0).sort(
      (a, b) => b.zoneIndex - a.zoneIndex || b.indexInZone - a.indexInZone
    )[0] ?? null
  );
}

export function buildShowcaseCopyText(state: GameState): string {
  const rank = getAccountRankDefinition(state.accountRank.accountRank);
  const nextRank = getNextAccountRankDefinition(state.accountRank.accountXp);
  const selectedTitle = getSelectedTitleDefinition(state);
  const pinnedTrophies = getPinnedTrophyEntries(state)
    .filter((entry): entry is ShowcaseTrophyEntry => entry !== null)
    .map((entry) => entry.definition.name);
  const featuredRegion = getFeaturedRegion(state);
  const featuredBoss = getFeaturedBoss(state);
  const records = state.accountPersonalRecords;
  const diaryRewardsClaimed = Object.values(state.regionProgress.diaries).reduce((total, diary) => total + new Set(diary.claimedRewardIds ?? []).size, 0);
  const traitDiscoveries = Object.values(state.traitCodex).filter((entry) => entry.discovered).length;
  const familyDiscoveries = Object.values(state.familyCodex).filter((entry) => (entry.discoveredSlots ?? []).length > 0).length;
  const caravanMasteryTiers = getCaravanMasterySummaries(state).reduce((total, summary) => total + summary.claimedTiers.length, 0);

  return [
    "Relic Forge Idle Account Showcase",
    `Account Rank ${state.accountRank.accountRank} - ${rank.label}`,
    nextRank ? `Account XP ${state.accountRank.accountXp}/${nextRank.xp}` : `Account XP ${state.accountRank.accountXp}`,
    `Title: ${selectedTitle?.name ?? "No title selected"}`,
    `Trophy Shelf: ${pinnedTrophies.length > 0 ? pinnedTrophies.join(", ") : "No trophies pinned"}`,
    `Rebirths: ${state.rebirth.totalRebirths}`,
    `Highest Power: ${Math.max(records.highestPowerReached, state.lifetime.highestPowerScore)}`,
    `Expeditions Completed: ${records.lifetimeExpeditionsCompleted}`,
    `Mastery Tiers Claimed: ${records.totalMasteryTiersClaimed}`,
    `Collections Completed: ${records.totalCollectionsCompleted}`,
    `Region Diaries Claimed: ${diaryRewardsClaimed}`,
    `Codex Discoveries: ${traitDiscoveries} traits, ${familyDiscoveries} families`,
    `Caravan Mastery Tiers: ${caravanMasteryTiers}`,
    `Featured Region: ${featuredRegion?.name ?? "No region featured yet"}`,
    `Best Boss: ${featuredBoss?.name ?? "No boss defeated yet"}`
  ].join("\n");
}
