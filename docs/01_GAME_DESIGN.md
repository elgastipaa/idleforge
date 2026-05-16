# 01 - Game Design (Estado Real del Código)

## Fantasía principal actual

El jugador controla un único héroe en un RPG idle local-first de expediciones, progreso de cuenta y resets de run:

- corre rutas por región con timer,
- recibe progreso de Mastery + Account Rank en cada resultado,
- construye Town persistente,
- prepara y enfrenta bosses con amenazas,
- usa Focus para acelerar decisiones clave,
- reincarna para convertir progreso en Soul Marks permanentes.

## Core loop actual implementado

1. Crear héroe (nombre + clase).
2. Elegir una ruta desbloqueada (o planear Caravan por región).
3. Iniciar expedición.
4. Reclamar resultado (normal o `Claim x2` con Focus si alcanza).
5. Procesar progreso permanente del run:
   - Mastery por dungeon,
   - Account XP/rank,
   - materiales regionales,
   - colección/diario/títulos/trofeos cuando aplica.
6. Resolver decisiones de inventario/build:
   - equip/sell/salvage,
   - traits/family resonance,
   - presets.
7. Gastar economía en Forge/Town/Prep/Outpost.
8. Escalar hacia boss/reincarnation/class change según estado.

## Estado de implementación por fases (`implementation_4_2_1`)

- Phase 0: schema + migración a Focus + boundaries persistentes implementados.
- Phase 1: first-run, mastery, panel de resultado y Account Rank skeleton implementados.
- Phase 2: Daily Focus, daily missions, weekly quest y Account Showcase local implementados.
- Phase 3: materiales regionales activos, sinks regionales, region completion y collections implementados.
- Phase 4: bosses nombrados, scout/prep, amenazas y failure intel implementados.
- Phase 5A: construcción persistente con aceleración por Focus y claim implementada.
- Phase 5B: Caravan por región + bloqueo de expediciones concurrentes implementado.
- Phase 5C: outposts regionales implementados.
- Phase 5D: class change temprano gratis + class change post-rebirth implementado.
- Phase 6: traits, families, presets y locks implementados.
- Phase 7: diaries, codex de traits/families y Caravan Mastery implementados.
- Phase 8: regiones 3-5 activadas (Azure/Stormglass/First Forge), expansión de rewards y upgrades implementada.
- Phase 9: activado en slice local-first (primer evento no punitivo + banner + reward schedule + notificaciones opcionales por opt-in para completions).

## Sistemas reales implementados (snapshot 2026-05-16)

- 5 regiones, 20 dungeons, 5 bosses (`sunlit-marches` -> `first-forge`).
- Focus (`cap 200` base, regen `1/15m`, boost opcional por claim).
- Account Rank hasta 16 con expansión de cap de Focus.
- Daily Missions + Weekly Quest + Weekly Contracts milestone chest.
- Mastery tiers por dungeon con claim y recompensas permanentes.
- Region materials activos:
  - `sunlitTimber`,
  - `emberResin`,
  - `archiveGlyph`,
  - `stormglassShard`,
  - `oathEmber`.
- Collections por región con pity, completion y recompensas permanentes.
- Diaries por región con tareas y claim de tier.
- Boss prep loop:
  - scout (Focus),
  - prep por amenaza (Focus + material regional),
  - intel en derrota.
- Town persistente con construcción por timer desde nivel 1.
- Outposts con selección de bonus por región.
- Caravan:
  - una activa a la vez,
  - bloquea nuevas expediciones mientras corre,
  - mastery por región.
- Loot/buildcraft:
  - affixes,
  - traits (tactical/regional/progress),
  - families y resonance,
  - equip best contextual,
  - presets.
- Rebirth/Reincarnation con Soul Marks, upgrades permanentes y class change rules.
- Event layer Phase 9:
  - primer evento no punitivo con participación por expedición,
  - banner activo con progreso y tiers claimables,
  - reward schedule temporal sin poder permanente exclusivo.
- Notificaciones opcionales por opt-in explícito para completions de Caravan/Construction.
- Save local con import/export + migración de saves legacy.
- UI móvil/escritorio con navegación por tabs/subviews y overlays priorizados.

## Sistemas no implementados (intencionalmente)

- backend,
- cuentas,
- cloud save obligatorio,
- PvP/social/chat,
- monetización runtime,
- web push/service-worker obligatorio para progresión,
- eventos live obligatorios.

## Guardrails de diseño vigentes

- Lógica en `src/game`, no en UI/store.
- Persistencia local como fuente de verdad.
- Cada fase debe dejar el juego jugable sin backend.
- No introducir sistemas fuera del alcance de `docs/design/implementation_4_2_1.md`.
