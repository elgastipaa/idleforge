import { applyAccountXp, unlockTitle, unlockTrophy } from "./progression";
import { getOutpostCollectionChanceBonus } from "./outposts";
import { getEquippedTraitCollectionChanceBonus } from "./traits";
import type {
  CollectionProgressSummary,
  DungeonDefinition,
  GameState,
  RegionCollectionDefinition,
  RegionCollectionState,
  RegionCollectionSummary,
  TitleDefinition,
  TrophyDefinition
} from "./types";
import type { Rng } from "./rng";

export const NORMAL_SUCCESS_COLLECTION_CHANCE = 0.16;
export const NORMAL_FAILURE_COLLECTION_CHANCE = 0.05;
export const BOSS_SUCCESS_COLLECTION_CHANCE = 0.35;
export const COLLECTION_PITY_THRESHOLD = 5;
export const DUPLICATE_DUST_PER_PIECE = 1;
export const DUST_COST_FOR_MISSING_PIECE = 10;

export const REGION_COLLECTIONS: RegionCollectionDefinition[] = [
  {
    id: "sunlit-road-relics",
    name: "Sunlit Road Relics",
    regionId: "sunlit-marches",
    materialId: "sunlitTimber",
    pieces: [
      { id: "sunlit-coin-charm", name: "Sunlit Coin Charm" },
      { id: "mossbright-jar-lantern", name: "Mossbright Jar Lantern" },
      { id: "bandit-map-scrap", name: "Bandit Map Scrap" },
      { id: "copper-crown-sigil", name: "Copper Crown Sigil" }
    ],
    eligibleDungeonIds: ["tollroad-of-trinkets", "mossbright-cellar", "relic-bandit-cache", "copper-crown-champion"],
    normalSuccessChance: NORMAL_SUCCESS_COLLECTION_CHANCE,
    normalFailureChance: NORMAL_FAILURE_COLLECTION_CHANCE,
    bossSuccessChance: BOSS_SUCCESS_COLLECTION_CHANCE,
    pityThreshold: COLLECTION_PITY_THRESHOLD,
    reward: {
      accountXp: 25,
      regionalMaterialYieldBonus: { sunlitTimber: 0.02 },
      masteryXpBonus: { "sunlit-marches": 0.02 },
      titleId: "title-sunlit-collector",
      trophyId: "trophy-sunlit-relic-set"
    }
  },
  {
    id: "emberwood-heartwood-relics",
    name: "Emberwood Heartwood Relics",
    regionId: "emberwood",
    materialId: "emberResin",
    pieces: [
      { id: "lanternroot-emberglass", name: "Lanternroot Emberglass" },
      { id: "saffron-sigil-stone", name: "Saffron Sigil Stone" },
      { id: "cinderleaf-bridge-nail", name: "Cinderleaf Bridge Nail" },
      { id: "ever-burning-scale", name: "Ever-Burning Scale" }
    ],
    eligibleDungeonIds: ["lanternroot-path", "saffron-sigil-grove", "cinderleaf-crossing", "emberwood-heart"],
    normalSuccessChance: NORMAL_SUCCESS_COLLECTION_CHANCE,
    normalFailureChance: NORMAL_FAILURE_COLLECTION_CHANCE,
    bossSuccessChance: BOSS_SUCCESS_COLLECTION_CHANCE,
    pityThreshold: COLLECTION_PITY_THRESHOLD,
    reward: {
      accountXp: 30,
      regionalMaterialYieldBonus: { emberResin: 0.02 },
      bossSuccessChanceBonus: { emberwood: 0.01 },
      titleId: "title-ember-curator",
      trophyId: "trophy-emberwood-relic-set"
    }
  }
];

function uniqueValidPieceIds(collection: RegionCollectionDefinition, pieceIds: string[]): string[] {
  const validIds = new Set(collection.pieces.map((piece) => piece.id));
  return Array.from(new Set(pieceIds.filter((pieceId) => validIds.has(pieceId))));
}

function getExistingCollectionState(state: GameState, collectionId: string): RegionCollectionState | null {
  return state.regionProgress.collections[collectionId] ?? null;
}

function ensureCollectionState(state: GameState, collection: RegionCollectionDefinition): RegionCollectionState {
  const existing = getExistingCollectionState(state, collection.id);
  const normalized: RegionCollectionState = {
    foundPieceIds: uniqueValidPieceIds(collection, existing?.foundPieceIds ?? []),
    missesSincePiece: Math.max(0, Math.floor(existing?.missesSincePiece ?? 0)),
    completedAt: existing?.completedAt ?? null,
    dust: Math.max(0, Math.floor(existing?.dust ?? 0))
  };
  state.regionProgress.collections[collection.id] = normalized;
  return normalized;
}

function getMissingPieces(collection: RegionCollectionDefinition, collectionState: RegionCollectionState) {
  const found = new Set(collectionState.foundPieceIds);
  return collection.pieces.filter((piece) => !found.has(piece.id));
}

export function getCollectionDefinition(collectionId: string): RegionCollectionDefinition | null {
  return REGION_COLLECTIONS.find((collection) => collection.id === collectionId) ?? null;
}

export function getCollectionDefinitionForDungeon(dungeonId: string): RegionCollectionDefinition | null {
  return REGION_COLLECTIONS.find((collection) => collection.eligibleDungeonIds.includes(dungeonId)) ?? null;
}

export function getRegionCollections(regionId: string): RegionCollectionDefinition[] {
  return REGION_COLLECTIONS.filter((collection) => collection.regionId === regionId);
}

export function isCollectionVisible(state: GameState, collection: RegionCollectionDefinition): boolean {
  const collectionState = getExistingCollectionState(state, collection.id);
  if (collectionState && (collectionState.foundPieceIds.length > 0 || collectionState.missesSincePiece > 0 || collectionState.completedAt)) {
    return true;
  }
  return collection.eligibleDungeonIds.some((dungeonId) => (state.dungeonClears[dungeonId] ?? 0) > 0);
}

export function isCollectionComplete(state: GameState, collectionId: string): boolean {
  const collection = getCollectionDefinition(collectionId);
  if (!collection) return false;
  const collectionState = getExistingCollectionState(state, collectionId);
  if (!collectionState) return false;
  return Boolean(collectionState.completedAt) || uniqueValidPieceIds(collection, collectionState.foundPieceIds).length >= collection.pieces.length;
}

export function getRegionCollectionSummary(state: GameState, collectionId: string): RegionCollectionSummary | null {
  const collection = getCollectionDefinition(collectionId);
  if (!collection) return null;
  const collectionState = getExistingCollectionState(state, collection.id);
  const foundPieceIds = uniqueValidPieceIds(collection, collectionState?.foundPieceIds ?? []);
  const found = new Set(foundPieceIds);
  const piecesFound = foundPieceIds.length;
  const piecesTotal = collection.pieces.length;
  return {
    collectionId: collection.id,
    name: collection.name,
    regionId: collection.regionId,
    materialId: collection.materialId,
    pieces: collection.pieces.map((piece) => ({ ...piece, found: found.has(piece.id) })),
    piecesFound,
    piecesTotal,
    completionPercent: Math.floor((piecesFound / Math.max(1, piecesTotal)) * 100),
    missesSincePiece: Math.max(0, Math.floor(collectionState?.missesSincePiece ?? 0)),
    pityThreshold: collection.pityThreshold,
    completedAt: collectionState?.completedAt ?? null,
    dust: Math.max(0, Math.floor(collectionState?.dust ?? 0)),
    visible: isCollectionVisible(state, collection)
  };
}

export function getVisibleRegionCollectionSummaries(state: GameState, regionId: string): RegionCollectionSummary[] {
  return getRegionCollections(regionId)
    .map((collection) => getRegionCollectionSummary(state, collection.id))
    .filter((summary): summary is RegionCollectionSummary => Boolean(summary?.visible));
}

function shouldAwardCollectionPiece(
  collection: RegionCollectionDefinition,
  collectionState: RegionCollectionState,
  dungeon: DungeonDefinition,
  success: boolean,
  firstClear: boolean,
  chanceBonus: number,
  rng: Rng
): boolean {
  if (success && dungeon.boss && firstClear) {
    return true;
  }
  if (success && collectionState.missesSincePiece >= collection.pityThreshold) {
    return true;
  }
  if (success) {
    return rng.next() <= Math.min(0.95, (dungeon.boss ? collection.bossSuccessChance : collection.normalSuccessChance) + chanceBonus);
  }
  return rng.next() <= Math.min(0.95, collection.normalFailureChance + chanceBonus);
}

export function applyCollectionProgress(
  state: GameState,
  dungeon: DungeonDefinition,
  success: boolean,
  firstClear: boolean,
  rng: Rng,
  now: number
): CollectionProgressSummary | null {
  const collection = getCollectionDefinitionForDungeon(dungeon.id);
  if (!collection) {
    return null;
  }

  const visibleBeforeRoll = isCollectionVisible(state, collection);
  const canRoll = success || visibleBeforeRoll;
  if (!canRoll) {
    return null;
  }

  const collectionState = ensureCollectionState(state, collection);
  const accountXpBefore = state.accountRank.accountXp;
  const accountRankBefore = state.accountRank.accountRank;
  let accountXpAfter = accountXpBefore;
  let accountRankAfter = accountRankBefore;
  let accountXpGained = 0;
  let rankUps: number[] = [];
  let pieceId: string | null = null;
  let pieceName: string | null = null;
  let pityAdvanced = false;
  let completed = false;
  let dustGained = 0;
  const titlesUnlocked: TitleDefinition[] = [];
  const trophiesUnlocked: TrophyDefinition[] = [];

  const missingPieces = getMissingPieces(collection, collectionState);
  const awardsPiece = shouldAwardCollectionPiece(
    collection,
    collectionState,
    dungeon,
    success,
    firstClear,
    getOutpostCollectionChanceBonus(state, collection.regionId) + getEquippedTraitCollectionChanceBonus(state),
    rng
  );

  if (awardsPiece && missingPieces.length > 0) {
    const piece = rng.pick(missingPieces);
    pieceId = piece.id;
    pieceName = piece.name;
    collectionState.foundPieceIds = [...collectionState.foundPieceIds, piece.id];
    collectionState.missesSincePiece = 0;

    const remainingPieces = getMissingPieces(collection, collectionState);
    if (remainingPieces.length === 0 && !collectionState.completedAt) {
      collectionState.completedAt = now;
      completed = true;
      accountXpGained = collection.reward.accountXp;
      const account = applyAccountXp(state, accountXpGained, now);
      accountXpAfter = account.afterXp;
      accountRankAfter = account.afterRank;
      rankUps = account.rankUps;
      state.accountPersonalRecords.totalCollectionsCompleted += 1;
      if (collection.reward.titleId) {
        const title = unlockTitle(state, collection.reward.titleId, now);
        if (title) titlesUnlocked.push(title);
      }
      if (collection.reward.trophyId) {
        const trophy = unlockTrophy(state, collection.reward.trophyId, now);
        if (trophy) trophiesUnlocked.push(trophy);
      }
    }
  } else if (awardsPiece && missingPieces.length === 0) {
    dustGained = DUPLICATE_DUST_PER_PIECE;
    collectionState.dust = (collectionState.dust ?? 0) + dustGained;
  } else if (missingPieces.length > 0) {
    collectionState.missesSincePiece += 1;
    pityAdvanced = true;
  }

  const piecesFound = uniqueValidPieceIds(collection, collectionState.foundPieceIds).length;
  return {
    collectionId: collection.id,
    collectionName: collection.name,
    regionId: collection.regionId,
    eligible: true,
    pieceId,
    pieceName,
    piecesFound,
    piecesTotal: collection.pieces.length,
    missesSincePiece: collectionState.missesSincePiece,
    pityThreshold: collection.pityThreshold,
    pityAdvanced,
    completed,
    dustGained,
    accountXpGained,
    accountXpBefore,
    accountXpAfter,
    accountRankBefore,
    accountRankAfter,
    rankUps,
    titlesUnlocked,
    trophiesUnlocked
  };
}
