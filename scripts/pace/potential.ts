import type { RandomFraction } from '../../src/lib/domain/random';

export type Bloodline = 'common' | 'record';

export interface Frame {
	medianLb: number;
	spread: number;
}

export const Frames: Record<Bloodline, Frame> = {
	common: { medianLb: 28, spread: 0.28 },
	record: { medianLb: 44, spread: 0.22 }
};

export const StillGrowingFactor = 1.1;
const MostDraws = 50;

export function potentialFor(bloodline: Bloodline, weightLb: number, random: RandomFraction) {
	const frame = Frames[bloodline];
	const atLeast = weightLb * StillGrowingFactor;
	for (let draw = 0; draw < MostDraws; draw++) {
		const potential = frame.medianLb * Math.exp(frame.spread * standardNormal(random));
		if (potential >= atLeast) return potential;
	}
	return atLeast;
}

function standardNormal(random: RandomFraction) {
	const one = Math.max(Number.EPSILON, random());
	const other = random();
	return Math.sqrt(-2 * Math.log(one)) * Math.cos(2 * Math.PI * other);
}

export function shareAbove(bloodline: Bloodline, weightLb: number) {
	const frame = Frames[bloodline];
	const z = Math.log(weightLb / frame.medianLb) / frame.spread;
	return 1 - cumulativeNormal(z);
}

function cumulativeNormal(z: number) {
	const t = 1 / (1 + 0.2316419 * Math.abs(z));
	const polynomial = t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
	const tail = Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI) * polynomial;
	return z >= 0 ? 1 - tail : tail;
}
