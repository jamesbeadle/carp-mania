# Carp Mania — Design V: anglers against anglers

Design IV gave the game a long memory. Design V gives it an opponent. Two kinds of people fish a water: the *visitors* the simulation sends every fishery day, and the *anglers* — the other players. Visitors are the business of running a fishery: they pay the day tickets, they build the reputation, they put fish on the bank while you are away. But they are not who you are trying to beat. Today the two are mixed everywhere the game keeps score: the biggest-fish boards are full of visitors, records count visitors' catches (so on a busy water no angler can set one until the fish grows), the world feed is mostly visitors' news, and an angler's page is a list rather than a display. This design draws the line once, everywhere: **anglers are the competition; visitors are the weather.**

Decisions taken up front: a record — lake, region, world — is something an angler sets, and only an angler can take it; visitors' catches still earn the fish fame and the fishery reputation and still fill the owner's ledger, because that is what visitors are for. Visitors keep their names but never a link, and wherever they share a screen with anglers they sit behind them, muted, or under a fold. Every board says where *you* stand and what it takes to move up.

## 1. Stories

**Anglers, not visitors**
- As an angler, I want every board to rank anglers, so I know who I am chasing and by how much.
- As an angler, I want records to be set by anglers, so a record is something I can win and something I can lose.
- As an angler, I want to see where I stand on every board — my row lit, or the gap between my best and the last place shown — so the board is a target and not a list.
- As an angler, I want visitors clearly marked wherever they still appear, so I never mistake a visitor for a rival.
- As an owner, I still want visitors' catches in my ledger and on my water's page, because they are my takings and my reputation.

**The trophy room**
- As an angler opening another angler's page, I want their biggest catches as cards — the weight, the fish, the water, the honours the catch carried — and how I measure up against them, so I know what to beat.
- As an angler, I want my own page to be a trophy room: my best fish as cards, the records I hold today, the milestones I have passed.

**Rivalry**
- As an angler, I want a note when another angler takes my record or knocks me down a board, so the competition has a pulse.
- As an angler, I want the feed to lead with what anglers did, and a way to see only that.
- As an angler, I want the jetty to show me the angler just above me, so there is always a next name to beat.

## 2. Screens

- **Hall of fame** (phase 1): *Biggest fish ever caught* becomes *Biggest fish caught by an angler* — anglers only, the viewer's row lit, and under the board one line of standing: "You're No. 4" or "Your best is 24 lb 8 oz — 8 lb 3 oz short of the board". *Waters of legend* ranks waters by the best fish an angler had there. *Most fish landed* and *Match winners* were already anglers. *Legends* stays a board of fish. A muted footnote under the biggest-fish board keeps the visitors' best in the background: "Visitors' best on this scope: 32 lb 11 oz, Old Mirror at Lord Howlett's".
- **Leaderboards rail on the world** (phase 1): *Biggest ever caught* → *Biggest by an angler*; the viewer's row lit.
- **A water's page** (phase 1): *Recent catches* leads with anglers' catches (name linked, avatar), then *Visitors* under a fold with a one-line summary: "31 visitors this week, best 30 lb 2 oz".
- **Catch lists everywhere** (phase 1): a visitor's row is muted and says so — "by Ash "Night Owl" · visitor"; an angler's row links to the angler.
- **The feed** (phase 1): a catch or record by an angler links to the angler; visitors' catches are dimmed; an *Anglers* pill shows only what anglers did (catches, records, matches, handovers). The bailiff's note is unchanged — it is the owner's business.
- **On the water** (phase 1): the honours at the weigh-in — lake, region, world record — are measured against anglers' catches, so a record ribbon means the angler beat every angler, not every visitor.
- **An angler's page** (phase 2): a hero with the angler's rank by skill and by personal best; a *catch cards* grid — each card a big weight, the fish (linked while it swims, "in the book" after), the water, the date, and ribbons for the honours it carried (personal best, lake, region or world record at the time; "still holds the lake record" when the record stands); *Records held* — every record the angler holds today, by water; *Milestones* — first twenty, thirty, forty, fifty; first record; first match won; 100 and 500 fish. When it is somebody else's page, *How you measure up*: their personal best against yours, fish landed, skill, records held, trophies, and the one line that matters, "3 lb 4 oz to beat".
- **My angler** (phase 2): the same cards and milestones, first person.
- **The noticeboard** (phase 3): "*Sam Zig King* has taken your lake record at Willow Pool — 28 lb 4 oz to 27 lb 12 oz"; "You've dropped to No. 5 on the world board".
- **The jetty sheet** (phase 3): the angler one place above you on the biggest-fish board, with the gap and a link to their page.

## 3. Site map

No new routes. The hall of fame, the leaderboards rail, a water's page, the catch lists and the feed change what they show; the angler pages gain sections; the noticeboard gains two kinds of note.

## 4. Data

- The line already exists in the data: a catch with `angler_id` is an angler's, a catch without one is a visitor's (the owner's simulation inserts them with no angler). Nothing new is stored for phase 1.
- Records are derived, never stored: the standing lake, region and world records are the heaviest *angler's* catch in each scope. Phase 2 adds a view of the standing record holders so "records held" and "still holds" are one read.
- World events for an angler's catch or record carry `anglerId` in the payload, so the feed can link and filter; a visitor's carry only the name. Visitors no longer produce record events at all.
- Phase 2: milestones are derived from catches and trophies; nothing stored.
- Phase 3: two notification kinds, `record_lost` and `board_place_lost`, raised inside `record_catch` when the previous holder is a different angler.

## 5. Backend

- Phase 1: `records_broken_by` compares against anglers' catches only; `waters_of_legend` ranks by anglers' catches; `raise_catch_news` takes the angler and writes `anglerId` into the event; `GetStandingRecords` (the bar on the water and the simulation's copy) reads anglers' catches only; the simulation stops raising record events for visitors; `GetHallOfFame` and `GetLeaderboards` filter to anglers and carry the viewer's standing and the visitors' best; `GetLake` splits a water's recent catches into anglers' and visitors'; `GetWorldActivity` learns the `anglers` group.
- Phase 2: `GetAnglerPublicProfile` gains catch cards with honours (a catch's honours are recomputed against the catches before it, so the cards are true to the day), records held, milestones and the comparison with the viewer; `standing_records` view.
- Phase 3: `record_catch` raises `record_lost`; a nightly (fishery-day) pass raises `board_place_lost`; `GetMyRival` for the jetty.

## 6. Phases

1. **Anglers, not visitors** — records and boards among anglers, "you" on every board, visitors marked and moved behind everywhere they still show, the feed's *Anglers* pill. *(built: `anglers-not-visitors`)*
2. **The trophy room** — catch cards with honours, records held, milestones, and how you measure up against another angler. *(built: `the-trophy-room`)*
3. **Rivalry** — notes when your record or board place is taken, the next name to beat on the jetty.
