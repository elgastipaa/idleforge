# UI Polish Rules

Last updated: 2026-05-10

Use this file with `UI_DESIGN_AGENT.md` before changing UI.

## Non-Goals

- Do not add gameplay features.
- Do not change balance, timers, rewards, loot math, save schema, or game logic.
- Do not redesign the app concept.
- Do not add sprites/canvas/3D/animation libraries.

## Theme Policy

- MVP is dark-mode-only.
- Do not add or reintroduce theme switching.
- Do not add light-mode-specific class forks.

## Before Editing

1. Identify owner component.
2. Identify affected screens.
3. Check 360px mobile layout.
4. Check long names, long numbers, disabled states.
5. Keep density compact.
6. Make the smallest safe change.

## Owner Components

- Resource display: `ResourceChip`.
- Inventory item layout: `ItemCard`.
- Rarity treatment: `RarityBadge` + `rarityClass`.
- Card surface: `GameCard`.
- Forge row layout: `ForgeItemRow`.
- Reward/result panel: `RewardSummary`.
- Buttons and states: `ActionButton`.

## Rarity And Surface Rules

- Common neutral slate, rare blue, epic purple, legendary amber.
- Avoid full bright cards, heavy glow, and low contrast.
- Keep all major screens on shared dark tokens from `globals.css`.
- Badge/chip surfaces must use `badge-surface`, rarity classes, or the dark-safe Tailwind utility overrides in `globals.css`.
- If adding a new Tailwind light surface variant such as `bg-white/xx` or `bg-amber-50/xx`, add it to the global dark override list instead of patching one screen.

## Layout Rules

- 360px is minimum supported width.
- No horizontal overflow.
- Use `min-w-0` in flex/grid text cells.
- Row names truncate; card names clamp.
- Forge rows must reserve action space.
- Resource chips must stay compact.
- Reward summaries must remain compact pre/post claim.

## Required Verification

Run:

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run dev`
- `APP_URL=http://127.0.0.1:<port> npm run ui:visual-qa`

Visual QA must include:

- 360px dark mode
- 768px dark mode
- 1440px dark mode
- Expeditions, hero, inventory, forge, town, contracts, reincarnation, settings

If automation is unavailable, document the gap in `VISUAL_QA_CHECKLIST.md`.
