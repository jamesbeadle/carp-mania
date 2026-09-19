import { representativeOf, withRepresentative, type Shoal } from '../stock/shoals';
import { feedOneFish, type FeedingDay } from './feedingDay';

export function growShoalsForOneDay(shoals: Shoal[], feeding: FeedingDay): Shoal[] {
	return shoals.map((shoal) => (shoal.transit_until === null ? growOneShoal(shoal, feeding) : shoal));
}

function growOneShoal(shoal: Shoal, feeding: FeedingDay): Shoal {
	if (shoal.count === 0) return shoal;
	const grown = feedOneFish(representativeOf(shoal), feeding);
	return withRepresentative(shoal, grown);
}
