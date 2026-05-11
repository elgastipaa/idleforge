# Version 2.0 Proposal

## 1. Research Summary

Online references reviewed:

- [Gladiatus / Gameforge](https://gameforge.com/en-GB/games/gladiatus.html): short browser sessions, automated expeditions, arena PvP, gear/crafting, dungeons, guilds, rankings.
- [Shakes & Fidget / Steam](https://store.steampowered.com/app/438040/): quests, dungeons, PvE/PvP, guilds, equipment collection, comic identity, regular free updates.
- [Travian: Legends support](https://support.travian.com/en/support/solutions/articles/7000091805-what-is-travian-legends-): village economy, long timers, alliances, round-based worlds, beginner protection, strategic resource planning.
- [Melvor Idle wiki](https://wiki.melvoridle.com/w/Skills): deep combat/non-combat skills, long mastery goals, bank slots, pets as permanent bonuses, skill milestones.
- [Legends of IdleOn](https://www.legendsofidleon.com/) and [IdleOn wiki](https://idleon.wiki/wiki/Skills): account-wide progression, town systems, specialized classes, passive production, many long-tail unlocks.
- [Torn wiki](https://wiki.torn.com/wiki/Nerve): regenerating action resources, crimes/education/factions, merits from achievements, very long timers.
- [MU Online Webzen guide](https://muonline.webzen.com/en/gameinfo/guide/detail/339): high-tier gear crafting, upgrade risk, rare materials, long gear ladders, timed events.
- [Hero Wars: Dominion Era support](https://support-hwde.nexters.com/hc/en-us/articles/6232513654802-Quests): daily/weekly quests, one-time quests, guild quests, reward claiming, and reset pressure.
- [RAID: Shadow Legends support](https://raid-support.plarium.com/hc/en-us/articles/360014657140-Basic-Guide-Gear-Overview): gear ranks/rarities/sets, campaign and dungeon farming, clan bosses, daily activity loops.
- [FTC dark patterns report](https://www.ftc.gov/reports/bringing-dark-patterns-light), [Apple App Store guidelines](https://developer.apple.com/app-store/review/guidelines/), and [Google Play policy](https://support.google.com/googleplay/android-developer/answer/16528695): avoid manipulative UX; disclose randomized paid rewards if ever used; prefer transparent pricing.

Patterns found:

- Retention loops: daily contracts, weekly goals, timed bosses, clan/activity check-ins, long missions, achievement currencies, soft streaks, reset windows, and visible milestone ladders.
- Progression systems: gear score, item rarity, upgrade levels, permanent account upgrades, building levels, skill/mastery tracks, pets/companions as passive bonuses, and region/boss gates.
- Timers: expedition timers, energy/nerve regeneration, long education/building timers, boss key refreshes, offline progress windows, and server/world resets.
- Economy: multiple currencies work when each has a clear source and sink; uncontrolled premium currencies, upgrade gambling, and too many token types create confusion.
- Combat: most references use automatic/stat-driven combat; depth comes from preparation, gear, build choices, and target selection rather than manual inputs.
- Inventory/equipment: strong games make inventory management meaningful but not punishing; best patterns include filtering, locking, upgrade comparison, target farming, and clear rarity/rank ladders.
- Town/forge/buildings: buildings work well as permanent, understandable multipliers and sinks, but become fragile if formulas and labels drift.
- Companions/pets: permanent passive bonuses are a good fit; paid random companion systems are high risk and should be avoided.
- PvE: region progression, bosses, dungeon mastery, daily/weekly contracts, and events fit the current game best.
- PvP optional: async arena/rank snapshots can fit later; live PvP, raids, and guild wars need backend and anti-cheat first.
- Social/guilds optional: lightweight guild goals and shared boss damage are useful later, but only after server-side validation exists.
- Monetization ethics: safest future options are cosmetics, optional convenience, extra loadout/inventory slots, and transparent non-predatory passes; avoid aggressive FOMO, hard pay-to-win, paid gacha, and hidden odds.
- Feature creep risk: the biggest danger is copying MMO breadth before the MVP has a stable loop, modular UI, centralized economy, and migration-safe saves.

## 2. What Fits This Game

This game already has the right base for a browser idle RPG: one hero, timed expeditions, deterministic rewards, loot, forge, town, contracts, vigor, offline progress, achievements, and reincarnation. The best-fitting patterns are therefore extensions of those systems, not new genres.

Good fits:

- More PvE depth through dungeon mastery, boss milestones, and long contracts.
- Daily/weekly retention that rewards play without punishing absence.
- Forge goals that help players target slots or upgrade plans without removing randomness entirely.
- Town specialization as a long-term sink using current buildings.
- Companion-style permanent bonuses earned from achievements, bosses, or long quests.
- Optional async PvP only as a later comparison/ranking mode, not a core blocker.
- Ethical monetization as cosmetics/convenience after the game has earned trust.

## 3. What Does Not Fit

Avoid for now:

- Full MMO/guild war systems before backend, accounts, authoritative timers, and anti-cheat exist.
- Multi-character account simulation like IdleOn; it would fight the current single-hero design.
- Travian-style server rounds and destructive PvP; the current loop is personal long-term progression.
- Paid gacha, paid companion pulls, lootbox-heavy monetization, or hidden odds.
- Hard FOMO streaks, expiring purchases, or daily punishment for not logging in.
- Large skill matrices, dozens of currencies, or gear systems with many nested upgrade layers.
- Destructive upgrade failure like classic MU-style crafting unless used only in an optional endgame mode with strong player consent.
- Real-time combat, canvas/3D battle scenes, or live multiplayer while MVP architecture remains local-first.

## 4. Recommended Version Path

### MVP Stabilization

- Finish the current Active Task in `docs/06_TASKS.md` before adding new gameplay.
- Keep gameplay local-first and deterministic.
- Split `src/app/page.tsx` into UI slices without moving formulas into UI.
- Improve offline summary visibility.
- Add an achievements panel using existing state.
- Expand tests around save/import, forge, contracts, vigor, reincarnation, and economy formulas.
- Centralize recurring balance constants before adding more systems.

### Version 1.5

- Add dungeon mastery per existing dungeon.
- Add expedition contracts using current contracts/expedition data.
- Add simple forge orders for slot-focused crafting goals.
- Improve inventory UX: lock item, filter by slot/rarity, clearer compare.
- Add non-monetized companion prototypes earned from achievements or bosses.
- Add weekly goals with generous completion windows.
- Add simple event modifiers as content data, not a new scheduler service.

### Version 2.0

- Add account/server layer only if cloud save, social, PvP, or monetization are real goals.
- Add guild-lite cooperative PvE goals.
- Add async arena snapshots with strict server-side resolution.
- Add larger town specialization branches.
- Add event seasons with clear end dates and non-punitive catch-up.
- Add ethical monetization after data validation, economy tests, and player-facing transparency exist.

## 5. Proposed 2.0 Systems

### Expedition Contracts

Purpose:
Give players medium-term goals that sit between contracts and reincarnation.

Player Value:
Players always have a clear next target beyond repeating the highest unlocked dungeon.

Core Loop Impact:
Expedition choices become more deliberate: run a boss, farm a region, salvage a slot, or spend vigor on a contract.

Implementation Complexity:
Medium.

Risk:
Can become a chores list if too many contracts stack.

Dependencies:
Existing expeditions, contracts, achievements, reward summary, and inventory actions.

MVP-safe version:
Add 3 weekly contracts generated from existing actions, with simple rewards and no new currency.

Do Not Implement Yet:
Paid contract rerolls, faction contracts, event-exclusive contracts, or multiplayer contribution contracts.

### Dungeon Mastery

Purpose:
Make old dungeons remain useful after first clear.

Player Value:
Players can farm favorite dungeons for mastery rewards, small drop bonuses, or boss badges.

Core Loop Impact:
Adds meaningful repeat goals without adding new maps immediately.

Implementation Complexity:
Medium.

Risk:
If rewards are too strong, optimal play collapses into farming one short dungeon.

Dependencies:
Dungeon clear counts, reward formulas, achievements, balance tests.

MVP-safe version:
Track mastery tiers at 1/5/15 clears per dungeon and award small one-time resources or titles.

Do Not Implement Yet:
Leaderboard races, randomized dungeon affixes, dungeon-specific gear sets, or hard-mode branches.

### Forge Orders

Purpose:
Turn forge usage into planned goals instead of only random crafting.

Player Value:
Players can pursue a slot or upgrade path when inventory RNG stalls progression.

Core Loop Impact:
Adds a resource sink and a reason to farm specific materials.

Implementation Complexity:
Medium.

Risk:
Too much targeting removes loot excitement; too little targeting feels useless.

Dependencies:
Existing forge, item slots, materials, inventory cap, item score comparison.

MVP-safe version:
Add a rotating order such as "craft any helm" or "upgrade a rare item twice" for bonus materials.

Do Not Implement Yet:
Set crafting, rerollable affixes, paid crafting guarantees, or destructive upgrade failure.

### Town Specialization

Purpose:
Make buildings feel like strategic identity, not only linear multipliers.

Player Value:
Players choose a town direction: faster timers, richer loot, stronger bosses, better forge, or safer economy.

Core Loop Impact:
Creates long-term planning and makes reincarnation choices more interesting.

Implementation Complexity:
High.

Risk:
Branching building effects can create balance drift and confusing labels.

Dependencies:
Centralized balance tables, building tests, clear UI labels, save migration plan.

MVP-safe version:
At building level 6 and 12, choose one passive from two options; allow free respec during testing.

Do Not Implement Yet:
Large building trees, construction queues, worker assignment, PvP town attacks, or resource theft.

### Companions

Purpose:
Add collectible long-term rewards with small permanent bonuses.

Player Value:
Players gain visible trophies from bosses, achievements, and long missions.

Core Loop Impact:
Adds collection goals and small build expression without changing the one-hero core.

Implementation Complexity:
Medium.

Risk:
If companion bonuses stack too hard, balance becomes opaque; if monetized randomly, trust risk is high.

Dependencies:
Achievements, boss clears, permanent bonus calculation, save schema.

MVP-safe version:
Add 3 companions earned from existing milestones, each with one small passive bonus.

Do Not Implement Yet:
Paid companion pulls, rarity gacha, companion fusion, companion combat, or limited-time exclusive power.

### Soft Streaks And Weekly Goals

Purpose:
Improve retention without punishing players who miss a day.

Player Value:
Players get gentle structure and catch-up, not anxiety.

Core Loop Impact:
Contracts become part of a broader weekly rhythm.

Implementation Complexity:
Low.

Risk:
Streaks can become manipulative if rewards compound too strongly.

Dependencies:
Contracts, reset logic, local time/UTC rules, reward economy.

MVP-safe version:
Track weekly completion points; let players earn the weekly chest through any 4 of 7 days.

Do Not Implement Yet:
Loss streak penalties, paid streak freezes, or exclusive streak-only power.

### Async Arena

Purpose:
Offer optional PvP-flavored comparison without real-time combat.

Player Value:
Competitive players can test builds against snapshots.

Core Loop Impact:
Gives gear and town optimization another outlet.

Implementation Complexity:
High.

Risk:
Requires backend validation; local-only PvP is easy to cheat and can distort balance priorities.

Dependencies:
Accounts, server save validation, deterministic combat resolver, anti-cheat, matchmaking/ranking rules.

MVP-safe version:
No runtime PvP. Document arena formulas and maybe add local "training dummy" simulations only.

Do Not Implement Yet:
Live PvP, guild wars, paid arena refreshes, ranked rewards with exclusive power, or chat.

### Guild-Lite PvE

Purpose:
Add social retention through cooperative goals, not direct conflict.

Player Value:
Players contribute to a shared boss or weekly target at their own pace.

Core Loop Impact:
Encourages regular play and makes bosses meaningful after first clear.

Implementation Complexity:
High.

Risk:
Needs backend, abuse prevention, moderation, and careful reward caps.

Dependencies:
Accounts, server-authoritative saves, guild membership, event logs, cooperative boss data.

MVP-safe version:
No guild runtime. Prepare event log structures only when backend work begins.

Do Not Implement Yet:
Guild chat, guild wars, donations that become mandatory, raid scheduling pressure, or public shaming of low contributors.

## 6. Retention Design

Recommended retention improvements:

- Daily goals: keep 3 contracts, make tasks easy to understand, and avoid requiring every subsystem every day.
- Long missions: add weekly contracts and reincarnation milestones that can be progressed over multiple sessions.
- Offline rewards: show a fuller offline summary for expedition, mine, vigor, contracts, and inventory overflow.
- Soft streaks: reward weekly participation through flexible points, not strict consecutive logins.
- Timed chests: use earned timer chests from bosses or weekly goals; never make them expire aggressively.
- Simple events: use short event modifiers like "Forge Week: +10% ore from bosses" with clear start/end dates.
- Visual progression: add region badges, boss trophies, companion unlocks, and town milestone markers.
- Level unlocks: reveal systems gradually around current hero level, region clears, and reincarnation count.
- Timers with decisions: give players tradeoffs such as short farm, medium boss, long contract, or vigor-boosted run.

Avoid:

- Excessive pressure.
- Aggressive FOMO.
- Strong punishments for not logging in.
- Too many overlapping checklists.
- Time-limited power that cannot be earned later.

## 7. Economy and Balance Direction

Keep the economy readable:

- Gold: broad sink for town, forge, item upgrades, and future convenience actions.
- Ore/crystal/rune/relic fragments: material ladder for crafting and upgrades.
- Soul Marks: permanent progression currency, earned through reincarnation only.
- Contract tokens, if added: earn only from weekly goals; spend on deterministic utility, not power lottery.
- Premium currency, if ever added: optional, transparent, non-expiring, earnable in small amounts, and not required for core progression.

Sources:

- Expeditions, contracts, Caravan jobs, salvage/sell, weekly contracts, boss milestones, reincarnation.

Sinks:

- Forge crafting, item upgrades, town upgrades, future inventory/loadout convenience, companion unlock quests, contract shop.

Cost direction:

- Keep exponential costs for long-term sinks.
- Add caps and diminishing returns before adding new currencies.
- Prefer one-time milestone rewards over repeatable high-yield loops.
- Add formula tests before changing timers, rewards, or cost curves.

Do not change real constants yet.

## 8. Monetization Direction

Future monetization should be ethical and optional:

- Cosmetics: hero portrait frames, town skins, expedition banners, companion skins.
- Convenience: extra inventory tabs, saved equipment loadouts, export/import quality-of-life, more stat comparison views.
- Slots: extra forge order slot or contract preview slot, only after base slots are generous.
- Speedups: limited and capped; avoid selling unlimited timer skips because timers are core gameplay.
- Battle pass: only if it is simple, transparent, has catch-up, and avoids exclusive power.
- Ads: avoid unless the product explicitly wants them; rewarded ads can distort pacing.
- Premium currency: use only with clear pricing and no expiration.

Do not use:

- Hard pay-to-win.
- Paid lootboxes or companion gacha.
- Hidden odds.
- Aggressive popups.
- Dark patterns, confusing bundles, or currencies priced to force waste.
- Purchases that create pressure to log in at exact times.

## 9. Technical Architecture Impact

Prepare technically before 2.0:

- Modules:
  - `dailies.ts` for Contracts, weekly chest progress, and long goals.
  - `mastery.ts` for dungeon mastery.
  - `companions.ts` for permanent passive bonuses.
  - `events.ts` only after event rules are data-driven.
- Separation:
  - Keep formulas in `src/game`.
  - Keep UI rendering in components.
  - Keep store actions thin.
- Database/backend:
  - Needed for cloud save, guilds, arena, monetization, and authoritative timers.
  - Keep local-first MVP until those goals are explicitly chosen.
- Jobs/timers:
  - Server-side jobs only for guild/event/PvP systems.
  - Client-only timers remain acceptable for local MVP.
- Validation:
  - Server-side validation required for PvP, social contribution, premium purchases, and leaderboards.
- Economy:
  - Centralize currency sources/sinks before adding contract tokens or premium currency.
- Event logs:
  - Add event/action logs if backend exists, especially for economy audits and cheat review.
- Tests:
  - Formula tests for rewards, costs, mastery, contracts, and companion bonuses.
  - Save migration tests before schema changes.
- Migrations:
  - Add explicit save migrators before changing `GameState` shape for 1.5/2.0 systems.

Do not implement these architecture changes until they are tied to an approved task.

## 10. Recommended Next 10 Tasks

1. Complete the current UI-slice Active Task from `docs/06_TASKS.md`.
2. Add an achievements panel using existing achievement state.
3. Render a detailed offline summary from existing `lastOfflineSummary`.
4. Expand tests for save/import validation and migration readiness.
5. Centralize building and reward formula labels to reduce future drift.
6. Add inventory lock/filter/compare UX without changing item generation.
7. Prototype dungeon mastery as documentation plus tests before code.
8. Prototype weekly contracts using only existing actions and currencies.
9. Write a backend decision document covering cloud save, PvP, guilds, monetization, and server authority before any 2.0 implementation.
10. Define monetization gates and ethical limits before adding any premium runtime system.
