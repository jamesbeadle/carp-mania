# Carp Mania

A web game about running a carp fishery and fishing it. Every player owns a lake — ten acres, a hundred carp — and is also an angler who can fish any public water in the game.

- **Owner:** feed the stock, buy bigger carp, introduce pike to take out sick fish, hire a bailiff to keep the water sweet, set the day-ticket fee, watch the catch reports build your reputation.
- **Angler:** pick a swim, tackle up three rods (line, hook, rig, bait, shrink tubing), cast, strike, play the fish, get the photo.

SvelteKit · Tailwind · Supabase (Google login, Postgres) · Vercel.

See `SETUP.md` to run it and `DESIGN.md` for the stories, site map, data model and simulation rules. `CLAUDE.md` is the coding standard every file follows.

```
src/lib/domain      the rules of the game — pure TypeScript, no framework, runnable with npm run test:domain
src/lib/server      commands and queries (CQRS) with their gates; the only code that touches Supabase
src/lib/game        the canvas scene and the fishing-session state machine
src/lib/components  Svelte views
src/routes          the site map
supabase/migrations tables, row-level security, and the two security-definer functions anglers call
```
