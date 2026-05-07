/goal Implement Relic Forge Idle v1.0 end-to-end from the planning docs in this repo.

Use Next.js, TypeScript, Tailwind, Zustand, Vitest, React, lucide-react if useful, and localStorage. Keep all core deterministic simulation logic under src/game. Build the mobile-first text/card idle RPG described in the docs: expeditions, timers, rewards, XP, loot, equipment, sell/salvage, town upgrades, unlocks, achievements, save/export/import, offline progress, and prestige.

Core game concept:
The player is the guildmaster of a fantasy relic-hunting guild. They recruit heroes, send them on timed expeditions, recover loot and materials, upgrade an ancient guild town built around a magical forge, unlock harder dungeons, defeat bosses, and eventually prestige into a stronger guild dynasty.

Core interaction loop:
send hero on expedition -> wait for timer -> resolve expedition -> receive gold/materials/XP/loot -> equip/sell/salvage loot -> upgrade town -> unlock harder dungeons -> prestige.

Theme/tone:
Colorful heroic fantasy with a slightly mischievous old-school browser RPG feeling. Inspiration: World of Warcraft, Kingdoms of Amalur, MU Online, Shakes & Fidget, classic fantasy guilds, magical relics, dungeons, taverns, ancient ruins, enchanted forges, bosses, loot, and heroic progression.
The tone should be adventurous, satisfying, magical, and lightly humorous when appropriate, but not parody-first. Avoid full grimdark. Avoid generic corporate minimalism. Make it feel like a fantasy game, not a productivity dashboard.

Visual direction:
Use a polished mobile-first fantasy card UI that is cheap to build but addictive to interact with.
Prefer:
- Clean modern cards with fantasy flavor
- Warm parchment, deep blue, purple, gold, emerald, and ember accents
- Rarity colors for loot
- Clear stat comparisons
- Progress bars
- Compact resource chips
- Hero cards
- Dungeon cards
- Building upgrade cards
- Reward summary modals/toasts
- Small icons via lucide-react or simple emoji if helpful
- Subtle Tailwind/CSS transitions only

Do not use:
- Sprites
- Canvas
- Phaser
- Pixi
- 3D
- Animated combat
- Complex animations
- Procedural maps
- Heavy fantasy ornamentation that slows development

Target priority:
Mobile-first from the beginning. Desktop should also work well, but mobile usability is more important.
On mobile, the game should be easy to play one-handed with clear tabs/sections.
On desktop, use the extra width for multi-column cards/panels when helpful.

Autonomy:
Make reasonable product, design, balance, and technical decisions and finish the MVP without asking follow-up questions unless a decision would fundamentally violate the scope. Prefer shipping a complete simple version over stopping for clarification. If uncertain, choose the simpler option.

Scope strictness:
Very strict MVP scope.
No backend.
No accounts.
No multiplayer.
No PvP.
No chat.
No trading.
No cloud saves.
No real-money payments.
No in-game purchases.
No ads implementation.
No sprites.
No canvas.
No Phaser.
No Pixi.
No 3D.
No animated combat.
No procedural maps.
No external game engine.
No feature creep.

Required MVP content:
- 3 hero classes: Warrior, Rogue, Mage
- 5 zones
- 4 dungeons per zone
- Boss or milestone dungeon at the end of each zone
- 5 equipment slots: weapon, helm, armor, boots, relic
- 4 item rarities: common, rare, epic, legendary
- Procedural loot with affixes
- Equip, sell, and salvage actions
- Materials and gold economy
- XP and hero leveling
- 6 buildings: Forge, Mine, Tavern, Library, Market, Shrine
- Building upgrades with clear benefits
- At least 20 achievements
- Prestige system with permanent renown upgrades
- Offline progress
- Auto-save
- Export/import save
- Reset save option with confirmation
- Responsive mobile-first UI
- Basic onboarding/tutorial hints
- Clear next-goal guidance

Pacing:
The first 5 minutes must be satisfying.
The player should complete several short expeditions quickly.
Initial expedition durations should include very short timers like 15s, 30s, 60s, and 3m.
The first major unlock should happen within 5-10 minutes.
The first prestige should be achievable in roughly 90-150 minutes of active/semiactive play.
Include a dev/debug balance mode where first prestige can be reached in 5-10 minutes for testing, but production balance should use the 90-150 minute target.

Gameplay feel:
Prioritize a satisfying addictive loop over content quantity.
The player should always have a clear next goal.
Always show:
- Current expedition status
- Time remaining
- Success chance
- Possible rewards
- Next unlock
- What changed after equipping an item
- What a building upgrade improves
- How close the player is to prestige

Loot should feel exciting:
- Use rarity colors
- Use affixes
- Show clear stat comparisons
- Allow equip, sell, and salvage
- Make rare/epic/legendary drops feel special even with text-only UI
- Reward summaries should feel satisfying

Combat:
Do not implement visual combat.
Do not implement tactical combat.
Do not implement real-time combat.
Expeditions resolve through deterministic formulas based on hero power, dungeon power, class modifiers, gear, buildings, and luck.
A generated text combat report is allowed and encouraged if simple, but it must not become a complex combat engine.

Architecture:
- Keep game logic deterministic and testable.
- Put core simulation under src/game.
- Prefer pure functions for game state updates.
- UI should call game actions through a clean store/action layer.
- Use Zustand for app/game state.
- Use localStorage for persistence.
- Implement save versioning/migration in a simple way.
- Support export/import as JSON.
- Avoid unnecessary dependencies.
- Do not add a backend, database, auth, payment provider, or game engine.

Suggested src/game structure:
- types.ts
- constants.ts
- content.ts
- state.ts
- engine.ts
- expeditions.ts
- loot.ts
- heroes.ts
- town.ts
- prestige.ts
- achievements.ts
- save.ts
- balance.ts

Quality bar:
Production-quality TypeScript.
Core simulation must be unit tested with Vitest.
Build must pass.
Typecheck must pass if configured.
Lint should pass if configured.
Dev server should run successfully.
No broken UI states.
No TODO-only placeholder systems for required MVP features.
Every required system should be playable end-to-end.
The game should be deployable as a static web app if the project setup allows it.

Planning/docs behavior:
Before or during implementation, create or update concise docs in /docs:
- GAME_DESIGN.md
- TECHNICAL_ARCHITECTURE.md
- MVP_SCOPE.md
- BALANCE_PLAN.md
- TASK_BREAKDOWN.md
- VERSION_1_0_DEFINITION.md

Do not stop after only creating docs.
Use the docs as implementation guidance and keep them aligned with the actual implementation.

Implementation behavior:
Implement the MVP end-to-end.
Do not leave required systems as stubs.
Do not expand beyond scope.
When tradeoffs appear, choose the simplest implementation that produces a playable, polished v1.0.
Run tests and build.
Start a dev server when ready and give me the URL.

Final response should include:
- What was implemented
- Any scope cuts made and why
- How to run the app
- Test/build status
- Dev server URL
- Known issues or recommended next steps