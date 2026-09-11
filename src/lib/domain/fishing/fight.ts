import { LineBreakingStrainLb, type LineThickness } from '../tackle/lines';

export const TensionBand = { SlackBelow: 0.22, SnapAbove: 0.82, Ideal: 0.55 } as const;
export const FightDurationSeconds = { Minimum: 7, PerPound: 0.35 } as const;

export function fightSecondsFor(weightPounds: number) {
	return FightDurationSeconds.Minimum + weightPounds * FightDurationSeconds.PerPound;
}

export function carpPullStrength(weightPounds: number, lineThickness: LineThickness) {
	const breakingStrain = LineBreakingStrainLb[lineThickness];
	return Math.min(1.6, 0.4 + (weightPounds / breakingStrain) * 0.5);
}

export function isLineSnapped(tension: number) {
	return tension > TensionBand.SnapAbove;
}

export function isHookPulled(tension: number) {
	return tension < TensionBand.SlackBelow;
}

export function nextTension(tension: number, isReeling: boolean, pullStrength: number, secondsElapsed: number, surge: number) {
	const reelPull = isReeling ? 0.9 : -0.55;
	const fishPull = (surge - 0.5) * pullStrength;
	return clampTension(tension + (reelPull + fishPull) * secondsElapsed);
}

function clampTension(value: number) {
	return Math.min(1, Math.max(0, value));
}
