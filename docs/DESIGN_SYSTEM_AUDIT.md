# Design System Audit

Last updated: 2026-05-08

Scope: Relic Forge Idle UI stabilization only. This audit covers visual architecture, compactness, responsive behavior, light/dark mode, rarity treatment, and visual QA ownership. It intentionally excludes gameplay, balance, save logic, and new systems.

## 1. Current Shared UI Components

Current shared UI ownership lives in `src/app/page.tsx`:

- `GameCard`: common card surface with `compact`, `medium`, and `feature` density.
- `ResourceChip`: compact resource display in the sticky header.
- `ItemCard`: inventory item layout, comparison summary, affix preview, and compact actions.
- `RarityBadge`: controlled rarity badge treatment.
- `ActionButton`: primary/secondary button sizing, contrast, and disabled states.
- `RewardSummary`: compact expedition result/claim panel.
- `ForgeItemRow`: stable forge/salvage row layout with reserved action area.
- `SectionHeader`: screen-level title, description, and right-side control/action.
- `StatDelta`: reusable item comparison pill.
- `EmptyState`: consistent empty/disabled messaging.

Supporting primitives:

- `Pill`: generic compact badge.
- `ProgressBar`: shared compact progress display.
- `ThemeToggle`: global light/dark mode control.

## 2. Missing Or Duplicated Components

Resolved in this pass:

- Resource display now has a named owner (`ResourceChip`) instead of a generic compact chip.
- Reward claim/results now use `RewardSummary` and stay compact.
- Inventory cards now have an explicit `ItemCard` owner and compact density.
- Forge item/action rows now use `ForgeItemRow` to prevent long names from pushing buttons.
- Buttons now share `ActionButton`, with primary and secondary wrappers.

Still intentionally not extracted:

- `Pill` remains generic because many small state labels differ by copy and icon.
- Screen-specific content blocks remain inline where they are not repeated enough to justify a component.

## 3. One-Off Tailwind Usage By Screen

- App shell: mostly shared via `Header`, nav markup, `Card`, and `GameCard`; nav active states remain screen-local.
- Mobile navigation: one-off 4-column grid, acceptable because it is a single app-shell element and avoids horizontal scrolling.
- Resource header/chips/cards: owned by `ResourceChip`; no feature-card resource cards; chips wrap on mobile.
- Game cards: owned by `GameCard`; legacy `Card` wrapper delegates to it.
- Inventory item cards: owned by `ItemCard`.
- Equipment cards: currently rendered as hero/equipment-related cards; future equipment detail should reuse `ItemCard` or `GameCard`.
- Item comparison: `StatDelta` owns compact comparison treatment.
- Rarity badges/glows: `RarityBadge` and `rarityClass` own color, tint, and glow limits.
- Reward summary / claim result: owned by `RewardSummary`.
- Forge item rows: owned by `ForgeItemRow`.
- Crafting/upgrade/reroll panels: panels still use `GameCard`; item rows use `ForgeItemRow`.
- Town building cards: medium `GameCard` usage remains appropriate.
- Expedition cards: medium `GameCard` usage remains appropriate.
- Region/boss cards: medium cards with boss border emphasis remain appropriate.
- Daily quest cards: medium card today; can move to compact if density becomes an issue.
- Reincarnation panels: feature-level screen cards remain appropriate.
- Awards: data exists in game state and is integrated in current UI; deeper expansion can remain optional.
- Settings/export/import/reset: medium `GameCard` plus shared buttons/inputs.
- Empty states: owned by `EmptyState`.
- Disabled states: centralized through `ActionButton` wrappers and dark-mode CSS overrides.
- Buttons and inputs: buttons centralized; inputs/selects still use direct Tailwind plus dark-mode CSS overrides.
- Light mode: warm parchment page, white cards, controlled rarity tints.
- Dark mode: global `[data-theme="dark"]` overrides preserve contrast across white/parchment/rarity surfaces.

## 4. Dark Mode Inconsistencies

Problems found:

- Dark mode relied on broad utility overrides instead of named ownership.
- Rarity backgrounds could become muddy or overly saturated.
- Inputs, selects, and disabled buttons needed explicit dark surfaces.
- Muted text and borders needed enough contrast on dark cards.

Fixes in place:

- `layout.tsx` bootstraps theme before hydration to avoid theme flash.
- `globals.css` defines dark page background, body text, input/select surfaces, disabled states, card shadows, muted text, and rarity-specific dark treatments.
- Shared button, resource, item, reward, and forge components keep density separate from theme styling.

Remaining risk:

- Because Tailwind utility classes still drive many screen-level surfaces, new screen work must follow `UI_DESIGN_SYSTEM.md` instead of adding isolated dark-mode overrides.

## 5. Rarity Styling Inconsistencies

Rules now enforced by component ownership:

- Common: neutral border/tint, no glow.
- Rare: controlled blue border/tint.
- Epic: controlled purple border/tint and subtle shadow only.
- Legendary: controlled amber/gold border/tint and subtle shadow only.

Known risk:

- `rarityClass` is shared by both cards and badges. Keep class additions subtle and test both contexts before changing it.

## 6. Layout Instability Risks

High-risk areas and current controls:

- Reward claim/resources: `RewardSummary` uses a single compact reward line and compact action buttons.
- Inventory item names: `ItemCard` uses `line-clamp-2`, compact metadata, and a fixed three-action row.
- Forge long names: `ForgeItemRow` uses `min-w-0`, `truncate`, a grid with `minmax(0,1fr)`, and a reserved action area.
- Resource numbers: `formatNumber` compacts large values and `ResourceChip` truncates labels.
- Mobile nav: fixed bottom nav uses a 4-column grid so it does not create horizontal scroll.

## 7. Mobile Overflow Risks

Required floor: 360px width.

Controls in place:

- `html` and `body` have `overflow-x: hidden`.
- Resource strip wraps compact chips within the header.
- Mobile nav uses a fixed 4-column grid instead of horizontal scrolling.
- Forge rows reserve actions and truncate names.
- Inventory card action row uses compact buttons and reduced gaps.
- Text-heavy rows use `line-clamp`, `truncate`, or `min-w-0`.

Risk to monitor:

- Long translated/localized labels and unusually long item names can still stress fixed-width button rows. Visual QA must include long item names.

## 8. Component Ownership

| Component | Owns | Density |
| --- | --- | --- |
| `GameCard` | Shared card surface, radius, shadow, density | Compact/medium/feature |
| `ResourceChip` | Header resources and large-number display | Compact |
| `ItemCard` | Inventory essentials and compact actions | Compact |
| `RarityBadge` | Rarity label, color, tint, glow limits | Compact |
| `ActionButton` | Primary/secondary button sizing and disabled contrast | Compact/default |
| `RewardSummary` | Expedition claim/result display | Feature, compact internals |
| `ForgeItemRow` | Forge upgrade/reroll/salvage row stability | Compact |
| `SectionHeader` | Screen titles plus right-side filters/status | Medium |
| `StatDelta` | Item comparison status | Compact |
| `EmptyState` | Empty/disabled state messaging | Medium |

## 9. Recommended Minimal Refactor Plan

Completed:

1. Add named component owners without moving game logic.
2. Route existing generic card/button/resource patterns through those owners.
3. Stabilize reward, inventory, and forge layouts first because they were known regressions.
4. Document design rules and visual QA gates in `/docs`.
5. Add a lightweight visual QA script instead of a heavy new framework.

Next only if needed:

1. Extract shared components into `src/components/ui/*` if `page.tsx` becomes difficult to maintain.
2. Split screen components by tab once UI behavior stabilizes.
3. Add focused component tests only after shared components move out of the app page.
