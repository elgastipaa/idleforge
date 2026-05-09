import { OFFLINE_CAP_MS } from "./constants";
import { ensureDailies } from "./dailies";
import { resolveExpedition } from "./engine";
import { cloneState } from "./state";
import type { GameState, MaterialBundle, OfflineSummary } from "./types";
import { regenerateVigor } from "./vigor";

export function getMineOfflineRate(state: GameState): MaterialBundle {
  if (state.town.mine <= 0) {
    return { ore: 0, crystal: 0, rune: 0, relicFragment: 0 };
  }
  return {
    ore: state.town.mine * 4,
    crystal: Math.max(0, state.town.mine - 1) * 1.2,
    rune: Math.max(0, state.town.mine - 4) * 0.45,
    relicFragment: Math.max(0, state.town.mine - 8) * 0.15
  };
}

function applyMineOffline(state: GameState, elapsedMs: number) {
  if (state.town.mine <= 0 || elapsedMs <= 0) {
    return { ore: 0, crystal: 0, rune: 0, relicFragment: 0 };
  }
  const hours = elapsedMs / (60 * 60 * 1000);
  const rate = getMineOfflineRate(state);
  const ore = Math.floor(rate.ore * hours);
  const crystal = Math.floor(rate.crystal * hours);
  const rune = Math.floor(rate.rune * hours);
  const relicFragment = Math.floor(rate.relicFragment * hours);
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
          dailyReset: dailyPrepared.reset,
          elapsedMs
        }
      : null;
  return { state: next, summary, capped };
}
