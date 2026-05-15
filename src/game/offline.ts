import { OFFLINE_CAP_MS } from "./constants";
import { applyCaravanOfflineProgress } from "./caravan";
import { ensureDailies } from "./dailies";
import { cloneState } from "./state";
import type { GameState, MaterialBundle, OfflineSummary } from "./types";
import { regenerateFocus } from "./focus";
import { applyConstructionOfflineProgress } from "./town";

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
