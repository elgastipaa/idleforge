import { getEquippedAffixes } from "./affixes";
import { regenerateFocus } from "./focus";
import { getOutpostScoutRevealBonus, getOutpostThreatCoverage } from "./outposts";
import { unlockTrophy } from "./progression";
import { getRegionMaterialId } from "./regions";
import { cloneState } from "./state";
import { getEquippedTraitThreatCoverage, getFamilyPrepMaterialMultiplier, getFamilyScoutCostReduction, getFamilyThreatCoverage } from "./traits";
import type {
  ActionResult,
  BossDefinition,
  BossPrepState,
  BossResolveSummary,
  BossThreatDefinition,
  BossThreatStatus,
  BossViewSummary,
  DungeonDefinition,
  ExpeditionThreatId,
  GameState
} from "./types";

export const EXPEDITION_THREAT_IDS: ExpeditionThreatId[] = ["armored", "cursed", "venom", "elusive", "regenerating", "brutal"];

const PREP_COVERAGE = 0.6;
const EQUIPPED_TRAIT_COVERAGE = 1;
const MAX_THREAT_COVERAGE = 1;
const CRITICAL_UNCOVERED_CAP = 0.55;
const CRITICAL_PARTIAL_CAP = 0.75;
const NON_CRITICAL_UNCOVERED_PENALTY = 0.08;
const NON_CRITICAL_PARTIAL_PENALTY = 0.03;
const SCOUT_INTEL_GAIN = 2;
const FAILURE_INTEL_GAIN = 1;

export const BOSS_DEFINITIONS: BossDefinition[] = [
  {
    id: "bramblecrown",
    dungeonId: "copper-crown-champion",
    regionId: "sunlit-marches",
    name: "Bramblecrown",
    title: "Copper Crown Champion",
    fantasy: "A boastful living hedge-knight wearing polished bark, road tolls, and a crown that is mostly copper.",
    scoutCost: 5,
    prepFocusCost: 10,
    failureIntelText:
      "The champion's bark-plates turned aside your best strike. A Piercing trait or Bark-Hide prep would open the next attempt.",
    threats: [
      {
        id: "armored",
        name: "Bark-Hide",
        critical: true,
        traitAnswerId: "piercing",
        traitAnswerName: "Piercing",
        prepName: "Bark-Hide Brace",
        prepMaterialCost: 2,
        explanation: "Bark-Hide caps your odds unless Piercing gear or prep opens a clean strike."
      },
      {
        id: "brutal",
        name: "Marsh-Crusher",
        critical: false,
        traitAnswerId: "guarded",
        traitAnswerName: "Guarded",
        prepName: "Guard Stakes",
        prepMaterialCost: 3,
        explanation: "Marsh-Crusher punishes fragile builds. Guarded gear or prep softens the hit."
      }
    ]
  },
  {
    id: "cindermaw",
    dungeonId: "emberwood-heart",
    regionId: "emberwood",
    name: "Cindermaw",
    title: "Ever-Burning Heart",
    fantasy: "A beast that seals its wounds with living flame.",
    scoutCost: 8,
    prepFocusCost: 15,
    failureIntelText:
      "Cindermaw sealed the wound with living flame. Bring Flame-Sealed gear, Emberbound prep, or enough intel to cap the fire before the next attempt.",
    threats: [
      {
        id: "regenerating",
        name: "Ever-Burning",
        critical: true,
        traitAnswerId: "flame-sealed",
        traitAnswerName: "Flame-Sealed",
        prepName: "Ever-Burning Seal",
        prepMaterialCost: 4,
        explanation: "Ever-Burning caps your odds unless Flame-Sealed gear or prep prevents the wound from closing."
      },
      {
        id: "venom",
        name: "Ember-Sting",
        critical: false,
        traitAnswerId: "antivenom",
        traitAnswerName: "Antivenom",
        prepName: "Ember Antidote",
        prepMaterialCost: 3,
        explanation: "Ember-Sting makes failed attempts more dangerous. Antivenom or prep covers the risk."
      },
      {
        id: "brutal",
        name: "Inferno-Heart",
        critical: false,
        traitAnswerId: "guarded",
        traitAnswerName: "Guarded",
        prepName: "Heat-Shield",
        prepMaterialCost: 4,
        explanation: "Inferno-Heart favors sturdy builds. Guarded gear or prep keeps the attempt viable."
      }
    ]
  }
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function uniqueThreats(threats: ExpeditionThreatId[]): ExpeditionThreatId[] {
  return Array.from(new Set(threats.filter((threat) => EXPEDITION_THREAT_IDS.includes(threat))));
}

function getDefaultBossPrepState(): BossPrepState {
  return {
    revealedThreats: [],
    prepCharges: {},
    attempts: 0,
    intel: 0
  };
}

function ensureBossPrepState(state: GameState, dungeonId: string): BossPrepState {
  const existing = state.bossPrep[dungeonId];
  const normalized: BossPrepState = {
    revealedThreats: uniqueThreats(existing?.revealedThreats ?? []),
    prepCharges: {},
    attempts: Math.max(0, Math.floor(existing?.attempts ?? 0)),
    intel: Math.max(0, Math.floor(existing?.intel ?? 0))
  };
  EXPEDITION_THREAT_IDS.forEach((threatId) => {
    const charges = Math.max(0, Math.floor(existing?.prepCharges?.[threatId] ?? 0));
    if (charges > 0) normalized.prepCharges[threatId] = charges;
  });
  state.bossPrep[dungeonId] = normalized;
  return normalized;
}

function getNextThreatToReveal(definition: BossDefinition, prepState: BossPrepState): BossThreatDefinition | null {
  const revealed = new Set(prepState.revealedThreats);
  return definition.threats.find((threat) => threat.critical && !revealed.has(threat.id)) ?? definition.threats.find((threat) => !revealed.has(threat.id)) ?? null;
}

function revealThreats(definition: BossDefinition, prepState: BossPrepState, count: number): BossThreatDefinition[] {
  const newlyRevealed: BossThreatDefinition[] = [];
  for (let index = 0; index < count; index += 1) {
    const threat = getNextThreatToReveal(definition, prepState);
    if (!threat) break;
    prepState.revealedThreats = uniqueThreats([...prepState.revealedThreats, threat.id]);
    newlyRevealed.push(threat);
  }
  return newlyRevealed;
}

function getEquippedThreatCoverage(state: GameState, threat: BossThreatDefinition): number {
  const legacyAffixCoverage = getEquippedAffixes(state).some((affix) => affix.id === threat.traitAnswerId) ? EQUIPPED_TRAIT_COVERAGE : 0;
  return Math.max(legacyAffixCoverage, getEquippedTraitThreatCoverage(state, threat.id));
}

export function getBossScoutCost(state: GameState, definition: BossDefinition): number {
  return Math.max(1, definition.scoutCost - getFamilyScoutCostReduction(state, definition.regionId));
}

export function getBossPrepMaterialCost(state: GameState, definition: BossDefinition, threat: BossThreatDefinition): number {
  return Math.max(1, Math.floor(threat.prepMaterialCost * getFamilyPrepMaterialMultiplier(state, definition.regionId)));
}

export function getBossDefinitionForDungeon(dungeonId: string): BossDefinition | null {
  return BOSS_DEFINITIONS.find((boss) => boss.dungeonId === dungeonId) ?? null;
}

export function getBossDefinitionForDungeonDefinition(dungeon: DungeonDefinition): BossDefinition | null {
  return dungeon.boss ? getBossDefinitionForDungeon(dungeon.id) : null;
}

export function getBossPrepState(state: GameState, dungeonId: string): BossPrepState {
  const existing = state.bossPrep[dungeonId];
  if (!existing) return getDefaultBossPrepState();
  return {
    revealedThreats: uniqueThreats(existing.revealedThreats ?? []),
    prepCharges: { ...existing.prepCharges },
    attempts: Math.max(0, Math.floor(existing.attempts ?? 0)),
    intel: Math.max(0, Math.floor(existing.intel ?? 0))
  };
}

export function getBossThreatStatuses(
  state: GameState,
  definition: BossDefinition,
  prepCoverage: Partial<Record<ExpeditionThreatId, number>> = {}
): BossThreatStatus[] {
  const prepState = getBossPrepState(state, definition.dungeonId);
  const revealed = new Set(prepState.revealedThreats);
  return definition.threats.map((threat) => {
    const equippedCoverage = getEquippedThreatCoverage(state, threat);
    const activePrepCoverage =
      (prepCoverage[threat.id] ?? ((prepState.prepCharges[threat.id] ?? 0) > 0 ? PREP_COVERAGE : 0)) +
      getOutpostThreatCoverage(state, definition.regionId, threat.id) +
      getFamilyThreatCoverage(state, definition.regionId, threat.id);
    const coverage = clamp(equippedCoverage + activePrepCoverage, 0, MAX_THREAT_COVERAGE);
    return {
      threat,
      revealed: revealed.has(threat.id),
      coverage,
      equippedCovered: equippedCoverage >= EQUIPPED_TRAIT_COVERAGE,
      prepCoverage: activePrepCoverage,
      prepCharges: prepState.prepCharges[threat.id] ?? 0,
      successImpact: coverage >= 1 ? "covered" : coverage >= 0.5 ? "partial" : "uncovered"
    };
  });
}

export function applyBossThreatsToSuccessChance(
  state: GameState,
  dungeon: DungeonDefinition,
  baseChance: number,
  prepCoverage: Partial<Record<ExpeditionThreatId, number>> = {}
): number {
  const definition = getBossDefinitionForDungeonDefinition(dungeon);
  if (!definition) return baseChance;

  let adjusted = baseChance;
  let cap = 0.96;
  getBossThreatStatuses(state, definition, prepCoverage).forEach((status) => {
    if (status.threat.critical) {
      if (status.coverage <= 0) {
        cap = Math.min(cap, CRITICAL_UNCOVERED_CAP);
      } else if (status.coverage < 1) {
        cap = Math.min(cap, CRITICAL_PARTIAL_CAP);
      }
      return;
    }
    if (status.coverage <= 0) {
      adjusted -= NON_CRITICAL_UNCOVERED_PENALTY;
    } else if (status.coverage < 1) {
      adjusted -= NON_CRITICAL_PARTIAL_PENALTY;
    }
  });
  return clamp(Math.min(adjusted, cap), 0.15, 0.96);
}

export function getBossViewSummary(state: GameState, dungeon: DungeonDefinition, baseSuccessChance: number): BossViewSummary | null {
  const boss = getBossDefinitionForDungeonDefinition(dungeon);
  if (!boss) return null;
  return {
    boss,
    prepState: getBossPrepState(state, dungeon.id),
    statuses: getBossThreatStatuses(state, boss),
    adjustedSuccessChance: baseSuccessChance
  };
}

export function consumeBossPrepForAttempt(
  state: GameState,
  dungeon: DungeonDefinition
): Partial<Record<ExpeditionThreatId, number>> {
  const definition = getBossDefinitionForDungeonDefinition(dungeon);
  if (!definition) return {};
  const prepState = ensureBossPrepState(state, dungeon.id);
  const coverage: Partial<Record<ExpeditionThreatId, number>> = {};
  definition.threats.forEach((threat) => {
    const charges = prepState.prepCharges[threat.id] ?? 0;
    if (charges <= 0) return;
    prepState.prepCharges[threat.id] = charges - 1;
    coverage[threat.id] = PREP_COVERAGE;
  });
  return coverage;
}

export function scoutBoss(state: GameState, dungeonId: string, now: number): ActionResult {
  const definition = getBossDefinitionForDungeon(dungeonId);
  if (!definition) {
    return { ok: false, state, error: "That expedition is not a named boss." };
  }
  let next = cloneState(state);
  regenerateFocus(next, now);
  const scoutCost = getBossScoutCost(next, definition);
  if (next.focus.current < scoutCost) {
    return { ok: false, state: next, error: "Not enough Focus to scout this boss." };
  }
  const prepState = ensureBossPrepState(next, dungeonId);
  const intelGain = SCOUT_INTEL_GAIN + getOutpostScoutRevealBonus(next, definition.regionId);
  const revealed = revealThreats(definition, prepState, intelGain);
  if (revealed.length === 0) {
    return { ok: false, state: next, error: "All boss threats are already scouted." };
  }
  next.focus.current -= scoutCost;
  prepState.intel += revealed.length;
  next.updatedAt = now;
  return { ok: true, state: next, message: `${definition.name} scouted: ${revealed.map((threat) => threat.name).join(", ")} revealed.` };
}

export function prepareBossThreat(state: GameState, dungeonId: string, threatId: ExpeditionThreatId, now: number): ActionResult {
  const definition = getBossDefinitionForDungeon(dungeonId);
  if (!definition) {
    return { ok: false, state, error: "That expedition is not a named boss." };
  }
  const threat = definition.threats.find((entry) => entry.id === threatId);
  if (!threat) {
    return { ok: false, state, error: "That threat does not belong to this boss." };
  }
  let next = cloneState(state);
  regenerateFocus(next, now);
  const prepState = ensureBossPrepState(next, dungeonId);
  if (!prepState.revealedThreats.includes(threatId)) {
    return { ok: false, state: next, error: "Scout this threat before preparing for it." };
  }
  if (next.focus.current < definition.prepFocusCost) {
    return { ok: false, state: next, error: "Not enough Focus to prepare this boss threat." };
  }
  const materialId = getRegionMaterialId(definition.regionId);
  if (!materialId) {
    return { ok: false, state: next, error: "This boss has no active regional material." };
  }
  const materialCost = getBossPrepMaterialCost(next, definition, threat);
  const materialAvailable = next.regionProgress.materials[materialId] ?? 0;
  if (materialAvailable < materialCost) {
    return { ok: false, state: next, error: "Not enough regional material for this prep." };
  }
  next.focus.current -= definition.prepFocusCost;
  next.regionProgress.materials[materialId] = materialAvailable - materialCost;
  prepState.prepCharges[threatId] = (prepState.prepCharges[threatId] ?? 0) + 1;
  next.updatedAt = now;
  return { ok: true, state: next, message: `${threat.prepName} prepared for ${definition.name}.` };
}

export function recordBossAttemptResult(state: GameState, dungeon: DungeonDefinition, success: boolean, now: number): BossResolveSummary | null {
  const definition = getBossDefinitionForDungeonDefinition(dungeon);
  if (!definition) return null;
  const prepState = ensureBossPrepState(state, dungeon.id);
  prepState.attempts += 1;
  let failureIntelText: string | null = null;
  let intelGained = 0;
  let newlyRevealedThreats: BossThreatDefinition[] = [];

  if (!success) {
    failureIntelText = definition.failureIntelText;
    intelGained = FAILURE_INTEL_GAIN;
    prepState.intel += FAILURE_INTEL_GAIN;
    newlyRevealedThreats = revealThreats(definition, prepState, FAILURE_INTEL_GAIN);
    unlockTrophy(state, "trophy-boss-intel-scroll", now);
  } else if (!state.regionProgress.outposts[definition.regionId]) {
    state.regionProgress.outposts[definition.regionId] = { selectedBonusId: null, level: 0 };
  }

  const revealed = new Set(prepState.revealedThreats);
  return {
    bossId: definition.id,
    name: definition.name,
    title: definition.title,
    failureIntelText,
    intelGained,
    newlyRevealedThreats,
    revealedThreats: definition.threats.filter((threat) => revealed.has(threat.id))
  };
}
