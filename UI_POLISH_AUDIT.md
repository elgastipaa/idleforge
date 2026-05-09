# UI Polish Audit

Date: 2026-05-08

Scope: UI-only polish pass for the current Relic Forge Idle build. No gameplay systems, balance formulas, save schema, dependencies, sprites, canvas, or animation libraries were added.

## Screens / States Audited

- Character creation: class cards, hero name input, theme toggle, start action.
- Main dashboard shell: sticky header, Next Goal, power pill, resource/vigor display, mobile and desktop navigation.
- Expedition board: Vigor boost control, active expedition, empty expedition state, dungeon cards, locked/error states, region/boss cards, reward result panel.
- Hero/equipment: hero summary, class cards, stat cards, equipped-item context through inventory and Forge actions.
- Inventory: filter control, capacity bar/warnings, item comparison, sell/salvage/equip actions, empty states.
- Forge: crafting controls, item upgrade rows, affix reroll rows, inventory salvage rows, disabled/locked reroll state.
- Town/base: building cards, current/next/cost rows, milestones, upgrade readiness.
- Dailies/Vigor: daily task cards, progress, claim disabled states, reset timer, Vigor display.
- Reincarnation: gate cards, progress bars, reset/persist cards, permanent upgrade cards.
- Settings/save: export/import textareas, toggles, reset confirmation card.
- Theme/responsiveness: light and dark mode class coverage, long names/descriptions, 360/390/430/768/1024/1440 target widths.

## Issues Found

- Header resources reused generic pills with long labels, so claimed rewards and larger numbers made the resource row feel oversized.
- Rarity visuals were Tailwind gradient utilities without semantic dark-mode control, which made inventory cards and rare+ glows noisy in dark mode.
- Some semi-transparent Tailwind background utilities (`bg-blue-50/70`, amber status pills, warning bars) were not covered by the original dark-mode override list.
- Inventory item cards displayed full metadata, full affix text, and tall action buttons, making each item too large on mobile.
- Expedition result claim card still showed reward tiles, full-ish loot details, a separate level-up block, and a comparison detail card after the first audit pass.
- Forge upgrade, reroll, and salvage rows used flexible wrapping that let long item names compete with action buttons.
- Reward item cards and inventory cards did not consistently clamp long item names or long affix copy.

## Fixes Applied

- Added compact resource chip rendering with short labels, max widths, truncation, and tabular numbers for gold/materials/Soul Marks/Vigor.
- Added semantic rarity classes (`rarity-common`, `rarity-rare`, `rarity-epic`, `rarity-legendary`) and dark-mode overrides with controlled tint, border, and shadow.
- Added missing dark-mode overrides for semi-transparent blue cards, amber status surfaces, warning bars, and the direct dark body background/color path.
- Reduced rare+ hover glow size and preserved reduced-motion behavior.
- Compacted inventory item cards with smaller padding, badge rows, clamped names, top-stat summaries, 1-2 affix previews, stable delta badge, and shorter action buttons.
- Compacted the expedition result claim card back to a single reward line, small milestone chips, one-row loot appraisal, and shorter action buttons.
- Updated reward item cards to clamp names and preview affixes instead of expanding on long affix lists.
- Reworked Forge upgrade/reroll/salvage rows to use `minmax(0, 1fr)` grids, `min-w-0`, truncation, and reserved button columns on wider viewports.

## Remaining Known Issues

- `src/app/page.tsx` remains monolithic; a later UI-slice refactor is still the right maintainability task.
- Achievements still unlock and appear in result moments, but there is no dedicated achievements screen.
- `lastOfflineSummary` exists in state/store, but there is no full offline summary panel yet.

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed (`23` tests).
- `npm run build`: passed.
- Browser viewport/theme smoke checks: passed with a seeded representative save across:
  - widths `360`, `390`, `430`, `768`, `1024`, `1440`,
  - themes `light` and `dark`,
  - tabs `Expeditions`, `Hero`, `Inventory`, `Forge`, `Town`, `Dailies`, `Rebirth`, `Save`.
- Smoke evidence: every viewport/theme/tab check reported `overflow=0`, `chips=7`, correct theme, and inventory/Forge surfaces present where expected.
- Character creation smoke checks: passed across the same widths/themes with `overflow=0`, start action present, and theme toggle present.
- Focused expedition result claim-card smoke check: passed at `360`, `390`, and `430` widths with `height=369`, `overflow=0`, a single `Rewards:` line, and no old reward tiles, item stat block, value block, or comparison detail block.
- `git diff --check`: passed.
- Lint: no lint script is configured in `package.json`.
