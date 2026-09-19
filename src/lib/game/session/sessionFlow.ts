import { castTerrainFor } from '$lib/domain/fishing/castTerrain';
import { layoutScaleFor } from '$lib/domain/layout/layoutScale';
import { swimPoint } from '$lib/domain/layout/swimRules';
import { castDistanceFeet, isCastTooFar, pointWithinCast } from '$lib/domain/tackle/castDistance';
import { carpOfTaker } from '$lib/domain/fishing/takers';
import { takerOfTheBait } from '$lib/domain/fishing/whoTookTheBait';
import type { RodSetup } from '$lib/domain/tackle/rodSetup';
import type { Swim } from '$lib/domain/types';
import { toFraction, toScene, type Point } from '../scene/lakeShape';
import { bringRodIn, castPointOf, isCastOut, restingRod, type CastRod } from '../scene/rodState';
import { waterTodayOf } from './waterToday';
import type { ActiveBite, SessionState } from './sessionState.svelte';

export function chooseSwim(session: SessionState, swim: Swim) {
	session.swim = swim;
	session.phase = 'tackle_up';
}

export function tackleUp(session: SessionState, setups: RodSetup[]) {
	session.rods = setups.map((setup, index) => restingRod(index, setup));
	session.phase = 'fishing';
	session.notice = 'Click the water to cast each rod.';
}

export function castRod(session: SessionState, rodIndex: number, scenePoint: Point) {
	const rod = session.rods[rodIndex];
	if (!rod || rod.phase === 'fighting' || rod.phase === 'biting' || !session.swim) return;
	const scale = layoutScaleFor(Number(session.lake.plot_acres));
	const peg = swimPoint(session.swim);
	const reachFeet = castDistanceFeet(rod.kit);
	const isShort = isCastTooFar(peg, toFraction(scenePoint), scale, reachFeet);
	const landed = pointWithinCast(peg, toFraction(scenePoint), scale, reachFeet);
	rod.baitPoint = toScene(landed);
	rod.terrain = castTerrainFor(session.lake, landed);
	rod.phase = 'cast';
	if (isCastOut(rod)) session.roller.rollAfterCast(rod, session.hour);
	session.notice = isShort ? `Landed short — ${reachFeet} ft is all that rod and reel will throw.` : null;
}

export function nextRodToCast(session: SessionState) {
	return session.rods.find((rod) => rod.phase === 'idle') ?? null;
}

export function returnToFishing(session: SessionState) {
	session.lastLanded = null;
	session.phase = 'fishing';
}

export function fishOnTheEnd(session: SessionState, rod: CastRod, bite: ActiveBite) {
	const spot = { terrain: rod.terrain, castPoint: castPointOf(rod) };
	const water = waterTodayOf(session);
	const rolled = { roll: bite.roll, hour: bite.hour, kit: rod.kit, seed: session.seed };
	return carpOfTaker(takerOfTheBait(session.carp, rolled, water, spot));
}
