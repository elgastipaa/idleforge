import { CheckCircle2, Clock, Hammer, Lock, Sparkles, XCircle } from "lucide-react";
import { getGuildhallSlotSummaries, type BuildingId, type GameState, type GuildhallSlotSummary } from "@/game";
import { formatConstructionCost, formatMs, formatRegionMaterials } from "./game-format";

type GuildhallSlotGridProps = {
  state: GameState;
  now: number;
  onBuild: (buildingId: BuildingId) => void;
  onClaim: () => void;
  onCancel: () => void;
  onAccelerate: (focusAmount: number) => void;
};

function statusLabel(slot: GuildhallSlotSummary): string {
  switch (slot.status) {
    case "foundation":
      return "Foundation ready";
    case "ready":
      return "Upgrade ready";
    case "needs_resources":
      return "Needs resources";
    case "building":
      return "Under construction";
    case "ready_to_claim":
      return "Ready to complete";
    case "blocked":
      return "Slot occupied";
    case "maxed":
      return "Mastered";
  }
}

function statusClass(slot: GuildhallSlotSummary): string {
  switch (slot.status) {
    case "ready_to_claim":
    case "foundation":
    case "ready":
      return "border-emerald/30 bg-emerald-50 text-emerald";
    case "building":
      return "border-royal/20 bg-blue-50 text-royal";
    case "maxed":
      return "border-amber-400 bg-amber-50 text-amber-900";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}

function GuildhallSlotCard({ slot, onBuild, onClaim, onCancel, onAccelerate }: { slot: GuildhallSlotSummary } & Omit<GuildhallSlotGridProps, "state" | "now">) {
  const progress = slot.constructionProgress;
  const primaryDisabled = !slot.canUpgrade && slot.status !== "ready_to_claim";
  const primaryLabel = slot.status === "ready_to_claim" ? "Complete" : slot.level === 0 ? "Build" : slot.status === "maxed" ? "Mastered" : "Upgrade";
  const primaryAction = slot.status === "ready_to_claim" ? onClaim : () => onBuild(slot.buildingId);

  return (
    <article className="surface-card rounded-xl border border-subtle p-3 shadow-sm transition hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-black uppercase text-mystic">Guildhall Slot</p>
          <h3 className="text-base font-black">{slot.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs font-semibold text-stone-700">{slot.purpose}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-1 text-[0.68rem] font-black ${statusClass(slot)}`}>{slot.level}/{slot.maxLevel}</span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
        <div className="h-full rounded-full bg-royal" style={{ width: `${slot.levelProgressPercent}%` }} />
      </div>

      <div className="mt-3 grid gap-2 text-xs font-semibold text-stone-700">
        <p><span className="font-black text-ink">Status:</span> {statusLabel(slot)}</p>
        <p><span className="font-black text-ink">Current:</span> {slot.currentEffect}</p>
        {slot.nextEffect && <p><span className="font-black text-ink">Next:</span> {slot.nextEffect}</p>}
        {slot.cost && <p><span className="font-black text-ink">Cost:</span> {formatConstructionCost(slot.cost)}</p>}
        {slot.durationMs && <p><span className="font-black text-ink">Timer:</span> {formatMs(slot.durationMs)}</p>}
        {slot.lockedReason && <p className="surface-card-inset rounded-md border border-subtle px-2 py-1 font-bold text-stone-600">{slot.lockedReason}</p>}
      </div>

      {progress && (
        <div className="surface-card-inset mt-3 rounded-lg border border-royal/20 p-2 text-xs font-bold text-royal">
          <div className="flex items-center justify-between gap-2">
            <span>{progress.ready ? "Project complete" : "Project timer"}</span>
            <span>{progress.ready ? "Ready" : formatMs(progress.remainingMs)}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70">
            <div className="h-full rounded-full bg-royal" style={{ width: `${Math.floor(progress.progress * 100)}%` }} />
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={primaryDisabled}
          onClick={primaryAction}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-royal px-3 py-1.5 text-xs font-black text-white transition hover:bg-royal/90 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
        >
          <Hammer size={14} /> {primaryLabel}
        </button>
        {slot.status === "building" && (
          <>
            <button type="button" onClick={() => onAccelerate(1)} className="btn-secondary inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-black transition">
              <Sparkles size={14} /> Skip 4m
            </button>
            <button type="button" onClick={onCancel} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-black text-red-700 transition hover:bg-red-100">
              <XCircle size={14} /> Cancel
            </button>
          </>
        )}
      </div>

      <details className="surface-card-inset mt-3 rounded-lg border border-subtle px-3 py-2">
        <summary className="cursor-pointer text-xs font-black uppercase text-stone-600">Milestones</summary>
        <div className="mt-2 grid gap-1.5">
          {slot.milestoneLabels.map((milestone) => (
            <p key={`${slot.buildingId}-${milestone.level}`} className="flex items-center gap-2 text-xs font-bold text-stone-700">
              {milestone.reached ? <CheckCircle2 size={13} className="text-emerald" /> : <Lock size={13} className="text-stone-500" />}
              <span className="shrink-0 text-stone-500">{milestone.level === 0 ? "Base" : `Lv${milestone.level}`}</span>
              <span>{milestone.label}</span>
            </p>
          ))}
        </div>
      </details>
    </article>
  );
}

export function GuildhallSlotGrid({ state, now, onBuild, onClaim, onCancel, onAccelerate }: GuildhallSlotGridProps) {
  const slots = getGuildhallSlotSummaries(state, now);
  const activeSlot = slots.find((slot) => slot.activeHere);
  const readySlot = slots.find((slot) => slot.status === "foundation" || slot.status === "ready");
  const totalLevels = slots.reduce((total, slot) => total + slot.level, 0);
  const totalMax = slots.reduce((total, slot) => total + slot.maxLevel, 0);

  return (
    <section className="space-y-4">
      <div className="surface-card-elevated rounded-xl border border-subtle p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-mystic">Guildhall</p>
            <h2 className="text-xl font-black">Guild Projects</h2>
            <p className="mt-1 text-sm font-semibold text-stone-700">
              Build structures from foundations using the current Town engine. One guild project can run at a time.
            </p>
          </div>
          <span className="badge-surface rounded-full border px-3 py-1 text-xs font-black">
            {totalLevels}/{totalMax} levels
          </span>
        </div>
        <div className="mt-3 grid gap-2 text-xs font-bold text-stone-700 sm:grid-cols-3">
          <p className="surface-card-inset rounded-lg border border-subtle px-3 py-2">Active: {activeSlot ? activeSlot.name : "None"}</p>
          <p className="surface-card-inset rounded-lg border border-subtle px-3 py-2">Next build: {readySlot ? readySlot.name : "Gather resources"}</p>
          <p className="surface-card-inset rounded-lg border border-subtle px-3 py-2">Regional stock: {formatRegionMaterials(state.regionProgress.materials) || "None"}</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot) => (
          <GuildhallSlotCard key={slot.buildingId} slot={slot} onBuild={onBuild} onClaim={onClaim} onCancel={onCancel} onAccelerate={onAccelerate} />
        ))}
      </div>
    </section>
  );
}
