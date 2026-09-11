# Carp Mania — setup

Three services: Supabase (database + Google login), Google Cloud (the OAuth client), Vercel (hosting). About twenty minutes.

## 1. Supabase project

1. Create a project at supabase.com. Note the **Project URL** and **anon (public) key** from Project Settings → API.
2. Open the SQL editor and run the three files in `supabase/migrations/`, in order:
   `0001_tables.sql`, `0002_policies.sql`, `0003_functions.sql`, `0004_saved_rods.sql`. Paste each one and press Run.
3. Authentication → URL Configuration:
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
```

Then:

```
npm install && npm run dev
```

Open http://localhost:5173, sign in with Google. Your first visit to Home creates your starter fishery (10 acres, 100 carp, £5,000).

## 4. Deploy to Vercel

1. Import the GitHub repo in Vercel. Framework is detected as SvelteKit; no build settings to change.
2. Add the two environment variables above under Settings → Environment Variables.
3. After the first deploy, put the Vercel URL into Supabase Site URL and add `https://<your-app>.vercel.app/auth/callback` to Redirect URLs.

## Useful commands

- `npm run check` — Svelte + TypeScript type check.
- `npm run test:domain` — runs the simulation and fishing rules through 30 fishery days (pure Node, no database).
- `npm run audit:files` — fails if any source file is over 100 lines.
