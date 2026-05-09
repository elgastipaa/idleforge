# Relic Forge Idle - Game Design

## Core Loop

Choose expedition -> wait -> resolve -> gain XP/gold/materials/loot -> equip/sell/salvage/craft -> upgrade town -> unlock region boss -> complete dailies -> reincarnate -> repeat.

## Player Model

- One controllable hero.
- One active expedition at a time.
- One inventory with 30 slots.

## Character Creation

- Name input.
- Class selection: Warrior, Rogue, Mage.
- Race is post-MVP.

## Stats

`power`, `defense`, `speed`, `luck`, `stamina`.

Derived score used in expedition resolution:

```ts
powerScore =
  power +
  defense * 0.55 +
  speed * 0.7 +
  luck * 0.5 +
  stamina * 0.03 +
  townShrineBonus +
  reincarnationBonus;
```

## Class Identity

Warrior:

- Higher base defense/stamina.
- Better boss consistency.

Rogue:

- Higher speed/luck.
- Better loot and shorter effective expedition cycle.

Mage:

- Higher base power.
- Better crafting and resource conversion bonuses.

## Class Passives (MVP Included)

Each class unlocks passives at levels 5, 10, and 15.

Warrior:

- Lv5 `Iron Oath`: +5% success chance on boss expeditions.
- Lv10 `Unbroken`: -10% expedition failure penalty.
- Lv15 `War Banner`: +8% XP from boss clears.

Rogue:

- Lv5 `Quick Hands`: +8% gold from expeditions.
- Lv10 `Treasure Nose`: +6% loot chance.
- Lv15 `Shadow Cartography`: -8% expedition duration.

Mage:

- Lv5 `Runic Focus`: +8% crafting efficiency (material use reduction).
- Lv10 `Arcane Survey`: +5% success chance on non-boss expeditions.
- Lv15 `Grand Formula`: +10% essence gain.

## Regions And Dungeons

- 5 regions.
- 4 dungeons per region.
- Dungeon 4 in each region is boss milestone and unlock gate to next region.

## Expedition Durations

Early:

- 15s, 30s, 60s, 3m.

Mid/Late:

- 5m, 10m, 30m, 60m.

## Expedition Resolution

Deterministic outcome based on:

- Hero stats and class/passives.
- Equipped gear.
- Town bonuses.
- Dungeon power and type.
- RNG seeded from save seed + run id.

No visual combat simulation.

## Reward Resolution

Success:

- Full XP/gold/materials.
- Loot roll.
- Boss chest roll if boss.

Failure:

- Reduced XP/gold.
- No boss chest.
- Small fallback materials.

## Loot System

- Slots: weapon, helm, armor, boots, relic.
- Rarities: common, rare, epic, legendary.
- Affixes per rarity:
  - common: 1
  - rare: 2
  - epic: 3
  - legendary: 4
- Actions:
  - equip
  - sell
  - salvage
  - forge upgrade

## Forge System

MVP features:

- Salvage item -> materials.
- Craft random item by slot or class bias.
- Upgrade existing item level with materials.

No recipe tree and no set crafting in v1.0.

## Town System

Buildings:

- Forge
- Mine
- Tavern
- Market
- Library
- Shrine

Each has level-based scaling cost and direct gameplay impact.

## Dailies System

- Exactly 3 active daily tasks.
- Reset at 23:00 local device time.
- No streak penalties.
- Rewards focus on gold, materials, vigor, and small chest value.

## Vigor System

- Resource cap: 100.
- Regen: +1 every 5 minutes.
- Spend 20 vigor to apply 2.0x reward multiplier to one expedition.
- No monetized refill in v1.0.

## Reincarnation

Unlock target:

- First reincarnation in 30 to 60 minutes (production).
- Gate is fixed for MVP:
  - hero level 10
  - region 3 boss defeated

Concept:

- Reset short-term progress.
- Keep permanent currency and upgrades.
- Accelerate next cycle.

## Offline Progress

- Complete active expedition if timer elapsed while away.
- Apply mine passive generation while away.
- Apply vigor regen while away.
- 8h cap for all passive/offline gains.
- Show "While you were away" summary.

## Acceptance Criteria

- Class passives, vigor spend, and reincarnation gate are unambiguous and numerically defined.
- First-session systems can be implemented without hidden secondary design decisions.

## Done When

- All core systems have explicit behavior and constraints.
- No design decision is left ambiguous for implementation.
