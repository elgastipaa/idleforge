import { Crown, Eye, Shield, Swords } from "lucide-react";
import { getWarRoomSummary, type GameState } from "@/game";

type WarRoomPanelProps = {
  state: GameState;
  onSelectTab: (tab: "expeditions") => void;
};

function scoutClass(scoutState: string): string {
  switch (scoutState) {
    case "defeated":
      return "border-emerald/30 bg-emerald-50 text-emerald";
    case "scouted":
      return "border-royal/20 bg-blue-50 text-royal";
    case "partial":
      return "border-amber-400 bg-amber-50 text-amber-900";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}

export function WarRoomPanel({ state, onSelectTab }: WarRoomPanelProps) {
  const summary = getWarRoomSummary(state);
  const nextBoss = summary.nextBoss;

  return (
    <section className="surface-card rounded-xl border border-subtle p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-mystic">War Room</p>
          <h2 className="text-lg font-black">{nextBoss ? nextBoss.boss.name : "No boss target"}</h2>
          <p className="mt-1 text-sm font-semibold text-stone-700">Scout, prepare, and track named bosses without adding new combat rules.</p>
        </div>
        <button type="button" onClick={() => onSelectTab("expeditions")} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-royal px-3 py-1.5 text-xs font-black text-white">
          <Swords size={14} /> Open Boss Routes
        </button>
      </div>

      {nextBoss ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
          <div className="surface-card-elevated rounded-xl border border-subtle p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-black uppercase text-stone-600">{nextBoss.boss.title}</p>
                <h3 className="font-black">{nextBoss.boss.name}</h3>
                <p className="mt-1 text-xs font-semibold text-stone-700">{nextBoss.recommendedAction}</p>
              </div>
              <span className={`rounded-full border px-2 py-1 text-[0.68rem] font-black ${scoutClass(nextBoss.scoutState)}`}>{nextBoss.scoutState}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${nextBoss.readinessPercent}%` }} />
            </div>
            <p className="mt-2 text-xs font-bold text-stone-700">
              Threat coverage {nextBoss.readinessPercent}% · revealed {nextBoss.revealedThreats}/{nextBoss.totalThreats}
            </p>
          </div>

          <div className="grid gap-2">
            {nextBoss.threats.slice(0, 3).map((threat) => (
              <div key={threat.threatId} className="surface-card-inset rounded-lg border border-subtle px-3 py-2 text-xs font-bold text-stone-700">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5">{threat.revealed ? <Eye size={13} /> : <Shield size={13} />} {threat.revealed ? threat.name : "Hidden threat"}</span>
                  <span>{Math.floor(threat.coverage * 100)}%</span>
                </div>
                <p className="mt-1 text-[0.68rem] font-semibold text-stone-600">
                  {threat.revealed ? `${threat.impact} · prep charges ${threat.prepCharges}` : "Scout to reveal this threat."}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="surface-card-inset mt-4 rounded-lg border border-subtle px-3 py-2 text-sm font-semibold text-stone-700">No boss definitions are available.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-bold text-stone-700">
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400 bg-white/80 px-2 py-1"><Crown size={13} /> Bosses defeated {summary.defeatedCount}/{summary.totalCount}</span>
      </div>
    </section>
  );
}
