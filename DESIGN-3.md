# Carp Mania — Design III: a game, not a dashboard

Design II built the fishery, the world and the market. Design III is about how it *feels*: the whole delivery should be a game — animated, immersive, with sound — and it should play on a phone. It follows the same chain as before: stories → screens → site map → data → backend, and it is being built in phases, each on its own branch, each verified before the next starts. Nothing existing is removed until its game replacement is in and working.

## 1. Stories

- As a player, I want my home screen to be my lake, alive with light, weather and wildlife, so returning to the game feels like arriving at the water.
- As a player, I want to tap places on my bank — the lodge, the tackle shop, the noticeboard, the jetty, the signpost — to reach what I do there, so getting around feels like being at the fishery rather than using a menu.
- As a player, I want my money, my post and my angler always in view, so I never hunt for them.
- As a player on a phone, I want every screen laid out for one hand, a tab bar at the bottom, and the lake to answer to my finger, so I can play anywhere.
- As a player, I want the lake to sound like a lake — birds, water, wind, rain by time of day and season — and the interface to answer with small sounds, with a volume control that remembers, so the game feels alive.
- As a player, I want screens to slide in rather than reload, so nothing feels like a website.
- As an angler on a phone, I want big Strike and Reel controls, a vibration on a bite and the sounds of casting, reeling and the net, so fishing is as good on the bus as at a desk. *(Phase 2)*
- As a player, I want every deep screen — market, world, groundworks, inbox, lodge, setup — to look and move like the rest of the game. *(Phase 3)*
- As a player, I want screens to appear instantly and long lists to page and filter, so the game never feels slow. *(Phase 4)*

## 2. Screens

**The hub** (`/home`) is a stage: a sky that follows the fishery clock (one real hour is one fishery day, so dawn, noon, dusk and night all pass in an hour), stars and a moon at night, the sun by day, clouds driven by the wind, flocks of birds in daylight, rain, mist at dawn, heat haze in a hot summer. The lake scene sits on a band of bank below the horizon and is lit by the same hour: it warms at sunrise and sunset and darkens at night; each season tints it. Fish rise now and then. Five places stand on the bank at fixed bearings from the water's centre, wherever the shoreline is: **the lodge** (the fishery, works in progress), **the tackle shop** (market watch), **the noticeboard** (unread post), **the jetty** (my angler, go fishing), **the signpost** (the world; it beckons until the water is pinned). Tapping a place opens a sheet — a bottom sheet on a phone, a side drawer on a desktop — showing that place's cards; the deep screens are one tap further. A note from the bailiff opens on arrival when days have passed.

**The HUD** sits over every signed-in screen: wordmark, the main tabs on desktop, money that counts up when it changes (with a coin sound), the inbox bell with its badge, the sound control, the avatar. On phones the tabs move to a bottom bar: My lake, Go fishing, The world, Market, My angler.

**Sound** is synthesised in the browser — no files — through named slots so a recorded sample can replace any sound later by dropping a file in `static/sounds` and naming it in the manifest. Ambience plays on the hub and during a fishing session and shifts with hour, season and weather; interface sounds are a tap, open/close, confirm/cancel, coins and a chime. The first tap on the page unlocks audio (browsers require it); mute and volume persist per device.

## 3. Site map

The map is unchanged from Design II; what changes is how it is reached. The hub's places and the tab bar are the front door to the same routes. The sheets show the cards that used to be stacked on the old home page.

## 4. Data

No new tables. Weather is cosmetic in this phase, rolled per fishery day from the lake's own seed so every visitor sees the same sky over a water; the simulation's heatwaves are unchanged. Sound settings live in the browser.

## 5. Backend

One new query, `GetHudSummary`, gives the HUD its money on every screen alongside the existing unread count. Everything else reuses the home hub's loads.

## 6. Phases

1. **Game shell** — hub, HUD, tab bar, transitions, game styling, sound engine and ambience, touch on every canvas, install-to-home-screen. *(built)*
2. **Fishing feel** — touch controls for strike and reel, haptics, fishing sounds, a proper bite alarm on the engine, the weigh-in celebration, the tackle builder on a phone.
3. **Game screens** — market as the tackle shop, world as the signpost, groundworks with a finger, the noticeboard, the lodge with the bailiff, setup as a story.
4. **Speed and lists** — parallel and streamed loads with skeletons, preloading, paging and filters on lakes, inbox, catches, feed and leaderboards.
