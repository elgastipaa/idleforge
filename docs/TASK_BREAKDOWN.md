# Relic Forge Idle - Atomic Task Breakdown (v1.0)

## Backlog Rules

- No task exceeds half a day.
- Prefer many small tasks.
- Core game logic lives in `src/game`.
- Required game logic tasks must be testable without React.
- UI tasks consume already-working logic.
- Zustand store remains thin orchestration layer.

---

## Milestone 1 - Project setup and architecture

### Task ID: M01-T01
Title: Baseline project scripts and config audit  
Goal: Ensure scripts and config match planned workflow.  
Files likely to be created or edited: `package.json`, `tsconfig.json`, `vitest.config.ts`, `next.config.mjs`  
Exact implementation steps:
1. Confirm scripts for `dev`, `build`, `typecheck`, `test`.
2. Confirm TypeScript strict mode remains enabled.
3. Confirm vitest target includes `src/game` tests.
4. Confirm Next config avoids workspace root ambiguity.
Acceptance criteria:
- Scripts exist and run.
- No config contradicts docs architecture.
Required tests:
- `npm run typecheck`
Dependencies: none  
Complexity: XS  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M01-T02
Title: Module boundary scaffold check  
Goal: Enforce architectural separation before feature work.  
Files likely to be created or edited: `src/game/index.ts`, `src/store/useGameStore.ts`, `docs/TECHNICAL_ARCHITECTURE.md`  
Exact implementation steps:
1. Verify `src/game` exports are pure-logic only.
2. Verify store imports game functions and does not duplicate formulas.
3. Document any boundary gap as TODO task entries (not code stubs).
Acceptance criteria:
- Core boundaries are explicit and respected.
Required tests:
- Static inspection plus `npm run typecheck`.
Dependencies: M01-T01  
Complexity: XS  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 2 - Core game state

### Task ID: M02-T01
Title: Finalize canonical GameState schema  
Goal: Lock all state fields for hero-first v1.0 systems.  
Files likely to be created or edited: `src/game/types.ts`, `src/game/state.ts`  
Exact implementation steps:
1. Ensure state includes hero, resources, vigor, inventory, equipment, expedition, town, dailies, reincarnation, settings.
2. Ensure inventory cap constant is 30.
3. Ensure state timestamps support deterministic offline processing.
Acceptance criteria:
- Schema maps to docs without missing required systems.
Required tests:
- State initialization test.
Dependencies: M01-T02  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M02-T02
Title: Content registry consistency lock  
Goal: Lock content tables for classes, regions, dungeons, buildings.  
Files likely to be created or edited: `src/game/content.ts`, `src/game/constants.ts`  
Exact implementation steps:
1. Verify 3 classes.
2. Verify 5 regions and 20 dungeons.
3. Verify dungeon 4 per region is boss.
4. Verify 6 town buildings.
Acceptance criteria:
- Counts and IDs match docs exactly.
Required tests:
- Content count assertions.
Dependencies: M02-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M02-T03
Title: Deterministic RNG seed contract lock  
Goal: Guarantee reproducible outcome generation.  
Files likely to be created or edited: `src/game/rng.ts`, `src/game/engine.ts`, `src/game/loot.ts`  
Exact implementation steps:
1. Ensure seed derivation includes save seed + expedition id + run id.
2. Remove any non-deterministic randomness from simulation.
3. Document deterministic seed contract in code comments.
Acceptance criteria:
- Same input state produces same outputs.
Required tests:
- RNG determinism tests.
Dependencies: M02-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 3 - Save/load/export/import

### Task ID: M03-T01
Title: Save envelope and local persistence hardening  
Goal: Stabilize local save schema and serialization flow.  
Files likely to be created or edited: `src/game/save.ts`, `src/store/useGameStore.ts`  
Exact implementation steps:
1. Confirm versioned envelope fields are complete.
2. Confirm autosave writes after successful transitions only.
3. Confirm load path preserves timestamps for offline simulation.
Acceptance criteria:
- Save/load works across refresh with active progression state.
Required tests:
- Save round-trip tests.
Dependencies: M02-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M03-T02
Title: Import validation and failure safety  
Goal: Prevent corrupted imports from mutating current state.  
Files likely to be created or edited: `src/game/save.ts`, `src/game/__tests__/core.test.ts`  
Exact implementation steps:
1. Validate game id, version, required keys, numeric bounds.
2. Reject malformed payloads with stable errors.
3. Keep current state unchanged on failure.
Acceptance criteria:
- Invalid import never replaces live state.
Required tests:
- Invalid JSON and invalid schema import tests.
Dependencies: M03-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 4 - Hero creation and progression

### Task ID: M04-T01
Title: Character creation state flow  
Goal: Support name and class setup for single hero.  
Files likely to be created or edited: `src/game/state.ts`, `src/store/useGameStore.ts`, `src/app/page.tsx`  
Exact implementation steps:
1. Ensure class selection modifies initial stats only before progression lock.
2. Ensure name input persists in save.
3. Ensure no race gameplay logic is introduced.
Acceptance criteria:
- New player can set name and class and start.
Required tests:
- Class selection initialization test.
Dependencies: M02-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M04-T02
Title: XP and level progression tuning pass  
Goal: Ensure level curve supports first-session pacing.  
Files likely to be created or edited: `src/game/heroes.ts`, `src/game/balance.ts`, `src/game/__tests__/core.test.ts`  
Exact implementation steps:
1. Verify XP formula implementation.
2. Verify level-up stat increments by class.
3. Verify early progression matches 5-15 minute targets.
Acceptance criteria:
- Leveling progression feels visible in first session.
Required tests:
- XP threshold and multi-level gain tests.
Dependencies: M02-T02  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M04-T03
Title: Class passive unlock implementation check  
Goal: Ensure level 5/10/15 passives apply correctly.  
Files likely to be created or edited: `src/game/heroes.ts`, `src/game/balance.ts`, `src/game/types.ts`  
Exact implementation steps:
1. Encode passive unlock levels per class.
2. Apply passive effects in success/loot/reward formulas.
3. Ensure passives do not exceed documented caps.
Acceptance criteria:
- Passive bonuses activate only at intended levels.
Required tests:
- Passive unlock/effect tests.
Dependencies: M04-T02  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 5 - Expedition system

### Task ID: M05-T01
Title: Expedition unlock and gating flow  
Goal: Ensure region and dungeon progression is deterministic.  
Files likely to be created or edited: `src/game/expeditions.ts`, `src/game/content.ts`  
Exact implementation steps:
1. Enforce region-order unlocks.
2. Enforce boss clear requirements for next region.
3. Surface unlock reason text from logic layer.
Acceptance criteria:
- Locked content cannot be started.
Required tests:
- Unlock condition tests by region.
Dependencies: M02-T02  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M05-T02
Title: Expedition start lifecycle hardening  
Goal: Guarantee one active expedition with robust timing state.  
Files likely to be created or edited: `src/game/engine.ts`, `src/game/types.ts`  
Exact implementation steps:
1. Block start when another expedition is active.
2. Store `startedAt`, `endsAt`, and run id.
3. Ensure timer respects debug mode multipliers.
Acceptance criteria:
- Active expedition state is always valid.
Required tests:
- Start-blocking and timing tests.
Dependencies: M05-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M05-T03
Title: Expedition resolve outcome completeness  
Goal: Resolve success/failure, rewards, and summary in one deterministic transition.  
Files likely to be created or edited: `src/game/engine.ts`, `src/game/balance.ts`  
Exact implementation steps:
1. Apply success chance formula with clamps.
2. Apply success/failure reward scaling.
3. Produce summary payload used by UI.
Acceptance criteria:
- Resolve result includes everything needed for reward modal.
Required tests:
- Success/failure reward tests and bounds tests.
Dependencies: M05-T02, M02-T03  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 6 - Loot and inventory

### Task ID: M06-T01
Title: Loot rarity and affix generation lock  
Goal: Ensure deterministic loot excitement with bounded complexity.  
Files likely to be created or edited: `src/game/loot.ts`, `src/game/content.ts`  
Exact implementation steps:
1. Confirm rarity weights and boss bonuses.
2. Confirm affix count by rarity.
3. Ensure deterministic naming and value generation.
Acceptance criteria:
- Loot outputs are deterministic and rarity-valid.
Required tests:
- Rarity/affix deterministic tests.
Dependencies: M05-T03  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M06-T02
Title: Inventory cap and overflow policy  
Goal: Enforce cap 30 without blocking expedition resolution.  
Files likely to be created or edited: `src/game/inventory.ts`, `src/game/engine.ts`, `src/game/constants.ts`  
Exact implementation steps:
1. Enforce hard cap at 30.
2. Trigger warning threshold behavior (24+) for UI selectors.
3. Auto-salvage over-cap drops on resolution.
Acceptance criteria:
- No state can exceed inventory cap after transitions.
Required tests:
- Cap and overflow tests.
Dependencies: M06-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M06-T03
Title: Sell and salvage economy validation  
Goal: Ensure item disposal feeds economy predictably.  
Files likely to be created or edited: `src/game/inventory.ts`, `src/game/balance.ts`  
Exact implementation steps:
1. Verify sell payouts use current multipliers.
2. Verify salvage yields by rarity/item level.
3. Verify lifetime counters update.
Acceptance criteria:
- Sell/salvage transitions are consistent and side-effect complete.
Required tests:
- Sell/salvage value tests.
Dependencies: M06-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 7 - Equipment and stat comparison

### Task ID: M07-T01
Title: Equip swap and slot integrity  
Goal: Guarantee valid slot assignment and safe swap behavior.  
Files likely to be created or edited: `src/game/inventory.ts`, `src/game/types.ts`  
Exact implementation steps:
1. Enforce slot-matching equip.
2. Return old item to inventory when swapping.
3. Respect inventory-cap constraints on swap.
Acceptance criteria:
- Equip transitions preserve inventory/equipment integrity.
Required tests:
- Equip and swap tests.
Dependencies: M06-T02  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M07-T02
Title: Stat derivation and compare selector  
Goal: Provide deterministic power delta for item comparison UI.  
Files likely to be created or edited: `src/game/balance.ts`, `src/game/selectors.ts` (create if missing)  
Exact implementation steps:
1. Finalize derived stat aggregation.
2. Add compare helper returning delta vs equipped slot.
3. Keep all logic inside `src/game`.
Acceptance criteria:
- Item compare data can be consumed directly by UI.
Required tests:
- Derived stat and delta tests.
Dependencies: M07-T01, M04-T03  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 8 - Forge/crafting

### Task ID: M08-T01
Title: Forge craft random item action  
Goal: Implement craft-by-slot/class bias with deterministic economy checks.  
Files likely to be created or edited: `src/game/loot.ts`, `src/game/engine.ts`, `src/game/constants.ts`  
Exact implementation steps:
1. Define craft cost table.
2. Implement craft action with slot/class options.
3. Deduct materials and insert crafted item with cap handling.
Acceptance criteria:
- Craft action always returns valid item or explicit error.
Required tests:
- Craft success/failure tests.
Dependencies: M06-T01, M06-T02  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M08-T02
Title: Forge item upgrade action  
Goal: Upgrade existing item level with deterministic scaling.  
Files likely to be created or edited: `src/game/engine.ts`, `src/game/loot.ts`, `src/game/balance.ts`  
Exact implementation steps:
1. Define upgrade cost and max upgrade rules.
2. Apply stat/value scaling by level.
3. Persist upgrade in inventory/equipment references.
Acceptance criteria:
- Upgrade modifies intended item and deducts correct resources.
Required tests:
- Upgrade cost/stat increment tests.
Dependencies: M08-T01, M07-T02  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 9 - Town buildings

### Task ID: M09-T01
Title: Town upgrade transaction correctness  
Goal: Ensure building purchases are affordable, bounded, and deterministic.  
Files likely to be created or edited: `src/game/town.ts`, `src/game/content.ts`, `src/game/balance.ts`  
Exact implementation steps:
1. Implement scaling cost formula by building level.
2. Enforce max levels.
3. Deduct resources atomically.
Acceptance criteria:
- No building upgrade can partially apply.
Required tests:
- Cost/affordability/max-level tests.
Dependencies: M02-T02  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M09-T02
Title: Town effect propagation  
Goal: Make building effects influence all dependent systems.  
Files likely to be created or edited: `src/game/balance.ts`, `src/game/engine.ts`, `src/game/loot.ts`  
Exact implementation steps:
1. Apply Forge effects to loot/craft quality.
2. Apply Mine effects to material gains.
3. Apply Tavern/Library/Market/Shrine effects to relevant formulas.
Acceptance criteria:
- Building levels visibly change outcomes.
Required tests:
- Per-building effect regression tests.
Dependencies: M09-T01, M05-T03, M06-T01, M08-T01  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 10 - Region map and bosses

### Task ID: M10-T01
Title: Region progression selectors  
Goal: Expose clean progression map data for UI cards.  
Files likely to be created or edited: `src/game/expeditions.ts`, `src/game/selectors.ts`  
Exact implementation steps:
1. Provide grouped region->dungeon selector.
2. Include locked reason and progress markers.
3. Include boss state and next-goal hint data.
Acceptance criteria:
- UI can render progression map without additional logic.
Required tests:
- Region selector output tests.
Dependencies: M05-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M10-T02
Title: Boss reward table behavior  
Goal: Ensure bosses feel higher-stakes and rewarding.  
Files likely to be created or edited: `src/game/engine.ts`, `src/game/balance.ts`, `src/game/content.ts`  
Exact implementation steps:
1. Implement boss chest reward bonuses.
2. Apply boss-clear progression effects.
3. Ensure no boss-only edge case breaks normal loop.
Acceptance criteria:
- Boss clears produce elevated reward feel and region unlock impact.
Required tests:
- Boss reward differential tests.
Dependencies: M05-T03, M10-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 11 - Dailies and Vigor

### Task ID: M11-T01
Title: Daily task generation engine  
Goal: Generate exactly 3 unique tasks per daily cycle.  
Files likely to be created or edited: `src/game/dailies.ts` (create), `src/game/types.ts`, `src/game/content.ts`  
Exact implementation steps:
1. Implement task pool and eligibility filters.
2. Select 3 unique tasks deterministically.
3. Store generated set with reset timestamp.
Acceptance criteria:
- Daily set always has exactly 3 valid tasks.
Required tests:
- Uniqueness/count tests.
Dependencies: M02-T01, M02-T02
Complexity: M
Required for v1.0: yes
Can be cut if needed: no

### Task ID: M11-T02
Title: Daily reset scheduler (23:00 UTC)
Goal: Reset dailies on fixed schedule with clock-safe logic.
Files likely to be created or edited: `src/game/dailies.ts`, `src/game/offline.ts`
Exact implementation steps:
1. Implement deterministic reset boundary at 23:00 UTC.
2. Regenerate tasks on boundary crossing.
3. Ensure no streak logic exists.
Acceptance criteria:
- Reset behavior is stable with UTC-based boundary checks.
Required tests:
- Boundary-crossing reset tests.
Dependencies: M11-T01  
Complexity: S  
Required for v1.0: yes
Can be cut if needed: no

### Task ID: M11-T03
Title: Daily progress and claim flow  
Goal: Track progress updates and claim rewards exactly once.  
Files likely to be created or edited: `src/game/dailies.ts`, `src/game/engine.ts`  
Exact implementation steps:
1. Update task progress from expedition/loot/town actions.
2. Gate claim to completed-unclaimed tasks.
3. Apply reward payload (gold/materials/vigor) once.
Acceptance criteria:
- No duplicate claims or phantom progress.
Required tests:
- Progress and claim idempotency tests.
Dependencies: M11-T02, M05-T03, M06-T03, M09-T01  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M11-T04
Title: Vigor resource engine  
Goal: Enforce vigor cap, regen, and spend mechanics.  
Files likely to be created or edited: `src/game/vigor.ts` (create), `src/game/engine.ts`, `src/game/types.ts`  
Exact implementation steps:
1. Implement `+1/5m` regeneration with cap 100.
2. Implement spend-20 gate for expedition boost.
3. Ensure vigor updates consistently in active and offline flows.
Acceptance criteria:
- Vigor cannot exceed cap or drop below zero.
Required tests:
- Regen/spend/cap tests.
Dependencies: M02-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 12 - Offline progress

### Task ID: M12-T01
Title: Offline cap window engine  
Goal: Apply one 8h capped elapsed-time window to all offline systems.  
Files likely to be created or edited: `src/game/offline.ts`, `src/game/constants.ts`  
Exact implementation steps:
1. Compute capped elapsed delta.
2. Use same capped delta for expedition, mine, vigor, and dailies reset checks.
3. Return summary payload for UI.
Acceptance criteria:
- Offline gains never exceed 8h cap.
Required tests:
- Capped delta tests and multi-system cap tests.
Dependencies: M11-T04, M11-T02, M05-T03, M09-T02  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M12-T02
Title: Offline summary message model  
Goal: Provide deterministic player-facing summary data.  
Files likely to be created or edited: `src/game/offline.ts`, `src/game/types.ts`  
Exact implementation steps:
1. Define summary fields for completed expedition, mine gains, vigor gained, daily reset.
2. Ensure summary is non-null only when changes occurred.
3. Ensure summary does not mutate state.
Acceptance criteria:
- UI can render while-away summary with no extra calculations.
Required tests:
- Summary presence/absence tests.
Dependencies: M12-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 13 - Reincarnation/prestige

### Task ID: M13-T01
Title: Reincarnation gate enforcement
Goal: Lock fixed MVP gate (level 10 + region 3 boss clear).
Files likely to be created or edited: `src/game/prestige.ts`, `src/game/expeditions.ts`
Exact implementation steps:
1. Implement `canReincarnate` gate check with exact requirements.
2. Expose gate progress details for UI.
3. Reject reincarnation if any requirement fails.
Acceptance criteria:
- Gate is deterministic and consistent with docs.
Required tests:
- Gate pass/fail tests.
Dependencies: M10-T02, M04-T02  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M13-T02
Title: Reincarnation reset/persist transaction  
Goal: Apply atomic reset and persistence lists exactly.  
Files likely to be created or edited: `src/game/prestige.ts`, `src/game/state.ts`  
Exact implementation steps:
1. Reset temporary progression systems.
2. Persist permanent systems (Soul Marks, upgrades, stats, settings).
3. Return explicit transaction summary.
Acceptance criteria:
- No unintended field is reset or persisted.
Required tests:
- Reset/persist invariant tests.
Dependencies: M13-T01  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M13-T03
Title: Reincarnation currency and upgrades  
Goal: Implement Soul Mark gains and permanent upgrade spending.  
Files likely to be created or edited: `src/game/prestige.ts`, `src/game/balance.ts`  
Exact implementation steps:
1. Implement Soul Mark gain formula.
2. Implement upgrade purchase and caps.
3. Apply upgrade effects to progression formulas.
Acceptance criteria:
- Reincarnation provides measurable next-run acceleration.
Required tests:
- Currency gain and upgrade effect tests.
Dependencies: M13-T02, M09-T02, M11-T04  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 14 - Awards

### Task ID: M14-T01
Title: Awards event model  
Goal: Implement deterministic Awards unlock tracking.  
Files likely to be created or edited: `src/game/achievements.ts`, `src/game/types.ts`, `src/game/content.ts`  
Exact implementation steps:
1. Define compact achievement list (12-20).
2. Add unlock checks for key events.
3. Record unlock timestamps.
Acceptance criteria:
- Achievement unlocks are deterministic and non-blocking.
Required tests:
- Basic unlock tests.
Dependencies: M05-T03, M09-T01, M13-T02  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M14-T02
Title: Awards UI data adapter  
Goal: Provide simple claim-free display list for UI.  
Files likely to be created or edited: `src/game/selectors.ts`, `src/store/useGameStore.ts`, `src/app/page.tsx`  
Exact implementation steps:
1. Add selector for unlocked/locked achievement rows.
2. Add display-only panel/tab integration.
3. Ensure no gameplay dependency on achievements.
Acceptance criteria:
- UI shows achievement status without affecting core loop.
Required tests:
- Selector shape tests.
Dependencies: M14-T01  
Complexity: XS  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 15 - Mobile-first UI integration

### Task ID: M15-T01
Title: Character start UI integration  
Goal: Wire name/class creation to store actions.  
Files likely to be created or edited: `src/app/page.tsx`, `src/store/useGameStore.ts`  
Exact implementation steps:
1. Render name input and class cards.
2. Persist selection into state.
3. Transition into expedition screen.
Acceptance criteria:
- First usable screen supports hero creation quickly on mobile.
Required tests:
- Manual integration smoke (documented checklist).
Dependencies: M04-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M15-T02
Title: Expedition UI consumes engine outputs  
Goal: Use existing selectors/actions for start/claim flow.  
Files likely to be created or edited: `src/app/page.tsx`, `src/store/useGameStore.ts`  
Exact implementation steps:
1. Render dungeon cards with success chance/rewards.
2. Render active timer/progress and claim state.
3. Render result summary modal/card from resolve payload.
Acceptance criteria:
- No formula logic implemented in React layer.
Required tests:
- Manual expedition UI smoke.
Dependencies: M05-T03, M12-T02  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M15-T03
Title: Inventory and compare UI integration  
Goal: Surface cap warnings, deltas, and item actions cleanly.  
Files likely to be created or edited: `src/app/page.tsx`, `src/game/selectors.ts`  
Exact implementation steps:
1. Render inventory count and near-full state.
2. Render delta comparisons from selectors.
3. Wire equip/sell/salvage actions.
Acceptance criteria:
- Inventory decisions are clear and performant on mobile.
Required tests:
- Manual inventory UI smoke.
Dependencies: M06-T02, M07-T02  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M15-T04
Title: Forge and Town UI integration  
Goal: Integrate crafting/upgrades and building upgrades with existing actions.  
Files likely to be created or edited: `src/app/page.tsx`, `src/store/useGameStore.ts`  
Exact implementation steps:
1. Render Forge craft/upgrade actions.
2. Render Town building cards with next-effect and costs.
3. Surface affordability and error states.
Acceptance criteria:
- Forge and Town loops are fully playable in UI.
Required tests:
- Manual forge/town smoke.
Dependencies: M08-T02, M09-T02  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M15-T05
Title: Dailies, Vigor, and Reincarnation UI integration  
Goal: Integrate retention and long-loop systems into mobile flow.  
Files likely to be created or edited: `src/app/page.tsx`, `src/store/useGameStore.ts`  
Exact implementation steps:
1. Render 3 daily tasks and reset timer.
2. Render vigor current/cap and boost toggle.
3. Render reincarnation gate, gain preview, and confirm action.
Acceptance criteria:
- Player can complete full retention and reincarnation loop from UI.
Required tests:
- Manual dailies/vigor/reincarnation smoke.
Dependencies: M11-T04, M13-T03  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M15-T06
Title: Save/settings UI integration  
Goal: Ensure player can export/import/reset safely.  
Files likely to be created or edited: `src/app/page.tsx`, `src/store/useGameStore.ts`  
Exact implementation steps:
1. Add export JSON action and display.
2. Add import input and safe error handling.
3. Add reset confirmation flow.
Acceptance criteria:
- Save operations are accessible and reliable in UI.
Required tests:
- Manual save/settings smoke.
Dependencies: M03-T02  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 16 - Balancing

### Task ID: M16-T01
Title: First-session pacing tuning pass  
Goal: Hit first 5-minute and first 15-minute targets.  
Files likely to be created or edited: `src/game/balance.ts`, `src/game/content.ts`, `docs/BALANCE_PLAN.md`  
Exact implementation steps:
1. Run deterministic progression simulations.
2. Tune early rewards/timers and first boss access.
3. Update docs if constants change.
Acceptance criteria:
- First major unlock is reachable in 5-10 minutes.
Required tests:
- Balance regression tests.
Dependencies: M15-T02, M15-T04  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M16-T02
Title: Reincarnation pacing tuning pass  
Goal: Hit production and debug reincarnation targets.  
Files likely to be created or edited: `src/game/balance.ts`, `src/game/prestige.ts`, `docs/BALANCE_PLAN.md`  
Exact implementation steps:
1. Tune gate-adjacent power and reward pacing.
2. Tune debug multipliers for 5-10 minute reincarnation path.
3. Re-verify gate does not drift from docs.
Acceptance criteria:
- Production reincarnation 30-60 minutes, debug 5-10 minutes.
Required tests:
- Reincarnation pacing regression tests.
Dependencies: M13-T03, M16-T01  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 17 - Testing

### Task ID: M17-T01
Title: Expand `src/game` unit coverage to final matrix  
Goal: Implement all required deterministic tests from plan docs.  
Files likely to be created or edited: `src/game/__tests__/core.test.ts`, additional `src/game/__tests__/*.test.ts`  
Exact implementation steps:
1. Split broad tests into focused suites.
2. Add missing edge cases (daily reset boundary, offline multi-cap, reincarnation invariants).
3. Ensure no React dependency in core tests.
Acceptance criteria:
- Core logic coverage includes all mandatory systems.
Required tests:
- `npm run test`
Dependencies: M16-T02  
Complexity: M  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M17-T02
Title: Build-gate automation verification  
Goal: Confirm release gates consistently pass.  
Files likely to be created or edited: `package.json`, optional CI config files if present  
Exact implementation steps:
1. Verify `test`, `typecheck`, `build` all pass in clean state.
2. Document command order and expected output in release docs.
3. Ensure failures block release.
Acceptance criteria:
- Build gate sequence is repeatable.
Required tests:
- `npm run test`, `npm run typecheck`, `npm run build`
Dependencies: M17-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

---

## Milestone 18 - Release polish

### Task ID: M18-T01
Title: First-session UX polish and clarity pass  
Goal: Improve readability and decision clarity without new systems.  
Files likely to be created or edited: `src/app/page.tsx`, `docs/FIRST_SESSION.md`  
Exact implementation steps:
1. Ensure next-goal copy appears consistently.
2. Ensure reward summary clearly states changes.
3. Reduce friction in first expedition to first upgrade path.
Acceptance criteria:
- First-session acceptance criteria in docs are met.
Required tests:
- Manual first-session walkthrough.
Dependencies: M15-T05, M16-T01  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M18-T02
Title: Mobile responsiveness and accessibility hardening  
Goal: Verify stable layout and controls on small screens.  
Files likely to be created or edited: `src/app/page.tsx`, `src/app/globals.css`, `docs/UI_UX_PLAN.md`  
Exact implementation steps:
1. Validate no horizontal overflow in key screens.
2. Validate touch target sizing and labels.
3. Validate status text is not color-only.
Acceptance criteria:
- Core flow is comfortably usable on mobile viewport.
Required tests:
- Manual mobile viewport smoke checks.
Dependencies: M15-T06  
Complexity: S  
Required for v1.0: yes  
Can be cut if needed: no

### Task ID: M18-T03
Title: Release checklist closeout  
Goal: Execute and record v1 release gate completion.  
Files likely to be created or edited: `docs/VERSION_1_0_DEFINITION.md`, `docs/FINAL_IMPLEMENTATION_PLAN.md`  
Exact implementation steps:
1. Run release checklist line-by-line.
2. Record any unresolved issues.
3. Apply cut ladder if schedule risk remains.
Acceptance criteria:
- All release blocks are cleared or explicitly tracked as blockers.
Required tests:
- Full build gate sequence and final manual regression pass.
Dependencies: M17-T02, M18-T01, M18-T02  
Complexity: XS  
Required for v1.0: yes  
Can be cut if needed: no

---

## RC Hardening Follow-Ups (2026-05-09)

These are post-hardening items identified during release-candidate validation. They are intentionally scoped as safe follow-ups, not broad rewrites.

1. Typecheck pipeline robustness:
   `npm run typecheck` currently depends on `.next/types` being present; in clean/stale states it can fail before `build`.
2. Startup mode consistency:
   local `next start` warns about standalone mode; document/standardize production-like startup command path for CI and local release checks.
3. Deterministic daily-claim smoke case:
   add a dedicated seeded scenario where at least one daily is guaranteed claimable for automated smoke reporting.
4. Optional performance follow-up:
   evaluate reducing top-level re-render churn from the global 1-second `useNow()` tick if playtest feedback reports UI jank on low-end devices.

---

## Done When

- All milestones 1-18 have atomic tasks with complete metadata.
- Required tasks are testable and implementable without hidden dependencies.
- Optional tasks are clearly marked cuttable and non-blocking.
