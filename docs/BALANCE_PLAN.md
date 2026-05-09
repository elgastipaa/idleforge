# Relic Forge Idle - Balance Plan

## MVP 2.0 Balance Pass - 2026-05-08

Scope: tune existing numbers only. No new systems, persistence, UI, sprites, canvas, or game engines were added.

### Target Windows

- First expedition completes quickly: target under 30s.
- First meaningful loot: target within 1-2m.
- First rare item: target likely within 5-10m, without hard guarantee.
- First Town upgrade: target within 5m.
- First craft: target around 10-15m.
- First boss milestone: target around 15-25m.
- First reincarnation: target 30-60m without requiring Vigor.
- Offline progress remains useful but capped at 8h.
- Inventory pressure remains present at 24/30 and full at 30/30, but early route should not flood inventory.
- Vigor remains useful as an optional 2x reward boost, not mandatory for first reincarnation pacing.

### Actual Validation Snapshot

Representative no-Vigor simulation after this pass:

| Milestone | Observed |
| --- | ---: |
| First expedition/loot | 0.33-0.67m |
| First rare item | 1.50-1.83m in sampled representative seeds |
| First Town upgrade | 1.50-1.83m |
| First craft | 15.00-15.28m depending on early failure |
| First boss clear | 15.00-15.28m depending on early failure |
| First reincarnation ready | 44.76-57.10m |

Rare-window regression:

- `getLootChance` for early random loot dungeons is now about `0.673`.
- Deterministic test sample: at least `45%` of 80 seeded runs find a rare+ item within 10 minutes.
- Larger local sim sample: `346/500 = 69.2%` rare+ by the second/third dungeon loot window.

## Changes Made

### Debug Timer Scale

- `DEBUG_DURATION_MULTIPLIER`: `0.20 -> 0.16`

Reason:

- The production route was retimed toward a 45-57m first reincarnation, so debug needed a smaller multiplier to stay in the documented 5-10m validation window.

### Loot Chance

`getLootChance` base/cap:

```ts
base: 0.42 -> 0.65
cap: 0.80 -> 0.85
```

Current formula:

```ts
lootChance = clamp(
  0.65 +
    zoneIndex * 0.02 +
    luck * 0.001 +
    treasureOath * 0.004 +
    classPassiveBonus +
    equippedAffixLootBonus +
    longMissionAffixBonus,
  0.35,
  0.85
);
```

Reason:

- The first item is still the existing guaranteed common weapon, but the next two early dungeons now have enough drop pressure for the first rare+ item to commonly appear in the 5-10m window.

### Rarity Weights

Base rarity weights:

| Rarity | Before | After |
| --- | ---: | ---: |
| Common | 64 | 35 |
| Rare | 25 | 45 |
| Epic | 9.2 | 15 |
| Legendary | 1.8 | 5 |

Boss rarity bonus:

| Rarity | Before | After |
| --- | ---: | ---: |
| Rare | +7 | +8 |
| Epic | +3 | +4 |
| Legendary | +1 | +1.5 |

Treasure Oath common-weight floor:

- `40 -> 25`

Reason:

- Preserve common items, but make rare+ loot part of the early MVP 2.0 loop instead of a long-tail event.

### Dungeon Pacing

Route to first reincarnation now totals about `47.6m` before speed reductions/failures and remains in the `30-60m` target in representative no-Vigor simulations.

| Dungeon | Duration Before | Duration After | Power Before | Power After | Min Lvl Before | Min Lvl After |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Tollroad of Trinkets | 12s | 20s | 8 | 8 | 1 | 1 |
| Mossbright Cellar | 25s | 70s | 15 | 14 | 1 | 1 |
| Relic Bandit Cache | 45s | 240s | 28 | 24 | 2 | 2 |
| Copper Crown Champion | 120s | 576s | 48 | 42 | 3 | 3 |
| Lanternroot Path | 180s | 180s | 62 | 55 | 4 | 3 |
| Saffron Sigil Grove | 300s | 210s | 82 | 70 | 5 | 4 |
| Cinderleaf Crossing | 300s | 240s | 108 | 90 | 6 | 5 |
| Emberwood Heart | 300s | 270s | 142 | 118 | 7 | 5 |
| Index of Whispers | 300s | 180s | 170 | 140 | 8 | 6 |
| Mirror-Script Hall | 300s | 210s | 214 | 170 | 9 | 7 |
| Astral Ledger Stacks | 300s | 240s | 268 | 210 | 10 | 8 |
| Curator of Blue Fire | 600s | 420s | 335 | 265 | 11 | 9 |

Reason:

- Region 1 now stretches the first boss milestone to about 15m while keeping the first expedition and first loot fast.
- Region 2/3 were compressed and softened so the first reincarnation stays inside 30-60m even with a few failures.
- Min-level gates now match the one-pass XP curve better; the route still requires clearing prior dungeons.

### Town Economy

Forge building base cost:

```ts
gold: 55 -> 40
ore: 3 -> 3
```

Reason:

- The first two successful expeditions now fund the first Town upgrade around 1.5m, comfortably under the 5m target.

### Unchanged By This Pass

- Craft cost formula.
- Item upgrade cost formula.
- Affix reroll cost formula.
- Inventory cap and warning thresholds (`30`, warning at `24`).
- Offline cap (`8h`) and Mine offline formula.
- Vigor cap/regen/cost/multiplier (`100`, `+1/5m`, `20`, `x2`).
- Reincarnation gate (`level 10` + `curator-of-blue-fire`).
- Daily reset, task count, and rewards.

## Current Core Formulas

XP requirement:

```ts
xpToNext(level) = floor(45 * level^1.55);
```

Success chance:

```ts
successChance = clamp(
  0.5 +
    ((powerScore - dungeonPower) / dungeonPower) * 0.25 +
    luck * 0.002 +
    classModifier +
    classPassiveBonus +
    bossAttunementBonus +
    libraryBonus +
    equippedAffixSuccessBonus,
  0.15,
  0.96
);
```

Craft cost:

```ts
gold = floor(45 + lootLevel * 12);
ore = floor(3 + lootLevel * 0.7);
crystal = max(0, floor((lootLevel - 8) * 0.45));
rune = max(0, floor((lootLevel - 18) * 0.22));
relicFragment = lootLevel >= 45 ? max(1, floor((lootLevel - 40) * 0.12)) : 0;
```

Building cost:

```ts
goldCost = floor(baseGold * 1.62^level);
matCost = floor(baseMaterial * 1.53^level);
```

Reincarnation currency:

```ts
soulMarks = max(1, floor((highestRegion * 2) + bossClears + (heroLevel / 4)));
withShrine = floor(soulMarks * (1 + shrineLevel * 0.04));
debug = withShrine * 2;
```

## Acceptance Criteria

- `npm test` includes pacing checks for:
  - fast first expedition,
  - early Town affordability,
  - first boss timing,
  - craft affordability after early rewards,
  - rare-drop pressure within 10m,
  - production/debug first-reincarnation route duration,
  - XP sufficiency for the reincarnation gate.
- `npm run typecheck`, `npm test`, and `npm run build` must pass after changes.
