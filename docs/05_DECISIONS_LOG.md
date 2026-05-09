# Decisions Log

## 2026-05-09

### Decision: Subtabs globales por pantalla + navegación por swipe horizontal en contenido central
Descripción:
Para tabs con subviews (`Hero`, `Forge`, `Reincarnation`), el selector de subtabs se eleva a una barra compartida debajo del header principal y el contenido de subviews se navega también por swipe/scroll horizontal con snap.
Motivo:
Reducir fricción entre selector y contenido, y habilitar un patrón de navegación más fluido tipo carrusel de secciones sin cambiar de pantalla.
Impacto:
Se centraliza el estado de subviews en `Home`, se sincroniza tap + swipe (el subtab activo se actualiza al terminar el scroll), y se elimina duplicación de controles segmentados dentro de cada pantalla.
Archivos relacionados:
- `src/app/game-view.tsx`
- `docs/06_TASKS.md`
- `docs/07_CHANGELOG.md`

### Decision: Region cards con hover de borde (sin cambio de fondo) y snap ownership en contenedor scrolleable
Descripción:
Se ajusta el hover de `RegionCard` para enfatizar borde/ring/sombra sin cambiar el fondo principal de la card, y se mueve `snap-x snap-mandatory` al contenedor que realmente scrollea (`overflow-x-auto`) en carrusel de regiones y expediciones por región.
Motivo:
Mejorar legibilidad/armonía visual en desktop y corregir comportamiento inconsistente de scroll snap (especialmente perceptible con input de escritorio).
Impacto:
Las cards mantienen contraste estable en hover y el snap horizontal funciona de forma predecible al soltar el scroll tanto en carrusel de regiones como en la lista horizontal de expediciones.
Archivos relacionados:
- `src/app/game-view.tsx`
- `docs/06_TASKS.md`
- `docs/07_CHANGELOG.md`

### Decision: Expeditions con navegación de regiones en dos niveles + scroll snap
Descripción:
La pantalla de expediciones pasa a un flujo en dos niveles: primero muestra un carrusel horizontal de regiones; luego, al seleccionar una región desbloqueada, muestra sólo las expediciones de esa región con acción de volver en la misma vista.
Motivo:
Reducir densidad inicial de la pantalla de expediciones y mejorar foco táctil por región sin crear rutas/pantallas adicionales.
Impacto:
Se introduce estado local `selectedRegionId`, se agregan componentes reutilizables (`RegionCard`, `RegionCarousel`, `RegionExpeditionsView`), se bloquea navegación en regiones locked y se aplica scroll snap nativo para centrar cards en horizontal.
Archivos relacionados:
- `src/app/game-view.tsx`
- `docs/06_TASKS.md`
- `docs/07_CHANGELOG.md`

### Decision: Canonical source reaffirmed as `docs/` with `00..07` workflow primary
Descripción:
Se reafirma que la fuente canónica es `docs/` y el flujo primario operativo es la serie `docs/00..07`.
Motivo:
Evitar divergencia entre índices alternativos y documentos históricos en raíz.
Impacto:
`docs/README.md` se elimina y los archivos de raíz (como `2_0_definition.md`) pasan a tratarse como contexto histórico no canónico.
Archivos relacionados:
- `docs/00_README_AI.md`
- `docs/07_CHANGELOG.md`
- `2_0_definition.md`

### Decision: Reset diario canónico fijado en `23:00 UTC`
Descripción:
La regla canónica de reset diario se fija en `23:00 UTC` para todas las docs de planificación.
Motivo:
Eliminar ambigüedad entre referencias previas de hora local vs UTC.
Impacto:
Specs, scope, arquitectura, testing y planes de implementación usan `23:00 UTC` como referencia única.
Archivos relacionados:
- `docs/PRODUCT_SPEC.md`
- `docs/MVP_SCOPE.md`
- `docs/GAME_DESIGN.md`
- `docs/TECHNICAL_ARCHITECTURE.md`
- `docs/TESTING_PLAN.md`

### Decision: Awards se consideran shipped en v1.0
Descripción:
Se consolida la postura de que Awards ya forman parte de v1.0.
Motivo:
Alinear documentación con el estado actual del producto.
Impacto:
Se eliminan referencias a Awards como opcionales y los cut lists sólo permiten recortar polish visual, no remover tracking/unlocks.
Archivos relacionados:
- `docs/VERSION_1_0_DEFINITION.md`
- `docs/PRODUCT_SPEC.md`
- `docs/MVP_SCOPE.md`
- `docs/FINAL_IMPLEMENTATION_PLAN.md`
- `docs/CONTENT_PLAN.md`

### Decision: Vigor boost integrado al momento de claim (no en start)
Descripción:
El boost de Vigor se mueve al momento de reclamar la expedición (`Claim x2 · Vig -cost`) y se elimina el control separado en el board.
Motivo:
Reducir ruido en el loop principal y concentrar la decisión de riesgo/costo/recompensa en una sola superficie de acción.
Impacto:
`startExpedition` deja de gastar Vigor; `resolveExpedition` aplica boost opcional y consume Vigor en claim. La UI de expediciones elimina el toggle independiente.
Archivos relacionados:
- `src/game/engine.ts`
- `src/game/types.ts`
- `src/store/useGameStore.ts`
- `src/app/game-view.tsx`

### Decision: Forge segmentado por modos (`Craft` / `Upgrade` / `Advanced`)
Descripción:
La pantalla Forge adopta un selector segmentado persistente para mostrar una sola superficie principal por vez.
Motivo:
Bajar densidad visual y mejorar escaneabilidad sin recortar funcionalidad.
Impacto:
Se reemplaza el patrón de `show/hide advanced` por navegación explícita por modo en la misma pantalla.
Archivos relacionados:
- `src/app/game-view.tsx`

### Decision: Town en modo compacto por defecto con detalles on-demand
Descripción:
Las tarjetas de edificios muestran por defecto propósito, nivel, costo y CTA; detalles/milestones quedan colapsados y expandibles.
Motivo:
Reducir fatiga de lectura en pantallas densas y mantener la información profunda disponible sin navegación adicional.
Impacto:
Menor altura inicial de cards en Town y mejor foco en la acción de upgrade.
Archivos relacionados:
- `src/app/game-view.tsx`
- `docs/mobile_ux_audit.md`

### Decision: Overlay feedback en modo de prioridad única
Descripción:
Se adopta una orquestación de overlays en `Home` donde sólo se muestra una superficie de alta prioridad por vez (`Expedition Result` > `Offline Summary` > `Message Toast`).
Motivo:
Reducir sobrecarga visual cuando múltiples paneles de feedback compiten durante el loop central.
Impacto:
Se evita la pila simultánea de paneles en la vista principal y se simplifica la lectura de estado inmediato.
Archivos relacionados:
- `src/app/game-view.tsx`
- `src/store/useGameStore.ts`
- `docs/mobile_ux_audit.md`

### Decision: Offline Summary compactado en una sola tarjeta de 4 filas
Descripción:
El panel `Offline Summary` se compacta para mostrar `Expedition`, `Mine gains`, `Vigor` y `Dailies` en una sola tarjeta interna con cuatro filas densas, y se conserva copy de tiempo transcurrido (`Away for ...`) en lugar de timestamp de "Last update".
Motivo:
Reducir altura total del panel y mejorar escaneo rápido en retorno de sesión sin perder información clave.
Impacto:
Se elimina la presentación en mini-cards separadas y se simplifica la lógica de detalles apilados que ya no aplica con overlays de prioridad única.
Archivos relacionados:
- `src/app/game-view.tsx`
- `docs/07_CHANGELOG.md`

### Decision: Hero y Reincarnation con subviews compactas por defecto
Descripción:
Las pantallas `Hero` y `Reincarnation` pasan a navegación segmentada con una vista compacta por defecto y secciones profundas opcionales.
Motivo:
Disminuir profundidad de scroll y mejorar legibilidad en viewports compactos sin perder información avanzada.
Impacto:
`Hero` usa `Overview/Class/Stats`; `Reincarnation` usa `Overview/Ledger/Upgrades`, manteniendo la CTA principal visible.
Archivos relacionados:
- `src/app/game-view.tsx`
- `docs/mobile_ux_audit.md`

## 2026-05-07

### Decision: Inicializar documentación viva desde estado real del repo
Descripción:
Se crea la serie `docs/00..07` basada en implementación real de `src/`.
Motivo:
Evitar desalineación entre documentación de planificación y código actual.
Impacto:
Nuevas tareas y cambios deben actualizar estas docs.
Archivos relacionados:
- `docs/00_README_AI.md`
- `docs/01_GAME_DESIGN.md`
- `docs/02_ARCHITECTURE.md`
- `docs/03_DATABASE.md`
- `docs/04_CONSTANTS_AND_BALANCE.md`
- `docs/06_TASKS.md`
- `docs/07_CHANGELOG.md`

### Decision: Lógica de juego centralizada en `src/game`
Descripción:
Las reglas de progresión, economía, dailies, vigor, offline, save y reincarnación viven en módulos de `src/game`.
Motivo:
Determinismo, testabilidad y separación UI/lógica.
Impacto:
Store/UI deben delegar a `src/game`; no duplicar fórmulas en componentes.
Archivos relacionados:
- `src/game/*`
- `src/store/useGameStore.ts`

### Decision: Persistencia local sin backend
Descripción:
El estado del juego se persiste en `localStorage` con envelope versionado.
Motivo:
MVP single-player sin servicios server-side.
Impacto:
No hay cuentas ni cloud save; la recuperación depende del navegador local y export/import.
Archivos relacionados:
- `src/game/save.ts`
- `src/store/useGameStore.ts`
- `src/game/constants.ts`

### Decision: Reincarnación gateada en boss de región 3 + nivel 10
Descripción:
La reincarnación se habilita con `level >= 10` y clear de `curator-of-blue-fire`.
Motivo:
Alinear el primer reset permanente con una ventana de 30-60 minutos en producción y 5-10 minutos en debug/dev.
Impacto:
El loop temprano se diseña alrededor de llegar a región 3; la ruta hasta el boss de región 3 entrega suficiente XP para el nivel requerido.
Archivos relacionados:
- `src/game/prestige.ts`
- `src/game/constants.ts`
- `src/game/expeditions.ts`
- `src/game/__tests__/core.test.ts`

### Decision: Dailies y vigor incluidos en MVP real
Descripción:
Se implementan 3 dailies por día con reset a las 23:00 hora local del dispositivo y recurso vigor (cap 100, +1/5m, boost x2 por 20).
Motivo:
Retención y decisiones de timing sin monetización, premium currency, ads, battle pass, streak punishment ni FOMO pesado.
Impacto:
Múltiples acciones actualizan progreso diario y vigor; los rewards de vigor se integran al cap y el boost sólo se ofrece cuando hay vigor suficiente.
Archivos relacionados:
- `src/game/dailies.ts`
- `src/game/vigor.ts`
- `src/game/engine.ts`
- `src/store/useGameStore.ts`
- `src/app/page.tsx`

### Decision: Alinear textos de edificios contra fórmulas reales sin tocar balance
Descripción:
Se alinea `BUILDINGS.effectText` con los números usados por el motor de balance para Forge, Mine, Tavern, Library, Market y Shrine.
Motivo:
Evitar confusión de producto y errores de tuning al interpretar progreso sin cambiar el gameplay del MVP.
Impacto:
Los textos visibles de Town ahora describen las fórmulas existentes y quedan cubiertos por un test de regresión.
Archivos relacionados:
- `src/game/content.ts`
- `src/game/balance.ts`
- `src/game/inventory.ts`
- `src/game/__tests__/core.test.ts`
- `docs/04_CONSTANTS_AND_BALANCE.md`
- `docs/06_TASKS.md`

### Decision: Dark mode como preferencia visual fuera del save
Descripción:
Se agrega tema claro/oscuro con `data-theme` en `<html>`, bootstrap inicial en layout y overrides globales en CSS.
Motivo:
Mantener el cambio no invasivo, sin tocar gameplay, schema de save ni estructura de pantallas.
Impacto:
La preferencia se guarda en `localStorage` con key `relic-forge-idle:theme`; si no existe, se usa la preferencia del sistema sólo como default inicial.
Archivos relacionados:
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `docs/02_ARCHITECTURE.md`
- `docs/03_DATABASE.md`

### Decision: Afijos equipados con utilidad significativa sin expandir scope
Descripción:
Se modelan afijos con stats, descripciones, prefijos/sufijos de naming y efectos equipados que modifican recompensas, loot, rareza, éxito, duración, Vigor, crafting, sell value, salvage y rune gains.
Motivo:
Mejorar la experiencia de loot estilo ARPG en formato texto/card-based sin agregar set items, trading ni árboles complejos de crafting.
Impacto:
Los ítems guardados ahora contienen afijos más ricos; la comparación usa Item Power con score de stats y utilidad; los sistemas de balance consultan `src/game/affixes.ts`.
Archivos relacionados:
- `src/game/affixes.ts`
- `src/game/types.ts`
- `src/game/content.ts`
- `src/game/loot.ts`
- `src/game/balance.ts`
- `src/game/engine.ts`
- `src/game/forge.ts`
- `src/game/inventory.ts`
- `src/app/page.tsx`
- `src/game/__tests__/core.test.ts`

### Decision: Forge como pilar simple de progresión MVP 2.0
Descripción:
La Forge concentra craft por slot, upgrade de ítem, salvage con retorno visible y reroll de un afijo por vez desbloqueado por nivel del edificio.
Motivo:
Dar un sink claro y repetible para materiales sin convertir MVP 2.0 en un sistema de recetas complejo.
Impacto:
El nivel del edificio Forge queda conectado al poder de crafting por `item stat budget`; el reroll se desbloquea en Forge nivel 3; los costos y resultados se muestran en la UI.
Alcance explícitamente excluido:
- árboles complejos de recetas,
- set crafting,
- economía multiplayer,
- paid crafting,
- colas de craft time-gated.
Archivos relacionados:
- `src/game/constants.ts`
- `src/game/forge.ts`
- `src/game/loot.ts`
- `src/store/useGameStore.ts`
- `src/app/page.tsx`
- `src/game/__tests__/core.test.ts`
- `docs/04_CONSTANTS_AND_BALANCE.md`
- `docs/06_TASKS.md`

### Decision: Town como pilar card-based sin base-building visual
Descripción:
Cada edificio de Town queda documentado/renderizado con propósito, costo, beneficio actual, próximo beneficio, milestones y feedback contextual.
Motivo:
Hacer que la base funcione como centro de progresión MVP 2.0 sin abrir scope de decoración o city placement.
Impacto:
`BUILDINGS` incluye `purpose` y `milestones`; Town usa tarjetas responsive y muestra estado específico por edificio (Forge, Mine, Tavern, Market, Library, Shrine).
Alcance explícitamente excluido:
- sistemas decorativos,
- city placement,
- base-building visual.
Archivos relacionados:
- `src/game/types.ts`
- `src/game/content.ts`
- `src/game/offline.ts`
- `src/app/page.tsx`
- `src/game/__tests__/core.test.ts`
- `docs/01_GAME_DESIGN.md`
- `docs/04_CONSTANTS_AND_BALANCE.md`
- `docs/06_TASKS.md`

### Decision: Reincarnation MVP sin skill tree ni awakening
Descripción:
La reincarnación usa una sola capa de Soul Marks con cuatro upgrades permanentes simples y una pantalla de tradeoff reset/persist.
Motivo:
Hacer que el primer reset sea emocionante y legible sin agregar árboles complejos, capas múltiples ni awakening classes.
Impacto:
La UI explica requirements, resets, persistencia, currency gained, upgrades y aceleradores del siguiente run. Class awakening queda post-MVP.
Alcance explícitamente excluido:
- complex skill trees,
- multiple prestige layers,
- awakening classes en MVP.
Archivos relacionados:
- `src/game/constants.ts`
- `src/game/prestige.ts`
- `src/game/balance.ts`
- `src/game/expeditions.ts`
- `src/app/page.tsx`
- `src/game/__tests__/core.test.ts`
- `docs/01_GAME_DESIGN.md`
- `docs/04_CONSTANTS_AND_BALANCE.md`
- `docs/06_TASKS.md`

### Decision: UI polish MVP 2.0 sólo con cards, texto y microfeedback CSS
Descripción:
Se mejora feedback de recompensa, loot, level-up, Town upgrades, inventario, reincarnation progress, Next Goal, empty states y navegación móvil sin agregar sprites, canvas, motores de juego ni animaciones complejas.
Motivo:
Subir claridad y satisfacción del loop corto manteniendo el MVP mobile-first, text/card-based y fácil de mantener dentro de `src/app`.
Impacto:
`page.tsx` agrega componentes/helper UI para reward tiles, notices, progress bars y empty states; `globals.css` agrega microfeedback liviano con `prefers-reduced-motion`.
Alcance explícitamente excluido:
- sprites,
- canvas,
- game engines,
- animaciones complejas,
- cambios de balance o lógica de juego.
Archivos relacionados:
- `src/app/page.tsx`
- `src/app/globals.css`
- `docs/01_GAME_DESIGN.md`
- `docs/06_TASKS.md`

### Decision: Densidad UI y rareza semántica para playtesting externo
Descripción:
Se compactan resource/Vigor chips, tarjetas de inventario y filas de Forge, y se mueve la presentación de rareza a clases semánticas con overrides intencionales para dark mode.
Motivo:
Resolver problemas visuales detectados en el audit MVP 2.0 sin rediseñar la app: recursos sobredimensionados tras rewards, tarjetas de inventario demasiado altas, nombres largos en Forge y glows de rareza ruidosos en dark mode.
Impacto:
`page.tsx` mantiene helpers compartidos para chips, previews de afijos y layouts compactos; `globals.css` controla tint/borde/glow por rareza en light/dark.
Alcance explícitamente excluido:
- cambios de fórmulas,
- sistemas nuevos,
- dependencias nuevas,
- sprites/canvas/animaciones complejas,
- refactor arquitectónico de `page.tsx`.
Archivos relacionados:
- `src/app/page.tsx`
- `src/app/globals.css`
- `UI_POLISH_AUDIT.md`
- `docs/01_GAME_DESIGN.md`
- `docs/02_ARCHITECTURE.md`
- `docs/06_TASKS.md`

### Decision: Balance MVP 2.0 enfocado en ventanas de primera sesión
Descripción:
Se ajustan sólo números existentes para que el primer loot, primer Town upgrade, primer craft, primer boss y primera reincarnación caigan en ventanas concretas sin requerir Vigor.
Motivo:
El loop anterior entregaba boss/craft demasiado temprano y podía extender la reincarnación por repeticiones de nivel. El tuning nuevo estira Region 1, comprime Region 2/3 y mejora rare-drop pressure temprano.
Impacto:
Cambian duraciones/power/min-level de dungeons hasta `curator-of-blue-fire`, pesos de rareza, loot chance, costo inicial de Forge y debug timer multiplier. No cambia el gate de reincarnación, Vigor, offline cap, inventory cap ni fórmulas de craft.
Alcance explícitamente excluido:
- sistemas nuevos,
- nuevas monedas,
- cambios de persistencia,
- Vigor obligatorio,
- cambios de UI.
Archivos relacionados:
- `src/game/constants.ts`
- `src/game/content.ts`
- `src/game/balance.ts`
- `src/game/loot.ts`
- `src/game/__tests__/core.test.ts`
- `docs/BALANCE_PLAN.md`
- `docs/04_CONSTANTS_AND_BALANCE.md`
- `docs/06_TASKS.md`

### Decision: Definir MVP 2.0 como expansión de retención sin backend
Descripción:
Se define una hoja de ruta de MVP 2.0/2.1 priorizando retención 3-7 días, objetivos de mediano plazo y variedad de build usando sistemas existentes (expeditions/forge/inventory/reincarnation), sin abrir infraestructura online.
Motivo:
El mayor riesgo actual no es falta de features base, sino falta de objetivos intermedios y retorno diario/semanal más fuerte. Agregar backend/social/PvP ahora elevaría riesgo y tiempo de entrega.
Impacto:
El paquete recomendado para MVP 2.0 queda limitado a cinco mejoras mayores:
- weekly contracts,
- dungeon mastery + boss milestones,
- forge orders,
- build presets + inventory QoL,
- reincarnation milestone track.
Todo backend/accounts/cloud save/PvP/guilds/trading/monetización runtime queda explícitamente fuera de MVP 2.0.
Archivos relacionados:
- `docs/MVP_2_ROADMAP.md`
- `docs/06_TASKS.md`
- `docs/07_CHANGELOG.md`

### Decision: Re-iterar roadmap MVP 2.0 con scoring cuantitativo y red-team
Descripción:
Se rehace `docs/MVP_2_ROADMAP.md` con un proceso explícito por pases: crítica, análisis de retención por ventana temporal, scoring de features (20+), selección de scope, comparación de paquetes, plan de implementación por hitos y red-team final.
Motivo:
La primera versión del roadmap podía quedar demasiado amplia en algunas partes y no suficientemente rigurosa para ejecución directa sin follow-ups.
Impacto:
Se fija un paquete final de MVP 2.0 de 5 mejoras mayores y se agrega `docs/MVP_2_DECISION_SUMMARY.md` como fuente compacta de decisiones y prompt de implementación.
Alcance explícitamente excluido:
- backend/accounts/cloud save,
- social/PvP/trading/auction,
- expansión de clases/regiones,
- item sets y sistemas de alto riesgo de balance.
Archivos relacionados:
- `docs/MVP_2_ROADMAP.md`
- `docs/MVP_2_DECISION_SUMMARY.md`
- `docs/06_TASKS.md`
- `docs/07_CHANGELOG.md`
