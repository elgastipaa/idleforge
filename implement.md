/goal Implement Relic Forge Idle v1.0 end-to-end following the finalized docs and TASK_BREAKDOWN.md.

Use Next.js, TypeScript, Tailwind, Zustand, Vitest, React, lucide-react if useful, and localStorage.

Hard requirements:
- Implement the complete playable v1.0.
- Keep core deterministic game logic under src/game.
- Keep Zustand as a thin state/action layer.
- Do not put core formulas inside React components.
- Do not put core formulas inside the Zustand store.
- Do not add backend, accounts, multiplayer, payments, ads, canvas, Phaser, Pixi, 3D, sprites, or animated combat.
- Do not expand scope beyond the docs.
- If a documented feature is too large, implement the simplest playable version and document the cut.

Implementation priority:
1. Core game state and deterministic engine
2. Save/load/export/import
3. Character creation
4. Expedition system
5. Loot/inventory/equipment
6. Forge/crafting
7. Town buildings
8. Regions/bosses
9. Dailies/Vigor
10. Offline progress
11. Reincarnation
12. Achievements
13. Mobile-first UI
14. Balance pass
15. Tests/build/polish

Quality bar:
- The game must be playable from new save to first reincarnation.
- First 15 minutes must feel satisfying.
- First reincarnation should be reachable in 30-60 minutes in production balance.
- Include a dev/debug balance mode for testing faster progression.
- Core systems must have Vitest coverage.
- Build must pass.
- Dev server must run.
- No required system should be left as a stub.
- Update docs if implementation differs.

At the end:
- Run tests
- Run build
- Start dev server
- Give me the local URL
- Summarize what was implemented
- List any cuts or known issues