import { OFFLINE_CAP_MS } from "./constants";
import { applyCaravanOfflineProgress } from "./caravan";
import { DUNGEONS } from "./content";
import { ensureDailies } from "./dailies";
import { cloneState } from "./state";
import type { GameState, MaterialBundle, OfflineDeltaSummary, OfflineSummary, ResolveSummary } from "./types";
import { regenerateFocus } from "./focus";
import { applyConstructionOfflineProgress } from "./town";

export type ReturnReportRowTone = "neutral" | "success" | "warning" | "danger";

export type ReturnReportRow = {
  id: string;
  label: string;
  value: string;
  tone: ReturnReportRowTone;
};

export type ReturnReportAction = {
  id: string;
  label: string;
  tab: "expeditions" | "town" | "dailies" | "forge" | "hero" | "inventory" | "account" | "reincarnation" | "settings";
  primary: boolean;
};

export type ReturnReportSummary = {
  kind: "offline" | "expedition" | "empty";
  headline: string;
  detail: string;
  rows: ReturnReportRow[];
  actions: ReturnReportAction[];
};

function formatReportNumber(value: number): string {
  return Math.floor(value).toLocaleString();
}

function formatReportRewards(summary: ResolveSummary): string {
  const parts = [
    summary.rewards.xp > 0 ? `+${formatReportNumber(summary.rewards.xp)} XP` : null,
    summary.rewards.gold > 0 ? `+${formatReportNumber(summary.rewards.gold)} Gold` : null,
    (summary.rewards.materials.fragments ?? 0) > 0 ? `+${formatReportNumber(summary.rewards.materials.fragments ?? 0)} Fragments` : null,
    summary.progress.accountXpGained > 0 ? `+${formatReportNumber(summary.progress.accountXpGained)} Account XP` : null
  ].filter(Boolean);
  return parts.join(", ") || "No direct rewards";
}

export function getReturnReportSummary(
  state: GameState,
  offlineSummary: OfflineDeltaSummary | null,
  expeditionResult: ResolveSummary | null,
  _now: number
): ReturnReportSummary {
  if (expeditionResult) {
    const actions: ReturnReportAction[] = [
      { id: "expeditions", label: "Continue Expeditions", tab: "expeditions", primary: true },
      { id: "orders", label: "Open Orders", tab: "dailies", primary: false }
    ];
    if (expeditionResult.item) {
      actions.splice(1, 0, { id: "inventory", label: "Inspect Loot", tab: "inventory", primary: false });
    }
    return {
      kind: "expedition",
      headline: expeditionResult.success ? `${expeditionResult.dungeon.name} cleared` : `${expeditionResult.dungeon.name} failed`,
      detail: expeditionResult.bossClear ? "Boss report filed in the War Room." : "Expedition report ready for guild review.",
      rows: [
        { id: "result", label: "Result", value: expeditionResult.success ? "Success" : "Retreat", tone: expeditionResult.success ? "success" : "warning" },
        { id: "rewards", label: "Rewards", value: formatReportRewards(expeditionResult), tone: "success" },
        { id: "mastery", label: "Route Mastery", value: `+${formatReportNumber(expeditionResult.progress.masteryXpGained)} XP`, tone: "neutral" }
      ],
      actions
    };
  }

  if (!offlineSummary) {
    return {
      kind: "empty",
      headline: "No guild report pending",
      detail: "The guild is waiting for the next order.",
      rows: [],
      actions: [{ id: "expeditions", label: "Open Expeditions", tab: "expeditions", primary: true }]
    };
  }

  const activeDungeon = state.activeExpedition ? DUNGEONS.find((dungeon) => dungeon.id === state.activeExpedition?.dungeonId) ?? null : null;
  const rows: ReturnReportRow[] = [];
  if (offlineSummary.expeditionReady) {
    rows.push({ id: "expedition-ready", label: "Expedition", value: activeDungeon ? `${activeDungeon.name} ready to resolve` : "Ready to resolve", tone: "success" });
  }
  if (offlineSummary.caravan) {
    rows.push({
      id: "caravan",
      label: "Caravan",
      value: offlineSummary.caravan.completed ? "Returned with completed rewards" : "Progressed while away",
      tone: offlineSummary.caravan.completed ? "success" : "neutral"
    });
  }
  if (offlineSummary.construction) {
    rows.push({
      id: "construction",
      label: "Guild Project",
      value: `Level ${offlineSummary.construction.targetLevel} ready to complete`,
      tone: "success"
    });
  }
  if (offlineSummary.focusGained > 0) {
    rows.push({ id: "focus", label: "Focus", value: `+${formatReportNumber(offlineSummary.focusGained)} regenerated`, tone: "neutral" });
  }
  if (offlineSummary.dailyReset) {
    rows.push({ id: "orders", label: "Orders", value: "Daily orders refreshed", tone: "neutral" });
  }
  if (Object.values(offlineSummary.mineGains).some((value) => (value ?? 0) > 0)) {
    rows.push({ id: "mine", label: "Mine", value: "Materials recovered", tone: "success" });
  }

  const actions: ReturnReportAction[] = [];
  if (offlineSummary.expeditionReady || offlineSummary.caravan) {
    actions.push({ id: "expeditions", label: offlineSummary.caravan?.completed ? "Claim Caravan" : "Open Expeditions", tab: "expeditions", primary: actions.length === 0 });
  }
  if (offlineSummary.construction) {
    actions.push({ id: "guildhall", label: "Open Guildhall", tab: "town", primary: actions.length === 0 });
  }
  actions.push({ id: "orders", label: "Open Orders", tab: "dailies", primary: actions.length === 0 });

  return {
    kind: "offline",
    headline: "Guild report ready",
    detail: `Away progress applied. Offline gains cap at ${OFFLINE_CAP_MS / (60 * 60 * 1000)} hours.`,
    rows,
    actions
  };
}

export function applyOfflineProgress(state: GameState, now: number): OfflineSummary {
  const effectiveNow = Math.min(now, state.updatedAt + OFFLINE_CAP_MS);
  const capped = now - state.updatedAt > OFFLINE_CAP_MS;
  const elapsedMs = Math.max(0, effectiveNow - state.updatedAt);
  let next = cloneState(state);
  const dailyPrepared = ensureDailies(next, effectiveNow);
  next = dailyPrepared.state;
  const focusGained = regenerateFocus(next, effectiveNow).gained;
  const caravan = applyCaravanOfflineProgress(next, effectiveNow, state.updatedAt);
  const construction = applyConstructionOfflineProgress(next, effectiveNow);
  const mineGains: Partial<MaterialBundle> = {};
  let expeditionSummary = null;
  const expeditionReady = Boolean(next.activeExpedition && effectiveNow >= next.activeExpedition.endsAt);

  next.updatedAt = now;
  const anyMineGains = Object.values(mineGains).some((value) => value > 0);
  const summary =
    expeditionSummary || expeditionReady || caravan || construction || dailyPrepared.reset || focusGained > 0 || anyMineGains
      ? {
          expedition: expeditionSummary,
          expeditionReady,
          caravan,
          construction,
          mineGains,
          focusGained,
          dailyReset: dailyPrepared.reset,
          elapsedMs
        }
      : null;
  return { state: next, summary, capped };
}
