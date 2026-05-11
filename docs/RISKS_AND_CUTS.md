# Relic Forge Idle - Risks And Cuts

## Key Risks

Risk 1: Scope creep via MMO-like feature expansion.

- Mitigation: enforce strict MVP list and non-goals.

Risk 2: Reincarnation pacing misses 30-60 minute target.

- Mitigation: keep explicit progression gates and debug mode metrics.

Risk 3: Forge system complexity expands beyond MVP.

- Mitigation: lock forge to salvage + random craft + item upgrade only.

Risk 4: Contracts feel punitive or manipulative.

- Mitigation: fixed 3 tasks, no streak punishment, moderate rewards.

Risk 5: Inventory frustration from low capacity.

- Mitigation: warning threshold and clear salvage/sell UX.

Risk 6: Formula ambiguity causes implementation drift.

- Mitigation: keep formula term definitions in `BALANCE_PLAN.md` and reference them from tests.

Risk 7: Cross-doc mismatch on reincarnation gate.

- Mitigation: treat `level 10 + region 3 boss` as canonical and verify during release checklist.

## Mandatory Locks

- Inventory is 30 for MVP.
- Contracts reset at 23:00 local.
- Vigor is free-only in MVP.

## Cut Ladder (If Schedule Slips)

1. Remove login bonus layer, keep contracts only.
2. Simplify reward summary flavor text.
3. Simplify forge preview UI (not mechanics).
4. Reduce Awards UI detail if needed.
5. Keep Awards unlock tracking; cut only non-critical polish.

Do not cut:

- Reincarnation.
- Contracts.
- Class passives.
- Offline caps.
- Save import/export.

## Done When

- Risks are explicit and cut policy preserves core loop integrity.

## Actual MVP Cuts (2026-05-07)

- No login bonus layer beyond contracts (kept intentionally cut).
- Forge remains single-step random craft + direct upgrade (no recipe tree, no reroll).
- Achievements are passive unlock-only (no separate claim economy).
