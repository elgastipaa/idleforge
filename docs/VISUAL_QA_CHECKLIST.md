# Visual QA Checklist

Last updated: 2026-05-09

Required visual gate for UI polish in dark-mode-only MVP.

## Automation

Command:

```bash
APP_URL=http://127.0.0.1:3000 npm run ui:visual-qa
```

Behavior:

- Seeds a representative save with long names and dense UI states.
- Captures screenshots per required viewport and screen in dark theme.
- Writes screenshots and `report.json` to `/tmp/relic-forge-visual-qa`.
- Fails on horizontal overflow.

## Required Viewports

- 360px mobile
- 768px tablet
- 1440px desktop

## Required Theme

- Dark only

## Required Screens

- Expeditions
- Hero
- Inventory
- Forge
- Town
- Dailies
- Reincarnation
- Settings/export/import/reset
- Expedition claim result

## Required Component Checks

- App shell: sticky header and bottom nav readable, no overflow.
- Mobile navigation: compact icon/text layout at 360px.
- Resource chips: compact with large numbers and safe wrapping.
- Reward summary: remains compact after claim/result.
- Inventory cards: compact, readable, controlled rarity styling.
- Forge rows: long names truncate and action buttons stay aligned.
- Town cards: medium density; no oversized visual bloat.
- Daily cards: compact and readable on mobile.
- Reincarnation panel: feature card density only where appropriate.
- Settings controls: input/textarea/button readability in dark theme.
- Disabled states: visible and readable.

## Verification Results

Latest run: 2026-05-09

- Dev server URL: `http://localhost:3004`
- Visual QA command: `PLAYWRIGHT_BROWSERS_PATH=/tmp/pw-browsers APP_URL=http://127.0.0.1:3004 npm run ui:visual-qa`
- Report path: `/tmp/relic-forge-visual-qa/report.json`
- Screenshot directory: `/tmp/relic-forge-visual-qa`
- Captures: `27` (`9` screens x `3` viewports)
- Overflow failures: `0`
- Max overflow: `0`
- Viewport coverage:
  - `mobile360`: `9` captures
  - `tablet768`: `9` captures
  - `desktop1440`: `9` captures

Command results:

- `npm run typecheck`: passed
- `npm test`: passed (`23` tests)
- `npm run build`: passed
