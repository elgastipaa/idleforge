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
  Upload,
  XCircle
} from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import type { GameStore } from "@/store/useGameStore";
import {
  BUILDINGS,
  CLASS_PASSIVE_TEXT,
  DUNGEONS,
  HERO_CLASSES,
  INVENTORY_LIMIT,
  INVENTORY_NEAR_FULL_THRESHOLD,
  RARITY_LABEL,
  RENOWN_UPGRADES,
  VIGOR_EXPEDITION_BOOST_COST,
  canAfford,
  canPrestige,
  calculatePrestigeRenown,
  getAvailableDungeons,
  getBuildingCost,
  getCraftCost,
  getDerivedStats,
  getDungeon,
  getDungeonView,
  getItemScore,
  getItemUpgradeCost,
  getNextGoal,
  getRenownUpgradeCost,
  getUnlockText,
  getZoneForDungeon,
  xpToNextLevel,
  type BuildingId,
  type DungeonDefinition,
  type EquipmentSlot,
  type GameState,
  type Item,
  type ItemRarity,
  type RenownUpgradeId,
  type ResourceState,
  type Stats
} from "@/game";

type TabId = "expeditions" | "hero" | "inventory" | "forge" | "town" | "dailies" | "reincarnation" | "settings";

const tabs: { id: TabId; label: string; Icon: typeof Swords }[] = [
  { id: "expeditions", label: "Expeditions", Icon: Swords },
  { id: "hero", label: "Hero", Icon: Crown },
  { id: "inventory", label: "Inventory", Icon: Backpack },
  { id: "forge", label: "Forge", Icon: Flame },
  { id: "town", label: "Town", Icon: Hammer },
  { id: "dailies", label: "Dailies", Icon: Star },
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

function rarityClass(rarity: ItemRarity): string {
  switch (rarity) {
    case "legendary":
      return "border-amber-400 bg-amber-50 text-amber-950";
    case "epic":
      return "border-violet-400 bg-violet-50 text-violet-950";
    case "rare":
      return "border-sky-400 bg-sky-50 text-sky-950";
    default:
      return "border-stone-300 bg-stone-50 text-stone-800";
  }
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-amber-950/10 bg-white/90 p-4 shadow-card ${className}`}>{children}</section>;
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}>{children}</span>;
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-royal px-4 py-2 text-sm font-black text-white transition hover:bg-ink disabled:bg-stone-300 disabled:text-stone-500 ${className}`}
      {...rest}
    />
  );
}

function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm font-bold text-ink transition hover:bg-parchment disabled:bg-stone-100 disabled:text-stone-400 ${className}`}
      {...rest}
    />
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
          <h1 className="text-2xl font-black">Relic Forge Idle</h1>
          <p className="mt-2 text-sm font-semibold text-stone-700">Create your hero and launch the first expedition.</p>
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
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-black">Relic Forge Idle</h1>
            <p className="text-sm font-semibold text-royal">{getNextGoal(state)}</p>
          </div>
          <Pill className="border-emerald/20 bg-emerald-50 text-emerald">
            Power {formatNumber(stats.powerScore)}
          </Pill>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["gold", "ore", "crystal", "rune", "relicFragment", "renown"] as const).map((resource) => (
            <Pill key={resource} className="shrink-0 border-stone-200 bg-white text-stone-700">
              {resource === "gold" ? <Coins size={13} /> : resource === "ore" ? <Pickaxe size={13} /> : <Gem size={13} />}
              {resourceLabels[resource]} {formatNumber(state.resources[resource])}
            </Pill>
          ))}
          <Pill className="shrink-0 border-royal/20 bg-blue-50 text-royal">
            <Flame size={13} /> Vigor {state.vigor.current}/{state.vigor.max}
          </Pill>
        </div>
      </div>
    </header>
  );
}

function MessagePanel({ store }: { store: GameStore }) {
  if (!store.error && !store.lastMessage && !store.lastSummary) return null;
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          {store.error ? (
            <p className="flex items-center gap-2 text-sm font-bold text-red-700">
              <XCircle size={16} /> {store.error}
            </p>
          ) : (
            <p className="flex items-center gap-2 text-sm font-bold text-royal">
              <CheckCircle2 size={16} /> {store.lastMessage}
            </p>
          )}
          {store.lastSummary && (
            <div className="space-y-1 text-sm text-stone-700">
              <p>{store.lastSummary.combatReport}</p>
              <p>
                +{formatNumber(store.lastSummary.rewards.xp)} XP, +{formatNumber(store.lastSummary.rewards.gold)} Gold
                {formatResources(store.lastSummary.rewards.materials) ? `, ${formatResources(store.lastSummary.rewards.materials)}` : ""}
              </p>
              {store.lastSummary.item && <p>Loot: {store.lastSummary.item.name}</p>}
              {store.lastSummary.autoSalvagedItem && <p>Auto-salvaged: {store.lastSummary.autoSalvagedItem.name}</p>}
              {store.lastSummary.vigorBoostUsed && <p className="font-bold text-royal">Vigor Boost applied (2.0x rewards).</p>}
            </div>
          )}
        </div>
        <button className="text-sm font-bold text-stone-500 hover:text-stone-800" onClick={store.clearMessage}>
          Dismiss
        </button>
      </div>
    </Card>
  );
}

function ActiveExpeditionPanel({ state, now, store }: { state: GameState; now: number; store: GameStore }) {
  if (!state.activeExpedition) {
    return (
      <Card className="border-emerald/20 bg-emerald-50/70">
        <p className="font-bold text-emerald">No active expedition. Pick a dungeon card to start.</p>
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
        <div className="h-3 rounded-full bg-stone-200">
          <div className="h-full rounded-full bg-royal transition-all" style={{ width: `${progress}%` }} />
        </div>
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

function ExpeditionsScreen({ state, now, store }: { state: GameState; now: number; store: GameStore }) {
  const [useVigorBoost, setUseVigorBoost] = useState(false);
  const available = getAvailableDungeons(state);
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Expedition Board</h2>
            <p className="text-sm font-semibold text-stone-700">One active expedition at a time. Use Vigor to double rewards.</p>
          </div>
          <label className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm font-bold">
            <input type="checkbox" checked={useVigorBoost} onChange={(event) => setUseVigorBoost(event.target.checked)} />
            Use Vigor Boost ({VIGOR_EXPEDITION_BOOST_COST} cost)
          </label>
        </div>
      </Card>
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
                  <DungeonCard key={dungeon.id} state={state} dungeon={dungeon} store={store} useVigorBoost={useVigorBoost} />
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

function InventoryItemCard({ state, item, store }: { state: GameState; item: Item; store: GameStore }) {
  const equipped = state.equipment[item.slot];
  const delta = getItemScore(item) - getItemScore(equipped);
  return (
    <Card className={rarityClass(item.rarity)}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Pill className={rarityClass(item.rarity)}>{RARITY_LABEL[item.rarity]}</Pill>
            <h3 className="mt-2 font-black">{item.name}</h3>
            <p className="text-sm font-semibold text-stone-700">
              {slotLabels[item.slot]} · ilvl {item.itemLevel} · +{item.upgradeLevel}
            </p>
          </div>
          <Pill className={delta >= 0 ? "border-emerald/30 bg-emerald-100 text-emerald" : "border-red-200 bg-red-100 text-red-700"}>
            {delta >= 0 ? "+" : ""}
            {delta}
          </Pill>
        </div>
        <p className="text-sm text-stone-700">{formatStats(item.stats)}</p>
        <p className="text-xs font-semibold text-stone-600">{item.affixes.map((affix) => affix.name).join(", ")}</p>
        <div className="grid grid-cols-3 gap-2">
          <PrimaryButton className="px-2" onClick={() => store.equipItem(item.id)}>
            Equip
          </PrimaryButton>
          <SecondaryButton onClick={() => store.sellItem(item.id)}>Sell</SecondaryButton>
          <SecondaryButton onClick={() => store.salvageItem(item.id)}>Salvage</SecondaryButton>
        </div>
      </div>
    </Card>
  );
}

function InventoryScreen({ state, store }: { state: GameState; store: GameStore }) {
  const [filter, setFilter] = useState<"all" | EquipmentSlot>("all");
  const items = state.inventory.filter((item) => filter === "all" || item.slot === filter);
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Inventory</h2>
            <p className="text-sm font-semibold text-stone-700">
              {state.inventory.length}/{INVENTORY_LIMIT} slots. Overflowed loot auto-salvages.
            </p>
          </div>
          <select className="min-h-11 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold" value={filter} onChange={(event) => setFilter(event.target.value as "all" | EquipmentSlot)}>
            <option value="all">All Slots</option>
            {(Object.keys(slotLabels) as EquipmentSlot[]).map((slot) => (
              <option key={slot} value={slot}>
                {slotLabels[slot]}
              </option>
            ))}
          </select>
        </div>
      </Card>
      {state.inventory.length >= INVENTORY_NEAR_FULL_THRESHOLD && (
        <Card className="border-amber-400 bg-amber-50">
          <p className="font-bold text-amber-900">Inventory pressure warning: near capacity ({state.inventory.length}/{INVENTORY_LIMIT}).</p>
        </Card>
      )}
      {items.length === 0 ? (
        <Card className="text-center">
          <Backpack className="mx-auto text-stone-400" />
          <p className="mt-2 text-sm font-semibold text-stone-700">No items in this filter.</p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <InventoryItemCard key={item.id} state={state} item={item} store={store} />
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
  const upgradeCandidates = [
    ...state.inventory,
    ...((Object.values(state.equipment).filter(Boolean) as Item[]) ?? [])
  ];

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-black">Relic Forge</h2>
        <p className="text-sm font-semibold text-stone-700">Craft random gear and upgrade item level using materials.</p>
      </Card>
      <Card>
        <div className="space-y-3">
          <h3 className="font-black">Craft Item</h3>
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
            <PrimaryButton onClick={() => store.craftItem(slot === "any" ? undefined : slot, classBias)}>
              <Flame size={16} /> Craft
            </PrimaryButton>
          </div>
          <p className="text-sm font-semibold text-stone-700">Cost: {formatResources(craftCost)}</p>
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
                <div key={item.id} className="rounded-lg border border-stone-200 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-xs font-semibold text-stone-600">
                        {slotLabels[item.slot]} · ilvl {item.itemLevel} · +{item.upgradeLevel}
                      </p>
                    </div>
                    <PrimaryButton onClick={() => store.upgradeItem(item.id)} disabled={!affordable || item.upgradeLevel >= 10}>
                      Upgrade
                    </PrimaryButton>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-stone-700">Cost: {formatResources(cost)}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function TownScreen({ state, store }: { state: GameState; store: GameStore }) {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-black">Town Buildings</h2>
        <p className="text-sm font-semibold text-stone-700">Forge, Mine, Tavern, Market, Library, and Shrine drive long-term growth.</p>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {BUILDINGS.map((building) => {
          const level = state.town[building.id];
          const cost = getBuildingCost(state, building.id);
          const affordable = canAfford(state.resources, cost);
          return (
            <Card key={building.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black">{building.name}</h3>
                    <p className="text-sm text-stone-700">{building.description}</p>
                  </div>
                  <Pill className="border-royal/20 bg-blue-50 text-royal">
                    {level}/{building.maxLevel}
                  </Pill>
                </div>
                <p className="text-sm font-semibold text-stone-700">Current: {building.effectText(level)}</p>
                {level < building.maxLevel && <p className="text-sm font-semibold text-stone-700">Next: {building.effectText(level + 1)}</p>}
                <p className="text-sm font-semibold text-stone-700">Cost: {formatResources(cost)}</p>
                <PrimaryButton onClick={() => store.buyBuilding(building.id as BuildingId)} disabled={!affordable || level >= building.maxLevel}>
                  <Hammer size={16} /> {level >= building.maxLevel ? "Maxed" : affordable ? "Upgrade" : "Need Resources"}
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
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-black">Daily Tasks</h2>
        <p className="text-sm font-semibold text-stone-700">3 tasks/day. Reset at 23:00 UTC. No streak penalties.</p>
        <p className="mt-2 text-sm font-bold text-royal">Reset in {formatMs(timeLeft)}</p>
      </Card>
      <div className="grid gap-3">
        {state.dailies.tasks.map((task) => {
          const done = task.progress >= task.target;
          return (
            <Card key={task.id} className={task.claimed ? "border-emerald/30 bg-emerald-50/70" : ""}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black">{task.label}</h3>
                  <p className="text-sm font-semibold text-stone-700">
                    Progress: {task.progress}/{task.target}
                  </p>
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

function ReincarnationScreen({ state, store }: { state: GameState; store: GameStore }) {
  const ready = canPrestige(state);
  const gain = calculatePrestigeRenown(state);
  const bossClear = (state.dungeonClears["curator-of-blue-fire"] ?? 0) > 0;
  return (
    <div className="space-y-4">
      <Card className={ready ? "border-amber-400 bg-amber-50/80" : ""}>
        <h2 className="text-lg font-black">Reincarnation</h2>
        <p className="text-sm font-semibold text-stone-700">Requirements: Level 18 and Region 3 boss clear.</p>
        <div className="mt-3 grid gap-2 text-sm font-semibold text-stone-700 md:grid-cols-2">
          <p>{state.hero.level >= 18 ? "Level gate met" : `Reach level 18 (${state.hero.level}/18)`}</p>
          <p>{bossClear ? "Region 3 boss defeated" : "Defeat Curator of Blue Fire"}</p>
        </div>
        <p className="mt-3 text-sm font-bold text-royal">Expected Soul Marks: +{gain}</p>
        <PrimaryButton
          className="mt-3"
          disabled={!ready}
          onClick={() => {
            if (window.confirm("Reincarnation resets level, resources, inventory, equipment, town, active expedition, and daily progress.")) {
              store.prestige();
            }
          }}
        >
          <Sparkles size={16} /> Reincarnate
        </PrimaryButton>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {RENOWN_UPGRADES.map((upgrade) => {
          const level = state.prestige.upgrades[upgrade.id];
          const cost = getRenownUpgradeCost(state, upgrade.id as RenownUpgradeId);
          return (
            <Card key={upgrade.id}>
              <h3 className="font-black">{upgrade.name}</h3>
              <p className="text-sm text-stone-700">{upgrade.description}</p>
              <p className="mt-2 text-sm font-semibold text-stone-700">
                Level {level} · Cost {cost}
              </p>
              <SecondaryButton className="mt-3 w-full" disabled={state.resources.renown < cost} onClick={() => store.buyRenownUpgrade(upgrade.id as RenownUpgradeId)}>
                Upgrade
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
        <SecondaryButton
          className="mt-3 border-red-300 text-red-800"
          onClick={() => {
            if (window.confirm("Delete local save?")) {
              store.resetSave();
              setExportText("");
              setImportText("");
            }
          }}
        >
          <RotateCcw size={16} /> Reset
        </SecondaryButton>
      </Card>
    </div>
  );
}

function DesktopSide({ state, now }: { state: GameState; now: number }) {
  const stats = getDerivedStats(state);
  const active = state.activeExpedition ? getDungeon(state.activeExpedition.dungeonId) : null;
  return (
    <aside className="hidden space-y-3 lg:block">
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
    <main className="min-h-screen pb-24 lg:pb-0">
      <Header state={state} />
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          <MessagePanel store={store} />
          {screen}
        </div>
        <DesktopSide state={state} now={now} />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-amber-950/10 bg-parchment/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-4 gap-1 py-2">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[0.64rem] font-black ${tab === id ? "bg-royal text-white" : "text-ink hover:bg-white/70"}`}
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
