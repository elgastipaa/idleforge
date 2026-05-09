# Relic Forge Idle - UI/UX Plan

## UI Direction

- Mobile-first fantasy card interface.
- Clean and colorful, not grimdark.
- Warm parchment surfaces with jewel-tone accents.
- Text/card based only.

## Global UX Rules

- Always show next goal.
- Always show current expedition state.
- Always show inventory pressure when near cap.
- Keep primary actions thumb-reachable on mobile.

## Primary Screens

1. Character Start
2. Expeditions
3. Hero
4. Inventory
5. Forge
6. Town
7. Dailies
8. Reincarnation
9. Save/Settings

## Character Start Screen

- Name input.
- Class cards (Warrior, Rogue, Mage).
- Start button.

No race selection in MVP.

## Expedition Screen

Card content:

- dungeon name
- region
- duration
- recommended power
- success chance
- possible rewards
- vigor boost toggle

Active expedition panel:

- timer
- progress bar
- claim button when complete

Completion modal:

- victory/defeat
- XP, gold, materials
- loot card
- boss chest note

## Inventory Screen

- Capacity indicator `current/30`.
- "Near full" warning at 24+.
- Item cards with rarity color and stat delta.
- Actions:
  - equip
  - sell
  - salvage

## Forge Screen

Actions:

- craft random by slot/class
- upgrade selected item

Displays:

- required materials
- estimated power delta preview (single number or compact range)

## Town Screen

Building cards:

- current level
- next effect
- upgrade cost
- upgrade action

Buildings:

- Forge
- Mine
- Tavern
- Market
- Library
- Shrine

## Dailies Screen

- 3 daily tasks.
- Reset timer to 23:00 UTC.
- Claim buttons.
- No streak display.

## Reincarnation Screen

- readiness conditions.
- what resets and what persists.
- permanent currency gain preview.
- confirm reincarnation button.

## Settings/Save Screen

- export save JSON
- import save JSON
- reset save with explicit confirmation
- debug balance toggle

## Responsiveness

Mobile:

- bottom nav tabs.
- single-column cards.

Desktop:

- 2 to 3 column card layout.
- summary side panel.

## Accessibility Baseline

- labels on all buttons.
- contrast-compliant rarity chips.
- text + color for status.
- no motion dependency.

## Done When

- Every core system has a usable screen and clear interaction.
- The first 15 minutes can be played entirely from mobile UI.
- No screen requires high-cost visuals, animation systems, or complex combat rendering.
