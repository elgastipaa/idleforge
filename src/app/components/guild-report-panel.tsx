import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import { getReturnReportSummary, type GameState, type OfflineDeltaSummary, type ResolveSummary, type ReturnReportAction } from "@/game";

type GuildReportPanelProps = {
  state: GameState;
  now: number;
  offlineSummary: OfflineDeltaSummary | null;
  expeditionResult: ResolveSummary | null;
  onSelectTab: (tab: ReturnReportAction["tab"]) => void;
  onDismissOffline: () => void;
  onDismissExpedition: () => void;
};

function rowClass(tone: string): string {
  switch (tone) {
    case "success":
      return "border-emerald/30 bg-emerald-50/80";
    case "warning":
      return "border-amber-300 bg-amber-50/80";
    case "danger":
      return "border-red-300 bg-red-50/80";
    default:
      return "border-stone-200 bg-white/80";
  }
}

export function GuildReportPanel({ state, now, offlineSummary, expeditionResult, onSelectTab, onDismissOffline, onDismissExpedition }: GuildReportPanelProps) {
  const summary = getReturnReportSummary(state, offlineSummary, expeditionResult, now);
  if (summary.kind === "empty") return null;
  const dismiss = expeditionResult ? onDismissExpedition : onDismissOffline;
  const accent = summary.kind === "expedition" && expeditionResult && !expeditionResult.success ? "border-amber-400 bg-amber-50/80" : "border-royal/20 surface-card-elevated";

  const runAction = (action: ReturnReportAction) => {
    onSelectTab(action.tab);
    dismiss();
  };

  return (
    <section className={`feedback-pop rounded-lg border p-3 shadow-card ${accent}`}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-black uppercase text-mystic">Guild Report</p>
            <h2 className="text-base font-black sm:text-lg">{summary.headline}</h2>
            <p className="mt-1 text-xs font-semibold text-stone-700 sm:text-sm">{summary.detail}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald/30 bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald">
            <FileText size={13} /> Filed
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {summary.rows.map((row) => (
            <div key={row.id} className={`rounded-lg border px-3 py-2 text-xs font-semibold text-stone-700 ${rowClass(row.tone)}`}>
              <p className="font-black uppercase text-stone-500">{row.label}</p>
              <p className="mt-1 font-black text-ink">{row.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {summary.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => runAction(action)}
              className={
                action.primary
                  ? "inline-flex min-h-9 items-center gap-2 rounded-lg bg-royal px-3 py-1.5 text-xs font-black text-white transition hover:bg-royal/90"
                  : "inline-flex min-h-9 items-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-black text-ink transition hover:bg-parchment"
              }
            >
              {action.primary ? <CheckCircle2 size={14} /> : <Clock size={14} />}
              {action.label}
            </button>
          ))}
          <button type="button" onClick={dismiss} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-black text-ink transition hover:bg-parchment">
            <XCircle size={14} /> Dismiss
          </button>
        </div>
      </div>
    </section>
  );
}
