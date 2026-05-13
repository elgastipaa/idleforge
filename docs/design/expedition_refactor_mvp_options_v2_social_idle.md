# Expedition / Combat Refactor MVP Options V2 - Social/Idle RPG Reiteration

Date: 2026-05-12
Scope: design research and brainstorming, no implementation.
Base file duplicated from `docs/design/expedition_refactor_mvp_options.md`.

## 1. Goal

The current game has many stats, upgrades, items and affixes, but most of them collapse into a single decision: equip the highest effective power and run the highest available expedition.

The design question is not only "how do we make +10% fire damage matter?" It is also whether the game actually needs fire damage, elemental tags, RPS matching, or deeper expedition combat at all.

This document uses `prop1.md` as the local starting proposal and compares it against browser/idle RPG patterns from Gladiatus, Shakes & Fidget, Travian and Melvor Idle. This V2 expands the comparison with Mafia Wars, Underworld Empire, Vampire Wars, Mob Wars-style games, Torn, AFK Arena and Lost Vault.

The key question for this iteration: are those games too far from Relic Forge Idle, or can we borrow their retention logic, feature structure, marketing hooks and addictive cadence without copying their social/FOMO/monetization baggage?

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

### Mafia Wars / Vampire Wars / Mob Wars Family

These games are thematically far from Relic Forge Idle, but mechanically close in one important way: they are menu-driven progression games, not action games. The player spends an action resource, chooses a job or fight, gets deterministic or weighted rewards, fills mastery bars, collects item sets, buys properties and grows an account.

Useful patterns:

- Jobs consume Energy and grant money/XP/items.
- Fights consume Stamina and use attack/defense plus equipment.
- Jobs often have mastery tiers. Completing a tier gives a permanent reward, then the same job can be repeated at higher mastery.
- Collections create small permanent bonuses from item hunting, which makes low-level content useful again.
- Properties create passive income and a reason to return.
- Gifting/social loops created retention, but they also created spam pressure and are not a good fit for local-first MVP.

Design lesson for Relic Forge Idle:

Expeditions do not need to become tactical combat to become deeper. They can become "jobs with mastery, collections, properties/outposts and repeatable rewards." This directly supports a browser idle loop: pick job, spend time/resource, fill mastery, collect upgrade, repeat.

Sources:

- https://mafiawars.fandom.com/wiki/Energy
- https://mafiawars.fandom.com/wiki/Mastery_Rewards
- https://mafiawars.fandom.com/wiki/Collections
- https://mafiawars.fandom.com/wiki/Properties

### Underworld Empire

Underworld Empire modernized the Mafia Wars formula with stronger character-building and group-boss framing. It uses energy/stamina style action loops, bosses, skills, equipment, syndicates and empire growth. The most relevant pattern is not the crime theme; it is the split between:

- low-friction jobs for reliable progress;
- bosses for bursts, coordination or higher commitment;
- character abilities/build choices;
- empire/property growth as long-term account progression.

Design lesson for Relic Forge Idle:

Bosses can be their own layer with prep, keys, phases and repeat milestones, while normal expeditions remain simple. The game can be marketed around "build your guild/town and hunt relic bosses" instead of "solve elemental tags."

Sources:

- https://underworld-empire.fandom.com/wiki/Underworld_Empire_Wiki
- https://underworld-empire.fandom.com/wiki/Bosses
- https://underworld-empire.fandom.com/wiki/Skills

### Torn

Torn is much deeper and more simulation-heavy than Relic Forge Idle, but it has excellent long-term progression primitives:

- Nerve for crimes.
- Energy for combat/gym/training.
- Happy and property quality affecting training efficiency.
- Battle stats as long-run account growth.
- Merits as permanent achievement currency.
- Crimes with outcomes ranging from failure to critical success.
- Properties, education and long timers that create planning horizons.

The useful part is the separation of action resources and goals:

- "I spend nerve on risky crimes."
- "I spend energy on training or fights."
- "I invest cash into property/education for long-term multipliers."

Design lesson for Relic Forge Idle:

Vigor should not be only "double expedition rewards." It could become a strategic action resource: boost, scout, train, boss prep, speed up a town job, or take a risky high-yield expedition. Failure can still give progress, like crime experience or intel.

Sources:

- https://wiki.torn.com/wiki/Nerve
- https://wiki.torn.com/wiki/Crimes
- https://wiki.torn.com/wiki/Energy
- https://wiki.torn.com/wiki/Properties
- https://wiki.torn.com/wiki/Merits

### AFK Arena

AFK Arena is far from Relic Forge Idle in presentation and team-building, but very relevant for retention and friction reduction.

Useful patterns:

- AFK rewards accumulate while away.
- Campaign stages provide a clear always-next target.
- Factions create simple matchup identity without hundreds of tags.
- The Resonating Crystal lets lower-level heroes inherit level from top heroes, reducing the cost of experimentation.
- Wishlist and targeted acquisition reduce RNG frustration.
- Peaks/Voyage/Tower-style side modes reuse heroes in different constraints.

Design lesson for Relic Forge Idle:

If we add builds/counters, we need anti-friction. Build presets, target crafting, counter prep, and "bench item inheritance" matter as much as the formula. A player should not be punished for experimenting with Cunning/Arcane/Threat-counter gear.

Sources:

- https://afk-arena.fandom.com/wiki/AFK_Rewards
- https://afk-arena.fandom.com/wiki/Resonating_Crystal
- https://afk-arena.fandom.com/wiki/Factions
- https://afk-arena.fandom.com/wiki/Wishlist

### Lost Vault

Lost Vault is much closer in spirit: idle RPG, wasteland exploration, character progression, loot/crafting, clans and timed activities. The important lesson is that a text/card idle RPG can support many systems if each one has a clear job: exploration, crafting, professions, guild/clan content, bosses and long-tail collection.

Design lesson for Relic Forge Idle:

Adding "side skills" like fishing, mining, scavenging, logging or relic surveying is not automatically off-genre. It fits if those skills feed the main loop with materials, boss prep, town upgrades or crafting orders. The risk is currency bloat; each skill needs one obvious sink.

Sources:

- https://lost-vault.com/
- https://lostvault.fandom.com/wiki/Lost_Vault_Wiki

## 3.1 Are These Games Too Far Away?

Theme: yes, many are far away. Mechanics: no, they are highly relevant.

What transfers well:

- job/expedition mastery;
- energy/stamina/nerve-style action resources;
- repeatable content with milestone rewards;
- collections/codex bonuses;
- properties/outposts/passive income;
- boss prep and boss keys;
- targeted acquisition to reduce RNG pain;
- offline rewards and comeback summaries;
- simple faction/style matchup instead of huge tag lists.

What should not transfer into MVP:

- spammy friend invites;
- guild dependency;
- PvP pressure;
- paid gacha psychology;
- hard daily streak punishment;
- dozens of currencies;
- long opaque timers with no gameplay choice;
- social obligations as core progression.

The conclusion: use their retention architecture, not their dark patterns.

## 4. Core Diagnosis

There are four different ways to add depth:

1. Make expedition resolution deeper.
2. Make loadout/build selection deeper.
3. Make region/resource routing deeper.
4. Make account-wide progression deeper.
5. Make repeat content mastery/collections deeper.

The risky path is doing only option 1 with too many tags. If every expedition becomes a checklist of fire/holy/undead/swamp/stealth/bleed, the UI cost is high and the actual decision may still be "equip the best green chips."

The safer direction is to choose one primary depth vector and keep the others as support.

V2 diagnosis:

The most important borrowed pattern from Mafia Wars/Torn/AFK Arena is not combat math. It is "every click fills a bar that will matter later." Relic Forge Idle should make every expedition advance at least one visible track:

- hero XP;
- loot/materials;
- dungeon or region mastery;
- boss prep/key progress;
- codex/collection progress;
- town recipe progress;
- reincarnation/account progress.

If that is true, then the exact success formula can stay simple. If it is not true, even a clever tag-matching formula will feel thin.

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

## 8.1 V2 Revised Three MVP Directions

The original three options still stand, but after adding Mafia Wars/Torn/AFK/Lost Vault, the best framing changes. These are the three MVP directions worth deciding between.

### V2 Option 1: Expedition Jobs + Mastery

This is the Mafia Wars / Torn-inspired route.

Do not make expeditions tactically complex yet. Turn each expedition into a job with mastery, repeat rewards and collection hooks.

Core loop:

1. Pick expedition.
2. Spend time, optionally spend Vigor.
3. Resolve success/failure.
4. Always advance mastery/intel/collection progress.
5. At mastery thresholds, unlock permanent bonuses or recipes.

MVP mechanics:

- Each dungeon has mastery tiers: 1 / 5 / 15 clears.
- Failure grants 25-40% mastery XP or intel, so hard pushes are not wasted.
- Each region has a collection set with 4-6 relic fragments.
- Completing a collection grants a small permanent bonus.
- Bosses require or benefit from prep keys generated by regional mastery.
- Vigor can be spent on boost, scout, or mastery focus.

Item impact:

- Keep Item Power mostly intact.
- Add affixes like:
  - `+12% Azure mastery XP`
  - `+8% collection drop chance`
  - `+10% boss key progress`
  - `+15% failure intel`
  - `+1 regional material on first daily clear`

Why it may be best:

- Lowest risk of confusing players.
- Every run fills a bar.
- Old content remains useful.
- It copies the addictive part of social RPGs without needing social spam.

Risk:

- Less "build fantasy."
- Combat still feels abstract.

### V2 Option 2: Threat Bosses + Simple Expeditions

This is the Gladiatus / Melvor-inspired route, but constrained.

Normal expeditions remain mostly current. Bosses and elite expeditions get real mechanics through threats and prep.

Core loop:

1. Farm normal expeditions for gear/material/mastery.
2. Scout boss to reveal threats.
3. Prepare with gear, Forge order, Shrine/Library/Tavern prep.
4. Attempt boss with visible max chance and rewards.
5. Repeat boss for mastery and unique recipes.

MVP mechanics:

- Normal expeditions have 0-1 optional threats.
- Bosses have 2 threats and 1 critical threat.
- Missing critical threat caps boss chance, but does not block attempt.
- Forge can create temporary counter-prep so RNG does not hard-lock.
- Boss clear unlocks outpost/property-style region bonus.

Item impact:

- Add threat counters rather than generic elements:
  - anti-regeneration,
  - ward,
  - armor break,
  - venom kit,
  - scout tools,
  - guard stance.
- `+10% fire damage` becomes "covers Regenerating" or "Ember Forge boss prep."

Why it may be best:

- Bosses become memorable.
- Expedition list stays readable.
- Build choices matter in the highest-emotion moments.

Risk:

- Needs UI clarity.
- Needs fallback prep to avoid RNG frustration.

### V2 Option 3: Town/Region Economy First

This is the Travian / Lost Vault-inspired route.

Keep expedition combat simple and make the game deeper through region routing, town production, jobs and outposts.

Core loop:

1. Choose region based on needed material.
2. Run expeditions or side jobs.
3. Upgrade town, craft orders, outposts and boss prep.
4. Unlock account-wide efficiencies.
5. Reincarnate with stronger routing options.

MVP mechanics:

- 5 regional materials, one per zone.
- 3 side jobs: mine, grove/logging, river/fishing or relic survey.
- Buildings above level 3 require region-specific materials.
- Boss keys require local regional materials.
- Region outposts unlock after boss clear and provide a chosen passive.
- Codex tracks region collections and grants small permanent bonuses.

Item impact:

- Items can stay mostly power-based.
- Affixes become routing/economy modifiers:
  - `+Emberwood yield`,
  - `+logging output`,
  - `+fishing tier`,
  - `+boss key fragments`,
  - `+Market income`,
  - `+Forge order speed`.

Why it may be best:

- Strongest long-term retention foundation.
- Easiest to market as "build your relic town, farm regions, hunt bosses."
- Avoids overengineering combat.

Risk:

- More content tables and economy balancing.
- If combat remains too flat, gear fantasy may still feel weak.

## 8.2 V2 Best-Game-First Recommendation

If the goal is "best game possible first time" without spending hundreds of hours on a risky dead end, do not choose a system that requires a giant formula refactor before the game gets more fun.

Recommended MVP path:

1. Build `V2 Option 1: Expedition Jobs + Mastery` first.
2. Add a small slice of `V2 Option 3: Town/Region Economy` at the same time.
3. Add `V2 Option 2: Threat Bosses` only for bosses, not all expeditions.

This creates a layered game:

- normal expeditions are reliable jobs;
- regions matter because they feed town/crafting;
- bosses are the place where build/prep matters;
- every action fills a mastery/collection/account bar.

The key product rule:

> Expeditions should be simple to start, but not empty to repeat.

Marketing angle:

- "A compact idle RPG about building a relic town, mastering expeditions and preparing for bosses."
- Better than: "An idle RPG with elemental tag matching."

The first version should be addictive because players always see:

- next clear mastery;
- next collection piece;
- next town recipe;
- next boss prep;
- next reincarnation upgrade.

Not because they are forced to solve a spreadsheet before every run.

## 9. Recommendation

V2 recommendation: do not implement generic `+10% fire damage` yet.

The best next MVP is a hybrid of the revised options:

1. Expedition Jobs + Mastery as the foundation.
2. Town/Region Economy as the retention layer.
3. Threat Bosses as the tactical layer.

This gives depth in two places:

- repeat-loop: "one more run gets mastery, collection, key or recipe progress";
- strategic: "I need Emberwood/Azure materials for my town/forge plan";
- tactical: "this boss is cursed/regenerating; I can prepare."

Avoid starting with a broad elemental taxonomy. Fire should be introduced as "answers regeneration" or "powers Ember Forge recipes", not as a generic damage lane.

## 10. Concrete MVP Proposal

### Data

Add to `DungeonDefinition`:

```ts
threats?: ExpeditionThreatId[];
regionMaterialId?: MaterialId;
masteryMilestones?: number[];
collectionDropTableId?: string;
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
masteryXpMultiplier?: Partial<Record<ZoneId | DungeonId, number>>;
collectionDropChance?: number;
bossKeyProgressMultiplier?: number;
```

Add account/region progress:

```ts
type DungeonMasteryState = {
  clears: number;
  masteryXp: number;
  claimedMilestones: number[];
};

type RegionCollectionState = {
  foundRelics: string[];
  completedAt: number | null;
};

type RegionOutpostState = {
  selectedBonusId: string | null;
  level: number;
};
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
- 1 collection per region.
- 1 outpost choice per region boss clear.
- Vigor modes: reward boost, scout, mastery focus.

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
| V2 Option 1. Expedition Jobs + Mastery | Medium | Low/Medium | High | High | Low |
| V2 Option 2. Threat Bosses + Simple Expeditions | High | Medium | Medium/High | Medium/High | Medium |
| V2 Option 3. Town/Region Economy First | Medium/High | Medium | High | High | Low/Medium |
| Recommended Hybrid 1 + 3 + Boss slice of 2 | High | Medium | High | High | Medium |

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
