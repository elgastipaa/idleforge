# 04 - Constants & Balance (Estado Real)

Documento de referencia rápida alineado con `src/game/*` al 2026-05-16.

## 1) Constantes globales

Archivo: `src/game/constants.ts`

- `SAVE_KEY = "relic-forge-idle:v1"`
- `SAVE_VERSION = 1`
- `INVENTORY_LIMIT = 30`
- `INVENTORY_NEAR_FULL_THRESHOLD = 24`
- `OFFLINE_CAP_MS = 8h`
- `LEVEL_CAP = 30`
- `FINAL_DUNGEON_ID = "crown-of-the-first-forge"`
- `REINCARNATION_GATE_BOSS_ID = "curator-of-blue-fire"`
- `REINCARNATION_LEVEL_REQUIREMENT = 10`
- `DAILY_TASK_COUNT = 3`
- `DAILY_RESET_HOUR_LOCAL = 4`
- `FOCUS_MAX = 200`
- `FOCUS_REGEN_INTERVAL_MS = 15m`
- `FOCUS_EXPEDITION_BOOST_COST = 20`
- `FOCUS_EXPEDITION_BOOST_MULTIPLIER = 2`
- `REINCARNATION_UPGRADE_MAX = 15`
- `FORGE_AFFIX_REROLL_REQUIRED_LEVEL = 3`
- `LOOT_DROP_PITY_THRESHOLD = 3`

Nota técnica: también existe `RENOWN_UPGRADE_MAX = 10` en el archivo; no es el límite principal usado por upgrades de reincarnation.

## 2) Economía base

- Recursos core de run: `gold`, `fragments`.
- Moneda permanente: `renown` (copy de producto: Soul Marks).
- Materiales regionales activos:
  - `sunlitTimber`,
  - `emberResin`,
  - `archiveGlyph`,
  - `stormglassShard`,
  - `oathEmber`.

## 3) Focus / timing loops

- Focus:
  - cap inicial 200,
  - regen 1 cada 15 minutos,
  - gasto principal en boost de claim de expedición (`x2` recompensas),
  - también se usa en boss scout/prep y aceleración de construcción.
- Construcción:
  - `CONSTRUCTION_FOCUS_PER_HOUR = 15`,
  - timers desde nivel 1,
  - una construcción activa,
  - cancelación con reembolso parcial de materiales.
- Caravan:
  - duración mínima `1h`,
  - máxima `8h`.

## 4) Progresión por fases implementadas

- Mastery tiers por dungeon: 1/2/3 (`100/500/1500` XP).
- Account Rank table en `progression.ts`:
  - rango 1 -> 16,
  - cap de Focus escala de 200 a 300.
- `EXPEDITION_PROGRESS_REWARDS` cubre las 20 rutas con rewards por fase (1/3/4/8).
- Phase 9 activo en `events.ts`:
  - evento temporal con progreso por participación,
  - reward schedule por tiers,
  - modifiers temporales (mastery/regional material).

## 5) Contenido activo

- Zonas: 5 (`sunlit-marches`, `emberwood`, `azure-vaults`, `stormglass-peaks`, `first-forge`).
- Dungeons: 20 (4 por zona, último de cada zona = boss).
- Boss threats válidas:
  - `armored`,
  - `cursed`,
  - `venom`,
  - `elusive`,
  - `regenerating`,
  - `brutal`.

## 6) Loot / buildcraft

- Slots: `weapon`, `helm`, `armor`, `boots`, `relic`.
- Rarezas: `common`, `rare`, `epic`, `legendary`.
- Multiplicadores de rareza:
  - common: 1
  - rare: 1.7
  - epic: 2.55
  - legendary: 4.15
- Affix pool actual: 32.
- Traits/families:
  - 13 traits (`tactical`, `regional`, `progress`),
  - 5 families tipadas (todas activas en data Phase 8).

## 7) Reincarnation / class change

Archivo principal: `src/game/prestige.ts`

- Gate de reincarnation: nivel 10 + clear de `curator-of-blue-fire`.
- Upgrades permanentes:
  - `guildLegacy`,
  - `swiftCharters`,
  - `treasureOath`,
  - `bossAttunement`,
  - `horizonCartography`,
  - `forgeInheritance`.
- Class change:
  - respec temprano gratis (una vez),
  - luego class change vía reincarnation,
  - costo posterior: `CLASS_CHANGE_SOUL_MARK_COST = 3`,
  - cooldown: 24h.

## 8) Referencias de balance por módulo

- fórmulas base: `balance.ts`, `engine.ts`
- recompensas de progreso/account/mastery: `progression.ts`
- bosses/threat coverage/prep: `bosses.ts`
- collections/pity/completion: `collections.ts`
- diaries: `diaries.ts`
- outposts: `outposts.ts`
- caravan + caravan mastery: `caravan.ts`
- eventos y reward schedules: `events.ts`
- traits/family resonance: `traits.ts`

Para cambios de números, actualizar este archivo junto con tests en `src/game/__tests__/core.test.ts`.
