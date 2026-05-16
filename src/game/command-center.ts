import { DUNGEONS } from "./content";
import { getOrdersBoardSummary, type OrdersBoardSummary } from "./dailies";
import { getEventBannerSummary } from "./events";
import { getNextGoal } from "./expeditions";
import { getWarRoomSummary, type WarRoomSummary } from "./bosses";
import { getRegionFrontSummaries, type RegionFrontSummary } from "./regions";
import { getActiveConstructionProgress, getGuildhallSlotSummaries, type GuildhallSlotSummary } from "./town";
import type { EventBannerSummary, GameState, OfflineDeltaSummary, ResolveSummary } from "./types";

export type CommandCenterTabId = "expeditions" | "town" | "dailies" | "forge" | "hero" | "inventory" | "account" | "reincarnation" | "settings";

export type CommandCenterPrimaryAction = {
  label: string;
  detail: string;
  tab: CommandCenterTabId;
  tone: "neutral" | "success" | "warning" | "urgent";
};

export type CommandCenterTimer = {
  id: string;
  label: string;
  remainingMs: number;
  ready: boolean;
};

export type CommandCenterSummary = {
  primaryAction: CommandCenterPrimaryAction;
  nextGoal: string;
  timers: CommandCenterTimer[];
  event: EventBannerSummary | null;
  orders: OrdersBoardSummary;
  guildhallSlots: GuildhallSlotSummary[];
  frontier: RegionFrontSummary[];
  warRoom: WarRoomSummary;
  activeExpeditionName: string | null;
  hasPendingReport: boolean;
};

function getActiveExpeditionName(state: GameState): string | null {
  if (!state.activeExpedition) return null;
  return DUNGEONS.find((dungeon) => dungeon.id === state.activeExpedition?.dungeonId)?.name ?? state.activeExpedition.dungeonId;
}

function getTimers(state: GameState, now: number): CommandCenterTimer[] {
  const timers: CommandCenterTimer[] = [];
  if (state.activeExpedition) {
    timers.push({
      id: "expedition",
      label: getActiveExpeditionName(state) ?? "Expedition",
      remainingMs: Math.max(0, state.activeExpedition.endsAt - now),
      ready: state.activeExpedition.endsAt <= now
    });
  }
  if (state.caravan.activeJob) {
    timers.push({
      id: "caravan",
      label: "Caravan",
      remainingMs: Math.max(0, state.caravan.activeJob.endsAt - now),
      ready: state.caravan.activeJob.endsAt <= now
    });
  }
  const construction = getActiveConstructionProgress(state, now);
  if (construction) {
    timers.push({
      id: "construction",
      label: "Guild project",
      remainingMs: construction.remainingMs,
      ready: construction.ready
    });
  }
  return timers;
}

export function getCommandCenterSummary(
  state: GameState,
  now: number,
  offlineSummary: OfflineDeltaSummary | null = null,
  expeditionResult: ResolveSummary | null = null
): CommandCenterSummary {
  const event = getEventBannerSummary(state, now);
  const orders = getOrdersBoardSummary(state, now);
  const guildhallSlots = getGuildhallSlotSummaries(state, now);
  const frontier = getRegionFrontSummaries(state);
  const warRoom = getWarRoomSummary(state);
  const timers = getTimers(state, now);
  const activeExpeditionName = getActiveExpeditionName(state);
  const readyTimer = timers.find((timer) => timer.ready);
  const claimableEvent = event?.tiers.find((tier) => tier.claimable) ?? null;
  const nextGoal = getNextGoal(state);

  let primaryAction: CommandCenterPrimaryAction;
  if (expeditionResult) {
    primaryAction = {
      label: "Review guild report",
      detail: `${expeditionResult.dungeon.name} report is ready.`,
      tab: "expeditions",
      tone: expeditionResult.success ? "success" : "warning"
    };
  } else if (offlineSummary?.construction?.completed) {
    primaryAction = {
      label: "Complete guild project",
      detail: `A Guildhall project reached level ${offlineSummary.construction.targetLevel}.`,
      tab: "town",
      tone: "success"
    };
  } else if (offlineSummary?.caravan?.completed) {
    primaryAction = {
      label: "Claim returned Caravan",
      detail: "The Caravan returned while you were away.",
      tab: "expeditions",
      tone: "success"
    };
  } else if (offlineSummary?.expeditionReady) {
    primaryAction = {
      label: "Resolve expedition",
      detail: activeExpeditionName ? `${activeExpeditionName} is ready.` : "An expedition is ready.",
      tab: "expeditions",
      tone: "success"
    };
  } else if (readyTimer?.id === "construction") {
    primaryAction = {
      label: "Complete guild project",
      detail: "Construction is ready to claim in the Guildhall.",
      tab: "town",
      tone: "success"
    };
  } else if (readyTimer?.id === "expedition") {
    primaryAction = {
      label: "Resolve expedition",
      detail: `${readyTimer.label} is ready for report resolution.`,
      tab: "expeditions",
      tone: "success"
    };
  } else if (readyTimer?.id === "caravan") {
    primaryAction = {
      label: "Claim Caravan",
      detail: "The Caravan is ready to return to the guild.",
      tab: "expeditions",
      tone: "success"
    };
  } else if (orders.readyCount > 0) {
    primaryAction = {
      label: "Claim ready orders",
      detail: `${orders.readyCount} order${orders.readyCount === 1 ? " is" : "s are"} ready.`,
      tab: "dailies",
      tone: "urgent"
    };
  } else if (claimableEvent) {
    primaryAction = {
      label: "Claim festival reward",
      detail: `${claimableEvent.label} is ready.`,
      tab: "dailies",
      tone: "success"
    };
  } else if (warRoom.nextBoss?.unlocked && !warRoom.nextBoss.defeated) {
    primaryAction = {
      label: "Review War Room",
      detail: warRoom.nextBoss.recommendedAction,
      tab: "expeditions",
      tone: "warning"
    };
  } else {
    primaryAction = {
      label: "Follow next goal",
      detail: nextGoal,
      tab: "expeditions",
      tone: "neutral"
    };
  }

  return {
    primaryAction,
    nextGoal,
    timers,
    event,
    orders,
    guildhallSlots,
    frontier,
    warRoom,
    activeExpeditionName,
    hasPendingReport: Boolean(offlineSummary || expeditionResult)
  };
}
