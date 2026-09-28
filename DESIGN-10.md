# Carp Mania — Design X: the balance model

James asked on 28 September 2026 for the relationship between the game's properties and the experience a player has to be written down as mathematics rather than as another round of *add this, try that*. This document is that statement, and it comes with a model that runs it: `npm run test:pace` plays a year of the game for thirty-eight players of five kinds and prints the pace each of them gets. Every constant in the model lives in two files (`scripts/pace/rules.ts` and `scripts/pace/shelf.ts`), so the tuning is a change to a number and a rerun, and the test guards the pace against later changes. Nothing in the game itself is changed by this document; it says what to build, and DESIGN-9 remains the proposal it refines. Every player is assumed to start again from the same position (the reset of DESIGN-9), which is the position the model starts from.

## 1. The shape of the game

Three ladders and a bank. Each ladder is climbed by something different, each feeds the others, and none can be bought outright.

| Ladder | Climbed by | Measured as | What it unlocks |
|---|---|---|---|
| **The angler** | fishing: many fish, many waters, bigger fish, personal bests | a level from experience | the tackle tiers, and a share of the odds |
| **The water** | running the fishery: facilities, stock, water, and anglers actually catching | a rating, 0–100, recalculated daily | the farm grades, the ticket band, sponsorship, and the largest share of the odds |
| **The fish** | time, feed and the fish's own frame | the biggest fish grown, and the biggest landed | the draw, the records, the market value |
| **The bank** | tickets, sponsorship, takings, sales | money | speed — never a gate |

**The one principle: money accelerates, it never gates.** Every gate in the game is time (growth), rating (the water) or level (the angler). Money buys the facilities that are a fifth of the rating, the feed that grows the fish, the stock a farm will sell you, and the tackle your level allows — and each of those is bounded by something money cannot touch. The model checks this with two deliberately unbalanced players (§5): a tycoon who never fishes ends the year with a rating of 89, a 47 lb fish in his water and £2.2m in the bank, and no personal best at all; a pure angler who never builds anything reaches level 42 and a 51 lb personal best with a rating-49 farm pond and £117k.

## 2. The clock

One real hour is one fishery day, so a real day is 24 fishery days, a fishery year is fifteen real days, and a real year is twenty-four fishery years. The model runs on that clock. Two consequences shape everything below:

- **Growth cannot be biology.** A carp that grows the way a real carp grows reaches its ceiling in a few real months. The growth curve (§3.1) is therefore drawn to the pace we want, not to a textbook.
- **Attendance counts for owners.** A lake only simulates when its owner looks at it, thirty fishery days at most per visit (`FisheryClock.MaximumDaysSimulatedPerVisit`, already in the game). A daily player's water runs about 150 fishery days a week; a three-evenings-a-week player's runs 90. The model applies the same cap, and it is why the casual player's lake in §5 grows at half the pace.

## 3. The equations

### 3.1 Growth — `scripts/pace/fish.ts`

```
gain per fishery day = rate(w) × reach(w) × protein × ration × season

rate(w)  = PoundsPerDayAtTwenty × 2 ^ (−(w − 20) / HalvesEveryLb)      0.055 lb a day at 20 lb, halving every 6 lb
reach(w) = 1 − (w / cap) ^ 4                                             cap = min(lake ceiling, the fish's frame)
protein  = the feed's protein score (fishmeal 1, hemp 0.35, natural food 0.5)
ration   = the share of the daily ration eaten (feed bought + natural food) × feeding confidence from features
season   = the region's growth factor for the day (UK 0.35 in winter to 1.0 in summer; the Danube 0.45 to 1.4)
```

Growth halves every six pounds, so each decade of weight takes about three times as long as the one before. On full fishmeal, in summer, well below the cap:

| From → to | Ideal real days | In the UK (average season 0.68) | On the Danube (0.93) |
|---|---|---|---|
| 10 → 20 lb | 4 | 7 | 5 |
| 20 → 30 lb | 14 | 21 | 15 |
| 30 → 40 lb | 45 | 67 | 49 |
| 38 → 40 lb | 14 | 20 | 15 |
| 40 → 50 lb | 144 | 213 | 156 |
| 50 → 60 lb | 457 | 677 | 494 |

**Every fish has a frame.** This is the piece DESIGN-9 was missing, and without it the model's first run turned three quarters of every stock in the world into forties by month seven. A fish's *frame* is the weight it can reach in a perfect water, drawn once when the fish is created and never shown to anyone: a hidden property discovered by growing the fish. Frames are log-normal:

| Bloodline | Median frame | Spread | Share with a forty in them | a fifty | a sixty |
|---|---|---|---|---|---|
| Common (every farm but one, and every wild fish) | 28 lb | 0.28 | 10% | 2% | 0.3% |
| Record grower (`Donau Karpfenhof`) | 44 lb | 0.22 | 72% | 28% | 8% |

A fish sold at a weight has a frame at least 10% above it (it is still growing, or the farm would not have it). So a record grower's 38 is a gamble with a known shape: three in ten have a fifty in them, one in twelve a sixty, and nobody knows which until it is fed for a season. That is the *shell out for a prize fish and, done right, make a lot of money* of James's brief, made exact. The lake ceiling (region, density, features, water, competition — as DESIGN-8 §6.11 has it) is the other cap, and the lesser of the two is the one that binds.

### 3.2 The water's rating — `scripts/pace/rating.ts`

DESIGN-9's five parts, each a share from 0 to 1:

```
rating = 20 × facilities + 15 × head + 25 × quality + 20 × catchRate + 20 × water

facilities = min(1, money spent on facilities / £100,000)
head       = fish per acre: rising to 1 at 12 an acre, 1 between 12 and 30, falling to 0 at 60
quality    = mean over the ten biggest fish of min(1, weight / 50 lb) × their mean condition / 100
catchRate  = min(1, fish landed per angler-day over the last 30 fishery days / 4)
water      = water quality / 100
```

The head share is a plateau, not a point, because the rating and the ceiling pull against each other: the rating wants fish for anglers to catch, the ceiling wants few mouths. Twelve an acre is where an owner who wants to grow a big fish sits; thirty is where a busy day-ticket water sits; both score full marks on the head and they differ on what they grow.

### 3.3 Tickets, visitors and money — `scripts/pace/visitors.ts`

```
price band       floor = 0.5 × rating, ceiling = 1 × rating (£; the owner sets a price inside it)
anglers wanting  = (1 + 5 × (rating / 100) ^ 1.5) × facility factors × season × price position
                   price position: 1.2 at the floor, 0.6 at the ceiling — the same money either way, fewer anglers at the top
arrivals         = min(wanting, pegs) where pegs = swims × 1.4
takings          = arrivals × price × collection (1 with a bailiff, 0.55 without) + arrivals × facility takings a head
sponsorship      = from rating 50: (£2,000 + ((rating − 50) / 50) ^ 1.6 × £58,000) a six-month term, paid daily
costs            = facility running costs + £60 a bailiff + feed (4 kg per hundred fish a day; fishmeal £9/kg, hemp £2.50)
```

Arrivals rise faster than the rating (the power of 1.5) so that a neglected water earns pocket money and a great one a living. What that gives per fishery day, and per real day, is in §5.

### 3.4 The odds — `scripts/pace/odds.ts`

Every fish in the water can take. When a bite comes the taker is drawn with weight

```
weight(fish) = (fish weight / biggest in the water) ^ (−k) × appetite × (1 − wariness)

k = 3.0 − 1.5 × lakeRating / 100 − 0.6 × min(1, level / 60) − 0.6 × min(1, sessions on this water / 20) − 0.3 × tackleShare
k is never below 0.35
```

Three pounds of the pull come from things money cannot buy (the water's rating is mostly earned, the level and the local knowledge entirely), and three tenths from tackle, which the level gates anyway. On a prize water holding a hundred doubles, forty twenties, eight thirties and two forties, the chance that the biggest fish is the one on the bank:

| Who | k | Per bite | Per session | Per five sessions |
|---|---|---|---|---|
| a novice, first visit, starter kit, on a rating-40 water | 2.26 | 0.04% | 0.27% | 1.3% |
| the same novice on a rating-80 water | 1.66 | 0.09% | 0.52% | 2.6% |
| level 10, fifth visit, club kit, rating 80 | 1.37 | 0.12% | 0.74% | 3.6% |
| level 25, twentieth visit, specialist kit, rating 80 | 0.72 | 0.25% | 1.48% | 7.2% |
| level 60, twentieth visit, custom kit, rating 80 | 0.35 | 0.37% | 2.19% | 10.5% |
| level 60, twentieth visit, **starter** kit, rating 80 | 0.46 | 0.30% | 1.78% | 8.6% |
| level 0, twentieth visit, custom kit bought with money, rating 80 | 0.93 | 0.21% | 1.24% | 6.1% |

The experienced angler has a genuine chance at the fish — one session in forty-five, one day's play in ten, better than evens over a fortnight — and the same angler in supermarket tackle is four fifths as likely, which is the *effects are there but outweighed* James asked for. The novice is eight times less likely, and a wallet on its own gets a little over half way.

### 3.5 Bites and the bank-side

```
bites a session   = Poisson(6 × (0.85 + 0.15 × levelShare) × (0.7 + 0.3 × tackleShare) × season bite), at most 10
landed            = bite × 0.92 (the hook holds) × (0.85 − 0.25 × bigness × (1 − tackleShare))
                    bigness = 0 at 25 lb rising to 1 at 50 lb — a fifty on starter kit is landed 61% of the time, on custom kit 83%
wariness          = min(0.4, 0.08 × captures in the last ten fishery days), as now
fame, value       = as now, except that the guide price bands above 30 lb are raised (§3.7)
```

The count stays in DESIGN-8's band; everything here is about *which* fish.

### 3.6 The angler's level — `scripts/pace/angler.ts`

```
experience for a fish = weight ^ 1.5 × novelty × (2 if a personal best)
novelty               = 1 / (1 + sessions on this water / 50)       the hundredth session on one water earns a third
a session             = +20;  the first session on a new water = +200
level n needs         = 50 × n ^ 2.2 experience in all
tackle tiers unlock   = club at level 10, specialist at 25, custom at 45
```

The novelty term is what rewards *the experience of playing many lakes*: a thousand fish from one pond are worth a third of a thousand fish from ten waters. The regular player in §5 reaches level 41 in the year, the keen one 54, the casual one 25; nobody reaches 100, and the curve has no cap.

### 3.7 The farms — `scripts/pace/shelf.ts`

| Band | Farm grade | Water rating needed | Bloodline | Price a fish (guide at the band's middle, top condition, × the grade's factor) |
|---|---|---|---|---|
| 4–6 lb stockies | stock | any | common | £100 |
| 8–12 lb doubles | stock | any | common | £250 |
| 14–18 lb | good | 25 | common | £550 |
| 20–24 lb twenties | good | 25 | common | £1,350 |
| 28–32 lb thirties | specialist | 50 | common | £4,050 |
| 34–38 lb high thirties | record grower | 75 | **record** | £35,000 |

No farm sells a forty. The guide price bands are raised above 30 lb so that the fish the whole game points at are priced like it: £1,000 a pound from 30 to 40, £3,000 from 40 to 50, £8,000 above — a 50 lb common in top condition guides at £43,000 before fame, and a famous one at over £100,000. Everything under 30 lb keeps its price.

### 3.8 Age

The lifespan moves out: safe to 35 fishery years, then 5% in the first old year rising by 1.5 points a year, certain at 55. At 22 (the rule today) a record grower's 38, sold at sixteen, was dying within six real months of purchase — before it could have been grown into the fifty it was bought to become. At 35 it has nine and a half real months of safety, which is exactly long enough that growing it on is a race the owner can win and can lose.

## 4. The couplings

Read each row as *this gives that*. Every ladder feeds at least two others, and every one has a brake.

| From | To | How | The brake |
|---|---|---|---|
| Money | Rating | facilities (a fifth of it), stock, a bailiff, feed | the other four fifths are earned; farms above 24 lb will not sell below rating 25 / 50 / 75 |
| Rating | Money | the price band, the visitor count, sponsorship, the shop tier | pegs cap the anglers; more anglers wise the fish up |
| Rating | Odds | the biggest single pull on *k* — a well-run water fishes fairly | the floor on *k*: the middle of the stock is still what mostly comes out |
| Rating | Fish | the farm grade a water may buy from | rating 75 for the record grower, and no farm sells a forty |
| Fish | Rating | the top ten's size and condition (a quarter of it) | a fish is capped by its frame and its water's ceiling |
| Fish | Money | the draw (anglers pay more to fish a water with a forty in it), the market value | selling the fish removes the draw and the quality share it was giving |
| Fish caught | Fish | fame raises value | wariness cuts its odds for ten days |
| Fishing | Angler | experience from every fish, most from big and new ones | novelty: the same water pays a third after a hundred sessions |
| Angler | Odds | level and local knowledge, together 1.2 of the 3 | both take months; neither can be bought |
| Angler | Tackle | the tiers open at levels 10 / 25 / 45 | tackle is worth 0.3 of *k* and a fifth of the fight against a fifty |
| Time | Fish | growth, halving every six pounds | seasons, the cap, and old age |
| Attendance | Everything an owner has | the thirty-day cap on each visit's simulation | none — it is the honest cost of not turning up |

## 5. What the model says

Thirty-eight players, seeded, one real year: twelve casual (three evenings a week), sixteen regular (about an hour a day), six keen (three hours every day), two tycoons (run the fishery, never fish) and two pure anglers (fish every day, build nothing), on UK estate lakes and gravel pits and on French and Danube pits. The pace, as the median real day of the first fish of each size:

| Player | Lands a 20 | Lands a 30 | Lands a 40 | Lands a 50 | Owns a 30 | Owns a 40 | Owns a 50 |
|---|---|---|---|---|---|---|---|
| casual | day 11 | day 27 | day 152 | not in the year | day 15 | day 236 | not in the year |
| **regular** | **day 6** | **day 9** | **day 86** | **day 342** | day 10 | day 117 | not in the year |
| keen | day 3 | day 4 | day 78 | day 301 | day 14 | day 108 | not in the year |
| tycoon | never fishes | | | | day 28 | day 114 | not in the year |
| angler | day 6 | day 8 | day 82 | day 308 | day 126 | not in the year | not in the year |

This is a different table from DESIGN-9's (a twenty in days, a thirty in a week, a forty in a **month**, a fifty in a year), and it is the one this document recommends: a twenty in the first week, a thirty in the second, a forty in the first season, a fifty in the year. A forty is *the fish of a lifetime* in the awards; a month is too soon for one, and a season is when the record grower's gate (rating 75) is honestly earned. The gap from one milestone to the next is three to four times the last, which is what makes each of them feel like a new game rather than the same game with a bigger number.

The end of the year, medians per player type:

| Player | Level | Best landed | Fish landed | Lake rating | Biggest owned | In the bank | Stock value |
|---|---|---|---|---|---|---|---|
| casual | 25 | 45 lb | 923 | 83 | 43 lb | £568k | £1.5m |
| regular | 42 | 51 lb | 4,840 | 90 | 48 lb | £2.2m | £1.9m |
| keen | 54 | 52 lb | 14,465 | 85 | 49 lb | £2.4m | £1.8m |
| tycoon | 0 | — | 0 | 91 | 48 lb | £2.1m | £2.7m |
| angler | 42 | 51 lb | 4,973 | 49 | 34 lb | £117k | £1.3m |

The two unbalanced players prove the principle. The tycoon has the best water in the world and cannot fish it; the pure angler can fish anything and owns nothing worth fishing. Only the players who do both end the year with all three ladders climbed — and the keen player, at three hours a day, is a level and a lake ahead of the regular one, not a world ahead, because the water's ladder runs on the clock and not on the hours.

The world, month by month (the biggest fish anywhere, and how many forties and fifties exist across all thirty-eight waters):

| Month | Biggest fish | Forties | Fifties | Top rating |
|---|---|---|---|---|
| 1 | 35.6 lb | 0 | 0 | 75 |
| 2 | 39.3 lb | 0 | 0 | 88 |
| 3 | 41.5 lb | 4 | 0 | 85 |
| 4 | 43.4 lb | 51 | 0 | 86 |
| 6 | 46.0 lb | 244 | 0 | 92 |
| 8 | 48.2 lb | 336 | 0 | 89 |
| 10 | 50.2 lb | 418 | 1 | 93 |
| 12 | 51.8 lb | 470 | 5 | 93 |

The first fifty in the world is grown in month ten, and there are five at the year's end — on Danube and French waters, from record-grower fish with the frame for it. A UK water grows one in the second year. That is the regional endgame DESIGN-2 set up with its ceilings, and it is why the biggest fish in the world will still be climbing in year three.

A regular player's diary (the first regular in the roster; rating, money, level, biggest owned, best landed):

| Day | Rating | In the bank | Level | Biggest owned | Best landed |
|---|---|---|---|---|---|
| 1 | 47 | £24k | 4 | 18 lb | 17 lb |
| 3 | 53 | £15k | 5 | 24 lb | 21 lb |
| 7 | 59 | £17k | 8 | 25 lb | 31 lb |
| 14 | 60 | £16k | 12 | 31 lb | 32 lb |
| 30 | 66 | £22k | 17 | 34 lb | 34 lb |
| 60 | 76 | £43k | 22 | 37 lb | 37 lb |
| 90 | 84 | £44k | 26 | 39 lb | 41 lb |
| 180 | 90 | £464k | 32 | 43 lb | 46 lb |
| 270 | 87 | £1.3m | 37 | 45 lb | 47 lb |
| 365 | 90 | £2.2m | 41 | 47 lb | 52 lb |

The first month is tight — the £100,000 goes on the site, the hundred fish to open, the twenties and then the thirties, and the facilities wait for the tickets to pay for them — and that is the new player's game: catch a few fish, build a basic lake, make a little money. Money only runs ahead from the third month.

What a water earns, by rating band, over every lake-day in the run:

| Rating | Income a fishery day | Costs | Net a fishery day | Net a real day |
|---|---|---|---|---|
| 20–40 | £19 | £4 | £15 | £356 |
| 40–60 | £75 | £32 | £43 | £1,021 |
| 60–80 | £251 | £79 | £172 | £4,132 |
| 80–100 | £1,118 | £656 | £463 | £11,101 |

## 6. Findings, and what to do about them

1. **Money runs ahead of the game after month three.** A rating-80 water nets £11,000 a real day; every investing player is a millionaire by month eight, and the whole facility catalogue (£550,000) is bought by month five. Nothing breaks — money never gates — but money stops being a decision. Two answers, and both are recommended: make the record grower's supply global and scarce (one or two fish a week for the whole world, as DESIGN-8 wrote it, sold by auction, so that its price floats with the money in the world), and make the market between players the sink it was designed to be — five fifties among a few hundred millionaires price themselves. If James wants money to stay tight for longer, `Demand.MostAnglers` is the one knob: 5 in the model; at 3 the top water nets about £6,000 a real day and the facilities take until month eight.
2. **The frame is what makes a fifty rare, and the record grower a gamble.** Without it the world is all forties by midsummer. With it, forties are a prize water's top ten and fifties are five in the world at the year's end. The frame is hidden; the farm sells a bloodline, and the owner learns what they bought by feeding it.
3. **The forty is a season, not a month.** The model can be made to give a forty in a month (the record grower at rating 60 and a faster 38-to-40) but it costs the second and third months their goal. Recommended as it stands.
4. **Attendance is already a rule, and it is the right one.** The thirty-day cap per visit halves a casual owner's year and leaves a daily owner's whole. Nothing to build; it wants saying on the lake page (*your water ran 30 of the 72 days since you last looked*).
5. **The tycoon problem is solved by the level, not by the odds alone.** A rating-91 water and £2m buy a k of 1.7 on your own fish; the angler who fishes it for a fortnight has 0.6. The tycoon's fifty will be caught by somebody else, photographed, and made famous — which is worth money to the tycoon and status to the angler. That is the coupling working.
6. **Old age at 22 fishery years defeats the long game.** Moved to 35 (§3.8).

## 7. What this changes against DESIGN-9

| DESIGN-9 said | This model says | Why |
|---|---|---|
| growth 0.33 / 0.1 / 0.03 lb a day at 20 / 30 / 45 lb | 0.055 lb a day at 20 lb, halving every 6 lb, capped by the fish's frame and the water | the hand-drawn figures give a fifty in three weeks; the halving gives the recommended pace and one constant to turn |
| farms sell to 12 / 24 / 32 / 38 lb | bands 4–6, 8–12, 14–18, 20–24, 28–32, 34–38, each a pack; the record grower's fish carry the record bloodline | the bands are what the shelf shows, and the bloodline is what the grade means |
| the record fish is priced *£60k and up* | £35,000 at the band's middle: guide bands raised above 30 lb, record factor ×4 | derived from the saving time at rating 75 (about a week of a rating-75 water's takings) |
| k from 3.0 to 0.5: rating −1.5, level −0.5, knowledge −0.5 | k from 3.0 to 0.35: rating −1.5, level −0.6, knowledge −0.6, tackle −0.3 | tackle earns a small, explicit share; the lower floor gives the top of the ladder room to differ |
| experience = weight^1.5 per fish, plus a little per session and new water | the same, × novelty (a third after a hundred sessions on one water), × 2 for a personal best | many waters over one water, as asked |
| lake rating: five parts, weights 20 / 15 / 25 / 20 / 20 | the same weights, with each share's formula written down (§3.2) | the head share is a plateau, so growing and hosting are both full marks |
| visitors by reputation, as now | arrivals rise with rating^1.5 from 1 to 6 a day before facilities | a neglected water earns pocket money, not a living |
| no view on age | safe to 35 fishery years | so a bought 38 can be grown into a fifty before it dies |
| a forty in a month | a forty in the first season | §6.3 |

## 8. Decisions for James

The four from DESIGN-9 stand (the reset is assumed here; the other three are open), and this model adds five:

1. **The pace table.** A forty in the first season (recommended, §5) or in the first month (DESIGN-9)?
2. **The frame.** Hidden, discovered by growing the fish — or shown as a band on the farm's shelf (*a fish with a forty in it*)? Hidden is recommended: it makes the season of feeding a story with an ending.
3. **Money.** Leave the economy as the game has it (a top water clears about £11,000 a real day) with the auction and a scarce global record supply as the sinks, or tighten `MostAnglers` to 3? Recommended: leave it, and build the scarcity.
4. **The record grower's supply.** One or two fish a week for the whole world, sold to the highest bidder among rating-75 waters?
5. **Old age.** Safe to 35 fishery years?

## 9. Running and tuning the model

```
npm run test:pace
```

prints the five tables in §5 for a fixed seed and fails if the regular player's median day for a 20, 30, 40 or 50 leaves the band in `PaceTargets` (`scripts/pace/rules.ts`). The rules of the game are `rules.ts`; what the farms, the shop and the feed cost is `shelf.ts`; who plays, how often and on what site is `roster.ts`. To try a change: edit the number, run it, read the pace table. The model reuses the game's own catalogues where the rule is not changing — the regions and their growth factors and ceilings, the facilities and their costs and effects, the sites and their prices, the tackle tiers' shares, the thirty-day simulation cap — so those numbers are the game's, not the model's. When the domain code is built to this design, `test:pace` becomes the test that runs it through the real rules instead of the model's.
