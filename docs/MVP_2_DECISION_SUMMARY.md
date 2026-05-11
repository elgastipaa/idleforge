# MVP 2.0 Decision Summary

Date: 2026-05-09

## 1. Final Recommended MVP 2.0 Scope

- Tavern contracts + weekly quests (3 weekly contracts + 1 weekly chest).
- Better contracts + vigor improvements (focus bonus + clarity + capped reward impact).
- Inventory QoL + 2 build presets (item lock, filters, quick preset swap).
- Reincarnation upgrade expansion (max 2 new upgrades, hard-capped).
- Forge targeting-lite (reroll transparency first, optional single-step enhancement).

## 2. Top 5 Features To Build

1. Tavern contracts + weekly quests
2. Better contracts + vigor improvements
3. Inventory QoL + build presets
4. Reincarnation upgrades (small and capped)
5. Forge targeting-lite

## 3. Top 5 Features To Explicitly Avoid (Now)

1. Backend/accounts/cloud save
2. Real PvP/guilds/leaderboards/trading/auction house
3. More classes + item sets
4. Pet system + pet progression
5. Full challenge dungeon system / major content-volume expansion

## 4. Why This Is The Highest Bang-for-Buck Path

- Targets first-day and first-week retention directly, not indirectly.
- Reuses existing stable systems (`dailies.ts`/Contracts, `vigor`, `forge`, `inventory`, `prestige`) instead of building new infrastructure.
- Reduces friction in every session (inventory/presets) while adding medium-term goals (contracts/reincarnation).
- Keeps scope cuttable: forge enhancement can be removed without breaking core package.
- Enables measurement for next decisions (manual analytics + feedback loop in implementation plan).

## 5. 3-Day Version

- Contracts core (3 weekly + chest).
- Inventory lock/filter + one preset.
- Reincarnation UI clarity pass (no new upgrades yet).

## 6. 7-Day Version

- Full contracts + weekly quests.
- Better contracts + vigor tuning.
- Inventory QoL + 2 presets.
- Reincarnation upgrade expansion.
- Forge reroll transparency improvements.

## 7. 14-Day Version

- Everything in 7-day version.
- Optional forge single-step enhancement (only if pacing remains healthy).
- Playtest pass with manual metrics + feedback form review.
- Balance hardening and cut-line cleanup.

## 8. First Implementation Prompt To Use After Approval

```md
Read first: `docs/00_README_AI.md`, `docs/02_ARCHITECTURE.md`, `docs/03_DATABASE.md`, `docs/04_CONSTANTS_AND_BALANCE.md`, `docs/06_TASKS.md`, `docs/05_DECISIONS_LOG.md`, `docs/MVP_2_ROADMAP.md`, `docs/MVP_2_DECISION_SUMMARY.md`.

Goal:
Implement MVP 2.0 Retention-First package exactly as documented.

Scope (must implement):
1) Tavern contracts + weekly quests
2) Better contracts + vigor improvements
3) Inventory QoL + 2 build presets
4) Reincarnation upgrade expansion (max 2 new upgrades)
5) Forge targeting-lite (reroll clarity first; enhancement optional and cuttable)

Constraints:
- No backend/auth/cloud save/social/PvP/trading/ads/payments.
- Keep dark-only, mobile-first UI.
- Reuse existing architecture (`src/game` logic, `src/store` orchestration, `src/app/page.tsx` UI).
- Keep deterministic behavior and save compatibility.

Execution order:
- Milestone 1: data model/constants/docs updates
- Milestone 2: core game logic
- Milestone 3: UI integration
- Milestone 4: tests
- Milestone 5: balance pass
- Milestone 6: playtest pass
- Milestone 7: release checklist

Required validation:
- `npm run typecheck`
- `npm test`
- `npm run build`

Documentation updates required:
- `docs/03_DATABASE.md`
- `docs/04_CONSTANTS_AND_BALANCE.md`
- `docs/05_DECISIONS_LOG.md`
- `docs/06_TASKS.md`
- `docs/07_CHANGELOG.md`
```
