import { OFFLINE_CAP_MS } from "./constants";
import { ensureDailies } from "./dailies";
import { resolveExpedition } from "./engine";
import { cloneState } from "./state";
import type { GameState, OfflineSummary } from "./types";
import { regenerateVigor } from "./vigor";

function applyMineOffline(state: GameState, elapsedMs: number) {
  if (state.town.mine <= 0 || elapsedMs <= 0) {
    return { ore: 0, crystal: 0, rune: 0, relicFragment: 0 };
  }
  const hours = elapsedMs / (60 * 60 * 1000);
  const ore = Math.floor(state.town.mine * 4 * hours);
  const crystal = Math.floor(Math.max(0, state.town.mine - 1) * 1.2 * hours);
  const rune = Math.floor(Math.max(0, state.town.mine - 4) * 0.45 * hours);
  const relicFragment = Math.floor(Math.max(0, state.town.mine - 8) * 0.15 * hours);
  state.resources.ore += ore;
  state.resources.crystal += crystal;
  state.resources.rune += rune;
  state.resources.relicFragment += relicFragment;
  return { ore, crystal, rune, relicFragment };
}

export function applyOfflineProgress(state: GameState, now: number): OfflineSummary {
  const effectiveNow = Math.min(now, state.updatedAt + OFFLINE_CAP_MS);
  const capped = now - state.updatedAt > OFFLINE_CAP_MS;
  const elapsedMs = Math.max(0, effectiveNow - state.updatedAt);
  let next = cloneState(state);
  const dailyPrepared = ensureDailies(next, effectiveNow);
  next = dailyPrepared.state;
  const vigorGained = regenerateVigor(next, effectiveNow).gained;
  const mineGains = applyMineOffline(next, elapsedMs);
  let expeditionSummary = null;

  if (next.activeExpedition && effectiveNow >= next.activeExpedition.endsAt) {
    const result = resolveExpedition(next, effectiveNow);
    if (result.ok) {
      next = cloneState(result.state);
      expeditionSummary = result.summary;
    }
  }

  next.updatedAt = now;
  const anyMineGains = Object.values(mineGains).some((value) => value > 0);
  const summary =
    expeditionSummary || dailyPrepared.reset || vigorGained > 0 || anyMineGains
      ? {
          expedition: expeditionSummary,
          mineGains,
          vigorGained,
          dailyReset: dailyPrepared.reset
        }
      : null;
  return { state: next, summary, capped };
}
