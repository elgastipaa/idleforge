/goal Refine and restructure Relic Forge Idle planning docs to the hero-first 2.0 direction.

Historical planning snapshot. Canonical planning source is `docs/`.

## Phase Boundary

- This task is docs-only.
- Do not modify `src/`, package files, tests, or runtime code in this phase.
- Canonical planning lives only in `docs/`.
- Remove root-level duplicate planning docs to avoid divergence.

## Final Product Direction

Relic Forge Idle should feel like a modern single-player browser RPG inspired by:

- Gladiatus and Shakes & Fidget structure.
- MU-like reincarnation/reset progression.
- Diablo-like loot excitement.
- Travian-like timers and base progression.
- WoW and Torchlight-like colorful heroic fantasy.

Player fantasy:

"I am a fantasy adventurer with a growing personal town and relic forge. I run expeditions, gain loot, level up, craft and upgrade gear, improve my base, unlock regions, defeat bosses, complete dailies, and reincarnate to grow permanently stronger."

## Core Constraints (MVP v1.0)

- Single player only.
- One controllable hero.
- No multiplayer, PvP, guilds, trading, social systems, leaderboards.
- No backend, accounts, cloud saves, or payments.
- No sprites, canvas, Phaser, Pixi, 3D, or animated combat.
- Deterministic and testable game logic.
- Mobile-first text/card UI.

## Locked MVP Decisions

- Race: post-MVP.
- Dailies: included in MVP.
- Class passives: included in MVP.
- Pet: post-MVP.
- Inventory limit: `30`.
- Daily reset: `23:00 UTC`.
- Daily tasks: exactly `3` active tasks per day.
- No daily streak punishment in v1.0.

## Pacing Targets

- First 5 minutes: multiple quick expeditions, first level-up or equip, first town upgrade.
- First session target: 15 satisfying minutes.
- First major unlock: 5-10 minutes.
- First reincarnation: 30-60 minutes in production tuning.
- Debug mode target: first reincarnation in 5-10 minutes.

## Expedition Timers

- Early: `15s`, `30s`, `60s`, `3m`.
- Mid/Late: `5m`, `10m`, `30m`, `60m`.
- One active expedition at a time in MVP.

## Systems That Must Exist In MVP

- Character creation: name + class (Warrior, Rogue, Mage).
- 5 regions, 4 expeditions/dungeons per region, 1 boss milestone per region.
- Loot: weapon, helm, armor, boots, relic.
- Rarity: common, rare, epic, legendary.
- Affixes, item comparison, equip, sell, salvage.
- Forge: salvage, craft random by slot/class, item level upgrade.
- Town: Forge, Mine, Tavern, Market, Library, Shrine.
- Dailies: 3 tasks/day, 23:00 UTC reset, no streak penalties.
- Vigor: non-monetized boost system.
- Reincarnation with clear reset/persist rules.
- Save/export/import/reset and offline progress summary.

## Locked Caps And Limits

- Offline expedition resolution cap: `8h`.
- Mine passive accumulation cap: `8h`.
- Vigor cap: `100`.
- Vigor regeneration: `+1` every `5m` until cap.
- No infinite offline farming.

## Vigor (MVP Shape)

- Spend Vigor to boost selected expedition rewards.
- Regenerates over time and can be earned via dailies/log-in rewards.
- No premium currency or monetized recharge in MVP.

## Combat Model

- No visual/tactical/real-time combat.
- Deterministic formula-based resolution only.
- Inputs include: class, level, gear, town bonuses, dungeon difficulty, and luck.
- Output summary includes: victory/defeat, reward details, and concise flavor report.

## Scope Boundaries

In MVP:

- Keep crafting simple: no deep recipe tree.
- No set items.
- No awakening/class evolution system yet.

Post-MVP:

- More classes.
- Race system depth.
- Pets/companions.
- Awakening.
- Sets.
- PvP and social features.
- Monetization systems.

## Docs To Produce In `docs/`

Required planning docs:

- `PRODUCT_SPEC.md`
- `GAME_DESIGN.md`
- `TECHNICAL_ARCHITECTURE.md`
- `MVP_SCOPE.md`
- `BALANCE_PLAN.md`
- `CONTENT_PLAN.md`
- `UI_UX_PLAN.md`
- `MONETIZATION_PLAN.md`
- `TESTING_PLAN.md`
- `DEVELOPMENT_ROADMAP.md`
- `TASK_BREAKDOWN.md`
- `RISKS_AND_CUTS.md`
- `VERSION_1_0_DEFINITION.md`
- `FIRST_SESSION.md`
- `LOOT_DESIGN.md`
- `TOWN_DESIGN.md`
- `REINCARNATION_DESIGN.md`
- `DAILY_REWARDS_DESIGN.md`

## Acceptance Criteria

- Docs are coherent and centered on one main hero, not guild management.
- MVP scope remains strict and shippable.
- First 15 minutes are explicitly designed.
- First reincarnation path is explicitly designed.
- Loot, crafting, town, dailies, vigor, and reincarnation are implementation-ready.
- Future monetization is documented only as post-MVP.
- Multiplayer/social/payment systems are clearly excluded from MVP.
- `docs/` is the single planning source with no duplicate root planning docs.

## Final Response Requirement

After doc refactor:

- Summarize final v1.0 direction.
- List major changes from previous docs.
- List scope cuts.
- Provide recommended implementation order.
- Recommend the first file to review.
