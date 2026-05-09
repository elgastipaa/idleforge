"use client";

import { create } from "zustand";
import {
  SAVE_KEY,
  applyOfflineProgress,
  buyBuildingUpgrade,
  claimDailyTask,
  craftItem,
  buyRenownUpgrade,
  changeHeroClass,
  createInitialState,
  equipItem,
  ensureDailies,
  importSave,
  loadSave,
  performPrestige,
  rerollItemAffix,
  resolveExpedition,
  salvageItem,
  sellItem,
  serializeSave,
  startExpedition,
  upgradeItem,
  type BuildingId,
  type GameState,
  type HeroClassId,
  type OfflineDeltaSummary,
  type ResolveExpeditionOptions,
  type RenownUpgradeId,
  type ResolveSummary
} from "@/game";

export type GameStore = {
  state: GameState;
  hydrated: boolean;
  error: string | null;
  lastMessage: string | null;
  lastExpeditionResult: ResolveSummary | null;
  lastOfflineSummary: OfflineDeltaSummary | null;
  hydrate: () => void;
  startExpedition: (dungeonId: string) => void;
  claimExpedition: (options?: ResolveExpeditionOptions) => void;
  createHero: (name: string, classId: HeroClassId) => void;
  equipItem: (itemId: string) => void;
  sellItem: (itemId: string) => void;
  salvageItem: (itemId: string) => void;
  craftItem: (slot?: "weapon" | "helm" | "armor" | "boots" | "relic", classBias?: boolean) => void;
  upgradeItem: (itemId: string) => void;
  rerollItemAffix: (itemId: string, affixIndex: number) => void;
  buyBuilding: (buildingId: BuildingId) => void;
  claimDaily: (taskId: string) => void;
  prestige: () => void;
  buyRenownUpgrade: (upgradeId: RenownUpgradeId) => void;
  changeClass: (classId: HeroClassId) => void;
  setDebugBalance: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  dismissOnboarding: () => void;
  exportSave: () => string;
  importSaveRaw: (raw: string) => void;
  resetSave: () => void;
  clearNotice: () => void;
  dismissExpeditionResult: () => void;
};

const DEBUG_BALANCE_ALLOWED = process.env.NODE_ENV !== "production";

function makeSeed(now: number): string {
  return `guild-${now.toString(36)}`;
}

function persist(state: GameState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SAVE_KEY, serializeSave(state, Date.now()));
}

function createFreshState(now = Date.now()) {
  const base = createInitialState(makeSeed(now), now);
  return ensureDailies(base, now).state;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: createFreshState(),
  hydrated: false,
  error: null,
  lastMessage: null,
  lastExpeditionResult: null,
  lastOfflineSummary: null,

  hydrate: () => {
    if (typeof window === "undefined") {
      set({ hydrated: true });
      return;
    }

    const now = Date.now();
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
      const state = createFreshState(now);
      persist(state);
      set({ state, hydrated: true, error: null, lastMessage: "Create your hero and start the first expedition.", lastExpeditionResult: null, lastOfflineSummary: null });
      return;
    }

    const loaded = loadSave(raw);
    if (!loaded.ok) {
      const state = createFreshState(now);
      persist(state);
      set({
        state,
        hydrated: true,
        error: loaded.error,
        lastMessage: "A new save was created because the old local save could not load.",
        lastExpeditionResult: null,
        lastOfflineSummary: null
      });
      return;
    }

    const offline = applyOfflineProgress(loaded.state, now);
    let hydratedState = offline.state;
    if (!DEBUG_BALANCE_ALLOWED && (hydratedState.settings.debugBalance || hydratedState.mode === "debug")) {
      hydratedState = structuredClone(hydratedState) as GameState;
      hydratedState.settings.debugBalance = false;
      hydratedState.mode = "standard";
      hydratedState.updatedAt = now;
    }
    persist(hydratedState);
    const summaryText = offline.summary
      ? [
          offline.summary.expedition ? `Expedition ${offline.summary.expedition.dungeon.name} resolved.` : null,
          offline.summary.vigorGained > 0 ? `+${offline.summary.vigorGained} Vigor regenerated.` : null,
          Object.values(offline.summary.mineGains).some((value) => value > 0) ? "Mine generated materials." : null,
          offline.summary.dailyReset ? "Dailies refreshed." : null
        ]
          .filter(Boolean)
          .join(" ")
      : "Welcome back.";
    set({
      state: hydratedState,
      hydrated: true,
      error: null,
      lastMessage: `${summaryText}${offline.capped ? " Offline gains were capped at 8 hours." : ""}`,
      lastExpeditionResult: offline.summary?.expedition ?? null,
      lastOfflineSummary: offline.summary
    });
  },

  createHero: (name, classId) => {
    const now = Date.now();
    let state = changeHeroClass(get().state, classId, now);
    state = structuredClone(state) as GameState;
    state.hero.name = name.trim() || "Relic Warden";
    state.settings.heroCreated = true;
    state.updatedAt = now;
    state = ensureDailies(state, now).state;
    persist(state);
    set({ state, error: null, lastMessage: "Hero created. Your first expedition is ready.", lastExpeditionResult: null, lastOfflineSummary: null });
  },

  startExpedition: (dungeonId) => {
    const result = startExpedition(get().state, dungeonId, Date.now());
    if (!result.ok) {
      set({ error: result.error });
      return;
    }
    persist(result.state);
    set({ state: result.state, error: null, lastMessage: result.message ?? "Expedition started.", lastExpeditionResult: null, lastOfflineSummary: null });
  },

  claimExpedition: (options = {}) => {
    const result = resolveExpedition(get().state, Date.now(), options);
    if (!result.ok) {
      set({ error: result.error });
      return;
    }
    persist(result.state);
    set({
      state: result.state,
      error: null,
      lastMessage: null,
      lastExpeditionResult: result.summary,
      lastOfflineSummary: null
    });
  },

  equipItem: (itemId) => {
    const result = equipItem(get().state, itemId, Date.now());
    if (!result.ok) {
      set({ error: result.error });
      return;
    }
    persist(result.state);
    set({ state: result.state, error: null, lastMessage: result.message ?? "Item equipped." });
  },

  sellItem: (itemId) => {
    const result = sellItem(get().state, itemId, Date.now());
    if (!result.ok) {
      set({ error: result.error });
      return;
    }
    persist(result.state);
    set({ state: result.state, error: null, lastMessage: result.message ?? "Item sold." });
  },

  salvageItem: (itemId) => {
    const result = salvageItem(get().state, itemId, Date.now());
    if (!result.ok) {
      set({ error: result.error });
      return;
    }
    persist(result.state);
    set({ state: result.state, error: null, lastMessage: result.message ?? "Item salvaged." });
  },

  craftItem: (slot, classBias = false) => {
    const result = craftItem(get().state, Date.now(), { slot, classBias });
    if (!result.ok) {
      set({ error: result.error });
      return;
    }
    persist(result.state);
    set({ state: result.state, error: null, lastMessage: result.message ?? "Item crafted." });
  },

  upgradeItem: (itemId) => {
    const result = upgradeItem(get().state, itemId, Date.now());
    if (!result.ok) {
      set({ error: result.error });
      return;
    }
    persist(result.state);
    set({ state: result.state, error: null, lastMessage: result.message ?? "Item upgraded." });
  },

  rerollItemAffix: (itemId, affixIndex) => {
    const result = rerollItemAffix(get().state, itemId, affixIndex, Date.now());
    if (!result.ok) {
      set({ error: result.error });
      return;
    }
    persist(result.state);
    set({ state: result.state, error: null, lastMessage: result.message ?? "Affix rerolled." });
  },

  buyBuilding: (buildingId) => {
    const result = buyBuildingUpgrade(get().state, buildingId, Date.now());
    if (!result.ok) {
      set({ error: result.error });
      return;
    }
    persist(result.state);
    set({ state: result.state, error: null, lastMessage: result.message ?? "Building upgraded." });
  },

  claimDaily: (taskId) => {
    const result = claimDailyTask(get().state, taskId, Date.now());
    if (!result.ok) {
      set({ error: result.error });
      return;
    }
    persist(result.state);
    set({ state: result.state, error: null, lastMessage: result.message ?? "Daily claimed." });
  },

  prestige: () => {
    const result = performPrestige(get().state, Date.now());
    if (!result.ok) {
      set({ error: result.error });
      return;
    }
    persist(result.state);
    set({ state: result.state, error: null, lastMessage: `Reincarnation complete. +${result.renownGained} Soul Marks.`, lastExpeditionResult: null, lastOfflineSummary: null });
  },

  buyRenownUpgrade: (upgradeId) => {
    const result = buyRenownUpgrade(get().state, upgradeId, Date.now());
    if (!result.ok) {
      set({ error: result.error });
      return;
    }
    persist(result.state);
    set({ state: result.state, error: null, lastMessage: result.message ?? "Soul Mark upgrade purchased." });
  },

  changeClass: (classId) => {
    const state = changeHeroClass(get().state, classId, Date.now());
    persist(state);
    set({ state, error: null, lastMessage: "Hero class selected." });
  },

  setDebugBalance: (enabled) => {
    if (!DEBUG_BALANCE_ALLOWED) {
      set({ error: null, lastMessage: "Debug balance is disabled in playtest builds." });
      return;
    }
    const state = structuredClone(get().state) as GameState;
    state.settings.debugBalance = enabled;
    state.mode = enabled ? "debug" : "standard";
    state.updatedAt = Date.now();
    persist(state);
    set({ state, error: null, lastMessage: enabled ? "Debug balance enabled." : "Debug balance disabled." });
  },

  setReducedMotion: (enabled) => {
    const state = structuredClone(get().state) as GameState;
    state.settings.reducedMotion = enabled;
    state.updatedAt = Date.now();
    persist(state);
    set({ state, error: null });
  },

  dismissOnboarding: () => {
    const state = structuredClone(get().state) as GameState;
    state.settings.onboardingDismissed = true;
    state.updatedAt = Date.now();
    persist(state);
    set({ state });
  },

  exportSave: () => serializeSave(get().state, Date.now()),

  importSaveRaw: (raw) => {
    const result = importSave(raw, Date.now());
    if (!result.ok) {
      set({ error: result.error });
      return;
    }
    const normalized = ensureDailies(result.state, Date.now()).state;
    persist(normalized);
    set({ state: normalized, error: null, lastMessage: result.message, lastExpeditionResult: null, lastOfflineSummary: null });
  },

  resetSave: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SAVE_KEY);
    }
    const state = createFreshState(Date.now());
    persist(state);
    set({ state, error: null, lastMessage: "Local save reset.", lastExpeditionResult: null, lastOfflineSummary: null });
  },

  clearNotice: () => set({ error: null, lastMessage: null }),

  dismissExpeditionResult: () => set({ lastExpeditionResult: null })
}));
