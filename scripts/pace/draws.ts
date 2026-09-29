import type { RandomFraction } from '../../src/lib/domain/random';

export function poisson(mean: number, random: RandomFraction) {
	const limit = Math.exp(-mean);
	let count = 0;
	let product = random();
	while (product > limit) {
		count += 1;
		product *= random();
	}
	return count;
}

export function clampShare(value: number) {
	return Math.min(1, Math.max(0, value));
}

export function median(values: number[]) {
	if (values.length === 0) return Number.NaN;
	const sorted = [...values].sort((one, other) => one - other);
	const middle = Math.floor(sorted.length / 2);
	const isEven = sorted.length % 2 === 0;
	return isEven ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}
