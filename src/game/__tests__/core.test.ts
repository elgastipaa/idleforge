import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AFFIX_POOL,
  ACCOUNT_RANKS,
  BUILDINGS,
  BOSS_DEFINITIONS,
  DAILY_RESET_HOUR_LOCAL,
  DUNGEONS,
  EXPEDITION_PROGRESS_REWARDS,
  FORGE_AFFIX_REROLL_REQUIRED_LEVEL,
  HERO_CLASSES,
  INVENTORY_LIMIT,
  ITEM_FAMILIES,
  ITEM_TRAITS,
  LOOT_DROP_PITY_THRESHOLD,
  REINCARNATION_GATE_BOSS_ID,
  REINCARNATION_LEVEL_REQUIREMENT,
  RENOWN_UPGRADES,
  COLLECTION_PITY_THRESHOLD,
  FOCUS_EXPEDITION_BOOST_COST,
  FOCUS_MAX,
  FOCUS_REGEN_INTERVAL_MS,
  SAVE_GAME_NAME,
  SAVE_VERSION,
  ZONES,
  applyAccountXp,
  applyCollectionProgress,
  applyDailyProgress,
  applyExpeditionProgress,
  applyBossThreatsToSuccessChance,
  applyOfflineProgress,
  accelerateBuildingConstruction,
  buildShowcaseCopyText,
  buyBuildingUpgrade,
  buyRenownUpgrade,
  canAfford,
  canPrestige,
  cancelCaravanJob,
  cancelBuildingConstruction,
  changeHeroClassWithLaunchRules,
  claimDailyFocus,
  claimDailyTask,
  claimBuildingConstruction,
  claimCaravanJob,
  claimCaravanMasteryTier,
  claimMasteryTier,
  claimRegionDiaryReward,
  claimWeeklyQuest,
  createInitialState,
  createItem,
  createRng,
  craftItem,
  dismissAccountShowcaseDiscovery,
  ensureDailies,
  estimateCaravanRewards,
  estimateCaravanRewardsForRegion,
  equipItem,
  equipBestForContext,
  equipBuildPreset,
  getAvailableDungeons,
  getAffixRerollCost,
  getActiveRegionIds,
  getBossViewSummary,
  getBuildingCost,
  getCraftCost,
  getDerivedStats,
  getDurationMs,
  getDailyWindowStartAt,
  getGoldMultiplier,
  getItemUpgradeCost,
  getLootSlotWeights,
  getLootChance,
  getMaterialMultiplier,
  getNextDailyResetAt,
  getNextWeeklyResetAt,
  getNextGoal,
  getNextClaimableMasteryTier,
  getPinnedTrophyEntries,
  getSelectedTitleDefinition,
  getSellMultiplier,
  getSuccessChance,
  getFocusBoostCost,
  getFamilyResonanceSummaries,
  getFragmentGainPassiveMultiplier,
  getItemFamilyDefinition,
  getItemTraitDefinition,
  getCaravanMasterySummary,
  getRegionCompletionSummary,
  getRegionCollectionSummary,
  getRegionDiarySummary,
  getVisibleRegionCollectionSummaries,
  getWeeklyWindowStartAt,
  getXpMultiplier,
  fundRegionalMaterialSink,
  importSave,
  loadSave,
  performPrestige,
  regenerateFocus,
  rerollItemAffix,
  resolveExpedition,
  salvageItem,
  scoutBoss,
  sellItem,
  serializeSave,
  saveBuildPreset,
  selectRegionOutpostBonus,
  selectShowcaseTitle,
  setLootFocus,
  prepareBossThreat,
  recordBossAttemptResult,
  startCaravanJob,
  startExpedition,
  toggleItemLock,
  toggleShowcaseTrophy,
  upgradeItem,
  xpToNextLevel
} from "@/game";

const NOW = 1_700_000_000_000;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) return sourceFiles(path);
    return path.endsWith(".ts") || path.endsWith(".tsx") ? [path] : [];
  });
}

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
    expect(a.resources).toEqual({ gold: 0, fragments: 0, renown: 0 });
    expect(a.focus.current).toBe(FOCUS_MAX);
    expect(a.focus.cap).toBe(FOCUS_MAX);
    expect(a.focus.lastRegenAt).toBe(NOW);
    expect(a.dailies.tasks).toHaveLength(0);
    expect(a.loot.focusSlot).toBe("any");
    expect(a.loot.missesSinceDrop).toBe(0);
    expect(a.dungeonMastery).toEqual({});
    expect(a.accountRank).toMatchObject({ accountXp: 0, accountRank: 1, claimedRankRewards: [] });
    expect(a.rebirth).toMatchObject({ totalRebirths: 0, lastRebirthAt: null, classChangesUsedFreeSlot: false });
    expect(a.soulMarks).toMatchObject({ current: 0, lifetimeEarned: 0, discovered: false });
    expect(a.accountShowcase).toMatchObject({
      selectedTitleId: null,
      pinnedTrophyIds: [],
      accountSignatureMode: "auto",
      firstDiscoveryPopupShown: false,
      firstDiscoveryPopupDismissed: false
    });
    expect(a.dailyFocus).toMatchObject({ focusChargesBanked: 1, focusChargeProgress: 0 });
    expect(a.weeklyQuest).toMatchObject({ questId: "weekly-onboarding-charter", questClaimed: false });
    expect(a.weeklyQuest.steps.map((step) => [step.kind, step.target])).toEqual([
      ["clear_expeditions", 15],
      ["claim_mastery_milestone", 1]
    ]);
    expect(a.regionProgress.activeMaterialIds).toEqual(["sunlitTimber", "emberResin", "archiveGlyph", "stormglassShard", "oathEmber"]);
    expect(Object.keys(a.regionProgress.materials)).toEqual(["sunlitTimber", "emberResin", "archiveGlyph", "stormglassShard", "oathEmber"]);
    expect(a.construction.activeBuildingId).toBeNull();
    expect(a.classChange).toMatchObject({ freeChangeUsed: false, lastChangedAt: null });
    expect(a.traitCodex).toEqual({});
    expect(a.familyCodex).toEqual({});
    expect(a.titles).toEqual({});
    expect(a.trophies).toEqual({});
    expect(a.settings.heroCreated).toBe(false);
  });

  it("has no remaining legacy action-resource naming in source", () => {
    const legacy = ["vi", "gor"].join("");
    const legacyPattern = new RegExp(legacy, "i");
    const offenders = sourceFiles(join(process.cwd(), "src")).filter((path) => legacyPattern.test(readFileSync(path, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("uses deterministic rng sequences", () => {
    const a = createRng("same-seed");
    const b = createRng("same-seed");
    expect([a.next(), a.next(), a.int(1, 999)]).toEqual([b.next(), b.next(), b.int(1, 999)]);
  });
});

describe("expeditions, focus, and loot", () => {
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

  it("applies Phase 1 permanent progress from the numeric content table", () => {
    const initial = makeReadyState("phase-1-first-progress");
    const started = startExpedition(initial, "tollroad-of-trinkets", NOW);
    expect(started.ok).toBe(true);
    if (!started.ok) throw new Error("phase 1 start failed");
    expect(started.state.titles["title-first-charter"]?.unlockedAt).toBe(NOW);

    const resolved = resolveExpedition(started.state, NOW + 60_000);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) throw new Error("phase 1 resolve failed");
    expect(resolved.summary.success).toBe(true);
    expect(resolved.summary.progress.masteryXpGained).toBe(100);
    expect(resolved.summary.progress.accountXpGained).toBe(15);
    expect(resolved.summary.progress.regionalMaterials.sunlitTimber).toBe(1);
    expect(resolved.state.regionProgress.materials.sunlitTimber).toBe(1);
    expect(resolved.state.dungeonMastery["tollroad-of-trinkets"]).toMatchObject({ masteryXp: 100, claimedTiers: [] });
    expect(getNextClaimableMasteryTier(resolved.state, "tollroad-of-trinkets")?.tier).toBe(1);
    expect(resolved.summary.progress.newlyClaimableMasteryTiers.map((tier) => tier.tier)).toEqual([1]);
    expect(resolved.state.trophies["trophy-first-clear-token"]?.unlockedAt).toBe(NOW + 60_000);
  });

  it("claims mastery tiers once and grants Phase 1 title and trophy unlocks", () => {
    const first = completeFirstExpedition();
    const claimed = claimMasteryTier(first.state, "tollroad-of-trinkets", NOW + 61_000);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) throw new Error("mastery claim failed");
    expect(claimed.summary.tier.tier).toBe(1);
    expect(claimed.summary.accountXpGained).toBe(5);
    expect(claimed.summary.regionalMaterials.sunlitTimber).toBe(2);
    expect(claimed.state.dungeonMastery["tollroad-of-trinkets"].claimedTiers).toEqual([1]);
    expect(claimed.state.trophies["trophy-mapped-route-medal"]?.unlockedAt).toBe(NOW + 61_000);

    const duplicate = claimMasteryTier(claimed.state, "tollroad-of-trinkets", NOW + 62_000);
    expect(duplicate.ok).toBe(false);

    const readyForTier3 = structuredClone(claimed.state);
    readyForTier3.dungeonMastery["tollroad-of-trinkets"].masteryXp = 1500;
    const tier2 = claimMasteryTier(readyForTier3, "tollroad-of-trinkets", NOW + 63_000);
    expect(tier2.ok).toBe(true);
    if (!tier2.ok) throw new Error("tier 2 claim failed");
    expect(tier2.state.titles["title-known-route"]?.unlockedAt).toBe(NOW + 63_000);
    const tier3 = claimMasteryTier(tier2.state, "tollroad-of-trinkets", NOW + 64_000);
    expect(tier3.ok).toBe(true);
    if (!tier3.ok) throw new Error("tier 3 claim failed");
    expect(tier3.state.titles["title-tollroad-mapper"]?.unlockedAt).toBe(NOW + 64_000);
  });

  it("derives Account Rank 1-3 from Account XP and records the Rank 2 showcase discovery", () => {
    expect(ACCOUNT_RANKS.slice(0, 3).map((rank) => [rank.rank, rank.xp])).toEqual([
      [1, 0],
      [2, 100],
      [3, 260]
    ]);
    let state = makeReadyState("phase-1-account-rank");
    state.hero.baseStats = { power: 500, defense: 500, speed: 500, luck: 500, stamina: 500 };

    for (let run = 0; run < 7; run += 1) {
      const started = startExpedition(state, "tollroad-of-trinkets", NOW + run * 100_000);
      expect(started.ok).toBe(true);
      if (!started.ok) throw new Error("rank start failed");
      const resolved = resolveExpedition(started.state, NOW + run * 100_000 + 60_000);
      expect(resolved.ok).toBe(true);
      if (!resolved.ok) throw new Error("rank resolve failed");
      state = resolved.state;
    }

    expect(state.accountRank.accountXp).toBe(105);
    expect(state.accountRank.accountRank).toBe(2);
    expect(state.accountShowcase.firstDiscoveryPopupShown).toBe(true);
    expect(state.accountShowcase.firstDiscoveryPopupDismissed).toBe(false);
    expect(state.accountPersonalRecords.highestAccountRankReached).toBe(2);
  });

  it("selects Showcase titles, pins trophies, and builds a local copy snippet", () => {
    const first = completeFirstExpedition();
    const claimed = claimMasteryTier(first.state, "tollroad-of-trinkets", NOW + 61_000);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) throw new Error("showcase mastery claim failed");

    const selected = selectShowcaseTitle(claimed.state, "title-first-charter", NOW + 62_000);
    expect(selected.ok).toBe(true);
    if (!selected.ok) throw new Error("showcase title selection failed");
    expect(selected.state.accountShowcase.selectedTitleId).toBe("title-first-charter");
    expect(selected.state.accountShowcase.accountSignatureMode).toBe("manual");
    expect(getSelectedTitleDefinition(selected.state)?.name).toBe("First Charter");

    const lockedTitle = selectShowcaseTitle(selected.state, "title-cindermaw-breaker", NOW + 63_000);
    expect(lockedTitle.ok).toBe(false);

    const pinnedFirst = toggleShowcaseTrophy(selected.state, "trophy-first-clear-token", NOW + 64_000);
    expect(pinnedFirst.ok).toBe(true);
    if (!pinnedFirst.ok) throw new Error("first trophy pin failed");
    const pinnedSecond = toggleShowcaseTrophy(pinnedFirst.state, "trophy-mapped-route-medal", NOW + 65_000);
    expect(pinnedSecond.ok).toBe(true);
    if (!pinnedSecond.ok) throw new Error("second trophy pin failed");
    expect(getPinnedTrophyEntries(pinnedSecond.state).filter(Boolean).map((entry) => entry?.definition.id)).toEqual([
      "trophy-first-clear-token",
      "trophy-mapped-route-medal"
    ]);

    const snippet = buildShowcaseCopyText(pinnedSecond.state);
    expect(snippet).toContain("Account Rank 1");
    expect(snippet).toContain("Title: First Charter");
    expect(snippet).toContain("Trophy Shelf: First Clear Token, Mapped Route Medal");
    expect(snippet).toContain("Rebirths: 0");
    expect(snippet).toContain("Highest Power:");
    expect(snippet).toContain("Expeditions Completed: 1");
    expect(snippet).toContain("Mastery Tiers Claimed: 1");
    expect(snippet).toContain("Collections Completed: 0");
    expect(snippet).toContain("Region Diaries Claimed: 0");
    expect(snippet).toContain("Codex Discoveries:");
    expect(snippet).toContain("Caravan Mastery Tiers: 0");
    expect(snippet).not.toMatch(/leaderboard|global|server/i);
  });

  it("dismisses the one-time Rank 2 Account Showcase discovery moment", () => {
    const state = makeReadyState("showcase-discovery-dismiss");
    applyAccountXp(state, 100, NOW + 1);
    expect(state.accountRank.accountRank).toBe(2);
    expect(state.accountShowcase.firstDiscoveryPopupShown).toBe(true);
    expect(state.accountShowcase.firstDiscoveryPopupDismissed).toBe(false);

    const dismissed = dismissAccountShowcaseDiscovery(state, NOW + 2);
    expect(dismissed.accountShowcase.firstDiscoveryPopupDismissed).toBe(true);
  });

  it("spends focus on boosted claims and applies bounds for success chance", () => {
    const initial = makeReadyState("focus");
    initial.focus.current = 100;
    const boosted = startExpedition(initial, "tollroad-of-trinkets", NOW);
    expect(boosted.ok).toBe(true);
    if (!boosted.ok) throw new Error("boosted start failed");
    const boostedResolved = resolveExpedition(boosted.state, NOW + 60_000, { useFocusBoost: true });
    expect(boostedResolved.ok).toBe(true);
    if (!boostedResolved.ok) throw new Error("boosted resolve failed");
    expect(boostedResolved.state.focus.current).toBe(100 - FOCUS_EXPEDITION_BOOST_COST);
    expect(boostedResolved.summary.focusBoostUsed).toBe(true);

    const easy = getSuccessChance(initial, DUNGEONS[0]);
    const hard = getSuccessChance(initial, DUNGEONS[DUNGEONS.length - 1]);
    expect(easy).toBeGreaterThanOrEqual(0.15);
    expect(easy).toBeLessThanOrEqual(0.96);
    expect(hard).toBeGreaterThanOrEqual(0.15);
    expect(hard).toBeLessThanOrEqual(0.96);
  });

  it("regenerates focus to cap and doubles selected expedition rewards", () => {
    expect(FOCUS_REGEN_INTERVAL_MS).toBe(15 * 60 * 1000);
    const regen = makeReadyState("focus-regen");
    regen.focus.current = regen.focus.cap - 2;
    regen.focus.lastRegenAt = NOW;
    const oneTick = regenerateFocus(regen, NOW + FOCUS_REGEN_INTERVAL_MS);
    expect(oneTick.gained).toBe(1);
    expect(regen.focus.current).toBe(regen.focus.cap - 1);
    const gained = regenerateFocus(regen, NOW + FOCUS_REGEN_INTERVAL_MS * 10);
    expect(gained.gained).toBe(1);
    expect(regen.focus.current).toBe(regen.focus.cap);

    const normalState = makeReadyState("focus-reward");
    const boostedState = makeReadyState("focus-reward");
    boostedState.focus.current = 100;
    const normalStarted = startExpedition(normalState, "tollroad-of-trinkets", NOW);
    const boostedStarted = startExpedition(boostedState, "tollroad-of-trinkets", NOW);
    expect(normalStarted.ok).toBe(true);
    expect(boostedStarted.ok).toBe(true);
    if (!normalStarted.ok || !boostedStarted.ok) throw new Error("start failed");

    const normalResolved = resolveExpedition(normalStarted.state, NOW + 60_000);
    const boostedResolved = resolveExpedition(boostedStarted.state, NOW + 60_000, { useFocusBoost: true });
    expect(normalResolved.ok).toBe(true);
    expect(boostedResolved.ok).toBe(true);
    if (!normalResolved.ok || !boostedResolved.ok) throw new Error("resolve failed");
    expect(boostedResolved.summary.focusBoostUsed).toBe(true);
    expect(boostedResolved.summary.rewards.xp).toBe(normalResolved.summary.rewards.xp * 2);
    expect(boostedResolved.summary.rewards.gold).toBe(normalResolved.summary.rewards.gold * 2);
    expect(boostedResolved.summary.progress.masteryXpGained).toBe(normalResolved.summary.progress.masteryXpGained);
    expect(boostedResolved.summary.progress.accountXpGained).toBe(normalResolved.summary.progress.accountXpGained);
    expect(boostedResolved.summary.progress.regionalMaterials).toEqual(normalResolved.summary.progress.regionalMaterials);
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
    expect(getNextGoal(first.state)).toContain("Claim Mapped");
    const firstClaim = claimMasteryTier(first.state, "tollroad-of-trinkets", NOW + 61_000);
    expect(firstClaim.ok).toBe(true);
    if (!firstClaim.ok) throw new Error("first-session mastery claim failed");
    expect(getNextGoal(firstClaim.state)).toContain("Equip");

    const firstThree = DUNGEONS.slice(0, 3);
    const firstTwo = DUNGEONS.slice(0, 2);
    const townResources = makeReadyState("first-session-town").resources;
    firstTwo.forEach((dungeon) => {
      townResources.gold += dungeon.baseGold;
      townResources.fragments += dungeon.materials.fragments ?? 0;
    });
    expect(canAfford(townResources, getBuildingCost(initial, "forge"))).toBe(true);

    const earlyResources = makeReadyState("first-session-resources").resources;
    firstThree.forEach((dungeon) => {
      earlyResources.gold += dungeon.baseGold;
      earlyResources.fragments += dungeon.materials.fragments ?? 0;
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
      afterEarlySpends.resources.fragments += dungeon.materials.fragments ?? 0;
    });
    afterEarlySpends.resources.gold -= (itemUpgradeCost.gold ?? 0) + (forgeBuildingCost.gold ?? 0);
    afterEarlySpends.resources.fragments -= (itemUpgradeCost.fragments ?? 0) + (forgeBuildingCost.fragments ?? 0);
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
    capped.resources.fragments = 0;
    const secondStart = startExpedition(capped, "tollroad-of-trinkets", NOW + 100_000);
    expect(secondStart.ok).toBe(true);
    if (!secondStart.ok) throw new Error("start failed");
    const secondResolve = resolveExpedition(secondStart.state, NOW + 200_000);
    expect(secondResolve.ok).toBe(true);
    if (!secondResolve.ok) throw new Error("resolve failed");
    expect(secondResolve.state.inventory.length).toBe(INVENTORY_LIMIT);
    if (secondResolve.summary.autoSalvagedItem) {
      expect(secondResolve.state.resources.fragments).toBeGreaterThan(0);
    }
  });

  it("uses loot focus, early anti-duplicates, and pity for expedition drops", () => {
    const state = makeReadyState("loot-direction");
    state.lifetime.totalItemsFound = 12;
    const focused = setLootFocus(state, "relic", NOW);
    expect(focused.ok).toBe(true);
    if (!focused.ok) throw new Error("loot focus failed");

    const weights = getLootSlotWeights(focused.state);
    const relicWeight = weights.find((entry) => entry.slot === "relic")?.weight ?? 0;
    const unfocusedRelicWeight = getLootSlotWeights(state).find((entry) => entry.slot === "relic")?.weight ?? 0;
    expect(relicWeight).toBeGreaterThan(unfocusedRelicWeight);

    const duplicateGuard = makeReadyState("loot-anti-duplicate");
    duplicateGuard.lifetime.totalItemsFound = 2;
    duplicateGuard.loot.recentSlots = ["weapon"];
    const guardedWeights = getLootSlotWeights(duplicateGuard);
    const weaponWeight = guardedWeights.find((entry) => entry.slot === "weapon")?.weight ?? 0;
    const armorWeight = guardedWeights.find((entry) => entry.slot === "armor")?.weight ?? 0;
    expect(weaponWeight).toBeLessThan(armorWeight);

    const pityState = focused.state;
    pityState.hero.level = 10;
    pityState.hero.baseStats = { power: 500, defense: 500, speed: 500, luck: 500, stamina: 500 };
    pityState.loot.missesSinceDrop = LOOT_DROP_PITY_THRESHOLD;
    const started = startExpedition(pityState, "tollroad-of-trinkets", NOW + 1);
    expect(started.ok).toBe(true);
    if (!started.ok) throw new Error("pity expedition start failed");
    const resolved = resolveExpedition(started.state, NOW + 60_000);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) throw new Error("pity expedition resolve failed");
    expect(resolved.summary.success).toBe(true);
    expect(resolved.summary.item).not.toBeNull();
    expect(resolved.state.loot.missesSinceDrop).toBe(0);
    expect(resolved.state.loot.recentSlots[0]).toBe(resolved.summary.item?.slot);
  });

  it("ships broad gameplay affixes and applies equipped utility effects", () => {
    expect(AFFIX_POOL.length).toBeGreaterThanOrEqual(25);
    expect(AFFIX_POOL.some((affix) => affix.effects?.xpMultiplier)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.zoneGoldMultiplier?.emberwood)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.rareDropChance)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.bossRewardMultiplier)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.craftingDiscount)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.focusBoostCostReduction)).toBe(true);
    expect(AFFIX_POOL.some((affix) => affix.effects?.materialResourceMultiplier?.fragments)).toBe(true);
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
    const baseFocusCost = getFocusBoostCost(state);

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
      salvageValue: { fragments: 1 },
      sourceDungeonId: "test",
      createdAtRunId: 0
    };

    expect(getXpMultiplier(state)).toBeGreaterThan(baseXp);
    expect(getGoldMultiplier(state, emberwoodDungeon)).toBeGreaterThan(baseGold);
    expect(getLootChance(state, longDungeon)).toBeGreaterThan(baseLoot);
    expect(getSuccessChance(state, DUNGEONS[0])).toBeGreaterThan(baseSuccess);
    expect(getCraftCost(state).fragments ?? 0).toBeLessThan(baseCraftCost.fragments ?? 0);
    expect(getFocusBoostCost(state)).toBeLessThan(baseFocusCost);
  });

  it("generates one readable item trait and keeps Launch Candidate families active", () => {
    const state = makeReadyState("phase-6-trait-generation");
    state.bossPrep["copper-crown-champion"] = { revealedThreats: [], prepCharges: {}, attempts: 0, intel: 0 };
    const item = createItem(state, DUNGEONS[0], createRng("phase-6-legendary"), 9, { slot: "weapon", rarity: "legendary" });

    expect(item.traitId).toBeTruthy();
    expect(getItemTraitDefinition(item.traitId)?.category).toBe("tactical");
    expect(item.affixes.some((affix) => ITEM_TRAITS.some((trait) => trait.id === affix.id))).toBe(false);
    expect(state.traitCodex[item.traitId ?? ""]?.discovered).toBe(true);
    expect(ITEM_FAMILIES.filter((family) => family.active).map((family) => family.id)).toEqual([
      "sunlitCharter",
      "emberboundKit",
      "azureLedger",
      "stormglassSurvey",
      "firstForgeOath"
    ]);
    expect(ITEM_FAMILIES.filter((family) => !family.active)).toEqual([]);
  });

  it("equips lower-power contextual trait gear for a boss", () => {
    const state = makeReadyState("phase-6-context-equip");
    const rawPowerWeapon = {
      id: "raw-power",
      name: "Raw Power Blade",
      slot: "weapon" as const,
      rarity: "epic" as const,
      itemLevel: 5,
      upgradeLevel: 0,
      stats: { power: 100 },
      affixes: [],
      sellValue: 1,
      salvageValue: { fragments: 1 },
      sourceDungeonId: "test",
      createdAtRunId: 1
    };
    const piercingWeapon = {
      id: "piercing-low-power",
      name: "Piercing Low Blade",
      slot: "weapon" as const,
      rarity: "rare" as const,
      itemLevel: 5,
      upgradeLevel: 0,
      stats: { power: 1 },
      affixes: [],
      traitId: "piercing" as const,
      familyId: null,
      sellValue: 1,
      salvageValue: { fragments: 1 },
      sourceDungeonId: "test",
      createdAtRunId: 2
    };
    state.equipment.weapon = rawPowerWeapon;
    state.inventory = [piercingWeapon];

    const result = equipBestForContext(state, NOW + 1, { dungeonId: "copper-crown-champion" });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("equip best failed");
    expect(result.state.equipment.weapon?.id).toBe("piercing-low-power");
    expect(result.state.inventory.some((item) => item.id === "raw-power")).toBe(true);
  });

  it("locks items and supports two build presets with family resonance", () => {
    const state = makeReadyState("phase-6-presets");
    const makeFamilyItem = (id: string, slot: "weapon" | "helm" | "armor") => ({
      id,
      name: id,
      slot,
      rarity: "rare" as const,
      itemLevel: 5,
      upgradeLevel: 0,
      stats: { power: slot === "weapon" ? 10 : 0, defense: slot !== "weapon" ? 10 : 0 },
      affixes: [],
      traitId: null,
      familyId: "sunlitCharter" as const,
      locked: false,
      sellValue: 1,
      salvageValue: { fragments: 1 },
      sourceDungeonId: "test",
      createdAtRunId: 1
    });
    const weapon = makeFamilyItem("sunlit-weapon", "weapon");
    const helm = makeFamilyItem("sunlit-helm", "helm");
    const armor = makeFamilyItem("sunlit-armor", "armor");
    state.equipment.weapon = weapon;
    state.equipment.helm = helm;
    state.equipment.armor = armor;

    const saved = saveBuildPreset(state, "preset-1", NOW + 1);
    expect(saved.ok).toBe(true);
    if (!saved.ok) throw new Error("preset save failed");

    const changed = structuredClone(saved.state);
    changed.inventory = [weapon, helm, armor];
    changed.equipment = { weapon: null, helm: null, armor: null, boots: null, relic: null };
    const equipped = equipBuildPreset(changed, "preset-1", NOW + 2);
    expect(equipped.ok).toBe(true);
    if (!equipped.ok) throw new Error("preset equip failed");
    expect(equipped.state.equipment.weapon?.id).toBe("sunlit-weapon");
    expect(getFamilyResonanceSummaries(equipped.state).find((summary) => summary.family.id === "sunlitCharter")?.rank).toBe(2);
    expect(getItemFamilyDefinition(equipped.state.equipment.weapon?.familyId)?.name).toBe("Sunlit Charter");

    equipped.state.inventory = [{ ...weapon, id: "locked-copy", locked: true }];
    const blockedSell = sellItem(equipped.state, "locked-copy", NOW + 3);
    const blockedSalvage = salvageItem(equipped.state, "locked-copy", NOW + 3);
    expect(blockedSell.ok).toBe(false);
    expect(blockedSalvage.ok).toBe(false);
    const unlocked = toggleItemLock(equipped.state, "locked-copy", NOW + 4);
    expect(unlocked.ok).toBe(true);
    if (!unlocked.ok) throw new Error("unlock failed");
    expect(unlocked.state.inventory[0].locked).toBe(false);
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
    state.resources.fragments = 100_000;

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
    state.resources.fragments = 100_000;

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
  it("starts and claims building construction with scaled costs", () => {
    const state = makeReadyState("town");
    state.resources.gold = 10_000;
    state.resources.fragments = 10_000;
    state.regionProgress.materials.sunlitTimber = 10;
    const upgraded = buyBuildingUpgrade(state, "forge", NOW + 1);
    expect(upgraded.ok).toBe(true);
    if (!upgraded.ok) throw new Error("construction start failed");
    expect(upgraded.state.town.forge).toBe(0);
    expect(upgraded.state.construction.activeBuildingId).toBe("forge");
    expect(upgraded.state.regionProgress.materials.sunlitTimber).toBe(8);

    const claimed = claimBuildingConstruction(upgraded.state, NOW + 3 * 60 * 1000);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) throw new Error("construction claim failed");
    expect(claimed.state.town.forge).toBe(1);
    expect(claimed.state.construction.activeBuildingId).toBeNull();
  });

  it("accelerates and cancels construction without refunding Focus", () => {
    const state = makeReadyState("town-construction-focus");
    state.resources.gold = 10_000;
    state.regionProgress.materials.sunlitTimber = 10;
    state.focus.current = 20;

    const started = buyBuildingUpgrade(state, "forge", NOW);
    expect(started.ok).toBe(true);
    if (!started.ok) throw new Error("construction start failed");

    const accelerated = accelerateBuildingConstruction(started.state, 1, NOW + 1_000);
    expect(accelerated.ok).toBe(true);
    if (!accelerated.ok) throw new Error("construction accelerate failed");
    expect(accelerated.state.focus.current).toBe(19);

    const canceled = cancelBuildingConstruction(accelerated.state, NOW + 2_000);
    expect(canceled.ok).toBe(true);
    if (!canceled.ok) throw new Error("construction cancel failed");
    expect(canceled.state.construction.activeBuildingId).toBeNull();
    expect(canceled.state.focus.current).toBe(19);
    expect(canceled.state.regionProgress.materials.sunlitTimber).toBe(9);
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

  it("keeps town building metadata and Mine scaling visible through Caravan yields", () => {
    expect(BUILDINGS).toHaveLength(6);
    BUILDINGS.forEach((building) => {
      expect(building.purpose.length).toBeGreaterThan(10);
      expect(building.milestones.length).toBeGreaterThanOrEqual(3);
    });

    const state = makeReadyState("mine-rate");
    state.hero.level = 15;
    const baseFragments = estimateCaravanRewards(state, "fragments", 60 * 60 * 1000).materials.fragments ?? 0;
    state.town.mine = 6;
    const boostedFragments = estimateCaravanRewards(state, "fragments", 60 * 60 * 1000).materials.fragments ?? 0;
    expect(boostedFragments).toBeGreaterThan(baseFragments);
  });

  it("surfaces all Launch Candidate regions and computes region completion", () => {
    const state = makeReadyState("phase-3a-regions");
    expect(getActiveRegionIds(state)).toEqual(["sunlit-marches", "emberwood", "azure-vaults", "stormglass-peaks", "first-forge"]);
    expect(state.regionProgress.activeMaterialIds).toEqual(["sunlitTimber", "emberResin", "archiveGlyph", "stormglassShard", "oathEmber"]);
    expect(state.regionProgress.materials.archiveGlyph).toBe(0);
    expect(state.regionProgress.materials.stormglassShard).toBe(0);
    expect(state.regionProgress.materials.oathEmber).toBe(0);

    const initial = getRegionCompletionSummary(state, "sunlit-marches");
    expect(initial).toMatchObject({
      regionId: "sunlit-marches",
      materialId: "sunlitTimber",
      materialAmount: 0,
      routesCleared: 0,
      routesTotal: 4,
      masteryTiersClaimed: 0,
      masteryTiersTotal: 12,
      completionPercent: 0
    });

    state.dungeonClears["tollroad-of-trinkets"] = 1;
    state.dungeonMastery["tollroad-of-trinkets"] = { masteryXp: 1500, claimedTiers: [1, 2, 3], failures: 0 };
    state.regionProgress.materials.sunlitTimber = 9;
    const progressed = getRegionCompletionSummary(state, "sunlit-marches");
    expect(progressed.materialAmount).toBe(9);
    expect(progressed.routesCleared).toBe(1);
    expect(progressed.masteryTiersClaimed).toBe(3);
    expect(progressed.completionPercent).toBeGreaterThan(0);
  });

  it("spends active regional materials through Phase 3A sinks", () => {
    const state = makeReadyState("phase-3a-sinks");
    state.regionProgress.materials.sunlitTimber = 6;
    state.regionProgress.materials.emberResin = 6;

    const sunlit = fundRegionalMaterialSink(state, "sunlit-market-supplies", NOW + 1);
    expect(sunlit.ok).toBe(true);
    if (!sunlit.ok) throw new Error("sunlit sink failed");
    expect(sunlit.state.regionProgress.materials.sunlitTimber).toBe(0);
    expect(sunlit.state.resources.gold).toBe(state.resources.gold + 45);

    const ember = fundRegionalMaterialSink(state, "emberwood-forge-fuel", NOW + 2);
    expect(ember.ok).toBe(true);
    if (!ember.ok) throw new Error("ember sink failed");
    expect(ember.state.regionProgress.materials.emberResin).toBe(0);
    expect(ember.state.resources.fragments).toBe(state.resources.fragments + 18);

    const insufficient = fundRegionalMaterialSink(ember.state, "emberwood-forge-fuel", NOW + 3);
    expect(insufficient.ok).toBe(false);
    const unknown = fundRegionalMaterialSink(state, "archive-glyph-project", NOW + 4);
    expect(unknown.ok).toBe(false);
  });

  it("awards Phase 3B collection pieces from the missing pool and completes the set once", () => {
    const state = makeReadyState("phase-3b-collection");
    const dungeon = DUNGEONS.find((entry) => entry.id === "tollroad-of-trinkets");
    expect(dungeon).toBeTruthy();
    if (!dungeon) throw new Error("missing dungeon");
    state.regionProgress.collections["sunlit-road-relics"] = {
      foundPieceIds: ["sunlit-coin-charm", "mossbright-jar-lantern", "bandit-map-scrap"],
      missesSincePiece: COLLECTION_PITY_THRESHOLD,
      completedAt: null
    };

    const result = applyCollectionProgress(state, dungeon, true, false, createRng("phase-3b-pity"), NOW + 1);

    expect(result?.pieceId).toBe("copper-crown-sigil");
    expect(result?.completed).toBe(true);
    expect(result?.accountXpGained).toBe(25);
    expect(result?.titlesUnlocked.map((title) => title.id)).toContain("title-sunlit-collector");
    expect(result?.trophiesUnlocked.map((trophy) => trophy.id)).toContain("trophy-sunlit-relic-set");
    expect(state.accountPersonalRecords.totalCollectionsCompleted).toBe(1);
    expect(new Set(state.regionProgress.collections["sunlit-road-relics"].foundPieceIds).size).toBe(4);

    const summary = getRegionCollectionSummary(state, "sunlit-road-relics");
    expect(summary?.completionPercent).toBe(100);
    expect(summary?.visible).toBe(true);
    expect(getVisibleRegionCollectionSummaries(state, "sunlit-marches")).toHaveLength(1);
  });

  it("advances Phase 3B collection pity only after the collection is visible", () => {
    const dungeon = DUNGEONS.find((entry) => entry.id === "tollroad-of-trinkets");
    expect(dungeon).toBeTruthy();
    if (!dungeon) throw new Error("missing dungeon");
    const dryRng = {
      next: () => 0.99,
      int: (min: number) => min,
      pick: <T,>(items: readonly T[]) => items[0]
    };

    const hidden = makeReadyState("phase-3b-hidden-pity");
    expect(applyCollectionProgress(hidden, dungeon, false, false, dryRng, NOW + 1)).toBeNull();

    const visible = makeReadyState("phase-3b-visible-pity");
    visible.dungeonClears["tollroad-of-trinkets"] = 1;
    const result = applyCollectionProgress(visible, dungeon, false, false, dryRng, NOW + 2);

    expect(result?.eligible).toBe(true);
    expect(result?.pieceId).toBeNull();
    expect(result?.pityAdvanced).toBe(true);
    expect(visible.regionProgress.collections["sunlit-road-relics"].missesSincePiece).toBe(1);
  });

  it("tracks and claims Phase 7A Sunlit diary progress with permanent reward effects", () => {
    let state = makeReadyState("phase-7a-diary");
    ["tollroad-of-trinkets", "mossbright-cellar", "relic-bandit-cache", "copper-crown-champion"].forEach((dungeonId) => {
      state.dungeonClears[dungeonId] = 1;
    });
    state.dungeonMastery["tollroad-of-trinkets"] = { masteryXp: 100, claimedTiers: [], failures: 0 };

    const mastery = claimMasteryTier(state, "tollroad-of-trinkets", NOW + 1);
    expect(mastery.ok).toBe(true);
    if (!mastery.ok) throw new Error("mastery claim failed");
    state = mastery.state;

    for (let index = 0; index < 3; index += 1) {
      state.inventory.push({
        id: `sunlit-salvage-${index}`,
        name: `Sunlit Salvage ${index}`,
        slot: "weapon",
        rarity: "common",
        itemLevel: 1,
        upgradeLevel: 0,
        stats: { power: 1 },
        affixes: [],
        traitId: null,
        familyId: null,
        locked: false,
        sellValue: 1,
        salvageValue: { fragments: 1 },
        sourceDungeonId: "tollroad-of-trinkets",
        createdAtRunId: 1
      });
      const salvaged = salvageItem(state, `sunlit-salvage-${index}`, NOW + 2 + index);
      expect(salvaged.ok).toBe(true);
      if (!salvaged.ok) throw new Error("salvage failed");
      state = salvaged.state;
    }

    state.construction = {
      activeBuildingId: "forge",
      startedAt: NOW,
      targetLevel: 1,
      baseDurationMs: 1,
      focusSpentMs: 0,
      completedAt: null,
      paidCostResources: {},
      paidCostRegionalMaterials: { sunlitTimber: 2 }
    };
    const built = claimBuildingConstruction(state, NOW + 10);
    expect(built.ok).toBe(true);
    if (!built.ok) throw new Error("construction claim failed");
    state = built.state;

    const summary = getRegionDiarySummary(state, "sunlit-marches");
    expect(summary?.readyToClaim).toBe(true);
    expect(summary?.completedTasks).toBe(4);
    expect(summary?.tasks.find((task) => task.id === "sunlit-salvage-3")?.progress).toBe(3);

    const claimed = claimRegionDiaryReward(state, "sunlit-marches", NOW + 11);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) throw new Error("diary claim failed");
    expect(claimed.state.regionProgress.diaries["sunlit-marches"].claimedRewardIds).toContain("sunlit-diary-tier-1");
    expect(claimed.state.regionProgress.materials.sunlitTimber).toBe(state.regionProgress.materials.sunlitTimber + 10);
    expect(claimed.state.titles["title-sunlit-diarist"]?.unlockedAt).toBe(NOW + 11);

    const tollroad = DUNGEONS.find((entry) => entry.id === "tollroad-of-trinkets");
    expect(tollroad).toBeTruthy();
    if (!tollroad) throw new Error("missing tollroad");
    const progress = applyExpeditionProgress(claimed.state, tollroad, true, false, NOW + 12);
    expect(progress.masteryXpGained).toBe(102);
  });

  it("defines Launch Candidate named bosses with tactical threats", () => {
    expect(BOSS_DEFINITIONS.map((boss) => boss.name)).toEqual([
      "Bramblecrown",
      "Cindermaw",
      "Curator of Blue Fire",
      "Stormglass Regent",
      "Crown of the First Forge"
    ]);
    const bramblecrown = BOSS_DEFINITIONS.find((boss) => boss.id === "bramblecrown");
    expect(bramblecrown?.title).toBe("Copper Crown Champion");
    expect(bramblecrown?.threats.map((threat) => threat.id)).toEqual(["armored", "brutal"]);
    expect(bramblecrown?.threats.find((threat) => threat.critical)?.id).toBe("armored");
    const firstForge = BOSS_DEFINITIONS.find((boss) => boss.id === "crown-of-the-first-forge");
    expect(firstForge?.dungeonId).toBe("crown-of-the-first-forge");
    expect(firstForge?.threats.filter((threat) => threat.critical).map((threat) => threat.id)).toEqual(["armored", "cursed"]);
  });

  it("activates Phase 8 regions, rewards, diaries, and Soul Mark extension effects", () => {
    const state = makeReadyState("phase-8-activation");
    const missingRewards = DUNGEONS.filter((dungeon) => !EXPEDITION_PROGRESS_REWARDS[dungeon.id]).map((dungeon) => dungeon.id);
    expect(missingRewards).toEqual([]);
    expect(ACCOUNT_RANKS.at(-1)).toMatchObject({ rank: 16, focusCap: 300 });
    expect(["azure-vaults", "stormglass-peaks", "first-forge"].map((regionId) => getRegionDiarySummary(state, regionId)?.totalTasks)).toEqual([4, 4, 4]);
    expect(getRegionCollectionSummary(state, "azure-vault-relics")?.pieces).toHaveLength(4);
    expect(getRegionCollectionSummary(state, "stormglass-survey-relics")?.pieces).toHaveLength(4);
    expect(getRegionCollectionSummary(state, "first-forge-oath-relics")?.pieces).toHaveLength(4);

    const azure = DUNGEONS.find((dungeon) => dungeon.id === "index-of-whispers");
    expect(azure).toBeTruthy();
    if (!azure) throw new Error("missing Azure dungeon");
    const progress = applyExpeditionProgress(state, azure, true, false, NOW + 1);
    expect(progress.regionalMaterials.archiveGlyph).toBeGreaterThan(0);
    expect(progress.accountXpGained).toBeGreaterThan(0);

    const collectionBoostState = makeReadyState("phase-8-collection-boost");
    collectionBoostState.regionProgress.collections["azure-vault-relics"] = {
      foundPieceIds: ["whisper-index-card", "mirror-script-rubbing", "astral-ledger-seal", "blue-fire-permit"],
      missesSincePiece: 0,
      completedAt: NOW
    };
    const boostedProgress = applyExpeditionProgress(collectionBoostState, azure, true, false, NOW + 2);
    expect(boostedProgress.masteryXpGained).toBeGreaterThan(EXPEDITION_PROGRESS_REWARDS["index-of-whispers"].successMasteryXp);

    const boosted = makeReadyState("phase-8-boosts");
    const firstForgeRewards = estimateCaravanRewardsForRegion(boosted, "gold", "first-forge", 60 * 60 * 1000);
    boosted.prestige.upgrades.horizonCartography = 10;
    const boostedFirstForgeRewards = estimateCaravanRewardsForRegion(boosted, "gold", "first-forge", 60 * 60 * 1000);
    expect(boostedFirstForgeRewards.regionalMaterials.oathEmber).toBeGreaterThan(firstForgeRewards.regionalMaterials.oathEmber ?? 0);
    boosted.prestige.upgrades.forgeInheritance = 5;
    expect(getFragmentGainPassiveMultiplier(boosted)).toBeCloseTo(1.15);

    boosted.resources.renown = 20;
    boosted.soulMarks.current = 20;
    const bought = buyRenownUpgrade(boosted, "horizonCartography", NOW + 2);
    expect(bought.ok).toBe(true);
    if (!bought.ok) throw new Error("upgrade purchase failed");
    expect(bought.state.prestige.upgrades.horizonCartography).toBe(11);

    const stormglass = DUNGEONS.find((dungeon) => dungeon.id === "thunderchain-ascent");
    expect(stormglass).toBeTruthy();
    if (!stormglass) throw new Error("missing Stormglass dungeon");
    const durationState = makeReadyState("phase-8-family-duration");
    const baseDuration = getDurationMs(durationState, stormglass);
    const makeStormglassItem = (id: string, slot: "weapon" | "boots" | "relic") => ({
      id,
      name: id,
      slot,
      rarity: "rare" as const,
      itemLevel: 5,
      upgradeLevel: 0,
      stats: {},
      affixes: [],
      traitId: null,
      familyId: "stormglassSurvey" as const,
      locked: false,
      sellValue: 1,
      salvageValue: { fragments: 1 },
      sourceDungeonId: "test",
      createdAtRunId: 1
    });
    durationState.equipment.weapon = makeStormglassItem("stormglass-weapon", "weapon");
    durationState.equipment.boots = makeStormglassItem("stormglass-boots", "boots");
    durationState.equipment.relic = makeStormglassItem("stormglass-relic", "relic");
    expect(getDurationMs(durationState, stormglass)).toBeLessThan(baseDuration);
  });

  it("scouts and prepares boss threats with Focus and regional materials", () => {
    const state = makeReadyState("phase-4-scout-prep");
    state.focus.current = 200;
    state.regionProgress.materials.sunlitTimber = 5;

    const scouted = scoutBoss(state, "copper-crown-champion", NOW + 1);
    expect(scouted.ok).toBe(true);
    if (!scouted.ok) throw new Error("scout failed");
    expect(scouted.state.focus.current).toBe(195);
    expect(scouted.state.bossPrep["copper-crown-champion"].revealedThreats).toEqual(["armored", "brutal"]);

    const prepared = prepareBossThreat(scouted.state, "copper-crown-champion", "armored", NOW + 2);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) throw new Error("prep failed");
    expect(prepared.state.focus.current).toBe(185);
    expect(prepared.state.regionProgress.materials.sunlitTimber).toBe(3);
    expect(prepared.state.bossPrep["copper-crown-champion"].prepCharges.armored).toBe(1);

    prepared.state.hero.level = 3;
    prepared.state.dungeonClears["relic-bandit-cache"] = 1;
    const started = startExpedition(prepared.state, "copper-crown-champion", NOW + 3);
    expect(started.ok).toBe(true);
    if (!started.ok) throw new Error("boss start failed");
    expect(started.state.bossPrep["copper-crown-champion"].prepCharges.armored).toBe(0);
    expect(started.state.activeExpedition?.bossPrepCoverage?.armored).toBe(0.6);
  });

  it("applies boss threat caps and failure intel", () => {
    const boss = DUNGEONS.find((dungeon) => dungeon.id === "copper-crown-champion");
    expect(boss).toBeTruthy();
    if (!boss) throw new Error("missing boss");
    const state = makeReadyState("phase-4-threats");
    state.hero.level = 3;
    state.hero.baseStats = { power: 200, defense: 50, speed: 30, luck: 30, stamina: 200 };
    state.dungeonClears["relic-bandit-cache"] = 1;

    const baseThreatAdjusted = getSuccessChance(state, boss);
    expect(baseThreatAdjusted).toBeLessThanOrEqual(0.55);
    const partiallyPrepared = getSuccessChance(state, boss, { bossPrepCoverage: { armored: 0.6 } });
    expect(partiallyPrepared).toBeGreaterThan(baseThreatAdjusted);
    expect(partiallyPrepared).toBeLessThanOrEqual(0.75);
    expect(applyBossThreatsToSuccessChance(state, boss, 0.96, { armored: 1, brutal: 1 })).toBe(0.96);

    let failed = null as ReturnType<typeof resolveExpedition> | null;
    for (let runId = 1; runId <= 80; runId += 1) {
      const attempt = makeReadyState("phase-4-failure-intel");
      attempt.hero.level = 3;
      attempt.dungeonClears["relic-bandit-cache"] = 1;
      attempt.activeExpedition = {
        dungeonId: "copper-crown-champion",
        runId,
        startedAt: NOW,
        endsAt: NOW,
        focusBoost: false
      };
      const result = resolveExpedition(attempt, NOW + 1);
      if (result.ok && !result.summary.success) {
        failed = result;
        break;
      }
    }

    expect(failed?.ok).toBe(true);
    if (!failed?.ok) throw new Error("no deterministic boss failure found");
    expect(failed.summary.boss?.name).toBe("Bramblecrown");
    expect(failed.summary.boss?.intelGained).toBe(1);
    expect(failed.summary.boss?.failureIntelText).toContain("Piercing");
    expect(failed.state.bossPrep["copper-crown-champion"].intel).toBe(1);
    expect(failed.state.bossPrep["copper-crown-champion"].revealedThreats).toEqual(["armored"]);
    expect(failed.state.trophies["trophy-boss-intel-scroll"]?.unlockedAt).toBe(NOW + 1);

    const view = getBossViewSummary(failed.state, boss, getSuccessChance(failed.state, boss));
    expect(view?.statuses.find((status) => status.threat.id === "armored")?.revealed).toBe(true);

    const successState = makeReadyState("phase-4-outpost-placeholder");
    recordBossAttemptResult(successState, boss, true, NOW + 2);
    expect(successState.regionProgress.outposts["sunlit-marches"]).toEqual({ selectedBonusId: null, level: 0 });
  });

  it("selects Outpost bonuses and applies Watchtower scout support", () => {
    const state = makeReadyState("phase-5-outpost");
    state.focus.current = 200;
    state.dungeonClears["emberwood-heart"] = 1;

    const selected = selectRegionOutpostBonus(state, "emberwood", "watchtower", NOW + 1);
    expect(selected.ok).toBe(true);
    if (!selected.ok) throw new Error("outpost select failed");
    expect(getRegionCompletionSummary(selected.state, "emberwood").outpost).toEqual({ selectedBonusId: "watchtower", level: 1 });

    const scouted = scoutBoss(selected.state, "emberwood-heart", NOW + 2);
    expect(scouted.ok).toBe(true);
    if (!scouted.ok) throw new Error("scout failed");
    expect(scouted.state.bossPrep["emberwood-heart"].revealedThreats).toEqual(["regenerating", "venom", "brutal"]);
  });

  it("banks and claims Daily Focus through expedition completions", () => {
    const state = makeReadyState("daily-focus");
    expect(state.dailyFocus.focusChargesBanked).toBe(1);
    const progressed = applyDailyProgress(state, NOW + 1, { complete_expeditions: 3 }).state;
    expect(progressed.dailyFocus.focusChargeProgress).toBe(3);

    progressed.focus.current = progressed.focus.cap - 5;
    const claimed = claimDailyFocus(progressed, NOW + 2);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) throw new Error("daily focus claim failed");
    expect(claimed.state.dailyFocus.focusChargesBanked).toBe(0);
    expect(claimed.state.dailyFocus.focusChargeProgress).toBe(0);
    expect(claimed.state.focus.current).toBe(claimed.state.focus.cap);
  });

  it("unlocks Rank 2 Daily Missions with Account XP rewards and no Focus reward", () => {
    let state = makeReadyState("daily-missions");
    expect(state.dailies.tasks).toHaveLength(0);
    applyAccountXp(state, 100, NOW + 1);
    state = ensureDailies(state, NOW + 2).state;
    expect(state.accountRank.accountRank).toBe(2);
    expect(state.dailies.tasks).toHaveLength(3);
    expect(state.dailies.tasks.some((task) => task.difficulty === "hard")).toBe(false);

    const progressed = applyDailyProgress(
      state,
      NOW + 3,
      {
        win_expeditions: 4,
        win_region_expeditions: 4,
        gain_mastery_xp: 250,
        claim_mastery_milestone: 1
      },
      { regionId: "sunlit-marches" }
    ).state;
    const claimable = progressed.dailies.tasks.find((task) => task.progress >= task.target);
    expect(claimable).toBeDefined();
    if (!claimable) throw new Error("no claimable daily mission");

    const beforeFocus = progressed.focus.current;
    const beforeAccountXp = progressed.accountRank.accountXp;
    const claimed = claimDailyTask(progressed, claimable.id, NOW + 4);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) throw new Error("daily mission claim failed");
    expect(claimed.state.focus.current).toBe(beforeFocus);
    expect(claimed.state.accountRank.accountXp).toBeGreaterThan(beforeAccountXp);
    expect(claimDailyTask(claimed.state, claimable.id, NOW + 5).ok).toBe(false);
  });

  it("tracks and claims the day-one Weekly Quest fallback", () => {
    const state = makeReadyState("weekly-quest");
    const progressed = applyDailyProgress(state, NOW + 1, {
      complete_expeditions: 15,
      claim_mastery_milestone: 1
    }).state;
    expect(progressed.weeklyQuest.steps.map((step) => step.progress)).toEqual([15, 1]);

    const beforeAccountXp = progressed.accountRank.accountXp;
    const beforeTimber = progressed.regionProgress.materials.sunlitTimber;
    const claimed = claimWeeklyQuest(progressed, NOW + 2);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) throw new Error("weekly quest claim failed");
    expect(claimed.state.accountRank.accountXp).toBe(beforeAccountXp + 25);
    expect(claimed.state.regionProgress.materials.sunlitTimber).toBe(beforeTimber + 10);
    expect(claimed.state.titles["title-steady-regular"]?.unlockedAt).toBe(NOW + 2);
    expect(claimWeeklyQuest(claimed.state, NOW + 3).ok).toBe(false);
  });

  it("resets dailies at the local daily reset boundary", () => {
    const beforeReset = new Date(2026, 0, 1, DAILY_RESET_HOUR_LOCAL, 0, -1, 0).getTime();
    const afterReset = new Date(2026, 0, 1, DAILY_RESET_HOUR_LOCAL, 0, 1, 0).getTime();
    const expectedWindowStart = new Date(2026, 0, 1, DAILY_RESET_HOUR_LOCAL, 0, 0, 0).getTime();
    const expectedNextReset = new Date(2026, 0, 2, DAILY_RESET_HOUR_LOCAL, 0, 0, 0).getTime();
    const state = createInitialState("boundary", beforeReset);
    state.settings.heroCreated = true;
    applyAccountXp(state, 100, beforeReset);
    const seeded = ensureDailies(state, beforeReset).state;
    seeded.dailies.tasks.forEach((task) => {
      task.progress = task.target;
      task.claimed = true;
    });
    const after = ensureDailies(seeded, afterReset).state;
    expect(getDailyWindowStartAt(afterReset)).toBe(expectedWindowStart);
    expect(getNextDailyResetAt(afterReset)).toBe(expectedNextReset);
    expect(after.dailies.windowStartAt).toBe(expectedWindowStart);
    expect(after.dailies.tasks).toHaveLength(3);
    expect(after.dailies.tasks.every((task) => task.progress === 0 && !task.claimed)).toBe(true);
  });

  it("resets the Weekly Quest at the weekly reset boundary", () => {
    const beforeReset = new Date(2026, 0, 5, DAILY_RESET_HOUR_LOCAL, 0, -1, 0).getTime();
    const afterReset = new Date(2026, 0, 5, DAILY_RESET_HOUR_LOCAL, 0, 1, 0).getTime();
    const expectedWindowStart = new Date(2026, 0, 5, DAILY_RESET_HOUR_LOCAL, 0, 0, 0).getTime();
    const expectedNextReset = new Date(2026, 0, 12, DAILY_RESET_HOUR_LOCAL, 0, 0, 0).getTime();
    const state = createInitialState("weekly-boundary", beforeReset);
    state.settings.heroCreated = true;
    const seeded = ensureDailies(state, beforeReset).state;
    seeded.weeklyQuest.steps[0].progress = 15;
    seeded.weeklyQuest.steps[1].progress = 1;
    seeded.weeklyQuest.questClaimed = true;
    const after = ensureDailies(seeded, afterReset).state;
    expect(getWeeklyWindowStartAt(afterReset)).toBe(expectedWindowStart);
    expect(getNextWeeklyResetAt(afterReset)).toBe(expectedNextReset);
    expect(after.weeklyQuest.weekStartAt).toBe(expectedWindowStart);
    expect(after.weeklyQuest.nextResetAt).toBe(expectedNextReset);
    expect(after.weeklyQuest.steps.map((step) => step.progress)).toEqual([0, 0]);
    expect(after.weeklyQuest.questClaimed).toBe(false);
  });

  it("applies offline expedition, focus, and cap behavior", () => {
    const state = makeReadyState("offline");
    state.town.mine = 6;
    state.focus.current = 0;
    const started = startExpedition(state, "tollroad-of-trinkets", NOW);
    expect(started.ok).toBe(true);
    if (!started.ok) throw new Error("start failed");
    const offline = applyOfflineProgress(started.state, NOW + 9 * 60 * 60 * 1000);
    expect(offline.capped).toBe(true);
    expect(offline.summary).not.toBeNull();
    expect(offline.summary?.expedition).toBeNull();
    expect(offline.summary?.expeditionReady).toBe(true);
    expect(offline.state.activeExpedition).not.toBeNull();
    expect(offline.state.focus.current).toBeGreaterThan(0);
    expect(offline.state.resources.fragments).toBeGreaterThanOrEqual(0);
  });

  it("applies a chosen Caravan offline job and clears it when complete", () => {
    const state = makeReadyState("caravan");
    state.hero.level = 3;
    const locked = startCaravanJob(state, "fragments", 2 * 60 * 60 * 1000, NOW);
    expect(locked.ok).toBe(false);

    state.hero.level = 5;
    const planned = startCaravanJob(state, "fragments", 2 * 60 * 60 * 1000, NOW);
    expect(planned.ok).toBe(true);
    if (!planned.ok) throw new Error("caravan plan failed");

    const offline = applyOfflineProgress(planned.state, NOW + 3 * 60 * 60 * 1000);
    expect(offline.summary?.caravan?.focusId).toBe("fragments");
    expect(offline.summary?.caravan?.completed).toBe(true);
    expect(offline.state.resources.fragments).toBeGreaterThan(planned.state.resources.fragments);
    expect(offline.state.caravan.activeJob).toBeNull();
    expect(offline.summary?.mineGains).toEqual({});
  });

  it("claims Caravan regional material and Account XP rewards", () => {
    const state = makeReadyState("caravan-regional");
    state.hero.level = 5;
    const planned = startCaravanJob(state, "gold", 60 * 60 * 1000, NOW, "sunlit-marches");
    expect(planned.ok).toBe(true);
    if (!planned.ok) throw new Error("caravan plan failed");

    const claimed = claimCaravanJob(planned.state, NOW + 60 * 60 * 1000 + 1);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) throw new Error("caravan claim failed");
    expect(claimed.state.caravan.activeJob).toBeNull();
    expect(claimed.state.resources.gold).toBeGreaterThan(planned.state.resources.gold);
    expect(claimed.state.accountRank.accountXp).toBeGreaterThan(planned.state.accountRank.accountXp);
    expect(claimed.state.regionProgress.materials.sunlitTimber).toBeGreaterThan(planned.state.regionProgress.materials.sunlitTimber);
  });

  it("tracks Phase 7B Caravan Mastery tiers and applies claimed bonuses", () => {
    const state = makeReadyState("caravan-mastery");
    state.hero.level = 5;
    const oneHour = 60 * 60 * 1000;
    const fourHours = 4 * oneHour;
    const baseline = estimateCaravanRewardsForRegion(state, "gold", "sunlit-marches", oneHour);

    const planned = startCaravanJob(state, "gold", fourHours, NOW, "sunlit-marches");
    expect(planned.ok).toBe(true);
    if (!planned.ok) throw new Error("caravan plan failed");
    expect(planned.state.caravan.activeJob?.rewardDurationMs).toBe(fourHours);

    const claimed = claimCaravanJob(planned.state, NOW + fourHours + 1);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) throw new Error("caravan claim failed");
    expect(getCaravanMasterySummary(claimed.state, "sunlit-marches")).toMatchObject({
      caravansSent: 1,
      masteryXp: 4,
      highestClaimedTier: 0
    });

    const tier1 = claimCaravanMasteryTier(claimed.state, "sunlit-marches", NOW + fourHours + 2);
    expect(tier1.ok).toBe(true);
    if (!tier1.ok) throw new Error("tier 1 claim failed");
    expect(getCaravanMasterySummary(tier1.state, "sunlit-marches").highestClaimedTier).toBe(1);
    const tier1Rewards = estimateCaravanRewardsForRegion(tier1.state, "gold", "sunlit-marches", oneHour);
    expect(tier1Rewards.regionalMaterials.sunlitTimber).toBe((baseline.regionalMaterials.sunlitTimber ?? 0) + 1);

    tier1.state.caravan.mastery["sunlit-marches"].masteryXp = 12;
    const tier2 = claimCaravanMasteryTier(tier1.state, "sunlit-marches", NOW + fourHours + 3);
    expect(tier2.ok).toBe(true);
    if (!tier2.ok) throw new Error("tier 2 claim failed");
    const tier2Rewards = estimateCaravanRewardsForRegion(tier2.state, "gold", "sunlit-marches", oneHour);
    expect(tier2Rewards.accountXp).toBeGreaterThan(tier1Rewards.accountXp);

    tier2.state.caravan.mastery["sunlit-marches"].masteryXp = 24;
    const tier3 = claimCaravanMasteryTier(tier2.state, "sunlit-marches", NOW + fourHours + 4);
    expect(tier3.ok).toBe(true);
    if (!tier3.ok) throw new Error("tier 3 claim failed");
    const fast = startCaravanJob(tier3.state, "gold", fourHours, NOW + fourHours + 5, "sunlit-marches");
    expect(fast.ok).toBe(true);
    if (!fast.ok) throw new Error("fast caravan plan failed");
    expect(fast.state.caravan.activeJob?.rewardDurationMs).toBe(fourHours);
    expect(fast.state.caravan.activeJob?.durationMs).toBeLessThan(fourHours);
  });

  it("does not round short Caravan returns up to a full hour", () => {
    const state = makeReadyState("short-caravan");
    state.hero.level = 5;
    const planned = startCaravanJob(state, "fragments", 2 * 60 * 60 * 1000, NOW);
    expect(planned.ok).toBe(true);
    if (!planned.ok) throw new Error("caravan plan failed");

    const offline = applyOfflineProgress(planned.state, NOW + 10 * 60 * 1000);
    expect(offline.summary?.caravan?.completed).toBe(false);
    expect(offline.summary?.caravan?.elapsedMs).toBe(10 * 60 * 1000);
    expect(offline.summary?.caravan?.rewards).toEqual({ xp: 0, gold: 0, materials: {}, accountXp: 0, regionalMaterials: {} });
    expect(offline.state.resources).toEqual(planned.state.resources);
    expect(offline.state.caravan.activeJob).not.toBeNull();
  });

  it("blocks replacing an active Caravan and cancels it without rewards", () => {
    const state = makeReadyState("single-caravan");
    state.hero.level = 5;
    const planned = startCaravanJob(state, "fragments", 2 * 60 * 60 * 1000, NOW);
    expect(planned.ok).toBe(true);
    if (!planned.ok) throw new Error("caravan plan failed");

    const blocked = startCaravanJob(planned.state, "xp", 60 * 60 * 1000, NOW + 10 * 60 * 1000);
    expect(blocked.ok).toBe(false);
    expect(blocked.state.caravan.activeJob?.focusId).toBe("fragments");

    const resourcesBeforeCancel = { ...planned.state.resources };
    const canceled = cancelCaravanJob(planned.state, NOW + 30 * 60 * 1000);
    expect(canceled.ok).toBe(true);
    if (!canceled.ok) throw new Error("caravan cancel failed");
    expect(canceled.state.caravan.activeJob).toBeNull();
    expect(canceled.state.resources).toEqual(resourcesBeforeCancel);

    const next = startCaravanJob(canceled.state, "xp", 60 * 60 * 1000, NOW + 31 * 60 * 1000);
    expect(next.ok).toBe(true);
  });

  it("keeps Caravan and active expeditions mutually exclusive", () => {
    const state = makeReadyState("caravan-expedition-lock");
    const expedition = startExpedition(state, "tollroad-of-trinkets", NOW);
    expect(expedition.ok).toBe(true);
    if (!expedition.ok) throw new Error("expedition start failed");

    const caravanWithExpedition = startCaravanJob(expedition.state, "xp", 60 * 60 * 1000, NOW + 1_000);
    expect(caravanWithExpedition.ok).toBe(false);
    if (caravanWithExpedition.ok) throw new Error("caravan over expedition should be blocked");
    expect(caravanWithExpedition.error).toContain("expedition is active");

    const caravanOnly = startCaravanJob(state, "xp", 60 * 60 * 1000, NOW);
    expect(caravanOnly.ok).toBe(true);
    if (!caravanOnly.ok) throw new Error("caravan start failed");
    const blocked = startExpedition(caravanOnly.state, "tollroad-of-trinkets", NOW + 1_000);
    expect(blocked.ok).toBe(false);
    if (blocked.ok) throw new Error("expedition should be blocked");
    expect(blocked.error).toContain("Caravan");
  });

  it("round-trips save import/export and rejects invalid JSON", () => {
    const state = makeReadyState("save");
    const raw = serializeSave(state, NOW + 1);
    expect(loadSave(raw).ok).toBe(true);
    expect(importSave(raw, NOW + 2).ok).toBe(true);
    expect(importSave("{bad", NOW + 3).ok).toBe(false);
  });

  it("normalizes legacy local saves into Focus and Phase 0 state", () => {
    const legacyActionResourceField = ["vi", "gor"].join("");
    const state = makeReadyState("legacy-save");
    const started = startExpedition(state, "tollroad-of-trinkets", NOW);
    expect(started.ok).toBe(true);
    if (!started.ok) throw new Error("legacy expedition start failed");

    const legacyState = structuredClone(started.state) as Record<string, unknown>;
    legacyState[legacyActionResourceField] = { current: 77, max: 100, lastTickAt: NOW - FOCUS_REGEN_INTERVAL_MS };
    delete legacyState.focus;

    const activeExpedition = legacyState.activeExpedition as Record<string, unknown>;
    activeExpedition[`${legacyActionResourceField}Boost`] = true;
    delete activeExpedition.focusBoost;

    const dailies = legacyState.dailies as { tasks: Array<Record<string, unknown>> };
    dailies.tasks = [
      {
        id: "legacy-1",
        kind: "complete_expeditions",
        role: "primary",
        label: "Complete 3 expeditions",
        target: 3,
        progress: 0,
        claimed: false,
        reward: { gold: 0, materials: {}, focus: 0 }
      },
      {
        id: "legacy-2",
        kind: "win_expeditions",
        role: "secondary",
        label: "Win 2 expeditions",
        target: 2,
        progress: 0,
        claimed: false,
        reward: { gold: 0, materials: {}, focus: 0 }
      },
      {
        id: "legacy-3",
        kind: "salvage_items",
        role: "secondary",
        label: "Salvage 3 items",
        target: 3,
        progress: 0,
        claimed: false,
        reward: { gold: 0, materials: {}, focus: 0 }
      }
    ];
    dailies.tasks[0].kind = `spend_${legacyActionResourceField}`;
    dailies.tasks[0].label = "Spend 20 Focus";
    dailies.tasks[0].reward = { gold: 1, materials: {}, [legacyActionResourceField]: 9 };

    const raw = JSON.stringify({
      game: SAVE_GAME_NAME,
      saveVersion: SAVE_VERSION,
      exportedAt: NOW,
      state: legacyState
    });
    const loaded = loadSave(raw);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) throw new Error("legacy save did not load");
    expect(loaded.state.focus).toMatchObject({ current: 77, cap: FOCUS_MAX, lastRegenAt: NOW - FOCUS_REGEN_INTERVAL_MS });
    expect(loaded.state.activeExpedition?.focusBoost).toBe(true);
    expect(loaded.state.dailies.tasks[0].kind).toBe("spend_focus");
    expect(loaded.state.dailies.tasks[0].reward.focus).toBe(9);
    expect(loaded.state.accountRank.accountRank).toBe(1);
    expect(loaded.state.regionProgress.activeMaterialIds).toEqual(["sunlitTimber", "emberResin", "archiveGlyph", "stormglassShard", "oathEmber"]);
    expect(loaded.state.prestige.upgrades.horizonCartography).toBe(0);
    expect(loaded.state.prestige.upgrades.forgeInheritance).toBe(0);
    expect(loaded.state.construction.activeBuildingId).toBeNull();
    expect(loaded.state.titles["title-first-charter"]?.unlockedAt).toBe(NOW);
    expect(loaded.state.soulMarks.current).toBe(loaded.state.resources.renown);
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

  it("supports early free class respec and later Reincarnation class change", () => {
    const state = makeReadyState("class-change");
    state.lifetime.expeditionsStarted = 1;
    state.hero.level = 5;

    const early = changeHeroClassWithLaunchRules(state, "rogue", NOW + 1);
    expect(early.ok).toBe(true);
    if (!early.ok) throw new Error("early class change failed");
    expect(early.state.hero.classId).toBe("rogue");
    expect(early.state.classChange.freeChangeUsed).toBe(true);
    expect(early.state.rebirth.totalRebirths).toBe(0);

    const blocked = changeHeroClassWithLaunchRules(early.state, "mage", NOW + 2);
    expect(blocked.ok).toBe(false);

    const rebirthReady = structuredClone(early.state);
    rebirthReady.hero.level = REINCARNATION_LEVEL_REQUIREMENT;
    rebirthReady.dungeonClears[REINCARNATION_GATE_BOSS_ID] = 1;
    const changed = changeHeroClassWithLaunchRules(rebirthReady, "mage", NOW + 25 * 60 * 60 * 1000);
    expect(changed.ok).toBe(true);
    if (!changed.ok) throw new Error("rebirth class change failed");
    expect(changed.state.hero.classId).toBe("mage");
    expect(changed.state.hero.level).toBe(1);
    expect(changed.state.rebirth.totalRebirths).toBe(1);
    expect(changed.state.resources.renown).toBeGreaterThanOrEqual(0);
  });

  it("resets the hero run while preserving account, region, mastery, town, construction, and Focus state", () => {
    let state = makeReadyState("rebirth-persistence");
    state.hero.level = REINCARNATION_LEVEL_REQUIREMENT;
    state.hero.xp = 123;
    state.resources.gold = 999;
    state.resources.fragments = 888;
    state.focus.current = 123;
    state.town = {
      forge: 3,
      mine: 2,
      tavern: 4,
      library: 1,
      market: 5,
      shrine: 2
    };
    state.construction = {
      activeBuildingId: "forge",
      startedAt: NOW - 10_000,
      targetLevel: 4,
      baseDurationMs: 120_000,
      focusSpentMs: 0,
      completedAt: null
    };
    state.dungeonMastery["tollroad-of-trinkets"] = { masteryXp: 450, claimedTiers: [1], failures: 2 };
    state.accountRank = { accountXp: 75, accountRank: 2, claimedRankRewards: [1] };
    state.regionProgress.materials.sunlitTimber = 12;
    state.regionProgress.collections.sunlit = { foundPieceIds: ["sunlit-a"], missesSincePiece: 3, completedAt: null };
    state.regionProgress.outposts["sunlit-marches"] = { selectedBonusId: "watchtower", level: 1 };
    state.regionProgress.diaries["sunlit-marches"] = { completedTaskIds: ["clear-road"], claimedRewardIds: ["tier-1"], taskProgress: { "clear-road": 1 } };
    state.caravan.mastery["sunlit-marches"] = { regionId: "sunlit-marches", caravansSent: 2, masteryXp: 12, claimedTiers: [1, 2] };
    state.accountShowcase.selectedTitleId = "sunlit-scout";
    state.traitCodex["ward-bound"] = { traitId: "ward-bound", discovered: true, bestValueSeen: 1, timesFound: 2 };
    state.familyCodex.sunlitCharter = { familyId: "sunlitCharter", discoveredSlots: ["weapon"], highestResonanceReached: 1 };
    state.titles["title-first-charter"] = { unlockedAt: NOW, progress: 1, target: 1 };
    state.trophies["first-rebirth-seal"] = { unlockedAt: NOW };
    state.dungeonClears[REINCARNATION_GATE_BOSS_ID] = 1;
    state.inventory.push({
      id: "run-item",
      name: "Run Item",
      slot: "weapon",
      rarity: "common",
      itemLevel: 1,
      upgradeLevel: 0,
      stats: { power: 1 },
      affixes: [],
      sellValue: 1,
      salvageValue: { fragments: 1 },
      sourceDungeonId: "tollroad-of-trinkets",
      createdAtRunId: 1
    });
    state.equipment.weapon = state.inventory[0];
    const caravan = startCaravanJob(state, "xp", 60 * 60 * 1000, NOW);
    expect(caravan.ok).toBe(true);
    if (!caravan.ok) throw new Error("caravan start failed");
    state = caravan.state;

    const result = performPrestige(state, NOW + 1);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("reincarnation failed");

    expect(result.state.hero.level).toBe(1);
    expect(result.state.hero.xp).toBe(0);
    expect(result.state.resources.gold).toBe(0);
    expect(result.state.resources.fragments).toBe(0);
    expect(result.state.inventory).toEqual([]);
    expect(result.state.equipment.weapon).toBeNull();
    expect(result.state.activeExpedition).toBeNull();
    expect(result.state.dungeonClears).toEqual({});
    expect(result.state.town).toEqual(state.town);
    expect(result.state.construction).toEqual(state.construction);
    expect(result.state.focus.current).toBe(123);
    expect(result.state.caravan.activeJob).toEqual(state.caravan.activeJob);
    expect(result.state.dungeonMastery["tollroad-of-trinkets"]).toEqual({ masteryXp: 450, claimedTiers: [1], failures: 2 });
    expect(result.state.accountRank.accountXp).toBe(175);
    expect(result.state.accountRank.accountRank).toBe(2);
    expect(result.state.regionProgress.materials.sunlitTimber).toBe(12);
    expect(result.state.regionProgress.collections.sunlit?.foundPieceIds).toEqual(["sunlit-a"]);
    expect(result.state.regionProgress.outposts["sunlit-marches"]).toEqual({ selectedBonusId: "watchtower", level: 1 });
    expect(result.state.regionProgress.diaries["sunlit-marches"]).toEqual({ completedTaskIds: ["clear-road"], claimedRewardIds: ["tier-1"], taskProgress: { "clear-road": 1 } });
    expect(result.state.caravan.mastery["sunlit-marches"]).toEqual({ regionId: "sunlit-marches", caravansSent: 2, masteryXp: 12, claimedTiers: [1, 2] });
    expect(result.state.accountShowcase.selectedTitleId).toBe("sunlit-scout");
    expect(result.state.traitCodex["ward-bound"]?.timesFound).toBe(2);
    expect(result.state.familyCodex.sunlitCharter?.highestResonanceReached).toBe(1);
    expect(result.state.titles["title-first-charter"]?.unlockedAt).toBe(NOW);
    expect(result.state.trophies["first-rebirth-seal"]?.unlockedAt).toBe(NOW);
    expect(result.state.rebirth.totalRebirths).toBe(1);
    expect(result.state.soulMarks.current).toBe(result.state.resources.renown);
    expect(result.state.soulMarks.lifetimeEarned).toBe(result.state.prestige.renownEarned);
  });

  it("describes permanent upgrades with clear current and next-run effects", () => {
    expect(RENOWN_UPGRADES).toHaveLength(6);
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
