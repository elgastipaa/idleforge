# Changelog

## 2026-05-09 (UX Cohesion Audit - Phase 2 Implementation)

### Changed
- Moved Vigor boost to expedition claim time:
  - active expedition now offers `Claim Expedition` and `Claim x2 · Vig -cost`,
  - standalone Vigor boost toggle/control was removed from Expedition Board.
- Updated engine/store wiring so Vigor boost is consumed on claim (`resolveExpedition`) instead of start (`startExpedition`).
- Reworked Forge into segmented modes (`Craft` / `Upgrade` / `Advanced`) with one main mode surface visible at a time.
- Compacted Town building cards:
  - default card now prioritizes purpose, level, cost, and CTA,
  - deeper feedback/milestones remain available in collapsed details panels.
- Updated tests for the claim-time Vigor boost flow.

### Documentation
- Updated `docs/mobile_ux_audit.md` status to mark Phase 1 + Phase 2 as implemented and Phase 3 as pending.
- Updated `docs/05_DECISIONS_LOG.md` with Phase 2 conceptual decisions.
- Updated `docs/06_TASKS.md` to reflect completed Phase 2 work and new active focus on Phase 3.

## 2026-05-09 (Docs Consistency Canonicalization)

### Changed
- Set canonical daily reset wording to `23:00 UTC` across planning docs.
- Reaffirmed `docs/` as canonical source and `docs/00..07` as primary workflow.
- Removed `docs/README.md` to avoid competing source-of-truth indexes.
- Clarified that root-level planning files (for example `2_0_definition.md`) are historical context only.
- Updated v1.0 documentation to treat Awards as shipped (not optional).

### Notes
- Documentation-only update.
- No gameplay logic, save schema, runtime behavior, or dependencies changed.

## 2026-05-09 (MVP 2 Roadmap Re-Iteration Deep Pass)

### Added
- Added `docs/MVP_2_DECISION_SUMMARY.md` with:
  - final MVP 2.0 scope,
  - top 5 build and top 5 avoid lists,
  - 3/7/14-day versions,
  - first implementation prompt for coding phase.

### Changed
- Rewrote `docs/MVP_2_ROADMAP.md` as a stricter multi-pass strategy document:
  - PASS 1 critique of prior roadmap quality and scope risk,
  - PASS 2 retention analysis by player timeframe (5m/15m/1h/1d/1w),
  - PASS 3 scored feature matrix (20+ candidates) with bang-for-buck method,
  - PASS 4 constrained MVP 2.0 selection (max 5 major improvements),
  - PASS 5 competing package comparison (Retention-first vs Loot/Buildcraft-first vs Content/Progression-first),
  - PASS 6 milestone-level implementation plan with cut lines,
  - PASS 7 red-team self-critique and revised recommendation.

### Notes
- Planning/docs-only update.
- No gameplay logic, formulas, save schema, UI runtime behavior, or dependencies changed.

## 2026-05-09 (MVP 2 Roadmap Planning)

### Added
- Added `docs/MVP_2_ROADMAP.md`:
  - 15-section MVP 2.0/2.1 roadmap focused on retention, build variety, long-term goals, and monetization readiness without backend.
  - Ranked feature matrix with complexity/risk/dependencies/backend requirements and phased recommendations (`MVP 2.0`, `2.1`, `3.0`, `Cut`).
  - Explicit 3-day / 7-day / 14-day delivery options and milestone-level acceptance + testing expectations.

### Notes
- Planning/docs-only update.
- No gameplay logic, formulas, save schema, or UI runtime behavior changed.

## 2026-05-07

### Added
- Created living project documentation in `/docs`:
  - `docs/00_README_AI.md`
  - `docs/01_GAME_DESIGN.md`
  - `docs/02_ARCHITECTURE.md`
  - `docs/03_DATABASE.md`
  - `docs/04_CONSTANTS_AND_BALANCE.md`
  - `docs/05_DECISIONS_LOG.md`
  - `docs/06_TASKS.md`
  - `docs/07_CHANGELOG.md`

### Changed
- No gameplay logic changed.

### Notes
- Documentation generated from current repository state.
- Focus was documentation-only (no refactor, no architecture changes, no balance changes).

## 2026-05-07 (Docs Audit Sync)

### Changed
- Corrected doc/code mismatch in references path:
  - `docs/01_GAME_DESIGN.md` now points to `2_0_definition.md` (root) instead of a non-existing `docs/2_0_definition.md`.
- Refined architecture wording in `docs/02_ARCHITECTURE.md`:
  - clarified single-route app and no `src/app/api/*`,
  - clarified store-to-domain flow.
- Refined persistence validation notes in `docs/03_DATABASE.md` to match `src/game/save.ts`.
- Expanded `docs/04_CONSTANTS_AND_BALANCE.md` with missing constants and real text-vs-formula building mismatches.
- Added an explicit decision entry in `docs/05_DECISIONS_LOG.md` for text-vs-formula alignment priority.
- Updated `docs/06_TASKS.md` so risks and active task reflect current real inconsistencies.

### Notes
- Documentation-only update; no gameplay logic or source code behavior was changed.

## 2026-05-08 (Building Effect Text Alignment)

### Changed
- Aligned `BUILDINGS.effectText` with existing balance formulas:
  - Forge now shows power, defense, and item stat budget.
  - Mine now shows `+8%` expedition materials per level.
  - Tavern now shows `+4%` XP per level.
  - Library now shows `+0.4%` success and `+1` luck per level.
  - Market now shows `+5%` gold and `+10%` sell value per level.
  - Shrine now uses player-facing Soul Marks/reincarnation wording.
- Updated balance/tasks/decision docs to reflect the completed Active Task.

### Added
- Added a regression test that checks building effect labels against the current balance formulas.
- Added `docs/08_VERSION_2_PROPOSAL.md` with online research summary, MVP/1.5/2.0 path, ethical monetization direction, architecture impact, and next tasks.

### Notes
- No balance formulas, timers, rewards, costs, persistence, or architecture were changed.

## 2026-05-08 (Dark Mode Theme)

### Added
- Added a global light/dark theme toggle in the app shell/start screen.
- Added `data-theme` bootstrap in `src/app/layout.tsx`:
  - uses saved `relic-forge-idle:theme` when present,
  - falls back to system preference only on first default.
- Added dark-mode color, background, border, shadow, input, hover, and disabled-state overrides in `src/app/globals.css`.

### Changed
- Documented the theme layer in architecture/persistence/decision docs.

### Notes
- Theme preference is stored outside the save envelope and does not change gameplay state.
- Layout, spacing, component structure, and game logic were intentionally left unchanged.

## 2026-05-08 (MVP 2.0 Loot Upgrade)

### Added
- Added `src/game/affixes.ts` for equipped affix utility effects and Item Power utility scoring.
- Expanded `AFFIX_POOL` to 32 affixes with stats, descriptions, naming prefixes/suffixes, and utility effects.
- Added affix effects for XP, gold, zone gold, materials, per-resource material gains, rare drop chance, loot chance, boss rewards, success chance, boss success, short-mission success, long-mission loot, crafting discount, Vigor efficiency, sell value, salvage, rune gains, duration, and failure rewards.
- Added comparison details for item score, stat deltas, and utility score deltas.
- Added tests covering affix count/categories, equipped affix effects, comparison deltas, and inventory auto-salvage.

### Changed
- Updated rarity multipliers to `common 1`, `rare 1.7`, `epic 2.55`, `legendary 4.15`.
- Updated rarity roll weights to `64/25/9.2/1.8`, boss rarity bonuses to `+7/+3/+1`, and rare-drop affix scaling.
- Legendary items now roll 5 affixes.
- Item names now combine rarity prefix, slot base name, and affix prefix/suffix.
- Loot, success, reward, duration, Vigor, crafting, sell, salvage, rune, and Item Power formulas now account for equipped affix effects.
- Forge craft base cost now uses `gold = floor(45 + lootLevel*12)` and `ore = floor(3 + lootLevel*0.7)`.
- Result and inventory UI now show clearer reward summaries, Item Power, stat deltas, sell/salvage values, full-inventory warnings, and stronger rare/epic/legendary treatment.

### Notes
- No set items, trading, or complex crafting trees were added.
- Gameplay remains client-only and text/card-based.

## 2026-05-08 (MVP 2.0 Forge Core Upgrade)

### Added
- Added Forge-gated affix reroll:
  - requires Forge level `3`,
  - rerolls exactly one selected affix,
  - replacement affix must match the item slot and not already exist on that item,
  - works on inventory and equipped items.
- Added `getAffixRerollCost` with rarity-scaled gold/material costs.
- Added Forge UI sections for affix reroll and inventory salvage with visible returns.
- Added tests for reroll gating, reroll result, and reroll cost.

### Changed
- Forge screen now shows Forge building level, current item stat budget bonus, craft cost, upgrade costs, reroll costs, salvage returns, and equipped item context.
- Craft action now disables when resources are insufficient.
- Forge decision docs now explicitly keep the system simple: no complex recipe trees, set crafting, multiplayer economy, paid crafting, or time-gated craft queues.

## 2026-05-08 (MVP 2.0 Town/Base Polish)

### Added
- Added `purpose` and `milestones` metadata to every Town building.
- Added `getMineOfflineRate(state)` so the Town UI can show Mine passive material rate.
- Added Town UI feedback for:
  - Forge crafting/upgrades/rerolls,
  - Mine offline material rate and offline cap,
  - Tavern daily readiness and next-goal rumor,
  - Market inventory pressure and sell multiplier,
  - Library next unlock hint,
  - Shrine reincarnation readiness/Soul Marks.
- Added tests covering building metadata and Mine offline rate.

### Changed
- Town screen now renders card-based/mobile-first building cards with level progress, purpose, current benefit, next level benefit, upgrade cost, milestones, and upgrade readiness.
- Docs now record the Town design policy: no decoration systems, no city placement, and no base-building visuals.

## 2026-05-08 (MVP 2.0 Reincarnation Polish)

### Added
- Added `REINCARNATION_LEVEL_REQUIREMENT = 10` as an explicit gate constant.
- Added effect text metadata for each Soul Mark upgrade so UI can show current and next upgrade effects.
- Reincarnation screen now explains:
  - requirements,
  - what resets,
  - what persists,
  - Soul Marks earned,
  - upgrade options,
  - why the next run becomes faster.
- Added tests that verify the first reincarnation route meets production/debug timing windows and earns enough XP for the configured level gate.

### Changed
- First reincarnation gate is now level `10` + `curator-of-blue-fire`, matching the 30-60 minute production target.
- Permanent upgrades were clarified/tuned:
  - Echo Tempo: `-5%` expedition duration per level, capped at `-40%` contribution,
  - Soul Prosperity: `+5%` XP/gold/material rewards per level,
  - Relic Wisdom: `+0.4%` loot chance plus rarity weighting per level,
  - Boss Attunement: `+2%` boss success chance per level.

### Notes
- No complex skill tree, second prestige layer, or awakening classes were added.
- Class awakening is documented as post-MVP.

## 2026-05-08 (MVP 2.0 Dailies and Vigor Polish)

### Added
- Added local-time daily reset behavior using `DAILY_RESET_HOUR_LOCAL = 23`.
- Dailies UI now shows local reset time, reset countdown, completed/claimed counts, progress bars, rewards, and no-streak/no-monetization policy copy.
- Expedition board now explains Vigor regeneration and only enables Vigor boost when the player has enough Vigor.
- Added tests for local reset boundaries and Vigor reward clamping.

### Changed
- Daily Vigor rewards now clamp to `state.vigor.max`.
- Docs now replace stale UTC reset references with 23:00 local device time.

### Notes
- No payments, premium currency, ads, battle pass, streak punishment, or FOMO-heavy mechanics were added.

## 2026-05-08 (MVP 2.0 UI Polish and Feedback)

### Added
- Added expedition reward reveal tiles for XP, Gold, materials, Vigor boost, level-up, achievements, unlocks, and short fantasy flavor.
- Added notice/toast-style cards for important actions including Forge work, Town upgrades, gear actions, dailies, reincarnation, and errors.
- Added inventory capacity progress, clearer near-full/full warnings, and richer empty states.
- Added reincarnation progress bars for the level gate and boss route.
- Added persistent Next Goal visibility in the header and desktop sidebar.
- Added compact horizontal mobile navigation with active state.
- Added lightweight CSS microfeedback classes for result reveal and rare+ loot hover.

### Changed
- Rare/epic/legendary item cards now get stronger presentation without changing loot logic.
- Expedition empty state and inventory empty states now use direct player-facing fantasy copy.

### Notes
- UI remains text/card-based and mobile-first.
- No sprites, canvas, game engines, complex animations, gameplay logic, balance, or persistence schema changed.

## 2026-05-08 (MVP 2.0 Balance Pass)

### Changed
- Retimed Region 1-3 dungeons so the first boss/craft lands around 15 minutes and first reincarnation lands inside the 30-60 minute target without requiring Vigor.
- Reduced early/mid power and min-level gates through `curator-of-blue-fire`.
- Lowered initial Forge building cost from `55 gold / 3 ore` to `40 gold / 3 ore`.
- Raised loot chance base from `0.42` to `0.65` and cap from `0.80` to `0.85`.
- Adjusted base rarity weights from `64/25/9.2/1.8` to `35/45/15/5`.
- Adjusted boss rarity bonuses from `+7/+3/+1` to `+8/+4/+1.5`.
- Lowered debug timer multiplier from `0.20` to `0.16`.

### Added
- Added regression coverage for MVP 2.0 pacing windows and early rare-drop pressure.

### Notes
- No new systems were added.
- Offline cap, inventory cap/near-full threshold, Vigor cap/regen/cost, craft formula, and reincarnation gate were left unchanged.

## 2026-05-08 (MVP 2.0 UI Polish Audit Pass)

### Added
- Added `UI_POLISH_AUDIT.md` with audited screens/states, issues found, fixes applied, remaining known issues, and validation notes.
- Added semantic rarity classes for controlled light/dark rarity presentation.

### Changed
- Replaced oversized header resource pills with compact resource/Vigor chips using short labels, stable max widths, and tabular numbers.
- Compacted inventory item cards with smaller padding, badge metadata, clamped item names, top-stat summaries, affix previews, stable comparison badges, and shorter action buttons.
- Updated reward item display to clamp long names and show affix previews instead of full affix lists.
- Reworked Forge upgrade, reroll, and salvage rows so long item names truncate and action buttons remain aligned.
- Reduced rare+ hover glow intensity and added dark-mode rarity overrides.
- Updated live docs for the UI polish decision, task state, architecture notes, and game design summary.

### Notes
- No gameplay logic, formulas, save schema, dependencies, sprites, canvas, or animation libraries were changed.

## 2026-05-08 (Expedition Result Claim Card Compacting)

### Changed
- Compacted the post-claim expedition result card:
  - rewards now render as one summary line again,
  - milestone moments use smaller chips,
  - loot renders as a single appraisal row instead of full stats/value/comparison details,
  - result action buttons use shorter height/padding and fewer contextual branches,
  - page-level horizontal overflow is clipped while internal resource/nav scrollers remain usable.

### Notes
- UI-only change; no reward, loot, expedition, balance, or save logic changed.

## 2026-05-08 (Dark Mode Override Repair)

### Changed
- Added missing dark-mode CSS overrides for semi-transparent blue cards, amber status surfaces, red/amber/emerald progress states, and the direct dark body background/color path.
- Re-verified the theme toggle changes `data-theme`, persists `relic-forge-idle:theme`, and updates computed colors on fresh and in-game screens.

### Notes
- UI/CSS-only change; no gameplay, save schema, balance, or store logic changed.
