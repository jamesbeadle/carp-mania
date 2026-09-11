# Carp Mania — Design

Derived top-down, as CLAUDE.md asks: stories → views → site map → data → backend.

## 1. User stories

Every player is both a **fishery owner** (they get a lake) and an **angler** (they can fish any public lake, including their own).

### Account
- As a visitor, I want to sign in with Google, so my lake, money and catches persist.
- As a new player, I want a starter fishery (10 acres, 100 carp of 10–15 lb, £ starting float), so I can play immediately.

### Fishery owner
- I want to see my lake from above — swims, lake-bed types, weed, silt, colour — so I understand what I am running.
- I want to see **the stock** (every identified carp: name, strain, weight, age, condition, times caught), so I know what is in the lake.
- I want to feed the lake (fishmeal boilies, hemp, maize, particles, worms, shrimp), so carp grow — protein grows 40s into 100s.
- I want to stock more carp, bigger being dearer, so my water holds prize fish.
- I want to introduce pike (7–8 lb max) and pike food (perch, rudd, roach), so sick carp are removed and healthy carp are left alone.
- I want to hire a bailiff, so water quality improves, banks stay tidy and day-ticket fees are actually collected.
- I want to set the day-ticket fee, so I earn from visiting anglers.
- I want to see catch reports and photos from anglers who fished my water, because they build my fishery's reputation.
- I want to see money and reputation, and what happened while I was away (who fished, what they caught, what they paid).

### Angler
- I want to browse public lakes (reputation, stock, fee, water), so I can choose where to fish.
- I want to walk the bank and choose a swim, because bed type, depth and features change how I fish.
- I want to set up to 3 rods — line, hook, rig, bait, shrink-tubing colour — so my choices match the water.
- I want to cast, wait, get bites and play the fish, so catching feels earned.
- I want each catch photographed and recorded on the lake's catch list and my profile.
- I want an angler profile — line selection, rig selection, bait selection, watercraft — that improves as I fish, so better anglers reach better waters.

## 2. Views

| View | Serves |
|---|---|
| Landing | Sign in with Google |
| Home hub | My fishery summary, my angler summary, "fish somewhere" |
| My Lake | Top-down lake map; panels: Stock, Feed, Predators, Bailiff, Water, Fees, Reports, Ledger |
| Lakes | Public lake list with reputation, fee, headline stock |
| Lake page | One lake: stock list, catch reports, fee, "Fish here" |
| Fishing session | The game canvas: walk the bank → choose swim → tackle up (≤3 rods) → session → catches |
| Angler profile | Skills, catch history, personal bests |

## 3. Site map

```
/            landing (sign in)
/home        hub → /lake, /lakes, /angler, /fish/[my lake]
/lake        my fishery (owner tools)
/lakes       browse public lakes → /lakes/[id]
/lakes/[id]  public lake page → /fish/[id]
/fish/[id]   fishing session (canvas game)
/angler      my angler profile
/auth/callback, /auth/signout
```

## 4. Data (what the views demand)

- **profiles** — display name, avatar, money, angler skills (line, rig, bait, watercraft), experience.
- **lakes** — owner, name, acres, water colour / transparency / weed / silt, day-ticket fee, reputation, bailiff, pike count, pike-food level, feed stock per feed type, simulated-until timestamp, is public.
- **swims** — per lake: name, position on map, bed type (gravel / clay / silt), depth, feature (weed bed, snag, island margin, open water).
- **carp** — per lake: name, strain (common / mirror / linear / leather / ghost), weight, age, condition (health 0–100), times caught. This table *is* "the stock".
- **catches** — lake, carp, angler, weight at capture, swim, rig, bait, hook, caught at. Feeds catch reports, the stock's history and the angler's record.
- **lake_visits** — lake, angler (player or NPC name), fee paid, fish caught, visited at. Feeds the ledger and "while you were away".

Derived, never stored: reputation delta from a catch, anglers-per-day from reputation, growth from feed, pike effect on health.

## 5. Backend (CQRS)

Commands: `CreateStarterFishery` (DB trigger on signup), `FeedLake`, `StockCarp`, `StockPike`, `StockPikeFood`, `HireBailiff`, `DismissBailiff`, `SetDayTicketFee`, `SimulateElapsedTime`, `RecordCatch`, `PayDayTicket`.
Queries: `GetMyFishery`, `GetLake`, `GetPublicLakes`, `GetLakeStock`, `GetCatchReports`, `GetLedger`, `GetAnglerProfile`.

Each lives in `src/lib/server/commands|queries/<Name>.ts`, gated first (auth → ownership → validation), then delegating to a domain module in `src/lib/domain`. Routes are thin: `+page.server.ts` loads via queries and exposes form actions that call commands.

## Simulation rules (the domain)

- **Time.** The world advances in *fishery days*. Owners' lakes simulate the elapsed real time on every load (1 real hour = 1 fishery day, capped at 30 days a visit). A fishing session is one fishery day played out in about 6 real minutes.
- **Growth.** Each fed day, a carp gains weight in proportion to the protein of what it eats. Fishmeal boilies grow fish fastest; hemp and particles keep them healthy and hungry but grow them slowly. Feed runs out; unfed carp lose condition.
- **Water.** Silt and weed drift up over time; colour and transparency follow. A bailiff pulls all four back toward good every day, tidies banks, and collects 100% of fees (without one, a share of anglers fish for free). Pike eat crayfish, which clears water a little.
- **Health.** Poor water and hunger lower condition. Pike remove the sickest carp only — carp in good condition out-swim them, and pike never exceed 8 lb. Pike need pike food (perch, rudd, roach) or they die back.
- **Anglers.** Reputation decides how many NPC anglers arrive per day and how skilled they are. Skilled anglers catch more (a good angler lands about 19 a day) and bigger, and each catch report raises reputation. Catches of bigger fish raise it more.
- **Money.** Day-ticket fees in; feed, stock (bigger is dearer), pike, pike food and bailiff wages out.

## Fishing rules

- **Bite chance** each rod each hour = base hunger × swim match × tackle match × skill.
  - Line: clear line is near-invisible; coloured line is visible in clear water and invisible in coloured water. Thicker line is more visible but holds bigger fish.
  - Hook: 2, 4 and 6 are carp sizes; 8 is too small and drops fish. A shiny hook is seen in clear water.
  - Shrink tubing: yellow reads as sweetcorn and helps with corn / particle baits; black relies on not being seen, so it wants coloured water or a silt bed.
  - Rig: Ronnie and spinner rigs suit gravel and clear bottoms; a hair rig on a lead-clip suits clay; a chod/helicopter suits silt and weed.
  - Bait: what the lake has been fed on is what the carp trust; a bait the lake has never seen scores lower.
- **Playing a fish.** A tension meter: keep it in the green band; too slack drops the fish, too tight snaps the line (thin line snaps sooner, and the bigger the carp the harder it pulls). Landed fish are photographed and recorded.
- **Skills** rise a little with every catch, more with a catch on a well-matched setup.

## Deliberate v1 simplifications (say so, don't hide it)

- The fishing session is client-side; `RecordCatch` trusts the client. Cheatable; acceptable for a first version.
- NPC anglers are simulated in aggregate per day, not as individuals on the map.
- Photos are drawn (the game renders the fish on the mat) rather than uploaded.
