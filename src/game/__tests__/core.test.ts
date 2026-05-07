import { describe, expect, it } from "vitest";
import {
  BUILDINGS,
  DAILY_TASK_COUNT,
  DUNGEONS,
  HERO_CLASSES,
  INVENTORY_LIMIT,
  REINCARNATION_GATE_BOSS_ID,
  VIGOR_EXPEDITION_BOOST_COST,
  ZONES,
  applyDailyProgress,
  applyOfflineProgress,
  buyBuildingUpgrade,
  canPrestige,
  claimDailyTask,
  createInitialState,
  createRng,
  craftItem,
  ensureDailies,
  equipItem,
  getAvailableDungeons,
  getDurationMs,
  getItemUpgradeCost,
  getSuccessChance,
  importSave,
  loadSave,
  performPrestige,
  resolveExpedition,
  salvageItem,
  sellItem,
  serializeSave,
  startExpedition,
  upgradeItem
} from "@/game";

const NOW = 1_700_000_000_000;

function makeReadyState(seed = "seed") {
  const state = createInitialState(seed, NOW);
  state.settings.heroCreated = true;
  return ensureDailies(state, NOW).state;
}

function completeFirstExpedition() {
  const initial = makeReadyState("first-expedition");
  const started = startExpedition(initial, "tollroad-of-trinkets", NOW);
  expect(started.ok).toBe(true);
  if (!started.ok) throw new Error("failed to start");
  const resolved = resolveExpedition(started.state, NOW + 60_000);
  expect(resolved.ok).toBe(true);
  if (!resolved.ok) throw new Error("failed to resolve");
  return resolved;
}

describe("state and RNG determinism", () => {
  it("creates deterministic initial states with required systems", () => {
    const a = createInitialState("same", NOW, "mage");
    const b = createInitialState("same", NOW, "mage");
    expect(a).toEqual(b);
    expect(a.vigor.max).toBe(100);
    expect(a.dailies.tasks).toHaveLength(DAILY_TASK_COUNT);
    expect(a.settings.heroCreated).toBe(false);
  });

  it("uses deterministic rng sequences", () => {
    const a = createRng("same-seed");
    const b = createRng("same-seed");
    expect([a.next(), a.next(), a.int(1, 999)]).toEqual([b.next(), b.next(), b.int(1, 999)]);
  });
});

describe("expeditions, vigor, and loot", () => {
  it("only starts unlocked dungeons and resolves first run deterministically", () => {
    const initial = makeReadyState("expedition");
    expect(getAvailableDungeons(initial).map((dungeon) => dungeon.id)).toContain("tollroad-of-trinkets");
    expect(startExpedition(initial, "mossbright-cellar", NOW).ok).toBe(false);

    const first = completeFirstExpedition();
    const second = completeFirstExpedition();
    expect(first.summary.success).toBe(second.summary.success);
    expect(first.summary.item?.slot).toBe("weapon");
    expect(first.summary.item?.rarity).toBe("common");
  });

  it("spends vigor on boosted starts and applies bounds for success chance", () => {
    const initial = makeReadyState("vigor");
    initial.vigor.current = 100;
    const boosted = startExpedition(initial, "tollroad-of-trinkets", NOW, { useVigorBoost: true });
    expect(boosted.ok).toBe(true);
    if (!boosted.ok) throw new Error("boosted start failed");
    expect(boosted.state.vigor.current).toBe(100 - VIGOR_EXPEDITION_BOOST_COST);
    expect(boosted.state.activeExpedition?.vigorBoost).toBe(true);

    const easy = getSuccessChance(initial, DUNGEONS[0]);
    const hard = getSuccessChance(initial, DUNGEONS[DUNGEONS.length - 1]);
    expect(easy).toBeGreaterThanOrEqual(0.15);
    expect(easy).toBeLessThanOrEqual(0.96);
    expect(hard).toBeGreaterThanOrEqual(0.15);
    expect(hard).toBeLessThanOrEqual(0.96);
  });

  it("auto-salvages loot at inventory cap instead of exceeding cap", () => {
    const resolved = completeFirstExpedition();
    const capped = structuredClone(resolved.state);
    while (capped.inventory.length < INVENTORY_LIMIT) {
      const source = capped.inventory[0];
      const clone = structuredClone(source);
      clone.id = `${clone.id}-${capped.inventory.length}`;
      capped.inventory.push(clone);
    }
    capped.resources.ore = 0;
    const secondStart = startExpedition(capped, "tollroad-of-trinkets", NOW + 100_000);
    expect(secondStart.ok).toBe(true);
    if (!secondStart.ok) throw new Error("start failed");
    const secondResolve = resolveExpedition(secondStart.state, NOW + 200_000);
    expect(secondResolve.ok).toBe(true);
    if (!secondResolve.ok) throw new Error("resolve failed");
    expect(secondResolve.state.inventory.length).toBe(INVENTORY_LIMIT);
    if (secondResolve.summary.autoSalvagedItem) {
      expect(secondResolve.state.resources.ore).toBeGreaterThan(0);
    }
  });
});

describe("inventory and forge actions", () => {
  it("equips, sells, and salvages with deterministic transitions", () => {
    const resolved = completeFirstExpedition();
    const firstItem = resolved.state.inventory[0];
    const equipped = equipItem(resolved.state, firstItem.id, NOW + 1);
    expect(equipped.ok).toBe(true);
    if (!equipped.ok) throw new Error("equip failed");
    expect(equipped.state.equipment.weapon?.id).toBe(firstItem.id);

    const second = completeFirstExpedition();
    const sold = sellItem(second.state, second.state.inventory[0].id, NOW + 2);
    expect(sold.ok).toBe(true);
    if (!sold.ok) throw new Error("sell failed");
    expect(sold.state.lifetime.totalItemsSold).toBeGreaterThanOrEqual(1);

    const third = completeFirstExpedition();
    const salvaged = salvageItem(third.state, third.state.inventory[0].id, NOW + 3);
    expect(salvaged.ok).toBe(true);
    if (!salvaged.ok) throw new Error("salvage failed");
    expect(salvaged.state.lifetime.totalItemsSalvaged).toBeGreaterThanOrEqual(1);
  });

  it("crafts and upgrades items through forge actions", () => {
    const state = makeReadyState("forge");
    state.resources.gold = 100_000;
    state.resources.ore = 100_000;
    state.resources.crystal = 100_000;
    state.resources.rune = 100_000;
    state.resources.relicFragment = 100_000;

    const crafted = craftItem(state, NOW + 10, { classBias: true });
    expect(crafted.ok).toBe(true);
    if (!crafted.ok) throw new Error("craft failed");
    expect(crafted.state.lifetime.totalItemsCrafted).toBe(1);
    expect(crafted.state.inventory.length).toBeGreaterThan(0);

    const target = crafted.state.inventory[0];
    const cost = getItemUpgradeCost(crafted.state, target);
    expect(cost.gold).toBeGreaterThan(0);
    const upgraded = upgradeItem(crafted.state, target.id, NOW + 20);
    expect(upgraded.ok).toBe(true);
    if (!upgraded.ok) throw new Error("upgrade failed");
    expect(upgraded.state.inventory[0].upgradeLevel).toBe(1);
  });
});

describe("town, dailies, offline, and saves", () => {
  it("upgrades buildings with scaled costs", () => {
    const state = makeReadyState("town");
    state.resources.gold = 10_000;
    state.resources.ore = 10_000;
    const upgraded = buyBuildingUpgrade(state, "forge", NOW + 1);
    expect(upgraded.ok).toBe(true);
    if (!upgraded.ok) throw new Error("upgrade failed");
    expect(upgraded.state.town.forge).toBe(1);
  });

  it("tracks and claims dailies once", () => {
    const state = makeReadyState("daily");
    const progressed = applyDailyProgress(state, NOW + 1, {
      complete_expeditions: 10,
      win_expeditions: 10,
      defeat_boss: 10,
      salvage_items: 10,
      sell_items: 10,
      craft_item: 10,
      upgrade_building: 10,
      spend_vigor: 100
    }).state;
    const claimable = progressed.dailies.tasks.find((task) => task.progress >= task.target);
    expect(claimable).toBeDefined();
    if (!claimable) throw new Error("no claimable daily");

    const claimed = claimDailyTask(progressed, claimable.id, NOW + 2);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) throw new Error("claim failed");
    const claimedAgain = claimDailyTask(claimed.state, claimable.id, NOW + 3);
    expect(claimedAgain.ok).toBe(false);
  });

  it("resets dailies at 23:00 UTC boundary", () => {
    const at2259 = Date.UTC(2026, 0, 1, 22, 59, 0);
    const state = createInitialState("boundary", at2259);
    state.settings.heroCreated = true;
    const seeded = ensureDailies(state, at2259).state;
    const beforeKey = seeded.dailies.lastTaskSetKey;
    const after = ensureDailies(seeded, Date.UTC(2026, 0, 1, 23, 0, 1)).state;
    expect(after.dailies.windowStartAt).toBeGreaterThanOrEqual(Date.UTC(2026, 0, 1, 23, 0, 0));
    expect(after.dailies.lastTaskSetKey).not.toBe(beforeKey);
  });

  it("applies offline expedition, mine, vigor, and cap behavior", () => {
    const state = makeReadyState("offline");
    state.town.mine = 6;
    state.vigor.current = 0;
    const started = startExpedition(state, "tollroad-of-trinkets", NOW);
    expect(started.ok).toBe(true);
    if (!started.ok) throw new Error("start failed");
    const offline = applyOfflineProgress(started.state, NOW + 9 * 60 * 60 * 1000);
    expect(offline.capped).toBe(true);
    expect(offline.summary).not.toBeNull();
    expect(offline.state.vigor.current).toBeGreaterThan(0);
    expect(offline.state.resources.ore).toBeGreaterThanOrEqual(0);
  });

  it("round-trips save import/export and rejects invalid JSON", () => {
    const state = makeReadyState("save");
    const raw = serializeSave(state, NOW + 1);
    expect(loadSave(raw).ok).toBe(true);
    expect(importSave(raw, NOW + 2).ok).toBe(true);
    expect(importSave("{bad", NOW + 3).ok).toBe(false);
  });
});

describe("reincarnation gate and pacing checks", () => {
  it("requires level 18 and region 3 boss clear", () => {
    const state = makeReadyState("rebirth");
    state.hero.level = 18;
    expect(canPrestige(state)).toBe(false);
    state.dungeonClears[REINCARNATION_GATE_BOSS_ID] = 1;
    expect(canPrestige(state)).toBe(true);
    const result = performPrestige(state, NOW + 1);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("reincarnation failed");
    expect(result.state.hero.level).toBe(1);
    expect(result.state.resources.renown).toBeGreaterThanOrEqual(1);
  });

  it("meets debug and production timing windows for first reincarnation route", () => {
    const production = makeReadyState("pacing-production");
    const debug = makeReadyState("pacing-debug");
    debug.settings.debugBalance = true;
    debug.mode = "debug";

    const route: typeof DUNGEONS = [];
    for (const dungeon of DUNGEONS) {
      route.push(dungeon);
      if (dungeon.id === REINCARNATION_GATE_BOSS_ID) break;
    }

    const productionMs = route.reduce((sum, dungeon) => sum + getDurationMs(production, dungeon), 0);
    const debugMs = route.reduce((sum, dungeon) => sum + getDurationMs(debug, dungeon), 0);

    expect(productionMs).toBeGreaterThanOrEqual(30 * 60 * 1000);
    expect(productionMs).toBeLessThanOrEqual(60 * 60 * 1000);
    expect(debugMs).toBeGreaterThanOrEqual(5 * 60 * 1000);
    expect(debugMs).toBeLessThanOrEqual(10 * 60 * 1000);
  });
});

describe("content counts", () => {
  it("keeps mandatory v1 content counts locked", () => {
    expect(HERO_CLASSES).toHaveLength(3);
    expect(ZONES).toHaveLength(5);
    expect(DUNGEONS).toHaveLength(20);
    expect(DUNGEONS.filter((dungeon) => dungeon.boss)).toHaveLength(5);
    expect(BUILDINGS).toHaveLength(6);
  });
});
