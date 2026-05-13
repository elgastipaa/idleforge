Generate Launch Candidate content data for Forge Idle without changing game systems or code.

  Context:
  - This repo is Forge Idle.
  - Treat docs/design/implementation_4_2_1.md as the locked Launch Candidate spec.
  - Do not redesign the spec.
  - Do not implement code.
  - Do not edit implementation_4_2_1.md.
  - Create one new markdown file: docs/design/launch_candidate_content_tables.md
  - If the file already exists, update it carefully.
  - Read src/game/content.ts and src/game/types.ts only to align names, IDs, and current content style.

  Task:
  Generate conservative, implementation-ready content tables for early Launch Candidate Phases 1-3, plus boss seed data for Phase 4.

  Required output sections:

  1. ID conventions
  - Recommend stable IDs for regions, expeditions, bosses, materials, collections, trophies, titles, traits, families.
  - Use lowercase kebab-case unless current repo strongly suggests otherwise.

  2. Active regions
  - Sunlit Marches
  - Emberwood
  For each region include:
  - region id
  - material id/name
  - short identity/fantasy
  - gameplay role
  - dormant/active status

  3. Expeditions
  Create 3 expeditions per active region.
  For each expedition include:
  - id
  - region
  - display name
  - one-line fantasy
  - unlock order
  - rough power target
  - rough duration
  - primary reward identity
  - mastery tier reward theme
  - optional future threat flavor, but do not make normal expeditions threat-heavy

  4. Mastery milestones
  For each expedition define Tier 1/2/3 rewards:
  - Tier 1 should be small and early
  - Tier 2 should create repeat value
  - Tier 3 should feel like completion
  Include Account XP, local material, small permanent bonus, title/trophy candidates where appropriate.
  Keep numbers conservative.

  5. Collections Lite
  For each active region create a 4-piece collection:
  - collection id/name
  - 4 piece ids/names
  - completion reward
  - trophy/title candidate
  - notes on fantasy
  Respect anti-duplicate/pity direction from implementation_4_2_1.md.

  6. Bosses
  Create 1 named boss per active region.
  For each boss include:
  - boss id
  - region
  - name
  - title
  - one-line fantasy
  - power target
  - duration target
  - threats from allowed keys only: armored, cursed, venom, elusive, regenerating, brutal
  - critical threat if any
  - scout cost
  - prep cost
  - first clear rewards
  - failure intel text
  - trophy id/name
  - outpost unlock suggestion

  7. Boss prep answers
  For each active boss threat include:
  - threat key
  - player-facing threat name
  - best trait answer
  - family/prep/outpost alternative
  - simple UI explanation text

  8. Regional material sinks
  For Sunlit Timber and Ember Resin list early sinks:
  - Town building upgrade examples
  - boss prep examples
  - collection/outpost/crafting examples
  Do not use dormant materials in visible early costs.

  9. Account Rank rewards, Rank 1-10
  Turn the spec’s reward table into concrete player-facing labels and short descriptions.
  Do not add huge power multipliers.

  10. Titles and trophies
  Create a starter set of:
  - 8 titles
  - 8 trophies
  For each include:
  - id
  - name
  - unlock condition
  - showcase priority
  - whether it is Phase 1/2/3/4

  11. Daily/Weekly mission templates
  Create safe early templates:
  - Daily Focus charge text
  - Daily Missions unlocked at Account Rank 2
  - Weekly Quest available from day 1
  Avoid pure RNG objectives.
  Include onboarding replacement for boss task before bosses unlock.

  Constraints:
  - Launch Candidate, not a tiny MVP, but keep early content conservative.
  - Only Sunlit Marches and Emberwood are active at first.
  - Dormant regions/materials/families may be typed but must not appear as player-facing drops/costs.
  - No fake social, no PvP, no server assumptions.
  - No multi-affix item walls.
  - Item direction is one explicit trait plus optional family.
  - Family resonance is 2/3 items, only one active family.
  - Legendary means one signature trait plus family.
  - Caravan is an offline commitment and blocks starting expeditions while active.
  - Focus cap is 200 and regen is 1 per 15 minutes.
  - Rebirth resets hero run, not persistent Town/account systems.
  - Construction timers apply only to persistent buildings and start at level 1 with short early timers.

  Final response:
  - Summarize what file you created.
  - List any assumptions.
  - Do not implement code.
