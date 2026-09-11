# Carp Mania — brand

Black carbon, electric green, a shot of blue. The reference was the Korda Kontour packet: heavy condensed italic type on black, a green wireframe mesh. We keep that and add an electric blue. Tokens live in `src/app.css`; the canvas accents in `src/lib/game/scene/palette.ts`.

## Colour

| Token | Hex | Use |
|---|---|---|
| carbon-950 | #060806 | page ground |
| carbon-900 | #0c0f0c | nav, inputs |
| carbon-800 | #141914 | panels |
| carbon-700 | #1f261f | borders |
| carbon-600 | #2c362c | input borders |
| volt-500 | #3ee83a | primary action, selected state, wordmark |
| volt-400 | #6cf56a | hover, "good" readings |
| volt-300 | #a5fca3 | headings on panels, weights |
| surge-500 | #1fd3ff | secondary action, line and bait markers on the canvas |
| surge-400 | #5ee3ff | mid-range readings, informational |
| mist-100 / 200 / 400 | #f2f7f2 / #d9e2d9 / #8f9d8f | text, secondary text, labels |
| danger-500 / 400 | #e5322d / #ff5f5a | bite alarm, snapped line, sick fish — never decorative |

Gradients: `from-volt-500 to-surge-500` for skill bars and the fight-meter band.

## Type

Display: **Barlow Condensed** 800 italic, uppercase — every heading, button, nav item and big number. Body: **Inter** 400/500, tabular numerals for weights and money. Nothing in Inter is uppercase; nothing in Barlow is lowercase. Both load from Google Fonts in `src/app.html`.

## Motif

The wireframe lakebed (`MeshBackdrop.svelte`): contour lines fading volt → surge, 35–50% opacity, only on black. Used behind the landing hero; suitable behind the day-over summary and the catch photo frame. Never behind body text or on a panel.

## On the water

The canvas keeps natural lake colours — bronze commons, golden mirrors, olive pike, teal water. The brand appears only as instrumentation: selected peg volt, line and bait markers surge, bite ripples volt.

## Voice

Angler's words (swim, peg, rig, day ticket, the stock). Plain and quick — errors say what happened and what to do. Weights in lb and oz, money in £ sterling, never decimal pounds on screen.

The full guide with samples is the "Carp Mania Brand" artifact on claude.ai.
