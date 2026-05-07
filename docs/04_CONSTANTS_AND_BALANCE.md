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
- `DAILY_TASK_COUNT = 3`
- `DAILY_RESET_HOUR_UTC = 23`
- `VIGOR_MAX = 100`
- `VIGOR_REGEN_INTERVAL_MS = 5m`
- `VIGOR_EXPEDITION_BOOST_COST = 20`
- `VIGOR_EXPEDITION_BOOST_MULTIPLIER = 2`
- `REINCARNATION_UPGRADE_MAX = 15`
- Debug:
  - `DEBUG_DURATION_MULTIPLIER = 0.2`
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

- Archivos: `balance.ts`, `heroes.ts`, `engine.ts`

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
  libraryBonus,
  0.15,
  0.96
)
```

Multiplicadores:

- Recompensas base: `getRewardMultiplier = debug?4:1 * (1 + guildLegacy*0.02)`
- XP: `rewardMultiplier * (1 + tavern*0.04)`
- Gold: `rewardMultiplier * (1 + market*0.05) * roguePassive`
- Materiales: `rewardMultiplier * (1 + mine*0.08)`
- Duración:
  - debug: `duration * 0.2` (min 5s)
  - normal: reducción por `swiftCharters`, speed y pasiva rogue (min 10s)

Failure scale:

- base `0.35`
- warrior Lv10 sube a `0.415` (por bonus `+0.065`)

---

## 4) Dungeons / regiones / enemigos

- Archivo: `src/game/content.ts`
- Propósito: contenido de progresión.

Estado:

- `5` regiones
- `20` dungeons
- `5` bosses

Duraciones reales por banda:

- Región 1: `15s, 30s, 60s, 3m`
- Región 2: `3m, 5m, 5m, 5m`
- Región 3: `5m, 5m, 5m, 10m`
- Región 4: `30m, 30m, 30m, 30m`
- Región 5: `60m, 60m, 60m, 60m`

Gate de reincarnación:

- boss objetivo: `curator-of-blue-fire` (región 3).

Riesgo:

- Parte de región 2/3 usa varias duraciones iguales (menos variedad temporal).

---

## 5) Loot / drop rates / ítems

- Archivos: `loot.ts`, `constants.ts`, `balance.ts`
- Propósito: generación y economía de ítems.

Rareza base:

- common `70`
- rare `22`
- epic `7`
- legendary `1`

Boss bonus de rareza:

- rare `+5`
- epic `+2`
- legendary `+0.5`

Affixes por rareza:

- common `1`
- rare `2`
- epic `3`
- legendary `4`

Loot chance:

```ts
clamp(0.42 + zoneIndex*0.02 + luck*0.001 + treasureOath*0.004 + roguePassive, 0.35, 0.8)
```

Primera corrida:

- fuerza un `weapon common` en `tollroad-of-trinkets`.

Overflow:

- si inventario está en 30, loot extra se auto-salvagea.

Riesgo:

- Muchos coeficientes de loot/economía están hardcoded en funciones (`loot.ts`, `engine.ts`) y no centralizados en una tabla de tuning.

---

## 6) Forge (craft + upgrade)

- Archivo: `src/game/forge.ts`
- Propósito: sink de recursos y crecimiento de gear.

Costo de craft:

```ts
gold = floor(80 + lootLevel*22)
ore = floor(6 + lootLevel*0.9)
crystal = max(0, floor((lootLevel-8)*0.45))
rune = max(0, floor((lootLevel-18)*0.22))
relicFragment = lootLevel>=45 ? max(1, floor((lootLevel-40)*0.12)) : 0
```

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

---

## 7) Town / costos / bonos

- Archivos: `content.ts`, `town.ts`, `balance.ts`, `offline.ts`

Edificios:

- Forge, Mine, Tavern, Library, Market, Shrine (max 12 cada uno).

Escalado de costo:

- gold: `base * 1.62^level`
- materiales: `base * 1.53^level`

Efectos de balance usados por motor:

- Forge: power/defense y budget de ítems.
- Mine: multiplicador de materiales + generación offline.
- Tavern: XP multiplier + stamina.
- Library: luck + bonus de success.
- Market: gold multiplier + sell multiplier.
- Shrine: power score y bonus de Soul Marks en reincarnación.

Mine offline:

```ts
ore = floor(mine*4*hours)
crystal = floor(max(0,mine-1)*1.2*hours)
rune = floor(max(0,mine-4)*0.45*hours)
relicFragment = floor(max(0,mine-8)*0.15*hours)
```

---

## 8) Dailies

- Archivo: `dailies.ts`

Reglas:

- 3 tareas únicas por día.
- reset 23:00 UTC.
- intenta no repetir set exacto del día anterior.

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

---

## 9) Vigor

- Archivo: `vigor.ts`

Reglas:

- cap 100.
- regen +1 cada 5 minutos.
- si llega a cap, normaliza `lastTickAt`.
- gasto principal: boost expedición (20 vigor por run, x2 rewards).

---

## 10) Reincarnación / progreso permanente

- Archivo: `prestige.ts`

Gate:

- `hero.level >= 18`
- `dungeonClears["curator-of-blue-fire"] > 0`

Ganancia de Soul Marks (`renown` interno):

```ts
base = max(1, floor(highestRegion*2 + bossClears + heroLevel/4))
withShrine = floor(base * (1 + shrine*0.04))
debug => withShrine * 2
```

Upgrades permanentes:

- `swiftCharters`
- `guildLegacy`
- `treasureOath`
- `bossAttunement`

Costo por nivel:

- `currentLevel + 1`

Tope:

- `REINCARNATION_UPGRADE_MAX = 15`

---

## 11) Hardcode detectado / deuda de balance

Hardcode en múltiples archivos:

- `engine.ts`: fallback de materiales en derrota, escalas de rewards.
- `loot.ts`: pesos y budgets de stats.
- `forge.ts`: escalas de craft/upgrade.
- `offline.ts`: curva de mine offline.

Riesgos:

1. Ajustar balance requiere tocar varios archivos.
2. No hay una única “balance config table” para tuning rápido.
3. Naming mixto `renown` vs `Soul Marks` puede generar errores en cambios de economía.
