import { headCountOf, type Shoal } from '../stock/shoals';
import type { Carp, Lake } from '../types';
import { feedingDayFor, feedOneFish } from './feedingDay';
import { growShoalsForOneDay } from './growShoals';

export function feedTheLakeForOneDay(lake: Lake, carp: Carp[], growthFactor: number, shoals: Shoal[] = []) {
	const fed = carp.filter(isFedToday);
	const fedShoals = shoals.filter(isFedToday);
	const mouths = fed.length + headCountOf(fedShoals);
	const { feeding, feedStock } = feedingDayFor(lake, carp, shoals, mouths, growthFactor);
	const fedCarp = carp.map((fish) => (isFedToday(fish) ? feedOneFish(fish, feeding) : fish));
	const grownShoals = growShoalsForOneDay(shoals, feeding);
	return { lake: { ...lake, feed_stock: feedStock }, carp: fedCarp, shoals: grownShoals };
}

export function isFedToday(carp: Pick<Carp, 'transit_until'>) {
	return carp.transit_until === null;
}
