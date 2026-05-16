# 02 - Architecture (Estado Real)

## Stack detectado

- Framework: Next.js 15 (App Router)
- Lenguaje: TypeScript (`strict`)
- UI: React 19 + Tailwind CSS + `lucide-react`
- Estado cliente: Zustand
- Testing: Vitest
- Persistencia: `localStorage` (sin backend)

## Estructura real de carpetas

```text
src/
  app/
    layout.tsx
    page.tsx
    game-view.tsx
    globals.css
  game/
    __tests__/core.test.ts
    achievements.ts
    affixes.ts
    balance.ts
    bosses.ts
    caravan.ts
    collections.ts
    constants.ts
    content.ts
    dailies.ts
    diaries.ts
    engine.ts
    events.ts
    expeditions.ts
    focus.ts
    forge.ts
    heroes.ts
    index.ts
    inventory.ts
    loot.ts
    offline.ts
    outposts.ts
    prestige.ts
    progression.ts
    regions.ts
    rng.ts
    save.ts
    showcase.ts
    state.ts
    town.ts
    traits.ts
    types.ts
  hooks/
    useIsClient.ts
  store/
    useGameStore.ts
```

## Entrypoints reales

- App route: `src/app/page.tsx` (re-export de `game-view.tsx`)
- UI principal: `src/app/game-view.tsx`
- Store principal: `src/store/useGameStore.ts`
- API pública del dominio: `src/game/index.ts`

## Responsabilidades por capa

- `src/game/*`:
  - reglas determinísticas,
  - tablas de contenido,
  - balance,
  - progresión,
  - validación y normalización de saves.
- `src/store/useGameStore.ts`:
  - hidratación,
  - wiring UI -> dominio,
  - persistencia local,
  - mensajes/errores de interacción.
- `src/app/*`:
  - render,
  - navegación,
  - composición visual,
  - binding de acciones del store.

## Flujo de datos vigente

1. UI ejecuta acción del store.
2. Store delega a función de `src/game`.
3. Dominio devuelve transición de estado tipada (`ActionResult`/`ResolveResult`).
4. Store persiste save y actualiza estado observable.
5. UI renderiza estado + derivados.

## Decisiones estructurales activas

- App local-first: no APIs runtime para gameplay.
- Dominio en módulos especializados por sistema (bosses, collections, diaries, outposts, traits, caravan mastery, etc.).
- Cobertura de regresión concentrada en `src/game/__tests__/core.test.ts`.

## Riesgos de arquitectura actuales

1. `src/app/game-view.tsx` sigue siendo grande y concentra muchas superficies UI.
2. Naming interno `prestige/renown` convive con copy de producto `Reincarnation/Soul Marks`.
3. Conviven `RENOWN_UPGRADE_MAX` y `REINCARNATION_UPGRADE_MAX` en constantes.

## Guardrails

- No mover lógica de negocio a UI.
- No crear variantes paralelas de sistemas ya existentes (`save`, `focus`, `dailies`, `progression`, `regions`, `bosses`, etc.).
- No introducir dependencias de backend para progresión core.
