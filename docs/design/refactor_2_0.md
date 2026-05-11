# Idleforge — Refactor completo de expediciones, builds, masteries, bosses, afijos, ciudad y Codex

Documento de diseño técnico para convertir el sistema actual de expediciones basado casi exclusivamente en `powerScore` en un sistema de **builds, counters, maestrías, preparación, loot dirigido y progreso total de cuenta**.

La intención de este documento es que pueda usarse como base para un refactor real del juego: modelos de datos, variables nuevas, fórmulas, ejemplos de contenido, interacciones entre sistemas y plan de implementación.

---

## 0. Objetivo central

El objetivo no es reemplazar el sistema de expediciones por algo complejo de entender, sino hacer que el jugador deje de pensar:

> “Equipo el item con más poder y mando la misión.”

Y empiece a pensar:

> “Esta región tiene no-muertos, maldición y debilidad a fuego/sagrado. Me conviene usar espada de fuego, subir maestría de Fuego, llevar Cleanse, activar un bonus de Codex y mejorar la Capilla de la ciudad antes de intentar el boss.”

El juego tiene que conservar la simpleza idle:

1. Elegís una expedición.
2. Elegís loadout.
3. Ves chance de éxito, warnings y recompensas posibles.
4. Mandás al personaje.
5. Volvés y reclamás progreso.

Pero debajo tiene que haber profundidad:

- armas con tipo real;
- daño elemental;
- afijos que no sean solo `+successChance`;
- mapas con tags, amenazas y debilidades;
- bosses con preparación;
- masteries que importan;
- Codex coleccionable;
- ciudad como sink de recursos;
- gemas y sockets;
- loot que cambia builds;
- Account Rank como progreso total.

---

## 1. Problema actual

La fórmula actual es:

```ts
successChance = clamp(
  0.5
  + ((powerScore - dungeon.power) / dungeon.power) * 0.25
  + luck * 0.002
  + classModifier
  + classPassiveBonus
  + bossAttunementBonus
  + libraryBonus
  + itemAffixSuccessBonus
  + bossAffixBonus
  + shortMissionAffixBonus,
  0.15,
  0.96
)
```

Y el `powerScore` sale de:

```ts
power
+ defense * 0.55
+ speed * 0.7
+ luck * 0.5
+ stamina * 0.03
+ shrineLevel * 2
+ guildLegacy * 2
```

### 1.1. Qué funciona bien

El sistema actual tiene cosas buenas:

- es simple;
- se entiende rápido;
- permite balancear con un número recomendado por dungeon;
- el jugador ve una chance clara;
- se puede escalar con upgrades, edificios, gear y reincarnation;
- funciona bien para early game.

### 1.2. Qué limita

El problema es que casi todo termina convertido a un único número: `powerScore`.

Eso genera varios efectos negativos:

- un item con más poder bruto casi siempre gana;
- los afijos se vuelven secundarios;
- las maestrías solo importan si suben poder;
- las debilidades de enemigos no importan;
- no hay razón fuerte para tener varias builds;
- los bosses no requieren preparación real;
- las regiones se sienten parecidas;
- el jugador no tiene motivos para subir Veneno, Fuego, Espada, Martillo, etc., salvo que eso aumente el número total;
- el loot no cambia decisiones, solo reemplaza stats.

### 1.3. Objetivo del refactor

La nueva regla de diseño:

> **El poder bruto habilita intentar contenido. La build, la maestría y la preparación habilitan dominarlo.**

Otra forma de decirlo:

> **PowerScore te abre la puerta. Los counters y masteries deciden si realmente podés pasar.**

---

## 2. Modelo nuevo de expedición

La nueva fórmula no elimina `powerScore`; lo convierte en una parte del cálculo.

La chance final debería salir de estos componentes:

```ts
successChance = clamp(
  baseChance
  + powerTerm
  + elementTerm
  + counterBonusTerm
  + masteryTerm
  + preparationTerm
  + classOrArchetypeTerm
  + luckTerm
  + directAffixTerm
  - missingCounterPenalty,
  minChance,
  dynamicMaxChance
)
```

Donde:

| Término | Rol |
|---|---|
| `baseChance` | Chance base de la expedición. Normalmente 50%. |
| `powerTerm` | Comparación entre poder bruto del jugador y poder recomendado. |
| `elementTerm` | Qué tan bien matchea el daño de la build contra debilidades/resistencias. |
| `counterBonusTerm` | Bonus por cubrir mecánicas del mapa: anti-veneno, cleanse, armor break, ranged, etc. |
| `masteryTerm` | Bonus o penalidad suave por maestrías relevantes. |
| `preparationTerm` | Consumibles, scouting, boss attunement, ciudad, biblioteca, Codex. |
| `classOrArchetypeTerm` | Bonus por clase actual o arquetipo de loadout. |
| `luckTerm` | Luck como ayuda acotada. |
| `directAffixTerm` | Afijos que explícitamente dan chance, pero con cap y scopes. |
| `missingCounterPenalty` | Penalidad por no cubrir counters importantes. |
| `dynamicMaxChance` | Cap máximo dinámico. Baja si ignorás mecánicas clave. |

La diferencia grande contra el sistema actual es `dynamicMaxChance`.

Ejemplo:

- un boss tiene regeneración extrema;
- si no tenés fuego, anti-regeneración, sangrado especial o un consumible adecuado, tu chance máxima queda cappeada en 60%;
- aunque tengas muchísimo `powerScore`, no podés brute-forcearlo al 96%;
- si preparás la build correcta, el cap vuelve a 90% o 96% según el tipo de contenido.

Esto hace que el jugador quiera conseguir y subir cosas específicas.

---

## 3. Vocabulario base

Antes de implementar fórmula y contenido, necesitamos un vocabulario común.

### 3.1. Tags de arma

```ts
type WeaponType =
  | 'great_sword'
  | 'axe'
  | 'daggers'
  | 'bow'
  | 'staff'
  | 'wand_tome'
  | 'hammer';
```

Notas:

- Sólo un slot de arma por ahora (no off-hand explícito).

### 3.2. Tipos de daño

```ts
type DamageType =
  | 'physical'
  | 'fire'
  | 'cold'
  | 'lightning'
  | 'poison'
  | 'shadow'
  | 'holy'
  | 'arcane'
  | 'bleed'
  | 'nature';
```

Recomendación:

- `physical` es el daño base.
- `bleed` puede ser tratado como daño físico especial o como damage type propio. Conviene hacerlo propio porque sirve como counter de regeneración y como identidad de dagas/espadas/hachas.
- `nature` puede agrupar raíces, bestias, druidas, vida, plantas y algunas curas.

### 3.3. Familias de enemigo

```ts
type EnemyFamily =
  | 'beast'
  | 'undead'
  | 'demon'
  | 'construct'
  | 'humanoid'
  | 'dragon'
  | 'plant'
  | 'elemental'
  | 'insect'
  | 'spirit'
  | 'giant';
```

Cada familia puede tener:

- debilidades típicas;
- resistencias típicas;
- drops específicos;
- Codex propio;
- mastery propia;
- bosses asociados.

Ejemplos:

| Familia | Debilidades frecuentes | Resistencias frecuentes | Drops típicos |
|---|---|---|---|
| `undead` | holy, fire | poison, shadow | huesos, cenizas, reliquias |
| `beast` | fire, bleed, poison | nature | cuero, colmillos, carne |
| `construct` | lightning, hammer, armorBreak | poison, bleed | metal, núcleos, gemas |
| `demon` | holy, cold | fire, shadow | azufre, almas, fragmentos demoníacos |
| `plant` | fire, axe, poison especial | nature, poison común | fibras, savia, semillas |
| `dragon` | depende del dragón | depende del dragón | escamas, sangre, gemas raras |

### 3.4. Biomas / regiones

```ts
type RegionTag =
  | 'forest'
  | 'crypt'
  | 'mountain'
  | 'swamp'
  | 'desert'
  | 'frostlands'
  | 'cinderlands'
  | 'ruins'
  | 'abyss'
  | 'city'
  | 'sky'
  | 'coast'
  | 'volcanic'
  | 'graveyard';
```

Cada región debería tener:

- materiales propios;
- hazards propios;
- enemigos frecuentes;
- Codex regional;
- mastery regional;
- edificios de ciudad que piden sus recursos;
- bosses propios.

### 3.5. Hazards

Los hazards son peligros del mapa que no son simplemente “el enemigo pega fuerte”.

```ts
type HazardTag =
  | 'poisonCloud'
  | 'burningHeat'
  | 'freezingWind'
  | 'curseAura'
  | 'darkness'
  | 'traps'
  | 'fallingRocks'
  | 'disease'
  | 'manaDrain'
  | 'bleedingTerrain'
  | 'ambush'
  | 'longAttrition'
  | 'flooded'
  | 'unstableMagic';
```

Ejemplos de interacción:

| Hazard | Qué pide | Qué pasa si falta |
|---|---|---|
| `poisonCloud` | poisonResist, antidote, cleanse, alchemy | baja chance, cap dinámico |
| `freezingWind` | coldResist, fireSource, stamina | baja speed, baja chance en misiones largas |
| `curseAura` | holy, cleanse, shadowResist, temple | cap bajo |
| `darkness` | lightSource, scouting, holy, arcane | baja chance de cofres, baja cap |
| `traps` | trapDetection, scouting, rogue/dagger, cartography | fallos parciales, menos loot |
| `longAttrition` | stamina, foodSupply, camp upgrades | penaliza expediciones de 8h+ |
| `manaDrain` | arcaneResist, focus, manaPotion | penaliza builds mágicas |

### 3.6. Mecánicas de enemigo

```ts
type EnemyMechanic =
  | 'armored'
  | 'shielded'
  | 'regenerating'
  | 'flying'
  | 'swarm'
  | 'invisible'
  | 'magicBarrier'
  | 'reflective'
  | 'berserk'
  | 'summoner'
  | 'healer'
  | 'curseCaster'
  | 'poisonous'
  | 'fireAura'
  | 'frostAura'
  | 'phaseShift'
  | 'siegeTarget';
```

Ejemplos:

| Mecánica | Counters recomendados |
|---|---|
| `armored` | armorBreak, hammer, mace, lightning, blunt damage |
| `shielded` | barrierBreak, burst, arcane, dispel |
| `regenerating` | burn, antiRegen, bleed especial, holy en undead |
| `flying` | rangedReach, bow, spear, lightning, net/trap |
| `swarm` | areaDamage, fire, cleave, poison cloud control |
| `invisible` | scouting, lightSource, trapDetection, arcane sight |
| `magicBarrier` | dispel, arcane, holy, barrierBreak |
| `reflective` | sustain, ranged, controlled damage, shield |
| `summoner` | burst, singleTarget, silence, holy/shadow según tipo |

### 3.7. Counters

Los counters son métricas derivadas del build del jugador. No tienen por qué mostrarse como stats principales en la UI, pero sí deben existir internamente.

```ts
type CounterKey =
  | 'fireSource'
  | 'coldSource'
  | 'lightningSource'
  | 'poisonSource'
  | 'shadowSource'
  | 'holySource'
  | 'arcaneSource'
  | 'burn'
  | 'freeze'
  | 'shock'
  | 'bleed'
  | 'antiRegen'
  | 'armorBreak'
  | 'barrierBreak'
  | 'dispel'
  | 'cleanse'
  | 'poisonMitigation'
  | 'fireMitigation'
  | 'coldMitigation'
  | 'shadowMitigation'
  | 'curseMitigation'
  | 'trapDetection'
  | 'scouting'
  | 'rangedReach'
  | 'areaDamage'
  | 'singleTargetBurst'
  | 'sustain'
  | 'staminaSupply'
  | 'speedClear'
  | 'siegePower'
  | 'crowdControl'
  | 'healing'
  | 'warding'
  | 'lockpicking'
  | 'stealth'
  | 'foodSupply'
  | 'bossDamage'
  | 'eliteDamage';
```

Importante: un counter puede venir de varias fuentes.

Ejemplo: `antiRegen` puede venir de:

- un afijo específico;
- espada con bleed;
- maestría de Bleed nivel 10;
- poción anti-regeneración;
- set bonus;
- Codex del boss;
- edificio de Alquimia;
- gema Ruby en arma.

Así evitamos que el juego diga “necesitás exactamente espada de bleed". Mejor dice:

> “Este boss regenera. Necesitás una forma de cortar regeneración.”

Y el jugador puede resolverlo de varias maneras.

---

## 4. Armas e items

### 4.1. Slots recomendados

```ts
type EquipmentSlot =
  | 'main'
  | 'helmet'
  | 'chest'
  | 'gloves'
  | 'boots'
  | 'rings'
  | 'amulet'
  | 'companion'
  | 'consumable1';
```

Early game puede mostrar menos slots. Técnicamente conviene diseñar todo desde el principio.

Orden de desbloqueo sugerido:

| Momento | Slots visibles |
|---|---|
| Tutorial | arma, armadura, anillos |
| Día 1 | botas, guantes, amuleto |
| Día 3 | consumibles |
| Semana 1 | companion  |
| Midgame | sockets, sets, gemas avanzadas |

### 4.2. Modelo de item

```ts
type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

type ItemDefinition = {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  levelReq?: number;
  accountRankReq?: number;

  weaponType?: WeaponType;
  armorType?: 'light' | 'medium' | 'heavy' | 'cloth';

  baseStats: Partial<Record<CoreStat, number>>;
  damageTypes?: Partial<Record<DamageType, number>>;
  resistances?: Partial<Record<DamageType, number>>;
  counters?: Partial<Record<CounterKey, number>>;

  tags: string[];
  sockets?: SocketDefinition[];
  implicitAffixes?: AffixInstance[];
  setId?: string;
};

type ItemInstance = {
  instanceId: string;
  definitionId: string;
  itemLevel: number;
  rarity: ItemRarity;
  rolledAffixes: AffixInstance[];
  sockets: SocketInstance[];
  quality: number; // 0..100
  bound?: boolean;
  createdAt: number;
};
```

### 4.3. Core stats actuales y sugeridos

Actualmente existen:

- `power`
- `defense`
- `speed`
- `luck`
- `stamina`

Se pueden mantener, pero agregar métricas derivadas.

```ts
type CoreStat =
  | 'power'
  | 'defense'
  | 'speed'
  | 'luck'
  | 'stamina'
  | 'critChance'
  | 'critPower'
  | 'accuracy'
  | 'evasion'
  | 'block'
  | 'focus';
```

No hace falta mostrar todos desde el día 1.

Recomendación de UI:

- mostrar siempre `Power`, `Defense`, `Speed`, `Luck`, `Stamina`;
- mostrar stats avanzados en tooltip o sección “Detalles de build”;
- mostrar counters relevantes solo cuando una expedición los necesita.

Ejemplo:

> Esta expedición recomienda: Fuego, Cleanse, Anti-Regeneración.  
> Tu build: Fuego 42/35 ✅, Cleanse 12/25 ⚠️, Anti-Regeneración 38/30 ✅

### 4.4. Identidad de cada tipo de arma

| Arma | Fantasía | Stats típicos | Counters típicos | Masteries relacionadas |
|---|---|---|---|---|
| Sword | versátil, balanceada | power, speed, crit | bleed, parry, fireSource si encantada | Sword, Fire, Bleed |
| Axe | daño alto, cleave | power, critPower | areaDamage, armorBreak, bleed | Axe, Beast, Forest |
| Dagger | rápida, veneno, sigilo | speed, crit, luck | poisonSource, stealth, lockpicking | Dagger, Poison, Shadow |
| Spear | alcance, anti-flying | power, accuracy | rangedReach, antiBeast, piercing | Spear, Sky, Beast |
| Bow | rango, scouting | speed, accuracy, luck | rangedReach, scouting, flying counter | Bow, Lightning, Hunting |
| Staff | magia fuerte | focus, elemental damage | fire/cold/lightning/arcane source | Staff, Elemental schools |
| Wand | magia rápida | speed, focus | barrierBreak, dispel | Wand, Arcane |
| Mace | anti-undead, blunt | power, defense | holySource, armorBreak | Mace, Holy, Undead |
| Hammer | construct/siege | power, stamina | armorBreak, siegePower | Hammer, Engineering |
| Shield | supervivencia | defense, block, stamina | sustain, warding, curseMitigation | Shield, Heavy Armor |
| Orb | offhand mágico | focus, luck | elemental amplification, dispel | Arcane, chosen element |
| Crossbow | burst/rango | power, accuracy | singleTargetBurst, armor pierce | Crossbow, BossDamage |

### 4.5. Ejemplos de armas

#### Espada de fuego simple

```ts
const emberSword: ItemDefinition = {
  id: 'weapon_sword_ember_01',
  name: 'Espada de Brasa',
  slot: 'mainHand',
  rarity: 'rare',
  weaponType: 'sword',
  baseStats: { power: 42, speed: 8 },
  damageTypes: { physical: 0.65, fire: 0.35 },
  counters: { fireSource: 20, burn: 12 },
  tags: ['weapon', 'sword', 'fire', 'burn']
};
```

Uso:

- mejora `elementTerm` contra enemigos débiles a fuego;
- aporta `fireSource` para mapas con barreras quemables;
- aporta `burn` para cortar regeneración;
- sube maestría de Sword y Fire si se usa en expediciones;
- puede desbloquear pasivos de Sword 10 y Fire 10.

#### Daga de veneno

```ts
const venomDagger: ItemDefinition = {
  id: 'weapon_dagger_venom_01',
  name: 'Daga de Vidrio Verde',
  slot: 'mainHand',
  rarity: 'rare',
  weaponType: 'dagger',
  baseStats: { power: 30, speed: 18, luck: 5 },
  damageTypes: { physical: 0.55, poison: 0.45 },
  counters: { poisonSource: 25, stealth: 10, lockpicking: 8 },
  tags: ['weapon', 'dagger', 'poison', 'stealth']
};
```

Uso:

- fuerte contra humanoides, beasts o bosses vulnerables a veneno;
- malo contra undead o construct si son inmunes/resistentes a poison;
- ayuda en misiones de robo, infiltración, trampas o contratos;
- sube Dagger y Poison.

#### Martillo rompearmaduras

```ts
const ironbreakerHammer: ItemDefinition = {
  id: 'weapon_hammer_ironbreaker_01',
  name: 'Martillo Rompehierro',
  slot: 'mainHand',
  rarity: 'epic',
  weaponType: 'hammer',
  baseStats: { power: 58, stamina: 12 },
  damageTypes: { physical: 1.0 },
  counters: { armorBreak: 35, siegePower: 20 },
  tags: ['weapon', 'hammer', 'armorBreak', 'siege']
};
```

Uso:

- ideal contra constructs, armored y objetivos de asedio;
- puede tener menos speed pero más contribución en world bosses tipo Titan;
- sube Hammer y Engineering/Siege si el mapa lo permite.

---

## 5. Afijos

Los afijos son la pieza más importante para que el loot cambie builds.

La regla clave:

> No todos los afijos deben aumentar `successChance`. La mayoría debe modificar daño, counters, masteries, recompensas, duración, drops o preparación.

### 5.1. Modelo de afijo

```ts
type AffixType = 'prefix' | 'suffix' | 'implicit' | 'unique' | 'setBonus';

type AffixDefinition = {
  id: string;
  name: string;
  type: AffixType;
  allowedSlots: EquipmentSlot[];
  minItemLevel?: number;
  rarityWeight: number;
  tags: string[];

  roll: {
    min: number;
    max: number;
    precision?: number;
  };

  effects: AffixEffect[];
};

type AffixEffect =
  | { kind: 'stat'; stat: CoreStat; value: number }
  | { kind: 'damageType'; damageType: DamageType; value: number }
  | { kind: 'resistance'; damageType: DamageType; value: number }
  | { kind: 'counter'; counter: CounterKey; value: number }
  | { kind: 'masteryXp'; mastery: MasteryKey | 'matchingWeapon' | 'matchingElement'; value: number }
  | { kind: 'successChance'; scope: AffixScope; value: number }
  | { kind: 'lootModifier'; scope: AffixScope; value: number }
  | { kind: 'durationModifier'; scope: AffixScope; value: number }
  | { kind: 'resourceModifier'; resource: ResourceKey; value: number }
  | { kind: 'conversion'; from: DamageType; to: DamageType; value: number }
  | { kind: 'conditionalCounter'; condition: AffixCondition; counter: CounterKey; value: number };
```

### 5.2. Scope de afijos

```ts
type AffixScope = {
  contentTypes?: ExpeditionType[];
  regionTags?: RegionTag[];
  enemyFamilies?: EnemyFamily[];
  hazards?: HazardTag[];
  mechanics?: EnemyMechanic[];
  maxBaseDurationMinutes?: number;
  minBaseDurationMinutes?: number;
  bossOnly?: boolean;
  nonBossOnly?: boolean;
};
```

Ejemplos:

- `+5% successChance en bosses`
- `+12% loot en Criptas`
- `+20% XP de Espada`
- `+15% recursos de Montaña`
- `+10% speed en misiones <= 5 min`
- `+25 poisonMitigation en mapas con poisonCloud`

### 5.3. Categorías de afijos

#### 5.3.1. Afijos de stats base

| ID | Nombre | Efecto | Slots | Comentario |
|---|---|---|---|---|
| `of_power` | del Poder | `+power` | todos | Simple, early game. |
| `of_guarding` | de Guardia | `+defense` | armor, shield, rings | Ayuda a survival. |
| `of_swiftness` | de Velocidad | `+speed` | boots, gloves, weapons | Puede reducir duración. |
| `of_fortune` | de Fortuna | `+luck` | rings, amulet, trinket | Luck tiene cap. |
| `of_vigor` | de Vigor | `+stamina` | chest, belt, boots | Importante en misiones largas. |
| `of_focus` | de Foco | `+focus` | staff, wand, orb, amulet | Para builds mágicas. |

#### 5.3.2. Afijos elementales ofensivos

| ID | Nombre | Efecto | Slots | Interacción |
|---|---|---|---|---|
| `flaming` | Flamígero | `+fireDamage`, `+fireSource` | weapon, ring, amulet | Debilidades a fuego, antiRegen. |
| `frostbound` | Gélido | `+coldDamage`, `+coldSource` | weapon, ring, amulet | Control, dragones de fuego. |
| `stormcharged` | Tormentoso | `+lightningDamage`, `+lightningSource` | weapon, gloves, ring | Constructs, flying, shock. |
| `venomous` | Venenoso | `+poisonDamage`, `+poisonSource` | weapon, dagger, ring | Beasts/humanoids, malo vs undead/construct. |
| `umbral` | Umbrío | `+shadowDamage`, `+shadowSource` | weapon, cloak, amulet | Espíritus, sigilo, demonios especiales. |
| `radiant` | Radiante | `+holyDamage`, `+holySource` | mace, shield, amulet | Undead, curse, demon. |
| `arcane` | Arcano | `+arcaneDamage`, `+arcaneSource` | staff, wand, orb | Barriers, unstable magic. |
| `serrated` | Serrado | `+bleedDamage`, `+bleed` | sword, axe, dagger | Regenerating, beasts. |

#### 5.3.3. Afijos defensivos y de mitigación

| ID | Nombre | Efecto | Slots | Uso |
|---|---|---|---|---|
| `fireward` | Antifuego | `+fireResistance`, `+fireMitigation` | armor, shield, ring | Volcanic, dragons, fireAura. |
| `frostward` | Antihielo | `+coldResistance`, `+coldMitigation` | armor, cloak, ring | Frostlands, freezingWind. |
| `antivenom` | Antídoto | `+poisonResistance`, `+poisonMitigation` | belt, boots, ring, amulet | Swamp, poisonous bosses. |
| `shadowward` | Anti-sombra | `+shadowResistance`, `+shadowMitigation` | cloak, amulet | Curses, spirits, abyss. |
| `blessed` | Bendito | `+holyResistance`, `+curseMitigation` | shield, amulet, mace | CurseAura, undead. |
| `grounded` | Conectado a Tierra | `+lightningResistance` | boots, armor | Storm zones, constructs. |
| `stabilized` | Estabilizado | `+arcaneResistance` | orb, amulet, cloak | ManaDrain, unstableMagic. |

#### 5.3.4. Afijos de counters directos

| ID | Nombre | Counter | Slots | Contra qué sirve |
|---|---|---|---|---|
| `of_cleansing` | de Purificación | `cleanse` | amulet, shield, staff, trinket | poison, curse, disease. |
| `of_dispelling` | de Disipación | `dispel`, `barrierBreak` | wand, staff, orb | magicBarrier, shielded. |
| `piercing` | Perforante | `armorBreak` | spear, bow, crossbow, weapon | armored. |
| `crushing` | Demoledor | `armorBreak`, `siegePower` | hammer, mace | constructs, siegeTarget. |
| `scouting` | del Explorador | `scouting` | boots, cloak, bow, trinket | ambush, darkness, traps. |
| `trapwise` | del Trampero | `trapDetection` | boots, gloves, trinket | traps. |
| `longmarch` | de Marcha Larga | `staminaSupply`, `foodSupply` | boots, belt, chest | longAttrition, 8h+. |
| `cleaving` | Cercenador | `areaDamage` | axe, sword, gloves | swarm. |
| `sniping` | del Francotirador | `singleTargetBurst`, `rangedReach` | bow, crossbow | bosses, flying. |
| `warding` | de Salvaguarda | `warding` | shield, amulet, cloak | curse, reflection. |
| `mending` | Restaurador | `healing`, `sustain` | staff, amulet, ring | attrition, reflective. |

#### 5.3.5. Afijos de maestría y XP

| ID | Nombre | Efecto | Slots | Uso |
|---|---|---|---|---|
| `sword_training` | del Duelista | `+Sword Mastery XP` | sword, gloves, ring | Farmear Sword 10. |
| `fire_training` | del Piromante | `+Fire Mastery XP` | fire items, amulet | Farmear Fire. |
| `poison_training` | del Toxicólogo | `+Poison Mastery XP` | dagger, belt, ring | Farmear Poison/Alchemy. |
| `cartographer` | del Cartógrafo | `+Region Mastery XP` | boots, cloak, trinket | Subir regiones. |
| `bestiary_scholar` | del Bestiario | `+Enemy Family Mastery XP` | amulet, trinket | Subir Undead/Beast/etc. |
| `apprentice` | del Aprendiz | `+matchingWeapon Mastery XP` | weapons | Genérico early. |
| `elementalist` | del Elementalista | `+matchingElement Mastery XP` | elemental gear | Multi-elemental. |
| `account_scholar` | del Cronista | `+Account Mastery XP` | trinket, amulet | Muy raro, cap alto. |

Regla de balance: los afijos de mastery XP no deben ser siempre óptimos para vencer contenido. Son gear de progreso, no necesariamente gear de push.

#### 5.3.6. Afijos de loot y recursos

| ID | Nombre | Efecto | Scope | Uso |
|---|---|---|---|---|
| `relic_hunter` | Cazador de Reliquias | `+rareDropChance` | ruins, crypt, bosses | Buscar uniques/fragments. |
| `prospector` | Prospector | `+oreDrops` | mountain, mine | Ciudad/Forge. |
| `herbalist` | Herbolario | `+herbDrops` | forest, swamp | Alchemy. |
| `trophy_hunter` | Cazador de Trofeos | `+trophyDrops` | beasts, bosses | Codex/Bestiary. |
| `goldfinder` | Buscador de Oro | `+gold` | all | Farming oro. |
| `gemfinder` | Buscagemas | `+gemDust`, `+gemDropChance` | mine, construct, boss | Gemcutter. |
| `mapfinder` | Rastreador de Mapas | `+mapDropChance` | non-boss | Desbloquear mapas. |
| `caravan` | de Caravana | `+cityResources` | escort/long missions | Ciudad. |

#### 5.3.7. Afijos de duración

| ID | Nombre | Efecto | Uso |
|---|---|---|---|
| `quickstep` | Paso Veloz | reduce duración en misiones cortas | Farm diario. |
| `enduring` | Incansable | mejora misiones largas | 4h/8h/12h. |
| `nightwatch` | Guardia Nocturna | bonus offline/largo | Sesiones de noche. |
| `efficient` | Eficiente | reduce duración si successChance > X | Farm seguro. |

#### 5.3.8. Afijos directos de successChance

Estos deben existir, pero ser menos comunes y más acotados.

| ID | Nombre | Efecto | Cap sugerido |
|---|---|---|---|
| `of_success` | del Éxito | `+1%..3% successChance` global | global cap +5% |
| `boss_slayer` | Matabosses | `+2%..6% bossSuccessChance` | boss cap +8% |
| `sprinter` | de Misiones Rápidas | `+2%..5% en misiones <= 5 min` | short cap +8% |
| `delver` | de Mazmorra | `+2%..5% en dungeons` | dungeon cap +8% |
| `regional_expert` | Experto Regional | `+2%..6% en región específica` | regional cap +10% |

Regla: `directAffixTerm` no debe superar normalmente +8% a +10%. El resto debe venir de counters, masteries y preparación.

#### 5.3.9. Afijos de conversión y build-enabling

Estos son los que hacen que el loot cambie builds.

| ID | Nombre | Efecto | Ejemplo de impacto |
|---|---|---|---|
| `convert_physical_to_fire` | de Brasa Interior | convierte 20%-40% physical a fire | espada física ahora sirve contra regenerating. |
| `crit_applies_burn` | Incendiario | críticos aplican burn | sinergia con sword/dagger/crit. |
| `block_grants_holy` | Juramento de Escudo | block aporta holySource | shield build anti-undead. |
| `poison_counts_as_armorbreak` | Ácido Corrosivo | poison aporta armorBreak contra constructs vivos | build poison alternativa. |
| `cold_shatters_barrier` | Escarcha Fracturante | cold aporta barrierBreak | contra magicBarrier. |
| `bleed_counts_antiregen` | Hemorragia Profunda | bleed aporta antiRegen | alternativa a fire. |
| `lightning_hits_flying` | Cazatormentas | lightning aporta rangedReach vs flying | staff/storm contra sky. |
| `holy_cleanses` | Luz Purificadora | holySource aporta cleanse parcial | capillas/templar builds. |

Estos afijos deberían estar en rares/epics/legendary, no en common.

---

## 6. Gemas y sockets

Las gemas son una forma excelente de permitir preparación sin depender 100% del drop perfecto.

### 6.1. Filosofía

Los items dan identidad. Las gemas permiten ajustar la build.

Ejemplo:

- tenés una espada buena, pero no tiene fuego;
- le ponés Ruby para sumar `fireSource` y algo de `burn`;
- ahora podés intentar un boss regenerativo aunque no tengas una espada de fuego perfecta.

### 6.2. Modelo de socket

```ts
type SocketColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'white' | 'black';

type SocketDefinition = {
  color: SocketColor;
  locked?: boolean;
};

type SocketInstance = {
  color: SocketColor;
  gemInstanceId?: string;
};
```

### 6.3. Rareza y cantidad de sockets

| Rareza | Sockets típicos |
|---|---:|
| common | 0 |
| uncommon | 0-1 |
| rare | 1 |
| epic | 1-2 |
| legendary | 2-3 |
| mythic | 3 |

Slots con más chance de socket:

- weapon;
- chest;
- amulet;
- rings;
- trinket;
- shield;
- staff/orb.

### 6.4. Tiers de gemas

```ts
type GemTier = 'chipped' | 'flawed' | 'normal' | 'flawless' | 'perfect';
```

Progresión:

- 3 chipped → 1 flawed;
- 3 flawed → 1 normal;
- etc.;
- requiere `gemDust`, oro y nivel de Gemcutter.

### 6.5. Tabla de gemas

| Gema | Color | En arma | En armadura | En joyería | Uso principal |
|---|---|---|---|---|---|
| Ruby | red | fireDamage, fireSource, burn | fireResist | Fire Mastery XP | Fuego / antiRegen |
| Sapphire | blue | coldDamage, freeze | coldResist | Cold Mastery XP | Control / anti-fire |
| Topaz | yellow | lightningDamage, shock | lightningResist | Speed / Lightning XP | Flying / construct |
| Emerald | green | poisonDamage, poisonSource | poisonResist | Poison XP / herbs | Swamp / poison |
| Amethyst | purple | shadowDamage | shadowResist | Shadow XP / stealth | Curse / spirits |
| Diamond | white | holyDamage | curseMitigation | Holy XP / cleanse | Undead / demon |
| Opal | white | arcaneDamage | arcaneResist | Arcane XP / dispel | Barriers |
| Onyx | black | critPower / bleed | defense vs bosses | BossDamage | Bossing |
| Garnet | red | bleed | physicalResist | Sword/Axe XP | Regeneration alternative |
| Jade | green | natureDamage | diseaseResist | loot/herbs | Plant/beast/farming |
| Quartz | white | cleanse small | warding | account/codex bonus | Utility |
| Amber | yellow | speedClear | staminaSupply | mastery XP | Time efficiency |

### 6.6. Ejemplo de valores por tier

| Tier | Counter rating | Damage/resist bonus | XP bonus |
|---|---:|---:|---:|
| chipped | +4 | +2% | +3% |
| flawed | +7 | +4% | +5% |
| normal | +11 | +6% | +8% |
| flawless | +16 | +9% | +12% |
| perfect | +22 | +13% | +18% |

### 6.7. Reglas de balance para gemas

- Las gemas no deberían reemplazar por completo a una build correcta.
- Una gema normal debería ayudar a cubrir un counter menor.
- Dos gemas buenas deberían permitir cubrir un counter importante.
- Para bosses semanales, gemas + consumibles + mastery deberían ser parte de la preparación.
- Remover gemas debería costar oro/gemDust, pero no destruirlas al principio. Destruir gemas puede ser una mecánica hardcore para lategame, pero no es recomendable para early.

---

## 7. BuildProfile

El `BuildProfile` es el corazón técnico del refactor.

En vez de que cada expedición mire directamente los items, primero se calcula un perfil derivado del loadout.

### 7.1. Modelo

```ts
type BuildProfile = {
  powerScore: number;
  stats: Record<CoreStat, number>;

  weaponTypes: Partial<Record<WeaponType, number>>;
  primaryWeaponType?: WeaponType;
  armorType?: 'light' | 'medium' | 'heavy' | 'cloth';

  damageOutput: Partial<Record<DamageType, number>>;
  damageShare: Partial<Record<DamageType, number>>;
  resistances: Partial<Record<DamageType, number>>;
  counters: Partial<Record<CounterKey, number>>;

  masteryLevels: Partial<Record<MasteryKey, number>>;
  masteryXpMultipliers: Partial<Record<MasteryKey, number>>;

  rewardMultipliers: RewardMultipliers;
  durationModifiers: DurationModifiers;
  successModifiers: ScopedSuccessModifier[];

  tags: Set<string>;
  warnings: BuildWarning[];
};
```

### 7.2. Cómo calcular `powerScore`

Podés mantener el cálculo actual como base:

```ts
function calculatePowerScore(input: PowerScoreInput): number {
  return input.power
    + input.defense * 0.55
    + input.speed * 0.7
    + input.luck * 0.5
    + input.stamina * 0.03
    + input.shrineLevel * 2
    + input.guildLegacy * 2;
}
```

Pero el punto importante es que `powerScore` ya no representa todo.

### 7.3. Cómo calcular daño por tipo

Cada arma puede tener `damageTypes` como proporción.

Ejemplo:

```ts
damageTypes: { physical: 0.65, fire: 0.35 }
```

Entonces:

```ts
baseDamage = stats.power + weaponPower + relevantAffixPower;
fireDamageOutput = baseDamage * 0.35 * (1 + fireDamageBonus);
physicalDamageOutput = baseDamage * 0.65 * (1 + physicalDamageBonus);
```

Luego:

```ts
damageShare[type] = damageOutput[type] / totalDamageOutput;
```

Esto sirve para calcular `elementTerm`.

### 7.4. Cómo calcular counters desde daño elemental

Un daño elemental no debería automáticamente cubrir todo, pero sí aportar.

Ejemplo:

```ts
function deriveElementalCounters(profile: BuildProfile): void {
  const fireShare = profile.damageShare.fire ?? 0;
  const fireMastery = profile.masteryLevels['element:fire'] ?? 0;

  profile.counters.fireSource += fireShare * 40 + fireMastery * 0.8;

  if (fireShare >= 0.25) {
    profile.counters.burn += 8 + fireMastery * 0.6;
  }

  if (fireMastery >= 10) {
    profile.counters.antiRegen += 8;
  }
}
```

La misma idea aplica para otros elementos:

| Elemento | Counter derivado |
|---|---|
| fire | fireSource, burn, antiRegen parcial |
| cold | coldSource, freeze, crowdControl |
| lightning | lightningSource, shock, antiFlying parcial |
| poison | poisonSource, poisonDoT, antiHumanoid/Beast parcial |
| shadow | shadowSource, stealth, curse interactions |
| holy | holySource, cleanse parcial, undeadBane |
| arcane | arcaneSource, dispel, barrierBreak |
| bleed | bleed, antiRegen parcial |
| nature | healing, sustain, plant/beast interactions |

### 7.5. Cómo calcular counters desde armas

Cada arma aporta counters de identidad.

Ejemplo:

```ts
const weaponCounterDefaults: Record<WeaponType, Partial<Record<CounterKey, number>>> = {
  sword: { bleed: 8, singleTargetBurst: 5 },
  axe: { areaDamage: 12, armorBreak: 6, bleed: 8 },
  dagger: { poisonSource: 6, stealth: 10, lockpicking: 8 },
  spear: { rangedReach: 10, singleTargetBurst: 6 },
  bow: { rangedReach: 20, scouting: 8 },
  staff: { arcaneSource: 8, areaDamage: 8 },
  wand: { arcaneSource: 10, barrierBreak: 8 },
  mace: { holySource: 8, armorBreak: 8 },
  hammer: { armorBreak: 18, siegePower: 18 },
  shield: { sustain: 12, warding: 10 },
  orb: { arcaneSource: 8, dispel: 6 },
  crossbow: { rangedReach: 16, singleTargetBurst: 14 }
};
```

### 7.6. Cómo calcular counters desde afijos, gemas y consumibles

Las fuentes se suman.

```ts
function addCounter(profile: BuildProfile, key: CounterKey, value: number): void {
  profile.counters[key] = (profile.counters[key] ?? 0) + value;
}
```

Fuentes típicas:

| Fuente | Ejemplo | Valor típico |
|---|---|---:|
| Arma base | bow da rangedReach | +20 |
| Afijo rare | `of_cleansing` | +12..30 |
| Gema normal | Diamond en amulet | +11 cleanse/holy |
| Consumible | Antídoto mayor | +35 poisonMitigation |
| Building | Alchemy Lab L5 | +8 poisonMitigation si consumible activo |
| Codex | PoisonCloud III | +5 poisonMitigation |
| Mastery | Poison L10 | +8 poisonMitigation al usar poison gear |

### 7.7. UI recomendada de BuildProfile

No mostrar 40 counters siempre.

Mostrar:

1. Power total.
2. Daños principales.
3. Resistencias principales.
4. Counters relevantes para la expedición seleccionada.
5. Masteries que van a ganar XP.
6. Warnings.

Ejemplo:

```txt
Build actual
Power: 1,120 / recomendado 1,000 ✅
Daño principal: Fire 48%, Physical 42%, Bleed 10%
Counters relevantes:
- Anti-Regeneración: 42 / 35 ✅
- Poison Mitigation: 18 / 40 ⚠️
- Area Damage: 22 / 20 ✅
Masteries que subirán:
- Sword
- Fire
- Swamp
- Beast
- Alchemy
Warning: El veneno del pantano puede reducir tu chance máxima.
```

---

## 8. Expediciones

### 8.1. Modelo de expedición

```ts
type ExpeditionType =
  | 'normal'
  | 'elite'
  | 'dungeon'
  | 'map'
  | 'dailyBoss'
  | 'weeklyBoss'
  | 'worldBoss'
  | 'quest';

type ExpeditionDefinition = {
  id: string;
  name: string;
  type: ExpeditionType;

  baseDurationMinutes: number;
  recommendedPower: number;
  recommendedAccountRank?: number;
  recommendedMasteries?: MasteryRequirement[];

  baseChance?: number;
  minChance?: number;
  maxChance?: number;

  regionTags: RegionTag[];
  enemyFamilies: WeightedEnemyFamily[];
  hazards: HazardDefinition[];
  mechanics: MechanicDefinition[];

  enemyResistances: Partial<Record<DamageType, number>>;
  enemyWeaknesses: Partial<Record<DamageType, number>>;

  requiredCounters: CounterRequirement[];
  preferredCounters: CounterPreference[];
  bonusObjectives: BonusObjective[];

  rewards: RewardTable;
  masteryXpProfile: MasteryXpProfile;
  codexProgress: CodexProgressRule[];

  unlockRequirements?: UnlockRequirement[];
  mapModifiers?: MapModifier[];
};
```

### 8.2. Required counters vs preferred counters vs bonus objectives

#### Required counters

Son cosas importantes para completar el contenido.

No necesariamente bloquean, pero si faltan:

- bajan la chance;
- bajan el cap máximo;
- pueden causar debuffs;
- pueden transformar éxito en parcial.

```ts
type CounterRequirement = {
  counter: CounterKey;
  requiredScore: number;
  label: string;
  reason: string;

  missingPenalty: number;
  capPenalty: number;
  bonusIfCovered?: number;

  severity: 'minor' | 'major' | 'critical';
  hardCapIfBelow?: {
    coverage: number;
    maxChance: number;
  };
};
```

Ejemplo:

```ts
{
  counter: 'poisonMitigation',
  requiredScore: 40,
  label: 'Mitigación de Veneno',
  reason: 'El pantano emite nubes venenosas durante toda la expedición.',
  missingPenalty: 0.08,
  capPenalty: 0.12,
  bonusIfCovered: 0.02,
  severity: 'major'
}
```

#### Preferred counters

Ayudan, pero no son necesarios.

```ts
type CounterPreference = {
  counter: CounterKey;
  targetScore: number;
  label: string;
  bonus: number;
};
```

Ejemplo:

```ts
{
  counter: 'areaDamage',
  targetScore: 30,
  label: 'Daño en Área',
  bonus: 0.04
}
```

#### Bonus objectives

No afectan necesariamente la chance de éxito. Desbloquean rewards extra.

```ts
type BonusObjective = {
  id: string;
  label: string;
  condition: CounterCondition | MasteryCondition | ItemCondition;
  rewardModifier: RewardModifier;
};
```

Ejemplo:

```ts
{
  id: 'burn_the_nests',
  label: 'Quemar los Nidos',
  condition: { kind: 'counter', counter: 'fireSource', requiredScore: 35 },
  rewardModifier: { kind: 'extraChest', chestId: 'swamp_fire_cache' }
}
```

Resultado: aunque puedas completar una expedición sin fuego, llevar fuego puede desbloquear un cofre extra.

### 8.3. Hazards como generadores de requirements

Podés definir hazards y que generen requirements automáticamente.

```ts
const hazardRules = {
  poisonCloud: {
    requiredCounter: 'poisonMitigation',
    baseRequiredScore: 20,
    missingPenalty: 0.06,
    capPenalty: 0.10
  },
  curseAura: {
    requiredCounter: 'curseMitigation',
    baseRequiredScore: 25,
    missingPenalty: 0.07,
    capPenalty: 0.12
  },
  freezingWind: {
    requiredCounter: 'coldMitigation',
    baseRequiredScore: 20,
    missingPenalty: 0.05,
    capPenalty: 0.08
  }
};
```

Luego cada expedición puede tener intensidad:

```ts
hazards: [
  { tag: 'poisonCloud', intensity: 2 },
  { tag: 'traps', intensity: 1 }
]
```

Y el sistema genera:

```ts
requiredScore = baseRequiredScore * intensity * tierMultiplier;
```

### 8.4. Mecánicas como generadores de counters

Igual para mechanics.

```ts
const mechanicRules = {
  regenerating: {
    requiredCounter: 'antiRegen',
    baseRequiredScore: 25,
    missingPenalty: 0.10,
    capPenalty: 0.18
  },
  armored: {
    requiredCounter: 'armorBreak',
    baseRequiredScore: 20,
    missingPenalty: 0.06,
    capPenalty: 0.08
  },
  flying: {
    requiredCounter: 'rangedReach',
    baseRequiredScore: 25,
    missingPenalty: 0.07,
    capPenalty: 0.10
  },
  magicBarrier: {
    requiredCounter: 'barrierBreak',
    baseRequiredScore: 25,
    missingPenalty: 0.08,
    capPenalty: 0.14
  }
};
```

### 8.5. Resistencias y debilidades

Una expedición puede definir:

```ts
enemyWeaknesses: {
  fire: 0.35,
  holy: 0.20
},

enemyResistances: {
  poison: 0.60,
  shadow: 0.30
}
```

Esto no es un requisito duro. Afecta `elementTerm`.

Interpretación:

- si tu build hace mucho fire, sube la chance;
- si tu build depende de poison, baja la chance;
- si hacés daño mixto, el impacto es menor;
- si el boss además tiene `regenerating`, necesitás antiRegen aparte.

### 8.6. Ejemplo de expedición normal

```ts
const rottenFen: ExpeditionDefinition = {
  id: 'exp_rotten_fen_01',
  name: 'Pantano de la Savia Negra',
  type: 'normal',
  baseDurationMinutes: 45,
  recommendedPower: 450,
  recommendedAccountRank: 4,
  regionTags: ['swamp'],
  enemyFamilies: [
    { family: 'plant', weight: 0.6 },
    { family: 'beast', weight: 0.4 }
  ],
  hazards: [
    { tag: 'poisonCloud', intensity: 2 },
    { tag: 'longAttrition', intensity: 1 }
  ],
  mechanics: [
    { tag: 'regenerating', intensity: 1 }
  ],
  enemyWeaknesses: { fire: 0.35, bleed: 0.15 },
  enemyResistances: { poison: 0.40, nature: 0.30 },
  requiredCounters: [
    {
      counter: 'poisonMitigation',
      requiredScore: 30,
      label: 'Mitigación de Veneno',
      reason: 'Las nubes del pantano desgastan al héroe durante toda la expedición.',
      missingPenalty: 0.06,
      capPenalty: 0.10,
      bonusIfCovered: 0.02,
      severity: 'major'
    }
  ],
  preferredCounters: [
    {
      counter: 'fireSource',
      targetScore: 25,
      label: 'Fuente de Fuego',
      bonus: 0.04
    },
    {
      counter: 'antiRegen',
      targetScore: 20,
      label: 'Anti-Regeneración',
      bonus: 0.04
    }
  ],
  bonusObjectives: [
    {
      id: 'burn_roots',
      label: 'Quemar raíces antiguas',
      condition: { kind: 'counter', counter: 'fireSource', requiredScore: 35 },
      rewardModifier: { kind: 'extraResource', resource: 'blackSap', amountMultiplier: 1.35 }
    }
  ],
  rewards: {
    gold: { min: 80, max: 120 },
    resources: [{ key: 'blackSap', min: 1, max: 3 }],
    lootTables: ['swamp_common', 'plant_rare']
  },
  masteryXpProfile: {
    region: ['swamp'],
    enemyFamilies: ['plant', 'beast'],
    elementsFromBuild: true,
    weaponFromBuild: true,
    professionHints: ['alchemy', 'herbalism']
  },
  codexProgress: [
    { codexId: 'region_swamp', amount: 1 },
    { codexId: 'hazard_poison_cloud', amount: 1 },
    { codexId: 'enemy_plant', amount: 1 }
  ]
};
```

### 8.7. Ejemplo de dungeon elite

```ts
const ironVault: ExpeditionDefinition = {
  id: 'dng_iron_vault_01',
  name: 'Cámara de los Autómatas',
  type: 'elite',
  baseDurationMinutes: 120,
  recommendedPower: 900,
  recommendedAccountRank: 8,
  regionTags: ['ruins', 'mountain'],
  enemyFamilies: [{ family: 'construct', weight: 1 }],
  hazards: [
    { tag: 'traps', intensity: 2 },
    { tag: 'manaDrain', intensity: 1 }
  ],
  mechanics: [
    { tag: 'armored', intensity: 2 },
    { tag: 'magicBarrier', intensity: 1 }
  ],
  enemyWeaknesses: { lightning: 0.35, arcane: 0.15 },
  enemyResistances: { poison: 0.9, bleed: 0.8, physical: 0.15 },
  requiredCounters: [
    {
      counter: 'armorBreak',
      requiredScore: 45,
      label: 'Rompearmaduras',
      reason: 'Los autómatas tienen placas reforzadas.',
      missingPenalty: 0.08,
      capPenalty: 0.12,
      severity: 'major'
    },
    {
      counter: 'trapDetection',
      requiredScore: 30,
      label: 'Detección de Trampas',
      reason: 'La cámara está protegida por mecanismos antiguos.',
      missingPenalty: 0.05,
      capPenalty: 0.08,
      severity: 'minor'
    }
  ],
  preferredCounters: [
    { counter: 'lightningSource', targetScore: 35, label: 'Daño de Rayo', bonus: 0.05 },
    { counter: 'barrierBreak', targetScore: 30, label: 'Romper Barreras', bonus: 0.04 }
  ],
  bonusObjectives: [
    {
      id: 'disable_core',
      label: 'Desactivar núcleo central',
      condition: { kind: 'counter', counter: 'arcaneSource', requiredScore: 30 },
      rewardModifier: { kind: 'extraDropTable', lootTable: 'construct_core_bonus' }
    }
  ],
  rewards: {
    gold: { min: 180, max: 260 },
    resources: [
      { key: 'ancientGears', min: 2, max: 5 },
      { key: 'ironOre', min: 8, max: 16 }
    ],
    lootTables: ['construct_rare', 'ruins_epic']
  },
  masteryXpProfile: {
    region: ['ruins', 'mountain'],
    enemyFamilies: ['construct'],
    elementsFromBuild: true,
    weaponFromBuild: true,
    professionHints: ['engineering', 'mining']
  },
  codexProgress: [
    { codexId: 'enemy_construct', amount: 2 },
    { codexId: 'mechanic_armored', amount: 1 },
    { codexId: 'hazard_traps', amount: 1 }
  ]
};
```

---

## 9. Fórmula completa de expedición

Esta es la parte más importante para implementación.

### 9.1. Valores default por tipo de contenido

```ts
const expeditionChanceDefaults = {
  normal: {
    baseChance: 0.50,
    minChance: 0.12,
    maxChance: 0.96,
    powerWeight: 0.25,
    powerPenaltyCap: 0.25,
    powerBonusCap: 0.22,
    elementWeight: 0.18,
    counterBonusCap: 0.14,
    masteryTermCapPositive: 0.12,
    masteryTermCapNegative: 0.06,
    preparationCap: 0.10,
    directAffixCap: 0.08,
    luckCap: 0.08
  },
  elite: {
    baseChance: 0.48,
    minChance: 0.08,
    maxChance: 0.93,
    powerWeight: 0.25,
    powerPenaltyCap: 0.28,
    powerBonusCap: 0.20,
    elementWeight: 0.20,
    counterBonusCap: 0.16,
    masteryTermCapPositive: 0.13,
    masteryTermCapNegative: 0.08,
    preparationCap: 0.12,
    directAffixCap: 0.08,
    luckCap: 0.07
  },
  dailyBoss: {
    baseChance: 0.42,
    minChance: 0.05,
    maxChance: 0.90,
    powerWeight: 0.23,
    powerPenaltyCap: 0.30,
    powerBonusCap: 0.18,
    elementWeight: 0.22,
    counterBonusCap: 0.18,
    masteryTermCapPositive: 0.15,
    masteryTermCapNegative: 0.10,
    preparationCap: 0.16,
    directAffixCap: 0.08,
    luckCap: 0.06
  },
  weeklyBoss: {
    baseChance: 0.38,
    minChance: 0.03,
    maxChance: 0.88,
    powerWeight: 0.22,
    powerPenaltyCap: 0.32,
    powerBonusCap: 0.16,
    elementWeight: 0.24,
    counterBonusCap: 0.20,
    masteryTermCapPositive: 0.16,
    masteryTermCapNegative: 0.12,
    preparationCap: 0.18,
    directAffixCap: 0.07,
    luckCap: 0.05
  }
};
```

Idea de balance:

- En contenido normal, el poder puede ayudar bastante.
- En bosses, la preparación, counters y masteries pesan más.
- En weekly bosses, el poder bruto tiene menos capacidad de brute-force.

### 9.2. Paso 1: Power term

Mantiene la lógica actual de `power vs dungeon.power`.

```ts
function calculatePowerTerm(profile: BuildProfile, expedition: ExpeditionDefinition, cfg: ChanceConfig): number {
  const ratio = profile.powerScore / expedition.recommendedPower;
  return clamp(
    (ratio - 1) * cfg.powerWeight,
    -cfg.powerPenaltyCap,
    cfg.powerBonusCap
  );
}
```

Ejemplos con `powerWeight = 0.25`:

| Power ratio | Term |
|---:|---:|
| 0.60 | -10.0% |
| 0.80 | -5.0% |
| 1.00 | 0.0% |
| 1.20 | +5.0% |
| 1.50 | +12.5% |
| 2.00 | +22.0% cap |

Esto conserva el feeling actual.

### 9.3. Paso 2: Element term

```ts
function calculateElementTerm(profile: BuildProfile, expedition: ExpeditionDefinition, cfg: ChanceConfig): number {
  let fit = 0;

  for (const damageType of allDamageTypes) {
    const share = profile.damageShare[damageType] ?? 0;
    const weakness = expedition.enemyWeaknesses[damageType] ?? 0;
    const resistance = expedition.enemyResistances[damageType] ?? 0;
    fit += share * (weakness - resistance);
  }

  return clamp(fit * cfg.elementWeight, -0.14, 0.14);
}
```

Ejemplo:

- build hace 70% fire;
- enemigo tiene fire weakness 0.40;
- fit = 0.70 * 0.40 = 0.28;
- elementTerm = 0.28 * 0.18 = +5.04%.

Si el mismo enemigo resistiera poison 0.70 y tu build fuera 80% poison:

- fit = 0.80 * -0.70 = -0.56;
- elementTerm = -10.08%.

### 9.4. Paso 3: Counter coverage

```ts
function getCounterCoverage(profile: BuildProfile, counter: CounterKey, requiredScore: number): number {
  const score = profile.counters[counter] ?? 0;
  return clamp(score / requiredScore, 0, 1.25);
}
```

Interpretación:

| Coverage | Significado |
|---:|---|
| 0.00 | no tenés nada |
| 0.50 | cubrís la mitad |
| 1.00 | cubrís lo recomendado |
| 1.25 | sobrepreparado |

### 9.5. Paso 4: Missing counter penalty

```ts
function calculateMissingCounterPenalty(
  profile: BuildProfile,
  expedition: ExpeditionDefinition
): number {
  let penalty = 0;

  for (const req of expedition.requiredCounters) {
    const coverage = getCounterCoverage(profile, req.counter, req.requiredScore);
    const missing = Math.max(0, 1 - coverage);
    penalty += req.missingPenalty * missing;
  }

  return penalty;
}
```

Ejemplo:

- requerimiento: `poisonMitigation` 40;
- jugador tiene 20;
- coverage = 0.5;
- missing = 0.5;
- penalty = 0.08 * 0.5 = -4%.

### 9.6. Paso 5: Counter bonus term

```ts
function calculateCounterBonusTerm(
  profile: BuildProfile,
  expedition: ExpeditionDefinition,
  cfg: ChanceConfig
): number {
  let bonus = 0;

  for (const req of expedition.requiredCounters) {
    if (!req.bonusIfCovered) continue;
    const coverage = getCounterCoverage(profile, req.counter, req.requiredScore);
    bonus += req.bonusIfCovered * Math.min(coverage, 1);
  }

  for (const pref of expedition.preferredCounters) {
    const coverage = getCounterCoverage(profile, pref.counter, pref.targetScore);
    bonus += pref.bonus * Math.min(coverage, 1);
  }

  return clamp(bonus, 0, cfg.counterBonusCap);
}
```

### 9.7. Paso 6: Dynamic max chance

Este es el cambio más importante.

```ts
function calculateDynamicMaxChance(
  profile: BuildProfile,
  expedition: ExpeditionDefinition,
  cfg: ChanceConfig
): number {
  let maxChance = expedition.maxChance ?? cfg.maxChance;

  for (const req of expedition.requiredCounters) {
    const coverage = getCounterCoverage(profile, req.counter, req.requiredScore);
    const missing = Math.max(0, 1 - coverage);

    maxChance -= req.capPenalty * missing;

    if (req.hardCapIfBelow && coverage < req.hardCapIfBelow.coverage) {
      maxChance = Math.min(maxChance, req.hardCapIfBelow.maxChance);
    }
  }

  const minChance = expedition.minChance ?? cfg.minChance;
  return clamp(maxChance, minChance + 0.05, cfg.maxChance);
}
```

Ejemplo:

Boss con regeneración:

```ts
{
  counter: 'antiRegen',
  requiredScore: 45,
  missingPenalty: 0.10,
  capPenalty: 0.22,
  hardCapIfBelow: { coverage: 0.25, maxChance: 0.55 }
}
```

Si el jugador tiene 0 antiRegen:

- penalty: -10%;
- cap penalty: -22%;
- hard cap: máximo 55%.

Aunque tenga muchísimo poder, no supera 55%.

Si tiene 50% de coverage:

- penalty: -5%;
- cap penalty: -11%;
- no hard cap;
- maxChance quizá 79% en daily boss.

Si tiene 100%:

- sin penalty;
- sin cap penalty;
- puede llegar al max normal del contenido.

### 9.8. Paso 7: Mastery term

Las masteries no deberían ser solo “+power”. Tienen que afectar chance cuando son relevantes.

```ts
type MasteryRequirement = {
  mastery: MasteryKey;
  recommendedLevel: number;
  weight: number; // weights sum around 1
};
```

Ejemplo para un boss undead de cripta:

```ts
recommendedMasteries: [
  { mastery: 'enemy:undead', recommendedLevel: 8, weight: 0.30 },
  { mastery: 'region:crypt', recommendedLevel: 6, weight: 0.25 },
  { mastery: 'element:holy', recommendedLevel: 6, weight: 0.20 },
  { mastery: 'weapon:mace', recommendedLevel: 5, weight: 0.15 },
  { mastery: 'profession:alchemy', recommendedLevel: 4, weight: 0.10 }
]
```

Cálculo:

```ts
function calculateMasteryTerm(
  player: PlayerState,
  profile: BuildProfile,
  expedition: ExpeditionDefinition,
  cfg: ChanceConfig
): number {
  const reqs = expedition.recommendedMasteries ?? deriveMasteryRequirements(expedition, profile);

  let weightedReadiness = 0;
  let totalWeight = 0;

  for (const req of reqs) {
    const level = profile.masteryLevels[req.mastery] ?? 0;
    const coverage = level / Math.max(1, req.recommendedLevel);
    const readiness = clamp(coverage - 1, -1, 1.25);

    weightedReadiness += readiness * req.weight;
    totalWeight += req.weight;
  }

  if (totalWeight <= 0) return 0;

  const normalized = weightedReadiness / totalWeight;
  const raw = normalized * 0.10;

  return clamp(
    raw,
    -cfg.masteryTermCapNegative,
    cfg.masteryTermCapPositive
  );
}
```

Interpretación:

- estar justo en el nivel recomendado da 0%;
- estar muy por debajo penaliza un poco;
- estar muy por encima da bonus;
- la penalidad no debe ser tan fuerte como missing counters;
- la mastery premia inversión, no reemplaza preparación.

### 9.9. Paso 8: Preparation term

```ts
type PreparationBreakdown = {
  consumables: number;
  bossAttunement: number;
  scouting: number;
  city: number;
  codex: number;
  library: number;
  guild: number;
};
```

```ts
function calculatePreparationTerm(
  player: PlayerState,
  profile: BuildProfile,
  expedition: ExpeditionDefinition,
  cfg: ChanceConfig
): number {
  const prep = getPreparationBreakdown(player, profile, expedition);
  const raw =
    prep.consumables
    + prep.bossAttunement
    + prep.scouting
    + prep.city
    + prep.codex
    + prep.library
    + prep.guild;

  return clamp(raw, -0.02, cfg.preparationCap);
}
```

Fuentes sugeridas:

| Fuente | Ejemplo | Bonus típico |
|---|---|---:|
| Consumible correcto | antídoto en swamp | +2% a +6% |
| Boss Attunement | nivel 1..10 | +2% por nivel, cap por tipo |
| Scouting | Map Room / exploración previa | +1% a +5% |
| City building | Temple vs curse | +1% a +4% |
| Codex | Boss entry III | +1% a +4% |
| Library | research level | +0.4% por nivel, cap |
| Guild | raid banner / legacy | +1% a +5% |

### 9.10. Paso 9: Luck term

Se puede mantener parecido al actual, pero con cap.

```ts
function calculateLuckTerm(profile: BuildProfile, cfg: ChanceConfig): number {
  return clamp(profile.stats.luck * 0.002, 0, cfg.luckCap);
}
```

Recomendación:

- Luck también debería afectar loot, no solo success.
- Si Luck escala demasiado, bajar a `0.0015` o usar curva suave.

Alternativa:

```ts
luckTerm = cfg.luckCap * (1 - Math.exp(-luck / 40));
```

Eso evita que luck se vuelva absurdo.

### 9.11. Paso 10: Direct affix term

```ts
function calculateDirectAffixTerm(
  profile: BuildProfile,
  expedition: ExpeditionDefinition,
  cfg: ChanceConfig
): number {
  const raw = profile.successModifiers
    .filter(mod => scopeMatches(mod.scope, expedition))
    .reduce((sum, mod) => sum + mod.value, 0);

  return clamp(raw, -0.03, cfg.directAffixCap);
}
```

### 9.12. Paso 11: Class / Archetype term

Si el juego mantiene clases actuales, se puede migrar así:

```ts
classOrArchetypeTerm = classModifier + classPassiveBonus;
```

Pero a futuro conviene que el arquetipo salga del loadout.

Ejemplos:

| Arquetipo detectado | Condición | Bonus |
|---|---|---|
| Piromante de Espada | sword + fireShare >= 25% | +2% contra regenerating |
| Guardián | shield + heavy armor | +3% en longAttrition/boss |
| Cazador | bow + scouting alto | +3% en forest/sky/beast |
| Alquimista Sombrío | dagger + poison + alchemy | +3% en humanoid/beast, no undead |
| Templario | mace/shield + holy | +3% vs undead/curse |

```ts
function calculateArchetypeTerm(profile: BuildProfile, expedition: ExpeditionDefinition): number {
  const archetypes = detectArchetypes(profile);
  let bonus = 0;

  for (const archetype of archetypes) {
    bonus += getArchetypeBonus(archetype, expedition);
  }

  return clamp(bonus, -0.03, 0.08);
}
```

### 9.13. Fórmula final

```ts
function calculateExpeditionSuccessChance(
  player: PlayerState,
  loadout: Loadout,
  expedition: ExpeditionDefinition
): ExpeditionChanceResult {
  const profile = buildProfileFromLoadout(player, loadout);
  const cfg = getChanceConfig(expedition.type);

  const baseChance = expedition.baseChance ?? cfg.baseChance;
  const powerTerm = calculatePowerTerm(profile, expedition, cfg);
  const elementTerm = calculateElementTerm(profile, expedition, cfg);
  const counterBonusTerm = calculateCounterBonusTerm(profile, expedition, cfg);
  const missingCounterPenalty = calculateMissingCounterPenalty(profile, expedition);
  const masteryTerm = calculateMasteryTerm(player, profile, expedition, cfg);
  const preparationTerm = calculatePreparationTerm(player, profile, expedition, cfg);
  const luckTerm = calculateLuckTerm(profile, cfg);
  const directAffixTerm = calculateDirectAffixTerm(profile, expedition, cfg);
  const classOrArchetypeTerm = calculateArchetypeTerm(profile, expedition);

  const dynamicMaxChance = calculateDynamicMaxChance(profile, expedition, cfg);
  const minChance = expedition.minChance ?? cfg.minChance;

  const rawChance =
    baseChance
    + powerTerm
    + elementTerm
    + counterBonusTerm
    + masteryTerm
    + preparationTerm
    + classOrArchetypeTerm
    + luckTerm
    + directAffixTerm
    - missingCounterPenalty;

  const finalChance = clamp(rawChance, minChance, dynamicMaxChance);

  return {
    finalChance,
    rawChance,
    minChance,
    dynamicMaxChance,
    breakdown: {
      baseChance,
      powerTerm,
      elementTerm,
      counterBonusTerm,
      masteryTerm,
      preparationTerm,
      classOrArchetypeTerm,
      luckTerm,
      directAffixTerm,
      missingCounterPenalty
    },
    profileSummary: summarizeProfileForExpedition(profile, expedition),
    warnings: generateExpeditionWarnings(profile, expedition)
  };
}
```

### 9.14. Resultado parcial y fracaso

Para un idle RPG conviene no hacer que el fracaso sea 0 progreso.

```ts
type ExpeditionOutcome = 'success' | 'partial' | 'failure' | 'criticalSuccess';
```

```ts
function rollExpeditionOutcome(
  chance: ExpeditionChanceResult,
  profile: BuildProfile,
  expedition: ExpeditionDefinition,
  rng: Rng
): ExpeditionOutcome {
  const criticalSuccessChance = calculateCriticalSuccessChance(profile, expedition);
  const partialChance = calculatePartialChance(chance, profile, expedition);

  const roll = rng.next();

  if (roll <= criticalSuccessChance) return 'criticalSuccess';
  if (roll <= chance.finalChance) return 'success';
  if (roll <= chance.finalChance + partialChance) return 'partial';
  return 'failure';
}
```

#### Partial chance

```ts
function calculatePartialChance(
  chance: ExpeditionChanceResult,
  profile: BuildProfile,
  expedition: ExpeditionDefinition
): number {
  const sustain = profile.counters.sustain ?? 0;
  const scouting = profile.counters.scouting ?? 0;

  const base = 0.18;
  const sustainBonus = clamp(sustain / 200, 0, 0.06);
  const scoutingBonus = clamp(scouting / 200, 0, 0.04);
  const missingPenalty = chance.breakdown.missingCounterPenalty * 0.5;

  return clamp(base + sustainBonus + scoutingBonus - missingPenalty, 0.05, 0.32);
}
```

#### Recompensas por outcome

| Outcome | Rewards | Mastery XP | Codex | Riesgo |
|---|---:|---:|---:|---|
| Critical success | 120%-150% | 110% | +extra | sin debuff |
| Success | 100% | 100% | normal | bajo |
| Partial | 40%-70% | 70% | parcial | medio |
| Failure | 10%-25% | 35% | mínimo | posible debuff |

Esto mantiene progreso incluso si el jugador prueba builds nuevas.

### 9.15. Reward quality

Además de éxito, se puede calcular `rewardQuality`.

```ts
type RewardQualityResult = {
  lootMultiplier: number;
  goldMultiplier: number;
  resourceMultiplier: number;
  rareDropBonus: number;
  bonusChests: string[];
};
```

Factores:

- outcome;
- luck;
- loot affixes;
- bonus objectives;
- Codex;
- region mastery;
- city buildings;
- map modifiers.

Ejemplo:

```ts
lootMultiplier = outcomeMultiplier
  * (1 + scopedLootBonuses)
  * (1 + codexLootBonus)
  * (1 + regionMasteryLootBonus);
```

---

## 10. Ejemplos numéricos de fórmula

### 10.1. Boss: Hidra de Raíz Sangrante

Boss diario:

- recommendedPower: 1000
- type: dailyBoss
- baseChance: 42%
- weak: fire +40%, holy +20%
- resist: poison 70%, nature 50%
- mechanics: regenerating, poisonous, swarm
- required:
  - antiRegen 45, penalty 10%, cap 22%, hard cap 55% si coverage < 25%
  - poisonMitigation 40, penalty 8%, cap 12%
- preferred:
  - areaDamage 30, bonus 5%
  - fireSource 35, bonus 5%

#### Build A: mucho power, mala preparación

```txt
Power: 1300 / 1000
Daño: physical 90%, poison 10%
AntiRegen: 0 / 45
PoisonMitigation: 5 / 40
AreaDamage: 10 / 30
FireSource: 0 / 35
```

Cálculo aproximado:

| Término | Valor |
|---|---:|
| base | 42% |
| powerTerm | +7.5% |
| elementTerm | -1.5% |
| counterBonus | +1.6% |
| missingPenalty | -17.0% |
| masteryTerm | +1.0% |
| preparation | +0.0% |
| luck | +2.0% |
| raw | 32.1% |
| dynamic max | 55% por hard cap antiRegen |
| final | 32.1% |

El jugador tiene más poder, pero no preparó la mecánica central.

#### Build B: menos power, buena preparación

```txt
Power: 950 / 1000
Daño: fire 55%, physical 35%, bleed 10%
AntiRegen: 52 / 45
PoisonMitigation: 44 / 40
AreaDamage: 28 / 30
FireSource: 60 / 35
Consumible: Antídoto mayor
Fire Mastery: 9
Swamp Mastery: 5
Beast Mastery: 7
```

Cálculo aproximado:

| Término | Valor |
|---|---:|
| base | 42% |
| powerTerm | -1.25% |
| elementTerm | +4.6% |
| counterBonus | +13.7% |
| missingPenalty | 0% |
| masteryTerm | +4.5% |
| preparation | +6.0% |
| luck | +1.0% |
| raw | 69.85% |
| dynamic max | 90% |
| final | 69.85% |

Este es el comportamiento deseado.

### 10.2. Construct: Cámara de los Autómatas

Build poison con mucho power debería rendir mal porque:

- construct resiste poison;
- construct resiste bleed;
- necesita armorBreak;
- necesita lightning/hammer/arcane.

Build hammer/lightning con menos power debería rendir mejor.

Esto genera objetivos:

- subir Hammer;
- conseguir lightning gem;
- mejorar Engineering Workshop;
- desbloquear Construct Codex;
- farmear Iron Vault para mats de ciudad.

---

## 11. Bosses diarios, semanales y mundiales

### 11.1. Filosofía de bosses

Los bosses son donde más debe importar la preparación.

Regla:

> Un boss no debería pedir solo más power. Debería pedir entender una mecánica y preparar una respuesta.

Cada boss debe tener:

- familia;
- región;
- elemento dominante;
- 1 mecánica central;
- 1 hazard;
- 1 debilidad clara;
- 1 counter alternativo;
- drops que habilitan builds;
- Codex propio;
- attunement propio.

### 11.2. Boss Attunement

El sistema actual tiene `bossAttunementBonus`. Se puede profundizar.

```ts
type BossAttunement = {
  bossId: string;
  level: number;
  xp: number;
  maxLevel: number;
};
```

Cómo ganar XP:

- intentar el boss;
- hacer scouting en Map Room;
- completar quests relacionadas;
- estudiar en Library;
- progresar Codex del boss;
- vencer versiones menores.

Efectos:

| Nivel | Efecto |
|---:|---|
| 1 | revela una debilidad |
| 2 | +2% preparationTerm contra boss |
| 3 | revela un drop oculto |
| 4 | reduce una penalidad menor |
| 5 | +1 bonus chest semanal si gana |
| 6-10 | +2% por nivel, cap según boss |

Recomendación:

- Daily boss: cap attunement +8%.
- Weekly boss: cap +12%.
- World boss: attunement mejora contribución, no chance binaria.

### 11.3. Boss diario

#### Rol

- Contenido de preparación ligera.
- Rotación diaria.
- 1-3 intentos por día.
- Recompensas: gemDust, boss tokens, fragments, Codex, consumibles raros, materiales de building.

#### Estructura

```ts
type DailyBossDefinition = ExpeditionDefinition & {
  type: 'dailyBoss';
  attemptLimitPerDay: number;
  rotationGroup: string;
  bossId: string;
  attunementId: string;
};
```

#### Boss diario 1: Hidra de Raíz Sangrante

| Campo | Valor |
|---|---|
| Región | swamp |
| Familia | beast/plant |
| Hazards | poisonCloud |
| Mecánicas | regenerating, swarm |
| Debilidad | fire, bleed |
| Resistencia | poison, nature |
| Required | antiRegen, poisonMitigation |
| Preferred | areaDamage, fireSource |
| Drops | blackSap, hydraFang, Ruby/Emerald, set Plague/Ember |

Interacción:

- Fuego o Bleed profundo cortan regeneración.
- Antídotos reducen penalty y cap penalty.
- AoE mejora contra cabezas menores.
- Poison build sufre por resistencia.

#### Boss diario 2: Guardián de Escarcha Hueca

| Campo | Valor |
|---|---|
| Región | frostlands/crypt |
| Familia | undead/construct |
| Hazards | freezingWind, curseAura |
| Mecánicas | armored, frostAura |
| Debilidad | fire, holy, hammer |
| Resistencia | cold, poison |
| Required | coldMitigation, armorBreak |
| Preferred | holySource, fireSource |
| Drops | frostCore, paleBone, Sapphire/Diamond |

Interacción:

- Cold resist evita cap bajo.
- Hammer/Mace ayuda a armorBreak.
- Holy ayuda contra undead/curse.
- Fuego mejora elementTerm.

#### Boss diario 3: Coloso de Hierro Oxidado

| Campo | Valor |
|---|---|
| Región | ruins/mountain |
| Familia | construct |
| Hazards | traps, manaDrain |
| Mecánicas | armored, magicBarrier |
| Debilidad | lightning, hammer, arcane |
| Resistencia | poison, bleed, physical parcial |
| Required | armorBreak, barrierBreak |
| Preferred | lightningSource, siegePower |
| Drops | ancientGears, ironCore, Topaz/Opal |

Interacción:

- Hammer y Engineering son excelentes.
- Lightning aumenta elementTerm.
- Poison queda castigado.
- Arcane puede romper barrier.

#### Boss diario 4: Matriarca del Enjambre Ceniza

| Campo | Valor |
|---|---|
| Región | cinderlands/desert |
| Familia | insect |
| Hazards | burningHeat, ambush |
| Mecánicas | swarm, flying |
| Debilidad | cold, areaDamage, ranged |
| Resistencia | fire, poison parcial |
| Required | fireMitigation, areaDamage |
| Preferred | coldSource, rangedReach |
| Drops | chitin, emberWing, Sapphire/Onyx |

Interacción:

- Si no tenés AoE, mata lento y baja chance.
- Si no tenés fire mitigation, el calor cappea.
- Bow/Lightning/Cold pueden compensar.

#### Boss diario 5: Sombra del Bibliotecario

| Campo | Valor |
|---|---|
| Región | ruins/abyss |
| Familia | spirit/humanoid |
| Hazards | darkness, curseAura |
| Mecánicas | invisible, magicBarrier, curseCaster |
| Debilidad | holy, arcane |
| Resistencia | shadow, poison |
| Required | curseMitigation, scouting/lightSource |
| Preferred | dispel, holySource |
| Drops | cursedPages, shadowInk, Diamond/Amethyst/Opal |

Interacción:

- Holy/Cleanse muy valiosos.
- Scouting/Light evita cap por invisibilidad.
- Arcane/Dispel rompe barrier.

### 11.4. Boss semanal

#### Rol

- Contenido de preparación mediana/fuerte.
- Disponible toda la semana.
- Puede requerir varias expediciones de preparación.
- Recompensas fuertes: fragments legendarios, set pieces, materials de Era, Codex grande.

#### Estructura por fases

Un weekly boss puede tener 2-4 fases. Cada fase usa la misma fórmula con variaciones.

```ts
type BossPhase = {
  id: string;
  name: string;
  weight: number;
  mechanics: MechanicDefinition[];
  hazards: HazardDefinition[];
  requiredCounters: CounterRequirement[];
  preferredCounters: CounterPreference[];
  enemyWeaknesses: Partial<Record<DamageType, number>>;
  enemyResistances: Partial<Record<DamageType, number>>;
};

type WeeklyBossDefinition = ExpeditionDefinition & {
  type: 'weeklyBoss';
  phases: BossPhase[];
  weeklyAttemptLimit?: number;
  preparationExpeditions: string[];
};
```

#### Cálculo de chance por fases

```ts
function calculateWeeklyBossChance(player, loadout, boss): WeeklyBossChanceResult {
  const phaseResults = boss.phases.map(phase => {
    const phaseExpedition = mergeBossWithPhase(boss, phase);
    return calculateExpeditionSuccessChance(player, loadout, phaseExpedition);
  });

  const weightedLog = phaseResults.reduce((sum, result, index) => {
    const weight = boss.phases[index].weight;
    return sum + Math.log(Math.max(0.01, result.finalChance)) * weight;
  }, 0);

  const totalWeight = boss.phases.reduce((sum, p) => sum + p.weight, 0);
  const geometric = Math.exp(weightedLog / totalWeight);

  const finalChance = clamp(0.10 + geometric * 0.90, boss.minChance ?? 0.03, boss.maxChance ?? 0.88);

  return { finalChance, phaseResults };
}
```

Por qué media geométrica:

- si una fase está muy mal preparada, baja bastante;
- no alcanza con ser excelente en una fase e ignorar otra;
- representa mejor bosses con mecánicas múltiples.

#### Boss semanal 1: Lich de la Biblioteca Hueca

Fantasía: undead/caster/curse/barrier.

Fases:

1. **Salones Malditos**
   - hazards: curseAura, darkness
   - required: curseMitigation, scouting/lightSource
   - preferred: holySource

2. **Escudos Arcanos**
   - mechanics: magicBarrier, summoner
   - required: barrierBreak/dispel
   - preferred: arcaneSource, singleTargetBurst

3. **Filacteria del Lich**
   - mechanics: regenerating, phaseShift
   - required: antiRegen o holySource alto
   - preferred: bossDamage

Drops:

- fragmentos de filacteria;
- set Grave Warden;
- gemas Diamond/Opal/Amethyst;
- páginas de Codex;
- materiales para Library/Temple.

Builds buenas:

- Mace + Holy + Shield;
- Staff + Arcane + Dispel;
- Sword + Fire/Holy con Cleanse;
- Bow no es malo si tiene Light/Scouting pero no es óptimo.

#### Boss semanal 2: Dragón de las Cumbres de Ceniza

Fantasía: dragon/fire/flying/armored.

Fases:

1. **Ascenso Volcánico**
   - hazard: burningHeat, fallingRocks
   - required: fireMitigation, staminaSupply

2. **Combate Aéreo**
   - mechanic: flying
   - required: rangedReach
   - preferred: lightningSource, spear/bow

3. **Escamas de Obsidiana**
   - mechanic: armored, berserk
   - required: armorBreak
   - preferred: coldSource, singleTargetBurst

Drops:

- dragonScale;
- cinderHeart;
- set Storm/Dragonbane;
- Ruby/Topaz/Onyx;
- materiales de Era III/IV.

Builds buenas:

- Bow + Lightning;
- Spear + Cold;
- Hammer + FireRes + Ranged support;
- Crossbow burst.

#### Boss semanal 3: Leviatán de la Marea Podrida

Fantasía: swamp/coast/poison/attrition.

Fases:

1. **Pantano Profundo**
   - poisonCloud, flooded, longAttrition
   - required: poisonMitigation, staminaSupply

2. **Tentáculos del Abismo**
   - swarm, reflective
   - required: sustain, areaDamage

3. **Corazón Infectado**
   - regenerating, disease
   - required: antiRegen, cleanse
   - preferred: fireSource/holySource

Drops:

- leviathanIchor;
- plaguePearl;
- set Plague Doctor;
- Emerald/Jade/Quartz;
- materiales para Alchemy Lab.

### 11.5. World bosses

#### Rol

- Contenido global o de guild.
- No debería ser win/loss individual.
- Cada jugador aporta contribución según build.
- Permite roles no-DPS: scout, supply, ward, siege, cleanse.

#### Modelo

```ts
type WorldBossRole =
  | 'assault'
  | 'siege'
  | 'ward'
  | 'scout'
  | 'supply'
  | 'cleanse'
  | 'ritual';

type WorldBossDefinition = {
  id: string;
  name: string;
  durationHours: number;
  totalHp: number;
  phases: BossPhase[];
  allowedRoles: WorldBossRole[];
  contributionRules: Record<WorldBossRole, ContributionRule>;
  rewardTiers: WorldBossRewardTier[];
};
```

#### Contribución

```ts
function calculateWorldBossContribution(
  player: PlayerState,
  loadout: Loadout,
  boss: WorldBossDefinition,
  role: WorldBossRole
): ContributionResult {
  const profile = buildProfileFromLoadout(player, loadout);
  const roleRule = boss.contributionRules[role];

  const survivalChance = calculateRoleSurvivalChance(profile, boss, roleRule);
  const roleFit = calculateRoleFit(profile, roleRule);
  const powerComponent = Math.sqrt(profile.powerScore);
  const masteryComponent = calculateWorldBossMasteryComponent(profile, boss, role);
  const prepComponent = calculateWorldBossPreparationComponent(player, profile, boss);

  const contribution = powerComponent
    * roleFit
    * survivalChance
    * masteryComponent
    * prepComponent;

  return { contribution, survivalChance, roleFit };
}
```

#### Roles

| Rol | Qué usa | Ejemplo de build |
|---|---|---|
| Assault | bossDamage, singleTargetBurst, elemento débil | crossbow, sword, staff |
| Siege | siegePower, armorBreak, hammer, engineering | hammer/construct breaker |
| Ward | warding, shield, holy, sustain | shield/temple build |
| Scout | scouting, ranged, speed, stealth | bow/dagger |
| Supply | staminaSupply, foodSupply, city logistics | long missions/city |
| Cleanse | cleanse, poison/curse mitigation, holy | mace/staff/temple |
| Ritual | arcane, codex, library, gems | staff/orb |

Esto permite que alguien que subió Alchemy, Cartography o Shield también aporte.

#### World boss 1: Titán Sepultado

- family: construct/giant;
- region: mountain/ruins;
- mechanics: armored, siegeTarget, earthquake;
- weaknesses: lightning, hammer, siege;
- roles clave: siege, ward, supply;
- drops: titanPlates, ancientCore, era materials.

#### World boss 2: Eclipse Demoníaco

- family: demon/spirit;
- region: abyss;
- mechanics: curseAura, shadow, phaseShift;
- weaknesses: holy, arcane;
- roles clave: cleanse, ritual, assault;
- drops: eclipseShard, demonHorn, shadow/holy sets.

#### World boss 3: Árbol Mundial Corrupto

- family: plant/elemental;
- region: forest/swamp;
- mechanics: regenerating, poisonCloud, swarm;
- weaknesses: fire, cleanse, antiRegen;
- roles clave: cleanse, assault, scout;
- drops: worldroot, corruptedSeed, city era materials.

---

## 12. Quests y contratos

Las quests deben usar el mismo sistema, no uno separado.

### 12.1. Tipos de quest

```ts
type QuestType =
  | 'expeditionCompletion'
  | 'bossKill'
  | 'resourceDelivery'
  | 'crafting'
  | 'masteryMilestone'
  | 'codexCollection'
  | 'cityUpgrade'
  | 'factionContract'
  | 'buildChallenge';
```

### 12.2. Modelo

```ts
type QuestDefinition = {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  objectives: QuestObjective[];
  rewards: QuestRewards;
  unlockRequirements?: UnlockRequirement[];
  repeatable?: boolean;
  resetCadence?: 'daily' | 'weekly' | 'seasonal';
};
```

### 12.3. Ejemplos

#### Quest de preparación

```txt
Nombre: Antídotos para el Pantano
Objetivo:
- Craftear 3 Antídotos Menores.
- Completar una expedición Swamp con poisonMitigation >= 25.
Recompensa:
- +1 Alchemy Mastery.
- Desbloquea Pantano de la Savia Negra.
```

#### Quest de build

```txt
Nombre: Que ardan las raíces
Objetivo:
- Completar Pantano de la Savia Negra con fireSource >= 35.
- Activar el bonus objective “Quemar raíces antiguas”.
Recompensa:
- Ruby normal.
- +10% Fire Mastery XP por 24h.
```

#### Quest de mastery

```txt
Nombre: Juramento del Duelista
Objetivo:
- Subir Sword Mastery a 10.
- Completar 5 expediciones con sword equipada.
Recompensa:
- Pasivo account-wide: +2 Sword counter score a todas las espadas.
- Desbloquea nodo de Sword en Training Hall.
```

#### Quest de ciudad

```txt
Nombre: Fundaciones de Piedra
Objetivo:
- Entregar 250 stone.
- Completar 3 expediciones Mountain.
- Mejorar Town Hall a nivel 3.
Recompensa:
- Desbloquea Era II: Aldea.
```

### 12.4. Build challenges

Los `buildChallenge` son útiles para enseñar sistemas.

Ejemplos:

- completar un mapa undead usando holySource;
- completar un construct usando armorBreak;
- completar un swamp con antidote;
- completar una misión de traps con scouting;
- derrotar un boss con una mastery específica.

Esto guía al jugador sin tutoriales largos.

---

## 13. Maestrías

### 13.1. Filosofía

La maestría debe cumplir cinco funciones:

1. Dar progreso permanente.
2. Incentivar probar armas, elementos y actividades distintas.
3. Desbloquear pasivos account-wide.
4. Interactuar con expediciones y bosses.
5. Alimentar Account Rank.

Regla:

> Cada maestría tiene que abrir una posibilidad, no solo subir un número.

### 13.2. Tipos de maestría

```ts
type MasteryCategory =
  | 'weapon'
  | 'element'
  | 'armor'
  | 'profession'
  | 'enemy'
  | 'region'
  | 'companion'
  | 'activity'
  | 'account';

type MasteryKey = `${MasteryCategory}:${string}`;
```

### 13.3. Weapon masteries

| Mastery | Cómo sube | Desbloqueos típicos |
|---|---|---|
| Sword | expediciones con sword | bleed, parry, versatile builds |
| Axe | axe equipada | cleave, areaDamage, beast farming |
| Dagger | dagger equipada | poison, stealth, lockpicking |
| Spear | spear equipada | rangedReach, anti-flying |
| Bow | bow equipada | scouting, flying, map speed |
| Staff | staff equipada | elemental scaling, AoE |
| Wand | wand equipada | barrierBreak, dispel |
| Mace | mace equipada | holy, undead, armorBreak |
| Hammer | hammer equipada | construct, siege, armorBreak |
| Shield | shield equipada/offhand | sustain, block, warding |
| Orb | orb offhand | arcane, elemental amplification |
| Crossbow | crossbow equipada | boss burst, armor pierce |

### 13.4. Element masteries

| Mastery | Identidad | Desbloqueos |
|---|---|---|
| Fire | burn, antiRegen, swarm clear | burn cuenta como antiRegen, bonus vs plant/undead |
| Cold | freeze, control, anti-fire | reduce burningHeat, crowdControl |
| Lightning | shock, constructs, flying | ranged lightning, bonus vs construct/flying |
| Poison | DoT, humanoids/beasts, alchemy | venenos mejoran loot, poison mitigation |
| Shadow | stealth, curse, spirits | stealth, shadowResist, curse tricks |
| Holy | cleanse, undead/demon | cleanse parcial, curseMitigation |
| Arcane | barrier/dispel, unstable magic | barrierBreak, map modifiers |
| Bleed | antiRegen alternativo, beasts | bleed profundo, boss wounds |
| Nature | sustain, healing, plants/beasts | healing, disease resist, herbalism synergy |

### 13.5. Profession masteries

| Mastery | Actividad | Conexiones |
|---|---|---|
| Mining | minas, mountains | ore, Forge, city, hammer |
| Smithing | craft gear | armas, armor, reroll base |
| Alchemy | potions, herbs | antidotes, cleanse, poison |
| Enchanting | runas/afijos | elemental conversions, reroll affixes |
| Gemcutting | gemas | sockets, gem upgrades |
| Engineering | constructs/siege | traps, armorBreak, city |
| Cartography | mapas/scouting | map drops, region unlocks |
| Herbalism | forest/swamp | herbs, potions, nature |
| Hunting | beasts | leather, trophies, bow/spear |
| Cooking | food/stamina | long missions, supply |
| Commerce | market/caravan | gold, trade, city resources |
| Leadership | companions/guild | followers, world boss roles |

### 13.6. Enemy family masteries

| Mastery | Sube al pelear contra | Bonus |
|---|---|---|
| Undead | undead | +Codex progress, holy/curse info |
| Beast | beasts | leather, bleed/fire effectiveness |
| Demon | demons | holy/cold, curse mitigation |
| Construct | constructs | armorBreak, lightning, engineering |
| Humanoid | bandits/cults | gold, stealth, contracts |
| Dragon | dragons | weekly bosses, elemental resists |
| Plant | plants | fire/bleed, herbal drops |
| Elemental | elementals | resistances, arcane |
| Insect | swarms | AoE, chitin drops |
| Spirit | spirits | holy/shadow/arcane |
| Giant | giants | siege, hammer, stamina |

### 13.7. Region masteries

| Region | Sube en | Bonus |
|---|---|---|
| Forest | forest | herbs, beasts, wood |
| Crypt | crypt/graveyard | undead, relics, holy |
| Mountain | mountain/mines | ore, constructs, stamina |
| Swamp | swamp | poison, herbs, blackSap |
| Desert | desert | heat, speed, relics |
| Frostlands | ice zones | coldResist, frost gems |
| Cinderlands | fire zones | fireResist, ruby, dragons |
| Ruins | ruins | constructs, arcane, traps |
| Abyss | abyss | demons, shadow, curses |
| Sky | sky | flying, lightning, spear/bow |
| Coast | coast | flooded, leviathan, trade |

### 13.8. Mastery XP formula

```ts
function calculateMasteryXp(
  expedition: ExpeditionDefinition,
  outcome: ExpeditionOutcome,
  profile: BuildProfile,
  mastery: MasteryKey
): number {
  const durationFactor = Math.sqrt(expedition.baseDurationMinutes / 5);
  const difficultyFactor = Math.sqrt(expedition.recommendedPower / 100);
  const outcomeFactor = getOutcomeMasteryFactor(outcome);
  const relevanceFactor = getMasteryRelevanceFactor(expedition, profile, mastery);
  const xpMultiplier = profile.masteryXpMultipliers[mastery] ?? 1;

  return Math.floor(
    10
    * durationFactor
    * difficultyFactor
    * outcomeFactor
    * relevanceFactor
    * xpMultiplier
  );
}
```

Outcome factors:

| Outcome | Factor |
|---|---:|
| criticalSuccess | 1.10 |
| success | 1.00 |
| partial | 0.70 |
| failure | 0.35 |

Relevance factors:

| Relación | Factor |
|---|---:|
| arma equipada principal | 1.00 |
| elemento principal del daño | 1.00 |
| elemento secundario >= 20% | 0.50 |
| región de expedición | 0.80 |
| familia enemiga principal | 0.80 |
| profesión usada por bonus objective | 0.60 |
| consumible usado | 0.30 |
| building support | 0.20 |

### 13.9. Curva de nivel de mastery

```ts
function masteryXpToNext(level: number, category: MasteryCategory): number {
  const categoryFactor = getCategoryFactor(category);
  return Math.floor(100 * Math.pow(level + 1, 1.65) * categoryFactor);
}
```

Factores:

| Categoría | Factor |
|---|---:|
| weapon | 1.00 |
| element | 1.10 |
| profession | 1.15 |
| enemy | 0.90 |
| region | 0.95 |
| companion | 1.05 |
| account | especial |

### 13.10. Desbloqueos por mastery

Estructura sugerida:

| Nivel | Tipo de recompensa |
|---:|---|
| 1 | mastery visible / título básico |
| 5 | bonus menor local |
| 10 | primer pasivo account-wide |
| 15 | sinergia con otra categoría |
| 20 | nodo avanzado / arquetipo |
| 30 | bonus lategame / cosmetic / unique craft |
| 50 | prestige / seasonal flex |

#### Sword Mastery

| Nivel | Recompensa |
|---:|---|
| 5 | +5 bleed counter al usar sword |
| 10 | Account-wide: desbloquea nodo “Versatile Edge”; todas las armas one-hand ganan +2 counter score si tienen daño elemental |
| 15 | Sword + Fire puede generar burn aunque fireShare sea 20% en vez de 25% |
| 20 | Desbloquea arquetipo “Spellsword” |
| 30 | +1 socket potencial en legendary swords craftadas |

#### Fire Mastery

| Nivel | Recompensa |
|---:|---|
| 5 | +5 fireSource si el build tiene cualquier fire damage |
| 10 | Burn cuenta parcialmente como antiRegen |
| 15 | +5% loot en plant/undead si fireSource >= 35 |
| 20 | Desbloquea “Controlled Flame”: reduce burningHeat penalty si usás fire gear |
| 30 | Craft de Ruby perfecto desbloqueado |

#### Poison Mastery

| Nivel | Recompensa |
|---:|---|
| 5 | +5 poisonSource |
| 10 | +8 poisonMitigation si llevás consumible de Alchemy |
| 15 | Poison puede aplicar “Corrosion” contra algunos armored vivos |
| 20 | Desbloquea arquetipo “Alquimista Sombrío” |
| 30 | +1 bonus roll en potions de poison/antidote |

#### Hammer Mastery

| Nivel | Recompensa |
|---:|---|
| 5 | +8 armorBreak al usar hammer |
| 10 | Account-wide: +5 siegePower en world boss roles |
| 15 | Hammer puede ignorar parte de physical resistance en constructs |
| 20 | Desbloquea arquetipo “Ironbreaker” |
| 30 | Craft de hammer épico con implicit armorBreak |

#### Holy Mastery

| Nivel | Recompensa |
|---:|---|
| 5 | +5 holySource |
| 10 | HolySource aporta cleanse parcial |
| 15 | +3% success vs curseAura si Temple nivel >= 3 |
| 20 | Desbloquea arquetipo “Grave Warden” |
| 30 | Mejora drops de undead bosses |

---

## 14. Rango de cuenta / Account Rank

### 14.1. Filosofía

Account Rank representa progreso total.

No debe subir solo con nivel de personaje. Debe subir por:

- masteries;
- Codex;
- bosses;
- ciudad;
- colecciones;
- logros de build;
- regiones;
- profesiones.

Regla:

> Todo progreso importante debería aportar algo al Account Rank.

### 14.2. Cálculo recomendado

```ts
type AccountRankSource =
  | 'masteryLevels'
  | 'codexPoints'
  | 'bossMilestones'
  | 'cityEra'
  | 'collectionSets'
  | 'questMilestones';
```

```ts
accountRankXp =
  sumMasteryLevelsWeighted
  + codexPoints * 5
  + bossMilestonePoints
  + cityEraPoints
  + questMilestonePoints
  + collectionPoints;
```

No hace falta que sea literalmente XP por acción. Puede recalcularse desde logros permanentes.

### 14.3. Unlock table sugerida

| Account Rank | Desbloqueo |
|---:|---|
| 1 | Expediciones básicas |
| 2 | Segundo loadout guardado |
| 3 | Profesiones básicas: Mining, Herbalism |
| 4 | Consumibles / Alchemy Lab |
| 5 | Daily bosses |
| 6 | Training Hall / mastery nodes |
| 7 | Gemas chipped/flawed |
| 8 | Ciudad: Campamento expandido |
| 10 | Dungeons elite |
| 12 | Map Room / mapas con modifiers |
| 15 | Weekly bosses |
| 18 | Sets |
| 20 | Guild / world boss roles |
| 22 | Reforging avanzado |
| 25 | Era III: Ciudad |
| 30 | World bosses |
| 35 | Legendary crafting |
| 40 | Era IV: Reino |
| 50 | Prestige / seasonal systems |

### 14.4. Pasivos de Account Rank

Cada ciertos rangos el jugador elige un nodo.

Categorías:

- Combat;
- Crafting;
- Exploration;
- City;
- Bossing;
- Loot;
- Mastery.

Ejemplos:

| Nodo | Efecto |
|---|---|
| Arsenal Training | +5% Weapon Mastery XP |
| Elemental Studies | +5% Element Mastery XP |
| Field Logistics | +3 staminaSupply en misiones largas |
| Cartographer's Eye | +5 scouting en mapas nuevos |
| Boss Analyst | +1% preparationTerm contra bosses estudiados |
| City Planner | -5% costo de buildings Era I/II |
| Gem Apprentice | -10% costo de fusionar gemas |

---

## 15. Ciudad principal

### 15.1. Filosofía

La ciudad es el sink de recursos y el objetivo estratégico de largo plazo.

No debe sentirse como un minijuego desconectado. Debe alimentar:

- expediciones;
- crafting;
- gemas;
- consumibles;
- masteries;
- bosses;
- Codex;
- Account Rank;
- world bosses.

### 15.2. Recursos de ciudad

```ts
type ResourceKey =
  | 'wood'
  | 'stone'
  | 'ironOre'
  | 'herbs'
  | 'leather'
  | 'food'
  | 'gold'
  | 'gemDust'
  | 'ancientGears'
  | 'blackSap'
  | 'holyRelic'
  | 'shadowInk'
  | 'dragonScale'
  | 'arcaneCrystal'
  | 'cinderHeart'
  | 'frostCore';
```

### 15.3. Eras

| Era | Nombre | Requisito | Desbloqueos |
|---:|---|---|---|
| I | Campamento | inicio | Expedition Board, Storehouse, basic Forge |
| II | Aldea | Town Hall 3, recursos básicos | Alchemy Lab, Training Hall, Market |
| III | Ciudad | Account Rank 25, weekly boss mats | Gemcutter avanzado, War Table, sets |
| IV | Reino | Account Rank 40, world boss mats | World bosses, legendary crafting, technologies |

### 15.4. Buildings principales

#### Town Hall

Rol: centro de ciudad, eras, cap de buildings.

| Nivel | Efecto |
|---:|---|
| 1 | desbloquea ciudad |
| 2 | +1 building queue o reducción menor de tiempo |
| 3 | desbloquea Era II |
| 5 | +1 expedition slot pasivo o mayor storage cap |
| 8 | desbloquea Era III |
| 12 | desbloquea Era IV |

Fórmula:

```ts
townHallLevel controls maxBuildingLevel = townHallLevel + eraBonus;
```

#### Expedition Board

Rol: slots, duración, selección de mapas.

Efectos:

- +expedition slots;
- permite guardar loadouts;
- reduce duración de expediciones normales;
- muestra counters recomendados;
- desbloquea elite/dungeons.

| Nivel | Efecto |
|---:|---|
| 1 | 1 expedition slot |
| 2 | muestra warnings de counters |
| 3 | 2 loadouts guardados |
| 5 | +1 expedition slot |
| 7 | map modifiers visibles |
| 10 | auto-repeat de expediciones farmeables |

#### Training Hall

Rol: masteries y account-wide nodes.

Efectos:

- desbloquea mastery nodes;
- aumenta mastery XP cap diario o bonus;
- permite elegir pasivos de Account Rank;
- mejora armas específicas.

| Nivel | Efecto |
|---:|---|
| 1 | muestra weapon masteries |
| 2 | unlock node al llegar mastery 10 |
| 4 | +5% weapon mastery XP |
| 6 | unlock element mastery nodes |
| 8 | +1 active mastery focus |
| 10 | respec de mastery nodes con costo |

#### Forge

Rol: crafting, item base, sockets, reroll parcial.

Efectos:

- craft armas/armaduras;
- mejorar quality;
- agregar sockets;
- reroll base stats;
- craft sets/legendarios.

| Nivel | Efecto |
|---:|---|
| 1 | craft common/uncommon |
| 3 | craft rare |
| 5 | improve quality |
| 6 | add socket a rare/epic con costo |
| 8 | craft epic |
| 10 | legendary base crafting |

#### Enchanter's Library

Rol: Codex, afijos, investigación, identificación.

Efectos:

- identifica afijos raros;
- revela weaknesses;
- da `libraryBonus` migrado a `preparationTerm`;
- desbloquea reroll de afijos;
- aumenta Codex progress.

| Nivel | Efecto |
|---:|---|
| 1 | Codex básico |
| 2 | revela debilidad principal de expediciones conocidas |
| 3 | +0.4% preparationTerm por nivel, cap interno |
| 5 | reroll 1 affix en rare |
| 7 | revela hidden bonus objectives |
| 10 | investigación de weekly bosses |

#### Alchemy Lab

Rol: consumibles, antídotos, potions, veneno.

Efectos:

- craft antídotos;
- craft resist potions;
- craft boss prep potions;
- mejora poison/cleanse interactions;
- produce consumibles para expediciones largas.

| Nivel | Efecto |
|---:|---|
| 1 | health/stamina potions |
| 2 | antidote menor |
| 3 | fire/cold resist potions |
| 5 | cleanse elixir |
| 7 | antiRegen oil |
| 10 | boss flasks |

#### Gemcutter

Rol: gemas y sockets.

Efectos:

- fusionar gemas;
- mejorar tiers;
- socket/unsocket;
- convertir gemDust;
- craft gemas target.

| Nivel | Efecto |
|---:|---|
| 1 | socket chipped/flawed |
| 2 | fusionar hasta normal |
| 4 | unsocket sin destruir |
| 6 | fusionar flawless |
| 8 | craft gem color target |
| 10 | perfect gems |

#### Cartographer's Tower / Map Room

Rol: scouting, mapas, modifiers, regiones.

Efectos:

- descubre expediciones;
- reduce unknown penalties;
- aumenta scouting;
- genera mapas especiales;
- permite pre-scout boss.

| Nivel | Efecto |
|---:|---|
| 1 | region scouting |
| 2 | muestra hazards antes de entrar |
| 3 | +scouting en expediciones nuevas |
| 5 | mapas con modifiers |
| 7 | pre-scout daily bosses |
| 10 | weekly boss phase scouting |

#### Temple / Shrine

Rol: cleanse, holy, curse mitigation, undead/demon.

Efectos:

- da warding;
- reduce curseAura;
- aumenta holySource si llevás holy gear;
- bendice consumibles;
- interactúa con undead/demon bosses.

| Nivel | Efecto |
|---:|---|
| 1 | shrine bonus actual |
| 2 | +curseMitigation global pequeña |
| 4 | blessing consumible diario |
| 6 | +cleanse si holySource >= X |
| 8 | boss blessing weekly |
| 10 | relic crafting |

#### Hunter's Lodge / Bestiary

Rol: enemy family Codex, trophies, beasts.

Efectos:

- mejora Codex de enemigos;
- aumenta trophy drops;
- desbloquea enemy family masteries;
- da bonuses vs beasts/dragons/insects.

| Nivel | Efecto |
|---:|---|
| 1 | Bestiary visible |
| 3 | +enemy codex progress |
| 5 | trophy contracts |
| 7 | boss trophy bonuses |
| 10 | dragon hunts |

#### Engineering Workshop

Rol: armorBreak, siege, constructs, traps.

Efectos:

- craft traps;
- mejora armorBreak consumibles;
- reduce trap hazards;
- aporta world boss siege;
- craft construct-specific gear.

| Nivel | Efecto |
|---:|---|
| 1 | trap tools |
| 2 | +trapDetection with tools |
| 4 | armorBreak oil |
| 6 | siege gear |
| 8 | construct cores |
| 10 | titan siege engines |

#### Market / Caravan Hub

Rol: economía, contratos, conversión de recursos.

Efectos:

- contratos diarios;
- trade resources;
- gold sinks;
- long missions;
- commerce mastery.

| Nivel | Efecto |
|---:|---|
| 1 | vender loot |
| 2 | contratos diarios |
| 4 | caravanas 4h/8h |
| 6 | resource exchange |
| 8 | rare merchant |
| 10 | auction/market advanced si aplica |

#### Barracks / War Table

Rol: companions, guild, world bosses.

Efectos:

- desbloquea companions;
- roles de world boss;
- campañas de guild;
- leadership mastery.

| Nivel | Efecto |
|---:|---|
| 1 | companion básico |
| 3 | second companion slot pasivo o support |
| 5 | guild campaigns |
| 7 | world boss role bonuses |
| 10 | war banners |

#### Storehouse

Rol: caps de recursos.

Efectos:

- aumenta storage;
- reduce pérdida de recursos;
- permite grandes upgrades.

Simple pero importante como sink.

---

## 16. Codex / Coleccionismo

### 16.1. Filosofía

El Codex es el sistema que convierte “hacer contenido” en colección permanente.

Debe dar:

- información;
- progreso;
- objetivos;
- pequeños bonuses;
- Account Rank;
- desbloqueo de loot dirigido;
- sensación de completar el mundo.

### 16.2. Categorías de Codex

```ts
type CodexCategory =
  | 'enemy'
  | 'boss'
  | 'region'
  | 'hazard'
  | 'mechanic'
  | 'weapon'
  | 'affix'
  | 'gem'
  | 'set'
  | 'resource'
  | 'lore';
```

### 16.3. Modelo

```ts
type CodexEntry = {
  id: string;
  category: CodexCategory;
  name: string;
  level: number;
  maxLevel: number;
  progress: number;
  progressToNext: number;
  discovered: boolean;
  rewardsByLevel: CodexReward[];
};
```

### 16.4. Niveles de Codex

| Nivel | Nombre | Efecto |
|---:|---|---|
| 0 | Desconocido | no muestra info completa |
| 1 | Descubierto | revela descripción y familia |
| 2 | Estudiado | revela debilidad/resistencia principal |
| 3 | Dominado | pequeño bonus práctico |
| 4 | Experto | desbloquea target farming / bonus objective |
| 5 | Legendario | cosmetic, título, Account Rank, bonus final |

### 16.5. Ejemplo: Codex de Undead

| Nivel | Recompensa |
|---:|---|
| 1 | revela que undead suelen resistir poison |
| 2 | revela weakness: holy/fire |
| 3 | +2 holySource contra undead |
| 4 | +5% chance de relic drops en crypt |
| 5 | título “Grave Scholar”, +Account Rank points |

### 16.6. Ejemplo: Codex de PoisonCloud

| Nivel | Recompensa |
|---:|---|
| 1 | warning visible en mapas con poisonCloud |
| 2 | muestra poisonMitigation recomendado |
| 3 | +3 poisonMitigation global |
| 4 | Alchemy Lab puede craft antidote específico |
| 5 | +1 bonus herb drop en swamp |

### 16.7. Ejemplo: Codex de Hidra de Raíz Sangrante

| Nivel | Recompensa |
|---:|---|
| 1 | revela familia beast/plant |
| 2 | revela que burn corta regeneración |
| 3 | +2% preparationTerm contra la Hidra |
| 4 | desbloquea bonus chest si fireSource >= 45 |
| 5 | desbloquea craft de Hydra Fang Dagger |

### 16.8. Cómo progresa Codex

Fuentes:

- completar expediciones;
- matar enemigos/familias;
- intentar bosses;
- identificar drops;
- estudiar en Library;
- entregar trofeos en Hunter's Lodge;
- completar quests;
- descubrir afijos/gemas/sets.

Regla:

- el Codex debe progresar incluso en partial/failure, pero menos;
- bosses deben dar Codex por intento para que preparación mejore con el tiempo;
- Codex debe revelar información antes de dar poder.

---

## 17. Sets y uniques

### 17.1. Filosofía

Los sets y uniques deben habilitar builds, no solo dar más stats.

### 17.2. Modelo de set

```ts
type SetDefinition = {
  id: string;
  name: string;
  pieces: string[];
  bonuses: {
    piecesRequired: number;
    effects: AffixEffect[];
  }[];
};
```

### 17.3. Sets propuestos

#### Ember Knight

Fantasía: Sword + Fire + Heavy/Medium.

| Piezas | Bonus |
|---:|---|
| 2 | +fireSource, +burn |
| 3 | burn aporta antiRegen adicional |
| 4 | sword hits pueden aplicar “Ember Mark” en bosses |
| 5 | +bonus chest en plant/undead si antiRegen cubierto |

Contenido objetivo:

- Hydra;
- undead regenerating;
- plant/swamp;
- cinder builds.

#### Plague Doctor

Fantasía: Poison + Alchemy + Cleanse.

| Piezas | Bonus |
|---:|---|
| 2 | +poisonMitigation |
| 3 | consumibles de Alchemy duran 1 expedición extra |
| 4 | poisonSource puede aplicar corrosion en humanoids/beasts |
| 5 | antidotes también dan cleanse parcial |

Contenido objetivo:

- swamp;
- humanoids;
- poison bosses;
- alchemy farming.

#### Grave Warden

Fantasía: Holy + Shield/Mace + Undead.

| Piezas | Bonus |
|---:|---|
| 2 | +holySource |
| 3 | holySource aporta curseMitigation |
| 4 | cleanse reduce cap penalties de curseAura |
| 5 | +rare relic drops en crypt/undead bosses |

#### Storm Ranger

Fantasía: Bow/Spear + Lightning + Flying.

| Piezas | Bonus |
|---:|---|
| 2 | +rangedReach |
| 3 | lightningSource aporta antiFlying |
| 4 | +speedClear en sky/forest |
| 5 | bonus contra flying bosses |

#### Ironbreaker

Fantasía: Hammer + ArmorBreak + Construct/Siege.

| Piezas | Bonus |
|---:|---|
| 2 | +armorBreak |
| 3 | +siegePower |
| 4 | armorBreak también reduce physical resistance de constructs |
| 5 | bonus de contribución en world boss siege |

#### Shadow Veil

Fantasía: Dagger + Shadow + Stealth.

| Piezas | Bonus |
|---:|---|
| 2 | +stealth |
| 3 | +trapDetection |
| 4 | shadowSource aporta scouting en darkness |
| 5 | unlock hidden chests en ruins/abyss |

### 17.4. Uniques propuestos

#### Espada: Juramento de Ceniza

```txt
Sword, Legendary
Daño: Physical/Fire
Implicit: +burn, +fireSource
Unique: Si Fire Mastery >= 10, burn cuenta como antiRegen completo contra bosses.
```

#### Martillo: Mandíbula del Titán

```txt
Hammer, Legendary
Implicit: +armorBreak, +siegePower
Unique: Contra constructs, 20% de tu armorBreak se convierte en bossDamage.
```

#### Amuleto: Lágrima del Santo Sin Nombre

```txt
Amulet, Legendary
Implicit: +holySource, +cleanse
Unique: Cleanse reduce cap penalties de curseAura en 30%.
```

#### Daga: Vidrio de la Peste

```txt
Dagger, Legendary
Implicit: +poisonSource, +stealth
Unique: Si Poison Mastery >= 15, poison puede contar como armorBreak contra humanoids armored.
```

#### Arco: Cuerda de Tormenta

```txt
Bow, Legendary
Implicit: +lightningSource, +rangedReach
Unique: LightningSource cuenta como rangedReach contra flying bosses.
```

---

## 18. Crafting, reforging y loot dirigido

### 18.1. Filosofía

El jugador necesita formas de perseguir builds sin depender solo de RNG.

Tres niveles:

1. Drop random.
2. Craft semi-dirigido.
3. Reforge/infusion específico con costo.

### 18.2. Crafting base

Forge permite crear bases:

- sword;
- hammer;
- bow;
- armor;
- shield;
- etc.

La región aporta materiales.

Ejemplo:

| Base | Material |
|---|---|
| Fire sword | ironOre + cinderHeart + Ruby dust |
| Poison dagger | ironOre + blackSap + Emerald dust |
| Holy mace | ironOre + holyRelic + Diamond dust |
| Storm bow | wood + Topaz dust + sky feather |

### 18.3. Reforging

Tipos:

| Acción | Costo | Riesgo |
|---|---|---|
| Reroll 1 affix | gold + enchanting mats | mantiene rarity |
| Lock 1 affix and reroll rest | caro | mid/late |
| Add socket | gemDust + forge mats | limitado por rarity |
| Change element | elemental catalyst | posible pérdida de quality |
| Upgrade quality | ore/resources | cap por Forge level |
| Imprint Codex affix | boss fragment | endgame |

### 18.4. Loot dirigido

Cada región/boss debe tener drops útiles para builds.

Ejemplo:

| Contenido | Drops |
|---|---|
| Swamp | blackSap, poison gear, antidote recipes, Plague set |
| Crypt | holy gear, undead relics, Grave Warden set |
| Mountain | ores, hammer gear, construct counters |
| Cinderlands | ruby, fire gear, Ember Knight set |
| Sky | bow/spear/lightning gear, Storm Ranger set |
| Ruins | arcane, constructs, Ironbreaker/Shadow gear |

Esto conecta:

> “Quiero subir Fire” → farmeo Cinderlands → consigo Ruby/fire gear → puedo matar Hydra → consigo mats para city/sets.

---

## 19. Cómo se conectan las expediciones con la ciudad

### 19.1. Cada región alimenta buildings

| Región | Recursos | Buildings principales |
|---|---|---|
| Forest | wood, herbs, leather | Alchemy, Hunter, Market |
| Mountain | stone, ironOre, gems | Forge, Gemcutter, Workshop |
| Swamp | blackSap, herbs, venom sacs | Alchemy, Temple, Plague sets |
| Crypt | bones, holyRelic, shadowInk | Temple, Library, Codex |
| Ruins | ancientGears, arcaneCrystal | Workshop, Library, Gemcutter |
| Cinderlands | cinderHeart, rubyDust | Forge, Temple, fire gear |
| Frostlands | frostCore, sapphireDust | Alchemy, Gemcutter, cold gear |
| Sky | skyFeather, topazDust | Cartographer, War Table |
| Abyss | shadowInk, demonHorn | Temple, Library, late game |

### 19.2. Buildings alimentan expediciones

| Building | Aporta a expediciones |
|---|---|
| Alchemy Lab | consumibles, poisonMitigation, cleanse |
| Forge | mejor gear, sockets, quality |
| Gemcutter | gems para counters |
| Library | información, Codex, preparationTerm |
| Cartographer | scouting, map modifiers, hazard reveal |
| Temple | curseMitigation, cleanse, holy |
| Workshop | armorBreak, trapDetection, siege |
| Training Hall | mastery nodes, XP focus |
| Market | contratos, recursos, gold sinks |
| Barracks | companions, world boss roles |

La relación es circular y buena:

> Expediciones dan recursos → ciudad mejora → ciudad ayuda a expediciones más difíciles → esas expediciones dan recursos más raros.

---

## 20. UI/UX para que el sistema no abrume

### 20.1. Pantalla de expedición

Debe mostrar:

```txt
Pantano de la Savia Negra
Duración: 45 min
Power recomendado: 450
Tu power: 510 ✅
Chance estimada: 68%

Amenazas:
- Veneno del pantano: Poison Mitigation recomendado 30. Tu build: 22 ⚠️
- Enemigos regenerativos: Anti-Regen recomendado 20. Tu build: 28 ✅

Debilidades enemigas:
- Fuego ✅
- Bleed ✅

Resistencias enemigas:
- Poison ⚠️
- Nature ⚠️

Masteries que subirán:
- Sword
- Fire
- Swamp
- Plant
- Alchemy

Bonus objectives:
- Quemar raíces antiguas: requiere FireSource 35. Tu build: 42 ✅
```

### 20.2. Warnings simples

Ejemplos:

- “Tu build depende mucho de Poison, pero estos enemigos lo resisten.”
- “Te falta Cleanse. Tu chance máxima queda reducida.”
- “Tenés suficiente power, pero no cubrís Anti-Regeneración.”
- “Podés completar este mapa, pero no activarás el cofre oculto.”
- “Esta expedición subirá Sword y Fire, útil para tus objetivos de mastery.”

### 20.3. Breakdown opcional

Modo avanzado:

```txt
Chance breakdown
Base: 50.0%
Power: +4.2%
Elementos: +5.1%
Counters: +8.0%
Masteries: +2.7%
Preparación: +3.0%
Luck: +1.4%
Afijos directos: +2.0%
Penalidades: -4.0%
Cap máximo dinámico: 86.0%
Final: 68.4%
```

Esto ayuda a los jugadores enfermitos sin complicar a casuales.

---

## 21. Plan de refactor técnico

### 21.1. Fase 1 — Data tags sin cambiar balance

Agregar:

- `WeaponType`;
- `DamageType`;
- `EnemyFamily`;
- `RegionTag`;
- `HazardTag`;
- `EnemyMechanic`;
- `CounterKey`;
- `BuildProfile` básico.

Pero seguir usando la fórmula actual.

Objetivo: no romper nada.

### 21.2. Fase 2 — BuildProfile real

Implementar:

- cálculo de damageShare;
- counters desde armas;
- counters desde afijos;
- resistances;
- scoped modifiers;
- profile summary.

Agregar debug UI interna.

### 21.3. Fase 3 — Expeditions 2.0 en paralelo

Agregar nuevos campos a dungeons/expeditions:

- regionTags;
- enemyFamilies;
- hazards;
- mechanics;
- enemyWeaknesses;
- enemyResistances;
- requiredCounters;
- preferredCounters;
- bonusObjectives.

Mantener la fórmula actual para producción, pero calcular la nueva en debug.

Comparar:

- currentChance;
- newChance;
- expected player behavior.

### 21.4. Fase 4 — Activar elementTerm y counter warnings

Activar solo:

- elementTerm con cap bajo;
- warnings;
- preferredCounters como bonus bajo;
- sin dynamic caps todavía o solo en contenido nuevo.

Objetivo: acostumbrar al jugador.

### 21.5. Fase 5 — Dynamic caps en bosses

Activar `dynamicMaxChance` primero en:

- daily bosses;
- elite dungeons;
- weekly bosses.

No activarlo de golpe en todas las misiones normales.

### 21.6. Fase 6 — Masteries y Account Rank

Agregar:

- XP de mastery por uso;
- mastery levels;
- mastery unlocks simples;
- Account Rank;
- Training Hall.

Primero con pocas masteries:

- Sword;
- Dagger;
- Bow;
- Staff;
- Hammer;
- Fire;
- Poison;
- Holy;
- Mining;
- Alchemy;
- Crypt;
- Swamp;
- Undead;
- Beast;
- Construct.

### 21.7. Fase 7 — Ciudad y recursos

Agregar buildings como sinks.

Orden recomendado:

1. Town Hall.
2. Expedition Board.
3. Forge.
4. Alchemy Lab.
5. Training Hall.
6. Library/Codex.
7. Gemcutter.
8. Cartographer.
9. Temple.
10. Workshop.

### 21.8. Fase 8 — Gemas, sets y bosses semanales

Cuando el sistema base esté probado:

- sockets;
- gemas;
- sets;
- weekly bosses;
- world bosses;
- roles de guild.

---

## 22. Estructura de archivos sugerida

```txt
src/game/
  balance.ts
  formulas/
    clamp.ts
    expeditionChance.ts
    masteryXp.ts
    rewardQuality.ts
  content/
    tags.ts
    weapons.ts
    affixes.ts
    gems.ts
    expeditions.ts
    bossesDaily.ts
    bossesWeekly.ts
    bossesWorld.ts
    buildings.ts
    masteries.ts
    codex.ts
    quests.ts
    sets.ts
  systems/
    buildProfile.ts
    expeditionEvaluator.ts
    rewardGenerator.ts
    masterySystem.ts
    codexSystem.ts
    citySystem.ts
    craftingSystem.ts
  types/
    item.ts
    expedition.ts
    mastery.ts
    building.ts
    codex.ts
```

### 22.1. Funciones principales

```ts
buildProfileFromLoadout(player, loadout): BuildProfile
calculateExpeditionSuccessChance(player, loadout, expedition): ExpeditionChanceResult
rollExpeditionOutcome(chanceResult, rng): ExpeditionOutcome
generateExpeditionRewards(player, expedition, outcome, profile): ExpeditionRewards
applyMasteryXp(player, expedition, outcome, profile): MasteryXpGain[]
applyCodexProgress(player, expedition, outcome): CodexProgressGain[]
applyCityResourceRewards(player, rewards): void
```

---

## 23. Content pack inicial recomendado

Para MVP no hacer 100 sistemas. Hacer un set pequeño pero profundo.

### 23.1. Armas iniciales

- Sword;
- Dagger;
- Bow;
- Staff;
- Hammer;
- Shield.

### 23.2. Elementos iniciales

- Fire;
- Poison;
- Holy;
- Lightning;
- Physical/Bleed.

### 23.3. Regiones iniciales

- Forest;
- Crypt;
- Swamp;
- Mountain/Ruins.

### 23.4. Enemigos iniciales

- Beast;
- Undead;
- Plant;
- Construct;
- Humanoid.

### 23.5. Hazards iniciales

- poisonCloud;
- curseAura;
- traps;
- longAttrition.

### 23.6. Mechanics iniciales

- regenerating;
- armored;
- flying;
- swarm;
- magicBarrier.

### 23.7. Buildings iniciales

- Town Hall;
- Expedition Board;
- Forge;
- Alchemy Lab;
- Training Hall;
- Library/Codex.

### 23.8. Bosses iniciales

Daily:

- Hidra de Raíz Sangrante;
- Coloso de Hierro Oxidado;
- Sombra del Bibliotecario.

Weekly:

- Lich de la Biblioteca Hueca.

---

## 24. Reglas de balance prácticas

### 24.1. Power no debe ser inútil

Si el jugador está 20% arriba de power, debería sentirse mejor.

Pero no debería ignorar counters críticos.

Regla:

- normal content: power puede compensar bastante;
- elite: power compensa medio;
- daily boss: power ayuda, pero no resuelve;
- weekly boss: power es una base, no una solución;
- world boss: power aporta contribución, pero roles/counters multiplican.

### 24.2. Counters no deben ser binarios siempre

Evitar:

> “No tenés fuego, no podés jugar.”

Preferir:

> “No tenés antiRegen, tu cap baja y el boss se vuelve riesgoso.”

Solo usar hard gates para:

- llaves;
- contenido especial;
- tutoriales;
- mapas de endgame;
- mechanics narrativas.

### 24.3. Siempre ofrecer alternativas

Ejemplo para regenerating:

- Fire/Burn;
- Bleed profundo;
- AntiRegen oil;
- Holy contra undead;
- set bonus;
- boss attunement;
- Codex;
- companion especial.

### 24.4. Los afijos de success directo deben tener cap

No volver al problema original.

Si un item tiene `+successChance`, que sea:

- scoped;
- rare;
- con cap;
- menos poderoso que resolver una mecánica.

### 24.5. Mastery debe subir aunque falles

Porque si no, el jugador no prueba builds nuevas.

Failure debe dar poco, pero no cero.

### 24.6. El jugador debe ver por qué falló

Después de la expedición:

```txt
Fallaste parcialmente.
Razones principales:
- Poison Mitigation insuficiente: -6% y cap reducido.
- Tu build usa Poison, pero los enemigos lo resisten.
- Te faltó Anti-Regeneración para cerrar el combate.
Sugerencias:
- Equipar Ruby/Fire weapon.
- Craftear Antídoto en Alchemy Lab.
- Subir Fire Mastery o Bleed.
```

Esto convierte el fracaso en objetivo.

---

## 25. Ejemplo completo de loop

### Día 1

Jugador tiene:

- Sword física;
- Staff de fuego débil;
- Dagger poison;
- Expedition Board nivel 1;
- Forge nivel 1.

Hace Forest y Crypt.

Aprende:

- undead resiste poison;
- fire/holy sirve;
- sword sube al usarse.

### Día 2

Desbloquea Alchemy Lab.

Ve Swamp con poisonCloud.

Primero falla parcialmente por no tener poisonMitigation.

El juego le sugiere:

- craft Antídoto;
- conseguir Emerald;
- subir Alchemy;
- usar Fire para plantas.

### Día 3

Consigue Espada de Brasa.

Ahora Swamp mejora:

- FireSource cubre bonus objective;
- Burn ayuda contra regenerating;
- Sword + Fire suben mastery;
- consigue blackSap para Alchemy Lab.

### Día 4

Daily boss Hydra aparece.

El jugador entiende:

- necesita antiRegen;
- necesita poisonMitigation;
- tiene parte de la build, pero puede mejorar.

Hace:

- craftea Antídoto mayor;
- pone Ruby en espada;
- sube Fire Mastery a 5;
- mejora Alchemy Lab.

Vence o queda cerca.

### Semana 1

Desbloquea Lich weekly.

Ahora necesita:

- Holy/Cleanse;
- CurseMitigation;
- Dispel/BarrierBreak;
- Codex;
- Temple/Library.

El juego ya generó objetivos para varias semanas.

---

## 26. Checklist de implementación

### Items

- [ ] Agregar `weaponType`.
- [ ] Agregar `damageTypes`.
- [ ] Agregar `resistances`.
- [ ] Agregar `counters`.
- [ ] Agregar `tags`.
- [ ] Agregar sockets opcionales.
- [ ] Agregar affixes data-driven.

### Expeditions

- [ ] Agregar `regionTags`.
- [ ] Agregar `enemyFamilies`.
- [ ] Agregar `hazards`.
- [ ] Agregar `mechanics`.
- [ ] Agregar `enemyWeaknesses`.
- [ ] Agregar `enemyResistances`.
- [ ] Agregar `requiredCounters`.
- [ ] Agregar `preferredCounters`.
- [ ] Agregar `bonusObjectives`.
- [ ] Agregar `masteryXpProfile`.
- [ ] Agregar `codexProgress`.

### Fórmula

- [ ] Implementar `BuildProfile`.
- [ ] Implementar `powerTerm`.
- [ ] Implementar `elementTerm`.
- [ ] Implementar `counterCoverage`.
- [ ] Implementar `missingCounterPenalty`.
- [ ] Implementar `counterBonusTerm`.
- [ ] Implementar `dynamicMaxChance`.
- [ ] Implementar `masteryTerm`.
- [ ] Implementar `preparationTerm`.
- [ ] Implementar `directAffixTerm`.
- [ ] Implementar breakdown.
- [ ] Implementar warnings.

### Masteries

- [ ] Crear mastery definitions.
- [ ] Crear XP formula.
- [ ] Aplicar XP por outcome.
- [ ] Crear unlocks nivel 5/10/15/20.
- [ ] Conectar Account Rank.

### Ciudad

- [ ] Crear resources.
- [ ] Crear buildings.
- [ ] Crear costs/effects.
- [ ] Conectar buildings a preparation/counters.
- [ ] Conectar expeditions a resources.

### Codex

- [ ] Crear Codex entries.
- [ ] Progresar por expedición/outcome.
- [ ] Revelar info.
- [ ] Aplicar rewards.
- [ ] Conectar a Account Rank.

### Bosses

- [ ] Daily boss data.
- [ ] Weekly boss phases.
- [ ] Boss Attunement.
- [ ] World boss roles.
- [ ] Rewards/fragments.

### Gemas

- [ ] Crear gem definitions.
- [ ] Crear socket system.
- [ ] Crear Gemcutter.
- [ ] Crear upgrade/fusion.
- [ ] Conectar gems a counters/masteries.

---

## 27. Resumen de la dirección final

La nueva versión de Idleforge debería sentirse así:

> “Mando expediciones timeadas como en un idle simple, pero cada mapa pregunta algo distinto. Los items tienen afijos que cambian builds. Las armas, elementos, regiones y enemigos suben de maestría al usarlos. Los bosses requieren preparación real. La ciudad consume recursos y desbloquea soluciones. El Codex convierte cada intento en progreso permanente. El Account Rank me premia por hacer crecer toda la cuenta.”

La fórmula deja de ser:

```txt
más power = más chance
```

Y pasa a ser:

```txt
power + matchup + counters + mastery + preparación = chance real
```

La regla de oro:

> **Cada mapa tiene que preguntar algo distinto. Cada build tiene que responder algo distinto. Cada mastery tiene que abrir una posibilidad nueva.**


---

## 28. Migración exacta desde la fórmula actual

La migración ideal no debería romper el juego existente. La fórmula actual puede convertirse en V2 de manera incremental.

### 28.1. Mapeo de variables actuales

| Variable actual | En V2 pasa a | Comentario |
|---|---|---|
| `0.5` base | `baseChance` | Default por tipo de contenido. |
| `powerScore` | `profile.powerScore` | Se mantiene. Sigue siendo importante. |
| `dungeon.power` | `expedition.recommendedPower` | Mismo concepto, nuevo nombre. |
| `((powerScore - dungeon.power) / dungeon.power) * 0.25` | `powerTerm` | Misma escala inicial. |
| `luck * 0.002` | `luckTerm` | Igual, pero con cap por tipo de contenido. |
| `classModifier` | `classOrArchetypeTerm` | Puede mantenerse hasta migrar a arquetipos por loadout. |
| `classPassiveBonus` | `classOrArchetypeTerm` o mastery unlock | Los pasivos deberían migrar a masteries/arquetipos. |
| `bossAttunementBonus` | `preparationTerm.bossAttunement` | Se mantiene, pero con cap por boss. |
| `libraryBonus` | `preparationTerm.library` + `codex` | La Library ahora revela info y suma preparación. |
| `itemAffixSuccessBonus` | `directAffixTerm` | Se mantiene, pero scoped y cappeado. |
| `bossAffixBonus` | `directAffixTerm` con `bossOnly` | Igual, pero data-driven. |
| `shortMissionAffixBonus` | `directAffixTerm` con `maxBaseDurationMinutes` | Igual, pero data-driven. |
| `shrineLevel * 2` en powerScore | `powerScore` al principio; luego `Temple/Shrine preparation` | Mantener por compatibilidad. |
| `guildLegacy * 2` en powerScore | `powerScore` al principio; luego `guild/worldBoss preparation` | Mantener por compatibilidad. |
| `clamp(0.15, 0.96)` | `minChance`, `dynamicMaxChance` | El máximo ahora puede bajar por missing counters. |

### 28.2. Compatibilidad con dungeons viejos

Si una expedición vieja no tiene tags V2, usar defaults:

```ts
function normalizeLegacyDungeon(dungeon: LegacyDungeon): ExpeditionDefinition {
  return {
    id: dungeon.id,
    name: dungeon.name,
    type: dungeon.isBoss ? 'dailyBoss' : 'normal',
    baseDurationMinutes: dungeon.durationMinutes,
    recommendedPower: dungeon.power,
    baseChance: 0.50,
    minChance: 0.15,
    maxChance: 0.96,
    regionTags: dungeon.regionTags ?? [],
    enemyFamilies: [],
    hazards: [],
    mechanics: [],
    enemyWeaknesses: {},
    enemyResistances: {},
    requiredCounters: [],
    preferredCounters: [],
    bonusObjectives: [],
    rewards: dungeon.rewards,
    masteryXpProfile: {
      weaponFromBuild: true,
      elementsFromBuild: true,
      region: dungeon.regionTags ?? [],
      enemyFamilies: [],
      professionHints: []
    },
    codexProgress: []
  };
}
```

Con esto, un dungeon viejo se comporta casi como antes.

### 28.3. Feature flags recomendados

```ts
const featureFlags = {
  expeditionV2Profile: true,
  expeditionV2ElementTerm: false,
  expeditionV2Counters: false,
  expeditionV2DynamicCaps: false,
  expeditionV2MasteryTerm: false,
  expeditionV2Rewards: false,
  expeditionV2DebugBreakdown: true
};
```

Orden de activación:

1. `expeditionV2Profile` para calcular sin afectar.
2. `expeditionV2DebugBreakdown` para comparar.
3. `expeditionV2ElementTerm` con peso bajo.
4. `expeditionV2Counters` en mapas nuevos.
5. `expeditionV2DynamicCaps` solo en bosses.
6. `expeditionV2MasteryTerm` cuando masteries existan.
7. `expeditionV2Rewards` para bonus objectives.

### 28.4. Fórmula híbrida temporal

Durante transición:

```ts
function calculateHybridChance(player, loadout, expedition) {
  const legacy = calculateLegacyChance(player, expedition);
  const v2 = calculateExpeditionSuccessChance(player, loadout, expedition);

  if (!featureFlags.expeditionV2Counters) {
    return legacy;
  }

  return {
    ...v2,
    finalChance: lerp(legacy.finalChance, v2.finalChance, getV2RolloutWeight(expedition))
  };
}
```

Esto permite activar V2 por región o por contenido.

---

## 29. Matriz rápida de interacción mapa-build

Esta tabla sirve para diseñar expediciones rápido.

| Tag del contenido | Penaliza | Pide | Buenas builds |
|---|---|---|---|
| `undead` | poison, shadow | holy, fire, cleanse | Mace/Holy, Sword/Fire |
| `beast` | poca defensa, sin sustain | bleed, fire, poison, hunting | Bow, Spear, Axe, Dagger |
| `construct` | poison, bleed | lightning, hammer, armorBreak, engineering | Hammer, Staff Lightning |
| `plant` | poison/nature | fire, bleed, axe | Axe/Fire, Sword/Fire |
| `demon` | fire/shadow | holy, cold, curseMitigation | Holy Shield, Cold Staff |
| `spirit` | physical puro | holy, arcane, shadowMitigation | Holy, Arcane |
| `dragon` | build genérica | resist específico, ranged/burst, armorBreak | Bow, Spear, Crossbow, Hammer |
| `poisonCloud` | sin antídoto | poisonMitigation, cleanse, alchemy | Plague Doctor, Alchemy |
| `curseAura` | sin ward | curseMitigation, holy, cleanse | Grave Warden, Temple |
| `traps` | sin scouting | trapDetection, scouting, lockpicking | Dagger, Bow, Cartography |
| `freezingWind` | speed/stamina bajos | coldMitigation, fire, stamina | Fire, Heavy/Stamina |
| `burningHeat` | fire resist baja | fireMitigation, cold, stamina | Cold, FireRes gear |
| `regenerating` | daño sin cierre | antiRegen, burn, bleed, holy | Fire, Bleed, Holy |
| `armored` | daño rápido débil | armorBreak, hammer, lightning | Hammer, Mace, Lightning |
| `flying` | melee puro | rangedReach, bow, spear, lightning | Bow, Spear, Lightning |
| `swarm` | single target | areaDamage, cleave, fire | Axe, Staff, Fire |
| `magicBarrier` | físico puro | dispel, barrierBreak, arcane | Wand, Staff, Orb |
| `invisible` | sin detección | scouting, lightSource, arcane sight | Bow, Holy, Arcane |
| `longAttrition` | stamina baja | staminaSupply, food, sustain | Shield, Cooking, Supply |

---

## 30. Tests de balance y unit tests recomendados

### 30.1. Tests de fórmula

#### Test 1: dungeon sin tags se parece al sistema actual

```txt
Dado:
- expedition sin requiredCounters, sin weaknesses/resistances.
- powerScore == recommendedPower.
- luck == 0.
Esperado:
- finalChance aproximadamente baseChance.
```

#### Test 2: +20% power da alrededor de +5%

```txt
Dado:
- powerScore = recommendedPower * 1.2
- powerWeight = 0.25
Esperado:
- powerTerm = +0.05
```

#### Test 3: missing critical counter baja cap

```txt
Dado:
- boss maxChance 0.90
- required antiRegen requiredScore 40, capPenalty 0.20
- player antiRegen 0
Esperado:
- dynamicMaxChance <= 0.70
```

#### Test 4: hard cap funciona

```txt
Dado:
- hardCapIfBelow coverage 0.25 maxChance 0.55
- player coverage 0.1
Esperado:
- dynamicMaxChance <= 0.55
```

#### Test 5: build preparada con menos power supera build bruta

```txt
Dado:
- Boss regenerating/poison.
- Build A: 130% power, no antiRegen, no poisonMitigation.
- Build B: 95% power, antiRegen cubierto, poisonMitigation cubierta.
Esperado:
- chanceB > chanceA.
```

#### Test 6: resistencia elemental penaliza

```txt
Dado:
- enemigo poison resistance 0.8
- build poisonShare 0.8
Esperado:
- elementTerm negativo significativo.
```

#### Test 7: affix scoped no aplica fuera de scope

```txt
Dado:
- item con +bossSuccessChance
- expedition normal
Esperado:
- directAffixTerm no incluye ese affix.
```

#### Test 8: mastery XP se gana en failure

```txt
Dado:
- outcome failure
Esperado:
- mastery XP > 0 pero menor a success.
```

#### Test 9: bonus objective no cambia success si está definido como reward-only

```txt
Dado:
- bonus objective fireSource para extra chest
- player no tiene fireSource
Esperado:
- no extra chest; successChance no necesariamente cambia por ese objective.
```

#### Test 10: dynamic max nunca baja por debajo de min + margen

```txt
Dado:
- muchos missing counters
Esperado:
- dynamicMaxChance >= minChance + 0.05
```

### 30.2. Tests de comportamiento de jugador

Estos no son unit tests técnicos, pero sirven para playtest.

| Pregunta | Señal positiva |
|---|---|
| ¿El jugador entiende por qué bajó su chance? | Puede nombrar el counter faltante. |
| ¿El jugador quiere cambiar gear? | Busca fuego/antídoto/armorBreak. |
| ¿El jugador quiere subir mastery específica? | Decide farmear Sword/Fire/Alchemy. |
| ¿Los afijos importan? | Elige un item de menor power por mejor counter. |
| ¿La ciudad importa? | Mejora Alchemy/Temple/Forge para resolver contenido. |
| ¿El fracaso genera objetivo? | Sabe qué hacer después. |

---

## 31. Constantes iniciales de tuning

Estas constantes son un punto de partida, no verdades finales.

```ts
export const tuning = {
  powerWeight: 0.25,
  defaultBaseChance: 0.50,
  normalMinChance: 0.12,
  normalMaxChance: 0.96,

  luckPerPoint: 0.002,
  normalLuckCap: 0.08,
  bossLuckCap: 0.06,

  elementWeightNormal: 0.18,
  elementWeightBoss: 0.22,

  counterBonusCapNormal: 0.14,
  counterBonusCapBoss: 0.18,

  directAffixCapNormal: 0.08,
  directAffixCapBoss: 0.08,

  masteryCoefficient: 0.10,
  masteryPositiveCapNormal: 0.12,
  masteryNegativeCapNormal: 0.06,
  masteryPositiveCapBoss: 0.15,
  masteryNegativeCapBoss: 0.10,

  preparationCapNormal: 0.10,
  preparationCapBoss: 0.16,

  partialChanceBase: 0.18,
  partialChanceMin: 0.05,
  partialChanceMax: 0.32,

  failureMasteryFactor: 0.35,
  partialMasteryFactor: 0.70,
  successMasteryFactor: 1.00,
  criticalMasteryFactor: 1.10
};
```

### 31.1. Rangos recomendados de requiredScore

| Tier de contenido | Counter menor | Counter major | Counter crítico |
|---|---:|---:|---:|
| Early normal | 10-15 | 20-25 | 30 |
| Mid normal | 20-25 | 30-40 | 45 |
| Elite | 30-40 | 45-60 | 70 |
| Daily boss | 35-50 | 55-75 | 85 |
| Weekly boss | 50-70 | 75-100 | 120 |
| World boss | se usa para contribución | se usa para roles | no binario |

### 31.2. Rangos recomendados de penalties

| Severidad | missingPenalty | capPenalty | Uso |
|---|---:|---:|---|
| minor | 0.03-0.05 | 0.04-0.08 | traps leves, scouting |
| major | 0.06-0.10 | 0.10-0.16 | poison, armor, flying |
| critical | 0.10-0.16 | 0.18-0.30 | regen boss, curse boss, barrier phase |

### 31.3. Cuándo usar hard cap

Usar `hardCapIfBelow` solo si la mecánica define el boss.

Buenos casos:

- boss regenerativo sin antiRegen;
- boss invisible sin scouting/light;
- boss con barrier sin barrierBreak;
- zona letal de veneno sin mitigation;
- weekly phase con rol obligatorio.

Malos casos:

- una misión normal de farm;
- un mapa early;
- contenido tutorial;
- counters poco comunicados.

---

## 32. Ejemplo de respuesta al jugador después de una expedición

### Success

```txt
Victoria en Pantano de la Savia Negra
Chance usada: 72%

Lo que funcionó:
- FireSource cubrió la debilidad principal.
- Burn redujo la regeneración enemiga.
- Antídoto Mayor cubrió Poison Mitigation.

Ganaste:
- 124 oro
- 3 Black Sap
- Ruby chipped
- Espada Mastery +48 XP
- Fire Mastery +52 XP
- Swamp Mastery +44 XP
- Codex Poison Cloud +1

Bonus objective completado:
- Quemar raíces antiguas: +35% Black Sap
```

### Partial

```txt
Resultado parcial en Pantano de la Savia Negra
Chance usada: 41%

Problemas:
- Poison Mitigation insuficiente: 14 / 30.
- Tu chance máxima fue reducida a 78%.
- Tu build usa Poison, pero los enemigos lo resisten.

Aun así conseguiste:
- 54 oro
- 1 Black Sap
- Swamp Mastery +25 XP
- Alchemy Insight +1

Sugerencias:
- Craftear Antídoto en Alchemy Lab.
- Usar Ruby o arma de Fire.
- Subir Fire Mastery o Bleed.
```

### Failure

```txt
Fracaso en Cámara de los Autómatas
Chance usada: 22%

Razones principales:
- Armor Break: 8 / 45.
- Trap Detection: 4 / 30.
- Tu daño principal fue Poison, pero los Constructs lo resisten casi por completo.

Progreso obtenido:
- Construct Codex +1
- Hammer recommendation unlocked
- Engineering hint discovered

Siguiente objetivo recomendado:
- Conseguir Hammer, Lightning gem o Armor Break affix.
```

---

## 33. Conclusión operativa

Para que Idleforge tenga la fantasía de Diablo/Torchlight/Warframe/RuneScape/Melvor en formato idle, el cambio clave no es hacer más contenido, sino hacer que cada contenido tenga una pregunta.

Ejemplos:

- “¿Tenés una forma de cortar regeneración?”
- “¿Podés sobrevivir al veneno?”
- “¿Tu daño sirve contra constructs?”
- “¿Subiste suficiente maestría de la región?”
- “¿Preparaste consumibles?”
- “¿Tu ciudad tiene el edificio que resuelve este problema?”
- “¿Querés usar un item de menor power porque tiene el counter correcto?”

Cuando el jugador responde esas preguntas, el juego deja de ser una calculadora de power y pasa a ser un RPG idle de builds.

Ese es el diferencial.
