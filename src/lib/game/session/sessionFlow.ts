import { castTerrainFor } from '$lib/domain/fishing/castTerrain';
import { honoursFor, raiseTheBar } from '$lib/domain/fishing/honours';
import { carpThatTookTheBait } from '$lib/domain/fishing/whoTookTheBait';
import { HookHoldChance } from '$lib/domain/tackle/hooks';
import type { RodSetup } from '$lib/domain/tackle/rodSetup';
import type { Swim } from '$lib/domain/types';
import { toFraction, type Point } from '../scene/lakeShape';
import { bringRodIn, castPointOf, isCastOut, restingRod, type CastRod } from '../scene/rodState';
import { FightState } from './fightState.svelte';
import { landedFishFor } from './landFish';
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
	if (!rod || rod.phase === 'fighting' || rod.phase === 'biting') return;
	rod.baitPoint = scenePoint;
	rod.terrain = castTerrainFor(session.lake, toFraction(scenePoint));
	rod.phase = 'cast';
	if (isCastOut(rod)) session.roller.rollAfterCast(rod, session.hour);
	session.notice = null;
}

export function nextRodToCast(session: SessionState) {
	return session.rods.find((rod) => rod.phase === 'idle') ?? null;
}

export function strike(session: SessionState) {
	const bite = session.bite;
	const rod = bite ? session.rods[bite.rodIndex] : null;
	if (!bite || !rod || !isCastOut(rod)) return;
	session.bite = null;
	const isHookHolding = Math.random() < HookHoldChance[rod.setup.hook.size];
	const carp = fishOnTheEnd(session, rod, bite);
	if (!isHookHolding || !carp) return dropTheFish(session, rod.index, 'The hook pulled on the strike — too small a hook for a carp.');
	if (session.hasLandedToday(carp)) return dropTheFish(session, rod.index, `${carp.name} again — once on the bank is enough for one day. It shed the hook and went.`);
	rod.phase = 'fighting';
	session.hooked = bite;
	session.fight = new FightState(carp, rod.setup.line.thickness, session.rating);
	session.phase = 'fighting';
}

export function finishFight(session: SessionState) {
	const fight = session.fight;
	const hooked = session.hooked;
	const rod = session.rods.find((candidate) => candidate.phase === 'fighting');
	if (!fight?.outcome || !hooked || !rod || !isCastOut(rod) || !session.swim) return;
	session.fight = null;
	session.hooked = null;
	if (fight.outcome === 'snapped') return dropTheFish(session, rod.index, 'Crack — the line snapped. Ease off when it runs.');
	if (fight.outcome === 'hook_pulled') return dropTheFish(session, rod.index, 'Slack line and the hook fell out. Keep it tight.');
	const weightLb = Number(fight.carp.weight_lb);
	session.lastLanded = landedFishFor(session.lake, session.swim, fight.carp, rod, hooked, session.hour, honoursFor(weightLb, session.bar));
	session.bar = raiseTheBar(weightLb, session.bar);
	session.landedToday = [...session.landedToday, session.lastLanded];
	bringRodIn(rod);
	session.secondsSinceTheMat = 0;
	session.phase = 'landed';
}

export function returnToFishing(session: SessionState) {
	session.lastLanded = null;
	session.phase = 'fishing';
}

function fishOnTheEnd(session: SessionState, rod: CastRod, bite: ActiveBite) {
	const spot = { terrain: rod.terrain, castPoint: castPointOf(rod) };
	const water = waterTodayOf(session);
	const rolled = { roll: bite.roll, hour: bite.hour, setup: rod.setup, seed: session.seed };
	return carpThatTookTheBait(session.carp, rolled, water, spot);
}

function dropTheFish(session: SessionState, rodIndex: number, message: string) {
	bringRodIn(session.rods[rodIndex]);
	session.lostToday += 1;
	session.notice = message;
	session.phase = 'fishing';
}
