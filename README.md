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
src/routes          the site map: /setup, /home, /lake, /lake/works, /world, /news, /lakes, /fish, /matches, /market, /carp, /anglers, /inbox
supabase/migrations tables, row-level security, and the security-definer functions that move money and fish
supabase/tests      SQL scenarios run against a local Postgres by npm run test:sql
```
