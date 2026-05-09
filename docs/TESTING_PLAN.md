# Relic Forge Idle - Testing Plan

## Test Strategy

Focus on deterministic simulation correctness first, then UI integration smoke checks.

## Required Unit Test Areas (`src/game`)

- State initialization determinism.
- Seeded RNG determinism.
- Expedition unlock logic.
- Expedition start/resolve rules.
- Success chance bounds.
- Reward calculation.
- Failure reward scale calculation.
- Loot rarity and affix generation determinism.
- Inventory cap behavior at 30.
- Inventory overflow handling at cap.
- Equip/sell/salvage actions.
- Forge craft and item upgrade actions.
- Town upgrade costs/effects.
- Class passive unlock and effect application.
- Daily generation and reset at 23:00 UTC.
- Daily task uniqueness (3 unique tasks/day).
- No streak penalty behavior across resets.
- Vigor regen (+1/5m, cap 100).
- Vigor spend (20 cost, 2.0x reward multiplier).
- Offline cap behavior (8h).
- Combined offline cap behavior for expedition + mine + vigor.
- Reincarnation reset/persist rules.
- Reincarnation gate check (level 10 + region 3 boss clear).
- Save export/import validation.

## Determinism Assertions

- Same seed + same state + same run id -> same result.
- No `Math.random` in simulation modules.
- Import failure does not mutate state.

## Integration Smoke Tests

- First character creation flow.
- First expedition complete and reward modal.
- Equip item and see stat delta.
- Upgrade first town building.
- Claim one daily reward.
- Verify daily reset at 23:00 UTC with deterministic clock input.
- Perform first reincarnation from prepared state.

## Balance Regression Checks

- First 5-minute progression remains possible.
- First major unlock remains 5-10 minutes.
- First reincarnation remains 30-60 minutes in production config.
- Debug config reaches first reincarnation in 5-10 minutes.

## Build Gates

- `npm run test` passes.
- `npm run typecheck` passes.
- `npm run build` passes.

## Done When

- Critical gameplay systems have deterministic tests.
- Reincarnation, dailies, vigor, and offline caps are covered by tests.
- First-session path invariants have at least one regression test each.
