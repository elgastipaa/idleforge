# Relic Forge Idle - Daily Rewards Design

## Daily Structure

- Exactly 3 tasks active each day.
- Daily reset at `23:00` local device time.
- No streak punishment in v1.0.

## Task Pool

- Complete 3 expeditions.
- Win 2 expeditions.
- Defeat 1 boss.
- Salvage 3 items.
- Craft 1 item.
- Upgrade 1 building.
- Spend 20 Vigor.

Selection rules:

- Pick 3 unique tasks/day.
- Avoid repeating the exact same set two days in a row when possible.

## Rewards

Task reward templates:

- gold
- ore/essence/crystals
- vigor
- small loot chest value

Reward sizing:

- each daily gives moderate value, not mandatory to progress.
- full daily completion should feel useful but not required for reincarnation pacing.

Numeric baseline:

- Gold reward per task: `8%` to `12%` of best unlocked non-boss expedition gold reward.
- Material reward per task: `8%` to `12%` of best unlocked non-boss expedition material reward.
- Vigor reward per task: `8` to `12`.

## Vigor Integration

- Dailies can grant vigor.
- Vigor cap remains 100.
- Vigor regen remains +1/5m.

## UX Requirements

- Display time until reset.
- Display per-task completion progress.
- Allow immediate claim.
- Show compact reward claim toast.

## Anti-F2P-Trap Rules

- No streak loss penalties.
- No fear-based urgency copy.
- No paywall hooks in MVP UI.

## Done When

- Daily system supports retention while preserving core expedition loop priority.
- Task count, reset timing, and reward sizing are deterministic and testable.
