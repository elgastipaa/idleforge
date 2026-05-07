# Relic Forge Idle - Balance Plan

## Primary Targets

- First 5 minutes: fast progression and first meaningful upgrade.
- First 15 minutes: first boss or equivalent milestone.
- First reincarnation:
  - Production: 30 to 60 minutes.
  - Debug mode: 5 to 10 minutes.

## Core Progression Formulas

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
    classPassiveBonus +
    libraryBonus,
  0.15,
  0.96
);
```

Term definitions:

- `classPassiveBonus`: from class passives only, bounded to `0.00` to `0.10`.
- `libraryBonus`: `libraryLevel * 0.004`, max `0.048` at level 12.

Reward multipliers:

```ts
vigorMultiplier = vigorSpent ? 2.0 : 1.0;
reincarnationMultiplier = 1 + permanentPower * 0.02;
marketMultiplier = 1 + marketLevel * 0.05;
successScale = success ? 1.0 : 0.35;
```

Final XP and gold:

```ts
xp = floor(baseXp * successScale * vigorMultiplier * reincarnationMultiplier);
gold = floor(baseGold * successScale * vigorMultiplier * marketMultiplier);
```

## Dungeon Timer Bands

Early:

- 15s
- 30s
- 60s
- 3m

Mid:

- 5m
- 10m

Late:

- 30m
- 60m

## Region Progression Curve

Each region (1-5) scales:

- +22% to +35% recommended power vs previous region.
- Boss recommended power +15% vs region dungeon 3.

## Loot Rates

Base loot drop chance:

```ts
baseLootChance = clamp(0.42 + zoneTier * 0.02 + luck * 0.001, 0.35, 0.80);
```

Rarity weights (before modifiers):

- common: 70
- rare: 22
- epic: 7
- legendary: 1

Boss chest rarity bonus:

- +5 rare weight
- +2 epic weight
- +0.5 legendary weight

## Inventory Pressure

- Inventory max: 30.
- At 24+ items show warning.
- At cap, expedition resolution still works and extra dropped loot is auto-salvaged to baseline materials.

## Town Economy Scaling

Building cost:

```ts
goldCost = floor(baseGold * 1.62^level);
matCost = floor(baseMaterial * 1.53^level);
```

Mine passive:

- Hourly output scales by Mine level.
- Offline mine collection capped at 8h.

## Daily Economy

- 3 tasks/day.
- Reset 23:00 UTC.
- Reward budget per day:
  - target value near 15 to 25 minutes of equivalent expedition rewards.
- No streak multiplier.

Per-task reward baseline:

- Gold: `8%` to `12%` of current best non-boss expedition gold.
- Materials: `8%` to `12%` of current best non-boss expedition materials.
- Vigor: `8` to `12` per claimed task.

## Vigor Economy

- Cap 100.
- Regen +1 every 5m.
- Daily rewards can grant +10 to +30 vigor total/day.
- Expedition boost spend: 20 vigor for 2.0x rewards on one expedition.

## Reincarnation Economy

First reincarnation should be reachable at:

- Hero level 18.
- Region 3 boss defeated.

Permanent currency gain:

```ts
soulMarks = max(1, floor((highestRegion * 2) + (heroLevel / 4) + bossClears));
```

## Debug Mode

For testing only:

- Timer scale: 0.2x.
- XP and gold scale: 4x.
- Reincarnation currency scale: 2x.

## Acceptance Criteria

- Simulation constants are explicit and require no extra balancing assumptions to implement.
- First reincarnation gate is deterministic and consistent with other planning docs.
- Vigor spend and daily reward budgets are concrete enough for direct coding.

## Done When

- Balance numbers support first-session excitement and 30-60m first reincarnation.
- Debug mode reliably reaches first reincarnation in 5-10m.
