import { pickCarpThatTookTheBait } from '$lib/domain/fishing/pickCarp';
import { HookHoldChance } from '$lib/domain/tackle/hooks';
import type { RodSetup } from '$lib/domain/tackle/rodSetup';
import type { Swim } from '$lib/domain/types';
import type { Point } from '../scene/lakeShape';
import { restingRod } from '../scene/rodState';
import { tackleMatchFor } from './biteRoller';
import { FightState } from './fightState.svelte';
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

export function castRod(session: SessionState, rodIndex: number, point: Point) {
	const rod = session.rods[rodIndex];
	if (!rod || rod.phase === 'fighting' || rod.phase === 'biting') return;
	rod.baitPoint = point;
	rod.phase = 'cast';
	session.notice = null;
}

export function nextRodToCast(session: SessionState) {
	return session.rods.find((rod) => rod.phase === 'idle') ?? null;
}

export function strike(session: SessionState) {
	if (!session.bite || !session.swim) return;
	const rod = session.rods[session.bite.rodIndex];
	session.bite = null;
	const isHookHolding = Math.random() < HookHoldChance[rod.setup.hook.size];
	const carp = pickCarpThatTookTheBait(session.carp, Math.random());
	if (!isHookHolding || !carp) return dropTheFish(session, rod.index, 'The hook pulled on the strike — too small a hook for a carp.');
	rod.phase = 'fighting';
	session.fight = new FightState(carp, rod.setup.line.thickness);
	session.phase = 'fighting';
}

export function finishFight(session: SessionState) {
	const fight = session.fight;
	const rod = session.rods.find((candidate) => candidate.phase === 'fighting');
	if (!fight?.outcome || !rod || !session.swim) return;
	session.fight = null;
	if (fight.outcome === 'snapped') return dropTheFish(session, rod.index, 'Crack — the line snapped. Ease off when it runs.');
	if (fight.outcome === 'hook_pulled') return dropTheFish(session, rod.index, 'Slack line and the hook fell out. Keep it tight.');
	session.lastLanded = { carp: fight.carp, swim: session.swim, setup: rod.setup, match: tackleMatchFor(session.lake, session.swim, rod), hour: session.hour };
	session.landedToday = [...session.landedToday, session.lastLanded];
	rod.phase = 'idle';
	rod.baitPoint = null;
	session.phase = 'landed';
}

export function returnToFishing(session: SessionState) {
	session.lastLanded = null;
	session.phase = 'fishing';
}

function dropTheFish(session: SessionState, rodIndex: number, message: string) {
	session.rods[rodIndex].phase = 'idle';
	session.rods[rodIndex].baitPoint = null;
	session.lostToday += 1;
	session.notice = message;
	session.phase = 'fishing';
}
