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

### Decision: Reincarnación gateada en boss de región 3 + nivel 18
Descripción:
La reincarnación se habilita con `level >= 18` y clear de `curator-of-blue-fire`.
Motivo:
Asegurar primer ciclo de progresión antes de reset permanente.
Impacto:
El loop temprano se diseña alrededor de llegar a región 3.
Archivos relacionados:
- `src/game/prestige.ts`
- `src/game/constants.ts`
- `src/game/expeditions.ts`

### Decision: Dailies y vigor incluidos en MVP real
Descripción:
Se implementan 3 dailies por día (23:00 UTC) y recurso vigor (cap 100, +1/5m, boost x2 por 20).
Motivo:
Retención y decisiones de timing sin monetización.
Impacto:
Múltiples acciones actualizan progreso diario y vigor.
Archivos relacionados:
- `src/game/dailies.ts`
- `src/game/vigor.ts`
- `src/game/engine.ts`
- `src/store/useGameStore.ts`
