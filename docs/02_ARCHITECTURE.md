# 02 - Architecture (Estado Real)

## Stack detectado

- Framework: **Next.js 15** (App Router).
- Lenguaje: **TypeScript** (strict).
- UI: **React 19** + **Tailwind CSS** + `lucide-react`.
- Estado cliente: **Zustand**.
- Testing: **Vitest** (entorno node).
- Persistencia: **localStorage** (sin backend).
- Tema visual: `data-theme` en `<html>` + overrides globales en `src/app/globals.css`.
- Ruteo app: **una única ruta** (`src/app/page.tsx`) y **sin** `src/app/api/*`.
- Backend: **no existe**.
- Base de datos: **no existe**.
- Auth: **no existe**.

## Estructura real de carpetas

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  game/
    __tests__/core.test.ts
    types.ts
    constants.ts
    content.ts
    affixes.ts
    state.ts
    rng.ts
    balance.ts
    heroes.ts
    expeditions.ts
    loot.ts
    engine.ts
    inventory.ts
    forge.ts
    town.ts
    caravan.ts
    dailies.ts
    vigor.ts
    offline.ts
    prestige.ts
    achievements.ts
    save.ts
    index.ts
  store/
    useGameStore.ts
```

## Qué hace cada carpeta importante

- `src/game`: núcleo de simulación y reglas.
- `src/store`: capa fina de acciones de UI + persistencia/hidratación.
- `src/app`: renderizado de pantallas y componentes visuales.

## Entrypoints reales

- App entrypoint: `src/app/page.tsx`.
- Root layout/meta: `src/app/layout.tsx`.
- Store principal de cliente: `src/store/useGameStore.ts`.
- API pública de lógica: `src/game/index.ts`.

## Dónde vive cada cosa

- Lógica de juego: `src/game/*`.
- Componentes/pantallas UI: `src/app/page.tsx` (actualmente monolítico).
- Feedback visual de UI:
  - helpers/componentes de presentación en `src/app/page.tsx`,
  - microfeedback CSS (`feedback-pop`, `rarity-glow`) en `src/app/globals.css`,
  - clases semánticas de rareza (`rarity-common/rare/epic/legendary`) para controlar tint/borde/glow en light/dark.
- Tema claro/oscuro:
  - bootstrap inicial en `src/app/layout.tsx`,
  - toggle/hook cliente en `src/app/page.tsx`,
  - variables y overrides globales en `src/app/globals.css`.
- Tipos/interfaces: `src/game/types.ts`.
- Constantes globales: `src/game/constants.ts`.
- Tablas de contenido/balance de contenido: `src/game/content.ts`.
- Helpers/servicios de dominio:
  - efectos equipados de afijos: `affixes.ts`,
  - fórmulas: `balance.ts`,
  - loot direction/pity: `loot.ts`,
  - Caravan offline jobs: `caravan.ts`,
  - Contracts diarios/semanales: `dailies.ts`,
  - save/import: `save.ts`,
  - offline: `offline.ts`,
  - rng: `rng.ts`.

## Patrón actual de flujo de datos

1. UI llama acción del store (`useGameStore`).
2. Store delega a módulo de dominio en `src/game` (funciones determinísticas que operan sobre estado clonado).
3. Store persiste estado con `serializeSave` + `localStorage`.
4. UI renderiza desde `state` del store.

## Reglas recomendadas para agregar features

- Agregar primero tipos en `src/game/types.ts`.
- Agregar constantes en `src/game/constants.ts` o contenido en `content.ts`.
- Implementar reglas en módulo de `src/game` (no en UI/store).
- Exponer desde `src/game/index.ts`.
- Conectar acción mínima en store.
- Consumir en UI.
- Cubrir con tests en `src/game/__tests__`.

## Riesgos de arquitectura actuales

1. `src/app/page.tsx` concentra muchas pantallas y lógica de presentación en un solo archivo.
2. Naming inconsistente:
   - código interno usa `prestige/renown`,
   - UI/producto comunica `reincarnation/Soul Marks`.
3. Constante duplicada/inconsistente:
   - `RENOWN_UPGRADE_MAX` y `REINCARNATION_UPGRADE_MAX` en `constants.ts` (solo una se usa en flujo principal).
4. Store repite patrón de `structuredClone` + persist en muchas acciones (acoplamiento repetitivo).
5. La capa de dark mode usa overrides globales sobre utilidades Tailwind existentes; las rarezas ya usan clases semánticas, pero una futura extracción de componentes debería migrar el resto de colores a tokens/clases semánticas.

## Duplicaciones o inconsistencias detectadas

- Duplicación semántica de términos de progreso permanente (`prestige` vs `reincarnation`).
- Posible duplicación de límites de upgrades (`RENOWN_UPGRADE_MAX` vs `REINCARNATION_UPGRADE_MAX`).

## Cosas que NO deben hacerse (evitar spaghetti)

- No meter fórmulas en `page.tsx`.
- No meter reglas de negocio en `useGameStore.ts`.
- No crear módulos alternativos de save/offline/dailies/contracts/vigor fuera de `src/game`.
- No añadir una segunda fuente de verdad de estado.
- No introducir backend parcial “temporal” para gameplay.
