# Relic Forge Idle - Technical Architecture

## Canonical Planning Rule

- `docs/` is the canonical planning source.
- `docs/design/implementation_4_2_1.md` is the Launch Candidate baseline spec.
- `docs/00..07` tracks real implementation state.

## Stack

- Next.js 15
- TypeScript (strict)
- Tailwind CSS
- Zustand
- Vitest
- localStorage

## Runtime Layers

`src/game`:

- Deterministic domain simulation.
- Content and progression tables.
- Economy/balance formulas.
- Save import/normalization.
- Offline progression.

`src/store`:

- Zustand state container.
- Hydration/persist orchestration.
- UI action wrappers around domain transitions.

`src/app`:

- Presentation and interaction (`game-view.tsx`).
- No core formulas or authoritative state transitions.

## Determinism Rules

- No `Math.random()` in simulation modules.
- Seeded RNG via `src/game/rng.ts`.
- Transition functions return typed results (`ActionResult`, `ResolveResult`, etc.).
- Failed import or failed action must not mutate active state.

## Current Domain Module Set

- Core: `types`, `constants`, `content`, `state`, `rng`, `balance`, `engine`
- Gameplay loops: `expeditions`, `loot`, `inventory`, `forge`, `town`, `focus`, `offline`
- Meta progression: `progression`, `prestige`, `showcase`, `achievements`, `dailies`, `events`
- Regional systems: `regions`, `bosses`, `collections`, `outposts`, `diaries`, `traits`, `caravan`
- Persistence: `save`

## Core Data Contract (simplified)

```ts
type GameState = {
  version: 1;
  seed: string;
  mode: "standard" | "debug";
  updatedAt: number;
  hero: HeroState;
  resources: ResourceState;
  focus: FocusState;
  inventory: Item[];
  equipment: EquipmentState;
  buildPresets: BuildPresetMap;
  loot: LootState;
  activeExpedition: ActiveExpedition | null;
  town: BuildingState;
  caravan: CaravanState;
  dailies: DailyState;
  dungeonMastery: Record<string, DungeonMasteryState>;
  accountRank: AccountRankState;
  regionProgress: RegionProgressState;
  bossPrep: Record<string, BossPrepState>;
  construction: ConstructionState;
  prestige: PrestigeState;
  soulMarks: SoulMarksState;
  classChange: ClassChangeState;
  traitCodex: Record<string, TraitDiscoveryState>;
  familyCodex: Record<string, FamilyDiscoveryState>;
  accountShowcase: AccountShowcaseState;
  titles: Record<string, TitleState>;
  trophies: Record<string, TrophyState>;
  settings: SettingsState;
};
```

## Save / Offline / Reset Contracts

- Save envelope versioned in `save.ts`.
- Offline simulation capped at 8h.
- Daily reset hour is local-time based (`DAILY_RESET_HOUR_LOCAL = 4`).
- Weekly contract milestones and weekly quest state advance through the same deterministic state machine.
- Event progression and reward claims remain local-state transitions (no cloud-required path).

## Architecture Risks

1. `game-view.tsx` size and change-surface breadth.
2. Legacy naming overlap (`renown/prestige` vs `Soul Marks/Reincarnation`).
3. Single large test file for many subsystems.

## Non-goals in current architecture

- server-authoritative gameplay,
- cloud-required progression,
- social/PvP infrastructure,
- monetization runtime dependencies.
