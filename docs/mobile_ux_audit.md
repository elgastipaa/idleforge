# UX Cohesion Audit (App-Wide, Mobile-Prioritized)

Date: 2026-05-09  
Scope: `src/app/game-view.tsx`, `src/store/useGameStore.ts`, `src/app/globals.css`  
Primary target: app-wide clarity and ergonomics, validated first at 360px / 390px / 430px.

Implementation policy: recommendations below are app-wide by default, with mobile as the tuning priority. Avoid mobile-only behavior forks unless strictly necessary.

Implementation status (2026-05-09): Phase 1 and Phase 2 are implemented in code (`src/app/game-view.tsx`, `src/game/engine.ts`, `src/store/useGameStore.ts`). Phase 3 remains pending.

## 1) Executive Summary (Top 5 Problems)

1. Action hierarchy is still noisy in the Expeditions flow: onboarding guide, expedition board, vigor control, region cards, and result/offline overlays can compete.
2. Vigor control is a separate control block and adds scan cost during high-frequency expedition actions.
3. Dense text surfaces remain in Forge, Town, and Reincarnation; these are playable but heavy for first-session scanning.
4. Bottom navigation IA is still broad early-game (9 destinations), and “More” is efficient but still a lot of choice too soon.
5. Overlay stack behavior (toast + offline summary + expedition result) is improved, but combined visibility can still feel “busy” during high-frequency loop moments.

## 2) Current UX Diagnosis

### What the app currently does well

- Strong first-run structure with guided next-step rail (`OnboardingGuide`) and reduced early route exposure (`visibleDungeons` narrowing).
- Expedition result panel is meaningfully compacted and now self-dismisses on action.
- Toaster behavior is now thumb-friendly (bottom placement, auto-dismiss, tap-dismiss).
- Resource header is significantly compacted (`Gold`, `Mats`, `Soul`, `Vig`) with progressive disclosure on Mats details.
- Navigation is ergonomic with thumb-reachable primary actions and stable desktop fallback.

### Where confusion/friction remains

- Vigor UX is still a separate checkbox-style control in Expedition Board, disconnected from Start CTA wording.
- Forge “Advanced” sections and Town details are useful but long; first-session users get exposed to heavy text blocks fast.
- Reincarnation explanation is robust but high-density in compact layouts.
- Some screens still require long vertical scans before primary action appears.

## 3) Screen-by-Screen Audit

## Character Start
- Problems: 3 class cards plus stats and taglines create moderate read load before first click.
- Why it matters: early cognitive load can delay first action.
- Recommendation: keep cards, but collapse secondary copy by default (show tagline + 1-line class identity, expand on tap).
- Expected impact: faster time-to-first-expedition.
- Risk: low.

## Header (resources/power)
- Problems: Mats inline value string (`x/x/x/x`) can become visually dense with large values.
- Why it matters: top-row scanning slows down when values are long or grouped.
- Recommendation: keep current 4-chip model; shorten Mats default value to compact grouped form (e.g. `12k/3k/900/120`), with overflow-safe typography fallback across breakpoints.
- Expected impact: cleaner glanceability.
- Risk: low.

## Message Toast
- Problems: none critical; behavior is now strong.
- Why it matters: prior readability and overlap issues were major.
- Recommendation: keep as-is; optional opacity-only animation for perceived stability.
- Expected impact: polish only.
- Risk: low.

## Offline Summary Panel
- Problems: 4 data rows + CTA row can feel tall if stacked with Expedition Result.
- Why it matters: vertical fatigue on return sessions.
- Recommendation: collapse into “compact summary + expand details” when an Expedition Result is also present.
- Expected impact: less stacked-card overload.
- Risk: low/medium.

## Expedition Result Panel
- Problems: still can render many chips + item block + CTA row in one surface.
- Why it matters: high post-claim cognitive load.
- Recommendation: keep compact reward line and item row; move special chips behind “More details” when more than 3 badges.
- Expected impact: faster “decide-and-go” flow.
- Risk: medium.

## Expeditions Screen
- Problems: Vigor control remains separate from action CTA; expedition cards still verbose when many routes are visible.
- Why it matters: core loop screen should maximize action clarity.
- Recommendation: integrate Vigor cost state into Expedition results, on a second Claim CTA (see section 4).
- Expected impact: strongest clarity improvement in core loop.
- Risk: medium.

## Hero Screen
- Problems: class cards + passives + stat cards can be long.
- Why it matters: scanning burden when user just needs one quick check.
- Recommendation: add segmented subviews (`Overview` / `Class` / `Stats`) as a shared screen pattern, tuned for compact density first and reused app-wide.
- Expected impact: reduced scroll depth.
- Risk: medium.

## Inventory Screen
- Problems: many repeated item cards with dense metadata.
- Why it matters: decision fatigue.
- Recommendation: keep compact card, but default to “Best upgrades first” sorting and optional secondary details expansion.
- Expected impact: quicker equip/sell/salvage decisions.
- Risk: medium.

## Forge Screen
- Problems: long vertical stack (Craft, Upgrade, Advanced toggle, Reroll list, Salvage list).
- Why it matters: highest density screen.
- Recommendation: convert to mode tabs (`Craft`, `Upgrade`, `Advanced`) so one task surface is visible at once.
- Expected impact: major scan simplification.
- Risk: medium.

## Town Screen
- Problems: each building card is rich but text-heavy.
- Why it matters: six dense cards in a row creates fatigue.
- Recommendation: keep top-level card compact (purpose + level + upgrade CTA), move details/milestones into secondary sheet/accordion.
- Expected impact: better action focus.
- Risk: medium.

## Dailies Screen
- Problems: mostly good; can still be repetitive with full card-per-task pattern.
- Why it matters: low-friction daily claim loop should be very fast.
- Recommendation: compress completed/claimed tasks into shorter rows by default; keep full detail on tap.
- Expected impact: faster claim flow.
- Risk: low.

## Achievements/Awards Screen
- Problems: dense card grid for low-frequency feature.
- Why it matters: optional progression screen should not feel heavier than core loop.
- Recommendation: use a list-first layout app-wide, then progressively enhance to richer card density on wider viewports; keep completion bar at top.
- Expected impact: better readability, less scroll.
- Risk: low.

## Reincarnation Screen
- Problems: long explanatory content and multiple sections in one view.
- Why it matters: major system but infrequent interaction.
- Recommendation: split into 3 foldouts (`Readiness`, `What resets/persists`, `Upgrades`) with readiness CTA always top-visible.
- Expected impact: clearer decision flow.
- Risk: medium.

## Settings/Save
- Problems: export/import textareas are tall and dominate viewport.
- Why it matters: utility screen can feel heavy and risky.
- Recommendation: collapse export/import panels by default; keep reset isolated in a danger zone.
- Expected impact: cleaner utility experience.
- Risk: low.

## 4) Vigor Interaction Recommendation

Compared patterns:

1. Current separate control (`Use Vigor Boost` checkbox/card)
- Pros: explicit cost visibility.
- Cons: extra control layer, detached from main CTA, adds clutter.

2. Inline cost in second claim CTA (recommended)
- Pattern examples:
  - `Claim Expedition` (primary)
  - `Claim x2 • Vig -20` (secondary, maybe some visual feedback/footprint that this is a bonus, disabled if not enough Vigor)
- Pros: one decision surface, strongest action hierarchy, best for thumb flow.

3. Contextual badge/message near CTA
- Pros: light visual footprint.
- Cons: weaker affordance; users may miss when boost is active.

4. Hybrid segmented CTA (`Normal` / `Boost`)
- Pros: explicit mode choice, still single area.
- Cons: slightly heavier than inline CTA text.

Recommended approach:
- Use inline secondary CTA with x2 and Vigor cost, plus light visual feedback to show that it's a bonus.
- Remove standalone vigor control card from the main expedition board.

Why this wins:
- Keeps only one state in which vigor shows up in a card.
- Preserves clarity of cost.
- Reduces card clutter and scanning overhead in the highest-frequency loop.

## 5) Prioritized Improvement Backlog

### Quick Wins

1. Hide overflow of special chips in Expedition Result after 3 badges.
- Affected: `ExpeditionResultPanel`.
- Impact: medium/high.
- Risk: low.
- Acceptance: at 360px result panel initial height decreases; all hidden chips still accessible via “More”.

2. Compress Offline Summary when Expedition Result is present.
- Affected: `OfflineSummaryPanel`.
- Impact: medium.
- Risk: low.
- Acceptance: only one summary row + expand action by default when result card is active.

3. List-first mode for Achievements as the default across breakpoints.
- Affected: `AchievementsScreen`.
- Impact: medium.
- Risk: low.
- Acceptance: list-first structure is the default; wider viewports can opt into denser presentation without changing information hierarchy.

### Medium Improvements

1. Integrate Vigor into expedition rewards CTA row.
- Affected: `ExpeditionsScreen`, `DungeonCard`, game action wiring in store as needed.
- Impact: very high.
- Risk: medium.
- Acceptance: no separate vigor card/control in the expedition flow app-wide; users can boost runs when claiming without extra panel scanning.
- Status: implemented (boost moved to claim CTA in `ActiveExpeditionPanel`; standalone board toggle removed).

2. Forge mode segmentation (`Craft` / `Upgrade` / `Advanced`).
- Affected: `ForgeScreen`.
- Impact: high.
- Risk: medium.
- Acceptance: one mode surface at a time is the default app-wide, with persistent mode switcher across breakpoints.
- Status: implemented (segmented mode switcher with one mode visible at a time).

3. Town compact card mode + details on demand.
- Affected: `TownScreen`.
- Impact: high.
- Risk: medium.
- Acceptance: default building cards show purpose/level/cost/CTA only; details accessible without leaving screen.
- Status: implemented (expanded building details moved behind collapsed `details` panels).

### Larger Redesigns

1. Session-state UI orchestration for overlays.
- Affected: top-level layout (`Home`) and panel priority logic.
- Impact: high.
- Risk: medium/high.
- Acceptance: only one high-priority overlay panel shown at once in app-wide “focus mode” logic.

2. Hero/Reincarnation structural decomposition into subviews.
- Affected: `HeroScreen`, `ReincarnationScreen`.
- Impact: medium/high.
- Risk: medium.
- Acceptance: each screen has compact default view and optional deeper sections.

## 6) Density Validation Checklist (Viewport Priority)

### 360px
- Check header resource row does not wrap; Mats value remains legible.
- Check Expedition Result CTA row wraps cleanly and never overlaps.
- Check Forge advanced rows (affix reroll) buttons remain reachable and non-overlapping.
- Check bottom nav labels remain readable and no clipping in “More” panel.
- High-density risks: Forge, Town, Reincarnation sections.

### 390px
- Check onboarding card + expedition board + first card fit without feeling like a wall.
- Check offline + result stack height is manageable.
- Check inventory card action row remains stable (`Equip/Sell/Salvage`).
- Density risk: Town cards still text-heavy.

### 430px
- Check cards don’t over-expand vertically due to larger line wrapping.
- Check popovers (Mats) anchor correctly and do not clip off-screen.
- Check bottom navigation and toast do not conflict with interactive buttons above.

## 7) Proposed Implementation Plan

### Phase 1 (Safest, High-Impact)
1. Result/Offline panel compacting logic.
2. Achievements list-first mode.
3. Minor typography tightening on dense utility text (app-wide).

### Phase 2 (Structural Improvements)
1. Vigor inline CTA integration in expedition flow.
2. Forge mode segmentation.
3. Town compact cards + progressive details.

### Phase 3 (Polish/Refinement)
1. Overlay priority orchestration.
2. Hero/Reincarnation subview structure.
3. Final pass for 360/390/430 density and touch ergonomics.

---

## Safest First Batch (implementation-ready)

1. Cap and collapse Expedition Result special chips.
2. Condense Offline Summary when stacked with result panel.
3. Convert Achievements cards to compact list rows as the default structure.

These three preserve all systems, require minimal logic risk, and directly reduce visual overload across the app.
