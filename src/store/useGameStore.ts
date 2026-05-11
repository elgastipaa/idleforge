"use client";

import { create } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";
import {
  SAVE_KEY,
  applyOfflineProgress,
  buyBuildingUpgrade,
  claimDailyTask,
  claimWeeklyContractMilestone,
  cancelCaravanJob,
  craftItem,
  buyRenownUpgrade,
  changeHeroClass,
  createInitialState,
  equipItem,
  ensureDailies,
  getDungeon,
  importSave,
  loadSave,
  performPrestige,
  rerollItemAffix,
  resolveExpedition,
  salvageItem,
  sellItem,
  serializeSave,
  setLootFocus,
  startCaravanJob,
  startExpedition,
  upgradeItem,
  type BuildingId,
  type CaravanFocusId,
  type GameState,
  type HeroClassId,
  type LootFocusId,
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
  startExpedition: (dungeonId: string) => void;
  claimExpedition: (options?: ResolveExpeditionOptions) => void;
  createHero: (name: string, classId: HeroClassId) => void;
  equipItem: (itemId: string) => void;
  sellItem: (itemId: string) => void;
  salvageItem: (itemId: string) => void;
  craftItem: (slot?: "weapon" | "helm" | "armor" | "boots" | "relic", classBias?: boolean) => void;
  setLootFocus: (focusSlot: LootFocusId) => void;
  upgradeItem: (itemId: string) => void;
  rerollItemAffix: (itemId: string, affixIndex: number) => void;
  buyBuilding: (buildingId: BuildingId) => void;
  claimDaily: (taskId: string) => void;
  claimWeeklyContract: (milestoneIndex: number) => void;
  startCaravanJob: (focusId: CaravanFocusId, durationMs: number) => void;
  cancelCaravanJob: () => void;
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
  dismissOfflineSummary: () => void;
  dismissExpeditionResult: () => void;
};

const DEBUG_BALANCE_ALLOWED = process.env.NODE_ENV !== "production";

function makeSeed(now: number): string {
  return `guild-${now.toString(36)}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function createFreshState(now = Date.now()) {
  const base = createInitialState(makeSeed(now), now);
  return ensureDailies(base, now).state;
}

type PersistedGameSnapshot = Pick<GameStore, "state" | "hydrated" | "error" | "lastMessage" | "lastExpeditionResult" | "lastOfflineSummary">;

function createHydratedSnapshot({
  state,
  error = null,
  lastMessage = null,
  lastExpeditionResult = null,
  lastOfflineSummary = null
}: {
  state: GameState;
  error?: string | null;
  lastMessage?: string | null;
  lastExpeditionResult?: ResolveSummary | null;
  lastOfflineSummary?: OfflineDeltaSummary | null;
}): PersistedGameSnapshot {
  return { state, hydrated: true, error, lastMessage, lastExpeditionResult, lastOfflineSummary };
}

const gamePersistStorage: PersistStorage<PersistedGameSnapshot> = {
  getItem: (): StorageValue<PersistedGameSnapshot> => {
    const now = Date.now();
    try {
      if (!isBrowser()) {
        return { state: createHydratedSnapshot({ state: createFreshState(now) }) };
      }

      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) {
        const state = createFreshState(now);
        window.localStorage.setItem(SAVE_KEY, serializeSave(state, now));
        return { state: createHydratedSnapshot({ state, lastMessage: "Create your hero and start the first expedition." }) };
      }

      const loaded = loadSave(raw);
      if (!loaded.ok) {
        const state = createFreshState(now);
        window.localStorage.setItem(SAVE_KEY, serializeSave(state, now));
        return {
          state: createHydratedSnapshot({
            state,
            error: loaded.error,
            lastMessage: "A new save was created because the old local save could not load."
          })
        };
      }

      const offline = applyOfflineProgress(loaded.state, now);
      let hydratedState = offline.state;
      if (!DEBUG_BALANCE_ALLOWED && (hydratedState.settings.debugBalance || hydratedState.mode === "debug")) {
        hydratedState = structuredClone(hydratedState) as GameState;
        hydratedState.settings.debugBalance = false;
        hydratedState.mode = "standard";
        hydratedState.updatedAt = now;
      }
      window.localStorage.setItem(SAVE_KEY, serializeSave(hydratedState, now));
      const summaryText = offline.summary
        ? [
            offline.summary.expedition ? `Expedition ${offline.summary.expedition.dungeon.name} resolved.` : null,
            offline.summary.expeditionReady && hydratedState.activeExpedition
              ? `Expedition ${getDungeon(hydratedState.activeExpedition.dungeonId).name} is ready to claim.`
              : null,
            offline.summary.vigorGained > 0 ? `+${offline.summary.vigorGained} Vigor regenerated.` : null,
            offline.summary.caravan ? `Caravan returned with ${offline.summary.caravan.completed ? "completed" : "partial"} progress.` : null,
            Object.values(offline.summary.mineGains).some((value) => value > 0) ? "Mine generated materials." : null,
            offline.summary.dailyReset ? "Contracts refreshed." : null
          ]
            .filter(Boolean)
            .join(" ")
        : "Welcome back.";
      return {
        state: createHydratedSnapshot({
          state: hydratedState,
          lastMessage: `${summaryText}${offline.capped ? " Offline gains were capped at 8 hours." : ""}`,
          lastExpeditionResult: offline.summary?.expedition ?? null,
          lastOfflineSummary: offline.summary
        })
      };
    } catch (error) {
      const state = createFreshState(now);
      const hydrationError = error instanceof Error ? error.message : "Unable to access local save.";
      if (isBrowser()) {
        try {
          window.localStorage.setItem(SAVE_KEY, serializeSave(state, now));
        } catch {
          // Best effort fallback if storage is unavailable.
        }
      }
      return { state: createHydratedSnapshot({ state, error: hydrationError, lastMessage: "A new save was created because local storage was unavailable." }) };
    }
  },
  setItem: (_, value) => {
    if (!isBrowser()) {
      return;
    }
    window.localStorage.setItem(SAVE_KEY, serializeSave(value.state.state, Date.now()));
  },
  removeItem: () => {
    if (!isBrowser()) {
      return;
    }
    window.localStorage.removeItem(SAVE_KEY);
  }
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      state: createFreshState(),
      hydrated: false,
      error: null,
      lastMessage: null,
      lastExpeditionResult: null,
      lastOfflineSummary: null,

      createHero: (name, classId) => {
        const now = Date.now();
        let state = changeHeroClass(get().state, classId, now);
        state = structuredClone(state) as GameState;
        state.hero.name = name.trim() || "Relic Warden";
        state.settings.heroCreated = true;
        state.updatedAt = now;
        state = ensureDailies(state, now).state;
        set({ state, error: null, lastMessage: "Hero created. Your first expedition is ready.", lastExpeditionResult: null, lastOfflineSummary: null });
      },

      startExpedition: (dungeonId) => {
        const result = startExpedition(get().state, dungeonId, Date.now());
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: result.message ?? "Expedition started.", lastExpeditionResult: null, lastOfflineSummary: null });
      },

      claimExpedition: (options = {}) => {
        const result = resolveExpedition(get().state, Date.now(), options);
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
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
        set({ state: result.state, error: null, lastMessage: result.message ?? "Item equipped." });
      },

      sellItem: (itemId) => {
        const result = sellItem(get().state, itemId, Date.now());
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: result.message ?? "Item sold." });
      },

      salvageItem: (itemId) => {
        const result = salvageItem(get().state, itemId, Date.now());
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: result.message ?? "Item salvaged." });
      },

      craftItem: (slot, classBias = false) => {
        const result = craftItem(get().state, Date.now(), { slot, classBias });
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: result.message ?? "Item crafted." });
      },

      setLootFocus: (focusSlot) => {
        const result = setLootFocus(get().state, focusSlot, Date.now());
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: result.message ?? "Loot focus updated." });
      },

      upgradeItem: (itemId) => {
        const result = upgradeItem(get().state, itemId, Date.now());
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: result.message ?? "Item upgraded." });
      },

      rerollItemAffix: (itemId, affixIndex) => {
        const result = rerollItemAffix(get().state, itemId, affixIndex, Date.now());
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: result.message ?? "Affix rerolled." });
      },

      buyBuilding: (buildingId) => {
        const result = buyBuildingUpgrade(get().state, buildingId, Date.now());
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: result.message ?? "Building upgraded." });
      },

      claimDaily: (taskId) => {
        const result = claimDailyTask(get().state, taskId, Date.now());
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: result.message ?? "Contract claimed." });
      },

      claimWeeklyContract: (milestoneIndex) => {
        const result = claimWeeklyContractMilestone(get().state, milestoneIndex, Date.now());
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: result.message ?? "Weekly contract claimed." });
      },

      startCaravanJob: (focusId, durationMs) => {
        const result = startCaravanJob(get().state, focusId, durationMs, Date.now());
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: result.message ?? "Caravan planned.", lastOfflineSummary: null });
      },

      cancelCaravanJob: () => {
        const result = cancelCaravanJob(get().state, Date.now());
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: result.message ?? "Caravan canceled.", lastOfflineSummary: null });
      },

      prestige: () => {
        const result = performPrestige(get().state, Date.now());
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: `Reincarnation complete. +${result.renownGained} Soul Marks.`, lastExpeditionResult: null, lastOfflineSummary: null });
      },

      buyRenownUpgrade: (upgradeId) => {
        const result = buyRenownUpgrade(get().state, upgradeId, Date.now());
        if (!result.ok) {
          set({ error: result.error });
          return;
        }
        set({ state: result.state, error: null, lastMessage: result.message ?? "Soul Mark upgrade purchased." });
      },

      changeClass: (classId) => {
        const state = changeHeroClass(get().state, classId, Date.now());
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
        set({ state, error: null, lastMessage: enabled ? "Debug balance enabled." : "Debug balance disabled." });
      },

      setReducedMotion: (enabled) => {
        const state = structuredClone(get().state) as GameState;
        state.settings.reducedMotion = enabled;
        state.updatedAt = Date.now();
        set({ state, error: null });
      },

      dismissOnboarding: () => {
        const state = structuredClone(get().state) as GameState;
        state.settings.onboardingDismissed = true;
        state.updatedAt = Date.now();
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
        set({ state: normalized, error: null, lastMessage: result.message, lastExpeditionResult: null, lastOfflineSummary: null });
      },

      resetSave: () => {
        if (isBrowser()) {
          window.localStorage.removeItem(SAVE_KEY);
        }
        const state = createFreshState(Date.now());
        set({ state, error: null, lastMessage: "Local save reset.", lastExpeditionResult: null, lastOfflineSummary: null });
      },

      clearNotice: () => set({ error: null, lastMessage: null }),

      dismissOfflineSummary: () => set({ lastOfflineSummary: null }),

      dismissExpeditionResult: () => set({ lastExpeditionResult: null })
    }),
    {
      name: SAVE_KEY,
      storage: gamePersistStorage,
      skipHydration: true,
      partialize: (store) => ({
        state: store.state,
        hydrated: false,
        error: null,
        lastMessage: null,
        lastExpeditionResult: null,
        lastOfflineSummary: null
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState) {
          return { ...currentState, hydrated: true };
        }
        return { ...currentState, ...(persistedState as PersistedGameSnapshot), hydrated: true };
      }
    }
  )
);
