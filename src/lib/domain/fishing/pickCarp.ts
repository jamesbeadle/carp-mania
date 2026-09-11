import type { Carp } from '../types';

const WarinessPerPoundAboveTwenty = 0.03;

export function pickCarpThatTookTheBait(carpInLake: Carp[], randomFraction: number): Carp | null {
	if (carpInLake.length === 0) return null;
	const weights = carpInLake.map(takeLikelihood);
	const totalWeight = weights.reduce((total, weight) => total + weight, 0);
	let remaining = randomFraction * totalWeight;
	for (let index = 0; index < carpInLake.length; index++) {
		remaining -= weights[index];
		if (remaining <= 0) return carpInLake[index];
	}
	return carpInLake[carpInLake.length - 1];
}

function takeLikelihood(carp: Carp) {
	const wariness = Math.max(0, carp.weight_lb - 20) * WarinessPerPoundAboveTwenty;
	const appetite = 0.5 + carp.condition / 200;
	return Math.max(0.05, appetite - wariness);
}
