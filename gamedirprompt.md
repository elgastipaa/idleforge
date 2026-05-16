Crear una especificación de implementación para redirigir el launch candidate hacia GAME_DIRECTION_2.md, usando el estado real del repo como fuente de verdad.

  Objetivo:
  Generar un archivo nuevo `GAME_DIRECTION_IMPLEMENTATION_SPEC.md` con una especificación concreta y accionable para implementar el nuevo game direction sin inventar desde cero ni
  contradecir el juego actual.

  Contexto obligatorio:
  - Leer primero `docs/00_README_AI.md`.
  - Leer `GAME_DIRECTION.md`.
  - Leer `GAME_DIRECTION_2.md`.
  - Leer docs canónicas relevantes: `docs/01_GAME_DESIGN.md`, `docs/02_ARCHITECTURE.md`, `docs/03_DATABASE.md`, `docs/06_TASKS.md`.
  - Inspeccionar el estado actual de estos archivos antes de proponer data:
    - `src/game/types.ts`
    - `src/game/state.ts`
    - `src/game/content.ts`
    - `src/game/town.ts`
    - `src/game/dailies.ts`
    - `src/game/caravan.ts`
    - `src/game/events.ts`
    - `src/game/outposts.ts`
    - `src/game/progression.ts`
    - `src/app/game-view.tsx`
    - `src/store/useGameStore.ts`

  Restricciones:
  - No implementar código todavía.
  - No cambiar balance real todavía.
  - No inventar sistemas que contradigan el engine actual.
  - Usar los sistemas existentes como base: expeditions, town, construction, caravan, outposts, boss prep, dailies, weekly quest, events, collections, mastery, reincarnation.
  - Si una propuesta requiere cambio de engine/save/tests, marcarlo explícitamente.
  - Si una propuesta puede hacerse solo con UI/copy usando datos actuales, marcarlo explícitamente.
  - No proponer PvP, backend, chat, cloud save obligatorio, gacha, monetización ni city grid libre.
  - La decisión de city/base es: Guildhall Slot Grid sí; freeform city grid no.

  Archivo a crear:
  `GAME_DIRECTION_IMPLEMENTATION_SPEC.md`

  Estructura requerida:

  # GAME_DIRECTION_IMPLEMENTATION_SPEC.md

  ## 1. Principios de implementación
  Explicar cómo traducir `GAME_DIRECTION_2.md` al juego actual sin reescribir todo.

  ## 2. Estado actual reutilizable
  Tabla de sistemas existentes y cómo se reutilizan:
  - Town/buildings
  - Construction
  - Expeditions
  - Regions
  - Boss prep
  - Caravan
  - Outposts
  - Dailies/weekly
  - Events
  - Collections
  - Mastery
  - Reincarnation

  Columnas:
  Sistema actual | Archivos actuales | Qué aporta al nuevo direction | Gap actual | Riesgo

  ## 3. Guildhall Slot Grid Spec
  Definir una city grid lite basada en slots, no drag/drop.

  Incluir:
  - Regla general: edificios únicos en launch.
  - No roads.
  - No decoraciones.
  - No repetición funcional.
  - Cómo interpretar edificios nivel 0.
  - Qué se puede hacer solo UI/copy.
  - Qué requiere engine/save.

  Incluir tabla:
  Slot id | Posición visual | Building | Estado inicial | Unlock condition | Acción inicial | Copy sugerido | Requiere engine?

  Debe contemplar al menos:
  - Guildhall central
  - Forge
  - Mine
  - Tavern
  - Library
  - Market
  - Caravan Yard
  - War Room
  - Shrine

  ## 4. Building Unlock & Construction Plan
  Definir orden recomendado de construcción y desbloqueo para los primeros 30-60 minutos.

  Incluir tabla:
  Momento | Trigger | Building/feature | Estado antes | Estado después | Por qué importa | Archivos afectados

  Debe usar la lógica actual si existe. Si no existe lock real, marcar “UI-only recommended for launch” o “engine required”.

  ## 5. Command Center Spec
  Definir tarjetas, prioridad y reglas de “next best action”.

  Incluir:
  - Qué tarjetas aparecen siempre.
  - Qué tarjetas aparecen condicionalmente.
  - Prioridad de recomendaciones.
  - Inputs desde el estado actual.
  - Outputs de UI.

  Incluir tabla:
  Priority | Condition | Recommendation | CTA | Source/helper actual | Fallback

  ## 6. Frontier Map v0 Spec
  Definir cómo se muestran regiones como frentes.

  Incluir tabla:
  Region | Material | Boss | Outpost status | Main loop | Recommended action | Existing helpers/data | Missing data

  Usar las 5 regiones actuales del juego.

  ## 7. Orders Board Spec
  Definir cómo unificar:
  - Daily missions
  - Weekly quest
  - Event tiers
  - Mastery claimables
  - Construction ready
  - Caravan ready
  - Boss prep suggestions

  Incluir:
  - Sorting rules.
  - Qué se muestra como claimable.
  - Qué se muestra como progress.
  - Qué se oculta.
  - Qué hacer con `complete_caravan`.
  - Qué hacer con `weekly.progress` legacy.

  ## 8. Guild Report Spec
  Definir el reporte al volver o reclamar.

  Incluir:
  - Offline report.
  - Expedition result report.
  - Caravan/construction ready.
  - Event participation.
  - Collection/pity.
  - Next recommended action.

  Marcar qué existe hoy y qué falta.

  ## 9. First-session Script
  Diseñar el recorrido de:
  - Primer minuto.
  - Minuto 2-5.
  - Minuto 5-15.
  - Minuto 15-30.
  - Primer retorno después de 30-60 min.
  - Primer día.

  Debe mapear cada paso a sistemas existentes o gaps.

  ## 10. Implementation Phases
  Separar en fases:

  ### Phase A - UI/copy only
  Cambios sin tocar engine/save/tests.

  ### Phase B - Small engine fixes
  Cambios chicos con tests.

  ### Phase C - Launch polish
  Eventos, mobile, copy, acceptance criteria.

  Para cada item:
  Cambio | Valor | Riesgo | Archivos | Tests necesarios | Dependencias

  ## 11. Acceptance Criteria
  Checklist final para saber si está listo para implementar.

  Debe incluir:
  - 5-second clarity.
  - First-session hook.
  - Return hook.
  - Daily hook.
  - Base ownership hook.
  - No broken promises.
  - Mobile viable.
  - No scope creep.

  ## 12. Open Questions
  Lista corta de decisiones que todavía habría que confirmar antes de codear.

  Formato:
  Pregunta | Opción recomendada | Alternativas | Riesgo si no se decide

  Output:
  - Crear el archivo `GAME_DIRECTION_IMPLEMENTATION_SPEC.md`.
  - No modificar otros archivos salvo que sea estrictamente necesario.
  - Al final, responder con resumen breve de qué quedó especificado y qué decisiones siguen abiertas.