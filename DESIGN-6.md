# Carp Mania — Design VI: care and attention

Five designs built the game outwards. This one looks at what is already on the screen and asks whether each element earns its place. The brief is the owner's: the look sits between photorealistic and cartoon, and what is there now leans cartoon in places — a flat green flood on a chosen peg, depth drawn as hard-edged discs, a night that arrives in steps. Rather than a new system, this is a pass over the elements one at a time, pulling out what looks shoddy and putting care into what replaces it, and it is meant to be repeated: the next pass will find the next thing.

Two of the six things asked for turned out to exist already — swims can be renamed and a shape in progress can be undone or abandoned — but only in the side panel of the groundworks yard, which is out of sight on anything narrower than a wide desktop. That is the same failure as a bad colour: the game did not put the control where the player was looking. So the rule for this pass is **controls sit where the action is, and colours come from one palette.**

## 1. Stories

- As an angler, I want the peg I have chosen to look like a peg on a bank — a platform, a chair, a bivvy, my rods — lit rather than painted green, so the water looks like a place and not a diagram.
- As an owner, I want the depth of my water to read as water — deeper where it is darker, with soft edges — so the lake looks like it was dug rather than drawn.
- As a player, I want the light on every screen to move through the day the way light does — the blue before dawn, apricot at sunrise, clear at noon, amber towards evening, coral at sunset, indigo after — fading rather than jumping, and the same on the hub, the water and every banner.
- As an owner drawing in the yard, I want to see the rule I am breaking as I break it, undo my last click, or throw the shape away and start again — right by the shape, on any screen.
- As an owner, I want to rename, move or take out a swim by clicking it, and have the controls appear right there.
- As an angler, I want to reel a rod in and cast it somewhere else, so a bad cast is not a rod lost for the day.
- As an angler with three rods out, I want to know at once which rod the bite is on, so I strike the right one.

## 2. Screens

- **The water** (fishing and the hub): a peg is a short wooden stage on the bank with a soft ground shadow. Hovering lifts it a little; choosing it lights it with a warm ring and sets the name in bold — no green fill. Names sit on the bank side of the peg, never over the water, and the angler faces whichever way the water is. The seated angler gets a chair, a shadow and a bivvy with a door; the rods rest on a pod. The bait marker is a small pale float; ripples are water-white. Depth zones and bed patches are drawn once onto a soft-edged layer so deep water darkens gradually, and the whole lake sits under the day's light.
- **Light**: one palette of keyframes across the day drives the sky and the ground together — night (deep navy), pre-dawn (slate blue), sunrise (apricot), morning (pale gold), midday (clear), golden hour (amber), sunset (coral into violet), blue hour (indigo). Every overlay fades between ticks instead of stepping. On the water the light follows the session clock continuously; the ambience still changes by the quarter hour.
- **The yard**: a *bench* sits directly under the canvas on every screen size and shows whatever the canvas is doing. While drawing: the rule being broken in red (also on the shape's own label), *Undo point*, *Start again*, *Finish*. Once placed: the failures, if any, and *Start again*. With a peg chosen: its name, *Rename*, the move-here button or how to move it, *Take out*. With a new swim placed: the naming card. The side panel keeps the plan — tool, choices, cost, order — and no longer opens as a sheet just for a swim.
- **The rods**: each cast rod's card gains *Reel in*; keys 1, 2 and 3 do the same on a desktop. A reeled rod is idle again and the next click on the water casts it. On a bite the strike button leads with *Bite on rod 2*, the rod's card pulses red, and a red *Rod 2* tag rings the float on the water.
- **Every place banner**: on a phone the title no longer breaks letter by letter — the action buttons wrap underneath instead.

## 3. Site map

No new routes. The yard's bench and the rod cards change what is on existing screens.

## 4. Data

Nothing stored. Light is a function of the fishery hour; depth is the layout as before; a reeled rod is session state.

## 5. Backend

Nothing new. `RenameSwim`, `MoveSwim` and `RemoveSwim` already exist and are reached from the bench instead of the panel.

## 6. Phases

One branch, `care-and-attention`, in this order: light, the water, the yard bench, the rods.
