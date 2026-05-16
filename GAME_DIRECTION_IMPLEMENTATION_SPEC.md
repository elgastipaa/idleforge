# GAME_DIRECTION_IMPLEMENTATION_SPEC.md

## 1. Principios de implementación

Este spec traduce `GAME_DIRECTION_2.md` al juego real sin reescribir el engine. La dirección es **Relic Forge Idle: Frontier Guild**: una capa de UI, copy y priorización que convierte sistemas existentes en una experiencia de guild/base/frontera más clara.

Principios:

- Reusar estado existente: `GameState.town`, `construction`, `activeExpedition`, `caravan`, `dailies`, `weeklyQuest`, `eventProgress`, `regionProgress`, `bossPrep`, `dungeonMastery`, `prestige`, `soulMarks`.
- Mantener local-first: sin backend, cuentas, PvP, chat, cloud obligatorio, gacha ni monetización.
- No crear city grid libre: el launch usa **Guildhall Slot Grid**, sin drag/drop, roads, decoraciones ni edificios funcionales repetidos.
- No mover lógica al UI: cualquier regla nueva de unlock/progreso que afecte gameplay debe vivir en `src/game/*`, exponerse por store y tener tests.
- Priorizar Phase A como UI/copy: el primer slice debe poder hacerse usando helpers actuales y `town[buildingId] === 0` como ruina/fundación visual.
- Marcar explícitamente gaps: si algo requiere schema nuevo, save migration o test de dominio, no se debe esconder como "polish".
- No romper promesas: si la UI dice "Mine offline", "Caravan daily", "weekly chest" o "building locked", el engine debe cumplirlo o la copy debe ajustarse.

## 2. Estado actual reutilizable

| Sistema actual | Archivos actuales | Qué aporta al nuevo direction | Gap actual | Riesgo |
|---|---|---|---|---|
| Town/buildings | `src/game/content.ts`, `src/game/town.ts`, `src/game/types.ts`, `src/app/game-view.tsx` | 6 edificios únicos (`forge`, `mine`, `tavern`, `library`, `market`, `shrine`) con nivel 0-12, propósito, milestones, costos, timers y efectos. Base perfecta para Guildhall Slot Grid v0. | No hay slots, locks visuales por edificio, `Guildhall`, `Caravan Yard` ni `War Room` como building real. Todos los edificios existen en data desde el inicio. | Bajo para UI-only. Medio si se agregan locks/buildings nuevos al schema. |
| Construction | `src/game/town.ts`, `src/game/offline.ts`, `src/store/useGameStore.ts`, `src/app/game-view.tsx` | Una construcción activa, costos regionales, timers, claim/cancel, aceleración por Focus, offline ready. | No hay cola múltiple ni prerequisitos por building. El claim es manual aunque offline marque ready. | Bajo para re-skin; medio si cambia cola/unlocks. |
| Expeditions | `src/game/content.ts`, `src/game/expeditions.ts`, `src/game/engine.ts`, `src/store/useGameStore.ts` | 20 rutas, 5 regiones, timers, unlock por nivel/ruta previa, result summary, next goal, recommended dungeon. | La UI las presenta como rutas/lista, no como órdenes de frontera. Offline no auto-resuelve expedición, solo marca ready. | Bajo para framing; alto si se cambia resolución offline. |
| Regions | `src/game/regions.ts`, `src/game/content.ts`, `src/game/progression.ts` | 5 regiones, materiales, completion, regional sinks, active region ids. Base para Frontier Map v0. | No hay mapa visual ni "front state" agregado; el estado hay que componer desde helpers. | Bajo para UI-only. |
| Boss prep | `src/game/bosses.ts`, `src/game/outposts.ts`, `src/app/game-view.tsx` | Bosses nombrados, threats, scout, prep, Focus/material costs, intel, counters por trait/outpost/family. Base para War Room. | Hoy vive dentro de cada boss card; no hay War Room global persistente. | Bajo para UI-only; medio si se agregan daily boss/hunt. |
| Caravan | `src/game/caravan.ts`, `src/game/offline.ts`, `src/store/useGameStore.ts`, `src/app/game-view.tsx` | Focuses `xp/gold/fragments`, regiones desbloqueadas, duración 1h-8h cap, mastery por región, offline progress, rewards. | Bloquea expedición activa. `complete_caravan` progresa al claim, pero la daily template no aparece porque `hasCaravanDailyObjectiveUnlocked` devuelve false. | Bajo para copy; medio para desbloquear daily; alto para simultaneidad expedition+caravan. |
| Outposts | `src/game/outposts.ts`, `src/game/regions.ts`, `src/app/game-view.tsx` | Bonus regionales `supply-post`, `watchtower`, `relic-survey`, `training-yard`; unlock tras boss clear. | No se sienten como puestos visuales/proyectos. No hay niveles/proyectos más allá de `level: 1`. | Bajo para map framing; medio para Outpost Projects. |
| Dailies/weekly | `src/game/dailies.ts`, `src/game/content.ts`, `src/store/useGameStore.ts`, `src/app/game-view.tsx` | Daily Focus, daily missions desde Account Rank 2, weekly quest, legacy weekly milestones. | `weekly.progress` legacy no se actualiza; `complete_caravan` no se sortea; sistemas están separados visualmente. | Bajo para Orders Board UI; medio para arreglos de progreso. |
| Events | `src/game/events.ts`, `src/store/useGameStore.ts`, `src/app/game-view.tsx` | `Guild Foundry Festival`, participation por expedición, tiers claimables, bonus temporales no punitivos. | Solo hay un evento largo; la UI es banner, no parte del Command Center/Orders. | Bajo para reubicación UI; medio para calendario/rotación. |
| Collections | `src/game/collections.ts`, `src/game/types.ts`, `src/game/progression.ts`, `src/app/game-view.tsx` | Collections por región, pity, completion rewards, dust por duplicados. | Dust existe pero no tiene sink activo visible. | Bajo para mostrar; medio para gastar dust. |
| Mastery | `src/game/progression.ts`, `src/game/types.ts`, `src/app/game-view.tsx` | Mastery XP por dungeon, tiers `Mapped/Known Route/Mastered`, claim rewards, next claimable helpers. | Claimables no están centralizados en Orders Board/Command Center. | Bajo para UI-only. |
| Reincarnation | `src/game/prestige.ts`, `src/game/progression.ts`, `src/game/constants.ts`, `src/app/game-view.tsx` | Soul Marks, upgrades permanentes, class change, persistent Town. | Todavía se siente como pestaña tardía, no como Guild Charter. Naming interno `prestige/renown` convive con copy `Reincarnation/Soul Marks`. | Bajo para copy; medio/alto para Guild Charter nuevo. |

## 3. Guildhall Slot Grid Spec

Guildhall Slot Grid es una city grid lite basada en slots semánticos. No debe tener coordenadas libres ni drag/drop. Para launch, los edificios funcionales son únicos.

Reglas:

- Edificios únicos en launch.
- No roads.
- No decoraciones.
- No repetición funcional.
- No grid libre.
- Nivel 0 se interpreta visualmente como **ruina/fundación**.
- Nivel 1+ se interpreta como **construido**.
- `Guildhall` puede ser UI-only como edificio central fijo, sin `BuildingId` real.
- `Caravan Yard` y `War Room` deben ser UI-only en Phase A; si se convierten en edificios reales, requieren `BuildingId`, save normalization, store/UI/tests.
- `town[buildingId] === 0` ya existe y permite construir desde cero sin schema nuevo.

| Slot id | Posición visual | Building | Estado inicial | Unlock condition | Acción inicial | Copy sugerido | Requiere engine? |
|---|---|---|---|---|---|---|---|
| `guildhall-center` | Centro | Guildhall | Built UI-only | Always after hero creation | None | "The Guildhall is standing. Barely. Every order starts here." | No para UI-only. Sí si se vuelve building real. |
| `forge-yard` | Norte | Forge (`forge`) | Foundation | Always visible after first expedition start | Start construction to level 1 | "Restore the old Forge to turn scraps into power." | No, usa `town.forge === 0` + `buyBuilding("forge")`. |
| `mine-cut` | Oeste | Mine (`mine`) | Foundation | After first expedition claim or enough Sunlit Timber | Start construction to level 1 | "Clear the collapsed Mine. The crew swears it is mostly safe." | No para visual. Copy de offline debe evitar prometer generación pasiva hasta arreglarla. |
| `tavern-corner` | Este | Tavern (`tavern`) | Foundation | Account Rank 2 target visible; build available once affordable | Start construction to level 1 | "Raise the Tavern board so the guild can post better Orders." | No si build available; sí si se bloquea por rank. |
| `library-ruins` | Noroeste | Library (`library`) | Locked ruin | Suggested: after `relic-bandit-cache` clear or Account Rank 2 | Start construction to level 1 | "Unseal the Library to read route warnings before they read you." | No if visual lock only; sí for hard lock. |
| `market-stalls` | Sureste | Market (`market`) | Locked ruin | Suggested: after inventory pressure or first sell/salvage | Start construction to level 1 | "Reopen the Market before your pack becomes a legal dispute." | No if visual lock only; sí for hard lock. |
| `caravan-yard` | Suroeste | Caravan Yard | Locked UI-only system slot | Existing Caravan available after hero created; focus types unlock by hero level 1/3/5 | Open Caravan screen | "Mark a yard for long-haul jobs. Caravans bring back training, gold, or fragments." | No as UI link. Sí if new building/cost/unlock. |
| `war-room` | Noreste | War Room | Locked UI-only system slot | When first boss is unlocked or next boss exists | Open War Room / scout boss | "Pin the boss dossier here before the boss pins you." | No as UI link using boss helpers. Sí if building real. |
| `shrine-hill` | Sur | Shrine (`shrine`) | Locked ruin | Suggested: after first boss clear or Reincarnation panel teaser | Start construction to level 1 | "Raise the Shrine when legacy becomes more useful than stubbornness." | No if visual lock only; sí for hard lock. |

Recommended launch implementation:

- Phase A renders all slots with statuses derived from current state and suggested gates.
- Actual build buttons still call existing `store.buyBuilding(building.id)`.
- Visual locked slots can show "recommended later" but not block engine unless Phase B adds hard unlocks.
- If a building is visually locked but engine still allows `buyBuilding`, do not expose the button in the locked slot.
- Do not add `guildhall`, `caravan-yard`, or `war-room` to `BuildingId` in Phase A.

## 4. Building Unlock & Construction Plan

Current engine already supports construction from level 0 to 1 for the six real buildings. First-level timers/costs:

- Forge: 40 gold + 2 Sunlit Timber, 2m.
- Mine: 60 gold + 3 Sunlit Timber, 2m.
- Tavern: 75 gold + 4 Sunlit Timber, 2m.
- Library: 110 gold + 5 Sunlit Timber, 2m.
- Market: 75 gold + 4 Sunlit Timber, 2m.
- Shrine: 250 gold + 8 Sunlit Timber + 4 Ember Resin, 10m.

| Momento | Trigger | Building/feature | Estado antes | Estado después | Por qué importa | Archivos afectados |
|---|---|---|---|---|---|---|
| Primer minuto | Hero created | Guildhall center | UI absent | Built center slot | Ancla fantasía de base propia sin schema. | `src/app/game-view.tsx`, `src/app/globals.css` |
| Primer minuto | Start first expedition | Forge foundation | `town.forge === 0`, visible | Foundation highlighted | Introduce "construir desde cero" sin hard lock. | UI-only |
| Minuto 2-5 | First expedition claimed | Mine foundation | `town.mine === 0` | Mine suggested if affordable/near affordable | Conecta Sunlit Timber con base. | UI-only |
| Minuto 5-15 | First/second route rewards | Forge or Mine level 1 | No construction or construction ready | First base construction started/claimed | Base ownership hook; ya usa `startBuildingConstruction`. | Existing `town.ts`, UI |
| Minuto 5-15 | Account Rank approaching 2 | Tavern foundation | `town.tavern === 0` | Tavern suggested | Une dailies con edificio físico. | UI-only |
| Minuto 15-30 | Bramblecrown visible or route 3 reached | War Room UI slot | Locked | Open dossier/scout CTA | Hace boss prep visible antes del intento. | UI-only, uses `getBossViewSummary`, `scoutBoss`, `prepareBossThreat` |
| Minuto 15-30 | Inventory pressure or first sell/salvage | Market ruin | Locked visual | Suggested foundation | Explica sell value/inventory as base economy. | UI-only |
| Primer retorno 30-60m | Construction ready or Caravan ready | Command Center + Guild Report | Separate overlays | Return report points to Guildhall/Orders | Refuerza hábito de volver. | UI-only |
| Primer día | Hero level 3+ or Caravan subview used | Caravan Yard UI slot | Locked visual | Open Caravan CTA | Conecta logistics con base sin nuevo building. | UI-only |
| Primer boss clear | Boss defeated | Outpost and Shrine teaser | Hidden/secondary | Outpost visible in region; Shrine shown as legacy future | Presenta long-term loop. | UI-only |

Hard unlocks are not recommended for Phase A. If needed later, implement in Phase B by adding a domain helper such as `getBuildingAvailability(state, buildingId)` rather than duplicating gates in UI.

## 5. Command Center Spec

Command Center is the first screen-level summary for the Expeditions flow. It should replace the current "Next Goal" side card as the primary decision engine when the player is deciding what to run next, but it must not be mounted globally across every tab.

Shown in its compact Expeditions placement:

- Primary recommendation.
- Active expedition or recommended expedition.
- Construction slot status.
- Orders status.
- Event status if event active.
- Focus and return promise.

Placement rule:

- Render after onboarding inside the Expeditions route content only.
- Do not render as a persistent top card above Guildhall, Orders, Inventory, Hero, Forge, Account, Reincarnation, or Save.
- Live Event gets a compact card in Orders only; Command Center may show only a small event chip.

Conditionally shown:

- Guild Report if `lastOfflineSummary` or `lastExpeditionResult`.
- Caravan status if active, ready, or unlocked.
- War Room if any boss is next/unlocked.
- Guildhall build suggestion if total building levels are 0 or construction ready.
- Mastery claimable if any route has claimable tier.

Inputs:

- `state.activeExpedition`
- `state.caravan.activeJob`
- `state.construction`
- `state.dailies`, `state.dailyFocus`, `state.weeklyQuest`
- `getEventBannerSummary(state, now)`
- `getNextGoal(state)`
- `getAvailableDungeons(state)`, `getNextLockedDungeon(state)`, `getUnlockText(state, dungeon)`
- `getActiveConstructionProgress(state, now)`
- `getCaravanMasterySummaries(state)`
- `getFirstClaimableMasteryRoute(state)` currently exported from `progression.ts` but not from UI import list; either export via `src/game/index.ts` if needed or derive locally from `getNextClaimableMasteryTier`.

Outputs:

- A prioritized CTA.
- 3-6 compact cards.
- Status copy with clear return promise.

| Priority | Condition | Recommendation | CTA | Source/helper actual | Fallback |
|---|---|---|---|---|---|
| 1 | Active expedition ready (`activeExpedition.endsAt <= now`) | "Guild report ready: claim the route." | Claim Expedition | `state.activeExpedition`, `store.claimExpedition` | Open Frontier |
| 2 | Construction ready | "Construction crew is waiting for your stamp." | Claim Build | `getActiveConstructionProgress` | Open Guildhall |
| 3 | Caravan completed | "Caravan returned with logistics rewards." | Claim Caravan | `state.caravan.activeJob`, `store.claimCaravanJob` | Open Caravan |
| 4 | Event tier claimable | "Festival tier ready." | Claim Event | `getEventBannerSummary` | Open Orders |
| 5 | Daily Focus ready | "Daily Focus is banked." | Claim Focus | `state.dailyFocus` | Open Orders |
| 6 | Daily/weekly task claimable | "Orders ready for payout." | Claim/Open Orders | `state.dailies.tasks`, `state.weeklyQuest` | Open Orders |
| 7 | Mastery claimable | "A route can be mapped." | Claim Mastery | `getNextClaimableMasteryTier` per dungeon | Open Frontier |
| 8 | Better item or forge action available | "Equip or upgrade before pushing." | Open Hero/Forge | Existing result/forge helpers in UI | Use `getNextGoal` |
| 9 | Total building levels 0 and build affordable/near-affordable | "Restore the first Guildhall foundation." | Open Guildhall | `BUILDINGS`, `canAffordConstructionCost`, `getBuildingConstructionCost` | Continue route for materials |
| 10 | Boss unlocked/not cleared | "Open the boss dossier." | Open War Room | `getBossViewSummary`, first boss helper in UI | Start next route |
| 11 | No urgent claim | "Dispatch the next charter." | Start Expedition | `getRecommendedDungeon` UI helper | `getNextGoal` |

## 6. Frontier Map v0 Spec

Frontier Map v0 is a board of region cards. It does not need a spatial map. Each region card should show region identity, material, routes, boss, outpost, collection, caravan mastery and one recommended action.

| Region | Material | Boss | Outpost status | Main loop | Recommended action | Existing helpers/data | Missing data |
|---|---|---|---|---|---|---|---|
| Sunlit Marches | Sunlit Timber | Bramblecrown | Established after Bramblecrown clear; bonus from `regionProgress.outposts` | Onboarding, first materials, first mastery, first boss prep | If route 1 not cleared: start Tollroad. If boss visible: open War Room. If boss cleared: choose outpost bonus. | `ZONES`, `DUNGEONS`, `getRegionCompletionSummary`, `getRegionMaterialId`, `getVisibleRegionCollectionSummaries`, `getCaravanMasterySummary`, `getOutpostBonusDefinition` | A single `getRegionFrontSummary` helper would reduce UI duplication. |
| Emberwood | Ember Resin | Cindermaw | After Cindermaw clear | First advanced counters, Ember Resin sinks, Caravan region growth | Unlock via Bramblecrown, then farm Lanternroot/Sigil/Crossing and prep Cindermaw. | Same as above; boss definition has Flame-Sealed/Antivenom/Guarded prep | Better per-region "next action" helper. |
| Azure Vaults | Archive Glyphs | Curator of Blue Fire | After Curator clear | Knowledge/collections/reincarnation gate | If locked: show clear Cindermaw/level gate. If active: prioritize archive routes and War Room. | `getNextLockedDungeon`, `getUnlockText`, `getRegionCompletionSummary` | Stronger visible tie to Reincarnation. |
| Stormglass Peaks | Stormglass Shards | Stormglass Regent | After Regent clear | Logistics, high-tier route mastery, relay fantasy | Show route progress and Stormglass material sinks; prep Regent when unlocked. | Existing dungeons/materials/outpost/caravan mastery | No unique logistics action yet. |
| First Forge | Oath Embers | Crown of the First Forge | After Crown clear | Endgame local, event theme, final boss | Show final route chain, event bonus, reincarnation pressure after clear. | Event theme region, final dungeon, completion summary | Need stronger "final forge campaign" copy. |

Visual states:

- Locked: region card visible but muted with unlock text.
- Active: at least one non-boss dungeon unlocked.
- Boss Ready: boss dungeon unlocked and uncleared.
- Secured: boss cleared and outpost available/selected.
- Mastery Chase: routes cleared but mastery tiers remain.
- Completed: high completion percent plus boss clear.

## 7. Orders Board Spec

Orders Board should unify ready/progress/locked work without creating a parallel mission system in Phase A.

Sources to include:

- Daily Focus.
- Daily Missions.
- Weekly Quest.
- Event tiers.
- Mastery claimables.
- Construction ready.
- Caravan ready.
- Boss prep suggestions.

Sorting rules:

1. Claimable rewards first.
2. Ready-to-claim timers next.
3. Near-complete progress next.
4. Strategic prep recommendations next.
5. Locked/unavailable hints last.

Display rules:

- Claimable: button visible, high-emphasis.
- Progress: compact progress bar and target.
- Locked: show requirement and no primary button.
- Hidden: legacy weekly contracts should not be shown unless `weekly.progress` is fixed.

`complete_caravan`:

- Current state: `DailyTaskKind` exists, caravan claim applies `applyDailyProgress({ complete_caravan: 1 })`, but the template is never eligible because `hasCaravanDailyObjectiveUnlocked` returns false.
- Phase A: do not show it as a possible daily; show Caravan ready as an Orders Board operational alert.
- Phase B: make it eligible when Caravan is unlocked and no longer confusing. Recommended unlock rule: `getUnlockedCaravanRegions(state).length > 0 && state.hero.level >= 3` or `state.caravan.mastery` has any region/job history. Add tests.

`weekly.progress` legacy:

- Current state: `dailies.weekly.progress` exists with milestones 3/9/15 and claim function, but `applyDailyProgress` updates `weeklyQuest`, not legacy `weekly.progress`.
- Phase A: hide legacy weekly milestones from Orders Board.
- Phase B: either remove UI access entirely or wire progress intentionally. Recommended: treat `weeklyQuest` as canonical and mark `dailies.weekly` legacy/internal until refactor.

Orders table:

| Order type | Show as | Claimable condition | Progress condition | Hide/lock condition | Existing source | Engine work? |
|---|---|---|---|---|---|---|
| Daily Focus | Order Token | `focusChargesBanked > 0 && focusChargeProgress >= 3` | `focusChargeProgress < 3` | None | `state.dailyFocus` | No |
| Daily Mission | Order Token | `task.progress >= task.target && !task.claimed` | Account Rank 2+ and tasks exist | Rank < 2 | `state.dailies.tasks` | No |
| Weekly Quest | Charter Token | All steps complete and not claimed | Any incomplete step | None | `state.weeklyQuest` | No |
| Event Tier | Festival Token | `tier.claimable` | active event tier remaining > 0 | no active event | `getEventBannerSummary` | No |
| Mastery Claim | Route Token | any tier claimable | route has next tier | no mastery yet | `getMasteryProgress` | No, maybe helper export |
| Construction Ready | Guildhall Token | active construction ready | active construction not ready | no construction | `getActiveConstructionProgress` | No |
| Caravan Ready | Logistics Token | active job ended | active job traveling | no caravan active | `state.caravan.activeJob` | No |
| Boss Prep | War Token | scout/prep affordable and useful | boss unlocked but unprepared | no boss visible | `getBossViewSummary`, `getBossScoutCost`, `getBossPrepMaterialCost` | No for recommendation; tests only if logic changes |

## 8. Guild Report Spec

Guild Report combines offline summary and expedition result presentation. It should be the emotional payoff when the player returns or claims.

Existing today:

- `lastOfflineSummary` includes `expeditionReady`, caravan result, construction ready, focus gained, daily reset, mine gains placeholder, elapsed/capped.
- `lastExpeditionResult` includes route result, rewards, item, item comparison, progress, boss result, unlocks, achievements, combat report.
- UI already has `OfflineSummaryPanel` and `ExpeditionResultPanel`.

Missing today:

- Offline expedition auto-resolution; current report marks expedition ready.
- Mine offline actual gains; `mineGains` is `{}`.
- Event participation in offline report unless expedition/caravan effects already happened.
- Unified next recommended action inside offline report.
- Collection/pity highlighted as a first-class line in return report.

Report sections:

| Section | Offline report | Expedition result report | Exists today | Gap |
|---|---|---|---|---|
| Header | "Guild Report: While You Were Away" | "Guild Report: Charter Resolved" | Partially | Rename/reframe copy. |
| Orders completed | Expedition ready, caravan completed, construction ready, daily reset | Route completed, boss clear, unlocks | Yes | Needs unified visual hierarchy. |
| Loot/economy | Caravan rewards, focus, construction ready | XP, gold, fragments, item, regional materials | Yes | Add clearer grouping by "Guild Stockpile". |
| Mastery/account | Caravan mastery, daily reset | Mastery XP, Account XP/rank ups | Yes | Make claimable mastery a CTA. |
| Collections/pity | None unless expedition result | `summary.progress.collection` | Yes in data | Needs visible line. |
| Event | Not explicit | Participation recorded by expedition engine | Partially | Show active event tier progress if event active. |
| Next action | Open Expedition/Missions/Town | Existing next action copy | Yes | Make Command Center priority consume same rules. |

Recommended Phase A:

- Rename panels to Guild Report.
- Add a "Next order" CTA using Command Center priority fallback.
- Do not promise mine gains unless Phase B implements them.
- Keep expedition offline as "ready to claim", not "resolved".

## 9. First-session Script

| Window | Player experience | Existing system mapping | Gap |
|---|---|---|---|
| Primer minuto | Create hero, see Guildhall center, first order "Dispatch the Tollroad Charter", start `tollroad-of-trinkets` (20s). | `createHero`, `settings.heroCreated`, `getRecommendedDungeon`, `startExpedition`. | Need Command Center/Guildhall visual. |
| Minuto 2-5 | Claim first route, see Guild Report, equip/sell/salvage if item appears, see Forge/Mine foundations. | `resolveExpedition`, `lastExpeditionResult`, inventory/equipment, `town` level 0. | Need clearer CTA from result to Guildhall. |
| Minuto 5-15 | Run Mossbright/Cache, earn Sunlit Timber, start first construction if affordable. | Route unlock chain, regional material rewards, `buyBuilding`. | Costs may require enough successful runs; if not, copy should say "earn X more". |
| Minuto 15-30 | First boss appears as War Room target, Daily Focus progresses, first Town timer/claim creates return promise. | Boss unlock, `getBossViewSummary`, `dailyFocus`, `construction`. | War Room global missing. |
| Primer retorno 30-60 min | Guild Report shows construction/caravan/focus/dailies; Command Center recommends claim/build/route. | `applyOfflineProgress`, `lastOfflineSummary`, construction offline ready, focus regen. | Mine offline and caravan daily unresolved. |
| Primer día | Daily Orders/Weekly Charter visible, event tier progress visible, boss prep/attempt framed as operation. | `ensureDailies`, `weeklyQuest`, `events`, `bossPrep`. | Orders Board needs sorting/unification. |

Design rule:

- The first session should show the player a future slot (`War Room`, `Caravan Yard`, `Shrine`) before it is fully useful. This creates aspiration without new engine.

## 10. Implementation Phases

### Phase A - UI/copy only

Cambios sin tocar engine/save/tests. Tests no deberían ser necesarios salvo snapshot/visual QA si existe.

| Cambio | Valor | Riesgo | Archivos | Tests necesarios | Dependencias |
|---|---|---|---|---|---|
| Command Center v0 | 5-second clarity, return hook | Bajo | `src/app/game-view.tsx`, `src/app/globals.css` | Manual desktop/mobile | Uses existing helpers |
| Guildhall Slot Grid v0 | Base ownership, construir desde 0 visual | Bajo-medio | `src/app/game-view.tsx`, `src/app/globals.css` | Manual; no domain tests | Uses `BUILDINGS`, `town`, `construction` |
| Frontier Map v0 | Geografía visible | Bajo-medio | `src/app/game-view.tsx`, `src/app/globals.css` | Manual | Uses `ZONES`, `DUNGEONS`, region helpers |
| Orders Board v0 | Daily/weekly/event/mastery consolidation | Bajo | `src/app/game-view.tsx` | Manual | Hide legacy weekly |
| War Room v0 | Boss prep surfaced | Bajo | `src/app/game-view.tsx` | Manual | Uses boss helpers |
| Guild Report copy/layout | Return payoff | Bajo | `src/app/game-view.tsx` | Manual | Existing summaries |
| Navigation/copy pass | Product identity | Bajo | `src/app/game-view.tsx` | Manual | Keep internal ids |

### Phase B - Small engine fixes

Cambios chicos con tests de dominio.

| Cambio | Valor | Riesgo | Archivos | Tests necesarios | Dependencias |
|---|---|---|---|---|---|
| Activate caravan daily objective | Makes Orders match existing Caravan loop | Medio | `src/game/dailies.ts`, `src/game/__tests__/core.test.ts` | daily generation, caravan claim progress | Decide unlock rule |
| Resolve legacy weekly contract | Avoid broken/hidden system | Medio | `src/game/dailies.ts`, `src/game/save.ts`, tests, UI if shown | progress/claim/reset tests | Decide remove/hide vs wire |
| Mine offline or copy correction | No broken promise | Bajo if copy, medio if logic | Copy: UI/content only. Logic: `src/game/offline.ts`, tests | offline mine test if logic | Decide product promise |
| Optional helper `getBuildingAvailability` | Avoid UI-only gate duplication | Medio | `src/game/town.ts`, `src/game/types.ts`, `src/game/index.ts`, tests | availability per building | Needed only for hard locks |
| Optional `getRegionFrontSummary` | Reduce UI complexity | Bajo-medio | `src/game/regions.ts`, `src/game/index.ts`, tests | summary shape tests | Useful before extraction |

### Phase C - Launch polish

Eventos, mobile, copy, acceptance criteria.

| Cambio | Valor | Riesgo | Archivos | Tests necesarios | Dependencias |
|---|---|---|---|---|---|
| Guild Foundry Festival placement in Command Center/Orders | Event visibility | Bajo | `src/app/game-view.tsx` | Manual | Phase A Command Center |
| Mobile 360/390 pass | Launch usability | Bajo | `src/app/game-view.tsx`, `src/app/globals.css` | Visual QA/manual | Phase A layouts |
| Component extraction | Reduce `game-view.tsx` risk | Medio | New UI components under `src/app` if chosen | Typecheck/build | Decide extraction boundaries |
| Copy consistency pass | Stronger identity | Bajo | `src/app/game-view.tsx` | Manual | Final labels |
| Acceptance checklist run | Launch confidence | Bajo | docs/manual checklist maybe | Manual | Feature complete |

## 11. Acceptance Criteria

- 5-second clarity: after hydration, player sees primary recommendation, active/ready timers, and one CTA without opening tabs.
- First-session hook: in first 5 minutes, player can start and claim at least one route, see a Guild Report, and see at least one Guildhall foundation.
- Return hook: after 30-60 minutes, player receives a Guild Report with focus/construction/caravan/expedition-ready state and a next recommended action.
- Daily hook: Orders Board shows Daily Focus, Daily Missions/Rank lock, Weekly Quest, active event and operational alerts without punishing absence.
- Base ownership hook: before closing first session, player can start or clearly plan a first Guildhall foundation build using existing construction.
- No broken promises: Mine copy does not claim passive offline materials unless Phase B implements them; legacy weekly is hidden or fixed; Caravan daily is hidden or fixed.
- Mobile viable: Command Center, Guildhall Slot Grid and primary CTA work at 360px/390px without horizontal overflow.
- No scope creep: no freeform city grid, drag/drop, roads, repeated functional buildings, PvP, backend, chat, cloud-only progression, gacha or monetization.
- Architecture safe: Phase A changes stay in UI/copy; Phase B domain changes include save normalization review and Vitest coverage.

## 12. Open Questions

| Pregunta | Opción recomendada | Alternativas | Riesgo si no se decide |
|---|---|---|---|
| Should Guildhall be a real `BuildingId`? | No for launch; UI-only center slot. | Add `guildhall` to `BuildingId`. | Schema/save/test churn with little launch value. |
| Should Caravan Yard and War Room be real buildings? | No for launch; system slots linking to Caravan/Boss Prep. | Add buildings later with costs/unlocks. | Premature schema expansion. |
| Should visual locks be hard gameplay locks? | No in Phase A; visual guidance only. | Add `getBuildingAvailability` in Phase B. | UI/domain mismatch if copy says locked but engine allows elsewhere. |
| What unlocks Tavern visually? | Show foundation early, frame as Orders/Daily Rank 2. | Hard lock at Account Rank 2. | Hard lock may block current balance; no lock may reduce progression fantasy. |
| How to handle Mine offline? | Change copy now; implement logic later only if desired. | Add offline fragment generation in Phase B. | Current promise mismatch remains visible. |
| How to handle `complete_caravan` daily? | Enable in Phase B after hero level 3 or first Caravan. | Keep hidden permanently. | Existing progress path stays dead; Orders less connected to logistics. |
| How to handle `dailies.weekly.progress` legacy? | Hide legacy weekly and use `weeklyQuest` as canonical. | Wire progress to milestones. | Broken claimable UI if exposed without progress. |
| Should Caravan and Expedition run together for launch? | Not for first implementation; improve copy first. | Phase B/1.1 simultaneous queues. | If changed now, touches offline/concurrency/save/tests. |
| Should collection dust get a sink before launch? | Not required for Phase A; show only if completed/earned. | Add buy-missing-piece or convert-to-fragments. | Dust feels dead if surfaced too prominently. |
| Should `game-view.tsx` be split before UI redesign? | Extract only if changes become too risky; spec can guide components. | Full modularization first. | Full refactor delays launch; no extraction increases merge risk. |
