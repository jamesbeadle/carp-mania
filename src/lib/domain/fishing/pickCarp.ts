import type { Carp } from '../types';

export function pickCarpByWeight(carpInLake: Carp[], weights: number[], randomFraction: number): Carp | null {
	if (carpInLake.length === 0) return null;
	const totalWeight = weights.reduce((total, weight) => total + weight, 0);
	let remaining = randomFraction * totalWeight;
	for (let index = 0; index < carpInLake.length; index++) {
		remaining -= weights[index];
		if (remaining <= 0) return carpInLake[index];
	}
	return carpInLake[carpInLake.length - 1];
}
