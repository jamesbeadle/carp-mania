import type { Carp } from '../types';
import { headCountOf, type Shoal } from './shoals';

export const HeadCount = { MaximumFishPerAcre: 200 } as const;

type Counted = Pick<Shoal, 'count'>;

export function headCapFor(waterAcres: number) {
	const perAcre = HeadCount.MaximumFishPerAcre;
	return Math.max(perAcre, Math.round(waterAcres * perAcre));
}

export function headCountIn(carp: Pick<Carp, 'id'>[], shoals: Counted[]) {
	return carp.length + headCountOf(shoals);
}

export function wouldBreakHeadCap(carp: Pick<Carp, 'id'>[], shoals: Counted[], waterAcres: number, incoming: number) {
	return headCountIn(carp, shoals) + incoming > headCapFor(waterAcres);
}
