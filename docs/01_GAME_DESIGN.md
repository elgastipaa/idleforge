# 01 - Game Design (Estado Real del Código)

## Fantasía principal actual

Jugador controla **un solo héroe** en un RPG idle de expediciones:

- sale a dungeons con timer,
- resuelve recompensas determinísticas,
- mejora equipo e infraestructura,
- completa dailies,
- usa vigor como boost,
- hace reincarnación para progreso permanente.

## Referencias de diseño presentes en el proyecto

No hay referencias en código, pero sí en documentación existente (`docs/PRODUCT_SPEC.md`, `docs/2_0_definition.md` histórico):

- idle RPG timer-based,
- loot-driven progression,
- loop de reincarnación.

## Core loop actual implementado

1. Crear héroe (nombre + clase).
2. Elegir dungeon desbloqueado.
3. Iniciar expedición (opcional boost de vigor).
4. Esperar timer.
5. Resolver expedición (éxito/fracaso, XP, oro, materiales, loot).
6. Equipar / vender / salvear.
7. Craftear o mejorar ítems en Forge.
8. Subir edificios del pueblo.
9. Completar/claim dailies.
10. Reincarnar al cumplir gate (Lv18 + boss región 3).

## Sistemas existentes reales (implementados)

- Creación de héroe: nombre + clase (`warrior/rogue/mage`).
- Stats base + crecimiento por nivel.
- Pasivas por clase (niveles 5/10/15).
- 5 regiones y 20 dungeons (4 por región, boss al final).
- 1 expedición activa a la vez.
- Resolución determinística con seed.
- Loot:
  - 5 slots (`weapon/helm/armor/boots/relic`),
  - 4 rarezas,
  - afijos,
  - comparación por score.
- Inventario con cap 30 y warning desde 24.
- Overflow de loot: auto-salvage.
- Economía de ítems: equip/sell/salvage.
- Forge:
  - craft random (slot opcional + class bias),
  - upgrade de ítem (+0 a +10).
- Town con 6 edificios.
- Dailies:
  - 3 tareas diarias,
  - reset 23:00 UTC,
  - claim único.
- Vigor:
  - cap 100,
  - regen +1/5m,
  - boost de expedición (costo 20, x2 rewards).
- Offline progress:
  - cap 8h,
  - resolución expedición,
  - mine gains,
  - vigor regen,
  - reset diario.
- Reincarnación:
  - gate: nivel 18 + `curator-of-blue-fire`,
  - Soul Marks (internamente `renown`),
  - upgrades permanentes.
- Save local:
  - autosave localStorage,
  - export/import JSON,
  - validación de envelope.
- Achievements con unlock automático.

## Sistemas parcialmente implementados

- Terminología de reincarnación:
  - UI usa “Reincarnation / Soul Marks”.
  - Parte del código/tipos todavía usa nombres “prestige/renown”.
  - Funcionalmente opera, pero hay inconsistencia de naming.
- `lastOfflineSummary` existe en store pero no se renderiza en UI actual.

## Sistemas planeados (sólo porque aparecen explícitos en docs existentes)

Documentados como post-MVP en docs históricas del repo:

- razas jugables,
- pets,
- PvP/social,
- monetización runtime.

No están implementados en `src/`.

## Qué NO está implementado todavía

- Backend/API de juego.
- Cuentas de usuario.
- Cloud save.
- Multiplayer.
- Chat.
- PvP.
- Monetización activa en cliente.
- Inventario/grid drag&drop avanzado.
- Múltiples héroes.

## Principios de diseño recomendados (para seguir el estado actual)

- Simple: agregar profundidad con números/sistemas existentes, no con subsistemas nuevos.
- Adictivo: reforzar feedback del loop corto (expedición -> recompensa -> decisión).
- Timer-based/idle: mantener el corazón del juego en timers + resolución determinística.
- Modular: mantener reglas en `src/game`.
- Evitar feature creep: usar `docs/06_TASKS.md` como guardrail.
- Evitar duplicación: no reimplementar lógica de economy/dailies/vigor/save fuera de `src/game`.
