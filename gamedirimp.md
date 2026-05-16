Create a technical implementation plan from GAME_DIRECTION_2.md and GAME_DIRECTION_IMPLEMENTATION_SPEC.md.

  Objective:
  Generate a new file `GAME_DIRECTION_TECHNICAL_PLAN.md` that translates the product/spec direction into concrete engineering work packages, file-level changes, data structures,
  component boundaries, domain helpers, risks, and validation steps.

  Context required:
  - Read `docs/00_README_AI.md` first and follow its architecture guardrails.
  - Read `GAME_DIRECTION_2.md`.
  - Read `GAME_DIRECTION_IMPLEMENTATION_SPEC.md`.
  - Read canonical docs:
    - `docs/01_GAME_DESIGN.md`
    - `docs/02_ARCHITECTURE.md`
    - `docs/03_DATABASE.md`
    - `docs/06_TASKS.md`
  - Inspect current implementation before writing the plan:
    - `src/game/types.ts`
    - `src/game/state.ts`
    - `src/game/content.ts`
    - `src/game/town.ts`
    - `src/game/dailies.ts`
    - `src/game/caravan.ts`
    - `src/game/events.ts`
    - `src/game/outposts.ts`
    - `src/game/progression.ts`
    - `src/game/regions.ts`
    - `src/game/offline.ts`
    - `src/game/expeditions.ts`
    - `src/game/bosses.ts`
    - `src/game/save.ts`
    - `src/game/index.ts`
    - `src/store/useGameStore.ts`
    - `src/app/game-view.tsx`
    - `src/app/globals.css`
    - `src/game/__tests__/core.test.ts`

  Restrictions:
  - Do not implement code yet.
  - Do not change balance yet.
  - Do not modify existing files except creating `GAME_DIRECTION_TECHNICAL_PLAN.md`.
  - Do not invent systems that contradict current engine state.
  - Do not propose backend, PvP, chat, gacha, monetization, cloud-only progression, freeform city grid, drag/drop, roads, or repeated functional buildings.
  - Keep architecture intact:
    - deterministic gameplay logic in `src/game`
    - orchestration/persistence in `src/store/useGameStore.ts`
    - presentation in `src/app`
  - Separate UI-only work from domain/save/test work.
  - If a feature needs save migration or new persisted fields, say so explicitly.
  - If a feature can be derived from current state without schema changes, say so explicitly.
  - Prefer small, shippable slices.

  Create:
  `GAME_DIRECTION_TECHNICAL_PLAN.md`

  Required structure:

  # GAME_DIRECTION_TECHNICAL_PLAN.md

  ## 1. Engineering Objective
  Summarize the target: implement the `Frontier Guild` launch candidate direction using current systems, starting with UI/copy/data-derived layers and only then small engine fixes.

  ## 2. Current Architecture Constraints
  List architecture facts that affect implementation:
  - monolithic `src/app/game-view.tsx`
  - localStorage save
  - existing `GameState`
  - existing building ids
  - existing construction system
  - existing caravan blocking expeditions
  - existing dailies/weekly/event gaps
  - existing offline limitations

  ## 3. Proposed Implementation Slices
  Break work into shippable slices.

  Include table:
  Slice | Goal | Type (`UI-only`, `domain helper`, `engine fix`, `refactor`) | User impact | Risk | Dependencies | Validation

  Must include at least:
  - Slice 1: Command Center v0
  - Slice 2: Guildhall Slot Grid v0
  - Slice 3: Frontier Map v0
  - Slice 4: Orders Board v0
  - Slice 5: War Room v0
  - Slice 6: Guild Report polish
  - Slice 7: Launch event integration
  - Slice 8: Small engine fixes (`complete_caravan`, legacy weekly decision, Mine offline/copy)

  ## 4. Component Plan
  Propose component extraction boundaries from `src/app/game-view.tsx`.

  Include table:
  Component | Responsibility | Props | Reads state directly? | Calls store actions? | Can be UI-only? | Suggested file

  Must include:
  - `CommandCenter`
  - `GuildhallSlotGrid`
  - `GuildhallSlotCard`
  - `FrontierMap`
  - `RegionFrontCard`
  - `OrdersBoard`
  - `OrderToken`
  - `WarRoomPanel`
  - `GuildReportPanel`

  Be explicit whether to keep them inside `game-view.tsx` first or extract to `src/app/components`.

  ## 5. Domain Helper Plan
  Define any new pure helpers that should live in `src/game` if we want to avoid UI duplication.

  Include table:
  Helper | File | Inputs | Output shape | Reason | Requires save change? | Tests?

  Consider:
  - `getCommandCenterSummary`
  - `getGuildhallSlotSummaries`
  - `getRegionFrontSummaries`
  - `getOrdersBoardSummary`
  - `getWarRoomSummary`
  - `getReturnReportSummary`

  If a helper should not be built yet, mark it as optional.

  ## 6. Data Model / Save Impact
  Describe current state reuse vs new state.

  Include:
  - Which slices require no save changes.
  - Which future features would require new persisted fields.
  - Why `Guildhall`, `Caravan Yard`, and `War Room` should remain UI-only for launch.
  - What would be required if they became real buildings.

  Include table:
  Feature | Uses existing state? | New persisted field? | Save migration needed? | Notes

  ## 7. UI-Only Implementation Details
  For each UI-only slice, provide concrete implementation notes:
  - Existing helpers/imports to use.
  - State conditions.
  - CTA behavior.
  - Empty/locked states.
  - Mobile behavior.
  - Copy notes.

  Include subsections:
  ### Command Center
  ### Guildhall Slot Grid
  ### Frontier Map
  ### Orders Board
  ### War Room
  ### Guild Report

  ## 8. Engine Fix Details
  For small engine fixes, provide exact technical approach.

  Include:
  ### `complete_caravan` daily objective
  - Current problem.
  - Recommended unlock rule.
  - Files to change.
  - Tests to add.

  ### Legacy `weekly.progress`
  - Current problem.
  - Recommended decision.
  - Files to change or UI hiding strategy.
  - Tests to add if wired.

  ### Mine offline promise
  - Current problem.
  - Option A: copy-only fix.
  - Option B: engine implementation.
  - Recommended option for launch.
  - Files/tests.

  ## 9. File-Level Change Plan
  List expected files and intended changes.

  Include table:
  File | Planned changes | Slice(s) | Risk | Test coverage

  Must include:
  - `src/app/game-view.tsx`
  - `src/app/globals.css`
  - optional component files under `src/app/components`
  - `src/game/dailies.ts`
  - `src/game/offline.ts`
  - `src/game/town.ts`
  - `src/game/regions.ts`
  - `src/game/index.ts`
  - `src/store/useGameStore.ts`
  - `src/game/save.ts`
  - `src/game/__tests__/core.test.ts`

  If a file is only optional, mark optional.

  ## 10. Test Plan
  Define validation by slice.

  Include:
  - Typecheck.
  - Unit tests for domain helpers.
  - Unit tests for engine fixes.
  - Manual QA.
  - Mobile viewport checks.
  - Save/import regression checks if save changes.

  Include table:
  Slice | Automated tests | Manual tests | Regression risks

  ## 11. Sequencing Recommendation
  Give implementation order.

  Must separate:
  - Phase 1: UI-only no engine
  - Phase 2: low-risk domain helpers
  - Phase 3: engine fixes with tests
  - Phase 4: polish/QA

  For each phase:
  - Goal
  - Files
  - Exit criteria

  ## 12. Risks & Cut Lines
  List risks and what to cut if time runs out.

  Include:
  - `game-view.tsx` size/refactor risk.
  - UI/domain drift risk.
  - save migration risk.
  - mobile complexity.
  - overbuilding Guildhall.
  - accidentally introducing broken promises.

  ## 13. Final Engineering Checklist
  Checklist before implementation starts:
  - product decisions confirmed
  - UI-only scope accepted
  - open questions closed
  - test plan accepted
  - files to touch confirmed
  - no backend/PvP/city-grid creep

  Output requirements:
  - Create `GAME_DIRECTION_TECHNICAL_PLAN.md`.
  - Do not edit other files.
  - After creating it, audit that every required section and required slice exists.
  - Final answer should briefly say what file was created and summarize the main technical recommendation.