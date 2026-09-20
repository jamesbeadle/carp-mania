import { LineBreakingStrainLb, type LineThickness } from '../tackle/lines';

export const TensionBand = { SlackBelow: 0.2, SnapAbove: 0.84, Ideal: 0.5 } as const;
export const FightDurationSeconds = { Minimum: 8, PerPound: 0.4 } as const;
export const CraftBandWidening = 0.03;
export const TensionInertia = 0.15;
export const RunWarningSeconds = 0.4;
export const FightStepSeconds = 0.05;

const ReelPullPerSecond = 0.3;
const SlackDropPerSecond = 0.2;
const PullStrength = { Floor: 0.22, PerBreakingStrainRatio: 0.3, Ceiling: 0.7 } as const;
const RunsAboveSurge = 0.7;

export interface Band {
	slackBelow: number;
	snapAbove: number;
}

export function fightSecondsFor(weightPounds: number) {
	return FightDurationSeconds.Minimum + weightPounds * FightDurationSeconds.PerPound;
}

export function carpPullStrength(weightPounds: number, lineThickness: LineThickness) {
	const breakingStrain = LineBreakingStrainLb[lineThickness];
	const strength = PullStrength.Floor + (weightPounds / breakingStrain) * PullStrength.PerBreakingStrainRatio;
	return Math.min(PullStrength.Ceiling, strength);
}

export function tensionBandFor(rating: number): Band {
	const widening = CraftBandWidening * Math.min(1, Math.max(0, rating / 100));
	return { slackBelow: TensionBand.SlackBelow - widening, snapAbove: TensionBand.SnapAbove + widening };
}

export function isLineSnapped(tension: number, band: Band) {
	return tension > band.snapAbove;
}

export function isHookPulled(tension: number, band: Band) {
	return tension < band.slackBelow;
}

export function isFishRunning(surge: number) {
	return surge > RunsAboveSurge;
}

export function tensionChangePerSecond(isReeling: boolean, pullStrength: number, surge: number) {
	const anglerPull = isReeling ? ReelPullPerSecond : -SlackDropPerSecond;
	const fishPull = (surge - 0.5) * pullStrength;
	return anglerPull + fishPull;
}

export function easedChange(previousChange: number, change: number) {
	return previousChange * TensionInertia + change * (1 - TensionInertia);
}

export function nextTension(tension: number, changePerSecond: number, secondsElapsed: number) {
	return clampTension(tension + changePerSecond * secondsElapsed);
}

function clampTension(value: number) {
	return Math.min(1, Math.max(0, value));
}
