import { FacilityEffects } from '../economy';
import type { TicketProduct } from '../fishing/ticketBook';
import { anglersPerDayFor } from '../reputation';
import type { Lake } from '../types';
import { RegionCatalogue } from '../world/regions';
import type { Season } from '../world/seasons';
import { bookAffordability, willingnessToPayFor } from './ticketChoice';

const NoBook: TicketProduct[] = [];
const MinimumAffordability = 0.2;

export function anglersArrivingToday(lake: Lake, season: Pick<Season, 'anglerFactor'> = { anglerFactor: 1 }, book: TicketProduct[] = NoBook) {
	const wanting = anglersPerDayFor(Number(lake.reputation)) * RegionCatalogue[lake.region].anglerPoolFactor * season.anglerFactor;
	const carPark = lake.layout.facilities.includes('car_park') ? FacilityEffects.CarParkAnglerFactor : 1;
	const disturbed = 1 - Number(lake.disturbance) / 100;
	const affordability = affordabilityAt(lake, book);
	return Math.max(0, Math.round(wanting * carPark * disturbed * Math.max(MinimumAffordability, affordability)));
}

export function affordabilityAt(lake: Lake, book: TicketProduct[]) {
	const willingness = willingnessToPayFor(Number(lake.reputation), lake.region);
	if (book.length === 0) return Math.min(1, willingness / Math.max(1, Number(lake.day_ticket_fee)));
	return bookAffordability(book, willingness);
}

