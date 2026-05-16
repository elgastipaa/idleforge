import { CheckCircle2, Crown, Lock, Map, Package, Swords } from "lucide-react";
import { getRegionFrontSummaries, type GameState } from "@/game";
import { formatNumber } from "./game-format";

type FrontierMapProps = {
  state: GameState;
  onSelectTab: (tab: "expeditions" | "town" | "dailies") => void;
};

function statusCopy(status: string): string {
  switch (status) {
    case "locked":
      return "Locked";
    case "boss_ready":
      return "Boss ready";
    case "secured":
      return "Secured";
    default:
      return "Contested";
  }
}

function statusClass(status: string): string {
  switch (status) {
    case "secured":
      return "border-emerald/30 bg-emerald-50 text-emerald";
    case "boss_ready":
      return "border-amber-400 bg-amber-50 text-amber-900";
    case "locked":
      return "border-stone-200 bg-stone-50 text-stone-600";
    default:
      return "border-royal/20 bg-blue-50 text-royal";
  }
}

export function FrontierMap({ state, onSelectTab }: FrontierMapProps) {
  const fronts = getRegionFrontSummaries(state);
  const activeFront = fronts.find((front) => front.status === "boss_ready") ?? fronts.find((front) => front.status === "contested") ?? fronts[0];

  return (
    <section className="surface-card rounded-xl border border-subtle p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-mystic">Frontier Map</p>
          <h2 className="text-lg font-black">{activeFront ? `Current front: ${activeFront.name}` : "Campaign fronts"}</h2>
          <p className="mt-1 text-sm font-semibold text-stone-700">Regions are campaign fronts. Routes, bosses, outposts, and regional supplies all feed the same push.</p>
        </div>
        <button type="button" onClick={() => onSelectTab("expeditions")} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-royal px-3 py-1.5 text-xs font-black text-white">
          <Map size={14} /> Open Routes
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {fronts.map((front) => (
          <article key={front.zoneId} className="surface-card-inset rounded-xl border border-subtle p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="line-clamp-1 text-sm font-black">{front.name}</h3>
                <p className="mt-1 line-clamp-2 text-[0.68rem] font-semibold text-stone-600">{front.subtitle}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.62rem] font-black ${statusClass(front.status)}`}>{statusCopy(front.status)}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200">
              <div className="h-full rounded-full bg-royal" style={{ width: `${front.completionPercent}%` }} />
            </div>
            <div className="mt-3 grid gap-1 text-[0.68rem] font-bold text-stone-700">
              <p className="flex items-center gap-1.5"><Swords size={12} /> Routes {front.routesCleared}/{front.routesTotal}</p>
              <p className="flex items-center gap-1.5"><Crown size={12} /> Boss {front.bossStatus}</p>
              <p className="flex items-center gap-1.5"><Package size={12} /> {front.materialName ?? "Supply"}: {formatNumber(front.materialAmount)}</p>
              <p className="flex items-center gap-1.5">{front.outpostStatus === "selected" ? <CheckCircle2 size={12} /> : front.outpostStatus === "locked" ? <Lock size={12} /> : <Map size={12} />} Outpost {front.outpostStatus}</p>
            </div>
            <p className="badge-surface mt-3 rounded-lg border px-2 py-1.5 text-[0.68rem] font-bold">
              {front.recommendedDungeon ? `Next: ${front.recommendedDungeon.name}` : front.unlockHint ?? "Front secured."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
