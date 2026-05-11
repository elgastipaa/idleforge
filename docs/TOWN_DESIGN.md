# Relic Forge Idle - Town Design

## Town Fantasy

The town is the hero's personal base anchored by the Relic Forge.

## Buildings (MVP)

1. Forge
2. Mine
3. Tavern
4. Market
5. Library
6. Shrine

## Building Effects

Forge:

- unlocks and improves craft/upgrade efficiency.

Mine:

- expedition material multiplier.
- improves Ore and Crystal Caravan yields.
- no longer grants passive offline materials by itself.

Tavern:

- XP multiplier and stamina.
- contract readiness flavor in Town feedback.

Market:

- better sell value and minor exchange utility.

Library:

- XP and expedition knowledge bonuses.

Shrine:

- reincarnation-related bonuses.

## Cost Scaling

```ts
goldCost(level) = floor(baseGold * 1.62^level)
matCost(level) = floor(baseMat * 1.53^level)
```

## UX Requirements

- each card shows:
  - current level
  - next bonus
  - upgrade cost
  - affordability state

## Town As Long-Term Sink

- Town levels should consume enough resources to drive repeated expedition and loot decisions.
- Shrine must feel valuable for reincarnation planning.

## Done When

- Town upgrades create clear strategic choices and durable progression goals.
