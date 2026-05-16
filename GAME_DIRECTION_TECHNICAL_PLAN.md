# GAME_DIRECTION_TECHNICAL_PLAN.md

This document translates `GAME_DIRECTION_2.md` and `GAME_DIRECTION_IMPLEMENTATION_SPEC.md` into a technical implementation plan for the current codebase. It is intentionally implementation-oriented, but it does not change code, balance, save data, or tests by itself.

Primary source files reviewed:

- `docs/00_README_AI.md`
- `docs/01_GAME_DESIGN.md`
- `docs/02_ARCHITECTURE.md`
- `docs/03_DATABASE.md`
- `docs/06_TASKS.md`
- `GAME_DIRECTION_2.md`
- `GAME_DIRECTION_IMPLEMENTATION_SPEC.md`
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

## 1. Engineering Objective

Implement the new game direction as a staged, low-risk UI and product-layer migration that makes the current game feel like a strategic guild command game without prematurely replacing the engine.

The core engineering goal is to reframe existing systems into clearer, higher-retention surfaces:

- Command Center: one screen that tells the player what matters now.
- Guildhall Slot Grid: a city/base fantasy using existing town buildings first.
- Frontier Map: a strategic region map using existing zones, dungeons, bosses, outposts, collections, and regional materials.
- Orders Board: daily, weekly, event, mastery, boss, and caravan objectives presented as actionable work.
- War Room: boss and threat preparation surfaced as a strategic planning layer.
- Guild Report: offline and expedition result summaries that tell the player what changed and what to do next.

The plan should avoid risky engine expansion in the first pass. The current game already has enough mechanics to support the new direction if the UI, copy, and summary layers expose them coherently.

Non-goals for the first implementation pass:

- No backend.
- No authentication.
- No multiplayer.
- No PvP.
- No real-time shared map.
- No full city-grid simulation.
- No new persisted building IDs for Guildhall, Caravan Yard, or War Room unless explicitly promoted to real systems in a later phase.
- No balance rewrites.

### Phase 1 Decisions Locked Before Implementation

These decisions are fixed for the first implementation pass:

| Decision | Locked choice | Rationale | Implementation consequence |
| --- | --- | --- | --- |
| Command Center placement | Keep `CommandCenter` as a compact, contextual panel inside Expeditions after onboarding, not as a persistent global card. | The first global implementation crowded every tab and became unavoidable. The dashboard is useful, but it must not consume the top of every screen or block level-0 flow. | Render it only in the Expeditions route content when `!onboardingFocused`. Use compact chips and navigation CTAs; never mount it above every tab. |
| Town naming | Rename Town visually to `Guildhall`. | It changes the fantasy from "upgrade list" to "guild base" without touching the data model. | Keep code/data names as `town`, `BuildingId`, and existing building IDs. Change user-facing nav/title/copy to `Guildhall`, `Guild Projects`, `Build`, and `Upgrade`. |
| Missions naming | Rename Missions visually to `Orders`, with screen title `Orders Board`. | `Missions` is generic; `Orders Board` fits the guild command direction and makes daily/weekly/event tasks feel diegetic. | Keep existing daily/weekly/event logic. Rename only nav labels, screen copy, and new component names unless a later refactor is approved. |
| Mine offline | Use copy-only fix. Do not implement passive Mine offline gains now. | The engine currently returns `mineGains = {}`. Adding passive income would affect economy, tests, and player expectations. | Audit Mine copy where touched. Do not change `applyOfflineProgress` for Mine in Phase 1. |
| Component strategy | Extract new direction components from the start, without doing a broad refactor of old screens. | `game-view.tsx` is already large. New surfaces should not increase the monolith further. | Add focused files in `src/app/components/*`; touch `game-view.tsx` mainly for imports, layout wiring, nav labels, and prop/action plumbing. |

Locked Phase 1 build order:

1. `CommandCenter`
2. `GuildhallSlotGrid`
3. `GuildReportPanel`
4. `FrontierMap`
5. `OrdersBoard`
6. `WarRoomPanel`

## 2. Current Architecture Constraints

| Area | Current state | Constraint for this plan |
| --- | --- | --- |
| Runtime | Web app built with Next.js, React, TypeScript, Tailwind-style utility classes, Zustand store, Vitest tests. | Keep implementation client/local-first. Do not assume server features. |
| Persistence | Game save is a localStorage envelope under `relic-forge-idle:v1`; theme has its own localStorage key. | Any new persisted field needs normalization in `src/game/save.ts`, import/export coverage, and migration thinking. Prefer no-save UI-only slices first. |
| State model | `GameState` in `src/game/types.ts` is the canonical state object. | UI should derive summaries from existing state where possible instead of creating duplicate UI state. |
| Store | `src/store/useGameStore.ts` owns orchestration: hydration, offline progress, actions, last offline summary, last expedition result. | New UI should call existing store actions. Avoid duplicating engine logic in components. |
| Engine | Core game rules live in `src/game/*` modules. | New domain helpers should be pure, deterministic functions with unit tests when they affect behavior. |
| Main UI | `src/app/game-view.tsx` is monolithic and already contains many screens, overlays, helpers, mobile navigation, and side panels. | Extract new direction components from the start. Use `game-view.tsx` mainly as the orchestration/wiring layer. |
| Styling | Global theme variables and utility aliases are in `src/app/globals.css`; visual identity is parchment/dark fantasy with royal blue, gold, stone, amber, ink. | Preserve current visual system. Add targeted classes only when utility classes become unreadable. |
| Town | `BuildingId` is currently `"forge" | "mine" | "tavern" | "library" | "market" | "shrine"`. `BUILDING_IDS`, `BUILDINGS`, construction costs, save normalization, and tests depend on this closed set. | Do not add `guildhall`, `caravan-yard`, or `war-room` as real buildings in Phase 1. Use UI-only frames around existing building data. |
| Construction | One active construction project at a time. Building level starts at 0 and construction upgrades to target level. | A slot-grid can show build-from-zero fantasy today, but must respect the one-project constraint. |
| Caravan | Caravan jobs are chosen by focus, duration, and region; caravan and expedition are mutually exclusive. Offline can complete caravan jobs. | Orders Board and Command Center should surface this mutual exclusion clearly. |
| Expedition offline | Offline progress marks an active expedition as ready but does not resolve it automatically. | Guild Report should say "expedition ready to claim/resolve" rather than pretending combat completed offline. |
| Mine offline | Current offline summary has `mineGains = {}`. Mine copy has been adjusted in UI in places, but building metadata still risks implying passive offline generation. | Recommended launch fix is copy-only unless an explicit Mine offline engine feature is approved. |
| Dailies | `complete_caravan` exists in the task pool, but `hasCaravanDailyObjectiveUnlocked` currently returns false. `weeklyQuest` is canonical; legacy `dailies.weekly.progress` still exists. | Treat these as small engine cleanup items after the UI-only migration. |
| Events | `Guild Foundry Festival` exists with participation and rewards. | Launch event integration can be surfaced in Command Center and Orders Board without new event mechanics. |

## 3. Proposed Implementation Slices

| Slice | Goal | Type | Save impact | Engine impact | Primary files | Test priority | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Command Center v0 | Add a top-level dashboard that summarizes current action, timers, event, daily/weekly status, construction, caravan, boss readiness, and next recommended goal. | UI-only first | None | None if built from existing state | `src/app/game-view.tsx`, `src/app/components/command-center.tsx`, `src/app/globals.css` if needed | Manual QA, typecheck | Medium because it touches main navigation and many state reads |
| Guildhall Slot Grid v0 | Reframe Town as a guild base with build slots using existing six buildings and construction state. | UI-only first | None | None | `src/app/game-view.tsx`, `src/app/components/guildhall-slot-grid.tsx`, `src/app/globals.css` | Manual QA, existing town tests remain | Low to medium because it changes presentation around construction |
| Frontier Map v0 | Present regions as strategic fronts, showing dungeons, bosses, outposts, materials, completion, and unlock status. | UI-only first | None | None | `src/app/game-view.tsx`, `src/app/components/frontier-map.tsx`, maybe helper in `src/game/regions.ts` later | Manual QA, helper tests if extracted | Medium because region state is spread across several systems |
| Orders Board v0 | Combine daily missions, weekly quest, event milestones, caravan opportunities, boss prep, and mastery nudges into one "work board". | UI-only first | None | None for v0 | `src/app/game-view.tsx`, `src/game/dailies.ts` later for caravan objective fix | Manual QA, daily/caravan tests later | Medium because task sources can contradict each other |
| War Room v0 | Surface boss scouting, threat preparation, power readiness, and next boss target as a strategic panel. | UI-only first | None | None | `src/app/game-view.tsx`, maybe helper in `src/game/bosses.ts` later | Manual QA, boss helper tests if extracted | Low to medium |
| Guild Report polish | Rewrite offline and expedition result overlays as a report with gains, completed timers, ready actions, and next CTA. | UI polish | None | None | `src/app/game-view.tsx`, `src/app/components/guild-report-panel.tsx` | Manual QA, existing offline tests | Low |
| Launch event integration | Surface `Guild Foundry Festival` in Command Center, Orders Board, and report copy with event progress and claimable tiers. | UI-only first | None | None | `src/app/game-view.tsx`, existing `src/game/events.ts` helpers | Manual QA, existing event tests | Low |
| Small engine fixes: `complete_caravan`, legacy weekly decision, Mine offline/copy | Remove known broken promises and hidden dead mechanics. | Engine cleanup | Usually none; save change only if legacy weekly fields are removed | Small, targeted | `src/game/dailies.ts`, `src/game/offline.ts`, `src/game/content.ts`, `src/app/game-view.tsx`, tests | Unit tests required for any behavior change | Medium because save and daily generation are sensitive |

Recommended implementation order:

1. Ship UI-only reframing first.
2. Extract pure summary helpers only after the UI shape is validated.
3. Fix small engine inconsistencies with tests.
4. Do polish, QA, and copy convergence.

## 4. Component Plan

Recommendation: extract the new direction components from the start into `src/app/components/*`. Do not do a broad refactor of existing screens yet. `src/app/game-view.tsx` should only receive the minimum wiring needed for imports, layout placement, navigation labels, selected tab behavior, and store action plumbing.

Suggested component files:

- `src/app/components/command-center.tsx`
- `src/app/components/guildhall-slot-grid.tsx`
- `src/app/components/frontier-map.tsx`
- `src/app/components/orders-board.tsx`
- `src/app/components/war-room-panel.tsx`
- `src/app/components/guild-report-panel.tsx`

| Component | Responsibility | Props | Reads state directly? | Calls store actions? | Can be UI-only? | Suggested file |
| --- | --- | --- | --- | --- | --- | --- |
| `CommandCenter` | Top dashboard: current priority, timers, event progress, construction, expedition/caravan status, daily/weekly completion, next CTA. | `state`, `now`, `offlineSummary?`, `expeditionResult?`, CTA callbacks like `onSelectTab`, optional subview setters. | Yes for v0; preferred later version receives summary props. | Only via passed callbacks. | Yes. | `src/app/components/command-center.tsx`. |
| `GuildhallSlotGrid` | Reframe Town as slots: built, buildable, upgrading, locked, maxed. Shows one active construction rule. | `state`, `now`, `store`, optional `slots`. | Yes for v0, or via `getGuildhallSlotSummaries`. | Yes: `buyBuildingUpgrade`, `claimBuildingConstruction`, `cancelBuildingConstruction`, `accelerateBuildingConstruction`. | Yes, because it uses existing buildings. | `src/app/components/guildhall-slot-grid.tsx`. |
| `GuildhallSlotCard` | Single building slot card with level, role, current effect, next cost, timer, CTA, locked reason. | `slot`, `now`, action callbacks. | No if fed `slot`. | No direct store calls; receives callbacks. | Yes. | Same file as grid until reused. |
| `FrontierMap` | Region overview: fronts, unlocks, boss state, outposts, completion, materials, recommended dungeon. | `state`, `now`, `onSelectTab`, optional `fronts`. | Yes for v0, or via `getRegionFrontSummaries`. | Only via navigation callbacks in v0. | Yes. | `src/app/components/frontier-map.tsx`; can initially live near `ExpeditionsScreen`. |
| `RegionFrontCard` | Single region front card showing status, boss, dungeon progress, material, outpost, CTA. | `front`, `onSelectRegion`, `onStartSuggested?`. | No if fed `front`. | Prefer no direct store call; CTA navigates first. | Yes. | Same file as `FrontierMap`. |
| `OrdersBoard` | Unified objective board across dailies, weekly quest, event, caravan, mastery, boss prep, construction. | `state`, `now`, `store`, `onSelectTab`, optional `orders`. | Yes for v0, or via `getOrdersBoardSummary`. | Maybe through existing claim actions only; navigation callbacks preferred. | Yes. | `src/app/components/orders-board.tsx`; can replace/enhance `DailiesScreen`. |
| `OrderToken` | Small token/card for one actionable objective with status, reward, progress, source, CTA. | `order`, `onAction`. | No. | No direct store calls. | Yes. | Same file as `OrdersBoard`. |
| `WarRoomPanel` | Boss readiness and threat prep: next boss, scout status, prep coverage, recommended action. | `state`, `now`, `store`, optional `summary`. | Yes for v0, or via `getWarRoomSummary`. | Yes only for existing boss actions if placed near current boss UI; otherwise navigation. | Yes. | `src/app/components/war-room-panel.tsx`; can initially live in expedition/boss subview. |
| `GuildReportPanel` | Offline and expedition result overlay with "what changed", gains, completed timers, warnings, and next CTA. | `state`, `store`, `onSelectTab`, `offlineSummary?`, `expeditionResult?`. | Yes in current overlay context. | Yes: dismiss/clear report actions through existing store. | Yes. | `src/app/components/guild-report-panel.tsx`; compose from `OfflineSummaryPanel` and `ExpeditionResultPanel` wiring. |

Implementation rule:

- Components should not mutate state directly.
- Components should not calculate rewards.
- Components should only call store actions that already exist.
- New CTA behavior should prefer tab/subview navigation over new mechanics.
- Derived copy should be backed by existing state conditions, not fake progress.

## 5. Domain Helper Plan

Domain helpers are optional for Phase 1. The first UI pass can derive locally if that is faster, but any logic reused by two or more components should move into pure helpers under `src/game/*`.

| Helper | File | Inputs | Output shape | Reason | Requires save change? | Tests? |
| --- | --- | --- | --- | --- | --- | --- |
| `getCommandCenterSummary` | Optional new `src/game/command-center.ts` or existing `src/game/progression.ts` if kept small | `state: GameState`, `now: number` | `{ primaryAction, timers, event, construction, activeRun, caravan, daily, weekly, boss, nextGoal }` | Gives the dashboard one stable source of truth and prevents duplicated priority logic. | No | Yes if used for CTA priority or status rules; otherwise type coverage/manual QA is enough for v0. |
| `getGuildhallSlotSummaries` | `src/game/town.ts` | `state: GameState`, `now: number` | `Array<{ buildingId, label, level, status, canUpgrade, cost, durationMs, readyAt, lockedReason, currentEffect, nextEffect }>` | Keeps construction slot status consistent between Town and Guildhall UI. | No | Yes if it owns affordability, timer, or lock logic. |
| `getRegionFrontSummaries` | `src/game/regions.ts` | `state: GameState`, `now: number` | `Array<{ zoneId, label, status, dungeonProgress, bossStatus, outpostStatus, material, recommendedDungeonId, completion }>` | Frontier Map needs region data from dungeons, bosses, outposts, collections, and materials. | No | Yes if status rules are non-trivial. |
| `getOrdersBoardSummary` | `src/game/dailies.ts` for daily/weekly base; optional new `src/game/orders.ts` if combining many systems | `state: GameState`, `now: number` | `{ orders: Array<{ id, source, label, progress, target, reward, status, cta }>, claimableCount, resetTimers }` | Prevents UI-only objective aggregation from drifting. | No | Yes if it determines visibility, claimability, or priority. |
| `getWarRoomSummary` | `src/game/bosses.ts` | `state: GameState`, `now: number` | `{ nextBoss, unlockedBosses, scoutState, threatCoverage, prepActions, readiness, recommendedAction }` | Boss prep is already domain-heavy; summary should remain close to boss logic. | No | Yes for locked/unlocked/readiness states. |
| `getReturnReportSummary` | `src/game/offline.ts` or optional `src/game/reports.ts` | `state: GameState`, `offlineSummary`, `expeditionResult`, `now` | `{ headline, gains, completed, warnings, nextActions }` | Report copy should not make false claims about offline expedition completion or Mine gains. | No for copy-only; maybe yes only if reports are persisted later. | Usually no for copy-only; yes if it transforms engine results. |

Helper export rule:

- If a helper is created in a new file, export it from `src/game/index.ts`.
- If a helper adds a new type, define the type in the helper file unless it must be shared broadly.
- Avoid adding types to `src/game/types.ts` unless the type is persisted or part of core engine state.

## 6. Data Model / Save Impact

| Feature | Uses existing state? | New persisted field? | Save migration needed? | Notes |
| --- | --- | --- | --- | --- |
| Command Center v0 | Yes | No | No | Can read `activeExpedition`, `caravan.activeJob`, `construction`, `dailies`, `weeklyQuest`, `eventProgress`, `bossPrep`, `regionProgress`, and `getNextGoal`. |
| Guildhall Slot Grid v0 | Yes | No | No | Use existing `town` and `construction`. The "slot" is presentation only. |
| Frontier Map v0 | Yes | No | No | Use `ZONES`, `DUNGEONS`, `dungeonClears`, `bossPrep`, `regionProgress`, `outposts`, collections, diaries, and regional materials. |
| Orders Board v0 | Yes | No | No | Use current dailies, weekly quest, event banner, mastery, boss prep, caravan availability, and construction. |
| War Room v0 | Yes | No | No | Use current boss definitions and `bossPrep`. |
| Guild Report polish | Yes | No | No | Use `lastOfflineSummary` and `lastExpeditionResult` from store. |
| Launch event integration | Yes | No | No | `eventProgress` already exists and is normalized by save loading. |
| `complete_caravan` daily objective fix | Yes | No | No | `complete_caravan` already exists as a `DailyTaskKind`; unlock rule is currently disabled. |
| Legacy `dailies.weekly.progress` decision | Yes | Prefer no | Only if removing persisted shape | Recommended: hide/ignore legacy weekly in UI and keep normalization for compatibility. |
| Mine offline copy-only fix | Yes | No | No | Change copy to avoid promising passive offline Mine gains. |
| Mine offline engine option | Mostly yes | Probably no | No if derived from elapsed time and mine level only | Would change `applyOfflineProgress`, summary, tests, and balance expectations. Not recommended for launch unless explicitly approved. |
| Real `guildhall` building | Partly | Yes | Yes | Requires adding a new `BuildingId`, building metadata, construction costs, save normalization, tests, UI, and probably balance. Defer. |
| Real `caravan-yard` building | Partly | Yes | Yes | Would need to define its relationship to caravan focus/duration/unlocks. Defer. |
| Real `war-room` building | Partly | Yes | Yes | Would need to define relation to boss scouting/prep. Defer. |
| Repeatable building slots | No | Yes | Yes | Current `town` is a fixed record keyed by building ID. Repeatable buildings need a new slot array/model. Out of scope. |
| Full city grid coordinates | No | Yes | Yes | Requires coordinate persistence, placement rules, unlock rules, visual grid, and migration. Out of scope for this technical plan. |

Why Guildhall, Caravan Yard, and War Room should remain UI-only for launch:

- The current save model is stable and simple.
- The current building set is closed across constants, types, costs, normalization, reset logic, and tests.
- The new direction can be sold through presentation without introducing migration risk.
- Real buildings should only be added when they change gameplay meaningfully, not as labels for already-existing tabs.

Requirements if real buildings are later promoted:

- Expand `BuildingId` in `src/game/types.ts`.
- Add IDs to `BUILDING_IDS` in `src/game/constants.ts`.
- Add metadata to `BUILDINGS` in `src/game/content.ts`.
- Add construction costs and durations in `src/game/town.ts`.
- Normalize missing legacy fields in `src/game/save.ts`.
- Update `createEmptyTown` in `src/game/state.ts`.
- Update reset/reincarnation preservation if needed.
- Add tests for new building cost, construction, save import, and UI visibility.

## 7. UI-Only Implementation Details

### Command Center

Purpose:

- Replace "what do I do now?" confusion with one tactical dashboard.
- Make timers and claimable actions visible.
- Convert existing hidden systems into daily return hooks.

Placement:

- Desktop/mobile: contextual compact panel inside the Expeditions route content after onboarding.
- Do not render it as a global header or persistent card across all tabs.
- Keep it condensed to one primary action plus small status chips/timers.

Inputs/imports:

- `getNextGoal(state, now?)` from `src/game/expeditions.ts` if already available in current UI imports.
- Event banner helpers from `src/game/events.ts`.
- Construction helpers from `src/game/town.ts`.
- Caravan active job and focus definitions from `src/game/caravan.ts`.
- Daily/weekly reset data from existing dailies state.
- Boss summary helper if available, otherwise existing boss prep functions.

State conditions:

- If `state.construction.activeBuildingId` is ready, primary CTA should go to Town/Guildhall and claim construction.
- If `store.lastOfflineSummary` or `store.lastExpeditionResult` exists, primary CTA can open Guild Report.
- If active expedition is ready, CTA should go to expedition result/active expedition area, not auto-complete.
- If caravan job is complete, CTA should go to caravan claim UI.
- If event reward is claimable, show an event claim indicator.
- If no urgent action exists, show `getNextGoal` as the strategic recommendation.

CTA behavior:

- Prefer `onSelectTab("town")`, `onSelectTab("expeditions")`, `onSelectTab("missions")`, and subview changes.
- Do not start expeditions, claim rewards, or spend resources directly from Command Center in v0 unless the existing UI action is already one-click and safe.

Empty/locked states:

- New account: show "Establish the Guildhall" framing, but route to existing first dungeon/Forge flow.
- No event active: hide event card or show a small "No guild festival active" line, not a disabled large module.
- No construction: show "No guild project queued" with Town CTA.

Mobile behavior:

- Keep the top card short.
- Use horizontal chips for timers.
- Hide secondary details behind the existing tab content or collapsible sections.

Copy:

- "Command Center"
- "Current order"
- "Guild project"
- "Frontier pressure"
- "Report ready"
- "Festival contract"

### Guildhall Slot Grid

Purpose:

- Make Town feel like base construction instead of a plain list of upgrades.
- Support the fantasy of building structures from zero without changing the save model.

Inputs/imports:

- `BUILDINGS` from `src/game/content.ts`.
- `getBuildingConstructionCost`, `getBuildingConstructionDurationMs`, `canAffordConstructionCost`, `getConstructionProgress`, `getBuildingEffectText` or existing local equivalent.
- Store actions for construction.

State conditions:

- `level === 0`: show "Foundation available" if affordable or "Needs resources" if not.
- `level > 0 && level < maxLevel`: show "Operational" plus next upgrade.
- `level === maxLevel`: show "Mastered".
- `construction.activeBuildingId === building.id`: show active timer or ready state.
- Any other active construction: disable build/upgrade CTA with "Another guild project is active".

CTA behavior:

- Level 0 CTA label should be "Build".
- Level > 0 CTA label should be "Upgrade".
- Ready construction CTA should be "Complete".
- Accelerate/cancel actions can remain behind the existing Town detail if the slot card becomes too busy.

Empty/locked states:

- Do not show fake locked buildings in v0 unless they map to existing level/cost/material requirements.
- Shrine can naturally feel locked because its level 1 cost requires Ember Resin.
- If resources are missing, show the exact missing resource when current helpers support it; otherwise show cost.

Mobile behavior:

- One-column card stack.
- Put level badge and CTA in the top row.
- Hide long milestone text unless the card is expanded or the building is selected.

Copy:

- "Guildhall"
- "Slot"
- "Foundation"
- "Under construction"
- "Operational"
- "Mastered"

### Frontier Map

Purpose:

- Make current regions feel like a strategic campaign map.
- Expose region-specific progression, bosses, outposts, materials, and collections.

Inputs/imports:

- `ZONES`, `DUNGEONS` from `src/game/content.ts`.
- Region helpers from `src/game/regions.ts`.
- Boss helpers from `src/game/bosses.ts`.
- Outpost helpers from `src/game/outposts.ts`.
- Expedition unlock helpers from `src/game/expeditions.ts`.

State conditions:

- Locked region: show unlock requirement from first locked dungeon/boss chain where available.
- Active region: show recommended dungeon, clears, boss status, and material.
- Boss available: show War Room CTA.
- Outpost available: show "secure outpost" CTA or status.
- Region completed: show mastered badge and remaining collection/diary/mastery opportunities if any.

CTA behavior:

- CTA should navigate to Expeditions with the relevant region/dungeon selected if the existing UI supports it.
- If direct selection is not easy, CTA can navigate to Expeditions and show copy that the next target is visible there.
- Do not create a new path to start expeditions until selection state is clean.

Empty/locked states:

- For early accounts, show only Sunlit Marches as active and next region as "scouted route".
- Do not expose all late-game regions with full details if it creates analysis overload.

Mobile behavior:

- Vertical map list with region cards.
- Use a simple progress bar per region.
- Avoid tiny node maps in v0; a node map can come later.

Copy:

- "Frontier Map"
- "Front"
- "Secured"
- "Contested"
- "Boss pressure"
- "Regional supply"

### Orders Board

Purpose:

- Convert fragmented tasks into a clear set of daily reasons to return.
- Align dailies, weekly quest, event, caravan, mastery, boss prep, and construction into one actionable board.

Inputs/imports:

- Dailies and weekly state from `state.dailies` and `state.weeklyQuest`.
- Event helpers from `src/game/events.ts`.
- Caravan state from `state.caravan`.
- Mastery/collection/boss prep state as secondary order sources.

State conditions:

- Claimable daily: high priority.
- Partially complete daily: medium priority.
- Weekly quest with completed step or claimable quest: high priority.
- Event reward claimable: high priority.
- Caravan available and no active expedition: medium priority.
- Boss prep incomplete but boss unlocked: medium priority.
- Construction ready or idle: medium priority.

CTA behavior:

- Claim actions can remain in current daily/event UI for v0.
- Orders Board can navigate to the relevant screen first.
- If adding direct claim buttons, only use existing store actions and preserve existing validation.

Empty/locked states:

- If dailies are not seeded yet, call existing dailies ensure flow only through current store lifecycle, not from a render side effect.
- If caravan objective is still disabled, do not show it as a daily order until the engine fix is implemented.

Mobile behavior:

- Use compact order tokens grouped by "Ready", "In progress", and "Next".
- Keep rewards visible but short.

Copy:

- "Orders Board"
- "Ready to claim"
- "Guild contract"
- "Weekly charter"
- "Festival order"
- "Caravan order"

### War Room

Purpose:

- Make boss prep understandable and strategic.
- Explain what scouting and preparation do before the player enters boss content.

Inputs/imports:

- Boss helpers from `src/game/bosses.ts`.
- Current dungeon unlock state from `src/game/expeditions.ts`.
- Power/readiness values already used by boss UI.

State conditions:

- No boss unlocked: show next boss teaser and route back to Frontier/Expeditions.
- Boss unscouted: show scout cost and benefit.
- Boss scouted with threats: show uncovered threats and prep actions.
- Boss ready: show launch CTA to existing boss/expedition flow.
- Boss defeated: show secured status and next region/front.

CTA behavior:

- Scout/prep buttons can use existing boss actions only if they are already exposed in current boss UI.
- Otherwise route to the current boss screen.

Empty/locked states:

- Early game should not show a wall of late bosses.
- Show one next boss plus a compact list of defeated bosses.

Mobile behavior:

- One boss focus card plus collapsible "secured bosses".
- Use threat chips instead of dense tables.

Copy:

- "War Room"
- "Scout"
- "Prepare"
- "Threat coverage"
- "Ready to assault"

### Guild Report

Purpose:

- Turn return moments into a clear reward and next-action beat.
- Avoid false promises about systems that did not run offline.

Inputs/imports:

- `store.lastOfflineSummary`
- `store.lastExpeditionResult`
- `applyOfflineProgress` output shape from `src/game/offline.ts`
- Existing dismiss/clear result actions from store.

State conditions:

- Offline focus gained: show focus refill.
- Construction ready: show project ready.
- Caravan completed: show caravan rewards and claim state.
- Expedition ready: say "expedition report ready" or "expedition awaits resolution"; do not say "completed offline".
- Mine gains: only show if non-empty.
- No meaningful gains: show short "patrol quiet" copy and next CTA.

CTA behavior:

- Primary CTA should route to the most important ready item.
- Secondary CTA dismisses the report.

Empty/locked states:

- If no report exists, do not render the overlay.
- If report has no gains but active timers exist, show timers instead of an empty reward list.

Mobile behavior:

- Full-width modal/card.
- Keep gain rows readable with two-column max.

Copy:

- "Guild Report"
- "While you were away"
- "Ready for orders"
- "No passive mine haul this time" should be avoided; better to omit Mine if no gains.

## 8. Engine Fix Details

### `complete_caravan` Daily Objective

Current problem:

- `complete_caravan` exists in `DAILY_TASK_POOL` and in save normalization as a valid `DailyTaskKind`.
- `claimCaravanJob` and offline caravan completion already call daily progress for `complete_caravan`.
- `hasCaravanDailyObjectiveUnlocked(_state)` currently returns `false`, so this daily never appears.

Recommended unlock rule:

- Unlock the objective only after caravan is meaningfully available to the player.
- Safe rule for v1: unlock when the player has access to caravan jobs and has at least one valid caravan region/focus.
- Practical implementation can use existing caravan unlock helpers or a conservative condition like hero level and region availability, depending on current caravan UI unlock rules.

Implementation files:

- `src/game/dailies.ts`: replace the hardcoded false with a real unlock check.
- `src/game/caravan.ts`: only touched if the unlock helper already exists there and should be reused/exported.
- `src/game/__tests__/core.test.ts`: add daily generation/progress tests.

Test cases:

- Early player does not roll `complete_caravan`.
- Eligible player can roll `complete_caravan`.
- Claiming a completed caravan increments the daily task.
- Offline-completed caravan increments the daily task if the objective exists.

Risk:

- Daily task pool generation may become harder for early players if the unlock rule is too permissive.
- Avoid adding the task before the player can reasonably finish it that same day.

### Legacy `weekly.progress`

Current problem:

- The canonical weekly system is `state.weeklyQuest`.
- Legacy `state.dailies.weekly.progress` still exists in the state shape and save normalization path.
- UI or helpers that accidentally show both systems can confuse players and create contradictory progress.

Recommended decision:

- Keep legacy data normalized for save compatibility.
- Do not expose `dailies.weekly.progress` in new UI.
- Use `state.weeklyQuest` exclusively for Orders Board and Command Center.

Implementation files if only hiding:

- `src/app/game-view.tsx`: ensure new UI reads `weeklyQuest`, not legacy weekly.
- No save migration required.

Implementation files if removing later:

- `src/game/types.ts`
- `src/game/state.ts`
- `src/game/dailies.ts`
- `src/game/save.ts`
- `src/game/__tests__/core.test.ts`

Test cases if wired/changed:

- Weekly quest progress updates from supported actions.
- Legacy weekly data in imported saves does not break import.
- UI does not render duplicate weekly progress.

Risk:

- Removing legacy fields is not worth it until the save model is being intentionally versioned.

### Mine Offline Promise

Current problem:

- `applyOfflineProgress` returns `mineGains = {}`.
- Current tests assert no Mine gains during offline caravan behavior.
- Some building metadata/copy still risks implying passive Mine offline rewards.
- This creates a product promise mismatch if the UI says Mine generates offline resources.

Option A: copy-only fix

- Update Mine description/milestone copy to emphasize expedition/caravan material yield instead of passive offline gains.
- Keep `offline.ts` unchanged.
- Keep current tests unchanged except copy tests if any.
- This is the recommended launch option.

Option B: engine implementation

- Add passive offline Mine gains based on Mine level and elapsed offline time, likely capped by the existing offline cap.
- Update `applyOfflineProgress` to fill `summary.mineGains`.
- Decide resource type: fragments only, regional materials, or both.
- Update balance expectations and tests.

Recommended:

- Choose Option A for the direction migration.
- Revisit Option B only after the economy has a clear reason for passive Mine income.

Implementation files for Option A:

- `src/game/content.ts`: Mine description and milestones if needed.
- `src/app/game-view.tsx`: any Mine-specific feedback copy if not already aligned.
- `src/game/__tests__/core.test.ts`: only if copy expectations exist.

Implementation files for Option B:

- `src/game/offline.ts`
- `src/game/types.ts` only if summary shape changes.
- `src/game/__tests__/core.test.ts`
- Possibly `src/game/balance.ts` if constants are introduced.

## 9. File-Level Change Plan

| File | Planned changes | Slice(s) | Risk | Test coverage |
| --- | --- | --- | --- | --- |
| `src/app/game-view.tsx` | Wire extracted new components, place Command Center above active content, update user-facing nav labels, pass store actions/callbacks, and keep existing screens functional. | Command Center v0, Guildhall Slot Grid v0, Frontier Map v0, Orders Board v0, War Room v0, Guild Report polish, Launch event integration | High due file size and many existing responsibilities | Typecheck, manual desktop/mobile QA, existing core tests |
| `src/app/globals.css` | Add targeted visual classes only for new map/grid/report patterns that are awkward in utility classes. Reuse existing CSS variables. | All UI slices | Low to medium | Visual QA/manual QA |
| `src/app/components/command-center.tsx` | New extracted Command Center component. | Command Center v0 | Low | Typecheck/manual QA |
| `src/app/components/guildhall-slot-grid.tsx` | New extracted Guildhall grid and slot cards. | Guildhall Slot Grid v0 | Low | Typecheck/manual QA |
| `src/app/components/frontier-map.tsx` | New extracted Frontier Map and RegionFrontCard component. | Frontier Map v0 | Low | Typecheck/manual QA |
| `src/app/components/orders-board.tsx` | New extracted Orders Board and OrderToken component. | Orders Board v0 | Low to medium | Typecheck/manual QA |
| `src/app/components/war-room-panel.tsx` | New extracted boss readiness panel. | War Room v0 | Low | Typecheck/manual QA |
| `src/app/components/guild-report-panel.tsx` | New extracted report panel used by offline and expedition result overlays. | Guild Report polish | Low | Typecheck/manual QA |
| `src/game/dailies.ts` | Later: implement `complete_caravan` unlock rule; ensure new board reads canonical weekly quest only. | Small engine fixes, Orders Board v0 | Medium | Unit tests for daily generation/progress |
| `src/game/offline.ts` | Prefer no change for launch. If Option B Mine is approved, add passive Mine gains and summary output. | Guild Report polish, Mine offline fix | Medium | Offline tests |
| `src/game/town.ts` | Optional helper `getGuildhallSlotSummaries`; no balance change. | Guildhall Slot Grid v0, Domain helpers | Low to medium | Helper tests if logic extracted |
| `src/game/regions.ts` | Optional helper `getRegionFrontSummaries`; no progression change. | Frontier Map v0, Domain helpers | Low to medium | Helper tests if logic extracted |
| `src/game/index.ts` | Export new helper files only if new domain files are created. | Domain helpers | Low | Typecheck |
| `src/store/useGameStore.ts` | Prefer no change. Only add navigation-independent report clear helpers if current actions are insufficient. | Guild Report polish | Medium | Store behavior through UI/manual QA; unit tests if logic changes |
| `src/game/save.ts` | Prefer no change. Required only if new persisted fields/buildings are added or legacy weekly is removed. | Data model changes, real buildings | High | Save import/export and legacy normalization tests |
| `src/game/content.ts` | Optional Mine copy-only fix; possible building copy polish. No balance changes. | Mine offline copy, Guildhall copy | Low | Existing copy expectations if present |
| `src/game/bosses.ts` | Optional `getWarRoomSummary`. No combat changes. | War Room v0, Domain helpers | Low to medium | Helper tests |
| `src/game/events.ts` | Prefer no change; existing event helpers should be reused. | Launch event integration | Low | Existing event tests |
| `src/game/__tests__/core.test.ts` | Add tests for any engine fix or non-trivial helper. Do not add brittle snapshot tests for layout. | Engine fixes, helpers | Medium | Main automated coverage |

## 10. Test Plan

| Slice | Automated tests | Manual tests | Regression risks |
| --- | --- | --- | --- |
| Command Center v0 | Typecheck. Unit tests only if summary helper is created. | New save, mid-game save, active expedition, ready construction, active caravan, active event, mobile and desktop. | Wrong CTA priority, stale timers, duplicated action prompts. |
| Guildhall Slot Grid v0 | Existing town construction tests should still pass. Helper tests if `getGuildhallSlotSummaries` exists. | Build from level 0, upgrade existing building, active construction, ready construction, unaffordable cost, max level, mobile card layout. | Accidentally allowing multiple constructions, confusing build vs upgrade copy. |
| Frontier Map v0 | Helper tests if extracted. | Early game locked regions, first boss available, outpost unlocked, late-game region completion, mobile list readability. | Showing locked information too early, wrong region recommendation. |
| Orders Board v0 | Tests only for helper or engine behavior. Existing daily/weekly/event tests must pass. | Claimable daily, partial daily, weekly quest completed, event tier claimable, caravan active/blocked, no duplicated weekly. | Presenting impossible orders, showing disabled caravan daily before fix. |
| War Room v0 | Helper tests if extracted. Existing boss tests remain. | No boss unlocked, boss scout available, scouted threats, prep actions, defeated boss, mobile threat chips. | Misstating readiness or threat coverage. |
| Guild Report polish | Existing offline tests. Helper tests only if report transformation is extracted. | Offline focus only, construction ready, caravan complete, caravan partial, expedition ready, empty report, dismiss flow. | Claiming an expedition completed offline when it only became ready. |
| Launch event integration | Existing event tests. Typecheck. | Event inactive, event active with 0 progress, progress with claimable tier, claimed tier, no event UI break on mobile. | Event cards persisting after event window, duplicate claim prompts. |
| `complete_caravan` fix | Unit tests for unlock, generation, claim progression, offline progression. | Player with caravan unlocked sees objective; early player does not. | Daily task appears before player can complete it. |
| Legacy weekly decision | If UI-only, typecheck/manual QA. If engine removal, save tests. | Confirm new UI only shows `weeklyQuest`. Import legacy save. | Breaking old saves or showing two weekly systems. |
| Mine offline copy-only | Existing tests should remain. Copy assertions only if present. | Offline report after Mine levels does not imply missing Mine reward. | Player expectation mismatch if any old copy remains. |
| Save/import regressions | Required only if save changes. | Export/import current save, import legacy save, reset/reincarnation preserve expected fields. | Lost town/caravan/event/boss progress. |
| Global checks | `npm run build` or project typecheck command; `npm test`/Vitest suite if available. | 390px mobile, 768px tablet, 1280px desktop, reduced motion if relevant. | Layout overflow, nav conflicts, hydration mismatch. |

Minimum verification for a UI-only implementation:

- TypeScript passes.
- Existing test suite passes.
- Manual QA covers mobile and desktop.
- No save migration is introduced.
- Imported current save still renders.

## 11. Sequencing Recommendation

### Phase 1: UI-Only No Engine

Goal:

- Make the game feel like the new direction using existing data and actions.

Files:

- `src/app/game-view.tsx`
- `src/app/globals.css`
- `src/app/components/command-center.tsx`
- `src/app/components/guildhall-slot-grid.tsx`
- `src/app/components/guild-report-panel.tsx`
- `src/app/components/frontier-map.tsx`
- `src/app/components/orders-board.tsx`
- `src/app/components/war-room-panel.tsx`

Work:

- Add compact `CommandCenter` inside the Expeditions route content after onboarding; do not mount it globally above every tab.
- Reframe Town visually as `Guildhall` and add `GuildhallSlotGrid` using existing buildings and construction state.
- Rename Missions visually to `Orders`, with screen title `Orders Board`, while keeping current daily/weekly/event logic.
- Add `GuildReportPanel` polish and CTA priority.
- Add `FrontierMap` using current region/dungeon/boss/outpost state.
- Add `OrdersBoard` using existing dailies, weekly quest, event, and navigation CTAs.
- Add `WarRoomPanel` using existing boss state.
- Apply Mine copy-only audit where the new UI touches Mine messaging; do not implement Mine offline income.

Exit criteria:

- No save changes.
- No balance changes.
- New direction components are extracted under `src/app/components/*`.
- `game-view.tsx` remains the wiring layer for the new components, not the owner of all new markup.
- Existing core tests pass.
- New UI does not expose actions the player cannot complete.
- Mobile navigation remains usable.
- Town/Guildhall and Missions/Orders names are user-facing only; internal state names remain unchanged.

### Phase 2: Low-Risk Domain Helpers

Goal:

- Move repeated derived UI logic out of components into pure helpers.

Files:

- `src/game/town.ts`
- `src/game/regions.ts`
- `src/game/bosses.ts`
- `src/game/dailies.ts` or optional `src/game/orders.ts`
- Optional `src/game/command-center.ts`
- `src/game/index.ts` if new helper files are created.
- `src/game/__tests__/core.test.ts` for helper behavior if non-trivial.

Work:

- Extract slot summaries, region front summaries, war room summary, orders summary, and command center summary only where repetition exists.
- Keep outputs presentation-ready but engine-neutral.

Exit criteria:

- Components become thinner.
- Helpers are pure and deterministic.
- Typecheck and tests pass.
- No persisted state is added.

### Phase 3: Engine Fixes With Tests

Goal:

- Fix known hidden/dead/broken-promise mechanics after UI shape is stable.

Files:

- `src/game/dailies.ts`
- `src/game/caravan.ts` only if unlock helper reuse is needed.
- `src/game/content.ts` for Mine copy-only fix.
- `src/game/offline.ts` only if Mine engine option is approved.
- `src/game/__tests__/core.test.ts`
- `src/app/game-view.tsx` only for UI hiding/copy.

Work:

- Enable `complete_caravan` daily objective with a safe unlock rule.
- Confirm all new UI reads `weeklyQuest`, not legacy `dailies.weekly.progress`.
- Keep Mine offline engine unchanged. Only revisit passive Mine offline gains if explicitly rescoped after launch.

Exit criteria:

- Tests cover daily caravan unlock and progress.
- Weekly UI is singular and canonical.
- No UI promises passive Mine offline rewards unless the engine actually provides them.

### Phase 4: Polish/QA

Goal:

- Make the new direction feel cohesive and reliable.

Files:

- `src/app/game-view.tsx`
- Extracted component files if present.
- `src/app/globals.css`
- Documentation files only after implementation, if code changed.

Work:

- Tighten copy.
- Verify event, report, and CTA priority.
- Tune responsive layout.
- Remove duplicated or obsolete UI blocks if the new surfaces replace them.

Exit criteria:

- Desktop and mobile are visually stable.
- Primary action is clear on every major state.
- No duplicated systems confuse the player.
- Docs can be updated from actual implementation.

## 12. Risks & Cut Lines

| Risk | Why it matters | Mitigation | Cut line |
| --- | --- | --- | --- |
| `game-view.tsx` size/refactor risk | The file is already large and a broad UI migration can make it harder to maintain. | Extract new direction components from the start and avoid broad refactors of old screens. | If the diff becomes hard to review, stop adding slices and simplify component boundaries before continuing. |
| UI/domain drift | UI-only summaries can accidentally invent rules not enforced by the engine. | Derive from existing helpers and move repeated logic into pure domain helpers. | Cut direct action buttons and use navigation CTAs instead. |
| Save migration risk | Adding real buildings or grid slots affects types, normalization, imports, reset, and tests. | Keep Guildhall/Caravan Yard/War Room UI-only for launch. | No new persisted fields in Phase 1. |
| Mobile complexity | Command Center, map, board, and grid can become too dense on small screens. | Use compact cards, chips, and one-column layouts. | Keep Command Center contextual rather than global; hide secondary panels on mobile until selected. |
| Overbuilding Guildhall | A full city grid is tempting but not needed to validate the direction. | Use fixed existing building slots first. | Do not add coordinates, repeatable buildings, or placement rules. |
| Broken promises | Copy that says "offline Mine gains" or "caravan daily" before engine support damages trust. | Audit all copy against actual engine behavior. | Hide or rewrite any promise not backed by state. |
| CTA priority bugs | A dashboard that sends players to the wrong place becomes noise. | Keep priority order simple and test common states manually. | If unsure, show recommendation copy without a direct action. |
| Event overexposure | Event UI can crowd permanent systems. | Show event card only in Orders when active or claimable; use only a small event chip elsewhere. | Hide inactive events from Command Center v0 and never mount a large event card globally. |
| Helper overengineering | Building generic summary layers too early can slow the migration. | Extract only after duplication appears. | Keep Phase 1 helpers local if one component uses them. |

Recommended cut lines if implementation time is constrained:

- Cut direct actions from Command Center; keep navigation CTAs.
- Cut visual node-map from Frontier Map; use region cards.
- Cut direct claim buttons from Orders Board; route to existing screens.
- Cut real War Room actions; show readiness and route to boss UI.
- Cut Mine offline engine work; do copy-only fix.
- Cut real city grid entirely; keep fixed Guildhall Slot Grid.

## 13. Final Engineering Checklist

Before implementation starts:

- [x] Product decisions confirmed: strategic guild command direction, not full city-builder.
- [x] UI-only Phase 1 scope accepted.
- [x] Guildhall, Caravan Yard, and War Room are confirmed as presentation layers for launch.
- [x] No backend, PvP, multiplayer, city-grid coordinates, or repeatable building scope is included.
- [x] Command Center placement confirmed: compact contextual panel inside Expeditions after onboarding, not a global persistent card.
- [x] Town visual rename confirmed: user-facing `Guildhall`, internal `town` unchanged.
- [x] Missions visual rename confirmed: user-facing `Orders` / `Orders Board`, existing systems unchanged.
- [x] Component strategy confirmed: extract new direction components from the start.
- [ ] Test plan accepted.
- [x] Files to touch confirmed for Phase 1.
- [x] Save changes explicitly rejected for Phase 1 unless a later decision changes scope.
- [ ] `complete_caravan` daily objective unlock rule confirmed before engine work.
- [ ] Legacy weekly decision confirmed: use `weeklyQuest`, hide legacy `dailies.weekly.progress`.
- [x] Mine decision confirmed: copy-only for launch unless passive Mine offline income is explicitly approved.

Before merging Phase 1:

- [ ] Existing tests pass.
- [ ] Typecheck/build passes.
- [ ] Current save imports and renders.
- [ ] New player flow still has a clear first action.
- [ ] Mid-game flow surfaces construction, caravan, dailies, weekly, event, and boss state correctly.
- [ ] Mobile layout has no horizontal overflow.
- [ ] UI copy does not promise unsupported mechanics.
- [ ] Any new helper files are exported through `src/game/index.ts` if needed.

Before any save/model change:

- [ ] New persisted field is justified by gameplay, not presentation.
- [ ] `GameState` type updated.
- [ ] Initial state updated.
- [ ] Save normalization updated.
- [ ] Import/export tests updated.
- [ ] Legacy save behavior tested.
- [ ] Reset/reincarnation preservation behavior reviewed.
