# 03 - Database / Persistencia

## Estado actual

No existe base de datos ni backend para gameplay.

La persistencia es local-first:

- storage: `window.localStorage`
- save key: `relic-forge-idle:v1`
- theme key: `relic-forge-idle:theme`
- serialización/import/migración: `src/game/save.ts`
- hidratación/persist: `src/store/useGameStore.ts`

## Save envelope real

```ts
type SaveEnvelope = {
  game: "Relic Forge Idle";
  saveVersion: 1;
  exportedAt: number;
  state: GameState;
};
```

## `GameState` persistido (snapshot)

Campos raíz actuales:

- metadatos: `version`, `seed`, `mode`, `createdAt`, `updatedAt`, `nextRunId`
- hero y economía: `hero`, `resources`, `focus`
- build/loot: `inventory`, `equipment`, `buildPresets`, `loot`
- run actual: `activeExpedition`, `dungeonClears`
- meta loops: `town`, `caravan`, `dailies`, `dailyFocus`, `weeklyQuest`
- progreso permanente: `prestige`, `rebirth`, `soulMarks`, `accountRank`
- progreso regional: `regionProgress`, `dungeonMastery`, `bossPrep`, `construction`, `classChange`
- colecciones/codex/showcase: `traitCodex`, `familyCodex`, `accountShowcase`, `titles`, `trophies`
- tracking/auxiliares: `achievements`, `accountPersonalRecords`, `eventProgress`, `lifetime`, `settings`

Notas relevantes de los campos nuevos de Phase 9:

- `eventProgress`: progreso por evento activo (`participation`, `claimedRewards`).
- `settings.completionNotificationsOptIn`: opt-in explícito para notificaciones de completion (Caravan/Construction).

## Normalización y migración de saves

`save.ts` no solo valida shape; también migra saves legacy:

- `vigor` -> `focus`.
- recursos legacy (`ore`, `crystal`, `rune`, `relicFragment`) -> `fragments`.
- wiring de tareas legacy (`spend_vigor` -> `spend_focus`).
- normalización de campos nuevos (collections/diaries/outposts/mastery/codex/showcase/etc.) si no existían.
- normalización de `eventProgress` por evento (participation entero no negativo + tiers ya reclamados).

## Reglas de import/seguridad

- import inválido no muta el estado activo.
- valores numéricos se clamp/normalizan a rangos seguros.
- `equipment`/`inventory` se limpian y normalizan en import.
- duración de caravan y estructura de construcción se revalidan.

## Riesgos actuales

1. `saveVersion` sigue en `1`; la compatibilidad depende de normalizadores internos.
2. La validación es robusta en estructura, pero no garantiza coherencia de balance en datos editados manualmente.
3. El crecimiento del `GameState` aumenta costo de mantenimiento del normalizador.

## Fuera de alcance actual

- cloud save,
- profiles de usuario remotos,
- DB relacional/NoSQL,
- sincronización multi-dispositivo.
