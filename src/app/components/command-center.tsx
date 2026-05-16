import { BellRing, CalendarDays, CheckCircle2, Clock, Hammer, ListChecks, Map, Swords } from "lucide-react";
import { getCommandCenterSummary, type CommandCenterTabId, type GameState, type OfflineDeltaSummary, type ResolveSummary } from "@/game";
import { formatMs, formatNumber } from "./game-format";

type CommandCenterProps = {
  state: GameState;
  now: number;
  offlineSummary: OfflineDeltaSummary | null;
  expeditionResult: ResolveSummary | null;
  onSelectTab: (tab: CommandCenterTabId) => void;
};

function toneClass(tone: string): string {
  switch (tone) {
    case "success":
      return "border-emerald/30 bg-emerald-100 text-emerald";
    case "warning":
      return "border-amber-400 bg-amber-50 text-amber-900";
    case "urgent":
      return "border-red-300 bg-red-50 text-red-700";
    default:
      return "border-royal/20 bg-blue-50 text-royal";
  }
}

export function CommandCenter({ state, now, offlineSummary, expeditionResult, onSelectTab }: CommandCenterProps) {
  const summary = getCommandCenterSummary(state, now, offlineSummary, expeditionResult);
  const eventTier = summary.event?.tiers.find((tier) => tier.claimable) ?? summary.event?.tiers.find((tier) => !tier.claimed) ?? null;
  const activeFront = summary.frontier.find((front) => front.status === "boss_ready") ?? summary.frontier.find((front) => front.status === "contested") ?? summary.frontier[0];
  const activeGuildProject = summary.guildhallSlots.find((slot) => slot.status === "ready_to_claim" || slot.status === "building");
  const visibleTimers = summary.timers.slice(0, 2);

  return (
    <section className="surface-card rounded-xl border border-subtle p-3 shadow-card">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase text-mystic">Command Center</p>
            {summary.hasPendingReport && <span className="rounded-full border border-emerald/30 bg-emerald-50 px-2 py-0.5 text-[0.68rem] font-black text-emerald">Report ready</span>}
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-base font-black sm:text-lg">{summary.primaryAction.label}</h2>
            <p className="min-w-0 flex-1 text-xs font-semibold text-stone-700 sm:text-sm">{summary.primaryAction.detail}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="badge-surface inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-2 text-[0.68rem] font-black">
            <ListChecks size={13} /> {summary.orders.readyCount} orders
          </span>
          <span className="badge-surface inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-2 text-[0.68rem] font-black">
            <Map size={13} /> {activeFront?.name ?? "Frontier"}
          </span>
          <span className="badge-surface inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-2 text-[0.68rem] font-black">
            <Hammer size={13} /> {activeGuildProject ? activeGuildProject.name : "Guildhall idle"}
          </span>
          {visibleTimers.map((timer) => (
            <button
              key={timer.id}
              type="button"
              onClick={() => onSelectTab(timer.id === "construction" ? "town" : "expeditions")}
              className="badge-surface inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-2 text-[0.68rem] font-black transition hover:bg-parchment"
            >
              <Clock size={13} /> {timer.ready ? "Ready" : formatMs(timer.remainingMs)}
            </button>
          ))}
          {summary.event && eventTier && (
            <button
              type="button"
              onClick={() => onSelectTab("dailies")}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-amber-400 bg-amber-50 px-2 text-[0.68rem] font-black text-amber-900 transition hover:bg-amber-100"
            >
              <CalendarDays size={13} /> {eventTier.claimable ? "Event claim" : `${formatNumber(eventTier.remaining)} event`}
            </button>
          )}
          {summary.warRoom.nextBoss && (
            <button
              type="button"
              onClick={() => onSelectTab("expeditions")}
              className="badge-surface inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-2 text-[0.68rem] font-black transition hover:bg-parchment"
            >
              <Swords size={13} /> {summary.warRoom.nextBoss.defeated ? <CheckCircle2 size={13} /> : `${summary.warRoom.nextBoss.readinessPercent}% boss`}
            </button>
          )}
          <button
            type="button"
            onClick={() => onSelectTab(summary.primaryAction.tab)}
            className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-2 text-[0.68rem] font-black transition hover:scale-[1.01] ${toneClass(summary.primaryAction.tone)}`}
          >
            <BellRing size={13} /> Open
          </button>
        </div>
      </div>
    </section>
  );
}
