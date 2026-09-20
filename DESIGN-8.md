# Carp Mania — Design VIII: skill, tackle and the big water

*The build plan. It supersedes the Design VIII draft of 19 September 2026 (the PDF): everything in that draft is here, checked against the code as it stands on `master` at `f46d5f0`, corrected where the two disagreed, and extended where the game needed more to last. Ten branches, in order, each a pull request and a task in Your Business Today. Every number is a starting value for tuning, named as a constant in a domain module, and exercised by `npm run test:domain`.*

Design VII answered the first three things players said. This one answers what they said next, and it is the biggest of the eight, because all of it comes back to one complaint: **the game does not yet make you earn a big fish.** An angler who has never had a thirty reads 100 out of 100. Tackle is a set of free dropdowns with no brand, no price and no consequence. A water is ten acres whatever you spend on it, the ticket is one number, and every hour of the day fishes much the same. So a player gets good quickly, runs out of things to buy, and stops — within a week, as it turned out.

The answer is one idea applied everywhere: **a number you see should be the thing you have proved, and everything you buy, build or stock should change the *size* of what you catch — almost never how much of it.** The day's count is the water's business and it is already right at two to ten fish. The calibre of those fish is where every reward in this design lands: on the angler's side through rating, tackle, rigs, the hour he chooses to fish and the weather he fishes it in; on the owner's side through what his water will grow, what his stock is worth as a business, and how big a water he dares to run. Rating comes from the biggest fish you have landed. Tackle is bought, owned, consumed and gated by rating. A ticket is a product with hours, and the hours matter. A water can grow to two hundred acres and forty thousand fish, and a big water is harder, not easier. And the world puts prizes on random waters so there is always somewhere worth travelling to.

Same chain as always — stories → screens → site map → data → backend — built in phases, one branch each.

## Where the game is today, in the code

This is what each phase changes, named so the coding session starts in the right file.

- **Rating.** `domain/anglerSkills.ts` — `overallAnglerSkill` is the mean of four skills (`line_selection`, `rig_selection`, `bait_selection`, `watercraft`, each 0–100, gaining `0.6 + 0.9 × match` per catch with headroom). Nothing about it references a fish. Read by `sessionState.overallSkill`, `RecordCatch`, the leaderboards, `angler_summaries` (migration `0015`) and `typicalAnglerSkillFor` for visitors.
- **The bite.** `domain/fishing/biteChance.ts` — `0.5 × hunger × confidence × tackleMatch.overall × skillFactor(0.35–1) × timeOfDayBiteFactor × spot × season`, capped at 0.9 an hour, rolled per rod per hour from the ticket's seed in `biteRoll.ts`. **Skill and tackle multiply the count today**; that is the thing this design turns round.
- **Which fish.** `domain/fishing/pickCarp.ts` — `appetite (0.5 + condition/200) − 0.03 × pounds above twenty`, floored at 0.05, times `1.3` at the fish's favourite spot (`layout/favouriteFeature.ts`). Today that is roughly a size exponent of −0.5 for every angler at every hour.
- **The fight.** `domain/fishing/fight.ts` and `game/session/fightState.svelte.ts` — a tension band (slack below 0.2, snap above 0.84), fish pull up to 0.7 a second, angler pull 0.3 reeling and −0.2 slack, driven from `requestAnimationFrame` in `FightMeter.svelte` with pointer events on one button. No rod, no reel. On a phone the fight sits in a fixed overlay since `25d743e`.
- **Tackle.** `domain/tackle/*.ts` — enums: line colour × strength (10/15/20 lb, visibility by strength), hook 2/4/6/8 matt or shiny, six rigs with `presentationScore` and suited beds (`helicopter` suits silt and open water, which is why it always wins on a silty water), eight baits with `feedCounterpart` and `naturalAppeal`, four tubing colours. Chosen in `TackleBuilder.svelte` / `RodSetupCard.svelte`, saved on `profiles.saved_rods`, free.
- **The farm.** `domain/market/fishFarm.ts` — one global farm, four bands (stockies to twenties), weekly supply per region, `ageForFarmFish = 2 + weight/4`, delivery £250 next day. The dealer (`sell_to_dealer`) takes one fish a call and says *3 a fishery day* on the panel.
- **The ticket.** `lakes.day_ticket_fee`, `pay_day_ticket(lake)` (migration `0014a`), one visit with a seed, valid two real hours. The session runs 05:00 → 24:00 at 22 real seconds a fishery hour (`sessionClock.ts`), about seven minutes.
- **The water.** `groundworks/landPurchase.ts` — plot up to 40 acres in 5-acre buys; `swimRules.ts` one peg per 0.6 acre; facilities `car_park`, `lodge`, `aerator` in the layout JSON; one bailiff as `lakes.has_bailiff` at £60 a day (`economy.ts`). `layout/terrainAt.ts` already says what is at any point of the water (bed, depth, feature) — this design reuses it for feature coverage.
- **Visiting anglers.** `simulation/visitingAnglers.ts` — a count formula (`19 × skill/100 × confidence × season × random`) and a fish picked with no reach at all. They raise reputation and fame but never fish the same rules as the player.
- **Persisting a day.** `server/commands/persistSimulatedDays.ts` upserts **every carp row** after every simulated visit. That is fine at 400 fish and impossible at 40,000, which is why phase 6 begins with shoals.
- **Honours.** Records, personal bests, `milestones_of` (eight kinds, derived), trophies, rivalry notes — all in place. Awards here are stored because they are won once.
- **Water quality.** `waterQuality.ts` — transparency, weed, silt and disturbance, drifting daily in `driftWater.ts`; it feeds the bite's confidence factor and reputation. Here it also gates the shop tier and feeds the ceiling, the difficulty and size reach.
- **Weather.** `world/weather.ts` rolls a kind, cloud and wind per fishery day per water, seeded, and draws it. It is cosmetic. It becomes a condition.

## Decisions taken up front

- **Rating is the lesser of craft and pedigree.** Craft is the four skills as today. Pedigree is two points a pound of the current fisherman's best fish, capped at fifty pounds. A rating of 100 therefore means a fifty-pounder and four maxed skills, and nothing else does. Existing ratings fall on the day this ships, and the rating page says why.
- **The size of the fish is the prize, not the number of them.** Rating, tackle, hour, weather and the water's make-up move *which fish takes* through one number, size reach, and almost nothing moves *how many*. The two-to-ten band is a named target the domain tests assert; skill and tackle keep a small, bounded pull on the count (±15%) because the owner asked for it, and no rule in phases 1–10 is allowed past that.
- **The bait triggers the bite; the hook and line keep it on; the rod and reel decide what you can land.** Each piece of kit touches exactly one part of the catch and the tables in §6 say which.
- **Tackle is owned, not chosen.** Bought from a named, invented brand at a price, kept in a tackle box, consumed. Better brands are locked behind rating. Nothing about it touches the fish market.
- **A rod that is under-gunned snaps.** Inside its test curve it never does; the fight is then down to the angler's hand.
- **Magic hours are a bias, not a gate.** First light and the evening into the dark are when the big ones feed. Any fish can come at any hour.
- **The weather is real.** The per-day weather the game already draws becomes a condition on size reach: a falling glass and a warm wind lift the magic hours; a bright, flat, high-pressure afternoon flattens them. Same roll for the player and for the simulation.
- **A big water is a liability until it is finished.** Two hundred acres of empty clay fishes worse than ten acres done properly. Difficulty falls as you stock and build.
- **Unnamed fish live in shoals.** A water's stock is its named fish (rows, as today) plus shoals (a count, a size band, an age). A shoal fish gets its name the first time it is landed. Without this a forty-thousand-fish water cannot be simulated or saved; with it, the game reads better — an uncaught fish is unknown.
- **A water grows the fish its make-up allows.** Mouths, other species, features and quality set the heaviest fish it will ever produce, shown to the owner in pounds.
- **Features are why a carp feeds.** Bars, islands, reeds, pads and snags turn feed into growth, make a water easier to fish and grow bigger fish — one number, three jobs.
- **Visiting anglers fish the same rules as the player.** Size reach, the hour, the weather, the tackle their rating buys. Nothing in the simulation gets a private rule.
- **Bounties are the world's own awards.** A prize on a random water, sometimes a single swim, inside a window, put up by a brand or by an owner who wants anglers through the gate.
- **Fish trades between players are in.** They are the backlog's priority-two task and they belong with the stock phase's thinking; phase 10 designs them properly.
- **No new economy.** Tackle, tickets, farms, bounties and trades all spend and earn the money already in the game.
- **Nothing is smuggled in.** §9 names what this does not do, so it is not added quietly later.

## Contents

1. Stories · 2. Screens · 3. Site map · 4. Data · 5. Backend · 6. The rules · 7. Phases · 8. Tuning and the tests that guard the game · 9. What this does not do · 10. Decisions to confirm · 11. Backlog tasks this sweeps up

---

## 1. Stories

### The angler's rating

- As an angler, I want my rating capped by the biggest fish I have actually landed, so 100 means something and nobody reads 100 on a bag of twenties.
- As an angler, I want my skills to change *what* I catch rather than how much — I am happy with two to ten fish in a day; I want the good days to be the ones where those fish are bigger.
- As an angler, I want to see what my rating is worth *at this water, with this tackle, at this hour, in this weather*, so I know whether I am under-gunned before I cast.
- As an angler with good watercraft, I want to find the fish worth finding — a show over a spot that really has a fish on it — rather than more bites.
- As an angler, I want to know which of the four skills is holding me back and what a thirty would do to my number.

### The fight

- As an angler on a phone, I want to play a fish as well as I can at a desk, because I lost a thirty to a reel button I could not hold.
- As an angler, I want a run telegraphed before it hits, so the fight is reading the fish rather than reacting to a bar.
- As an angler, I want a moment after a fish is on the mat before the game takes keys again, so the key I was reeling with does not press something behind the photo.
- As a player, I want the fullscreen button on every screen, not only while fishing.
- As an angler, I want the rod to decide what I can land, the reel to decide how far I cast and how fast I gain line, and my hand to decide the rest.

### The tackle trade

- As an angler, I want tackle with names on it — rods, reels, line, hooks, rigs, leads, tubing, bait — from brands that range from rubbish to superb, so what is in my hands is a decision.
- As an angler, I want the better brands locked until my rating earns them, so tackle is a reward.
- As an angler, I want to stock end tackle and bait before a session and run out if I do not, so a day on the bank is something I prepare for.
- As an angler, I want the line and hook to decide whether the fish stays on, so a cheap hook losing the fish of the season is a lesson and not a bug.
- As an angler, I want rigs judged on stats — how far they cast, what bed they suit, what bait they present, whether they stay put — so there is no single best rig.
- As an angler, I want to choose which rods I take and which rod I cast, from the rods I own.
- As an owner, I want to run a tackle shop on my water, and I want the good brands to refuse to stock a badly run fishery, so a well-kept water is worth visiting for more than the fish.

### Stock, farms and moving fish

- As an owner, I want to buy fish from named farms around the world, in packs, so where I buy from is a choice about price, size and age.
- As an owner, I want a good farm to sell me a fifty — dear, old, and not long for this world — or a pack of young fish to grow on, so I can buy the headline or build for the future.
- As an owner, I want to move more than three fish out of my water at a time, because thinning a water three fish a day is not a decision, it is an errand.
- As an owner with more than one water, I want to move fish between my own waters, paying only the transport.
- As an owner, I want my stock broken down by size, so I can see at a glance what I am actually running.

### Tickets and the hours

- As an owner, I want to sell day tickets, night tickets, 24-hour tickets and multi-day tickets, and set as many price bands as I like, so the ticket book is part of running a fishery.
- As an angler, I want the hours to matter — first light and the evening into the dark are when the big ones feed — so which ticket I buy is a decision about what I want to catch.
- As an angler, I want the weather to matter, and the bank to tell me what today's weather is doing to the fish.

### The big water

- As an owner, I want to spend serious money making a serious water — up to two hundred acres, forty thousand fish — and to zoom in to see a lake too big to read at once.
- As an owner, I want a big water to be harder to fish until I stock it and build features into it, so size alone is not a win.
- As an owner, I want more facilities — showers, a car park, a bar, a restaurant, a shop, a hotel — so a fishery becomes a business.
- As an owner, I want a team of bailiffs on a big water, each with a name, a wage and a performance I can see, and the power to sack one.
- As an owner drawing in the yard on a phone, I want the prompt to read on one or two lines and the buttons under it, on every tool.

### The make-up of a water

- As an owner, I want to know the heaviest fish my water will ever grow and what is holding that number down, so running a fishery is something I can get better at rather than guess at.
- As an owner, I want the *number* of fish to matter and not only their weight — two hundred small mouths clear the bait before a forty gets near it.
- As an owner, I want other species to be real: bream that hoover the bait and hold my carp back, tench and silvers that feed the pike, and the means to net them out when they take over.
- As an angler, I want to hook a bream now and again on a water that holds them, so what is swimming under me is something I can feel rather than read.
- As an owner, I want a featured water to grow better fish than an empty clay bowl.
- As an owner, I want a rack of thirties to fill my car park, a couple of forties to make my water a destination, and a fifty to fill a diary — and I want a fish that is caught every day to wise up, so selling fewer tickets can be the right call.
- As an owner whose water is turning anglers away, I want advance booking and, above that, a syndicate.

### Honours, bounties and prize tackle

- As an angler, I want awards for what I have done — five hundred fish, a fish from every region, my first forty — so there is always a next thing.
- As a player, I want to see where the biggest fish in the game is swimming, from the home screen, and to go and fish for it if the water is open.
- As an angler, I want prizes to appear out of nowhere on waters and swims around the world — the biggest fish out of here by Thursday, Old Girl off peg four — so there is always somewhere worth travelling to.
- As an angler, I want a bounty to occasionally pay in tackle I could not otherwise get, so winning one is worth more than the money.
- As an owner, I want to put up my own prize on my own water, to pull anglers through the gate when the takings are thin.

### Trades

- As a player, I want to trade fish with another angler — mine for theirs, with money either way — so I can build the stock I want and have a reason to deal with other players.
- As the receiving player, I want the offer in my inbox and in the bailiff's note, and to accept, decline or counter it.
- As either player, I want the fish to move in one transaction, so neither of us ends up with both or neither.

---

## 2. Screens

- **My angler** (`/angler`): the rating becomes a dial with the two halves under it — *Craft 71 · Pedigree 58 (29 lb 4 oz)* — and one line saying which is holding you back: *Your craft is ahead of your fish. A thirty takes you to 60.* The four skill bars stay, each with what it does in plain words (line selection: how invisible your line is; rig selection: how well the rig suits the spot; bait selection: what the fish trust; watercraft: finding the fish and reading the bite). *The one to beat* and the trophy room stay where Design V and VII put them.
- **The tackle box** (`/tackle`, new): what you own, by kind — rods, reels, spools of line, hooks, rigs, leads, tubing, bait — with quantities for the things that run out and a *spoils in N days* note on bait that does. *Saved rods* (a rod, reel, line, hook, rig, lead, tubing, bait combination, named) are built here and picked in one tap on the bank. A rod the box does not hold cannot be saved.
- **The tackle counter** (`/market/tackle`, new, a second counter in the existing tackle shop): brands as shelves, each item with its stats, its price and a lock showing the rating it needs. What is on the shelves depends on where you are buying: the world shop stocks up to the Specialist tier; a water's own shop (on `/lakes/[id]`, when the owner has built one) stocks what its rating lets it, up to Custom.
- **Tackling up** (the fishing session): the rod cards read from the tackle box — you cannot choose what you do not own. Under each rod: the cast distance the rod and reel give you at this swim, and the heaviest fish the rod will land. A rod over its test curve shows a red line: *this rod will not land a forty.* Above the cards, one line: *Size reach 41 — you are fishing for the doubles. Your line is what is holding it down.*
- **Before the session** (the ticket step): *stock up* — the end tackle and bait you are taking and what you have left after. Out of hooks and you fish with what is left on the rig; out of bait and the rod does not cast.
- **The fight**: on every screen the run is telegraphed — the rod tip dips and the bar shows *it's going* a beat before the pull rises. On a phone the reel control is the lower half of the screen, not a button; on a desktop Space and the button as today. The fish's pull shows the rod's curve, and a rod outside its curve shows a warning band on the bar.
- **After the catch**: from the moment the fish is on the mat the session swallows keys for a beat and takes focus off every button, so the key you were reeling with presses nothing behind the photo. Then the weigh-in as today, with an *award* ribbon among the honours when one is won.
- **Fullscreen**: the toggle moves out of the session chrome and into the HUD, on every signed-in screen. Hidden where the platform has no Fullscreen API (iOS Safari), as now.
- **The ticket office** (`/lake`): the day-ticket fee form on the lodge overview (`LakeOverview.svelte`) becomes a *Tickets* tab holding a ticket book instead of one number. Add a product — day (07:00–19:00), night (19:00–07:00), 24 hours (07:00–07:00) or a multiple of 24 hours — with a price and whether it is on sale. As many as you like. A *demand* line reads the ratio (*busy — you could raise the ticket* / *turning anglers away — turn on advance booking*).
- **Going fishing** (`GoFishingButton` everywhere): when a water sells more than one product, the button opens a picker — each product with its hours, its price, and the two magic windows it covers drawn on a small clock — and the day's weather line under it: *A warm south-westerly and a falling glass — the big fish will feed tonight.* One product buys straight through, as today.
- **The session clock**: runs the ticket's window (a day ticket dawn to dusk, a night ticket into the dark and out the other side) and marks the magic hours on the bar.
- **The lake view** (`/lake`, `/lake/works`, `/fish/[id]`, the hub): pans and zooms — wheel and drag on a desktop, pinch and drag on a phone — when the water is bigger than the screen can read; a minimap in the corner; swims cluster into counts until you are close enough to pick one. A *difficulty* reading sits on the water's page and the lodge: *Hard — 140 acres, lightly stocked, few features*, with the three things that would most improve it.
- **The yard** (`/lake/works`): the facilities list grows — toilets and showers, tackle shop, bar, restaurant, hotel — each with what it does, what it costs to build and to run, and what it needs first. The plot can be bought up to two hundred acres. A new *sanctuary* tool marks a stretch of bank where no peg may go. On a phone the bench stacks: the prompt on its own lines, the buttons under it, on every drawing tool (this is the backlog's shelf-editor fix).
- **The bailiffs panel** (`/lake` → *Water* becomes *Bailiffs & water*): a team, not a switch. Each bailiff has a name, a wage, a performance out of 100 and what they have done this week; three candidates a fishery week to *hire* while there is room for the acreage, and *sack* whenever. Under the team, the water's readings as today.
- **The stock panel** (`/lake` → *Stock*): three numbers across the top — the size breakdown (singles, doubles, twenties, thirties, forties, fifties, with counts and biomass), *what this water will grow* in pounds with the one thing holding it back named, and *what it draws* as a business. Then the named fish and the shoals as one list with a selection: *sell to dealer (n)*, *list for sale (n)*, *move to <my other water> (n)*, *offer in a trade*. Under it, the other species in the water with what they are costing you and a *net the silvers* action.
- **The farms** (`/market/farms`, replacing the farm form buried in the stock tab): farms around the world on a list and on the globe, each with a grade, a region and this week's packs — *20 × 4–6 lb, two years old, £3,000 · 1 × 48–52 lb, nineteen years old, £46,000, five to eight years left in it*. Transport and quarantine quoted before you buy, as the fish market already does.
- **The booking diary** (`/lakes/[id]/book`): once advance booking is on, a peg and a product on a date; the water's page reads *next free peg: Thursday*; the angler's diary sits on `/angler`. Syndicate places, when sold, are a count, a yearly price and who holds them.
- **A water's page** (`/lakes/[id]`): leads with what an angler actually chooses on — the best fish in it, the size breakdown, the difficulty, *walk on* or *next free peg*, the ticket book, today's weather, and its shop if it has one. Reputation moves below the fold, where it belongs.
- **Bounties**: a card on `/news`, a pill on the waters list and on the water's page, and on the bank a marker on the peg itself when the bounty is on that swim. The prize is named in full — a brand, a sum, or the piece of kit — because half the point is seeing it.
- **Awards** (`/angler/awards`, new): what you have won, what is next and how close you are, with the bounties you have taken and any sponsorship you hold and when it runs out.
- **The prototypes** (`/world/hall-of-fame`, a small board): the handful of one-of-one rods and reels in existence, who holds each, and the ones that have been snapped, with the date.
- **The home screen** (`/home`): one new line under the lake — *The biggest fish in the game: Old Girl, 57 lb 2 oz, at Étang de la Brèche* — leading to the fish and, if the water is open, to fishing it. The same line is offered to the public front page when the open-gates branch builds it.
- **Trades** (`/trades`, new, and a sheet from the stock panel and from another angler's page): my offers out and in, each with the fish both ways, the money either way, the transport each side pays, and *accept · decline · counter*. A trade shows on both anglers' pages and in the world feed.

## 3. Site map

Six new routes: `/tackle` (the tackle box), `/market/tackle` (the counter), `/market/farms` (the farms, replacing the form on the stock tab), `/angler/awards`, `/lakes/[id]/book` (the booking diary) and `/trades`. The hall of fame gains a prototypes board. Everything else attaches to screens that exist: the angler page, the lake view, the yard, the ticket office, the bailiffs panel, the stock panel, a water's page, the news feed, the hub and the home screen. The tab bar and the hub buttons do not change; the tackle box is reached from the tackle shop and from the session's tackle step.

## 4. Data

Migrations continue from `0018c`. Each phase names its own, and `SETUP.md` §1.3 lists every one to run.

**Phase 1 — rating and the fight.** Nothing new stored. Craft is the four skill columns; pedigree is derived from the current fisherman's heaviest catch, which `catches` already holds (`fisherman_id`, `weight_lb`). Migration `0019_the_anglers_rating.sql` adds `angler_rating(angler uuid)` in SQL (least of craft and pedigree) and points `angler_summaries.overall_skill` and the leaderboards at it, so lists sort by the same number the page shows.

**Phase 2 — the tackle trade.** `0020_the_tackle_trade.sql` and `0020b_the_shelves.sql` (the seed):

- `tackle_items` — the catalogue, seeded, not user data: `id`, `brand`, `kind` (`rod`, `reel`, `line`, `hook`, `rig`, `lead`, `tubing`, `bait`), `label`, `price`, `minimum_rating`, and the stats of its kind as typed columns — `test_curve_lb`, `length_feet`, `is_full_duplon`, `spool_metres`, `cast_factor`, `retrieve_factor`, `breaking_strain_lb`, `diameter_mm`, `line_colour`, `hook_size`, `barb`, `finish`, `straightens_above_lb`, `snaps_above_lb`, `rig_kind`, `bait_kind`, `appeal`, `keeps_days`, `pack_quantity` — null where the kind has no such stat. Not a bag of JSON.
- `tackle_owned` — `profile_id`, `item_id`, `quantity`, `spoils_at` (bait only), `bought_at`. A rod or reel is quantity 1 and never falls; line, hooks, rigs, leads, tubing and bait are consumed.
- `saved_rods` — `profile_id`, `name`, `rod_item_id`, `reel_item_id`, `line_item_id`, `hook_item_id`, `rig_item_id`, `lead_item_id`, `tubing_item_id`, `bait_item_id`. Replaces `profiles.saved_rods` (the JSON column is migrated to rows built from Bankside Basics equivalents, then dropped).
- `catches` gains `rod_item_id` and `reel_item_id` beside the rig, bait and hook size it already records, so a catch remembers what landed it.
- `lakes.shop_tier` — what a water's shop stocks, derived nightly from reputation and water quality but stored, so the shelf is stable between simulated days.

**Phase 3 — rigs and bait.** Nothing new stored. The rig and bait stats are catalogue columns from phase 2; spoilage is `tackle_owned.spoils_at`. `0021_rigs_and_bait.sql` re-seeds the catalogue rows that change.

**Phase 4 — farms and moving fish.** `0022_the_farms.sql`: `fish_farms` (`id`, `name`, `region`, `grade`, `latitude`, `longitude`) and `farm_packs` (`farm_id`, `fishery_week`, `size_band_lb_from`, `size_band_lb_to`, `age_years`, `count`, `price`, `supply_left`). `carp_transfers.farm_band` becomes `farm_pack_id`. `carp.age_years` carries the pack's age rather than `2 + weight/4`. An estate move is a `carp_transfers` row of kind `estate_move`.

**Phase 5 — tickets and hours.** `0023_the_ticket_book.sql`: `ticket_products` (`lake_id`, `kind`, `days`, `price`, `is_on_sale`); `lake_visits` gains `ticket_product_id`, `session_from_hour`, `session_to_hour`, `sessions_left` and `expires_at`. `lakes.is_barbed_banned` is the owner's rule; `lakes.day_ticket_fee` stays as the default the book falls back to; every existing water is seeded with a day product at that fee and a 24-hour product at two and a half times it, rounded to £5, so every water sells a real choice from the first day.

**Phase 6 — the shoals.** `0024_the_shoals.sql`: `carp_shoals` — `id`, `lake_id`, `size_band` (`fry`, `singles`, `doubles`, `twenties`, `thirties`, `forties`, `fifties`), `count`, `average_weight_lb`, `weight_spread_lb`, `age_years`, `condition`, `origin`, `farm_pack_id`, `transit_until`, `quarantine_until`. RLS as `carp`. Existing rows are untouched: every fish in the game today keeps its row.

**Phase 7 — the big water.** `0025_the_big_water.sql`: `bailiffs` (`id`, `lake_id`, `name`, `wage`, `performance`, `aptitude`, `hired_on`, `sacked_on`) replaces `lakes.has_bailiff`, which is migrated to one bailiff per lake that had one; `lakes` gains `candidates_week` and `candidates` (the three on offer, JSON, refreshed weekly). `LandPurchase.MaximumPlotAcres` rises to 200; the head-count cap, feature coverage and difficulty are derived, never stored. The six new facilities and the sanctuary join `layout.facilities` and `layout.features` as the existing ones do — no migration.

**Phase 8 — the make-up of a water.** `0026_the_make_up_of_a_water.sql`: `lake_species` (`lake_id`, `species`, `count`); `carp.recent_captures` is derived from `catches` inside the last ten fishery days, not stored. The ceiling, the stock draw, the demand ratio and everything they feed are computed, because every one of them is a function of the stock and the stock changes hourly. `0026b_the_booking_diary.sql`: `bookings` (`lake_id`, `swim_id`, `angler_id`, `ticket_product_id`, `fishery_day`, `status`), `syndicate_places` (`lake_id`, `angler_id`, `fishery_year`, `price`), `lakes.is_booking_on`, `lakes.syndicate_places_for_sale`, `lakes.syndicate_price`.

**Phase 9 — honours and bounties.** `0027_honours_and_bounties.sql`: `awards` (`profile_id`, `award_key`, `won_at`, `catch_id`); `bounties` (`lake_id`, `swim_id`, `kind`, `target_carp_id`, `target_weight_lb`, `sponsor_brand`, `posted_by`, `prize_kind`, `prize_money`, `prize_item_id`, `opens_at`, `ends_at`, `status`, `winner_id`, `winning_catch_id`); `tackle_items` gains `is_prototype`, `prototype_number`, `is_destroyed`, `held_by`, so a one-of-one is a row in the same catalogue as everything else and can be struck out; `sponsorships` (`profile_id`, `brand`, `runs_until`).

**Phase 10 — trades.** `0028_fish_trades.sql`: `trades` (`id`, `proposer_id`, `receiver_id`, `status`, `money_from_proposer`, `money_from_receiver`, `proposed_at`, `answered_at`, `countered_from`) and `trade_fish` (`trade_id`, `carp_id`, `side`). A settled trade writes two `carp_transfers` rows of kind `trade`.

## 5. Backend (CQRS)

**Queries**: `GetAnglerRating` (craft, pedigree, what is holding it back), `GetSizeReach` (the four shares and the weakest of them, for a swim, a rod and an hour), `GetTackleBox`, `GetTackleShelves` (the world shop, or a water's), `GetTicketBook`, `GetSessionWeather`, `GetFarms`, `GetFarmPacks`, `GetLakeDifficulty`, `GetStockBySize`, `GetLakeCeiling` (the four factors and the binding one), `GetStockDraw` (the draw, the demand ratio, what the water is worth a day), `GetBookingDiary`, `GetBailiffs` (the team and this week's candidates), `GetAwards`, `GetBounties`, `GetBiggestFishInTheGame`, `GetPrototypes`, `GetMyTrades`.

**Commands**: `BuyTackle`, `SaveRodSetup`, `StockUpForSession`, `BuildTackleShop` (with the other facilities, through `OrderGroundworks`), `AddTicketProduct`, `RemoveTicketProduct`, `BuyTicket` (replacing `PayDayTicket`, which stays as the one-product case), `TurnOnAdvanceBooking`, `BookAPeg`, `SellSyndicatePlaces`, `BuySyndicatePlace`, `BuyFarmPack`, `SellFishToDealer` (a list), `ListFishForSale` (a list), `MoveFishToMyWater` (a list), `StockCoarseFish`, `NetTheSilvers`, `HireBailiff`, `SackBailiff`, `PostBounty`, `ProposeTrade`, `AcceptTrade`, `DeclineTrade`, `CounterTrade`.

- `record_catch` gains the consumption — a rig lost in a snag, bait for every hour fished, line past a break — and raises awards and settles any *first to* bounty on the spot. It records the rod and reel.
- The simulation reads the bailiff team instead of the flag, applies each bailiff's performance and pays the wages; reads the ticket book and the bookings for takings and turns anglers away when the pegs are full; applies the stock draw to how many visitors arrive, how good they are and what they pay; draws each visitor's fish with size reach, the hour, the weather and the tackle their rating buys; grows shoals as it grows fish; and raises the day's bounties.
- `close_ended_bounties` joins `close_ended_matches` and `close_ended_listings` on the minute cron: settles the window, pays the money or hands over the item, marks a prototype as held, raises the feed event.
- `settle_trade` moves the fish both ways and the money both ways in one transaction, or nothing.
- `sizeReach`, `takeWeight` and `fightRules` live in the domain and are used identically by the player's session and by the visiting anglers, so a visitor on good tackle at first light catches the same calibre of fish a player would.

---

## 6. The rules (the domain)

Every number below is a named constant in a domain module and is exercised by `npm run test:domain`. They are starting values for tuning; §8 says what the tests hold fixed while the tuning happens.

### 6.1 The angler's rating — `domain/anglerRating.ts`

```
rating   = min(craft, pedigree)
craft    = mean(line_selection, rig_selection, bait_selection, watercraft)     as today (overallAnglerSkill, renamed craftOf)
pedigree = min(100, heaviestLandedLb × PedigreePointsPerPound)
PedigreePointsPerPound = 2                                                     a fifty is the lot
```

`heaviestLandedLb` is the current fisherman's best (per `fisherman_id`, as the personal best already is): a new generation starts with its founder's craft discount and no pedigree, which is the point of an heir.

| Best fish | Pedigree | Rating with perfect craft |
| --- | --- | --- |
| nothing yet | 0 | 0 |
| 12 lb | 24 | 24 |
| 20 lb | 40 | 40 |
| **29 lb** | **58** | **58** |
| 30 lb | 60 | 60 |
| 40 lb | 80 | 80 |
| 50 lb | 100 | 100 |

`overallAnglerSkill` is replaced by `anglerRating` everywhere it is read: the bite roll, the angler page, the leaderboards and `angler_summaries` (through `angler_rating()` in SQL), the tackle locks, and the visitors (`typicalAnglerSkillFor(reputation)` becomes a rating, and phase 8 adds the stock draw to it). The four skills keep their own bars — they are how you raise your craft — and the rating page says which half is behind: `whatHoldsRatingBack(craft, pedigree)` returns *your craft is ahead of your fish — a thirty takes you to 60* or *your fish are ahead of your craft — work on your line selection*.

Skills still earn their keep in three places that are not the count:

- **Watercraft finds the fish worth finding.** `favouriteRevealScore(watercraft) = watercraft / 100` is the chance that a show on the bank (`showingFish.ts`) is over a fish's real favourite spot rather than a random one; casting to a spot a fish has shown on raises the favourite-spot bonus from ×1.3 to ×1.6 (`ShownSpotBonus`). No extra bites — a better-chosen one.
- **Watercraft reads the bite.** `strikeWindowFor(watercraft) = 4 + 1.5 × watercraft / 100` seconds replaces the flat `StrikeWindowSeconds = 4`. The fish hangs on a beat longer for the angler who reads the bobbin.
- **Craft keeps the fish on.** Barbless hooks hold ×1.00 above rating 70 (§6.5), and the fight's tension band widens by `CraftBandWidening = 0.03` at each end for a rating of 100, scaled linearly from 0.

### 6.2 Size reach and the take — `domain/fishing/sizeReach.ts`, `pickCarp.ts`

This is the spine of Design VIII and it is a change of direction: today every new thing anyone proposes for this game wants to multiply the bite chance. Nothing in phases 1–10 does, beyond the bounded pull below. What rating, tackle, hours, weather and make-up move is *which fish out of the stock takes the bait*.

```
sizeReach = 0.35 × ratingShare
          + 0.25 × tackleShare
          + 0.20 × conditionsShare
          + 0.20 × waterShare                       each share 0–1, so sizeReach is 0–1
```

| Share | Where it comes from | 0 means | 1 means |
| --- | --- | --- | --- |
| `ratingShare` | `rating / 100` | never had a fish | a fifty and four maxed skills |
| `tackleShare` | `tackleMatch.overall` — line diameter and colour, hook, rig, bait, tubing, and the rig-and-bait pairing (§6.6) | supermarket line and the wrong rig | the right rig, the right bait, invisible line |
| `conditionsShare` | the magic-hour factor (§6.8) normalised, shifted by the day's weather | two in the afternoon under a bright, flat, high glass | first light or the evening into the dark, with a falling glass and a warm wind |
| `waterShare` | `0.4 × min(1, featureCoverage / 0.25) + 0.3 × waterQuality / 100 + 0.3 × (1 − min(1, fishPerAcre / 60))` | a bare, crowded, silted clay bowl | a lightly stocked, well-featured, clean water |

Size reach does one thing: it sets the exponent that biases the take towards big or small fish.

```
takeWeight(carp) = appetite × sizeBias × windowFit × pressure × spotBonus × hookFinish

appetite     = 0.5 + condition / 200                                              as today
sizeBias     = (max(weightLb, SmallestCountedLb) / TwentyPoundsLb) ^ biasExponent
biasExponent = BiasAtNoReach + (BiasAtFullReach − BiasAtNoReach) × sizeReach     BiasAtNoReach = −1.5, BiasAtFullReach = +1.5
windowFit    = 1.25 inside the fish's own feeding window, 0.85 outside it         feedingWindowOf(carp): first light, evening, night or all day, from a stable hash of its id
pressure     = 1 − min(0.40, recentCaptures × 0.08)                                catches of this fish in the last ten fishery days (phase 8)
spotBonus    = 1.3 at the fish's favourite spot, 1.6 when it has shown there, 1 elsewhere
hookFinish   = shinyHookFactor(carp.age) with a shiny hook, 1 with matt (§6.5)
```

At size reach 0.5 the exponent is 0 and every fish is as likely as every other; today's rule sits at about 0.33. Worked on a club water — 100 doubles, 40 twenties, 8 thirties, 2 forties — this is the share of bites that are a thirty or better, and the chance of one in a six-fish day:

| Size reach | The angler | Thirties+ | One in six fish |
| --- | --- | --- | --- |
| 0.17 | a novice on cheap line at two in the afternoon | 3% | 17% |
| 0.50 | a club angler, ordinary tackle, mid-morning | 7% | 34% |
| 0.80 | an 80-rated angler on Halcyon line, right rig and bait, first light, falling glass | 12% | 55% |
| 1.00 | the lot | 18% | 70% |

**What that feels like.** Two anglers fish the same water on the same day and both land six fish. The novice on cheap line at two in the afternoon has six doubles and a low twenty. The 80-rated angler on Halcyon line, the right rig and bait, at half past five in the evening, has four doubles, a twenty-eight and a thirty-four. The day's count never told anybody anything; the fish did.

**And the stock is still the ceiling.** You cannot draw a forty out of a water that holds none. Size reach picks from what is swimming there, which is the business of §6.11 — and why growing a big fish and catching one are the same problem seen from the two ends.

**The count.** `biteChanceForOneHour` keeps its shape and loses its two multipliers:

```
chance = BaseBitesPerRodHour × hunger × confidence × craftCountFactor × tackleCountFactor × timeOfDayBiteFactor × spot × season × spread
craftCountFactor  = 0.85 + 0.15 × rating / 100              was skillFactor 0.35–1.0
tackleCountFactor = 0.85 + 0.30 × tackleMatch.overall        was ×overall, 0.05–1.0
spread            = the spot spread of §6.10, 1 until phase 7
BaseBitesPerRodHour = 0.5 until phase 5, then 0.40             a ticket can then run 24 hours (§6.8); 19 × 0.5 ≈ 24 × 0.4
SessionCatches = { Fewest: 2, Most: 10 }                     per session today (05:00–24:00), per 24 fishery hours from phase 5
```

The band is measured for a competent angler (rating 50, club tackle) — per today's 05:00–24:00 session until phase 5 and per 24 fishery hours after it — and the sweep in §8 holds it through every phase. A day or night ticket is half the hours, and the sweep asserts one to six for those. The *rate* of bites per fishery hour — the thing that makes a session feel alive — is unchanged.

### 6.3 The fight — `domain/fishing/fight.ts`, `domain/tackle/rods.ts`, `game/session/reelInput.svelte.ts`

**Rods.**

| Test curve | Lands up to | The rod |
| --- | --- | --- |
| 2.75 lb | 35 lb | The all-round carp rod |
| 3.00 lb | 50 lb | For big fish and big waters |
| 3.50 lb | 100 lb | Specialist — heavy, and you feel it on a twenty |

| Length | Cast distance | For |
| --- | --- | --- |
| 10 ft | ×0.85 | Tight swims, tree-lined margins |
| 12 ft | ×1.00 | Standard |
| 13 ft | ×1.12 | Range work |

**A rod snaps when it is under-gunned, and only then.**

```
rodSnapChancePerSecond = max(0, (fishLb − landsUpToLb) / landsUpToLb) × SnapRiskPerSecond
SnapRiskPerSecond = 0.05
```

A forty-five on a 2.75 is a one-in-seventy-a-second risk across a twenty-six-second fight — about one in three of losing it. A sixty on the same rod is about two in three. A fifty-five on a 3 lb rod is one in seven. On a rod rated for the fish the chance is zero and the fight is entirely the angler's: tension band, clutch, patience. That is the point — **the rod decides whether you have a chance; your hand decides whether you take it.** The rod card says it before you cast: *this rod will not land a forty*.

**Full duplon** (cork handles run to the butt, so the rod bends from the butt and plays the fish for you) widens the band: `SnapAbove` +0.04 and `SlackBelow` −0.03.

**Reels** multiply the fight's pace: `ReelPullPerSecond × retrieveFactor` — a big pit winds slower, so a big fish takes longer and the band has longer to catch you out. Cast distance is the rod's length factor × the reel's, against the swim's water (§6.5).

**The run is telegraphed.** The surge that drives the fish's pull is no longer `Math.sin` of wall-clock time: it is a seeded pattern per fish (`fightPatternOf(carp.id)`), so a named fish fights the same way every time it is hooked and an angler can learn it — *Old Girl runs hard, twice, then gives up*. Each run starts with `RunWarningSeconds = 0.4` of rod-tip dip and the words *it's going* before the pull rises, so the fight is read rather than reacted to. Tension carries a little inertia (`TensionInertia = 0.15`) so a 50 ms twitch of the thumb is not a snap.

**Mobile parity.** One `ReelInput` module serves both controls: pointer events rather than touch events, pointer capture on press so a finger that slides off the control keeps reeling, and a fixed 50 ms physics step run from an accumulator of animation-frame deltas, so a slow phone runs the same fight as a fast desktop. On a phone the control is the lower half of the screen (`ReelZone`), not a button. The band is tuned once, on both, against one target, by the bot in §8: a thirty landed by a competent hand about four times in five, a forty-five on a 2.75 about two in three lost.

**The settling delay.** `CatchSettleSeconds = 1.2`. From the moment the fish is on the mat the session swallows Space and Enter and takes focus off every button, so the key you were holding to reel cannot press what is behind the photo — fullscreen, most often. Named `isSettlingAfterCatch`, and it is also the beat the weigh-in needed.

**Fullscreen everywhere.** `FullscreenToggle` moves out of `SessionChrome` and into `GameHud`, so it sits on every signed-in screen; `game/stage/fullscreen.svelte.ts` already knows whether the platform can.

### 6.4 The brands — `domain/tackle/brands.ts`

Invented, so nothing real is traded on. Four tiers, each unlocked by rating.

| Brand | Tier | Rating | Makes | The story |
| --- | --- | --- | --- | --- |
| **Bankside Basics** | Starter | 0 | everything | Supermarket tackle. It works, just about. |
| **Tench & Sons** | Starter | 0 | rods, line, hooks | An old family firm making the same rod it made in 1974. |
| **Marlow Tackle Co.** | Club | 25 | everything | Honest mid-range. Most anglers own something of theirs. |
| **Quarryman** | Club | 30 | hooks, leads, end tackle | Tough, ugly, never straightens. |
| **Halcyon** | Specialist | 50 | line, hooks, rigs | Fine wire and thin strong line. Bought for the hooks. |
| **Ironwood** | Specialist | 55 | rods, reels | Big pit reels and 13 ft rods. Heavy and expensive. |
| **Blackmere** | Custom | 75 | rods, reels | Hand-built, two hundred a year, a waiting list in the fiction. |
| **Vellum & Steel** | Custom | 80 | hooks, line, rigs | Chemically sharpened, absurd money, worth it. |

Bait is its own trade: **Meadowmill Baits** (starter, ×0.9 appeal), **Redclay Baits** (club, ×1.0), **The Particle Works** (club, particles only, ×1.0), **Nocturne Baits** (specialist, fishmeal and frozen, ×1.12), **Saltmarsh** (custom, ×1.2).

The rating lock is `tackle_items.minimum_rating`; a brand's items carry the brand's minimum unless the item says otherwise (a Marlow 3.5 lb rod is Club 40). Prices run roughly ×1 · ×2.5 · ×6 · ×15 across the tiers — a Bankside Basics rod is £60, a Blackmere is £900 — set in the seed, not computed.

### 6.5 The kit and what it does — `domain/tackle/lines.ts`, `hooks.ts`, `reels.ts`, `rods.ts`

Each piece of kit touches one part of the catch and nothing else:

| Kit | Touches | Through |
| --- | --- | --- |
| Bait | whether a bite comes, and which fish | `tackleShare` (kind appeal × brand × trust, and the pairing with the rig); a bright pop-up also draws young fish and spooks old ones |
| Line | which fish (visibility) and whether it stays on (breaking strain in the fight) | `tackleShare`; `carpPullStrength` |
| Hook | whether it stays on (hold, wire) and, by finish, which fish | `HookHold`; `shinyHookFactor(age)` |
| Rig | which fish (presentation, position) and cast distance | `tackleShare`; `castDistance` |
| Lead | cast distance and finding the bar | `castDistance`; a lead lost per cast that finds a bar (1 in 12) |
| Tubing | which fish (colour vs bed) and fish care | `tackleShare`; without it a landed fish loses 3 condition |
| Reel | cast distance and the pace of the fight | `castDistance`; `retrieveFactor` |
| Rod | what you can land, and cast distance | `landsUpToLb`; `lengthFactor` |

**Line.** Diameter and breaking strain are separate now, which is the whole point of a good brand.

| | Bankside Basics | Marlow | Halcyon | Vellum & Steel |
| --- | --- | --- | --- | --- |
| 12 lb | 0.35 mm | 0.32 mm | 0.30 mm | 0.28 mm |
| 15 lb | 0.40 mm | 0.36 mm | 0.33 mm | 0.30 mm |
| 18 lb | 0.45 mm | 0.40 mm | 0.36 mm | 0.33 mm |
| 20 lb | 0.50 mm | 0.44 mm | 0.38 mm | 0.35 mm |

Visibility comes from diameter, not from the strain label: `lineVisibility = (diameterMm − 0.26) / 0.30`, clamped, replacing today's `LineVisibility` by strength. So a good brand's 20 lb is less visible than a cheap 12 lb — that is what you are paying for. Breaking strain drives the fight as it does today (`LineBreakingStrainLb` becomes the item's `breaking_strain_lb`; the 10 lb line goes, 12/15/18/20 come in). Spools are 1,000 m or 1,200 m and are consumed: a snap costs you what was past the break (`castDistanceMetres + 20`); a spool that cannot cover a cast will not cast.

Colours: **clear** (best), **camo** (new — a broken pattern, best in weed and over gravel), **green**, **brown** (best over deep silt). Ranked clear > camo > green > brown in clear water; brown and camo close the gap as the water colours up, exactly as `lineMatchScore` already does — camo joins `colourBlendScore` with 0.85 in clear water and 1.0 over gravel or in weed.

**Hooks.** Sizes 6, 4 and 2 only — size 8 is removed, it was never a carp hook. `HookSizes = [6, 4, 2]`; existing saved rods on an 8 become a 6.

| | 6 | 4 | 2 |
| --- | --- | --- | --- |
| Bite appeal | 1.00 | 1.00 | 0.85 |
| Hold | 0.85 | 0.92 | 0.96 |

Barb type is new and cuts across the size:

| Barb | Hold | Note |
| --- | --- | --- |
| Barbed | ×1.00 | Banned on some waters — an owner's rule on the ticket book (phase 5) |
| Micro-barbed | ×0.97 | The sensible default |
| Barbless | ×0.86, or ×1.00 above rating 70 | An experienced angler keeps a tight line and never notices |

Wire strength is the brand: a hook has a `straightens_above_lb` and a `snaps_above_lb`. Bankside Basics straightens above 28 lb (the fish is lost at the moment the fight would have ended; the card says *the hook opened*); Quarryman never straightens and snaps above 60; Vellum & Steel does not straighten and snaps above 90. That is how a cheap hook loses you the fish of the season.

Finish is matt or shiny, and it is **age-related**, which the game has never used: a young fish is *drawn* to a shiny hook, an old one is spooked by it. `shinyHookFactor(carp.age) = 1.15` under 8 years, `1.0` to 15, `0.8` above — multiplied by how clear the water is (`transparency / 100`, so in coloured water the finish barely matters). Matt is neutral. A shiny hook on a silty water full of stockies is a good choice; on a clear estate lake full of old fish it is a bad one. This replaces today's flat `ShinyHookVisibility`.

**Reels.**

| Kind | Spool | Cast distance | Retrieve | Note |
| --- | --- | --- | --- | --- |
| Carp reel, small | 4500 | ×0.85 | ×1.00 | Cheap, fine in the margins |
| Carp reel, large | 6000 | ×1.00 | ×0.97 | The all-rounder |
| Big pit, entry | 8000 | ×1.15 | ×0.92 | The bottom of these beats the top of the carp reels — just |
| Big pit, full | 10000 | ×1.30 | ×0.88 | Range work, and heavy to hold |

**Cast distance** is `BaseCastFeet × rod.lengthFactor × reel.castFactor × rig.castFactor`, `BaseCastFeet = 120`, and the session enforces it: a cast point further than that from the peg lands short, on the line between them, at the distance the tackle allows. The rod card shows the feet. On a two-hundred-acre water this is why a big pit reel and a 13 ft rod exist.

### 6.6 Rigs, presentations, bait and end tackle — `domain/tackle/rigs.ts`, `baits.ts`, `domain/fishing/rigMatch.ts`, `baitTrust.ts`

**Rigs stop being a lookup of the best one and become stats.**

| Rig | Cast | Presents | Bed | Holds position | Behaviour |
| --- | --- | --- | --- | --- | --- |
| Hair rig on a lead clip | ×1.00 | bottom bait | clay, gravel | 1.0 | Sits where it lands |
| Ronnie | ×0.95 | pop-up, wafter | gravel, clay | 1.0 | Rights itself — back to the same position every time |
| Spinner | ×0.95 | pop-up, wafter | gravel, clay | 1.0 | As the Ronnie, and turns harder in the mouth (hold ×1.03) |
| Chod | ×0.90 | pop-up | silt, weed | 0.4 | Slides — lands anywhere and fishes anyway |
| Helicopter | ×1.10 | pop-up, wafter | silt, clay | 0.3 | Moves on the leader; casts a long way, but it does not stay put |
| Zig | ×1.00 | zig foam | any | 0.6 | Fishes the upper layers; nothing on the bottom matters, and it is the rig for a heatwave |

That is the answer to *helicopter always wins*: it casts furthest and it is the best thing on silt, and it is the *worst* thing when you need the hook bait in one exact spot — over a gravel bar, against an island margin — because it moves. A Ronnie returns to position, so on a clean bed at a known spot it presents better. `rigMatchScore` gains `holdsPositionScore` weighted by how tight the spot is: a snag, an island margin and a gravel bar are tight (`SpotTightness = 1`), reeds and pads middling (0.6), open water and silt loose (0.2).

**Bait, and how a fish finds it.**

| Presentation | What it does | Fish behaviour |
| --- | --- | --- |
| **Bottom bait** | Sits on the deck | Best over a clean bed; disappears in silt and weed |
| **Wafter** | Balanced, wafts just off the bottom | A carp blowing at the bottom sifts silt; a wafter is lighter than the silt and goes in easiest — the best thing over soft ground |
| **Pop-up** | Rises off the lead | Usually the first bait a fish comes across; best over silt and weed and for a fish that has not fed yet |

The pairing table is the rule: a bottom bait on a chod scores badly, a pop-up on a lead clip scores badly (`PairingScore`: matched 1.0, tolerable 0.7, wrong 0.35). Bait is a kind and a brand:

| Kind | Appeal | Keeps | Note |
| --- | --- | --- | --- |
| Shelf-life boilies | 0.85 | forever | The convenient one |
| Frozen boilies | 1.00 | 6 fishery days once bought | The good one — buy it for a session, not a season |
| Pop-ups | 0.90 | forever | Bright or washed out; bright is a young fish's bait (×1.1 under 8 years, ×0.9 over 15) |
| Wafters | 0.95 | forever | |
| Pellets | 0.80 | forever | Feed, mostly |
| Particles (hemp, maize, tigers) | 0.75 | 10 days prepared | Cheap, holds fish in the swim |
| Naturals (worm, maggot, shrimp) | 1.05 | 3 days | The best bait there is and the least convenient |

Brand multiplies appeal (§6.4), and `baitTrustScore` still rewards a bait the water has been fed on. A bait that has gone off scores 0.3 and the player is told on the tackle step. The existing eight `BaitName`s map onto kind × brand in the seed so no saved rod breaks.

**End tackle** is stocked and consumed: hooks, pre-tied rigs, leads, tungsten tubing (which protects the fish and is worth having — it is also the tubing the game already models for colour), leaders and PVA. `StockUpForSession` is what a player does before the water: it reserves what the rods need for the day from the box and says what is short. Fishing without a spare rig means a lost rig ends that rod for the day; a snag loss (one in ten on a snag, as the catalogue already says) takes the rig and the lead. Consumption is written by `record_catch` and by the session's end: bait per rod per fishery hour cast (`BaitPerRodHour = 1` of a pack of 100), a hook per rig lost, line per snap.

### 6.7 The farms — `domain/market/farms.ts`, `farmPacks.ts`

The single global farm becomes farms with names and places, each with a grade, so *where* you buy is a choice.

| Grade | Sells up to | Condition | Price against guide | Supply a week |
| --- | --- | --- | --- | --- |
| Stock farm | 12 lb | 75–85 | ×0.8 | plentiful — packs of 20 to 200 |
| Good farm | 28 lb | 80–90 | ×1.0 | packs of 5 to 50 |
| Specialist | 40 lb | 85–92 | ×1.4 | packs of 1 to 10 |
| Record grower | 55 lb | 88–95 | ×2.2 | one or two fish, some weeks none |

Twelve farms, at least one a region, at a real latitude and longitude so the market's transport, transit and quarantine rules apply from the farm's gate as they do from another water:

| Farm | Region | Grade |
| --- | --- | --- |
| Meadow Fisheries | UK & Ireland | Stock |
| Fenland Carp Co. | UK & Ireland | Good |
| Brèche Piscicole | France | Good |
| Étang du Roi | France | Specialist |
| Polder Vis | Benelux & Germany | Good |
| Ebro Piscifactoría | Spain & Portugal | Stock |
| Po Valley Carp | Italy & the Balkans | Specialist |
| Tisza Halgazdaság | Hungary, Austria, Czechia & Poland | Specialist |
| Donau Karpfenhof | Romania & the Danube | Record grower |
| Lakeland Carp Co. | USA & Canada | Stock |
| Karoo Dams Hatchery | South Africa | Stock |
| Nishikigoi Kōgyō | Japan & East Asia | Good — leans ghost and pale fish |

A **pack** is a count, a size band, an age and a price, and the trade-off is written on it: *a fifty from a record grower costs about £46,000, comes in at nineteen years old, and the old-age rules apply from the day it arrives.* The same money buys two hundred four-to-six-pound fish that will be thirties in a decade of fishery years. `packPrice = count × guidePriceOf(midpoint of the band, condition, no fame) × grade.priceFactor`, rounded to £50. Packs refresh each fishery week from the farm's grade (`packsFor(farm, week)` is seeded, so every player sees the same shelf); supply is counted down as it is today by region, but per pack. Age is real: a farm fish's age is the pack's, not `2 + weight / 4` — `ageForFarmFish` goes.

Transport, quarantine and stress are the market's existing rules (`transportQuote` from the farm's point): a fifty from the Danube to a UK water is about £810, two days in transit, five days' quarantine and −25 condition. Buying the headline fish is a gamble, which is what makes it worth doing. A pack of small fish arrives as a **shoal** (§6.9) once phase 6 is in; until then, as rows, as today.

**Selling in bulk.** `SellFishToDealer` takes a list. The dealer's share is 55% for the first three fish a fishery day and `BulkShare = 45%` after — a truckload gets a truckload price — and the *3 a fishery day* wording goes. `ListFishForSale` takes a list and opens one listing per fish on the same terms. `MoveFishToMyWater` takes a list and a destination among the player's own waters: transport at cost, no commission, the fish in transit and quarantine as any transfer.

### 6.8 Tickets, the hours and the weather — `domain/fishing/ticketBook.ts`, `sessionWindow.ts`, `magicHours.ts`, `world/weather.ts`

| Product | Hours | Sold as | Sit |
| --- | --- | --- | --- |
| Day | 07:00 → 19:00 | One session | about 4½ minutes |
| Night | 19:00 → 07:00 | One session across the night | about 4½ minutes |
| 24 hours | 07:00 → 07:00 | One session across the night | about 9 minutes |
| Multi-day | 07:00 → 07:00, ×N | N 24-hour sessions on one ticket, sat one after another whenever the angler comes back within the ticket's life | N × 9 minutes |

An owner adds as many products at as many prices as they like; the water's page shows the book. `willingnessToPayFor` is applied per product against `price / hours × 12`, so pricing a night ticket at a day ticket's price simply means nobody buys it. `FishingDay.RealSecondsPerFishingHour` stays 22 — the pace players like — so a day ticket is a shorter sit and a 24-hour ticket a longer one, at the same bites per fishery hour. A session's window comes from its product (`sessionWindowFor(product)`); the clock, the sky, the bite roll and the seed all read hours past 24 as the next morning. The ticket's real-time life is two hours a session (`expires_at`), as today; a multi-day ticket carries `sessions_left`.

**The magic hours.** `timeOfDayBiteFactor` is **left exactly as it is** — 1.3 before eight and after six, 0.7 from eleven to three, 1.0 between. The hours already shuffle bites around the day sensibly and the day's total is where it should be. What is new is a second, separate function beside it:

| Hours | Size factor | |
| --- | --- | --- |
| **05:00–10:00** | ×2.2 | First light. The best five hours in the game. |
| **16:00–24:00** | ×2.0 | Into the dark. The other eight. |
| 00:00–05:00 | ×1.5 | Quiet, but what comes out is worth having |
| 10:00–16:00 | ×0.6 | The afternoon. Fish get caught; thirties do not. |

`magicHourSizeFactor(hour)` feeds `conditionsShare` — normalised so ×0.6 is 0 and ×2.2 is 1 — and nothing else. **You will catch the same number of fish at two in the afternoon as at six in the morning — they will be smaller, and that is the whole point.** A day ticket runs 07:00–19:00: it catches the tail of the morning and gives away the entire evening. A night ticket has the 16:00–24:00 window and the quiet hours after it. A 24-hour ticket has both magic windows in it and is worth roughly two and a half times a day ticket to a serious angler, which is what an owner should be charging for it.

**The weather.** The weather the game already rolls per fishery day per water (`weatherFor`) gains a *glass* — pressure, rising, steady or falling — and a wind direction, and becomes a condition: `weatherSizeShift(weather)` moves `conditionsShare` by up to ±0.15: overcast with a falling glass and a warm south-westerly +0.15; rain +0.05; clear and steady 0; bright, flat, calm and high −0.15; a heatwave −0.20 on the bottom and +0.20 on a zig. It is the same seeded roll for the player's session and for the simulated visitors, so the bank can say it truthfully: *A warm south-westerly and a falling glass — the big fish will feed tonight.* The bailiff's note carries the week's best day. Nothing about weather moves the count.

**An owner's rule.** The ticket book carries `is_barbed_banned`: a water that bans barbed hooks refuses a rod carrying one at the tackle step, the way a real ticket does.

### 6.9 The shoals — `domain/stock/shoals.ts`, `simulation/growShoals.ts`

A water's stock is its named fish plus its shoals. Every fish in the game today keeps its row; nothing is migrated. A shoal is a count of fish of one size band and age with an average weight, a spread and a condition — *184 × 4–6 lb, two years old, condition 82*. A shoal comes from a farm pack of young fish, from spawning (fry spawn into a shoal rather than as rows), or from a stocking order of more than `NamedFishThreshold = 20` fish at a time.

- **Simulation** runs on a shoal as it runs on a fish, count-weighted: `growShoalForOneDay` grows the average; condition, hunger, heatwaves and ageing apply to the shoal; pike take from shoals first — a pike eats small fish, and the shoal count falls before any named fish is at risk; the biomass and head-count rules count a shoal as `count × average`. A shoal whose average crosses `NamedFromLb = 20` splits its top into named fish (`individualise`), because a twenty is a fish with a name.
- **The take.** The bite roll picks between named fish and shoals by total `takeWeight` (a shoal's is `count × takeWeight(its average)`). A shoal fish that takes is drawn from the band (`average ± spread`) with the same seeded roll the bite came from, so the server verifies it exactly as it verifies a named fish; it is given a name and a row on the spot, and the shoal's count falls by one. *A fish you have seen becomes a fish with a name* — and it is catalogued, so the market and the dossier know it.
- **The stock panel** shows shoals as one line each with their band; the size breakdown counts them. The dealer buys a shoal by count; listings, trades and bounties are for named fish only.
- **Rendering** draws a sample of the shoal (`fishSchool.ts` already draws a school) — never forty thousand sprites.

Without shoals a two-hundred-acre water is forty thousand rows grown and upserted on every visit. With them, a big water carries a few hundred named fish and a dozen shoal rows, and the cost of a visit does not depend on the head count.

### 6.10 The big water — `domain/lakeDifficulty.ts`, `groundworks/`, `bailiffs.ts`, `layout/featureCoverage.ts`

- `LandPurchase.MaximumPlotAcres` rises from 40 to **200**, in 5-acre purchases as today; the cost curve is the region's land price, so two hundred acres in the UK is £500,000 and in the Danube basin £120,000 — a genuine endgame spend.
- **Head count**: `MaximumFishPerAcre = 200`, so a 200-acre water caps at **40,000 fish**. The biomass rule (`StockingDensity`, 400 lb an acre) is unchanged and bites first for grown fish — 400 lb an acre means a ten-acre water holds about 200 twenties, which is what a real ten-acre syndicate water holds. The head cap is the ceiling on stockies; biomass is the ceiling on thirties.
- **Swims**: `SwimRules.AcresPerSwim` stays 0.6, so two hundred acres allows 334 pegs.
- **The view zooms.** `game/scene/camera.ts` (new — a pan-and-zoom transform, not the swim-view camera Design II removed) sits between layout fractions and the canvas: zoom 1× to 8×, wheel and drag on a desktop, pinch and drag on a phone, `toScene` and `toFraction` go through it. A water whose plot is over `ZoomFromAcres = 30` starts fitted to the screen with a minimap (`Minimap.svelte`); swims whose screen spacing falls under 24 px cluster into a count (`clusterSwims`) until you are close enough to pick one; labels come in by level of detail. The builder's tools, the fishing session's cast point and the hub's living lake all read through the camera. On a two-hundred-acre plot the scene is about 2,950 ft across — 7½ ft a pixel on a phone — so a 60 ft peg spacing is eight pixels: without the camera the big water cannot be played at all.

**Lake difficulty** (0 hardest, 100 easiest) is derived, never stored. It does **not** decide how many fish come out — that would break the band. It decides how hard they are to *find*:

```
difficulty     = 100 × sizeSpread × stockingFactor × featureFactor × qualityFactor
sizeSpread     = 1 − min(0.55, (waterAcres − 10) / 400)         10 acres none, 200 acres −0.475
stockingFactor = 0.55 + 0.45 × min(1, fishPerAcre / 120)
featureFactor  = 0.70 + 0.30 × min(1, featureCoverageShare / 0.25)
qualityFactor  = 0.75 + 0.25 × overallWaterQuality / 100
```

Difficulty spreads the bite chance across the water rather than removing it. On an easy water every spot fishes much the same; as difficulty rises the good spots get better and the bad spots get worse, around the same total:

```
spotSpreadFactor = 1 + (1 − difficulty / 100) × (spotBiteFactor − averageSpotBiteFactor) × SpreadWeight
SpreadWeight = 1.8
```

So two hundred acres of featureless water is not a water where fish stop feeding — it is a water where the four spots worth casting to are four spots in two hundred acres, and an angler who cannot read water blanks on it while a good one has his usual six. The net effect on a session's count is clamped to ×0.9–×1.1 by `SessionCatches` and tested. Difficulty's real weight is on `waterShare` in size reach: a hard, big, well-made water is where the big fish are. Worked: a ten-acre, 200-fish, quarter-featured water at quality 70 reads 58; two hundred bare acres at 20 fish an acre reads 20 (*hard*); the same water at 120 an acre, a quarter featured, quality 80, reads 50.

**And note the tension this creates, because it is the best decision in the game:** `stockingFactor` rewards *packing* the water — more fish an acre, easier to find, busy and forgiving. `mouthPressure` in §6.11 rewards the opposite — fewer mouths, more food each, bigger fish. Stock heavy and you run a busy day-ticket water full of twenties. Stock light and you run a hard, quiet water that grows forties. Both are viable businesses and they are opposite ends of the same dial.

**Feature coverage** is the share of the water within reach of an island margin, gravel bar, weed bed, lily pads, reed line, deepened hole or snag — which finally gives the existing features catalogue a number that says what each is worth. It is measured, not summed: `featureCoverageShare(layout, scale)` samples a `CoverageGrid = 48 × 48` of points over the water and asks `terrainAt` (which already knows island margins at 30 ft, snags at 25 ft, reeds at 20 ft, and the area features) what is there, so the number is exactly the water the fishing rules see:

| Feature | Coverage it contributes |
| --- | --- |
| Island (large) | 0.8 acre + a 30 ft margin all round |
| Gravel bar | its own acreage ×1.5 |
| Deepened hole | its own acreage (and it is where the winter fish are) |
| Lily pads | its own acreage ×2 in summer, ×0 in winter |
| Reed line | 20 ft either side of its length |
| Snag | a 25 ft circle, and the one-in-ten loss |
| Sanctuary (new) | a stretch of bank with no pegs: 40 ft of water along it, and `feedingConfidence` +0.05 each, up to +0.15 |

The **sanctuary** is a new bank tool in the yard: draw a stretch of shoreline, and no swim may be placed within `SanctuaryPegFeet = 60` of it. It costs nothing but pegs, and on a big water giving up pegs is a real price; big fish favour it (`favouriteSpotOf` can return a sanctuary), and it is the cheapest way to move the ceiling.

**Facilities** grow from three to nine. Each is a one-off build plus a daily running cost, and each pulls a different lever.

| Facility | Cost | Days | Running | Effect |
| --- | --- | --- | --- | --- |
| Car park and track | £4,000 | 4 | — | Anglers ×1.15 *(exists)* |
| Lodge | £12,000 | 10 | — | +£4 a head *(exists)* |
| Aerator | £2,500 | 2 | £15/day | No heatwave losses *(exists)* |
| Toilets and showers | £9,000 | 6 | £10/day | Anglers ×1.12; multi-day tickets ×1.3 |
| Tackle shop | £18,000 | 12 | £25/day | Sells tackle to visitors — takings — and anglers can buy on site, at the water's tier |
| Bar | £35,000 | 20 | £60/day | +£9 a head; reputation +0.3 a day |
| Restaurant | £60,000 | 28 | £120/day | +£18 a head; anglers ×1.2; needs the bar |
| Hotel | £180,000 | 45 | £300/day | Anglers ×1.5 and they pay ×1.4; needs the restaurant |

Facilities join `Facility` in `layoutTypes.ts` and `FacilityPicker.svelte` as the three existing ones do; `anglersArrivingToday`, `lodgeTakings` and `willingnessToPayFor` read them.

**What a shop may stock** is the rule that makes a well-run water worth visiting: a brand will not put its name in a badly run fishery.

```
shopTier = the highest tier whose minimumWaterRating ≤ reputation × 0.6 + waterQuality × 0.4
Starter 0 · Club 35 · Specialist 60 · Custom 82
```

So Custom-tier tackle — the hand-built rods and the chemically sharpened hooks — can only be bought at a handful of waters in the world, and being one of them is a thing an owner can aim at. An angler's rating still gates the purchase; the water gates whether it is on the shelf at all. The shop's takings are `visitors × shopTier.spendPerAngler` a day (£6 · £11 · £22 · £40).

**Bailiffs become a team.** `bailiffCapFor(acres) = max(1, ceil(acres / 15))` — one on a ten-acre water, fourteen on two hundred. Each has a name, a wage (£40 a day, ±20% by performance), a performance 0–100 that drifts by a point or two a day around a hidden aptitude (40–95) and shows in the panel, and what they have done this week. The daily clearing each bailiff does is the existing figures (`DailyWaterDrift.Bailiff*`) × performance / 100 × min(1, 1 / bailiffsNeeded), so an under-staffed big water slowly silts up whatever the bailiffs' quality; fee collection is the team's average performance rather than a flag (`FeeCollection.WithoutBailiff = 0.55` stays the floor). Three candidates a fishery week appear in the panel with a name, an asking wage and a reference (*keen*, *steady*, *sleeps in*) — a hint at aptitude, not the number. Sacking is instant and free. `lakes.has_bailiff` is migrated to one bailiff of performance 70 on every water that had one.

### 6.11 The make-up of a water — `domain/water/lakeCeiling.ts`, `species.ts`, `stockDraw.ts`, `pressure.ts`, `bookings.ts`

Three things follow from what is actually swimming in a water and how the water is shaped: **what it will grow**, **what else takes the bait**, and **what it is worth as a business**. They are the owner's whole job.

**What a water will grow.** The region ceiling (Design II, `regionGrowthCeiling`) is the most a fish could ever reach there. What it will actually reach is the water's own, and it replaces the region figure in `feedTheLakeForOneDay`:

```
lakeCeilingLb = regionCeilingLb × mouthPressure × feedingConfidence × qualityFactor × competitionFactor

mouthPressure     = 0.55 + 0.45 × (1 − min(1, fishPerAcre / MouthsPerAcreThatCrowd))     MouthsPerAcreThatCrowd = 60
feedingConfidence = 0.65 + 0.35 × min(1, featureCoverageShare / 0.25)
qualityFactor     = 0.80 + 0.20 × overallWaterQuality / 100
competitionFactor = 1 − feedStolenShare
```

A fish stops growing at the lesser of its region ceiling and its water's. The number is shown to the owner in pounds with the weakest of the four factors named: *this water will grow a fish to 38 lb — it is the stocking density holding it down.* Worked:

| Water | Mouths | Features | Quality | Bream | Ceiling |
| --- | --- | --- | --- | --- | --- |
| Ten-acre estate lake, 200 carp, quarter featured, UK (68) | 20/acre → 0.85 | 0.25 → 1.00 | 70 → 0.94 | none → 1.00 | **54 lb** |
| The same water stocked to 400 carp | 40/acre → 0.70 | 1.00 | 0.94 | 1.00 | **45 lb** |
| Bare clay bowl, 400 carp, no features, silted, 300 bream | 0.70 | 0.65 | 0.89 | 0.70 | **20 lb** |
| Forty-acre Danube water, 300 carp, well featured, clean (105) | 7.5/acre → 0.94 | 1.00 | 0.98 | 1.00 | **97 lb** |

The last line is the endgame and it says the quiet part out loud: **to grow a fifty you need a big, clean, well-featured water with very few fish in it.** That is what a record water is, and it is why one is expensive to build and slow to fill — at the best growth rate in the game a twenty takes about nine hundred fishery days — two and a half fishery years, five or six real weeks — to become a fifty.

**What else is in it.** A water holds more than carp. `lake_species` carries a count per species, and the site templates seed them honestly — the estate lake and the clay pit come with bream whether the owner wanted them or not.

| Species | Steal | Nuisance bites | Note |
| --- | --- | --- | --- |
| **Bream** | 0.9 | 0.30 | The vacuum. First to the bait, and they clear it. |
| Tench | 0.4 | 0.12 | Tidy feeders. A water with tench reads as a healthy water: +2 reputation. |
| Crucian | 0.3 | 0.10 | Harmless and popular — visitors like them. |
| Roach and rudd | 0.15 | 0.06 | Pike food that breeds, so the pike feed themselves. |
| Perch | 0.10 | 0.05 | Eat fry, which holds the silvers down for you. |

```
feedStolenShare   = min(0.45, Σ(count × steal)    / (waterAcres × 90))
nuisanceBiteShare = min(0.40, Σ(count × nuisance) / (waterAcres × 90))
```

Three hundred bream on ten acres steal thirty per cent of the feed and turn one bite in ten into a bream. **A nuisance fish is a real bite**: the alarm goes, you strike, you play something that pulls like a wet sack, and it is a 6 lb bream. It costs you the hour and the bait, it does not count as a catch, and it goes in the session log as colour. It does not come out of the two-to-ten band — the band counts carp, and nuisance bites are drawn on top of it. Two new management actions: `StockCoarseFish` (cheap; silvers feed the pike, tench raise reputation) and **netting** — `NetTheSilvers`, £900 an acre, 4 fishery days, disturbance 8, takes out 60% of the non-carp. Netting a bream-ridden water is one of the biggest single things an owner can do to the ceiling.

**Why features make carp feed.** One number, `featureCoverageShare`, does three jobs, and this is the third: `feedingConfidence` multiplies the ration actually eaten in `feedTheLake`. **Feed thrown into a bare clay bowl is partly wasted — a carp will not sit out in the open and eat it.** So a featureless water burns money on bait that never becomes weight, and the fix is the same thing that makes it fish better and find better: bars, islands, reeds, pads, snags, a sanctuary. Three effects, one lever, and an owner learns it once.

**What the make-up is worth as a business.** This is the other half, and it is what turns a stock list into a fishery. **Anglers do not travel for a number of fish, they travel for a size of fish**, and the bands are not a smooth curve — they are four very different propositions:

| Band | Pull per fish | What it is to an angler |
| --- | --- | --- |
| Singles | 0.05 | Nothing. Stock. |
| Doubles | 0.15 | A pleasant day. Nobody drives for it. |
| Twenties | 0.6 | A good day out, and where most anglers live |
| **Thirties** | **2.5** | **A reachable personal best.** The bread and butter of a busy fishery — a rack of thirties fills a car park. |
| **Forties** | **12** | **A prize fish.** One makes a name. Two or three and you are a destination. |
| **Fifties and up** | **60** | **A holy grail.** One in the water and the diary is full. |

```
stockDraw = Σ over bands (pullPerFish × count ^ 0.6)
```

The exponent is the diminishing return: the tenth forty is not worth ten times the first, because an angler comes for the *chance* of one and one is enough to create it. Shoals count in their band.

| Water | Stock | Draw | Anglers | They pay | Reputation settles at |
| --- | --- | --- | --- | --- | --- |
| Starter | 200 doubles | 4 | ×1.10 | ×1.06 | 28 |
| Club water | 100 doubles, 40 twenties, 8 thirties | 17 | ×1.42 | ×1.24 | 38 |
| Prize water | the same, plus 2 forties | 35 | ×1.87 | ×1.50 | 53 |
| Holy grail | the same, plus a fifty | 95 | ×3.37 | ×2.35 | 100 |

```
drawFactor  = 1 + min(2.5, stockDraw / 40)        multiplies anglersArrivingToday
payFactor   = 1 + min(1.5, stockDraw / 70)        multiplies willingnessToPayFor
stockRenown = min(100, 25 + stockDraw × 0.8)      reputation drifts toward this by 0.5 a day (beside the water-quality drift it already has)
```

A holy-grail water takes about eight times a starter water's daily money, and it does it because of one fish. That is the business the whole design is pointing at, and reputation stops being something you grind out of catch reports and starts being something your stock *is*.

**Prize anglers.** A water's draw pulls better anglers as well as more of them: a visitor's rating becomes `typicalAnglerSkillFor(reputation) + min(25, stockDraw × 0.25)`, and the tackle they fish is the best tier that rating unlocks, capped one tier above the water's shop. The owner's tension is exactly right — your forty draws the anglers who are good enough to catch it, they photograph it, its fame and its market value climb, and it gets harder to catch.

**Pressure.** A fish caught repeatedly wises up. `recentCaptures` is a fish's catches in the last ten fishery days; `pressureWariness = min(0.4, recentCaptures × 0.08)` comes straight off its take weight. A fifty on a water selling forty tickets a day is unfishable within a fortnight, which is the owner's reason to hold the numbers down — the first fishery in the game where the right answer is to sell *fewer* tickets at a higher price. The dossier shows it: *caught four times this week — it will be wary.*

**Booking.** When demand passes the pegs, a water stops being walk-on.

```
pegsPerDay  = swimCount × PegTurnoverPerDay        PegTurnoverPerDay = 1.4
demandRatio = anglersWanting / pegsPerDay
```

| Ratio | The water is | What the owner can do |
| --- | --- | --- |
| under 0.8 | quiet, walk on | Advertise. Stock a thirty. Post a bounty. |
| 0.8 – 1.2 | busy | Raise the ticket |
| 1.2 – 2.0 | turning anglers away — lost money, and *couldn't get on* costs reputation (−0.2 a day) | Turn on **advance booking** |
| over 2.0 | a waiting list | Sell a **syndicate** |

Advance booking is a switch on the ticket book: an angler reserves a peg and a product for a fishery day, the water's page reads *next free peg: Thursday*, the angler's diary sits on `/angler`. A booked peg is held for its holder and cannot be walked onto; a no-show forfeits the ticket at the day's end. A syndicate is N season tickets at a year's price, sold once a fishery year (365 fishery days — a little over two real weeks — so a syndicate year is a real commitment); members fish free and a syndicate-only water sells no other product. Both are the owner's choice, not the game's. The simulation turns visitors away when `anglersWanting > pegsPerDay` and, when booking is on, honours bookings first.

### 6.12 Honours, bounties and prize tackle — `domain/trophies/awards.ts`, `domain/bounties/`

**Awards** extend the existing milestones and are stored, because they are won once. Twenty-one keys, in `AwardCatalogue`, each with its words and how close you are:

| Award | Won by |
| --- | --- |
| First double · first twenty · first thirty · first forty · first fifty | the fish on the mat (the four existing milestones become awards; the eight `milestones_of` kinds are migrated into `awards` so nothing already earned is lost) |
| A hundred · five hundred · a thousand fish landed | the count |
| Five regions · ten regions | a fish from each |
| Home grown | a thirty from your own water |
| Light rod | a fish over 40 lb on a rod under 3 lb test curve |
| A match won | the first trophy |
| First record | the heaviest fish an angler had ever had on that water (an existing milestone) |
| Three waters | a lake record on three different waters |
| Ten thousand pounds | 10,000 lb landed in a lifetime |
| Night owl · early bird | fifty fish after dark · fifty before eight in the morning |
| The full book | a fish on each ticket product — day, night and 24 hours |
| The dealer's friend | a hundred fish sold on |
| First bounty | the first bounty taken |

Each raises a notification and a ribbon at the weigh-in, and appears on `/angler/awards` with the next one and how far off it is. `raise_awards(angler, catch)` runs inside `record_catch`; the count-based ones are also checked by the dealer and the match settlement.

`GetBiggestFishInTheGame` is the heaviest living catalogued carp anywhere, with its water and whether that water is open — one line on the home screen, a card on `/news`, and offered to the public front page. **Stock by size** is a grouping query on a lake's carp and shoals: singles, doubles, twenties, thirties, forties, fifties — counts, total biomass, and the water's draw and ceiling beside them, because those three numbers together are the fishery.

**Bounties.** A prize that appears out of nowhere on a water, sometimes on a single swim, inside a window. Each open, set-up public water has a `BountyChancePerFisheryDay = 0.04` of drawing one (rolled in `simulateOneDay`, so it is seeded and the same for everyone) and can hold one at a time; the window is 2 to 6 fishery days.

| Kind | Won by |
| --- | --- |
| **Top of the water** | The heaviest fish an angler lands here inside the window |
| **Named fish** | Landing one particular catalogued fish — first to take it |
| **Peg prize** | The heaviest from one named swim |
| **Over the line** | First angler to land a fish over a stated weight here |
| **Hard graft** | The most fish landed here inside the window — the one bounty that is about numbers, and deliberately the smallest prize |

A bounty's **difficulty band** comes from what it asks against what the water holds — *top of a water whose best fish is a twenty* is easy; *over the line at 40 lb* on a water with two forties is very hard — and the difficulty decides the prize. Sponsors are the invented brands: *Halcyon are putting £1,200 on the biggest fish out of Willow Pool by Thursday.* An owner can post their own with `PostBounty`, minimum £250 from their own money, which is the lever for pulling anglers through the gate when the takings are thin — and, now that the ticket book and booking exist, a cheap way to fill a quiet week. Money prize: `£400 + guidePriceOf(the water's best fish) × 0.15`, rounded to £50 — about £500 on a small water, £8,000 on a great one. Settling: *first to* kinds settle inside `record_catch` on the spot; window kinds settle on the minute cron (`close_ended_bounties`): winner gets the money, the item or the unlock, a notification, a feed event and a line in the scrapbook.

**Prize tackle.** One bounty in three pays in kit instead of money, and this is where the good stuff lives, because prize tackle is the only way to hold things the shop will never sell you. Six kinds, in rising rarity, drawn by the bounty's difficulty band:

| # | Prize | What it is | Band |
| --- | --- | --- | --- |
| 1 | **Brand credit** | £250–£2,000 that spends only with one brand. Gets a novice into Club-tier kit years early. | Easy |
| 2 | **A tin of hand-picked hooks** | 25 Custom-tier hooks that never straighten and never snap. Consumable — so there is a real decision about which water you take them to. | Easy–Moderate |
| 3 | **A batch spool** | One 1,200 m spool of a diameter that is not on sale: *Vellum & Steel 20 lb at 0.30 mm*. Thinner than anything purchasable at that strain, so it is flatly better, and when it is gone it is gone. | Moderate |
| 4 | **A drum of bait** | A season of a brand's fishmeal at an appeal above the shelf, which spoils in 30 fishery days. Use it or lose it — it wants a campaign, not a session. | Moderate |
| 5 | **A sponsorship** | A brand backs you for a fishery year: their whole tier unlocks regardless of your rating, and their kit is 40% off. It changes *what you can buy* rather than handing you one thing, which makes it the most valuable prize at its band. | Hard |
| 6 | **A prototype** | The headline. One rod or reel, numbered, **unique in the world** — only one instance exists across every player. A stat beyond anything on sale: *Blackmere Prototype No. 7, 3.25 test curve, lands 62 lb; Ironwood 11000, cast ×1.40*. It carries the winner's name, every fish landed on it shows a ribbon on its catch card, and **if it snaps it is gone for ever.** That is the tension it exists for: do you take the one-of-one to the water that holds the fifty? | Very hard |

Two more prizes that are not tackle but belong on the same wheel, because they are the ones an established player actually wants: **a peg at a legend** — a booked peg and ticket at a water whose diary is full, the only way onto a syndicate water without buying in — and **a stocked fish** — the sponsor delivers a fish to *your* water, a 30 lb mirror, transport and quarantine paid; an owner's prize, and it moves their stock draw.

`PrototypesPerBrandPerFisheryYear = 2`, so a handful exist in the world at any time. The hall of fame gains a small board — the prototypes and who holds them — and a snapped one is struck from it with the date, which is its own kind of fame.

### 6.13 Trades between players — `domain/trades/tradeRules.ts`

A trade is an offer from one angler to another: fish from my water for fish from yours, with money either way or none.

- **Offering.** Pick up to `MostFishASide = 10` named fish from your own stock, pick the other angler, optionally ask for named fish from any of their waters and set money either way. The transport each side will pay is quoted from the two waters' positions before the offer goes.
- **Receiving.** An inbox line (`trade_offered`) and a line in the bailiff's note; the offer shows on `/trades` with *accept · decline · counter* — a counter is a new offer that references the old (`countered_from`).
- **Settling.** `settle_trade` runs in one transaction: it re-checks every fish is still in the water named, not listed, not in a live match, not in transit or quarantine, and above `MinimumConditionToTrade = 40`; debits and credits the money; writes two `carp_transfers` rows of kind `trade` and moves each fish with the market's transit and quarantine rules — or does nothing. Neither side can end with both or neither.
- **Fair play.** No shoals (a trade is between named fish), no fish under 4 lb, no more than three open offers a player at a time, a trade shows in both anglers' histories and in the world feed (`trade_done`: *Priya swapped Old Girl for two of Sam's thirties and £2,000*), and no real money — the terms already say in-game money has no value.
- **Why it belongs here.** Trades are how a player builds the stock he wants without the market's auction clock, and a reason to deal with other people; with the stock draw in place, a trade that moves a forty moves a fishery.

---

## 7. Phases

Ten branches, in this order, because each depends on the one before. Every phase is one task in Your Business Today (its title below is the task's title, a story as the doctrine asks), one branch named for it, and one pull request the owner merges. Each branch commits this document first if it is not yet on `master`. Sizes are relative to phase 1, the smallest: **S** a session, **M** two or three, **L** a working week of sessions, **XL** more, and each is measured before it starts by the fast audit so the score does not fall (§8).

### Phase 1 — `feature/angler-rating` · S

**Task:** *As an angler, I want my rating capped by the biggest fish I have landed, and a fight I can win on a phone as well as at a desk.*

**Delivers.** Rating as the lesser of craft and pedigree; size reach replacing the skill multiplier on the bite chance, with the count band written as a test first and kept green; the take-weight exponent, feeding windows and the shown-spot bonus; watercraft revealing the fish worth casting to and lengthening the strike window; the fight retuned once on both platforms — `ReelInput`, the fixed physics step, the telegraphed run, seeded fight patterns, tension inertia, the `ReelZone` on a phone; the settling delay after a catch; fullscreen on every screen; the rating dial on the angler page and the size-reach line on the tackle step (tackle share is today's `tackleMatch.overall` until phase 2 replaces its inputs; conditions share is a flat 0.5 until phase 5 gives it hours and weather; water share reads today's water quality and stocking, with feature coverage joining in phase 7). *Nothing is bought or built in this phase — it is the fix for what is wrong today, and it is small.*

**Files.** Domain: `anglerRating.ts` (new), `fishing/sizeReach.ts` (new), `fishing/takeWeight.ts` (new, from `pickCarp.ts`), `fishing/feedingWindow.ts` (new), `fishing/biteChance.ts`, `fishing/fight.ts`, `fishing/fightPattern.ts` (new), `fishing/strikeWindow.ts` (new), `fishing/catchSettle.ts` (new), `layout/favouriteFeature.ts`; `anglerSkills.ts` keeps the gains and loses `overallAnglerSkill`. Game: `session/reelInput.svelte.ts` (new), `session/fightState.svelte.ts`, `session/sessionState.svelte.ts` (`isSettlingAfterCatch`, the strike window), `session/biteRoller.ts`, `session/showingFish.ts`. Components: `game/FightMeter.svelte` → `FightMeter` + `ReelZone.svelte` + `RunWarning.svelte`, `game/WaterScreen.svelte` (key swallowing), `game/SessionChrome.svelte` and `hud/GameHud.svelte` (the toggle moves), `angler/RatingDial.svelte` (new), `game/RodSetupCard.svelte` (the size-reach line). Server: `RecordCatch.ts` (rating in `WaterToday`, `loadPersonalBest` for pedigree), `queries/GetAnglerRating.ts` (new), `queries/GetSizeReach.ts` (new), `queries/GetLeaderboards.ts`, `leaderboardEntries.ts`, `visitingAnglers.ts` (visitors pick with `takeWeight` at their rating). SQL: `0019_the_anglers_rating.sql`. Tests: `scripts/testRating.ts`, `scripts/testSizeReach.ts` (the sweep), `scripts/testFight.ts` (the bot); SQL `190_the_rating.sql`.

**Done when** the sweep holds two to ten a session across ratings 0–100 and the calibre rises with reach; the fight bot lands a thirty four times in five at 50 ms and at 16 ms steps alike; an existing 100-rated angler with a 29 lb best reads 58 with the reason on the page; Space after a catch changes nothing on screen for 1.2 s; the fullscreen toggle is on `/home`, `/lake` and `/market` in the harness.

### Phase 2 — `feature/tackle-trade` · XL

**Task:** *As an angler, I want to buy, own and consume tackle from brands that range from rubbish to superb, locked behind my rating, and to fish with the rods I own.*

**Delivers.** The brands, the catalogue and its seed; the tackle box and the counter; buying, owning, saved rods from owned items; rods with test curve, length and duplon, reels with spool, cast and retrieve; line by diameter, strain and colour with camo; hooks by size (6/4/2), barb, wire and finish against a fish's age; cast distance enforced at the swim; the rod-snap rule and the reel's pace in the fight; consumption of line, hooks, leads and tubing written by `record_catch` and the session's end; `StockUpForSession`; the shop tier stored on the lake (the world counter only — the water's own counter arrives with the shop facility in phase 7); every existing saved rod migrated to Bankside Basics equivalents so nobody's rods vanish; the world's visiting anglers fishing the tier their rating unlocks.

**Files.** Domain: `tackle/brands.ts`, `tackle/catalogue.ts`, `tackle/rods.ts`, `tackle/reels.ts`, `tackle/lines.ts`, `tackle/hooks.ts`, `tackle/tackleBox.ts`, `tackle/castDistance.ts`, `tackle/consumption.ts`, `tackle/shopTier.ts`, `tackle/rodSetup.ts` (a setup is item ids), `fishing/lineMatch.ts`, `fishing/hookMatch.ts`, `fishing/fight.ts`. Contracts: `TackleBox.ts`, `TackleShelves.ts`. Server: `BuyTackle.ts`, `SaveRodSetup.ts`, `StockUpForSession.ts`, `GetTackleBox.ts`, `GetTackleShelves.ts`, `gates/readRodSetups.ts`, `RecordCatch.ts`. Routes: `/tackle`, `/market/tackle`. Components: `tackle/` (box, shelf, item card, lock, saved-rod builder), `game/TackleBuilder.svelte`, `game/RodSetupCard.svelte` → `RodCard` reading the box, `game/StockUpStep.svelte`. SQL: `0020_the_tackle_trade.sql`, `0020b_the_shelves.sql`; `record_catch` gains the consumption and the rod and reel. Tests: `scripts/testTackle.ts`, `scripts/testFight.ts` (rods, reels, snaps); SQL `200_the_tackle_trade.sql`.

**Done when** a rating-24 angler sees Halcyon locked with the rating it needs; a 45 lb fish on a 2.75 is lost about one time in three over a thousand bot fights and never on a 3 lb rod; a snap takes the metres past the break off the spool; an angler with no rigs left fishes the rest of the day on what is on the rod; the band sweep is still green.

### Phase 3 — `feature/rigs-and-bait` · M

**Task:** *As an angler, I want rigs judged on stats and bait that suits them, so there is no single best rig.*

**Delivers.** The rig table (cast, presents, bed, holds position) and `holdsPositionScore` by spot tightness; the three presentations and the pairing rule; bait as kind × brand with appeal, keeps and spoilage; the shiny-pop-up age rule; end tackle stocked and consumed in detail (a lost rig, a lead on a bar, bait per rod hour); the tackle step telling the player what has gone off. Split from phase 2 because it retunes the bite roll and wants its own measuring.

**Files.** Domain: `tackle/rigs.ts`, `tackle/presentations.ts` (new), `tackle/baits.ts`, `tackle/spoilage.ts` (new), `fishing/rigMatch.ts`, `fishing/baitTrust.ts`, `fishing/tackleMatch.ts` (the pairing and the new weights), `fishing/spotTightness.ts` (new). Components: the rig and bait shelves, `RodCard` pairing warning. SQL: `0021_rigs_and_bait.sql`. Tests: `scripts/testRigs.ts`, the sweep.

**Done when** the Ronnie outscores the helicopter over a gravel bar and the helicopter outscores it on open silt; a pop-up on a lead clip reads *wrong pairing* on the card; frozen boilies bought six fishery days ago score 0.3 and the step says so; the sweep is green.

### Phase 4 — `feature/farms-and-stock` · M

**Task:** *As an owner, I want to buy fish from named farms around the world in packs, and to move fish on in bulk.*

**Delivers.** Twelve farms with grades and places, weekly seeded packs, real ages, transport from the farm's gate; `/market/farms` on the list and on the globe, replacing the form on the stock tab; the dealer taking a list at bulk terms; listing a list; moving fish between an owner's own waters; the stock panel's size breakdown and selection.

**Files.** Domain: `market/farms.ts`, `market/farmPacks.ts`, `market/farmDelivery.ts`, `market/dealer.ts` (bulk terms), `market/estateMove.ts` (new), `stock/stockBySize.ts` (new). Server: `BuyFarmPack.ts` (replacing `BuyCarpFromFishFarm.ts`), `SellFishToDealer.ts` (a list, replacing `SellCarpToDealer.ts`), `ListFishForSale.ts` (a list, replacing `ListCarpForSale.ts`), `MoveFishToMyWater.ts`, `GetFarms.ts`, `GetFarmPacks.ts`, `GetStockBySize.ts`. Routes: `/market/farms`. Components: `market/FarmCard.svelte`, `market/PackRow.svelte`, `lake/StockBySize.svelte`, `lake/StockList.svelte` (selection), `lake/StockActions.svelte`. SQL: `0022_the_farms.sql` (`buy_farm_pack`, `sell_to_dealer` taking `uuid[]`, `move_to_my_water`). Tests: `scripts/testFarms.ts`; SQL `210_the_farms.sql`.

**Done when** a fifty from Donau Karpfenhof to a UK water quotes about £810, two days and five days' quarantine; selling twelve fish in one action pays 55% on three and 45% on nine; a pack of 4–6 lb fish arrives aged two; the size breakdown matches the list.

### Phase 5 — `feature/tickets-and-hours` · M

**Task:** *As an owner, I want to sell day, night, 24-hour and multi-day tickets at my own prices, and as an angler I want the hours and the weather to decide what I catch.*

**Delivers.** Ticket products and the book; `BuyTicket` and the picker; session windows across midnight; multi-day sessions; the magic-hour size factor and the weather as a condition, both feeding `conditionsShare`; the weather line on the bank and in the bailiff's note; the barbed ban; every existing water seeded with a day and a 24-hour product; the simulation reading the book for takings.

**Files.** Domain: `fishing/ticketBook.ts`, `fishing/sessionWindow.ts`, `fishing/magicHours.ts`, `fishing/sessionClock.ts` (the window replaces `FishingDay.StartHour/EndHour`), `world/weather.ts` (glass and wind direction), `fishing/weatherConditions.ts` (new), `fishing/sizeReach.ts`, `simulation/visitingAnglers.ts` (product mix and takings). Server: `AddTicketProduct.ts`, `RemoveTicketProduct.ts`, `BuyTicket.ts` (replacing `StartFishingSession`'s call), `GetTicketBook.ts`, `GetSessionWeather.ts`, `gates/readCatchReport.ts` (hours past 24). Components: `lake/TicketBookPanel.svelte` (the fee form leaves `LakeOverview.svelte`; the setup wizard's fee step seeds the day product), `game/TicketPicker.svelte`, `game/GoFishingButton.svelte`, `lakes/LakeCard.svelte` (from-price), `game/SessionClock.svelte` (the window and the magic marks), `game/WeatherLine.svelte`. SQL: `0023_the_ticket_book.sql` (`buy_ticket(lake, product)`, `pay_day_ticket` kept as the one-product case). Tests: `scripts/testTickets.ts`, the sweep per product.

**Done when** a night ticket's session runs 19:00 to 07:00 with the sky dark in the middle; the share of thirties at first light on the club water is at least three times the afternoon's in the sweep; a day ticket lands one to six and a 24-hour ticket two to ten; a water pricing its night ticket at the day price sells none in a simulated week; the weather line matches the sky drawn.

### Phase 6 — `feature/the-shoals` · L

**Task:** *As an owner, I want a water that can hold thousands of fish without the game slowing down, and a fish to get its name the first time it is landed.*

**Delivers.** `carp_shoals`; the simulation on shoals (growth, condition, ageing, pike from shoals first, heatwaves, spawning into a fry shoal, biomass and head count); the take between named fish and shoals, and individualising a shoal fish on the bank; farm packs of small fish arriving as shoals; the stock panel and size breakdown counting shoals; the dealer buying by count; the living lake drawing a sample; `persistSimulatedDays` writing shoal rows and only the named fish that changed.

**Files.** Domain: `stock/shoals.ts`, `stock/individualise.ts`, `simulation/growShoals.ts`, `simulation/pikePredation.ts`, `simulation/spawning.ts`, `simulation/feedTheLake.ts`, `fishing/takeWeight.ts`, `fishing/whoTookTheBait.ts`, `market/density.ts`. Server: `persistSimulatedDays.ts`, `RecordCatch.ts` (a shoal fish is created inside `record_catch`), `SimulateElapsedTime.ts`. SQL: `0024_the_shoals.sql` (`record_catch` accepting a shoal id and drawing the fish). Components: `lake/ShoalRow.svelte`, `scene/fishSchool.ts`. Tests: `scripts/testShoals.ts` (a 40,000-fish water simulates thirty days in under two seconds; the take draws from shoals in proportion); SQL `220_the_shoals.sql`.

**Done when** a water with 200 named fish and a 5,000-fish shoal simulates thirty days and writes fewer than 300 rows; a shoal fish that takes the bait has a name, a row and `is_catalogued` before the catch photo; the band sweep is green with shoals in the stock.

### Phase 7 — `feature/the-big-water` · XL

**Task:** *As an owner, I want to build a serious water — up to two hundred acres, with facilities, a bailiff team and a lake view I can zoom — and I want it to be harder to fish until it is finished.*

**Delivers.** Two hundred acres and the head cap; the camera, minimap and swim clustering on every lake view; lake difficulty and the spot spread; feature coverage measured through `terrainAt`; the sanctuary tool; the six new facilities; the shop tier on the water's page and the water's own counter; the bailiff team, candidates, wages, performance and sacking; the yard's bench stacking on a phone on every tool — which closes **FIX: Shelf editor point prompt text is squished on mobile**.

**Files.** Domain: `groundworks/landPurchase.ts` (200), `stock/headCount.ts` (new), `lakeDifficulty.ts` (new), `fishing/spotSpread.ts` (new), `layout/featureCoverage.ts` (new), `layout/sanctuary.ts` (new), `layout/layoutTypes.ts` (facilities, sanctuary), `groundworks/catalogue.ts`, `groundworks/workKinds.ts`, `groundworks/validateBank.ts`, `layout/swimRules.ts` (sanctuary spacing), `bailiffs/bailiffTeam.ts`, `bailiffs/candidates.ts`, `bailiffs/performance.ts` (new), `simulation/driftWater.ts`, `simulation/simulateOneDay.ts` (wages), `simulation/visitingAnglers.ts` (facilities), `tackle/shopTier.ts`. Game: `scene/camera.ts` (new), `scene/clusterSwims.ts` (new), `scene/drawScene.ts`, `builder/builderInput.ts` (pinch and drag), `builder/tools/sanctuary.ts`. Components: `stage/Minimap.svelte`, `lake/DifficultyReading.svelte`, `lake/BailiffTeamPanel.svelte`, `lake/BailiffCard.svelte`, `lake/CandidateCard.svelte`, `builder/FacilityPicker.svelte`, `builder/DrawingControls.svelte`, `builder/Bench.svelte`, `lakes/WaterShop.svelte`. Server: `HireBailiff.ts`, `SackBailiff.ts` (replacing `ManageBailiff.ts`), `GetBailiffs.ts`, `GetLakeDifficulty.ts`, `BuildTackleShop` through `OrderGroundworks.ts`. SQL: `0025_the_big_water.sql`. Tests: `scripts/testBigWater.ts` (difficulty, coverage, the spread's clamp, the bailiff cap), `scripts/testCamera.ts`; SQL `230_the_bailiffs.sql`; harness screenshots of the yard at 390 px with the shelf, deepen, dredge, reeds, lilies and snag tools drawing.

**Done when** a 200-acre plot fits the screen with a minimap and pegs cluster until zoomed; a bare 200-acre water reads *hard* and the three improvements named change the reading when built; the bench prompt reads on two lines at 390 px on every tool; a two-bailiff team on 60 acres silts up slower than one and slower still at fourteen on 200; the band sweep holds ×0.9–×1.1 across difficulty.

### Phase 8 — `feature/water-make-up` · XL

**Task:** *As an owner, I want to know what my water will grow and what it draws, and to run it as a business — species, netting, pressure, booking and syndicates.*

**Delivers.** The lake ceiling replacing the region ceiling in growth, shown with its binding factor; species, feed stolen, nuisance bites in the session, `StockCoarseFish` and `NetTheSilvers`; feeding confidence in `feedTheLake`; the stock draw feeding anglers, pay and reputation; prize anglers; pressure; the demand ratio, advance booking, the diary, syndicates; the water's page reordered around what an angler chooses on. This is the phase that turns a stock list into a business, and it depends on phase 7 for feature coverage and phase 5 for the ticket book.

**Files.** Domain: `water/lakeCeiling.ts`, `water/species.ts`, `water/nuisanceBites.ts`, `water/stockDraw.ts`, `water/pressure.ts`, `water/demand.ts`, `water/bookings.ts`, `water/syndicate.ts`, `simulation/feedTheLake.ts`, `simulation/visitingAnglers.ts` (draw, prize anglers, turning away, bookings), `simulation/simulateOneDay.ts` (renown drift), `reputation.ts`, `fishing/takeWeight.ts` (pressure), `fishing/biteRoll.ts` (nuisance draw). Server: `StockCoarseFish.ts`, `NetTheSilvers.ts`, `TurnOnAdvanceBooking.ts`, `BookAPeg.ts`, `SellSyndicatePlaces.ts`, `BuySyndicatePlace.ts`, `GetLakeCeiling.ts`, `GetStockDraw.ts`, `GetBookingDiary.ts`, `BuyTicket.ts` (honouring bookings). Routes: `/lakes/[id]/book`. Components: `lake/CeilingReading.svelte`, `lake/SpeciesPanel.svelte`, `lake/DrawReading.svelte`, `lake/DemandLine.svelte`, `lakes/BookingDiary.svelte`, `lakes/SyndicateCard.svelte`, `game/NuisanceBite.svelte`, `angler/Diary.svelte`, `carp/PressureLine.svelte`. SQL: `0026_the_make_up_of_a_water.sql`, `0026b_the_booking_diary.sql` (`book_a_peg`, `buy_syndicate_place`, `net_the_silvers`). Tests: `scripts/testMakeUp.ts` (the four worked ceilings, the four draws, the demand table), `scripts/testBookings.ts`; SQL `240_the_make_up.sql`, `250_bookings.sql`.

**Done when** the four worked ceilings and the four draws in §6.11 come out of the code to the pound; a bream bite plays, is logged and does not count; a fifty caught daily reads *wary* within a week and comes out less; a water at demand 1.5 turns anglers away in the simulation until booking is on; a syndicate water sells no day tickets.

### Phase 9 — `feature/honours-and-bounties` · L

**Task:** *As an angler, I want awards for what I have done and prizes appearing on waters around the world — money, tackle nobody can buy, and one-of-one prototypes.*

**Delivers.** Awards (milestones migrated in), the ribbon and the page; the biggest fish in the game on the home screen and the news; bounties rolled by the simulation, posted by owners, settled on the spot or on the cron; prize tackle of six kinds and the two extra prizes; prototypes on the hall of fame; sponsorships in `BuyTackle`.

**Files.** Domain: `trophies/awards.ts`, `trophies/awardProgress.ts`, `bounties/bountyKinds.ts`, `bounties/bountyDraw.ts`, `bounties/difficultyBand.ts`, `bounties/prizeTackle.ts`, `bounties/settle.ts`, `tackle/prototypes.ts`, `tackle/sponsorship.ts`, `simulation/simulateOneDay.ts` (the roll). Server: `PostBounty.ts`, `GetAwards.ts`, `GetBounties.ts`, `GetBiggestFishInTheGame.ts`, `GetPrototypes.ts`, `BuyTackle.ts` (sponsorship), `cron/close-bounties/+server.ts`. Routes: `/angler/awards`. Components: `angler/AwardCard.svelte`, `angler/NextAward.svelte`, `world/BountyCard.svelte`, `lakes/BountyPill.svelte`, `render/drawSwims.ts` (the marker), `home/BiggestFishLine.svelte`, `hall/PrototypesBoard.svelte`, `game/HonourRibbons.svelte` (the award ribbon). SQL: `0027_honours_and_bounties.sql` (`raise_awards`, `settle_bounty`, `close_ended_bounties`; `vercel.json` gains the cron). Tests: `scripts/testAwards.ts`, `scripts/testBounties.ts`; SQL `260_honours.sql`, `270_bounties.sql`.

**Done when** every existing milestone shows as an award with its date; a *named fish* bounty settles inside `record_catch` and a *top of the water* settles on the cron with the feed event; a prototype won, snapped and struck from the board in one harness run; a sponsored angler sees the tier open and the price cut.

### Phase 10 — `feature/fish-trades` · M

**Task:** *Fish Trades Between Players* — the backlog's own story, as raised.

**Delivers.** Offers, counters, acceptance and refusal; `settle_trade` in one transaction; transport both ways; the inbox and bailiff's note; `/trades`, the sheet from the stock panel and from an angler's page; history on both pages and the feed event; the fair-play rules.

**Files.** Domain: `trades/tradeRules.ts`, `trades/tradeQuote.ts`, `trades/tradeStatus.ts`. Server: `ProposeTrade.ts`, `AcceptTrade.ts`, `DeclineTrade.ts`, `CounterTrade.ts`, `GetMyTrades.ts`. Routes: `/trades`. Components: `trades/OfferForm.svelte`, `trades/OfferCard.svelte`, `trades/FishPicker.svelte`, `trades/TradeHistory.svelte`. SQL: `0028_fish_trades.sql` (`propose_trade`, `answer_trade`, `settle_trade`). Tests: `scripts/testTrades.ts`; SQL `280_trades.sql` (a settle that fails half-way moves nothing).

**Done when** the task's acceptance criterion is met — two players propose, accept or decline, the fish move both ways in one transaction, and the trade shows in both histories — and a fish listed, in a match or in transit cannot be offered.

**After phase 10**, `end-of-day` runs the refactor round the deploy count will by then be due, and the code quality check publishes the score with the plan for the round after.

---

## 8. Tuning and the tests that guard the game

**One rule across all ten phases:** the domain test that holds a session between two and ten fish runs in every phase's checks, over a sweep of ratings, tackle, hours, weather, waters and stock make-ups. If a change moves the count instead of the calibre, it is wrong, however good it sounds.

- **The sweep** — `scripts/testSizeReach.ts`, written in phase 1 before anything else changes. Ratings {0, 25, 50, 75, 100} × tackle tiers {starter, club, specialist, custom} × products {day, night, 24 hours} × weather {flat and bright, steady, falling glass} × waters {starter, club, prize, grail, 200 bare acres, 200 featured acres} × 200 seeds each, rolled through `biteRollFor` and `takeWeight` exactly as the session rolls them. It asserts, per 24 fishery hours for a competent angler (rating 50, club tackle): `SessionCatches.Fewest ≤ mean ≤ SessionCatches.Most`; per 12 hours: 1 to 6; across the whole grid: no cell's mean outside ×0.85–×1.15 of the competent angler's; the mean landed weight rises monotonically with size reach; the thirties' share at first light on the club water with custom tackle is at least three times the afternoon's with starter tackle; and after phase 7, difficulty moves the count by no more than ×0.9–×1.1.
- **The fight bot** — `scripts/testFight.ts`. A scripted *competent hand* (reels when tension is under the ideal and the fish is not running; lets go when it is; reacts 250 ms late) plays a thousand fights per case at 16 ms and 50 ms steps, and the landing rates must agree within two points: a twenty ≥ 90%, a thirty ≈ 80%, a forty-five on a 2.75 ≈ 33%, the same on a 3 lb rod ≈ 80%, a sixty on a 2.75 ≈ 30%. Barbless below rating 70 loses about one in seven more than micro-barbed; above 70 the same.
- **The worked examples are tests.** Every table in §6 with numbers in it — the rating table, the four ceilings, the four draws, the difficulty readings, the rod-snap odds, the shop tiers — is asserted to the figure in its phase's test, so a retune is a deliberate edit of a constant and a table, never a drift.
- **The simulation is bounded.** `scripts/testShoals.ts` simulates a 200-acre, 40,000-fish water for thirty days in under two seconds and writes under 300 rows. `scripts/testBigWater.ts` asserts a 200-acre plot's coverage sample runs in under 50 ms.
- **The screens are looked at.** The harness (`harness/`, outside git, as the build log describes) takes screenshots at 1280 px, 390 px and 844×390 for: the rating dial; the tackle box and counter with a lock; the tackle step with a red rod line; the fight on a phone with the run warning; the ticket picker; the night session at 02:00; the zoomed lake with the minimap and a cluster; the yard bench on every drawing tool at 390 px; the stock panel with shoals and a selection; the ceiling and draw readings; the booking diary; a bounty on a peg; the awards page; a trade offer.
- **The standard suite** before every commit: `npm run check` (0 errors), `npm run audit:files` (every file ≤ 100 lines), `npm run audit:routes`, `npm run test:domain`, `npm run test:sql`, `vite build`; and before the pull request the fast audit and the gate — `python3 -m tools.refactor.audit.run_audit . --output tools/refactor/audit-output --fast` then `python3 -m tools.refactor.audit.gate tools/refactor/baseline.json tools/refactor/audit-output/audit.json` — so the score (78.9% on 17 September) does not fall. New entities land in the pattern's shape from birth: a domain module, a contract, a query, a command, a component set and a test for each, named as their siblings are; `tackle_items`, `fish_farms`, `ticket_products`, `carp_shoals`, `bailiffs`, `lake_species`, `bookings`, `bounties` and `trades` each get the files the patterns predict, and any gap is written down as an accepted exception rather than left to look like an oversight.
- **Migrations** are listed in `SETUP.md` §1.3 as each phase adds them, and run in name order on the real Supabase before the phase's pull request is merged, as every phase since Design II has done.
- **Documentation.** This document gains a §12 *Build notes* as Design II did, recording every place the build departed from the plan and why, one line per departure, in the phase's pull request.

---

## 9. What this does not do

Named so they are not smuggled in later: no bivvies, barrows, bedchairs or clothing (tackle here is what changes a fish's behaviour, nothing else); no tackle wear or breakage outside the rod-snap and hook-wire rules; no second-hand tackle market between players and no trading of prize kit — a prototype belongs to whoever won it; no bait boats or spods; no fish-care equipment beyond the tubing already modelled; no live weather beyond the existing seasonal roll made real — no forecasts, no hourly changes; no breeding or recruitment of the new species beyond the roach and rudd that already feed the pike, and no fishing *for* them deliberately — they are a nuisance bite and a drag on growth, not a second quarry; no player-to-player booking fees or peg resale; no stock pond or second water body on a plot (a young fish grows on in the main water); no shoal trades; nothing in phases 2–10 changes what a catch is worth or how fame is earned, because that is the market's business and it works; and nothing in any phase raises or lowers how many fish a session produces beyond the bounded pull in §6.2. Two to ten is the game. Everything here is about *which* two to ten.

Also outside this plan, because they are other projects' tasks: *Rename bid to build*, the YBT projects section rewrite, the JBB brand guidelines and the 3D model of the house. The monetisation branches on the Carp Mania backlog (open gates, adverts, the season ticket) run alongside this plan and are untouched by it, except that the biggest-fish line is offered to the public front page.

---

## 10. Decisions to confirm

These are the judgement calls in this plan that the draft did not make, or made differently. Each is built as written unless the owner says otherwise; a one-word answer on the task is enough.

1. **The day ticket runs 07:00–19:00 as the notes say**, which is a 4½-minute sit at the pace players like, with the 24-hour ticket the 9-minute serious sit. The alternative is a 05:00–19:00 day ticket that keeps today's dawn start. The plan keeps the notes.
2. **Rating is per fisherman**, not per account: an heir starts with no pedigree, as he starts with no personal best.
3. **Skill and tackle keep a small pull on the count** (±15%) because the notes asked for it; the draft had none. The band holds either way.
4. **Unnamed fish live in shoals** (§6.9). This is new architecture the draft did not have; without it the two-hundred-acre water does not work.
5. **Visiting anglers fish the same rules** — size reach, hours, weather, tackle by rating — so a good water's big fish get caught by visitors at dawn and wise up. This makes the owner's ticket numbers matter; it also means the simulation's outcomes change on the day phase 1 ships.
6. **The dealer takes any number**, at 45% after the first three a day, in place of the three-a-day limit.
7. **The weather becomes a real condition** (§6.8). It was cosmetic.
8. **Fish trades are phase 10**, from the backlog, rather than left for later.
9. **A sanctuary is a new bank tool** (§6.10) — the one new feature kind in the yard.
10. **The take-weight exponent** (§6.2) replaces the draft's *wariness shrink*: one tunable range, a stronger magic-hour bias, and the same behaviour at reach 0.33 as today.

---

## 11. Backlog tasks this sweeps up

| Task in Your Business Today | Where |
| --- | --- |
| **FIX: Shelf editor point prompt text is squished on mobile** (priority 5, 2 points) | Phase 7, the yard's bench on a phone — `DrawingControls.svelte` stacks the prompt above the buttons under 640 px, checked on shelf, deepen, dredge, reeds, lilies and snags in the harness; closed by that pull request |
| **Fish Trades Between Players** (priority 2, 8 points, under *Grow Carp Mania to 1,000 Monthly Players*) | Phase 10, built to its acceptance criterion |
| **Branch 1: open-gates (Public Front Page and World Pages)** | Untouched, but phase 9's `GetBiggestFishInTheGame` is offered to the front page |
| The rest of the backlog — adverts, the season ticket, Search Console, Vercel and Supabase Pro, AdSense, Paddle, the terms, the launch checklist | Not game design; unaffected |

Each phase's task is raised in Your Business Today under the same goal as the trades task when the phase starts, with this document attached, and its work log posted when the branch is pushed.

---

## 12. Build notes

Where the build departed from the plan, one line each, by phase. Everything not listed was built as written.

**Phase 1 — angler rating.** `SizeBias` widened to ±3 (`AtNoReach: -3, AtFullReach: 3`) so the magic-hour thirties' share clears the ×3 the sweep asks for; the sweep judges that ratio on a fixed ordinary-weather day rather than a random one. `BaseBitesPerRodHour = 0.135`, not the draft's figure, to hold the competent angler at 6.8 fish in 24 hours. The count pull is recentred on the competent angler rather than on rating 0.

**Phase 2 — the tackle trade.** Saved rod setups are reset once by the migration (`profiles.saved_rods = '[]'`) because the old setups named no catalogue items. There is no `StockUpForSession` — bait is bought at the counter like everything else, and a spoiled bait is refused at the cast rather than silently swapped.

**Phase 4 — farms and stock.** Farms live on `/market/farms` as a list with a distance and a quote, not as pins on the globe. A Danube fifty to a UK water quotes £1,032 and three days (the real 2,230 km), not the plan's £810 and two. `GetStockBySize` is computed on the client from the carp and shoals already loaded, not a query. A record grower offers one pack of its biggest bands a week or none — the week off is decided per farm, not per band.

**Phase 5 — tickets and hours.** The day ticket runs 07:00–19:00 as the notes say (decision 1). A multi-day ticket is one `lake_visits` row that `sit_the_next_session` resets for each sitting, not one row a day. The session's weather is held across midnight rather than re-rolled. `conditionsShareFor` replaces the draft's `NeutralConditionsShare` constant.

**Phase 6 — the shoals.** A visiting angler's shoal take writes a catch row with `carp_id` null and no carp row; only a player's take names a fish (`record_shoal_catch`). Named fish and fry shoals born in the simulation carry provisional ids (`named-`, `fry-`) until `persistStock` writes them.

**Phase 7 — the big water.** The groundworks editor pans by wheel and the minimap's buttons only; pinch and drag pan are on the fishing and viewing canvases. The classic layout is 12% featured, not the draft's quarter, so its feeding confidence reads as part-featured.

**Phase 8 — the make-up of a water.** The bare clay bowl's ceiling reads 19 lb, not 20, within the design's tolerance. Netting the silvers is applied at once with disturbance 8 rather than as a four-day works item. Species are seeded per site type by the migration and by a trigger on new lakes. Fishery days for the booking diary come from the world clock (one real hour), so a week's diary is seven real hours.

**Phase 9 — honours and bounties.** Awards are decided in TypeScript (`awardsEarnedBy`) from SQL tallies (`award_tallies_of`), not by a `raise_awards` in plpgsql, so the catalogue lives in one tested place; `RaiseAwards` runs after every catch, after dealer sales, and when the angler opens their own trophy room, which is where a match win's award is caught. `catches` gained `hour_of_day` and `visit_id` so night owl, early bird and the full book can be counted. A prototype is a catalogue design with numbered instances (`blackmere-prototype-rod-no-7`), resolved by `tackleItem` like any other id; two a brand a fishery year, enforced when the bounty opens. A peg at a legend or a stocked fish that cannot be delivered (no such water, no free peg, the winner owns no water) pays the bounty's money instead. Prize-only tackle sits in the catalogue at price 0 and is kept off the shelves by `isPrizeOnly`. `GetBiggestFishInTheGame` is `GetBiggestFish` (the five-word rule). The migration is seven files (`0027`–`0027g`) to stay under 100 lines each.

**Phase 10 — fish trades: not shipped, and the fish market closed with it.** Trades were built to the story's acceptance criterion on `feature/fish-trades` and then dropped before merging, because any fish or money passing from one player to another lets a second account pay the first: a sock puppet with £100,000 of starting money can buy a fish at any price, or accept any trade. For the same reason the auction market from Design II is closed on `feature/no-player-trading` — no listings, bids or buy-now; `0028_the_fish_market_closes.sql` refunds every open bid, cancels the open listings and drops the listing, bidding, settling and closing functions; `/market` is the tackle shop (the counter) with the farms beside it; the lodge loses its Market tab; the world map loses its *fish for sale* filter and count; an old listing link opens the fish's own page. Fish now enter a water from the farms and leave it through the dealer or to another water of the same owner — no player-to-player route remains for fish. Money still passes between players where the game needs it: day tickets, syndicate places, match fees and stakes, and owner-posted bounties; those are bounded by real time or by the payer's own money, and are the routes to watch if a second account is ever abused.
