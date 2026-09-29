import type { RandomFraction } from '$lib/domain/random';

export function centredRandom(random: RandomFraction) {
	return random() - 1 / 2;
}
