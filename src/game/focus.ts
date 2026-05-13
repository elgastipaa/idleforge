import { FOCUS_EXPEDITION_BOOST_COST, FOCUS_MAX, FOCUS_REGEN_INTERVAL_MS } from "./constants";
import type { ActionResult, GameState } from "./types";

export function regenerateFocus(state: GameState, now: number): { gained: number } {
  if (state.focus.current >= state.focus.cap) {
    state.focus.current = state.focus.cap;
    state.focus.lastRegenAt = now;
    return { gained: 0 };
  }

  const elapsed = now - state.focus.lastRegenAt;
  if (elapsed < FOCUS_REGEN_INTERVAL_MS) {
    return { gained: 0 };
  }

  const ticks = Math.floor(elapsed / FOCUS_REGEN_INTERVAL_MS);
  const room = state.focus.cap - state.focus.current;
  const gained = Math.min(ticks, room);
  if (gained <= 0) {
    return { gained: 0 };
  }
  state.focus.current += gained;
  state.focus.lastRegenAt += gained * FOCUS_REGEN_INTERVAL_MS;
  if (state.focus.current >= state.focus.cap) {
    state.focus.current = state.focus.cap;
    state.focus.lastRegenAt = now;
  }
  return { gained };
}

export function canSpendFocus(state: GameState, amount = FOCUS_EXPEDITION_BOOST_COST): boolean {
  return state.focus.current >= amount;
}

export function spendFocus(state: GameState, amount = FOCUS_EXPEDITION_BOOST_COST): ActionResult {
  if (!canSpendFocus(state, amount)) {
    return { ok: false, state, error: "Not enough Focus." };
  }
  state.focus.current -= amount;
  return { ok: true, state };
}

export function getFocusPercent(state: GameState): number {
  if (state.focus.cap <= 0) return 0;
  return Math.min(1, Math.max(0, state.focus.current / state.focus.cap));
}

export function clampFocus(state: GameState) {
  state.focus.cap = FOCUS_MAX;
  state.focus.current = Math.max(0, Math.min(state.focus.cap, state.focus.current));
}
