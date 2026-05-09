# UI Design System

Last updated: 2026-05-09

Purpose: keep Relic Forge Idle compact, readable, mobile-first, and consistent in one dark fantasy theme for MVP playtesting.

## Theme Policy

- The app is dark-mode-only.
- Theme switching is disabled.
- Do not introduce light/dark forks in component styling.

## Visual Direction

- Dark fantasy RPG card UI.
- Deep navy/charcoal base surfaces.
- Warm amber/gold highlights.
- Controlled rarity accents (blue/purple/amber).
- Compact dense cards; no bloated dashboard surfaces.

## Shared Tokens And Utility Classes

Source: `src/app/globals.css`.

Core tokens:

- App background: `--surface-app-bg`
- Card background: `--surface-card`
- Elevated card background: `--surface-card-elevated`
- Inset surface: `--surface-card-inset`
- Borders: `--border-subtle`, `--border-strong`
- Primary text: `--text-primary`
- Muted text: `--text-muted`, `--text-dim`
- Accent text: `--text-accent`
- Primary button colors: `--button-primary-*`
- Secondary button colors: `--button-secondary-*`
- Danger button colors: `--button-danger-*`
- Disabled states: `--disabled-bg`, `--disabled-text`
- Inputs: `--input-bg`, `--input-border`
- Badges: `--badge-bg`, `--badge-text`
- Rarity treatments: `--rarity-common-*`, `--rarity-rare-*`, `--rarity-epic-*`, `--rarity-legendary-*`

Shared classes:

- App/surfaces: `surface-app`, `surface-card`, `surface-card-elevated`, `surface-card-inset`
- Text/border helpers: `text-primary`, `text-muted`, `text-accent`, `border-subtle`
- Buttons: `btn-primary`, `btn-secondary`, `btn-danger`
- Inputs/badges: `input-surface`, `badge-surface`
- Rarity: `rarity-common`, `rarity-rare`, `rarity-epic`, `rarity-legendary`, `rarity-glow`

## Card Density Rules

- Compact: resource chips, inventory cards, forge rows, dense daily rows.
- Medium: expedition cards, town cards, hero summary, settings.
- Feature: reward summaries and reincarnation primary panel.

Never use feature sizing for resources, inventory, or forge rows.

## Rarity Rules

- Common: neutral slate treatment.
- Rare: blue border + restrained tint.
- Epic: purple border + restrained tint.
- Legendary: amber border + restrained tint.
- Allowed: border, badge, subtle tint, very light shadow.
- Not allowed: neon glow, full bright cards, heavy blur, muddy low contrast.

## Buttons

- Primary actions must use `btn-primary`.
- Secondary actions must use `btn-secondary`.
- Destructive actions must use `btn-danger`.
- Disabled controls must stay readable.
- Compact button heights must remain stable in dense cards/rows.

## Mobile And Layout Rules

- Minimum viewport: 360px.
- No horizontal overflow.
- `min-w-0` required in text cells inside flex/grid.
- Long row labels use truncation.
- Card names use controlled line clamp.
- Bottom nav must keep icon/text alignment at mobile widths.
- Resource chips stay compact and wrap safely.

## Pre-merge UI Checks

- 360px mobile dark mode.
- 768px tablet dark mode.
- 1440px desktop dark mode.
- Inventory with long names.
- Forge rows with long names and action buttons.
- Reward summary and claim/result state.
- Disabled buttons and form controls readability.
