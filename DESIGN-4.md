# Carp Mania — Design IV: legacy, generations, more waters, matches

Design II built the world. Design III made it feel like a game. Design IV is about why anyone comes back for years: a legacy that outlives the fisherman, a family line on the water, an estate of waters, and matches against other people. Same chain as always — stories → screens → site map → data → backend — built in phases, one branch each.

Decisions taken up front: anglers age faster than the fishery (a diary year every four real days; start at 20–30, hand over at a random 80–100, so a generation lasts seven to eleven real months, while carp keep ageing on the fishery clock); the heir is taught by the old man (skills start at 40, not 25, and rise faster); match prizes come from entry fees with an optional host stake, split between most catches and biggest fish as the host chooses; a match books the water out and pays the owner a fee.

## 1. Stories

**Legacy**
- As an angler, I want the biggest fish ever caught to be remembered with my name on it, so a great catch is mine forever.
- As a lake owner, I want my water credited when a great fish is caught on it, so building a fishery is a legacy too.
- As a player, I want fish to die — of old age, or to the pike — and to know when and how, so the prize fish of the day is a real prize and legends are legends because they are gone.
- As a player, I want a hall of fame for the whole world and for my region, so I can see what I am fishing for.

**Generations**
- As a player, I want my fisherman to grow old and, one day, hand the water down to an heir, so the game has chapters.
- As an heir, I want the lakes, money, tackle and saved rods to pass to me, but the catches, personal bests and scrapbook to stay with the old fisherman, so I start again with something to prove and something to live up to.
- As a player, I want every fisherman's scrapbook kept — catches, records, trophies, the fish they knew — so the line has a history.

**More waters**
- As a wealthy owner, I want to buy and run more than one water, near or far, so my fishery can become an estate.
- As a player, I want to switch between my waters without losing my place, so running several stays simple.

**Matches**
- As a host, I want to book a water for a match, set the entry fee and the window, and put up a stake if I like, so I can run competitions.
- As an owner, I want a booking fee when my water is booked out, and my water closed to everyone but the entrants for the window.
- As an entrant, I want a live leaderboard for most catches and biggest fish, prizes paid when the match closes, and a trophy that goes in the hall of fame and my scrapbook.

## 2. Screens

- **Hall of fame** (`/world/hall-of-fame`, world and per region): *Biggest fish ever* — the catch, the angler, the water and its owner at the time, the date, whether the fish still swims; *Legends* — fish that have died, by fame and weight, each with a dossier; *Most fish landed* — anglers by lifetime catches; *Waters of legend* — lakes by the best fish they ever produced, owner credited; later *Match winners*.
- **A fish's dossier** keeps working after death: a memorial header (died on, aged, of what), the catch history, no market actions.
- **The bailiff's note** and the world feed mention deaths: the pike took *X*; *Y* died of old age at 31.
- **The fisherman's diary** (phase 2): age on the angler page; a letter when the old man's time comes; naming the heir; the scrapbook per generation (`/angler/scrapbook/[fishermanId]`); the family line (“third fisherman at Willow Pool”).
- **The estate** (phase 3): the lodge lists every water with a switch; the current water drives every `/lake` screen; a new water is bought through the setup wizard from the world map.
- **Matches** (phase 4): `/matches` (open and coming), `/matches/[matchId]` (the board, entries, the pot, enter), hosting from a lake's page (`/lakes/[lakeId]/host-a-match`), the water shows *booked for a match* while closed.

## 3. Site map

The world page grows a Hall of fame tab beside the leaderboards; the signpost sheet links to it. Everything else attaches to screens that exist: dossiers, the angler page, the lodge, a lake's page.

## 4. Data

- `carp_memorial` — a fish's final row when it dies: the carp's own id, where it died, name, strain, last weight, age, origin, fame, times caught, `died_at`, `death_cause` (`pike`, `old_age`). Public to read. The carp row is removed from the living stock as before, so every “live fish” query stays as it is.
- `catches.carp_id` stops being a foreign key so a catch keeps pointing at a fish after it has died; names resolve from the living stock or the memorial. `catches.owner_name` records the water's owner at the time of the catch, as `angler_name` already does for the angler.
- Old age: a carp is safe until 22, then each fishery new year carries a rising chance of dying, certain by 45.
- Phase 2: `fishermen` (one row per generation: profile, name, generation number, born at, started at, retired at, final skills, catch count, personal best); `catches.fisherman_id`; profiles carry the diary start so age is derived, and the hidden age at which the current fisherman will retire.
- Phase 3: `profiles.current_lake_id`; ownership is already per lake.
- Phase 4: `matches`, `match_entries`; a lake's `booked_until`.

## 5. Backend

- Phase 1: the simulation records deaths (pike, old age) into the memorial and the note; `record_catch` and the simulation's catches write `owner_name`; `GetHallOfFame` (SQL functions for the grouped boards); the dossier and catch lists fall back to the memorial.
- Phase 2: `RetireFisherman` / `NameHeir` commands; the diary clock; scrapbook queries.
- Phase 3: `BuyAnotherWater`, `SwitchWater`; `requireOwnedLake` becomes the current water; the simulation runs every owned water.
- Phase 4: `HostMatch`, `EnterMatch`, `CloseMatch` (cron), the booking gate on day tickets.

## 6. Phases

1. **Fish deaths and the hall of fame.** *(building)*
2. **Generations** — the diary clock, the handover, the heir, the scrapbook.
3. **More waters** — buying, switching, the estate in the lodge.
4. **Matches** — booking, entries, the live board, prizes and trophies.
