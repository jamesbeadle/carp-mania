import assert from 'node:assert/strict';
import { defaultBookFor } from '../src/lib/domain/fishing/ticketBook';
import { noRecordsYet } from '../src/lib/domain/market/records';
import { seededRandom } from '../src/lib/domain/random';
import { FisheryClock } from '../src/lib/domain/simulation/elapsedDays';
import { simulateOneDay, type DayContext } from '../src/lib/domain/simulation/simulateOneDay';
import { classicCarp, classicLake, classicSwims } from '../src/lib/domain/sites/classicSite';
import type { Shoal } from '../src/lib/domain/stock/shoals';
import { fishInTheWater, fishShortOfOpening, isStockedToOpen, OpenWater, restockingWords, stockToOpenWords } from '../src/lib/domain/stock/stockedToOpen';
import type { Carp, Lake, Swim } from '../src/lib/domain/types';
import { seasonFor } from '../src/lib/domain/world/seasons';

const Start = new Date('2026-06-01T00:00:00Z');
const ThinStock = 6;

function shoalOf(count: number, transitUntil: string | null): Shoal {
	return { id: `shoal-${count}`, lake_id: 'lake-thin', size_band: 'singles', count, average_weight_lb: 5, weight_spread_lb: 1, age_years: 2, condition: 80, origin: 'farm', farm_pack_id: null, transit_until: transitUntil, quarantine_until: null };
}

function contextFor(lake: Lake): DayContext {
	const dayEnd = new Date(Start.getTime() + FisheryClock.RealMillisecondsPerFisheryDay);
	const book = defaultBookFor(lake.id, Number(lake.day_ticket_fee)).map((product, index) => ({ ...product, id: `ticket-${index}` }));
	return { dayStart: Start, dayEnd, season: seasonFor(lake, Start), records: noRecordsYet(), works: [], book, bailiffs: [], species: [], swimCount: 7, pegsBooked: 0 };
}

export function runStockedToOpenScenarios() {
	const random = seededRandom(310);
	const lake: Lake = { id: 'lake-thin', ...classicLake('owner-thin', 'Thin Water', Start) };
	const allCarp: Carp[] = classicCarp(lake.id, random).map((fish, index) => ({ ...fish, id: `carp-${index}` }));
	const swims: Swim[] = classicSwims(lake.id).map((swim, index) => ({ ...swim, id: `swim-${index}` }));
	const thin = allCarp.slice(0, ThinStock);
	const onTheLorry = [shoalOf(200, '2026-06-03T00:00:00Z')];

	assert.equal(fishInTheWater(thin, []), ThinStock, 'named carp count');
	assert.equal(fishInTheWater(thin, [shoalOf(94, null)]), OpenWater.FewestFish, 'shoal heads count with them');
	assert.equal(fishInTheWater(thin, onTheLorry), ThinStock, 'fish on the lorry are not in the water yet');
	assert.ok(!isStockedToOpen(ThinStock), 'six fish do not open a water');
	assert.ok(isStockedToOpen(OpenWater.FewestFish), 'a hundred do');
	assert.equal(fishShortOfOpening(ThinStock), OpenWater.FewestFish - ThinStock, 'the shortfall is named');
	assert.ok(restockingWords(ThinStock).includes('94 more fish'), 'and said in words');
	assert.ok(stockToOpenWords(ThinStock).includes(`of the ${OpenWater.FewestFish}`), 'the setup says how far there is to go');

	const closedDay = simulateOneDay(lake, thin, swims, random, contextFor(lake));
	assert.equal(closedDay.visits.length, 0, 'nobody fishes a water closed for restocking');
	assert.equal(closedDay.turnedAway, 0, 'and nobody is turned away from it');
	const openDay = simulateOneDay(lake, allCarp, swims, random, contextFor(lake));
	assert.ok(openDay.visits.length > 0, 'a stocked water takes anglers');
	console.log('stocked to open:', { thin: ThinStock, short: fishShortOfOpening(ThinStock), closedDayVisits: closedDay.visits.length, openDayVisits: openDay.visits.length });
}
