# Carp Mania — the long game (proposal)

A proposal for James to confirm before any of it is built. It answers the feedback of 27 September 2026: big fish should take weeks, months and a year to earn; lakes should earn their prices; the angler rating that someone maxed in days becomes a level. Nothing here is built yet. The numbers are starting points, to be set by a simulation (the last section) rather than by guesswork.

## The pace we are aiming for

| A regular player (about an hour a day) lands | Within |
|---|---|
| a 20 lb fish | the first two or three days |
| a 30 lb fish | a week |
| a 40 lb fish | a month |
| a 50 lb fish | a year |

Three levers set that pace, and all three are needed: what fish exist in the world (supply), how fast they grow (time), and how likely a big one is to pick up your bait (odds).

## Supply: the farms sell to lakes that have earned it

Today any owner with the money can buy a record-grade fifty from the Danube on day one — that is how someone reached 100 so quickly. Proposed: a farm grade sells only to a lake whose **rating** has reached its bar, and the biggest fish are priced above what a new player can have saved.

| Farm grade | Sells up to | Lake rating needed | Price of its biggest fish |
|---|---|---|---|
| Stock | 12 lb | any | a few hundred pounds |
| Good | 24 lb | 25 | £2–4k |
| Specialist | 32 lb | 50 | £15–25k |
| Record | 38 lb | 75 | £60k and up |

No farm sells a forty. A forty is grown: a 36–38 lb record fish fed well for a few weeks on a top lake. A fifty is a forty grown on for most of a year. Starting stock tops out at 18 lb. The world's biggest fish therefore rise with the calendar, which is what keeps the ladder honest for everyone, including players who join late.

## Time: growth slows as a fish gets big

Growth becomes a curve rather than a flat 0.035 lb per protein-day: roughly a third of a pound a day for a twenty on good feed, a tenth of a pound for a thirty, and a thirtieth of a pound for a forty-five. Condition, water quality and stocking density scale it. A lake that is overstocked for its acreage grows nothing.

## Odds: every fish can be caught, big ones rarely

Every fish in the lake stays catchable. When a bite comes, the taker is drawn by weight:

`chance of fish ∝ (fish weight ÷ lake's biggest)^(−k)`

`k` starts at 3 (big fish rare) and comes down with:
- **the lake's rating** — the main factor: a well-run, well-stocked, clean water fishes fairly, and up to −1.5,
- **the angler's level** — a small factor, up to −0.5,
- **knowing the water** — sessions fished on this lake before, up to −0.5, so the tenth visit beats the first.

`k` never goes below 0.5, so even the best angler on the best lake lands mostly the middle of the stock. Tackle, bait and conditions keep their current effect on *whether* you get a bite, not on its size.

## The lake rating

A score from 0 to 100, recalculated daily:

| Part | Weight | Measured by |
|---|---|---|
| Facilities | 20% | what is built, and its upgrades |
| Head of fish | 15% | fish per acre against the ideal for the acreage |
| Quality of fish | 25% | the size of the top ten against the world's, and their condition |
| Catch rate | 20% | fish landed per rod-hour over the last fortnight |
| Water | 20% | clarity, weed and silt, and the aerator |

The rating sets the **price band** for a day ticket: a floor and a ceiling that rise with it (about £5–£15 at rating 10, £40–£80 at rating 80). The owner sets a price inside the band; visitors decide by price against rating. Other tickets are clean multiples of the day ticket, never dearer than buying the parts separately and free to carry a discount: a night at most 2× the day, 24 hours at most a day plus a night, 48 hours at most two 24-hour tickets, a week at most seven.

**Maximum stock** comes from acreage: 60 fish an acre, and a lake stocked beyond its ideal loses rating on *head of fish* before it hits the cap.

## Money for an owner

| Income | From |
|---|---|
| Visiting anglers (NPC) | the daily simulation, driven by rating, price and facilities |
| Real anglers | tickets bought by players |
| Sponsorship | as now, but unlocked and priced by rating |
| Facilities | takings per angler, as now |

Facilities gain upgrade paths that take more ground on the bank — toilets → washrooms → club house → estate house — each a separate build, so the fishery visibly grows.

## The angler's level

The rating (the lower of skill and 2 points per pound of best fish, capped at 100) is replaced by a **level** that never tops out quickly:

- Experience comes from every fish landed — `(weight in lb)^1.5`, so a thirty is worth about five twenties — plus a little per session and per new water fished.
- Level `n` needs `50 × n^2.2` experience in total. Level 10 in the first week, 25 in a month, around 60 in a year for a regular player.
- Level gates tackle brands, as rating does now, and adds its small share to the odds above.

## The reset

Every player goes back to choosing a name: money, lakes, fish, tackle, catches and records are cleared; accounts and chosen names stay. It is one migration, run once when this ships, and it cannot be undone. Announce it in the game a few days ahead.

## How the numbers get set

A script (`npm run test:pace`, alongside `test:domain`) simulates a year of play for a handful of player types — an hour a day, three hours a day, weekends only — on lakes of different ratings, and prints the day each reaches 20, 30, 40 and 50 lb. The constants above are tuned until the regular player lands on the table at the top, and the test then guards that pace against later changes.

## Decisions needed from James

1. **The reset** — clear everything except accounts and names, as above? Or keep catches and the hall of fame as a "season one" archive?
2. **Farms and fifties** — no farm ever sells a forty or a fifty (they are only grown)? Or a record farm sells one very rarely to rating-90 lakes?
3. **Real players' tickets** — should a real angler's ticket price be the owner's price, or the band's floor, so friends are not priced out?
4. **Level cap** — no cap (it slows forever), or a cap at 100 reached after a few years?
