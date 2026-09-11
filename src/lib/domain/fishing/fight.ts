import { LineBreakingStrainLb, type LineThickness } from '../tackle/lines';

export const TensionBand = { SlackBelow: 0.2, SnapAbove: 0.84, Ideal: 0.5 } as const;
export const FightDurationSeconds = { Minimum: 8, PerPound: 0.4 } as const;

const ReelPullPerSecond = 0.3;
const SlackDropPerSecond = 0.2;
const PullStrength = { Floor: 0.22, PerBreakingStrainRatio: 0.3, Ceiling: 0.7 } as const;

export function fightSecondsFor(weightPounds: number) {
	return FightDurationSeconds.Minimum + weightPounds * FightDurationSeconds.PerPound;
}

export function carpPullStrength(weightPounds: number, lineThickness: LineThickness) {
	const breakingStrain = LineBreakingStrainLb[lineThickness];
	return Math.min(PullStrength.Ceiling, PullStrength.Floor + (weightPounds / breakingStrain) * PullStrength.PerBreakingStrainRatio);
}

export function isLineSnapped(tension: number) {
	return tension > TensionBand.SnapAbove;
}

export function isHookPulled(tension: number) {
	return tension < TensionBand.SlackBelow;
}

export function isFishRunning(surge: number) {
	return surge > 0.7;
}

export function nextTension(tension: number, isReeling: boolean, pullStrength: number, secondsElapsed: number, surge: number) {
	const anglerPull = isReeling ? ReelPullPerSecond : -SlackDropPerSecond;
	const fishPull = (surge - 0.5) * pullStrength;
	return clampTension(tension + (anglerPull + fishPull) * secondsElapsed);
}

function clampTension(value: number) {
	return Math.min(1, Math.max(0, value));
}
