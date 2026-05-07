# Relic Forge Idle - Product Spec (v2 Direction)

## Supersession

This specification supersedes previous guild-manager positioning.

Canonical planning source is `docs/` only.

## Product Summary

Relic Forge Idle is a mobile-first, text/card-based, single-player fantasy idle RPG.

Player fantasy:

"I am a fantasy adventurer with a growing personal town and relic forge. I run expeditions, gain loot, improve gear, unlock regions, beat bosses, complete dailies, and reincarnate for permanent growth."

## Target Experience

- Short session friendly (15 seconds to 3 minute expeditions early).
- Longer grind available (5 to 60 minute expeditions later).
- Constant visible progression: hero level, gear quality, town levels, region unlocks, dailies, and reincarnation.

## North Star

Deliver an infinite-MMORPG feeling without multiplayer by combining:

- Timers and returns.
- Loot excitement and upgrade decisions.
- Reincarnation loops with permanent progression.

## Platform And Tech Constraints

- Web only for v1.0 (deployable on Vercel).
- No backend, no accounts, no cloud saves.
- No multiplayer/PvP/social systems.
- No payment integration in v1.0.
- No sprites/canvas/Phaser/Pixi/3D/animated combat.

## MVP Mandatory Features

- One hero with character creation (name + class).
- Classes: Warrior, Rogue, Mage.
- Race: post-MVP.
- 5 regions.
- 4 expeditions per region.
- 1 boss milestone per region.
- 5 equipment slots: weapon, helm, armor, boots, relic.
- 4 rarities: common, rare, epic, legendary.
- Affixes and comparison.
- Equip/sell/salvage.
- Forge crafting and item upgrade.
- Town buildings: Forge, Mine, Tavern, Market, Library, Shrine.
- Dailies: included.
- 3 class passive milestones per class: included.
- Vigor: included as non-monetized boost.
- Reincarnation: included.
- Save, export/import, reset, offline progress summary.

Optional only if ahead of schedule:

- achievements and achievements UI.

## Locked Numeric Constraints

- Inventory limit: `30`.
- Offline expedition cap: `8h`.
- Mine passive cap: `8h`.
- Vigor cap: `100`.
- Vigor regen: `+1` every `5m`.
- Daily task count: `3`.
- Daily reset: `23:00 UTC` (`20:00 GMT-3`).
- No streak punishment in v1.0.

## Pacing Targets

- First 5 minutes:
  - 3 to 6 expedition completions.
  - First item equip or first level-up.
  - First town upgrade.
- First 15 minutes:
  - First boss or equivalent milestone.
  - First rare item or first crafted upgrade.
- First major unlock: 5 to 10 minutes.
- First reincarnation:
  - Production: 30 to 60 minutes.
  - Debug mode: 5 to 10 minutes.
- Reincarnation gate for first run:
  - level 18
  - region 3 boss defeated

## Non-Goals For v1.0

- Guild management fantasy.
- Multiple controllable heroes.
- Pets, races with mechanics, awakenings, set items.
- Trading, economy systems, social features, events.
- Premium currency, ads, or purchases.

## Success Criteria

- A player can reach first reincarnation in 30 to 60 minutes with normal play.
- The player always has a clear next goal in UI.
- Core loop is fully playable without hidden dependencies.
- No required system remains as placeholder.

## Done When

- Product intent is hero-first and explicit.
- MVP includes/excludes are unambiguous.
- Numeric caps and pacing are locked for implementation.
