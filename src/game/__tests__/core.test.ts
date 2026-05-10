import { describe, expect, it } from "vitest";
import {
  AFFIX_POOL,
  BUILDINGS,
  DAILY_RESET_HOUR_LOCAL,
  DAILY_TASK_COUNT,
  DUNGEONS,
  FORGE_AFFIX_REROLL_REQUIRED_LEVEL,
  HERO_CLASSES,
  INVENTORY_LIMIT,
  REINCARNATION_GATE_BOSS_ID,
  REINCARNATION_LEVEL_REQUIREMENT,
  RENOWN_UPGRADES,
  VIGOR_EXPEDITION_BOOST_COST,
  VIGOR_REGEN_INTERVAL_MS,
  ZONES,
  applyDailyProgress,
  applyOfflineProgress,
  buyBuildingUpgrade,
  canAfford,
  canPrestige,
  claimDailyTask,
  createInitialState,
  createRng,
  craftItem,
  ensureDailies,
  equipItem,
  getAvailableDungeons,
  getAffixRerollCost,
  getBuildingCost,
  getCraftCost,
  getDerivedStats,
  getDurationMs,
  getDailyWindowStartAt,
  getGoldMultiplier,
  getItemUpgradeCost,
  getLootChance,
  getMaterialMultiplier,
  getMineOfflineRate,
  getNextDailyResetAt,
  getNextGoal,
  getSellMultiplier,
  getSuccessChance,
  getVigorBoostCost,
  getXpMultiplier,
  importSave,
  loadSave,
  performPrestige,
  regenerateVigor,
  rerollItemAffix,
  resolveExpedition,
  salvageItem,
  sellItem,
  serializeSave,
  startExpedition,
  upgradeItem,
  xpToNextLevel
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

function getBuildingEffectText(id: string, level: number) {
  const building = BUILDINGS.find((entry) => entry.id === id);
  if (!building) throw new Error(`Missing building ${id}`);
  return building.effectText(level);
}

function getAffix(id: string) {
  const affix = AFFIX_POOL.find((entry) => entry.id === id);
  if (!affix) throw new Error(`Missing affix ${id}`);
  return affix;
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
    expect(first.summary.firstGuaranteedWeapon).toBe(true);
    expect(first.summary.itemComparison?.isBetter).toBe(true);
    expect(first.summary.itemComparison?.statDeltas.power ?? 0).toBeGreaterThan(0);
    expect(first.summary.unlockedDungeons.map((dungeon) => dungeon.id)).toContain("mossbright-cellar");
  });

  it("spends vigor on boosted claims and applies bounds for success chance", () => {
    const initial = makeReadyState("vigor");
    initial.vigor.current = 100;
    const boosted = startExpedition(initial, "tollroad-of-trinkets", NOW);
    expect(boosted.ok).toBe(true);
    if (!boosted.ok) throw new Error("boosted start failed");
    const boostedResolved = resolveExpedition(boosted.state, NOW + 60_000, { useVigorBoost: true });
    expect(boostedResolved.ok).toBe(true);
    if (!boostedResolved.ok) throw new Error("boosted resolve failed");
    expect(boostedResolved.state.vigor.current).toBe(100 - VIGOR_EXPEDITION_BOOST_COST);
    expect(boostedResolved.summary.vigorBoostUsed).toBe(true);

    const easy = getSuccessChance(initial, DUNGEONS[0]);
    const hard = getSuccessChance(initial, DUNGEONS[DUNGEONS.length - 1]);
    expect(easy).toBeGreaterThanOrEqual(0.15);
    expect(easy).toBeLessThanOrEqual(0.96);
    expect(hard).toBeGreaterThanOrEqual(0.15);
    expect(hard).toBeLessThanOrEqual(0.96);
  });

  it("regenerates vigor to cap and doubles selected expedition rewards", () => {
    const regen = makeReadyState("vigor-regen");
    regen.vigor.current = regen.vigor.max - 2;
    regen.vigor.lastTickAt = NOW;
    const gained = regenerateVigor(regen, NOW + VIGOR_REGEN_INTERVAL_MS * 10);
    expect(gained.gained).toBe(2);
    expect(regen.vigor.current).toBe(regen.vigor.max);

    const normalState = makeReadyState("vigor-reward");
    const boostedState = makeReadyState("vigor-reward");
    boostedState.vigor.current = 100;
    const normalStarted = startExpedition(normalState, "tollroad-of-trinkets", NOW);
    const boostedStarted = startExpedition(boostedState, "tollroad-of-trinkets", NOW);
    expect(normalStarted.ok).toBe(true);
    expect(boostedStarted.ok).toBe(true);
    if (!normalStarted.ok || !boostedStarted.ok) throw new Error("start failed");

    const normalResolved = resolveExpedition(normalStarted.state, NOW + 60_000);
    const boostedResolved = resolveExpedition(boostedStarted.state, NOW + 60_000, { useVigorBoost: true });
    expect(normalResolved.ok).toBe(true);
    expect(boostedResolved.ok).toBe(true);
    if (!normalResolved.ok || !boostedResolved.ok) throw new Error("resolve failed");
    expect(boostedResolved.summary.vigorBoostUsed).toBe(true);
    expect(boostedResolved.summary.rewards.xp).toBe(normalResolved.summary.rewards.xp * 2);
    expect(boostedResolved.summary.rewards.gold).toBe(normalResolved.summary.rewards.gold * 2);
  });

  it("keeps first-session milestones fast, affordable, and goal-driven", () => {
    const initial = makeReadyState("first-session");
    expect(getNextGoal(initial)).toContain("Start Tollroad of Trinkets");
    const firstExpeditionMs = getDurationMs(initial, DUNGEONS[0]);
    const firstTwoMs = DUNGEONS.slice(0, 2).reduce((sum, dungeon) => sum + getDurationMs(initial, dungeon), 0);
    const firstBossMs = DUNGEONS.slice(0, 4).reduce((sum, dungeon) => sum + getDurationMs(initial, dungeon), 0);
    expect(firstExpeditionMs).toBeLessThanOrEqual(30_000);
    expect(firstExpeditionMs).toBeLessThanOrEqual(2 * 60_000);
    expect(firstTwoMs).toBeLessThanOrEqual(5 * 60_000);
    expect(firstBossMs).toBeGreaterThanOrEqual(15 * 60 * 1000);
    expect(firstBossMs).toBeLessThanOrEqual(25 * 60 * 1000);

    const first = completeFirstExpedition();
    const firstItem = first.state.inventory[0];
    expect(getNextGoal(first.state)).toContain("Equip");

    const firstThree = DUNGEONS.slice(0, 3);
    const firstTwo = DUNGEONS.slice(0, 2);
    const townResources = makeReadyState("first-session-town").resources;
    firstTwo.forEach((dungeon) => {
      townResources.gold += dungeon.baseGold;
      townResources.ore += dungeon.materials.ore ?? 0;
      townResources.crystal += dungeon.materials.crystal ?? 0;
    });
    expect(canAfford(townResources, getBuildingCost(initial, "forge"))).toBe(true);

    const earlyResources = makeReadyState("first-session-resources").resources;
    firstThree.forEach((dungeon) => {
      earlyResources.gold += dungeon.baseGold;
      earlyResources.ore += dungeon.materials.ore ?? 0;
      earlyResources.crystal += dungeon.materials.crystal ?? 0;
    });

    const itemUpgradeCost = getItemUpgradeCost(first.state, firstItem);
    const forgeBuildingCost = getBuildingCost(first.state, "forge");
    expect(canAfford(earlyResources, itemUpgradeCost)).toBe(true);
    expect(canAfford(earlyResources, forgeBuildingCost)).toBe(true);

    const afterEarlySpends = makeReadyState("first-session-craft");
    afterEarlySpends.hero.level = 3;
    [...firstThree, DUNGEONS[3]].forEach((dungeon) => {
      afterEarlySpends.dungeonClears[dungeon.id] = 1;
      afterEarlySpends.resources.gold += dungeon.baseGold;
      afterEarlySpends.resources.ore += dungeon.materials.ore ?? 0;
      afterEarlySpends.resources.crystal += dungeon.materials.crystal ?? 0;
    });
    afterEarlySpends.resources.gold -= (itemUpgradeCost.gold ?? 0) + (forgeBuildingCost.gold ?? 0);
    afterEarlySpends.resources.ore -= (itemUpgradeCost.ore ?? 0) + (forgeBuildingCost.ore ?? 0);
    afterEarlySpends.resources.crystal -= (itemUpgradeCost.crystal ?? 0) + (forgeBuildingCost.crystal ?? 0);
    expect(canAfford(afterEarlySpends.resources, getCraftCost(afterEarlySpends))).toBe(true);
  });

  it("puts early rare-drop pressure inside the 5-10 minute window without guaranteeing every run", () => {
    const samples = 80;
    let rareWithinTenMinutes = 0;

    for (let index = 0; index < samples; index += 1) {
      let state = makeReadyState(`rare-window-${index}`);
      let now = NOW;
      let rareAt: number | null = null;

      for (const dungeon of DUNGEONS.slice(0, 3)) {
        while ((state.dungeonClears[dungeon.id] ?? 0) === 0 && now - NOW <= 10 * 60 * 1000) {
          const started = startExpedition(state, dungeon.id, now);
          expect(started.ok).toBe(true);
          if (!started.ok) throw new Error("rare-window start failed");
          now += getDurationMs(started.state, dungeon);
          const resolved = resolveExpedition(started.state, now);
          expect(resolved.ok).toBe(true);
          if (!resolved.ok) throw new Error("rare-window resolve failed");
          state = resolved.state;
          const item = resolved.summary.item;
          if (item && item.rarity !== "common" && rareAt === null) {
            rareAt = now - NOW;
          }
        }
      }

      if (rareAt !== null && rareAt <= 10 * 60 * 1000) {
        rareWithinTenMinutes += 1;
      }
    }

    expect(getLootChance(makeReadyState("rare-window-chance"), DUNGEONS[1])).toBeGreaterThanOrEqual(0.6);
    expect(rareWithinTenMinutes / samples).toBeGreaterThanOrEqual(0.45);
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

  it("ships broad gameplay affixes and applies equipped utility effects", () => {
    expect(AFFIX_POOL.length).toBeGreaterThanOrEqual(25);
    expect(AFFIX_POOL.some((affix) => affix.effects?.xpMultiplier)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.zoneGoldMultiplier?.emberwood)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.rareDropChance)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.bossRewardMultiplier)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.craftingDiscount)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.vigorBoostCostReduction)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.materialResourceMultiplier?.ore)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.shortMissionSuccessChance)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.longMissionLootChance)).toBe(true);

    const state = makeReadyState("affix-effects");
    const emberwoodDungeon = DUNGEONS.find((dungeon) => dungeon.zoneId === "emberwood" && !dungeon.boss) ?? DUNGEONS[4];
    const longDungeon = DUNGEONS.find((dungeon) => dungeon.durationMs >= 30 * 60 * 1000) ?? DUNGEONS[DUNGEONS.length - 1];
    const baseXp = getXpMultiplier(state);
    const baseGold = getGoldMultiplier(state, emberwoodDungeon);
    const baseLoot = getLootChance(state, longDungeon);
    const baseSuccess = getSuccessChance(state, DUNGEONS[0]);
    const baseCraftCost = getCraftCost(state);
    const baseVigorCost = getVigorBoostCost(state);

    state.equipment.weapon = {
      id: "affix-test-weapon",
      name: "Affix Test Blade",
      slot: "weapon",
      rarity: "legendary",
      itemLevel: 10,
      upgradeLevel: 0,
      stats: {},
      affixes: [
        getAffix("lessons"),
        getAffix("grove-greed"),
        getAffix("open-locks"),
        getAffix("long-hunt"),
        getAffix("scout"),
        getAffix("tempered-costs"),
        getAffix("deep-breath")
      ],
      sellValue: 1,
      salvageValue: { ore: 1 },
      sourceDungeonId: "test",
      createdAtRunId: 0
    };

    expect(getXpMultiplier(state)).toBeGreaterThan(baseXp);
    expect(getGoldMultiplier(state, emberwoodDungeon)).toBeGreaterThan(baseGold);
    expect(getLootChance(state, longDungeon)).toBeGreaterThan(baseLoot);
    expect(getSuccessChance(state, DUNGEONS[0])).toBeGreaterThan(baseSuccess);
    expect(getCraftCost(state).ore ?? 0).toBeLessThan(baseCraftCost.ore ?? 0);
    expect(getVigorBoostCost(state)).toBeLessThan(baseVigorCost);
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

  it("gates and rerolls one item affix through the forge", () => {
    const state = makeReadyState("forge-reroll");
    state.resources.gold = 100_000;
    state.resources.ore = 100_000;
    state.resources.crystal = 100_000;
    state.resources.rune = 100_000;
    state.resources.relicFragment = 100_000;

    const crafted = craftItem(state, NOW + 10, { slot: "weapon" });
    expect(crafted.ok).toBe(true);
    if (!crafted.ok) throw new Error("craft failed");
    const target = crafted.state.inventory[0];
    const originalAffix = target.affixes[0];

    const locked = rerollItemAffix(crafted.state, target.id, 0, NOW + 20);
    expect(locked.ok).toBe(false);
    if (locked.ok) throw new Error("reroll should be locked");
    expect(locked.error).toContain(`Forge level ${FORGE_AFFIX_REROLL_REQUIRED_LEVEL}`);

    crafted.state.town.forge = FORGE_AFFIX_REROLL_REQUIRED_LEVEL;
    const cost = getAffixRerollCost(crafted.state, target);
    expect(cost.gold).toBeGreaterThan(0);

    const rerolled = rerollItemAffix(crafted.state, target.id, 0, NOW + 30);
    expect(rerolled.ok).toBe(true);
    if (!rerolled.ok) throw new Error("reroll failed");
    expect(rerolled.state.inventory[0].affixes[0].id).not.toBe(originalAffix.id);
    expect(rerolled.state.resources.gold).toBeLessThan(crafted.state.resources.gold);
    expect(rerolled.message).toContain("rerolled into");
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

  it("keeps building effect text aligned with balance formulas", () => {
    const base = makeReadyState("building-labels-base");
    const state = makeReadyState("building-labels");
    state.town = {
      forge: 1,
      mine: 1,
      tavern: 1,
      library: 1,
      market: 1,
      shrine: 1
    };

    const baseStats = getDerivedStats(base);
    const stats = getDerivedStats(state);

    expect(stats.power - baseStats.power).toBe(3);
    expect(stats.defense - baseStats.defense).toBe(1);
    expect(stats.luck - baseStats.luck).toBe(1);
    expect(stats.stamina - baseStats.stamina).toBe(4);
    expect(stats.powerScore - baseStats.powerScore).toBe(6);
    expect(getXpMultiplier(state)).toBeCloseTo(1.04);
    expect(getMaterialMultiplier(state)).toBeCloseTo(1.08);
    expect(getGoldMultiplier(state)).toBeCloseTo(1.05);
    expect(getSellMultiplier(state)).toBeCloseTo(1.1);

    expect(getBuildingEffectText("forge", 1)).toBe("+3 power, +1 defense, +2 item stat budget");
    expect(getBuildingEffectText("mine", 1)).toBe("+8% expedition materials");
    expect(getBuildingEffectText("tavern", 1)).toBe("+4% XP, +4 stamina");
    expect(getBuildingEffectText("library", 1)).toBe("+0.4% success, +1 luck");
    expect(getBuildingEffectText("library", 12)).toBe("+4.8% success, +12 luck");
    expect(getBuildingEffectText("market", 1)).toBe("+5% gold, +10% sell value");
    expect(getBuildingEffectText("shrine", 1)).toBe("+2 power score, +4% Soul Marks on reincarnation");
  });

  it("keeps town building metadata and mine offline rates visible for the town UI", () => {
    expect(BUILDINGS).toHaveLength(6);
    BUILDINGS.forEach((building) => {
      expect(building.purpose.length).toBeGreaterThan(10);
      expect(building.milestones.length).toBeGreaterThanOrEqual(3);
    });

    const state = makeReadyState("mine-rate");
    state.town.mine = 6;
    expect(getMineOfflineRate(state)).toEqual({ ore: 24, crystal: 6, rune: 0.9, relicFragment: 0 });
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

    progressed.vigor.current = progressed.vigor.max - 1;
    const claimed = claimDailyTask(progressed, claimable.id, NOW + 2);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) throw new Error("claim failed");
    expect(claimed.state.vigor.current).toBe(claimed.state.vigor.max);
    const claimedAgain = claimDailyTask(claimed.state, claimable.id, NOW + 3);
    expect(claimedAgain.ok).toBe(false);
  });

  it("resets dailies at the local daily reset boundary", () => {
    const beforeReset = new Date(2026, 0, 1, DAILY_RESET_HOUR_LOCAL, 0, -1, 0).getTime();
    const afterReset = new Date(2026, 0, 1, DAILY_RESET_HOUR_LOCAL, 0, 1, 0).getTime();
    const expectedWindowStart = new Date(2026, 0, 1, DAILY_RESET_HOUR_LOCAL, 0, 0, 0).getTime();
    const expectedNextReset = new Date(2026, 0, 2, DAILY_RESET_HOUR_LOCAL, 0, 0, 0).getTime();
    const state = createInitialState("boundary", beforeReset);
    state.settings.heroCreated = true;
    const seeded = ensureDailies(state, beforeReset).state;
    const beforeKey = seeded.dailies.lastTaskSetKey;
    const after = ensureDailies(seeded, afterReset).state;
    expect(getDailyWindowStartAt(afterReset)).toBe(expectedWindowStart);
    expect(getNextDailyResetAt(afterReset)).toBe(expectedNextReset);
    expect(after.dailies.windowStartAt).toBe(expectedWindowStart);
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
    expect(offline.summary?.expedition).toBeNull();
    expect(offline.summary?.expeditionReady).toBe(true);
    expect(offline.state.activeExpedition).not.toBeNull();
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
  it("requires the configured level and region 3 boss clear", () => {
    const state = makeReadyState("rebirth");
    state.hero.level = REINCARNATION_LEVEL_REQUIREMENT;
    expect(canPrestige(state)).toBe(false);
    state.dungeonClears[REINCARNATION_GATE_BOSS_ID] = 1;
    expect(canPrestige(state)).toBe(true);
    const result = performPrestige(state, NOW + 1);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("reincarnation failed");
    expect(result.state.hero.level).toBe(1);
    expect(result.state.resources.renown).toBeGreaterThanOrEqual(1);
  });

  it("describes permanent upgrades with clear current and next-run effects", () => {
    expect(RENOWN_UPGRADES).toHaveLength(4);
    RENOWN_UPGRADES.forEach((upgrade) => {
      expect(upgrade.effectText(0)).toContain("No");
      expect(upgrade.effectText(1)).not.toBe(upgrade.effectText(0));
    });
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
    const productionXp = route.reduce((sum, dungeon) => sum + Math.floor(dungeon.baseXp * getXpMultiplier(production)), 0);
    const debugXp = route.reduce((sum, dungeon) => sum + Math.floor(dungeon.baseXp * getXpMultiplier(debug)), 0);
    const requiredXp = Array.from({ length: REINCARNATION_LEVEL_REQUIREMENT - 1 }, (_, index) => xpToNextLevel(index + 1)).reduce((sum, xp) => sum + xp, 0);

    expect(productionMs).toBeGreaterThanOrEqual(30 * 60 * 1000);
    expect(productionMs).toBeLessThanOrEqual(60 * 60 * 1000);
    expect(debugMs).toBeGreaterThanOrEqual(5 * 60 * 1000);
    expect(debugMs).toBeLessThanOrEqual(10 * 60 * 1000);
    expect(productionXp).toBeGreaterThanOrEqual(requiredXp);
    expect(debugXp).toBeGreaterThanOrEqual(requiredXp);
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
