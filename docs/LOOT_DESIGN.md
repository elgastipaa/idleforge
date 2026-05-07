# Relic Forge Idle - Loot Design

## Goals

- Make loot exciting in text/card format.
- Keep enough depth for replay without overbuilding.

## Item Model

Fields:

- `slot`
- `rarity`
- `itemLevel`
- `baseStats`
- `affixes[]`
- `powerScoreContribution`
- `sellValue`
- `salvageYield`

## Slots

- weapon
- helm
- armor
- boots
- relic

## Rarity Tiers

- common
- rare
- epic
- legendary

## Affix Count

- common: 1
- rare: 2
- epic: 3
- legendary: 4

## Affix Categories

- offense (power)
- defense (defense/stamina)
- tempo (speed)
- fortune (luck/gold/loot chance)

## Comparison Rules

Item card shows:

- direct stat deltas
- net power score delta vs equipped slot
- simple tag:
  - upgrade
  - sidegrade
  - downgrade

## Inventory Pressure

- Max 30 items.
- Warning at 24+.
- Clear CTA to salvage/sell.

## Salvage And Sell

Sell:

- Converts to gold.

Salvage:

- Converts to ore/essence/crystals by rarity and item level.

## Forge Integration

Forge can:

- craft random item by slot or class bias
- upgrade item level using materials

No reroll in MVP.

## Boss Reward Feel

Bosses grant:

- guaranteed chest roll
- improved rarity weighting
- higher material yield

## Done When

- Loot decisions are meaningful and readable on mobile.
- Forge loop is naturally fueled by salvage.
