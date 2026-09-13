import type { Point } from '../scene/lakeShape';
import { bringRodIn } from '../scene/rodState';
import { sound } from '../sound/soundEngine.svelte';
import { pointerWords } from '../stage/pointerWords';
import { buzzForTheNet } from './haptics';
import type { LandedFish } from './landFish';
import { castRod, finishFight, nextRodToCast, strike } from './sessionFlow';
import { soundTheOutcome, soundTheReelIn } from './sessionSounds';
import type { SessionState } from './sessionState.svelte';

const AllRodsOut = 'All rods are out. Wait for a bite.';

export function castTheNextRod(session: SessionState, point: Point) {
	if (session.phase !== 'fishing') return;
	const rod = nextRodToCast(session);
	if (!rod) return void (session.notice = AllRodsOut);
	castRod(session, rod.index, point);
	sound.play('cast');
}

export function reelTheRodIn(session: SessionState, rodIndex: number) {
	const rod = session.rods[rodIndex];
	if (session.phase !== 'fishing' || !rod || rod.phase !== 'cast') return;
	bringRodIn(rod);
	soundTheReelIn();
	session.notice = pointerWords(`Rod ${rodIndex + 1} is in. Click the water to cast it again.`);
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
