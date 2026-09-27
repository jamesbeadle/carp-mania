import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import { swimPoint } from '$lib/domain/layout/swimRules';
import type { Swim } from '$lib/domain/types';
import { fractionOf, MetresPerFoot, type WorldPoint } from '../lakeFrame';
import type { LakeScene } from './lakeScene';
import { aimedLanding, aimFromPull, isWorthCasting, powerAfterHolding, type Aim } from './castAim';
import { castProblemOf, type CastProblem } from './castLanding';

export interface CastRequest {
	landing: WorldPoint;
	problem: CastProblem;
}

const NoAim: Aim = { power: 0, turn: 0 };
const AimStepRadians = 0.06;
const FeetPerYard = 3;

export class CastControl {
	isAiming = $state(false);
	aim = $state<Aim>(NoAim);
	reachFeet = $state(0);
	problem = $state<CastProblem>(null);
	private start = { x: 0, y: 0 };
	private holdSeconds = 0;

	constructor(private readonly scene: () => LakeScene | null, private readonly layout: LakeLayout, private readonly swim: () => Swim | null) {}

	get yardsOut() {
		return Math.round((this.aim.power * this.reachFeet) / FeetPerYard);
	}

	get yardsReach() {
		return Math.round(this.reachFeet / FeetPerYard);
	}

	begin(clientX: number, clientY: number, reachFeet: number) {
		this.isAiming = true;
		this.reachFeet = reachFeet;
		this.start = { x: clientX, y: clientY };
		this.setAim(NoAim);
	}

	pull(clientX: number, clientY: number, width: number, height: number) {
		if (!this.isAiming) return;
		this.setAim(aimFromPull(this.start.x - clientX, clientY - this.start.y, width, height));
	}

	holdPower(secondsElapsed: number, reachFeet: number) {
		if (!this.isAiming) this.begin(0, 0, reachFeet);
		this.holdSeconds += secondsElapsed;
		this.setAim({ ...this.aim, power: powerAfterHolding(this.holdSeconds) });
	}

	turnBy(steps: number) {
		this.setAim({ ...this.aim, turn: this.aim.turn - steps * AimStepRadians });
	}

	release(): CastRequest | null {
		const landing = this.landing();
		const isCast = this.isAiming && isWorthCasting(this.aim) && landing !== null;
		this.cancel();
		return isCast && landing ? { landing, problem: this.problemAt(landing) } : null;
	}

	cancel() {
		this.isAiming = false;
		this.holdSeconds = 0;
		this.scene()?.aimMarker.show(null, true);
	}

	private setAim(aim: Aim) {
		this.aim = aim;
		const landing = this.landing();
		this.problem = landing ? this.problemAt(landing) : null;
		this.scene()?.aimMarker.show(isWorthCasting(aim) ? landing : null, this.problem === null);
	}

	private landing() {
		const spot = this.scene()?.spot;
		if (!spot) return null;
		return aimedLanding(spot.peg, spot.heading + this.lookTurn(), this.aim, this.reachFeet * MetresPerFoot);
	}

	private lookTurn() {
		return this.scene()?.lookTurn ?? 0;
	}

	private problemAt(landing: WorldPoint) {
		const scene = this.scene();
		const swim = this.swim();
		if (!scene || !swim) return null;
		return castProblemOf(this.layout, swimPoint(swim), fractionOf(scene.lakeFrame, landing));
	}
}
