# Relic Forge Idle - Technical Architecture

## Canonical Planning Rule

- `docs/` is the single planning source.
- Do not keep duplicate planning specs at repository root.

## Stack

- Next.js
- TypeScript
- Tailwind
- Zustand
- Vitest
- localStorage

## Architecture Layers

`src/game`:

- Pure deterministic simulation.
- Content definitions.
- Formula engine.
- Save/import validation helpers.
- Offline progression calculator.

`src/store`:

- Zustand store.
- Hydration.
- localStorage persistence.
- Action wrappers calling `src/game`.

`src/app` and `src/components`:

- Rendering and interaction only.
- No business formulas.

Forbidden in MVP architecture:

- API routes for gameplay.
- server-side persistence dependencies.
- payment or ad SDK integration.

## Determinism Rules

- No `Math.random()` in simulation.
- Use seeded RNG with input:
  - save seed
  - expedition id
  - run id
- State updates must be pure and testable.

## Suggested `src/game` Modules

- `types.ts`
- `constants.ts`
- `content.ts`
- `state.ts`
- `engine.ts`
- `expeditions.ts`
- `loot.ts`
- `heroes.ts`
- `town.ts`
- `prestige.ts`
- `achievements.ts`
- `dailies.ts`
- `vigor.ts`
- `save.ts`
- `offline.ts`
- `balance.ts`

## Core Data Contracts

```ts
type GameState = {
  version: 1;
  seed: string;
  updatedAt: number;
  hero: HeroState;
  resources: ResourceState;
  vigor: { current: number; max: 100; lastTickAt: number };
  inventory: Item[];
  equipment: EquipmentState;
  activeExpedition: ActiveExpedition | null;
  dungeonClears: Record<string, number>;
  town: TownState;
  dailies: DailyState;
  reincarnation: ReincarnationState;
  settings: SettingsState;
};
```

## Save System

- localStorage save key is versioned.
- Export/import via JSON envelope.
- Failed import must never mutate current state.

## Offline System

Apply capped simulation on load:

- Expedition completion.
- Mine passive generation.
- Vigor regeneration.

Cap:

- 8h maximum elapsed time for offline calculations.

## Daily Reset System

- Reset schedule: 23:00 local device time.
- Also display local mapping: 20:00 GMT-3.
- Fixed 3 tasks/day.
- No streak tracking in MVP.

## UI Integration Contracts

- UI calls store actions only.
- Store action -> game function -> validated state transition -> persist.
- UI displays derived selectors from `src/game`.

## MVP Reliability Gates

- TypeScript strict.
- Core simulation covered by Vitest.
- Build and typecheck pass.

## Done When

- The boundaries prevent UI/business logic leakage.
- Core systems are deterministic and persistence-safe.
- Architecture does not require backend services to run core gameplay.
