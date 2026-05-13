# Forge Idle Launch Candidate Content Tables

Source of truth: `docs/design/implementation_4_2_1.md`.

Alignment read: `src/game/content.ts` and `src/game/types.ts`.

Scope:

- Implementation-grade content data and numeric seed values. This file does not change source code by itself, but code should not invent different numbers without updating this file.
- Early Launch Candidate Phases 1-3, plus Phase 4 boss seed data.
- Active early regions are only Sunlit Marches and Emberwood.
- Dormant regions, materials and families may be reserved as IDs, but must not appear as early player-facing drops or costs.
- All numbers below are conservative seed values for authoring and balance iteration, not final economy tuning.
- No fake social, PvP, server dependency, or leaderboard assumptions.
- Item content assumes one explicit trait plus optional family. Legendary items mean one signature trait plus family, not a multi-affix wall.
- Family resonance is 2 items for rank 1 and 3+ items for rank 2. Only one active family resonance applies at a time.
- Focus starts at cap 200 and regenerates 1 per 15 minutes.
- Caravan is an offline commitment. While active, it blocks starting expeditions and has no Focus interaction.
- Rebirth resets the hero run, not persistent Town, Account Rank, trophies, collections, outposts, codex, or active construction.
- Construction timers apply only to persistent Town or Account buildings and start at level 1 with short early timers.

## 1. ID Conventions

Use lowercase kebab-case for new authored content IDs. Existing source IDs already use kebab-case for zones and dungeons, so keep those where possible.

If a TypeScript union later requires camelCase member names, map from these content IDs at the data boundary rather than changing player/content IDs.

| Content type | Convention | Active examples | Reserved dormant examples | Notes |
| --- | --- | --- | --- | --- |
| Region | `<region-name>` | `sunlit-marches`, `emberwood` | `azure-vaults`, `stormglass-peaks`, `first-forge` | Active region IDs match current `ZONES`. Dormant regions stay hidden in early UI. |
| Expedition | current dungeon IDs | `tollroad-of-trinkets`, `mossbright-cellar`, `relic-bandit-cache`, `lanternroot-path`, `saffron-sigil-grove`, `cinderleaf-crossing` | none for this file | Reuse current non-boss dungeon IDs for the six normal expeditions. |
| Boss route | current boss dungeon route IDs | `copper-crown-champion`, `emberwood-heart` | none for this file | These can remain route/dungeon IDs if boss entities become separate records. |
| Boss entity | memorable boss name | `bramblecrown`, `cindermaw` | later named bosses only | Boss entity ID is separate from route ID when useful. |
| Regional material | `<material-name>` | `sunlit-timber`, `ember-resin` | `archive-glyphs`, `stormglass-shards`, `oath-embers` | Do not use legacy `ore`, `crystal`, `rune`, or `relicFragment` as Launch Candidate regional material names. |
| Collection | `<region>-<set-theme>` | `sunlit-road-relics`, `emberwood-heartwood-relics` | future region sets | One 4-piece collection per active region. |
| Collection piece | `<source-or-theme>-<object>` | `sunlit-coin-charm`, `ever-burning-scale` | future pieces | Before collection completion, drops should award missing pieces first. |
| Trophy | `trophy-<story-object>` | `trophy-cindermaw-fang`, `trophy-sunlit-relic-set` | future trophies | Trophies should represent stories, not chores. |
| Title | `title-<player-identity>` | `title-cindermaw-breaker`, `title-sunlit-collector` | future titles | Account Showcase may auto-select the highest priority unlocked title. |
| Trait | concise trait phrase | `piercing`, `guarded`, `flame-sealed`, `antivenom`, `trailwise`, `ward-bound` | future traits | One explicit trait per item. Legendary means one signature trait plus family. |
| Family | `<family-name>` | `sunlit-charter`, `emberbound-kit` | `azure-ledger`, `stormglass-survey`, `first-forge-oath` | Only one active family resonance applies. Rank 1 at 2 items, rank 2 at 3+ items. |

### Implementation ID Map

Player/content IDs stay kebab-case. Current TypeScript state keys may stay camelCase until the codebase is fully content-driven. Use this table as the boundary map; do not compare display names or hand-convert strings in feature code.

| Authored id | Current TS state key | Type / field | Status |
| --- | --- | --- | --- |
| `sunlit-timber` | `sunlitTimber` | `RegionMaterialId` | Active |
| `ember-resin` | `emberResin` | `RegionMaterialId` | Active |
| `archive-glyphs` | `archiveGlyph` | `RegionMaterialId` | Dormant |
| `stormglass-shards` | `stormglassShard` | `RegionMaterialId` | Dormant |
| `oath-embers` | `oathEmber` | `RegionMaterialId` | Dormant |
| `sunlit-charter` | `sunlitCharter` | `ItemFamilyId` | Active seed |
| `emberbound-kit` | `emberboundKit` | `ItemFamilyId` | Active seed |
| `azure-ledger` | `azureLedger` | `ItemFamilyId` | Dormant |
| `stormglass-survey` | `stormglassSurvey` | `ItemFamilyId` | Dormant |
| `first-forge-oath` | `firstForgeOath` | `ItemFamilyId` | Dormant |

Implementation rule: authored content definitions may expose both `id` and `stateKey` while the save shape uses camelCase. UI copy should always show the player-facing name, not either ID.

## 2. Active Regions

| Region id | Region | Material id | Material name | Short identity/fantasy | Gameplay role | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `sunlit-marches` | Sunlit Marches | `sunlit-timber` | Sunlit Timber | Safe roads, friendly ruins, merchant paths, and early guild confidence. | Onboarding region. Feeds Tavern, Market, early mastery, first collection, and simple boss prep. | Active |
| `emberwood` | Emberwood | `ember-resin` | Ember Resin | Warm roots, living coals, sigils, and forge heat under old trees. | Second active region. Feeds Forge heat, regeneration answers, stronger collection chase, and Cindermaw prep. | Active |

## 3. Expeditions

Normal expeditions should stay adventurous rather than threat-heavy. Threat flavor can appear as future hints, but the primary loop is mastery, material progress, Account XP, and collection pity.

| Expedition id | Region | Display name | One-line fantasy | Unlock order | Rough power target | Rough duration | Primary reward identity | Mastery tier reward theme | Optional future threat flavor |
| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
| `tollroad-of-trinkets` | `sunlit-marches` | Tollroad of Trinkets | A merchant road glittering with misplaced relic bits and safe first wins. | 1 | 8-10 | 20-30 sec | Gold, first Account XP, first Sunlit Timber trickle, first collection eligibility. | Route mapping, starter timber bundle, first repeat value. | Misty side paths can imply `elusive`, but do not apply threats in normal early runs. |
| `mossbright-cellar` | `sunlit-marches` | Mossbright Cellar | Damp stairs, glowing jars, and creaking beams under a friendly inn. | 2 | 14-16 | 90 sec | Sunlit Timber, Fragments, cellar relic clue chance. | Safer repeat farming, collection pity, Tavern/Market support. | Blooming moss can imply `regenerating` later without making the expedition a boss puzzle. |
| `relic-bandit-cache` | `sunlit-marches` | Relic Bandit Cache | A hidden stash where theatrical locks guard useful early relics. | 3 | 24-28 | 4-5 min | Larger Sunlit Timber bundle, Fragments, Sunlit collection pressure. | Repeat-value route, early prep discount, Sunlit completion chase. | Bandit shields can imply `armored` as future boss foreshadowing. |
| `lanternroot-path` | `emberwood` | Lanternroot Path | A warm trail where glowing roots point both ways. | 4 | 55-60 | 3 min | Ember Resin, Account XP, Ember collection eligibility. | Region entry mastery, first Forge-oriented material flow. | Cinder winds can appear as flavor only. |
| `saffron-sigil-grove` | `emberwood` | Saffron Sigil Grove | Old stones pulse with sigils that insist they are decorative. | 5 | 70-75 | 3-4 min | Ember Resin, Fragments, sigil relic clues. | Repeat-value route, collection chance, anti-curse foreshadowing. | Sigils can imply `cursed` later without requiring counters. |
| `cinderleaf-crossing` | `emberwood` | Cinderleaf Crossing | A relic bridge over warm sparks and questionable engineering. | 6 | 90-95 | 4-5 min | Larger Ember Resin bundle, Ember collection pressure, boss prep lead-in. | Bridge mastery, Cindermaw preparation theme, completion identity. | Burning leaves can imply `regenerating` and `brutal` as Cindermaw setup. |

### 3.1 Expedition Progress Reward Seeds

These are permanent/meta rewards layered on top of the existing hero XP, gold, loot and legacy material rewards. They are the implementation source for Phase 1 result-panel progress.

Rules:

- Success grants the listed Mastery XP, Account XP and regional material.
- Failure grants the listed failure Mastery XP and Account XP after the timer completes. It does not grant collection pieces unless Collection Lite explicitly allows failure rolls.
- Focus reward boost does not multiply Mastery XP, Account XP, title progress, trophy progress, collection pity or boss intel. This prevents Focus from becoming mandatory permanent progression.
- Regional material rewards write to `regionProgress.materials` using the mapping in Section 1. They may be hidden in the UI until the region/material UI ships.
- Fragments are inactive until Phase 2 currency cleanup. Values below are Phase 2+ seed rewards and should not keep `ore/crystal/rune/relicFragment` alive as Launch Candidate regional materials.
- First-clear bonuses are account-level and never repeat.

| Route id | Phase | Success Mastery XP | Failure Mastery XP | Success Account XP | Failure Account XP | Regional material on success | Regional material on failure | Fragment seed Phase 2+ | First-clear / unlock side effect |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| `tollroad-of-trinkets` | 1 | 100 | 35 | 15 | 5 | `sunlit-timber` +1 | none | 0 | Starting this route unlocks `title-first-charter`; first success unlocks `trophy-first-clear-token`. |
| `mossbright-cellar` | 1 | 80 | 28 | 18 | 6 | `sunlit-timber` +2 | none | 2 | First success makes `sunlit-road-relics` visible if Collection Lite is enabled. |
| `relic-bandit-cache` | 1 | 75 | 26 | 22 | 8 | `sunlit-timber` +4 | `sunlit-timber` +1 | 5 | First success reveals Bramblecrown preview copy, but boss systems remain Phase 4. |
| `lanternroot-path` | 3 | 75 | 26 | 26 | 9 | `ember-resin` +2 | none | 2 | First success makes Emberwood regional progress visible. |
| `saffron-sigil-grove` | 3 | 70 | 25 | 30 | 10 | `ember-resin` +3 | none | 4 | First success makes `emberwood-heartwood-relics` visible if Collection Lite is enabled. |
| `cinderleaf-crossing` | 3 | 70 | 25 | 34 | 12 | `ember-resin` +5 | `ember-resin` +1 | 8 | First success reveals Cindermaw preview copy, but boss systems remain Phase 4. |
| `copper-crown-champion` | 4 | 80 | 35 | 30 | 12 | `sunlit-timber` +6 | `sunlit-timber` +2 | 12 | First clear adds Account XP +25, guaranteed missing Sunlit collection piece, unlocks `title-copper-crowned` and `trophy-copper-crown`. |
| `emberwood-heart` | 4 | 85 | 38 | 42 | 16 | `ember-resin` +8 | `ember-resin` +2 | 20 | First clear adds Account XP +40, guaranteed missing Emberwood collection piece, unlocks `title-cindermaw-breaker` and `trophy-cindermaw-fang`. |

Phase 1 expected first result target:

```txt
Victory
Hero XP: existing dungeon reward
Gold: existing dungeon reward
Route Mastery: +100   100/100 Mapped claimable
Account XP: +15       15/100
Sunlit Timber: +1     may be shown as regional progress or in the result detail
Next: Claim Mapped Route, then run Tollroad again.
```

If the UI does not auto-claim mastery tiers, the immediate bar state can show `100/100 Mapped claimable`; after claiming it should show `100/500 Known Route`.

## 4. Mastery Milestones

Use the locked mastery structure:

| Tier | XP | Label | Reward intent |
| ---: | ---: | --- | --- |
| 1 | 100 | Mapped | Small and early. Confirms repeating a route matters. |
| 2 | 500 | Known Route | Creates repeat value through a small local permanent bonus. |
| 3 | 1500 | Mastered | Feels like completion through title, trophy, recipe, prep, or outpost material hooks. |

Claiming rules:

- Mastery XP is tracked per route in `dungeonMastery[routeId].masteryXp`.
- Tiers are claimable once and stored in `claimedTiers`.
- Tiers must be claimed in ascending order. If a player jumps from 0 to 500 XP, Tier 1 is claimed first, then Tier 2.
- Claiming a tier grants the reward in the table below. Reaching the XP threshold alone does not grant the reward.
- Failed timed runs can make tiers claimable through failure Mastery XP.
- Result UI should show current XP against the next unclaimed threshold, not total completion percent only.

Seed rewards are intentionally small. Percent bonuses are local to the listed route or region unless explicitly stated.

| Expedition id | Tier 1 reward | Tier 2 reward | Tier 3 reward |
| --- | --- | --- | --- |
| `tollroad-of-trinkets` | Account XP +5, Sunlit Timber +2, update Showcase mastered-routes progress. | Account XP +10, Sunlit Timber +4, +1% Sunlit Timber from this route. | Account XP +20, Sunlit Timber +8, +2% mastery XP on this route, unlock `title-tollroad-mapper`. |
| `mossbright-cellar` | Account XP +5, Sunlit Timber +2, collection pity +1 visible progress. | Account XP +10, Sunlit Timber +4, +1% collection chance in Sunlit Marches. | Account XP +20, Sunlit Timber +8, Tavern upgrade cost hint, unlock `title-cellar-lantern`. |
| `relic-bandit-cache` | Account XP +6, Sunlit Timber +3, Fragments +5. | Account XP +12, Sunlit Timber +5, +1 Sunlit Timber on first clear of the day in this route. | Account XP +24, Sunlit Timber +10, -5% Sunlit boss prep material cost, unlock `trophy-bandit-cache-ledger`. |
| `lanternroot-path` | Account XP +7, Ember Resin +2, Emberwood route progress visible. | Account XP +12, Ember Resin +4, +1% Ember Resin from this route. | Account XP +24, Ember Resin +8, +2% mastery XP on this route, unlock `title-lanternroot-guide`. |
| `saffron-sigil-grove` | Account XP +7, Ember Resin +2, collection pity +1 visible progress. | Account XP +12, Ember Resin +5, +1% collection chance in Emberwood. | Account XP +24, Ember Resin +10, small scout effectiveness hint for Emberwood, unlock `title-sigil-reader`. |
| `cinderleaf-crossing` | Account XP +8, Ember Resin +3, Fragments +8. | Account XP +14, Ember Resin +6, +1 Ember Resin on first clear of the day in this route. | Account XP +28, Ember Resin +12, -5% Cindermaw prep material cost, unlock `trophy-cinderleaf-bridge-token`. |

## 5. Collections Lite

Collection Lite rules for both active regions:

- Four pieces per active region.
- Normal success can drop a missing piece.
- Boss first clear guarantees one missing piece from that region if any remain.
- Pity threshold: after 5 eligible dry collection rolls, the next eligible success awards a missing piece.
- Before completion, collection drops award missing pieces first.
- After completion, duplicate pieces become collection dust. Ten dust can buy one missing piece in future expanded collections.
- Completion rewards are small permanent account/region bonuses and never mandatory for main progression.

Numeric constants:

| Constant | Value | Notes |
| --- | ---: | --- |
| `normalSuccessCollectionChance` | 0.16 | Eligible normal route success. |
| `normalFailureCollectionChance` | 0.05 | Eligible normal route failure; only after Collection Lite is unlocked. |
| `bossSuccessCollectionChance` | 0.35 | Boss success after the first-clear guarantee has already been consumed. |
| `collectionPityThreshold` | 5 | After 5 eligible dry rolls, the next eligible success gives a missing piece. |
| `duplicateDustPerPiece` | 1 | Applies only after a collection is complete. |
| `dustCostForMissingPiece` | 10 | Future expanded-collection sink; include in data but hide until useful. |

Eligibility:

- `sunlit-road-relics` eligible routes: `tollroad-of-trinkets`, `mossbright-cellar`, `relic-bandit-cache`, `copper-crown-champion`.
- `emberwood-heartwood-relics` eligible routes: `lanternroot-path`, `saffron-sigil-grove`, `cinderleaf-crossing`, `emberwood-heart`.
- Before completion, collection rolls always choose from missing pieces.
- Collection completion rewards are applied once and should be reflected in Account Showcase progress.

| Collection id | Name | Region | Piece ids and names | Completion reward | Completion unlocks | Notes on fantasy |
| --- | --- | --- | --- | --- | --- | --- |
| `sunlit-road-relics` | Sunlit Road Relics | `sunlit-marches` | `sunlit-coin-charm` - Sunlit Coin Charm; `mossbright-jar-lantern` - Mossbright Jar Lantern; `bandit-map-scrap` - Bandit Map Scrap; `copper-crown-sigil` - Copper Crown Sigil | Account XP +25, +2% Sunlit Timber yield, +2% Sunlit mastery XP. | `trophy-sunlit-relic-set`, `title-sunlit-collector` | Relics from safe roads, cellars, and the first boss route. The set should feel like the player's first regional scrapbook. |
| `emberwood-heartwood-relics` | Emberwood Heartwood Relics | `emberwood` | `lanternroot-emberglass` - Lanternroot Emberglass; `saffron-sigil-stone` - Saffron Sigil Stone; `cinderleaf-bridge-nail` - Cinderleaf Bridge Nail; `ever-burning-scale` - Ever-Burning Scale | Account XP +30, +2% Ember Resin yield, +1% boss success chance in Emberwood. | `trophy-emberwood-relic-set`, `title-ember-curator` | Relics should feel warm, handmade, and tied to roots, sigils, and Cindermaw's living flame. |

## 6. Bosses

Bosses are Phase 4 seed data. They should be named, remembered, and useful even on failure.

### `bramblecrown`

| Field | Value |
| --- | --- |
| Boss id | `bramblecrown` |
| Existing boss route id | `copper-crown-champion` |
| Region | `sunlit-marches` |
| Name | Bramblecrown |
| Title | Copper Crown Champion |
| One-line fantasy | A boastful living hedge-knight wearing polished bark, road tolls, and a crown that is mostly copper. |
| Power target | 42 |
| Duration target | 8-9 min |
| Threats | `armored`, `brutal` |
| Critical threat | `armored` |
| Scout cost | 5 Focus |
| Prep cost | 10 Focus per prep charge, with optional Sunlit Timber prep orders starting at 2-3 Sunlit Timber |
| First clear rewards | Account XP +25, Sunlit Timber +6, Fragments +12, guaranteed missing Sunlit collection piece, unlock `title-copper-crowned`, unlock `trophy-copper-crown` |
| Failure intel text | "The champion's bark-plates turned aside your best strike. A Piercing trait or Bark-Hide prep would open the next attempt." |
| Trophy id/name | `trophy-copper-crown` - Copper Crown |
| Outpost unlock suggestion | Unlock Sunlit Outpost choice. Recommend Watchtower for the tutorial path because it reinforces scout/intel without increasing raw power. |

### `cindermaw`

| Field | Value |
| --- | --- |
| Boss id | `cindermaw` |
| Existing boss route id | `emberwood-heart` |
| Region | `emberwood` |
| Name | Cindermaw |
| Title | Ever-Burning Heart |
| One-line fantasy | A beast that seals its wounds with living flame. |
| Power target | 118 |
| Duration target | 5 min |
| Threats | `regenerating`, `venom`, `brutal` |
| Critical threat | `regenerating` |
| Scout cost | 8 Focus |
| Prep cost | 15 Focus per prep charge, with optional Ember Resin prep orders starting at 3-4 Ember Resin |
| First clear rewards | Account XP +40, Ember Resin +8, Fragments +20, guaranteed missing Emberwood collection piece, unlock `title-cindermaw-breaker`, unlock `trophy-cindermaw-fang` |
| Failure intel text | "Cindermaw sealed the wound with living flame. Bring Flame-Sealed gear, Emberbound prep, or enough intel to cap the fire before the next attempt." |
| Trophy id/name | `trophy-cindermaw-fang` - Cindermaw Fang |
| Outpost unlock suggestion | Unlock Emberwood Outpost choice. Recommend Watchtower for players missing threat coverage, or Supply Post for players farming Ember Resin. |

## 7. Boss Prep Answers

Trait answers use the Launch Candidate tactical trait set. Prep charges are temporary and cover one attempt. Equipped trait coverage should be stronger than temporary prep.

| Boss | Threat key | Player-facing threat name | Best trait answer | Family/prep/outpost alternative | Simple UI explanation text |
| --- | --- | --- | --- | --- | --- |
| Bramblecrown | `armored` | Bark-Hide | `piercing` | Bark-Hide prep charge, Sunlit Watchtower intel, or a mastery bonus from `relic-bandit-cache`. | "Bark-Hide reduces your max chance. Piercing gear gives full coverage; prep gives partial coverage for one attempt." |
| Bramblecrown | `brutal` | Marsh-Crusher | `guarded` | Guard stakes prep charge or Sunlit Training Yard bonus. | "Marsh-Crusher punishes fragile builds. Guarded gear or a guard prep charge softens the hit." |
| Cindermaw | `regenerating` | Ever-Burning | `flame-sealed` | Emberbound Kit rank 2 prep discount, Ever-Burning prep charge, or Emberwood Watchtower intel. | "Ever-Burning is critical. If uncovered, your maximum success chance is capped until you bring Flame-Sealed gear or prep." |
| Cindermaw | `venom` | Ember-Sting | `antivenom` | Ember Resin antidote prep charge or Emberwood Supply Post material support. | "Ember-Sting adds risk to failed attempts. Antivenom gear gives full coverage; an antidote prep charge covers one run." |
| Cindermaw | `brutal` | Inferno-Heart | `guarded` | Emberwood Training Yard bonus or heat-shield prep charge. | "Inferno-Heart favors sturdy builds. Guarded gear is best, but a prep charge can keep the attempt viable." |

Numeric threat rules for Phase 4:

| Rule | Value | Notes |
| --- | ---: | --- |
| Equipped matching trait coverage | 1.00 | Full answer to the threat. |
| Temporary prep charge coverage | 0.60 | Consumed on the next attempt for that boss. |
| Matching outpost support coverage | 0.25 | Persistent regional support; stacks up to the cap. |
| Matching mastery support coverage | 0.15 | From listed mastery rewards such as `relic-bandit-cache` prep discount/support. |
| Maximum effective coverage per threat | 1.00 | Clamp after summing all sources. |
| Critical threat uncovered success cap | 0.55 | Applied after the normal success formula. |
| Critical threat partially covered success cap | 0.75 | Applies when coverage is at least 0.50 but below 1.00. |
| Non-critical uncovered penalty | -0.08 | Additive percentage-point penalty per uncovered non-critical threat. |
| Non-critical partial penalty | -0.03 | Applies when coverage is at least 0.50 but below 1.00. |
| Boss failure intel | +1 | Failure grants intel even when no collection piece drops. |
| Scout intel | +2 | Scout costs Focus and reveals the critical threat first, then remaining threats. |

Boss prep charge rules:

- A prep charge is boss-specific and threat-specific.
- Starting a boss attempt consumes at most one charge per relevant threat.
- Prep is consumed on attempt start, not only on success.
- Prep charges do not persist through Rebirth if they are framed as temporary run prep. If later framed as outpost stock, they must be moved to persistent outpost state first.

### 7.1 Tactical Item Trait Seeds

These are the Launch Candidate tactical traits. In early implementation they can be represented as affix IDs, but the long-term content model should treat them as explicit item traits so an item has one clear tactical identity.

| Trait id | Player-facing name | Counters threat | Suggested slots | Stat bias | Non-boss side effect |
| --- | --- | --- | --- | --- | --- |
| `piercing` | Piercing | `armored` | weapon, relic | power, speed | +2% success chance on routes with armored foreshadowing. |
| `guarded` | Guarded | `brutal` | helm, armor, boots | defense, stamina | +3% failure reward scale. |
| `flame-sealed` | Flame-Sealed | `regenerating` | weapon, armor, relic | power, defense | +3% Ember Resin yield. |
| `antivenom` | Antivenom | `venom` | helm, armor, relic | defense, luck | Failed boss attempts cannot add venom penalty if covered. |
| `trailwise` | Trailwise | `elusive` | boots, relic | speed, luck | -3% expedition duration. |
| `ward-bound` | Ward-Bound | `cursed` | helm, armor, relic | luck, stamina | +3% collection chance on cursed-foreshadow routes. |

Trait drop rules:

- Common items usually have no tactical trait.
- Rare items have a 35% chance for one tactical trait once boss prep is unlocked.
- Epic items have a 70% chance for one tactical trait.
- Legendary items always have one signature tactical trait and may also belong to one family.
- A tactical trait should not stack twice on one item.

### 7.2 Family Resonance Seeds

Only one family resonance applies at a time. If multiple families qualify, use the manually selected family if that UI exists; otherwise choose the highest resonance, then newest active-region family, then first by authored order.

| Family id | Current TS key | Rank 1 at 2 items | Rank 2 at 3+ items | Intended role |
| --- | --- | --- | --- | --- |
| `sunlit-charter` | `sunlitCharter` | +2% Sunlit Mastery XP. | +4% Sunlit Timber yield and -1 Focus scout cost in Sunlit bosses, minimum scout cost 1. | First regional set, mapping and safe-route identity. |
| `emberbound-kit` | `emberboundKit` | +2% Ember Resin yield. | -10% Emberwood prep material cost and +0.25 partial coverage against `regenerating`. | Anti-Cindermaw identity without hard-locking the boss. |
| `azure-ledger` | `azureLedger` | Dormant. | Dormant. | Reserved for Azure Vaults. |
| `stormglass-survey` | `stormglassSurvey` | Dormant. | Dormant. | Reserved for Stormglass Peaks. |
| `first-forge-oath` | `firstForgeOath` | Dormant. | Dormant. | Reserved for First Forge. |

## 8. Regional Material Sinks

Do not use dormant materials in visible early costs. The examples below use only Sunlit Timber and Ember Resin.

### Sunlit Timber

| Sink type | Early examples | Notes |
| --- | --- | --- |
| Town building upgrades | Tavern level 1: 4 Sunlit Timber, 2 min construction. Market level 1: 4 Sunlit Timber, 2 min construction. Tavern level 2: 8 Sunlit Timber, 5 min construction. | Construction timers are only for persistent Town buildings and start short at level 1. |
| Boss prep | Bark-Hide brace: 2 Sunlit Timber plus Focus prep. Guard stakes: 3 Sunlit Timber plus Focus prep. | Material cost supports prep but Focus remains the clear tactical resource. |
| Collection, outpost, crafting | Sunlit Charter crafting order: 6 Sunlit Timber. Sunlit Relic Survey donation: 10 Sunlit Timber. Supply Post level 1 upgrade: 12 Sunlit Timber. | These are local identity sinks and should not block main expedition progression. |

### Ember Resin

| Sink type | Early examples | Notes |
| --- | --- | --- |
| Town building upgrades | Forge level 2: 6 Ember Resin, 5 min construction. Forge level 3: 12 Ember Resin, 15 min construction. Market heatproof stalls: 8 Ember Resin, 15 min construction. | Ember Resin should feel like the Forge and anti-regen material. |
| Boss prep | Ever-Burning sealant: 4 Ember Resin plus Focus prep. Ember-Sting antidote: 3 Ember Resin plus Focus prep. Heat-shield binding: 4 Ember Resin plus Focus prep. | Costs stay small because the Focus scout/prep costs already create pressure. |
| Collection, outpost, crafting | Emberbound Kit crafting order: 8 Ember Resin. Emberwood Relic Survey donation: 12 Ember Resin. Emberwood Supply Post level 1 upgrade: 14 Ember Resin. | Keep early Ember Resin sinks visible but not mandatory before Cindermaw. |

### 8.1 Early Construction Cost Seeds

These are Phase 5A implementation seeds but should be compatible with Phase 1-3 material income. They use only Gold, Sunlit Timber and Ember Resin. Construction timers start at level 1 because Town is persistent account identity.

| Building | Level 1 cost / time | Level 2 cost / time | Level 3 cost / time | Notes |
| --- | --- | --- | --- | --- |
| Forge | Gold 40, Sunlit Timber 2 / 2 min | Gold 120, Ember Resin 6 / 5 min | Gold 240, Ember Resin 12 / 15 min | Uses Sunlit once for tutorial access, then becomes the Ember Resin sink. |
| Mine | Gold 60, Sunlit Timber 3 / 2 min | Gold 120, Sunlit Timber 6 / 5 min | Gold 260, Sunlit Timber 10, Ember Resin 3 / 15 min | Supports material loop without requiring dormant materials. |
| Tavern | Gold 75, Sunlit Timber 4 / 2 min | Gold 140, Sunlit Timber 8 / 5 min | Gold 260, Sunlit Timber 12 / 15 min | Main early Sunlit Timber sink. |
| Library | Gold 110, Sunlit Timber 5 / 2 min | Gold 220, Sunlit Timber 8, Ember Resin 2 / 8 min | Gold 380, Ember Resin 8 / 20 min | Bridges early route guidance into boss/scout systems. |
| Market | Gold 75, Sunlit Timber 4 / 2 min | Gold 150, Sunlit Timber 8 / 5 min | Gold 280, Ember Resin 8 / 15 min | Keeps sell/gold decisions useful. |
| Shrine | Gold 250, Sunlit Timber 8, Ember Resin 4 / 10 min | Gold 500, Ember Resin 12 / 30 min | Gold 900, Ember Resin 20 / 60 min | Rebirth-facing; can remain previewed/locked until Rebirth is introduced. |

Construction acceleration:

- 1 Focus skips 4 minutes.
- 15 Focus skips 1 hour.
- Focus spent on construction is never refunded.
- If instant skip would cost more than 50% of current Focus cap, show the "uses most of your Focus" warning.
- Canceling construction refunds 80% of unspent materials and 0 Focus.

### 8.2 Outpost Seed Options

Outposts are Phase 5C+ but boss and collection content already references them. One outpost choice per region.

| Outpost id | Player-facing name | Level 1 effect | Level 2 effect | Level 3 effect | Best for |
| --- | --- | --- | --- | --- | --- |
| `watchtower` | Watchtower | Boss Scout grants +1 extra intel in this region. | +0.25 partial coverage against the region boss critical threat after scouting. | First failed boss attempt of the day grants +1 extra intel. | Boss learning and threat discovery. |
| `supply-post` | Supply Post | +5% regional material from successful routes. | +1 regional material on the first successful route of the day. | Boss prep material costs in this region -10%. | Farming and prep affordability. |
| `training-yard` | Training Yard | +0.25 partial coverage against `brutal` in this region. | +2% boss success chance in this region. | +5% Mastery XP in this region. | Durable builds and repeated boss attempts. |

## 9. Account Rank Rewards, Rank 1-10

Labels should sound like account growth, not huge power jumps.

Account XP is cumulative. Rank is derived from total Account XP; rewards are claimed once through `claimedRankRewards`.

| Rank | Cumulative Account XP required | XP to next rank | Focus cap after reward | Player-facing label | Short description |
| ---: | ---: | ---: | ---: | --- | --- |
| 1 | 0 | 100 | 200 | Guild Account Created | Account Showcase exists quietly. Gold and Focus are the only top-bar currencies. |
| 2 | 100 | 160 | 200 | Showcase Discovered | Show the one-time Account Showcase popup, unlock Daily Missions, and add +1 inventory row. |
| 3 | 260 | 260 | 200 | Weekly Board Upgraded | Unlock the advanced Weekly Quest reward table and the first visible title slot. Weekly Quest already existed from day 1. |
| 4 | 520 | 380 | 220 | Longer Return Window | Increase offline cap by 5% and raise Focus cap to 220. |
| 5 | 900 | 500 | 220 | Trophy Shelf II | Unlock the second trophy shelf slot and grant the first major account title choice. |
| 6 | 1400 | 650 | 220 | Pack Expansion | Add +1 inventory row for smoother salvage/sell decisions. |
| 7 | 2050 | 800 | 240 | Second Build Preset | Unlock build preset slot 2 and raise Focus cap to 240. |
| 8 | 2850 | 950 | 240 | Region Filters | Unlock Region Overview filters for mastery, collection, and material planning. |
| 9 | 3800 | 1100 | 240 | Trophy Shelf III | Increase offline cap by 5% and unlock the third trophy shelf slot. |
| 10 | 4900 | 1300 | 260 | Mastery Codex | Unlock Trait/Family Codex UI and raise Focus cap to 260. Discoveries before this rank were tracked silently. |

Implementation rules:

- Phase 1 must implement Rank 1-3 numerically even if Rank 4+ rewards are not surfaced yet.
- Rank 2 should be reachable in the first session through repeated Tollroad clears plus at least one claimed mastery milestone.
- Focus cap increases do not reduce current Focus if current Focus is above the old cap. Daily Focus still clamps to the current cap unless overflow is explicitly designed later.
- Account XP sources: expedition progress rewards, mastery tier claims, boss first clears, collection completions, diary completions, outpost unlocks, true Rebirth (+100), final boss clears and legendary trait discoveries.
- Weekly Quests and Daily Missions can grant Account XP, but never Soul Marks or Soul Mark shards.

## 10. Titles And Trophies

Showcase priority uses `1` as highest auto-feature priority.

Implementation state:

```ts
type TitleState = {
  unlockedAt: number | null;
  progress: number;
  target: number;
};
```

`AccountShowcaseState.selectedTitleId` is only the selected title. Owned/unlocked titles need their own `titles: Record<string, TitleState>` state or an equivalent achievement-backed unlock table. Trophies can use the existing `trophies: Record<string, TrophyState>` shape.

Auto-showcase rule: if `accountSignatureMode` is `auto`, feature the unlocked title with the lowest priority number. Manual selection overrides auto selection.

### Starter Titles

| id | Name | Unlock condition | Target | Showcase priority | Phase |
| --- | --- | --- | ---: | ---: | --- |
| `title-first-charter` | First Charter | Start the first expedition. | 1 | 8 | Phase 1 |
| `title-known-route` | Known Route | Claim any Tier 2 mastery milestone. | 1 | 7 | Phase 1 |
| `title-tollroad-mapper` | Tollroad Mapper | Claim Tier 3 mastery for `tollroad-of-trinkets`. | 1 | 6 | Phase 1 |
| `title-cellar-lantern` | Cellar Lantern | Claim Tier 3 mastery for `mossbright-cellar`. | 1 | 6 | Phase 1 |
| `title-lanternroot-guide` | Lanternroot Guide | Claim Tier 3 mastery for `lanternroot-path`. | 1 | 5 | Phase 3 |
| `title-sigil-reader` | Sigil Reader | Claim Tier 3 mastery for `saffron-sigil-grove`. | 1 | 5 | Phase 3 |
| `title-steady-regular` | Steady Regular | Claim the first Weekly Quest. | 1 | 7 | Phase 2 |
| `title-sunlit-collector` | Sunlit Collector | Complete `sunlit-road-relics`. | 1 | 4 | Phase 3 |
| `title-ember-curator` | Ember Curator | Complete `emberwood-heartwood-relics`. | 1 | 4 | Phase 3 |
| `title-copper-crowned` | Copper-Crowned | Defeat Bramblecrown. | 1 | 3 | Phase 4 |
| `title-cindermaw-breaker` | Cindermaw Breaker | Defeat Cindermaw. | 1 | 1 | Phase 4 |

### Starter Trophies

| id | Name | Unlock condition | Target | Showcase priority | Phase |
| --- | --- | --- | ---: | ---: | --- |
| `trophy-first-clear-token` | First Clear Token | Win the first expedition. | 1 | 8 | Phase 1 |
| `trophy-mapped-route-medal` | Mapped Route Medal | Claim any Tier 1 mastery milestone. | 1 | 7 | Phase 1 |
| `trophy-bandit-cache-ledger` | Bandit Cache Ledger | Claim Tier 3 mastery for `relic-bandit-cache`. | 1 | 5 | Phase 1 |
| `trophy-cinderleaf-bridge-token` | Cinderleaf Bridge Token | Claim Tier 3 mastery for `cinderleaf-crossing`. | 1 | 5 | Phase 3 |
| `trophy-weekly-recap-ribbon` | Weekly Recap Ribbon | Claim the first Weekly Quest reward. | 1 | 6 | Phase 2 |
| `trophy-sunlit-relic-set` | Sunlit Relic Set | Complete `sunlit-road-relics`. | 1 | 3 | Phase 3 |
| `trophy-emberwood-relic-set` | Emberwood Relic Set | Complete `emberwood-heartwood-relics`. | 1 | 3 | Phase 3 |
| `trophy-boss-intel-scroll` | Boss Intel Scroll | Gain boss intel from a failed boss attempt. | 1 | 5 | Phase 4 |
| `trophy-copper-crown` | Copper Crown | Defeat Bramblecrown. | 1 | 2 | Phase 4 |
| `trophy-cindermaw-fang` | Cindermaw Fang | Defeat Cindermaw. | 1 | 1 | Phase 4 |

## 11. Daily And Weekly Mission Templates

Daily systems should feel like bonuses, not punishments. There is no visible streak counter in MVP.

Focus assumptions:

- Focus cap starts at 200.
- Focus regenerates 1 every 15 minutes.
- Daily Focus rewards add Focus up to the current cap unless later overflow behavior is explicitly designed.

### Daily Focus Charge Text

```txt
Daily Focus
Charges: {charges}/3
Complete 3 expeditions to claim +10 Focus.
Progress: {completed}/3
```

Rules:

- Available from day 1.
- Each day adds 1 Daily Focus Charge, up to 3.
- Completing 3 expeditions consumes 1 charge and grants +10 Focus.
- Banked charges let returning players catch up through play.
- Do not show broken-streak, missed-day, or shame copy.
- Use the player's local browser calendar day for `dailyFocus.date`.
- A new day adds 1 charge, capped at 3. It does not reset in-progress charge progress unless all banked charges are consumed.
- If Focus is already at cap, claiming Daily Focus consumes the charge and clamps at cap; do not create overflow until a future overflow rule exists.

### Daily Missions, Account Rank 2+

Offer three missions per day: one easy, one medium, one hard. Filter out locked systems.

| Template id | Difficulty | Text | Target | Reward seed | Availability |
| --- | --- | --- | ---: | --- | --- |
| `daily-win-2-expeditions` | Easy | Win 2 expeditions. | 2 | Account XP +5, active regional material +1 | Rank 2 |
| `daily-salvage-3-items` | Easy | Salvage 3 items. | 3 | Account XP +5, Fragments +6 | Rank 2, only if salvage is unlocked |
| `daily-equip-new-item` | Easy | Equip a new item. | 1 | Account XP +5 | Rank 2, only if inventory has eligible items |
| `daily-gain-200-mastery-xp` | Medium | Gain 200 Mastery XP. | 200 | Account XP +8, active regional material +2 | Rank 2 |
| `daily-win-4-one-region` | Medium | Win 4 expeditions in one active region. | 4 | Account XP +8, chosen region material +3 | Rank 2 |
| `daily-claim-mastery-milestone` | Medium | Claim a mastery milestone. | 1 | Account XP +10, active regional material +2 | Only if a reasonable milestone is available |
| `daily-collection-eligible-runs` | Hard | Make 5 collection-eligible runs. | 5 | Account XP +12, collection pity progress +1 | Phase 3+ |
| `daily-advance-collection-pity` | Hard | Advance collection pity 3 times. | 3 | Account XP +12, collection dust +1 if collection is complete | Phase 3+ |
| `daily-attempt-any-boss` | Hard | Attempt any boss. | 1 | Account XP +12, boss intel +1 | Phase 4+, only after boss access |
| `daily-complete-caravan` | Hard | Complete a Caravan. | 1 | Account XP +12, active regional material +3 | Only after Caravan exists; active Caravan blocks expedition starts |

Do not use pure RNG objectives such as "Gain a collection piece." Use eligible runs, pity progress, boss attempts, wins, salvage, mastery, or claim actions.

Daily Mission selection rules:

- At Rank 2, roll exactly 3 missions: 1 Easy, 1 Medium, 1 Hard.
- If no valid Hard mission exists because systems are locked, use a second Medium mission.
- Filter out objectives for locked systems and objectives with no reasonable available target.
- `active regional material` means the highest unlocked active region material, unless the mission is explicitly tied to a selected region.
- Banking does not apply to Daily Missions; only Daily Focus Charges bank.
- Daily Mission rewards grant Account XP and listed materials, not Focus unless explicitly listed later.

### Weekly Quest, Day 1+

The weekly quest exists from the first session and must be completable in one or two larger play sessions.

| Quest id | Player-facing text | Steps | Reward seed | Availability |
| --- | --- | --- | --- | --- |
| `weekly-onboarding-charter` | Complete your first weekly charter. | Clear 12 expeditions; claim 1 mastery milestone; make 5 collection-eligible runs if collections are unlocked, otherwise clear 3 additional expeditions. | Account XP +25, active regional material bundle +10, unlock `title-steady-regular`. | Day 1, before bosses unlock |
| `weekly-route-and-boss` | Clear routes, claim mastery, and test a boss. | Clear 10 expeditions; claim 2 mastery milestones; attempt 1 boss. | Account XP +35, active regional material bundle +12, unlock `trophy-weekly-recap-ribbon` if this is the first weekly reward. | Phase 4+, once boss attempts are unlocked |
| `weekly-region-focus` | Focus a region for the week. | Win 8 expeditions in one active region; gain 500 mastery XP there; advance that region collection pity 3 times. | Account XP +30, selected regional material +12, collection dust +1 if completed. | Rank 3 advanced table, Phase 3+ |

Weekly rules:

- No Soul Marks or Soul Mark shards.
- No fake social or leaderboard progress.
- No daily-login requirement.
- Before bosses unlock, replace the boss task with `complete 12 expeditions` or `claim 1 mastery milestone`.
- Caravan objectives are not part of early weekly requirements. If added later, they must respect Caravan as an offline commitment that blocks starting expeditions while active and has no Focus interaction.
- Weekly window starts Monday at 04:00 local browser time. This avoids midnight edge cases and keeps the system local-first.
- Weekly Quest progress persists until the next weekly window. Unclaimed rewards do not roll over.
- If collections are not unlocked, `weekly-onboarding-charter` uses `clear 15 expeditions; claim 1 mastery milestone` as its exact fallback.

## 12. Phase 1 Implementation Constants

Phase 1 should be able to ship from the following data without reading later sections:

```ts
const MASTERY_TIERS = [
  { tier: 1, xp: 100, label: "Mapped" },
  { tier: 2, xp: 500, label: "Known Route" },
  { tier: 3, xp: 1500, label: "Mastered" }
];

const ACCOUNT_RANK_THRESHOLDS = [
  { rank: 1, xp: 0 },
  { rank: 2, xp: 100 },
  { rank: 3, xp: 260 },
  { rank: 4, xp: 520 },
  { rank: 5, xp: 900 },
  { rank: 6, xp: 1400 },
  { rank: 7, xp: 2050 },
  { rank: 8, xp: 2850 },
  { rank: 9, xp: 3800 },
  { rank: 10, xp: 4900 }
];
```

Phase 1 required authored records:

| Record type | Required ids |
| --- | --- |
| Expedition progress rewards | `tollroad-of-trinkets`, `mossbright-cellar`, `relic-bandit-cache` |
| Mastery tier rewards | The three Sunlit normal routes from Section 4. |
| Account rank rewards | Ranks 1, 2 and 3 from Section 9. |
| Titles | `title-first-charter`, `title-known-route`, `title-tollroad-mapper`, `title-cellar-lantern` |
| Trophies | `trophy-first-clear-token`, `trophy-mapped-route-medal`, `trophy-bandit-cache-ledger` |

Phase 1 code acceptance from this data:

- First Tollroad success grants exactly +100 Mastery XP and +15 Account XP.
- First Tollroad success makes Mastery Tier 1 claimable, but does not auto-claim it.
- Claiming any Tier 1 mastery unlocks `trophy-mapped-route-medal`.
- Starting the first expedition unlocks `title-first-charter`.
- Account Rank 2 is reached at 100 cumulative Account XP and triggers the one-time Account Showcase discovery flag.
- Focus boost does not multiply Account XP or Mastery XP.
- Result panel can show Hero XP, Account XP and Route Mastery from one resolved expedition summary.
