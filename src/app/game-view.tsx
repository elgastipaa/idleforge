"use client";

import { useEffect, useState } from "react";
import {
  Backpack,
  CheckCircle2,
  Clock,
  Coins,
  Crown,
  Download,
  Flame,
  Gem,
  Hammer,
  Pickaxe,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Upload,
  XCircle
} from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import type { GameStore } from "@/store/useGameStore";
import {
  ACHIEVEMENTS,
  BUILDINGS,
  CLASS_PASSIVE_TEXT,
  DAILY_RESET_HOUR_LOCAL,
  DUNGEONS,
  FORGE_AFFIX_REROLL_REQUIRED_LEVEL,
  HERO_CLASSES,
  INVENTORY_LIMIT,
  INVENTORY_NEAR_FULL_THRESHOLD,
  OFFLINE_CAP_MS,
  RARITY_LABEL,
  RENOWN_UPGRADES,
  REINCARNATION_GATE_BOSS_ID,
  REINCARNATION_LEVEL_REQUIREMENT,
  REINCARNATION_UPGRADE_MAX,
  VIGOR_EXPEDITION_BOOST_MULTIPLIER,
  VIGOR_REGEN_INTERVAL_MS,
  canAfford,
  canPrestige,
  calculatePrestigeRenown,
  getAvailableDungeons,
  getAffixRerollCost,
  getAchievementProgress,
  getBuildingCost,
  getBuildingLevelTotal,
  getCraftCost,
  getDerivedStats,
  getDungeon,
  getDungeonView,
  getItemScore,
  getItemUpgradeCost,
  getMineOfflineRate,
  getNextGoal,
  getNextLockedDungeon,
  getRuneAffixMultiplier,
  getRuneGainPassiveMultiplier,
  getSalvageAffixMultiplier,
  getRenownUpgradeCost,
  getSellMultiplier,
  getUnlockText,
  getVigorBoostCost,
  getZoneForDungeon,
  xpToNextLevel,
  type BuildingId,
  type DungeonDefinition,
  type EquipmentSlot,
  type GameState,
  type Item,
  type ItemRarity,
  type RenownUpgradeId,
  type ResolveSummary,
  type ResourceState,
  type Stats
} from "@/game";

type TabId = "expeditions" | "hero" | "inventory" | "forge" | "town" | "dailies" | "achievements" | "reincarnation" | "settings";

const tabs: { id: TabId; label: string; Icon: typeof Swords }[] = [
  { id: "expeditions", label: "Expeditions", Icon: Swords },
  { id: "hero", label: "Hero", Icon: Crown },
  { id: "inventory", label: "Inventory", Icon: Backpack },
  { id: "forge", label: "Forge", Icon: Flame },
  { id: "town", label: "Town", Icon: Hammer },
  { id: "dailies", label: "Dailies", Icon: Star },
  { id: "achievements", label: "Awards", Icon: Trophy },
  { id: "reincarnation", label: "Rebirth", Icon: Sparkles },
  { id: "settings", label: "Save", Icon: Settings }
];

const resourceLabels: Record<keyof ResourceState, string> = {
  gold: "Gold",
  ore: "Ore",
  crystal: "Crystal",
  rune: "Rune",
  relicFragment: "Fragments",
  renown: "Soul Marks"
};

const compactResourceLabels: Record<keyof ResourceState, string> = {
  gold: "Gold",
  ore: "Ore",
  crystal: "Crystal",
  rune: "Rune",
  relicFragment: "Frag",
  renown: "Soul"
};

const statLabels: Record<keyof Stats, string> = {
  power: "Power",
  defense: "Defense",
  speed: "Speed",
  luck: "Luck",
  stamina: "Stamina"
};

const slotLabels: Record<EquipmentSlot, string> = {
  weapon: "Weapon",
  helm: "Helm",
  armor: "Armor",
  boots: "Boots",
  relic: "Relic"
};

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 10_000) return `${Math.floor(value / 1_000)}k`;
  return Math.floor(value).toLocaleString();
}

function formatMs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  return `${seconds}s`;
}

function formatLocalClock(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatLocalDateTime(ms: number): string {
  return new Date(ms).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatResources(resources: Partial<ResourceState>): string {
  return (Object.keys(resourceLabels) as (keyof ResourceState)[])
    .filter((key) => (resources[key] ?? 0) > 0)
    .map((key) => `${formatNumber(resources[key] ?? 0)} ${resourceLabels[key]}`)
    .join(", ");
}

function formatStats(stats: Partial<Stats>): string {
  return (Object.keys(statLabels) as (keyof Stats)[])
    .filter((key) => (stats[key] ?? 0) > 0)
    .map((key) => `+${stats[key]} ${statLabels[key]}`)
    .join(", ");
}

function formatTopStats(stats: Partial<Stats>, limit = 3): string {
  const parts = (Object.keys(statLabels) as (keyof Stats)[])
    .filter((key) => (stats[key] ?? 0) > 0)
    .slice(0, limit)
    .map((key) => `+${stats[key]} ${statLabels[key]}`);
  return parts.join(", ");
}

function formatStatDeltas(stats: Partial<Stats>): string {
  const parts = (Object.keys(statLabels) as (keyof Stats)[])
    .filter((key) => (stats[key] ?? 0) !== 0)
    .map((key) => `${statLabels[key]} ${(stats[key] ?? 0) > 0 ? "+" : ""}${stats[key]}`);
  return parts.length > 0 ? parts.join(", ") : "No stat delta";
}

function getItemStatDeltas(item: Item, equipped: Item | null): Partial<Stats> {
  const deltas: Partial<Stats> = {};
  (Object.keys(statLabels) as (keyof Stats)[]).forEach((stat) => {
    const delta = (item.stats[stat] ?? 0) - (equipped?.stats[stat] ?? 0);
    if (delta !== 0) {
      deltas[stat] = delta;
    }
  });
  return deltas;
}

function formatAffixPreview(item: Item, limit = 2): string {
  const visible = item.affixes.slice(0, limit).map((affix) => `${affix.name}: ${affix.description}`);
  const hiddenCount = item.affixes.length - visible.length;
  if (hiddenCount > 0) {
    visible.push(`+${hiddenCount} more`);
  }
  return visible.join(" · ");
}

function getVisibleSellValue(state: GameState, item: Item): number {
  return Math.max(1, Math.floor(item.sellValue * getSellMultiplier(state)));
}

function getVisibleSalvageValue(state: GameState, item: Item): Partial<ResourceState> {
  const salvageMultiplier = getSalvageAffixMultiplier(state);
  const runeMultiplier = getRuneGainPassiveMultiplier(state) * getRuneAffixMultiplier(state);
  return {
    ore: Math.floor((item.salvageValue.ore ?? 0) * salvageMultiplier),
    crystal: Math.floor((item.salvageValue.crystal ?? 0) * salvageMultiplier),
    rune: Math.floor((item.salvageValue.rune ?? 0) * salvageMultiplier * runeMultiplier),
    relicFragment: Math.floor((item.salvageValue.relicFragment ?? 0) * salvageMultiplier)
  };
}

function formatCompactRewards(summary: ResolveSummary): string {
  const parts = [`XP +${formatNumber(summary.rewards.xp)}`, `Gold +${formatNumber(summary.rewards.gold)}`];
  (["ore", "crystal", "rune", "relicFragment"] as const).forEach((resource) => {
    const value = summary.rewards.materials[resource] ?? 0;
    if (value > 0) {
      parts.push(`${resourceLabels[resource]} +${formatNumber(value)}`);
    }
  });
  return parts.join(" · ");
}

function rarityClass(rarity: ItemRarity): string {
  switch (rarity) {
    case "legendary":
      return "rarity-card rarity-legendary transition";
    case "epic":
      return "rarity-card rarity-epic transition";
    case "rare":
      return "rarity-card rarity-rare transition";
    default:
      return "rarity-card rarity-common";
  }
}

type CardDensity = "compact" | "medium" | "feature";

function GameCard({
  children,
  className = "",
  density = "medium"
}: {
  children: React.ReactNode;
  className?: string;
  density?: CardDensity;
}) {
  const densityClass = density === "compact" ? "p-2.5" : density === "feature" ? "p-3 sm:p-4" : "p-4";
  return <section className={`surface-card rounded-lg border border-amber-950/10 shadow-card transition ${densityClass} ${className}`}>{children}</section>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <GameCard className={className}>{children}</GameCard>;
}

function RewardSummary({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <GameCard density="feature" className={`surface-card-elevated ${className}`}>
      {children}
    </GameCard>
  );
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}>{children}</span>;
}

function RarityBadge({
  rarity,
  className = "",
  children
}: {
  rarity: ItemRarity;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Pill className={`${rarityClass(rarity)} !px-2 !py-0.5 text-[0.68rem] leading-none ${className}`}>
      {children ?? RARITY_LABEL[rarity]}
    </Pill>
  );
}

function ResourceChip({
  title,
  label,
  value,
  Icon,
  className = ""
}: {
  title: string;
  label: string;
  value: string;
  Icon: typeof Swords;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex min-h-8 max-w-[8.5rem] shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[0.7rem] font-black leading-none ${className}`}
      title={title}
    >
      <Icon size={13} className="shrink-0" />
      <span className="truncate">{label}</span>
      <span className="shrink-0 tabular-nums">{value}</span>
    </span>
  );
}

function SectionHeader({
  title,
  eyebrow,
  description,
  action
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-black uppercase text-mystic">{eyebrow}</p>}
        <h2 className="text-lg font-black">{title}</h2>
        {description && <p className="text-sm font-semibold text-stone-700">{description}</p>}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function StatDelta({ delta, className = "" }: { delta: number; className?: string }) {
  return (
    <Pill className={`shrink-0 !px-2 !py-0.5 text-[0.68rem] ${delta >= 0 ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-red-200 bg-red-100 text-red-700"} ${className}`}>
      {delta >= 0 ? "+" : ""}
      {delta} vs equipped
    </Pill>
  );
}

function ProgressBar({ value, className = "bg-royal" }: { value: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-stone-200">
      <div className={`h-full rounded-full transition-all duration-300 ${className}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

function EmptyState({
  Icon,
  title,
  description,
  className = ""
}: {
  Icon: typeof Swords;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <GameCard className={`text-center ${className}`}>
      <Icon className="mx-auto text-stone-400" />
      <p className="mt-2 font-black text-ink">{title}</p>
      <p className="mt-1 text-sm font-semibold text-stone-700">{description}</p>
    </GameCard>
  );
}

type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "default" | "compact";
};

function ActionButton({ variant = "primary", size = "default", className = "", ...rest }: ActionButtonProps) {
  const sizeClass = size === "compact" ? "min-h-9 px-3 py-1 text-xs" : "min-h-11 px-4 py-2 text-sm";
  const variantClass = variant === "primary" ? "btn-primary" : variant === "danger" ? "btn-danger" : "btn-secondary";
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-black transition ${sizeClass} ${variantClass} ${className}`}
      {...rest}
    />
  );
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <ActionButton variant="primary" {...props} />;
}

function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <ActionButton variant="secondary" size="compact" {...props} />;
}

function DangerButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <ActionButton variant="danger" size="compact" {...props} />;
}

function ForgeItemRow({
  item,
  meta,
  action,
  children,
  className = ""
}: {
  item: Item;
  meta: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-stone-200 bg-white p-2.5 ${className}`}>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <p className="truncate text-sm font-black" title={item.name}>
            {item.name}
          </p>
          <p className="line-clamp-2 text-xs font-semibold text-stone-600">{meta}</p>
        </div>
        {action ? <div className="flex min-w-[7rem] shrink-0 justify-start sm:justify-end">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function CharacterStart({ store }: { store: GameStore }) {
  const [name, setName] = useState("Relic Warden");
  const [classId, setClassId] = useState<"warrior" | "rogue" | "mage">("warrior");
  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <Card>
          <div>
            <h1 className="text-2xl font-black">Relic Forge Idle</h1>
            <p className="mt-2 text-sm font-semibold text-stone-700">Create your hero and launch the first expedition.</p>
          </div>
          <div className="mt-4 space-y-2">
            <label className="text-xs font-bold uppercase text-stone-500">Hero Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={24}
              className="min-h-11 w-full rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold"
            />
          </div>
        </Card>
        <div className="grid gap-3 md:grid-cols-3">
          {HERO_CLASSES.map((heroClass) => (
            <Card key={heroClass.id} className={classId === heroClass.id ? "border-royal/50 bg-blue-50" : ""}>
              <h2 className="font-black">{heroClass.name}</h2>
              <p className="text-sm font-bold text-royal">{heroClass.tagline}</p>
              <p className="mt-2 text-sm text-stone-700">{heroClass.description}</p>
              <p className="mt-3 text-xs font-bold text-stone-600">{formatStats(heroClass.baseStats)}</p>
              <SecondaryButton className="mt-3 w-full" onClick={() => setClassId(heroClass.id)}>
                {classId === heroClass.id ? "Selected" : "Select"}
              </SecondaryButton>
            </Card>
          ))}
        </div>
        <PrimaryButton className="w-full" onClick={() => store.createHero(name, classId)}>
          <Sparkles size={18} /> Start Adventure
        </PrimaryButton>
      </div>
    </main>
  );
}

function Header({ state }: { state: GameState }) {
  const stats = getDerivedStats(state);
  return (
    <header className="sticky top-0 z-30 border-b border-amber-950/10 bg-parchment/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex min-w-0 max-w-7xl flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-black">Relic Forge Idle</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Pill className="border-emerald/20 bg-emerald-50 text-emerald">
              Power {formatNumber(stats.powerScore)}
            </Pill>
          </div>
        </div>
        <div className="flex w-full min-w-0 max-w-full flex-wrap gap-1.5 pb-1">
          {(["gold", "ore", "crystal", "rune", "relicFragment", "renown"] as const).map((resource) => (
            <ResourceChip
              key={resource}
              title={`${resourceLabels[resource]} ${formatNumber(state.resources[resource])}`}
              label={compactResourceLabels[resource]}
              value={formatNumber(state.resources[resource])}
              Icon={resource === "gold" ? Coins : resource === "ore" ? Pickaxe : resource === "renown" ? Sparkles : Gem}
              className="border-stone-200 bg-white text-stone-700"
            />
          ))}
          <ResourceChip
            title={`Vigor ${state.vigor.current}/${state.vigor.max}`}
            label="Vigor"
            value={`${state.vigor.current}/${state.vigor.max}`}
            Icon={Flame}
            className="max-w-[9rem] border-royal/20 bg-blue-50 text-royal"
          />
        </div>
      </div>
    </header>
  );
}

function getMessageFeedback(message: string, isError: boolean) {
  if (isError) {
    return {
      Icon: XCircle,
      title: "Guild Notice",
      flavor: "The scribe needs this fixed before the next order can resolve.",
      className: "border-red-300 bg-red-50 text-red-800",
      iconClassName: "text-red-700"
    };
  }

  if (/upgraded to level|Building upgraded/i.test(message)) {
    return {
      Icon: Hammer,
      title: "Town Upgrade",
      flavor: "Fresh beams, sharper tools, and better numbers for the next run.",
      className: "border-amber-400 bg-amber-50 text-amber-900",
      iconClassName: "text-amber-900"
    };
  }

  if (/crafted|rerolled|upgraded to \+/i.test(message)) {
    return {
      Icon: Flame,
      title: "Forge Work",
      flavor: "The anvil cools while the new stats settle into the ledger.",
      className: "border-royal/20 bg-blue-50 text-royal",
      iconClassName: "text-royal"
    };
  }

  if (/equipped/i.test(message)) {
    return {
      Icon: Backpack,
      title: "Gear Ready",
      flavor: "The kit is strapped in and the next contract gets a cleaner start.",
      className: "border-emerald/20 bg-emerald-50 text-emerald",
      iconClassName: "text-emerald"
    };
  }

  if (/sold|gold/i.test(message)) {
    return {
      Icon: Coins,
      title: "Market Ledger",
      flavor: "Coin hits the chest and the pack gets a little lighter.",
      className: "border-amber-400 bg-amber-50 text-amber-900",
      iconClassName: "text-amber-900"
    };
  }

  if (/salvaged|materials/i.test(message)) {
    return {
      Icon: Pickaxe,
      title: "Salvage Sorted",
      flavor: "Useful pieces go back to the Forge pile.",
      className: "border-emerald/20 bg-emerald-50 text-emerald",
      iconClassName: "text-emerald"
    };
  }

  if (/Daily claimed/i.test(message)) {
    return {
      Icon: Star,
      title: "Daily Reward",
      flavor: "The notice board pays out before the reset bell.",
      className: "border-violet-400 bg-violet-50 text-violet-950",
      iconClassName: "text-violet-950"
    };
  }

  if (/Reincarnation complete|Renown upgraded/i.test(message)) {
    return {
      Icon: Sparkles,
      title: "Soul Ledger",
      flavor: "Old progress folds into a faster future run.",
      className: "border-amber-400 bg-amber-50 text-amber-900",
      iconClassName: "text-amber-900"
    };
  }

  return {
    Icon: CheckCircle2,
    title: "Guild Update",
    flavor: "The next order is ready when you are.",
    className: "border-royal/20 bg-blue-50 text-royal",
    iconClassName: "text-royal"
  };
}

function MessagePanel({ store }: { store: GameStore }) {
  if (!store.error && !store.lastMessage) return null;
  const message = store.error ?? store.lastMessage ?? "";
  const feedback = getMessageFeedback(message, Boolean(store.error));
  const Icon = feedback.Icon;
  return (
    <Card className={`feedback-pop ${feedback.className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-2 text-xs font-black uppercase">
            <Icon size={15} className={feedback.iconClassName} /> {feedback.title}
          </p>
          <p className="text-sm font-black">{message}</p>
          <p className="text-xs font-semibold text-stone-700">{feedback.flavor}</p>
        </div>
        <button className="text-sm font-bold text-stone-500 hover:text-stone-800" onClick={store.clearMessage}>
          Dismiss
        </button>
      </div>
    </Card>
  );
}

function OfflineSummaryPanel({
  state,
  store,
  onSelectTab
}: {
  state: GameState;
  store: GameStore;
  onSelectTab: (tab: TabId) => void;
}) {
  const summary = store.lastOfflineSummary;
  const summaryKey = summary ? JSON.stringify(summary) : null;
  const [dismissedSummaryKey, setDismissedSummaryKey] = useState<string | null>(null);

  useEffect(() => {
    if (!summaryKey && dismissedSummaryKey !== null) {
      setDismissedSummaryKey(null);
    }
  }, [summaryKey, dismissedSummaryKey]);

  if (!summary || !summaryKey || dismissedSummaryKey === summaryKey) return null;

  const hasMineGains = (["ore", "crystal", "rune", "relicFragment"] as const).some((resource) => (summary.mineGains[resource] ?? 0) > 0);
  const capped = (store.lastMessage ?? "").includes("Offline gains were capped at 8 hours.");

  return (
    <RewardSummary className={`feedback-pop ${capped ? "border-amber-400 bg-amber-50/80" : "border-royal/20 bg-blue-50/70"}`}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-black uppercase text-mystic">Offline Summary</p>
            <h2 className="text-base font-black">Progress While Away</h2>
          </div>
          <Pill className={capped ? "border-amber-400 bg-amber-50 text-amber-900" : "border-emerald/30 bg-emerald-100 text-emerald"}>
            <Clock size={13} /> {capped ? "Capped at 8h" : "Applied"}
          </Pill>
        </div>
        <div className="grid gap-2 text-sm font-semibold text-stone-700 sm:grid-cols-2">
          <p className="rounded-md border border-ink/10 bg-white/70 px-3 py-2">
            <span className="font-black text-ink">Expedition:</span>{" "}
            {summary.expedition ? `${summary.expedition.dungeon.name} ${summary.expedition.success ? "cleared" : "failed"}` : "No expedition resolved"}
          </p>
          <p className="rounded-md border border-ink/10 bg-white/70 px-3 py-2">
            <span className="font-black text-ink">Mine Gains:</span> {hasMineGains ? formatResources(summary.mineGains) : "None"}
          </p>
          <p className="rounded-md border border-ink/10 bg-white/70 px-3 py-2">
            <span className="font-black text-ink">Vigor Regenerated:</span> +{summary.vigorGained}
          </p>
          <p className="rounded-md border border-ink/10 bg-white/70 px-3 py-2">
            <span className="font-black text-ink">Dailies:</span> {summary.dailyReset ? "Reset while offline" : "No reset during offline time"}
          </p>
        </div>
        <p className="text-xs font-semibold text-stone-600">
          Last update: {formatLocalDateTime(state.updatedAt)}. Offline progress is always capped at {formatMs(OFFLINE_CAP_MS)}.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {summary.expedition && (
            <SecondaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => onSelectTab("expeditions")}>
              <Swords size={15} /> Open Expedition
            </SecondaryButton>
          )}
          <SecondaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => onSelectTab("dailies")}>
            <Star size={15} /> Open Dailies
          </SecondaryButton>
          <SecondaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => setDismissedSummaryKey(summaryKey)}>
            Dismiss
          </SecondaryButton>
        </div>
      </div>
    </RewardSummary>
  );
}

function isRareOrBetter(item: Item | null): boolean {
  return item?.rarity === "rare" || item?.rarity === "epic" || item?.rarity === "legendary";
}

function getNextUnclearedAvailableDungeon(state: GameState) {
  const availableIds = new Set(getAvailableDungeons(state).map((dungeon) => dungeon.id));
  return DUNGEONS.find((dungeon) => availableIds.has(dungeon.id) && (state.dungeonClears[dungeon.id] ?? 0) === 0) ?? null;
}

function hasAnyItemUpgrade(state: GameState): boolean {
  return [...state.inventory, ...((Object.values(state.equipment).filter(Boolean) as Item[]) ?? [])].some((item) => item.upgradeLevel > 0);
}

function hasCleared(state: GameState, dungeonId: string): boolean {
  return (state.dungeonClears[dungeonId] ?? 0) > 0;
}

function getFirstBossMilestone(state: GameState) {
  return DUNGEONS.find((dungeon) => dungeon.boss && !hasCleared(state, dungeon.id)) ?? DUNGEONS.find((dungeon) => dungeon.boss) ?? null;
}

function getResultCardClass(summary: ResolveSummary): string {
  if (!summary.success) {
    return "border-red-300 bg-red-50";
  }

  if (
    summary.firstGuaranteedWeapon ||
    summary.bossFirstClear ||
    summary.unlockedZones.length > 0 ||
    summary.item?.rarity === "legendary" ||
    summary.item?.rarity === "epic"
  ) {
    return "border-amber-400 bg-amber-50/80";
  }

  if (isRareOrBetter(summary.item) || summary.bossClear || summary.levelUps.length > 0 || summary.unlockedDungeons.length > 0) {
    return "border-royal/50 bg-blue-50";
  }

  return "border-emerald/20 bg-emerald-50/70";
}

function getNextActionCopy({
  state,
  summary,
  itemInInventory,
  nextDungeon,
  dailyReady,
  canUseForge,
  canUseTown
}: {
  state: GameState;
  summary: ResolveSummary;
  itemInInventory: boolean;
  nextDungeon: DungeonDefinition | null;
  dailyReady: boolean;
  canUseForge: boolean;
  canUseTown: boolean;
}): string {
  if (summary.itemComparison?.isBetter && itemInInventory) {
    return "Equip this drop before the next run.";
  }

  if (canUseForge && !hasAnyItemUpgrade(state) && Object.values(state.equipment).some(Boolean)) {
    return "Upgrade equipped gear in the Forge for a visible Power bump.";
  }

  if (canUseTown && getBuildingLevelTotal(state) === 0) {
    return "Upgrade the Forge or Mine in Town before pushing the boss.";
  }

  if (canUseForge && state.lifetime.totalItemsCrafted === 0 && summary.bossClear) {
    return "Craft a new item with the boss rewards.";
  }

  if (nextDungeon?.boss) {
    return `Attempt the boss: ${nextDungeon.name}.`;
  }

  if (nextDungeon) {
    return `Try the next dungeon: ${nextDungeon.name}.`;
  }

  if (dailyReady) {
    return "Claim completed daily progress.";
  }

  if (canUseForge) {
    return "Use the Forge to craft or upgrade gear.";
  }

  if (canUseTown) {
    return "Upgrade a Town building with the resources you earned.";
  }

  return getNextGoal(state);
}

function ExpeditionResultPanel({
  state,
  store,
  onSelectTab
}: {
  state: GameState;
  store: GameStore;
  onSelectTab: (tab: TabId) => void;
}) {
  const summary = store.lastExpeditionResult;
  if (!summary) return null;

  const item = summary.item;
  const comparison = summary.itemComparison;
  const itemInInventory = item ? state.inventory.some((entry) => entry.id === item.id) : false;
  const nextDungeon = summary.unlockedDungeons[0] ?? getNextUnclearedAvailableDungeon(state);
  const dailyReady = state.dailies.tasks.some((task) => task.progress >= task.target && !task.claimed);
  const upgradeCandidates = [...state.inventory, ...((Object.values(state.equipment).filter(Boolean) as Item[]) ?? [])];
  const canUpgradeItem = upgradeCandidates.some((candidate) => candidate.upgradeLevel < 10 && canAfford(state.resources, getItemUpgradeCost(state, candidate)));
  const canUseForge = canAfford(state.resources, getCraftCost(state)) || canUpgradeItem;
  const canUseTown = BUILDINGS.some((building) => state.town[building.id] < building.maxLevel && canAfford(state.resources, getBuildingCost(state, building.id as BuildingId)));
  const nextAction = getNextActionCopy({ state, summary, itemInInventory, nextDungeon, dailyReady, canUseForge, canUseTown });
  const hasSpecialMoment =
    summary.firstGuaranteedWeapon ||
    isRareOrBetter(item) ||
    summary.bossClear ||
    summary.bossFirstClear ||
    summary.levelUps.length > 0 ||
    summary.unlockedDungeons.length > 0 ||
    summary.unlockedZones.length > 0 ||
    summary.achievementsUnlocked.length > 0;
  const itemSellValue = item ? getVisibleSellValue(state, item) : 0;
  const actionButtonClass = "!min-h-9 px-3 py-1 text-xs";

  return (
    <RewardSummary className={`feedback-pop ${getResultCardClass(summary)}`}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase text-mystic">Expedition Result</p>
            <h2 className="line-clamp-1 text-base font-black sm:text-lg">{summary.success ? `${summary.dungeon.name} Cleared` : `${summary.dungeon.name} Failed`}</h2>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            <Pill className={`!px-2 !py-0.5 text-[0.68rem] ${summary.success ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-red-300 bg-red-100 text-red-700"}`}>
              {summary.success ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {summary.success ? "Success" : "Retreat"}
            </Pill>
            {summary.vigorBoostUsed && (
              <Pill className="!px-2 !py-0.5 text-[0.68rem] border-royal/20 bg-blue-50 text-royal">
                <Flame size={13} /> Vigor x{VIGOR_EXPEDITION_BOOST_MULTIPLIER.toFixed(1)}
              </Pill>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white/70 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <Sparkles size={14} className="shrink-0 text-royal" />
            <p className="min-w-0 truncate text-sm font-black text-ink" title={formatCompactRewards(summary)}>
              Rewards: {formatCompactRewards(summary)}
            </p>
          </div>
        </div>

        {hasSpecialMoment && (
          <div className="flex flex-wrap gap-1.5">
            {summary.firstGuaranteedWeapon && (
              <Pill className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">
                <Sparkles size={13} /> First weapon
              </Pill>
            )}
            {isRareOrBetter(item) && (
              <RarityBadge rarity={item?.rarity ?? "common"}>
                <Star size={13} /> {RARITY_LABEL[item?.rarity ?? "common"]} drop
              </RarityBadge>
            )}
            {summary.bossClear && (
              <Pill className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">
                <Crown size={13} /> Boss clear
              </Pill>
            )}
            {summary.bossFirstClear && (
              <Pill className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">
                <Sparkles size={13} /> First boss clear
              </Pill>
            )}
            {summary.dungeon.boss && item && (
              <Pill className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">
                <Gem size={13} /> Boss loot
              </Pill>
            )}
            {summary.levelUps.length > 0 && (
              <Pill className="!px-2 !py-0.5 text-[0.68rem] border-emerald/30 bg-emerald-100 text-emerald">
                <Sparkles size={13} /> Level up: Lv {summary.levelUps.join(", ")}
              </Pill>
            )}
            {summary.unlockedDungeons.length > 0 && (
              <Pill className="!px-2 !py-0.5 text-[0.68rem] border-royal/20 bg-blue-50 text-royal">
                <Swords size={13} /> Routes +{summary.unlockedDungeons.length}
              </Pill>
            )}
            {summary.unlockedZones.map((zone) => (
              <Pill key={zone.id} className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">
                <Crown size={13} /> Region unlocked: {zone.name}
              </Pill>
            ))}
            {summary.achievementsUnlocked.length > 0 && (
              <Pill className="!px-2 !py-0.5 text-[0.68rem] border-violet-400 bg-violet-50 text-violet-950">
                <Star size={13} /> Achievements +{summary.achievementsUnlocked.length}
              </Pill>
            )}
          </div>
        )}

        {item ? (
          <div className={`feedback-pop rounded-lg border px-2.5 py-2 ${rarityClass(item.rarity)} ${isRareOrBetter(item) ? "rarity-glow" : ""}`}>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black" title={item.name}>
                  <span className="text-xs uppercase text-stone-600">{RARITY_LABEL[item.rarity]} {slotLabels[item.slot]}</span> · {item.name}
                </p>
                <p className="line-clamp-1 text-xs font-semibold text-stone-700">
                  Power {formatNumber(comparison?.itemScore ?? getItemScore(item))}
                  {comparison ? ` · ${comparison.delta >= 0 ? "+" : ""}${comparison.delta} vs equipped` : ""}
                  {formatAffixPreview(item, 1) ? ` · ${formatAffixPreview(item, 1)}` : ""}
                </p>
              </div>
              {comparison && (
                <Pill className={`w-fit shrink-0 !px-2 !py-0.5 text-[0.68rem] ${comparison.isBetter ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-stone-300 bg-stone-50 text-stone-700"}`}>
                  {comparison.isBetter ? "Upgrade" : comparison.delta === 0 ? "Sidegrade" : "Weaker"}
                </Pill>
              )}
            </div>
            {summary.autoSalvagedItem && <p className="mt-1 text-xs font-bold text-amber-900">Pack was full, so this item auto-salvaged.</p>}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <p className="line-clamp-2 text-xs font-black text-ink">{nextAction}</p>
          <div className="flex flex-wrap gap-1.5">
            {comparison?.isBetter && itemInInventory && item && (
              <PrimaryButton className={actionButtonClass} onClick={() => store.equipItem(item.id)}>
                <Backpack size={16} /> Equip Item
              </PrimaryButton>
            )}
            {itemInInventory && item && !comparison?.isBetter && (
              <SecondaryButton className={actionButtonClass} onClick={() => store.equipItem(item.id)}>
                <Backpack size={16} /> Equip
              </SecondaryButton>
            )}
            {itemInInventory && item && (
              <SecondaryButton className={`${actionButtonClass} sm:hidden`} onClick={() => store.sellItem(item.id)}>
                <Coins size={16} /> Sell {formatNumber(itemSellValue)}
              </SecondaryButton>
            )}
            {nextDungeon && !state.activeExpedition && (
              <SecondaryButton className={actionButtonClass} onClick={() => store.startExpedition(nextDungeon.id)}>
                <Swords size={16} /> {nextDungeon.boss ? "Attempt Boss" : "Start Next"}
              </SecondaryButton>
            )}
            {dailyReady && (
              <SecondaryButton className={actionButtonClass} onClick={() => onSelectTab("dailies")}>
                <Star size={16} /> View Dailies
              </SecondaryButton>
            )}
            {canUseForge && !nextDungeon && (
              <SecondaryButton className={actionButtonClass} onClick={() => onSelectTab("forge")}>
                <Flame size={16} /> Open Forge
              </SecondaryButton>
            )}
            {canUseTown && !nextDungeon && !canUseForge && (
              <SecondaryButton className={actionButtonClass} onClick={() => onSelectTab("town")}>
                <Hammer size={16} /> Open Town
              </SecondaryButton>
            )}
            <SecondaryButton className={actionButtonClass} onClick={store.clearMessage}>Dismiss</SecondaryButton>
          </div>
        </div>
      </div>
    </RewardSummary>
  );
}

function ActiveExpeditionPanel({ state, now, store }: { state: GameState; now: number; store: GameStore }) {
  if (!state.activeExpedition) {
    return (
      <Card className="border-emerald/20 bg-emerald-50/70">
        <div className="flex items-start gap-3">
          <Swords className="mt-0.5 text-emerald" />
          <div>
            <p className="font-black text-emerald">No active expedition</p>
            <p className="mt-1 text-sm font-semibold text-stone-700">Pick a dungeon contract below. The guild board is ready, and the next goal is {getNextGoal(state)}</p>
          </div>
        </div>
      </Card>
    );
  }
  const dungeon = getDungeon(state.activeExpedition.dungeonId);
  const remaining = state.activeExpedition.endsAt - now;
  const total = state.activeExpedition.endsAt - state.activeExpedition.startedAt;
  const progress = Math.min(100, Math.max(0, ((now - state.activeExpedition.startedAt) / total) * 100));
  const ready = remaining <= 0;
  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-mystic">Active Expedition</p>
            <h2 className="font-black">{dungeon.name}</h2>
            <p className="text-sm text-stone-700">{getZoneForDungeon(dungeon).name}</p>
          </div>
          <Pill className={ready ? "border-emerald bg-emerald-100 text-emerald" : "border-royal/20 bg-blue-50 text-royal"}>
            <Clock size={13} /> {ready ? "Ready" : formatMs(remaining)}
          </Pill>
        </div>
        <ProgressBar value={progress} />
        <PrimaryButton onClick={store.claimExpedition} disabled={!ready}>
          <Swords size={16} /> {ready ? "Claim Expedition" : `Returns in ${formatMs(remaining)}`}
        </PrimaryButton>
      </div>
    </Card>
  );
}

function DungeonCard({
  state,
  dungeon,
  store,
  useVigorBoost
}: {
  state: GameState;
  dungeon: DungeonDefinition;
  store: GameStore;
  useVigorBoost: boolean;
}) {
  const view = getDungeonView(state, dungeon);
  return (
    <Card className={dungeon.boss ? "border-amber-400/60" : ""}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-black">{dungeon.name}</h3>
            <p className="text-sm text-stone-700">{dungeon.description}</p>
          </div>
          <Pill className="border-stone-200 bg-stone-50 text-stone-700">Lv {dungeon.minLevel}</Pill>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-parchment/70 p-2">
            <div className="font-black">{formatMs(view.durationMs)}</div>
            <div className="text-xs font-bold text-stone-500">Duration</div>
          </div>
          <div className="rounded-md bg-parchment/70 p-2">
            <div className="font-black">{formatPercent(view.successChance)}</div>
            <div className="text-xs font-bold text-stone-500">Success</div>
          </div>
        </div>
        <p className={`text-sm font-black ${view.powerDelta >= 0 ? "text-emerald" : "text-amber-900"}`}>
          {view.powerDelta >= 0 ? `Power +${formatNumber(view.powerDelta)} over target` : `Need ${formatNumber(Math.abs(view.powerDelta))} more Power`}
        </p>
        <p className="text-sm font-semibold text-stone-700">
          Rewards: {formatNumber(dungeon.baseXp)} XP, {formatNumber(dungeon.baseGold)} Gold
          {formatResources(dungeon.materials) ? `, ${formatResources(dungeon.materials)}` : ""}
        </p>
        {view.unlocked ? (
          <PrimaryButton onClick={() => store.startExpedition(dungeon.id, useVigorBoost)} disabled={Boolean(state.activeExpedition)}>
            <Swords size={16} /> Start
          </PrimaryButton>
        ) : (
          <div className="rounded-md border border-stone-200 bg-stone-50 p-2 text-sm font-semibold text-stone-700">{getUnlockText(state, dungeon)}</div>
        )}
      </div>
    </Card>
  );
}

function FirstSessionMilestones({ state }: { state: GameState }) {
  const boss = getFirstBossMilestone(state);
  const bossReady = boss ? getAvailableDungeons(state).some((dungeon) => dungeon.id === boss.id) : false;
  const steps = [
    { label: "Clear", done: state.lifetime.expeditionsSucceeded > 0, Icon: Swords },
    { label: "Equip", done: Object.values(state.equipment).some(Boolean), Icon: Backpack },
    { label: "Upgrade", done: hasAnyItemUpgrade(state), Icon: Flame },
    { label: "Town", done: getBuildingLevelTotal(state) > 0, Icon: Hammer },
    { label: "Boss", done: boss ? hasCleared(state, boss.id) : false, Icon: Crown },
    { label: "Craft", done: state.lifetime.totalItemsCrafted > 0, Icon: Sparkles }
  ];

  return (
    <Card className="border-royal/20 bg-blue-50/70">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-mystic">Next Goal</p>
          <h2 className="text-lg font-black">{getNextGoal(state)}</h2>
          {boss && (
            <p className="mt-1 text-sm font-semibold text-stone-700">
              Boss milestone: {boss.name} · {bossReady ? "Ready now" : getUnlockText(state, boss)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {steps.map(({ label, done, Icon }) => (
            <Pill key={label} className={done ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-stone-200 bg-white text-stone-700"}>
              {done ? <CheckCircle2 size={13} /> : <Icon size={13} />}
              {label}
            </Pill>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ExpeditionsScreen({ state, now, store }: { state: GameState; now: number; store: GameStore }) {
  const [useVigorBoost, setUseVigorBoost] = useState(false);
  const available = getAvailableDungeons(state);
  const vigorBoostCost = getVigorBoostCost(state);
  const canUseVigorBoost = state.vigor.current >= vigorBoostCost;
  const effectiveVigorBoost = useVigorBoost && canUseVigorBoost;
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Expedition Board</h2>
            <p className="text-sm font-semibold text-stone-700">
              Vigor regenerates +1 every {formatMs(VIGOR_REGEN_INTERVAL_MS)} up to {state.vigor.max}. Boosting a selected expedition doubles rewards.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm font-bold">
            <input type="checkbox" checked={effectiveVigorBoost} disabled={!canUseVigorBoost} onChange={(event) => setUseVigorBoost(event.target.checked)} />
            Use Vigor Boost ({vigorBoostCost} cost, {state.vigor.current}/{state.vigor.max})
          </label>
        </div>
      </Card>
      <FirstSessionMilestones state={state} />
      <ActiveExpeditionPanel state={state} now={now} store={store} />
      <div className="space-y-6">
        {Array.from(new Set(DUNGEONS.map((dungeon) => dungeon.zoneId))).map((zoneId) => {
          const zoneDungeons = DUNGEONS.filter((dungeon) => dungeon.zoneId === zoneId);
          const zoneName = zoneDungeons[0] ? getZoneForDungeon(zoneDungeons[0]).name : zoneId;
          const zoneUnlocked = zoneDungeons.some((dungeon) => available.includes(dungeon) || (state.dungeonClears[dungeon.id] ?? 0) > 0);
          return (
            <section key={zoneId} className="space-y-3">
              <div>
                <h3 className="text-lg font-black">{zoneName}</h3>
                <p className="text-sm font-semibold text-stone-700">{zoneUnlocked ? "Available progression region." : "Locked by prior boss and level requirements."}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {zoneDungeons.map((dungeon) => (
                  <DungeonCard key={dungeon.id} state={state} dungeon={dungeon} store={store} useVigorBoost={effectiveVigorBoost} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function HeroScreen({ state, store }: { state: GameState; store: GameStore }) {
  const stats = getDerivedStats(state);
  const xpToNext = xpToNextLevel(state.hero.level);
  const xpProgress = Math.min(100, (state.hero.xp / Math.max(1, xpToNext)) * 100);
  const canSwitchClass = state.lifetime.expeditionsStarted === 0 && state.hero.level === 1;
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">{state.hero.name}</h2>
            <p className="text-sm font-semibold text-stone-700">
              Level {state.hero.level} {HERO_CLASSES.find((entry) => entry.id === state.hero.classId)?.name}
            </p>
          </div>
          <Pill className="border-emerald/20 bg-emerald-50 text-emerald">Power {formatNumber(stats.powerScore)}</Pill>
        </div>
        <div className="mt-3 h-3 rounded-full bg-stone-200">
          <div className="h-full rounded-full bg-royal" style={{ width: `${xpProgress}%` }} />
        </div>
        <p className="mt-2 text-sm font-semibold text-stone-700">
          {formatNumber(state.hero.xp)} / {formatNumber(xpToNext)} XP to next level
        </p>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {HERO_CLASSES.map((heroClass) => (
          <Card key={heroClass.id} className={state.hero.classId === heroClass.id ? "border-royal/50 bg-blue-50" : ""}>
            <h3 className="font-black">{heroClass.name}</h3>
            <p className="text-sm font-bold text-royal">{heroClass.tagline}</p>
            <p className="mt-2 text-sm text-stone-700">{heroClass.description}</p>
            <ul className="mt-3 space-y-1 text-xs font-semibold text-stone-700">
              {CLASS_PASSIVE_TEXT[heroClass.id].map((passive) => (
                <li key={passive.name}>
                  Lv{passive.level} {passive.name}: {passive.effect}
                </li>
              ))}
            </ul>
            <SecondaryButton className="mt-3 w-full" onClick={() => store.changeClass(heroClass.id)} disabled={!canSwitchClass || state.hero.classId === heroClass.id}>
              {state.hero.classId === heroClass.id ? "Selected" : canSwitchClass ? "Choose Class" : "Locked"}
            </SecondaryButton>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {(Object.keys(statLabels) as (keyof Stats)[]).map((stat) => (
          <Card key={stat}>
            <p className="text-xs font-bold uppercase text-stone-500">{statLabels[stat]}</p>
            <p className="text-2xl font-black">{formatNumber(stats[stat])}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ItemCard({ state, item, store }: { state: GameState; item: Item; store: GameStore }) {
  const equipped = state.equipment[item.slot];
  const itemScore = getItemScore(item);
  const equippedScore = getItemScore(equipped);
  const delta = itemScore - equippedScore;
  const statDeltas = getItemStatDeltas(item, equipped);
  const sellValue = getVisibleSellValue(state, item);
  const salvageValue = getVisibleSalvageValue(state, item);
  return (
    <GameCard density="compact" className={`${rarityClass(item.rarity)} ${isRareOrBetter(item) ? "rarity-glow" : ""}`}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <RarityBadge rarity={item.rarity} />
              <span className="rounded-full border border-stone-200 bg-white/70 px-2 py-0.5 text-[0.68rem] font-black uppercase text-stone-600">
                {slotLabels[item.slot]}
              </span>
            </div>
            <h3 className="mt-1 line-clamp-2 text-sm font-black leading-snug">{item.name}</h3>
            <p className="text-xs font-semibold text-stone-700">
              ilvl {item.itemLevel} · +{item.upgradeLevel}
            </p>
            <p className="text-xs font-black text-stone-700 tabular-nums">
              Item Power {formatNumber(itemScore)} · Equipped {formatNumber(equippedScore)}
            </p>
          </div>
          <StatDelta delta={delta} />
        </div>
        <div className="grid gap-1 text-xs font-semibold text-stone-700">
          <p className="line-clamp-1">Stats: {formatTopStats(item.stats) || "No stat roll"}</p>
          <p className="line-clamp-1 font-bold">Delta: {formatStatDeltas(statDeltas)}</p>
          <p className="line-clamp-2 text-stone-600">Affixes: {formatAffixPreview(item) || "None"}</p>
        </div>
        <div className="grid gap-2 text-xs font-semibold text-stone-700 sm:grid-cols-2">
          <p>Sell: {formatNumber(sellValue)} Gold</p>
          <p>Salvage: {formatResources(salvageValue) || "No materials"}</p>
        </div>
        <div className="grid min-w-0 grid-cols-3 gap-1.5">
          <PrimaryButton className="!min-h-9 px-2 py-1 text-xs" onClick={() => store.equipItem(item.id)}>
            Equip
          </PrimaryButton>
          <SecondaryButton className="!min-h-9 px-2 py-1 text-xs" onClick={() => store.sellItem(item.id)}>Sell</SecondaryButton>
          <SecondaryButton className="!min-h-9 px-2 py-1 text-xs" onClick={() => store.salvageItem(item.id)}>Salvage</SecondaryButton>
        </div>
      </div>
    </GameCard>
  );
}

function InventoryScreen({ state, store }: { state: GameState; store: GameStore }) {
  const [filter, setFilter] = useState<"all" | EquipmentSlot>("all");
  const items = state.inventory.filter((item) => filter === "all" || item.slot === filter);
  const inventoryFull = state.inventory.length >= INVENTORY_LIMIT;
  const inventoryNearFull = state.inventory.length >= INVENTORY_NEAR_FULL_THRESHOLD;
  const capacityPercent = Math.floor((state.inventory.length / INVENTORY_LIMIT) * 100);
  const capacityClass = inventoryFull ? "bg-red-700" : inventoryNearFull ? "bg-amber-500" : "bg-emerald";
  const capacityCopy = inventoryFull
    ? "Pack full. Fresh drops convert into salvage until space opens."
    : inventoryNearFull
      ? "Pack pressure is high. Sell or salvage before the next loot reveal."
      : "Pack space is healthy. Keep pushing expeditions for better rolls.";
  const emptyTitle = state.inventory.length === 0 ? "Your pack is empty" : `No ${filter === "all" ? "items" : slotLabels[filter].toLowerCase()} in this view`;
  const emptyDescription =
    state.inventory.length === 0
      ? "Clear expeditions to bring back weapons, armor, relics, and salvageable finds."
      : "Change the slot filter or run another contract to find gear for this slot.";
  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader
          title="Inventory"
          description={`${state.inventory.length}/${INVENTORY_LIMIT} slots. Overflowed loot auto-salvages.`}
          action={
          <select className="min-h-11 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold" value={filter} onChange={(event) => setFilter(event.target.value as "all" | EquipmentSlot)}>
            <option value="all">All Slots</option>
            {(Object.keys(slotLabels) as EquipmentSlot[]).map((slot) => (
              <option key={slot} value={slot}>
                {slotLabels[slot]}
              </option>
            ))}
          </select>
          }
        />
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs font-black uppercase text-stone-600">
            <span>Pack Capacity</span>
            <span>{capacityPercent}%</span>
          </div>
          <ProgressBar value={capacityPercent} className={capacityClass} />
          <p className="text-xs font-semibold text-stone-700">{capacityCopy}</p>
        </div>
      </Card>
      {inventoryNearFull && (
        <Card className={`feedback-pop ${inventoryFull ? "border-red-300 bg-red-50" : "border-amber-400 bg-amber-50"}`}>
          <p className={`flex items-center gap-2 ${inventoryFull ? "font-bold text-red-800" : "font-bold text-amber-900"}`}>
            {inventoryFull ? <XCircle size={16} /> : <Backpack size={16} />}
            {inventoryFull
              ? `Inventory full (${state.inventory.length}/${INVENTORY_LIMIT}). New drops will auto-salvage until you sell or salvage items.`
              : `Inventory pressure warning: near capacity (${state.inventory.length}/${INVENTORY_LIMIT}).`}
          </p>
        </Card>
      )}
      {items.length === 0 ? (
        <EmptyState Icon={Backpack} title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} state={state} item={item} store={store} />
          ))}
        </div>
      )}
    </div>
  );
}

function ForgeScreen({ state, store }: { state: GameState; store: GameStore }) {
  const [slot, setSlot] = useState<"any" | EquipmentSlot>("any");
  const [classBias, setClassBias] = useState(true);
  const craftCost = getCraftCost(state);
  const craftAffordable = canAfford(state.resources, craftCost);
  const upgradeCandidates = [
    ...state.inventory,
    ...((Object.values(state.equipment).filter(Boolean) as Item[]) ?? [])
  ];
  const equippedIds = new Set((Object.values(state.equipment).filter(Boolean) as Item[]).map((item) => item.id));
  const forgeLevel = state.town.forge;
  const forgeBuilding = BUILDINGS.find((building) => building.id === "forge");
  const rerollUnlocked = forgeLevel >= FORGE_AFFIX_REROLL_REQUIRED_LEVEL;
  const forgeEffect = forgeBuilding?.effectText(forgeLevel) ?? `+${forgeLevel * 2} item stat budget`;

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader
          title="Relic Forge"
          description={`Level ${forgeLevel}/12 · ${forgeEffect}`}
          action={
            <Pill className={rerollUnlocked ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-stone-200 bg-stone-100 text-stone-700"}>
              <RotateCcw size={13} /> Affix reroll {rerollUnlocked ? "Ready" : `at Lv${FORGE_AFFIX_REROLL_REQUIRED_LEVEL}`}
            </Pill>
          }
        />
      </Card>
      <Card>
        <div className="space-y-3">
          <h3 className="font-black">Craft Item</h3>
          <div className="grid gap-2 text-xs font-bold text-stone-700 sm:grid-cols-3">
            <p>Slot: {slot === "any" ? (classBias ? "Class-biased random" : "Weighted random") : slotLabels[slot]}</p>
            <p>Forge budget: +{forgeLevel * 2} item stats</p>
            <p>Cost: {formatResources(craftCost)}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <select className="min-h-11 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold" value={slot} onChange={(event) => setSlot(event.target.value as "any" | EquipmentSlot)}>
              <option value="any">Any Slot</option>
              {(Object.keys(slotLabels) as EquipmentSlot[]).map((entry) => (
                <option key={entry} value={entry}>
                  {slotLabels[entry]}
                </option>
              ))}
            </select>
            <label className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 text-sm font-bold">
              <input type="checkbox" checked={classBias} onChange={(event) => setClassBias(event.target.checked)} />
              Class Bias
            </label>
            <PrimaryButton onClick={() => store.craftItem(slot === "any" ? undefined : slot, classBias)} disabled={!craftAffordable}>
              <Flame size={16} /> Craft
            </PrimaryButton>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="font-black">Upgrade Item</h3>
        {upgradeCandidates.length === 0 ? (
          <p className="mt-2 text-sm font-semibold text-stone-700">No upgradeable items yet.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {upgradeCandidates.map((item) => {
              const cost = getItemUpgradeCost(state, item);
              const affordable = canAfford(state.resources, cost);
              return (
                <ForgeItemRow
                  key={item.id}
                  item={item}
                  meta={`${slotLabels[item.slot]} · ilvl ${item.itemLevel} · +${item.upgradeLevel}${equippedIds.has(item.id) ? " · equipped" : ""}`}
                  action={
                    <PrimaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => store.upgradeItem(item.id)} disabled={!affordable || item.upgradeLevel >= 10}>
                      <Hammer size={16} /> Upgrade
                    </PrimaryButton>
                  }
                >
                  <p className="mt-1 text-xs font-bold text-stone-700">Item Power {formatNumber(getItemScore(item))}</p>
                  <p className="mt-2 text-xs font-semibold text-stone-700">Cost: {formatResources(cost)}</p>
                </ForgeItemRow>
              );
            })}
          </div>
        )}
      </Card>
      <Card>
        <h3 className="font-black">Reroll Affix</h3>
        {!rerollUnlocked && (
          <p className="mt-2 text-sm font-bold text-stone-700">
            Forge level {FORGE_AFFIX_REROLL_REQUIRED_LEVEL} required. Current level: {forgeLevel}.
          </p>
        )}
        {upgradeCandidates.length === 0 ? (
          <p className="mt-2 text-sm font-semibold text-stone-700">No items with affixes yet.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {upgradeCandidates.map((item) => {
              const cost = getAffixRerollCost(state, item);
              const affordable = canAfford(state.resources, cost);
              return (
                <ForgeItemRow
                  key={`reroll-${item.id}`}
                  item={item}
                  meta={`${slotLabels[item.slot]} · ${RARITY_LABEL[item.rarity]} · Cost: ${formatResources(cost)}`}
                  action={<Pill className="w-fit shrink-0 border-stone-200 bg-stone-50 text-stone-700">Power {formatNumber(getItemScore(item))}</Pill>}
                >
                  <div className="mt-3 grid gap-2">
                    {item.affixes.map((affix, index) => (
                      <div key={`${item.id}-${affix.id}-${index}`} className="grid gap-2 rounded-md bg-parchment/70 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                        <p className="min-w-0 line-clamp-2 text-xs font-semibold text-stone-700">
                          <span className="font-black text-ink">{affix.name}</span>: {affix.description}
                        </p>
                        <SecondaryButton className="!min-h-9 min-w-[7rem] justify-self-start px-3 py-1 text-xs sm:justify-self-end" onClick={() => store.rerollItemAffix(item.id, index)} disabled={!rerollUnlocked || !affordable}>
                          <RotateCcw size={14} /> Reroll
                        </SecondaryButton>
                      </div>
                    ))}
                  </div>
                </ForgeItemRow>
              );
            })}
          </div>
        )}
      </Card>
      <Card>
        <h3 className="font-black">Salvage Materials</h3>
        {state.inventory.length === 0 ? (
          <p className="mt-2 text-sm font-semibold text-stone-700">No inventory items to salvage.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {state.inventory.map((item) => {
              const salvageValue = getVisibleSalvageValue(state, item);
              return (
                <ForgeItemRow
                  key={`salvage-${item.id}`}
                  item={item}
                  meta={`${slotLabels[item.slot]} · ${RARITY_LABEL[item.rarity]} · Returns: ${formatResources(salvageValue) || "No materials"}`}
                  action={
                    <SecondaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => store.salvageItem(item.id)}>
                      <Pickaxe size={14} /> Salvage
                    </SecondaryButton>
                  }
                />
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function formatResourceRate(resources: Partial<ResourceState>): string {
  return (Object.keys(resourceLabels) as (keyof ResourceState)[])
    .filter((key) => (resources[key] ?? 0) > 0)
    .map((key) => {
      const value = resources[key] ?? 0;
      const formatted = Number.isInteger(value) ? formatNumber(value) : value.toFixed(1);
      return `${formatted} ${resourceLabels[key]}`;
    })
    .join(", ");
}

function getTownBuildingFeedback(state: GameState, buildingId: BuildingId): string {
  switch (buildingId) {
    case "forge":
      return state.town.forge >= FORGE_AFFIX_REROLL_REQUIRED_LEVEL
        ? "Affix rerolls unlocked; upgrades and craft budget scale from here."
        : `Affix rerolls unlock at Forge level ${FORGE_AFFIX_REROLL_REQUIRED_LEVEL}.`;
    case "mine": {
      const rate = formatResourceRate(getMineOfflineRate(state));
      const capHours = Math.floor(OFFLINE_CAP_MS / (60 * 60 * 1000));
      return rate ? `Offline rate: ${rate}/hr, capped at ${capHours}h.` : `Upgrade once to start offline ore generation; cap is ${capHours}h.`;
    }
    case "tavern": {
      const ready = state.dailies.tasks.filter((task) => !task.claimed && task.progress >= task.target).length;
      return `${ready}/${state.dailies.tasks.length} daily rewards ready; rumor: ${getNextGoal(state)}`;
    }
    case "market": {
      const pressure = state.inventory.length >= INVENTORY_NEAR_FULL_THRESHOLD ? "Inventory pressure high" : "Inventory pressure stable";
      return `${pressure}: ${state.inventory.length}/${INVENTORY_LIMIT} slots. Sell multiplier ${formatPercent(getSellMultiplier(state) - 1)}.`;
    }
    case "library": {
      const nextLocked = getNextLockedDungeon(state);
      return nextLocked ? `Next unlock hint: ${nextLocked.name} - ${getUnlockText(state, nextLocked)}` : "All known dungeon routes are unlocked.";
    }
    case "shrine":
      return canPrestige(state)
        ? `Reincarnation ready for ${formatNumber(calculatePrestigeRenown(state))} Soul Marks.`
        : `Reincarnation needs hero level ${REINCARNATION_LEVEL_REQUIREMENT} and the Azure Vaults gate boss clear.`;
  }
}

function TownScreen({ state, store }: { state: GameState; store: GameStore }) {
  const totalLevels = getBuildingLevelTotal(state);
  const nextAffordable = BUILDINGS.find((building) => state.town[building.id] < building.maxLevel && canAfford(state.resources, getBuildingCost(state, building.id)));
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Town Buildings</h2>
            <p className="text-sm font-semibold text-stone-700">Total building levels {totalLevels}/72. Each upgrade feeds gear, resources, dailies, unlocks, or reincarnation.</p>
          </div>
          <Pill className={nextAffordable ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-stone-200 bg-stone-100 text-stone-700"}>
            {nextAffordable ? `${nextAffordable.name} ready` : "No upgrade ready"}
          </Pill>
        </div>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {BUILDINGS.map((building) => {
          const level = state.town[building.id];
          const cost = getBuildingCost(state, building.id);
          const affordable = canAfford(state.resources, cost);
          const maxed = level >= building.maxLevel;
          const progress = Math.floor((level / building.maxLevel) * 100);
          return (
            <Card key={building.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black">{building.name}</h3>
                    <p className="text-sm font-semibold text-stone-700">{building.purpose}</p>
                    <p className="mt-1 text-xs font-semibold text-stone-600">{building.description}</p>
                  </div>
                  <Pill className={maxed ? "border-amber-300 bg-amber-100 text-amber-900" : affordable ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-royal/20 bg-blue-50 text-royal"}>
                    {level}/{building.maxLevel}
                  </Pill>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                  <div className="h-full rounded-full bg-royal" style={{ width: `${progress}%` }} />
                </div>
                <p className="rounded-md bg-parchment/70 px-3 py-2 text-xs font-bold text-stone-700">{getTownBuildingFeedback(state, building.id)}</p>
                <div className="grid gap-2 text-xs font-semibold text-stone-700">
                  <p><span className="font-black text-ink">Current benefit:</span> {building.effectText(level)}</p>
                  <p><span className="font-black text-ink">Next level:</span> {maxed ? "Maxed" : building.effectText(level + 1)}</p>
                  <p><span className="font-black text-ink">Upgrade cost:</span> {maxed ? "Maxed" : formatResources(cost)}</p>
                </div>
                <div className="grid gap-2">
                  {building.milestones.map((milestone) => {
                    const reached = level >= milestone.level;
                    return (
                      <div key={`${building.id}-${milestone.level}`} className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700">
                        {reached ? <CheckCircle2 size={14} className="text-emerald" /> : <Clock size={14} className="text-stone-500" />}
                        <span className="shrink-0 text-stone-500">{milestone.level === 0 ? "Base" : `Lv${milestone.level}`}</span>
                        <span>{milestone.label}</span>
                      </div>
                    );
                  })}
                </div>
                <PrimaryButton className="w-full" onClick={() => store.buyBuilding(building.id as BuildingId)} disabled={!affordable || maxed}>
                  <Hammer size={16} /> {maxed ? "Maxed" : affordable ? "Upgrade" : "Need Resources"}
                </PrimaryButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function DailiesScreen({ state, now, store }: { state: GameState; now: number; store: GameStore }) {
  const timeLeft = Math.max(0, state.dailies.nextResetAt - now);
  const completed = state.dailies.tasks.filter((task) => task.progress >= task.target).length;
  const claimed = state.dailies.tasks.filter((task) => task.claimed).length;
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Daily Tasks</h2>
            <p className="text-sm font-semibold text-stone-700">
              {DAILY_RESET_HOUR_LOCAL}:00 local reset. No streaks, penalties, premium currency, or ads.
            </p>
            <p className="mt-2 text-sm font-bold text-royal">
              Reset in {formatMs(timeLeft)} · next at {formatLocalClock(state.dailies.nextResetAt)}
            </p>
          </div>
          <Pill className="border-royal/20 bg-blue-50 text-royal">
            {completed}/{state.dailies.tasks.length} complete · {claimed} claimed
          </Pill>
        </div>
      </Card>
      <div className="grid gap-3">
        {state.dailies.tasks.map((task) => {
          const done = task.progress >= task.target;
          const percent = Math.floor((Math.min(task.progress, task.target) / task.target) * 100);
          return (
            <Card key={task.id} className={task.claimed ? "border-emerald/30 bg-emerald-50/70" : ""}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-black">{task.label}</h3>
                  <p className="text-sm font-semibold text-stone-700">
                    Progress: {task.progress}/{task.target}
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200">
                    <div className={task.claimed ? "h-full rounded-full bg-emerald" : "h-full rounded-full bg-royal"} style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-xs font-semibold text-stone-600">
                    Reward: {formatNumber(task.reward.gold)} Gold
                    {formatResources(task.reward.materials) ? `, ${formatResources(task.reward.materials)}` : ""}
                    , +{task.reward.vigor} Vigor
                  </p>
                </div>
                <PrimaryButton onClick={() => store.claimDaily(task.id)} disabled={!done || task.claimed}>
                  {task.claimed ? "Claimed" : done ? "Claim" : "In Progress"}
                </PrimaryButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AchievementsScreen({ state }: { state: GameState }) {
  const unlockedCount = ACHIEVEMENTS.filter((achievement) => (state.achievements[achievement.id]?.unlockedAt ?? null) !== null).length;
  const completionPercent = Math.floor((unlockedCount / Math.max(1, ACHIEVEMENTS.length)) * 100);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Achievements</h2>
            <p className="text-sm font-semibold text-stone-700">Track progression milestones across expeditions, loot, town upgrades, and reincarnation cycles.</p>
          </div>
          <Pill className="border-violet-400 bg-violet-50 text-violet-950">
            <Trophy size={13} /> {unlockedCount}/{ACHIEVEMENTS.length}
          </Pill>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs font-black uppercase text-stone-600">
            <span>Completion</span>
            <span>{completionPercent}%</span>
          </div>
          <ProgressBar value={completionPercent} className="bg-violet-500" />
        </div>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ACHIEVEMENTS.map((achievement) => {
          const unlockedAt = state.achievements[achievement.id]?.unlockedAt ?? null;
          const unlocked = unlockedAt !== null;
          return (
            <Card key={achievement.id} className={unlocked ? "border-emerald/30 bg-emerald-50/70" : ""}>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black">{achievement.title}</h3>
                    <p className="text-sm font-semibold text-stone-700">{achievement.description}</p>
                  </div>
                  <Pill className={unlocked ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-stone-200 bg-stone-50 text-stone-700"}>
                    {unlocked ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    {unlocked ? "Done" : getAchievementProgress(state, achievement.id)}
                  </Pill>
                </div>
                <p className="text-xs font-semibold text-stone-600">
                  {unlockedAt ? `Unlocked: ${formatLocalDateTime(unlockedAt)}` : "Not unlocked yet"}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ReincarnationScreen({ state, store }: { state: GameState; store: GameStore }) {
  const ready = canPrestige(state);
  const gain = calculatePrestigeRenown(state);
  const levelReady = state.hero.level >= REINCARNATION_LEVEL_REQUIREMENT;
  const bossClear = (state.dungeonClears[REINCARNATION_GATE_BOSS_ID] ?? 0) > 0;
  const gateBoss = getDungeon(REINCARNATION_GATE_BOSS_ID);
  const gateRoute = DUNGEONS.filter((dungeon) => dungeon.zoneId === gateBoss.zoneId && dungeon.indexInZone <= gateBoss.indexInZone);
  const clearedGateRoute = gateRoute.filter((dungeon) => (state.dungeonClears[dungeon.id] ?? 0) > 0).length;
  const levelProgress = Math.min(100, Math.floor((state.hero.level / REINCARNATION_LEVEL_REQUIREMENT) * 100));
  const bossProgress = bossClear ? 100 : Math.min(99, Math.floor((clearedGateRoute / Math.max(1, gateRoute.length)) * 100));
  const resetItems = ["Hero level, XP, and base stats", "Gold, materials, inventory, and equipment", "Town buildings, dungeon clears, active expedition, and dailies", "Vigor returns to 40 current"];
  const persistItems = ["Soul Marks and purchased permanent upgrades", "Hero name, class, settings, achievements, and lifetime stats", "Total reincarnations and total Soul Marks earned"];
  return (
    <div className="space-y-4">
      <Card className={ready ? "border-amber-400 bg-amber-50/80" : ""}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Reincarnation</h2>
            <p className="text-sm font-semibold text-stone-700">Reset this run for Soul Marks, then buy permanent upgrades that make the next cycle faster.</p>
          </div>
          <Pill className={ready ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-amber-300 bg-amber-100 text-amber-900"}>
            <Sparkles size={13} /> {ready ? "Ready" : "Preparing"}
          </Pill>
        </div>
        <div className="mt-3 grid gap-2 text-sm font-semibold text-stone-700 md:grid-cols-2">
          <p className="flex items-center gap-2">{levelReady ? <CheckCircle2 size={16} className="text-emerald" /> : <Clock size={16} className="text-stone-500" />} Level {REINCARNATION_LEVEL_REQUIREMENT}: {state.hero.level}/{REINCARNATION_LEVEL_REQUIREMENT}</p>
          <p className="flex items-center gap-2">{bossClear ? <CheckCircle2 size={16} className="text-emerald" /> : <Clock size={16} className="text-stone-500" />} Region 3 boss: Curator of Blue Fire</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-ink/10 bg-white/70 p-3">
            <div className="mb-2 flex items-center justify-between gap-2 text-xs font-black uppercase text-stone-600">
              <span>Level Gate</span>
              <span>{levelProgress}%</span>
            </div>
            <ProgressBar value={levelProgress} className={levelReady ? "bg-emerald" : "bg-royal"} />
            <p className="mt-2 text-xs font-semibold text-stone-700">
              {levelReady ? "Level gate complete." : `${REINCARNATION_LEVEL_REQUIREMENT - state.hero.level} hero levels until the Shrine answers.`}
            </p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-white/70 p-3">
            <div className="mb-2 flex items-center justify-between gap-2 text-xs font-black uppercase text-stone-600">
              <span>Boss Route</span>
              <span>{bossProgress}%</span>
            </div>
            <ProgressBar value={bossProgress} className={bossClear ? "bg-emerald" : "bg-amber-500"} />
            <p className="mt-2 text-xs font-semibold text-stone-700">
              {bossClear ? "Curator defeated. Reincarnation can open once the level gate is met." : `Clear ${gateBoss.name} in ${getZoneForDungeon(gateBoss).name}.`}
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-2 text-sm font-semibold text-stone-700 md:grid-cols-3">
          <p><span className="font-black text-ink">Currency earned:</span> +{gain} Soul Marks</p>
          <p><span className="font-black text-ink">Current balance:</span> {formatNumber(state.resources.renown)} Soul Marks</p>
          <p><span className="font-black text-ink">Next run:</span> faster timers, rewards, loot, and boss gates</p>
        </div>
        <PrimaryButton
          className="mt-3"
          disabled={!ready}
          onClick={() => {
            if (window.confirm("Reincarnation resets this run's level, resources, gear, town, dungeon clears, expedition, and dailies. Soul Marks, upgrades, achievements, and lifetime stats persist.")) {
              store.prestige();
            }
          }}
        >
          <Sparkles size={16} /> Reincarnate
        </PrimaryButton>
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <h3 className="font-black">Resets</h3>
          <ul className="mt-2 space-y-2 text-xs font-semibold text-stone-700">
            {resetItems.map((item) => (
              <li key={item} className="flex gap-2"><XCircle size={14} className="mt-0.5 text-red-700" /> {item}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="font-black">Persists</h3>
          <ul className="mt-2 space-y-2 text-xs font-semibold text-stone-700">
            {persistItems.map((item) => (
              <li key={item} className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 text-emerald" /> {item}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="font-black">Why It Gets Faster</h3>
          <p className="mt-2 text-xs font-semibold text-stone-700">Echo Tempo shortens timers, Soul Prosperity increases rewards, Relic Wisdom improves loot consistency, and Boss Attunement smooths boss gates.</p>
        </Card>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {RENOWN_UPGRADES.map((upgrade) => {
          const level = state.prestige.upgrades[upgrade.id];
          const cost = getRenownUpgradeCost(state, upgrade.id as RenownUpgradeId);
          const maxed = level >= REINCARNATION_UPGRADE_MAX;
          return (
            <Card key={upgrade.id}>
              <h3 className="font-black">{upgrade.name}</h3>
              <p className="text-sm text-stone-700">{upgrade.description}</p>
              <div className="mt-3 grid gap-1 text-xs font-semibold text-stone-700">
                <p><span className="font-black text-ink">Current:</span> {upgrade.effectText(level)}</p>
                <p><span className="font-black text-ink">Next:</span> {maxed ? "Maxed" : upgrade.effectText(level + 1)}</p>
                <p><span className="font-black text-ink">Cost:</span> {maxed ? "Maxed" : `${cost} Soul Marks`}</p>
              </div>
              <SecondaryButton className="mt-3 w-full" disabled={maxed || state.resources.renown < cost} onClick={() => store.buyRenownUpgrade(upgrade.id as RenownUpgradeId)}>
                {maxed ? "Maxed" : "Upgrade"}
              </SecondaryButton>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SettingsScreen({ state, store }: { state: GameState; store: GameStore }) {
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-black">Save & Settings</h2>
        <p className="text-sm font-semibold text-stone-700">Autosave is local. Export/import works with JSON envelopes.</p>
      </Card>
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <h3 className="font-black">Export Save</h3>
          <SecondaryButton className="mt-3" onClick={() => setExportText(store.exportSave())}>
            <Download size={16} /> Generate
          </SecondaryButton>
          <textarea className="mt-3 min-h-44 w-full rounded-lg border border-ink/15 bg-white p-3 text-xs" value={exportText} readOnly />
        </Card>
        <Card>
          <h3 className="font-black">Import Save</h3>
          <textarea className="mt-3 min-h-44 w-full rounded-lg border border-ink/15 bg-white p-3 text-xs" value={importText} onChange={(event) => setImportText(event.target.value)} />
          <PrimaryButton className="mt-3" disabled={!importText.trim()} onClick={() => store.importSaveRaw(importText)}>
            <Upload size={16} /> Import
          </PrimaryButton>
        </Card>
      </div>
      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border border-ink/10 bg-white p-3 text-sm font-bold">
            Debug balance
            <input type="checkbox" checked={state.settings.debugBalance} onChange={(event) => store.setDebugBalance(event.target.checked)} />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-ink/10 bg-white p-3 text-sm font-bold">
            Reduced motion
            <input type="checkbox" checked={state.settings.reducedMotion} onChange={(event) => store.setReducedMotion(event.target.checked)} />
          </label>
        </div>
      </Card>
      <Card className="border-red-300 bg-red-50">
        <h3 className="font-black text-red-900">Reset Local Save</h3>
        <p className="text-sm font-semibold text-red-800">This clears local progress from this browser.</p>
        <DangerButton
          className="mt-3"
          onClick={() => {
            if (window.confirm("Delete local save?")) {
              store.resetSave();
              setExportText("");
              setImportText("");
            }
          }}
        >
          <RotateCcw size={16} /> Reset
        </DangerButton>
      </Card>
    </div>
  );
}

function DesktopSide({ state, now }: { state: GameState; now: number }) {
  const stats = getDerivedStats(state);
  const active = state.activeExpedition ? getDungeon(state.activeExpedition.dungeonId) : null;
  const reincarnationLevelProgress = Math.min(100, Math.floor((state.hero.level / REINCARNATION_LEVEL_REQUIREMENT) * 100));
  return (
    <aside className="hidden space-y-3 lg:block">
      <Card className="border-royal/20 bg-blue-50/70">
        <h3 className="font-black">Next Goal</h3>
        <p className="mt-2 text-sm font-semibold text-stone-700">{getNextGoal(state)}</p>
      </Card>
      <Card>
        <h3 className="font-black">Hero Snapshot</h3>
        <div className="mt-2 space-y-1 text-sm font-semibold text-stone-700">
          <p>Class: {HERO_CLASSES.find((entry) => entry.id === state.hero.classId)?.name}</p>
          <p>Level: {state.hero.level}</p>
          <p>Power: {formatNumber(stats.powerScore)}</p>
          <p>Vigor: {state.vigor.current}/{state.vigor.max}</p>
          <p>Soul Marks: {formatNumber(state.resources.renown)}</p>
        </div>
      </Card>
      <Card>
        <h3 className="font-black">Current Expedition</h3>
        {active && state.activeExpedition ? (
          <p className="mt-2 text-sm font-semibold text-stone-700">
            {active.name} · {formatMs(state.activeExpedition.endsAt - now)}
          </p>
        ) : (
          <p className="mt-2 text-sm font-semibold text-stone-700">No active expedition.</p>
        )}
      </Card>
      <Card>
        <h3 className="font-black">Dailies</h3>
        <p className="mt-2 text-sm font-semibold text-stone-700">
          {state.dailies.tasks.filter((task) => task.claimed).length}/{state.dailies.tasks.length} claimed
        </p>
      </Card>
      <Card>
        <h3 className="font-black">Rebirth Track</h3>
        <p className="mt-2 text-sm font-semibold text-stone-700">Level {state.hero.level}/{REINCARNATION_LEVEL_REQUIREMENT}</p>
        <div className="mt-2">
          <ProgressBar value={reincarnationLevelProgress} />
        </div>
      </Card>
    </aside>
  );
}

export default function Home() {
  const store = useGameStore();
  const now = useNow();
  const [tab, setTab] = useState<TabId>("expeditions");

  useEffect(() => {
    store.hydrate();
  }, [store.hydrate]);

  const state = store.state;

  if (!store.hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-sm text-center">
          <Save className="mx-auto text-royal" />
          <p className="mt-2 text-sm font-semibold text-stone-700">Loading local save...</p>
        </Card>
      </main>
    );
  }

  if (!state.settings.heroCreated) {
    return <CharacterStart store={store} />;
  }

  let screen: React.ReactNode;
  switch (tab) {
    case "hero":
      screen = <HeroScreen state={state} store={store} />;
      break;
    case "inventory":
      screen = <InventoryScreen state={state} store={store} />;
      break;
    case "forge":
      screen = <ForgeScreen state={state} store={store} />;
      break;
    case "town":
      screen = <TownScreen state={state} store={store} />;
      break;
    case "dailies":
      screen = <DailiesScreen state={state} now={now} store={store} />;
      break;
    case "achievements":
      screen = <AchievementsScreen state={state} />;
      break;
    case "reincarnation":
      screen = <ReincarnationScreen state={state} store={store} />;
      break;
    case "settings":
      screen = <SettingsScreen state={state} store={store} />;
      break;
    default:
      screen = <ExpeditionsScreen state={state} now={now} store={store} />;
      break;
  }

  return (
    <main className="min-h-screen pb-36 lg:pb-0">
      <Header state={state} />
      <div className="mx-auto grid min-w-0 max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-4">
          <OfflineSummaryPanel state={state} store={store} onSelectTab={setTab} />
          <MessagePanel store={store} />
          <ExpeditionResultPanel state={state} store={store} onSelectTab={setTab} />
          {screen}
        </div>
        <DesktopSide state={state} now={now} />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-amber-950/10 bg-parchment/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Primary navigation">
        <div className="grid w-full min-w-0 max-w-full grid-cols-5 gap-1 py-2">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[0.64rem] font-black leading-none transition ${tab === id ? "bg-royal text-white shadow-card" : "text-ink hover:bg-white/70"}`}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => setTab(id)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      <nav className="hidden border-t border-amber-950/10 bg-white/70 lg:block">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-3">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-black ${tab === id ? "bg-royal text-white" : "bg-white text-ink hover:bg-parchment"}`}
              onClick={() => setTab(id)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
