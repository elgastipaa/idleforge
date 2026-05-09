# 06 - Tasks (Estado Real y Próximos Pasos)

## Fase actual inferida

**Fase: UX Cohesion Audit - Phase 3 implementada.**

## Strategic Planning Update (2026-05-09)

- Created `docs/MVP_2_ROADMAP.md` as the proposed MVP 2.0/2.1 evolution plan.
- Recommended MVP 2.0 package (scope-capped to 5 major improvements):
  - Weekly contracts,
  - dungeon mastery + boss milestones,
  - forge orders,
  - build presets + inventory QoL,
  - reincarnation milestone track.
- Explicitly kept backend/accounts/PvP/guilds/trading/monetization runtime out of MVP 2.0 scope.

## Strategic Planning Update (2026-05-09, Re-Iteration)

- Deep second-pass strategy review completed in:
  - `docs/MVP_2_ROADMAP.md`
  - `docs/MVP_2_DECISION_SUMMARY.md`
- Final recommended MVP 2.0 package stays scope-capped to 5 major improvements:
  - Tavern contracts + weekly quests,
  - better dailies + vigor improvements,
  - inventory QoL + 2 build presets,
  - reincarnation upgrade expansion (small and capped),
  - forge targeting-lite (reroll clarity first, enhancement optional/cuttable).
- Explicit package comparison and red-team review were added to reduce scope creep risk before implementation.

El juego está jugable end-to-end en cliente y ya incluye la mayoría de sistemas core.

## Qué está implementado

- Core deterministic engine en `src/game`.
- Hero creation + clases + progresión por niveles.
- Loop de expedición completo (start/resolve/recompensas/loot).
- Navegación de expediciones por regiones en dos niveles:
  vista inicial con carrusel horizontal de regiones (scroll snap) y vista secundaria con expediciones filtradas por región + acción de volver.
- Ajuste visual de `RegionCard` en hover:
  énfasis en borde/ring/sombra sin lavado de fondo para mantener legibilidad.
- Scroll snap horizontal de regiones/expediciones corregido en desktop:
  `snap-x snap-mandatory` aplicado al contenedor con `overflow-x-auto`.
- Navegación de subviews tipo "subtabs + swipe" en pantallas con secciones:
  `Hero`, `Forge` y `Reincarnation` usan barra de subtabs global bajo header + navegación horizontal con snap en el contenido central.
- Resultado dedicado de expedición después de claim:
  éxito/fracaso, XP, oro, materiales, vigor boost, level-up, loot, comparación contra equipo actual, boss clear y unlocks.
- Resultado/reward reveal dedicado y compacto:
  una línea de XP/oro/materiales, flavor corto, Vigor x2 visible, chips de level-up/Awards/unlocks y loot appraisal resumido.
- Momentos especiales destacados en el resultado:
  primera arma garantizada, rare+ drops, boss loot, level-ups, first boss clear y region unlock.
- Siguiente acción contextual después del claim:
  equipar item mejor, empezar siguiente dungeon/boss, abrir dailies, Forge o Town.
- Notices tipo toast/card para acciones importantes:
  Forge/craft/reroll/upgrade, Town building upgrade, equip/sell/salvage, dailies, reincarnation y errores.
- Loot MVP 2.0:
  32 afijos con efectos de utilidad equipados, mejor naming, mejor escalado de rareza, rare/epic/legendary con tratamiento visual diferenciado.
- Comparación de equipo:
  Item Power, delta total, delta de stats y delta de utility score.
- Inventario, equip/sell/salvage con valores visibles, barra de capacidad y warning de inventario lleno/near-full.
- Forge MVP 2.0:
  craft por slot, upgrade de item level, salvage con retorno visible, reroll de un afijo desde Forge nivel 3 y conexión visible entre nivel de edificio y poder de crafting.
- Forge segmentado por modos (`Craft` / `Upgrade` / `Advanced`) con una superficie visible por vez.
- Town MVP 2.0:
  cada edificio muestra propósito, costo, beneficio actual, próximo beneficio, milestones y feedback contextual sin decoración/base placement.
- Town en modo compacto por defecto (propósito/nivel/costo/CTA) con detalles expandibles on-demand.
- Overlays en modo de prioridad única (resultado > offline > mensaje) para evitar stacks simultáneos.
- Offline Summary compactado en una única tarjeta con 4 filas densas (Expedition/Mine/Vigor/Dailies) y copy de tiempo transcurrido (`Away for ...`).
- Hero y Reincarnation con subviews segmentadas compactas por defecto.
- Town (6 edificios, costos y efectos).
- Dailies (3/día, reset local, progreso claro, claim único, sin streak punishment).
- Vigor (regen/cap/reward diario) y boost integrado en claim de expedición (`Claim x2 · Vig -cost`).
- Offline progress cap 8h.
- Reincarnación + upgrades permanentes.
- Reincarnation progress visible con barras para level gate y boss route.
- Save/export/import/reset local.
- Achievements en estado/lógica (unlock y progreso).
- Textos visibles de edificios alineados con fórmulas reales y cubiertos por test.
- Tests de regresión para affix coverage/effects, comparación inicial y auto-salvage.
- Dark mode global no invasivo con toggle, `data-theme` y preferencia en `localStorage`.
- Dark mode de rarezas con clases semánticas, tint/borde controlado y glow reducido para rare/epic/legendary.
- Resource/Vigor header compacto con chips de ancho estable, labels cortos y números truncables.
- Inventario compacto:
  badges de rareza/slot, nombre clampado, Item Power, comparación, stats principales, preview de 1-2 afijos y acciones cortas.
- Forge con filas de upgrade/reroll/salvage que reservan espacio para botones y truncan nombres largos.
- UI multi-pantalla responsive en `game-view.tsx`.
- Mobile nav compacta horizontal con estado activo y safe-area bottom.
- Empty states con copy de fantasy para pack vacío/filtros y expedición inactiva.
- Microfeedback visual con clases CSS livianas (`feedback-pop`, `rarity-glow`) y respeto por `prefers-reduced-motion`.
- Tests unitarios base (`src/game/__tests__/core.test.ts`).
- MVP 2.0 balance pass:
  first expedition/loot ~0.33m, first Town upgrade ~1.5m, first craft/boss ~15m, first reincarnation ~45-57m in representative no-Vigor sims.

## Qué parece incompleto o mejorable

1. Arquitectura UI monolítica:
   - `src/app/game-view.tsx` concentra todas las pantallas.
2. Inconsistencia de naming:
   - `prestige/renown` (interno) vs `reincarnation/Soul Marks` (UI).
3. Constantes duplicadas de upgrade max (`RENOWN_UPGRADE_MAX` vs `REINCARNATION_UPGRADE_MAX`).
4. Falta suite de tests separada por módulos (actualmente un único test file grande).
5. Falta separar `game-view.tsx` por módulos de pantalla para reducir riesgo de mantenimiento.
6. Persisten oportunidades de revisión visual automatizada para 360/390/430 con checks reproducibles.
7. Persisten decisiones de naming interno (`prestige/renown`) vs copy externa (`Reincarnation/Soul Marks`) pendientes de convergencia.

## Bugs/riesgos detectados

- Riesgo de drift de balance por hardcodes distribuidos (`engine.ts`, `balance.ts`, `affixes.ts`, `loot.ts`, `forge.ts`, `offline.ts`).
- Riesgo de mantenimiento por `game-view.tsx` extenso.
- Riesgo semántico por naming mixto (puede generar errores en cambios de economía).
- Riesgo de compatibilidad de saves futuros por ausencia de migrador explícito multi-versión.
- Riesgo de que futuros cambios de fórmulas vuelvan a desalinear textos si no actualizan tests/docs.

## Próximas tareas recomendadas (ordenadas)

1. **Refactor de UI por slices sin tocar gameplay**:
   extraer pantallas de `game-view.tsx` a componentes por dominio.
2. **Unificar naming interno de progreso permanente**:
   elegir convención única (`reincarnation/soulMarks` o `prestige/renown`) y documentar migración.
3. **Consolidar constantes de balance en tablas dedicadas**:
   minimizar hardcodes repetidos.
4. **Expandir tests**:
   separar por módulo (`engine`, `dailies`, `save`, `forge`, `prestige`).
5. **Centralizar textos/fórmulas de edificios**:
   reducir la necesidad de sincronizar manualmente `BUILDINGS.effectText` con balance.

## Do Not Build Yet (evitar feature creep)

- Backend o cloud save.
- Multiplayer/PvP/chat.
- Monetización runtime (ads, compras, premium currency).
- Sistema de pets/races/set items/class awakenings.
- Árboles complejos de prestige, múltiples capas de prestige o awakening classes en MVP.
- Nuevos modos de combate visual (canvas/3D/sprites).

## Tareas completadas recientes

1. **MVP 2.0 loot upgrade**:
   - 32 afijos significativos,
   - efectos equipados en balance,
   - mejor naming de ítems,
   - rareza y rare/epic/legendary mejorados,
   - comparación con stat deltas y utility delta,
   - decisiones equip/sell/salvage más claras,
   - warnings de inventario lleno,
   - resumen de reward/loot más claro.
2. **MVP 2.0 Forge core upgrade**:
   - salvage desde Forge con materiales visibles,
   - craft random por slot con costo claro,
   - upgrade de item level con costo claro,
   - reroll de un afijo por vez desbloqueado por Forge nivel 3,
   - pantalla Forge con nivel, item stat budget y feedback de resultado.
3. **MVP 2.0 Town/base polish**:
   - metadata de propósito y milestones por edificio,
   - tarjetas mobile-first con current/next/cost,
   - feedback específico para Forge, Mine, Tavern, Market, Library y Shrine,
   - política explícita de no decoración, city placement ni base-building visuals.
4. **MVP 2.0 reincarnation/prestige polish**:
   - gate nivel 10 + `curator-of-blue-fire`,
   - pantalla explica requirements, reset/persist, Soul Marks earned y tradeoff,
   - upgrades permanentes muestran efecto actual/próximo/costo,
   - pacing validado: 30-60m producción y 5-10m debug/dev,
   - class awakening documentado como post-MVP.
5. **MVP 2.0 dailies/vigor polish**:
   - reset diario a las 23:00 UTC,
   - UI con progreso, claim, reward y timer UTC,
   - reward de vigor clampado al cap,
   - boost de Vigor aplicado en claim y sólo habilitado con vigor suficiente,
   - política explícita sin payments, premium currency, ads, battle pass, streak punishment ni FOMO pesado.
6. **MVP 2.0 UI polish/feedback**:
   - reward reveal en tiles,
   - notices card/toast para acciones relevantes,
   - level-up destacado,
   - rareza de loot con glow/hover sutil,
   - inventario con barra de capacidad y warnings más claros,
   - reincarnation progress visible,
   - Next Goal persistente,
   - empty states con flavor,
   - navegación móvil horizontal compacta,
   - sin sprites, canvas, game engines ni animaciones complejas.
7. **MVP 2.0 balance pass**:
   - retiming de dungeons región 1-3,
   - power/min-level gates suavizados hasta `curator-of-blue-fire`,
   - Forge inicial reducido a `40 gold / 3 ore`,
   - loot chance base subido a `0.65` con cap `0.85`,
   - rareza base ajustada a `35/45/15/5`,
   - debug timer scale bajado a `0.16`,
   - tests de pacing/rare-window actualizados.
8. **MVP 2.0 UI polish audit pass**:
   - `UI_POLISH_AUDIT.md` creado con pantallas auditadas, issues, fixes y pendientes,
   - resource/Vigor chips compactos y estables,
   - inventario compactado con previews de afijos y botones más bajos,
   - Forge estabilizado para nombres largos y botones alineados,
   - resultado de claim compactado con reward line única, chips pequeños y loot appraisal resumido,
   - rarezas/dark mode controlados con clases semánticas y glow reducido,
   - sin cambios de gameplay, balance, persistencia, dependencias, sprites ni canvas.

## Active Task (única recomendada)

**Active Task:** Post-audit stabilization: modularizar `game-view.tsx` y preparar QA visual reproducible para breakpoints compactos.

Resultado esperado:

- menor riesgo de regresión al tocar UI core,
- validación más consistente de densidad/touch en 360/390/430,
- base más mantenible para próximas features MVP 2.x.
