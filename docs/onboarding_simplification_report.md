# Onboarding Simplification Report

## Objective
Reduce first-session clutter and make the first 3 minutes of gameplay obvious, with one dominant next action at each step.

## Baseline Post-Class-Selection Audit (Before Simplification)
- Sticky header with full resource strip (gold/ore/crystal/rune/fragments/soul + vigor).
- Dismissible message panel and offline summary panel in the main column.
- Expedition result panel with multiple chips and multi-action row.
- Expedition board card with Vigor explanation and boost toggle.
- Next-goal milestone card with multiple pills.
- Active expedition card.
- Multi-zone expedition list including locked and unavailable routes.
- Full-width mobile tab bar attempting to show all major tabs at once.
- Secondary dense screens (Forge/Town) with long always-open lists and milestone blocks.

## What Was Removed or Hidden in First-Time Experience
- Suppressed non-error message banners during onboarding focus so the main action is not visually competed away.
- Hid offline summary panel during onboarding focus.
- Reduced header density during onboarding focus by showing only core resources (Gold/Ore) and de-emphasizing Vigor.
- Limited expedition presentation to focused routes only, with locked-region lists removed from early experience.
- Delayed dense expedition list visibility in the earliest guided steps (start/claim) so the player sees a single actionable path.
- Moved advanced Forge tools (affix reroll + salvage management) behind an explicit "Show Advanced" toggle.
- Moved Town milestone/detail walls behind a collapsed details block per building.
- Reworked mobile nav from a cramped all-tabs strip to primary tabs + "More" panel.

## New First-Player Flow
1. Start first expedition from the guided CTA.
2. Claim first reward from guided CTA when timer completes.
3. Inspect hero or open Forge for a first upgrade decision.
4. Start next expedition from guided CTA.

Implementation notes:
- Guided rail appears as a top "Guided Next Step" card with one primary CTA and a compact 4-step checklist.
- The expedition board now uses short contextual copy instead of long introductory explanations.
- Vigor details are shown only when relevant (after first clear or low-Vigor context) in onboarding focus.

## MVP 2.1 Priority Execution Summary
- First-session clarity pass: implemented guided next-step rail and single-action early states.
- Mobile navigation and density pass: implemented primary mobile tabs + "More" overflow panel.
- Early pacing rebalance: smoothed first-zone expedition durations to reduce abrupt boredom spikes.
- Context-aware contracts: gated task pool so early players avoid boss/sell/salvage/craft tasks before readiness.
- Reward presentation upgrade: added highlighted celebration panel for first weapon, rare+, and boss milestones.
- Forge/Town simplification: added progressive disclosure for advanced/long sections.
- Playtest integrity controls: debug balance hidden in production playtest builds and blocked at store level.
- Terminology cleanup: standardized player-facing terminology toward Reincarnation + Soul Mark language.

## Tradeoffs
- Advanced systems are still available, but discoverability is intentionally delayed in early minutes.
- Experienced players may need one extra tap ("More" or "Show Advanced") to access secondary systems.
- Some onboarding states intentionally hide route breadth to prioritize focus over immediate completeness.

## Suggestions for Future Onboarding Improvements
- Persist explicit onboarding step completion flags in save state for finer per-player progression.
- Add micro-animations/sound accents on first reward claim and first upgrade to increase emotional payoff.
- Introduce contextual inline tooltips for first-time Vigor use instead of static explanation text.
- Add lightweight telemetry markers (step completion timestamps) for playtest comparison.
- Add an optional "I know this already" skip button that sets onboarding dismissed while preserving safe defaults.
