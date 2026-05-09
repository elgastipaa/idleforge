# PLAYTEST_AUDIT.md

## Scope and Method

- Goal: external playtester-style audit of current MVP.
- Constraints respected: no app code changes, no bug fixes, no refactors, no feature additions.
- Evidence sources:
  - UI/game flow and copy from `src/app/game-view.tsx`.
  - Progression/balance/content from `src/game/*.ts`.
  - Store behavior from `src/store/useGameStore.ts`.
  - Dark theme implementation from `src/app/globals.css`.
  - Validation gate: `npm run test` (23/23 passed), `npm run typecheck` (pass), `npm run build` (pass).

## Quick Playtest Narrative

### First Impression (0-20s)

- Strong: game identity is immediate ("Relic Forge Idle", fantasy framing, class choice upfront).
- Weak: first screen is clear, but once the hero is created the amount of visible systems spikes quickly (resources, milestones, active panel, result/messaging panels, tabs).
- Likely quit trigger: perceived "too much UI at once" before first dopamine loop settles.

### First 60 Seconds

- Strong: "Start Adventure" CTA is explicit and expeditions are easy to trigger.
- Weak: too many labels and competing status widgets reduce confidence on what truly matters first.
- Core risk: players may click around tabs before locking into first loop.

### First 5 Minutes

- Strong: first loop exists and has visible progress.
- Weak: pacing jump from very short to much longer expedition durations can feel abrupt.
- Weak: "Power" and success chance relationship is never explained plainly.

### First 15 Minutes

- Strong: systems breadth is real (loot/equip/forge/town/dailies path exists).
- Weak: cognitive load is high; progression feels more spreadsheet than fantasy adventure.
- Likely quit points:
  - After first duration spike.
  - When inventory pressure appears with auto-salvage language.
  - When forge/town screens present dense decision surfaces without prioritization.

### Dimension Audit Summary

- Core loop clarity: medium.
- Visual appeal: medium-high (dark theme is cohesive).
- Mobile usability: low-medium (navigation scaling issue is severe).
- Reward excitement: medium.
- Loot clarity: medium.
- Inventory friction: medium-high.
- Forge clarity: medium-low.
- Town/base motivation: medium-low.
- Dailies/Vigor clarity: medium.
- Reincarnation motivation: medium-low in first session.
- Dark theme quality: high overall, with some signal/noise issues.
- Confusing copy: present in multiple places.
- Missing feedback: present around progression priorities.
- Boring moments: duration spikes and long read-heavy panels.

## 1. Top 10 Issues Hurting Fun

1. Early pacing spike from short to long expeditions creates idle dead zones before habit forms.
   - Evidence: `src/game/content.ts:78`, `src/game/content.ts:95`, `src/game/content.ts:113`, `src/game/content.ts:131`.
2. First-session UI is system-heavy before the player has an emotional anchor.
   - Evidence: `src/app/game-view.tsx:1989`, `src/app/game-view.tsx:1992`, `src/app/game-view.tsx:1994`, `src/app/game-view.tsx:1123`.
3. Reward moments are compact and efficient, but not dramatic enough to feel memorable.
   - Evidence: `src/app/game-view.tsx:866`, `src/app/game-view.tsx:870`, `src/app/game-view.tsx:925`.
4. Inventory full auto-salvage can feel punitive even when technically communicated.
   - Evidence: `src/app/game-view.tsx:1326`, `src/game/engine.ts:217`, `src/game/engine.ts:220`.
5. Town upgrades read as management text walls, not exciting milestones.
   - Evidence: `src/app/game-view.tsx:1543`, `src/app/game-view.tsx:1574`, `src/app/game-view.tsx:1581`.
6. Forge screen is dense and fragmented into multiple long sections.
   - Evidence: `src/app/game-view.tsx:1344`, `src/app/game-view.tsx:1399`, `src/app/game-view.tsx:1427`, `src/app/game-view.tsx:1467`.
7. Reincarnation value is clear on paper but emotionally distant in first session.
   - Evidence: `src/app/game-view.tsx:1712`, `src/game/prestige.ts:37`, `src/game/prestige.ts:49`.
8. Dailies can roll tasks mismatched to current progression stage.
   - Evidence: `src/game/dailies.ts:79`, `src/game/dailies.ts:85`, `src/game/content.ts:795`.
9. Too many medium-priority tabs compete with the main action loop.
   - Evidence: `src/app/game-view.tsx:85`, `src/app/game-view.tsx:2002`.
10. Debug balance toggle in player-facing settings can invalidate fair playtest feeling.
   - Evidence: `src/app/game-view.tsx:1853`, `src/store/useGameStore.ts:284`.

## 2. Top 10 Issues Hurting Clarity

1. "Power" is central but formula/meaning is hidden from players.
   - Evidence: `src/app/game-view.tsx:499`, `src/game/balance.ts:68`.
2. Success chance and power delta are shown, but no plain-language "how to improve" explanation nearby.
   - Evidence: `src/app/game-view.tsx:1063`, `src/app/game-view.tsx:1068`.
3. Forge "Class Bias" toggle is unclear for first-time players.
   - Evidence: `src/app/game-view.tsx:1389`.
4. Naming inconsistency across "Rebirth", "Reincarnation", "Soul Marks", and `renown`.
   - Evidence: `src/app/game-view.tsx:93`, `src/app/game-view.tsx:1729`, `src/app/game-view.tsx:1763`, `src/app/game-view.tsx:1900`.
5. Multiple feedback surfaces overlap (message panel, offline summary, expedition result) and can compete.
   - Evidence: `src/app/game-view.tsx:1992`, `src/app/game-view.tsx:1993`, `src/app/game-view.tsx:1994`.
6. Dailies reset timing is explicit but potentially non-intuitive for casual users.
   - Evidence: `src/app/game-view.tsx:1615`, `src/game/constants.ts:15`.
7. "Next Goal" is helpful but not always paired with a direct single CTA.
   - Evidence: `src/app/game-view.tsx:1102`, `src/game/expeditions.ts:114`.
8. Inventory overflow warning appears after pressure is already high.
   - Evidence: `src/app/game-view.tsx:1282`, `src/app/game-view.tsx:1321`.
9. Reincarnation gate messaging is long and heavy for first-time comprehension.
   - Evidence: `src/app/game-view.tsx:1737`, `src/app/game-view.tsx:1758`, `src/app/game-view.tsx:1771`.
10. Save/settings panel exposes advanced controls with little context separation.
   - Evidence: `src/app/game-view.tsx:1832`, `src/app/game-view.tsx:1853`, `src/app/game-view.tsx:1864`.

## 3. Top 10 UI/UX Issues

1. Mobile nav layout bug risk: 9 tabs rendered in a 5-column grid.
   - Evidence: `src/app/game-view.tsx:85`, `src/app/game-view.tsx:2001`.
2. Mobile nav labels are very small for high-frequency navigation.
   - Evidence: `src/app/game-view.tsx:2005`.
3. Header chip density is high, reducing scan speed on small devices.
   - Evidence: `src/app/game-view.tsx:503`.
4. Expeditions screen presents many cards at once without progressive disclosure.
   - Evidence: `src/app/game-view.tsx:1148`, `src/app/game-view.tsx:1158`.
5. Result panel action row can become crowded and visually noisy.
   - Evidence: `src/app/game-view.tsx:950`.
6. Forge has long repetitive card lists that increase scroll fatigue.
   - Evidence: `src/app/game-view.tsx:1404`, `src/app/game-view.tsx:1437`, `src/app/game-view.tsx:1471`.
7. Town cards are text-dense and similar-looking, which weakens discoverability.
   - Evidence: `src/app/game-view.tsx:1563`, `src/app/game-view.tsx:1574`, `src/app/game-view.tsx:1584`.
8. Dailies cards are structurally similar and can feel monotonous in visual rhythm.
   - Evidence: `src/app/game-view.tsx:1627`.
9. Settings mixes critical destructive action with normal toggles in same flow depth.
   - Evidence: `src/app/game-view.tsx:1852`, `src/app/game-view.tsx:1863`.
10. Dark theme is cohesive, but many tinted states reduce instant status readability.
   - Evidence: `src/app/globals.css:220`, `src/app/globals.css:225`, `src/app/globals.css:231`, `src/app/globals.css:241`.

## 4. Bugs or Suspicious Behavior Found

1. **Likely mobile navigation defect**: tab count and grid columns mismatch.
   - `tabs` length is 9, mobile grid is fixed 5 columns.
   - Evidence: `src/app/game-view.tsx:85`, `src/app/game-view.tsx:2001`.
2. **Potential UX bug**: dismissing generic message clears expedition result context as well.
   - `clearMessage` resets `lastExpeditionResult`.
   - Evidence: `src/store/useGameStore.ts:331`, `src/app/game-view.tsx:632`, `src/app/game-view.tsx:986`.
3. **Progression mismatch risk**: dailies can include boss task before player is realistically ready.
   - Task selection has no progression gating.
   - Evidence: `src/game/dailies.ts:79`, `src/game/content.ts:795`.
4. **Playtest integrity risk**: debug balance exposed in normal settings UI.
   - Evidence: `src/app/game-view.tsx:1853`, `src/store/useGameStore.ts:284`.
5. **Constant drift signal**: duplicate upgrade cap constants (`REINCARNATION_UPGRADE_MAX` and `RENOWN_UPGRADE_MAX`) can create future logic drift.
   - Evidence: `src/game/constants.ts:22`, `src/game/constants.ts:61`.

## 5. Suggested Fixes Ranked by Impact/Effort

| Rank | Fix | Impact | Effort | Why |
|---|---|---|---|---|
| 1 | Fix mobile nav information architecture (fewer primary tabs, overflow menu, or multi-row designed explicitly) | Very High | Medium | Immediate usability and retention gain on core device target |
| 2 | Add a strict first-session guidance rail (single "Do this now" CTA pinned until first boss) | Very High | Medium | Reduces confusion and early churn |
| 3 | Smooth early expedition duration curve (reduce sharp jump before first boss) | High | Low-Medium | Cuts dead-time boredom |
| 4 | Gate/weight dailies by progression stage | High | Medium | Prevents impossible/annoying tasks in early cycle |
| 5 | Hide debug balance behind non-playtest/dev-only condition | High | Low | Protects feedback quality from accidental cheating |
| 6 | Make reward reveal more celebratory for rare/boss moments (visual emphasis and short punch copy) | High | Medium | Improves excitement without new systems |
| 7 | Add plain-language "Power -> success chance" helper near expedition cards | Medium-High | Low | Clarifies why upgrades matter |
| 8 | Rework Forge/Town dense lists into progressive panels with defaults | Medium-High | Medium | Reduces cognitive overload |
| 9 | Improve inventory pressure UX (early warning and safer fallback than silent auto-salvage feel) | Medium | Medium | Less frustration and regret |
| 10 | Separate "critical actions" in settings (debug/reset/save import) with stronger framing | Medium | Low | Reduces user mistakes |

## 6. What Not to Add Yet

1. Multiplayer features (PvP, guilds, trading, leaderboards).
2. Backend/accounts/cloud save.
3. Monetization runtime systems (payments, ads, premium currency loops).
4. New combat rendering layer (canvas/3D/animation stack).
5. More classes or talent-tree expansion.
6. Pets/companions as a full new system.
7. Complex crafting recipes or crafting sub-economies.
8. Large story/lore progression feature.
9. Additional meta-progression currencies.
10. UI-wide visual redesign.

## 7. 30-Minute Playtest Script for Friends

1. Minute 0-2: Launch game cold. Ask player to speak thoughts aloud. Do not explain anything.
2. Minute 2-5: Character creation. Observe time to understand class differences and click "Start Adventure".
3. Minute 5-8: First expedition loop. Observe if player naturally starts and later claims without hints.
4. Minute 8-12: First loot moment. Ask player to decide equip vs sell vs salvage with no coaching.
5. Minute 12-16: Force tab exploration. Ask player to visit Hero, Inventory, Forge, Town, Dailies, Rebirth, Save.
6. Minute 16-20: Ask player to describe current top goal in one sentence.
7. Minute 20-24: Ask player to do one upgrade in Forge or Town and explain why they chose it.
8. Minute 24-27: Ask player to explain Vigor and daily reset from memory.
9. Minute 27-30: Wrap-up interview: "What made you want to continue?" and "What made you want to stop?"

Success criteria for this script:

1. Player starts first expedition in under 60 seconds.
2. Player correctly explains next goal after first claim.
3. Player can locate key tabs on mobile without frustration.
4. Player expresses at least one "that felt good" reward moment.

## 8. Specific Questions to Ask Playtesters

1. In your own words, what is the main objective right now?
2. What did you expect to happen when you pressed "Start Adventure"?
3. Was the first reward exciting, neutral, or disappointing? Why?
4. Did equip/sell/salvage choices feel obvious?
5. What does "Power" mean to you in this game?
6. Did dungeon success chance feel understandable?
7. Which tab was hardest to understand first: Forge, Town, Dailies, or Rebirth?
8. Did any button label feel misleading or too vague?
9. Did the mobile bottom navigation feel cramped or easy to use?
10. Did you notice when inventory pressure became a problem?
11. Did daily tasks feel fair for your progression stage?
12. What made you most likely to quit during this session?
13. What single change would make you come back tomorrow?
14. Which part felt most "idle RPG fun"?
15. Which part felt like work?

## 9. Recommended MVP 2.1 Priorities

1. **First-session clarity pass (highest priority)**:
   - One explicit guided sequence through first clear, first equip, first upgrade.
2. **Mobile navigation and information density pass**:
   - Fix tab architecture and reduce high-frequency scan load.
3. **Early pacing rebalance**:
   - Smooth first zone duration/reward cadence to avoid boredom spikes.
4. **Context-aware dailies**:
   - Progression-aware task eligibility and better early-day task relevance.
5. **Reward presentation upgrade**:
   - Stronger payoff moments for first weapon, first boss, rare+ drops.
6. **Forge/Town usability simplification**:
   - Progressive disclosure and clearer "best next action" recommendations.
7. **Playtest integrity controls**:
   - Remove/hide debug toggles in external testing builds.
8. **Terminology cleanup**:
   - Unify naming around Rebirth/Reincarnation and Renown/Soul Marks.

## Final Readiness Verdict for External Friend Playtests

- Status: **Playable, but not yet clarity-optimized**.
- Good enough to gather directional retention feedback from friends.
- Not yet ideal for signal-quality UX data until mobile nav and first-session clarity issues are addressed.
