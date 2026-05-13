# Sistema de Build vs Expedición — Diseño y Plan de Implementación

## Contexto

Hoy el éxito de una expedición se calcula casi exclusivamente a partir de `heroPowerScore` vs `dungeon.power`. Esto colapsa toda la decisión de equipamiento a "elegir el ítem con el número más alto". El sistema no diferencia entre tipos de expedición (más allá del flag `boss`) y no permite que afijos contextuales, maestrías futuras o especialización temática influyan en el resultado.

Este documento define el refactor para introducir una capa de **matching contextual entre la build del héroe y los tags de la expedición**, sin romper el balance existente.

---

## Filosofía de diseño

Tres principios que guían todas las decisiones de este sistema:

1. **Power score sigue siendo el factor dominante en éxito.** El matching de tags es un modificador adicional, no un reemplazo. Un jugador puede ignorar el sistema de tags y seguir progresando.

2. **El matching premia la especialización contextual sin obligarla.** Un jugador que matchea bien gana más eficiencia (más éxito, más drops). Un jugador que no matchea sigue jugando, solo con menos bonus.

3. **El sistema escala en capas reversibles.** Cada fase de implementación deja un juego jugable. Si una fase no convence, se puede iterar sin tocar las anteriores.

---

## Arquitectura del sistema

### Capa 1: Tags

Los tags son strings categorizados que describen propiedades temáticas de una expedición y propiedades de una build.

**Categorías y valores iniciales (MVP):**

```
element:  fire | ice | holy
enemy:    undead | beast | giant
terrain:  ruins | swamp | mountain
```

Total: **9 tags**. Espacio de expansión post-MVP: lightning, shadow, demon, humanoid, crypt, forest, stealth, brute, endurance, etc.

**Convención**: los tags se escriben siempre con el prefijo de categoría seguido de dos puntos. Esto facilita parseo y permite filtrar por categoría cuando haga falta.

### Capa 2: Tags en regiones y expediciones

Los tags viven en dos niveles con herencia:

**Región (zona)**: declara 2 tags base que se aplican a *todas* las expediciones de la zona. Típicamente uno de `terrain` y uno de `enemy`.

**Expedición**: hereda los tags de su región y declara 1 tag adicional propio (típicamente `element`). El boss puede declarar un 4to tag adicional.

**Tagging propuesto para las 5 zonas existentes:**

```
Sunlit Marches    → [terrain:swamp, enemy:beast]
  expedición 1    → + element:holy
  expedición 2    → + (sin extra, queda con 2 tags)
  expedición 3    → + element:fire
  boss            → + element:holy + element:fire

Emberwood          → [terrain:mountain, enemy:beast]
  expedición 1    → + element:fire
  expedición 2    → + (sin extra)
  expedición 3    → + element:fire
  boss            → + element:fire + enemy:giant

Azure Vaults       → [terrain:ruins, enemy:undead]
  expedición 1    → + element:ice
  expedición 2    → + (sin extra)
  expedición 3    → + element:holy
  boss            → + element:ice + element:holy

Stormglass Peaks   → [terrain:mountain, enemy:giant]
  expedición 1    → + element:ice
  expedición 2    → + (sin extra)
  expedición 3    → + element:ice
  boss            → + element:ice + enemy:beast

First Forge        → [terrain:ruins, enemy:undead]
  expedición 1    → + element:fire
  expedición 2    → + (sin extra)
  expedición 3    → + element:holy
  boss            → + element:fire + enemy:giant
```

Nota: el tagging es una propuesta inicial. Se puede ajustar manualmente expedición por expedición sin afectar el código.

### Capa 3: Counters en afijos

Los afijos pueden declarar un campo opcional `counters: string[]` que lista los tags que matchean. Cuando un afijo equipado tiene un counter que aparece en los tags de la expedición, suma al éxito.

**Importante**: en MVP **no se agregan counters a los afijos existentes**. Se crean 5 afijos nuevos limpios, cada uno con stat + counter. Los afijos viejos siguen funcionando exactamente igual que hoy.

**Afijos nuevos para MVP:**

```typescript
{
  id: 'flameheart',
  name: 'Flameheart',
  stats: { power: X },              // ajustar X según presupuesto de stat por rareza
  counters: ['element:fire'],
  description: 'Affinity with flame. Bonus success in fire-touched expeditions.',
  slots: ['weapon', 'relic']         // dónde puede aparecer
}

{
  id: 'frostbound',
  name: 'Frostbound',
  stats: { defense: X },
  counters: ['element:ice'],
  description: 'Tempered against the cold. Bonus success in ice-touched expeditions.',
  slots: ['armor', 'helm', 'relic']
}

{
  id: 'sanctified',
  name: 'Sanctified',
  stats: { luck: X },
  counters: ['element:holy'],
  description: 'Blessed and resolute. Bonus success in holy-touched expeditions.',
  slots: ['weapon', 'helm', 'relic']
}

{
  id: 'beasthunter',
  name: 'Beasthunter',
  stats: { speed: X },
  counters: ['enemy:beast'],
  description: 'Trained against wild creatures. Bonus success against beasts.',
  slots: ['weapon', 'boots', 'relic']
}

{
  id: 'giantfeller',
  name: 'Giantfeller',
  stats: { power: X },
  counters: ['enemy:giant'],
  description: 'Honed against the colossal. Bonus success against giants.',
  slots: ['weapon', 'armor', 'relic']
}
```

Estos afijos entran al loot pool normal. Los valores de `stats` deben alinearse con el presupuesto de stat por rareza ya existente (similar a Might, Bulwark, Quickstep, etc.).

### Capa 4: Fórmula de éxito refactoreada

La función `getDungeonSuccessChance` actual suma varios términos. El refactor agrega un término nuevo: `tagMatchBonus`.

**Fórmula refactoreada:**

```
successChance = clamp(
  0.5
  + ((heroPowerScore - dungeon.power) / dungeon.power) * 0.25
  + luck * 0.002
  + classModifier
  + passiveBonus
  + bossAttunementBonus
  + libraryBonus
  + affixSuccessChance
  + affixBossSuccessChance
  + affixShortMissionSuccessChance
  + tagMatchBonus,           // ← NUEVO
  0.15,
  0.96
)
```

**Cálculo de `tagMatchBonus`:**

```
const TAG_MATCH_VALUE = 0.04;

function calcTagMatchBonus(equippedAffixes, expeditionTags) {
  let matches = 0;
  for (const affix of equippedAffixes) {
    if (!affix.counters) continue;
    for (const counter of affix.counters) {
      if (expeditionTags.includes(counter)) {
        matches += 1;
      }
    }
  }
  return matches * TAG_MATCH_VALUE;
}
```

**Cálculo de `expeditionTags`** (combina región + expedición):

```
function getExpeditionTags(dungeon, region) {
  return [...region.tags, ...dungeon.tags];
}
```

**Rango esperado de `tagMatchBonus`**:
- 0 matches → +0.00
- 1 match → +0.04
- 2 matches → +0.08
- 3 matches → +0.12
- 4+ matches → +0.16+

El techo natural es bajo a propósito. El sistema premia matching sin desbalancear. Si después de testing se siente débil, subir `TAG_MATCH_VALUE` a 0.05 o 0.06. Si se siente fuerte, bajar a 0.03.

### Capa 5: UI

Dos cambios mínimos en la UI para que el sistema sea legible:

1. **En la pantalla de expedición**: mostrar los tags de la expedición como chips/badges visibles. Si la build del héroe matchea alguno, resaltarlo visualmente (color, icono, lo que sea coherente con el estilo del juego).

2. **En el panel del héroe**: mostrar los counters activos (suma de counters de todos los afijos equipados). Algo simple tipo: "Tu héroe contraataca: element:fire, enemy:beast". Esto ayuda al jugador a entender qué está pasando sin tener que abrir cada ítem.

---

## Plan de implementación

### Fase 1 (MVP, ~2 días)

**Objetivo**: que la build importe en el éxito de la expedición, sin tocar economía ni progresión.

Checklist:

- [ ] Agregar campo `tags: string[]` a `DungeonDefinition` (`src/game/types.ts`)
- [ ] Agregar concepto de región con campo `tags: string[]` (puede vivir como nuevo tipo `RegionDefinition` o como campo en zonas existentes)
- [ ] Tagear las 5 zonas y sus expediciones según el mapping propuesto arriba
- [ ] Agregar campo `counters?: string[]` al tipo `Affix` (`src/game/types.ts`)
- [ ] Crear los 5 afijos nuevos: Flameheart, Frostbound, Sanctified, Beasthunter, Giantfeller (`src/game/loot.ts` o donde vivan los affixes)
- [ ] Agregar esos 5 afijos al loot pool con la rareza correspondiente
- [ ] Modificar `getDungeonSuccessChance` en `src/game/balance.ts` para incluir `tagMatchBonus`
- [ ] Implementar función helper `getExpeditionTags(dungeon, region)`
- [ ] Implementar función `calcTagMatchBonus(equippedAffixes, expeditionTags)`
- [ ] Mostrar tags de la expedición en la UI de selección/preview de expedición
- [ ] Mostrar counters activos del héroe en algún panel visible
- [ ] Testear que ningún ítem viejo se rompió y que el balance general se mantiene

**Lo que NO entra en fase 1:**
- Fragmentos / economía nueva
- Tabla de afinidades cruzadas (element vs enemy)
- War Table u otros edificios nuevos
- Maestrías
- Elemento como campo separado del ítem
- Counters en afijos existentes

### Fase 2 (economía, post-MVP)

Cuando fase 1 esté validada en juego real, fase 2 introduce:

- **Fragmentos**: 5 colores asignados manualmente a las 5 zonas (no derivados del tag elemental, para forzar rotación voluntaria).
  - Drop base: 1 fragmento por expedición exitosa
  - Bonus de matching: +1 fragmento por cada tag matcheado en la build
  - Techo razonable: 4-5 fragmentos por expedición top

- **Elemento como campo separado del ítem**: refactorear los afijos `Flameheart`, `Frostbound`, `Sanctified` a un campo `element?: 'fire' | 'ice' | 'holy' | null` en el ítem. Los counters de `element:*` se calculan ahora desde ese campo, no desde afijos. Los afijos de enemy y terrain quedan como afijos.
  - Esto desbloquea el sumidero de fragmentos: "reencantar el elemento de un ítem en la Forge cuesta X fragmentos del color destino".

- **Tabla de afinidades cruzadas** (element vs enemy):

  ```
             undead  beast   giant
  fire        +      ++      0
  ice         0      +       ++
  holy       ++      0       +
  ```

  Valores:
  - `++` = bonus reforzado (un ítem con ese elemento en esa expedición cuenta como 1.5 matches en vez de 1)
  - `+` = bonus estándar (cuenta como 1 match, igual que matching directo)
  - `0` = sin sinergia

- **Costos de edificios en fragmentos**: cada edificio pide 1-2 colores principales en milestones específicos (no en todos los niveles, para no entorpecer la progresión temprana). El oro sigue siendo el costo principal.

### Fase 3 (especialización profunda)

- **Maestrías**: por tag, ganables con XP que se acumula al usar el tag (matchear en expediciones). Las maestrías amplifican los counters relacionados.
- **Afijos nuevos** con counters específicos en expansión: shadow, lightning, demon, etc.
- **War Table**: edificio que revela tags progresivamente según su nivel.
- **Árbol de prestige** con dos ramas:
  - Ramas de especialización (una por familia, profundas pero específicas)
  - Rama de generalista (requiere fragmentos de todos los colores, da bonuses amplios)

### Fase 4 (contenido)

- Expediciones heroicas (versiones difíciles de los bosses) con costo de entrada en fragmentos y recompensas exclusivas.
- Trueque entre fragmentos (tasa desfavorable a propósito).
- Sumideros adicionales según necesidad.

---

## Decisiones de arquitectura que se difieren a fase 2

Estas decisiones se documentan acá para que se tengan en cuenta al hacer la fase 1, pero NO se implementan todavía:

1. **El elemento será un campo separado del ítem en fase 2**. Esto significa que en fase 1, Flameheart/Frostbound/Sanctified existen como afijos normales. En fase 2 se migran al campo elemento. La fase 1 debe ser diseñada de forma que esa migración sea simple: por ejemplo, no acoplar lógica especial a esos tres afijos en particular.

2. **Los fragmentos vendrán en fase 2** y son la economía nueva. Fase 1 no debe asumir su existencia. El balance de éxito de fase 1 tiene que tener sentido sin fragmentos en circulación.

3. **Las maestrías vendrán en fase 3** y amplificarán matching. Fase 1 no debe asumir su existencia.

---

## Resumen ejecutivo de fase 1

Para que la IA developer no se pierda en el detalle, fase 1 se reduce a esto:

> Agregar tags a las expediciones (3 tags promedio por expedición), agregar 5 afijos nuevos que tienen un campo nuevo `counters` con tags que matchean, y modificar la fórmula de éxito para sumar +0.04 por cada match entre los counters de los afijos equipados y los tags de la expedición. Mostrar todo en UI de forma legible. No tocar nada más.

Cuando esto esté implementado y testeado, se valida con jugabilidad real antes de avanzar a fase 2.