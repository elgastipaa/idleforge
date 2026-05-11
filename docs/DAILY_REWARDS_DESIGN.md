# Relic Forge Idle - Contracts Rewards Design

## Contract Structure

- Exactly 3 contracts active each day.
- 1 Main contract + 2 Side contracts.
- Reset at `23:00` local time.
- No streak punishment in v1.0.
- A weekly chest track advances when daily contracts are claimed.
- Weekly chest has 3 milestones at `3`, `9`, and `15` claimed contracts.

## Contract Pool

- Complete 3 expeditions.
- Win 2 expeditions.
- Defeat 1 boss.
- Salvage 3 items.
- Craft 1 item.
- Upgrade 1 building.
- Spend 20 Vigor.

Selection rules:

- Pick 3 unique contracts/day with 1 Main + 2 Side.
- Avoid repeating the exact same set two days in a row when possible.

## Rewards

Contract reward templates:

- gold
- ore/essence/crystals
- vigor
- small loot chest value

Reward sizing:

- each daily gives moderate value, not mandatory to progress.
- full daily completion should feel useful but not required for reincarnation pacing.

Numeric baseline:

- Main Gold/material reward: `16%` to `20%` of best unlocked non-boss expedition reward.
- Side Gold/material reward: `8%` to `12%` of best unlocked non-boss expedition reward.
- Main Vigor reward: `14` to `18`.
- Side Vigor reward: `8` to `12`.
- Weekly milestone reward scales: `35%`, `75%`, `125%` of best unlocked non-boss expedition reward.
- Weekly Vigor rewards: `15`, `25`, `40`.

## Vigor Integration

- Contracts can grant vigor.
- Vigor cap remains 100.
- Vigor regen remains +1/5m.

## UX Requirements

- Display time until reset.
- Display per-contract completion progress.
- Display weekly chest progress and milestone claim state.
- Allow immediate claim.
- Show compact reward claim toast.

## Anti-F2P-Trap Rules

- No streak loss penalties.
- No fear-based urgency copy.
- No paywall hooks in MVP UI.

## Done When

- Contract system supports retention while preserving core expedition loop priority.
- Contract count, reset timing, weekly milestones, and reward sizing are deterministic and testable.
