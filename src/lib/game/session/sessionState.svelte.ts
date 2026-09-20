import { isSettledAfter } from '$lib/domain/fishing/catchSettle';
import type { TheBar } from '$lib/domain/fishing/honours';
import { isWindowOver } from '$lib/domain/fishing/sessionWindow';
import type { Carp, Swim } from '$lib/domain/types';
import type { RodOnBank } from '../scene/rodState';
import { BiteRoller, type RolledBite } from './biteRoller';
import type { FightState } from './fightState.svelte';
import type { LandedFish } from './landFish';
import type { TackleLoss } from './tackleLoss';
import { advanceTheSession } from './sessionTicks';
import { waterTodayOf } from './waterToday';
import { visitFactsOf, type SessionSetup, type VisitFacts } from './visitFacts';

export type SessionPhase = 'choose_swim' | 'tackle_up' | 'fishing' | 'fighting' | 'landed' | 'day_over';

export interface ActiveBite extends RolledBite {
	secondsLeft: number;
}

export interface SessionState extends VisitFacts {}

export class SessionState {
	phase = $state<SessionPhase>('choose_swim');
	hour = $state<number>(0);
	swim = $state<Swim | null>(null);
	rods = $state<RodOnBank[]>([]);
	bite = $state<ActiveBite | null>(null);
	hooked = $state<RolledBite | null>(null);
	fight = $state<FightState | null>(null);
	lastLanded = $state<LandedFish | null>(null);
	landedToday = $state<LandedFish[]>([]);
	nuisanceToday = $state<Carp[]>([]);
	lostToday = $state(0);
	notice = $state<string | null>(null);
	isPickingASwimToMoveTo = $state(false);
	tackleLost = $state<TackleLoss[]>([]);
	secondsSinceTheMat = $state(0);
	bar: TheBar;
	readonly roller: BiteRoller;

	constructor(setup: SessionSetup) {
		Object.assign(this, visitFactsOf(setup));
		this.bar = setup.bar;
		this.hour = this.window.fromHour;
		this.roller = new BiteRoller(this.seed, waterTodayOf(this));
	}

	get isDayOver() {
		return isWindowOver(this.hour, this.window);
	}

	get isSettlingAfterCatch() {
		return this.phase === 'landed' && !isSettledAfter(this.secondsSinceTheMat);
	}

	hasLandedToday(carp: Carp) {
		const landedIds = this.landedToday.map((landed) => landed.carp.id);
		return landedIds.includes(carp.id);
	}

	tick(secondsElapsed: number) {
		advanceTheSession(this, secondsElapsed);
	}
}
