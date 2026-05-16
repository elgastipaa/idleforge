# 06 - Tasks (Estado Real y Próximos Pasos)

## Fase actual inferida

**Fase actual: Phase 9 local-first activada (polish sin backend).**

Referencia de roadmap operativo: `docs/design/implementation_4_2_1.md`.

- Phases 0-8: implementadas en código.
- Phase 9: implementada en slice local-first (primer evento + banner + reward schedule + notificaciones opcionales por opt-in para completions).

## Update de estado (2026-05-16)

- `main` incluye `Implement launch candidate phase 8` + commit de estabilización posterior.
- Suite actual: `59` tests en `src/game/__tests__/core.test.ts`, todos passing.
- Branch limpio y sincronizado con `origin/main`.

## Qué está implementado

- Engine determinístico end-to-end (`src/game`).
- Loop completo expedición -> claim -> decisiones de build -> progreso permanente.
- Focus reemplazando vigor:
  - cap base 200,
  - regen 1/15m,
  - boost de claim,
  - gasto en boss prep/scout/construcción.
- Account Rank, Mastery tiers y recompensas permanentes por ruta.
- 5 regiones activas con materiales regionales y progression rewards por fase.
- Boss layer con amenazas, scout/prep, cobertura por traits y failure intel.
- Collections + pity + completion rewards.
- Region diaries tier 1 y recompensas persistentes.
- Outposts con bonus seleccionable por región.
- Town persistente con construcción (timer, aceleración por Focus, claim/cancel).
- Caravan regional + Caravan Mastery.
- Traits/families + resonance + codex + build presets + item locking.
- Reincarnation/class-change rules (early free respec + post-rebirth flow).
- Account Showcase local y trofeos/títulos.
- Evento Phase 9 activo:
  - participación no punitiva por expedición,
  - banner de evento con tiers y claims,
  - bonuses temporales de evento (sin poder permanente exclusivo).
- Notificaciones opcionales por permiso explícito:
  - sólo para completion de Construction/Caravan,
  - no requeridas para progresión.
- Save/import/export/reset con normalización de saves legacy.

## Riesgos y deuda técnica vigente

1. `src/app/game-view.tsx` sigue siendo un archivo grande de UI.
2. Naming mixto interno (`prestige/renown`) vs copy de producto (`Reincarnation/Soul Marks`).
3. Doble constante de max upgrade (`RENOWN_UPGRADE_MAX` vs `REINCARNATION_UPGRADE_MAX`).
4. Cobertura de tests concentrada en un solo archivo grande (`core.test.ts`).

## Próximas tareas recomendadas (ordenadas)

1. **Rotación de eventos (Phase 9+):**
   definir calendario y variaciones de eventos sin introducir FOMO punitivo ni recompensas exclusivas de poder permanente.
2. **Modularización UI:**
   extraer slices de `game-view.tsx` para reducir riesgo de regresión en cambios de contenido.
3. **Convergencia de naming permanente:**
   alinear naming interno con copy externa (`focus/soul marks/reincarnation`) en tipos/constantes.
4. **Desagregar suite de tests:**
   separar `core.test.ts` por dominio (`progression`, `bosses`, `caravan`, `save`, etc.).

## Active Task (única recomendada)

**Active Task:** estabilización post-Phase-9 (event polish + deuda técnica UI/test).

Entregables:

- estado actual reflejado en docs canónicas (`00..07`),
- fase implementada y recortes opcionales explícitos,
- decisiones/changelog alineados con commits recientes,
- checklist manual actualizado para sistemas de Phase 5-9.

## Do Not Build Yet

- backend/cloud save obligatorio,
- PvP/multiplayer/chat,
- monetización runtime,
- push/eventos como dependencia de progresión.
