# Relic Forge Idle - MVP 2.0 Product Strategy Roadmap (Second Pass)

Date: 2026-05-09  
Scope: planning only, no code changes

## Guardrails (Non-Negotiable)

- Single-player only.
- Dark-only, mobile-first UI.
- No backend/accounts/cloud save for MVP 2.0.
- No real PvP/guilds/trading/auction house.
- No runtime monetization (payments/ads/premium currency) in MVP 2.0.
- Reuse existing architecture: deterministic logic in `src/game`, orchestration in `src/store`, UI in `src/app/page.tsx`.

## PASS 1 - Roadmap Critique

### What was too vague

- "Improve retention" statements were present but not mapped tightly to player behavior by timeframe.
- "Monetization readiness" was named, but measurement and decision gates were underspecified.
- Some milestone descriptions lacked hard cut lines for schedule pressure.

### What was too ambitious

- Candidate list mixed low-risk MVP 2.0 features with high-risk 3.0 systems without clear separation by implementation burden.
- Some feature bundles implied multi-system rollout in one milestone (high integration risk).

### What was missing

- Explicit first-5-minutes/first-hour/first-day/first-week retention lens.
- A numeric scoring model to compare feature value vs implementation burden.
- Concrete "do-not-build" cuts tied to why they are poor bang-for-buck now.

### What was not addictive enough

- Too little emphasis on short-cycle goals that refresh daily/weekly without punishment.
- Not enough focus on "next meaningful decision" moments between reincarnations.

### What was risky to implement

- New systems that require broad schema/UI changes simultaneously (pets + progression + economy coupling).
- Content-heavy expansions (more regions/classes) before strengthening repeat-loop depth.

### What may not improve retention

- Pure codex/lore additions without reward loops.
- Cosmetic-heavy planning without progression hooks.
- Large content volume increases without better mid-session goals.

### What sounds cool but should be cut (for MVP 2.0)

- Real leaderboards/PvP/guild loops.
- More classes and item sets.
- Cloud save/accounts.
- Challenge dungeon complexity beyond a tiny "boss mastery" layer.

### What was unclear for implementation

- Exact minimal scope for each selected feature.
- Which files/systems each milestone should touch.
- What to cut first if timeline slips.

## PASS 2 - Player Retention Analysis

| Period | What player is doing now | What they are chasing | Why they might quit | What should pull them back | What MVP 2.0 must improve |
| --- | --- | --- | --- | --- | --- |
| First 5 minutes | Hero creation, first expeditions, first drops, first Town upgrade | Quick power gain and first meaningful item | Confusion from too many systems at once; low perceived agency | Immediate "next goal" and first short contract | Add one clear short objective ribbon (contract/daily focus) and stronger payoff feedback |
| First 15 minutes | Region 1 loop, first boss/craft, inventory management starts | Rare+ drop, first forge decision, boss clear | RNG frustration, inventory friction, unclear best action | Directed forge objective + clearer build comparison | Add forge targeting-lite and inventory quick decisions |
| First hour | Region progression, contracts, first reincarnation route | Reincarnation unlock and permanent acceleration | Repetition and weak medium-term goals | Weekly quest progress + reincarnation milestone goals | Add weekly structure and visible run-to-run milestone ladder |
| First day | Multiple sessions, experimentation, resource planning | Better build, smoother repeat sessions | Feels "samey" between sessions; decision fatigue | Reset-resistant goals (weekly chest, mastery tiers) | Add low-pressure weekly progression and preset/loadout convenience |
| First week | Habit formation or churn | Efficient loop mastery and personal optimization | No evolving objective horizon after first novelty | Layered goals with compact complexity | Add 3-7 day cadence: contracts + mastery + reincarnation upgrades |

## PASS 3 - Feature Candidate Scoring

Scoring model (1-5 each):

- Positive dimensions: Player impact, Retention impact, Addictiveness, Monetization readiness, Reuse existing systems.
- Cost/risk dimensions (higher is worse): Implementation cost, Technical risk, UI complexity, Balance risk.
- Bang-for-buck score (BFB):  
  `(Player + Retention + Addictiveness + Monetization + Reuse) - (Cost + Tech Risk + UI Complexity + Balance Risk)`

| Feature | Player | Retention | Addictive | Cost | Tech Risk | UI Complexity | Balance Risk | Monet Readiness | Reuse | BFB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Class passives (expansion) | 3 | 3 | 3 | 2 | 2 | 2 | 3 | 2 | 5 | 7 |
| Small talent system | 4 | 4 | 4 | 3 | 3 | 3 | 4 | 3 | 3 | 5 |
| Pet system | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 4 | 2 | 3 |
| Pet progression | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 2 | 3 |
| Better forge upgrades | 4 | 4 | 4 | 3 | 3 | 3 | 4 | 4 | 4 | 7 |
| Affix rerolling (deeper UX) | 3 | 3 | 4 | 2 | 2 | 2 | 3 | 3 | 5 | 9 |
| Item enhancement | 4 | 4 | 4 | 3 | 3 | 3 | 4 | 4 | 4 | 7 |
| Loot codex | 2 | 2 | 2 | 2 | 1 | 2 | 1 | 2 | 3 | 5 |
| Collection bonuses | 3 | 3 | 3 | 3 | 3 | 3 | 4 | 3 | 3 | 2 |
| Better bosses | 4 | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 4 | 7 |
| Challenge dungeons | 4 | 3 | 4 | 4 | 4 | 3 | 5 | 3 | 3 | 1 |
| Region events | 3 | 4 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 4 |
| Tavern contracts | 5 | 5 | 4 | 3 | 2 | 3 | 3 | 4 | 5 | 12 |
| Better contracts | 4 | 5 | 3 | 2 | 2 | 2 | 3 | 3 | 5 | 11 |
| Weekly quests | 4 | 5 | 4 | 3 | 2 | 3 | 3 | 4 | 5 | 11 |
| Vigor improvements | 3 | 4 | 3 | 2 | 2 | 2 | 3 | 4 | 5 | 10 |
| Reincarnation upgrades | 4 | 4 | 4 | 3 | 2 | 3 | 4 | 3 | 5 | 8 |
| NPC rivals | 2 | 2 | 2 | 3 | 3 | 3 | 2 | 2 | 2 | -1 |
| Offline jobs | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 |
| Achievements expansion | 3 | 3 | 2 | 2 | 1 | 2 | 1 | 2 | 4 | 8 |
| Inventory QoL | 4 | 4 | 3 | 2 | 1 | 3 | 1 | 4 | 5 | 13 |
| Build presets | 4 | 4 | 4 | 3 | 2 | 3 | 2 | 4 | 5 | 11 |
| Bestiary/lore codex | 2 | 2 | 2 | 2 | 1 | 2 | 1 | 2 | 3 | 5 |
| Manual analytics | 3 | 4 | 2 | 2 | 2 | 2 | 1 | 5 | 4 | 11 |
| Feedback form | 2 | 3 | 1 | 1 | 1 | 1 | 1 | 4 | 4 | 10 |
| More regions | 4 | 3 | 3 | 4 | 3 | 3 | 4 | 3 | 2 | 1 |
| More classes | 4 | 3 | 4 | 4 | 4 | 4 | 5 | 3 | 2 | -1 |
| Item sets | 4 | 3 | 4 | 4 | 4 | 3 | 5 | 4 | 3 | 2 |

### Bang-for-buck conclusions

Highest ROI for MVP 2.0 is concentrated in systems that:

- add repeat goals (`Tavern contracts`, `Weekly quests`, `Better contracts`),
- reduce friction (`Inventory QoL`, `Build presets`),
- deepen existing loops with low infra risk (`Reincarnation upgrades`, `Forge targeting-lite`),
- improve decision quality (`Manual analytics` + `Feedback form`) without gameplay bloat.

Low ROI for MVP 2.0 right now:

- `More classes`, `NPC rivals`, large content expansions, and `Item sets`.

## PASS 4 - Choose Actual MVP 2.0 Scope (No More Than 5 Major Improvements)

Chosen MVP 2.0 scope:

1. Tavern Contracts + Weekly Quests (single system)
2. Better Contracts + Vigor Improvements (single system)
3. Inventory QoL + Build Presets (single system)
4. Reincarnation Upgrade Expansion (small, capped)
5. Forge Targeting Lite (reroll UX + one-step enhancement, no recipe tree)

### 1) Tavern Contracts + Weekly Quests

- High impact: creates 3-7 day objective structure beyond one-session pacing.
- Feasible: reuses existing action counters and reset logic.
- Reuse: `dailies.ts`/Contracts, `expeditions`, `store` action hooks.
- Behavior improved: more return sessions and fewer "what do I do now" moments.
- Risks: chore fatigue if contract volume too high.
- Keep small:
  - exactly 3 weekly contracts,
  - one flexible weekly chest,
  - no reroll economy, no new currency.

### 2) Better Contracts + Vigor Improvements

- High impact: strengthens day-to-day return motivation and session pacing.
- Feasible: existing daily task pool and vigor systems already stable.
- Reuse: `dailies.ts`, `vigor.ts`, reward flow in `engine.ts`.
- Behavior improved: more frequent short check-ins without punishment loops.
- Risks: reward inflation and vigor becoming mandatory.
- Keep small:
  - keep 3 contracts/day,
  - add one daily "focus bonus" objective,
  - cap vigor bonus impact and preserve non-vigor viability.

### 3) Inventory QoL + Build Presets

- High impact: reduces friction in every session and enables build experimentation.
- Feasible: mostly UI + state metadata, low algorithmic risk.
- Reuse: existing inventory/equipment compare and save pipeline.
- Behavior improved: faster decisions, more gear swapping, less frustration churn.
- Risks: UI bloat in mobile layout.
- Keep small:
  - item lock flag,
  - slot/rarity filters,
  - exactly 2 build presets for MVP 2.0.

### 4) Reincarnation Upgrade Expansion (Small, Capped)

- High impact: strengthens long-term motivation after first reincarnation.
- Feasible: builds on existing Soul Mark progression model.
- Reuse: `prestige.ts`, `balance.ts`, reincarnation screen.
- Behavior improved: clearer reason to continue past first successful run.
- Risks: power creep that breaks 30-60m pacing target.
- Keep small:
  - add at most 2 new upgrades,
  - keep same currency,
  - enforce hard caps and pacing regression tests.

### 5) Forge Targeting Lite

- High impact: gives agency when RNG stalls progression.
- Feasible: reroll already exists; enhancement can be constrained.
- Reuse: `forge.ts`, `inventory.ts`, current cost formula patterns.
- Behavior improved: more sessions where players can convert resources into visible progress.
- Risks: deterministic crafting replacing loot excitement.
- Keep small:
  - improve reroll UX/transparency,
  - add one enhancement step (+1 tier style),
  - no recipe tree, no guaranteed affix crafting, no set crafting.

### Intentionally cut (and why)

- Pet system/pet progression: good long-tail idea, but too many new state/balance surfaces now.
- More classes/more regions: high content load, weak ROI for retention per dev-hour.
- Item sets: large balance and UI complexity; strong feature creep risk.
- Challenge dungeons (full): tuning and UX cost too high for MVP 2.0 window.
- Cloud save/accounts/social/PvP: backend dependency and anti-cheat burden.

## PASS 5 - Alternative Roadmap Options

### A) Retention-First Package

Features:

- Tavern contracts + weekly quests
- Better contracts + vigor improvements
- Inventory QoL + 2 build presets
- Reincarnation upgrade expansion
- Manual analytics + feedback form

Pros:

- Highest expected 3-7 day retention uplift.
- Low infra risk and high reuse.
- Strong measurement loop for next iteration.

Cons:

- Less "new shiny" feeling than big content additions.
- Forge depth improvements are lighter.

Risk: Medium-Low  
Estimated implementation complexity: Medium  
Best for: maximizing habit formation with limited time  
Why choose/not choose: choose if target is retention over novelty.

### B) Loot/Buildcraft-First Package

Features:

- Better forge upgrades
- Item enhancement
- Affix rerolling improvements
- Build presets
- Inventory QoL

Pros:

- High session-to-session dopamine from gear decisions.
- Strong alignment with ARPG loot fantasy.

Cons:

- Can become grindy without parallel weekly objective layer.
- Higher balance risk than retention-first package.

Risk: Medium  
Estimated implementation complexity: Medium-High  
Best for: players who mainly stay for gear chase  
Why choose/not choose: do not choose first if D1-D7 retention is the top KPI.

### C) Content/Progression-First Package

Features:

- Better bosses
- Region events
- Challenge dungeons (lite)
- Reincarnation upgrades
- Achievements expansion

Pros:

- Feels like visible game expansion.
- More variety in progression targets.

Cons:

- Higher content tuning burden.
- Weaker friction reduction than A/B.
- Can bloat scope quickly.

Risk: Medium-High  
Estimated implementation complexity: High  
Best for: teams with more design/content production bandwidth  
Why choose/not choose: not ideal for strict MVP 2.0 timeline.

### Final package choice

Choose **A) Retention-First Package**.

Reason:

- Best balance of retention impact, feasibility, architecture reuse, and measurement readiness.
- Most likely to increase repeat sessions without destabilizing current MVP.

## PASS 6 - Implementation Plan (Chosen Package)

### Milestone 1 - Design / Data Model

- Goal: lock exact state shape and scope caps before coding.
- Tasks:
  - define `weeklyContracts`, `weeklyProgress`, `buildPresets`, `lockedItems`, `dailyFocusBonus` schema.
  - define capped reincarnation upgrades and forge targeting-lite limits.
  - define analytics event list and feedback payload format.
- Files likely touched:
  - `src/game/types.ts`
  - `src/game/constants.ts`
  - `docs/04_CONSTANTS_AND_BALANCE.md`
  - `docs/03_DATABASE.md`
- Acceptance criteria:
  - schema changes documented and migration-safe.
  - every new field has clear owner module.
- Tests required:
  - save import/export compatibility tests for new fields.
- Cut line if time runs short:
  - cut analytics payload richness (keep minimal event counters).

### Milestone 2 - Core Logic

- Goal: implement deterministic rules for contracts/vigor/presets/reincarnation-lite/forge-lite.
- Tasks:
  - add contract generation/progress/claim rules.
  - add daily focus bonus rules and vigor tuning clamps.
  - add locked-item safeguards and preset equip validation.
  - add capped reincarnation upgrade effects.
  - add forge targeting-lite enhancement and reroll guardrails.
- Files likely touched:
  - `src/game/dailies.ts`
  - `src/game/vigor.ts`
  - `src/game/prestige.ts`
  - `src/game/forge.ts`
  - `src/game/inventory.ts`
  - `src/game/engine.ts`
  - `src/store/useGameStore.ts`
- Acceptance criteria:
  - no new non-deterministic behavior.
  - no backend dependencies introduced.
  - all caps/limits enforced by game logic.
- Tests required:
  - deterministic generation tests for contracts.
  - cap/bounds tests for vigor, reincarnation, forge enhancement.
- Cut line if time runs short:
  - remove forge enhancement step; keep reroll UX improvements only.

### Milestone 3 - UI Integration

- Goal: expose new systems clearly on mobile-first dark-only UI.
- Tasks:
  - add contract panel and weekly chest progress.
  - add daily focus indicator and vigor clarity copy.
  - add lock/filter/preset controls in inventory/hero screens.
  - add reincarnation upgrade details and next-goal hints.
  - add forge targeting-lite controls.
  - add feedback form entry point.
- Files likely touched:
  - `src/app/page.tsx`
  - `src/app/globals.css`
- Acceptance criteria:
  - no horizontal overflow at 360px.
  - all actions explain cost/result clearly.
- Tests required:
  - UI smoke coverage for new actions and disabled states.
- Cut line if time runs short:
  - ship 2 presets and lock/filter first; defer deeper UI polish.

### Milestone 4 - Tests

- Goal: protect stability and pacing with targeted regression coverage.
- Tasks:
  - add test groups for contracts, presets, lock safeguards, reincarnation caps, forge-lite.
  - add save migration/compatibility checks.
- Files likely touched:
  - `src/game/__tests__/core.test.ts` (or split modules)
  - `vitest.config.ts` (only if needed)
- Acceptance criteria:
  - all new mechanics covered by deterministic tests.
  - no regressions in existing MVP gates.
- Tests required:
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
- Cut line if time runs short:
  - keep critical-path tests; defer non-critical UI-edge tests.

### Milestone 5 - Balance Pass

- Goal: tune reward pacing without breaking first-reincarnation window.
- Tasks:
  - tune weekly/daily/forge/reincarnation reward magnitudes.
  - verify no mandatory-vigor path emerges.
  - ensure first reincarnation remains 30-60m target.
- Files likely touched:
  - `src/game/balance.ts`
  - `src/game/content.ts`
  - `docs/BALANCE_PLAN.md`
  - `docs/04_CONSTANTS_AND_BALANCE.md`
- Acceptance criteria:
  - pacing windows remain in target band.
  - no runaway currency loops.
- Tests required:
  - pacing regression suite.
  - resource sink/source sanity checks.
- Cut line if time runs short:
  - lock conservative reward values and postpone aggressive tuning.

### Milestone 6 - Playtest Pass

- Goal: validate actual player behavior change, not just feature completeness.
- Tasks:
  - run 8-12 friend playtests across first day and first week behavior.
  - collect manual analytics metrics + feedback form responses.
  - identify top 3 friction points.
- Files likely touched:
  - `docs/VISUAL_QA_CHECKLIST.md`
  - `playtest.md` (or dedicated playtest notes doc)
- Acceptance criteria:
  - clear improvement in "next-goal clarity" and return intent.
- Tests required:
  - manual scenario checklist completion.
- Cut line if time runs short:
  - run smaller pilot (4-5 testers) but keep same questionnaire.

### Milestone 7 - Release Checklist

- Goal: ship only if core loop stability and retention goals are met.
- Tasks:
  - verify all guardrails still hold (no backend/social/monetization runtime).
  - verify docs alignment (`03/04/05/06/07`).
  - finalize known-issues and cut list.
- Files likely touched:
  - `docs/06_TASKS.md`
  - `docs/07_CHANGELOG.md`
  - `docs/05_DECISIONS_LOG.md`
- Acceptance criteria:
  - release gates green; no scope leaks.
- Tests required:
  - `npm run typecheck`, `npm test`, `npm run build`
- Cut line if time runs short:
  - cut non-essential polish first, not loop-critical mechanics.

## PASS 7 - Red-Team Review

### Self-critique questions

- Is this too much?  
  Yes, if all five systems are implemented at full depth. Must enforce "lite" definitions.
- Is this actually addictive?  
  Yes, if contracts/vigor/reincarnation each provide visible short and medium-term goals.
- Does it improve retention?  
  Yes, because it explicitly targets first-day and first-week return loops.
- Does it reuse existing systems?  
  Yes; all selected features piggyback on contracts, vigor, forge, inventory, prestige, and expedition counters.
- Could this break stable MVP?  
  Yes, mainly via reward inflation and save-schema mistakes.
- Could a player understand it?  
  Only if UI copy is concise and each system explains one clear next action.
- Is there a simpler version?  
  Yes: remove forge enhancement and ship reroll UX-only.
- What should be removed first if schedule slips?  
  Remove enhancement step, keep contract + QoL + reincarnation + daily/vigor improvements.

### Revised recommendation (after red-team)

Final MVP 2.0 package remains Retention-First, but with one explicit simplification:

- **Forge Targeting Lite = reroll UX improvements first; enhancement step optional and cuttable.**

This keeps the roadmap high-impact while reducing balance and implementation risk.

## Final Recommended MVP 2.0 Scope

1. Tavern contracts + weekly quests (3 weekly objectives + 1 weekly chest).
2. Better contracts + vigor clarity/tuning (no new currency, no punishment loops).
3. Inventory QoL + 2 build presets (lock/filter/preset swap).
4. Reincarnation upgrades (max 2 new capped upgrades).
5. Forge targeting-lite (reroll clarity and optional single-step enhancement).

## Explicit Non-Goals for MVP 2.0

- Pets/pet progression.
- More regions/more classes.
- Item sets.
- Challenge dungeons (full system).
- Cloud save/accounts/social/PvP/trading.
- Runtime monetization.
