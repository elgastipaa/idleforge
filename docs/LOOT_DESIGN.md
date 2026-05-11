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

Global loot state:

- `focusSlot`: `"any"` or one equipment slot.
- `missesSinceDrop`: drop pity counter.
- `recentSlots`: short memory used to reduce early slot repetition.

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
- legendary: 5

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

## Loot Direction Lite

- Inventory exposes `Loot Focus`.
- Focus can be `Any Slot` or one of the 5 equipment slots.
- Focus biases expedition drops toward the chosen slot; it is not a guarantee.
- Forge crafting remains separate and keeps its explicit slot/class-bias controls.

## Pity And Anti-Duplicate Rules

- `missesSinceDrop` increments after successful expeditions that do not drop gear.
- At `LOOT_DROP_PITY_THRESHOLD = 3`, the next successful expedition forces a drop.
- Any drop resets the pity counter.
- During the first `10` found items, the last `2` dropped slots are weighted down unless they match the current focus.

## Salvage And Sell

Sell:

- Converts to gold.

Salvage:

- Converts to ore/essence/crystals by rarity and item level.

## Forge Integration

Forge can:

- craft random item by slot or class bias
- upgrade item level using materials
- reroll one affix at a time from Forge level 3.

## Boss Reward Feel

Bosses grant:

- guaranteed chest roll
- improved rarity weighting
- higher material yield

## Done When

- Loot decisions are meaningful and readable on mobile.
- Forge loop is naturally fueled by salvage.
