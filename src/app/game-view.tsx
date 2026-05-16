"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Backpack,
  BookOpen,
  CheckCircle2,
  Clock,
  Coins,
  Crown,
  MoreHorizontal,
  Download,
  Flame,
  Gem,
  Hammer,
  ListChecks,
  Lock,
  Pickaxe,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Unlock,
  Upload,
  XCircle
} from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import type { GameStore } from "@/store/useGameStore";
import { useIsClient } from "@/hooks/useIsClient";
import {
  ACHIEVEMENTS,
  BUILDINGS,
  CARAVAN_FOCUS_DEFINITIONS,
  CARAVAN_MAX_DURATION_MS,
  CARAVAN_MIN_DURATION_MS,
  CLASS_PASSIVE_TEXT,
  DAILY_RESET_HOUR_LOCAL,
  DUNGEONS,
  ZONES,
  FORGE_AFFIX_REROLL_REQUIRED_LEVEL,
  HERO_CLASSES,
  INVENTORY_LIMIT,
  ITEM_FAMILIES,
  ITEM_TRAITS,
  INVENTORY_NEAR_FULL_THRESHOLD,
  LOOT_DROP_PITY_THRESHOLD,
  OFFLINE_CAP_MS,
  RARITY_LABEL,
  RENOWN_UPGRADES,
  REINCARNATION_GATE_BOSS_ID,
  REINCARNATION_LEVEL_REQUIREMENT,
  REINCARNATION_UPGRADE_MAX,
  FOCUS_EXPEDITION_BOOST_MULTIPLIER,
  FOCUS_REGEN_INTERVAL_MS,
  ACCOUNT_RANKS,
  EXPEDITION_PROGRESS_REWARDS,
  REGION_MATERIAL_LABELS,
  SHOWCASE_TROPHY_SLOT_COUNT,
  CONSTRUCTION_FOCUS_PER_HOUR,
  CLASS_CHANGE_COOLDOWN_MS,
  CLASS_CHANGE_SOUL_MARK_COST,
  OUTPOST_BONUSES,
  buildShowcaseCopyText,
  canAfford,
  canAffordConstructionCost,
  canPrestige,
  calculatePrestigeRenown,
  getAvailableDungeons,
  getAffixRerollCost,
  getAchievementProgress,
  getBuildingConstructionCost,
  getBuildingConstructionDurationMs,
  getBuildingLevelTotal,
  getActiveConstructionProgress,
  getConstructionFocusCostToComplete,
  getCraftCost,
  getDerivedStats,
  getDungeon,
  getDungeonView,
  getFragmentsAffixMultiplier,
  getItemScore,
  getItemUpgradeCost,
  getNextGoal,
  getNextLockedDungeon,
  getFragmentGainPassiveMultiplier,
  getSalvageAffixMultiplier,
  getRenownUpgradeCost,
  getSellMultiplier,
  isDungeonUnlocked,
  getUnlockText,
  getFocusBoostCost,
  getMasteryProgress,
  getNextClaimableMasteryTier,
  getNextAccountRankDefinition,
  getAccountRankDefinition,
  getFeaturedBoss,
  getBossViewSummary,
  getBossScoutCost,
  getBossPrepMaterialCost,
  getFeaturedRegion,
  getFamilyResonanceSummaries,
  getItemFamilyDefinition,
  getItemTraitDefinition,
  getActiveRegionIds,
  getLockedTitleEntries,
  getLockedTrophyEntries,
  getPinnedTrophyEntries,
  getRegionDiarySummary,
  getRegionCompletionSummary,
  getRegionMaterialId,
  getRegionalMaterialSinks,
  getOutpostBonusDefinition,
  getVisibleRegionCollectionSummaries,
  getCaravanActualDurationMs,
  getCaravanMasterySummary,
  getCaravanMasterySummaries,
  getUnlockedCaravanRegions,
  getSelectedTitleDefinition,
  getUnlockedTitleEntries,
  getUnlockedTrophyEntries,
  getZoneForDungeon,
  estimateCaravanRewardsForRegion,
  formatCaravanRewardText,
  isCaravanFocusUnlocked,
  xpToNextLevel,
  type BuildingId,
  type BuildPresetId,
  type CaravanFocusId,
  type DungeonDefinition,
  type EquipmentSlot,
  type GameState,
  type Item,
  type ItemRarity,
  type LootFocusId,
  type MasteryTierDefinition,
  type RegionMaterialId,
  type RegionDiaryRewardDefinition,
  type RegionOutpostBonusId,
  type RenownUpgradeId,
  type ResolveSummary,
  type ResourceState,
  type Stats,
  type ZoneDefinition
} from "@/game";

type TabId = "expeditions" | "hero" | "inventory" | "forge" | "town" | "account" | "dailies" | "achievements" | "reincarnation" | "settings";

const tabs: { id: TabId; label: string; Icon: typeof Swords }[] = [
  { id: "expeditions", label: "Expeditions", Icon: Swords },
  { id: "hero", label: "Hero", Icon: Crown },
  { id: "inventory", label: "Inventory", Icon: Backpack },
  { id: "forge", label: "Forge", Icon: Flame },
  { id: "town", label: "Town", Icon: Hammer },
  { id: "account", label: "Account", Icon: Crown },
  { id: "dailies", label: "Missions", Icon: Star },
  { id: "achievements", label: "Awards", Icon: Trophy },
  { id: "reincarnation", label: "Reincarnation", Icon: Sparkles },
  { id: "settings", label: "Save", Icon: Settings }
];

const mobilePrimaryTabs: TabId[] = ["expeditions", "hero", "inventory", "forge"];
const mobileSecondaryTabs: TabId[] = tabs.map((tab) => tab.id).filter((id) => !mobilePrimaryTabs.includes(id)) as TabId[];

const EXPEDITION_SUBVIEWS = [
  { id: "routes", label: "Routes" },
  { id: "caravan", label: "Caravan" }
] as const;

const HERO_SUBVIEWS = [
  { id: "overview", label: "Overview" },
  { id: "class", label: "Class" },
  { id: "stats", label: "Stats" }
] as const;

const FORGE_SUBVIEWS = [
  { id: "craft", label: "Craft" },
  { id: "upgrade", label: "Upgrade" },
  { id: "advanced", label: "Advanced" }
] as const;

const REINCARNATION_SUBVIEWS = [
  { id: "overview", label: "Overview" },
  { id: "ledger", label: "Ledger" },
  { id: "upgrades", label: "Upgrades" }
] as const;

type ExpeditionSubviewId = (typeof EXPEDITION_SUBVIEWS)[number]["id"];
type HeroSubviewId = (typeof HERO_SUBVIEWS)[number]["id"];
type ForgeSubviewId = (typeof FORGE_SUBVIEWS)[number]["id"];
type ReincarnationSubviewId = (typeof REINCARNATION_SUBVIEWS)[number]["id"];

function getTabMeta(tabId: TabId) {
  return tabs.find((tab) => tab.id === tabId) ?? tabs[0];
}

const resourceLabels: Record<keyof ResourceState, string> = {
  gold: "Gold",
  fragments: "Fragments",
  renown: "Soul Marks"
};

const compactResourceLabels: Record<keyof ResourceState, string> = {
  gold: "Gold",
  fragments: "Frag",
  renown: "Soul"
};

function getResourceIcon(resource: keyof ResourceState): typeof Swords {
  switch (resource) {
    case "gold":
      return Coins;
    case "fragments":
      return Sparkles;
    case "renown":
      return Crown;
    default:
      return Gem;
  }
}

function getCaravanFocusIcon(focusId: CaravanFocusId): typeof Swords {
  switch (focusId) {
    case "xp":
      return Crown;
    case "gold":
      return Coins;
    case "fragments":
      return Sparkles;
    default:
      return Swords;
  }
}

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

const lootFocusShortLabels: Record<LootFocusId, string> = {
  any: "Any",
  weapon: "Wpn",
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

function formatRegionMaterials(resources: Partial<Record<RegionMaterialId, number>>): string {
  return (Object.keys(REGION_MATERIAL_LABELS) as RegionMaterialId[])
    .filter((key) => (resources[key] ?? 0) > 0)
    .map((key) => `${formatNumber(resources[key] ?? 0)} ${REGION_MATERIAL_LABELS[key]}`)
    .join(", ");
}

function formatConstructionCost(cost: { resources: Partial<ResourceState>; regionalMaterials: Partial<Record<RegionMaterialId, number>> }): string {
  return [formatResources(cost.resources), formatRegionMaterials(cost.regionalMaterials)].filter(Boolean).join(", ") || "Free";
}

function formatMissionReward(reward: {
  accountXp?: number;
  regionalMaterials?: Partial<Record<RegionMaterialId, number>>;
  fragments?: number;
  gold?: number;
  materials?: Partial<ResourceState>;
  focus?: number;
}): string {
  const parts = [
    (reward.accountXp ?? 0) > 0 ? `${formatNumber(reward.accountXp ?? 0)} Account XP` : null,
    reward.regionalMaterials && formatRegionMaterials(reward.regionalMaterials) ? formatRegionMaterials(reward.regionalMaterials) : null,
    (reward.fragments ?? 0) > 0 ? `${formatNumber(reward.fragments ?? 0)} Fragments` : null,
    (reward.gold ?? 0) > 0 ? `${formatNumber(reward.gold ?? 0)} Gold` : null,
    reward.materials && formatResources(reward.materials) ? formatResources(reward.materials) : null,
    (reward.focus ?? 0) > 0 ? `${formatNumber(reward.focus ?? 0)} Focus` : null
  ].filter(Boolean);
  return parts.join(", ") || "Reward pending";
}

function formatRegionDiaryReward(reward: RegionDiaryRewardDefinition): string {
  const permanentParts = [
    ...Object.values(reward.masteryXpBonus ?? {}).map((bonus) => `${formatPercent(bonus)} mastery XP`),
    ...Object.values(reward.regionalMaterialYieldBonus ?? {}).map((bonus) => `${formatPercent(bonus)} regional yield`)
  ];
  return [
    formatMissionReward({ accountXp: reward.accountXp, regionalMaterials: reward.regionalMaterials }),
    permanentParts.length > 0 ? permanentParts.join(", ") : null,
    reward.titleId ? "Title" : null,
    reward.trophyId ? "Trophy" : null
  ]
    .filter(Boolean)
    .join(" · ");
}

function formatStats(stats: Partial<Stats>): string {
  return (Object.keys(statLabels) as (keyof Stats)[])
    .filter((key) => (stats[key] ?? 0) > 0)
    .map((key) => `+${stats[key]} ${statLabels[key]}`)
    .join(", ");
}

function formatAffixPreview(item: Item, limit = 2): string {
  const visible = item.affixes.slice(0, limit).map((affix) => `${affix.name}: ${affix.description}`);
  const hiddenCount = item.affixes.length - visible.length;
  if (hiddenCount > 0) {
    visible.push(`+${hiddenCount} more`);
  }
  return visible.join(" · ");
}

function formatAffixNamePreview(item: Item, limit = 2): string {
  const visible = item.affixes.slice(0, limit).map((affix) => affix.name);
  const hiddenCount = item.affixes.length - visible.length;
  if (hiddenCount > 0) {
    visible.push(`+${hiddenCount} more`);
  }
  return visible.join(", ");
}

function formatItemTraitName(item: Item): string | null {
  return getItemTraitDefinition(item.traitId)?.name ?? null;
}

function formatItemFamilyName(item: Item): string | null {
  return getItemFamilyDefinition(item.familyId)?.name ?? null;
}

function formatSignedNumber(value: number): string {
  return `${value > 0 ? "+" : ""}${formatNumber(value)}`;
}

function getDeltaTextClass(delta: number): string {
  if (delta > 0) return "text-emerald";
  if (delta < 0) return "text-red-700";
  return "text-stone-500";
}

function getItemStatComparison(item: Item, equipped: Item | null) {
  return (Object.keys(statLabels) as (keyof Stats)[])
    .map((stat) => {
      const value = item.stats[stat] ?? 0;
      const equippedValue = equipped?.stats[stat] ?? 0;
      return {
        stat,
        value,
        delta: value - equippedValue
      };
    })
    .filter((entry) => entry.value > 0 || (equipped?.stats[entry.stat] ?? 0) > 0);
}

function getVisibleSellValue(state: GameState, item: Item): number {
  return Math.max(1, Math.floor(item.sellValue * getSellMultiplier(state)));
}

function getVisibleSalvageValue(state: GameState, item: Item): Partial<ResourceState> {
  const salvageMultiplier = getSalvageAffixMultiplier(state);
  const fragmentsMultiplier = getFragmentGainPassiveMultiplier(state) * getFragmentsAffixMultiplier(state);
  return {
    fragments: Math.floor((item.salvageValue.fragments ?? 0) * salvageMultiplier * fragmentsMultiplier)
  };
}

function getCompactRewardParts(summary: ResolveSummary): string[] {
  const parts = [`XP +${formatNumber(summary.rewards.xp)}`, `Gold +${formatNumber(summary.rewards.gold)}`];
  const fragments = summary.rewards.materials.fragments ?? 0;
  if (fragments > 0) {
    parts.push(`${resourceLabels.fragments} +${formatNumber(fragments)}`);
  }
  if (summary.progress.accountXpGained > 0) {
    parts.push(`Account XP +${formatNumber(summary.progress.accountXpGained)}`);
  }
  if (summary.progress.masteryXpGained > 0) {
    parts.push(`Route Mastery +${formatNumber(summary.progress.masteryXpGained)}`);
  }
  (Object.keys(summary.progress.regionalMaterials) as RegionMaterialId[]).forEach((materialId) => {
    const value = summary.progress.regionalMaterials[materialId] ?? 0;
    if (value > 0) {
      parts.push(`${REGION_MATERIAL_LABELS[materialId]} +${formatNumber(value)}`);
    }
  });
  if (summary.progress.collection?.pieceName) {
    parts.push(`${summary.progress.collection.collectionName}: ${summary.progress.collection.pieceName}`);
  } else if (summary.progress.collection?.pityAdvanced) {
    parts.push(`${summary.progress.collection.collectionName} pity +1`);
  }
  return parts;
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
  return <span className={`badge-surface inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}>{children}</span>;
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
  className = "",
  onClick,
  showLabel = true,
  buttonRef
}: {
  title: string;
  label: string;
  value: string;
  Icon: typeof Swords;
  className?: string;
  onClick?: () => void;
  showLabel?: boolean;
  buttonRef?: (node: HTMLButtonElement | null) => void;
}) {
  const chipClassName = `badge-surface inline-flex min-h-7 max-w-[5.4rem] shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[0.63rem] font-black leading-none ${className}`;
  if (onClick) {
    return (
      <button ref={buttonRef} type="button" className={`${chipClassName} cursor-pointer`} title={title} onClick={onClick}>
        <Icon size={12} className="shrink-0" />
        {showLabel && <span className="truncate">{label}</span>}
        <span className="shrink-0 tabular-nums">{value}</span>
      </button>
    );
  }
  return (
    <span className={chipClassName} title={title}>
      <Icon size={12} className="shrink-0" />
      {showLabel && <span className="truncate">{label}</span>}
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

function SegmentedControl({
  options,
  value,
  onChange,
  className = ""
}: {
  options: Array<{ id: string; label: string }>;
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={`grid auto-cols-fr grid-flow-col gap-1 rounded-lg border border-ink/10 bg-white/70 p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`ui-hover-surface min-h-9 rounded-md px-2 text-xs font-black transition ${value === option.id ? "bg-royal text-white shadow-card" : "text-stone-700"}`}
          onClick={() => onChange(option.id)}
          aria-current={value === option.id ? "page" : undefined}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SwipeSubviewDeck({
  panels,
  value,
  onChange,
  reducedMotion
}: {
  panels: Array<{ id: string; content: React.ReactNode }>;
  value: string;
  onChange: (id: string) => void;
  reducedMotion: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticScrollRef = useRef(false);
  const releaseProgrammaticScrollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const activePanel = panelRefs.current[value];
    if (!container || !activePanel) return;
    const targetLeft = Math.max(0, activePanel.offsetLeft);
    if (Math.abs(container.scrollLeft - targetLeft) < 1) {
      return;
    }
    programmaticScrollRef.current = true;
    container.scrollTo({
      left: targetLeft,
      behavior: reducedMotion ? "auto" : "smooth"
    });
    if (releaseProgrammaticScrollRef.current !== null) {
      clearTimeout(releaseProgrammaticScrollRef.current);
    }
    releaseProgrammaticScrollRef.current = setTimeout(() => {
      programmaticScrollRef.current = false;
    }, reducedMotion ? 0 : 280);
  }, [reducedMotion, value]);

  useEffect(() => {
    return () => {
      if (scrollEndTimerRef.current !== null) {
        clearTimeout(scrollEndTimerRef.current);
      }
      if (releaseProgrammaticScrollRef.current !== null) {
        clearTimeout(releaseProgrammaticScrollRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    if (programmaticScrollRef.current) {
      return;
    }
    if (scrollEndTimerRef.current !== null) {
      clearTimeout(scrollEndTimerRef.current);
    }
    scrollEndTimerRef.current = setTimeout(() => {
      const container = containerRef.current;
      if (!container || panels.length === 0) return;

      const scrollCenter = container.scrollLeft + container.clientWidth / 2;
      let closestId = panels[0].id;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const panel of panels) {
        const panelNode = panelRefs.current[panel.id];
        if (!panelNode) continue;
        const panelCenter = panelNode.offsetLeft + panelNode.clientWidth / 2;
        const distance = Math.abs(panelCenter - scrollCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = panel.id;
        }
      }

      if (closestId !== value) {
        onChange(closestId);
      }
    }, 120);
  };

  return (
    <div ref={containerRef} className="no-scrollbar overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1" onScroll={handleScroll}>
      <div className="flex min-w-full gap-4">
        {panels.map((panel) => (
          <div
            key={panel.id}
            ref={(node) => {
              panelRefs.current[panel.id] = node;
            }}
            className="min-w-0 w-full shrink-0 snap-start snap-always pr-3 last:pr-0"
          >
            {panel.content}
          </div>
        ))}
      </div>
    </div>
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
  const isClient = useIsClient();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isClient) {
      return;
    }
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isClient]);
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
            <label htmlFor="hero-name-input" className="text-xs font-bold uppercase text-stone-500">
              Hero Name
            </label>
            <input
              id="hero-name-input"
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
  type HeaderChipId = "gold" | "renown" | "focus";

  const isClient = useIsClient();
  const stats = getDerivedStats(state);
  const soulMarksVisible = state.soulMarks.discovered;
  const [openChip, setOpenChip] = useState<HeaderChipId | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ left: number; top: number } | null>(null);
  const chipPopoverRef = useRef<HTMLDivElement | null>(null);
  const popoverCardRef = useRef<HTMLDivElement | null>(null);
  const chipButtonRefs = useRef<Record<HeaderChipId, HTMLButtonElement | null>>({
    gold: null,
    renown: null,
    focus: null
  });
  const POPOVER_WIDTH = 176;
  const updatePopoverPosition = (chip: HeaderChipId) => {
    const button = chipButtonRefs.current[chip];
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const viewportWidth = isClient ? window.innerWidth : POPOVER_WIDTH + 16;
    const left = Math.max(8, Math.min(rect.left, viewportWidth - POPOVER_WIDTH - 8));
    const top = rect.bottom + 6;
    setPopoverPosition({ left, top });
  };
  const toggleChip = (chip: HeaderChipId) => {
    setOpenChip((active) => (active === chip ? null : chip));
  };

  useEffect(() => {
    if (!openChip) {
      setPopoverPosition(null);
      return;
    }
    if (!isClient) {
      return;
    }
    updatePopoverPosition(openChip);
    const handleViewportChange = () => {
      if (openChip) {
        updatePopoverPosition(openChip);
      }
    };
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isClient, openChip]);

  useEffect(() => {
    if (!openChip) return;
    if (!isClient) return;
    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (chipPopoverRef.current?.contains(target) || popoverCardRef.current?.contains(target)) {
        return;
      }
      setOpenChip(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenChip(null);
      }
    };
    window.addEventListener("pointerdown", closeOnOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isClient, openChip]);

  const popoverTitleByChip: Record<HeaderChipId, string> = {
    gold: resourceLabels.gold,
    renown: resourceLabels.renown,
    focus: "Focus"
  };
  const popoverRowsByChip: Record<HeaderChipId, Array<{ label: string; value: string }>> = {
    gold: [{ label: resourceLabels.gold, value: formatNumber(state.resources.gold) }],
    renown: [{ label: resourceLabels.renown, value: formatNumber(state.resources.renown) }],
    focus: [
      { label: "Current", value: formatNumber(state.focus.current) },
      { label: "Cap", value: formatNumber(state.focus.cap) }
    ]
  };

  return (
    <header className="sticky top-0 z-30 border-b border-amber-950/10 bg-parchment/95 px-4 py-3 backdrop-blur">
      <div className="no-scrollbar mx-auto flex min-w-0 max-w-7xl items-center gap-1 overflow-x-auto pb-1">
        <Pill className="shrink-0 border-emerald/20 bg-emerald-50 text-emerald">
          P {formatNumber(stats.powerScore)}
        </Pill>
        <div ref={chipPopoverRef} className="flex items-center gap-1">
          <div className="relative">
            <ResourceChip
              title={`${resourceLabels.gold} ${formatNumber(state.resources.gold)}`}
              label={compactResourceLabels.gold}
              value={formatNumber(state.resources.gold)}
              Icon={getResourceIcon("gold")}
              showLabel={false}
              className={`max-w-[5rem] border-stone-200 bg-white text-stone-700 ${openChip === "gold" ? "ring-2 ring-royal/20" : ""}`}
              onClick={() => toggleChip("gold")}
              buttonRef={(node) => {
                chipButtonRefs.current.gold = node;
              }}
            />
          </div>
          {soulMarksVisible && (
            <div className="relative">
              <ResourceChip
                title={`${resourceLabels.renown} ${formatNumber(state.resources.renown)}`}
                label={compactResourceLabels.renown}
                value={formatNumber(state.resources.renown)}
                Icon={getResourceIcon("renown")}
                showLabel={false}
                className={`max-w-[5rem] border-stone-200 bg-white text-stone-700 ${openChip === "renown" ? "ring-2 ring-royal/20" : ""}`}
                onClick={() => toggleChip("renown")}
                buttonRef={(node) => {
                  chipButtonRefs.current.renown = node;
                }}
              />
            </div>
          )}
          <div className="relative">
            <ResourceChip
              title={`Focus ${state.focus.current}/${state.focus.cap}`}
              label="Focus"
              value={`${state.focus.current}/${state.focus.cap}`}
              Icon={Flame}
              showLabel={false}
              className={`max-w-[6rem] border-royal/20 bg-blue-50 text-royal ${openChip === "focus" ? "ring-2 ring-royal/20" : ""}`}
              onClick={() => toggleChip("focus")}
              buttonRef={(node) => {
                chipButtonRefs.current.focus = node;
              }}
            />
          </div>
        </div>
      </div>
      {openChip && popoverPosition && (
        <div
          ref={popoverCardRef}
          className={`fixed z-50 rounded-lg border border-ink/15 bg-white p-2 shadow-card ${openChip === "focus" ? "w-56" : "w-44"}`}
          style={{ left: `${popoverPosition.left}px`, top: `${popoverPosition.top}px` }}
        >
          <p className="px-1 pb-1 text-[0.65rem] font-black uppercase tracking-wide text-stone-500">{popoverTitleByChip[openChip]}</p>
          <div className="space-y-1">
            {popoverRowsByChip[openChip].map((row) => (
              <div key={`${openChip}-${row.label}`} className="flex items-center justify-between rounded-md border border-stone-200 bg-stone-100 px-2 py-1 text-xs font-bold text-stone-700">
                <span>{row.label}</span>
                <span className="tabular-nums text-ink">{row.value}</span>
              </div>
            ))}
          </div>
          {openChip === "focus" && (
            <p className="mt-1.5 rounded-md border border-stone-200 bg-stone-100 px-2 py-1 text-[0.65rem] font-semibold leading-snug text-stone-600">
              Focus regenerates +1 every {formatMs(FOCUS_REGEN_INTERVAL_MS)} up to {state.focus.cap}. Boosting doubles expedition rewards.
            </p>
          )}
        </div>
      )}
    </header>
  );
}

function getMessageFeedback(message: string, isError: boolean) {
  if (isError) {
    return {
      Icon: XCircle,
      title: "Guild Notice",
      flavor: "The scribe needs this fixed before the next order can resolve.",
      className: "border-red-400/70 text-red-200",
      iconClassName: "text-red-300"
    };
  }

  if (/upgraded to level|Building upgraded/i.test(message)) {
    return {
      Icon: Hammer,
      title: "Town Upgrade",
      flavor: "Fresh beams, sharper tools, and better numbers for the next run.",
      className: "border-amber-400/70 text-amber-100",
      iconClassName: "text-amber-300"
    };
  }

  if (/crafted|rerolled|upgraded to \+/i.test(message)) {
    return {
      Icon: Flame,
      title: "Forge Work",
      flavor: "The anvil cools while the new stats settle into the ledger.",
      className: "border-blue-400/60 text-blue-100",
      iconClassName: "text-royal"
    };
  }

  if (/equipped/i.test(message)) {
    return {
      Icon: Backpack,
      title: "Gear Ready",
      flavor: "The kit is strapped in and the next contract gets a cleaner start.",
      className: "border-emerald-400/60 text-emerald-100",
      iconClassName: "text-emerald"
    };
  }

  if (/sold|gold/i.test(message)) {
    return {
      Icon: Coins,
      title: "Market Ledger",
      flavor: "Coin hits the chest and the pack gets a little lighter.",
      className: "border-amber-400/70 text-amber-100",
      iconClassName: "text-amber-300"
    };
  }

  if (/salvaged|materials/i.test(message)) {
    return {
      Icon: Pickaxe,
      title: "Salvage Sorted",
      flavor: "Useful pieces go back to the Forge pile.",
      className: "border-emerald-400/60 text-emerald-100",
      iconClassName: "text-emerald"
    };
  }

  if (/Loot focus/i.test(message)) {
    return {
      Icon: Gem,
      title: "Loot Focus",
      flavor: "Future expedition drops now lean toward that slot.",
      className: "border-royal/50 text-blue-100",
      iconClassName: "text-blue-300"
    };
  }

  if (/Daily Mission claimed|Daily Focus claimed|Weekly Quest claimed|Daily claimed|Contract claimed|Weekly contract/i.test(message)) {
    return {
      Icon: Star,
      title: "Mission Reward",
      flavor: "The notice board pays out before the reset bell.",
      className: "border-violet-400/70 text-violet-100",
      iconClassName: "text-violet-300"
    };
  }

  if (/Reincarnation complete|Soul Mark upgrade/i.test(message)) {
    return {
      Icon: Sparkles,
      title: "Soul Ledger",
      flavor: "Old progress folds into a faster future run.",
      className: "border-amber-400/70 text-amber-100",
      iconClassName: "text-amber-300"
    };
  }

  return {
    Icon: CheckCircle2,
    title: "Guild Update",
    flavor: "The next order is ready when you are.",
    className: "border-blue-400/60 text-blue-100",
    iconClassName: "text-royal"
  };
}

function MessagePanel({ store, suppressNonError = false }: { store: GameStore; suppressNonError?: boolean }) {
  if (suppressNonError && !store.error) return null;
  if (!store.error && !store.lastMessage) return null;
  const message = store.error ?? store.lastMessage ?? "";
  const feedback = getMessageFeedback(message, Boolean(store.error));
  const Icon = feedback.Icon;

  useEffect(() => {
    const timeoutMs = store.error ? 6500 : 3200;
    const timeoutId = setTimeout(() => {
      store.clearNotice();
    }, timeoutMs);
    return () => clearTimeout(timeoutId);
  }, [store.error, store.lastMessage, store.clearNotice]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] z-50 flex justify-center px-3 lg:bottom-4 lg:justify-end lg:px-4">
      <button
        className={`feedback-pop pointer-events-auto w-full max-w-md rounded-lg border bg-slate-950 px-3 py-2 text-left shadow-card transition ${feedback.className}`}
        onClick={store.clearNotice}
      >
        <div className="flex items-start gap-2">
          <Icon size={15} className={`mt-0.5 shrink-0 ${feedback.iconClassName}`} />
          <div className="min-w-0">
            <p className="text-[0.68rem] font-black uppercase">{feedback.title}</p>
            <p className="line-clamp-2 text-xs font-bold">{message}</p>
          </div>
        </div>
      </button>
    </div>
  );
}

function OfflineSummaryPanel({
  store,
  onSelectTab
}: {
  store: GameStore;
  onSelectTab: (tab: TabId) => void;
}) {
  const summary = store.lastOfflineSummary;

  if (!summary) return null;

  const hasMineGains = (summary.mineGains.fragments ?? 0) > 0;
  const caravanFocus = summary.caravan ? CARAVAN_FOCUS_DEFINITIONS.find((focus) => focus.id === summary.caravan?.focusId) : null;
  const offlineActiveDungeon = store.state.activeExpedition ? getDungeon(store.state.activeExpedition.dungeonId) : null;
  const expeditionStatusText = summary.expedition
    ? `${summary.expedition.dungeon.name} ${summary.expedition.success ? "cleared" : "failed"}`
    : summary.expeditionReady && offlineActiveDungeon
      ? `${offlineActiveDungeon.name} ready to claim`
      : "No expedition resolved";
  const capped = (store.lastMessage ?? "").includes("Offline gains were capped at 8 hours.");
  const dismissSummary = () => {
    store.dismissOfflineSummary();
  };
  const runSummaryAction = (action: () => void) => {
    action();
    dismissSummary();
  };

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
        <div className="overflow-hidden rounded-md border border-ink/10 bg-white/70 text-xs font-semibold text-stone-700">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 px-2.5 py-1.5">
            <span className="font-black text-ink">Expedition</span>
            <span className="truncate">{expeditionStatusText}</span>
          </div>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-t border-ink/10 px-2.5 py-1.5">
            <span className="font-black text-ink">Caravan</span>
            <span className="truncate">
              {summary.caravan
                ? `${caravanFocus?.label ?? "Focus"} ${summary.caravan.completed ? "completed" : "progress"}: ${formatCaravanRewardText(summary.caravan.rewards)}${
                    (summary.caravan.masteryXpGained ?? 0) > 0 ? ` · +${summary.caravan.masteryXpGained} Mastery XP` : ""
                  }`
                : "No active job"}
            </span>
          </div>
          {summary.construction && (
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-t border-ink/10 px-2.5 py-1.5">
              <span className="font-black text-ink">Construction</span>
              <span className="truncate">Level {summary.construction.targetLevel} ready to claim</span>
            </div>
          )}
          {hasMineGains && (
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-t border-ink/10 px-2.5 py-1.5">
              <span className="font-black text-ink">Mine gains</span>
              <span className="truncate">{formatResources(summary.mineGains)}</span>
            </div>
          )}
          {summary.caravan && summary.caravan.levelUps.length > 0 && (
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-t border-ink/10 px-2.5 py-1.5">
              <span className="font-black text-ink">Level ups</span>
              <span className="truncate">{summary.caravan.levelUps.map((level) => `Lv${level}`).join(", ")}</span>
            </div>
          )}
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-t border-ink/10 px-2.5 py-1.5">
            <span className="font-black text-ink">Focus</span>
            <span>+{summary.focusGained}</span>
          </div>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-t border-ink/10 px-2.5 py-1.5">
            <span className="font-black text-ink">Missions</span>
            <span>{summary.dailyReset ? "Reset while offline" : "No reset during offline time"}</span>
          </div>
        </div>
        <p className="text-xs font-semibold text-stone-600">
          Away for {formatMs(summary.elapsedMs)}. Offline progress is always capped at {formatMs(OFFLINE_CAP_MS)}.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(summary.expedition || summary.expeditionReady) && (
            <SecondaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => runSummaryAction(() => onSelectTab("expeditions"))}>
              <Swords size={15} /> Open Expedition
            </SecondaryButton>
          )}
          <SecondaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => runSummaryAction(() => onSelectTab("dailies"))}>
            <Star size={15} /> Open Missions
          </SecondaryButton>
          {summary.construction && (
            <SecondaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => runSummaryAction(() => onSelectTab("town"))}>
              <Hammer size={15} /> Open Town
            </SecondaryButton>
          )}
          <SecondaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={dismissSummary}>
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

type OnboardingStepId =
  | "start_first_expedition"
  | "claim_first_reward"
  | "inspect_or_upgrade_hero"
  | "start_next_expedition"
  | "complete";

function getRecommendedDungeon(state: GameState): DungeonDefinition | null {
  const available = getAvailableDungeons(state);
  return available.find((dungeon) => !hasCleared(state, dungeon.id)) ?? available[available.length - 1] ?? null;
}

function getOnboardingStep(state: GameState): OnboardingStepId {
  const firstExpeditionResolved = state.lifetime.expeditionsSucceeded + state.lifetime.expeditionsFailed > 0;
  const hasHeroInteraction =
    Object.values(state.equipment).some(Boolean) || hasAnyItemUpgrade(state) || state.lifetime.totalItemsSold > 0 || state.lifetime.totalItemsSalvaged > 0;

  if (state.lifetime.expeditionsStarted === 0) {
    return "start_first_expedition";
  }

  if (!firstExpeditionResolved || state.activeExpedition) {
    return "claim_first_reward";
  }

  if (!hasHeroInteraction) {
    return "inspect_or_upgrade_hero";
  }

  if (state.lifetime.expeditionsStarted < 2) {
    return "start_next_expedition";
  }

  return "complete";
}

function isOnboardingFocused(state: GameState): boolean {
  if (!state.settings.heroCreated || state.settings.onboardingDismissed) {
    return false;
  }
  if (state.hero.level >= 5 || state.lifetime.expeditionsStarted >= 4 || state.lifetime.expeditionsSucceeded >= 2) {
    return false;
  }
  return getOnboardingStep(state) !== "complete";
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
  claimableMasteryTier,
  dailyReady,
  canUseForge,
  canUseTown
}: {
  state: GameState;
  summary: ResolveSummary;
  itemInInventory: boolean;
  nextDungeon: DungeonDefinition | null;
  claimableMasteryTier: MasteryTierDefinition | null;
  dailyReady: boolean;
  canUseForge: boolean;
  canUseTown: boolean;
}): string {
  if (claimableMasteryTier) {
    return `Claim ${claimableMasteryTier.label} for ${summary.dungeon.name}, then start again for more Account XP.`;
  }

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
  const claimableMasteryTier = getNextClaimableMasteryTier(state, summary.dungeon.id);
  const dailyReady =
    (state.dailyFocus.focusChargesBanked > 0 && state.dailyFocus.focusChargeProgress >= 3) ||
    state.dailies.tasks.some((task) => task.progress >= task.target && !task.claimed) ||
    (!state.weeklyQuest.questClaimed && state.weeklyQuest.steps.every((step) => step.progress >= step.target));
  const upgradeCandidates = [...state.inventory, ...((Object.values(state.equipment).filter(Boolean) as Item[]) ?? [])];
  const canUpgradeItem = upgradeCandidates.some((candidate) => candidate.upgradeLevel < 10 && canAfford(state.resources, getItemUpgradeCost(state, candidate)));
  const canUseForge = canAfford(state.resources, getCraftCost(state)) || canUpgradeItem;
  const canUseTown = BUILDINGS.some(
    (building) => state.town[building.id] < building.maxLevel && canAffordConstructionCost(state, getBuildingConstructionCost(state, building.id as BuildingId))
  );
  const nextAction = getNextActionCopy({ state, summary, itemInInventory, nextDungeon, claimableMasteryTier, dailyReady, canUseForge, canUseTown });
  const hasSpecialMoment =
    summary.firstGuaranteedWeapon ||
    summary.bossClear ||
    summary.bossFirstClear ||
    summary.levelUps.length > 0 ||
    summary.unlockedDungeons.length > 0 ||
    summary.unlockedZones.length > 0 ||
    summary.achievementsUnlocked.length > 0 ||
    summary.progress.rankUps.length > 0 ||
    summary.progress.newlyClaimableMasteryTiers.length > 0 ||
    summary.progress.titlesUnlocked.length > 0 ||
    summary.progress.trophiesUnlocked.length > 0 ||
    Boolean(summary.progress.collection?.pieceName) ||
    Boolean(summary.progress.collection?.completed) ||
    Boolean(summary.boss?.intelGained) ||
    Boolean(summary.boss?.newlyRevealedThreats.length);
  const itemSellValue = item ? getVisibleSellValue(state, item) : 0;
  const actionButtonClass = "!min-h-9 px-3 py-1 text-xs";
  const rewardParts = getCompactRewardParts(summary);
  const masteryNext = summary.progress.nextMasteryTier;
  const accountNext = summary.progress.nextAccountRank;
  const masteryProgressValue = masteryNext ? Math.min(100, (summary.progress.masteryXpAfter / masteryNext.xpRequired) * 100) : 100;
  const accountProgressValue = accountNext ? Math.min(100, (summary.progress.accountXpAfter / accountNext.xpRequired) * 100) : 100;
  const [showAllMoments, setShowAllMoments] = useState(false);
  const runResultAction = (action: () => void) => {
    action();
    store.dismissExpeditionResult();
  };

  useEffect(() => {
    setShowAllMoments(false);
  }, [summary]);

  const specialMoments: Array<{ key: string; node: React.ReactNode }> = [];
  if (summary.firstGuaranteedWeapon) {
    specialMoments.push({
      key: "first-weapon",
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">
          <Sparkles size={13} /> First weapon
        </Pill>
      )
    });
  }
  if (summary.bossClear) {
    specialMoments.push({
      key: "boss-clear",
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">
          <Crown size={13} /> Boss clear
        </Pill>
      )
    });
  }
  if (summary.bossFirstClear) {
    specialMoments.push({
      key: "boss-first-clear",
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">
          <Sparkles size={13} /> First boss clear
        </Pill>
      )
    });
  }
  if (summary.dungeon.boss && item) {
    specialMoments.push({
      key: "boss-loot",
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">
          <Gem size={13} /> Boss loot
        </Pill>
      )
    });
  }
  if (summary.boss?.intelGained) {
    specialMoments.push({
      key: `boss-intel-${summary.boss.bossId}`,
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-royal/20 bg-blue-50 text-royal">
          <Sparkles size={13} /> Boss intel +{summary.boss.intelGained}
        </Pill>
      )
    });
  }
  summary.boss?.newlyRevealedThreats.forEach((threat) => {
    specialMoments.push({
      key: `boss-threat-${threat.id}`,
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">
          <Crown size={13} /> Revealed: {threat.name}
        </Pill>
      )
    });
  });
  if (summary.progress.collection?.pieceName) {
    specialMoments.push({
      key: `collection-piece-${summary.progress.collection.pieceId}`,
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-royal/20 bg-blue-50 text-royal">
          <Gem size={13} /> Relic: {summary.progress.collection.pieceName}
        </Pill>
      )
    });
  }
  if (summary.progress.collection?.completed) {
    specialMoments.push({
      key: `collection-complete-${summary.progress.collection.collectionId}`,
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">
          <Trophy size={13} /> Set complete: {summary.progress.collection.collectionName}
        </Pill>
      )
    });
  }
  if (summary.levelUps.length > 0) {
    specialMoments.push({
      key: "level-up",
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-emerald/30 bg-emerald-100 text-emerald">
          <Sparkles size={13} /> Level up: Lv {summary.levelUps.join(", ")}
        </Pill>
      )
    });
  }
  if (summary.unlockedDungeons.length > 0) {
    specialMoments.push({
      key: "routes",
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-royal/20 bg-blue-50 text-royal">
          <Swords size={13} /> Routes +{summary.unlockedDungeons.length}
        </Pill>
      )
    });
  }
  summary.unlockedZones.forEach((zone) => {
    specialMoments.push({
      key: `zone-${zone.id}`,
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">
          <Crown size={13} /> Region unlocked: {zone.name}
        </Pill>
      )
    });
  });
  if (summary.achievementsUnlocked.length > 0) {
    specialMoments.push({
      key: "achievements",
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-violet-400 bg-violet-50 text-violet-950">
          <Star size={13} /> Achievements +{summary.achievementsUnlocked.length}
        </Pill>
      )
    });
  }
  summary.progress.rankUps.forEach((rank) => {
    specialMoments.push({
      key: `account-rank-${rank}`,
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-royal/20 bg-blue-50 text-royal">
          <Crown size={13} /> Account Rank {rank}
        </Pill>
      )
    });
  });
  summary.progress.newlyClaimableMasteryTiers.forEach((tier) => {
    specialMoments.push({
      key: `mastery-${tier.tier}`,
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-emerald/30 bg-emerald-100 text-emerald">
          <Sparkles size={13} /> {tier.label} ready
        </Pill>
      )
    });
  });
  summary.progress.titlesUnlocked.forEach((title) => {
    specialMoments.push({
      key: title.id,
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-violet-400 bg-violet-50 text-violet-950">
          <Crown size={13} /> Title: {title.name}
        </Pill>
      )
    });
  });
  summary.progress.trophiesUnlocked.forEach((trophy) => {
    specialMoments.push({
      key: trophy.id,
      node: (
        <Pill className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">
          <Trophy size={13} /> Trophy: {trophy.name}
        </Pill>
      )
    });
  });
  const visibleMomentCount = showAllMoments ? specialMoments.length : Math.min(3, specialMoments.length);
  const hiddenMomentCount = Math.max(0, specialMoments.length - visibleMomentCount);

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
            {summary.focusBoostUsed && (
              <Pill className="!px-2 !py-0.5 text-[0.68rem] border-royal/20 bg-blue-50 text-royal">
                <Flame size={13} /> Focus x{FOCUS_EXPEDITION_BOOST_MULTIPLIER.toFixed(1)}
              </Pill>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white/70 px-3 py-2">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="mt-0.5 shrink-0 text-royal" />
            <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
              {rewardParts.map((reward, index) => (
                <span key={`${reward}-${index}`} className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-black text-stone-700 sm:text-[0.82rem]">
                  {index > 0 && <span aria-hidden="true" className="text-stone-500">·</span>}
                  <span>{reward}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {summary.boss && (
          <div className="rounded-lg border border-amber-400/30 bg-parchment/70 px-3 py-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-black uppercase text-mystic">{summary.boss.title}</p>
                <p className="text-sm font-black">{summary.boss.name}</p>
              </div>
              {summary.boss.intelGained > 0 && <Pill className="border-royal/20 bg-blue-50 text-royal">Intel +{summary.boss.intelGained}</Pill>}
            </div>
            {summary.boss.failureIntelText && <p className="mt-1 text-xs font-semibold text-stone-700">{summary.boss.failureIntelText}</p>}
            {summary.boss.newlyRevealedThreats.length > 0 && (
              <p className="mt-1 text-xs font-bold text-stone-600">
                Revealed: {summary.boss.newlyRevealedThreats.map((threat) => threat.name).join(", ")}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-ink/10 bg-white/70 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black uppercase text-mystic">Route Mastery</p>
              <p className="text-xs font-black text-ink">+{formatNumber(summary.progress.masteryXpGained)}</p>
            </div>
            <div className="mt-2">
              <ProgressBar value={masteryProgressValue} />
            </div>
            <p className="mt-1 text-xs font-bold text-stone-700">
              {masteryNext
                ? `${formatNumber(summary.progress.masteryXpAfter)}/${formatNumber(masteryNext.xpRequired)} ${masteryNext.label}${masteryNext.claimable ? " claimable" : ""}`
                : "Mastered"}
            </p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-white/70 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black uppercase text-mystic">Account XP</p>
              <p className="text-xs font-black text-ink">+{formatNumber(summary.progress.accountXpGained)}</p>
            </div>
            <div className="mt-2">
              <ProgressBar value={accountProgressValue} />
            </div>
            <p className="mt-1 text-xs font-bold text-stone-700">
              Rank {summary.progress.accountRankAfter}
              {accountNext ? ` · ${formatNumber(summary.progress.accountXpAfter)}/${formatNumber(accountNext.xpRequired)} to Rank ${accountNext.rank}` : " · Max seed rank"}
            </p>
          </div>
        </div>

        {hasSpecialMoment && (
          <div className="flex flex-wrap gap-1.5">
            {specialMoments.slice(0, visibleMomentCount).map((moment) => (
              <span key={moment.key}>{moment.node}</span>
            ))}
            {hiddenMomentCount > 0 && (
              <SecondaryButton className="!min-h-7 px-2 py-0.5 text-[0.68rem]" onClick={() => setShowAllMoments(true)}>
                More +{hiddenMomentCount}
              </SecondaryButton>
            )}
            {showAllMoments && specialMoments.length > 3 && (
              <SecondaryButton className="!min-h-7 px-2 py-0.5 text-[0.68rem]" onClick={() => setShowAllMoments(false)}>
                Less
              </SecondaryButton>
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
            {claimableMasteryTier && (
              <PrimaryButton className={actionButtonClass} onClick={() => store.claimMasteryTier(summary.dungeon.id)}>
                <Sparkles size={16} /> Claim {claimableMasteryTier.label}
              </PrimaryButton>
            )}
            {comparison?.isBetter && itemInInventory && item && (
              <PrimaryButton className={actionButtonClass} onClick={() => runResultAction(() => store.equipItem(item.id))}>
                <Backpack size={16} /> Equip Item
              </PrimaryButton>
            )}
            {itemInInventory && item && !comparison?.isBetter && (
              <SecondaryButton className={actionButtonClass} onClick={() => runResultAction(() => store.equipItem(item.id))}>
                <Backpack size={16} /> Equip
              </SecondaryButton>
            )}
            {itemInInventory && item && (
              <SecondaryButton className={`${actionButtonClass} sm:hidden`} onClick={() => runResultAction(() => store.sellItem(item.id))}>
                <Coins size={16} /> Sell {formatNumber(itemSellValue)}
              </SecondaryButton>
            )}
            {!state.activeExpedition && !state.caravan.activeJob && isDungeonUnlocked(state, summary.dungeon) && (
              <SecondaryButton className={actionButtonClass} onClick={() => runResultAction(() => store.startExpedition(summary.dungeon.id))}>
                <RotateCcw size={16} /> Start Again
              </SecondaryButton>
            )}
            {nextDungeon && nextDungeon.id !== summary.dungeon.id && !state.activeExpedition && !state.caravan.activeJob && (
              <SecondaryButton className={actionButtonClass} onClick={() => runResultAction(() => store.startExpedition(nextDungeon.id))}>
                <Swords size={16} /> {nextDungeon.boss ? "Attempt Boss" : "Start Next"}
              </SecondaryButton>
            )}
            {dailyReady && (
              <SecondaryButton className={actionButtonClass} onClick={() => runResultAction(() => onSelectTab("dailies"))}>
                <Star size={16} /> View Missions
              </SecondaryButton>
            )}
            {canUseForge && !nextDungeon && (
              <SecondaryButton className={actionButtonClass} onClick={() => runResultAction(() => onSelectTab("forge"))}>
                <Flame size={16} /> Open Forge
              </SecondaryButton>
            )}
            {canUseTown && !nextDungeon && !canUseForge && (
              <SecondaryButton className={actionButtonClass} onClick={() => runResultAction(() => onSelectTab("town"))}>
                <Hammer size={16} /> Open Town
              </SecondaryButton>
            )}
            <SecondaryButton className={actionButtonClass} onClick={store.dismissExpeditionResult}>Dismiss</SecondaryButton>
          </div>
        </div>
      </div>
    </RewardSummary>
  );
}

function ActiveExpeditionPanel({ state, now, store }: { state: GameState; now: number; store: GameStore }) {
  if (!state.activeExpedition) {
    return null;
  }
  const dungeon = getDungeon(state.activeExpedition.dungeonId);
  const remaining = state.activeExpedition.endsAt - now;
  const total = state.activeExpedition.endsAt - state.activeExpedition.startedAt;
  const progress = Math.min(100, Math.max(0, ((now - state.activeExpedition.startedAt) / total) * 100));
  const ready = remaining <= 0;
  const focusBoostCost = getFocusBoostCost(state);
  const canUseFocusBoost = state.focus.current >= focusBoostCost;
  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-mystic">Active Expedition</p>
            <h2 className="text-[0.94rem] font-black">{dungeon.name}</h2>
            <p className="text-sm text-stone-700">{getZoneForDungeon(dungeon).name}</p>
          </div>
          <Pill className={ready ? "border-emerald bg-emerald-100 text-emerald" : "border-royal/20 bg-blue-50 text-royal"}>
            <Clock size={13} /> {ready ? "Ready" : formatMs(remaining)}
          </Pill>
        </div>
        <ProgressBar value={progress} />
        <div className="flex flex-wrap gap-1.5">
          <PrimaryButton onClick={() => store.claimExpedition()} disabled={!ready}>
            <Swords size={16} /> {ready ? "Claim Expedition" : `Returns in ${formatMs(remaining)}`}
          </PrimaryButton>
          {ready && (
            <SecondaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => store.claimExpedition({ useFocusBoost: true })} disabled={!canUseFocusBoost}>
              <Flame size={15} /> Claim x2 · Focus -{focusBoostCost}
            </SecondaryButton>
          )}
        </div>
      </div>
    </Card>
  );
}

type RegionSummary = {
  zone: ZoneDefinition;
  dungeons: DungeonDefinition[];
  availableDungeons: DungeonDefinition[];
  completedCount: number;
  unlocked: boolean;
  unlockHint: string | null;
  materialId: RegionMaterialId | null;
  materialAmount: number;
  completionPercent: number;
};

function getRegionSummaries(state: GameState, availableDungeons: DungeonDefinition[]): RegionSummary[] {
  const activeRegionIds = new Set(getActiveRegionIds(state));
  return ZONES
    .filter((zone) => activeRegionIds.has(zone.id))
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((zone) => {
      const dungeons = DUNGEONS.filter((dungeon) => dungeon.zoneId === zone.id);
      const completion = getRegionCompletionSummary(state, zone.id);
      const entryDungeon = dungeons.reduce<DungeonDefinition | null>((first, dungeon) => {
        if (!first) return dungeon;
        return dungeon.indexInZone < first.indexInZone ? dungeon : first;
      }, null);
      const unlocked = entryDungeon ? isDungeonUnlocked(state, entryDungeon) : false;
      return {
        zone,
        dungeons,
        availableDungeons: availableDungeons.filter((dungeon) => dungeon.zoneId === zone.id),
        completedCount: dungeons.filter((dungeon) => (state.dungeonClears[dungeon.id] ?? 0) > 0).length,
        unlocked,
        unlockHint: !unlocked && entryDungeon ? getUnlockText(state, entryDungeon) : null,
        materialId: completion.materialId,
        materialAmount: completion.materialAmount,
        completionPercent: completion.completionPercent
      };
    });
}

function formatRegionalSinkReward(reward: { gold?: number; fragments?: number }): string {
  return [
    (reward.gold ?? 0) > 0 ? `${formatNumber(reward.gold ?? 0)} Gold` : null,
    (reward.fragments ?? 0) > 0 ? `${formatNumber(reward.fragments ?? 0)} Fragments` : null
  ]
    .filter(Boolean)
    .join(", ");
}

function RegionCard({
  region,
  onSelect
}: {
  region: RegionSummary;
  onSelect: (regionId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(region.zone.id)}
      disabled={!region.unlocked}
      className={`w-72 shrink-0 snap-center snap-always rounded-lg border p-3 text-left transition ${
        region.unlocked
          ? "expedition-card-hover border-royal/25 bg-white/90 shadow-sm"
          : "cursor-not-allowed border-stone-200 bg-stone-100/80 opacity-85"
      }`}
      aria-label={`Region ${region.zone.name}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-black uppercase text-mystic">Region {region.zone.index}</p>
        <Pill className={region.unlocked ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-stone-300 bg-stone-200 text-stone-700"}>
          {region.unlocked ? "Unlocked" : "Locked"}
        </Pill>
      </div>
      <h3 className="mt-1 text-base font-black">{region.zone.name}</h3>
      <p className="mt-1 line-clamp-2 text-xs font-semibold text-stone-700">{region.zone.subtitle}</p>
      <p className="mt-2 text-xs font-semibold text-stone-700">
        Progress: {region.completedCount}/{region.dungeons.length} cleared
      </p>
      <div className="mt-2 grid grid-cols-2 gap-1.5 text-[0.68rem] font-black uppercase text-stone-600">
        <span className="rounded-md border border-stone-200 bg-parchment/70 px-2 py-1">{region.completionPercent}% complete</span>
        <span className="rounded-md border border-stone-200 bg-parchment/70 px-2 py-1">
          {region.materialId ? `${formatNumber(region.materialAmount)} ${REGION_MATERIAL_LABELS[region.materialId]}` : "No stockpile"}
        </span>
      </div>
      {!region.unlocked && region.unlockHint && <p className="mt-1 text-xs font-semibold text-amber-900">{region.unlockHint}</p>}
    </button>
  );
}

function RegionCarousel({
  regions,
  onSelectRegion
}: {
  regions: RegionSummary[];
  onSelectRegion: (regionId: string) => void;
}) {
  if (regions.length === 0) {
    return (
      <Card className="border-stone-200 bg-white/80">
        <p className="text-sm font-semibold text-stone-700">No regions are configured for expeditions yet.</p>
      </Card>
    );
  }

  return (
    <section className="space-y-2">
      <div className="no-scrollbar -mx-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 pb-1">
        <div className="flex min-w-max gap-3 px-[max(0.75rem,calc(50%-9rem))] pb-1">
          {regions.map((region) => (
            <RegionCard key={region.zone.id} region={region} onSelect={onSelectRegion} />
          ))}
        </div>
      </div>
    </section>
  );
}

const REGION_COMPLETION_LAYOUT = "sectioned" as "compact" | "sectioned";

function RegionCompletionPanel({ state, store, region }: { state: GameState; store: GameStore; region: RegionSummary }) {
  const completion = getRegionCompletionSummary(state, region.zone.id);
  const materialName = completion.materialId ? REGION_MATERIAL_LABELS[completion.materialId] : "Regional Material";
  const sinks = getRegionalMaterialSinks(region.zone.id);
  const collections = getVisibleRegionCollectionSummaries(state, region.zone.id);
  const diarySummary = getRegionDiarySummary(state, region.zone.id);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<"relics" | "projects" | "outpost" | "diary" | null>(null);
  const outpost = completion.outpost;
  const outpostBonus = getOutpostBonusDefinition(outpost?.selectedBonusId ?? null);
  const primaryCollection = collections[0] ?? null;
  const chaseText = primaryCollection
    ? `${primaryCollection.name} · ${primaryCollection.piecesFound}/${primaryCollection.piecesTotal} relics${
        primaryCollection.completedAt ? " · Complete" : ` · Pity ${primaryCollection.missesSincePiece}/${primaryCollection.pityThreshold}`
      }`
    : "Regional relic set reveals after the first clear.";
  const readyProjectCount = sinks.filter((sink) => (state.regionProgress.materials[sink.materialId] ?? 0) >= sink.cost).length;
  const projectSummaryText = sinks.length === 0 ? "No regional projects" : readyProjectCount > 0 ? `${readyProjectCount}/${sinks.length} ready` : `${sinks.length} projects`;
  const relicSummaryText = primaryCollection
    ? `${primaryCollection.piecesFound}/${primaryCollection.piecesTotal} relics${
        primaryCollection.completedAt ? " complete" : ` · pity ${primaryCollection.missesSincePiece}/${primaryCollection.pityThreshold}`
      }`
    : "Hidden";
  const diarySummaryText = diarySummary
    ? diarySummary.claimed
      ? "Tier 1 claimed"
      : `${diarySummary.completedTasks}/${diarySummary.totalTasks} tasks`
    : "No diary";
  const toggleDrawer = (drawer: "relics" | "projects" | "outpost" | "diary") => {
    setActiveDrawer((active) => (active === drawer ? null : drawer));
  };
  const renderCollectionDetails = () =>
    collections.length > 0 ? (
      <div className="space-y-2">
        {collections.map((collection) => {
          const pityPercent = Math.floor((Math.min(collection.missesSincePiece, collection.pityThreshold) / collection.pityThreshold) * 100);
          return (
            <div key={collection.collectionId} className="rounded-md border border-ink/10 bg-parchment/70 p-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black">{collection.name}</p>
                  <p className="text-xs font-semibold text-stone-600">
                    {collection.piecesFound}/{collection.piecesTotal} relics
                  </p>
                </div>
                <Pill className={collection.completedAt ? "border-amber-400 bg-amber-50 text-amber-900" : "border-royal/20 bg-blue-50 text-royal"}>
                  {collection.completedAt ? "Complete" : `Pity ${collection.missesSincePiece}/${collection.pityThreshold}`}
                </Pill>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {collection.pieces.map((piece) => (
                  <span
                    key={piece.id}
                    className={`rounded-md border px-2 py-1 text-[0.68rem] font-black uppercase ${
                      piece.found ? "border-royal/20 bg-blue-50 text-royal" : "border-stone-300 bg-stone-100 text-stone-600"
                    }`}
                  >
                    {piece.found ? piece.name : "Unknown relic"}
                  </span>
                ))}
              </div>
              {!collection.completedAt && (
                <div className="mt-2">
                  <ProgressBar value={pityPercent} className="bg-royal" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    ) : (
      <div className="rounded-md border border-ink/10 bg-parchment/70 p-2 text-xs font-semibold text-stone-600">
        Regional relic set reveals after the first clear.
      </div>
    );
  const renderProjectDetails = () =>
    sinks.length > 0 ? (
      <div className="grid gap-2 sm:grid-cols-2">
        {sinks.map((sink) => {
          const available = state.regionProgress.materials[sink.materialId] ?? 0;
          const affordable = available >= sink.cost;
          return (
            <div key={sink.id} className="rounded-md border border-ink/10 bg-parchment/70 p-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black">{sink.name}</p>
                  <p className="text-xs font-semibold text-stone-700">{sink.description}</p>
                </div>
                <Pill
                  className={
                    affordable
                      ? "border-royal/20 bg-blue-50 text-royal"
                      : "border-stone-300 bg-parchment/70 text-stone-600"
                  }
                >
                  {formatNumber(sink.cost)} {REGION_MATERIAL_LABELS[sink.materialId]}
                </Pill>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-stone-600">Gain {formatRegionalSinkReward(sink.reward)}</span>
                <SecondaryButton className="!min-h-8 px-2.5 py-1 text-xs" onClick={() => store.fundRegionalProject(sink.id)} disabled={!affordable}>
                  <Sparkles size={14} /> Fund
                </SecondaryButton>
              </div>
            </div>
          );
        })}
      </div>
    ) : null;
  const renderOutpostDetails = () =>
    outpost ? (
      <div className="grid gap-2 sm:grid-cols-2">
        {OUTPOST_BONUSES.map((bonus) => {
          const selected = outpost.selectedBonusId === bonus.id && outpost.level > 0;
          return (
            <div key={bonus.id} className={`rounded-md border p-2 ${selected ? "border-amber-400 bg-amber-50/80" : "border-ink/10 bg-parchment/70"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black">{bonus.name}</p>
                  <p className="text-xs font-semibold text-stone-700">{bonus.effectText}</p>
                </div>
                <SecondaryButton
                  className="!min-h-8 shrink-0 px-2.5 py-1 text-xs"
                  onClick={() => store.selectOutpostBonus(region.zone.id, bonus.id as RegionOutpostBonusId)}
                  disabled={selected}
                >
                  <Hammer size={14} /> {selected ? "Active" : "Assign"}
                </SecondaryButton>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="rounded-md border border-ink/10 bg-parchment/70 p-2 text-xs font-semibold text-stone-600">
        Defeat this region's boss to establish an Outpost.
      </div>
    );
  const renderDiaryDetails = () =>
    diarySummary ? (
      <div className="rounded-md border border-ink/10 bg-parchment/70 p-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-black">{diarySummary.name}</p>
            <p className="text-xs font-semibold text-stone-700">Reward: {formatRegionDiaryReward(diarySummary.reward)}</p>
          </div>
          <SecondaryButton
            className="!min-h-8 shrink-0 px-2.5 py-1 text-xs"
            onClick={() => store.claimRegionDiary(region.zone.id)}
            disabled={!diarySummary.readyToClaim}
          >
            <ListChecks size={14} /> {diarySummary.claimed ? "Claimed" : diarySummary.readyToClaim ? "Claim" : "In Progress"}
          </SecondaryButton>
        </div>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {diarySummary.tasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-md border px-2 py-1.5 text-xs font-semibold ${
                task.completed ? "border-emerald/30 bg-emerald-50/80 text-emerald" : "border-stone-300 bg-white/70 text-stone-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-black">{task.label}</span>
                <span className="shrink-0 font-black">
                  {Math.min(task.progress, task.target)}/{task.target}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="rounded-md border border-ink/10 bg-parchment/70 p-2 text-xs font-semibold text-stone-600">
        No region diary is available for this region yet.
      </div>
    );

  return (
    <Card className="surface-card-elevated border-royal/20">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-mystic">Region Completion</p>
            <h3 className="truncate text-base font-black">{region.zone.name}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Pill className="border-royal/20 bg-blue-50 text-royal">{completion.completionPercent}%</Pill>
            {REGION_COMPLETION_LAYOUT === "compact" && (
              <SecondaryButton className="!min-h-8 px-2.5 py-1 text-xs" onClick={() => setDetailsOpen((open) => !open)}>
                <MoreHorizontal size={14} /> {detailsOpen ? "Hide" : "Details"}
              </SecondaryButton>
            )}
          </div>
        </div>
        <ProgressBar value={completion.completionPercent} className="bg-emerald" />
        <div className="flex flex-wrap gap-1.5 text-[0.68rem] font-black uppercase text-stone-600">
          <span className="rounded-md border border-ink/10 bg-parchment/70 px-2 py-1">
            Routes {completion.routesCleared}/{completion.routesTotal}
          </span>
          <span className="rounded-md border border-ink/10 bg-parchment/70 px-2 py-1">
            Mastery {completion.masteryTiersClaimed}/{completion.masteryTiersTotal}
          </span>
          <span className="rounded-md border border-ink/10 bg-parchment/70 px-2 py-1">
            {materialName} {formatNumber(completion.materialAmount)}
          </span>
        </div>
        {REGION_COMPLETION_LAYOUT === "compact" && (
          <div className="rounded-md border border-ink/10 bg-parchment/70 px-2 py-1.5">
            <p className="text-[0.68rem] font-black uppercase text-mystic">Current chase</p>
            <p className="truncate text-xs font-semibold text-stone-700">{chaseText}</p>
          </div>
        )}
        {REGION_COMPLETION_LAYOUT === "compact" && detailsOpen && (
          <div className="space-y-2">
            {renderCollectionDetails()}
            {renderProjectDetails()}
          </div>
        )}
        {REGION_COMPLETION_LAYOUT === "sectioned" && (
          <div className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-md border border-ink/10 bg-parchment/70 p-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-black">Relics</p>
                    <p className="truncate text-xs font-semibold text-stone-600">{relicSummaryText}</p>
                  </div>
                  <SecondaryButton className="!min-h-8 shrink-0 px-2.5 py-1 text-xs" onClick={() => toggleDrawer("relics")}>
                    <Gem size={14} /> {activeDrawer === "relics" ? "Hide" : "Open"}
                  </SecondaryButton>
                </div>
              </div>
              <div className="rounded-md border border-ink/10 bg-parchment/70 p-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-black">Projects</p>
                    <p className="truncate text-xs font-semibold text-stone-600">{projectSummaryText}</p>
                  </div>
                  <SecondaryButton className="!min-h-8 shrink-0 px-2.5 py-1 text-xs" onClick={() => toggleDrawer("projects")} disabled={sinks.length === 0}>
                    <Hammer size={14} /> {activeDrawer === "projects" ? "Hide" : "Open"}
                  </SecondaryButton>
                </div>
              </div>
              <div className="rounded-md border border-ink/10 bg-parchment/70 p-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-black">Outpost</p>
                    <p className="truncate text-xs font-semibold text-stone-600">{outpostBonus ? outpostBonus.name : outpost ? "Choose bonus" : "Locked"}</p>
                  </div>
                  <SecondaryButton className="!min-h-8 shrink-0 px-2.5 py-1 text-xs" onClick={() => toggleDrawer("outpost")} disabled={!outpost}>
                    <Crown size={14} /> {activeDrawer === "outpost" ? "Hide" : "Open"}
                  </SecondaryButton>
                </div>
              </div>
              <div className="rounded-md border border-ink/10 bg-parchment/70 p-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-black">Diary</p>
                    <p className="truncate text-xs font-semibold text-stone-600">{diarySummaryText}</p>
                  </div>
                  <SecondaryButton className="!min-h-8 shrink-0 px-2.5 py-1 text-xs" onClick={() => toggleDrawer("diary")} disabled={!diarySummary}>
                    <ListChecks size={14} /> {activeDrawer === "diary" ? "Hide" : "Open"}
                  </SecondaryButton>
                </div>
              </div>
            </div>
            {activeDrawer === "relics" && renderCollectionDetails()}
            {activeDrawer === "projects" && renderProjectDetails()}
            {activeDrawer === "outpost" && renderOutpostDetails()}
            {activeDrawer === "diary" && renderDiaryDetails()}
          </div>
        )}
      </div>
    </Card>
  );
}

function RegionExpeditionsView({
  state,
  store,
  region,
  onBack
}: {
  state: GameState;
  store: GameStore;
  region: RegionSummary;
  onBack: () => void;
}) {
  return (
    <section className="space-y-3">
      <Card className="border-royal/20 bg-blue-50/70">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black sm:text-base">{region.zone.name}</h3>
            <p className="text-xs font-semibold text-stone-600">
              {region.completedCount}/{region.dungeons.length}
            </p>
          </div>
          <SecondaryButton className="!min-h-8 shrink-0 px-2.5 py-1 text-xs" onClick={onBack}>
            <ArrowLeft size={14} /> Regions
          </SecondaryButton>
        </div>
      </Card>

      <RegionCompletionPanel state={state} store={store} region={region} />

      {region.availableDungeons.length > 0 ? (
        <div className="no-scrollbar -mx-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 pb-1">
          <div className="flex min-w-max gap-3 px-[max(0.75rem,calc(50%-9rem))] pb-1">
            {region.availableDungeons.map((dungeon) => (
              <div key={dungeon.id} className="w-72 shrink-0 snap-center snap-always">
                <DungeonCard state={state} dungeon={dungeon} store={store} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-stone-200 bg-white/80">
          <p className="text-sm font-semibold text-stone-700">No expeditions are currently available in this region.</p>
          {region.unlockHint && <p className="mt-1 text-xs font-semibold text-stone-600">{region.unlockHint}</p>}
        </Card>
      )}
    </section>
  );
}

function BossPrepPanel({
  state,
  dungeon,
  store,
  bossView
}: {
  state: GameState;
  dungeon: DungeonDefinition;
  store: GameStore;
  bossView: NonNullable<ReturnType<typeof getBossViewSummary>>;
}) {
  const revealedCount = bossView.statuses.filter((status) => status.revealed).length;
  const allRevealed = revealedCount >= bossView.statuses.length;
  const materialId = getRegionMaterialId(bossView.boss.regionId);
  const materialName = materialId ? REGION_MATERIAL_LABELS[materialId] : "Material";
  const materialAmount = materialId ? state.regionProgress.materials[materialId] ?? 0 : 0;
  const scoutCost = getBossScoutCost(state, bossView.boss);

  return (
    <div className="rounded-md border border-amber-400/40 bg-parchment/70 p-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase text-mystic">{bossView.boss.title}</p>
          <p className="text-sm font-black">{bossView.boss.name}</p>
          <p className="text-xs font-semibold text-stone-700">{bossView.boss.fantasy}</p>
        </div>
        <SecondaryButton
          className="!min-h-8 px-2.5 py-1 text-xs"
          onClick={() => store.scoutBoss(dungeon.id)}
          disabled={allRevealed || state.focus.current < scoutCost}
        >
          <Flame size={14} /> Scout -{scoutCost}
        </SecondaryButton>
      </div>
      <div className="mt-2 grid gap-1.5">
        {bossView.statuses.map((status) => {
          const prepMaterialCost = getBossPrepMaterialCost(state, bossView.boss, status.threat);
          const canPrep =
            status.revealed &&
            state.focus.current >= bossView.boss.prepFocusCost &&
            materialAmount >= prepMaterialCost;
          const impactCopy =
            status.successImpact === "covered" ? "Covered" : status.successImpact === "partial" ? "Partial" : status.threat.critical ? "Capped" : "Penalty";
          return (
            <div key={status.threat.id} className="rounded-md border border-ink/10 bg-parchment/80 p-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-black">
                    {status.revealed ? status.threat.name : "Unknown threat"}
                    {status.threat.critical && status.revealed ? " · Critical" : ""}
                  </p>
                  <p className="text-xs font-semibold text-stone-600">
                    {status.revealed
                      ? `${impactCopy} · answer: ${status.threat.traitAnswerName} · prep ${status.prepCharges}`
                      : "Scout to reveal this boss threat."}
                  </p>
                </div>
                {status.revealed && (
                  <SecondaryButton
                    className="!min-h-8 shrink-0 px-2.5 py-1 text-xs"
                    onClick={() => store.prepareBossThreat(dungeon.id, status.threat.id)}
                    disabled={!canPrep}
                  >
                    <Hammer size={14} /> Prep
                  </SecondaryButton>
                )}
              </div>
              {status.revealed && (
                <p className="mt-1 text-[0.68rem] font-semibold text-stone-600">
                  {status.threat.prepName}: {bossView.boss.prepFocusCost} Focus, {status.threat.prepMaterialCost} {materialName}
                  {prepMaterialCost !== status.threat.prepMaterialCost ? ` (${prepMaterialCost} after resonance)` : ""}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[0.68rem] font-bold uppercase text-stone-600">
        Intel {bossView.prepState.intel} · Attempts {bossView.prepState.attempts}
      </p>
    </div>
  );
}

function DungeonCard({
  state,
  dungeon,
  store
}: {
  state: GameState;
  dungeon: DungeonDefinition;
  store: GameStore;
}) {
  const view = getDungeonView(state, dungeon);
  const progressReward = EXPEDITION_PROGRESS_REWARDS[dungeon.id];
  const mastery = getMasteryProgress(state, dungeon.id);
  const bossView = getBossViewSummary(state, dungeon, view.successChance);
  return (
    <Card className={`dungeon-card-hover ${dungeon.boss ? "dungeon-card-hover--boss border-amber-400/60" : ""}`}>
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
        {progressReward && (
          <p className="text-xs font-bold text-stone-600">
            Permanent: +{formatNumber(progressReward.successMasteryXp)} Mastery, +{formatNumber(progressReward.successAccountXp)} Account XP
            {progressReward.successRegionalMaterial
              ? `, +${formatNumber(progressReward.successRegionalMaterial.amount)} ${REGION_MATERIAL_LABELS[progressReward.successRegionalMaterial.id]}`
              : ""}
          </p>
        )}
        {mastery.nextTier && (
          <p className="text-xs font-bold text-stone-600">
            Mastery: {formatNumber(mastery.masteryXp)}/{formatNumber(mastery.nextTier.xpRequired)} {mastery.nextTier.label}
            {mastery.nextTier.claimable ? " ready" : ""}
          </p>
        )}
        {bossView && <BossPrepPanel state={state} dungeon={dungeon} store={store} bossView={bossView} />}
        {view.unlocked ? (
          <div className="grid gap-1.5 sm:grid-cols-2">
            <SecondaryButton className="w-full" onClick={() => store.equipBestForContext({ dungeonId: dungeon.id })}>
              <Backpack size={16} /> Equip Best
            </SecondaryButton>
            <PrimaryButton onClick={() => store.startExpedition(dungeon.id)} disabled={Boolean(state.activeExpedition) || Boolean(state.caravan.activeJob)}>
              <Swords size={16} /> {dungeon.boss ? "Attempt Boss" : "Start"}
            </PrimaryButton>
          </div>
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
          <h2 className="text-[0.98rem] font-black">{getNextGoal(state)}</h2>
          {boss && (
            <p className="mt-1 text-sm font-semibold text-stone-700">
              Boss milestone: {boss.name} · {bossReady ? "Ready now" : getUnlockText(state, boss)}
            </p>
          )}
        </div>
        <div className="grid w-full grid-cols-6 gap-1">
          {steps.map(({ label, done, Icon }) => (
            <Pill key={label} className={`justify-center !gap-0.5 !px-1 !py-0.5 text-[0.6rem] ${done ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-stone-200 bg-white text-stone-700"}`}>
              {done ? <CheckCircle2 size={10} /> : <Icon size={10} />}
              {label}
            </Pill>
          ))}
        </div>
      </div>
    </Card>
  );
}

function OnboardingGuide({
  state,
  now,
  store,
  onSelectTab
}: {
  state: GameState;
  now: number;
  store: GameStore;
  onSelectTab: (tab: TabId) => void;
}) {
  const step = getOnboardingStep(state);
  const recommendedDungeon = getRecommendedDungeon(state);
  const firstExpeditionResolved = state.lifetime.expeditionsSucceeded + state.lifetime.expeditionsFailed > 0;
  const hasHeroInteraction =
    Object.values(state.equipment).some(Boolean) || hasAnyItemUpgrade(state) || state.lifetime.totalItemsSold > 0 || state.lifetime.totalItemsSalvaged > 0;
  const startedSecondExpedition = state.lifetime.expeditionsStarted > 1;
  const upgradeCandidates = [...state.inventory, ...(Object.values(state.equipment).filter(Boolean) as Item[])];
  const canAffordEarlyUpgrade = upgradeCandidates.some((item) => item.upgradeLevel < 10 && canAfford(state.resources, getItemUpgradeCost(state, item)));

  let headline = "Start your first expedition.";
  let detail = "Click once, then wait for the contract to return.";
  let action: React.ReactNode = null;

  if (step === "start_first_expedition") {
    headline = "Start your first expedition.";
    detail = `Run one quick contract${recommendedDungeon ? ` (${recommendedDungeon.name})` : ""} to unlock your first reward moment.`;
    action = (
      <PrimaryButton onClick={() => recommendedDungeon && store.startExpedition(recommendedDungeon.id)} disabled={!recommendedDungeon || Boolean(state.caravan.activeJob)}>
        <Swords size={16} /> Start First Expedition
      </PrimaryButton>
    );
  } else if (step === "claim_first_reward") {
    const remaining = state.activeExpedition ? state.activeExpedition.endsAt - now : 0;
    const ready = remaining <= 0;
    headline = "Claim your first reward.";
    detail = ready ? "Rewards are ready now. Claim to reveal loot and unlock the next step." : "Wait for the timer, then claim immediately.";
    action = state.activeExpedition ? (
      <PrimaryButton onClick={() => store.claimExpedition()} disabled={!ready}>
        <Sparkles size={16} /> {ready ? "Claim First Reward" : `Returns in ${formatMs(remaining)}`}
      </PrimaryButton>
    ) : (
      <PrimaryButton onClick={() => recommendedDungeon && store.startExpedition(recommendedDungeon.id)} disabled={!recommendedDungeon || Boolean(state.caravan.activeJob)}>
        <Swords size={16} /> Start Expedition
      </PrimaryButton>
    );
  } else if (step === "inspect_or_upgrade_hero") {
    headline = "Inspect or upgrade your hero.";
    detail = canAffordEarlyUpgrade
      ? "You can afford a quick power bump. Upgrade one item before the next run."
      : "Open Hero to confirm class and stats, then continue.";
    action = (
      <PrimaryButton onClick={() => onSelectTab(canAffordEarlyUpgrade ? "forge" : "hero")}>
        {canAffordEarlyUpgrade ? <Flame size={16} /> : <Crown size={16} />}
        {canAffordEarlyUpgrade ? "Open Forge" : "Open Hero"}
      </PrimaryButton>
    );
  } else if (step === "start_next_expedition") {
    headline = "Start the next expedition.";
    detail = `Repeat the loop${recommendedDungeon ? ` with ${recommendedDungeon.name}` : ""} while your first gains are still fresh.`;
    action = (
      <PrimaryButton onClick={() => recommendedDungeon && store.startExpedition(recommendedDungeon.id)} disabled={!recommendedDungeon || Boolean(state.activeExpedition) || Boolean(state.caravan.activeJob)}>
        <ArrowRight size={16} /> Start Next Expedition
      </PrimaryButton>
    );
  } else {
    headline = "Onboarding complete.";
    detail = "You now have the core loop. Explore tabs at your own pace.";
    action = (
      <SecondaryButton onClick={() => onSelectTab("town")}>
        <Hammer size={16} /> Open Town
      </SecondaryButton>
    );
  }

  const checklist = [
    { label: "Start first expedition", done: state.lifetime.expeditionsStarted > 0 },
    { label: "Claim first reward", done: firstExpeditionResolved },
    { label: "Inspect or upgrade hero", done: hasHeroInteraction },
    { label: "Start next expedition", done: startedSecondExpedition }
  ];

  return (
    <Card className="border-royal/30 bg-blue-50/80">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-mystic">Guided Next Step</p>
            <h2 className="text-base font-black sm:text-lg">{headline}</h2>
            <p className="mt-1 text-sm font-semibold text-stone-700">{detail}</p>
          </div>
          <div className="shrink-0">{action}</div>
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {checklist.map((item) => (
            <div key={item.label} className={`rounded-md border px-2.5 py-1.5 text-xs font-bold ${item.done ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-stone-200 bg-white text-stone-700"}`}>
              {item.done ? "Done" : "Next"} · {item.label}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function CaravanScreen({ state, now, store }: { state: GameState; now: number; store: GameStore }) {
  const activeJob = state.caravan.activeJob;
  const unlockedRegions = getUnlockedCaravanRegions(state);
  const firstUnlockedFocus = CARAVAN_FOCUS_DEFINITIONS.find((focus) => isCaravanFocusUnlocked(state, focus.id)) ?? CARAVAN_FOCUS_DEFINITIONS[0];
  const [focusId, setFocusId] = useState<CaravanFocusId>(activeJob?.focusId ?? firstUnlockedFocus.id);
  const [regionId, setRegionId] = useState(activeJob?.regionId ?? unlockedRegions[0].id);
  const [durationHours, setDurationHours] = useState(() => {
    const activeHours = activeJob ? Math.round(activeJob.durationMs / CARAVAN_MIN_DURATION_MS) : 4;
    return Math.min(8, Math.max(1, activeHours));
  });

  useEffect(() => {
    if (!isCaravanFocusUnlocked(state, focusId)) {
      setFocusId(firstUnlockedFocus.id);
    }
  }, [firstUnlockedFocus.id, focusId, state]);

  useEffect(() => {
    if (!unlockedRegions.some((region) => region.id === regionId)) {
      setRegionId(unlockedRegions[0].id);
    }
  }, [regionId, unlockedRegions]);

  const durationMs = durationHours * CARAVAN_MIN_DURATION_MS;
  const actualDurationMs = getCaravanActualDurationMs(state, regionId, durationMs);
  const previewRewards = estimateCaravanRewardsForRegion(state, focusId, regionId, durationMs);
  const activeFocus = activeJob ? CARAVAN_FOCUS_DEFINITIONS.find((focus) => focus.id === activeJob.focusId) : null;
  const activeRegion = activeJob ? ZONES.find((zone) => zone.id === activeJob.regionId) : null;
  const masteryRegionId = activeJob?.regionId ?? regionId;
  const masterySummary = getCaravanMasterySummary(state, masteryRegionId);
  const claimableMasteryTier = masterySummary.claimableTiers[0] ?? null;
  const activeRemaining = activeJob ? Math.max(0, activeJob.endsAt - now) : 0;
  const activeReady = Boolean(activeJob && activeRemaining <= 0);
  const activeProgress = activeJob ? ((activeJob.durationMs - activeRemaining) / Math.max(1, activeJob.durationMs)) * 100 : 0;
  const endingAt = now + actualDurationMs;
  const selectedFocusId = activeJob?.focusId ?? focusId;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1.5">
        {CARAVAN_FOCUS_DEFINITIONS.map((focus) => {
          const unlocked = isCaravanFocusUnlocked(state, focus.id);
          const Icon = getCaravanFocusIcon(focus.id);
          const selected = selectedFocusId === focus.id;
          return (
            <button
              key={focus.id}
              type="button"
              disabled={!unlocked || Boolean(activeJob)}
              aria-pressed={selected}
              onClick={() => setFocusId(focus.id)}
              className={`ui-hover-surface relative min-h-14 overflow-hidden rounded-lg border bg-parchment/70 px-1.5 py-2 text-center transition ${
                selected ? "border-amber-400 bg-blue-50/80 shadow-card ring-1 ring-amber-400/50" : "border-ink/10"
              } ${!unlocked ? "cursor-not-allowed opacity-45" : activeJob && !selected ? "cursor-not-allowed opacity-55" : activeJob ? "cursor-not-allowed" : ""}`}
            >
              {selected && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500 shadow-card" aria-hidden="true" />
              )}
              <span className="flex flex-col items-center justify-center gap-1 text-[0.68rem] font-black leading-none sm:flex-row sm:text-xs">
                <Icon size={14} /> {focus.label}
              </span>
              {!unlocked && <span className="mt-1 block text-[0.58rem] font-bold leading-tight text-stone-600">Unlocks at Lv{focus.unlockLevel}</span>}
            </button>
          );
        })}
      </div>

      <Card className="border-royal/15 bg-parchment/80">
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase text-mystic">Caravan Mastery</p>
              <h3 className="font-black">{masterySummary.regionName}</h3>
              <p className="text-xs font-semibold text-stone-700">
                Tier {masterySummary.highestClaimedTier}/3 · {masterySummary.caravansSent} sent · {masterySummary.masteryXp} Mastery XP
              </p>
            </div>
            <SecondaryButton className="!min-h-8 px-2.5 py-1 text-xs" onClick={() => store.claimCaravanMastery(masteryRegionId)} disabled={!claimableMasteryTier}>
              <Star size={14} /> {claimableMasteryTier ? `Claim T${claimableMasteryTier.tier}` : "No Tier"}
            </SecondaryButton>
          </div>
          <ProgressBar value={masterySummary.progressPercent} className="bg-royal" />
          <div className="grid gap-1.5 text-xs font-semibold text-stone-700">
            {masterySummary.nextTier ? (
              <p>
                Next: <span className="font-black text-ink">T{masterySummary.nextTier.tier} {masterySummary.nextTier.label}</span> at {masterySummary.nextTier.xpRequired} XP.
              </p>
            ) : (
              <p className="font-black text-emerald">All Caravan Mastery tiers claimed.</p>
            )}
            <p>{masterySummary.activeBonusText.length > 0 ? masterySummary.activeBonusText.join(" ") : "No active mastery bonuses yet."}</p>
          </div>
        </div>
      </Card>

      {activeJob && activeFocus && (
        <Card className="border-stone-300 bg-parchment/70">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-black uppercase text-stone-600">Active Caravan</p>
              <h3 className="font-black">{activeRegion?.name ?? "Regional"} · {activeFocus.label} focus</h3>
              <p className="text-xs font-semibold text-stone-700">
                Ends at {formatLocalClock(activeJob.endsAt)} · {activeReady ? "Ready to claim" : `${formatMs(activeRemaining)} remaining`} · rewards for{" "}
                {Math.round((activeJob.rewardDurationMs ?? activeJob.durationMs) / CARAVAN_MIN_DURATION_MS)}h
              </p>
            </div>
            <ProgressBar value={activeProgress} className="bg-stone-600" />
            {activeReady && (
              <PrimaryButton className="w-full" onClick={() => store.claimCaravanJob()}>
                <CheckCircle2 size={15} /> Claim Caravan
              </PrimaryButton>
            )}
            <DangerButton className="w-full" onClick={() => store.cancelCaravanJob()}>
              <XCircle size={15} /> Cancel Caravan, no rewards
            </DangerButton>
          </div>
        </Card>
      )}

      {!activeJob && (
        <Card>
          <div className="space-y-4">
            <div>
              <h3 className="font-black">Target Region</h3>
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {unlockedRegions.map((region) => {
                  const selected = region.id === regionId;
                  const regionMastery = getCaravanMasterySummary(state, region.id);
                  return (
                    <button
                      key={region.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setRegionId(region.id)}
                      className={`ui-hover-surface min-h-11 rounded-lg border px-2 py-1.5 text-left text-xs font-black transition ${
                        selected ? "border-amber-400 bg-blue-50/80 ring-1 ring-amber-400/50" : "border-ink/10 bg-parchment/70"
                      }`}
                    >
                      <span className="block">{region.name}</span>
                      <span className="block text-[0.62rem] font-bold text-stone-600">Mastery T{regionMastery.highestClaimedTier}/3</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <h3 className="font-black">Set Away Time</h3>
            <input
              type="range"
              min={CARAVAN_MIN_DURATION_MS / CARAVAN_MIN_DURATION_MS}
              max={CARAVAN_MAX_DURATION_MS / CARAVAN_MIN_DURATION_MS}
              step={1}
              value={durationHours}
              onChange={(event) => setDurationHours(Number(event.target.value))}
              className="w-full accent-royal"
              aria-label="Caravan duration in hours"
            />
            <div className="flex justify-between text-[0.68rem] font-black uppercase text-stone-500">
              {Array.from({ length: 8 }).map((_, index) => (
                <span key={index + 1}>{index + 1}h</span>
              ))}
            </div>
            <div className="grid gap-2 rounded-lg border border-stone-300 bg-parchment/70 p-3 text-sm font-semibold text-stone-700 sm:grid-cols-2">
              <p>
                <span className="block text-[0.68rem] font-black uppercase text-stone-500">Ends</span>
                <span className="font-black text-ink">{formatLocalClock(endingAt)}</span>
                {actualDurationMs < durationMs && <span className="block text-xs font-bold text-emerald">{formatMs(actualDurationMs)} travel</span>}
              </p>
              <p>
                <span className="block text-[0.68rem] font-black uppercase text-stone-500">Expected haul</span>
                <span className="font-black text-ink">{formatCaravanRewardText(previewRewards)}</span>
              </p>
            </div>
            <PrimaryButton
              className="w-full"
              onClick={() => store.startCaravanJob(focusId, durationMs, regionId)}
              disabled={!state.settings.heroCreated || !isCaravanFocusUnlocked(state, focusId) || Boolean(state.activeExpedition)}
            >
              <Clock size={16} /> Start {durationHours}h Caravan
            </PrimaryButton>
            {state.activeExpedition && <p className="text-xs font-bold text-amber-900">Finish the active expedition before sending the Caravan offline.</p>}
          </div>
        </Card>
      )}
    </div>
  );
}

function EquippedItemsOverview({ state, store }: { state: GameState; store: GameStore }) {
  const slots = Object.keys(slotLabels) as EquipmentSlot[];
  const equippedCount = slots.filter((slot) => state.equipment[slot]).length;

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-black">Equipped Items</h3>
          <Pill className="border-stone-200 bg-stone-50 text-stone-700">
            {equippedCount}/{slots.length}
          </Pill>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {slots.map((slot) => {
            const item = state.equipment[slot];
            if (!item) {
              return (
                <div key={slot} className="min-h-24 rounded-lg border border-dashed border-stone-300 bg-parchment/70 p-2.5 text-xs font-semibold text-stone-600">
                  <p className="font-black uppercase text-stone-500">{slotLabels[slot]}</p>
                  <p className="mt-2 text-stone-600">Empty</p>
                </div>
              );
            }

            return (
              <div key={slot} className={`${rarityClass(item.rarity)} min-h-24 rounded-lg border p-2.5 text-xs`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-black uppercase text-stone-500">{slotLabels[slot]}</span>
                  <span className="font-black">P {formatNumber(getItemScore(item))}</span>
                </div>
                <p className="mt-2 line-clamp-2 font-black leading-snug">{item.name}</p>
                <p className="mt-1 line-clamp-1 font-semibold text-stone-600">{RARITY_LABEL[item.rarity]} · +{item.upgradeLevel}</p>
                {(formatItemTraitName(item) || formatItemFamilyName(item)) && (
                  <p className="mt-1 line-clamp-1 font-black text-royal">
                    {[formatItemTraitName(item), formatItemFamilyName(item)].filter(Boolean).join(" · ")}
                  </p>
                )}
                {formatAffixPreview(item, 1) && <p className="mt-1 line-clamp-1 font-semibold text-stone-600">{formatAffixPreview(item, 1)}</p>}
                <SecondaryButton className="mt-2 !min-h-7 px-2 py-0.5 text-[0.68rem]" onClick={() => store.toggleItemLock(item.id)}>
                  {item.locked ? <Unlock size={12} /> : <Lock size={12} />} {item.locked ? "Unlock" : "Lock"}
                </SecondaryButton>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function ExpeditionsScreen({
  state,
  now,
  store,
  onSelectTab,
  view,
  onViewChange,
  reducedMotion
}: {
  state: GameState;
  now: number;
  store: GameStore;
  onSelectTab: (tab: TabId) => void;
  view: ExpeditionSubviewId;
  onViewChange: (view: ExpeditionSubviewId) => void;
  reducedMotion: boolean;
}) {
  const available = getAvailableDungeons(state);
  const onboardingFocused = isOnboardingFocused(state);
  const recommendedDungeon = getRecommendedDungeon(state);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const visibleDungeons = onboardingFocused && recommendedDungeon ? [recommendedDungeon] : available;
  const regions = getRegionSummaries(state, visibleDungeons);
  const selectedRegion = selectedRegionId ? regions.find((region) => region.zone.id === selectedRegionId) ?? null : null;
  const hiddenRouteCount = onboardingFocused ? Math.max(0, available.length - visibleDungeons.length) : 0;
  const nextLockedDungeon = getNextLockedDungeon(state);
  const handleSelectRegion = (regionId: string) => {
    const region = regions.find((entry) => entry.zone.id === regionId);
    if (!region || !region.unlocked) {
      return;
    }
    setSelectedRegionId(regionId);
  };
  const handleBackToRegions = () => setSelectedRegionId(null);

  useEffect(() => {
    if (selectedRegionId && (!selectedRegion || !selectedRegion.unlocked)) {
      setSelectedRegionId(null);
    }
  }, [selectedRegionId, selectedRegion]);

  const routeContent = (
    <div className="space-y-3 sm:space-y-4">
      {onboardingFocused ? <OnboardingGuide state={state} now={now} store={store} onSelectTab={onSelectTab} /> : <FirstSessionMilestones state={state} />}

      {!onboardingFocused && <ActiveExpeditionPanel state={state} now={now} store={store} />}

      <div className="space-y-4">
        {selectedRegion ? <RegionExpeditionsView state={state} store={store} region={selectedRegion} onBack={handleBackToRegions} /> : <RegionCarousel regions={regions} onSelectRegion={handleSelectRegion} />}

        {onboardingFocused && hiddenRouteCount > 0 && (
          <Card className="border-stone-200 bg-white/80">
            <p className="text-sm font-semibold text-stone-700">
              {`${hiddenRouteCount} additional route${hiddenRouteCount > 1 ? "s are" : " is"} available and hidden for focus.`}
            </p>
            {nextLockedDungeon && <p className="mt-1 text-xs font-semibold text-stone-600">Next unlock hint: {getUnlockText(state, nextLockedDungeon)}</p>}
          </Card>
        )}
      </div>
    </div>
  );
  const expeditionPanels: Array<{ id: ExpeditionSubviewId; content: React.ReactNode }> = [
    { id: "routes", content: routeContent },
    { id: "caravan", content: <CaravanScreen state={state} now={now} store={store} /> }
  ];
  return <SwipeSubviewDeck panels={expeditionPanels} value={view} onChange={(next) => onViewChange(next as ExpeditionSubviewId)} reducedMotion={reducedMotion} />;
}

function HeroScreen({
  state,
  store,
  view,
  onViewChange,
  reducedMotion
}: {
  state: GameState;
  store: GameStore;
  view: HeroSubviewId;
  onViewChange: (view: HeroSubviewId) => void;
  reducedMotion: boolean;
}) {
  const stats = getDerivedStats(state);
  const xpToNext = xpToNextLevel(state.hero.level);
  const xpProgress = Math.min(100, (state.hero.xp / Math.max(1, xpToNext)) * 100);
  const pristineClassSelection = state.lifetime.expeditionsStarted === 0 && state.hero.level === 1;
  const rebirthUnlockedForClassChange = canPrestige(state);
  const earlyFreeClassChange = !rebirthUnlockedForClassChange && state.rebirth.totalRebirths === 0 && !state.classChange.freeChangeUsed;
  const classChangeCooldownMs = state.classChange.lastChangedAt ? Math.max(0, CLASS_CHANGE_COOLDOWN_MS - (Date.now() - state.classChange.lastChangedAt)) : 0;
  const classChangeCostPaid = state.classChange.freeChangeUsed;
  const canPayClassChange = state.resources.renown + (rebirthUnlockedForClassChange ? calculatePrestigeRenown(state) : 0) >= CLASS_CHANGE_SOUL_MARK_COST;
  const canSwitchClass =
    pristineClassSelection || earlyFreeClassChange || (rebirthUnlockedForClassChange && classChangeCooldownMs <= 0 && (!classChangeCostPaid || canPayClassChange));
  const classChangeCopy = pristineClassSelection
    ? "Initial class selection is free."
    : earlyFreeClassChange
      ? "One early free respec is available before Reincarnation unlocks."
      : rebirthUnlockedForClassChange
        ? classChangeCooldownMs > 0
          ? `Class change cooldown: ${formatMs(classChangeCooldownMs)}.`
          : classChangeCostPaid
            ? `Changing class triggers Reincarnation and costs ${CLASS_CHANGE_SOUL_MARK_COST} Soul Marks.`
            : "Changing class triggers Reincarnation. First class change is free."
        : `Unlock Reincarnation to change class again.`;
  const classChangeButtonText = pristineClassSelection ? "Choose Class" : earlyFreeClassChange ? "Use Free Respec" : rebirthUnlockedForClassChange ? "Rebirth as Class" : "Locked";
  const activeClass = HERO_CLASSES.find((entry) => entry.id === state.hero.classId) ?? HERO_CLASSES[0];
  const classPassives = CLASS_PASSIVE_TEXT[state.hero.classId];
  const heroPanels: Array<{ id: HeroSubviewId; content: React.ReactNode }> = [
    {
      id: "overview",
      content: (
        <div className="space-y-3">
          <EquippedItemsOverview state={state} store={store} />
          <Card>
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-black">Current Class</h3>
                  <p className="text-xs font-bold text-royal sm:text-sm">{activeClass.tagline}</p>
                </div>
                <Pill className="border-stone-200 bg-stone-50 text-stone-700">{activeClass.name}</Pill>
              </div>
              <p className="text-xs font-semibold text-stone-700 sm:text-sm">{activeClass.description}</p>
              <div className="grid gap-2 text-xs font-semibold text-stone-700 sm:grid-cols-2">
                {classPassives.slice(0, 2).map((passive) => (
                  <p key={passive.name} className="rounded-md border border-ink/10 bg-white/70 px-3 py-2">
                    <span className="font-black text-ink">Lv{passive.level} {passive.name}:</span> {passive.effect}
                  </p>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-stone-700 sm:grid-cols-5">
                {(Object.keys(statLabels) as (keyof Stats)[]).map((stat) => (
                  <p key={`overview-${stat}`} className="rounded-md border border-ink/10 bg-white/70 px-2.5 py-2">
                    <span className="block text-[0.65rem] font-black uppercase text-stone-500">{statLabels[stat]}</span>
                    <span className="block text-sm font-black text-ink">{formatNumber(stats[stat])}</span>
                  </p>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )
    },
    {
      id: "class",
      content: (
        <div className="space-y-3">
          <Card className="border-royal/20 bg-blue-50/70">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-stone-700">{classChangeCopy}</p>
              <Pill className={canSwitchClass ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-stone-300 bg-stone-100 text-stone-700"}>
                {canSwitchClass ? "Available" : "Unavailable"}
              </Pill>
            </div>
          </Card>
          <div className="grid gap-3 md:grid-cols-3">
            {HERO_CLASSES.map((heroClass) => (
              <Card key={heroClass.id} className={state.hero.classId === heroClass.id ? "border-royal/50 bg-blue-50" : ""}>
                <h3 className="font-black">{heroClass.name}</h3>
                <p className="text-xs font-bold text-royal sm:text-sm">{heroClass.tagline}</p>
                <p className="mt-2 text-xs font-semibold text-stone-700 sm:text-sm">{heroClass.description}</p>
                <ul className="mt-3 space-y-1 text-xs font-semibold text-stone-700">
                  {CLASS_PASSIVE_TEXT[heroClass.id].map((passive) => (
                    <li key={passive.name}>
                      Lv{passive.level} {passive.name}: {passive.effect}
                    </li>
                  ))}
                </ul>
                <SecondaryButton className="mt-3 w-full" onClick={() => store.changeClass(heroClass.id)} disabled={!canSwitchClass || state.hero.classId === heroClass.id}>
                  {state.hero.classId === heroClass.id ? "Selected" : classChangeButtonText}
                </SecondaryButton>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "stats",
      content: (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {(Object.keys(statLabels) as (keyof Stats)[]).map((stat) => (
              <Card key={stat}>
                <p className="text-xs font-bold uppercase text-stone-500">{statLabels[stat]}</p>
                <p className="text-2xl font-black">{formatNumber(stats[stat])}</p>
              </Card>
            ))}
          </div>
          <Card>
            <h3 className="font-black">Passive Track</h3>
            <ul className="mt-2 grid gap-2 text-xs font-semibold text-stone-700 sm:grid-cols-2">
              {classPassives.map((passive) => (
                <li key={`passive-${passive.name}`} className="rounded-md border border-ink/10 bg-white/70 px-3 py-2">
                  <span className="font-black text-ink">Lv{passive.level} {passive.name}:</span> {passive.effect}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )
    }
  ];
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">{state.hero.name}</h2>
            <p className="text-sm font-semibold text-stone-700">
              Level {state.hero.level} {activeClass.name}
            </p>
          </div>
          <Pill className="border-emerald/20 bg-emerald-50 text-emerald">Power {formatNumber(stats.powerScore)}</Pill>
        </div>
        <div className="mt-3 h-3 rounded-full bg-stone-200">
          <div className="h-full rounded-full bg-royal" style={{ width: `${xpProgress}%` }} />
        </div>
        <p className="mt-2 text-xs font-semibold text-stone-700 sm:text-sm">
          {formatNumber(state.hero.xp)} / {formatNumber(xpToNext)} XP to next level
        </p>
      </Card>
      <SwipeSubviewDeck panels={heroPanels} value={view} onChange={(next) => onViewChange(next as HeroSubviewId)} reducedMotion={reducedMotion} />
    </div>
  );
}

function ItemCard({ state, item, store }: { state: GameState; item: Item; store: GameStore }) {
  const equipped = state.equipment[item.slot];
  const itemScore = getItemScore(item);
  const equippedScore = getItemScore(equipped);
  const delta = itemScore - equippedScore;
  const statComparison = getItemStatComparison(item, equipped);
  const sellValue = getVisibleSellValue(state, item);
  const salvageValue = getVisibleSalvageValue(state, item);
  const salvageText = formatResources(salvageValue) || "No materials";
  const affixPreview = formatAffixNamePreview(item);
  const traitName = formatItemTraitName(item);
  const familyName = formatItemFamilyName(item);
  return (
    <GameCard density="compact" className={`${rarityClass(item.rarity)} ${isRareOrBetter(item) ? "rarity-glow" : ""}`}>
      <div className="space-y-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <RarityBadge rarity={item.rarity} />
            <span className="badge-surface rounded-full border px-2 py-0.5 text-[0.68rem] font-black uppercase text-stone-600">
              {slotLabels[item.slot]}
            </span>
          </div>
          <h3 className="mt-1 line-clamp-2 text-sm font-black leading-snug">{item.name}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-black text-stone-700 tabular-nums">
            <span>Lvl {item.itemLevel}</span>
            <span className="text-stone-400">•</span>
            <span>+{item.upgradeLevel}</span>
            <span className="text-stone-400">•</span>
            <span>
              Item Power {formatNumber(itemScore)}{" "}
              {equipped ? (
                <span className={getDeltaTextClass(delta)}>({formatSignedNumber(delta)})</span>
              ) : (
                <span className="text-emerald">(New slot)</span>
              )}
            </span>
          </p>
          {(traitName || familyName || item.locked) && (
            <div className="mt-1 flex flex-wrap gap-1">
              {traitName && <Pill className="!px-2 !py-0.5 text-[0.68rem] border-royal/20 bg-blue-50 text-royal">{traitName}</Pill>}
              {familyName && <Pill className="!px-2 !py-0.5 text-[0.68rem] border-amber-400 bg-amber-50 text-amber-900">{familyName}</Pill>}
              {item.locked && <Pill className="!px-2 !py-0.5 text-[0.68rem] border-stone-300 bg-stone-100 text-stone-700">Locked</Pill>}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-semibold text-stone-700">
          {statComparison.length > 0 ? (
            statComparison.map((entry, index) => (
              <span key={entry.stat} className="inline-flex items-center gap-x-1.5">
                {index > 0 && <span className="text-stone-400">•</span>}
                <span>
                  {formatNumber(entry.value)} {statLabels[entry.stat]}
                </span>
                {equipped && <span className={getDeltaTextClass(entry.delta)}>({formatSignedNumber(entry.delta)})</span>}
              </span>
            ))
          ) : (
            <span className="text-xs font-semibold text-stone-600">No stat roll</span>
          )}
        </div>

        <p className="line-clamp-1 text-xs font-semibold text-stone-600">Affixes: {affixPreview || "None"}</p>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-stone-700">
          <span>Sell {formatNumber(sellValue)} Gold</span>
          <span className="text-stone-400">•</span>
          <span>Salvage {salvageText}</span>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-1.5 sm:grid-cols-4">
          <PrimaryButton className="!min-h-9 px-2 py-1 text-xs" onClick={() => store.equipItem(item.id)}>
            Equip
          </PrimaryButton>
          <SecondaryButton className="!min-h-9 px-2 py-1 text-xs" onClick={() => store.toggleItemLock(item.id)}>
            {item.locked ? <Unlock size={14} /> : <Lock size={14} />} {item.locked ? "Unlock" : "Lock"}
          </SecondaryButton>
          <SecondaryButton className="!min-h-9 px-2 py-1 text-xs" onClick={() => store.sellItem(item.id)} disabled={item.locked}>Sell</SecondaryButton>
          <SecondaryButton className="!min-h-9 px-2 py-1 text-xs" onClick={() => store.salvageItem(item.id)} disabled={item.locked}>Salvage</SecondaryButton>
        </div>
      </div>
    </GameCard>
  );
}

function BuildPresetsPanel({ state, store }: { state: GameState; store: GameStore }) {
  const presetIds: BuildPresetId[] = ["preset-1", "preset-2"];
  const resonances = getFamilyResonanceSummaries(state).filter((summary) => summary.family.active || summary.equippedCount > 0);
  return (
    <Card>
      <div className="space-y-3">
        <SectionHeader
          title="Build Presets"
          action={<SecondaryButton className="!min-h-8 px-2.5 py-1 text-xs" onClick={() => store.equipBestForContext()}>Equip Best</SecondaryButton>}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          {presetIds.map((presetId) => {
            const preset = state.buildPresets[presetId];
            const savedCount = Object.keys(preset.equipmentItemIds).length;
            return (
              <div key={presetId} className="rounded-md border border-ink/10 bg-parchment/70 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-black">{preset.name}</p>
                    <p className="text-xs font-semibold text-stone-600">{savedCount}/5 slots saved</p>
                  </div>
                  <div className="flex gap-1">
                    <SecondaryButton className="!min-h-8 px-2.5 py-1 text-xs" onClick={() => store.saveBuildPreset(presetId)}>
                      <Save size={14} /> Save
                    </SecondaryButton>
                    <PrimaryButton className="!min-h-8 px-2.5 py-1 text-xs" onClick={() => store.equipBuildPreset(presetId)} disabled={savedCount === 0}>
                      Equip
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {resonances.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resonances.map((summary) => (
              <Pill
                key={summary.family.id}
                className={`!px-2 !py-0.5 text-[0.68rem] ${
                  summary.rank > 0 ? "border-amber-400 bg-amber-50 text-amber-900" : "border-stone-300 bg-stone-100 text-stone-700"
                }`}
              >
                {summary.family.name} {summary.equippedCount}/3 {summary.rank > 0 ? `R${summary.rank}` : ""}
              </Pill>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function InventoryScreen({ state, store }: { state: GameState; store: GameStore }) {
  const items = state.inventory;
  const lootFocusOptions = ["any", ...(Object.keys(slotLabels) as EquipmentSlot[])] as LootFocusId[];
  const pityProgress = Math.floor((Math.min(state.loot.missesSinceDrop, LOOT_DROP_PITY_THRESHOLD) / LOOT_DROP_PITY_THRESHOLD) * 100);
  const inventoryFull = state.inventory.length >= INVENTORY_LIMIT;
  const inventoryNearFull = state.inventory.length >= INVENTORY_NEAR_FULL_THRESHOLD;
  const capacityPercent = Math.floor((state.inventory.length / INVENTORY_LIMIT) * 100);
  const capacityClass = inventoryFull ? "bg-red-700" : inventoryNearFull ? "bg-amber-500" : "bg-emerald";
  const emptyTitle = "Your pack is empty";
  const emptyDescription = "Clear expeditions to bring back weapons, armor, relics, and salvageable finds.";
  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs font-black uppercase text-stone-600">
            <span>Pack Capacity</span>
            <span>{state.inventory.length}/{INVENTORY_LIMIT} · {capacityPercent}%</span>
          </div>
          <ProgressBar value={capacityPercent} className={capacityClass} />
        </div>
      </Card>
      <Card>
        <SectionHeader
          title="Loot Focus"
          action={<Pill className="border-royal/20 bg-blue-50 text-royal">Pity {state.loot.missesSinceDrop}/{LOOT_DROP_PITY_THRESHOLD}</Pill>}
        />
        <div className="mt-3 grid grid-cols-6 gap-1.5">
          {lootFocusOptions.map((focus) => {
            const selected = state.loot.focusSlot === focus;
            return (
              <button
                key={focus}
                type="button"
                aria-pressed={selected}
                className={`ui-hover-surface min-h-10 rounded-lg border px-1 py-1 text-center text-[0.62rem] font-black uppercase leading-none transition sm:text-xs ${
                  selected ? "border-amber-400 bg-blue-50/80 text-primary ring-1 ring-amber-400/50" : "border-ink/10 bg-parchment/70 text-stone-600"
                }`}
                onClick={() => store.setLootFocus(focus)}
              >
                {lootFocusShortLabels[focus]}
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <ProgressBar value={pityProgress} className="bg-royal" />
        </div>
      </Card>
      <BuildPresetsPanel state={state} store={store} />
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

function ForgeScreen({
  state,
  store,
  view,
  onViewChange,
  reducedMotion
}: {
  state: GameState;
  store: GameStore;
  view: ForgeSubviewId;
  onViewChange: (view: ForgeSubviewId) => void;
  reducedMotion: boolean;
}) {
  const [slot, setSlot] = useState<"any" | EquipmentSlot>("any");
  const [classBias, setClassBias] = useState(true);
  const craftSlotOptions = ["any", ...(Object.keys(slotLabels) as EquipmentSlot[])] as ("any" | EquipmentSlot)[];
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
  const forgePanels: Array<{ id: ForgeSubviewId; content: React.ReactNode }> = [
    {
      id: "craft",
      content: (
        <Card>
          <div className="space-y-3">
            <h3 className="font-black">Craft Item</h3>
            <div className="grid gap-2 text-xs font-bold text-stone-700 sm:grid-cols-3">
              <p>Slot: {slot === "any" ? (classBias ? "Class-biased random" : "Weighted random") : slotLabels[slot]}</p>
              <p>Forge budget: +{forgeLevel * 2} item stats</p>
              <p>Cost: {formatResources(craftCost)}</p>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {craftSlotOptions.map((entry) => {
                const selected = slot === entry;
                return (
                  <button
                    key={entry}
                    type="button"
                    aria-pressed={selected}
                    className={`ui-hover-surface min-h-10 rounded-lg border px-1 py-1 text-center text-[0.62rem] font-black uppercase leading-none transition sm:text-xs ${
                      selected ? "border-amber-400 bg-blue-50/80 text-primary ring-1 ring-amber-400/50" : "border-ink/10 bg-parchment/70 text-stone-600"
                    }`}
                    onClick={() => setSlot(entry)}
                  >
                    {lootFocusShortLabels[entry]}
                  </button>
                );
              })}
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
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
      )
    },
    {
      id: "upgrade",
      content: (
        upgradeCandidates.length === 0 ? (
          <EmptyState Icon={Hammer} title="No upgradeable items yet" description="Craft or find gear before upgrading." />
        ) : (
          <div className="grid gap-2">
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
        )
      )
    },
    {
      id: "advanced",
      content: (
        <div className="space-y-4">
          <Card>
            <h3 className="font-black">Reroll Affix</h3>
            <p className="mt-1 text-sm font-semibold text-stone-700">Rerolls and bulk salvage are optional until your first boss progression settles.</p>
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
      )
    }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold text-stone-700 sm:text-sm">Level {forgeLevel}/12 · {forgeEffect}</p>
          <Pill className={rerollUnlocked ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-stone-200 bg-stone-100 text-stone-700"}>
            <RotateCcw size={13} /> Affix reroll {rerollUnlocked ? "Ready" : `at Lv${FORGE_AFFIX_REROLL_REQUIRED_LEVEL}`}
          </Pill>
        </div>
      </Card>
      <SwipeSubviewDeck panels={forgePanels} value={view} onChange={(next) => onViewChange(next as ForgeSubviewId)} reducedMotion={reducedMotion} />
    </div>
  );
}

function getTownBuildingFeedback(state: GameState, buildingId: BuildingId): string {
  switch (buildingId) {
    case "forge":
      return state.town.forge >= FORGE_AFFIX_REROLL_REQUIRED_LEVEL
        ? "Affix rerolls unlocked; upgrades and craft budget scale from here."
        : `Affix rerolls unlock at Forge level ${FORGE_AFFIX_REROLL_REQUIRED_LEVEL}.`;
    case "mine": {
      const capHours = Math.floor(OFFLINE_CAP_MS / (60 * 60 * 1000));
      return `Improves Fragment Caravan yields. Offline jobs are player-chosen and capped at ${capHours}h.`;
    }
    case "tavern": {
      const ready = state.dailies.tasks.filter((task) => !task.claimed && task.progress >= task.target).length;
      const focusReady = state.dailyFocus.focusChargesBanked > 0 && state.dailyFocus.focusChargeProgress >= 3 ? "Daily Focus ready" : "Daily Focus charging";
      const missionText = state.accountRank.accountRank >= 2 ? `${ready}/${state.dailies.tasks.length} missions ready` : "Daily Missions at Account Rank 2";
      return `${focusReady}; ${missionText}; rumor: ${getNextGoal(state)}`;
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

function ActiveConstructionPanel({ state, now, store }: { state: GameState; now: number; store: GameStore }) {
  const progress = getActiveConstructionProgress(state, now);
  if (!progress) return null;
  const building = BUILDINGS.find((entry) => entry.id === progress.buildingId);
  if (!building) return null;
  const focusToFinish = getConstructionFocusCostToComplete(state, now);
  const canClaim = progress.ready;
  const skipOneHour = Math.min(CONSTRUCTION_FOCUS_PER_HOUR, focusToFinish);
  const canSkipOneHour = skipOneHour > 0 && state.focus.current >= skipOneHour;
  const canSkipAll = focusToFinish > 0 && state.focus.current >= focusToFinish;

  return (
    <Card className={canClaim ? "border-emerald/30 bg-emerald-50/80" : "border-royal/20 bg-blue-50/70"}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-mystic">Construction Slot</p>
            <h3 className="text-base font-black">{building.name} Level {progress.targetLevel}</h3>
            <p className="text-xs font-semibold text-stone-700">
              {canClaim ? "Ready to claim" : `${formatMs(progress.remainingMs)} remaining`} · Focus skips 1h for {CONSTRUCTION_FOCUS_PER_HOUR}
            </p>
          </div>
          <Pill className={canClaim ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-royal/20 bg-blue-50 text-royal"}>
            <Clock size={13} /> {canClaim ? "Ready" : formatPercent(progress.progress)}
          </Pill>
        </div>
        <ProgressBar value={progress.progress * 100} className={canClaim ? "bg-emerald" : "bg-royal"} />
        <div className="flex flex-wrap gap-1.5">
          <PrimaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={store.claimConstruction} disabled={!canClaim}>
            <CheckCircle2 size={15} /> Claim Upgrade
          </PrimaryButton>
          {!canClaim && (
            <>
              <SecondaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => store.accelerateConstruction(skipOneHour)} disabled={!canSkipOneHour}>
                <Flame size={15} /> Skip 1h
              </SecondaryButton>
              <SecondaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => store.accelerateConstruction(focusToFinish)} disabled={!canSkipAll}>
                <Flame size={15} /> Finish -{focusToFinish}
              </SecondaryButton>
            </>
          )}
          <DangerButton className="!min-h-9 px-3 py-1 text-xs" onClick={store.cancelConstruction}>
            <XCircle size={15} /> Cancel
          </DangerButton>
        </div>
      </div>
    </Card>
  );
}

function TownScreen({ state, now, store }: { state: GameState; now: number; store: GameStore }) {
  const totalLevels = getBuildingLevelTotal(state);
  const hasActiveConstruction = Boolean(state.construction.activeBuildingId);
  const nextAffordable = BUILDINGS.find((building) => state.town[building.id] < building.maxLevel && canAffordConstructionCost(state, getBuildingConstructionCost(state, building.id)));
  return (
    <div className="space-y-4">
      <ActiveConstructionPanel state={state} now={now} store={store} />
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Town Buildings</h2>
            <p className="text-xs font-semibold text-stone-700 sm:text-sm">Total building levels {totalLevels}/72. One construction can run at a time; timers survive Reincarnation.</p>
          </div>
          <Pill className={nextAffordable ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-stone-200 bg-stone-100 text-stone-700"}>
            {hasActiveConstruction ? "Slot occupied" : nextAffordable ? `${nextAffordable.name} ready` : "No build ready"}
          </Pill>
        </div>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {BUILDINGS.map((building) => {
          const level = state.town[building.id];
          const cost = getBuildingConstructionCost(state, building.id);
          const affordable = canAffordConstructionCost(state, cost);
          const maxed = level >= building.maxLevel;
          const activeHere = state.construction.activeBuildingId === building.id;
          const targetLevel = level + 1;
          const durationMs = getBuildingConstructionDurationMs(building.id, targetLevel);
          const progress = Math.floor((level / building.maxLevel) * 100);
          return (
            <Card key={building.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black">{building.name}</h3>
                    <p className="text-xs font-semibold text-stone-700 sm:text-sm">{building.purpose}</p>
                  </div>
                  <Pill className={maxed ? "border-amber-300 bg-amber-100 text-amber-900" : affordable ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-royal/20 bg-blue-50 text-royal"}>
                    {level}/{building.maxLevel}
                  </Pill>
                </div>
                <p className="text-xs font-semibold text-stone-700">
                  <span className="font-black text-ink">Build cost:</span> {maxed ? "Maxed" : formatConstructionCost(cost)}
                </p>
                {!maxed && (
                  <p className="text-xs font-semibold text-stone-600">
                    <span className="font-black text-ink">Timer:</span> {formatMs(durationMs)}
                  </p>
                )}
                {activeHere && (
                  <p className="rounded-md border border-royal/20 bg-blue-50 px-2 py-1 text-xs font-bold text-royal">
                    This upgrade is under construction.
                  </p>
                )}
                <PrimaryButton className="w-full" onClick={() => store.buyBuilding(building.id as BuildingId)} disabled={!affordable || maxed || hasActiveConstruction}>
                  <Hammer size={16} /> {maxed ? "Maxed" : activeHere ? "Building" : hasActiveConstruction ? "Slot Occupied" : affordable ? "Start Build" : "Need Resources"}
                </PrimaryButton>
                {!maxed && (
                  <p className="text-[0.68rem] font-semibold text-stone-500">
                    Regional stock: {formatRegionMaterials(state.regionProgress.materials)}
                  </p>
                )}
                <details className="rounded-md border border-stone-200 bg-white px-3 py-2">
                  <summary className="cursor-pointer text-xs font-black uppercase text-stone-600">Details & milestones</summary>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200">
                    <div className="h-full rounded-full bg-royal" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 rounded-md bg-parchment/70 px-3 py-2 text-xs font-bold text-stone-700">{getTownBuildingFeedback(state, building.id)}</p>
                  <p className="mt-2 text-xs font-semibold text-stone-600">{building.description}</p>
                  <div className="mt-2 grid gap-2 text-xs font-semibold text-stone-700">
                    <p><span className="font-black text-ink">Current benefit:</span> {building.effectText(level)}</p>
                    <p><span className="font-black text-ink">Next level:</span> {maxed ? "Maxed" : building.effectText(level + 1)}</p>
                  </div>
                  <div className="mt-2 grid gap-2">
                    {building.milestones.map((milestone) => {
                      const reached = level >= milestone.level;
                      return (
                        <div key={`${building.id}-${milestone.level}`} className="flex items-center gap-2 rounded-md border border-stone-200 bg-parchment/60 px-3 py-2 text-xs font-bold text-stone-700">
                          {reached ? <CheckCircle2 size={14} className="text-emerald" /> : <Clock size={14} className="text-stone-500" />}
                          <span className="shrink-0 text-stone-500">{milestone.level === 0 ? "Base" : `Lv${milestone.level}`}</span>
                          <span>{milestone.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </details>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AccountShowcaseScreen({ state, store }: { state: GameState; store: GameStore }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const rank = getAccountRankDefinition(state.accountRank.accountRank);
  const nextRank = getNextAccountRankDefinition(state.accountRank.accountXp);
  const selectedTitle = getSelectedTitleDefinition(state);
  const unlockedTitles = getUnlockedTitleEntries(state);
  const lockedTitles = getLockedTitleEntries(state).slice(0, 4);
  const pinnedTrophies = getPinnedTrophyEntries(state);
  const unlockedTrophies = getUnlockedTrophyEntries(state);
  const lockedTrophies = getLockedTrophyEntries(state).slice(0, 4);
  const featuredRegion = getFeaturedRegion(state);
  const featuredBoss = getFeaturedBoss(state);
  const trophyShelfFull = pinnedTrophies.filter(Boolean).length >= SHOWCASE_TROPHY_SLOT_COUNT;
  const maxSeedRank = ACCOUNT_RANKS.at(-1)?.rank ?? state.accountRank.accountRank;
  const rankProgress = nextRank
    ? ((state.accountRank.accountXp - rank.xp) / Math.max(1, nextRank.xp - rank.xp)) * 100
    : 100;
  const snippet = buildShowcaseCopyText(state);
  const highestPower = Math.max(state.accountPersonalRecords.highestPowerReached, state.lifetime.highestPowerScore);
  const diaryRewardsClaimed = Object.values(state.regionProgress.diaries).reduce((total, diary) => total + new Set(diary.claimedRewardIds ?? []).size, 0);
  const caravanMasteryTiers = getCaravanMasterySummaries(state).reduce((total, summary) => total + summary.claimedTiers.length, 0);
  const records = [
    { label: "Rebirths", value: state.rebirth.totalRebirths },
    { label: "Highest Power", value: highestPower },
    { label: "Mastery Tiers", value: state.accountPersonalRecords.totalMasteryTiersClaimed },
    { label: "Expeditions", value: state.accountPersonalRecords.lifetimeExpeditionsCompleted },
    { label: "Bosses Defeated", value: state.accountPersonalRecords.lifetimeBossesDefeated },
    { label: "Collections", value: state.accountPersonalRecords.totalCollectionsCompleted },
    { label: "Diaries", value: diaryRewardsClaimed },
    { label: "Caravan Tiers", value: caravanMasteryTiers }
  ];
  const codexUnlocked = state.accountRank.accountRank >= 10;
  const activeRegionIds = new Set(getActiveRegionIds(state));
  const traitCodexEntries = ITEM_TRAITS.map((definition) => ({
    definition,
    discovery: state.traitCodex[definition.id] ?? null
  }));
  const discoveredTraitCount = traitCodexEntries.filter((entry) => entry.discovery?.discovered).length;
  const familyCodexEntries = ITEM_FAMILIES.filter(
    (family) => family.active || Boolean(state.familyCodex[family.id]) || Boolean(family.regionId && activeRegionIds.has(family.regionId))
  ).map((definition) => ({
    definition,
    discovery: state.familyCodex[definition.id] ?? null
  }));
  const discoveredFamilyCount = familyCodexEntries.filter((entry) => (entry.discovery?.discoveredSlots.length ?? 0) > 0).length;

  const copyShowcase = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(snippet);
        setCopyState("copied");
        return;
      } catch {
        setCopyState("manual");
        return;
      }
    }
    setCopyState("manual");
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-royal">Account Showcase</p>
            <h2 className="text-2xl font-black">{selectedTitle?.name ?? "Relic Warden"}</h2>
            <p className="mt-1 text-sm font-semibold text-stone-700">
              Rank {state.accountRank.accountRank}/{maxSeedRank} · {rank.label}
            </p>
          </div>
          <Pill className="border-royal/20 bg-blue-50 text-royal">
            {formatNumber(state.accountRank.accountXp)} Account XP
          </Pill>
        </div>
        <div className="mt-4">
          <ProgressBar value={rankProgress} />
          <p className="mt-2 text-xs font-bold text-stone-600">
            {nextRank
              ? `${formatNumber(state.accountRank.accountXp)}/${formatNumber(nextRank.xp)} XP to Rank ${nextRank.rank}`
              : "Current seed rank table complete"}
          </p>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-black">Selected Title</h3>
                <p className="text-xs font-semibold text-stone-700 sm:text-sm">
                  {selectedTitle ? selectedTitle.unlockCondition : "Unlock a title to feature it here."}
                </p>
              </div>
              <SecondaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => store.selectShowcaseTitle(null)} disabled={state.accountShowcase.accountSignatureMode === "auto"}>
                Auto
              </SecondaryButton>
            </div>
            <div className="mt-3 grid gap-2">
              {unlockedTitles.length === 0 ? (
                <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700">
                  No unlocked titles yet.
                </div>
              ) : (
                unlockedTitles.map((entry) => (
                  <div key={entry.definition.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${entry.selected ? "border-royal/40 bg-blue-50" : "border-stone-200 bg-white"}`}>
                    <div>
                      <p className="font-black">{entry.definition.name}</p>
                      <p className="text-xs font-semibold text-stone-600">{entry.definition.unlockCondition}</p>
                    </div>
                    <PrimaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => store.selectShowcaseTitle(entry.definition.id)} disabled={entry.selected}>
                      {entry.selected ? "Selected" : "Select"}
                    </PrimaryButton>
                  </div>
                ))
              )}
            </div>
            {lockedTitles.length > 0 && (
              <div className="mt-3 grid gap-1.5">
                {lockedTitles.map((entry) => (
                  <p key={entry.definition.id} className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-600">
                    Locked: {entry.definition.name} · {entry.definition.unlockCondition}
                  </p>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-black">Trophy Shelf</h3>
                <p className="text-xs font-semibold text-stone-700 sm:text-sm">Three visible slots for local account milestones.</p>
              </div>
              <Pill className="border-amber-400 bg-amber-50 text-amber-900">
                {pinnedTrophies.filter(Boolean).length}/{SHOWCASE_TROPHY_SLOT_COUNT}
              </Pill>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {pinnedTrophies.map((entry, index) => (
                <div key={entry?.definition.id ?? `empty-trophy-${index}`} className={`min-h-28 rounded-lg border px-3 py-3 text-sm ${entry ? "border-amber-300 bg-amber-50/80" : "border-dashed border-stone-300 bg-stone-50"}`}>
                  <Trophy size={20} className={entry ? "text-amber-700" : "text-stone-400"} />
                  <p className="mt-2 font-black">{entry?.definition.name ?? `Slot ${index + 1}`}</p>
                  <p className="mt-1 text-xs font-semibold text-stone-600">{entry?.definition.unlockCondition ?? "Empty trophy slot"}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2">
              {unlockedTrophies.length === 0 ? (
                <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700">
                  No unlocked trophies yet.
                </div>
              ) : (
                unlockedTrophies.map((entry) => (
                  <div key={entry.definition.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">
                    <div>
                      <p className="font-black">{entry.definition.name}</p>
                      <p className="text-xs font-semibold text-stone-600">{entry.definition.unlockCondition}</p>
                    </div>
                    <SecondaryButton
                      className="!min-h-9 px-3 py-1 text-xs"
                      onClick={() => store.toggleShowcaseTrophy(entry.definition.id)}
                      disabled={!entry.pinned && trophyShelfFull}
                    >
                      {entry.pinned ? "Unpin" : trophyShelfFull ? "Shelf Full" : "Pin"}
                    </SecondaryButton>
                  </div>
                ))
              )}
            </div>
            {lockedTrophies.length > 0 && (
              <div className="mt-3 grid gap-1.5">
                {lockedTrophies.map((entry) => (
                  <p key={entry.definition.id} className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-600">
                    Locked: {entry.definition.name} · {entry.definition.unlockCondition}
                  </p>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="font-black">Personal Records</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {records.map((record) => (
                <div key={record.label} className="rounded-lg border border-stone-200 bg-white px-3 py-2">
                  <p className="text-xs font-black uppercase text-stone-500">{record.label}</p>
                  <p className="mt-1 text-lg font-black text-ink">{formatNumber(record.value)}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-black">Identity</h3>
            <div className="mt-3 grid gap-2 text-sm font-semibold text-stone-700">
              <p><span className="font-black text-ink">Featured Region:</span> {featuredRegion?.name ?? "No region featured yet"}</p>
              <p><span className="font-black text-ink">Best Boss:</span> {featuredBoss?.name ?? "No boss defeated yet"}</p>
              <p><span className="font-black text-ink">Current Chase:</span> {getNextGoal(state)}</p>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-royal" />
                <div>
                  <h3 className="font-black">Trait & Family Codex</h3>
                  <p className="text-xs font-semibold text-stone-700 sm:text-sm">
                    {codexUnlocked
                      ? `${discoveredTraitCount}/${ITEM_TRAITS.length} traits · ${discoveredFamilyCount}/${familyCodexEntries.length} families`
                      : "Unlocks at Account Rank 10."}
                  </p>
                </div>
              </div>
              <Pill className={codexUnlocked ? "border-royal/20 bg-blue-50 text-royal" : "border-stone-200 bg-stone-50 text-stone-700"}>
                {codexUnlocked ? "Unlocked" : `Rank ${state.accountRank.accountRank}/10`}
              </Pill>
            </div>
            {codexUnlocked ? (
              <div className="mt-3 grid gap-3 xl:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase text-mystic">Traits</p>
                  <div className="grid gap-1.5">
                    {traitCodexEntries.map(({ definition, discovery }) => {
                      const discovered = Boolean(discovery?.discovered);
                      return (
                        <div key={definition.id} className={`rounded-md border px-2 py-1.5 text-xs ${discovered ? "border-royal/20 bg-blue-50/80" : "border-stone-200 bg-stone-50 text-stone-600"}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black">{discovered ? definition.name : "Undiscovered Trait"}</span>
                            <span className="font-bold uppercase">{definition.category}</span>
                          </div>
                          <p className="mt-0.5 font-semibold text-stone-700">
                            {discovered ? `${definition.description} Found ${discovery?.timesFound ?? 0}x · best level ${discovery?.bestValueSeen ?? 0}` : "Identity unknown."}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase text-mystic">Families</p>
                  <div className="grid gap-1.5">
                    {familyCodexEntries.map(({ definition, discovery }) => {
                      const slots = discovery?.discoveredSlots ?? [];
                      const discovered = slots.length > 0;
                      return (
                        <div key={definition.id} className={`rounded-md border px-2 py-1.5 text-xs ${discovered ? "border-amber-300 bg-amber-50/80" : "border-stone-200 bg-stone-50 text-stone-600"}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black">{discovered ? definition.name : "Undiscovered Family"}</span>
                            <span className="font-bold">{slots.length}/5 slots</span>
                          </div>
                          <p className="mt-0.5 font-semibold text-stone-700">
                            {discovered
                              ? `Best resonance ${discovery?.highestResonanceReached ?? 0}. ${definition.rank1Text} ${definition.rank2Text}`
                              : "No item family pieces discovered."}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700">
                Discoveries are being tracked silently.
              </div>
            )}
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-black">Copy Showcase</h3>
                <p className="text-xs font-semibold text-stone-700 sm:text-sm">Local text snippet from this save.</p>
              </div>
              <PrimaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={copyShowcase}>
                <Save size={15} /> Copy
              </PrimaryButton>
            </div>
            <textarea className="mt-3 min-h-44 w-full rounded-lg border border-ink/15 bg-white p-3 text-xs font-semibold text-stone-700" value={snippet} readOnly />
            {copyState !== "idle" && (
              <p className="mt-2 text-xs font-bold text-royal">
                {copyState === "copied" ? "Showcase copied." : "Clipboard unavailable. The text is ready here."}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function DailiesScreen({ state, now, store }: { state: GameState; now: number; store: GameStore }) {
  const timeLeft = Math.max(0, state.dailies.nextResetAt - now);
  const weeklyTimeLeft = Math.max(0, state.weeklyQuest.nextResetAt - now);
  const completed = state.dailies.tasks.filter((task) => task.progress >= task.target).length;
  const claimed = state.dailies.tasks.filter((task) => task.claimed).length;
  const dailyFocusReady = state.dailyFocus.focusChargesBanked > 0 && state.dailyFocus.focusChargeProgress >= 3;
  const dailyFocusPercent = Math.floor((Math.min(state.dailyFocus.focusChargeProgress, 3) / 3) * 100);
  const weeklyTarget = state.weeklyQuest.steps.reduce((total, step) => total + step.target, 0);
  const weeklyProgress = state.weeklyQuest.steps.reduce((total, step) => total + Math.min(step.progress, step.target), 0);
  const weeklyPercent = Math.floor((weeklyProgress / Math.max(1, weeklyTarget)) * 100);
  const weeklyDone = state.weeklyQuest.steps.every((step) => step.progress >= step.target);
  const dailyMissionsUnlocked = state.accountRank.accountRank >= 2;
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Mission Board</h2>
            <p className="text-xs font-semibold text-stone-700 sm:text-sm">
              Daily Focus, Daily Missions, and the weekly charter. {DAILY_RESET_HOUR_LOCAL}:00 local mission reset.
            </p>
            <p className="mt-2 text-xs font-bold text-royal sm:text-sm">
              Daily Missions reset in {formatMs(timeLeft)} · next at {formatLocalClock(state.dailies.nextResetAt)}
            </p>
          </div>
          <Pill className="border-royal/20 bg-blue-50 text-royal">
            {dailyMissionsUnlocked ? `${completed}/${state.dailies.tasks.length} done · ${claimed} claimed` : "Daily Missions Rank 2"}
          </Pill>
        </div>
      </Card>
      <Card className="border-sky-300/60 bg-sky-50/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black">Daily Focus</h3>
              <Pill className="border-sky-300 bg-white/80 text-sky-900">
                Charges {state.dailyFocus.focusChargesBanked}/3
              </Pill>
            </div>
            <p className="text-xs font-semibold text-stone-700 sm:text-sm">
              Complete 3 expeditions to claim +10 Focus.
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200">
              <div className="h-full rounded-full bg-sky-600" style={{ width: `${dailyFocusPercent}%` }} />
            </div>
            <p className="mt-1 text-xs font-bold text-stone-700">
              Progress: {Math.min(state.dailyFocus.focusChargeProgress, 3)}/3
            </p>
          </div>
          <PrimaryButton onClick={() => store.claimDailyFocus()} disabled={!dailyFocusReady}>
            {dailyFocusReady ? "Claim Focus" : "In Progress"}
          </PrimaryButton>
        </div>
      </Card>
      <Card className="border-amber-400/40 bg-amber-50/70">
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-black">Weekly Quest</h3>
              <p className="text-xs font-semibold text-stone-700 sm:text-sm">
                {state.weeklyQuest.title} Resets in {formatMs(weeklyTimeLeft)}.
              </p>
            </div>
            <Pill className="border-amber-400 bg-amber-100 text-amber-900">
              {weeklyProgress}/{weeklyTarget}
            </Pill>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${weeklyPercent}%` }} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {state.weeklyQuest.steps.map((step) => {
              const done = step.progress >= step.target;
              const stepPercent = Math.floor((Math.min(step.progress, step.target) / step.target) * 100);
              return (
                <div key={step.kind} className={`rounded-lg border p-2.5 text-xs font-semibold ${done ? "border-emerald/30 bg-emerald-50/80" : "border-amber-300 bg-parchment/70"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black">{step.label}</span>
                    <span className="font-black text-stone-600">{Math.min(step.progress, step.target)}/{step.target}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
                    <div className={done ? "h-full rounded-full bg-emerald" : "h-full rounded-full bg-amber-500"} style={{ width: `${stepPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-300 bg-parchment/70 px-3 py-2 text-xs font-bold text-stone-700">
            <span>Reward: {formatMissionReward(state.weeklyQuest.reward)}</span>
            <SecondaryButton onClick={() => store.claimWeeklyQuest()} disabled={!weeklyDone || state.weeklyQuest.questClaimed}>
              {state.weeklyQuest.questClaimed ? "Claimed" : weeklyDone ? "Claim Weekly" : "In Progress"}
            </SecondaryButton>
          </div>
        </div>
      </Card>
      {dailyMissionsUnlocked ? (
        <div className="grid gap-3">
          {state.dailies.tasks.map((task) => {
            const done = task.progress >= task.target;
            const percent = Math.floor((Math.min(task.progress, task.target) / task.target) * 100);
            return (
              <Card key={task.id} className={task.claimed ? "border-emerald/30 bg-emerald-50/70" : ""}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black">{task.label}</h3>
                      <Pill className={task.difficulty === "easy" ? "border-emerald/20 bg-emerald-50 text-emerald" : "border-royal/20 bg-blue-50 text-royal"}>
                        {task.difficulty}
                      </Pill>
                    </div>
                    <p className="text-xs font-semibold text-stone-700 sm:text-sm">
                      Progress: {Math.min(task.progress, task.target)}/{task.target}
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200">
                      <div className={task.claimed ? "h-full rounded-full bg-emerald" : "h-full rounded-full bg-royal"} style={{ width: `${percent}%` }} />
                    </div>
                    <p className="text-xs font-semibold text-stone-600">
                      Reward: {formatMissionReward(task.reward)}
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
      ) : (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-black">Daily Missions</h3>
              <p className="text-xs font-semibold text-stone-700 sm:text-sm">Unlocks at Account Rank 2.</p>
            </div>
            <Pill className="border-stone-200 bg-stone-50 text-stone-700">Rank {state.accountRank.accountRank}/2</Pill>
          </div>
        </Card>
      )}
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
            <p className="text-xs font-semibold text-stone-700 sm:text-sm">Track progression milestones across expeditions, loot, town upgrades, and reincarnation cycles.</p>
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
      <div className="space-y-2">
        {ACHIEVEMENTS.map((achievement) => {
          const unlockedAt = state.achievements[achievement.id]?.unlockedAt ?? null;
          const unlocked = unlockedAt !== null;
          return (
            <GameCard key={achievement.id} density="compact" className={unlocked ? "border-emerald/30 bg-emerald-50/70" : ""}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="line-clamp-1 text-sm font-black">{achievement.title}</h3>
                  <p className="line-clamp-2 text-xs font-semibold text-stone-700 sm:text-sm">{achievement.description}</p>
                  <p className="mt-1 text-[0.7rem] font-semibold text-stone-600 sm:text-xs">
                    {unlockedAt ? `Unlocked: ${formatLocalDateTime(unlockedAt)}` : "Not unlocked yet"}
                  </p>
                </div>
                <Pill className={unlocked ? "shrink-0 border-emerald/30 bg-emerald-100 text-emerald" : "shrink-0 border-stone-200 bg-stone-50 text-stone-700"}>
                  {unlocked ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                  {unlocked ? "Done" : getAchievementProgress(state, achievement.id)}
                </Pill>
              </div>
            </GameCard>
          );
        })}
      </div>
    </div>
  );
}

function ReincarnationScreen({
  state,
  store,
  view,
  onViewChange,
  reducedMotion
}: {
  state: GameState;
  store: GameStore;
  view: ReincarnationSubviewId;
  onViewChange: (view: ReincarnationSubviewId) => void;
  reducedMotion: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ready = canPrestige(state);
  const gain = calculatePrestigeRenown(state);
  const levelReady = state.hero.level >= REINCARNATION_LEVEL_REQUIREMENT;
  const bossClear = (state.dungeonClears[REINCARNATION_GATE_BOSS_ID] ?? 0) > 0;
  const gateBoss = getDungeon(REINCARNATION_GATE_BOSS_ID);
  const gateRoute = DUNGEONS.filter((dungeon) => dungeon.zoneId === gateBoss.zoneId && dungeon.indexInZone <= gateBoss.indexInZone);
  const clearedGateRoute = gateRoute.filter((dungeon) => (state.dungeonClears[dungeon.id] ?? 0) > 0).length;
  const levelProgress = Math.min(100, Math.floor((state.hero.level / REINCARNATION_LEVEL_REQUIREMENT) * 100));
  const bossProgress = bossClear ? 100 : Math.min(99, Math.floor((clearedGateRoute / Math.max(1, gateRoute.length)) * 100));
  const resetItems = ["Hero level, XP, and base stats", "Gold, run materials, inventory, and equipment", "Dungeon clears, active expedition, and missions"];
  const persistItems = ["Persistent Town buildings", "Focus, Soul Marks, and purchased permanent upgrades", "Hero name, class, settings, achievements, and lifetime stats", "Total reincarnations and total Soul Marks earned"];
  const reincarnationPanels: Array<{ id: ReincarnationSubviewId; content: React.ReactNode }> = [
    {
      id: "overview",
      content: (
        <div className="grid gap-3 md:grid-cols-2">
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
          <Card className="md:col-span-2">
            <h3 className="font-black">Why It Gets Faster</h3>
            <p className="mt-2 text-xs font-semibold text-stone-700">Echo Tempo shortens timers, Soul Prosperity increases rewards, Relic Wisdom improves loot consistency, and Boss Attunement smooths boss gates.</p>
          </Card>
        </div>
      )
    },
    {
      id: "ledger",
      content: (
        <div className="grid gap-3 md:grid-cols-2">
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
        </div>
      )
    },
    {
      id: "upgrades",
      content: (
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
      )
    }
  ];
  return (
    <div className="space-y-4">
      <Card className={ready ? "border-amber-400 bg-amber-50/80" : ""}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Reincarnation</h2>
            <p className="text-xs font-semibold text-stone-700 sm:text-sm">Reset this run for Soul Marks, then buy permanent upgrades that make the next cycle faster.</p>
          </div>
          <Pill className={ready ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-amber-300 bg-amber-100 text-amber-900"}>
            <Sparkles size={13} /> {ready ? "Ready" : "Preparing"}
          </Pill>
        </div>
        <div className="mt-3 grid gap-2 text-xs font-semibold text-stone-700 sm:text-sm md:grid-cols-2">
          <p className="flex items-center gap-2">{levelReady ? <CheckCircle2 size={16} className="text-emerald" /> : <Clock size={16} className="text-stone-500" />} Level {REINCARNATION_LEVEL_REQUIREMENT}: {state.hero.level}/{REINCARNATION_LEVEL_REQUIREMENT}</p>
          <p className="flex items-center gap-2">{bossClear ? <CheckCircle2 size={16} className="text-emerald" /> : <Clock size={16} className="text-stone-500" />} Region 3 boss: Curator of Blue Fire</p>
        </div>
        <div className="mt-3 grid gap-2 text-xs font-semibold text-stone-700 sm:text-sm md:grid-cols-3">
          <p><span className="font-black text-ink">Currency earned:</span> +{gain} Soul Marks</p>
          <p><span className="font-black text-ink">Current balance:</span> {formatNumber(state.resources.renown)} Soul Marks</p>
          <p><span className="font-black text-ink">Next run:</span> faster timers, rewards, loot, and boss gates</p>
        </div>
        <PrimaryButton
          className="mt-3"
          disabled={!ready}
          onClick={() => setConfirmOpen(true)}
        >
          <Sparkles size={16} /> Reincarnate
        </PrimaryButton>
      </Card>
      <SwipeSubviewDeck panels={reincarnationPanels} value={view} onChange={(next) => onViewChange(next as ReincarnationSubviewId)} reducedMotion={reducedMotion} />
      {confirmOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/55 p-3 sm:items-center">
          <RewardSummary className="w-full max-w-md border-amber-400 bg-amber-50/80">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-mystic">Confirm Reincarnation</p>
              <h3 className="text-base font-black">Start a New Cycle?</h3>
              <p className="text-xs font-semibold text-stone-700 sm:text-sm">
                This resets this run&apos;s level, resources, gear, dungeon clears, expedition, and missions.
                Persistent Town, Focus, Soul Marks, upgrades, achievements, and lifetime stats persist.
              </p>
              <p className="text-xs font-semibold text-stone-700">
                You gain <span className="font-black text-ink">+{gain} Soul Marks</span> from this reincarnation.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <SecondaryButton className="!min-h-9 px-3 py-1 text-xs" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  className="!min-h-9 px-3 py-1 text-xs"
                  onClick={() => {
                    setConfirmOpen(false);
                    store.prestige();
                  }}
                >
                  <Sparkles size={15} /> Confirm Reincarnation
                </PrimaryButton>
              </div>
            </div>
          </RewardSummary>
        </div>
      )}
    </div>
  );
}

function SettingsScreen({ state, store }: { state: GameState; store: GameStore }) {
  const isClient = useIsClient();
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const showDebugBalance = process.env.NODE_ENV !== "production";
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-black">Save & Settings</h2>
        <p className="text-xs font-semibold text-stone-700 sm:text-sm">Autosave is local. Export/import works with JSON envelopes.</p>
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
        <div className="grid gap-3">
          <label className="flex items-center justify-between rounded-lg border border-ink/10 bg-white p-3 text-sm font-bold">
            Reduced motion
            <input type="checkbox" checked={state.settings.reducedMotion} onChange={(event) => store.setReducedMotion(event.target.checked)} />
          </label>
          {showDebugBalance ? (
            <label className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm font-bold text-amber-900">
              Debug balance (dev only)
              <input type="checkbox" checked={state.settings.debugBalance} onChange={(event) => store.setDebugBalance(event.target.checked)} />
            </label>
          ) : (
            <p className="text-xs font-semibold text-stone-600">Debug balance is hidden in external playtest builds.</p>
          )}
        </div>
      </Card>
      <Card className="border-red-300 bg-red-50">
        <h3 className="font-black text-red-900">Reset Local Save</h3>
        <p className="text-xs font-semibold text-red-800 sm:text-sm">This clears local progress from this browser.</p>
        <DangerButton
          className="mt-3"
          onClick={() => {
            if (isClient && window.confirm("Delete local save?")) {
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
        <h3 className="text-[0.94rem] font-black">Next Goal</h3>
        <p className="mt-2 text-sm font-semibold text-stone-700">{getNextGoal(state)}</p>
      </Card>
      <Card>
        <h3 className="text-[0.94rem] font-black">Hero Snapshot</h3>
        <div className="mt-2 space-y-1 text-sm font-semibold text-stone-700">
          <p>Class: {HERO_CLASSES.find((entry) => entry.id === state.hero.classId)?.name}</p>
          <p>Level: {state.hero.level}</p>
          <p>Power: {formatNumber(stats.powerScore)}</p>
          <p>Focus: {state.focus.current}/{state.focus.cap}</p>
          <p>Soul Marks: {formatNumber(state.resources.renown)}</p>
        </div>
      </Card>
      <Card>
        <h3 className="text-[0.94rem] font-black">Current Expedition</h3>
        {active && state.activeExpedition ? (
          <p className="mt-2 text-sm font-semibold text-stone-700">
            {active.name} · {formatMs(state.activeExpedition.endsAt - now)}
          </p>
        ) : (
          <p className="mt-2 text-sm font-semibold text-stone-700">No active expedition.</p>
        )}
      </Card>
      <Card>
        <h3 className="text-[0.94rem] font-black">Mission Board</h3>
        <p className="mt-2 text-sm font-semibold text-stone-700">
          Focus {state.dailyFocus.focusChargeProgress}/3 · Weekly {state.weeklyQuest.questClaimed ? "claimed" : "active"}
        </p>
      </Card>
      <Card>
        <h3 className="text-[0.94rem] font-black">Reincarnation Track</h3>
        <p className="mt-2 text-sm font-semibold text-stone-700">Level {state.hero.level}/{REINCARNATION_LEVEL_REQUIREMENT}</p>
        <div className="mt-2">
          <ProgressBar value={reincarnationLevelProgress} />
        </div>
      </Card>
    </aside>
  );
}

function AccountShowcaseDiscoveryModal({
  store,
  onOpenAccount
}: {
  store: GameStore;
  onOpenAccount: () => void;
}) {
  const dismiss = () => store.dismissAccountShowcaseDiscovery();
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-3 sm:items-center">
      <RewardSummary className="w-full max-w-md border-royal/40 bg-blue-50/90">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-black uppercase text-royal">Account Showcase Discovered</p>
            <h3 className="text-lg font-black">Your guild account has a profile.</h3>
          </div>
          <p className="text-sm font-semibold text-stone-700">
            Rank 2 unlocked the local Account Showcase: titles, trophy shelf, personal records, current chase, and copyable profile text.
          </p>
          <div className="flex flex-wrap gap-2">
            <PrimaryButton
              onClick={() => {
                onOpenAccount();
                dismiss();
              }}
            >
              <Crown size={16} /> Open Account
            </PrimaryButton>
            <SecondaryButton onClick={dismiss}>Later</SecondaryButton>
          </div>
        </div>
      </RewardSummary>
    </div>
  );
}

export default function Home() {
  const isClient = useIsClient();
  const store = useGameStore();
  const now = useNow();
  const hasRehydratedRef = useRef(false);
  const [tab, setTab] = useState<TabId>("expeditions");
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [expeditionSubview, setExpeditionSubview] = useState<ExpeditionSubviewId>("routes");
  const [heroSubview, setHeroSubview] = useState<HeroSubviewId>("overview");
  const [forgeSubview, setForgeSubview] = useState<ForgeSubviewId>("craft");
  const [reincarnationSubview, setReincarnationSubview] = useState<ReincarnationSubviewId>("overview");

  useEffect(() => {
    if (!isClient || hasRehydratedRef.current) {
      return;
    }
    hasRehydratedRef.current = true;
    void useGameStore.persist.rehydrate();
  }, [isClient]);

  const state = store.state;
  const onboardingFocused = isOnboardingFocused(state);
  const showAccountDiscovery =
    state.accountRank.accountRank >= 2 &&
    state.accountShowcase.firstDiscoveryPopupShown &&
    !state.accountShowcase.firstDiscoveryPopupDismissed;
  const hasOverlayMessage = Boolean(store.error || (!onboardingFocused && store.lastMessage));
  const overlayFocus: "result" | "offline" | "message" | "none" = store.lastExpeditionResult
    ? "result"
    : !onboardingFocused && store.lastOfflineSummary
      ? "offline"
      : hasOverlayMessage
        ? "message"
        : "none";

  useEffect(() => {
    if (!mobileSecondaryTabs.includes(tab)) {
      setMobileMoreOpen(false);
    }
  }, [tab]);

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
  let topSubtabOptions: Array<{ id: string; label: string }> | null = null;
  let topSubtabValue: string | null = null;
  let topSubtabChange: ((id: string) => void) | null = null;
  switch (tab) {
    case "expeditions":
      topSubtabOptions = [...EXPEDITION_SUBVIEWS];
      topSubtabValue = expeditionSubview;
      topSubtabChange = (id) => setExpeditionSubview(id as ExpeditionSubviewId);
      screen = (
        <ExpeditionsScreen
          state={state}
          now={now}
          store={store}
          onSelectTab={setTab}
          view={expeditionSubview}
          onViewChange={setExpeditionSubview}
          reducedMotion={state.settings.reducedMotion}
        />
      );
      break;
    case "hero":
      topSubtabOptions = [...HERO_SUBVIEWS];
      topSubtabValue = heroSubview;
      topSubtabChange = (id) => setHeroSubview(id as HeroSubviewId);
      screen = <HeroScreen state={state} store={store} view={heroSubview} onViewChange={setHeroSubview} reducedMotion={state.settings.reducedMotion} />;
      break;
    case "inventory":
      screen = <InventoryScreen state={state} store={store} />;
      break;
    case "forge":
      topSubtabOptions = [...FORGE_SUBVIEWS];
      topSubtabValue = forgeSubview;
      topSubtabChange = (id) => setForgeSubview(id as ForgeSubviewId);
      screen = <ForgeScreen state={state} store={store} view={forgeSubview} onViewChange={setForgeSubview} reducedMotion={state.settings.reducedMotion} />;
      break;
    case "town":
      screen = <TownScreen state={state} now={now} store={store} />;
      break;
    case "account":
      screen = <AccountShowcaseScreen state={state} store={store} />;
      break;
    case "dailies":
      screen = <DailiesScreen state={state} now={now} store={store} />;
      break;
    case "achievements":
      screen = <AchievementsScreen state={state} />;
      break;
    case "reincarnation":
      topSubtabOptions = [...REINCARNATION_SUBVIEWS];
      topSubtabValue = reincarnationSubview;
      topSubtabChange = (id) => setReincarnationSubview(id as ReincarnationSubviewId);
      screen = (
        <ReincarnationScreen
          state={state}
          store={store}
          view={reincarnationSubview}
          onViewChange={setReincarnationSubview}
          reducedMotion={state.settings.reducedMotion}
        />
      );
      break;
    case "settings":
      screen = <SettingsScreen state={state} store={store} />;
      break;
    default:
      screen = (
        <ExpeditionsScreen
          state={state}
          now={now}
          store={store}
          onSelectTab={setTab}
          view={expeditionSubview}
          onViewChange={setExpeditionSubview}
          reducedMotion={state.settings.reducedMotion}
        />
      );
      break;
  }

  return (
    <main className="min-h-screen pb-36 lg:pb-0">
      <Header state={state} />
      {topSubtabOptions && topSubtabValue && topSubtabChange && (
        <div className="mx-auto max-w-7xl px-4 pt-3">
          <SegmentedControl options={topSubtabOptions} value={topSubtabValue} onChange={topSubtabChange} />
        </div>
      )}
      <div className="mx-auto grid min-w-0 max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-4">
          {overlayFocus === "offline" && <OfflineSummaryPanel store={store} onSelectTab={setTab} />}
          {overlayFocus === "message" && <MessagePanel store={store} suppressNonError={onboardingFocused} />}
          {overlayFocus === "result" && <ExpeditionResultPanel state={state} store={store} onSelectTab={setTab} />}
          {screen}
        </div>
        <DesktopSide state={state} now={now} />
      </div>
      {showAccountDiscovery && <AccountShowcaseDiscoveryModal store={store} onOpenAccount={() => setTab("account")} />}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-amber-950/10 bg-parchment/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Primary navigation">
        {mobileMoreOpen && (
          <div className="mb-1 rounded-xl border border-amber-950/10 bg-white/90 p-1 shadow-card">
            <div className="grid grid-cols-2 gap-1">
              {mobileSecondaryTabs.map((id) => {
                const { label, Icon } = getTabMeta(id);
                return (
                  <button
                    key={id}
                    className={`ui-hover-surface flex min-h-11 min-w-0 items-center gap-2 rounded-lg px-2 text-xs font-black transition ${tab === id ? "bg-royal text-white shadow-card" : "text-ink"}`}
                    aria-current={tab === id ? "page" : undefined}
                    onClick={() => {
                      setTab(id);
                      setMobileMoreOpen(false);
                    }}
                  >
                    <Icon size={15} />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="grid w-full min-w-0 max-w-full grid-cols-5 gap-1 py-2">
          {mobilePrimaryTabs.map((id) => {
            const { label, Icon } = getTabMeta(id);
            return (
              <button
                key={id}
                className={`ui-hover-surface flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[0.64rem] font-black leading-none transition ${tab === id ? "bg-royal text-white shadow-card" : "text-ink"}`}
                aria-current={tab === id ? "page" : undefined}
                onClick={() => setTab(id)}
              >
                <Icon size={17} />
                <span>{label}</span>
              </button>
            );
          })}
          <button
            className={`ui-hover-surface flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[0.64rem] font-black leading-none transition ${
              mobileMoreOpen || mobileSecondaryTabs.includes(tab) ? "bg-royal text-white shadow-card" : "text-ink"
            }`}
            aria-expanded={mobileMoreOpen}
            onClick={() => setMobileMoreOpen((open) => !open)}
          >
            <MoreHorizontal size={17} />
            <span>More</span>
          </button>
        </div>
      </nav>

      <nav className="hidden border-t border-amber-950/10 bg-white/70 lg:block">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-3">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`ui-hover-surface inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-black transition ${tab === id ? "bg-royal text-white shadow-card" : "bg-white text-ink"}`}
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
