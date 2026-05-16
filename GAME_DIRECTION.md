# GAME_DIRECTION.md

## 1. Diagnóstico

Este documento combina dos entradas: investigación pública de juegos idle/strategy con alta retención y lectura del estado actual del repo. La conclusión principal es que Relic Forge Idle ya tiene muchas piezas correctas para un juego idle estratégico, pero hoy se siente más como un RPG de pestañas que como una red estratégica viva.

### 1.1 Hallazgos por juego investigado

**OGame**

Core loop: producir recursos, construir infraestructura, investigar tecnología, construir flotas, enviar misiones, atacar, comerciar, colonizar y coordinarse con alianzas.

Qué lo vuelve adictivo: timers paralelos, economía acumulativa, posibilidad de planear mientras no se juega, riesgo/recompensa en flotas, expansión a colonias y una fantasía clara de imperio espacial.

Retención diaria: volver para gastar producción acumulada, revisar flotas, iniciar nuevas construcciones, proteger recursos, comerciar y coordinar acciones con alianzas.

Lección aplicable: el jugador no vuelve solo por el resultado de una misión; vuelve porque tiene varias colas que optimizar y porque cada regreso abre una decisión estratégica concreta.

**Ikariam**

Core loop: desarrollar ciudades en islas, recolectar madera y recursos de lujo, investigar tecnologías, comerciar, entrenar tropas y expandirse por diplomacia o guerra.

Qué lo vuelve adictivo: cada isla tiene una identidad económica, el progreso depende de recursos especializados, la ciudad es visible como patrimonio del jugador y el comercio/diplomacia convierten la escasez en decisiones.

Retención diaria: volver para gastar recursos, mover mercancías, actualizar edificios, revisar investigación, preparar tropas y sostener la economía de varias ciudades.

Lección aplicable: los materiales regionales de Relic Forge Idle pueden sentirse como "islas económicas" si la UI los convierte en rutas, puestos y proyectos regionales, no solo en números.

**Gladiatus**

Core loop: mejorar gladiador, hacer expediciones, combatir en arena/dungeons, obtener oro/items, equipar mejor gear y volver a combatir.

Qué lo vuelve adictivo: sesiones cortas, enemigos con identidad, loot frecuente, muchas piezas de equipo, progresión de personaje y guilds como capa social.

Retención diaria: gastar puntos/tiempos de expedición, revisar arena, buscar mejor equipo y progresar contra enemigos o dungeons.

Lección aplicable: Relic Forge Idle ya está cerca de este patrón por expediciones, bosses, equipo, traits y dungeons. La diferencia es que necesita presentar mejor el valor de la preparación y la colección.

**Travian**

Core loop: mejorar campos de recursos, construir edificios, entrenar tropas, raid a objetivos, fundar aldeas, integrarse en alianzas y competir por el objetivo final del servidor.

Qué lo vuelve adictivo: mapa compartido, ritmo de timers, amenaza externa, especialización de aldeas, rondas de servidor, alianzas y objetivos de largo plazo.

Retención diaria: volver para no desperdiciar producción, mantener colas, hacer raids, responder ataques y coordinar defensa/ofensiva con la alianza.

Lección aplicable: no conviene copiar el PvP destructivo ahora, pero sí el sentimiento de "aldeas/rutas/puestos que producen y necesitan órdenes".

**Forge of Empires**

Core loop: construir ciudad, producir recursos/bienes, investigar tecnologías, avanzar de edad, conquistar provincias y participar en actividades sociales/eventos.

Qué lo vuelve adictivo: avance visible de civilización, árbol de investigación, mapa de continente, edificios especiales, eventos constantes y muchas metas paralelas.

Retención diaria: recoger producción, iniciar nuevas investigaciones, resolver mapa, participar en eventos, ayudar/interactuar con otros jugadores y optimizar ciudad.

Lección aplicable: Reincarnation/Soul Marks puede evolucionar hacia "eras de la guild" si cada reset desbloquea una nueva forma de organizar la frontera.

**Clash of Clans**

Core loop: construir aldea, entrenar tropas, atacar bases, ganar recursos, mejorar edificios/defensas/tropas y participar en clan wars/raids/eventos.

Qué lo vuelve adictivo: base propia visible, timers de construcción, builders como cuello de botella, raids cortas, progreso social de clan y recompensas de temporada.

Retención diaria: recoger recursos, mantener builders ocupados, donar/recibir apoyo, atacar para llenar almacenes y contribuir a objetivos de clan.

Lección aplicable: el "Clan Capital" demuestra una idea potente para Relic Forge Idle: proyectos distritales donde cada contribución restaura ruinas y mejora una región. Se puede adaptar en solitario como Outpost Projects.

**Rise of Kingdoms**

Core loop: elegir civilización, construir ciudad, entrenar tropas, recolectar recursos, explorar niebla, mover comandantes en mapa, atacar objetivos y crecer con alianza.

Qué lo vuelve adictivo: mapa continuo, exploración, alianzas, territorio, comandantes con progresión RPG, múltiples marchas simultáneas y eventos de servidor.

Retención diaria: enviar tropas a recolectar, explorar, completar eventos, coordinar con alianza y mantener crecimiento de ciudad/comandantes.

Lección aplicable: el juego actual tiene héroe, regiones y caravan, pero no comunica "movimiento sobre mapa". La migración de estilo debería hacer visible la frontera y las órdenes simultáneas, aunque siga siendo local-first.

**Cookie Clicker e idle games modernos**

Core loop: generar recurso, comprar productores/upgrades, aumentar producción por segundo, desbloquear logros/minijuegos, prestigiar y repetir con multiplicadores permanentes.

Qué lo vuelve adictivo: números que suben, upgrades frecuentes, logros, metas visibles, automatización, prestige y sensación de progreso incluso offline.

Retención diaria: volver para ver acumulación, comprar mejoras, desbloquear hitos, activar eventos/bonos y decidir cuándo resetear.

Lección aplicable: Relic Forge Idle tiene Account Rank, Mastery, Soul Marks y eventos, pero le falta una lectura instantánea de "mi red produce X, mis órdenes vuelven en Y, mi próximo salto es Z".

### 1.2 Patrones de retención detectados

**Timers con decisión al volver:** OGame, Travian, Clash of Clans y Rise of Kingdoms no usan el timer como espera pasiva; el timer prepara una decisión de inversión, ataque, defensa o expansión.

**Múltiples escalas de loop:** los mejores juegos combinan acciones cortas, metas de sesión, proyectos diarios/semanales y objetivos de cuenta.

**Identidad espacial:** ciudades, aldeas, planetas, islas, mapas y bases hacen que el progreso sea visible como territorio propio.

**Economía con fuente y sink claros:** los recursos funcionan cuando cada uno tiene una fuente reconocible y un gasto emocionalmente legible.

**Social como acelerador de retención:** alianzas, guilds y clanes aumentan longevidad, pero requieren backend, moderación, anti-cheat y soporte operativo.

**Prestige con promesa nueva:** los resets funcionan cuando no solo multiplican números, sino que abren una capa de decisión o identidad.

**Eventos no punitivos:** eventos exitosos dan razones para volver sin invalidar progreso ni castigar ausencia.

**Patrón Gameforge inferido:** OGame, Ikariam y Gladiatus comparten browser-first, sesiones cortas, progreso asíncrono, economía acumulativa, timers, guild/alliance como capa de largo plazo y una fantasía de ascenso incremental. Esto es una inferencia desde sus páginas públicas, no un documento oficial de diseño interno.

### 1.3 Qué tiene el juego hoy

Relic Forge Idle es un RPG idle local-first en Next.js/React con estado en Zustand, lógica determinística en `src/game`, UI en `src/app/game-view.tsx` y persistencia por `localStorage`.

La fantasía actual es controlar un héroe/guild de relic hunting que corre rutas regionales, reclama loot, mejora equipo, construye town, prepara bosses, envía caravans y reincarna para ganar Soul Marks.

Sistemas ya implementados y fuertes:

**Expediciones con timer:** existen rutas desbloqueables por región, active expedition, claim, éxito/fallo, Focus boost y bosses.

**Regiones y progresión geográfica:** hay 5 regiones activas, 20 dungeons y 5 bosses con materiales regionales: Sunlit Timber, Ember Resin, Archive Glyph, Stormglass Shard y Oath Ember.

**Gear/buildcraft:** hay inventario, rarezas, affixes, traits, familias, resonance, presets, locks, equip best, sell y salvage.

**Boss prep:** bosses nombrados, scouting, threats, prep con Focus/material, intel de derrota y counters por traits.

**Town:** Forge, Mine, Tavern, Library, Market y Shrine con niveles, costos, construcción por timer, cancelación y aceleración por Focus.

**Outposts:** cada región puede asignar un bonus tras derrotar su boss.

**Caravan:** una caravan regional activa, con foco de recompensa, duración, mastery regional y offline completion.

**Daily/weekly/event layer:** daily missions, daily focus, weekly quest, weekly contracts legacy, achievements, trophies, titles, showcase y evento Guild Foundry Festival.

**Reincarnation:** Soul Marks, upgrades permanentes, class change y progresión de cuenta.

### 1.4 Qué falla hoy

El juego tiene más profundidad sistémica que presencia visual. Las mejores ideas existen en el código, pero el jugador no las siente como una estrategia unificada.

El core loop actual es: elegir ruta, esperar, reclamar, revisar loot, equipar/vender/salvage, gastar recursos, repetir hasta boss/reincarnation. Funciona, pero es lineal comparado con OGame/Travian/Clash/RoK, donde el jugador vuelve para administrar varias decisiones simultáneas.

La UI organiza el juego por tabs funcionales, no por decisiones del jugador. "Expeditions", "Town", "Forge", "Missions" y "Account" son correctos técnicamente, pero no comunican una frontera viva.

Town y Outposts son estratégicos en datos, pero no se sienten como base/territorio. Esto debilita una de las armas más fuertes de los juegos investigados: apego a un lugar propio.

Caravan es potente, pero hoy compite con expediciones porque bloquea nuevas expeditions. Eso la hace sentirse como pausa, no como logística.

Las regiones tienen materiales y completion, pero todavía se leen como listas de rutas. Ikariam, Travian y RoK enseñan que la geografía retiene más cuando cada zona tiene rol económico y estado visual.

Daily/weekly/event existen, pero están fragmentados. En juegos exitosos, estas capas se sienten como un "tablero de órdenes" o una "temporada", no como listas separadas.

El offline summary es honesto pero subaprovechado. Cookie Clicker e idle modernos dependen de que volver al juego sea inmediatamente satisfactorio.

Hay deuda de comunicación de progreso: el jugador necesita ver en una sola pantalla qué está produciendo, qué está bloqueado, qué proyecto conviene y qué vuelve pronto.

### 1.5 Mecánicas presentes pero subexpuestas

**Outposts:** existen bonus por región, pero falta venderlos como control territorial y como "puesto avanzado" visible en mapa.

**Caravan Mastery:** tiene tiers y recompensas, pero no está en el centro de la planificación diaria.

**Boss intel:** la información de derrota y scouting es buena, pero debería sentirse como War Room y no como texto secundario.

**Collections y dust:** las colecciones tienen pity y dust por duplicados, pero el dust no tiene sink activo claro.

**Daily caravan objective:** existe el tipo de misión `complete_caravan`, pero está bloqueado por `hasCaravanDailyObjectiveUnlocked` devolviendo false.

**Weekly contracts legacy:** hay milestones y claim, pero `weekly.progress` no parece conectado al avance moderno.

**Mine offline:** la Mine promete generación offline, pero `applyOfflineProgress` hoy deja `mineGains` vacío.

**Theme/docs:** hay documentación que menciona light/dark toggle, mientras UI polish rules y layout actual apuntan a dark-only. Para una migración de estilo esto debe resolverse antes de diseñar.

### 1.6 Qué falta completamente frente a los referentes

**Mapa estratégico:** no hay pantalla central de frontera, rutas, puestos, bosses, caravans y proyectos.

**Colas/logística paralela:** falta la sensación OGame/Travian/CoC de tener varias órdenes en progreso con roles distintos.

**Base visual propia:** Town existe como tabla de buildings, pero no como identidad visual comparable a aldea/ciudad/base.

**Raids o scouting PvE:** falta un loop de riesgo/recompensa de atacar objetivos NPC o explorar rutas para elegir botín.

**Trade/economía regional:** los materiales regionales son buenos, pero no hay rutas de intercambio, especialización o conversión estratégica.

**Social real:** alianzas/guilds/clanes no existen y no deberían agregarse sin backend.

**Eventos rotativos:** hay un evento inicial, pero no una estructura viva de temporadas o modificadores variados.

**Prestige como nueva era:** Reincarnation da Soul Marks, pero todavía no cambia suficientemente la forma de jugar.

## 2. Nueva dirección propuesta

La mejor dirección es convertir Relic Forge Idle en un **idle strategy RPG de red de gremio y frontera**.

No conviene convertirlo en ciudad pura, PvP, MMO social ni clicker abstracto. El código ya tiene una ventaja diferencial: combina expediciones RPG, bosses con preparación, loot/buildcraft, town, outposts, caravan, regiones y reincarnation. La evolución más fuerte es unir todo eso bajo una fantasía estratégica: el jugador no solo corre dungeons; administra una guild que reconstruye rutas, puestos y operaciones hacia la First Forge.

### 2.1 Identidad del juego

**Relic Forge Idle es un juego de estrategia idle sobre dirigir un gremio de reliquias que restaura una frontera perdida.**

El jugador es el Guildmaster/Relic Warden. Cada región es un frente económico y narrativo. Cada expedición es una orden. Cada caravan es logística. Cada outpost es control territorial. Cada boss es una operación militar. Cada reincarnation es una nueva carta fundacional de la guild.

### 2.2 Fantasía del jugador

"Quiero sentir que estoy reconstruyendo una red antigua de rutas, puestos y forjas. Cuando vuelvo al juego, quiero ver informes de mis órdenes, reclamar botín, reforzar una región, preparar un boss y dejar un plan funcionando."

La emoción deseada no es solo "mi héroe pegó más fuerte". Es "mi gremio domina mejor la frontera".

### 2.3 Core loop rediseñado

**Mirar el Command Center:** ver órdenes activas, recursos regionales, construcción, caravan, boss prep, evento y próximo objetivo.

**Elegir una orden:** enviar expedición, iniciar caravan, invertir en construcción, preparar boss, completar daily order o trabajar en collection/mastery.

**Esperar con intención:** los timers representan operaciones en curso, no pantallas bloqueadas.

**Volver y reclamar informe:** el juego muestra qué volvió, qué subió, qué se desbloqueó y qué decisión conviene ahora.

**Invertir en la red:** gastar gold, fragments y materiales regionales en Town, Outposts, Forge, Boss Prep, Orders y Reincarnation upgrades.

**Expandir frontera:** desbloquear región, fundar/reforzar outpost, derrotar boss, activar nuevas rutas y preparar la siguiente capa.

**Reincarnar como nueva carta de guild:** resetear parte del progreso para fortalecer una identidad permanente y abrir nuevas opciones de planificación.

### 2.4 Diferenciador frente a competencia

El diferencial debe ser: **la profundidad de un browser strategy, sin PvP punitivo ni presión social obligatoria, mezclada con loot RPG y bosses preparados.**

OGame/Travian/CoC retienen por colas, bases, recursos y raids. Gladiatus retiene por gear y expediciones. Cookie Clicker retiene por prestige y números. Relic Forge Idle puede ocupar un espacio propio: strategy idle PvE, local-first, con una frontera que progresa incluso sin backend.

Esto también es pragmático: permite migrar estilo y dirección usando sistemas existentes antes de asumir el costo de multiplayer.

## 3. Cambios de alto impacto, bajo riesgo

Estos cambios deberían poder hacerse en días, sin tocar engine ni tests. Son cambios de framing, UI y composición usando derivados ya existentes.

### 3.1 Command Center arriba del juego

Qué es: una pantalla/resumen inicial que muestre active expedition, caravan, construction, next boss, daily/weekly/event claimables, Focus y recursos regionales importantes.

Por qué importa: los juegos investigados retienen porque el jugador sabe inmediatamente qué volvió y qué debe ordenar ahora.

Cómo implementarlo: componer datos ya disponibles en `game-view.tsx` con helpers existentes como `getEventBannerSummary`, `getActiveConstructionProgress`, `getCaravanMasterySummaries`, `getFeaturedBoss`, `getNextGoal` y resumen de dailies.

Archivos: `src/app/game-view.tsx`, `src/app/globals.css`.

### 3.2 Renombrar la navegación hacia fantasía estratégica

Qué es: cambiar copy visible sin cambiar modelos. "Expeditions" pasa a "Frontier", "Town" a "Guildhall", "Missions" a "Orders", "Account" a "Legacy", "Save" a "Archives".

Por qué importa: los sistemas actuales son buenos, pero la nomenclatura técnica reduce fantasía.

Cómo implementarlo: actualizar labels, headers y microcopy en UI. Mantener IDs internos para no tocar lógica.

Archivos: `src/app/game-view.tsx`.

### 3.3 Frontier Map con regiones como frentes

Qué es: una vista de regiones que muestre cada zona como card territorial: rutas completadas, boss, outpost, material, collection, caravan mastery y próximo unlock.

Por qué importa: Ikariam, Travian, RoK y FoE hacen que la geografía sea parte del progreso. El juego ya tiene 5 regiones, pero necesita visualizarlas como mapa.

Cómo implementarlo: reutilizar `ZONES`, `getRegionCompletionSummary`, `getRegionMaterialId`, `getRegionDiarySummary`, `getRegionCollectionSummary`, `getOutpostBonusDefinition` y estado de boss.

Archivos: `src/app/game-view.tsx`, `src/app/globals.css`.

### 3.4 Orders Board unificado

Qué es: una vista o panel lateral que unifique daily missions, weekly quest, event tiers, claimable mastery, construction ready y caravan ready.

Por qué importa: FoE, CoC y RoK usan eventos/quests como carril de retorno. Hoy esas señales están distribuidas.

Cómo implementarlo: no crear sistema nuevo; solo agrupar señales existentes y ordenarlas por "claimable", "ready soon", "progress".

Archivos: `src/app/game-view.tsx`.

### 3.5 War Room para el próximo boss

Qué es: mostrar siempre el boss de la región actual como operación: threats conocidas, scout cost, prep coverage, trait counters, chance estimada y recompensa.

Por qué importa: el boss prep es una de las mecánicas más diferenciadas del juego, pero debe sentirse como preparación militar.

Cómo implementarlo: usar `getBossViewSummary`, `getBossScoutCost`, `getBossPrepMaterialCost`, traits y materiales existentes.

Archivos: `src/app/game-view.tsx`.

### 3.6 Reporte de retorno más dramático

Qué es: al volver offline o reclamar una expedición, mostrar un "Guild Report" con ganancias, timers completados, mejoras desbloqueadas y próxima recomendación.

Por qué importa: en idle games, el momento de volver debe pagar emocionalmente.

Cómo implementarlo: mejorar presentación del `offline.summary` y del `ResolveSummary` existente. No resolver expediciones offline todavía; solo mostrar mejor lo que ya está listo.

Archivos: `src/app/game-view.tsx`, `src/app/globals.css`.

### 3.7 Town como proyectos, no lista de upgrades

Qué es: presentar buildings como proyectos de gremio con propósito, próximo milestone, costo faltante y efecto en la red.

Por qué importa: Clash, Ikariam y FoE retienen por apego a edificios. La Town actual tiene buena data, pero parece una tabla.

Cómo implementarlo: cambiar layout/copy usando `BUILDINGS`, costs y construction state existentes.

Archivos: `src/app/game-view.tsx`.

### 3.8 Separar "qué hago ahora" de "qué puedo optimizar"

Qué es: priorizar una sola recomendación principal y mover optimizaciones profundas a paneles secundarios.

Por qué importa: el juego ya tiene muchos sistemas. Sin jerarquía, un jugador nuevo ve complejidad antes de ver propósito.

Cómo implementarlo: usar `getNextGoal` como CTA principal y debajo listar acciones secundarias: claim, equip, build, prep, caravan.

Archivos: `src/app/game-view.tsx`.

## 4. Propuestas medianas (semanas, alto valor)

Estas propuestas sí tocan lógica, tipos, saves y tests. Conviene implementarlas después del framing UI para validar si la nueva dirección se siente correcta.

### 4.1 Frontier Command Map

Descripción: reemplazar la lectura de "lista de expediciones" por un mapa/board de regiones con nodos: rutas, boss, outpost, caravan route, collection, material sink y proyecto activo.

Juego que lo hace bien: Travian y Rise of Kingdoms por mapa estratégico; Forge of Empires por mapa de continente; Ikariam por islas con recursos.

Adaptación al juego actual: no hace falta mapa 2D real inicialmente. Puede ser un board de 5 columnas/regiones con estado, progresión y órdenes. La lógica ya existe en regions, dungeons, boss prep, outposts y caravan.

Archivos a tocar: `src/game/regions.ts`, `src/game/progression.ts`, `src/game/types.ts`, `src/store/useGameStore.ts`, `src/app/game-view.tsx`, posible `src/app/components/frontier-map.tsx`, tests en `src/game/__tests__/core.test.ts` o suite separada.

### 4.2 Logistics Queues

Descripción: separar órdenes por tipo: Expedition, Caravan, Construction y Forge Order. La meta es que el jugador pueda dejar varias operaciones razonables corriendo, con límites claros.

Juego que lo hace bien: OGame por flotas/colonias/investigación; Travian por construcción/tropas/raids; Clash of Clans por builders y timers.

Adaptación al juego actual: mantener una expedition activa al principio, pero dejar que Caravan no bloquee expeditions. Más adelante agregar Forge Order como timer de crafting/upgrade. Cada cola debe tener propósito y cap.

Archivos a tocar: `src/game/types.ts`, `src/game/state.ts`, `src/game/caravan.ts`, `src/game/engine.ts`, `src/game/offline.ts`, `src/game/save.ts`, `src/store/useGameStore.ts`, `src/app/game-view.tsx`, tests de offline y concurrencia.

### 4.3 Outpost Projects

Descripción: convertir outposts de bonus único a proyectos regionales con niveles, ruinas restaurables y dos o tres especializaciones: Supply, Watch, Relic Survey, Training.

Juego que lo hace bien: Clash of Clans Clan Capital por distritos/proyectos; Ikariam por ciudades con recursos; Travian por aldeas especializadas.

Adaptación al juego actual: usar el outpost actual como nivel 1. Después de cada boss clear, la región desbloquea proyectos que consumen material regional y dan mejoras pequeñas, visibles y permanentes.

Archivos a tocar: `src/game/outposts.ts`, `src/game/regions.ts`, `src/game/types.ts`, `src/game/state.ts`, `src/game/save.ts`, `src/game/progression.ts`, `src/store/useGameStore.ts`, `src/app/game-view.tsx`, tests de saves y bonus.

### 4.4 Guild Orders System

Descripción: unificar daily missions, weekly quest, weekly contracts legacy y event tiers bajo un modelo de Orders con categorías: Daily, Weekly, Region, Event, Legacy.

Juego que lo hace bien: Forge of Empires por eventos y quests; Clash of Clans por Season Challenges y Clan Games; Rise of Kingdoms por eventos constantes.

Adaptación al juego actual: no crear una economía nueva. Reutilizar rewards actuales, corregir `complete_caravan`, retirar o conectar `weekly.progress` legacy y mostrar todo en un Orders Board.

Archivos a tocar: `src/game/dailies.ts`, `src/game/events.ts`, `src/game/types.ts`, `src/game/state.ts`, `src/game/save.ts`, `src/store/useGameStore.ts`, `src/app/game-view.tsx`, tests de reset/progreso/claim.

### 4.5 PvE Raids y Scouting Contracts

Descripción: agregar objetivos NPC de riesgo/recompensa: resource cache, relic convoy, monster camp, cursed vault. El jugador elige composición/prep, duración y recompensa esperada.

Juego que lo hace bien: Travian por raids; OGame por expeditions/fleet missions; Clash of Clans por raids cortas; RoK por barbarian forts.

Adaptación al juego actual: hacerlo sin PvP. Usar power, traits, boss threats y materiales regionales. Los raids pueden ser "expediciones especiales" con costos/recompensas y counters.

Archivos a tocar: nuevo `src/game/raids.ts` o extensión de `src/game/expeditions.ts`, `src/game/bosses.ts`, `src/game/types.ts`, `src/game/save.ts`, `src/store/useGameStore.ts`, `src/app/game-view.tsx`, tests de resolución.

### 4.6 Forge Orders y Target Farming

Descripción: darle al Forge una capa de planificación: órdenes de slot, contratos de salvage, upgrades objetivo, pedidos de guild y rerolls con límites.

Juego que lo hace bien: Gladiatus por importancia de equipo; Cookie Clicker por upgrades frecuentes; Clash of Clans por builder/forge como inversión diaria.

Adaptación al juego actual: ya existen Forge, item slots, affixes, fragments, regional materials y loot focus. La mejora es convertir RNG en objetivos dirigidos sin eliminar emoción.

Archivos a tocar: `src/game/forge.ts`, `src/game/inventory.ts`, `src/game/loot.ts`, `src/game/types.ts`, `src/game/save.ts`, `src/store/useGameStore.ts`, `src/app/game-view.tsx`, tests de costos y límites.

### 4.7 Reincarnation como Guild Charter

Descripción: rediseñar Reincarnation para que cada reset sea una carta fundacional de guild: elegir una doctrina permanente como Expedition Network, Forge Lineage, Boss Hunters o Caravan League.

Juego que lo hace bien: Cookie Clicker por prestige y heavenly upgrades; Forge of Empires por avance de eras; Travian por rondas que invitan a reintentar estrategia.

Adaptación al juego actual: mantener Soul Marks, pero hacer que ciertas upgrades abran variaciones de estrategia, no solo números. No resetear todo de forma punitiva.

Archivos a tocar: `src/game/prestige.ts`, `src/game/progression.ts`, `src/game/types.ts`, `src/game/state.ts`, `src/game/save.ts`, `src/app/game-view.tsx`, tests de migración y upgrades.

### 4.8 Event Seasons data-driven

Descripción: transformar el evento actual en un sistema de temporadas no punitivas con modificadores, reward schedule, catch-up y objetivos regionales.

Juego que lo hace bien: Forge of Empires por eventos recurrentes; Clash of Clans por Season Challenges/Raid Weekends; Rise of Kingdoms por calendario de eventos.

Adaptación al juego actual: `events.ts` ya existe. Expandirlo con más definiciones, rotación local, variantes de bonus y UI de calendario. Mantener recompensas sin poder permanente exclusivo.

Archivos a tocar: `src/game/events.ts`, `src/game/types.ts`, `src/game/save.ts`, `src/store/useGameStore.ts`, `src/app/game-view.tsx`, tests de activación/claim/migración.

## 5. Lo que NO hacer

No construir PvP, guilds, chat, raids contra jugadores ni rankings competitivos mientras el juego siga siendo local-first. Sería fácil de cheatear, caro de operar y distrae de la fortaleza PvE actual.

No copiar presión destructiva de OGame/Travian como resource theft, ataques mientras el jugador duerme o pérdida severa de progreso. Ese modelo retiene a una audiencia específica, pero no encaja con un idle local-first sin backend.

No agregar 10 monedas nuevas. Los materiales regionales ya alcanzan para expresar geografía; el problema actual es presentación y sinks, no cantidad de recursos.

No convertirlo en ciudad builder puro. La ventaja diferencial es RPG loot + boss prep + strategy idle. Una ciudad sin expediciones perdería identidad.

No hacer una migración visual antes de definir la jerarquía de decisiones. Un re-skin sin Command Center, Frontier Map y Orders Board solo embellece la confusión.

No meter gacha, speedups pagos, timers abusivos o FOMO agresivo. Si algún día hay monetización, debe ser cosmética o conveniencia transparente.

No mantener Caravan bloqueando el core loop si la nueva dirección es logística estratégica. Puede ser aceptable en MVP, pero a mediano plazo contradice la fantasía de red.

No expandir outposts con árboles enormes antes de modularizar UI y estabilizar save/tests. Outpost Projects deben empezar pequeños.

No ignorar la deuda de `game-view.tsx`. Cualquier rediseño de estilo serio sobre un archivo de casi 4.800 líneas va a aumentar riesgo si no se extraen componentes gradualmente.

No resolver "adicción" con castigo por ausencia. La retención buscada debe venir de claridad, progreso y planificación, no de ansiedad.

## 6. Roadmap sugerido

### Fase 0 - Alineación de dirección

Duración estimada: 1 a 2 días.

Objetivo: cerrar decisión de producto antes de tocar engine.

Entregables: este `GAME_DIRECTION.md`, definición de identidad visual, glosario de copy, decisión dark-only vs theme toggle y lista de componentes UI a extraer.

### Fase 1 - Rediseño de percepción sin engine

Duración estimada: 3 a 5 días.

Objetivo: hacer que el juego se sienta estratégico con sistemas existentes.

Entregables: Command Center, navegación renombrada, Frontier Map v0, Orders Board visual, War Room para boss, Guild Report de retorno y Town como proyectos.

Archivos principales: `src/app/game-view.tsx`, `src/app/globals.css`, posible extracción de componentes en `src/app/components`.

### Fase 2 - Deuda UI mínima

Duración estimada: 3 a 5 días.

Objetivo: reducir riesgo antes de features medianas.

Entregables: extraer componentes grandes de `game-view.tsx`, mantener comportamiento igual, validar mobile/desktop y no mover lógica de dominio a UI.

Archivos principales: `src/app/game-view.tsx`, nuevos componentes UI, docs de arquitectura si cambia estructura.

### Fase 3 - Orders y Outpost Projects

Duración estimada: 1 a 2 semanas.

Objetivo: convertir sistemas existentes en retención clara.

Entregables: Guild Orders unificado, `complete_caravan` activo cuando corresponda, weekly legacy resuelto, outposts con proyectos iniciales y sinks regionales más visibles.

Archivos principales: `src/game/dailies.ts`, `src/game/events.ts`, `src/game/outposts.ts`, `src/game/types.ts`, `src/game/save.ts`, `src/store/useGameStore.ts`, UI y tests.

### Fase 4 - Logistics Queues y offline report real

Duración estimada: 2 a 3 semanas.

Objetivo: acercarse al loop OGame/Travian/CoC sin backend.

Entregables: Caravan no bloquea expeditions, colas diferenciadas, Forge Orders si entra en scope, offline summary con más recompensas reales y Mine offline implementada o copy corregida.

Archivos principales: `src/game/caravan.ts`, `src/game/offline.ts`, `src/game/town.ts`, `src/game/forge.ts`, `src/game/save.ts`, `src/store/useGameStore.ts`, UI y tests.

### Fase 5 - Raids PvE y target farming

Duración estimada: 2 semanas.

Objetivo: agregar decisiones activas de riesgo/recompensa sin PvP.

Entregables: contratos de scouting/raid NPC, rewards por objetivo, counters por traits/prep y Forge Orders de slot.

Archivos principales: `src/game/expeditions.ts` o `src/game/raids.ts`, `src/game/bosses.ts`, `src/game/forge.ts`, `src/game/loot.ts`, `src/game/types.ts`, `src/game/save.ts`, UI y tests.

### Fase 6 - Reincarnation como Guild Charter y Seasons

Duración estimada: 2 a 4 semanas.

Objetivo: dar largo plazo y rejugabilidad.

Entregables: Soul Marks con doctrinas de guild, seasons data-driven, eventos no punitivos, catch-up y metas regionales.

Archivos principales: `src/game/prestige.ts`, `src/game/events.ts`, `src/game/progression.ts`, `src/game/types.ts`, `src/game/save.ts`, UI y tests.

### Fase 7 - Social/backend solo si la retención PvE ya funciona

Duración estimada: proyecto separado.

Objetivo: evaluar cloud save, cuentas, guild-lite PvE o async arena.

Condición de entrada: UI modularizada, save versioning más explícito, tests por dominio, telemetría o feedback manual que demuestre que el loop PvE ya retiene.

### Fuentes consultadas

OGame: https://en.ogame.gameforge.com/ajax/main/info/

Ikariam: https://gameforge.com/en-US/play/ikariam?locale=en_US

Gladiatus: https://gameforge.com/en-GB/play/gladiatus

Travian: https://support.travian.com/en/support/solutions/articles/7000091805-what-is-travian-legends-

Forge of Empires: https://en0.forgeofempires.com/page/the_game/basics/

Clash of Clans Clan Capital: https://supercell.com/en/games/clashofclans/blog/game-updates/capital-forge/

Clash of Clans Raid Weekends: https://supercell.com/en/games/clashofclans/blog/game-updates/clan-capital-raids/

Rise of Kingdoms App Store: https://apps.apple.com/us/app/rise-of-kingdoms/id1354260888

Cookie Clicker Steam: https://store.steampowered.com/app/1454400/

Idle game design, Machinations: https://machinations.io/articles/idle-games-and-how-to-design-them

Core loop retention, Boomie Studio: https://boomiestudio.com/blog/creating-addictive-loops

Player retention research, Park et al.: https://arxiv.org/abs/1702.08005
