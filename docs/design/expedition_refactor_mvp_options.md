# Expedition / Combat Refactor MVP Options

Date: 2026-05-12
Scope: design research and brainstorming, no implementation.

## 1. Goal

The current game has many stats, upgrades, items and affixes, but most of them collapse into a single decision: equip the highest effective power and run the highest available expedition.

The design question is not only "how do we make +10% fire damage matter?" It is also whether the game actually needs fire damage, elemental tags, RPS matching, or deeper expedition combat at all.

This document uses `prop1.md` as the local starting proposal and compares it against browser/idle RPG patterns from Gladiatus, Shakes & Fidget, Travian and Melvor Idle. It then proposes three MVP-grade system directions for Relic Forge Idle.

## 2. Current Local Baseline

Today, expedition success is mostly:

```ts
0.5
+ ((heroPowerScore - dungeon.power) / dungeon.power) * 0.25
+ luck * 0.002
+ classModifier
+ passiveBonus
+ bossAttunementBonus
+ libraryBonus
+ direct equipped affix bonuses
```

This works because it is legible and easy to tune. It fails when item identity wants to become contextual. A `+10% fire damage` affix has no target because expeditions do not have enemy families, elemental weaknesses, resistances, hazards, or combat steps.

`prop1.md` proposes the smallest possible contextual layer:

- expedition/region tags such as `element:fire`, `enemy:beast`, `terrain:ruins`;
- affix counters such as `counters: ['element:fire']`;
- a small additive `tagMatchBonus` on success chance;
- chips in UI to show expedition tags and active counters.

This is valid as a minimal patch, but it risks becoming "badge matching" rather than a real system. If tags only add `+4% success`, the player still mostly equips Power and occasionally accepts a green chip.

## 3. External Reference Patterns

### Gladiatus

Gladiatus expedition content is close to Relic Forge Idle structurally: regions have level gates, normal enemies and a boss. Enemies have full stat profiles: lifepoints, strength, dexterity/skill, agility, constitution, charisma/intelligence, armor and damage. The unofficial formula collection describes combat through several independent rolls: hit chance from Dexterity vs enemy Agility, double hit from Charisma/Dexterity vs enemy Intelligence/Agility, armor absorption, block, critical hit and hardening/resilience caps.

Important design lessons:

- The depth is not only "more elements"; it is many orthogonal stat roles.
- Dexterity, agility, charisma, armor and block all answer different combat questions.
- Expeditions have enemies with individual stat identities, not just one power requirement.
- Gladiatus also has enemy mastery: repeating enemies unlocks reward bonuses like more gold, more XP, better item chance and honor.

Sources:

- https://gladiatus.gamerz-bg.com/game-guide/formulas
- https://gladiatus.fandom.com/wiki/Expeditions

### Shakes & Fidget

Shakes & Fidget is simpler and more opaque. Dungeons are mostly gated stages with monsters and loot odds. Its stats still map to combat roles: main class stat for damage, constitution for health, luck for crit, armor for mitigation. Armor is class-bounded: warriors can reduce more damage, scouts less, mages least, and mage attacks ignore some armor logic.

Important design lessons:

- Depth can exist without visible pre-mission formula building.
- Class identity matters because the same stat has different value by class.
- Dungeon progression can stay mostly linear if rewards, class differences and item chase are strong enough.
- It does not need elemental affix matching to work.

Sources:

- https://sfgame.fandom.com/wiki/Armor
- https://sfgame.fandom.com/wiki/Dungeons
- https://sf.kalais.net/english/dungeon2.html

### Travian

Travian is not an idle RPG, but it is useful for "offline Travian" thinking. Combat is about composition and preparation, not a single hero power number. Units have offense and two defense channels: vs infantry and vs cavalry. Buildings and context matter: Smithy upgrades, walls, residence/palace defense, rams, catapults, raid vs attack type, scouts, traps, brewery, artefacts.

The hero adventure system is almost the opposite: a simple auto-resolved trip. The location type has no impact on damage; damage is mainly reduced by hero fighting strength. Rewards are controlled by spawn age and early fixed reward order.

Oases create a non-combat strategic layer: map nodes provide resource bonuses, have animals, can be raided, regenerate resources, and create long-term production specialization.

Important design lessons:

- Deep strategy can live outside the expedition result formula.
- Composition beats raw power when units have sharply different roles.
- Resource geography can make regions matter without adding elemental combat.
- A simple adventure system can coexist with deeper account/town/resource systems.

Sources:

- https://support.travian.com/en/support/solutions/articles/7000065350-battle-mechanics
- https://support.travian.com/en/support/solutions/articles/7000060172-adventures
- https://support.travian.com/en/support/solutions/articles/7000061166-oasis

### Melvor Idle

Melvor is the strongest idle reference. It uses combat skills, equipment, accuracy vs evasion, damage reduction, max hit, attack interval, prayers, food, slayer requirements and a combat triangle. The triangle gives style matchups: Melee, Ranged and Magic are strong/weak against each other, changing damage and resistance modifiers.

Important design lessons:

- RPS can work if the choices are few, universal and readable.
- The game can expose "chance to hit", "max hit", "damage reduction" and "survival" instead of a single success chance.
- Skills and non-combat systems can feed combat without every item being a direct power upgrade.
- Requirement gates such as Slayer, damage type, food/DR checks and dungeon restrictions create goals beyond "more power".

Sources:

- https://wiki.melvoridle.com/w/Combat
- https://wiki.melvoridle.com/w/Combat_Triangle
- https://wiki.melvoridle.com/w/Damage_Reduction

## 4. Core Diagnosis

There are four different ways to add depth:

1. Make expedition resolution deeper.
2. Make loadout/build selection deeper.
3. Make region/resource routing deeper.
4. Make account-wide progression deeper.

The risky path is doing only option 1 with too many tags. If every expedition becomes a checklist of fire/holy/undead/swamp/stealth/bleed, the UI cost is high and the actual decision may still be "equip the best green chips."

The safer direction is to choose one primary depth vector and keep the others as support.

## 5. MVP Option A: Power + Threat Counters

### Pitch

Keep the current success chance, but add a small number of expedition threats that act as soft caps and reward multipliers.

This is an improved version of `prop1.md`: not generic tag matching, but named threats with player-readable consequences.

Example threats:

- `armored`: needs armor break, hammer, high power or forge prep.
- `cursed`: needs ward, holy, shrine/library prep.
- `venom`: needs antidote, nature resist, stamina.
- `elusive`: needs speed, scout tools, luck.
- `regenerating`: needs fire, bleed, burst power.
- `brutal`: needs defense/stamina/armor.

Each dungeon has 0-2 threats. Bosses have 2-3.

### Formula Shape

Keep:

```ts
base + powerTerm + luckTerm + class/passive/town/prestige/directAffix
```

Add:

```ts
threatCoverageBonus
missingThreatCap
```

Example:

```ts
rawChance = currentFormula + coveredThreats * 0.04 - missingMajorThreats * 0.03

maxChance =
  boss && missingCriticalThreat ? 0.72 :
  missingMajorThreats > 0 ? 0.88 :
  0.96

successChance = clamp(rawChance, 0.15, maxChance)
```

This makes counters matter without making them mandatory in normal content. Bosses become preparation checks.

### Item / Affix Changes

Do not add `+10% fire damage` yet. Add affixes that explicitly answer threats:

- `Flame-Sealed`: covers `regenerating`; minor power.
- `Ward-Bound`: covers `cursed`; minor defense/luck.
- `Venom-Kit`: covers `venom`; stamina and failure reward.
- `Piercing`: covers `armored`; power and boss success.
- `Trailwise`: covers `elusive`; speed and duration.

Elemental flavor can exist inside threat counters. Fire matters because it answers regeneration, not because the game has generic elemental DPS.

### Region / Boss Design

- Regions teach one threat at a time.
- Region boss combines the zone threat plus one new twist.
- Later regions remix earlier threats.

Example:

- Sunlit Marches: `brutal`, `elusive`
- Emberwood: `regenerating`, `venom`
- Azure Vaults: `cursed`, `armored`
- Stormglass: `elusive`, `brutal`, `armored`
- First Forge: multi-threat checks

### Pros

- Minimal schema change.
- Builds matter more than raw power, but only in specific places.
- Bosses can become memorable.
- Works with current UI: tags + "missing answer" warning.
- Good bridge from current system.

### Cons

- Still fundamentally a success chance game.
- Needs careful cap tuning or players may feel blocked by missing RNG affixes.
- If all counters come only from random drops, it can frustrate.

### MVP Scope

- 6 threat tags.
- 10-12 counter affixes.
- Each dungeon gets 0-2 threats.
- Bosses get one critical threat.
- Add one Forge "prepare counter" action so RNG is not the only source.

### Best If

You want expedition depth, but you want to avoid building a full combat simulator.

## 6. MVP Option B: Three Loadout Styles / RPS Expeditions

### Pitch

Replace elemental/tag sprawl with a very small RPS system: every build leans into one of three styles, and every expedition has a preferred/hostile style.

Possible styles:

- `Force`: power, defense, boss breaking.
- `Cunning`: speed, luck, loot, short runs.
- `Arcane`: rune, relic, ward, weird mechanics.

Or more classic:

- `Melee`
- `Ranged`
- `Magic`

For this game, `Force / Cunning / Arcane` fits the current stats better than weapon classes.

### Formula Shape

Each equipped item contributes style weight:

- power/defense heavy gear -> Force
- speed/luck gear -> Cunning
- relic/luck/rune/utility affixes -> Arcane

The hero has a dominant style, but mixed builds are allowed.

Each expedition has:

```ts
favoredStyle
resistedStyle
neutralStyle
```

Effect:

- favored: +8% success, +10% rewards or loot
- neutral: no change
- resisted: -5% success or lower max chance

Bosses may demand two phases:

- "break shield with Force"
- "disarm trap with Cunning"
- "seal relic with Arcane"

But MVP should use one primary style per expedition.

### Item / Affix Changes

Items do not need many elemental affixes. Add style identity:

- Force affixes: boss damage, armor break, stamina, defense.
- Cunning affixes: speed, loot, gold, short missions, dodge.
- Arcane affixes: rune gains, curse ward, crafting discount, long missions, relic power.

Item Power can remain, but the UI should show:

```txt
Power 128
Style: Cunning 54% / Force 31% / Arcane 15%
```

### Region / Boss Design

Each region can have a style bias:

- Sunlit: Force tutorial
- Emberwood: Cunning routes
- Azure: Arcane routes
- Stormglass: Force/Cunning alternation
- First Forge: rotating style checks

### Pros

- Very readable.
- Avoids huge tag taxonomy.
- Gives a reason for build presets.
- Easy to explain with icons.
- More "gamey" than passive tag matching.

### Cons

- Can feel artificial if every dungeon is just colored RPS.
- Less fantasy-specific than fire/undead/poison.
- Requires item comparison UI to stop ranking only by Item Power.

### MVP Scope

- 3 styles.
- Style score derived from existing stats/affixes.
- Each dungeon gets `favoredStyle` and optional `resistedStyle`.
- Success formula adds style term and max cap for resisted bosses.
- Add 2 build presets.

### Best If

You want deeper build decisions but low content authoring cost.

## 7. MVP Option C: Keep Expedition Formula Simple, Move Depth To Region Economy

### Pitch

Do not deepen expedition combat much. Accept that expeditions are idle timers with a success chance. Add depth through regional resources, town specialization, production jobs and account-wide unlocks.

This is the "Travian offline + idle RPG" direction.

Each region becomes valuable because it drops different materials and unlocks different city/account upgrades, not because it has fire/ice matching.

Example regional resources:

- Sunlit: timber, herbs, common ore.
- Emberwood: ember resin, beast hide, charcoal.
- Azure Vaults: glyph dust, crystal, archive pages.
- Stormglass: stormglass, charged rune, sky iron.
- First Forge: relic core, oath ember, ancient alloy.

Expeditions stay simple:

```ts
success = current formula
```

But region choice becomes:

- farm Emberwood for Forge heat upgrades;
- farm Azure for Library research;
- farm Stormglass for speed/timer upgrades;
- farm Sunlit for consumables/fishing/tavern supply;
- farm First Forge for prestige and high-tier crafting.

### Systems Added

1. Regional material tables.
2. Town recipes that require specific region materials.
3. Long jobs:
   - mining
   - logging
   - fishing
   - scouting
   - relic survey
4. Account codex:
   - "clear this dungeon 5 times"
   - "collect 30 ember resin"
   - "craft 3 Ember tools"
5. Boss keys:
   - boss attempts require cheap prep materials from the region.

### Item / Affix Changes

Leave Item Power mostly as-is.

Affixes become economy/build preference rather than combat counters:

- `+12% Emberwood materials`
- `+10% boss key fragments`
- `+8% survey yield`
- `+1 fishing catch tier`
- `+15% salvage into regional material`
- `+10% Library research pages`

In this model, `+10% fire damage` is probably not needed. Replace it with `+Emberwood yield`, `+Forge heat`, `+Regeneration threat counter` or `+Burning boss key progress`.

### Pros

- Reduces risk of confusing players with combat tags.
- Makes old regions useful.
- Gives town/building systems much more purpose.
- Adds many brainstormable systems: fishing, logging, mining, surveys, workshops, region contracts.
- Better long-term idle retention.

### Cons

- Does not solve "combat build" fantasy.
- Items may still feel like economy tools plus power.
- Needs more content tables and sink design.

### MVP Scope

- 5 regional materials, one per zone.
- Each building upgrade after level 3 requires one regional material.
- Add 3 gathering jobs: Mine, Grove, River/Survey.
- Add region mastery tiers: 1/5/15 clears with small permanent bonuses.
- Add boss prep keys built from regional materials.

### Best If

You want depth and retention without making every expedition a combat puzzle.

## 8. Rebuscadas But Plausible Ideas

These are not all MVP, but they are useful directions.

### Expedition Loadout Has Two Slots: Gear + Plan

Instead of only equipment, player chooses a plan:

- Safe: lower rewards, higher floor, less failure penalty.
- Greedy: lower success, higher loot/materials.
- Fast: shorter timer, lower rewards.
- Scout: reveals boss weakness or increases future chance.

This adds agency without adding more item stats.

### Bosses Have Prep Meters, Not Just Success Chance

Before a boss, the player can fill 0-3 prep meters:

- Intel from Library/scouting.
- Supplies from Tavern/Market.
- Countermeasure from Forge/Shrine.

Each meter changes the boss cap/rewards. You can attempt early, but preparation creates a visible plan.

### Region Threats Are Discovered, Not Fully Known

First clear shows only "Unknown threat". After a scouting run or failure, the game reveals: `Cursed`, `Armored`, etc.

This makes failure useful and gives Library/Scout jobs purpose.

### Failure Produces Progress

If expedition fails:

- gain intel on one threat;
- gain mastery XP;
- gain partial regional material;
- reduce next attempt difficulty slightly up to a cap.

This makes harder content less punishing.

### Items Can Be "Good Here" Without Being Better Everywhere

Add an item comparison mode:

- General Power
- This Expedition
- This Region
- Boss Prep

This prevents global item score from flattening contextual items.

### Region Occupation / Outpost Lite

Borrowing from Travian oases:

- After clearing a region boss, choose one outpost bonus in that zone.
- Examples: +ore, +XP, +loot, +short timer, +boss key fragments.
- Only 2-3 outposts active at once.

This creates strategic account choices without complex combat.

### Crafting Orders As Soft Targeting

Town posts orders:

- "Bring 20 Ember Resin and clear Emberwood Heart once: next craft has Fire/Regeneration counter."
- "Clear 5 Azure expeditions: guaranteed Library affix on next relic."

This solves RNG gating for counters.

## 9. Recommendation

Do not implement generic `+10% fire damage` yet.

The best next MVP is a hybrid of Option A and Option C:

1. Add named threats/counters only where they create clear boss and expedition decisions.
2. Add regional materials so regions matter even when the player ignores counters.
3. Keep the current success chance visible, but add dynamic max chance only for bosses or clearly marked elite expeditions.

This gives depth in two places:

- tactical: "this boss is cursed/regenerating; I can prepare";
- strategic: "I need Emberwood/Azure materials for my town/forge plan."

Avoid starting with a broad elemental taxonomy. Fire should be introduced as "answers regeneration" or "powers Ember Forge recipes", not as a generic damage lane.

## 10. Concrete MVP Proposal

### Data

Add to `DungeonDefinition`:

```ts
threats?: ExpeditionThreatId[];
regionMaterialId?: MaterialId;
```

Add:

```ts
type ExpeditionThreatId =
  | "armored"
  | "cursed"
  | "venom"
  | "elusive"
  | "regenerating"
  | "brutal";
```

Add to `AffixEffects` or `Affix`:

```ts
threatCounters?: ExpeditionThreatId[];
regionYieldMultiplier?: Partial<Record<ZoneId, number>>;
```

### Formula

Normal expeditions:

```ts
successChance = currentChance + coveredThreats * 0.03 - missingThreats * 0.015
```

Bosses:

```ts
successChance = currentChance + coveredThreats * 0.04 - missingThreats * 0.025
maxChance = missingCriticalThreat ? 0.72 : 0.96
```

### Content

First pass:

- 6 threats total.
- 12 new affixes.
- 5 regional materials.
- 1 boss prep action per boss.
- 1 region mastery track using existing `dungeonClears`.

### UI

For each expedition:

```txt
Threats: Cursed, Armored
Covered: Cursed
Missing: Armored
Max chance: 88% because Armored is uncovered
```

For each item:

```txt
Counters: Cursed
Region: +8% Azure Vaults materials
```

### Why This Beats Raw `prop1.md`

`prop1.md` says "match tags to get more chance."

This proposal says:

- threats have names and consequences;
- bosses can cap brute force when a critical answer is missing;
- regions matter through materials even if combat matching is ignored;
- items can be tactical or economic;
- Forge/Town can provide fallback preparation, so RNG does not hard-block progression.

## 11. Decision Matrix

| Option | Depth | Complexity | Player Readability | Retention | Risk |
| --- | ---: | ---: | ---: | ---: | ---: |
| A. Power + Threat Counters | High | Medium | Medium/High | Medium | Medium |
| B. 3-Style RPS Builds | Medium/High | Medium | High | Medium | Medium |
| C. Region Economy Depth | Medium | Medium | High | High | Low/Medium |
| Recommended Hybrid A+C | High | Medium | Medium/High | High | Medium |

## 12. Cut Lines

Do not build in MVP:

- 10+ damage types.
- Full elemental resistance table.
- Separate weapon mastery per weapon type.
- Sockets/gems.
- Enemy stat simulation with round-by-round combat.
- Multiple consumable types.
- Randomized expedition affixes.
- Hard requirement counters on normal content.

Build only after MVP proves useful:

- mastery XP per threat/region;
- outposts;
- boss prep meters;
- build presets;
- scouting discovery;
- elite dungeons.

