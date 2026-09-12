import type { Point } from '../scene/lakeShape';
import { sound } from '../sound/soundEngine.svelte';
import { buzzForTheNet } from './haptics';
import type { LandedFish } from './landFish';
import { castRod, finishFight, nextRodToCast, strike } from './sessionFlow';
import { soundTheOutcome } from './sessionSounds';
import type { SessionState } from './sessionState.svelte';

const AllRodsOut = 'All rods are out. Wait for a bite.';

export function castTheNextRod(session: SessionState, point: Point) {
	if (session.phase !== 'fishing') return;
	const rod = nextRodToCast(session);
	if (!rod) return void (session.notice = AllRodsOut);
	castRod(session, rod.index, point);
	sound.play('cast');
}

export function strikeAtTheBite(session: SessionState) {
	if (!session.bite) return;
	sound.play('strike');
	strike(session);
	if (session.phase !== 'fighting') sound.play('hook_pulled');
}

export function bringTheFishIn(session: SessionState): LandedFish | null {
	soundTheOutcome(session.fight?.outcome);
	finishFight(session);
	if (session.lastLanded) buzzForTheNet();
	return session.lastLanded;
}
