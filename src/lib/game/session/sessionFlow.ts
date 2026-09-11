import { castTerrainFor } from '$lib/domain/fishing/castTerrain';
import { pickCarpThatTookTheBait } from '$lib/domain/fishing/pickCarp';
import { HookHoldChance } from '$lib/domain/tackle/hooks';
import type { RodSetup } from '$lib/domain/tackle/rodSetup';
import type { Carp, Swim } from '$lib/domain/types';
import { toFraction, type Point } from '../scene/lakeShape';
import { bringRodIn, castPointOf, isCastOut, restingRod, type CastRod } from '../scene/rodState';
import { tackleMatchFor } from './biteRoller';
import { favouriteSpotBonusFor } from './favouriteSpots';
import { FightState } from './fightState.svelte';
import type { LandedFish } from './landFish';
import type { SessionState } from './sessionState.svelte';

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
	if (!rod || rod.phase === 'fighting' || rod.phase === 'biting') return;
	rod.baitPoint = scenePoint;
	rod.terrain = castTerrainFor(session.lake, toFraction(scenePoint));
	rod.phase = 'cast';
	session.notice = null;
}

export function nextRodToCast(session: SessionState) {
	return session.rods.find((rod) => rod.phase === 'idle') ?? null;
}

export function strike(session: SessionState) {
	if (!session.bite) return;
	const rod = session.rods[session.bite.rodIndex];
	session.bite = null;
	const isHookHolding = Math.random() < HookHoldChance[rod.setup.hook.size];
	const carp = pickCarpThatTookTheBait(session.carp, Math.random(), favouriteSpotBonusFor(session.lake, session.season, rod));
	if (!isHookHolding || !carp) return dropTheFish(session, rod.index, 'The hook pulled on the strike — too small a hook for a carp.');
	rod.phase = 'fighting';
	session.fight = new FightState(carp, rod.setup.line.thickness);
	session.phase = 'fighting';
}

export function finishFight(session: SessionState) {
	const fight = session.fight;
	const rod = session.rods.find((candidate) => candidate.phase === 'fighting');
	if (!fight?.outcome || !rod || !isCastOut(rod) || !session.swim) return;
	session.fight = null;
	if (fight.outcome === 'snapped') return dropTheFish(session, rod.index, 'Crack — the line snapped. Ease off when it runs.');
	if (fight.outcome === 'hook_pulled') return dropTheFish(session, rod.index, 'Slack line and the hook fell out. Keep it tight.');
	session.lastLanded = landedFishFor(session, session.swim, fight.carp, rod);
	session.landedToday = [...session.landedToday, session.lastLanded];
	bringRodIn(rod);
	session.phase = 'landed';
}

export function returnToFishing(session: SessionState) {
	session.lastLanded = null;
	session.phase = 'fishing';
}

function landedFishFor(session: SessionState, swim: Swim, carp: Carp, rod: CastRod): LandedFish {
	return {
		carp,
		swim,
		terrain: rod.terrain,
		castPoint: castPointOf(rod),
		rodIndex: rod.index,
		setup: rod.setup,
		match: tackleMatchFor(session.lake, rod),
		hour: session.hour
	};
}

function dropTheFish(session: SessionState, rodIndex: number, message: string) {
	bringRodIn(session.rods[rodIndex]);
	session.lostToday += 1;
	session.notice = message;
	session.phase = 'fishing';
}
