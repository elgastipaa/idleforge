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

No hay referencias en código, pero sí en documentación existente (`docs/PRODUCT_SPEC.md`, `2_0_definition.md` histórico):

- idle RPG timer-based,
- loot-driven progression,
- loop de reincarnación.

## Core loop actual implementado

1. Crear héroe (nombre + clase).
2. Elegir dungeon desbloqueado.
3. Iniciar expedición (opcional boost de vigor).
4. Esperar timer.
5. Resolver expedición con panel dedicado de resultado (éxito/fracaso, XP, oro, materiales, vigor boost, level-up, loot, comparación de equipo, boss clear y unlocks).
6. Equipar / vender / salvear.
7. Craftear o mejorar ítems en Forge.
8. Subir edificios del pueblo.
9. Completar/claim dailies.
10. Reincarnar al cumplir gate (Lv10 + boss región 3).

## Sistemas existentes reales (implementados)

- Creación de héroe: nombre + clase (`warrior/rogue/mage`).
- Stats base + crecimiento por nivel.
- Pasivas por clase (niveles 5/10/15).
- 5 regiones y 20 dungeons (4 por región, boss al final).
- 1 expedición activa a la vez.
- Resolución determinística con seed.
- Resultado visible post-claim con momentos destacados:
  primera arma garantizada, rare+ drops, boss loot, level-ups, first boss clear y desbloqueos de dungeon/región.
- Resultado post-claim compacto con una línea de rewards, chips de momentos importantes, aviso de Vigor x2, level-up destacado, achievements agrupados y rareza visible de loot.
- Siguiente acción contextual después del claim:
  equipar item mejor, intentar siguiente dungeon/boss, abrir dailies, Forge o Town.
- Feedback global de acciones:
  mensajes tipo notice/toast para errores, Forge, Town upgrades, equip/sell/salvage, dailies y reincarnation.
- Loot:
  - 5 slots (`weapon/helm/armor/boots/relic`),
  - 4 rarezas,
  - 32 afijos con stats y efectos de utilidad equipados,
  - nombres por rareza + base de slot + prefijo/sufijo de afijo,
  - comparación por Item Power, delta total, delta de stats y delta de utilidad.
- Inventario con cap 30, barra de capacidad y warning desde 24.
- Overflow de loot: auto-salvage con aviso explícito cuando inventario está lleno.
- Economía de ítems: equip/sell/salvage con valor visible de venta y materiales visibles de salvage.
- Forge:
  - craft random (slot opcional + class bias),
  - upgrade de ítem (+0 a +10),
  - salvage de inventario con retorno visible,
  - reroll de un afijo por vez desde Forge nivel 3.
- Town con 6 edificios como pilar central de progresión:
  - propósito claro,
  - costo/current/next visibles,
  - milestones por edificio,
  - feedback de estado y upgrade.
- Dailies:
  - 3 tareas diarias,
  - reset 23:00 hora local del dispositivo,
  - claim único,
  - sin streak penalties, ads, premium currency ni battle pass.
- Vigor:
  - cap 100,
  - regen +1/5m,
  - boost de expedición (base 20 vigor, x2 rewards),
  - algunos afijos equipados reducen el costo efectivo del boost.
- Offline progress:
  - cap 8h,
  - resolución expedición,
  - mine gains,
  - vigor regen,
  - reset diario.
- Reincarnación:
  - gate: nivel 10 + `curator-of-blue-fire`,
  - Soul Marks (internamente `renown`),
  - upgrades permanentes simples,
  - pantalla explica requirements, reset/persist, currency gained y por qué el siguiente run acelera,
  - barras de progreso para level gate y ruta al boss gate.
- UI/feedback:
  - texto + cards mobile-first,
  - navegación móvil horizontal compacta,
  - Next Goal visible en header, milestones y sidebar desktop,
  - empty states con flavor corto,
  - resource/Vigor chips compactos con labels cortos y números estables,
  - inventario compacto con badges, Item Power, comparación, preview de 1-2 afijos y acciones cortas,
  - Forge con filas estables para nombres largos y botones de upgrade/reroll/salvage alineados,
  - rare/epic/legendary con tratamiento visual semántico, tint/borde controlado y hover sutil,
  - sólo microfeedback CSS/Tailwind; sin sprites, canvas, motores de juego ni animaciones complejas.
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
- Achievements existen en estado y motor (`src/game/achievements.ts`), pero no hay pantalla/panel dedicado en la UI.

## Sistemas planeados (sólo porque aparecen explícitos en docs existentes)

Documentados como post-MVP en docs históricas del repo:

- razas jugables,
- pets,
- class awakening,
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
