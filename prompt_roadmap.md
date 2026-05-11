# Prompt maestro para Codex 5.5 xhigh: investigación y roadmap de Idleforge MVP 2.0 / 2.1 / 3.0

## Contexto

Estoy desarrollando **Idleforge**, un juego idle/RPG/browser-style inspirado en juegos como **Lost Vault**, **Gladiatus**, **Shakes & Fidget** y otros juegos de progresión asincrónica, loot, crafting, energía, clanes, rankings y endgame social.

Quiero que actúes como una mezcla de:

1. **Game designer senior** especializado en idle games, RPGs de navegador, progression design, liveops y retención.
2. **Product manager de juegos free-to-play**, pero priorizando diversión, claridad, fairness y retención sana por encima de monetización agresiva.
3. **Technical design partner** con acceso al código, documentación, assets, arquitectura y estado real del MVP actual de Idleforge.
4. **Investigador de competencia**, usando web pública, Reddit, foros, wikis, reviews, documentación oficial, App Store / Google Play / Steam cuando aplique, y cualquier fuente pública útil.

Tu objetivo no es darme una respuesta superficial. Necesito que investigues, compares, sintetices, propongas alternativas y me ayudes a tomar decisiones iterativamente.

El resultado final de esta primera investigación debe ser un **documento extenso, accionable e iterable** que me permita decidir hacia dónde llevar Idleforge.

---

## Objetivo principal

Preparar un roadmap de producto y diseño para Idleforge dividido en tres etapas:

1. **MVP 2.0 — Core adictivo**  
   El conjunto mínimo de sistemas que convierten el MVP actual en un juego con loop fuerte, progreso claro, recompensas frecuentes, ganas de volver y suficiente profundidad inicial.

2. **MVP 2.1 — Profundidad**  
   Sistemas que agregan builds, variedad, decisiones de mediano plazo, contenido diario/semanal, eventos y más razones para optimizar.

3. **MVP 3.0 — Social / Endgame**  
   Sistemas de clanes, PvP asincrónico, guild bosses, rankings, seasons, raids, cooperación, competencia y contenido de largo plazo.

Para cada sistema propuesto, no quiero una sola recomendación cerrada. Quiero que me presentes **2, 3 o 4 opciones de diseño**, con pros, contras, esfuerzo técnico, riesgos, impacto esperado, dependencias y tu recomendación.

---

## Reglas importantes de trabajo

### 1. Primero inspeccioná Idleforge

Antes de proponer el roadmap, revisá todo lo que puedas del proyecto:

- Código fuente.
- Documentación.
- README.
- Issues, notas, specs o archivos de planning si existen.
- Modelos de datos.
- Backend/frontend.
- Sistemas ya implementados.
- Sistemas parcialmente implementados.
- TODOs o comentarios relevantes.
- Tests.
- Configuración.
- Economía actual si existe.
- UI actual si existe.
- Naming, tono, fantasía y constraints del producto.

Quiero que distingas claramente entre:

- **Lo que ya existe**.
- **Lo que existe parcialmente**.
- **Lo que está documentado pero no implementado**.
- **Lo que estás infiriendo**.
- **Lo que estás proponiendo desde cero**.

Cuando cites algo del repo, mencioná archivo/ruta y, si podés, fragmento o línea aproximada. No inventes estado del proyecto.

### 2. Después investigá competencia

Investigá al menos estos juegos:

- **Lost Vault**.
- **Gladiatus**.
- **Shakes & Fidget**.

Además proponé e investigá otros juegos pertinentes del mismo espacio o adyacentes. Considerá, según disponibilidad de fuentes:

- SimpleMMO.
- Torn.
- Melvor Idle.
- Idle Clans.
- Legends of Idleon.
- Kingdom of Loathing.
- Warshovel.
- Hero Wars solo como referencia de progression/monetization, no como modelo directo.
- OGame / BiteFight / Ikariam / Travian si aportan sistemas sociales o de timers.
- Cualquier otro RPG idle/browser/text/MMO que consideres útil.

No hace falta que todos tengan el mismo peso. Priorizá los que sean más relevantes para Idleforge.

### 3. Usá fuentes públicas y citá links

Buscá información en:

- Sitios oficiales.
- Wikis.
- Patch notes.
- App Store / Google Play.
- Steam, si aplica.
- Reddit.
- Foros.
- Posts de devs.
- Reviews largas de usuarios.
- YouTube solo si podés extraer ideas sin depender de transcripciones dudosas.

Para cada juego, separá:

- Hechos confirmados por fuentes.
- Opiniones de usuarios.
- Inferencias tuyas como diseñador.

Cuando uses Reddit/foros, no te quedes con una sola opinión. Buscá patrones: elogios repetidos, quejas repetidas, cambios que el dev hizo por feedback, y problemas que aparecen en reviews.

### 4. No implementes todavía

En esta tarea inicial, **no modifiques código de Idleforge** salvo que yo te lo pida explícitamente después. Podés crear documentos, notas o archivos de propuesta si hace falta, pero no cambies gameplay, datos, backend ni frontend sin mi confirmación.

### 5. Trabajá de forma iterable conmigo

Tu entregable debe terminar con una sección de **decisiones pendientes** organizada para que yo pueda responder fácil.

Para cada decisión importante, dame opciones tipo:

- **A — opción lean**.
- **B — opción balanceada**.
- **C — opción ambiciosa**.
- **D — opción experimental**, si aplica.

Incluí tu recomendación, pero dejame elegir.

Después de que yo elija, deberías poder producir una segunda iteración más concreta con:

- Spec funcional.
- Scope cerrado.
- Modelo de datos sugerido.
- Endpoints o servicios necesarios.
- UI flows.
- Balance inicial.
- Plan de implementación.
- Riesgos.
- Tests.

---

## Parte 1: análisis del estado actual de Idleforge

Antes de hablar de juegos externos, generá una sección llamada:

# Estado actual de Idleforge

Incluí:

## 1. Resumen del producto actual

Explicá en lenguaje simple qué es Idleforge hoy según el repo/docs.

## 2. Sistemas existentes

Tabla sugerida:

| Sistema | Estado | Archivos relevantes | Comentario |
|---|---:|---|---|
| Ejemplo: inventario | Implementado / parcial / ausente | `ruta/...` | Qué hace hoy y qué falta |

## 3. Loop actual

Describí el loop actual real:

1. Qué hace el jugador.
2. Qué gana.
3. Qué puede gastar.
4. Qué desbloquea.
5. Qué motivo tiene para volver.

Si el loop todavía no está claro o está incompleto, decilo explícitamente.

## 4. Diagnóstico de diseño

Evaluá:

- Claridad del objetivo del jugador.
- Velocidad de progreso.
- Cantidad de decisiones por sesión.
- Cantidad de recompensas por acción.
- Profundidad del loot/crafting.
- Motivos para volver a las 2h, 8h, 24h, 7 días.
- Estado de onboarding.
- Estado de economía.
- Estado de social/endgame.

Usá esta escala:

- **0 = ausente**.
- **1 = básico**.
- **2 = funcional pero débil**.
- **3 = sólido para MVP**.
- **4 = fuerte**.
- **5 = muy fuerte / benchmark**.

## 5. Constraints técnicos y de scope

Decime qué limitaciones ves:

- Arquitectura.
- Persistencia.
- Estado del backend.
- Estado del frontend.
- Balance data-driven o hardcodeado.
- Capacidad de testear.
- Sistemas que conviene evitar por ahora.
- Quick wins técnicos.

---

## Parte 2: investigación de juegos comparables

Generá una sección por juego con este formato.

# Teardown de [Nombre del juego]

## 1. Perfil general

- Plataforma.
- Género.
- Fantasía principal.
- Promesa al jugador.
- Público probable.
- Antigüedad / estado actual si está disponible.

## 2. Core loop

Describí el loop principal en pasos claros.

Ejemplo:

1. Entrar.
2. Reclamar recursos.
3. Gastar energía en exploración/aventuras.
4. Ganar XP, oro, loot y progreso.
5. Mejorar personaje/equipo/base.
6. Iniciar tarea offline.
7. Volver cuando se recarguen timers.

## 3. Sistemas de progresión

Separá por capas:

- Nivel de personaje.
- Stats / atributos.
- Clases / subclases.
- Gear / equipo.
- Raridades.
- Crafting / upgrades.
- Base / edificios.
- Quests / logros.
- Dungeons / bosses.
- PvP.
- Guilds / clanes.
- Rankings.
- Seasons / eventos.
- Prestigio / reset, si existe.

## 4. Economía

Mapeá:

- Sources: de dónde vienen recursos.
- Sinks: dónde se gastan.
- Timers.
- Energía.
- Inventario.
- Monetización.
- Premium currency, si existe.
- Riesgos de pay-to-win o fricción.

## 5. Reward design

Analizá:

- Qué recompensas son frecuentes.
- Qué recompensas son raras.
- Qué genera dopamina.
- Qué se puede anticipar.
- Qué es sorpresa.
- Qué recompensa aunque el jugador falle.
- Qué evita que una sesión se sienta desperdiciada.

## 6. Retención y adicción sana

Identificá los mecanismos de retención:

- Daily login.
- Energía/timers.
- Dailies/weeklies.
- Loot chase.
- Social pressure.
- Rankings.
- Eventos.
- Guild responsibilities.
- Offline jobs.
- Milestones.
- Collection.
- Power fantasy.

Separá lo que es buen diseño de lo que podría ser dark pattern.

## 7. Qué dicen usuarios

Buscá patrones en reviews, Reddit y foros:

- Qué aman.
- Qué odian.
- Qué sistemas se sienten injustos.
- Qué sistemas se sienten adictivos.
- Qué quejas se repiten.
- Qué elogios se repiten.
- Qué problemas de onboarding aparecen.
- Qué problemas de monetización aparecen.

No me des solo citas sueltas. Sintetizá patrones y linkeá fuentes.

## 8. Lecciones para Idleforge

Separá en:

### Cosas copiables/adaptables

### Cosas que deberíamos evitar

### Ideas que encajan especialmente con la fantasía de forja/crafting

### Ideas que no encajan aunque funcionen en ese juego

---

## Parte 3: comparación transversal

Después de los teardowns, generá una sección:

# Matriz comparativa de sistemas

Incluí una tabla como esta:

| Sistema | Lost Vault | Gladiatus | Shakes & Fidget | Otros benchmarks | Relevancia para Idleforge | Riesgo |
|---|---|---|---|---|---:|---:|
| Energía / timers | ... | ... | ... | ... | Alta / Media / Baja | Alto / Medio / Bajo |
| Loot | ... | ... | ... | ... | ... | ... |
| Base/buildings | ... | ... | ... | ... | ... | ... |
| Guilds | ... | ... | ... | ... | ... | ... |

Sistemas mínimos a comparar:

- Energía / stamina / action points.
- Exploración / aventuras / misiones.
- Combate automático.
- Nivel de personaje.
- Atributos.
- Clases/subclases/builds.
- Loot y rarezas.
- Crafting.
- Salvage / reciclaje.
- Upgrades.
- Gems/runes/sockets.
- Inventory pressure.
- Base/buildings.
- Offline jobs.
- Dailies/weeklies.
- Achievements/badges.
- Dungeons/bosses.
- Survival/tower mode.
- PvP asincrónico.
- Arena/ranking.
- Guilds/clanes.
- Guild bosses.
- Raids.
- Seasons/events.
- Monetización.
- Onboarding/tutorial/codex.

---

## Parte 4: pilares de diseño para Idleforge

Proponé entre 4 y 6 pilares de diseño para Idleforge.

Ejemplos posibles, pero adaptalos según el estado real del proyecto:

1. **Cada acción alimenta varios progresos**  
   Una expedición debería avanzar XP, loot, materiales, quests, badges, zona y crafting.

2. **La forja es el corazón, no un menú secundario**  
   Crafting, salvage, upgrades, sockets y recetas deben ser parte central del power progression.

3. **Idle, pero con decisiones**  
   El jugador puede progresar offline, pero cuando entra debe tomar decisiones interesantes.

4. **Timers que ordenan, no bloquean**  
   La energía debería limitar las mejores recompensas, no impedir todo el juego.

5. **Social progresivo, no obligatorio al principio**  
   El juego debe poder disfrutarse solo en MVP 2.0 y volverse social en MVP 3.0.

6. **Fairness y claridad**  
   Evitar frustración innecesaria, pérdidas opacas o monetización agresiva.

Para cada pilar, explicá:

- Qué significa.
- Qué decisiones habilita.
- Qué decisiones prohíbe.
- Cómo se mide.

---

## Parte 5: Roadmap propuesto

Generá el roadmap en tres etapas.

# MVP 2.0 — Core adictivo

Objetivo: convertir Idleforge en un juego que se pueda jugar todos los días con un loop claro, recompensas frecuentes, progresión persistente, loot útil y decisiones suficientes.

Considerá incluir, si tiene sentido:

1. Mapa de expediciones con zonas y bosses.
2. Energía blanda / supplies / stamina.
3. Character Level.
4. Forge Level.
5. Loot con rarezas y affixes.
6. Salvage.
7. Upgrades de equipo.
8. Crafting base.
9. Base / buildings idle.
10. Jobs offline / contracts.
11. Daily quests.
12. Badges / achievements con rewards permanentes.
13. Dungeons con keys.
14. Fame / score / leaderboard simple.
15. Tutorial + Codex.
16. Instrumentación básica de analytics/eventos.

Para cada sistema, presentá una **Feature Card** con este formato:

## Feature Card: [Nombre del sistema]

### Problema que resuelve

### Objetivo de diseño

### Inspiración / benchmarks

### Opciones de diseño

| Opción | Descripción | Pros | Contras | Esfuerzo | Riesgo | Retención esperada | Recomendación |
|---|---|---|---|---:|---:|---:|---|
| A | Lean | ... | ... | Bajo/Medio/Alto | Bajo/Medio/Alto | Baja/Media/Alta | ... |
| B | Balanceada | ... | ... | ... | ... | ... | ... |
| C | Ambiciosa | ... | ... | ... | ... | ... | ... |
| D | Experimental, si aplica | ... | ... | ... | ... | ... | ... |

### Recomendación inicial

### Dependencias

### Cómo encaja con sistemas existentes

### Datos/modelos necesarios

### UI/UX necesaria

### Balance inicial sugerido

Incluí números tentativos cuando aplique:

- Duración de timers.
- Costos.
- Drop rates.
- XP curves aproximadas.
- Cantidad de zonas.
- Capacidad de inventario.
- Número de rarezas.
- Rewards diarios.
- Capacidad de energía.

No tienen que ser perfectos; quiero una primera propuesta balanceable.

### Métricas para validar

### Riesgos / anti-patrones

### Qué dejar fuera de scope

---

# MVP 2.1 — Profundidad

Objetivo: agregar decisiones de mediano plazo, builds, optimización y contenido repetible sin inflar demasiado el scope.

Considerá sistemas como:

1. Subclasses / specializations.
2. Skill tree simple.
3. Gems/runes/sockets profundizados.
4. Reforge de affixes.
5. Shop rotativo.
6. Daily survival / tower mode.
7. Bosses semanales.
8. Eventos temporales simples.
9. Collections / Codex rewards.
10. Sets de equipo.
11. Crafting recipes avanzadas.
12. Companions/pets simples.
13. Primer social liviano: guild list, chat limitado, donations o global leaderboard.

Usá el mismo formato de Feature Card con opciones A/B/C/D.

---

# MVP 3.0 — Social / Endgame

Objetivo: crear retención de largo plazo, cooperación, competencia, identidad de comunidad y metas endgame.

Considerá sistemas como:

1. Guilds/clanes completos.
2. Guild buildings.
3. Guild boss asincrónico.
4. Guild quests.
5. Arena PvP asincrónica.
6. Raids a bases o caravanas, si no es demasiado frustrante.
7. Seasons.
8. Prestige / ascension / reforging legacy.
9. Endgame dungeons.
10. World events.
11. Market/trading, si es viable y seguro.
12. Leaderboards por categorías.
13. Cosmetics/titles/banners.
14. Social notifications.

Usá el mismo formato de Feature Card con opciones A/B/C/D.

---

## Parte 6: diseño de loops

Quiero que modeles explícitamente los loops.

# Loops propuestos para Idleforge

## Loop de sesión corta, 2-5 minutos

Ejemplo:

1. Entrar.
2. Reclamar buildings/jobs.
3. Gastar energía en expediciones.
4. Abrir loot/chests.
5. Salvagear basura.
6. Mejorar item.
7. Completar daily.
8. Iniciar job offline.

## Loop de sesión media, 10-20 minutos

Ejemplo:

1. Optimizar equipo.
2. Intentar boss/dungeon.
3. Crafting/upgrades.
4. Revisar quests.
5. Planificar edificio.

## Loop diario

## Loop semanal

## Loop de 30 días

Para cada loop, explicá:

- Qué acciones incluye.
- Qué recompensa da.
- Qué emoción busca generar.
- Qué sistema empuja al siguiente loop.
- Qué podría aburrir o frustrar.

---

## Parte 7: economía y balance inicial

Creá una propuesta inicial de economía.

# Economía inicial sugerida

Incluí:

## Recursos

Ejemplos posibles:

- Gold.
- Ore.
- Wood.
- Ingots.
- Scraps.
- Gems.
- Forge XP.
- Character XP.
- Energy/Supplies.
- Keys.
- Fame.
- Premium-soft currency si existe o si conviene.

Para cada recurso:

| Recurso | Fuente | Sink | Motivo de existencia | Riesgo |
|---|---|---|---|---|

## Sources and sinks

Mostrá cómo entra y sale cada recurso.

## Timers

Proponé timers iniciales:

- Recarga de energía.
- Producción de edificios.
- Duración de jobs.
- Dailies.
- Weeklies.
- Shop refresh.
- Dungeon cooldowns, si aplica.

## Curvas iniciales

Proponé curvas aproximadas para:

- Character level.
- Forge level.
- Upgrade costs.
- Building costs.
- Zone difficulty.
- Drop rarity.
- Inventory expansion.

No hace falta matemática perfecta, pero sí una base razonable para prototipar.

---

## Parte 8: UX, onboarding y claridad

Diseñá el onboarding de Idleforge MVP 2.0.

# Onboarding propuesto

Incluí:

1. Primera sesión de 5 minutos.
2. Primeros 30 minutos.
3. Primer día.
4. Primeros 7 días.

Para cada etapa:

- Qué sistemas se presentan.
- Qué no se muestra todavía.
- Qué objetivos se le dan al jugador.
- Qué recompensas se entregan.
- Qué tutorial/codex/help se necesita.
- Qué textos o tooltips son críticos.

También identificá errores que deberíamos evitar, especialmente:

- Abrumar con demasiados sistemas.
- Esconder información importante en Discord/wiki.
- Cortar todo el juego cuando se termina la energía.
- Hacer que el loot basura sea inútil.
- Crear upgrades con castigo excesivo.
- Crear PvP que robe demasiado pronto.

---

## Parte 9: priorización

Después de listar sistemas, priorizalos.

# Priorización

Usá una matriz:

| Sistema | Impacto en diversión | Impacto en retención | Esfuerzo técnico | Riesgo de balance | Dependencias | Prioridad |
|---|---:|---:|---:|---:|---|---:|

Escala 1-5 para impacto/esfuerzo/riesgo.

Después agrupá en:

## Must-have MVP 2.0

## Should-have MVP 2.0

## Could-have MVP 2.0

## Explicitly out of scope MVP 2.0

Para cada cosa fuera de scope, explicá por qué.

---

## Parte 10: decisiones pendientes para mí

Terminá con una sección muy clara:

# Decisiones que necesito tomar

Agrupá por tema. Ejemplo:

## 1. Energía

- **A — Hard energy tipo Lost Vault**: corta casi toda acción de progreso cuando se termina.
- **B — Soft energy**: limita expediciones con rewards fuertes, pero permite crafting/training/jobs sin energía.
- **C — Sin energía, con keys/timers diarios**: más libre, menos idle clásico.
- **D — Workers como limitante principal**: el bottleneck son trabajadores asignados.

**Recomendación de Codex:** B.  
**Por qué:** mantiene ritmo idle sin bloquear todo el juego.  
**Costo:** medio.  
**Riesgo:** tuning de rewards.

## 2. Loot

Dame 2-4 opciones.

## 3. Crafting

Dame 2-4 opciones.

## 4. Buildings

Dame 2-4 opciones.

## 5. Social

Dame 2-4 opciones.

## 6. PvP

Dame 2-4 opciones.

Etc.

La idea es que yo pueda responder algo como:

> Energía B, Loot C, Crafting B, Buildings A, Social posponer, PvP A.

Y con eso vos puedas preparar la siguiente iteración.

---

## Parte 11: formato de entrega esperado

Entregá tu investigación en español, bien estructurada, con tablas cuando ayuden.

Idealmente generá o actualizá un documento en el repo, por ejemplo:

`docs/design/idleforge_roadmap_mvp_2_0_2_1_3_0.md`

Si no existe la carpeta, podés sugerir crearla, pero no modifiques código de gameplay todavía.

El documento debe incluir:

1. Estado actual de Idleforge.
2. Teardowns de juegos investigados.
3. Matriz comparativa.
4. Pilares de diseño.
5. Roadmap MVP 2.0.
6. Roadmap MVP 2.1.
7. Roadmap MVP 3.0.
8. Loops propuestos.
9. Economía inicial.
10. Onboarding.
11. Priorización.
12. Decisiones pendientes.
13. Fuentes.

---

## Parte 12: nivel de detalle esperado

No quiero generalidades tipo “agregar más contenido” o “mejorar progresión”. Quiero propuestas concretas.

Mal ejemplo:

> Agregar crafting para que el jugador mejore items.

Buen ejemplo:

> Agregar Forge Level como segunda progresión principal. El Forge Level sube con crafting, salvage y upgrades. Desbloquea nuevas recipes, rarezas craftables, slots de upgrade y edificios.  
>  
> Opción A: crafting simple por recetas fijas. Bajo esfuerzo, buena claridad, poca profundidad.  
> Opción B: crafting con calidad variable y affixes. Esfuerzo medio, más adictivo, requiere balance.  
> Opción C: crafting con order board/economía. Esfuerzo alto, ideal para social/endgame pero no MVP 2.0.  
>  
> Recomiendo B-lite: recetas fijas + 1 affix variable desde Rare en adelante.

Para cada sistema importante, quiero ese nivel de especificidad.

---

## Parte 13: criterios de éxito

Proponé métricas para saber si MVP 2.0 funciona.

Incluí métricas como:

- D1 retention.
- D7 retention.
- Duración promedio de sesión.
- Número de sesiones por día.
- Porcentaje de jugadores que gastan energía.
- Porcentaje que inicia job offline antes de salir.
- Porcentaje que equipa un item nuevo en la primera sesión.
- Porcentaje que salvagea un item.
- Porcentaje que mejora un item.
- Porcentaje que derrota el primer boss.
- Tiempo hasta primer upgrade.
- Tiempo hasta primer edificio.
- Tiempo hasta primer dungeon/key.
- Churn points.

Para cada métrica, sugerí un objetivo inicial razonable o al menos qué tendencia deberíamos buscar.

---

## Parte 14: pensamiento crítico

No te limites a copiar Lost Vault, Gladiatus o Shakes & Fidget.

Quiero que identifiques:

- Qué sistemas envejecieron mal.
- Qué sistemas siguen funcionando.
- Qué sistemas funcionan pero podrían ser frustrantes hoy.
- Qué ideas podemos modernizar.
- Qué ideas no encajan con Idleforge.
- Qué deberíamos hacer distinto para que Idleforge tenga identidad propia.

En particular, prestá atención a:

- Sistemas de energía demasiado restrictivos.
- Falta de acciones cuando se termina la energía.
- Tutoriales pobres.
- Dependencia de Discord/wiki para entender el juego.
- PvP con pérdida de recursos demasiado pronto.
- Monetización pay-to-win.
- Inventario frustrante.
- Upgrades con pérdida/destrucción de items.
- Demasiados sistemas desbloqueados al mismo tiempo.

---

## Parte 15: hipótesis iniciales a validar

Usá estas hipótesis como punto de partida, pero corregilas si la investigación o el repo sugieren otra cosa:

1. Idleforge debería diferenciarse por hacer que **la forja/crafting sea el centro del progreso**, no un sistema secundario.
2. El MVP 2.0 debería tener energía o supplies, pero en formato **soft energy**: limita mejores recompensas, no bloquea toda la experiencia.
3. Cada acción importante debería avanzar múltiples sistemas a la vez.
4. El loot basura debe convertirse en progreso vía salvage/scraps.
5. La base/buildings debe dar progreso idle y motivos para volver.
6. El social completo debería esperar hasta MVP 3.0, pero un leaderboard/Fame simple puede aparecer antes.
7. PvP agresivo o raids con robo deberían evitarse en MVP 2.0.
8. El juego necesita onboarding/codex desde temprano para no depender de explicaciones externas.
9. Dailies y badges deberían empujar a tocar todos los sistemas sin sentirse una checklist pesada.
10. La economía debe estar instrumentada desde el principio para poder balancear.

---

## Parte 16: estructura de una respuesta ideal

Tu respuesta inicial debería tener esta forma:

```md
# Idleforge Roadmap Research: MVP 2.0 / 2.1 / 3.0

## Executive summary

## Estado actual de Idleforge

## Teardowns
### Lost Vault
### Gladiatus
### Shakes & Fidget
### [Otros juegos]

## Matriz comparativa

## Pilares de diseño para Idleforge

## Roadmap recomendado
### MVP 2.0 — Core adictivo
### MVP 2.1 — Profundidad
### MVP 3.0 — Social / Endgame

## Feature cards

## Loops propuestos

## Economía inicial sugerida

## Onboarding

## Priorización

## Decisiones pendientes

## Fuentes
```

---

## Parte 17: modo de interacción después de la primera respuesta

Después de entregarme el documento, esperá mis decisiones.

Cuando yo elija opciones, quiero que puedas hacer una segunda iteración con algo así:

1. **Spec funcional cerrada** para los sistemas elegidos.
2. **User stories**.
3. **Modelo de datos**.
4. **Eventos de analytics**.
5. **Pantallas/flows**.
6. **Balance tables iniciales**.
7. **Plan de implementación por commits o milestones**.
8. **Riesgos técnicos**.
9. **Tests sugeridos**.
10. **Checklist de aceptación**.

No implementes hasta que yo diga explícitamente que pasemos a implementación.

---

## Parte 18: ejemplos de opciones que quiero ver

Usá estos ejemplos como referencia del tipo de comparación que espero. No te limites a ellos; mejoralos con tu investigación.

### Energía / supplies

| Opción | Descripción |
|---|---|
| A — Hard energy | Como Lost Vault: cuando se termina, el jugador casi no puede progresar activamente. |
| B — Soft energy | Expediciones fuertes consumen energía, pero crafting, salvage, jobs, training y gestión siguen disponibles. |
| C — Sin energía, con daily keys | No hay stamina; el límite son keys, cooldowns y rewards diarios. |
| D — Workers | El límite principal son workers asignados a tareas offline/producción. |

Evaluá cuál conviene para Idleforge.

### Loot

| Opción | Descripción |
|---|---|
| A — Loot simple | Items con rareza y stats básicos. |
| B — Loot con affixes | Items con rareza + 1-3 affixes. |
| C — Loot + sets | Sets tempranos con bonuses. |
| D — Loot generado + crafting pesado | El loot alimenta el crafting y no es necesariamente equipable directo. |

### Crafting

| Opción | Descripción |
|---|---|
| A — Recipes fijas | Receta produce item definido. |
| B — Recipes con calidad variable | Receta produce item con rango de calidad/affix. |
| C — Crafting orders | El jugador cumple pedidos para NPCs/guild. |
| D — Economy crafting | Crafting orientado a trading/mercado, probablemente no MVP 2.0. |

### Base / buildings

| Opción | Descripción |
|---|---|
| A — Productores simples | Mine, Lumber, Market, Storage, Forge. |
| B — Productores + unlocks | Edificios producen y desbloquean sistemas. |
| C — Base estratégica | Asignación de workers, boosts, defensa, raids. |
| D — Ciudad/guild shared base | Social/endgame. |

### Dungeons

| Opción | Descripción |
|---|---|
| A — Boss gates por zona | Boss al final de cada región. |
| B — Dungeons con keys | Keys caen explorando; cada dungeon tiene floors. |
| C — Daily tower/survival | Intento diario escalable. |
| D — Endgame raids | Grupo/guild. |

### Social

| Opción | Descripción |
|---|---|
| A — Leaderboards solamente | Fame, level, forge level. |
| B — Guild lite | Unirse a clan, donar, boost pasivo. |
| C — Guild boss | Actividad semanal asincrónica. |
| D — Guild wars/raids | Endgame competitivo. |

### PvP

| Opción | Descripción |
|---|---|
| A — No PvP MVP 2.0 | Solo leaderboards. |
| B — Arena simulada sin pérdida | Ataques diarios por ranking. |
| C — PvP con rewards limitados | Rewards sin castigar demasiado al defensor. |
| D — Raids/robo | Alto riesgo, endgame. |

---

## Parte 19: restricciones de diseño recomendadas

Usá estas restricciones salvo que encuentres una razón fuerte para cambiarlas:

1. Evitar pay-to-win fuerte.
2. Evitar que el jugador pierda progreso permanente por azar temprano.
3. Evitar destruir items por fallar upgrade en MVP 2.0.
4. Evitar PvP con robo antes de que el jugador entienda el sistema.
5. Evitar que el jugador se quede sin nada que hacer al acabarse la energía.
6. Evitar una economía imposible de balancear desde el primer release.
7. Evitar trading abierto en MVP 2.0 si no hay anti-abuse.
8. Evitar guild systems complejos si todavía no hay playerbase suficiente.
9. Preferir sistemas data-driven y configurables.
10. Priorizar claridad y feedback inmediato.

---

## Parte 20: entregable final de esta tarea

Al terminar, entregame:

1. Un resumen ejecutivo de 1-2 páginas.
2. El documento completo de investigación y roadmap.
3. Una tabla de decisiones pendientes.
4. Tu recomendación priorizada para MVP 2.0.
5. Una propuesta de “primer milestone implementable” de 1-2 semanas.
6. Una propuesta de “vertical slice adictivo” que combine exploración, loot, forge, upgrades, jobs y dailies.

La pregunta que quiero poder responder al final es:

> “¿Qué debería construir después en Idleforge para que el MVP pase de ser una base funcional a un juego idle RPG realmente adictivo, moderno y con potencial de largo plazo?”

