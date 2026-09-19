import { carpPullStrength, easedChange, fightSecondsFor, FightStepSeconds, isFishRunning, isHookPulled, isLineSnapped, nextTension, RunWarningSeconds, TensionBand, tensionBandFor, tensionChangePerSecond, type Band } from '$lib/domain/fishing/fight';
import { fightPatternOf, surgeAt, type FightPattern } from '$lib/domain/fishing/fightPattern';
import { doesHookOpen } from '$lib/domain/tackle/hooks';
import { ReelCatalogue } from '$lib/domain/tackle/reels';
import { rodSnapChancePerSecond } from '$lib/domain/tackle/rods';
import type { RodKit } from '$lib/domain/tackle/rodSetup';
import type { Carp } from '$lib/domain/types';

export type FightOutcome = 'landed' | 'snapped' | 'hook_pulled' | 'rod_snapped' | 'hook_opened';

export class FightState {
	tension = $state<number>(TensionBand.Ideal);
	secondsRemaining = $state(0);
	isReeling = $state(false);
	isRunning = $state(false);
	isRunComing = $state(false);
	outcome = $state<FightOutcome | null>(null);
	readonly carp: Carp;
	readonly kit: RodKit;
	readonly band: Band;
	private readonly pullStrength: number;
	private readonly retrieveFactor: number;
	private readonly snapChancePerStep: number;
	private readonly pattern: FightPattern;
	private timeSeconds = 0;
	private unsteppedSeconds = 0;
	private previousChange = 0;

	constructor(carp: Carp, kit: RodKit, rating: number) {
		this.carp = carp;
		this.kit = kit;
		this.band = tensionBandFor(rating, kit.rod.rod);
		this.secondsRemaining = fightSecondsFor(Number(carp.weight_lb));
		const weightLb = Number(carp.weight_lb);
		const line = kit.line.line;
		this.pullStrength = carpPullStrength(weightLb, line.breakingStrainLb);
		this.retrieveFactor = ReelCatalogue[kit.reel.reel].retrieveFactor;
		this.snapChancePerStep = rodSnapChancePerSecond(weightLb, kit.rod.rod) * FightStepSeconds;
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
		const surgeAhead = surgeAt(this.pattern, this.timeSeconds + RunWarningSeconds);
		this.isRunning = isFishRunning(surge);
		this.isRunComing = !this.isRunning && isFishRunning(surgeAhead);
		const pull = tensionChangePerSecond(this.isReeling, this.pullStrength, surge, this.retrieveFactor);
		const change = easedChange(this.previousChange, pull);
		this.previousChange = change;
		this.tension = nextTension(this.tension, change, FightStepSeconds);
		this.secondsRemaining = Math.max(0, this.secondsRemaining - FightStepSeconds);
		this.outcome = this.judge();
	}

	private judge(): FightOutcome | null {
		if (Math.random() < this.snapChancePerStep) return 'rod_snapped';
		if (isLineSnapped(this.tension, this.band)) return 'snapped';
		if (isHookPulled(this.tension, this.band)) return 'hook_pulled';
		if (this.secondsRemaining > 0) return null;
		const hook = this.kit.hook.hook;
		const hasOpened = doesHookOpen(hook, Number(this.carp.weight_lb));
		return hasOpened ? 'hook_opened' : 'landed';
	}
}
