import type { Carp } from '../types';
import { headCountOf, type Shoal } from './shoals';

export const OpenWater = { FewestFish: 100 } as const;

type FishArrived = Pick<Carp, 'transit_until'>;
type ShoalArrived = Pick<Shoal, 'count' | 'transit_until'>;

export function fishInTheWater(carp: FishArrived[], shoals: ShoalArrived[]) {
	const arrivedCarp = carp.filter(hasArrived);
	const arrivedShoals = shoals.filter(hasArrived);
	return arrivedCarp.length + headCountOf(arrivedShoals);
}

export function fishShortOfOpening(fishCount: number) {
	return Math.max(0, OpenWater.FewestFish - fishCount);
}

export function isStockedToOpen(fishCount: number) {
	return fishCount >= OpenWater.FewestFish;
}

export const ClosedForRestocking = 'Closed for restocking';

export function restockingWords(fishCount: number) {
	const short = fishShortOfOpening(fishCount);
	return `${ClosedForRestocking} — ${short} more ${short === 1 ? 'fish is' : 'fish are'} needed before anyone fishes here`;
}

export function stockToOpenWords(fishCount: number) {
	if (isStockedToOpen(fishCount)) return `${fishCount} fish — enough to open`;
	return `${fishCount} of the ${OpenWater.FewestFish} fish a water needs to open`;
}

function hasArrived(fish: { transit_until: string | null }) {
	return fish.transit_until === null;
}
