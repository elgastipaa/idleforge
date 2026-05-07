import { VIGOR_EXPEDITION_BOOST_COST, VIGOR_MAX, VIGOR_REGEN_INTERVAL_MS } from "./constants";
import type { ActionResult, GameState } from "./types";

export function regenerateVigor(state: GameState, now: number): { gained: number } {
  if (state.vigor.current >= state.vigor.max) {
    state.vigor.current = state.vigor.max;
    state.vigor.lastTickAt = now;
    return { gained: 0 };
  }

  const elapsed = now - state.vigor.lastTickAt;
  if (elapsed < VIGOR_REGEN_INTERVAL_MS) {
    return { gained: 0 };
  }

  const ticks = Math.floor(elapsed / VIGOR_REGEN_INTERVAL_MS);
  const room = state.vigor.max - state.vigor.current;
  const gained = Math.min(ticks, room);
  if (gained <= 0) {
    return { gained: 0 };
  }
  state.vigor.current += gained;
  state.vigor.lastTickAt += gained * VIGOR_REGEN_INTERVAL_MS;
  if (state.vigor.current >= state.vigor.max) {
    state.vigor.current = state.vigor.max;
    state.vigor.lastTickAt = now;
  }
  return { gained };
}

export function canSpendVigor(state: GameState, amount = VIGOR_EXPEDITION_BOOST_COST): boolean {
  return state.vigor.current >= amount;
}

export function spendVigor(state: GameState, amount = VIGOR_EXPEDITION_BOOST_COST): ActionResult {
  if (!canSpendVigor(state, amount)) {
    return { ok: false, state, error: "Not enough Vigor." };
  }
  state.vigor.current -= amount;
  return { ok: true, state };
}

export function getVigorPercent(state: GameState): number {
  if (state.vigor.max <= 0) return 0;
  return Math.min(1, Math.max(0, state.vigor.current / state.vigor.max));
}

export function clampVigor(state: GameState) {
  state.vigor.max = VIGOR_MAX;
  state.vigor.current = Math.max(0, Math.min(state.vigor.max, state.vigor.current));
}
