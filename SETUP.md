# Carp Mania — setup

Three services: Supabase (database + Google login), Google Cloud (the OAuth client), Vercel (hosting). About twenty minutes.

## 1. Supabase project

1. Create a project at supabase.com. Note the **Project URL**, the **anon (public) key** and the **service_role key** from Project Settings → API.
2. Database → Extensions: enable **pg_cron**. It closes ended auctions every minute and purges the live feed hourly. If you enable it later, re-run `0009j_the_schedules.sql` afterwards; without it, schedule a Vercel cron that calls `close_ended_listings()` through the service-role client (`/cron/close-listings`) — the function is the contract, the scheduler is interchangeable.
3. Open the SQL editor and run the files in `supabase/migrations/`, in name order — each one is safe on a live database with players in it:
   `0001_tables.sql`, `0002_policies.sql`, `0003_functions.sql`, `0004_saved_rods.sql`,
   `0005_the_money_once.sql` (run it exactly once: it gifts every existing player £95,000), `0005b_the_fish.sql`, `0005c_trusted_writes.sql`, `0005d_the_guide_price.sql`, `0005e_the_farm_order_checks.sql`, `0005f_the_fish_farm.sql`, `0005g_the_dealer.sql`,
   `0006_the_layout.sql`, `0007_the_works.sql`, `0008_the_world.sql`,
   `0009_the_market.sql`, `0009b_transport.sql`, `0009c_listing.sql`, `0009d_bidding.sql`, `0009e_settling.sql`, `0009f_closing.sql`, `0009g_the_hardened_catch.sql`, `0009h_record_catch.sql`, `0009i_the_visit_seed_and_pins.sql`, `0009j_the_schedules.sql`, `0010_money_moves_in_one_place.sql`,
   `0011_the_memorial.sql`, `0011b_the_owner_on_the_catch.sql`, `0011c_the_hall_of_fame.sql`,
   `0012_the_generations.sql`, `0012b_the_handover.sql`, `0012c_the_fisherman_on_the_catch.sql`.
   Paste each one and press Run.
4. Authentication → URL Configuration:
   - Site URL: `http://localhost:5173` for now (change to your Vercel URL after deploying).
   - Redirect URLs: add `http://localhost:5173/auth/callback` and later `https://<your-app>.vercel.app/auth/callback`.

## 2. Google OAuth client

1. console.cloud.google.com → APIs & Services → Credentials → Create credentials → OAuth client ID → Web application.
2. Authorised redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback` (Supabase shows this exact URL under Authentication → Providers → Google).
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

Then:

```
npm install && npm run dev
```

Open http://localhost:5173, sign in with Google. Every player starts with £100,000 and finds their water on the globe.

## 4. Deploy to Vercel

1. Import the GitHub repo in Vercel. Framework is detected as SvelteKit; no build settings to change.
2. Add the three environment variables above under Settings → Environment Variables.
3. After the first deploy, put the Vercel URL into Supabase Site URL and add `https://<your-app>.vercel.app/auth/callback` to Redirect URLs.
4. If pg_cron is not enabled, add a fourth variable, `CRON_SECRET` (any long random string). `vercel.json` schedules `GET /cron/close-listings` every minute; Vercel sends the secret as `Authorization: Bearer …`, and the route calls `close_ended_listings()` through the service-role client. Without the variable the route answers 401 to every call, so it is harmless when pg_cron is doing the job.

## Useful commands

- `npm run check` — Svelte + TypeScript type check.
- `npm run test:domain` — runs the simulation and fishing rules through 30 fishery days (pure Node, no database).
- `npm run test:sql` — recreates a local `carp_mania_test` database, stubs Supabase's `auth` schema and roles, runs every migration in order (seeding a pre-Design-II player before `0005`), then every scenario in `supabase/tests/`. Needs a local PostgreSQL 16 and `psql`; connection from `PGHOST` (default `/tmp/pg`), `PGPORT` (`5433`) and `PGUSER` (`postgres`).
- `npm run audit:files` — fails if any source file is over 100 lines.
- `npm run audit:routes` — fails if any link or form action in a Svelte file points at a route or action that does not exist.
