# Relic Forge Idle - Reincarnation Design

## Fantasy

Reincarnation is hero rebirth, not guild reset.

## Unlock Gate (MVP)

Fixed gate:

- Reach hero level 18.
- Defeat region 3 boss milestone.

Tune so first reincarnation is 30 to 60 minutes in production.

## Currency

Permanent currency names:

- Soul Marks (chosen MVP name).

## Gain Formula

```ts
soulMarks = max(
  1,
  floor((highestRegion * 2) + (bossClears * 1) + (heroLevel / 4))
)
```

## What Resets

- hero level and XP
- temporary resources (gold, ore, essence, crystals)
- vigor current value
- gear and inventory
- town building levels
- active expedition state
- daily progress state

## What Persists

- Soul Marks balance
- purchased reincarnation upgrades
- achievement unlock flags
- accountless local identity and settings
- lifetime statistics

## Reincarnation Upgrade Tracks

Track 1:

- expedition speed bonus

Track 2:

- resource gain bonus

Track 3:

- loot quality bonus

Track 4:

- boss success consistency bonus

## UX Requirements

- show exact reset vs persist list before confirm.
- show expected Soul Marks gain before confirm.
- provide immediate "new run stronger" feedback.

## Debug Mode

- Ensure first reincarnation is reachable in 5 to 10 minutes for testing.

## Done When

- Reincarnation loop is clear, rewarding, and mathematically predictable.
- Reset/persist lists are complete and directly testable.
