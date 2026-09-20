import { FisheryYear, fisheryDayNumber } from '../world/worldClock';
import type { Lake } from '../types';

export interface SyndicatePlace {
	id: string;
	lake_id: string;
	angler_id: string;
	fishery_year: number;
	price: number;
}

type SyndicateWater = Pick<Lake, 'syndicate_places_for_sale' | 'syndicate_price'>;

export function fisheryYearNumber(now: Date) {
	return Math.floor(fisheryDayNumber(now) / FisheryYear.Days);
}

export function isSyndicateWater(lake: SyndicateWater) {
	return Number(lake.syndicate_price) > 0;
}

export function placesOnSale(lake: SyndicateWater) {
	return isSyndicateWater(lake) ? Number(lake.syndicate_places_for_sale) : 0;
}

export function isMemberThisYear(places: Pick<SyndicatePlace, 'angler_id' | 'fishery_year'>[], anglerId: string, now: Date) {
	const year = fisheryYearNumber(now);
	return places.some((place) => place.angler_id === anglerId && place.fishery_year === year);
}

export function syndicateWords(lake: SyndicateWater) {
	if (!isSyndicateWater(lake)) return 'Not a syndicate — day tickets on the book.';
	const left = placesOnSale(lake);
	return left > 0 ? `A syndicate water: ${left} ${left === 1 ? 'place' : 'places'} left this year. No day tickets.` : 'A syndicate water, full for the year. No day tickets.';
}
