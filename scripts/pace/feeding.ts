import type { Lake } from './lake';
import type { Archetype } from './roster';
import { Feeds, Money } from './shelf';
import { feedKilogramsPerDay, type Purse } from './shopping';

export interface Feeder extends Purse {
	archetype: Archetype;
	lake: Lake;
}

export function keepFed(owner: Feeder, reserve: number) {
	const lake = owner.lake;
	const wanted = feedKilogramsPerDay(lake) * Money.FeedDaysBought - lake.feedKilograms;
	if (wanted <= 0) return;
	const feed = feedAffordedBy(owner, wanted, reserve);
	const kilograms = Math.min(wanted, Math.floor(owner.money / feed.pricePerKilogram));
	if (kilograms <= 0) return;
	owner.money -= kilograms * feed.pricePerKilogram;
	lake.feedKilograms += kilograms;
	lake.feedProtein = feed.protein;
}

function feedAffordedBy(owner: Feeder, kilograms: number, reserve: number) {
	const preferred = Feeds[owner.archetype.feed];
	const isWithinMeans = owner.money - kilograms * preferred.pricePerKilogram >= reserve;
	return isWithinMeans ? preferred : Feeds.hemp;
}
