# Relic Forge Idle - MVP Scope

## Scope Principle

If a feature does not strengthen the expedition-loot-town-reincarnation loop, it is out of MVP.

## In Scope (Must Ship)

- One hero.
- Character creation:
  - name
  - class
- Classes:
  - Warrior
  - Rogue
  - Mage
- 5 regions and 20 dungeons (4 each).
- 5 region bosses (dungeon 4 each region).
- Expedition timers from 15s to 60m.
- Formula-based deterministic resolution.
- XP and leveling.
- 3 class passives per class.
- Loot:
  - 5 slots
  - 4 rarities
  - affixes
  - comparison
  - soft slot focus
  - pity counter
  - early anti-duplicate slot weighting
- Inventory limit 30.
- Equip/sell/salvage.
- Forge:
  - salvage
  - craft by slot/class
  - item upgrade
- Town:
  - Forge, Mine, Tavern, Market, Library, Shrine
- Caravan:
  - 1 to 8h chosen offline job
  - focus resource unlocks by hero level
  - no replacement while active; cancel only with no rewards
- Contracts:
  - 1 main + 2 side/day
  - reset 23:00 local
  - weekly chest with 3 milestones
  - no streak punishments
- Vigor:
  - cap 100
  - regen +1/5m
  - non-monetized boost spend
- Reincarnation loop.
- Offline summary and capped gains.
- Save/export/import/reset.
- Awards system and Awards UI.
- Mobile-first responsive UI.

## Out Of Scope (Must Not Ship In MVP)

- Race gameplay system.
- Pets.
- Multiple controllable heroes.
- Guild systems.
- PvP.
- Trading.
- Leaderboards.
- Backend/accounts/cloud save.
- Payments/ads/premium currency.
- Animated combat.
- Sprites/canvas/Phaser/Pixi/3D.
- Set items.
- Deep recipe tree.
- Awakening system.

## Offline And Passive Caps (Locked)

- Expedition offline resolution cap: 8h.
- Caravan job cap: 8h.
- Vigor regen during offline: 8h cap window.

## Pacing Targets (Locked)

- First major unlock: 5 to 10 minutes.
- First reincarnation:
  - production: 30 to 60 minutes
  - debug mode: 5 to 10 minutes

## Cut Ladder If Behind

1. Remove log-in reward extra layer, keep contracts only.
2. Remove advanced item compare UI, keep basic stat delta.
3. Remove optional flavor combat lines.
4. Reduce Awards UI depth if needed (keep unlock tracking).
5. Reduce forge upgrade UI complexity but keep upgrade mechanics.
6. Keep all must-ship systems intact.

## Acceptance Criteria

- In-scope systems are all independently testable under `src/game`.
- No optional system is allowed to block first-session or reincarnation-critical features.

## Done When

- In/out boundaries are explicit.
- No banned systems leak into MVP implementation plan.
