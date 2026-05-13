# Hybrid Expedition Implementation — 4.2.1 Final Plan

Date: 2026-05-12  
Status: Launch Candidate baseline after 4.2 review, correction pass and owner decisions  
Source documents: `chosen_hybrid_expedition_implementation.md`, `chosen_hybrid_expedition_implementation_4_0.md`, `chosen_hybrid_expedition_implementation_4_1.md`, `chosen_hybrid_expedition_implementation_4_2.md`  
Primary goal: browser-based, mobile-first idle RPG that is instantly playable, satisfying to repeat, easy to talk about, and deep enough to retain friends for weeks/months.

This 4.2.1 plan is now the **full Launch Candidate baseline**, not only an MVP proposal. It keeps the strongest parts of 3.0/4.0/4.1 but adds three structural systems that were undefined:

- construction timers as a core daily-engagement loop;
- Focus pressure rotation as a meta-design principle;
- formal relationship between Account Rank, Rebirth and Soul Marks.

It also resolves naming inconsistencies, scope ambiguities and unlock gates left vague in 4.1, and applies the 4.2 review patches around Focus cadence, construction/Rebirth safety, local-first Account Showcase, Daily Focus banking, class change safety and Phase 5 scope.

Terminology:

- **Launch Candidate** means the full intended first public-quality game direction.
- **MVP** inside individual sections means the smallest slice of that Launch Candidate system, not a separate reduced product vision.

---

## 0. Executive TL;DR

For Claude Code and quick reference.

**What this game is**: a browser/mobile idle RPG where players send expeditions, fight memorable bosses, master regions, build a persistent account identity, and return later to claim meaningful progress without being punished for having a life.

**Three product truths**:
1. First 30 seconds win or lose the player.
2. Daily return hooks are mandatory, but they must never punish life.
3. Social value starts with personal identity and word-of-mouth comparison, not with fake rankings or required networking infrastructure.

**Launch Candidate pillars (6)**:
- A: Instant Expedition Loop
- B: Permanent Progress (Mastery + Account Rank)
- C: Daily Return (forgiving, banked, never punishing)
- D: Region Identity (2 regions in MVP)
- E: Memorable Bosses (named, themed, threat-based)
- F: Account Showcase (local-first identity card)

**Core systems added/locked in 4.2.1**:
- Construction timers on persistent Town/Account buildings from level 1, never on anything that Rebirth wipes.
- Focus acceleration as a strategic sink with a daily-friendly regen cadence.
- Focus pressure rotation: same resource, different optimal uses at different progression phases.
- Account Rank + Rebirth + Soul Marks formally separated with clear relationship.
- Daily Focus Charges and Weekly Quest available from day 1, both forgiving and non-punitive.
- Account Showcase local-first, with Copy Showcase text only in MVP.
- Phase 5 split into Construction, Caravan, Outpost and Class Change slices.

**Top-bar currencies (max 3, not exactly 3)**:
- Before Rebirth/Soul Marks are introduced: Gold, Focus.
- After Rebirth/Soul Marks are discovered: Gold, Focus, Soul Marks.

**Implementation order**: 9 phases. Phase 0 = schema. Phase 1 = first-run feel. Phases 2-8 = systems by retention impact. Phase 9 = events/cloud polish. Phase 5 is split into 5A/5B/5C/5D to avoid timer/social/class-change scope creep.

**What this is NOT**: server-required, PvP, social-spam, multi-currency, multi-affix item walls, fake leaderboards, gacha-paced, or timer punishment.

**Implementation principle**: every phase must leave the game playable. No phase depends on a future phase to be fun.

## 1. Product Truth

The game must be designed around four truths.

### 1.1 First-session speed matters more than system depth

A browser/mobile player has almost no commitment before the first meaningful tap. The game must not ask them to read a deep system before it proves that the loop feels good.

Required timing targets:

```txt
First 5 seconds:  first meaningful tap.
First 30 seconds: first visible win.
First 3 minutes:  first self-directed goal.
First 10 minutes: first reason to return later.
```

### 1.2 Every run must visibly move something

The original 3.0 idea was right: expeditions should be simple to start, but not empty to repeat.

A successful run should usually move at least three visible things:

```txt
Route Mastery
Account XP
Gold / material / item / collection pity
```

A failed risky run should still move something:

```txt
Partial Mastery
Boss Intel
Failure pity
Prep discount
```

The player should never feel that a run was invisible.

### 1.3 Daily return hooks are mandatory, but punishment is not

Daily systems are useful because they create rhythm. They should not punish normal life.

Rules:

- missed daily boosts can bank up to 3 days;
- no permanent streak reward is lost forever;
- no exclusive power is locked behind one missed day;
- weekly goals should be completable without logging in every day;
- daily rewards are bonuses, not mandatory progression gates.

Use language like `Daily Return`, `Daily Boost Bank`, `Weekly Recap`. Avoid internal language like "addiction loop," "mental loop," or "hard expiry."

### 1.4 Social value starts with identity, not networking

The MVP should not implement a server, global population, friend graph, guild, fake Hiscores, or invite mechanics.

Instead, MVP ships an honest local **Account Showcase**: a strong account/profile screen that gives players things worth saying out loud.

The player should be able to compare verbally:

```txt
What Account Rank are you?
How many Rebirths?
Did you kill Cindermaw yet?
Which region are you completing?
How many routes have you mastered?
What trophy are you showing?
What relic are you missing?
```

This creates word-of-mouth without requiring online infrastructure.

---

## 2. Hard Decisions From 4.2.1

These are the corrected decisions, consolidating 3.0/4.0/4.1 and the 4.2 review.

1. **MVP is local-first.** No server required. No fake population. No fake global rank. No friend list placeholder that implies features that do not exist.
2. **Account Showcase replaces Hiscores.** Show identity, trophies, completion and current chase. Do not show `#847 of 1,203` unless a real server exists.
3. **A cloud/social layer is future-ready but optional.** If added later, it is a thin public showcase layer only. It must not affect rewards, gameplay, save authority, boss outcomes or progression.
4. **Account Rank skeleton exists from Phase 1.** If the result panel shows Account XP, the Account Rank system must exist from the beginning.
5. **Collection Lite moves earlier.** Full Codex can wait, but the first region needs a simple 4-piece collection/pity chase early.
6. **Daily return is forgiving.** Daily Focus uses banked charges up to 3 days and Weekly Quest is available from day 1. Do not design around shame, hard loss or exclusive missed power.
7. **Daily missions must be controllable.** Do not require pure RNG drops like `Gain a collection piece`; use eligible runs, pity progress or boss attempts.
8. **Currency top bar is max 3, not exactly 3.** Gold + Focus early. Soul Marks appear only after Rebirth/Soul Marks are introduced.
9. **Caravan stays and becomes the offline return layer.** It should be simple: choose region, choose duration, return, claim bundle. One Caravan slot only. Pure time investment, no resource cost. While Caravan is active, the player cannot start new expeditions.
10. **Bosses get names, titles, one-line fantasy and trophies.** Threats are not just code tags.
11. **Build presets are required before real counter/family complexity.** If the game asks players to switch gear for bosses/regions, it must provide low-friction presets or contextual equip.
12. **Events are schema-only in MVP.** No missable permanent power. No exclusive best-in-slot. Events are later.
13. **Mobile audit is a shipping gate.** One primary action per screen. No dense desktop tables in mobile UI.
14. **Focus replaces Vigor entirely.** Including code-level renames. The game has no combat yet, so "Vigor" fits poorly. Focus better fits the action-economy/prep theme.
15. **Focus must be two-day-friendly.** Focus starts at cap 200 and regenerates 1 every 15 minutes. This gives roughly 50 hours from empty to full, so a player can be away for about two days without feeling they lost a full day of Focus.
16. **Construction timers are core from level 1, but only for persistent buildings.** A building with any construction timer must persist through Rebirth. Temporary run upgrades may reset, but they must use instant/short timers only.
17. **Push notifications are post-MVP.** MVP uses in-app badges, toasts and return screens. Web push/PWA notification work is optional later.
18. **Focus rotates by progression naturally.** The same resource feels different at different phases of progression. This is intentional and unforced.
19. **Account Rank, Rebirth and Soul Marks are formally separated.** Defined relationship. No ambiguity.
20. **Soul Marks are earned exclusively from Rebirth.** Weekly Quests cannot grant Soul Mark shards in MVP.
21. **Class change has an early safety mode.** Before Rebirth is unlocked, first class change is a free respec and does not grant Soul Marks. After Rebirth is unlocked, class change triggers true Rebirth.
22. **Copy Showcase, not Share Showcase, in MVP.** The MVP copies a text snippet locally. No upload, no friend graph, no fake social, no image dependency.
23. **Town is persistent account identity.** Current Town buildings are persistent Launch Candidate buildings. Rebirth does not reset Forge, Mine, Tavern, Library, Market or Shrine.
24. **Rebirth resets the hero run, not the account.** Gear/inventory reset unless later protected by Vault, but Trait/Family Codex, Account Rank, Town, construction, outposts, collections, diaries and mastery progress persist.
25. **Fragments migration lands in Phase 2.** Phase 0 prepares schema boundaries; Phase 2 performs the clean economy rewrite from ore/crystal/rune/relicFragment into Fragments.

## 3. Launch Candidate Product Spine

The Launch Candidate spine is ordered by retention impact.

### Pillar A — Instant Expedition Loop

The player should start the first expedition without choosing between five menus.

Required:

- first expedition is preselected;
- first run resolves quickly;
- result screen is satisfying;
- `Start Again` is the obvious next button;
- `Next Goal` tells the player what to do in one sentence.

Example first result:

```txt
Victory!

Gold +120
Hero XP +80
Route Mastery +100       100/500
Account XP +15           15/100

Next: Run once more to claim Mapped Route.
[Start Again]
```

### Pillar B — Permanent Progress

Permanent progress should be visible from the first session.

Includes:

- Dungeon Mastery;
- Account Rank skeleton;
- mastery milestones;
- failure progress eligibility;
- profile/account identity.

Account Rank is the main comparison number, not hero level. Hero level can reset. Account Rank should not.

### Pillar C — Daily Return

Daily return starts on day 1 and grows. It uses **Daily Focus Charges** and a forgiving **Weekly Quest**, not hard streaks.

First day:

```txt
Daily Focus Charge
Complete 3 expeditions.
Reward: Focus +10
```

Daily Focus Charge rule:

```txt
Each day adds 1 Daily Focus Charge, up to 3.
Completing 3 expeditions consumes 1 charge and gives +10 Focus.
```

This lets a player who missed two days return and catch up through play, without granting progress for doing nothing and without punishing them with a broken streak.

After Account Rank 2:

```txt
Daily Missions
- Win 3 expeditions
- Salvage 3 items
- Gain 100 Mastery XP
```

From day 1:

```txt
Weekly Quest
Clear 10 expeditions, claim 2 mastery milestones, attempt 1 boss.
Reward: Account XP, material bundle, title progress or trophy progress.
```

The first week can use a simpler onboarding version if boss attempts are not yet unlocked. No Weekly Quest grants Soul Marks or Soul Mark shards. Soul Marks come from Rebirth only.

### Pillar D — Region Identity

Do not launch with five identical materials.

MVP should have only two real regional materials:

| Region | Material | Identity | Sinks |
| --- | --- | --- | --- |
| Sunlit Marches | Sunlit Timber | safe routes, early town growth | Tavern, Market, early prep |
| Emberwood | Ember Resin | Forge heat, regeneration answers | Forge, boss prep, anti-regen recipes |

Other regions exist in code (typed) but do not generate materials until activated, and their material names do not appear in UI while dormant.

### Pillar E — Memorable Bosses

Bosses are the emotional peak of the loop.

Every boss needs:

```txt
Name
Title
One-line fantasy
Threats
Best answer
First-clear trophy/unlock
Failure intel
```

Example:

```txt
Cindermaw, Ever-Burning Heart
"A beast that seals its wounds with living flame."

Threat: Ever-Burning / regenerating
Best answer: burst or Flame-Sealed trait
First clear: unlock Ember Watchtower
Trophy: Cindermaw Fang
```

### Pillar F — Account Showcase

The local account screen is the mouth-to-mouth social layer.

It should answer:

1. Who am I?
2. What have I achieved?
3. What am I chasing next?

Example:

```txt
Aurelian, Cindermaw Breaker
Account Rank 7 · Rebirth II
Ember specialist · Cindermaw defeated · 48% Emberwood
Current Chase: 1 relic missing in Sunlit Marches
```

No server needed. No ranking needed. No fake population needed.

## 4. Account Showcase — Local-First Social Readiness

### 4.1 Goal

Give the player a memorable identity they can talk about.

The account screen should not be a spreadsheet. It should feel like a compact RPG identity card.

Good verbal comparisons:

```txt
"I'm Account Rank 7."
"I'm Rebirth II."
"I killed Cindermaw."
"I'm 48% through Emberwood."
"I mastered 7 routes."
"I'm missing one Sunlit relic."
"I found Ward-Bound already."
```

Bad comparisons:

```txt
"I have 82 fragments."
"I have 12,400 gold."
"I logged in 8 days."
"I'm fake rank #847."
```

### 4.2 Access and discoverability

Access path: bottom nav tab `Account`. If bottom nav is full (4 tabs already), Account goes inside an overflow `...` menu, but the primary recommended layout is dedicated tab.

Bottom nav target:

```txt
Expeditions | Hero | Town | Account
```

First discovery: a one-time popup appears when the player reaches Account Rank 2 with the text:

```txt
You earned an Account Showcase!
Your identity, trophies and chase live here.
[View Showcase]
```

The popup never appears again. Account Rank 2 should be reachable within the first session for an average player.

### 4.3 Account screen layout

Mobile-first version:

```txt
ACCOUNT

[Portrait / Avatar]

Aurelian
Ember Knight
Title: Cindermaw Breaker

Account Rank 7
Rebirth II                  (omitted if 0)
Power 1,420

Signature
"Ember specialist · Cindermaw defeated · 48% Emberwood"

Proudest Feats
[Strongest Boss] Cindermaw
[Best Region] Emberwood 48%
[Mastered Routes] 7

Current Chase
1 relic missing in Sunlit Marches
2 runs to Known Route in Ashroot Den
[Go to Current Chase]

Trophy Shelf
[Cindermaw Fang] [Sunlit Relic Set] [Ward-Bound Discovery]

Personal Records
Lifetime Expeditions: 184
Boss Clears: 6
Collections: 1/5

[Copy Showcase]
```

Primary action is **Go to Current Chase**. Copying the showcase is useful, but it should not be the main action on the screen.

### 4.4 Must-show fields

Primary:

- hero name;
- class;
- selected title;
- Account Rank;
- Rebirth count (only if ≥ 1);
- current Power;
- account signature line;
- strongest boss defeated;
- best/most completed region;
- trophy shelf;
- current chase.

Secondary:

- mastered routes;
- collections completed;
- legendary/signature traits discovered;
- total boss clears;
- lifetime expeditions;
- highest power reached;
- active family/resonance.

Do not show currencies in the primary account card.

### 4.5 Account signature generation

The account signature should be auto-generated at first.

Examples:

```txt
"Rebirth II · Cindermaw defeated · Emberwood 48%"
"Azure Scholar · 3 bosses cleared · 12 routes mastered"
"Sunlit Collector · 1 relic missing · Account Rank 6"
"First Forge aspirant · Power 1,920 · Rebirth III"
```

Priority order:

1. selected title;
2. best boss defeated;
3. highest region completion;
4. Rebirth count (if ≥ 1);
5. Account Rank;
6. active family/identity;
7. current chase.

### 4.6 Trophy Shelf

Three visible trophy slots in MVP.

Trophies should represent stories, not chores.

Good trophies:

- Cindermaw Fang;
- First Rebirth Seal;
- Sunlit Relic Set;
- Azure Ledger Discovery;
- Mastered Route Medal;
- Legendary Trait Found.

Bad trophies:

- logged in 3 days;
- earned 10,000 gold;
- clicked 100 times;
- completed tutorial.

At first, trophy slots can be auto-filled by importance. Later, players can pin trophies manually.

### 4.7 Current Chase

Always show one near-term goal.

Examples:

```txt
Current Chase:
Find the last Sunlit relic.
Reward: +2% Sunlit mastery XP.
```

```txt
Current Chase:
Prepare for Cindermaw.
Missing answer: Crushing.
Suggested: Guarded trait or Watchtower prep.
```

```txt
Current Chase:
Run Ashroot Den 2 more times to claim Known Route.
```

This is one of the most important retention lines in the game.

### 4.8 Copy Showcase (local only)

In MVP, the button is called `Copy Showcase`, not `Share Showcase`.

It copies a stylized text snippet to clipboard:

```txt
Aurelian — Ember Knight
Account Rank 7 · Rebirth II · Power 1,420
"Ember specialist · Cindermaw defeated · 48% Emberwood"
Trophies: Cindermaw Fang, Sunlit Relic Set, Ward-Bound Discovery
Chasing: 1 relic missing in Sunlit Marches
```

Rules:

- No server.
- No upload.
- No friend graph.
- No reward for copying.
- No fake population.
- The player shares manually by speech, screenshot or their own channels.

Post-MVP polish may generate a card image or screenshot if trivial. The MVP should not depend on image clipboard support.

### 4.9 Account Showcase data model

```ts
type AccountShowcaseState = {
  selectedTitleId: string | null;
  pinnedTrophyIds: string[];
  favoriteRegionId: string | null;
  featuredBossId: string | null;
  featuredFamilyId: string | null;
  accountSignatureMode: "auto" | "manual";
  firstDiscoveryPopupShown: boolean;
};

type AccountPersonalRecords = {
  lifetimeExpeditionsCompleted: number;
  lifetimeBossesDefeated: number;
  highestPowerReached: number;
  highestAccountRankReached: number;
  totalRebirths: number;
  totalMasteryTiersClaimed: number;
  totalCollectionsCompleted: number;
  legendaryTraitsDiscovered: number;
};

type TrophyDefinition = {
  id: string;
  name: string;
  category:
    | "boss"
    | "rebirth"
    | "collection"
    | "mastery"
    | "trait"
    | "region"
    | "event";
  iconId: string;
  description: string;
  unlockedAt?: number;
};
```

## 5. Optional Thin Cloud Showcase — Future-Ready, Not MVP-Required

### 5.1 Default decision

Default MVP decision:

```txt
No server.
No cloud save.
No global ranks.
No friend list.
No public population.
No fake Hiscores.
```

Build the account screen so that players can show it in person or talk about it.

### 5.2 Cloud can be added only if it passes this gate

A thin cloud layer may be added later only if all conditions are true:

```txt
- implementation estimate is tiny;
- it does not touch combat, rewards, economy or save authority;
- it stores only AccountShowcaseSnapshot data;
- it does not require login to play;
- it does not create global rankings;
- it has clear abuse protection;
- it can be removed without breaking saves;
- it has a free-tier-safe write/read budget.
```

### 5.3 What cloud showcase would do

Allowed:

```txt
- publish public account card by slug;
- update account snapshot manually or after major milestones;
- view another player's public showcase;
- compare by conversation, not ranked leaderboard;
- optional copyable profile URL later.
```

Not allowed in MVP/early launch:

```txt
- server-authoritative progression;
- global ranks;
- fake ranks;
- rewards for sharing;
- invite spam;
- guilds;
- PvP;
- friend-required progression;
- public display of private data;
- storing full save files without a real cloud-save plan.
```

### 5.4 Cloud snapshot shape

```ts
type AccountShowcaseSnapshot = {
  schemaVersion: number;
  publicId: string;
  displayName: string;
  classId: string;
  selectedTitleId: string | null;
  accountRank: number;
  accountRankXp: number;
  rebirths: number;
  currentPower: number;
  bestBossId: string | null;
  bestRegionId: string | null;
  bestRegionCompletionPercent: number;
  masteredRoutes: number;
  completedCollections: number;
  totalBossesDefeated: number;
  activeFamilyId: string | null;
  trophyIds: string[];
  currentChase: {
    type: "mastery" | "collection" | "bossPrep" | "region" | "rebirth";
    label: string;
    progressCurrent?: number;
    progressTarget?: number;
  } | null;
  updatedAt: number;
};
```

This snapshot should be derived from local save data. It should not be used as gameplay source of truth.

### 5.5 Supabase vs Firebase recommendation

If cloud showcase is added later, both are viable.

#### Supabase is better if:

- you want a simple public `profiles` table;
- you like Postgres and SQL;
- you want row-level security policies;
- you want an easy future path to simple queries;
- you are comfortable with free-tier project limits and database/storage quotas.

Possible table:

```sql
create table public.account_showcases (
  public_id text primary key,
  owner_secret_hash text not null,
  display_name text not null,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);
```

#### Firebase is better if:

- the project already uses Firebase Hosting/Auth/Analytics;
- you prefer Firestore documents over SQL;
- you want simple anonymous/authenticated writes;
- you want Google ecosystem integration;
- you are comfortable with daily read/write quotas.

Possible collection:

```txt
/accountShowcases/{publicId}
  displayName
  snapshot
  updatedAt
  ownerUid or ownerSecretHash
```

### 5.6 Recommended timing

Do not add cloud before the core loop is fun.

Recommended:

```txt
Launch Candidate: local Account Showcase only.
Post-launch: optional public showcase if trivial, safe and players actually ask for it.
Later: friend comparison or public cards only if they remain non-authoritative and non-ranked.
Never: fake global population.
```

---

## 6. Mastery + Result Progress

### 6.1 Goal

Mastery answers:

- why repeat an old dungeon?
- what did I gain if a risky attempt failed?
- what short-term target am I one or two runs away from?

### 6.2 Numbers

```ts
normalSuccessMasteryXp = 100;
normalFailureMasteryXp = 35;
bossSuccessMasteryXp = 150;
bossFailureMasteryXp = 50;

masteryMilestones = [
  { tier: 1, xp: 100, label: "Mapped" },
  { tier: 2, xp: 500, label: "Known Route" },
  { tier: 3, xp: 1500, label: "Mastered" }
];
```

### 6.3 Milestone rewards

Tier 1:

- small one-time regional material bundle;
- Account XP;
- account showcase record update.

Tier 2:

- small permanent yield or collection chance for that dungeon/region;
- Account XP;
- possible title progress.

Tier 3:

- recipe;
- title;
- boss prep discount;
- outpost upgrade material;
- trophy candidate.

### 6.4 Failure eligibility

Failure rewards are good, but they must not become an exploit.

Recommended rule:

```ts
eligibleFailureProgress =
  dungeonUnlocked &&
  successChance >= 0.35 &&
  !playerIsOverAttemptingBeyondRegionGate;
```

Alternative scaling:

```ts
failureRewardMultiplier = clamp(successChance / 0.5, 0, 1);
```

Falling upward should feel useful. Intentionally farming impossible failures should not be optimal.

---

## 7. Account Rank, Rebirth and Soul Marks — Formal Relationship

The 4.1 plan left this relationship implicit. 4.2.1 makes it explicit because all three are central to long-term retention and the Account Showcase narrative.

### 7.1 Concepts

Three independent but related meta-progression layers:

**Account Rank**
- Never resets.
- Earned from every form of meaningful progress.
- Unlocks convenience and breadth (inventory slots, build preset slots, offline cap, titles, system unlocks).
- The "identity number" for the Account Showcase.
- Technical cap: 100.
- MVP designed reward cap: 10. Ranks 11+ may exist numerically but should not require bespoke rewards yet.

**Rebirth**
- Optional player-triggered reset of the hero/run.
- Resets hero level, temporary run state and temporary run upgrades.
- Does not reset persistent Account/Town buildings with long construction timers.
- Each true Rebirth grants Soul Marks.
- Each true Rebirth grants a flat Account XP bonus (+100).
- Visible as a number ("Rebirth II") on the Showcase only if ≥ 1.

**Soul Marks**
- A currency earned exclusively from true Rebirth.
- Accumulated and spent on permanent prestige upgrades.
- Never reset.
- Hidden from the top bar until Rebirth/Soul Marks are introduced.

### 7.2 Relationships

```txt
Account Rank XP comes from:
  - mastery tiers claimed
  - boss first clears
  - collections completed
  - diaries completed
  - outposts unlocked
  - true rebirths performed (+100 each)
  - final boss clears
  - legendary trait discoveries

True Rebirth grants:
  - Soul Marks (current system numbers)
  - +100 Account XP
  - Resets hero progression
  - Does NOT reset Account Rank, Soul Marks, Showcase, Trophies, Codex
  - Does NOT reset persistent buildings with construction timers

Soul Marks:
  - Spent on permanent upgrades (current system: swiftCharters, guildLegacy, treasureOath, bossAttunement)
  - Persist through reincarnation
  - Are the prestige currency while Account Rank is the prestige score
```

### 7.3 Why Rebirth is not optional in the long term

A player can reach a meaningful Account Rank without Rebirth, but the highest Account Ranks require Rebirths because:

- Rebirth grants direct Account XP (+100 per Rebirth).
- Soul Mark upgrades make further progression easier, which yields more Account XP from clears.
- Some Account Rank rewards (high tiers) implicitly assume multiple Rebirths in their XP cost curve.

This is the "soft requirement" model: Rebirth is never forced for normal play, but a no-Rebirth player will hit a soft ceiling around mid-Account-Rank. By that point, the player has had enough progression that Rebirth feels like a fresh-but-stronger run, not a punishment.

### 7.4 Account Rank reward philosophy

Account Rank should unlock convenience and breadth, not huge raw power.

Good rewards:

- inventory slots;
- build preset slot;
- small offline cap increase;
- cosmetic titles;
- trophy shelf slot later;
- region overview filters;
- small global mastery XP bonus;
- system upgrades (e.g., Account Rank 2 unlocks Showcase popup, Rank 3 upgrades the Weekly Quest reward table);
- Focus cap increases (see Section 12.5).

Bad rewards:

- huge damage multipliers;
- mandatory boss success;
- exclusive currencies that replace core progression;
- anything that makes new content trivial.

### 7.5 Initial Account Rank reward table

```txt
Rank 1:  Account Showcase exists (no popup yet), Focus cap 200
Rank 2:  Account Showcase first-discovery popup, +1 inventory row
Rank 3:  Weekly Quest advanced table unlocked, title slot unlocked
Rank 4:  +5% offline cap, Focus cap +20
Rank 5:  Second trophy slot, first major title
Rank 6:  +1 inventory row
Rank 7:  Build preset slot 2 unlocked, Focus cap +20
Rank 8:  Region overview filters
Rank 9:  +5% offline cap, +1 trophy slot
Rank 10: Mastery Codex (Trait/Family) UI unlocked, Focus cap +20
```

Keep early rewards small but visible. Ranks 11+ can use repeatable/numeric rewards such as Focus cap and offline cap until custom late rewards are designed.

### 7.6 Data shapes

```ts
type AccountRankState = {
  accountXp: number;
  accountRank: number;
  claimedRankRewards: number[];
};

type RebirthState = {
  totalRebirths: number;
  lastRebirthAt: number | null;
  classChangesUsedFreeSlot: boolean;
};

type SoulMarksState = {
  current: number;
  lifetimeEarned: number;
  upgradesClaimed: Record<string, number>;
  discovered: boolean;
};
```

## 8. Region Identity Through Materials

### 8.1 MVP rule

Only two regional materials in MVP.

```txt
Sunlit Timber
Ember Resin
```

Do not add a material unless it has at least:

```txt
1 town sink
1 boss/prep sink
1 crafting/outpost sink
```

### 8.2 Full region material plan

All five materials are typed in code from the start, but only the MVP two generate drops. The other three are typed-but-dormant.

| Region | Material | Primary Sinks | Identity | Status in MVP |
| --- | --- | --- | --- | --- |
| Sunlit Marches | Sunlit Timber | Tavern, Market, early boss prep | safe routes, basic growth | Active |
| Emberwood | Ember Resin | Forge, regeneration counters, crafting heat | fire, anti-regen, forge | Active |
| Azure Vaults | Archive Glyphs | Library, Shrine, ward prep | scouting, curses, knowledge | Typed, dormant |
| Stormglass Peaks | Stormglass Shards | timers, elite prep, speed | duration, storms, risky routes | Typed, dormant |
| First Forge | Oath Embers | high-tier crafting, reincarnation accelerants | prestige crafting, endgame | Typed, dormant |

Dormant materials do not generate drops, do not appear in any UI, and do not exist for the player. They are pure typing scaffolding.

Locked content should not show dormant material names. Example:

```txt
Wrong: [Library] Upgrade — 2,800 G, 35 Glyphs (locked, region dormant)
Right: [Library] Locked — Discover Azure Vaults
```

### 8.3 Reward rules

```ts
normalSuccessRegionMaterial = 1 + floor(zoneIndex / 2);
normalFailureRegionMaterial = eligibleFailureProgress && zoneIndex >= 2 ? 1 : 0;
bossSuccessRegionMaterial = 3 + zoneIndex;
bossFailureRegionMaterial = eligibleFailureProgress ? 1 : 0;
```

### 8.4 Currency visibility

Top bar before Rebirth/Soul Marks are introduced:

```txt
Gold
Focus
```

Top bar after Rebirth/Soul Marks are introduced:

```txt
Gold
Focus
Soul Marks
```

Contextual only:

```txt
Fragments -> inventory / forge / town
Account XP -> result / account
Regional materials -> region / town / boss prep
Collection dust -> collection / codex
```

Rule: top bar max 3, not exactly 3.

## 9. Collections Lite + Full Codex Later

### 9.1 Decision

Full Codex can wait. Collection Lite cannot wait too long.

Add one simple 4-piece collection early for the first region or first two regions. This gives players a completion chase before the full long-term system exists.

### 9.2 Collection Lite rules

```txt
4 pieces per region
normal success can drop a missing piece
boss first clear guarantees one missing piece
pity after eligible dry streak
completion gives small permanent reward
```

Recommended numbers:

```ts
normalSuccessCollectionChance = 0.16;
normalFailureCollectionChance = 0.05;
bossSuccessCollectionChance = 0.35;
collectionPityThreshold = 5;
```

### 9.3 Anti-duplicate rule

Before completion, collection drops should give missing pieces.

```ts
if (collectionDrop) {
  if (missingPieces.length > 0) giveRandomMissingPiece();
  else giveCollectionDust();
}
```

If duplicates are needed for long-tail:

```txt
duplicatePiece -> relicDust
relicDust -> buy missing piece after 10 dust
```

### 9.4 Completion rewards

Small and permanent:

- +2% regional material yield;
- +2% mastery XP in that region;
- +1% boss success in that region;
- cosmetic title;
- trophy candidate;
- Account XP.

No collection should be mandatory before main progression.

---

## 10. Boss Threats With Named Identity

### 10.1 Internal threat keys

```ts
type ExpeditionThreatId =
  | "armored"
  | "cursed"
  | "venom"
  | "elusive"
  | "regenerating"
  | "brutal";
```

### 10.2 Player-facing names by region

| Threat Key | Sunlit Marches | Emberwood | Azure Vaults | Stormglass | First Forge |
| --- | --- | --- | --- | --- | --- |
| `armored` | Bark-Hide | Iron-Plated | Frost-Sealed | Stone-Shell | Forge-Tempered |
| `cursed` | Sun-Maddened | Hex-Touched | Soul-Bound | Storm-Cursed | Oath-Broken |
| `venom` | Marsh-Fanged | Ember-Sting | Ice-Bite | Wind-Tainted | Smelter-Sick |
| `elusive` | Mist-Walker | Cinder-Quick | Shadow-Step | Gale-Born | Coal-Slip |
| `regenerating` | Bloom-Healed | Ever-Burning | Crystal-Mended | Storm-Knit | Forge-Reborn |
| `brutal` | Marsh-Crusher | Inferno-Heart | Glacier-Fist | Tempest-Born | Anvil-Bound |

### 10.3 Boss template

```ts
type BossDefinition = {
  id: string;
  regionId: string;
  name: string;
  title: string;
  oneLineFantasy: string;
  power: number;
  duration: number;
  threats: ExpeditionThreatId[];
  criticalThreat?: ExpeditionThreatId;
  scoutCost: number;
  prepOptions: BossPrepOption[];
  firstClearRewards: Reward[];
  trophyId?: string;
  outpostUnlock?: string;
};
```

Example:

```txt
Cindermaw, Ever-Burning Heart
"A beast that seals its wounds with living flame."
Threat: regenerating
Best answer: Flame-Sealed / burst / Ember Forge prep
Trophy: Cindermaw Fang
```

### 10.4 Boss chance adjustment

```ts
baseChance = currentGetSuccessChance(state, boss);
covered = countCoveredThreats(state, boss);
missing = countMissingThreats(state, boss);
missingCritical = isCriticalThreatMissing(state, boss);

rawChance =
  baseChance
  + covered * 0.04
  - missing * 0.025;

maxChance =
  missingCritical ? 0.72 :
  missing > 0 ? 0.88 :
  0.96;

bossSuccessChance = clamp(rawChance, 0.15, maxChance);
```

### 10.5 Coverage quality

Not all answers are equal.

```ts
type ThreatCoverageSource =
  | "equippedTrait"
  | "familyResonance"
  | "bossPrepCharge"
  | "masteryBonus"
  | "outpostBonus";

coverageWeight = {
  equippedTrait: 1.0,
  familyResonance: 0.8,
  bossPrepCharge: 0.7,
  masteryBonus: 0.5,
  outpostBonus: 0.4
};
```

UI should stay simple:

```txt
Threat: Ever-Burning
Best answer: Flame-Sealed trait
You have: Ember Forge prep
Coverage: Partial
Effect: max chance 88%
```

### 10.6 Boss failure

Failure should grant:

- boss intel;
- mastery XP;
- prep discount progress;
- revealed threat chance;
- current chase update.

Failure should not feel like wasted time.

---

## 11. Boss Prep

Boss prep prevents RNG hard locks.

Sources:

- Scout with Focus;
- pay local regional materials;
- use a Forge order;
- equip a counter trait;
- clear related dungeons to mastery tier 1/2;
- outpost bonus.

State:

```ts
type BossPrepState = {
  revealedThreats: ExpeditionThreatId[];
  prepCharges: Partial<Record<ExpeditionThreatId, number>>;
  attempts: number;
  intel: number;
};
```

Rules:

- revealed threats persist at least through the current reincarnation;
- prep charges cover a missing threat for one attempt;
- equipped counters are better than temporary prep;
- boss failures increase intel;
- missing counters reduce/cap odds, but do not block attempts.

### 11.1 Scout and Prep costs (Focus)

Scaled by boss tier (region order):

| Boss Tier | Scout Cost | Prep Cost (per charge) |
| --- | ---: | ---: |
| 1 (Sunlit Marches) | 5 | 10 |
| 2 (Emberwood) | 8 | 15 |
| 3 (Azure Vaults) | 12 | 22 |
| 4 (Stormglass) | 18 | 32 |
| 5 (First Forge) | 25 | 45 |

These are the starting numbers. They are intentionally cheap at tier 1 (to teach the system) and significantly more expensive at tier 5 (to compete with construction acceleration and reward boost as Focus sinks).

---
## 12. Focus — Rework, Rotation Pressure And Sinks

This is one of the most important 4.2.1 corrections.

### 12.1 Renaming

The resource previously called Vigor is now called **Focus** at every layer: code, types, save state, UI labels. Existing save data does not need preservation because the game has not launched.

The Focus icon should be a flame/spark visual. The bar displays as `Focus 87/200`.

### 12.2 Why "Focus" and not "Vigor"

- The game has no direct combat. "Vigor" implies physical combat stamina.
- "Focus" fits the action-economy theme: scouting, preparing, accelerating, concentrating rewards.
- "Focus" pairs better with player-facing verbs ("Focus this run", "Focus the construction").
- Avoids confusion with stamina/health systems in adjacent genres.

### 12.3 The four Focus sinks

Focus is spent on four distinct actions. Each is shown contextually, not as a four-mode menu.

1. **Reward Boost**. Doubles or substantially increases rewards for one expedition.
2. **Boss Scout** (Section 11). Reveals threats or improves intel for a boss.
3. **Boss Prep** (Section 11). Creates a temporary answer to a missing threat for one attempt.
4. **Construction Acceleration** (Section 13). Skips real time on the current persistent Town/Account building upgrade.

Each sink has its own button in the relevant screen. The player never sees a four-option menu without context.

### 12.4 Pressure Rotation — Design Principle

**The same resource (Focus) should feel optimal for different sinks at different progression phases. This rotation is created by balancing, not by forcing.**

The player is never told "now spend Focus on construction." Instead, the costs and durations of each sink are tuned so that at each phase of the game, *one sink naturally feels most valuable* — but the others remain viable for players who prefer them.

This creates a sense that Focus has a "life story" across the player's progression. The same resource that doubled gold drops in week 1 becomes the resource that finishes a long construction in week 6.

### 12.5 Focus cap and regeneration

Daily-friendly default:

```txt
Focus cap starts at 200.
Focus regenerates 1 every 15 minutes.
Full cap from empty: 50 hours.
```

This is intentional. A cap that fills in ~8 hours pressures players to log in multiple times a day. A 50-hour fill rate lets a player miss roughly two days without feeling they lost a full day of Focus. This is similar in spirit to a generous resin-style cap, but without requiring multiple daily check-ins.

Account Rank rewards include Focus cap increases:

```txt
Rank 1:   Focus cap 200
Rank 4:   Focus cap 220
Rank 7:   Focus cap 240
Rank 10:  Focus cap 260
Rank 13:  Focus cap 280
Rank 16:  Focus cap 300
...
```

The cap grows slowly so that endgame players have more headroom for big sinks, but never enough to fully cover every sink simultaneously.

### 12.6 Construction acceleration exchange rate

Launch Candidate exchange rate:

```txt
1 Focus = 4 minutes of construction time skipped
15 Focus = 1 hour skipped
360 Focus = 1 day skipped
1080 Focus = 3 days skipped
```

A 3-day construction cannot be instantly skipped from cap alone. That is the point: Focus can meaningfully accelerate, not erase, long-term pacing.

### 12.7 Rotation curve — the four phases

The following four phases describe the *natural optimal Focus use* at each Account Rank tier. Players are never told this directly; it emerges from costs.

#### Phase Alpha — Account Rank 1-3 (week 1)

Dominant sink: **Reward Boost**.

Why:
- Construction times at levels 1-3 are short enough that acceleration is optional, not dominant.
- Bosses are not yet attempted, or the first one (Sunlit) is easy enough that Scout/Prep are optional.
- Reward Boost on a normal expedition gives instant gratification and helps onboarding.

Player experience: "Focus = double rewards."

#### Phase Beta — Account Rank 4-6 (week 2-3)

Dominant sinks: **Construction Acceleration** and **Reward Boost**, competing.

Why:
- Building level 4+ starts requiring meaningful 30+ minute timers.
- The player has unlocked enough buildings that there is usually something to accelerate.
- Bosses tier 1-2 introduce Scout/Prep but at low cost; they are not the dominant sink yet.

Player experience: "Should I accelerate this construction or boost rewards on this run?" The first real Focus decision.

#### Phase Gamma — Account Rank 7-9 (week 4-6)

Dominant sinks: **Construction Acceleration**, **Boss Scout/Prep**, and **Reward Boost** all compete.

Why:
- Buildings at level 8-9 take 8-24 hours.
- Bosses tier 2-3 have meaningful threats. Scout and Prep matter.
- Reward Boost is still useful for material farming.

Player experience: "Focus is precious. I need to plan its use."

#### Phase Delta — Account Rank 10+ (week 7+)

Dominant sinks: **Construction Acceleration** (top-tier) and **Boss Prep** (heroic bosses).

Why:
- Buildings at level 10-12 take 1-3 days.
- Heroic bosses (post-MVP) demand Prep.
- Reward Boost becomes the secondary use, applied to specific farming bursts.

Player experience: "Focus is the bottleneck of my progression."

### 12.8 Rules

- Focus is never required for normal progression.
- Exact benefit shown before spending.
- Context determines the primary Focus action.
- No hidden formulas in the button label.
- At no point should Focus feel useless — at least one decent sink is always available for the player's current state.
- The game never tells the player "this is the best use of Focus right now." The player discovers it through play.
- Focus is not refunded when spent on construction acceleration and the construction is later canceled.

## 13. Construction Timers

This section was added in 4.2 and corrected in 4.2.1.

### 13.1 Why timed constructions

Timed constructions provide:

- A reason to return to the game tomorrow ("my Forge finishes in 6 hours").
- A strategic decision ("which building do I upgrade tonight?").
- A natural sink for Focus (acceleration).
- A pacing mechanism that protects casual players from burning out content too fast.

### 13.2 Rebirth safety rule

Hard rule:

```txt
Never put a 1-3 day construction timer on anything that Rebirth can wipe.
```

Town is divided into two conceptual layers:

```txt
Persistent Town / Account Buildings
- Forge
- Tavern
- Market
- Shrine
- Library
- other account-wide buildings
- construction timers allowed
- persist through Rebirth

Run Camp / Temporary Run Upgrades
- temporary expedition buffs
- temporary prep stations
- early-run speed boosts
- current-run conveniences
- instant/short timers only
- may reset with Rebirth
```

If the implementation cannot cleanly split these yet, use the simpler rule:

```txt
Any building with a construction timer persists through Rebirth.
Any upgrade that resets with Rebirth must be instant or short.
```

### 13.3 Time curve

Persistent Town/Account buildings follow this starting curve:

```txt
Level 1:      2 minutes
Level 2:      5 minutes
Level 3:      15 minutes
Levels 4-5:   30-90 minutes
Levels 6-7:   1-4 hours
Levels 8-9:   8-24 hours
Levels 10-11: 1-2 days
Level 12:     3 days
```

These numbers are starting points. Construction exists from level 1 so the player learns that Town is a timed persistent account layer, but early timers are short enough to avoid blocking the first session.

### 13.4 One slot, no queue

The player has **one construction slot active at a time**. There is no construction queue.

Rationale:
- Queues add UI complexity without proportional player value.
- Casual players who play once per day rarely need queues.
- The single-slot constraint makes the "which building first?" decision meaningful.
- If the player wants to build a second thing today, they accelerate the first with Focus.

When a construction finishes, the slot is empty until the player chooses the next building.

### 13.5 Acceleration with Focus

Focus accelerates the current construction.

```txt
1 Focus = 4 minutes of construction time skipped
15 Focus = 1 hour skipped
360 Focus = 1 day skipped
1080 Focus = 3 days skipped
```

Rules:
- Only the currently active construction can be accelerated.
- The player can accelerate in chunks (skip 1 hour, then later skip more).
- Focus spent on acceleration is **never refunded**, even if the building is canceled.
- Gold cannot accelerate constructions. Only Focus.
- The UI should warn when instant-skip would exceed 50% of the player's Focus cap.

### 13.6 Cancellation

The player can cancel the active construction at any time.

- Materials refunded: 80%. Shown in confirmation popup.
- Focus spent on acceleration: not refunded.
- The slot becomes immediately empty after confirmation.

Confirmation popup text:

```txt
Cancel Forge → Level 8?
You will receive 80% of materials back.
Focus already spent on acceleration is lost.

[Cancel Construction] [Keep Building]
```

### 13.7 Notifications and return feedback

MVP:

- No web push notifications.
- A visible badge appears on the Town tab in bottom nav when construction finishes.
- A toast appears when the player opens the game.
- The return screen can say: `Forge Level 8 completed while you were away.`

Post-MVP / PWA / cloud:

- Optional web push only after explicit opt-in.
- Only for construction/caravan finished.
- Never for daily nagging or social pressure.

### 13.8 Empty slot does not hurt

If the player does not log in for 24 hours after a construction finishes, the slot sits empty during that time. **No progress is lost by having an empty slot.**

This rule is critical for casual retention. A player who logs in twice a week should not feel that idle slots cost them progression.

### 13.9 Data shape

```ts
type ConstructionState = {
  activeBuildingId: string | null;
  startedAt: number | null;
  targetLevel: number | null;
  baseDurationMs: number;
  focusSpentMs: number;
  completedAt: number | null;
};
```

The remaining time on a construction is computed as:

```ts
remainingMs = max(
  0,
  (startedAt + baseDurationMs) - now() - focusSpentMs
);
```

### 13.10 What does NOT have construction timers

- Equipping items (instant).
- Switching build presets (instant).
- Salvaging items (instant).
- Selling items (instant).
- Reincarnation (instant after confirmation).
- Caravan (has its own offline timer, but not a construction timer).
- Hero leveling (instant, comes from expeditions).
- Class change (may trigger Rebirth, but not a build timer).
- Temporary run upgrades that reset on Rebirth.

Anything in the action-economy of moment-to-moment play is instant. Only persistent long-term investments use construction timers.

### 13.11 Building upgrade preview UI

Before starting a building upgrade, the player sees:

```txt
Forge → Level 8

Time: 12 hours
Cost: 4,500 Gold, 80 Ember Resin
Adds: +20% Forge speed, +1 reroll/day

Skip with Focus: 180 Focus for instant (not recommended)
Or accelerate in chunks anytime during construction.

[Start Construction]
```

The "not recommended" hint appears whenever the Focus cost would exceed 50% of the cap. This protects new players from burning their cap on a single construction.

## 14. Items, Traits And Families

### 14.1 Item simplicity decision

Do not keep multi-affix item walls as the target model.

New item model:

```txt
Base stats
One explicit trait
Optional family
```

Example:

```txt
Azure Wardhelm
Rare Helm · Power 42
Trait: Ward-Bound
Family: Azure Ledger
```

### 14.2 Rarity

| Rarity | Explicit Trait | Family | Notes |
| --- | ---: | ---: | --- |
| Common | 0 | No | Base stats only; salvage/sell fodder |
| Rare | 1 | Sometimes | First meaningful trait tier |
| Epic | 1 | Yes | Better stats/trait scaling, guaranteed family |
| Legendary | 1 signature trait | Yes | Signature identity, no five-affix wall |

### 14.3 Trait budgets

| Trait Type | Stat Budget vs Pure Stat Trait | Utility |
| --- | ---: | --- |
| Pure stat | 100% | no utility |
| Tactical counter | 60-75% | covers boss threat |
| Regional economy | 50-70% | region yield/progress |
| Progress utility | 40-65% | mastery/collection/scout/failure progress |
| Legendary signature | 85-100% | one unique rider |

### 14.4 Tactical boss traits

- `Flame-Sealed`: counters `regenerating`; modest power/burst.
- `Ward-Bound`: counters `cursed`; defense/luck.
- `Piercing`: counters `armored`; power/armor-break prep.
- `Trailwise`: counters `elusive`; speed/luck.
- `Antivenom`: counters `venom`; stamina/failure recovery.
- `Guarded`: counters `brutal`; defense/stamina.

Stat must reinforce the same fantasy as the counter.

### 14.5 Regional economy traits

Examples:

- `+8% Emberwood material yield`;
- `+10% Azure collection chance`;
- `+12% Sunlit mastery XP`;
- `+10% boss key/prep progress`;
- `+1 local material on first clear of the day`.

### 14.6 Utility progress traits

Examples:

- `+failure intel`;
- `+salvage into local material`;
- `+Forge order speed`;
- `+outpost upgrade progress`;
- `+scout effectiveness`.

### 14.7 Families / resonance

Families are lightweight sets. All five families are typed in code from the start, but only the families tied to active MVP regions (Sunlit Charter, Emberbound Kit) can appear in loot during MVP. The other three are typed-but-dormant and do not roll on items.

| Family | Theme | Rank 1: 2 Items | Rank 2: 3+ Items | Status in MVP |
| --- | --- | --- | --- | --- |
| Sunlit Charter | safe routes, early economy | +Sunlit Timber yield | +mastery XP in Sunlit Marches | Active |
| Emberbound Kit | Forge heat, regeneration answers | +Ember Resin yield | prep discount vs `regenerating` | Active |
| Azure Ledger | Library, curses, scouting | +Archive Glyphs yield | reveal one boss threat in Azure Vaults | Typed, dormant |
| Stormglass Survey | speed, elite routes | +Stormglass yield | small duration reduction in Stormglass | Typed, dormant |
| First Forge Oath | high-tier crafting | +Oath Ember yield | boss prep efficiency in First Forge | Typed, dormant |

MVP rule:

```ts
activeFamilyResonance = bestEquippedFamilyByCountThenScore(equipment);
rank = equippedCount >= 3 ? 2 : equippedCount >= 2 ? 1 : 0;
```

UI must explain active resonance:

```txt
Active Family: Azure Ledger II
Reason: 3 equipped Azure items
Inactive: Sunlit Charter I, only 2 items
```

### 14.8 Build presets

Build presets are mandatory before the system expects regular gear switching.

Minimum:

- 2 presets by default;
- 1 extra from Account Rank 7;
- `Equip best Power`;
- `Equip best for this boss/region`;
- lock items;
- no salvage of locked items.

Without presets, counters/families become chores.

---

## 15. Trait Codex / Family Codex

Codex can be a later phase, but the data model should support it.

Purpose:

- reincarnation does not erase item identity;
- legendary/trait discoveries have permanent value;
- future crafting can target discovered traits;
- Account Showcase can show discoveries;
- trophy shelf can use discoveries.

Data:

```ts
type TraitDiscoveryState = {
  traitId: string;
  discovered: boolean;
  bestValueSeen: number;
  timesFound: number;
};

type FamilyDiscoveryState = {
  familyId: string;
  discoveredSlots: EquipmentSlot[];
  highestResonanceReached: 0 | 1 | 2;
};
```

The Codex UI is gated by Account Rank 10. Before that, discoveries are tracked silently but not surfaced.

Example moment (post-unlock):

```txt
Codex Discovery!
Ward-Bound discovered.
Can now appear in Azure Forge orders.
Account Rank +10 XP.
```

Families typed-but-dormant (Section 14.7) do not show in the Codex until their region is activated.

---

## 16. Outposts

After clearing a region boss, the player chooses one outpost bonus for that region.

In MVP (2 regions), the maximum number of outposts is 2.

MVP choices (same four options per region):

| Outpost | Bonus |
| --- | --- |
| Supply Post | +regional material yield |
| Watchtower | +scout effectiveness / boss intel |
| Relic Survey | +collection chance |
| Training Yard | +mastery XP |

Rules:

- one active outpost per region;
- all four options available in every region (MVP);
- respec is free during testing or cheap later;
- outpost bonuses are regional;
- level 2/3 upgrades can wait;
- boss clear unlocks the outpost;
- collection RNG should not block outpost unlock.

Long-tail:

```txt
Level 1: unlocked by first boss clear
Level 2: requires region mastery tier 2 on two dungeons
Level 3: requires collection completion or boss mastery tier 2
```

Future variation: post-MVP, different regions may have different outpost option sets to add regional flavor. MVP keeps them identical for simplicity.

---

## 17. Region Diaries

Region Diaries are useful, but they are not MVP-critical.

MVP diary should be tiny:

```txt
Sunlit Marches Diary
- Clear each Sunlit expedition once.
- Reach mastery tier 1 on Tollroad of Trinkets.
- Salvage 3 Sunlit items.
- Upgrade one Town building using Sunlit Timber.
Reward: +2% Sunlit mastery XP, Sunlit title.
```

Rules:

- one diary tier per region in MVP/early release;
- no hard dependency for main progression;
- rewards are quality-of-life, yield, titles or small prep discounts;
- diaries are a way to encourage breadth.

---

## 18. Caravan — Offline Return Layer

### 18.1 Identity

Caravan is the long offline timer. It complements expeditions and Focus rather than competing with them.

- Expeditions = active short-term loop.
- Focus = active tactical resource.
- Caravan = passive offline reward layer.

### 18.2 MVP rules

- One Caravan slot, always.
- Choose region + duration. No resource cost. Pure time investment.
- Caravan is an offline commitment: while a Caravan job is active, the player cannot start new expeditions.
- Always succeeds.
- Returns with a bundle: gold, regional material, small relic clue chance, Account XP.
- Duration range: 1 hour to 8 hours (existing system).
- Reward scales with duration.

### 18.3 Caravan Mastery (Launch Candidate later phase, target Phase 7+)

Sending repeated caravans to the same region grows a Caravan Mastery for that region:

```ts
type CaravanMasteryState = {
  regionId: string;
  caravansSent: number;
  masteryXp: number;
  claimedTiers: number[];
};
```

Caravan Mastery tiers grant:
- +regional material on Caravan;
- +Account XP per Caravan;
- shorter Caravan durations at the same reward;
- eventually, threat preview rolls on the route.

The player can also "upgrade" the Caravan itself via Town/Forge once Caravan Mastery reaches certain tiers. This is the analog to Lost Vault style permanent upgrades.

### 18.4 What Caravan should NOT do

- Allow simultaneous expedition starts.
- Mandatory prep.
- Gear counters.
- Critical threats.
- High failure states.
- Multiple decision screens.
- Focus interaction (Caravan and Focus do not mix).

Threats may appear as flavor only:

```txt
Route Hazard: Cinder Winds
Reward: +Ember Resin, +Account XP, small chance at relic clue
```

The hazard does not change success rate. It is narrative flavor.

### 18.5 Why Focus and Caravan do not mix

If Focus could accelerate Caravans, the systems become redundant. Caravan exists specifically as the *passive* layer for players who close the tab. Adding Focus interaction would force the active player to constantly manage Caravan, defeating its purpose.

---

## 19. Class Change

### 19.1 Goal

Class change exists as a retention safety net. A player who regrets their class should not churn.

### 19.2 Early safety mode — before Rebirth is unlocked

Before Rebirth/Soul Marks are introduced:

- The first class change is a free respec.
- It does not grant Soul Marks.
- It does not use Rebirth language.
- It preserves as much early progress as practical.
- It should be framed as correcting the player's class choice, not as prestige.

Example confirmation:

```txt
Change Class to Rogue?

This is your free class respec.
Your Account Rank and progress stay intact.
You will not gain Soul Marks from this early respec.

[Change Class] [Cancel]
```

### 19.3 True class change — after Rebirth is unlocked

After Rebirth is unlocked:

- The first class change is still free if unused.
- Subsequent class changes cost Soul Marks + 7-day cooldown.
- Changing class triggers a true Rebirth.
- True Rebirth grants Soul Marks and +100 Account XP.

Confirmation flow:

```txt
Change Class to Rogue?

This will trigger a Rebirth.
- Your hero level resets.
- You gain Soul Marks from this Rebirth (estimated +X).
- Your Account Rank, persistent Town, Trophies and Showcase remain.

This is your free first change. After this, class changes cost Soul Marks.

[Change Class] [Cancel]
```

### 19.4 Why Rebirth on post-unlock class change

Class change is a major identity shift. Pairing it with Rebirth:

- grants Soul Marks so the change feels rewarding, not punishing;
- grants +100 Account XP from the Rebirth;
- resets hero level and run gear to suit the new class;
- preserves Account Rank, Showcase, Trophies, Codex and persistent buildings.

### 19.5 Data shape

```ts
type ClassChangeState = {
  freeChangeUsed: boolean;
  lastChangedAt: number | null;
};
```

## 20. Reincarnation Integration

Reincarnation should reset the hero run, not erase account identity or long-timer investments.

### 20.1 Should reset

- hero level/XP;
- run resources such as Gold and Fragments;
- current expedition;
- temporary boss prep charges;
- current run gear/inventory unless vault exists;
- Run Camp / temporary run upgrades;
- short-lived class/run modifiers.

### 20.2 Should persist

- Account Rank;
- Rebirth count;
- Soul Marks/upgrades;
- persistent Town/Account buildings with construction timers;
- active construction timer, if any;
- claimed mastery tiers;
- current mastery XP;
- regional material stockpile;
- region collections;
- outpost unlocks/selected type;
- diary completions;
- Trait/Family Codex discoveries;
- trophies;
- Account Showcase records;
- lifetime stats.

### 20.3 Timer safety rule

```txt
If a building has a long construction timer, it persists through Rebirth.
If an upgrade resets with Rebirth, it cannot have a long construction timer.
```

This avoids the emotional failure mode where a player waits 1-3 days for an upgrade and then loses it during Rebirth.

### 20.4 Loot memory

If gear resets, trait/family discoveries must persist. Otherwise loot loses emotional value.

Possible future convenience:

- Vault slots from Account Rank;
- start with one discovered family blueprint;
- preserve one trophy-linked item as cosmetic memory, not raw power.

## 21. Currency Discipline

### 21.1 Top bar rule

Maximum three top-bar currencies, not exactly three.

Before Rebirth/Soul Marks are introduced:

```txt
Gold
Focus
```

After Rebirth/Soul Marks are introduced:

```txt
Gold
Focus
Soul Marks
```

Soul Marks should not appear as a dead number in the first session.

### 21.2 Contextual currencies

Contextual only:

```txt
Fragments
Regional materials
Account XP
Collection dust
Event tokens
```

Account XP is visible on result screens and Account/Profile, not in the top bar.

Regional materials are visible in region/town/boss-prep contexts only.

Dormant regional materials are invisible everywhere.

### 21.3 Fragment migration

Legacy materials:

```txt
ore
crystal
rune
relicFragment
```

should become:

```txt
Fragments
```

Since the game has not launched, the migration can be a clean rename: rewrite recipes/loot to use `Fragments`, remove the legacy types from the codebase. No alias layer needed.

## 22. Daily Return + Weekly Quest Detail

### 22.1 Daily Focus Charges (always available from day 1)

Daily Focus is implemented as banked charges.

```txt
Each day adds 1 Daily Focus Charge, up to 3.
Completing 3 expeditions consumes 1 charge and gives +10 Focus.
```

Example UI:

```txt
Daily Focus
Charges: 2/3
Complete 3 expeditions to claim +10 Focus.
Progress: 1/3
```

Rules:

- Available to every player from the first session.
- Reward is Focus only (no gold). This keeps top-bar tight and reinforces Focus as the engagement resource.
- Onboarding-tier daily missions may include small scarce material rewards as a one-time push.
- The player who misses two days can catch up by playing, without a broken streak message.

### 22.2 Daily Missions (unlock at Account Rank 2)

When the player reaches Account Rank 2, they unlock three randomized Daily Missions per day in addition to Daily Focus Charges.

Pool design:
- The pool is curated. Each day, the player gets one easy mission, one medium, one hard (or near-equivalent).
- Missions reset every 24 hours.
- Banking does not apply to Missions; only Daily Focus Charges bank.
- Missions must be controllable and available. Do not offer a mission if the player has not unlocked the relevant system.
- Avoid pure RNG requirements.

Example pool entries:

```txt
Easy:
- Win 2 expeditions
- Salvage 3 items
- Equip a new item

Medium:
- Gain 200 Mastery XP
- Win 4 expeditions in a single region
- Reach a mastery milestone

Hard:
- Attempt any boss
- Complete a Caravan
- Make 5 collection-eligible runs
- Advance collection pity 3 times
```

Delayed/higher-confidence hard missions:

```txt
- Defeat any boss          // only after the player has meaningful boss access/win rates
- Complete a collection    // weekly/long-term only, not daily
```

Do not use:

```txt
- Gain a collection piece  // too RNG-dependent
```

Pool grows as new systems unlock.

### 22.3 Weekly Quest (available from day 1)

A single multi-step weekly quest visible from day 1.

```txt
Weekly Quest
Clear 10 expeditions, claim 2 mastery milestones, attempt 1 boss.
Reward: Account XP, material bundle, title progress or trophy progress.
```

Rules:

- One quest per week.
- Visible all week as a progress bar.
- Completable without daily login (e.g., one big session can clear it).
- Resets weekly.
- Does not grant Soul Marks or Soul Mark shards in MVP.
- If boss attempts are not unlocked yet, the launch-week/onboarding version uses a replacement task such as `complete 12 expeditions` or `claim 1 mastery milestone`.
- Account Rank 3 can upgrade the Weekly Quest reward/table, but it does not unlock the existence of weekly play.

### 22.4 Banking and forgiveness

Daily Focus Charges bank up to 3 days. After 3 days, no more charges accumulate, but the player is not shown a shame message or a lost-streak message.

There is no visible streak counter in MVP.

### 22.5 Weekly Personal Recap

Weekly Recap is personal, not a leaderboard.

Example:

```txt
This Week

23 expeditions completed
2 mastery milestones claimed
1 boss defeated
1 relic discovered
Account Rank +1
```

No fake ranking, no fake population, no global comparison.

### 22.6 Data shape

```ts
type DailyState = {
  date: string;
  focusChargesBanked: number;   // 0..3
  focusChargeProgress: number;   // expeditions completed toward current charge
  missions: DailyMission[];
};

type DailyMission = {
  id: string;
  templateId: string;
  difficulty: "easy" | "medium" | "hard";
  progress: number;
  target: number;
  claimed: boolean;
};

type WeeklyState = {
  weekStartDate: string;
  questId: string;
  questProgress: number;
  questClaimed: boolean;
  recapSeen: boolean;
};
```

## 23. Events Schema (Post-MVP Activation)

Events are post-MVP. Schema can land early to avoid future migration.

### 23.1 Minimum schema

```ts
type EventDefinition = {
  id: string;
  name: string;
  startsAt: number;
  endsAt: number;
  themeRegionId?: string;
  bonusModifiers: EventBonusModifier[];
  rewardScheduleId: string;
};

type EventBonusModifier =
  | { type: "extraRegionalMaterial"; regionId: string; multiplier: number }
  | { type: "extraMasteryXp"; multiplier: number }
  | { type: "guaranteedThreatReveal"; regionId: string }
  | { type: "bossDoubleRewards"; bossId: string };

type EventProgressState = {
  eventId: string;
  participation: number;
  claimedRewards: number[];
};
```

### 23.2 Event reward rules

Allowed early:

- materials;
- cosmetics;
- titles;
- catch-up boosts;
- temporary bonuses;
- account showcase badges.

Avoid early:

- exclusive permanent power;
- exclusive boss counters;
- missable best-in-slot items;
- rewards that require daily login every day of the event.

---

## 24. Mobile-First UI Rules

### 24.1 Bottom nav

Maximum four tabs:

```txt
Expeditions | Hero | Town | Account
```

Account is the dedicated tab for Account Showcase (Section 4). If layout forces a different structure, Account goes in an overflow `...` menu, but the dedicated tab is the recommended target.

### 24.2 Screen rule

Every screen must have:

- one primary action;
- max two secondary actions;
- no more than 6-8 visible text lines before scrolling;
- large touch targets;
- details hidden behind progressive disclosure.

### 24.3 Expedition card

```txt
Ashroot Den
72% · 45s
Mastery 420/500 · Ember Resin +2
[Start]
```

Tap opens details.

### 24.4 Boss card

```txt
Cindermaw
Chance 68% / Max 88%
Threats: Ever-Burning covered, Crushing missing
[Prepare] [Start]
```

### 24.5 Result screen

The result screen is the dopamine screen.

It must show:

- rewards;
- mastery movement;
- account XP movement;
- collection/pity movement;
- next goal;
- Start Again.

### 24.6 Town screen

The Town screen lists all persistent buildings. The currently-constructing building shows its timer prominently.

```txt
TOWN

[Forge]      Building... Lv 7 → 8
             8h 12m remaining
             [Accelerate with Focus]

[Mine]       Lv 5
             [Upgrade — 4,500 G, 80 Ember]

[Tavern]     Lv 3
             [Upgrade — 1,200 G, 20 Timber]

[Library]    Locked
             Discover Azure Vaults

[Market]     Lv 5
             [Upgrade — 3,500 G, 50 Timber]

[Shrine]     Lv 2
             [Upgrade — 900 G]
```

Dormant material names must not appear in locked building costs.

### 24.7 Acceleration popup

When the player taps "Accelerate with Focus":

```txt
Accelerate Forge → Level 8?

Remaining: 8h 12m
Focus available: 87/200

Skip 1 hour: 15 Focus
Skip 4 hours: 60 Focus
Skip all (8h 12m): 123 Focus

[Skip 1h] [Skip 4h] [Skip All]
```

Focus spent is not refunded if construction is later canceled.

If `Skip All` exceeds 50% of Focus cap, show:

```txt
This uses most of your Focus. Consider skipping 1h or 4h instead.
```

### 24.8 Account screen action priority

Primary action:

```txt
[Go to Current Chase]
```

Secondary action:

```txt
[Copy Showcase]
```

Do not make copying/sharing the main action. The goal is word-of-mouth identity, not social spam.

## 25. Data Model Additions

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

export type ItemFamilyId =
  | "sunlitCharter"
  | "emberboundKit"
  | "azureLedger"
  | "stormglassSurvey"
  | "firstForgeOath";

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

export type RegionDiaryState = {
  completedTaskIds: string[];
  claimedRewardIds: string[];
};

export type RegionProgressState = {
  materials: Record<RegionMaterialId, number>;
  collections: Record<string, RegionCollectionState>;
  outposts: Record<string, RegionOutpostState>;
  diaries: Record<string, RegionDiaryState>;
};

export type ConstructionState = {
  activeBuildingId: string | null;
  startedAt: number | null;
  targetLevel: number | null;
  baseDurationMs: number;
  focusSpentMs: number;
};

export type FocusState = {
  current: number;
  cap: number;
  lastRegenAt: number;
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

Add to `GameState`:

```ts
focus: FocusState;
construction: ConstructionState;
dungeonMastery: Record<string, DungeonMasteryState>;
regionProgress: RegionProgressState;
bossPrep: Record<string, BossPrepState>;
accountRank: AccountRankState;
rebirth: RebirthState;
soulMarks: SoulMarksState;
accountShowcase: AccountShowcaseState;
accountPersonalRecords: AccountPersonalRecords;
dailyState: DailyState;
weeklyState: WeeklyState;
eventProgress: Record<string, EventProgressState>;
classChange: ClassChangeState;
```

---

## 26. Content Template

Every new region should follow the same authoring template.

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

Normal dungeon:

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

Boss:

```ts
Boss {
  name
  title
  oneLineFantasy
  power
  duration
  rewards
  threats[1..3]
  criticalThreat?
  scoutCost
  prepOptions
  firstClearRewards
  trophyId
  masteryRewards
  outpostUnlock
}
```

Family:

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

Diary:

```ts
Diary {
  clearTask
  masteryTask
  townOrForgeTask
  inventoryOrSalvageTask
  reward
}
```

---

## 27. Revised Implementation Phases

### Phase 0 — Launch Candidate Schema, Naming, Persistence Boundaries

Goal: lock the Launch Candidate data model and naming before gameplay systems are layered on top.

Implement:

- save migration;
- code-level `Vigor -> Focus` rename;
- Focus state with cap 200 and regen 1 per 15 minutes;
- mastery state;
- account rank state;
- rebirth state with relation to existing renown/Soul Marks system;
- Rebirth persistence boundaries: persistent Town, active construction, regional material stockpile, mastery XP, collections, outposts, diaries, codex and account data persist;
- account showcase state;
- daily/weekly state;
- event schema empty;
- region progress state (all 5 materials typed, only Sunlit/Ember active);
- boss prep state;
- construction state;
- optional cloud snapshot type only, no network calls.

Acceptance:

- old saves import cleanly;
- new state initializes empty progress;
- no gameplay behavior changes yet;
- no server dependency;
- code references to `vigor` replaced with `focus` everywhere.
- current Town buildings are classified as persistent Launch Candidate buildings.
- no Rebirth code path resets persistent Town/construction/region/account systems.

### Phase 1 — First 30 Seconds + Mastery + Result Panel + Account Rank Skeleton

Goal: brand new player wants to do a second run.

Implement:

- forced first-expedition flow;
- fast first result;
- mastery XP on success/failure;
- Account XP gain;
- Account Rank 1-3 skeleton with reward table;
- result panel with 3 bars;
- Next Goal line;
- Start Again button;
- Next Best Action card.

Acceptance:

- player can complete first run without reading tutorial;
- Start Again is obvious;
- Account Rank exists if Account XP is shown;
- repeated old dungeons have visible value.

### Phase 2 — Daily Return + Currency Cleanup + Account Showcase

Goal: player has reason to return tomorrow and a profile worth talking about.

Implement:

- Daily Focus Charges with 3-day bank;
- Daily Missions unlock at Account Rank 2;
- Weekly Quest available from day 1, with onboarding-safe task replacement before boss unlock;
- Weekly Personal Recap;
- top bar max 3 currencies, with Soul Marks hidden until discovered;
- Fragments unification (clean rewrite, no alias; replace ore/crystal/rune/relicFragment in economy-facing gameplay);
- Account Showcase screen;
- first-discovery popup at Rank 2;
- trophy shelf skeleton;
- current chase line;
- personal records;
- Copy Showcase text snippet only.

Acceptance:

- no fake ranks;
- no server;
- player can say their Account Rank, Rebirth, best boss/region;
- currency header is clean;
- Focus icon and bar visible;
- Copy Showcase works without requiring image clipboard support.
- Weekly Quest exists for a new player but never asks for locked systems.

### Phase 3 — Two Regions + Region Completion + Collection Lite

Goal: choosing a region feels meaningful.

Implement:

- Sunlit Timber active;
- Ember Resin active;
- other 3 region materials typed but dormant and invisible to player;
- region stockpile UI;
- 1-2 real sinks per material;
- Region Completion screen for 2 regions;
- Collection Lite for first region;
- pity visible;
- no duplicate collection pieces before completion.

Acceptance:

- player can explain why they farm Sunlit vs Emberwood;
- first region has a completion chase;
- no material has zero sinks;
- locked/dormant materials are not shown in UI.

### Phase 4 — Named Bosses + Prep + Failure Intel

Goal: bosses feel different from normal expeditions.

Implement:

- 2 bosses (Sunlit boss, Cindermaw in Emberwood) with names/titles/one-line fantasy;
- named threats per region table;
- scout (Focus cost by tier);
- prep (Focus cost by tier);
- boss-specific result panel;
- failure intel;
- boss trophies;
- outpost unlock placeholder if scope allows.

Acceptance:

- losing a boss feels useful;
- player knows what to try differently;
- boss is remembered by name.

### Phase 5A — Construction Launch Candidate Slice

Goal: add the long-term timer layer without touching every adjacent system.

Implement:

- construction timers only on persistent Town/Account buildings;
- construction timers start at level 1 using the short time curve;
- one active construction slot;
- no construction queue;
- Focus acceleration at 15 Focus = 1 hour;
- cancellation with 80% material refund and no Focus refund;
- in-app Town badge and return toast;
- no push notifications in MVP;
- no Rebirth-reset building uses a long construction timer.

Acceptance:

- player feels the choice between accelerating construction and using Focus elsewhere;
- construction does not create a Rebirth loss trap;
- a player returning after construction completion sees a satisfying claim/complete moment;
- empty slot does not feel punishing.
- level 1 construction teaches the timer layer without blocking the first-session loop.

### Phase 5B — Caravan Integration

Goal: strengthen offline return without adding tactical complexity.

Implement:

- Caravan region target;
- Caravan claim screen;
- active Caravan blocks starting new expeditions;
- gold + regional material + small Account XP reward;
- one slot, duration 1h-8h;
- no Focus interaction;
- no failure states.

Acceptance:

- Caravan is simple;
- player returns to claim something;
- active Caravan clearly behaves like an offline commitment, not an online parallel job;
- Caravan does not compete with construction UI complexity.

### Phase 5C — Outpost Level 1

Goal: make boss clears create regional ownership.

Implement:

- outpost level 1 after boss clear;
- one of four regional bonuses;
- cheap/free respec during testing;
- outpost shown in Region Completion.

Acceptance:

- outpost gives regional identity;
- collection RNG does not block outpost unlock.

### Phase 5D — Class Change

Goal: provide a safety net for class regret.

Implement:

- early free respec before Rebirth unlock, no Soul Marks;
- true post-Rebirth class change triggers Rebirth;
- first change free if unused;
- subsequent changes require Soul Marks + cooldown.

Acceptance:

- class regret has an escape hatch;
- no player accidentally triggers prestige before understanding Rebirth;
- free early respec cannot farm Soul Marks.

### Phase 6 — Loot Traits + Families + 2 Presets

Goal: builds become readable and switchable.

Implement:

- one-trait generation for new items;
- tactical traits;
- regional traits;
- progress utility traits;
- family resonance for active MVP families (Sunlit Charter, Emberbound Kit);
- other 3 families typed but gated from loot pool;
- 2 build presets;
- equip best for boss/region;
- lock items.

Acceptance:

- item cards are shorter than before;
- lower-power contextual item can be clearly better;
- swapping does not feel like chores.

### Phase 7 — Full Collections + Codex + Region Diaries + Caravan Mastery

Goal: long-term completion spine.

Implement:

- collections for more regions (as new regions are added);
- Trait Codex (UI unlocked at Account Rank 10);
- Family Codex (UI unlocked at Account Rank 10);
- region diary tier 1;
- Caravan Mastery system;
- collection/trophy/account showcase integration.

Acceptance:

- old regions stay useful;
- discoveries persist through reincarnation;
- diaries encourage breadth without blocking main progress.

### Phase 8 — Additional Regions + Soul Mark Upgrades Extension

Goal: open up the rest of the world.

Implement:

- activate Azure Vaults (Archive Glyphs);
- activate Stormglass Peaks (Stormglass Shards);
- activate First Forge (Oath Embers);
- region-specific outpost variations (optional);
- additional Soul Mark upgrade slots;
- expanded Focus cap progression through higher Account Ranks.

### Phase 9 — Events Activation / Optional Cloud Showcase / Optional PWA Push

Goal: prepare launch polish, not core progression.

Implement only if core loop is validated:

- first non-punitive event;
- event banner;
- event reward schedule;
- optional public Account Showcase only if trivial and safe;
- optional push notifications only after explicit opt-in and only for construction/caravan completion.

Acceptance:

- no exclusive permanent power;
- no fake rankings;
- no cloud dependency for normal play;
- no rewards for sharing;
- no push notification dependency for retention.

## 28. First Month Plan

### Week 1 — First 30 Seconds + Mastery

Implement Phase 0 + Phase 1.

Playtest target:

```txt
A new player taps Start Again within 30 seconds of finishing the first expedition.
```

Questions:

```txt
What did you gain?
What are you doing next?
Why would you run this again?
```

### Week 2 — Daily Return + Account Showcase + Currency Cleanup

Implement Phase 2.

Playtest target:

```txt
A player can say: "I'm Account Rank X, my best boss/region is Y, and I'm chasing Z."
```

Questions:

```txt
Would you tell a friend your Account Rank?
Which trophy feels coolest?
What does your current chase mean?
Did Daily Focus Charges feel forgiving or confusing?
```

### Week 3 — Regional Identity + Collection Lite

Implement Phase 3.

Playtest target:

```txt
Player can name why they would farm Emberwood vs Sunlit Marches in one sentence.
```

Questions:

```txt
Which region do you want to complete?
Does missing one relic make you want another run?
Are materials understandable or noisy?
Did any locked material/building reveal names you don't understand?
```

### Week 4 — Bosses + Prep + Construction Launch Candidate Partial

Implement Phase 4 and the safest slice of Phase 5A.

Do not attempt full Phase 5B/5C/5D unless Phase 4 is already stable.

Playtest target:

```txt
Losing a boss feels like progress, not punishment.
A player decides to spend Focus on a construction instead of a reward boost at least once.
```

Questions:

```txt
Do you remember the boss name?
Do you know what counter/prep you need?
Did you accelerate a construction? Why?
Did Focus feel scarce or abundant?
Did the construction timer feel like a return hook or a punishment?
```

After Week 4, stop and evaluate before adding loot families/codex complexity.

## 29. Unlock Sequencing

### First 30 seconds

- Hero exists.
- One expedition button visible.
- Tap → animation → result with progress bars.
- Start Again pulses.

### First 5 minutes

- 2-3 expeditions completed.
- First mastery milestone claimed.
- First item equipped or auto-suggested.
- Account Rank visible.
- Daily Focus Charge appears.

### First 15 minutes

- First region material drop visible.
- Account screen discovered (auto-popup at Rank 2).
- Current Chase visible.
- First Town sink preview.
- First collection slot visible.

### First hour

- First boss preview.
- First named threat.
- First Daily Mission cycle if Rank 2 reached.
- First Weekly Quest progress visible.
- First Account Showcase trophy or title progress.
- Caravan unlocked or previewed.
- First persistent construction timer previewed or started if Town is unlocked.

### First day

- One boss attempted.
- One Daily Focus Charge completed.
- Weekly Quest progress meaningfully advanced.
- One region completion goal chosen.
- Rebirth/Soul Mark preview seen only if progression makes it relevant.
- One construction completed or accelerated with Focus.

### First week

- 3+ daily returns.
- One boss cleared.
- First Account Rank reward claimed.
- First collection completed or nearly completed.
- First outpost choice if Phase 5C exists.
- First class-change consideration moment if Phase 5D exists.
- Focus rotation pressure starts to be felt (construction vs boost vs scout).

## 30. Testing Requirements

Core tests:

- old save migration fills missing structures;
- default state contains mastery/region/account/showcase/daily/focus/construction structures;
- normal expedition success chance unchanged before threat systems;
- success grants full mastery XP;
- eligible failure grants partial mastery XP;
- ineligible impossible failure does not become farming exploit;
- mastery tier rewards are claimable once;
- Account XP appears only if Account Rank exists;
- top bar contains no more than 3 currencies;
- Soul Marks are hidden until discovered/unlocked;
- region materials awarded by zone;
- material with no sink is not surfaced;
- dormant region materials never drop and never display;
- locked dormant buildings do not show dormant material costs/names;
- collection pity forces missing piece after threshold;
- collection drops give missing pieces before duplicates;
- daily missions never require pure RNG drops;
- Daily Focus Charges bank up to 3 and consume on completion;
- Weekly Quest does not grant Soul Marks/Soul Mark shards in MVP;
- boss missing critical threat caps max chance;
- temporary prep can cover missing critical threat;
- equipped counter beats temporary prep;
- generated new items have at most one explicit trait;
- family resonance activates at 2 and upgrades at 3;
- only one active family resonance is used in MVP;
- dormant families do not appear in loot;
- locked items cannot be salvaged;
- Account Showcase signature updates from state;
- Copy Showcase copies text without requiring server/image support;
- no fake rank appears anywhere;
- Focus rename is complete (no `vigor` references in code);
- Focus starts at cap 200;
- Focus regenerates at 1 per 15 minutes;
- construction timer completes correctly with and without acceleration;
- Focus acceleration uses 15 Focus per hour;
- Focus acceleration is not refunded on cancellation;
- construction cancellation refunds 80% of materials;
- one-slot construction rule enforced;
- empty construction slot does not grant phantom progress;
- construction-timer buildings persist through Rebirth;
- regional material stockpile persists through Rebirth;
- current mastery XP persists through Rebirth;
- Rebirth-reset temporary upgrades do not use long timers;
- early class change before Rebirth unlock does not grant Soul Marks;
- post-Rebirth class change triggers Rebirth correctly;
- class change first use is free, second use requires Soul Marks + cooldown;
- true Rebirth grants Soul Marks + 100 Account XP;
- Account Rank persists through Rebirth.

Mobile tests:

- every primary button is easy to tap;
- each screen has one primary action;
- result screen works without reading a paragraph;
- account screen can be understood in under 10 seconds;
- boss screen shows missing answer clearly;
- town screen shows construction timer prominently;
- acceleration popup is readable on small screens;
- Copy Showcase is secondary to Go to Current Chase.

Balance tests:

- Focus regenerates at expected rate (1 per 15 min);
- Focus cap 200 plus 1 per 15 min regen gives roughly 50 hours from empty to full;
- Focus cap matches Account Rank reward table;
- construction time curve creates Focus pressure rotation by Account Rank 4-6;
- first 30 seconds remains under timing target;
- daily mission pool generates appropriate easy/medium/hard distribution;
- Caravan and Focus do not interact;
- daily players are not punished by Focus cap filling too quickly;
- a 3-day construction cannot be fully skipped from one Focus cap.

## 31. Metrics And Playtest Questions

### 31.1 Instrumentation events

```txt
page_loaded
first_tap
first_expedition_started
first_result_seen
start_again_tapped
first_mastery_claimed
account_rank_seen
account_screen_opened
account_showcase_popup_seen
account_showcase_copied
current_chase_seen
daily_focus_charge_completed
daily_mission_completed
weekly_claimed
region_material_earned
collection_piece_found
boss_preview_seen
boss_attempted
boss_failed
boss_retried_after_failure
construction_started
construction_completed
construction_accelerated
construction_cancelled
focus_spent_on_boost
focus_spent_on_scout
focus_spent_on_prep
focus_spent_on_construction
caravan_sent
caravan_claimed
class_change_opened
class_change_confirmed
early_class_respec_used
rebirth_triggered
```

No server analytics are required for early testing. These can be local logs or manual observation first.

### 31.2 Core metrics

- first run completion;
- Start Again rate after first result;
- time to first mastery claim;
- time to account screen open;
- daily return rate in friend tests;
- voluntary old-dungeon repeats;
- collection near-completion retries;
- boss retry after failure;
- time spent in inventory before boss;
- accidental salvage reports;
- Caravan claim returns;
- distribution of Focus spending across the four sinks by Account Rank tier;
- construction completion vs cancellation rate;
- construction acceleration rate;
- early class respec usage;
- Copy Showcase usage, if present.

### 31.3 Playtest questions

Ask players:

```txt
What is your next goal?
Why did you choose this expedition?
What does your Account Rank mean?
What would you tell a friend about your account?
Did any lower-power item look worth keeping?
Did a failure still feel useful?
Did the boss feel memorable?
Did the region material make you want to farm a specific region?
Did you accelerate a construction? Why?
What did you spend Focus on this session? Why?
Was Focus scarce or abundant?
Did Daily Focus feel like a bonus or an obligation?
Did construction feel like anticipation or a wall?
```

If players cannot answer these, the UI/system is not ready.

## 32. Cut Lines

### Do not cut

- first 30 seconds flow;
- result progress bars;
- Dungeon Mastery;
- Account Rank skeleton;
- Account Showcase;
- Daily Focus Charges with 3-day bank;
- Next Goal / Current Chase;
- two-region material identity;
- Collection Lite with pity;
- named bosses;
- boss failure intel;
- currency cleanup;
- save migration;
- Focus rename;
- daily-friendly Focus regen/cap;
- construction timers on persistent buildings;
- one-slot construction rule;
- Rebirth/timer safety rule.

### Cut first if scope gets tight

1. Region Diaries.
2. Outpost upgrades beyond unlock.
3. Full Codex UI (keep tracking silently).
4. Event activation.
5. Optional cloud showcase.
6. Optional push notifications.
7. Extra regions/materials beyond two.
8. Extra families.
9. Caravan mastery.
10. Advanced daily mission pool.
11. Region-specific outpost variations.
12. Screenshot/image version of Copy Showcase.

### Do not build in MVP

- fake Hiscores;
- global rank placeholder;
- guilds;
- friend list;
- invite rewards;
- PvP;
- social spam;
- generic elemental damage system;
- full enemy tags on every normal expedition;
- 4-piece/5-piece sets;
- multiple family resonances;
- sockets/gems;
- collection trading;
- server-authoritative progression;
- exclusive event best-in-slot power;
- construction queues;
- gold-based construction acceleration;
- Focus refund on construction cancel;
- push notifications as a dependency;
- Rebirth-wiped long-timer buildings;
- Soul Mark shards from dailies/weeklies.

## 33. Risk Register

### Risk 1: Day 0 churn

Mitigation:

- first 5 seconds meaningful tap;
- first 30 seconds visible win;
- no tutorial wall;
- Start Again.

### Risk 2: Day 1 churn

Mitigation:

- Daily Focus Charges with bank;
- Weekly Quest from day 1 with onboarding-safe tasks;
- Current Chase;
- Caravan preview/claim;
- Account Showcase identity;
- construction timer running while logged out.

### Risk 3: System soup

Mitigation:

- two regions only in MVP;
- Collection Lite before full Codex;
- only contextual currencies;
- progressive disclosure;
- dormant materials/families invisible.

### Risk 4: Inventory friction

Mitigation:

- one-trait items;
- presets before build complexity;
- equip best for boss/region;
- item locks.

### Risk 5: Fake social breaks trust

Mitigation:

- no fake population;
- Account Showcase instead of Hiscores;
- optional real public profiles only later.

### Risk 6: Daily design feels manipulative

Mitigation:

- Daily Focus Charges bank up to 3;
- no permanent streak loss;
- no missed exclusive power;
- weekly goals do not require every day;
- no RNG-only daily missions.

### Risk 7: Cloud scope creep

Mitigation:

- no server in MVP;
- optional cloud stores only showcase snapshot;
- no gameplay dependency;
- no ranks.

### Risk 8: Reincarnation erases emotional loot

Mitigation:

- Trait/Family discoveries persist;
- trophies persist;
- Account Rank persists;
- future vault slots.

### Risk 9: Construction timers feel punishing

Mitigation:

- empty slot does not hurt;
- Focus acceleration always available;
- cancellation with 80% refund;
- early levels (1-3) are short, not instant;
- "not recommended" hint when Focus cost is excessive;
- long-timer buildings persist through Rebirth.

### Risk 10: Focus has no good use at some progression point

Mitigation:

- four distinct sinks always available;
- pressure rotation tuned so at every phase, at least one sink is valuable;
- Reward Boost remains a universal fallback.

### Risk 11: Class change creates exploits

Mitigation:

- early pre-Rebirth class change is a free respec, not a Soul Mark source;
- post-Rebirth class change triggers true Rebirth;
- first change free, second requires Soul Marks + 7-day cooldown;
- no class-specific exclusive Soul Mark upgrades that could be farmed via change.

### Risk 12: Push notifications hide technical scope

Mitigation:

- no push notifications in MVP;
- in-app badges/toasts only;
- optional PWA push later, explicit opt-in, construction/caravan completion only.

### Risk 13: Phase 5 scope creep

Mitigation:

- split Phase 5 into 5A Construction, 5B Caravan, 5C Outpost, 5D Class Change;
- ship 5A alone if necessary;
- do not make Phase 5 a single giant release.

## 34. Success Criteria

The 4.2.1 plan is succeeding if:

- a new player completes 3 expeditions in the first session without reading a tutorial;
- the player taps Start Again after the first result;
- the player can name their next goal in one sentence;
- the player returns to claim a daily, a construction, or a Caravan result;
- the player can say their Account Rank and current chase;
- a boss is remembered by name;
- losing a boss leads to a retry/prep plan;
- a region choice feels meaningful;
- collection pity creates "one more run" without frustration;
- Account Showcase creates real word-of-mouth comparison;
- Copy Showcase exists only as a local/manual helper, not a fake social layer;
- no player sees fake ranking/population;
- item reading gets easier, not harder;
- the player spends Focus on different sinks at different progression phases;
- Focus cap/regen supports daily play without forcing multiple daily logins;
- at least one construction is accelerated with Focus by the end of week 2-3;
- construction timers do not conflict with Rebirth;
- class change exists as a safety net for class regret without creating Soul Mark exploits.

## 35. External Patterns Used

Use these as inspiration, not as copy targets.

### Shakes & Fidget

Useful patterns:

- tavern/adventure routine;
- dungeon gates;
- Hall of Fame as real social visibility (only with real server);
- multiple systems unlocked over time;
- daily tasks.

Do not copy:

- overly cluttered late-game UI;
- any social pressure that does not fit the game.

### Melvor Idle / RuneScape

Useful patterns:

- many actions feeding permanent progress;
- skills/mastery identity;
- offline progression;
- completion logs;
- breadth-based account pride.

Do not copy:

- too many visible systems too early;
- bank/inventory complexity without strong filters.

### Travian

Useful patterns:

- resources tied to planning;
- buildings/outposts as long-term identity;
- territorial/economic flavor;
- construction timers as core gameplay.

Do not copy:

- heavy PvP pressure;
- punishments that make casual friends quit;
- multiple parallel construction slots gated behind premium.

### Forge of Empires

Useful patterns:

- per-building independent timers;
- timer-as-strategic-decision;
- notification-driven return.

Do not copy:

- aggressive monetization of acceleration.

### Lost Vault

Useful patterns:

- Caravan-style asynchronous offline reward;
- upgradeable expedition vehicles.

### FarmVille / CityVille / Mafia Wars

Useful patterns:

- appointment return;
- collections;
- properties/outposts;
- social bragging.

Do not copy:

- spam invites;
- friend-required progression;
- hard expiration punishment.

### Warframe / Diablo-style build identity

Useful patterns:

- build identity;
- counters;
- powers/traits that change decisions;
- codex-style permanence.

Do not copy:

- item text walls;
- too many slots/mods/affixes;
- build friction without presets.

---

## 36. Source Notes

Primary source documents:

- `chosen_hybrid_expedition_implementation.md` (3.0)
- `chosen_hybrid_expedition_implementation_4_0.md` (4.0)
- `chosen_hybrid_expedition_implementation_4_1.md` (4.1)

External references to verify current assumptions before implementation:

- Firebase pricing/docs: https://firebase.google.com/pricing
- Firebase pricing plans: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- Firestore pricing/free quota: https://cloud.google.com/firestore/pricing
- Supabase pricing: https://supabase.com/pricing
- Supabase billing docs: https://supabase.com/docs/guides/platform/billing-on-supabase
- Google Android touch target guidance: https://support.google.com/accessibility/android/answer/7101858
- Nielsen Norman Group progressive disclosure: https://www.nngroup.com/articles/progressive-disclosure/
- Shakes & Fidget Help Center: https://playa-games.helpshift.com/
- Melvor Idle Steam page: https://store.steampowered.com/app/1267910/Melvor_Idle/
- OSRS official site / HiScores: https://oldschool.runescape.com/
- Travian support: https://support.travian.com/

Use official/current docs for pricing, quotas and technical choices. Treat fandom/SEO blogs as inspiration only, not authority.

---

## 37. Final One-Sentence Summary

> Build the smallest local-first mobile loop where a player taps Start Expedition, sees satisfying progress, knows the next goal, returns tomorrow without punishment, watches a construction tick toward completion or accelerates it with Focus, defeats memorable bosses, grows an Account Rank that never resets, and has an Account Showcase worth talking about — with optional cloud showcase only after the core loop is already fun.
