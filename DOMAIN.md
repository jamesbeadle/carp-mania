# Carp Mania — carp-mania.com

Two things, done in order. Part A puts the game on `carp-mania.com` (with `www.carp-mania.com` redirecting to it). Part B gives the Supabase project its own hostname, `api.carp-mania.com`, so that Google's sign-in screen says **carp-mania.com** instead of `egeaybjpzcaejfeuolpz.supabase.co` — the same arrangement as YourBusinessToday, where `api.yourbusiness.today` fronts its Supabase project. Part A works on its own; Part B needs Part A's domain.

About an hour hands-on, plus waiting for DNS and certificates. Everything here is dashboard work — no code changes; the app already reads the Supabase hostname from `PUBLIC_SUPABASE_URL` and builds the sign-in return address from whatever domain the request came in on.

## Where things stand (checked 12 Sep 2026)

- `carp-mania.com` is registered at 123 Reg and still parked there: two A records at `@` pointing at 123 Reg's parking page (`13.248.213.45`, `76.223.67.189`) and a CNAME `www` → `carp-mania.com`. Its nameservers are 123 Reg's own (`ns65.domaincontrol.com`, `ns66.domaincontrol.com`), so all DNS is edited in the 123 Reg control panel. No email or other records exist on the domain.
- The game is live at `carp-mania.vercel.app` (Vercel project `carp-mania`).
- The Supabase project ref is `egeaybjpzcaejfeuolpz`. Today a sign-in goes Google → `https://egeaybjpzcaejfeuolpz.supabase.co/auth/v1/callback` → `/auth/callback` on the game, and that `supabase.co` name is what Google shows the player.

## Costs and requirements

- Vercel: a custom domain costs nothing.
- Supabase: the custom domain is a paid add-on — **$10 a month, billed by the hour**, on top of the plan, and it needs the project's organisation to be on a paid plan (Pro or above). It is not covered by the spend cap. If the Carp Mania project sits in the same organisation as YourBusinessToday it is already on Pro; if it is in a free organisation, upgrade first (Supabase → Organization → Billing).
- You need Owner or Admin on the Supabase project, and access to the Google Cloud project that holds the Carp Mania OAuth client.

## Part A — the game on carp-mania.com

### 1. Add the domain in Vercel

1. vercel.com → the `carp-mania` project → **Settings** → **Domains** → **Add Domain**.
2. Type `carp-mania.com`. When it asks about `www`, choose the option that adds `carp-mania.com` and redirects `www.carp-mania.com` to it. (Vercel's own preference is the other way round — `www` primary — and that also works, but then every `carp-mania.com` address in this document becomes `www.carp-mania.com`.)
3. Both domains now appear with **Invalid Configuration** and a card showing the records to create. Keep this page open — copy the values from the card, not from anywhere else. They look like:

   | Type | Name | Value |
   | --- | --- | --- |
   | A | `@` | the IP on the card — `76.76.21.21` for most projects, newer ones get a different anycast address such as `216.198.79.1` |
   | CNAME | `www` | the target on the card — project-specific, in the shape `xxxxxxxxxxxxxxxx.vercel-dns-0xx.com` |

   Vercel checks for the exact records it shows, so an IP copied from an older guide fails verification even if the site happens to load.

### 2. Point the domain at Vercel in 123 Reg

1. 123-reg.co.uk → **Control Panel** → **Manage All** next to Domains → `carp-mania.com` → **DNS** in the toolbar. This is the record editor.
2. The `@` A records: edit one of the two parking records so its **Value** is Vercel's IP, and delete the other. Two A records at `@` means Vercel sees a conflict and the domain stays invalid.
3. The `www` CNAME: edit the existing record (it points at `carp-mania.com`) so its **Value** is Vercel's CNAME target, **with a full stop on the end** (`xxxxxxxxxxxxxxxx.vercel-dns-0xx.com.`) — 123 Reg needs the trailing dot. Don't add a second `www` record; 123 Reg refuses a CNAME whose name is already used, and the editor won't tell you which one is winning.
4. Leave TTL at Default. Save.
5. On the domain's overview, make sure **Web forwarding** is off — a forward would override the A record.

### 3. Wait for Vercel to verify

Back on Vercel's Domains page, both domains flip to **Valid Configuration** once the records are visible, and Vercel issues the certificate itself. Usually minutes; 123 Reg says allow up to 24–48 hours. Then:

- `https://carp-mania.com` shows the sign-in page.
- `https://www.carp-mania.com` redirects to `https://carp-mania.com`.
- `https://carp-mania.vercel.app` still works (it always will).

If a domain stays invalid, the usual cause is a leftover parking record at the same name (`@` A, `www` CNAME) or a value that doesn't match the card.

### 4. Let the game sign in from the new domain

Supabase only returns players to addresses on its allow list, so before anyone signs in at `carp-mania.com`:

1. Supabase → the Carp Mania project → **Authentication** → **URL Configuration**.
2. **Site URL**: `https://carp-mania.com`.
3. **Redirect URLs**: add `https://carp-mania.com/auth/callback`. Keep `https://carp-mania.vercel.app/auth/callback` (the Vercel address still exists) and `http://localhost:5173/auth/callback`.
4. Test: open `https://carp-mania.com` in a private window and sign in with Google. You should land on `/home`. Google's screen still names `egeaybjpzcaejfeuolpz.supabase.co` at this point — Part B changes that.

## Part B — the sign-in on your own name

### 5. Ask Supabase for the custom domain

1. Supabase → the project → **Project Settings** → **General** → **Custom Domains** (the same panel is reachable from **Settings → Add-ons → Custom Domain**). Enable the add-on if it asks.
2. Enter `api.carp-mania.com`. It has to be a subdomain — Supabase can't sit on the apex — and a project can have only one. `api` matches YourBusinessToday and is honest about what it is: the whole API (auth, database, realtime, storage) answers on it, not just sign-in. `auth.carp-mania.com` would work just as well if you prefer the look; keep it consistent through the rest of this document.
3. Supabase lists the DNS records it wants — a CNAME and one or two TXT records for verification. Copy them exactly (trim any surrounding whitespace). They look like:

   | Type | Name | Value |
   | --- | --- | --- |
   | CNAME | `api` | `egeaybjpzcaejfeuolpz.supabase.co` |
   | TXT | `_acme-challenge.api` | a long token from Supabase |
   | TXT | `_cf-custom-hostname.api` | a token from Supabase (shown by some dashboards; add it if listed) |

### 6. Add those records in 123 Reg

In the same DNS editor as step 2, **Add New Record** for each:

- CNAME, Name `api`, Value `egeaybjpzcaejfeuolpz.supabase.co.` (trailing dot again). TTL: choose the lowest the editor allows (600 seconds / 10 minutes) — Supabase recommends a short TTL so the switch propagates quickly.
- TXT, Name `_acme-challenge.api`, Value: the token. Enter the name **relative** to the domain — 123 Reg appends `.carp-mania.com` itself. If you paste the full `_acme-challenge.api.carp-mania.com` you end up with `…carp-mania.com.carp-mania.com` and verification never passes.
- The second TXT the same way, if Supabase listed one.

### 7. Verify — but don't activate yet

Back in the Supabase panel press **Verify**. Supabase checks the records and issues a certificate for `api.carp-mania.com`; this can take up to 30 minutes, so re-verify a few times if it isn't immediate. When it is verified the panel offers **Activate**. Stop here and do step 8 first — activating before Google knows the new callback address breaks sign-in for everyone until Google is updated.

### 8. Tell Google about the new callback

Google Cloud Console → the project that holds the Carp Mania OAuth client → **APIs & Services** → **Google Auth Platform** (the old "OAuth consent screen" pages):

1. **Branding** → **Authorised domains** → add `carp-mania.com`. While there, set **Application home page** to `https://carp-mania.com`. Save. Google won't accept a redirect URI on a domain that isn't authorised here, which is why this comes first.
2. **Clients** → the Carp Mania web client → **Authorised redirect URIs** → **Add URI**: `https://api.carp-mania.com/auth/v1/callback`. **Keep** the existing `https://egeaybjpzcaejfeuolpz.supabase.co/auth/v1/callback` for now — both are needed across the switch.
3. **Authorised JavaScript origins**: add `https://carp-mania.com`. Not strictly needed for this sign-in flow (the redirect happens server-side), but harmless and it keeps the client complete.
4. Save. Google says changes can take from five minutes to a few hours to apply; in practice a few minutes.

### 9. Activate the custom domain

Supabase → the Custom Domains panel → **Activate**. From this moment Supabase sends Google `https://api.carp-mania.com/auth/v1/callback` as the return address whichever hostname the game talks to, and both `api.carp-mania.com` and `egeaybjpzcaejfeuolpz.supabase.co` keep serving requests, so nothing is down while the last step goes through.

### 10. Switch the game to the new hostname

1. Vercel → the project → **Settings** → **Environment Variables** → `PUBLIC_SUPABASE_URL` → edit the value to `https://api.carp-mania.com` for Production (and for Preview and Development, which share the value).
2. Redeploy: **Deployments** → the current production deployment → **⋯** → **Redeploy**, and **untick "Use existing build cache"**. `PUBLIC_` values are baked into the build, so a cached build would keep the old hostname.
3. Everyone is signed out once. The session cookie is named after the Supabase hostname (`sb-egeaybjpzcaejfeuolpz-auth-token` becomes `sb-api-auth-token`), so existing sessions simply aren't found and players sign in again. Nothing else about their accounts changes — same users, same data, same project.

### 11. Test

1. Private window → `https://carp-mania.com` → Sign in with Google. Google's account picker should now name **carp-mania.com** rather than the `supabase.co` address. (It shows the domain because the app isn't brand-verified — see Part C for showing the name "Carp Mania".)
2. You land on `/home`. Supabase → Authentication → Users shows the sign-in with provider `google`.
3. Open `/world` — the live feed comes over Realtime through `api.carp-mania.com`, so a catch or a sale appearing confirms websockets are fine on the new hostname.
4. Sign out and in again at `https://carp-mania.vercel.app` to confirm the old address still works too.

### 12. Tidy up (a day or two later)

- Google → the client → remove the old `https://egeaybjpzcaejfeuolpz.supabase.co/auth/v1/callback` redirect URI. Only do this after the redeploy in step 10 is live; nothing needs it after that.
- If you'd rather players couldn't use `carp-mania.vercel.app` at all, ask for a redirect from it to `carp-mania.com` (a `vercel.json` rule — the cron routes need excluding if the Vercel crons are what close auctions and matches rather than pg_cron). Otherwise leave it; it's harmless.
- `SETUP.md` §1 and §4 describe the same URLs for anyone setting the project up from scratch.

## Part C — "Carp Mania" on Google's screen

With Part B done, Google shows the domain. To show the name and logo instead, the app needs Google's **brand verification** (Google Auth Platform → **Verification Centre**). For an app that only asks for `openid`, `email` and `profile` there is no security assessment, but Google still wants a privacy policy and terms of service on the app's own domain, the domain verified as yours, and the app published.

The pages exist once branch `privacy-and-terms` is merged and deployed: `https://carp-mania.com/privacy` and `https://carp-mania.com/terms`, readable without signing in and linked from the sign-in screen. Their text is data in `src/lib/legal` (`privacyPolicy.ts`, `termsOfService.ts`; the contact address, minimum age and "last updated" date sit in `legalPages.ts`), so a change of wording is a change to one of those files and a new date.

### 13. Branding

Google Cloud Console → **APIs & Services** → **Google Auth Platform** → **Branding**:

1. **App name**: `Carp Mania`. **User support email**: `consulting@yourbusiness.today` (it has to be an address you own on a Google account or Google Group in the project; if that address isn't one, use the account you're signed in with).
2. **App logo**: upload `static/brand/logo-120.png` from the repo (Google wants a square PNG of at least 120×120, under 1 MB; `logo-512.png` also works). Uploading a logo is what triggers the verification requirement, so don't add it before the pages are live.
3. **Application home page**: `https://carp-mania.com`. **Privacy policy link**: `https://carp-mania.com/privacy`. **Terms of service link**: `https://carp-mania.com/terms`. All three must be on an authorised domain.
4. **Authorised domains**: `carp-mania.com` (added in step 8; check it's still there).
5. **Developer contact information**: the same address. Save.

### 14. Prove the domain is yours

Google checks the home page, privacy and terms links against domains verified in **Google Search Console** by the same Google account:

1. search.google.com/search-console → **Add property** → **Domain** → `carp-mania.com`.
2. It gives a TXT record (`google-site-verification=…`). In 123 Reg's DNS editor add a TXT record, Name `@`, Value the token, and press **Verify** back in Search Console. Minutes usually; leave the record in place afterwards.

### 15. Publish and submit

1. Google Auth Platform → **Audience** → if the app is still **Testing**, press **Publish app** → **In production**. Until it is published only test users can sign in and there is nothing to verify.
2. **Verification Centre** (or the **Prepare for verification** banner on Branding) → check the summary (the three links, the logo, the scopes `openid`, `email`, `profile`) → **Submit for verification**. Add a one-line explanation if it asks: a free browser game that uses Google only to sign players in.
3. Google emails the developer contact. Reviews for non-sensitive scopes take a few days to a couple of weeks; the sign-in screen keeps working throughout, showing the domain until the review passes and the name and logo afterwards.

## If something goes wrong

- **Vercel shows Invalid Configuration for hours** — a second record at the same name (the other parking A record, an extra `www`), or a value that isn't the one on the card. Fix the record; Vercel re-checks on its own.
- **Google: `redirect_uri_mismatch`** — the URI in the client isn't exactly `https://api.carp-mania.com/auth/v1/callback` (trailing slash, `http`), or the domain was activated (step 9) before the URI was added (step 8). Add it; it applies within minutes.
- **Google: "Invalid Redirect: domain must be added to the authorised domains list"** — step 8.1 wasn't saved before step 8.2.
- **Sign-in bounces back to `/` with "Sign-in didn't complete — try again", or lands on `carp-mania.vercel.app`** — the address isn't on Supabase's Redirect URLs allow list (step 4).
- **Supabase verification never passes** — TXT name doubled up (`…carp-mania.com.carp-mania.com`), a stray space in the token, or the CNAME missing its trailing dot. A CAA record on the domain would also block the certificate, but `carp-mania.com` has none.
- **Everyone signed out after the redeploy** — expected once (step 10.3), not a fault.
- **Google's verification asks for the privacy policy to "describe the use of Google user data"** — the privacy page's "What we hold about you" section says exactly what Google hands over (email, name, picture) and what it is used for; point the reviewer at it. If the reviewer wants the domain to match the home page and the links exactly, make sure all three use `https://carp-mania.com` (not `www`).
- **Local development** — `.env.local` can use either hostname; both keep working.
