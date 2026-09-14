# Carp Mania — Design VII: the first players

The game has been played by people who are not the owner, and three things came back. On a phone the strike was hard to hit: it sat at the foot of the screen, in a deck that sometimes had to be scrolled, and a bite gives four seconds. The home screen's five little circles on the bank were not a good arrangement of options — the bailiff's note on arrival is liked, the circles are not. And anglers move swims in real life, so they wanted to move swims in the game. This design answers those three, and only those three. The rule from Design VI still applies: controls sit where the action is.

## 1. Stories

- As an angler on a phone, I want the strike button to appear in the middle of the screen the moment a rod goes off, wherever I have scrolled to, so I never miss a fish because I was looking at a rod card.
- As a player, I want the home screen to offer a clean set of buttons — run my fishery, fish my lake, find a water to fish, matches, the tackle shop — so getting around is one obvious tap, not a hunt around the bank.
- As a player, I want the news of the world — big fish, records, sales, matches — reachable from the header next to my post, so I can look in from any screen.
- As a player, I want my angler reached from the header and the tab bar, not repeated on the home screen.
- As an angler, I want to move to another swim during a session, bringing my rods with me, so a dead peg is not a dead day — and I accept that packing up and walking round costs me time on the bank.

## 2. Screens

- **The hub** (`/home`): the living lake and the bailiff's note stay. The five bank places and their sheets go. Under the lake sits a bar of five buttons: *Fish my lake* (buys the ticket and goes straight to the water; disabled while the water is still being set up), *Run fishery* (the lodge at `/lake`; reads *Finish setting up* and leads to `/setup` while the water is not open; carries a badge for works in progress), *Find water to fish* (`/lakes`), *Matches* (`/matches`), *Tackle shop* (`/market`). One row on a desktop, a grid on a phone. When the player has more than one water, the estate switcher sits under the lake's name so the hub can be turned to another water. When the water is not on the map, one line above the buttons says so and leads to `/lake/pin`.
- **The header**: a *News* icon beside the bell leads to `/news`. The avatar remains the way to my angler on a desktop; the tab bar on a phone.
- **News** (`/news`): the live feed the signpost used to show — every kind pill, *Older*, tap a line to see that water on the globe — under the signpost banner, with the globe, the hall of fame, matches and anglers one tap away.
- **My angler** (`/angler`): gains *The one to beat* from the old jetty sheet, beside the skills.
- **The tab bar**: the labels line up with the hub — *My lake · Find water · The world · Tackle shop · My angler*. `/news` lights *The world*.
- **The water on a phone**: the strike button is no longer a card at the top of the deck. On a bite it appears fixed in the centre of the screen, over water and deck alike, and goes when the bite is struck or lost. Desktops keep the overlay they have.
- **Moving swims**: while fishing with nothing biting, a *Move swim* button sits at the top right of the water on a desktop (key `M`) and in the deck on a phone. Pressing it turns the pegs live again and the prompt reads *Pick a peg to move to — half an hour to pack up and walk round*; *Stay put* cancels. Choosing a peg brings every rod in with its tackle, moves the angler, chair and bivvy to the new peg, puts half an hour on the clock, and the next tap on the water casts from there. The day can end on the walk.

## 3. Site map

`/news` is new, reached from the header on every signed-in screen. `/home` loses its sheets; nothing it linked to is lost — the lodge, the waters list, the matches board, the tackle shop and the noticeboard are all still where they were.

## 4. Data

Nothing stored. The swim on a catch report is whichever swim the angler was on when the fish was landed, as it always was; the visit does not know the swim. The half hour is a rule in the domain (`SwimMove`), not a row.

## 5. Backend

No new commands. `GetHomeHub` shrinks to the works count the badge needs; the hub stops loading the market watch, the next match, the rival and the world feed. `/news` reads `GetWorldActivity` the way `/world` does; `/angler` reads `GetMyRival`.

## 6. Phases

One branch, `first-feedback`, in this order: the hub and the header, the strike on a phone, moving swims.

## 7. The second round

Three more things came back once the first round was live, and they are built on `second-feedback`.

- **Pike.** The predators panel said *up to 3 for this water* while the water held 4. The 3 was only ever the size of one order — the command never counted the pike already in the water, so two orders of 3 put 6 pike on a 5-acre water. The sensible maximum is now the water's total: the panel says *room for N more*, a full water says so and offers no form, and an overstocked one says *4 pike is more than the 3 this water sensibly holds — stop feeding them and they will thin out* (unfed pike die back). `StockPike` refuses an order past the room left. Nothing stored changes; a water already over the line stays over it until the pike thin out.
- **The day runs to midnight.** As an angler, I want to fish into the dark, because carp feed at night and a day that ends at nine is short. `FishingDay.EndHour` is 24; at 22 real seconds an hour a session is now about seven minutes rather than six. The clock's bar runs *Dawn → Midnight*, the day-over card is headed *Midnight*, and the bite factor after 18:00 (1.3, the same as dusk) carries through the dark. The sky and the light already know the night; nothing else moved.
- **Washed out at dawn.** The sunrise glow (a soft-light apricot at 42%) and the morning glow flattened the water on a phone. The glow is halved through the day — sunrise 24%, morning 8%, golden hour 18%, sunset 28% — so the warmth stays and the contrast comes back. Mist used to lie at full strength all day: it now lies thick before seven, lifts by ten, and gathers again after half past seven in the evening; and no weather is drawn over the deck or the hub's button bar any more, which had been fogging the controls.
- **The reel on a phone.** The strike moved to the centre of the screen in the first round; the fight it starts did not — it was still a card docked in the deck under the water, and on most phones the *Hold to reel* button at its foot sat just below the fold, so the angler had to scroll up mid-fight. The fight now follows the strike: on a phone it is an overlay fixed over the whole screen, water and deck alike, the same `CanvasOverlay` a desktop puts over the lake. The deck no longer hosts the fight at all — two meters on one fight would have driven it twice. Landing photo and day-over card stay in the deck, where scrolling is fine.
