# Carp Mania — setup

Three services: Supabase (database + Google login), Google Cloud (the OAuth client), Vercel (hosting). About twenty minutes.

## 1. Supabase project

1. Create a project at supabase.com. Note the **Project URL**, the **anon (public) key** and the **service_role key** from Project Settings → API.
2. Database → Extensions: enable **pg_cron**. It closes ended matches and bounties every minute and purges the live feed hourly. If you enable it later, re-run `0014d_closing_a_match.sql` afterwards; without it, Vercel crons call `close_ended_matches()` and `close_ended_bounties()` through the service-role client (`/cron/close-matches`, `/cron/close-bounties`) — the functions are the contract, the scheduler is interchangeable.
3. Open the SQL editor and run the files in `supabase/migrations/`, in name order — each one is safe on a live database with players in it:
   `0001_tables.sql`, `0002_policies.sql`, `0003_functions.sql`, `0004_saved_rods.sql`,
   `0005_the_money_once.sql` (run it exactly once: it gifts every existing player £95,000), `0005b_the_fish.sql`, `0005c_trusted_writes.sql`, `0005d_the_guide_price.sql`, `0005e_the_farm_order_checks.sql`, `0005f_the_fish_farm.sql`, `0005g_the_dealer.sql`,
   `0006_the_layout.sql`, `0007_the_works.sql`, `0008_the_world.sql`,
   `0009_the_market.sql`, `0009b_transport.sql`, `0009c_listing.sql`, `0009d_bidding.sql`, `0009e_settling.sql`, `0009f_closing.sql`, `0009g_the_hardened_catch.sql`, `0009h_record_catch.sql`, `0009i_the_visit_seed_and_pins.sql`, `0009j_the_schedules.sql`, `0010_money_moves_in_one_place.sql`,
   `0011_the_memorial.sql`, `0011b_the_owner_on_the_catch.sql`, `0011c_the_hall_of_fame.sql`,
   `0012_the_generations.sql`, `0012b_the_handover.sql`, `0012c_the_fisherman_on_the_catch.sql`,
   `0013_the_estate.sql`, `0013b_the_current_water_in_the_market.sql`,
   `0014_the_matches.sql`, `0014a_fishing_the_match.sql`, `0014b_booking_a_match.sql`, `0014c_the_prizes.sql`, `0014d_closing_a_match.sql`,
   `0015_the_lists.sql`,
   `0016_records_among_anglers.sql`, `0016b_the_angler_on_the_news.sql`,
   `0017_the_trophy_room.sql`, `0017b_milestones_and_ranks.sql`,
   `0018_rivalry.sql`, `0018b_the_catch_tells_the_beaten.sql`, `0018c_the_next_name_to_beat.sql`,
   `0019_the_anglers_rating.sql`, `0020_the_tackle_trade.sql`, `0020b_the_catch_uses_the_tackle.sql`, `0021_rigs_and_bait.sql`, `0022_the_farms.sql`, `0022b_fish_in_bulk.sql`, `0023_the_ticket_book.sql`, `0023b_buy_a_ticket.sql`, `0024_the_shoals.sql`, `0024b_a_fish_gets_its_name.sql`, `0025_the_big_water.sql`, `0026_the_make_up_of_a_water.sql`, `0026b_the_booking_diary.sql`, `0026c_book_a_peg.sql`, `0027_honours.sql`, `0027b_the_awards.sql`, `0027c_the_bounties.sql`, `0027d_paying_the_prize.sql`, `0027e_settling_a_bounty.sql`, `0027f_the_catch_takes_the_bounty.sql`, `0027g_prizes_and_the_till.sql`, `0028_the_fish_market_closes.sql`.
   Paste each one and press Run.
4. Authentication → URL Configuration:
   - Site URL: `http://localhost:5173` for now (change to the live domain after deploying — `https://carp-mania.com` for the real game).
   - Redirect URLs: add `http://localhost:5173/auth/callback`, and later the live domain's `/auth/callback` (`https://carp-mania.com/auth/callback` and `https://carp-mania.vercel.app/auth/callback` for the real game).

## 2. Google OAuth client

1. console.cloud.google.com → APIs & Services → Credentials → Create credentials → OAuth client ID → Web application.
2. Authorised redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback` (Supabase shows this exact URL under Authentication → Providers → Google). The real game's Supabase project answers on its own hostname, `api.carp-mania.com`, so its redirect URI is `https://api.carp-mania.com/auth/v1/callback` — `DOMAIN.md` Part B explains why and how.
3. Copy the Client ID and Client Secret into Supabase → Authentication → Providers → Google, and enable the provider.
4. If the consent screen asks, set it to External and add yourself as a test user while it's in testing mode.

## 3. Run it locally

Create `.env.local` in the repo root:

```
PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only: it bypasses row-level security and is how the server writes money, fish and works on the players' behalf. Never prefix it `PUBLIC_` and never commit it.

`PUBLIC_SUPABASE_URL` is whichever hostname the project answers on: the real game uses its custom domain, `https://api.carp-mania.com`, and the `https://egeaybjpzcaejfeuolpz.supabase.co` address works just the same.

Then:

```
npm install && npm run dev
```

Open http://localhost:5173, sign in with Google. Every player starts with £100,000 and finds their water on the globe.

## 4. Deploy to Vercel

1. Import the GitHub repo in Vercel. Framework is detected as SvelteKit; no build settings to change.
2. Add the three environment variables above under Settings → Environment Variables.
3. After the first deploy, put the Vercel URL into Supabase Site URL and add `https://<your-app>.vercel.app/auth/callback` to Redirect URLs.
4. If pg_cron is not enabled, add a fourth variable, `CRON_SECRET` (any long random string). `vercel.json` schedules `GET /cron/close-matches` and `GET /cron/close-bounties` every minute; Vercel sends the secret as `Authorization: Bearer …`, and the routes call `close_ended_matches()` and `close_ended_bounties()` through the service-role client. Without the variable the routes answer 401 to every call, so they are harmless when pg_cron is doing the job.

## 5. The domain

The real game lives at `https://carp-mania.com` (registered at 123 Reg, served by Vercel) and its Supabase project at `https://api.carp-mania.com`, so Google's sign-in screen names the game rather than `supabase.co`. `DOMAIN.md` is the step-by-step for both: the DNS records, the Vercel and Supabase settings, the Google Cloud changes, and the order to do them in so nobody is locked out mid-switch.

## Useful commands

- `npm run check` — Svelte + TypeScript type check.
- `npm run test:domain` — runs the simulation and fishing rules through 30 fishery days (pure Node, no database).
- `npm run test:sql` — recreates a local `carp_mania_test` database, stubs Supabase's `auth` schema and roles, runs every migration in order (seeding a pre-Design-II player before `0005`), then every scenario in `supabase/tests/`. Needs a local PostgreSQL 16 and `psql`; connection from `PGHOST` (default `/tmp/pg`), `PGPORT` (`5433`) and `PGUSER` (`postgres`).
- `npm run audit:files` — fails if any source file is over 100 lines.
- `npm run audit:routes` — fails if any link or form action in a Svelte file points at a route or action that does not exist.
