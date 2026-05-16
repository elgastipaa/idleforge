import { cloneState } from "./state";
import type {
  ActionResult,
  EventBannerSummary,
  EventDefinition,
  EventProgressState,
  EventReward,
  EventRewardTier,
  EventRewardTierStatus,
  GameState,
  RegionMaterialId
} from "./types";

const FIRST_EVENT_ID = "guild-foundry-festival";
const FIRST_EVENT_REWARD_SCHEDULE_ID = "guild-foundry-festival-schedule";

const EVENT_REWARD_SCHEDULES: Record<string, EventRewardTier[]> = {
  [FIRST_EVENT_REWARD_SCHEDULE_ID]: [
    {
      tier: 1,
      targetParticipation: 4,
      label: "Festival Warmup",
      reward: { gold: 120, fragments: 20, focus: 10, regionalMaterials: {} }
    },
    {
      tier: 2,
      targetParticipation: 10,
      label: "Guild Momentum",
      reward: { gold: 320, fragments: 45, focus: 15, regionalMaterials: { oathEmber: 6 } }
    },
    {
      tier: 3,
      targetParticipation: 20,
      label: "Forgelight Finale",
      reward: { gold: 700, fragments: 90, focus: 25, regionalMaterials: { oathEmber: 10, stormglassShard: 6 } }
    }
  ]
};

export const EVENT_DEFINITIONS: EventDefinition[] = [
  {
    id: FIRST_EVENT_ID,
    name: "Guild Foundry Festival",
    description:
      "A launch polish event focused on steady participation: finish expeditions, collect temporary bonuses, and claim reward tiers without daily pressure.",
    startsAt: Date.UTC(2026, 4, 16, 0, 0, 0),
    endsAt: Date.UTC(2027, 0, 1, 0, 0, 0),
    themeRegionId: "first-forge",
    bonusModifiers: [
      { type: "extraMasteryXp", multiplier: 1.1 },
      { type: "extraRegionalMaterial", regionId: "first-forge", multiplier: 1.2 }
    ],
    rewardScheduleId: FIRST_EVENT_REWARD_SCHEDULE_ID
  }
];

function getEmptyEventProgress(eventId: string): EventProgressState {
  return {
    eventId,
    participation: 0,
    claimedRewards: []
  };
}

function uniqueSortedTierIndexes(indexes: number[]): number[] {
  return Array.from(new Set(indexes.filter((index) => Number.isFinite(index) && index >= 0))).sort((a, b) => a - b);
}

function normalizeEventReward(reward: EventReward): EventReward {
  const regionalMaterials = Object.entries(reward.regionalMaterials ?? {}).reduce<Partial<Record<RegionMaterialId, number>>>(
    (output, [materialId, amount]) => {
      const normalized = Math.max(0, Math.floor(Number(amount) || 0));
      if (normalized > 0) {
        output[materialId as RegionMaterialId] = normalized;
      }
      return output;
    },
    {}
  );
  return {
    gold: Math.max(0, Math.floor(reward.gold)),
    fragments: Math.max(0, Math.floor(reward.fragments)),
    focus: Math.max(0, Math.floor(reward.focus)),
    regionalMaterials
  };
}

function applyEventReward(state: GameState, reward: EventReward) {
  const normalizedReward = normalizeEventReward(reward);
  state.resources.gold += normalizedReward.gold;
  state.resources.fragments += normalizedReward.fragments;
  state.focus.current = Math.min(state.focus.cap, state.focus.current + normalizedReward.focus);
  (Object.keys(normalizedReward.regionalMaterials) as RegionMaterialId[]).forEach((materialId) => {
    const amount = normalizedReward.regionalMaterials[materialId] ?? 0;
    if (amount > 0) {
      state.regionProgress.materials[materialId] = (state.regionProgress.materials[materialId] ?? 0) + amount;
    }
  });
}

export function getEventDefinition(eventId: string): EventDefinition | null {
  return EVENT_DEFINITIONS.find((event) => event.id === eventId) ?? null;
}

export function getEventRewardSchedule(scheduleId: string): EventRewardTier[] {
  return EVENT_REWARD_SCHEDULES[scheduleId] ?? [];
}

export function isEventActive(event: EventDefinition, now: number): boolean {
  return now >= event.startsAt && now < event.endsAt;
}

export function getActiveEvents(now: number): EventDefinition[] {
  return EVENT_DEFINITIONS.filter((event) => isEventActive(event, now)).sort((a, b) => a.startsAt - b.startsAt);
}

export function getEventProgress(state: GameState, eventId: string): EventProgressState {
  const progress = state.eventProgress[eventId];
  if (!progress) return getEmptyEventProgress(eventId);
  return {
    eventId,
    participation: Math.max(0, Math.floor(progress.participation ?? 0)),
    claimedRewards: uniqueSortedTierIndexes(progress.claimedRewards ?? [])
  };
}

function ensureEventProgress(state: GameState, eventId: string): EventProgressState {
  const normalized = getEventProgress(state, eventId);
  state.eventProgress[eventId] = normalized;
  return normalized;
}

export function getEventMasteryXpMultiplier(_state: GameState, _regionId: string, now: number): number {
  const events = getActiveEvents(now);
  if (events.length === 0) return 1;
  return events.reduce((multiplier, event) => {
    const extra = event.bonusModifiers.reduce((acc, modifier) => {
      if (modifier.type !== "extraMasteryXp") return acc;
      return acc * Math.max(1, modifier.multiplier);
    }, 1);
    return multiplier * extra;
  }, 1);
}

export function getEventRegionalMaterialMultiplier(_state: GameState, regionId: string, now: number): number {
  const events = getActiveEvents(now);
  if (events.length === 0) return 1;
  return events.reduce((multiplier, event) => {
    const extra = event.bonusModifiers.reduce((acc, modifier) => {
      if (modifier.type !== "extraRegionalMaterial" || modifier.regionId !== regionId) return acc;
      return acc * Math.max(1, modifier.multiplier);
    }, 1);
    return multiplier * extra;
  }, 1);
}

export function recordEventParticipation(state: GameState, now: number, amount = 1): GameState {
  const delta = Math.max(0, Math.floor(amount));
  if (delta <= 0) return state;
  const activeEvents = getActiveEvents(now);
  if (activeEvents.length === 0) return state;
  activeEvents.forEach((event) => {
    const progress = ensureEventProgress(state, event.id);
    progress.participation += delta;
  });
  return state;
}

export function getEventBannerSummary(state: GameState, now: number): EventBannerSummary | null {
  const activeEvent = getActiveEvents(now)[0];
  if (!activeEvent) return null;
  const progress = getEventProgress(state, activeEvent.id);
  const tiers: EventRewardTierStatus[] = getEventRewardSchedule(activeEvent.rewardScheduleId).map((tier, index) => {
    const claimed = progress.claimedRewards.includes(index);
    const remaining = Math.max(0, tier.targetParticipation - progress.participation);
    return {
      ...tier,
      rewardIndex: index,
      claimed,
      claimable: !claimed && remaining <= 0,
      remaining
    };
  });

  return {
    event: activeEvent,
    progress,
    tiers,
    active: true,
    startsInMs: Math.max(0, activeEvent.startsAt - now),
    endsInMs: Math.max(0, activeEvent.endsAt - now)
  };
}

export function claimEventReward(state: GameState, eventId: string, rewardTierIndex: number, now: number): ActionResult {
  const event = getEventDefinition(eventId);
  if (!event) {
    return { ok: false, state, error: "Event not found." };
  }
  const schedule = getEventRewardSchedule(event.rewardScheduleId);
  const tier = schedule[rewardTierIndex];
  if (!tier) {
    return { ok: false, state, error: "Event reward tier not found." };
  }

  const normalizedTierIndex = Math.max(0, Math.floor(rewardTierIndex));
  const progress = getEventProgress(state, eventId);
  if (progress.claimedRewards.includes(normalizedTierIndex)) {
    return { ok: false, state, error: "Event reward already claimed." };
  }
  if (progress.participation < tier.targetParticipation) {
    return { ok: false, state, error: "Event reward tier is not complete yet." };
  }

  const next = cloneState(state);
  const nextProgress = ensureEventProgress(next, eventId);
  nextProgress.claimedRewards = uniqueSortedTierIndexes([...nextProgress.claimedRewards, normalizedTierIndex]);
  applyEventReward(next, tier.reward);
  next.updatedAt = now;

  return { ok: true, state: next, message: `${event.name}: ${tier.label} reward claimed.` };
}
