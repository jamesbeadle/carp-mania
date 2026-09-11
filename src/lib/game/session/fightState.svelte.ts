import { carpPullStrength, fightSecondsFor, isHookPulled, isLineSnapped, nextTension, TensionBand } from '$lib/domain/fishing/fight';
import type { LineThickness } from '$lib/domain/tackle/lines';
import type { Carp } from '$lib/domain/types';

export type FightOutcome = 'landed' | 'snapped' | 'hook_pulled';

export class FightState {
	tension = $state<number>(TensionBand.Ideal);
	secondsRemaining = $state(0);
	isReeling = $state(false);
	outcome = $state<FightOutcome | null>(null);
	readonly carp: Carp;
	private readonly pullStrength: number;
	private surgePhase = Math.random() * Math.PI * 2;

	constructor(carp: Carp, lineThickness: LineThickness) {
		this.carp = carp;
		this.secondsRemaining = fightSecondsFor(Number(carp.weight_lb));
		this.pullStrength = carpPullStrength(Number(carp.weight_lb), lineThickness);
	}

	advance(secondsElapsed: number, timeSeconds: number) {
		if (this.outcome) return;
		const surge = 0.5 + Math.sin(timeSeconds * 1.7 + this.surgePhase) * 0.5 + Math.sin(timeSeconds * 5.3) * 0.15;
		this.tension = nextTension(this.tension, this.isReeling, this.pullStrength, secondsElapsed, surge);
		this.secondsRemaining = Math.max(0, this.secondsRemaining - secondsElapsed);
		this.outcome = this.judge();
	}

	private judge(): FightOutcome | null {
		if (isLineSnapped(this.tension)) return 'snapped';
		if (isHookPulled(this.tension)) return 'hook_pulled';
		if (this.secondsRemaining === 0) return 'landed';
		return null;
	}
}
