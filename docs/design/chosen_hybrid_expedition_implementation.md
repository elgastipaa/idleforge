# Chosen Hybrid Expedition Implementation

Date: 2026-05-12
Status: chosen design direction, implementation-ready planning.
Source: `docs/design/expedition_refactor_mvp_options_v2_social_idle.md`

## 1. Decision

We choose the V2 Recommended Hybrid:

1. **Expedition Jobs + Mastery** as the foundation.
2. **Town/Region Economy** as the retention layer.
3. **Threat Bosses** as the tactical layer.

The product rule:

> Expeditions should be simple to start, but not empty to repeat.

This means normal expeditions stay fast and understandable. Bosses become the focused place where preparation, build, counters and threat mechanics matter. Regions become strategically valuable through materials, collections, outposts and town recipes.

## 2. Why This Is The Right Default

This is safer than full tag matching because it improves the repeat loop before it asks players to solve a deeper formula.

It solves the current design problem in three ways:

- **Power still matters:** existing balance, item score and progression remain usable.
- **Every run matters:** mastery, collection, regional material and boss prep progress create "one more run" motivation.
- **Builds matter where emotion is highest:** boss attempts, not every normal expedition, get threat/counter depth.

It also avoids the worst failure mode: spending weeks on elemental/tag combat and discovering that players still only equip the highest number.

## 2.1 Third-Pass Polish Decisions

This pass tightens the implementation around item simplicity and long-term progression.

### Item Complexity Decision

Do not keep the current "many affixes by rarity" model for the refactor.

Current loot can have 1/2/3/5 affixes by rarity. That is too much if combat is intentionally staying simple. The new target model is:

1. Base item stats from slot, rarity and item level.
2. **One explicit trait affix** per meaningful item.
3. Optional **family resonance** from wearing 2-3 items of the same family.

This gives item identity without turning every item card into a wall of modifiers.

### Tactical Affix Stat Decision

Tactical boss affixes should not carry random unrelated stats.

The earlier examples used small stats because current items need numeric value to compare cleanly. That was intentional as a bridge, but the refined rule is stricter:

> A tactical affix may include stats only if those stats reinforce the same fantasy and mechanical answer as the counter.

Examples:

- `Ward-Bound` can give defense/luck because it represents resisting curses and reading danger.
- `Trailwise` can give speed/luck because it helps against elusive routes.
- `Piercing` can give power because it breaks armored targets.
- `Guarded` can give defense/stamina because it answers brutal bosses.
- `Antivenom` should give stamina/failure recovery, not random power.

If a counter is strong, the stat budget should be smaller than a pure stat affix. The player should choose it because it is relevant, not because it is always the best raw power line.

### Set Decision

Use **families/resonance**, not heavy Diablo-style sets.

Families give the satisfying "set" chase without requiring full set design. The item still has one explicit trait. The family bonus lives at the hero/loadout level, not as a second random item affix.

MVP family rule:

- 2 items from the same family activate Rank 1 resonance.
- 3+ items from the same family upgrade it to Rank 2.
- No 4-piece or 5-piece bonuses in MVP.
- Only one family resonance is active in MVP: the family with the highest equipped count. Ties choose the family with highest total equipped item score.

This keeps item reading simple:

```txt
Azure Wardhelm
Trait: Ward-Bound
Family: Azure Ledger
```

And hero reading simple:

```txt
Active Resonance: Azure Ledger II
+6% Archive Glyphs, +1 revealed boss threat in Azure Vaults
```

### Long-Term Progression Decision

Borrow more from RuneScape, Mafia Wars and Torn:

- region diaries,
- collection logs,
- property/outpost income,
- interdependent skills/jobs,
- mastery capstone rewards,
- short quest chains that unlock systems.

Do not borrow:

- social spam,
- PvP pressure,
- hard streaks,
- paid gacha pacing,
- dozens of independent currencies.

## 3. MVP Pillars

### Pillar A: Expedition Jobs + Mastery

Each dungeon becomes a repeatable job with mastery progress.

Mastery should answer:

- Why would I repeat an old dungeon?
- What did I gain if a risky attempt failed?
- What short-term target am I one or two runs away from?

MVP rules:

- Track mastery per dungeon.
- Success gives full mastery XP.
- Failure gives partial mastery XP or intel.
- First clear, 5 clears and 15 clears are milestone moments.
- Bosses have their own milestone rewards, but use the same underlying system.

Recommended numbers:

```ts
normalSuccessMasteryXp = 100
normalFailureMasteryXp = 35
bossSuccessMasteryXp = 150
bossFailureMasteryXp = 50

masteryMilestones = [
  { tier: 1, xp: 100, label: "Mapped" },
  { tier: 2, xp: 500, label: "Known Route" },
  { tier: 3, xp: 1500, label: "Mastered" }
]
```

Milestone rewards:

- Tier 1: small one-time regional material bundle.
- Tier 2: +small permanent yield or collection chance for that dungeon/region.
- Tier 3: recipe, title, boss prep discount, or outpost upgrade material.

### Pillar B: Town/Region Economy

Each region gets one local material family. These should not all become header currencies. They should live in a region/town stockpile UI to avoid top-bar bloat.

Initial region materials:

| Region | Material | Primary Sinks |
| --- | --- | --- |
| Sunlit Marches | Sunlit Timber | Tavern, Market, early boss prep |
| Emberwood | Ember Resin | Forge, regeneration counters, crafting heat |
| Azure Vaults | Archive Glyphs | Library, Shrine, ward prep |
| Stormglass Peaks | Stormglass Shards | timer upgrades, elite prep |
| First Forge | Oath Embers | high-tier crafting, reincarnation accelerants |

Reward rules:

```ts
normalSuccessRegionMaterial = 1 + floor(zoneIndex / 2)
normalFailureRegionMaterial = zoneIndex >= 2 ? 1 : 0
bossSuccessRegionMaterial = 3 + zoneIndex
bossFailureRegionMaterial = 1
```

Town usage:

- Building levels 1-3 stay close to current costs.
- Building levels 4+ can require regional materials.
- Advanced Forge orders require region materials.
- Boss prep uses local region material.

This makes region selection meaningful without adding combat complexity everywhere.

### Pillar C: Threat Bosses

Threats are used mainly on bosses and a few late/elite expeditions. Do not add a broad tag system to every normal run in MVP.

Initial threat set:

```ts
type ExpeditionThreatId =
  | "armored"
  | "cursed"
  | "venom"
  | "elusive"
  | "regenerating"
  | "brutal";
```

Threat meanings:

| Threat | Player Answer |
| --- | --- |
| `armored` | armor break, high power, Forge prep |
| `cursed` | ward, Shrine/Library prep, holy-flavored affix |
| `venom` | stamina, antidote prep, nature/alchemy affix |
| `elusive` | speed, scout prep, luck |
| `regenerating` | fire/burst/bleed-flavored counter |
| `brutal` | defense, stamina, guard prep |

Boss threat rules:

- Region 1 boss: 1 major threat, no critical threat.
- Region 2 boss: 1 major + 1 critical threat.
- Region 3+ bosses: 2 major + 1 critical threat.
- First clear should reveal or strongly hint threats.
- Scouting reveals threats before attempting.

Boss chance adjustment:

```ts
baseChance = currentGetSuccessChance(state, boss)
covered = countCoveredThreats(state, boss)
missing = countMissingThreats(state, boss)
missingCritical = isCriticalThreatMissing(state, boss)

rawChance =
  baseChance
  + covered * 0.04
  - missing * 0.025

maxChance =
  missingCritical ? 0.72 :
  missing > 0 ? 0.88 :
  0.96

bossSuccessChance = clamp(rawChance, 0.15, maxChance)
```

Important: missing counters should cap or reduce odds, not block play. Players can still try.

## 4. Vigor Rework

Vigor should become a strategic action resource, not only a reward doubler.

MVP Vigor modes:

| Mode | Cost | Use |
| --- | ---: | --- |
| Reward Boost | current adjusted cost | current x2 reward behavior |
| Scout | 10 | reveal boss threats or increase intel |
| Mastery Focus | 15 | +75% mastery XP and collection chance on one run |
| Prep Rush | 20 | creates one temporary boss prep charge |

Rules:

- Vigor is never required for normal progression.
- Vigor improves planning and short sessions.
- UI should show the exact benefit before spending.
- Existing reward boost can remain as the default simple option.

## 5. Items And Affixes

Do not implement generic `+10% fire damage` in MVP.

Use a simplified item model:

| Rarity | Explicit Trait | Family | Notes |
| --- | ---: | ---: | --- |
| Common | 0 | No | Base stats only; clear salvage/sell fodder. |
| Rare | 1 | Sometimes | First meaningful trait tier. |
| Epic | 1 | Yes | Stronger stats/trait scaling, guaranteed family. |
| Legendary | 1 signature trait | Yes | No five-affix walls; identity comes from signature + family. |

Trait strength scales by rarity. Rarity should improve numbers and family access, not add more random text lines.

Recommended trait budget:

| Trait Type | Stat Budget vs Pure Stat Trait | Utility |
| --- | ---: | --- |
| Pure stat | 100% | no utility |
| Tactical counter | 60-75% | covers boss threat |
| Regional economy | 50-70% | region yield/progress |
| Progress utility | 40-65% | mastery/collection/scout/failure progress |
| Legendary signature | 85-100% | one unique rider, not extra random affixes |

This makes a pure power item still attractive for general pushing, while contextual items become best-in-slot for specific goals.

Add three trait families:

### 5.1 Tactical Boss Traits

These answer threats.

Examples:

- `Flame-Sealed`: counters `regenerating`; adds modest power or boss burst.
- `Ward-Bound`: counters `cursed`; adds defense/luck.
- `Piercing`: counters `armored`; adds power or armor-break prep.
- `Trailwise`: counters `elusive`; adds speed/luck.
- `Antivenom`: counters `venom`; adds stamina/failure recovery.
- `Guarded`: counters `brutal`; adds defense/stamina.

Design rule:

The stat must make sense with the threat. If it does not, remove the stat or move the value into the counter/prep effect.

### 5.2 Regional Economy Traits

These make farming choices interesting.

Examples:

- `+8% Emberwood material yield`
- `+10% Azure collection chance`
- `+12% Sunlit mastery XP`
- `+10% boss key progress`
- `+1 local material on first clear of the day`

### 5.3 Utility Progress Traits

These support account growth without direct combat power.

Examples:

- `+failure intel`
- `+salvage into local material`
- `+Forge order speed`
- `+outpost upgrade progress`
- `+scout effectiveness`

Item Power can stay as the general comparison score, but UI needs a secondary "Relevant here" comparison for expedition/boss screens.

### 5.4 Families / Lightweight Sets

Families are the "set affix" layer.

They should be regional or system-themed, not random brand names.

Initial families:

| Family | Theme | Rank 1: 2 Items | Rank 2: 3+ Items |
| --- | --- | --- | --- |
| Sunlit Charter | safe routes, early economy | +Sunlit Timber yield | +mastery XP in Sunlit Marches |
| Emberbound Kit | Forge heat, regeneration answers | +Ember Resin yield | prep discount vs `regenerating` |
| Azure Ledger | Library, curses, scouting | +Archive Glyphs yield | reveal one boss threat in Azure Vaults |
| Stormglass Survey | speed, elite routes | +Stormglass yield | small duration reduction in Stormglass |
| First Forge Oath | high-tier crafting | +Oath Ember yield | boss prep efficiency in First Forge |

Family bonuses should be visible as one active resonance line. They should not stack into a spreadsheet.

MVP rule:

```ts
activeFamilyResonance = bestEquippedFamilyByCountThenScore(equipment)
rank = equippedCount >= 3 ? 2 : equippedCount >= 2 ? 1 : 0
```

This gives the player a reason to keep a slightly lower-power item if it completes a 2-piece or 3-piece family.

### 5.5 Migration From Current Affixes

When implementation starts, there are two low-risk paths:

1. Keep legacy items as-is until they are sold/salvaged, and generate new items with the simplified trait model.
2. Convert legacy items by keeping the highest-value affix as the new trait and folding the rest into base stat budget.

Prefer path 1 for MVP because it avoids destructive save migration.

## 6. Region Collections

Each region gets a small collection of relic fragments. This borrows the good part of Mafia Wars collections: old content remains useful and collection completion creates permanent pride/progress.

MVP rules:

- 4 collection pieces per region.
- Normal success has a base collection roll.
- Failure has a small collection roll.
- Boss first clear guarantees one missing regional piece.
- Pity prevents long dry streaks.

Recommended numbers:

```ts
normalSuccessCollectionChance = 0.16
normalFailureCollectionChance = 0.05
bossSuccessCollectionChance = 0.35
collectionPityThreshold = 5 eligible runs without a piece
```

Completion rewards should be small and permanent:

- +2% regional material yield.
- +2% mastery XP in that region.
- +1% boss success in that region.
- unlock cosmetic title/codex entry.

Do not make collection bonuses large enough to become mandatory before moving on.

## 7. Outposts

After clearing a region boss, the player can choose one outpost bonus for that region.

Outposts are the cleanest place to borrow the addictive "properties" layer from Mafia Wars/Vampire Wars without importing social spam or monetization pressure.

MVP outpost choices:

| Outpost | Bonus |
| --- | --- |
| Supply Post | +regional material yield |
| Watchtower | +scout effectiveness / boss intel |
| Relic Survey | +collection chance |
| Training Yard | +mastery XP |

Rules:

- One active outpost per region.
- Respec is free during testing or cheap later.
- Outpost bonuses are regional, not global.
- Outpost upgrades can be a post-MVP extension, but the data model can include `level` now.
- Outposts should not require collection-completion RNG; boss clear is the unlock.

This is the cleanest Travian-oasis-style borrowing for this game.

Outpost long-tail:

- Level 1: unlocked by first boss clear.
- Level 2: requires region mastery tier 2 on two dungeons.
- Level 3: requires region collection completion or boss mastery tier 2.

Keep level 2/3 disabled in first implementation if scope gets tight. The UI can still show "future outpost upgrades" as coming soon in docs, not in app.

## 7.1 Region Diaries

RuneScape's Achievement Diaries are valuable because they turn broad game knowledge into regional goals with tiered rewards. Relic Forge Idle can use a smaller version.

MVP region diary should be tiny:

```txt
Sunlit Marches Diary
- Clear each Sunlit expedition once.
- Reach mastery tier 1 on Tollroad of Trinkets.
- Salvage 3 Sunlit items.
- Upgrade one Town building using Sunlit Timber.
Reward: +2% Sunlit mastery XP, Sunlit title.
```

Rules:

- One diary tier per region in MVP.
- No hard dependency for main progression.
- Diary rewards are quality-of-life, yield, titles or small prep discounts.
- Diaries are the right home for "try the whole game" goals.

This gives us RuneScape-style long-tail without adding 24 skills.

## 8. Data Model

Recommended additions:

```ts
export type RegionMaterialId =
  | "sunlitTimber"
  | "emberResin"
  | "archiveGlyph"
  | "stormglassShard"
  | "oathEmber";

export type ExpeditionThreatId =
  | "armored"
  | "cursed"
  | "venom"
  | "elusive"
  | "regenerating"
  | "brutal";

export type DungeonMasteryState = {
  masteryXp: number;
  claimedTiers: number[];
  failures: number;
};

export type RegionCollectionState = {
  foundPieceIds: string[];
  missesSincePiece: number;
  completedAt: number | null;
};

export type RegionOutpostState = {
  selectedBonusId: string | null;
  level: number;
};

export type ItemFamilyId =
  | "sunlitCharter"
  | "emberboundKit"
  | "azureLedger"
  | "stormglassSurvey"
  | "firstForgeOath";

export type RegionProgressState = {
  materials: Record<RegionMaterialId, number>;
  collections: Record<string, RegionCollectionState>;
  outposts: Record<string, RegionOutpostState>;
  diaries: Record<string, RegionDiaryState>;
};
```

Add to `DungeonDefinition`:

```ts
threats?: ExpeditionThreatId[];
criticalThreat?: ExpeditionThreatId;
regionMaterialId?: RegionMaterialId;
collectionDropTableId?: string;
```

Add to `AffixEffects`:

```ts
threatCounters?: ExpeditionThreatId[];
regionMaterialMultiplier?: Partial<Record<RegionMaterialId, number>>;
masteryXpMultiplier?: number;
collectionDropChance?: number;
bossKeyProgressMultiplier?: number;
scoutMultiplier?: number;
```

Add to `Item`:

```ts
familyId?: ItemFamilyId;
traitId?: string;
```

Longer term, `affixes[]` can be replaced by a single `trait`, but keeping `affixes[]` while generating only one trait is a safer migration path.

Add to `GameState`:

```ts
dungeonMastery: Record<string, DungeonMasteryState>;
regionProgress: RegionProgressState;
bossPrep: Record<string, BossPrepState>;
```

Keep these systems separate from `resources` initially. The existing resource bar is already dense.

## 9. Boss Prep

Boss prep is the fallback that prevents RNG hard locks.

Boss prep sources:

- Scout with Vigor.
- Pay local regional materials.
- Use a Forge order.
- Equip a counter affix.
- Clear related dungeons to mastery tier 1/2.

Prep state:

```ts
type BossPrepState = {
  revealedThreats: ExpeditionThreatId[];
  prepCharges: Partial<Record<ExpeditionThreatId, number>>;
  attempts: number;
};
```

Rules:

- Revealed threats persist until reincarnation or permanently if desired.
- Prep charges can cover a missing threat for one attempt.
- A real equipped counter should be better than a temporary prep charge.
- Boss failures should increase intel.

## 10. Player-Facing UI

### Expedition Card

Show:

- success chance,
- mastery tier/progress,
- regional material reward,
- collection status,
- if boss/elite: threats and missing prep.

Normal expedition card should stay compact. The extra progress can be one dense row:

```txt
Mastery: Known Route 320/500 | Collection: 2/4 | Ember Resin +2
```

### Boss Panel

Bosses deserve a richer panel:

```txt
Threats: Regenerating, Brutal
Covered: Regenerating
Missing: Brutal
Max chance: 88%
Prep: Guard Stance costs 8 Ember Resin or 20 Vigor
```

Primary actions:

- Start Boss
- Scout
- Prepare

### Result Panel

Every result should show progress bars, not only reward numbers:

- Mastery XP gained.
- Collection piece found or pity progress.
- Regional material gained.
- Boss intel/prep progress.
- Town recipe progress if relevant.

This is critical for the "every run mattered" feeling.

### Item Card

Item cards should become simpler than today, not denser.

Recommended layout:

```txt
Azure Wardhelm
Rare Helm · Power 42
Trait: Ward-Bound
Family: Azure Ledger
```

If the item is viewed from a boss or region screen, add one contextual line:

```txt
Relevant here: counters Cursed, completes Azure Ledger II
```

Do not show multiple random affix paragraphs in the default card.

### Hero / Loadout Summary

Show one resonance line:

```txt
Active Family: Azure Ledger II
Counters: Cursed
Region edge: +6% Archive Glyphs
```

This is enough for the player to understand why they might keep a lower-power item.

## 11. Implementation Phases

### Phase 0: Schema And Save Safety

Goal: add state shape and migration without changing gameplay.

Files likely touched:

- `src/game/types.ts`
- `src/game/state.ts`
- `src/game/save.ts`
- `src/game/constants.ts`
- tests

Acceptance:

- old saves import cleanly;
- new state initializes empty progress;
- no UI changes required yet.

### Phase 1: Dungeon Mastery + Result Progress

Goal: every expedition advances mastery.

Implement:

- mastery XP gain on success/failure;
- mastery tiers and claim rewards;
- result summary includes mastery progress;
- UI shows mastery on expedition cards.

Acceptance:

- failed expedition gives partial progress;
- repeated old dungeons have visible value;
- current success formula remains unchanged.

### Phase 2: Region Materials + Town Sinks

Goal: region choice matters.

Implement:

- region material rewards;
- material stockpile UI;
- building levels 4+ or selected Forge orders consume regional materials;
- daily/weekly rewards can include small regional material bundles.

Acceptance:

- player can name why they would farm Emberwood vs Azure;
- no top-bar currency overload;
- early first-session pacing is not slowed.

### Phase 3: Collections + Pity

Goal: add low-pressure collection chase.

Implement:

- 4-piece collection per region;
- collection drop rolls;
- pity counter;
- completion bonus;
- collection panel or compact region display.

Acceptance:

- old regions stay useful;
- no collection is required to clear normal progression;
- dry streaks are bounded.

### Phase 4: Boss Threats + Prep

Goal: builds and preparation matter in boss moments.

Implement:

- boss threats/critical threat data;
- threat coverage from affixes/prep;
- boss-only success cap adjustments;
- scout/prep actions;
- boss UI warnings.

Acceptance:

- normal expeditions remain simple;
- missing boss counter is visible before attempting;
- player has at least one non-RNG way to cover a critical threat;
- brute force can still attempt but has lower cap.

### Phase 5: Affix Expansion

Goal: make loot support the new systems.

Implement:

- simplified one-trait item generation;
- tactical counter traits;
- regional economy traits;
- progress utility traits;
- family/resonance assignment;
- update item scoring to account for contextual utility;
- expedition/boss-specific comparison.

Acceptance:

- a lower-power item can be visibly better for a boss or region;
- global Item Power remains useful for general play;
- no generic elemental damage affix without a concrete system target.
- item cards are shorter than the current multi-affix card, not longer.

### Phase 6: Region Diaries + Outpost Polish

Goal: add RuneScape-style regional goals without adding full side skills.

Implement:

- one small diary per region;
- outpost choice after boss clear;
- outpost state and selected bonus;
- diary reward claim flow.

Acceptance:

- diary goals ask the player to touch multiple existing systems;
- outposts give regional identity;
- no diary is required for mainline progression.

## 12. Testing Requirements

Core tests:

- default state contains empty mastery/region/boss prep structures;
- old save migration fills missing structures;
- normal expedition success chance unchanged before threat systems;
- success grants full mastery XP;
- failure grants partial mastery XP;
- mastery tier rewards are claimable once;
- regional materials are awarded by zone;
- collection pity forces a piece after threshold;
- boss missing critical threat caps max chance;
- temporary prep can cover missing critical threat;
- affix threat counter applies only to matching boss threat;
- generated new items have at most one explicit trait;
- family resonance activates at 2 and upgrades at 3 equipped items;
- only one active family resonance is used in MVP;
- tactical trait stats match allowed stat categories for its threat;
- first-session pacing to first boss and first town upgrade stays within current target.

Balance tests:

- no regional material blocks the first 5 minutes;
- Region 1 boss does not require a counter;
- Region 2 boss introduces prep but has a clear fallback;
- first reincarnation timing does not exceed target after added sinks.

## 13. Cut Lines

Do not build in the first implementation:

- generic elemental damage;
- enemy families on every normal expedition;
- full RPS loadout styles;
- side skills with independent XP curves;
- multi-affix item walls;
- 4-piece or 5-piece sets;
- multiple simultaneous family resonances;
- collection trading;
- social/clan loops;
- multiple boss phases;
- sockets/gems;
- hard boss entry keys that block attempts entirely;
- region materials in the global header.

Post-MVP candidates:

- build presets;
- outpost upgrades;
- fishing/logging/mining as richer job types;
- elite expeditions;
- permanent Codex bonuses;
- mastery focuses by class;
- seasonal/event contracts.
- full skill system if diaries/outposts prove players want more non-combat progression.

## 14. Success Criteria

The implementation is working if:

- Players repeat old expeditions voluntarily because mastery/material/collection progress is useful.
- Bosses feel different from normal expeditions.
- `+10% fire damage` is still unnecessary because "fire" has been expressed as a concrete regeneration/prep/Ember Forge answer.
- Items are easier to read than before: one trait plus optional family resonance.
- A failed hard attempt still produces visible progress.
- The UI can explain the next useful action in one sentence.
- The first-session loop remains quick.
- The system can ship in slices, with Phase 1 already improving the game before Phase 4 exists.

## 15. External Patterns Used In This Pass

- Mafia Wars / Vampire Wars / Mob Wars: job mastery, collections and properties/outposts.
- Torn: separate action resources, failure/intel progress and long-term account planning.
- RuneScape / OSRS: skills as long-term identity, region diaries, collection log and quests as unlock paths.
- AFK Arena: reduce experimentation friction if builds matter.

Useful sources:

- OSRS Achievement Diaries: https://oldschool.runescape.wiki/w/Achievement_Diary
- OSRS Skills: https://oldschool.runescape.wiki/w/Skills
- OSRS Collection Log: https://oldschool.runescape.wiki/w/Collection_log
- OSRS Quests: https://oldschool.runescape.wiki/w/Quests

## 16. What Is Still Missing For A True 3.0

This document is strong as the chosen system direction, but it is not yet a complete 3.0 product spec by itself.

Missing 3.0-level pieces:

1. **Unlock sequencing:** exactly when mastery, regional materials, collections, outposts, diaries, boss prep and families appear.
2. **Account Rank:** a top-level progress meter that rewards total account growth, not only current reincarnation.
3. **Reincarnation integration:** what resets, what persists, and what gets faster after each cycle.
4. **Content templates:** exact recipe for creating a new region, boss, family, diary and collection.
5. **Economy budget:** expected sources/sinks per hour for gold, base materials and regional materials.
6. **Build presets:** if families and boss counters matter, players need low-friction loadout swapping.
7. **Instrumentation:** what we measure to know if this design is working.
8. **First-session onboarding:** how the player learns the new systems without seeing a wall of mechanics.
9. **3.0 release scope:** which parts are required for 3.0 and which remain 3.1+.

The core system can become the backbone of a strong 3.0, but only if these pieces are specified before implementation expands.

## 17. 3.0 Release Spine

3.0 should have one clear product promise:

> Build a relic town, master regions, collect ancient sets, prepare for bosses, and reincarnate stronger.

The 3.0 release should not be "new combat formula." It should be "the game now has a real long-term progression spine."

### 17.1 First 5 Minutes

Player should experience:

- create hero;
- run first expedition;
- see mastery progress;
- get first item;
- understand Power remains useful;
- see next goal.

Systems visible:

- expedition result;
- mastery bar;
- basic loot;
- next goal.

Systems hidden:

- families;
- collections;
- outposts;
- boss prep;
- diaries.

### 17.2 First 15 Minutes

Player should experience:

- first region material;
- first Town/Forge spend using normal materials;
- first visible collection slot;
- first boss preview.

Systems visible:

- regional material reward row;
- collection `0/4` or `1/4`;
- boss card with simple "threat unknown" language.

### 17.3 First Hour

Player should experience:

- first boss clear;
- first outpost choice;
- first family resonance hint or item;
- first diary checklist;
- first reincarnation progress.

Systems visible:

- outpost choose-one panel;
- family resonance on Hero;
- region diary;
- boss prep/scout.

### 17.4 First Day

Player should experience:

- repeat old dungeon for mastery/collection with clear purpose;
- choose region based on material sink;
- use Vigor strategically;
- make one loadout/family decision.

Systems visible:

- region stockpile;
- mastery milestone claims;
- collection pity/progress;
- active family resonance.

### 17.5 First Week

Player should experience:

- multiple reincarnations or deeper first run;
- outpost network identity;
- account-wide rank gains;
- diary completion;
- boss mastery goals.

Systems visible:

- Account Rank;
- region completion overview;
- reincarnation "what persists" summary;
- long-term goals.

## 18. Account Rank

Add an account-wide progress layer inspired by RuneScape total level, Torn merits and achievement currencies.

Account Rank should be local-first and non-social.

Progress sources:

- hero levels reached;
- dungeon mastery tiers;
- boss first clears;
- region collections completed;
- outposts unlocked;
- diaries completed;
- reincarnations;
- legendary/signature items found;
- final boss clears.

Rules:

- Account Rank never resets.
- It should not directly replace Reincarnation/Soul Marks.
- It unlocks convenience and breadth, not huge raw power.

Rewards:

- inventory slots;
- one extra build preset;
- small offline cap increase;
- cosmetic titles;
- region overview filters;
- small global mastery XP bonus;
- unlock later systems such as richer side jobs.

MVP formula:

```ts
accountXp =
  masteryTiersClaimed * 20
  + bossFirstClears * 50
  + collectionsCompleted * 60
  + diariesCompleted * 80
  + outpostsUnlocked * 40
  + totalReincarnations * 100
  + finalBossClears * 200
```

Account Rank is important because it gives a reason to care about breadth. Without it, mastery/collections/outposts are useful but can feel fragmented.

## 19. Reincarnation Integration

The chosen hybrid must respect the existing reincarnation fantasy: rebirth should reset the hero run, not erase account identity.

Should reset:

- hero level/XP;
- temporary resources;
- current gear and inventory, unless future systems add a vault;
- temporary boss prep charges;
- current expedition/caravan;
- normal town building levels, if the current reincarnation model keeps this.

Should persist:

- dungeon mastery tiers, or at least claimed mastery milestones;
- region collections;
- outpost unlocks and selected type;
- account rank;
- diary completions;
- family codex discoveries;
- Soul Mark upgrades;
- achievement unlocks;
- lifetime stats.

Open tuning decision:

Mastery XP itself can either persist fully or compress into claimed tiers. For MVP, persist claimed tiers and current mastery XP to make repeat loops feel respected. If pacing breaks, only reset unclaimed progress on reincarnation.

Reincarnation should add a "new run stronger" relationship to the hybrid:

- outposts provide small early-route advantages;
- account rank unlocks convenience;
- Soul Marks improve speed/rewards/boss consistency;
- region collections improve repeat farming.

## 20. Build Presets Are Not Optional For 3.0

Build presets can be post-MVP for the first slice, but they should be required before calling this a full 3.0.

Reason:

- families encourage changing gear;
- boss counters encourage changing gear;
- regional economy traits encourage changing gear;
- without presets, the system creates friction instead of depth.

3.0 minimum:

- 2 presets by default;
- 1 extra preset from Account Rank;
- "Equip best Power" quick action;
- "Equip best for this boss/region" contextual suggestion;
- preserve locked items.

This keeps the system from becoming inventory management busywork.

## 21. Content Template

Every new region should be authored with the same template.

```ts
Region {
  id
  material
  collectionPieces[4]
  outpostChoices[4]
  family
  diaryTasks[4]
  dungeons[3]
  boss
}
```

Normal dungeon template:

```ts
Dungeon {
  power
  duration
  baseRewards
  regionMaterialReward
  masteryMilestones
  collectionDropTable
  optionalThreat?: ExpeditionThreatId
}
```

Boss template:

```ts
Boss {
  power
  duration
  rewards
  threats[1..3]
  criticalThreat?
  scoutCost
  prepOptions
  firstClearRewards
  masteryRewards
  outpostUnlock
}
```

Family template:

```ts
Family {
  id
  regionId
  rank1Bonus
  rank2Bonus
  allowedSlots
  traitThemes
}
```

Diary template:

```ts
Diary {
  clearTask
  masteryTask
  townOrForgeTask
  inventoryOrSalvageTask
  reward
}
```

This template matters because 3.0 will fail if every region is hand-designed differently.

## 22. Economy And Balance Guardrails

Regional materials must not become five new currencies that all feel the same.

Guardrails:

- Each region material must have 2-3 obvious sinks.
- A material should mostly be spent in its region/theme.
- Cross-region recipes should be rare and important.
- First-session progression must not require regional material.
- Region 1 material can teach the system but should not slow the first boss.
- Region materials should be shown in region/town views, not always in the top header.

Source/sink rule of thumb:

```txt
Normal run: small regional material gain.
Boss clear: meaningful regional material gain.
Town/Forge action: visible regional material sink.
Outpost/diary: long-tail regional material sink.
```

If a material has no current sink, do not add it yet.

## 23. Metrics And Playtest Questions

To know if this is actually better, track or manually evaluate:

Metrics:

- average sessions to first boss clear;
- average sessions to first outpost;
- percentage of players repeating a mastered/old dungeon voluntarily;
- number of times players switch equipment after seeing a boss/region recommendation;
- collection completion rate by region;
- Vigor spend distribution by mode;
- first reincarnation timing;
- inventory full/friction events;
- abandoned boss attempts after seeing missing threat warnings.

Playtest questions:

- "What is your next goal?"
- "Why did you choose this expedition?"
- "Did any lower-power item look worth keeping?"
- "Did a failure still feel useful?"
- "Did the outpost choice feel meaningful?"
- "Did the region material make you want to farm a specific region?"

This is the proof layer. Without it, "best 3.0" is a guess.

## 24. 3.0 Must-Haves vs Later

Required for 3.0:

- dungeon mastery;
- regional materials;
- region collections;
- outposts;
- boss prep/threats;
- one-trait item model;
- family resonance;
- build presets;
- account rank;
- first-pass region diaries;
- save migration;
- result UI showing progress;
- pacing tests.

Can wait until 3.1+:

- richer fishing/logging/mining skills;
- outpost upgrades beyond level 1;
- elite expeditions;
- multiple boss phases;
- family codex completion bonuses;
- seasonal contracts;
- cloud/social/guild systems;
- monetization.

If schedule gets tight, cut in this order:

1. Region diaries.
2. Outpost upgrades beyond unlock.
3. Collection completion cosmetics.
4. Regional economy traits.
5. Boss threat variety.

Do not cut:

- mastery progress;
- regional material identity;
- result progress feedback;
- one-trait item simplification;
- at least one non-RNG boss prep fallback.

## 25. Final Assessment

Implementing only Sections 1-15 would create a strong MVP 2.x system foundation.

Implementing Sections 1-24 coherently could be a real 3.0 backbone.

It will not automatically be "the best possible game" just because the systems are good. The quality will come from:

- tight unlock sequencing;
- clean UI;
- fast first-session pacing;
- meaningful but small permanent rewards;
- low inventory friction;
- content templates that make each region coherent;
- playtest validation.

The strongest version of 3.0 is therefore:

> Simple expedition start, rich repeat progress, regional identity, boss preparation, readable items, outpost ownership, account-wide rank, and reincarnation that makes every loop feel smarter.
