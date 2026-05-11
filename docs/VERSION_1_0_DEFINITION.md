# Relic Forge Idle - Version 1.0 Definition

## Release Definition

v1.0 is complete when a player can:

1. Create a hero (name + class).
2. Progress through 5 regions and 20 dungeons.
3. Defeat 5 region bosses.
4. Manage loot in 5 slots with 4 rarities and affixes.
5. Use forge actions (craft and upgrade).
6. Upgrade all 6 town buildings.
7. Complete and claim daily Contracts (1 Main + 2 Side) and progress the weekly chest.
8. Use vigor boosts with regeneration.
9. Reincarnate and spend permanent progression.
10. Save/load/export/import/reset locally.
11. Receive offline summary with capped gains.
12. View and progress Awards.

Note:

- Reincarnation can occur before full region completion.
- Release validation must confirm both capabilities exist:
  - first reincarnation path
  - full 5-region/5-boss progression path

## Release Blocks

- Any backend dependency.
- Non-deterministic core simulation.
- Missing reincarnation.
- Missing contracts.
- Missing class passives.
- Missing offline caps.
- Missing inventory cap behavior.
- Failed test/typecheck/build.
- Reincarnation gate mismatch between docs and implementation.

## Acceptance Metrics

- First major unlock in 5 to 10 minutes.
- First reincarnation in 30 to 60 minutes (production).
- Debug reincarnation in 5 to 10 minutes.

## Done When

- All mandatory release behaviors are present and verifiable.

## Implementation Notes (2026-05-07)

- The permanent reincarnation currency is labeled **Soul Marks** in UI and stored internally as `resources.renown`.
- Awards are shipped in v1.0.
- Caravan is the active offline job system: 1h to 8h jobs, one active Caravan at a time, cancel gives no rewards.
- Overflow loot at inventory cap (`30`) is auto-salvaged (not auto-sold).
