# 06 - Tasks (Estado Real y Próximos Pasos)

## Fase actual inferida

**Fase: hardening y mantenimiento de v1.0 local-first.**

El juego está jugable end-to-end en cliente y ya incluye la mayoría de sistemas core.

## Qué está implementado

- Core deterministic engine en `src/game`.
- Hero creation + clases + progresión por niveles.
- Loop de expedición completo (start/resolve/recompensas/loot).
- Inventario, equip/sell/salvage.
- Forge (craft + upgrade).
- Town (6 edificios, costos y efectos).
- Dailies (3/día, reset UTC, claim).
- Vigor (regen/cap/boost).
- Offline progress cap 8h.
- Reincarnación + upgrades permanentes.
- Save/export/import/reset local.
- UI multi-pantalla responsive en `page.tsx`.
- Tests unitarios base (`src/game/__tests__/core.test.ts`).

## Qué parece incompleto o mejorable

1. Arquitectura UI monolítica:
   - `src/app/page.tsx` concentra todas las pantallas.
2. Inconsistencia de naming:
   - `prestige/renown` (interno) vs `reincarnation/Soul Marks` (UI).
3. Constantes duplicadas de upgrade max (`RENOWN_UPGRADE_MAX` vs `REINCARNATION_UPGRADE_MAX`).
4. Falta suite de tests separada por módulos (actualmente un único test file grande).
5. `lastOfflineSummary` no se explota visualmente en detalle.

## Bugs/riesgos detectados

- Riesgo de drift de balance por hardcodes distribuidos (`engine.ts`, `loot.ts`, `forge.ts`, `offline.ts`).
- Riesgo de mantenimiento por `page.tsx` extenso.
- Riesgo semántico por naming mixto (puede generar errores en cambios de economía).
- Riesgo de compatibilidad de saves futuros por ausencia de migrador explícito multi-versión.

## Próximas tareas recomendadas (ordenadas)

1. **Refactor de UI por slices sin tocar gameplay**:
   extraer pantallas de `page.tsx` a componentes por dominio.
2. **Unificar naming interno de progreso permanente**:
   elegir convención única (`reincarnation/soulMarks` o `prestige/renown`) y documentar migración.
3. **Consolidar constantes de balance en tablas dedicadas**:
   minimizar hardcodes repetidos.
4. **Expandir tests**:
   separar por módulo (`engine`, `dailies`, `save`, `forge`, `prestige`).
5. **Mejorar UX de reporte offline**:
   mostrar resumen completo de mine/vigor/dailies en UI.

## Do Not Build Yet (evitar feature creep)

- Backend o cloud save.
- Multiplayer/PvP/chat.
- Monetización runtime (ads, compras, premium currency).
- Sistema de pets/races/set items/awakenings.
- Nuevos modos de combate visual (canvas/3D/sprites).

## Active Task (única recomendada)

**Active Task:** extraer `src/app/page.tsx` en componentes por pantalla (`Expeditions`, `Hero`, `Inventory`, `Forge`, `Town`, `Dailies`, `Reincarnation`, `Settings`) sin cambiar lógica de juego.

Resultado esperado:

- misma funcionalidad,
- menor riesgo de regresiones UI,
- base más limpia para iteraciones futuras.
