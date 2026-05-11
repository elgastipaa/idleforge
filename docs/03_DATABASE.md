# 03 - Database / Persistencia

## Estado actual: NO hay base de datos

No existe motor de DB, ORM, migraciones ni backend.

## Persistencia real implementada

La persistencia actual es local:

- mecanismo: `window.localStorage`
- key: `relic-forge-idle:v1` (`SAVE_KEY`)
- key de preferencia visual: `relic-forge-idle:theme`
- archivo principal: `src/store/useGameStore.ts`
- serialización/validación: `src/game/save.ts`

Nota:

- `relic-forge-idle:theme` guarda sólo `"light"` o `"dark"` para la UI. No forma parte del save envelope ni del modelo `GameState`.

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
- `loot`
- `activeExpedition`
- `dungeonClears`
- `town`
- `caravan`
- `dailies` (UI: Contracts)
- `achievements`
- `prestige`
- `lifetime`
- `settings`

Definición completa: `src/game/types.ts`.

## Modelo persistido relevante para loot

Los ítems de `inventory` y `equipment` se guardan completos dentro de `GameState`.
Además, `loot` guarda la dirección de drops y el contador de pity:

```ts
type LootState = {
  focusSlot: "any" | "weapon" | "helm" | "armor" | "boots" | "relic";
  missesSinceDrop: number;
  recentSlots: EquipmentSlot[];
};
```

```ts
type Item = {
  id: string;
  name: string;
  slot: "weapon" | "helm" | "armor" | "boots" | "relic";
  rarity: "common" | "rare" | "epic" | "legendary";
  itemLevel: number;
  upgradeLevel: number;
  stats: Partial<Stats>;
  affixes: Affix[];
  sellValue: number;
  salvageValue: Partial<MaterialBundle>;
  sourceDungeonId: string;
  createdAtRunId: number;
};
```

Los afijos también son parte del save porque quedan embebidos en cada `Item`:

```ts
type Affix = {
  id: string;
  name: string;
  stats: Partial<Stats>;
  effects?: AffixEffects;
  description: string;
  prefix?: string;
  suffix?: string;
  slots?: EquipmentSlot[];
};
```

`AffixEffects` puede incluir modificadores de XP, oro, oro por zona, materiales, materiales por recurso, rare drop chance, loot chance, boss rewards, success chance, boss success, short mission success, long mission loot, forge discount, costo de Vigor, sell value, salvage, rune gains, duración y failure reward scale.

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
- clases, dungeon activo, slots de equipment y límite de inventario.
- loot focus/pity/recent slots.
- Caravan activa opcional.
- vigor (`0..max`, `max<=100`).
- dailies/Contracts (`1 Main + 2 Side` + tipos válidos + weekly milestones).
- upgrades de progreso permanente.

## Riesgos / inconsistencias de persistencia

1. No hay estrategia de migración multi-versión más allá de `saveVersion` fijo.
2. Si cambian tipos de estado, hay riesgo de romper imports viejos sin migrador.
3. Validación de reward de Contracts es superficial (shape básica; no valida todos los rangos numéricos finos).
4. No se valida en profundidad la forma interna completa de cada `item` de inventario/equipment durante import, incluyendo `affixes.effects`.

## Futura DB sugerida (NO implementada)

Solo como propuesta futura, no código actual:

- motor sugerido: PostgreSQL.
- capa sugerida: Prisma.
- entidades mínimas:
  - `players` (si hay cuentas),
  - `saves` (jsonb versionado),
  - `telemetry_runs` (si se mide balance).

Todo lo anterior está **fuera del estado actual del repo**.
