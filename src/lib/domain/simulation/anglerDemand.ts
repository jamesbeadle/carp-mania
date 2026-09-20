import { anglerFactorOf, payFactorOf } from '../groundworks/facilities';
import type { TicketProduct } from '../fishing/ticketBook';
import { anglersPerDayFor } from '../reputation';
import type { Lake } from '../types';
import { RegionCatalogue } from '../world/regions';
import type { Season } from '../world/seasons';
import { drawAnglerFactor, drawPayFactor } from '../water/stockDraw';
import { bookAffordability, willingnessToPayFor } from './ticketChoice';

const NoBook: TicketProduct[] = [];
const MinimumAffordability = 0.2;
const NoDraw = 0;

export function anglersArrivingToday(lake: Lake, season: Pick<Season, 'anglerFactor'> = { anglerFactor: 1 }, book: TicketProduct[] = NoBook, stockDraw = NoDraw) {
	const wanting = anglersPerDayFor(Number(lake.reputation)) * RegionCatalogue[lake.region].anglerPoolFactor * season.anglerFactor;
	const carPark = anglerFactorOf(lake.layout.facilities) * drawAnglerFactor(stockDraw);
	const disturbed = 1 - Number(lake.disturbance) / 100;
	const affordability = affordabilityAt(lake, book, stockDraw);
	return Math.max(0, Math.round(wanting * carPark * disturbed * Math.max(MinimumAffordability, affordability)));
}

export function willingnessAt(lake: Lake, stockDraw = NoDraw) {
	const willingness = willingnessToPayFor(Number(lake.reputation), lake.region);
	return willingness * payFactorOf(lake.layout.facilities) * drawPayFactor(stockDraw);
}

export function affordabilityAt(lake: Lake, book: TicketProduct[], stockDraw = NoDraw) {
	const willingness = willingnessAt(lake, stockDraw);
	const fee = Math.max(1, Number(lake.day_ticket_fee));
	if (book.length === 0) return Math.min(1, willingness / fee);
	return bookAffordability(book, willingness);
}

