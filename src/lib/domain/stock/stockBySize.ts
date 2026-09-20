import type { Carp } from '../types';

export type SizeBandName = 'singles' | 'doubles' | 'twenties' | 'thirties' | 'forties' | 'fifties';

export interface StockSizeBand {
	name: SizeBandName;
	label: string;
	fromLb: number;
}

export interface SizeCount {
	band: StockSizeBand;
	count: number;
	heaviestLb: number;
}

export const StockSizeBands: StockSizeBand[] = [
	{ name: 'singles', label: 'Singles', fromLb: 0 },
	{ name: 'doubles', label: 'Doubles', fromLb: 10 },
	{ name: 'twenties', label: 'Twenties', fromLb: 20 },
	{ name: 'thirties', label: 'Thirties', fromLb: 30 },
	{ name: 'forties', label: 'Forties', fromLb: 40 },
	{ name: 'fifties', label: 'Fifties and up', fromLb: 50 }
];

type Weighed = Pick<Carp, 'weight_lb'>;
type Shoaled = { count: number; average_weight_lb: number };
const NoShoals: Shoaled[] = [];

export function sizeBandOf(weightLb: number): StockSizeBand {
	const heavyEnough = StockSizeBands.filter((band) => weightLb >= band.fromLb);
	return heavyEnough[heavyEnough.length - 1] ?? StockSizeBands[0];
}

export function stockBySize(carp: Weighed[], shoals: Shoaled[] = NoShoals): SizeCount[] {
	return StockSizeBands.map((band) => countIn(band, carp, shoals));
}

function countIn(band: StockSizeBand, carp: Weighed[], shoals: Shoaled[]): SizeCount {
	const inBand = carp.filter((fish) => sizeBandOf(Number(fish.weight_lb)) === band);
	const shoaled = shoals.filter((shoal) => sizeBandOf(Number(shoal.average_weight_lb)) === band);
	const heaviestLb = inBand.reduce((heaviest, fish) => Math.max(heaviest, Number(fish.weight_lb)), 0);
	const shoalCount = shoaled.reduce((total, shoal) => total + shoal.count, 0);
	return { band, count: inBand.length + shoalCount, heaviestLb };
}

export function isBandOf(fish: Weighed, name: SizeBandName) {
	return sizeBandOf(Number(fish.weight_lb)).name === name;
}
