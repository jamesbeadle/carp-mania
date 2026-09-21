# Carp Mania

A web game about running a carp fishery and fishing it. Every player finds a water somewhere on the globe — an old gravel pit, a disused quarry, a flooded clay pit, an estate lake, a farm pond, or a green field they dig themselves — shapes it, stocks it and runs it, and is also an angler who can fish any open water in the game.

- **Owner:** buy the site with your £100,000, build islands and bars, dredge, cut shelves, plant reeds and lilies, sink snags, place the swims; feed the stock, buy fish from the farm or the world market, sell prize fish at auction, introduce pike, hire a bailiff, set the day ticket, watch the catch reports build your reputation.
- **Angler:** spin the globe, pick a water, choose a swim, tackle up three rods, cast to a spot — an island margin, a gravel bar, the deep hole in winter — strike, play the fish, get the photo.
- **The world:** every lake sits at a real latitude and longitude; the live feed shows big catches, records and sales flying between lakes; fish are bought and sold with transport, quarantine and fame.

SvelteKit · Tailwind · Supabase (Google login, Postgres, Realtime) · Vercel.

See `SETUP.md` to run it, `DOMAIN.md` for carp-mania.com and the sign-in on its own name, `DESIGN.md` for the original stories and rules, and `DESIGN-2.md` for the world, the lake builder and the fish market. `CLAUDE.md` is the coding standard every file follows.

```
src/lib/domain      the rules of the game — pure TypeScript, no framework, runnable with npm run test:domain
  layout/           the plan of a lake: outline, islands, depth zones, bed patches, features; terrain at any point
  world/            regions, the world clock and seasons, great-circle distance, land check
  sites/            the six kinds of site a player can buy, their templates and starting stock
  groundworks/      the works catalogue: validating, pricing and applying drafts
  market/           what a fish is worth, fame, the farm, the dealer, transport, listings and bids
  fishing/          tackle rules, cast terrain, the seeded bite roll the server can verify
  simulation/       one fishery day: works, feed, water, pike, transfers, anglers, heatwaves, spawning
src/lib/server      commands and queries (CQRS) with their gates; the only code that touches Supabase
src/lib/game        the lake scene, the fishing session, the groundworks editor and the canvas globe
src/lib/components  Svelte views
src/routes          the site map: /setup, /home, /lake, /lake/works, /world, /news, /lakes, /fish, /market, /carp, /anglers, /inbox
supabase/migrations tables, row-level security, and the security-definer functions that move money and fish
supabase/tests      SQL scenarios run against a local Postgres by npm run test:sql
```

<!-- code-quality:start -->
## Code quality

<table><tr><td align="center">
<strong>Code quality score</strong><h2>78.9%</h2>
<sub>measured 2026-09-17 · project-process kit 1.3.0</sub>
</td></tr></table>

890 files · frontend 227 · game 152 · domain 149 · backend 136 · tooling 76 · database 46 · shared 45 · docs 21 · tests 19 · api 10 · infrastructure 8 · other 1

<details>
<summary><strong>How the 78.9% is made up</strong></summary>

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **91.5%** | **60** | |
| Files over the line limit | 0 in 706 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 7 in 1287 functions | 97.8% | 8 | 25% of functions |
| Else blocks | 2 in 1109 branches | 99.6% | 5 | 50% of branches |
| Duplication % | 0.14 | 99.3% | 8 | 20 |
| Explanatory comment lines | 0 in 23.75 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 50 in 23.75 thousand lines | 89.5% | 4 | 20 per thousand lines |
| Orphan components and functions | 21 in 1475 components and functions | 85.8% | 4 | 10% of components and functions |
| Long member chain lines | 603 in 23.75 thousand lines | 15.4% | 4 | 30 per thousand lines |
| Deeply indented lines | 59 in 23.75 thousand lines | 91.7% | 4 | 30 per thousand lines |
| Overlong function names | 4 in 1287 functions | 96.9% | 4 | 10% of functions |
| **Design pattern file count** | | **50.0%** | **20** | |
| Files the patterns predict but are missing | 0 in 48 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | 17 in 27 entities | 0.0% | 10 | 50% of entities |
| **Prose** | | **70.0%** | **20** | |
| Conditions with calls tangled inside calls | 46 in 1109 branches | 83.4% | 8 | 25% of branches |
| Conditions compared to a raw literal | 207 in 1109 branches | 25.3% | 6 | 25% of branches |
| Accessor names that want to be a property | 4 in 1287 functions | 96.9% | 6 | 10% of functions |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

</details>

<details>
<summary><strong>The repository by area: 890 files</strong></summary>

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 227 | 216 | 7,620 |
| game | 152 | 152 | 5,976 |
| domain | 149 | 149 | 5,160 |
| backend | 136 | 136 | 3,903 |
| tooling | 76 | 0 | 0 |
| database | 46 | 0 | 0 |
| shared | 45 | 43 | 984 |
| docs | 21 | 0 | 0 |
| tests | 19 | 0 | 0 |
| api | 10 | 10 | 109 |
| infrastructure | 8 | 0 | 0 |
| other | 1 | 0 | 0 |
| **whole repository** | **890** | **706** | **23,752** |

</details>

<details>
<summary><strong>The refactoring plan: 44 steps, in order</strong></summary>

**Pass 2 — Utility function identification**

1. Give `frame` one home. Declared in 4 files: src/lib/components/carp/CarpPortrait.svelte, src/lib/components/game/CatchPhoto.svelte, src/lib/components/game/FightMeter.svelte, src/lib/components/game/ScalesReadout.svelte.
2. Give `round` one home. Declared in 3 files: src/lib/domain/anglerSkills.ts, src/lib/domain/carpGrowth.ts, src/lib/domain/simulation/pikePredation.ts.
3. Give `roundToQuarterPound` one home. Declared in 3 files: src/lib/domain/market/farmDelivery.ts, src/lib/domain/sites/classicSite.ts, src/lib/domain/sites/startingStock.ts.
4. Give `fitToDisplay` one home. Declared in 3 files: src/lib/game/globe/globeRenderLoop.ts, src/lib/game/scene/renderLoop.ts, src/lib/game/sky/skyLoop.ts.
5. Give `flyTo` one home. Declared in 3 files: src/lib/components/world/Globe.svelte, src/lib/components/world/WorldStage.svelte, src/routes/world/+page.svelte.
6. Give `capacityFailures` one home. Declared in 2 files: src/lib/domain/groundworks/validateDraft.ts, src/lib/domain/groundworks/validateIsland.ts.
7. Give `pageNumberFrom` one home. Declared in 2 files: src/lib/domain/lists/paging.ts, src/lib/domain/market/readMarketFilters.ts.
8. Give `hasEnded` one home. Declared in 2 files: src/lib/domain/market/listingGates.ts, src/lib/format/timeLeft.ts.
9. Give `drawHead` one home. Declared in 2 files: src/lib/game/globe/drawArcs.ts, src/lib/game/render/carpFins.ts.
10. Give `drawPeg` one home. Declared in 2 files: src/lib/game/globe/drawPins.ts, src/lib/game/render/drawSwims.ts.

… and 34 more steps. The whole plan, with the measured detail, is in [`tools/refactor/refactor-plan.md`](tools/refactor/refactor-plan.md).

</details>

<!-- code-quality:end -->
