# Idleforge Roadmap Research: MVP 2.0 / 2.1 / 3.0

Fecha: 2026-05-10  
Autor: Codex (investigación + roadmap, sin cambios de gameplay)  
Scope de esta entrega: análisis del estado actual, benchmark externo, propuestas por fases, decisiones pendientes.

## Convenciones de lectura

- **Confirmado en código**: validado en `src/*` (líneas referenciadas).
- **Documentado pero no implementado**: aparece en `docs/*` y/o planificación, no en runtime actual.
- **Inferencia**: deducción razonable a partir de código + benchmark.
- **Propuesta**: recomendación nueva para roadmap.

---

## Executive Summary

Idleforge hoy ya tiene una base funcional real de idle RPG de sesiones cortas: expediciones por timer, loot, equip/sell/salvage, forge, town buildings, dailies, vigor, offline progress y reincarnation. No está en fase “idea”; está en fase **“vertical slice jugable con fundamentos”**.

El principal problema no es falta de sistemas, sino **falta de capa de decisión recurrente y objetivos de mediano plazo** entre “resolver expedición” y “reincarnar”. El jugador progresa, pero todavía no siente suficiente “plan de build” ni “apuesta estratégica de sesión”.

Comparando con Lost Vault, Gladiatus y Shakes & Fidget:

- Lost Vault demuestra muy bien el valor de **sesiones cortas con energía**, shelters y social ligero, pero también muestra el riesgo de rechazo cuando la energía se percibe restrictiva o monetizada de forma agresiva.
- Gladiatus demuestra la longevidad de loops simples (arena/expedición/dungeon + optimización de equipo), pero también el costo reputacional de fricción mobile, percepción P2W y deuda de UX.
- Shakes & Fidget demuestra la potencia de un metajuego amplio (fortress, guild, dungeons, arena manager, eventos) y actualización continua, pero también cómo el gasto premium puede marcar demasiado la velocidad competitiva.

La oportunidad para Idleforge es clara: construir un **MVP 2.0 “adictivo pero limpio”**:

1. Profundizar decisiones en loops existentes (no crear 15 sistemas nuevos).
2. Mantener social real fuera del núcleo hasta 3.0.
3. Evitar P2W temprano y evitar energy hard-lock.
4. Mejorar mucho claridad de “qué hago ahora y por qué”.

### Recomendación priorizada para MVP 2.0

Orden recomendado (de mayor ROI a menor):

1. **Board de Contracts diario/semanal + objetivos encadenados**.
2. **Loot Direction Lite + pity y anti-duplicados tempranos**.
3. **Forge Progression Layer (Forge XP/desbloqueos) sin romper sistema actual**.
4. **Jobs offline + planner de salida (2 taps antes de cerrar sesión)**.
5. **Supplies/Soft Energy model (vigor extendido) para pacing de recompensas top, no para bloquear jugar**.
6. **Onboarding por pasos y next-action coach** (aprovechando UI y paneles ya existentes).

Esta combinación convierte sistemas actuales en un loop diario más fuerte sin pedir backend, multiplayer ni migración técnica grande.

### Qué construir primero (1-2 semanas)

Milestone recomendado:

- Contrato diario guiado (1 foco principal por día + 2 secundarios).
- Mini-cadena semanal (3 hitos, cofre semanal).
- Next-action panel persistente en pantalla principal.
- 1 tabla de balance nueva para rewards y pacing.

Este milestone entrega valor de retención inmediatamente y habilita los demás sistemas.

### Vertical slice adictivo propuesto

Sesión de 8-12 minutos:

1. Reclamar offline + elegir contract del día.
2. Lanzar 2-4 expediciones con objetivo explícito (loot/crafting/boss).
3. Volver, equipar/salvage/craftear 1 vez con feedback claro.
4. Invertir en un building/job.
5. Cerrar sesión dejando job activo y progreso semanal encaminado.

Este slice ya combina exploración, loot, forge, upgrades, jobs y dailies con dirección de jugador.

---

## 1) Estado actual de Idleforge

## 1.1 Resumen del producto actual

Estado general: **base funcional sólida para v1**.

Evidencia de scope actual:

- Single-player, web, sin backend/cloud/account/social/pagos en v1 (`docs/PRODUCT_SPEC.md:34-36`, `docs/02_ARCHITECTURE.md:10-15`).
- Core técnico: Next.js + React + Zustand + lógica determinística en `src/game/*` (`docs/02_ARCHITECTURE.md:5-11`, `:54-63`).
- Save local con import/export y validación de envelope (`src/game/save.ts:21-71`, `:117-170`, `src/store/useGameStore.ts:109-138`, `:352-366`).

## 1.2 Sistemas existentes (implementado vs parcial vs propuesta)

| Sistema | Evidencia | Estado | Notas |
| --- | --- | --- | --- |
| Clases y stats base | `src/game/content.ts:13-38` | Implementado | Warrior/Rogue/Mage con growth distinto. |
| Zonas + dungeons secuenciales | `src/game/content.ts:61-67`, `:69+` | Implementado | Estructura por zonas y bosses. |
| Inicio/fin de expedición | `src/game/engine.ts:36-71`, `:161-271` | Implementado | Timer + resolve + rewards + report. |
| Loot y comparación | `src/game/engine.ts:210-223`, `:259-265` | Implementado | Incluye primer arma garantizada en primer run. |
| Auto-salvage por inventario lleno | `src/game/engine.ts:216-223`, `src/app/game-view.tsx:2149-2150` | Implementado | Bueno para fricción, pero reduce emoción si está siempre lleno. |
| Forge craft/upgrade/reroll | `src/game/forge.ts:65-125`, `:160-182`, `:232-311` | Implementado | Reroll gated por nivel de Forge. |
| Town buildings | `src/game/content.ts:435`, `src/app/game-view.tsx:2388+` | Implementado | Usa costos escalados y feedback contextual. |
| Dailies rotativas | `src/game/dailies.ts:8-28`, `:144-160`, `:202-226` | Implementado | 3 tareas diarias, reset por hora local. |
| Vigor | `src/game/constants.ts:17-20`, `src/game/vigor.ts` | Implementado | Cap + regen + boost de expedición. |
| Offline progress | `src/game/offline.ts:36-62` | Implementado | Cap de 8h + resumen de retorno. |
| Reincarnation/prestige | `src/game/prestige.ts:37-91` | Implementado | Gate level + boss; renown upgrades. |
| Onboarding contextual UI | `src/app/game-view.tsx:1106+`, `:1755+` | Implementado (lite) | Buen punto de partida, aún no sistema de objetivos persistentes. |
| Backend/social/PvP/trade real | `docs/PRODUCT_SPEC.md:34-36`, `:89-96` | No implementado (fuera de scope v1) | Correcto para ahora. |

## 1.3 Loop actual

Loop principal actual:

1. Iniciar expedición (`startExpedition`) con dungeon desbloqueado.
2. Esperar timer.
3. Resolver expedición (`resolveExpedition`) con éxito/fallo + reward.
4. Equipar o auto-salvagear loot.
5. Invertir en forge/town.
6. Repetir hasta boss y luego reincarnation.

Loop soporte:

- Dailies (3 tareas) + claim.
- Vigor regen + boost opcional de recompensa.
- Offline summary al volver.

## 1.4 Diagnóstico de diseño (0-3)

Escala: 0 débil, 1 incipiente, 2 funcional, 3 sólido para MVP.

| Eje | Score | Diagnóstico |
| --- | ---: | --- |
| Claridad de progreso corto (2-10 min) | 2 | Hay progreso visible, pero falta guía de “mejor siguiente decisión” más persistente. |
| Frecuencia de recompensas | 2 | Buen ritmo base; se cae cuando inventario se atasca o cae loot poco útil seguido. |
| Decisiones por sesión | 1.5 | Decisiones existen (equip/craft/town) pero pocas apuestas estratégicas encadenadas. |
| Profundidad de build | 1 | Hay stats y affixes, pero falta dirección macro de build. |
| Retención diaria | 1.5 | Dailies y offline están, pero sin loop semanal fuerte ni metas compuestas. |
| Retención de 7+ días | 1 | Reincarnation existe, pero faltan capas intermedias de mastery/cadencia semanal. |
| Riesgo de frustración por RNG | 2 | Parcialmente mitigado por forge, pero aún sin pity/targeting claro en early-mid. |
| Escalabilidad técnica para MVP 2.0 | 3 | Arquitectura modular permite ampliar sin backend. |

Conclusión de diagnóstico: **fundación robusta, metajuego todavía delgado**.

## 1.5 Constraints técnicos y de scope

- Sin backend y sin cuentas (decisión vigente) (`docs/PRODUCT_SPEC.md:34-36`).
- Persistencia local y deterministic core (`docs/02_ARCHITECTURE.md:10`, `:89-92`).
- Sin social/PvP real para 2.0 (`docs/MVP_2_ROADMAP.md:10-12`).
- Riesgo principal técnico: archivo UI grande (`docs/02_ARCHITECTURE.md:106-114`) que puede frenar velocidad si se agregan muchos paneles sin modularizar.

---

## 2) Teardowns de juegos comparables

## 2.1 Lost Vault

### 1. Perfil general

- Idle RPG mobile con exploración, loot, clan, shelter, rankings y PvP (Google Play/App Store).
- Señales de producto vivo: updates recientes (Play/App Store muestran updates 2025).
- Posicionamiento: sesiones cortas, progreso idle con capa competitiva.

### 2. Core loop

- Gasto de energía/agua para explorar.
- Combate automático y drops por run.
- Gestión de inventario/equipo/upgrade.
- Progresión de shelter para ingresos pasivos.
- Clan + bosses/reactor para capa social.

### 3. Sistemas de progresión

- Clases base + subclases (fan-wiki, consistente con discurso de comunidad).
- Shelter con edificios de producción y boosts diarios.
- Vaults/raids con límites de repetición (anti-grind infinito por nodo).

### 4. Economía

- Recursos múltiples (cash, comida, fuel, agua, etc. según shelter/wiki/store copy).
- Premium + packs; fricción percibida en precio por parte de usuarios.
- Energía cumple rol de pacing (y potencial monetizable), pero es también foco de crítica.

### 5. Reward design

- Recompensas frecuentes por sesiones cortas.
- Mucha variación de equipo/rareza.
- Boosts por clan/reactor que amplifican motivación social.

### 6. Retención y adicción sana

Lo que hace bien:

- Claridad de “entrar, gastar energía, mejorar, salir”.
- Progreso offline + metas de clan.

Riesgo observado:

- Si energía se siente muro duro, cae disfrute de agencia.

### 7. Qué dicen usuarios

Patrones observados en Play Store/Reddit:

- Positivo: UI simple, comunidad útil, loop retro atractivo.
- Negativo: energía demasiado restrictiva para algunos segmentos.
- Negativo: sensibilidad a ads forzados y pricing de packs.

### 8. Lecciones para Idleforge

#### Cosas copiables/adaptables

- Sesiones cortas bien definidas.
- Base/town con producción pasiva útil.
- Objetivos de clan/temporada para mediano plazo (más tarde).

#### Cosas a evitar

- Hard-lock de energía en 2.0.
- Sensación de paywall temprano.

#### Ideas que encajan con fantasía forja/crafting

- Buildings que alimentan directamente Forge loop.
- Bosses cooperativos asíncronos (3.0).

#### Ideas que no encajan aunque funcionen allí

- Monetización temprana sobre fricción central.

---

## 2.2 Gladiatus

### 1. Perfil general

- Browser RPG histórico (Gameforge) activo desde 2003, sesiones cortas, arena/expediciones/dungeons/guild/rankings.
- Producto con longevidad excepcional del subgénero.

### 2. Core loop

- Entrar, resolver acciones cortas (arena/expediciones automáticas), optimizar equipo.
- Repetición de microciclo con progresión larga.

### 3. Sistemas de progresión

- Equipamiento profundo y sets.
- Dungeons por etapas y desbloqueo por progreso.
- Guilds y ladders sostienen competencia de largo plazo.

### 4. Economía

- Oro + moneda premium (rubies) + beneficios premium (speed/cooldowns/capacidad según foros/guías de comunidad).
- Economía históricamente orientada a acelerar progreso.

### 5. Reward design

- Recompensas pequeñas constantes.
- Eventos/premium amplifican ritmo para jugadores de alta inversión.

### 6. Retención y adicción sana

Lo que hace bien:

- Bucle simple, entendible, sostenible por años.
- Progreso incremental con fuerte “fantasía de optimización”.

Riesgos:

- Percepción P2W y bots erosionan confianza.
- UX mobile/fricción antigua reportada por comunidad.

### 7. Qué dicen usuarios

Patrones observados en Reddit/foros:

- Nostalgia fuerte y comunidad fiel.
- Quejas repetidas sobre P2W, bots y falta de mobile-first real.
- Jugadores piden alternativas “tipo Gladiatus” más modernas.

### 8. Lecciones para Idleforge

#### Cosas copiables/adaptables

- Loop corto adictivo orientado a optimización.
- Ladder de poder clara por equipo.

#### Cosas a evitar

- Ventaja competitiva exagerada por pago en etapa temprana.
- Deuda UX acumulada sin resolver.

#### Ideas que encajan con fantasía forja/crafting

- Especialización de builds por slot/afijo/set.
- Dungeons con hitos duros y recompensas firma.

#### Ideas que no encajan aunque funcionen allí

- Sistemas premium intrusivos en núcleo 2.0.

---

## 2.3 Shakes & Fidget

### 1. Perfil general

- MMORPG satírico veterano con presencia browser + Steam + mobile.
- Escala grande, updates frecuentes, y capa amplia de sistemas (fortress, guild, dungeons, arena manager, eventos).

### 2. Core loop

- Tavern quests (thirst/adventure), combate arena/dungeon, progresión de equipo.
- Metacapas desbloqueables por nivel (fortress, pets, underworld, arena manager).

### 3. Sistemas de progresión

- Gran cantidad de features conectadas por progresión de cuenta.
- Repetición diaria con metas de largo plazo y coleccionables.

### 4. Economía

- Moneda premium (mushrooms) con fuerte impacto en velocidad.
- Eventos y pases aumentan engagement y gasto opcional.

### 5. Reward design

- Altísima densidad de actividades y unlocks.
- Eventos y sistemas secundarios sostienen novedad.

### 6. Retención y adicción sana

Lo que hace bien:

- Siempre hay “algo para hacer”.
- Profundidad enorme para jugadores core.

Riesgos:

- Curva de complejidad alta para nuevos.
- Brecha de velocidad F2P vs spender percibida en comunidad competitiva.

### 7. Qué dicen usuarios

Patrones observados (Steam/App Store/Reddit):

- Positivo: contenido amplio, estilo distintivo, alta longevidad.
- Negativo: percepción de pay-to-progress fuerte en servidores competitivos.

### 8. Lecciones para Idleforge

#### Cosas copiables/adaptables

- Capa de sistemas desbloqueables por fases.
- Calendario de eventos con recompensas temáticas.

#### Cosas a evitar

- Sobrecargar 2.0 con demasiados sistemas a la vez.

#### Ideas que encajan con fantasía forja/crafting

- Metas de colección (codex/logbook de ítems/afijos).
- Subloops secundarios que alimentan el core (ej. manager-like ligado a runas/forge).

#### Ideas que no encajan aunque funcionen allí

- Dependencia temprana de premium para pacing percibido como “normal”.

---

## 2.4 Otros benchmarks relevantes

## Melvor Idle

- Fortalezas: offline robusto (cap claro), interconexión de skills, percepción de profundidad limpia, muy buena valoración en Steam.
- Lección: **el valor está en relaciones entre sistemas**, no solo en cantidad de sistemas.

## Idle Clans / SimpleMMO

- Fortalezas: idle + social opcional + economía/juego ligero.
- Lección: social puede ser “progresivo”, arrancando asincrónico y low-risk antes de full guild wars.

---

## 3) Matriz comparativa de sistemas

| Sistema | Idleforge actual | Lost Vault | Gladiatus | Shakes & Fidget | Melvor Idle |
| --- | --- | --- | --- | --- | --- |
| Sesión corta clara | Sí, funcional | Sí, muy marcada por energía | Sí, muy marcada | Sí | Sí |
| Energía/stamina | Vigor boost no bloqueante | Sí, central | Puntos/esperas y premium aceleran | Thirst + tiempos + premium | No como bloqueo duro |
| Build depth | Baja-media | Media | Media-alta | Alta | Alta |
| Forge/crafting | Base sólida | Upgrade/re-roll/workshop | Craft/upgrade gear | Blacksmith/gems/runes | Crafting muy profundo |
| Town/base | Sí (6 buildings) | Shelter fuerte | Menor foco base | Fortress/Underworld fuerte | Township/sistemas secundarios |
| Dailies/semanal | Daily básico | Daily + eventos | Misiones/eventos | Daily + eventos + más capas | Menos “daily checklist”, más plan largo |
| Social | No (por diseño v1) | Sí (clans/rankings) | Sí (guild/rank) | Sí (guild/PvP) | No social core |
| Offline | Sí (cap 8h) | Sí | Parcial por loop | Parcial en subloops | Sí (cap explícito) |
| Riesgo P2W percibido | Bajo actual | Medio-alto percibido | Alto percibido | Medio-alto percibido | Bajo |

Conclusión transversal:

- El diferenciador ganador para Idleforge 2.0 no es copiar social ya, sino **maximizar profundidad de decisión en single-player** y preparar interfaces para social progresivo en 3.0.

---

## 4) Pilares de diseño para Idleforge

## Pilar 1: Decisiones frecuentes con bajo costo cognitivo

- Habilita: 3-5 decisiones reales por sesión corta.
- Prohíbe: pantallas densas que requieren guía externa para jugar bien.

## Pilar 2: Progreso visible en 2 escalas (sesión y semana)

- Habilita: contracts diarios + meta semanal.
- Prohíbe: solo progreso lineal de números sin hitos.

## Pilar 3: Idle, pero con intención

- Habilita: offline útil + “plan de salida” (job/objetivo antes de cerrar).
- Prohíbe: dejar al jugador sin decisión relevante al volver.

## Pilar 4: RNG emocionante, no frustrante

- Habilita: pity/targeting-lite/anti-duplicados tempranos.
- Prohíbe: rachas largas sin mejora utilizable.

## Pilar 5: Complejidad por capas

- Habilita: 2.0 (core), 2.1 (profundidad), 3.0 (social/endgame).
- Prohíbe: meter social pesado o economía abierta en 2.0.

## Pilar 6: Retención saludable sin monetización agresiva temprana

- Habilita: motivación por mastery, no por fricción artificial.
- Prohíbe: hard energy monetizada como eje del core 2.0.

---

## 5) Roadmap recomendado

## 5.1 MVP 2.0 — Core adictivo

Objetivo: convertir la base actual en un loop diario robusto con dirección, variación y metas semanales, manteniendo bajo riesgo técnico y sin backend.

### Feature Card: Supplies (Soft Energy) sobre Vigor

#### Problema que resuelve

Vigor actual impulsa boosts, pero no estructura bien la priorización de actividades premium de sesión.

#### Objetivo de diseño

Crear elecciones tácticas de recompensa alta sin bloquear juego base.

#### Inspiración / benchmarks

Lost Vault (sesión corta), pero evitando hard-lock percibido.

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | Sin supplies, solo vigor actual | Costo cero | Menor profundidad táctica |
| B | Supplies para “acciones premium” (doble recompensa, reroll extra, boss prep) | Soft energy sano, buenas decisiones | Requiere tuning |
| C | Energy dura para toda expedición | Control de pacing fuerte | Alta fricción y rechazo |
| D | Supplies + compra premium directa | Monetizable | Va contra foco 2.0 |

#### Recomendación inicial

**B** (soft energy): no bloquear explorar; limitar multiplicadores top.

#### Dependencias

- Ajustes de `vigor.ts`, `engine.ts`, `forge.ts`, UI de costos.

#### Cómo encaja con sistemas existentes

- Reusa vigor y boosts actuales.

#### Datos/modelos necesarios

- `supplyCapacity`, `regen`, `costByActionTier`.

#### UI/UX necesaria

- Indicador simple de supplies y gasto proyectado por acción.

#### Balance inicial sugerido

- Cap 100 (mantener), regen +1/5m (mantener), costo premium 20-35 según tier.

#### Métricas para validar

- % sesiones con gasto de supplies.
- % jugadores que quedan a 0 supplies y siguen jugando acciones base.

#### Riesgos / anti-patrones

- Convertirlo en hard wall.

#### Qué dejar fuera de scope

- Tienda/pago de supplies en 2.0.

---

### Feature Card: Loot Direction Lite + Pity

#### Problema que resuelve

Rachas de drops no útiles erosionan motivación temprana.

#### Objetivo de diseño

Subir percepción de agencia en loot sin trivializar RNG.

#### Inspiración / benchmarks

Shakes & Fidget (densidad de objetivos), Melvor (planificación), Lost Vault (build focus).

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | Sin cambios | Muy simple | Persisten rachas malas |
| B | Pity de rareza y anti-duplicado temprano | Reduce frustración | Requiere calibración |
| C | Target full por slot/afijo | Alta agencia | Riesgo de romper economía |
| D | Target solo por eventos semanales | Fácil de operar | Menor impacto diario |

#### Recomendación inicial

**B + D-lite**: pity base siempre, target semanal acotado.

#### Dependencias

- `loot.ts`, `engine.ts`, tablas de drop.

#### Cómo encaja con sistemas existentes

- Mantiene loop actual de expedición + forge.

#### Datos/modelos necesarios

- `badLuckCounter`, `duplicatePenalty`, `focusSlotWeekly`.

#### UI/UX necesaria

- Barra “próxima mejora probable” y tooltip no técnico.

#### Balance inicial sugerido

- Garantía Rare+ cada N runs tempranos por banda de nivel.

#### Métricas para validar

- Tiempo a primer rare útil.
- % sesiones con al menos 1 decisión de equipo.

#### Riesgos / anti-patrones

- Exceso de determinismo que mata emoción.

#### Qué dejar fuera de scope

- Mercado de ítems o trading.

---

### Feature Card: Forge Progression Layer

#### Problema que resuelve

Forge hoy es funcional pero no suficientemente “metaprogression anchor”.

#### Objetivo de diseño

Que el jugador sienta que invertir en forge cambia su plan de run.

#### Inspiración / benchmarks

Gladiatus (optimización de gear), sistemas de mejora acumulativa.

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | Mantener forge actual | Costo bajo | Poco crecimiento sistémico |
| B | Forge XP + unlock tiers (recipes/reroll quality) | Alta claridad y progresión | Tuning adicional |
| C | Crafting orders economy-like | Profundidad alta | Demasiado para 2.0 |
| D | Destrucción por fallo de upgrade | Tensión | Frustración alta para MVP |

#### Recomendación inicial

**B** (sin destrucción por fallo).

#### Dependencias

- `forge.ts`, `town.ts`, tablas de unlock.

#### Cómo encaja con sistemas existentes

- Reusa crafting, upgrade y reroll ya implementados.

#### Datos/modelos necesarios

- `forgeXpPerAction`, `forgeTierUnlocks`.

#### UI/UX necesaria

- Barra de progreso Forge Level + preview de próximo unlock.

#### Balance inicial sugerido

- Tier 1-5 en 2.0; tier 3 desbloquea reroll mejorado.

#### Métricas para validar

- % jugadores que craft + upgrade en primera hora.

#### Riesgos / anti-patrones

- Inflar costos hasta forzar grind plano.

#### Qué dejar fuera de scope

- Sistema de recetas gigante (>30 recetas) en 2.0.

---

### Feature Card: Jobs Offline + Exit Planner

#### Problema que resuelve

Offline actual da recursos, pero falta “decisión de cierre” que aumente retorno emocional.

#### Objetivo de diseño

Que cerrar sesión sea una decisión táctica (qué job activo y por qué).

#### Inspiración / benchmarks

Lost Vault shelter loop, Melvor offline intentionality.

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | Offline pasivo actual | Simple | Poca intención |
| B | Elegir job de salida (ore/gold/rune/focus) | Decisión clara | UI extra |
| C | Cadena de jobs con microgestión | Profundo | Demasiado overhead |
| D | Jobs ligados a clan/social | Futuro 3.0 | Fuera de scope |

#### Recomendación inicial

**B**, concretado como **Caravan**.

#### Dependencias

- `caravan.ts`, `offline.ts`, estado de `town`, UI de Expeditions.

#### Cómo encaja con sistemas existentes

- Aprovecha el cap offline existente y convierte Mine en modificador de yields de Caravan.

#### Datos/modelos necesarios

- `focusId`, `durationMs`, `startedAt`, `endsAt`, `jobYieldCurve`.

#### UI/UX necesaria

- Subtab **Caravan** dentro de Expeditions.
- Selector de foco desbloqueado por nivel.
- Slider horizontal 1h-8h con hora de finalización y recompensa estimada.

#### Balance inicial sugerido

- Focos: XP nivel 1, Gold nivel 3, Ore nivel 5, Crystal nivel 15, Runes nivel 20.
- Primera versión sin costo de Vigor; Vigor boost para Caravan queda como extensión posterior.

#### Métricas para validar

- % sesiones cerradas con job activo.

#### Riesgos / anti-patrones

- Castigar demasiado al que no setea job.

#### Qué dejar fuera de scope

- Penalidades punitivas por no loguear.

---

### Feature Card: Contract Board Diario + Semanal

#### Problema que resuelve

Dailies actuales funcionan, pero no construyen arco semanal claro.

#### Objetivo de diseño

Dar horizonte de 1 día y 7 días sin checklist agobiante.

#### Inspiración / benchmarks

Shakes & Fidget (event cadence), Lost Vault (daily loops), mobile retention patterns.

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | Solo 3 dailies actual | Costo cero | Techo de engagement bajo |
| B | 1 contract principal diario + 2 secundarios + cofre semanal | Muy buen ROI | Requiere tracking semanal |
| C | 10 tareas diarias | Mucho contenido | Fatiga/checklist |
| D | Eventos semanales aleatorios pesados | Novedad | Mayor riesgo de balance |

#### Recomendación inicial

**B**.

#### Dependencias

- `dailies.ts` + nueva capa semanal.

#### Cómo encaja con sistemas existentes

- Extiende sistema de daily tasks ya estable.

#### Datos/modelos necesarios

- `weeklyTrackProgress`, `contractWeights`, `refreshRules`.

#### UI/UX necesaria

- Tab “Contracts” con progreso compacto.

#### Balance inicial sugerido

- Semanal de 3 hitos (día 1-3, 4-5, 6-7) y cofre final.

#### Métricas para validar

- D1->D2 return, D7 return, % weekly chest claim.

#### Riesgos / anti-patrones

- Sobre-recompensar y romper pacing de forge/town.

#### Qué dejar fuera de scope

- Battle pass premium.

---

### Feature Card: Next-Action Coach + Onboarding dirigido

#### Problema que resuelve

La base existe pero nuevos usuarios pueden no ver la mejor acción siguiente.

#### Objetivo de diseño

Reducir fricción de arranque y mejorar first-hour conversion.

#### Inspiración / benchmarks

Buenas prácticas de mobile RPG + señales ya existentes en `game-view.tsx`.

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | Tips estáticos | Fácil | Poco contextual |
| B | Sugerencia contextual por estado (gear/forge/town/daily) | Alto impacto | Lógica heurística |
| C | Tutorial lineal largo | Controlado | Riesgo de aburrimiento |
| D | Sin onboarding | Costo cero | Peor retención temprana |

#### Recomendación inicial

**B**.

#### Dependencias

- UI + pequeña capa heurística en store/game-view.

#### Cómo encaja con sistemas existentes

- Reusa paneles ya presentes (onboarding/result/offline).

#### Datos/modelos necesarios

- `nextBestAction` y razones de sugerencia.

#### UI/UX necesaria

- Caja fija “Siguiente mejor acción”.

#### Balance inicial sugerido

- Apagar sugerencias avanzadas tras N sesiones o setting.

#### Métricas para validar

- % jugadores que equipan/craftean en primera sesión.

#### Riesgos / anti-patrones

- Sobre-automatizar decisiones (juego “te juega solo”).

#### Qué dejar fuera de scope

- Asistentes complejos con scripting.

---

## 5.2 MVP 2.1 — Profundidad

Objetivo: agregar decisiones de mediano plazo y variedad de builds sin multiplicar deuda técnica.

### Feature Card: Talent Grid Lite por clase

#### Problema que resuelve

Build identity insuficiente en midgame.

#### Objetivo de diseño

Crear rutas de especialización comprensibles sin sobrecargar UI.

#### Inspiración / benchmarks

Melvor (interdependencia de sistemas), ARPG talent-lite.

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | Passives fijas (actual) | Costo mínimo | Baja agencia |
| B | 2 ramas por clase, 6 nodos totales | Profundidad controlada | Requiere tuning |
| C | Árbol grande estilo ARPG | Profundidad alta | Scope alto |
| D | Talentos solo por temporada | Novedad | Menor consistencia run-to-run |

#### Recomendación inicial

**B**.

#### Dependencias

`types.ts`, `heroes.ts`, balance y UI.

#### Cómo encaja con sistemas existentes

Potencia loot/forge/town sin backend.

#### Datos/modelos necesarios

`talentPoints`, `nodeEffects`, `respecCost`.

#### UI/UX necesaria

Panel compacto con presets.

#### Balance inicial sugerido

Primer nodo en level 5, segundo en level 10.

#### Métricas para validar

% de jugadores con 2+ nodos asignados antes de primera reincarnation.

#### Riesgos / anti-patrones

Meta única obligatoria.

#### Qué dejar fuera de scope

30+ nodos por clase.

### Feature Card: Set Bonuses Lite + Codex

#### Problema que resuelve

Falta objetivo de colección y horizontes de build intermedios.

#### Objetivo de diseño

Introducir mini-metas de equipamiento sin depender de trading.

#### Inspiración / benchmarks

Shakes & Fidget (colección de ítems), loops de set en RPGs.

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | Sin sets | Costo cero | Menor motivación de farmeo |
| B | Mini-sets 2/3 piezas | Buen equilibrio | Requiere nuevas tablas |
| C | Sets 5+ piezas complejas | Profundidad alta | Scope alto |
| D | Sets tradeables | Economía emergente | Depende de backend/social |

#### Recomendación inicial

**B**.

#### Dependencias

`content.ts`, `balance.ts`, UI de inventory.

#### Cómo encaja con sistemas existentes

Refuerza loot + forge + equip loop.

#### Datos/modelos necesarios

`setId`, `pieces`, `bonuses`.

#### UI/UX necesaria

Codex de sets descubiertos y progreso parcial.

#### Balance inicial sugerido

Bonos de utilidad antes que daño bruto para evitar power creep.

#### Métricas para validar

% jugadores que completan al menos 1 set parcial en D7.

#### Riesgos / anti-patrones

Power creep y builds obligatorias.

#### Qué dejar fuera de scope

Set swapping automatizado masivo.

### Feature Card: Challenge Dungeons (modificadores)

#### Problema que resuelve

Repetición plana post-core en sesiones de 10-20 minutos.

#### Objetivo de diseño

Agregar variedad controlada con riesgo/recompensa explícito.

#### Inspiración / benchmarks

Mutators de dungeons en RPGs y eventos semanales.

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | Sin modificadores | Simplicidad | Menos variedad |
| B | 2 modificadores semanales rotativos | Buen costo/beneficio | Curación de mutators |
| C | 10 mutators simultáneos | Alta profundidad | Sobrecarga UX y balance |
| D | Challenge PvP | Competencia | Fuera de enfoque 2.1 |

#### Recomendación inicial

**B**.

#### Dependencias

Engine/rewards/UI de challenge tag.

#### Cómo encaja con sistemas existentes

Reusa dungeons actuales y contract semanal.

#### Datos/modelos necesarios

`modifierPool`, `rewardMultiplier`.

#### UI/UX necesaria

Etiqueta de mutador + preview de impacto.

#### Balance inicial sugerido

+10% a +25% reward según dificultad.

#### Métricas para validar

Adoption de challenge mode y completion rate.

#### Riesgos / anti-patrones

Combinaciones injustas o “run muerta”.

#### Qué dejar fuera de scope

Ranking global competitivo ligado a challenge.

### Feature Card: Event Calendar mensual

#### Problema que resuelve

Falta de cadencia visible de contenido y expectativa de retorno.

#### Objetivo de diseño

Crear ritmo mensual reconocible sin fatigar.

#### Inspiración / benchmarks

S&F updates/event windows.

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | Sin eventos | Costo cero | Menor novedad |
| B | 1 evento temático mensual | Cadencia clara | Requiere pipeline de contenido |
| C | Eventos cada 48h | Alto estímulo | Fatiga/FOMO |
| D | Eventos solo monetizados | Potencial ingreso | Rechazo en etapa temprana |

#### Recomendación inicial

**B**.

#### Dependencias

Content flags + reward tables.

#### Cómo encaja con sistemas existentes

Extiende contracts y loop semanal.

#### Datos/modelos necesarios

`eventId`, `start`, `end`, `bonuses`.

#### UI/UX necesaria

Mini calendario en home + countdown simple.

#### Balance inicial sugerido

Bonos moderados, nunca mandatory para progresar core.

#### Métricas para validar

Tasa de participación y retorno durante evento.

#### Riesgos / anti-patrones

FOMO excesivo.

#### Qué dejar fuera de scope

Eventos con pago obligatorio.

---

## 5.3 MVP 3.0 — Social / Endgame

Objetivo: introducir capa social progresiva sin romper estabilidad ni abrir abuso temprano.

### Feature Card: Async Leaderboards por temporada

#### Problema que resuelve

Falta de comparación social motivante para endgame.

#### Objetivo de diseño

Agregar estatus externo sin PvP destructivo.

#### Inspiración / benchmarks

Ladders asíncronos de RPG mobile.

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | Sin leaderboard | Sin complejidad backend | Menor motivación social |
| B | Leaderboard asíncrono por temporadas sin combate directo | Riesgo bajo, buena retención | Requiere backend de score |
| C | Ladder con ataques directos | Competencia intensa | Mayor toxicidad/fricción |
| D | Cross-server global hardcore día 1 | Alto alcance | Riesgo técnico y de balance muy alto |

#### Recomendación inicial

**B**.

#### Dependencias

Backend mínimo + anticheat básico.

#### Cómo encaja con sistemas existentes

Compatible con core single-player.

#### Datos/modelos necesarios

`scoreSnapshots`, `brackets`, `seasonResetRules`.

#### UI/UX necesaria

Vista de ranking + recompensas por tier.

#### Balance inicial sugerido

Premios cosméticos + utilidad moderada, sin gap extremo.

#### Métricas para validar

Participación estacional y retorno post-reset.

#### Riesgos / anti-patrones

Explotación si no hay validación.

#### Qué dejar fuera de scope

Robo de recursos entre jugadores.

### Feature Card: Guilds Lite (co-op asíncrono)

#### Problema que resuelve

Falta de comunidad y objetivos cooperativos.

#### Objetivo de diseño

Introducir colaboración sin castigo competitivo duro.

#### Inspiración / benchmarks

Lost Vault clans, sistemas guild-lite.

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | Sin guilds | Sin backend social | Menor retención social |
| B | Guild perks + objetivos cooperativos semanales | Buen equilibrio | Requiere coordinación backend |
| C | Guild wars con saqueo | Engagement competitivo | Riesgo de churn por frustración |
| D | Economía guild completa desde inicio | Profundidad alta | Scope muy alto |

#### Recomendación inicial

**B**.

#### Dependencias

Backend social + persistencia de cuentas.

#### Cómo encaja con sistemas existentes

Extensión natural de contracts/eventos.

#### Datos/modelos necesarios

`guildXp`, `contributions`, `milestones`.

#### UI/UX necesaria

Panel simple de contribución y meta semanal.

#### Balance inicial sugerido

Bonos pequeños acumulativos para evitar obligación fuerte.

#### Métricas para validar

Guild join rate, retención D30 y actividad semanal.

#### Riesgos / anti-patrones

Presión social tóxica.

#### Qué dejar fuera de scope

Guild PvP con pérdida real.

### Feature Card: Market cerrado (no libre)

#### Problema que resuelve

Endgame sin sinks/sources sociales controlados.

#### Objetivo de diseño

Habilitar economía sin abrir abuso masivo.

#### Inspiración / benchmarks

Order-board economy en MMOs ligeros.

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | No market | Simplicidad | Menor dinamismo endgame |
| B | Market cerrado con órdenes limitadas + floor/ceiling | Control antiabuse | Más reglas a explicar |
| C | Trading libre P2P | Alta libertad | Alto riesgo de abuso/bots |
| D | Subasta global sin restricciones | Liquidez alta | Riesgo extremo de manipulación |

#### Recomendación inicial

**B**.

#### Dependencias

Backend transaccional + antiabuse.

#### Cómo encaja con sistemas existentes

Complementa forge/loot endgame.

#### Datos/modelos necesarios

`listings`, `priceBands`, `taxes`.

#### UI/UX necesaria

Order board simplificado y límites claros.

#### Balance inicial sugerido

Límites diarios + impuestos de transacción.

#### Métricas para validar

Liquidez, dispersión de precios y tasa de abuso detectado.

#### Riesgos / anti-patrones

Inflación y bots.

#### Qué dejar fuera de scope

Gifting libre total.

### Feature Card: PvP opcional no punitivo

#### Problema que resuelve

Segmento competitivo sin oferta directa.

#### Objetivo de diseño

Ofrecer PvP opt-in sin castigar al jugador casual.

#### Inspiración / benchmarks

Arenas opcionales de MMORPGs mobile.

#### Opciones de diseño

| Opción | Descripción | Pros | Contras |
| --- | --- | --- | --- |
| A | No PvP | Costo bajo | Menos alcance competitivo |
| B | Arena opcional sin robo de recursos | Riesgo controlado | Requiere matchmaking |
| C | Raids con pérdida | Alta tensión | Churn por frustración |
| D | Full open PvP | Libertad total | Rompe experiencia casual |

#### Recomendación inicial

**B**.

#### Dependencias

Matchmaking, balancing, logs.

#### Cómo encaja con sistemas existentes

Capa adicional sobre temporadas/leaderboards.

#### Datos/modelos necesarios

`mmr`, `tier`, `dailyPvPRewards`.

#### UI/UX necesaria

Cola rápida y reportes de combate claros.

#### Balance inicial sugerido

Rewards limitados por día y sin loot robado.

#### Métricas para validar

Opt-in rate y churn diferencial entre quienes juegan/no juegan PvP.

#### Riesgos / anti-patrones

Desbalance entre spenders y non-spenders.

#### Qué dejar fuera de scope

PvP obligatorio para progreso core.

---

## 6) Loops propuestos para Idleforge

## Loop de sesión corta (2-5 min)

1. Abrir juego y ver “Siguiente acción recomendada”.
2. Reclamar quick rewards offline.
3. Iniciar 1-2 expediciones según contract actual.
4. Hacer 1 decisión de gear (equip/salvage/forge).
5. Dejar 1 job de salida configurado.

## Loop de sesión media (10-20 min)

1. Revisar board diario + progreso semanal.
2. Encadenar 3-5 expediciones con objetivo (boss, material, slot focus).
3. Ejecutar ciclo forge completo (craft + upgrade o reroll).
4. Mejorar building clave de run.
5. Cerrar sesión con plan del próximo retorno.

## Loop diario

- Completar contract principal.
- Cobrar 1-2 secundarios.
- Avanzar un hito semanal.

## Loop semanal

- Completar cadena semanal de 3 hitos.
- Abrir cofre semanal con recompensa “build-relevant”.
- Ajustar estrategia de build para siguiente semana.

## Loop de 30 días

- 2-4 reincarnations significativas.
- 1 build principal refinada + 1 secundaria.
- Participación en 1 evento mensual (2.1) o 1 temporada (3.0).

---

## 7) Economía y balance inicial sugerido

## Recursos

Recursos base actuales:

- Gold, Ore, Crystal, Rune, Relic Fragment, Renown (`save.ts`, `constants.ts`).

Agregar en 2.0 (sin romper save):

- `contractToken` (solo para rewards de contracts).
- `forgeXp` (progresión de forja).

## Sources and sinks

| Recurso | Sources | Sinks |
| --- | --- | --- |
| Gold | Expediciones, dailies/contracts, jobs | Upgrades town, craft, upgrade items |
| Ore/Crystal/Rune | Expediciones, Caravan, contracts | Craft, upgrade, reroll |
| Relic Fragment | Mid-late expediciones, salvage | Forge high tier |
| Renown | Reincarnation | Permanent upgrades |
| ContractToken (nuevo) | Contracts diario/semanal | Cofres/re-roll de contract |
| ForgeXp (nuevo) | Craft/upgrade/reroll | Unlocks de forge tier |

## Timers

- Mantener cap offline de 8h en 2.0.
- Mantener vigor regen base (1 cada 5m) y usar supplies solo para acciones premium.
- Reset diario conservar horario actual para no romper hábitos existentes.

## Curvas iniciales

- Curva de craft cost: mantener exponencial suave actual; añadir unlock tiers por Forge XP en vez de inflar costo base.
- Curva de weekly rewards: escalar por percentiles de power score y no por tiempo jugado bruto.
- Curva de pity: más generosa en early, se normaliza en midgame.

---

## 8) Onboarding propuesto

## Objetivos

- Primer minuto: entender loop.
- Primeros 5 minutos: 1 upgrade útil + 1 mejora de town.
- Primeros 15 minutos: primer boss o hito equivalente.

## Flujo

1. **Step 1**: “Elige objetivo del día” (contract guiado).
2. **Step 2**: iniciar primera expedición (tooltip contextual).
3. **Step 3**: equipar o salvagear primer ítem.
4. **Step 4**: craft o upgrade en forge.
5. **Step 5**: activar primer building/job.
6. **Step 6**: cerrar sesión con planner de salida.

## UX rules

- 1 CTA principal por estado.
- No más de 2 mensajes simultáneos.
- Feedback de power delta siempre visible tras equip/upgrade.

---

## 9) Priorización

## Matriz de priorización

## Must-have MVP 2.0

- Contract Board diario/semanal.
- Next-action coach contextual.
- Loot pity + anti-duplicado temprano.
- Forge progression layer.
- Jobs offline con planner.

## Should-have MVP 2.0

- Supplies soft-energy refinado sobre vigor.
- Mejoras de telemetría y panel de métricas in-game (debug product).

## Could-have MVP 2.0

- Primer evento temático compacto.
- Mini codex de objetivos de colección.

## Explicitly out of scope MVP 2.0

- Backend de cuentas/cloud.
- Guilds reales y PvP con combate directo.
- Trading abierto/auction house.
- Monetización runtime (ads/premium currency/pagos).

---

## 10) Métricas de éxito (MVP 2.0)

KPIs producto:

- D1 retention.
- D7 retention.
- Sesiones por día.
- Duración de sesión mediana.
- % jugadores que completan contract principal diario.
- % jugadores que reclaman cofre semanal.
- Tiempo a primer equip útil.
- Tiempo a primer upgrade de item.
- Tiempo a primer upgrade de building.
- % jugadores que usan forge en primera sesión.
- % jugadores que configuran job de salida.
- Tiempo a primera reincarnation.

Health checks de diseño:

- Distribución de rareza obtenida por banda de nivel.
- Tasa de inventario lleno por sesión.
- % runs sin decisión de equipo (target: bajar).

---

## 11) Decisiones que necesito que tomes

Formato: opción recomendada primero.

## 1. Energía / supplies

| Opción | Descripción |
| --- | --- |
| **B (Recomendada)** | Soft energy: supplies para acciones premium, nunca bloquea expedición base. |
| A | Mantener vigor actual sin cambios grandes. |
| C | Hard energy para toda acción principal. |
| D | Soft energy + monetización temprana (no recomendado en 2.0). |

## 2. Loot

| Opción | Descripción |
| --- | --- |
| **B (Recomendada)** | Pity + anti-duplicado temprano + focus semanal ligero. |
| A | RNG actual casi intacto. |
| C | Target fuerte por slot/afijo desde temprano. |
| D | Loot focus solo en eventos. |

## 3. Crafting / Forge

| Opción | Descripción |
| --- | --- |
| **B (Recomendada)** | Forge XP + tiers + unlocks progresivos. |
| A | Forge actual sin capa meta adicional. |
| C | Crafting economy board desde 2.0. |
| D | Riesgo de destrucción por fallo (alto castigo). |

## 4. Buildings / Jobs

| Opción | Descripción |
| --- | --- |
| **B (Recomendada)** | Jobs de salida con bonus offline por especialización. |
| A | Solo mine/offline pasivo actual. |
| C | Cadena compleja de jobs con microgestión. |
| D | Jobs dependientes de guild/social (3.0). |

## 5. Social

| Opción | Descripción |
| --- | --- |
| **A (Recomendada para 2.0)** | No social real aún; preparar hooks de datos. |
| B | Leaderboard asíncrono básico ya en 2.1. |
| C | Guilds lite ya en 2.1. |
| D | Social completo antes de estabilizar core. |

## 6. PvP

| Opción | Descripción |
| --- | --- |
| **A (Recomendada para 2.0)** | Sin PvP directo, solo metas individuales. |
| B | PvP opcional no punitivo en 3.0. |
| C | PvP con robo/pérdida (alto riesgo). |
| D | PvP obligatorio para progresar. |

---

## 11.1) Decisiones tomadas

| Área | Decisión | Comentario |
| --- | --- | --- |
| Energía | B modificada: Vigor único | No agregar Supplies. Expandir Vigor a acciones premium que sumemos. |
| Loot | B | Seguir viendo cómo lo sumamos; hoy el loot no es tan importante, sólo sube poder. |
| Crafting | B | Entender cómo vamos a hacer Forge XP. Hoy se puede upgradear en Town y está ok, pero falta definir cómo levelear crafteando, qué tiers lockeamos y qué unlocks tiene. |
| Buildings | B | OK Job offline tipo Caravan de Lost Vault. Dejar de hacer progreso offline porque sí; hacerlo como job de salida decidido por el jugador. Elegir recurso foco da más agencia. |
| Social | A | Sólo preparar hooks de datos, nada de implementación online por ahora. |
| PVP | A | Sólo preparación. |

## 11.2) Decisión implementada: Caravan

- Nombre del sistema: **Caravan**.
- Ubicación UI: subtab dentro de **Expeditions**, junto a `Routes`.
- Rol: job offline elegido por el jugador antes de irse.
- Cambio de diseño: reemplaza el progreso offline pasivo de Mine por una decisión explícita.
- Duración: selector horizontal de **1h a 8h**.
- Feedback requerido: hora estimada de finalización y recompensa estimada antes de iniciar.
- Focos de recurso:

| Foco | Unlock |
| --- | ---: |
| XP | Hero level 1 |
| Gold | Hero level 3 |
| Ore | Hero level 5 |
| Crystal | Hero level 15 |
| Runes | Hero level 20 |

- Nota de balance: Mine pasa a mejorar yields de Ore/Crystal Caravan en lugar de dar materiales offline por defecto.
- Nota de scope: Vigor todavía no se gasta en Caravan en esta primera implementación; queda como extensión posterior para potenciar jobs.
- Ajuste implementado posterior: no se puede iniciar una segunda Caravan mientras hay una activa; sólo se puede cancelar sin recompensas.
- Ajuste implementado posterior: no se pueden iniciar nuevas Expeditions mientras una Caravan está activa. Si ya había una Expedition activa antes de iniciar Caravan, se permite mantenerla.

## 11.3) Decisión implementada: Contract Board diario/semanal

- Nombre del sistema: **Contract Board**.
- Ubicación UI: tab **Contracts** (antes Dailies), reutilizando el sistema interno de dailies.
- Estructura diaria:
  - 1 contrato **Main**.
  - 2 contratos **Side**.
  - Reset diario a la hora local configurada.
- Estructura semanal:
  - Progreso semanal basado en contratos diarios reclamados.
  - 3 hitos semanales.
  - Cada hito entrega payout tipo chest y se reclama independientemente.
- Cambio de diseño: las dailies dejan de ser sólo tareas sueltas y pasan a alimentar un objetivo semanal visible.
- Nota de scope: todavía no hay selección manual del contrato diario; la primera versión mantiene rotación automática determinística para no inflar complejidad.

## 12) Recomendación priorizada final para MVP 2.0

Si solo podés financiar 5 iniciativas, haría exactamente esto:

1. Contract Board diario/semanal.
2. Loot direction lite (pity + anti-duplicado).
3. Forge progression layer.
4. Jobs offline + planner de salida.
5. Next-action coach + onboarding contextual.

Supplies soft-energy quedaría inmediatamente después, o en paralelo si el equipo de balance llega.

---

## 13) Primer milestone implementable (1-2 semanas)

Objetivo de milestone: subir retención D1/D2 con mínimo riesgo.

### Slice implementado primero

- **Caravan offline job** como primera pieza del loop de salida.
- Rationale: la decisión de Buildings/Jobs quedó cerrada antes que Forge XP y Loot, y crea agencia inmediata sin backend.
- **Contract Board diario/semanal** como segunda pieza del loop de retorno.
- Rationale: convierte las dailies existentes en objetivo diario + semanal sin backend ni social.

Entregables:

- Contract principal diario + 2 secundarios. **Implementado.**
- Progreso semanal de 3 hitos + cofre. **Implementado.**
- Panel “siguiente mejor acción”.
- Telemetría mínima de completion y tiempos clave.

Criterio de éxito del milestone:

- +X% en completitud de primera sesión.
- +X% en retorno al día siguiente.

---

## 14) Vertical slice adictivo (exploración + loot + forge + upgrades + jobs + dailies)

Flujo objetivo:

1. Abrís, cobrás offline, elegís contract.
2. Corrés expediciones enfocadas.
3. Caen drops con menor frustración RNG.
4. Ejecutás decisión de forge útil.
5. Mejorás town/building según plan.
6. Activás job de salida.
7. Te vas con progreso diario + semanal tangible.

Resultado esperado: cada sesión deja sensación de “avance + elección”, no solo “timer consumido”.

---

## 15) Fuentes

### Fuentes internas (repo)

- `src/game/constants.ts`.
- `src/game/content.ts`.
- `src/game/engine.ts`.
- `src/game/forge.ts`.
- `src/game/dailies.ts`.
- `src/game/offline.ts`.
- `src/game/prestige.ts`.
- `src/game/save.ts`.
- `src/store/useGameStore.ts`.
- `src/app/game-view.tsx`.
- `src/game/__tests__/core.test.ts`.
- `docs/PRODUCT_SPEC.md`.
- `docs/02_ARCHITECTURE.md`.
- `docs/MVP_2_ROADMAP.md`.

### Fuentes externas públicas

- Lost Vault (Google Play): https://play.google.com/store/apps/details?hl=en-US&id=com.vaultomb
- Lost Vault (App Store): https://apps.apple.com/us/app/lost-vault-afk-retro-rpg/id1579912571
- Lost Vault Wiki (community): https://lostvault.fandom.com/wiki/Lost_Vault_Wiki
- Lost Vault Shelter: https://lostvault.fandom.com/wiki/Shelter
- Lost Vault Tribe: https://lostvault.fandom.com/wiki/Tribe
- Lost Vault Reactor: https://lostvault.fandom.com/wiki/Reactor
- Lost Vault Vaults: https://lostvault.fandom.com/wiki/Vaults
- Lost Vault classes: https://lostvault.fandom.com/wiki/Classes
- Reddit (Lost Vault energy discussion): https://www.reddit.com/r/incremental_games/comments/vpuwgg

- Gladiatus official (EN): https://gameforge.com/en-GB/games/gladiatus.html
- Gladiatus official (ES): https://gameforge.com/es-ES/play/gladiatus
- Gladiatus official (CZ, 2026 FAQ visible): https://gameforge.com/cs-CZ/games/gladiatus.html
- Gladiatus Wiki expeditions: https://gladiatus.fandom.com/wiki/Expeditions
- Gladiatus premium/rubies forum FAQ (ES): https://forum.gladiatus.gameforge.com/forum/thread/51-faq-premium-y-rubies/
- Reddit (Gladiatus feedback): https://www.reddit.com/r/Gladiatus/comments/1cvt1ek

- Shakes & Fidget (Steam): https://store.steampowered.com/app/438040/Shakes_and_Fidget/
- Shakes & Fidget (official site): https://sfgame.net/
- Shakes & Fidget Help Center (manual): https://playa-games.helpshift.com/hc/en/4-shakes-fidget-1653988985/section/13-game-manual/
- Shakes & Fidget Arena Manager FAQ: https://playa-games.helpshift.com/hc/en/4-shakes-fidget-1653988985/faq/30-arena-manager/
- Shakes & Fidget (App Store): https://apps.apple.com/us/app/shakes-and-fidget-idle-rpg/id556886960
- Reddit (S&F P2W perception thread): https://www.reddit.com/r/shakesandfidget/comments/jpz8j5

- Melvor Idle (Steam): https://store.steampowered.com/app/1267910/Melvor_
- Melvor Offline progression wiki: https://wiki.melvoridle.com/w/Offline_Progression
- Idle Clans official: https://www.idleclans.com/
- Idle Clans Steam: https://store.steampowered.com/app/2103530/Idle_Clans/
- SimpleMMO about: https://simple-mmo.com/about

---

## 16) Respuesta corta a la pregunta guía

Para que Idleforge pase de base funcional a idle RPG realmente adictivo y moderno, el próximo paso no es añadir social masivo ni más contenido bruto: es **reforzar el núcleo con decisiones recurrentes (contracts, loot direction, forge progression, jobs intencionales y onboarding contextual)**, medir retención, y recién después escalar a profundidad (2.1) y social/endgame (3.0).
