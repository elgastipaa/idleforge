# Relic Forge Idle - Final Implementation Plan (v1.0)

## 1. Final v1.0 Feature List

- Single playable hero.
- Character creation:
  - name input
  - class selection (Warrior, Rogue, Mage)
- 5 regions, 4 dungeons each, dungeon 4 as region boss.
- One active expedition at a time.
- Expedition timers:
  - early: 15s, 30s, 60s, 3m
  - later: 5m, 10m, 30m, 60m
- Deterministic expedition resolution with seeded RNG.
- Hero leveling and stat growth.
- Class passives at levels 5, 10, 15 for each class.
- Loot:
  - slots: weapon, helm, armor, boots, relic
  - rarities: common, rare, epic, legendary
  - affixes and power comparison
- Inventory cap: 30.
- Item actions:
  - equip
  - sell
  - salvage
- Forge:
  - craft random by slot/class bias
  - upgrade item level
- Town buildings:
  - Forge, Mine, Tavern, Market, Library, Shrine
- Dailies:
  - exactly 3 active tasks/day
  - reset at 23:00 local device time
  - no streak punishment
- Vigor:
  - cap 100
  - regen +1 every 5m
  - spend 20 for 2.0x expedition reward boost
- Reincarnation:
  - first-run gate: level 10 + region 3 boss clear
  - permanent Soul Marks and upgrades
- Save system:
  - autosave localStorage
  - export/import JSON
  - reset confirmation
- Offline progress:
  - expedition completion
  - mine passive
  - vigor regen
  - capped to 8h
- Mobile-first UI with dedicated screens:
  - Character Start, Expeditions, Hero, Inventory, Forge, Town, Dailies, Reincarnation, Save/Settings

Optional only if time remains:

- achievements.

## 2. Explicit Non-Goals

- No backend, accounts, or cloud saves.
- No multiplayer, PvP, guilds, leaderboards, chat, trading, auction.
- No payments, premium currency, ads, rewarded ads, purchase UI.
- No sprites, canvas, Phaser, Pixi, 3D, animated combat.
- No race gameplay system.
- No pets.
- No multiple controllable heroes.
- No awakening system.
- No set items.
- No deep crafting recipe tree.

## 3. Critical Path

1. Deterministic simulation core (`src/game`).
2. Expedition -> reward -> loot -> inventory loop.
3. Forge + town progression.
4. Dailies + vigor + offline caps.
5. Reincarnation loop.
6. Save/import/export/reset.
7. Mobile-first UI integration.
8. Tests, balance verification, release checklist.

## 4. Implementation Milestones

Milestone 1: Core engine and data

- Content tables, state model, seeded RNG, start/resolve expedition.

Milestone 2: Progression core

- XP/leveling, class passives, loot generation, inventory actions.

Milestone 3: Economy core

- Forge craft/upgrade, town building scaling and effects.

Milestone 4: Retention core

- Dailies (3/day, reset), vigor spend/regen, offline cap behavior.

Milestone 5: Reincarnation core

- Gate logic, reset/persist behavior, Soul Marks gain/upgrades.

Milestone 6: Persistence and UX glue

- Autosave, import/export/reset, summary messaging.

Milestone 7: UI delivery

- Mobile-first screens and navigation, desktop responsive layout.

Milestone 8: Hardening

- Balance tuning for 5-10m major unlock and 30-60m first reincarnation.
- Optional achievements only if all release gates are already green.

## 5. Test Plan

Unit tests (`src/game`):

- determinism (init, RNG, expedition resolution)
- formula bounds and reward scales
- class passive unlock/effect checks
- loot/rarity/affix determinism
- inventory cap and overflow behavior
- forge craft/upgrade transitions
- town upgrade cost/effect checks
- daily generation (3 unique tasks/day) and reset at 23:00 local device time
- no streak penalty logic
- vigor spend/regeneration/cap checks
- offline combined cap checks (expedition + mine + vigor, 8h)
- reincarnation gate and reset/persist invariants
- save import/export validation and failure safety

Integration smoke tests:

- first-session journey (0-15m path)
- first major unlock timing
- first reincarnation from prepared and realistic progression states

Build gates:

- `npm run test`
- `npm run typecheck`
- `npm run build`

## 6. Release Checklist

- Hero-first fantasy preserved in all user-facing copy.
- No guild-manager framing in shipped UI/docs.
- No backend or monetization dependencies.
- No banned rendering/game-engine technologies.
- First-session acceptance criteria met.
- Reincarnation timing targets met:
  - production 30-60m
  - debug 5-10m
- Offline cap behavior correct at 8h.
- Dailies reset and no-streak policy verified.
- Vigor cap/regeneration/spend verified.
- Save/import/export/reset verified.
- Mobile-first ergonomics verified on narrow viewport.
- All build gates pass.

## 7. Risk List

- Scope creep from MMO-like extras.
- Formula drift from under-specified constants.
- Reincarnation pacing misses target.
- Daily system becomes mandatory/grindy.
- Inventory frustration at cap 30.
- UI complexity grows too large for schedule.

## 8. Cut List If Time Runs Short

1. Remove log-in bonus layer, keep dailies only.
2. Reduce forge preview detail (keep mechanics).
3. Simplify reward modal flavor text.
4. Remove optional achievements completely.
5. Simplify desktop side panel and keep mobile-first baseline.

Never cut:

- deterministic expedition loop
- class passives
- dailies (3/day, reset, no streak)
- vigor cap/regeneration/spend
- reincarnation loop
- offline caps
- save/import/export/reset
