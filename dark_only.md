/goal Convert Relic Forge Idle to a dark-mode-only visual theme for MVP stability.

Do not add gameplay features.
Do not change game logic.
Do not rebalance.
Do not redesign the app concept.
Do not increase card sizes.
Do not touch unrelated systems.

Decision:
For MVP/playtesting, the game will support only one visual theme: polished dark fantasy mode.
Remove or disable light/dark theme switching if present.
Stop relying on dual light/dark styling.
Make the entire UI consistently dark by default.

Visual target:
A polished dark fantasy mobile RPG UI:
- Deep navy/charcoal/obsidian surfaces
- Warm gold/amber highlights
- Controlled purple/blue/emerald rarity accents
- Clear readable text
- Compact cards
- No muddy gray-on-gray
- No neon over-glow
- No bright accidental backgrounds
- No bloated dashboard look

Important:
Do not simply make everything black.
Create a consistent dark design system.

Required:
1. Audit current theme/color usage.
2. Remove conflicting light/dark class patterns where they cause inconsistency.
3. Create or update shared design tokens/classes for:
   - App background
   - Card background
   - Elevated card background
   - Borders
   - Muted text
   - Primary text
   - Accent text
   - Buttons
   - Disabled states
   - Inputs
   - Badges
   - Rarity treatments
4. Ensure all major screens use the same dark theme rules.
5. Ensure inventory, forge, resources, reward claim, town, expeditions, dailies, and reincarnation look consistent.
6. Preserve compact layouts.
7. Preserve inventory/resource/forge compactness fixes.
8. Preserve mobile-first layout.

Rarity styling:
Use subtle controlled treatments:
- Common: neutral slate
- Rare: blue border/badge
- Epic: purple border/badge
- Legendary: amber/gold border/badge

Avoid:
- Full-card neon backgrounds
- Heavy glow
- Bright text on bright surfaces
- Muddy low-contrast cards
- Random Tailwind colors per component

Buttons:
Audit all buttons.
Buttons must look intentional in dark mode:
- Primary action: clear fantasy accent, readable text
- Secondary action: dark surface with visible border
- Destructive action: controlled red, not neon
- Disabled action: muted but readable
- Small action buttons: compact and aligned

Test required viewports:
- 360px mobile
- 768px tablet
- 1440px desktop

Acceptance criteria:
- The app has one coherent dark visual theme.
- There are no leftover broken light-mode assumptions.
- Buttons are readable and visually consistent.
- Inventory cards look compact and polished.
- Resource displays stay compact.
- Forge long item names do not break layout.
- Rarity visuals are attractive but controlled.
- No horizontal overflow at 360px.
- Build/tests pass.

Audit:
- Expedition buttons
- Claim buttons
- Inventory equip/sell/salvage buttons
- Forge craft/upgrade/reroll buttons
- Town upgrade buttons
- Daily claim buttons
- Reincarnation buttons
- Settings/export/import/reset buttons
- Modal buttons

Acceptance criteria:
- Button colors are consistent and attractive in dark mode.
- Primary actions are obvious.
- Secondary actions are readable but less loud.
- Destructive actions are clear but not ugly/neon.
- Disabled buttons are visibly disabled but readable.
- No button causes card layout issues.
- Tests/build pass.

Update docs:
- UI_DESIGN_SYSTEM.md
- UI_POLISH_RULES.md
- VISUAL_QA_CHECKLIST.md

Final response:
- Explain what theme decisions were made.
- List files changed.
- Confirm theme switching status.
- Confirm button color fixes.
- Confirm inventory/resource/forge compactness preserved.
- Confirm tests/build.