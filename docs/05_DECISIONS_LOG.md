# Decisions Log

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
