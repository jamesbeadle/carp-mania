# Carp Mania on Android and iPhone

The Android and iPhone apps are [Capacitor](https://capacitorjs.com) shells around the live game. Each app opens `https://carp-mania.com` full screen, so the game players get in the app is the same SvelteKit site that is deployed to Vercel — one codebase, three platforms.

```
mobile/
  capacitor.config.ts   app id com.carpmania.app, the name, the colours, the user-agent mark
  www/live-game.json    the address the apps open — the one place it is written
  www/offline.html      shown when the phone has no signal
  assets/               the icon and splash sources; npm run assets makes every size from them
  android/              the Android Studio project
  ios/                  the Xcode project (Swift Package Manager, no CocoaPods)
```

## What ships when

- **A change to the game (`src/`)** reaches the apps the moment Vercel deploys it. No store release.
- **A change in `mobile/`** — the icon, the name, a plugin, a permission, the address — needs a new build uploaded to Google Play and the App Store, with the version raised (`versionCode`/`versionName` in `android/app/build.gradle`, `MARKETING_VERSION`/`CURRENT_PROJECT_VERSION` in Xcode).

## Running the apps

Once, after cloning: `cd mobile && npm install`.

After changing anything in `mobile/`: `npm run sync` copies the config and plugins into both native projects.

- **Android:** install Android Studio, then `npm run open:android` (or `npm run run:android` for a plugged-in phone or emulator).
- **iPhone:** on a Mac with Xcode, `npm run open:ios`, pick a simulator or phone, Run. Signing needs the Apple Developer team chosen under *Signing & Capabilities*.

To try the apps against a preview deployment or a local dev server, change `www/live-game.json` (for a dev server on the same Wi‑Fi: `http://<your-computer's-IP>:5173`, run with `npm run dev -- --host`), `npm run sync`, and put it back before committing.

## Sign-in inside the apps

Google refuses to sign anyone in from inside an app's web view, so the apps sign in through the phone's own browser:

1. The app adds `CarpManiaApp` to its user agent. When the sign-in button is pressed, the server sees it and asks Supabase to send the player back to `com.carpmania.app://auth/callback` instead of the website.
2. The Google page opens in Safari or Chrome. After sign-in, Supabase sends the browser to `com.carpmania.app://auth/callback?code=…`, which the phone hands to the app.
3. The game (`src/lib/native/nativeSignInReturn.ts`) hears the app being reopened and loads `/auth/callback?code=…` inside the app, which finishes the sign-in exactly as the website does.

**One dashboard step is needed before this works:** Supabase → Authentication → URL Configuration → Redirect URLs → add `com.carpmania.app://auth/callback`.

## Icons and splash screens

The sources are in `assets/` (drawn from `static/icons/icon.svg`). After changing them, `npm run assets` regenerates every Android and iOS size.

## Before submitting to the stores

- **Google Play:** in Android Studio, *Build → Generate Signed App Bundle*, make an upload key and keep it safe (never in this repository), upload the `.aab` to the Play Console. Google Play also needs the privacy policy address: `https://carp-mania.com/privacy`.
- **App Store:** in Xcode, *Product → Archive → Distribute App*, then fill in the listing in App Store Connect. Export compliance is already answered (`ITSAppUsesNonExemptEncryption` is false).
- **Sign in with Apple.** Apple requires it alongside Google sign-in (App Review guideline 4.8). It needs adding to the game — for every platform — before the iPhone app is submitted.
- **Selling things.** Apple and Google require their own in-app purchase for digital goods sold inside an app, so season tickets sold through Paddle must not be offered in the apps as they are on the web.
- **Adverts.** AdSense is for websites; inside an app, Google's policy wants AdMob.
- **Address.** `carp-mania.com` must be live (see `DOMAIN.md`) before the apps are built for release. Until then, set `www/live-game.json` to `https://carp-mania.vercel.app` for testing.
