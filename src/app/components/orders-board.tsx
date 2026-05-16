import { CalendarDays, CheckCircle2, Clock, ListChecks, Star } from "lucide-react";
import { getOrdersBoardSummary, type GameState, type OrdersBoardOrder } from "@/game";
import { formatMs } from "./game-format";

type OrdersBoardProps = {
  state: GameState;
  now: number;
  onSelectTab: (tab: OrdersBoardOrder["ctaTab"]) => void;
  onClaimDailyFocus: () => void;
  onClaimDaily: (taskId: string) => void;
  onClaimWeeklyQuest: () => void;
};

function statusClass(status: OrdersBoardOrder["status"]): string {
  switch (status) {
    case "ready":
      return "border-emerald/30 bg-emerald-50 text-emerald";
    case "claimed":
      return "border-stone-200 bg-stone-50 text-stone-500";
    case "blocked":
    case "locked":
      return "border-stone-200 bg-stone-50 text-stone-700";
    default:
      return "border-royal/20 bg-blue-50 text-royal";
  }
}

function sourceLabel(source: OrdersBoardOrder["source"]): string {
  switch (source) {
    case "daily_focus":
      return "Focus";
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "event":
      return "Event";
    case "construction":
      return "Guildhall";
    case "caravan":
      return "Caravan";
    case "mastery":
      return "Mastery";
    case "boss":
      return "War Room";
  }
}

export function OrdersBoard({ state, now, onSelectTab, onClaimDailyFocus, onClaimDaily, onClaimWeeklyQuest }: OrdersBoardProps) {
  const summary = getOrdersBoardSummary(state, now);
  const visibleOrders = summary.orders.slice(0, 8);

  const runOrderAction = (order: OrdersBoardOrder) => {
    if (order.status === "ready" && order.source === "daily_focus") {
      onClaimDailyFocus();
      return;
    }
    if (order.status === "ready" && order.source === "daily") {
      onClaimDaily(order.id);
      return;
    }
    if (order.status === "ready" && order.source === "weekly") {
      onClaimWeeklyQuest();
      return;
    }
    onSelectTab(order.ctaTab);
  };

  return (
    <section className="surface-card rounded-xl border border-subtle p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-mystic">Orders Board</p>
          <h2 className="text-lg font-black">Guild contracts and return hooks</h2>
          <p className="mt-1 text-sm font-semibold text-stone-700">Daily, weekly, event, Caravan, Guildhall, mastery, and War Room work in one queue.</p>
        </div>
        <span className="rounded-full border border-royal/20 bg-blue-50 px-3 py-1 text-xs font-black text-royal">
          {summary.readyCount} ready · {summary.activeCount} active
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-xs font-bold text-stone-700 sm:grid-cols-2">
        <p className="surface-card-inset rounded-lg border border-subtle px-3 py-2"><Clock size={13} className="mr-1 inline" /> Daily reset in {formatMs(summary.dailyResetAt - now)}</p>
        <p className="surface-card-inset rounded-lg border border-subtle px-3 py-2"><CalendarDays size={13} className="mr-1 inline" /> Weekly reset in {formatMs(summary.weeklyResetAt - now)}</p>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {visibleOrders.map((order) => {
          const percent = Math.floor((Math.min(order.progress, order.target) / Math.max(1, order.target)) * 100);
          return (
            <article key={order.id} className="surface-card-inset rounded-xl border border-subtle p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-black uppercase text-mystic">{sourceLabel(order.source)}</p>
                  <h3 className="line-clamp-1 text-sm font-black">{order.label}</h3>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold text-stone-700">{order.detail}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.62rem] font-black ${statusClass(order.status)}`}>{order.status}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200">
                <div className="h-full rounded-full bg-royal" style={{ width: `${percent}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-stone-700">
                <span>{Math.min(order.progress, order.target)}/{order.target}{order.rewardLabel ? ` · ${order.rewardLabel}` : ""}</span>
                <button
                  type="button"
                  disabled={order.status === "claimed" || order.status === "locked"}
                  onClick={() => runOrderAction(order)}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-royal px-2.5 py-1 text-[0.68rem] font-black text-white transition hover:bg-royal/90 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
                >
                  {order.status === "ready" ? <CheckCircle2 size={13} /> : order.source === "event" ? <Star size={13} /> : <ListChecks size={13} />}
                  {order.status === "ready" && ["daily_focus", "daily", "weekly"].includes(order.source) ? "Claim" : "Open"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
