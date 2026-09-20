import assert from 'node:assert/strict';
import { defaultBookFor } from '../src/lib/domain/fishing/ticketBook';
import { takerThatTookTheBait } from '../src/lib/domain/fishing/takers';
import { noSpotBonus } from '../src/lib/domain/fishing/takeWeight';
import { noRecordsYet } from '../src/lib/domain/market/records';
import { seededRandom } from '../src/lib/domain/random';
import { FisheryClock } from '../src/lib/domain/simulation/elapsedDays';
import { simulateOneDay, type DayContext } from '../src/lib/domain/simulation/simulateOneDay';
import { classicCarp, classicLake, classicSwims } from '../src/lib/domain/sites/classicSite';
import { drawFishFromShoal } from '../src/lib/domain/stock/individualise';
import { headCountOf, type Shoal } from '../src/lib/domain/stock/shoals';
import { packAndSizesScenario } from './testShoalPacks';
import type { Carp, Lake, Swim } from '../src/lib/domain/types';
import { seasonFor } from '../src/lib/domain/world/seasons';
import { rowsThatWouldBeWritten } from '../src/lib/server/commands/persistStock';

const start = new Date('2026-06-01T00:00:00Z');
const ThirtyDays = 30;
const BigShoal = 5000;
const NamedFish = 200;
const FewestRowsForABigWater = 300;
const TwoSeconds = 2000;
const Rolls = 2000;

const ShoalShape = { size_band: 'singles', weight_spread_lb: 1, age_years: 2, condition: 80, origin: 'farm', farm_pack_id: null, transit_until: null, quarantine_until: null } as const;

function shoalOf(lakeId: string, count: number, averageLb: number): Shoal {
	return { ...ShoalShape, id: `shoal-${averageLb}`, lake_id: lakeId, count, average_weight_lb: averageLb };
}

function contextFor(lake: Lake, dayIndex: number): DayContext {
	const dayStart = new Date(start.getTime() + dayIndex * FisheryClock.RealMillisecondsPerFisheryDay);
	const dayEnd = new Date(dayStart.getTime() + FisheryClock.RealMillisecondsPerFisheryDay);
	const book = defaultBookFor(lake.id, 20).map((product, index) => ({ ...product, id: `ticket-${index}` }));
	return { dayStart, dayEnd, season: seasonFor(lake, dayStart), records: noRecordsYet(), works: [], bookings: [], book, bailiffs: [], species: [], swimCount: 7, pegsBooked: 0, hasOpenBounty: false };
}

function bigWaterScenario() {
	const random = seededRandom(11);
	const unfed = classicLake('owner-1', 'Big Water', start);
	const lake: Lake = { id: 'lake-big', ...unfed, acres: 200, feed_stock: { ...unfed.feed_stock, fishmeal_boilies: 5000 } };
	const carp: Carp[] = Array.from({ length: NamedFish }, (_, index) => ({ ...classicCarp(lake.id, random)[0], id: `named-${index}`, weight_lb: 12 + (index % 9) }));
	const swims: Swim[] = classicSwims(lake.id).map((swim, index) => ({ ...swim, id: `swim-${index}` }));
	const shoals = [shoalOf(lake.id, BigShoal, 5)];
	const before = { carp: carp.map((fish) => ({ ...fish })), shoals: shoals.map((shoal) => ({ ...shoal })) };
	const began = Date.now();
	let stateLake = lake;
	let stateCarp = carp;
	let stateShoals = shoals;
	for (let day = 0; day < ThirtyDays; day++) {
		const outcome = simulateOneDay(stateLake, stateCarp, swims, random, contextFor(stateLake, day), stateShoals);
		stateLake = outcome.lake;
		stateCarp = outcome.carp;
		stateShoals = [...outcome.shoals, ...outcome.fryShoals.map((fry, index) => ({ ...fry, id: `fry-${day}-${index}` }))];
	}
	const elapsed = Date.now() - began;
	assert.ok(elapsed < TwoSeconds, `thirty days on a big water take ${elapsed} ms`);
	assert.ok(headCountOf(stateShoals) > BigShoal * 0.9, 'the shoal is still there');
	const rows = rowsThatWouldBeWritten(before, { carp: stateCarp, shoals: stateShoals });
	assert.ok(rows < FewestRowsForABigWater, `thirty days on 200 named fish and a 5,000-fish shoal write ${rows} rows`);
	assert.ok(stateShoals[0].average_weight_lb > shoals[0].average_weight_lb, 'a fed shoal grows');
	console.log('shoals:', { milliseconds: elapsed, rows, shoalAverage: stateShoals[0].average_weight_lb });
}

function takeScenario() {
	const lake: Lake = { id: 'lake-take', ...classicLake('owner-1', 'Take Water', start) };
	const named: Carp[] = classicCarp(lake.id, seededRandom(3)).slice(0, 10).map((fish, index) => ({ ...fish, id: `named-${index}` }));
	const shoal = shoalOf(lake.id, 1000, 12);
	const take = { sizeReach: 0.5, hour: 8, spotBonusFor: noSpotBonus };
	const random = seededRandom(5);
	let fromTheShoal = 0;
	for (let roll = 0; roll < Rolls; roll++) {
		const taker = takerThatTookTheBait(named, [shoal], take, random(), lake.region, named.length);
		if (taker?.kind === 'shoal') fromTheShoal += 1;
	}
	const share = fromTheShoal / Rolls;
	assert.ok(share > 0.9, `a thousand-fish shoal against ten named fish takes ${(share * 100).toFixed(0)}% of the bites`);
	const drawn = drawFishFromShoal(shoal, 0.5, 10, 'uk_ireland');
	assert.equal(drawn.weight_lb, 12, 'the middle roll draws the average');
	const hasAName = drawn.name.length > 0;
	assert.ok(drawn.is_catalogued && hasAName, 'a drawn fish has a name and is catalogued');
}

export function runShoalScenarios() {
	bigWaterScenario();
	takeScenario();
	packAndSizesScenario();
}
