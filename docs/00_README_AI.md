# 00 - README AI (Reglas Operativas)

Este es el primer documento que toda IA debe leer antes de tocar el proyecto.

## Fuente de verdad canónica

- La fuente de verdad de planificación está en `docs/`.
- El flujo primario de trabajo es la serie `docs/00..07`.
- Si un archivo de raíz del repo (por ejemplo `2_0_definition.md`) contradice `docs/`, prevalece `docs/`.
- Los archivos de raíz se tratan como contexto histórico, no como fuente canónica.

## Orden obligatorio de lectura

1. `docs/00_README_AI.md`
2. `docs/02_ARCHITECTURE.md`
3. `docs/03_DATABASE.md`
4. `docs/04_CONSTANTS_AND_BALANCE.md`
5. `docs/01_GAME_DESIGN.md`
6. `docs/06_TASKS.md`
7. `docs/05_DECISIONS_LOG.md`
8. `docs/07_CHANGELOG.md`

## Reglas para modificar código

- No inventar features que no existan en el código actual.
- No tocar lógica de juego desde UI (`src/app`) ni desde store (`src/store`) si debe vivir en `src/game`.
- Mantener cambios chicos, focalizados y verificables.
- Evitar renombrados masivos o refactors grandes dentro de tareas de feature.
- No duplicar sistemas existentes (por ejemplo: no crear otra implementación de dailies/vigor/save).

## Reglas para mantener arquitectura

- Lógica determinística del juego: `src/game/*`.
- Orquestación de estado e hidratación/persistencia: `src/store/useGameStore.ts`.
- Presentación UI: `src/app/game-view.tsx` (usado por `src/app/page.tsx`).
- Si agregás una feature, primero extendé tipos y lógica en `src/game`, después store, y recién al final UI.

## Reglas para no romper arquitectura ni duplicar sistemas

- Antes de crear un archivo nuevo, revisar si ya existe un lugar correcto para esa lógica.
- Antes de crear una constante, revisar `src/game/constants.ts` y `src/game/content.ts`.
- Antes de crear persistencia, revisar `src/game/save.ts` y store.
- Antes de agregar progreso temporal, revisar `updatedAt`, `applyOfflineProgress`, `ensureDailies`, `regenerateVigor`.

## Flujo obligatorio de trabajo (antes/durante/después)

### Antes de programar

1. Leer `docs/00_README_AI.md`.
2. Leer docs específicas del área a tocar.
3. Revisar el código existente relacionado.
4. Resumir el plan.
5. Listar archivos a modificar.

### Durante

1. Hacer cambios chicos.
2. No duplicar lógica.
3. No crear sistemas paralelos.
4. Mantener UI separada de lógica.
5. Respetar la arquitectura actual.

### Después

1. Listar archivos modificados.
2. Explicar qué cambió.
3. Actualizar docs afectadas.
4. Actualizar `docs/06_TASKS.md`.
5. Actualizar `docs/07_CHANGELOG.md`.
6. Si hubo decisión importante, actualizar `docs/05_DECISIONS_LOG.md`.

## Reglas obligatorias de documentación viva

- Después de cada cambio que afecte estructura, gameplay, datos, constantes, persistencia, tipos, rutas, componentes principales, servicios o economía, **actualizar la documentación correspondiente**.
- Si cambia estructura de carpetas: actualizar `docs/02_ARCHITECTURE.md`.
- Si cambia balance (timers/rewards/stats/costos/drop rates): actualizar `docs/04_CONSTANTS_AND_BALANCE.md`.
- Si cambia persistencia/modelo de datos guardado: actualizar `docs/03_DATABASE.md`.
- Si cambia una tarea: actualizar `docs/06_TASKS.md`.
- Si se completa una tarea relevante: actualizar `docs/07_CHANGELOG.md`.
- Si se toma una decisión importante: registrar en `docs/05_DECISIONS_LOG.md`.

## Guardrails de alcance

- No backend.
- No auth.
- No multiplayer.
- No chat/PvP.
- No monetización en runtime MVP.
- No canvas/3D/sprites.

## Prompt recomendado para futuras conversaciones con Codex

Usar este prompt base:

```md
Leé primero docs/00_README_AI.md y seguí su flujo obligatorio.

Objetivo:
[describir objetivo concreto]

Restricciones:
- No inventar features.
- Respetar arquitectura actual (`src/game` lógica, `src/store` orquestación, `src/app` UI).
- Cambios chicos y focalizados.

Antes de implementar:
1) Resumí el plan.
2) Listá archivos a tocar.

Después de implementar:
1) Listá archivos modificados.
2) Ejecutá validación relevante (typecheck/tests/build cuando corresponda).
3) Actualizá docs afectadas (`02`, `03`, `04`, `05`, `06`, `07` según impacto).
```
