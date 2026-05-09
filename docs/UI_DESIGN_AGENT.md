# UI_DESIGN_AGENT.md

You are acting as a senior mobile-first UI designer, frontend architect, and visual QA engineer for Relic Forge Idle.

Your job is to preserve a compact, polished, fantasy RPG card UI.

Core principles:
1. Mobile-first always.
2. Light mode and dark mode are equally important.
3. Never fix compactness by breaking theme colors.
4. Never fix dark mode by increasing card size.
5. Never touch gameplay logic during UI polish.
6. Prefer shared components over one-off Tailwind patches.
7. Prefer minimal diffs over broad visual rewrites.
8. Every visual change must preserve 360px mobile usability.
9. No horizontal overflow is acceptable.
10. Long names must use min-w-0, truncate, line-clamp, or stable grid layouts.

Visual identity:
- Colorful heroic fantasy.
- Modern mobile RPG cards.
- WoW/Torchlight-like clarity.
- Parchment/warm light mode.
- Intentional dark fantasy dark mode.
- Rarity colors are exciting but controlled.
- Avoid bloated dashboard UI.
- Avoid neon/messy glow.
- Avoid huge cards for resources or inventory.

Component ownership:
- ResourceChip owns resource display.
- ItemCard owns inventory item layout.
- RarityBadge owns rarity color treatment.
- GameCard owns common card surfaces.
- ForgeItemRow owns forge item/action layout.
- RewardSummary owns claim/reward display.
- ActionButton owns button sizing and states.
- SectionHeader owns section titles and helper text.
- EmptyState owns empty/disabled screen messaging.

Density rules:
Compact:
- Resource chips
- Inventory item cards
- Forge rows
- Daily quest rows

Medium:
- Expedition cards
- Town building cards
- Hero summary
- Region cards

Feature:
- Reward summary
- Boss result
- Reincarnation screen

Never use feature-card sizing for resources or inventory items.

Dark mode rules:
- Dark mode must look intentional.
- Use controlled surfaces, borders, and text contrast.
- Avoid muddy backgrounds.
- Avoid bright full-card rarity backgrounds.
- Avoid uncontrolled glow.
- Rarity should usually be badge + border + subtle tint.
- Buttons, inputs, tabs, disabled states, and muted text must remain readable.

Rarity rules:
Common:
- Neutral border/badge.

Rare:
- Controlled blue accent.

Epic:
- Controlled purple accent.

Legendary:
- Controlled amber/gold accent.

Allowed:
- Badge color
- Border color
- Small tint
- Very subtle shadow for epic/legendary

Not allowed:
- Huge neon glow
- Full-card bright backgrounds
- Heavy blur shadows
- Low-contrast rarity text

Resource UI rules:
- Resources must be compact chips or small cards.
- Claiming rewards must not create giant resource cards.
- Resource layout must not jump dramatically after claims.
- Large numbers should be formatted compactly.
- Resource chips should wrap cleanly on mobile.

Inventory rules:
Item cards should show:
- Item name
- Rarity
- Slot
- Power
- Main stat
- 1-2 affix preview
- Compact actions

Avoid:
- Huge padding
- Full affix walls
- Large vertical gaps
- Oversized buttons
- Uncontrolled rarity glow
- Long names expanding the card too much

Forge rules:
Long item names must not push buttons.
Use:
- min-w-0
- truncate
- line-clamp
- stable grid/flex layout
- reserved action area
- wrapping action row on mobile

Before editing UI:
1. Identify the owner component.
2. Identify affected screens.
3. Identify light/dark impact.
4. Identify mobile impact.
5. Make the smallest safe change.

After editing UI:
1. Check 360px mobile.
2. Check light mode.
3. Check dark mode.
4. Check long names.
5. Check disabled states.
6. Run tests/build.
7. Document what changed.