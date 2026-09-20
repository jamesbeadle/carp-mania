import type { Carp } from '../types';
import { representativeOf, type Shoal } from './shoals';

export const ShoalSample = { MostDrawnPerShoal: 12, FishPerDrawnOne: 10 } as const;

export function sampleOfShoals(shoals: Shoal[]): Carp[] {
	return shoals.flatMap(sampleOfOneShoal);
}

function sampleOfOneShoal(shoal: Shoal): Carp[] {
	const oneForEvery = Math.ceil(shoal.count / ShoalSample.FishPerDrawnOne);
	const drawn = Math.min(ShoalSample.MostDrawnPerShoal, oneForEvery);
	const representative = representativeOf(shoal);
	return Array.from({ length: drawn }, (_, index) => ({ ...representative, id: `${shoal.id}-${index}` }));
}
