# Refactoring plan

Written by the code quality check at a score of 78.9%. These are the steps a refactor of this repository follows, in this order; a round takes the next steps from the top. The plan is measured, so a finished step is gone the next time the check runs. The facts are measured; the judgement is the round's.

## The order

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
11. Give `drawPlanks` one home. Declared in 2 files: src/lib/game/globe/drawPins.ts, src/lib/game/render/drawSwims.ts.
12. Give `drawShadow` one home. Declared in 2 files: src/lib/game/render/drawAngler.ts, src/lib/game/render/drawCarp.ts.
13. Give `pointOf` one home. Declared in 2 files: src/lib/components/builder/BuilderCanvas.svelte, src/lib/game/world/realtimeFeed.ts.
14. Give `loadCarpInLake` one home. Declared in 2 files: src/lib/server/commands/ListCarpForSale.ts, src/lib/server/commands/SellCarpToDealer.ts.
15. Give `loadSwimsOf` one home. Declared in 2 files: src/lib/server/commands/OrderGroundworks.ts, src/lib/server/commands/swimGates.ts.
16. Remove the 21 components and functions nothing calls. Listed in audit.json under details.orphans and details.inventory.offenders.orphans; confirm each has no caller before it goes.

**Pass 3 — Design pattern identification**

17. Complete the pattern: every +page.svelte has a +page.server.ts. 2 of 25 lack it. Predicted: src/routes/privacy/+page.server.ts; src/routes/terms/+page.server.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
18. Bring `AreaFeature` into range. 3 properties, 0 file(s) named for it, about 1 expected.
19. Bring `Bid` into range. 7 properties, 9 file(s) named for it, about 3 expected.
20. Bring `BoardPlacing` into range. 6 properties, 0 file(s) named for it, about 2 expected.
21. Bring `Carp` into range. 14 properties, 27 file(s) named for it, about 6 expected.
22. Bring `CarpMemorial` into range. 13 properties, 1 file(s) named for it, about 5 expected.
23. Bring `CarpTransfer` into range. 15 properties, 0 file(s) named for it, about 6 expected.
24. Bring `Catch` into range. 12 properties, 14 file(s) named for it, about 5 expected.
25. Bring `Island` into range. 3 properties, 4 file(s) named for it, about 1 expected.
26. Bring `Lake` into range. 26 properties, 39 file(s) named for it, about 11 expected.
27. Bring `LakeLayout` into range. 9 properties, 0 file(s) named for it, about 4 expected.
28. Bring `LakeVisit` into range. 7 properties, 0 file(s) named for it, about 3 expected.
29. Bring `Listing` into range. 16 properties, 19 file(s) named for it, about 7 expected.
30. Bring `Match` into range. 14 properties, 39 file(s) named for it, about 6 expected.
31. Bring `MatchEntry` into range. 5 properties, 0 file(s) named for it, about 2 expected.
32. Bring `ReedLine` into range. 3 properties, 0 file(s) named for it, about 1 expected.
33. Bring `Swim` into range. 5 properties, 14 file(s) named for it, about 2 expected.
34. Bring `Trophy` into range. 13 properties, 12 file(s) named for it, about 5 expected.

**Pass 4 — The sweep to zero**

35. Long member chain lines: 603 to zero. Scores 15.4% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
36. Conditions compared to a raw literal: 207 to zero. Scores 25.3% at weight 6; the offenders are in audit.json under details.conditions, fifty at a time.
37. Conditions with calls tangled inside calls: 46 to zero. Scores 83.4% at weight 8; the offenders are in audit.json under details.conditions, fifty at a time.
38. Inline magic values: 50 to zero. Scores 89.5% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.
39. Deeply indented lines: 59 to zero. Scores 91.7% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
40. Overlong function names: 4 to zero. Scores 96.9% at weight 4; the offenders are in audit.json under details.functionNames, fifty at a time.
41. Accessor names that want to be a property: 4 to zero. Scores 96.9% at weight 6; the offenders are in audit.json under details.accessorNames, fifty at a time.
42. Functions over the line limit: 7 to zero. Scores 97.8% at weight 8; the offenders are in audit.json under details.functionShape, fifty at a time.
43. Duplication %: 0.14 to zero. Scores 99.3% at weight 8; the offenders are in audit.json under details.duplication, fifty at a time.
44. Else blocks: 2 to zero. Scores 99.6% at weight 5; the offenders are in audit.json under details.functionShape, fifty at a time.

## The detail behind the first targets
