import { carpPullStrength, easedChange, fightSecondsFor, FightStepSeconds, isFishRunning, isHookPulled, isLineSnapped, nextTension, RunWarningSeconds, TensionBand, tensionBandFor, tensionChangePerSecond, type Band } from '$lib/domain/fishing/fight';
import { fightPatternOf, surgeAt, type FightPattern } from '$lib/domain/fishing/fightPattern';
import type { LineThickness } from '$lib/domain/tackle/lines';
import type { Carp } from '$lib/domain/types';

export type FightOutcome = 'landed' | 'snapped' | 'hook_pulled';

export class FightState {
	tension = $state<number>(TensionBand.Ideal);
	secondsRemaining = $state(0);
	isReeling = $state(false);
	isRunning = $state(false);
	isRunComing = $state(false);
	outcome = $state<FightOutcome | null>(null);
	readonly carp: Carp;
	readonly band: Band;
	private readonly pullStrength: number;
	private readonly pattern: FightPattern;
	private timeSeconds = 0;
	private unsteppedSeconds = 0;
	private previousChange = 0;

	constructor(carp: Carp, lineThickness: LineThickness, rating: number) {
		this.carp = carp;
		this.band = tensionBandFor(rating);
		this.secondsRemaining = fightSecondsFor(Number(carp.weight_lb));
		this.pullStrength = carpPullStrength(Number(carp.weight_lb), lineThickness);
		this.pattern = fightPatternOf(carp);
	}

	advance(secondsElapsed: number) {
		if (this.outcome) return;
		this.unsteppedSeconds += secondsElapsed;
		while (this.unsteppedSeconds >= FightStepSeconds && !this.outcome) {
			this.unsteppedSeconds -= FightStepSeconds;
			this.step();
		}
	}

	private step() {
		this.timeSeconds += FightStepSeconds;
		const surge = surgeAt(this.pattern, this.timeSeconds);
		this.isRunning = isFishRunning(surge);
		const surgeAhead = surgeAt(this.pattern, this.timeSeconds + RunWarningSeconds);
		this.isRunComing = !this.isRunning && isFishRunning(surgeAhead);
		const change = easedChange(this.previousChange, tensionChangePerSecond(this.isReeling, this.pullStrength, surge));
		this.previousChange = change;
		this.tension = nextTension(this.tension, change, FightStepSeconds);
		this.secondsRemaining = Math.max(0, this.secondsRemaining - FightStepSeconds);
		this.outcome = this.judge();
	}

	private judge(): FightOutcome | null {
		if (isLineSnapped(this.tension, this.band)) return 'snapped';
		if (isHookPulled(this.tension, this.band)) return 'hook_pulled';
		if (this.secondsRemaining === 0) return 'landed';
		return null;
	}
}
