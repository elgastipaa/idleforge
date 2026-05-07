# 03 - Database / Persistencia

## Estado actual: NO hay base de datos

No existe motor de DB, ORM, migraciones ni backend.

## Persistencia real implementada

La persistencia actual es local:

- mecanismo: `window.localStorage`
- key: `relic-forge-idle:v1` (`SAVE_KEY`)
- archivo principal: `src/store/useGameStore.ts`
- serialización/validación: `src/game/save.ts`

## Envelope real guardado

```ts
type SaveEnvelope = {
  game: "Relic Forge Idle";
  saveVersion: 1;
  exportedAt: number;
  state: GameState;
};
```

## Modelo persistido (GameState) - resumen

Campos raíz relevantes:

- `version`
- `seed`
- `mode`
- `createdAt`
- `updatedAt`
- `nextRunId`
- `hero`
- `resources`
- `vigor`
- `inventory`
- `equipment`
- `activeExpedition`
- `dungeonClears`
- `town`
- `dailies`
- `achievements`
- `prestige`
- `lifetime`
- `settings`

Definición completa: `src/game/types.ts`.

## Lecturas/escrituras reales

- Hidratación inicial: `useGameStore.hydrate()`.
- Autosave después de acciones exitosas: `persist()` en store.
- Export: `serializeSave`.
- Import: `importSave` + `normalizeImportedState`.
- Reset: `localStorage.removeItem(SAVE_KEY)`.

## Validaciones actuales de import/save

`src/game/save.ts` valida:

- `game` y `saveVersion`.
- shape base de `GameState`.
- clases, dungeons, slots y límites de inventario.
- vigor (`0..max`, `max<=100`).
- dailies (`3 tareas` + tipos válidos).
- upgrades de progreso permanente.

## Riesgos / inconsistencias de persistencia

1. No hay estrategia de migración multi-versión más allá de `saveVersion` fijo.
2. Si cambian tipos de estado, hay riesgo de romper imports viejos sin migrador.
3. Validación de reward de dailies es superficial (shape básica; no valida todos los rangos numéricos finos).

## Futura DB sugerida (NO implementada)

Solo como propuesta futura, no código actual:

- motor sugerido: PostgreSQL.
- capa sugerida: Prisma.
- entidades mínimas:
  - `players` (si hay cuentas),
  - `saves` (jsonb versionado),
  - `telemetry_runs` (si se mide balance).

Todo lo anterior está **fuera del estado actual del repo**.
