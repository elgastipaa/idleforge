# Relic Forge Idle - Testing Plan

## Test Strategy

Priorizar simulación determinística del dominio (`src/game`) y usar UI checks como smoke/manual QA.

## Current Automated Baseline

- Runner: Vitest
- Suite actual: `src/game/__tests__/core.test.ts`
- Cobertura funcional (snapshot): 59 tests

## Required Unit Coverage Areas

- Inicialización de estado + normalización de saves legacy.
- RNG determinístico y ausencia de `Math.random` en dominio.
- Reglas de unlock de dungeons/regiones.
- Start/resolve/claim de expediciones.
- Mastery tiers y account rank progression.
- Focus regen/cap/spend (claim boost + sinks relevantes).
- Boss systems:
  - scout,
  - prep,
  - threat coverage,
  - failure intel.
- Region materials, sinks, outposts y completion summaries.
- Collections:
  - eligibility,
  - pity,
  - completion rewards.
- Region diaries task tracking + claim.
- Caravan:
  - start/cancel/claim,
  - reward scaling,
  - mastery tiers.
- Construction:
  - start,
  - accelerate,
  - cancel,
  - claim.
- Reincarnation/class-change rules.
- Inventory/forge/trait/family/preset interactions.
- Dailies/weekly contracts/weekly quest reset behavior.
- Events:
  - active banner summary visibility,
  - temporary event multipliers,
  - non-punitive participation progression,
  - reward tier claiming and duplicate-claim protection.
- Save export/import validation and migration safety.

## Determinism Assertions

- Mismo seed + mismo estado + mismo run id => mismo resultado.
- Fallos de import o acciones inválidas no mutan estado.
- Recompensas y progresión dependen solo de inputs de estado/tiempo/RNG seeded.

## Integration / Manual Smoke

- Flujo nueva partida -> primer clear -> start again.
- Primer boss con scout/prep/intel visible.
- Flujo de construcción y Caravan con retorno offline.
- Unlock + claim de milestones (mastery, colección, diario, outpost).
- Rebirth + class change path.

Checklist operativo manual: `docs/manual_test_phase_5_6.md`.

## Build Gates

- `npm test`
- `npm run typecheck`
- `npm run build`

## Done When

- Sistemas core de Phase 0-9 local-first están cubiertos por regresión automatizada.
- Futuros cambios opcionales (cloud showcase/push real) no deben alterar invariantes determinísticos de progresión local.
- Cambios de balance/estado se acompañan con actualización de tests y docs.
