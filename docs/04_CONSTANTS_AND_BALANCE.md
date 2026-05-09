# 04 - Constants & Balance (Estado Real)

Documento generado desde código actual (`src/game/*`), sin suposiciones.

## 1) Constantes globales (caps/timers/versionado)

- Archivo: `src/game/constants.ts`
- Propósito: límites globales, versión de save, modo debug.

Valores actuales:

- `SAVE_KEY = "relic-forge-idle:v1"`
- `SAVE_GAME_NAME = "Relic Forge Idle"`
- `SAVE_VERSION = 1`
- `GAME_VERSION = 1`
- `INVENTORY_LIMIT = 30`
- `INVENTORY_NEAR_FULL_THRESHOLD = 24`
- `OFFLINE_CAP_MS = 8h`
- `LEVEL_CAP = 30`
- `FINAL_DUNGEON_ID = "crown-of-the-first-forge"`
- `REINCARNATION_GATE_BOSS_ID = "curator-of-blue-fire"`
- `REINCARNATION_LEVEL_REQUIREMENT = 10`
- `DAILY_TASK_COUNT = 3`
- `DAILY_RESET_HOUR_LOCAL = 23`
- `DAY_MS = 24h`
- `VIGOR_MAX = 100`
- `VIGOR_REGEN_INTERVAL_MS = 5m`
- `VIGOR_EXPEDITION_BOOST_COST = 20`
- `VIGOR_EXPEDITION_BOOST_MULTIPLIER = 2`
- `FORGE_AFFIX_REROLL_REQUIRED_LEVEL = 3`
- `REINCARNATION_UPGRADE_MAX = 15`
- `EQUIPMENT_SLOTS = ["weapon","helm","armor","boots","relic"]`
- `BUILDING_IDS = ["forge","mine","tavern","library","market","shrine"]`
- `RARITIES = ["common","rare","epic","legendary"]`
- `RARITY_MULTIPLIER = { common: 1, rare: 1.7, epic: 2.55, legendary: 4.15 }`
- `RARITY_LABEL = { common: "Common", rare: "Rare", epic: "Epic", legendary: "Legendary" }`
- `EMPTY_RESOURCES.renown = 0` (junto con gold/ore/crystal/rune/relicFragment)
- Debug:
  - `DEBUG_DURATION_MULTIPLIER = 0.16`
  - `DEBUG_REWARD_MULTIPLIER = 4`
  - `DEBUG_REINCARNATION_MULTIPLIER = 2`

Notas:

- Existe `RENOWN_UPGRADE_MAX = 10` en el mismo archivo, pero el flujo de reincarnación usa `REINCARNATION_UPGRADE_MAX = 15`.

Riesgo:

- Doble constante de max upgrade puede causar drift de balance.

---

## 2) Clases y stats base/growth

- Archivo: `src/game/content.ts`
- Propósito: identidad de clase y progresión base.

Warrior:

- base: `power 10, defense 9, speed 4, luck 3, stamina 115`
- growth/level: `+3 +3 +1 +1 +12`

Rogue:

- base: `8, 5, 10, 8, 90`
- growth: `+2 +1 +3 +2 +8`

Mage:

- base: `11, 4, 6, 7, 85`
- growth: `+4 +1 +1 +2 +7`

Pasivas reales (texto en `content.ts`, efecto en `heroes.ts`):

- Warrior 5: `+0.05` success en boss.
- Warrior 10: `+0.065` al failure reward scale.
- Warrior 15: `x1.08` XP en boss.
- Rogue 5: `x1.08` oro.
- Rogue 10: `+0.06` loot chance.
- Rogue 15: `x0.92` duración.
- Mage 5: `-8%` costos materiales de forge.
- Mage 10: `+0.05` success en no-boss.
- Mage 15: `x1.1` ganancia de rune.

---

## 3) Fórmulas de nivel, poder y combate

- Archivos: `balance.ts`, `heroes.ts`, `engine.ts`, `affixes.ts`

XP a próximo nivel:

- `xpToNextLevel(level) = floor(45 * level^1.55)`

Power score derivado:

```ts
powerScore =
  power +
  defense * 0.55 +
  speed * 0.7 +
  luck * 0.5 +
  stamina * 0.03 +
  shrine*2 +
  guildLegacy*2
```

Success chance:

```ts
clamp(
  0.5 +
  ((powerScore - dungeon.power)/dungeon.power) * 0.25 +
  luck*0.002 +
  classModifier +
  passiveBonus +
  bossAttunementBonus +
  libraryBonus +
  affixSuccessChance +
  affixBossSuccessChance +
  affixShortMissionSuccessChance,
  0.15,
  0.96
)
```

Notas de afijos en success:

- `successChance` aplica a todas las expediciones.
- `bossSuccessChance` aplica sólo a bosses.
- `shortMissionSuccessChance` aplica a dungeons con duración base `<= 5m`.

Multiplicadores:

- Recompensas base: `getRewardMultiplier = debug?4:1 * (1 + guildLegacy*0.05)`
- XP: `rewardMultiplier * (1 + tavern*0.04 + affixXpMultiplier)`
- Gold: `rewardMultiplier * (1 + market*0.05 + affixGoldMultiplier + affixZoneGoldBonus) * roguePassive`
- Materiales: `rewardMultiplier * (1 + mine*0.08 + affixMaterialMultiplier)`, con multiplicadores adicionales por recurso (`ore/crystal/rune/relicFragment`) desde afijos.
- Sell value: `1 + market*0.1 + affixSellMultiplier`.
- Duración:
  - debug: `duration * 0.16` (min 5s)
  - normal: reducción por `swiftCharters*0.05` con cap `0.4`, speed, afijos de duración y pasiva rogue (min 10s)

Failure scale:

- base `0.35`
- warrior Lv10 sube a `0.415` (por bonus `+0.065`)
- afijos `failureRewardScale` se suman al bonus antes del clamp final `0.75`.

Resolución de recompensas:

- Boost de Vigor multiplica XP, oro y materiales por `2`.
- Boss clear exitoso puede recibir `bossRewardMultiplier` de afijos, aplicado a XP, oro y materiales.
- XP en boss también puede recibir la pasiva Warrior 15 (`x1.08`).
- Materiales exitosos usan `scaleMaterials` con multiplicador global y multiplicadores por recurso desde afijos.
- En derrota sólo se entrega ore parcial: `max(1, floor((dungeon.materials.ore ?? 0)*0.25))`.
- Rune gains pasan por pasiva Mage 15 y `runeMultiplier` de afijos.
- Auto-salvage y salvage manual pasan por `salvageMultiplier` de afijos; rune salvage también usa el multiplicador de rune.

Nota de implementación:

- `guildLegacy` impacta dos veces el `powerScore` actual:
  - suma `+2` power dentro de `stats`,
  - y además suma `+2` directo al `powerScore`.

---

## 4) Dungeons / regiones / enemigos

- Archivo: `src/game/content.ts`
- Propósito: contenido de progresión.

Estado:

- `5` regiones
- `20` dungeons
- `5` bosses

Duraciones reales por banda:

- Región 1: `20s, 70s, 4m, 9.6m`
- Región 2: `3m, 3.5m, 4m, 4.5m`
- Región 3: `3m, 3.5m, 4m, 7m`
- Región 4: `30m, 30m, 30m, 30m`
- Región 5: `60m, 60m, 60m, 60m`

Gate de reincarnación:

- boss objetivo: `curator-of-blue-fire` (región 3).
- min level de `curator-of-blue-fire`: `9`; el gate de reincarnación exige nivel `10` después del clear.

Pacing MVP 2.0 validado:

- first expedition/loot: ~`0.33m`.
- first Town upgrade: ~`1.5m` con dos clears tempranos.
- first craft y first boss clear: ~`15m`.
- first reincarnation sin Vigor: ~`45-57m` en seeds representativas con fallos incluidos.

Riesgo:

- El pacing de primera sesión depende de valores distribuidos entre duración, power, minLevel, loot y costos de Town.

---

## 5) Loot / drop rates / ítems

- Archivos: `loot.ts`, `constants.ts`, `balance.ts`, `content.ts`, `affixes.ts`
- Propósito: generación y economía de ítems.

Rareza base:

- common `35`
- rare `45`
- epic `15`
- legendary `5`

Boss bonus de rareza:

- rare `+8`
- epic `+4`
- legendary `+1.5`

Escalado adicional de rareza:

- `treasureOath` reduce common y sube rare/epic/legendary.
- common baja hasta mínimo `25` por Treasure Oath.
- Afijos equipados con `rareDropChance` convierten peso de common hacia rare/epic/legendary:
  - common baja hasta mínimo `28`,
  - rare recibe `rareDropChance*100*0.64`,
  - epic recibe `rareDropChance*100*0.26`,
  - legendary recibe `rareDropChance*100*0.1`.

Affixes por rareza:

- common `1`
- rare `2`
- epic `3`
- legendary `5`

Pool actual:

- `AFFIX_POOL` tiene `32` entradas.
- Cada afijo puede aportar `stats`, `description`, `prefix`, `suffix`, restricción opcional de `slots` y/o `effects`.
- Categorías de efecto actuales:
  - `xpMultiplier`,
  - `goldMultiplier`,
  - `zoneGoldMultiplier`,
  - `materialMultiplier`,
  - `materialResourceMultiplier`,
  - `rareDropChance`,
  - `lootChance`,
  - `bossRewardMultiplier`,
  - `successChance`,
  - `bossSuccessChance`,
  - `shortMissionSuccessChance`,
  - `longMissionLootChance`,
  - `craftingDiscount`,
  - `vigorBoostCostReduction`,
  - `sellMultiplier`,
  - `salvageMultiplier`,
  - `runeMultiplier`,
  - `durationReduction`,
  - `failureRewardScale`.

Nombres de ítems:

- Se componen con prefijo de rareza + prefijo de afijo si existe + base de slot + sufijo de afijo si existe.
- Bases de slot actuales: 6 nombres por slot.
- Prefijos por rareza: 5 por rareza.

Loot chance:

```ts
clamp(
  0.65 +
  zoneIndex*0.02 +
  luck*0.001 +
  treasureOath*0.004 +
  roguePassive +
  affixLootChance +
  affixLongMissionLootChance,
  0.35,
  0.85
)
```

`longMissionLootChance` aplica a dungeons con duración base `>= 30m`.

Item Power:

```ts
statScore =
  power +
  defense*0.5 +
  speed*0.75 +
  luck*0.6 +
  stamina*0.03

itemScore = floor(statScore + affixUtilityScore)
```

`affixUtilityScore` pondera efectos de utilidad para que comparación de equipo no dependa sólo de stats primarios.

Primera corrida:

- fuerza un `weapon common` en `tollroad-of-trinkets`.

Overflow:

- si inventario está en 30, loot extra se auto-salvagea.
- el panel de resultado e inventario avisan el overflow/auto-salvage.

Riesgo:

- Muchos coeficientes de loot/economía están hardcoded en funciones (`loot.ts`, `engine.ts`) y no centralizados en una tabla de tuning.

---

## 6) Forge (craft + upgrade + affix reroll)

- Archivo: `src/game/forge.ts`
- Propósito: sink de recursos y crecimiento de gear.
- UI principal: `src/app/page.tsx` muestra nivel de Forge, bonus de item stat budget, costos, retornos de salvage y resultado vía message panel.

Conexión Town Forge -> gear:

- `state.town.forge * 2` se suma al budget de stats de ítems generados (`loot.ts`).
- La pantalla Forge muestra el nivel actual y el bonus visible de `item stat budget`.
- El edificio Forge también aporta `+3 power` y `+1 defense` por nivel vía stats derivadas.

Costo de craft:

```ts
gold = floor(45 + lootLevel*12)
ore = floor(3 + lootLevel*0.7)
crystal = max(0, floor((lootLevel-8)*0.45))
rune = max(0, floor((lootLevel-18)*0.22))
relicFragment = lootLevel>=45 ? max(1, floor((lootLevel-40)*0.12)) : 0
```

Descuentos de craft:

- pasiva Mage 5 aporta `-8%` a materiales de forge.
- afijos `craftingDiscount` se suman al descuento.
- el descuento combinado se limita a `50%`.
- el descuento aplica a `ore/crystal/rune/relicFragment`, no a gold.

Costo de upgrade de ítem:

```ts
gold = floor(40 * 1.45^upgradeLevel + itemLevel*12)
ore = floor(4 * 1.4^upgradeLevel + itemLevel*0.6)
crystal = max(0, floor(itemLevel*0.2 + upgradeLevel))
rune = epic|legendary ? max(1, floor(itemLevel*0.08 + upgradeLevel*0.5)) : 0
relicFragment = legendary ? max(1, floor(upgradeLevel/3)) : 0
```

Escalado en upgrade:

- `upgradeLevel += 1`, `itemLevel += 1`
- stats ~`+8%` aprox con mínimo `+1`
- sell value `x1.12`
- salvage valores ~`x1.12` (`relicFragment x1.06`)
- tope: `+10` por ítem.
- si el ítem mejorado está equipado, el mensaje incluye delta de Power visible.

Reroll de afijo:

- requiere `state.town.forge >= FORGE_AFFIX_REROLL_REQUIRED_LEVEL` (`3`).
- rerollear reemplaza exactamente un afijo elegido.
- el nuevo afijo debe ser válido para el slot y no estar ya presente en el ítem.
- puede aplicarse a ítems en inventario o equipados.
- si el ítem está equipado, el mensaje incluye delta de Power si cambia.
- el nombre se regenera con prefijo de rareza, base de slot y prefijo/sufijo de afijos.

Costo de reroll:

```ts
gold = floor((30 + itemLevel*9 + upgradeLevel*18) * rarityMultiplier)
ore = max(1, floor((2 + itemLevel*0.45 + upgradeLevel) * rarityMultiplier))
crystal = common ? 0 : max(1, floor((itemLevel*0.18 + upgradeLevel*0.5) * rarityMultiplier))
rune = epic|legendary ? max(1, floor(itemLevel*0.04 + upgradeLevel*0.35)) : 0
relicFragment = legendary ? max(1, floor(upgradeLevel/4)) : 0
```

El descuento de materiales de Forge también aplica al costo de reroll.

Salvage en Forge:

- La pantalla Forge lista ítems de inventario con retorno visible de `ore/crystal/rune/relicFragment`.
- La acción reutiliza `salvageItem` de `inventory.ts`; no puede salvear equipo equipado desde esa lista.

---

## 7) Town / costos / bonos

- Archivos: `content.ts`, `town.ts`, `balance.ts`, `offline.ts`

Edificios:

- Forge, Mine, Tavern, Library, Market, Shrine (max 12 cada uno).
- `BuildingDefinition` incluye `purpose`, `effectText(level)` y `milestones`.
- La pantalla Town muestra propósito, nivel, barra de progreso, feedback contextual, beneficio actual, beneficio del próximo nivel, costo y milestones.
- Diseño: card-based/mobile-first; sin decoración, city placement ni base-building visual.

Escalado de costo:

- gold: `base * 1.62^level`
- materiales: `base * 1.53^level`

Base costs iniciales:

- Forge: `40 gold, 3 ore`
- Mine: `75 gold, 4 ore`
- Tavern: `90 gold, 4 ore, 1 crystal`
- Library: `150 gold, 4 crystal`
- Market: `85 gold, 4 ore`
- Shrine: `220 gold, 5 crystal, 1 rune`

Efectos de balance usados por motor:

- Forge: power/defense y budget de ítems.
- Mine: multiplicador de materiales + generación offline.
- Tavern: XP multiplier + stamina.
- Library: luck + bonus de success.
- Market: gold multiplier + sell multiplier.
- Shrine: power score y bonus de Soul Marks en reincarnación.

Textos visibles de edificio (`BUILDINGS.effectText`) alineados con fórmulas actuales:

- Forge: `+3 power`, `+1 defense`, `+2 item stat budget` por nivel.
- Mine: `+8% expedition materials` por nivel.
- Tavern: `+4% XP`, `+4 stamina` por nivel.
- Library: `+0.4% success` por nivel con cap en `+4.8%`, `+1 luck` por nivel.
- Market: `+5% gold`, `+10% sell value` por nivel.
- Shrine: `+2 power score`, `+4% Soul Marks on reincarnation` por nivel.

Nota:

- Los textos anteriores están cubiertos por `src/game/__tests__/core.test.ts` para evitar nuevo drift visible.

Mine offline:

```ts
ore = floor(mine*4*hours)
crystal = floor(max(0,mine-1)*1.2*hours)
rune = floor(max(0,mine-4)*0.45*hours)
relicFragment = floor(max(0,mine-8)*0.15*hours)
```

- `getMineOfflineRate(state)` expone la tasa/hora para la UI de Town.
- cap global offline: `8h`.

---

## 8) Dailies

- Archivo: `dailies.ts`

Reglas:

- 3 tareas únicas por día.
- reset 23:00 hora local del dispositivo.
- intenta no repetir set exacto del día anterior.
- no hay streaks, castigos por no entrar, pagos, premium currency, ads ni battle pass.

Pool:

- `complete_expeditions(3)`
- `win_expeditions(2)`
- `defeat_boss(1)`
- `salvage_items(3)`
- `sell_items(3)`
- `craft_item(1)`
- `upgrade_building(1)`
- `spend_vigor(20)`

Rewards:

- ratio elegido por RNG: `0.08 / 0.10 / 0.12`
- oro/materiales se calculan sobre mejor dungeon no-boss desbloqueado.
- vigor por tarea: `8..12`
- el reward de vigor se clampa a `state.vigor.max`.

---

## 9) Vigor

- Archivos: `vigor.ts`, `affixes.ts`, `engine.ts`

Reglas:

- cap 100.
- regen +1 cada 5 minutos.
- si llega a cap, normaliza `lastTickAt`.
- gasto principal: boost expedición (base 20 vigor por run, x2 rewards).
- la UI sólo activa el boost si hay vigor suficiente para la expedición seleccionada.
- `getVigorBoostCost(state)` reduce el costo efectivo con afijos `vigorBoostCostReduction`.
- La reducción de costo está clampeda a `0..50%` y el costo mínimo efectivo es `5`.
- El progreso diario `spend_vigor` usa el costo efectivo realmente gastado.

---

## 10) Reincarnación / progreso permanente

- Archivo: `prestige.ts`

Gate:

- `hero.level >= REINCARNATION_LEVEL_REQUIREMENT` (`10`)
- `dungeonClears["curator-of-blue-fire"] > 0`

Pacing objetivo validado por tests:

- primer camino hasta `curator-of-blue-fire` dura `30-60m` en balance producción.
- en debug/dev dura `5-10m`.
- XP acumulada del camino alcanza el nivel requerido de reincarnación.

Ganancia de Soul Marks (`renown` interno):

```ts
base = max(1, floor(highestRegion*2 + bossClears + heroLevel/4))
withShrine = floor(base * (1 + shrine*0.04))
debug => withShrine * 2
```

Upgrades permanentes:

- `swiftCharters`: `-5%` duración de expedición por nivel, cap contribución `-40%`.
- `guildLegacy`: `+5%` XP/gold/material rewards por nivel y bonus temprano de power score.
- `treasureOath`: `+0.4%` loot chance por nivel y peso de rareza mejorado.
- `bossAttunement`: `+2%` boss success chance por nivel.

Costo por nivel:

- `currentLevel + 1`

Tope:

- `REINCARNATION_UPGRADE_MAX = 15`

Tradeoff de UI:

- Resetea: nivel/XP/base stats, gold/materiales, inventario/equipment, town, dungeon clears, expedición activa y dailies; vigor vuelve a `40`.
- Persiste: Soul Marks, upgrades permanentes, hero name/class, settings, achievements, lifetime stats, total reincarnations y total Soul Marks earned.

---

## 11) Hardcode detectado / deuda de balance

Hardcode en múltiples archivos:

- `engine.ts`: fallback de materiales en derrota, escalas de rewards.
- `affixes.ts`: pesos internos de utility score y clamps de costos de Vigor/crafting.
- `loot.ts`: pesos de rareza, slots y budgets de stats.
- `forge.ts`: escalas de craft/upgrade/reroll.
- `offline.ts`: curva de mine offline.

Cobertura de tests relevante:

- `src/game/__tests__/core.test.ts` valida:
  - primera arma garantizada y comparación inicial,
  - auto-salvage al cap de inventario,
  - mínimo de 25 afijos y presencia de categorías clave,
  - aplicación de efectos equipados a XP, oro por región, loot chance, success chance, costo de craft y costo de Vigor,
  - reset local de dailies, claim único y cap de reward de Vigor,
  - gate/costo/resultado de reroll de afijo en Forge,
  - textos visibles de edificios contra fórmulas actuales.
  - pacing MVP 2.0 para first expedition, first Town upgrade, first boss/craft, rare-window y first reincarnation production/debug.

Riesgos:

1. Ajustar balance requiere tocar varios archivos.
2. No hay una única “balance config table” para tuning rápido.
3. Naming mixto `renown` vs `Soul Marks` puede generar errores en cambios de economía.
4. Los textos de edificios ya están alineados, pero el tuning sigue distribuido y puede volver a desalinearse si se cambian fórmulas sin actualizar tests/docs.
