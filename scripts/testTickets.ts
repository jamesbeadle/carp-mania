import assert from 'node:assert/strict';
import { magicHourShare, magicHourSizeFactor } from '../src/lib/domain/fishing/magicHours';
import { whyTheOwnerRefusesRod } from '../src/lib/domain/fishing/ownersRules';
import { timeOfDayBiteFactor } from '../src/lib/domain/fishing/sessionClock';
import { hourOfDay, hoursInWindow, isWindowOver, sessionWindowFor } from '../src/lib/domain/fishing/sessionWindow';
import { defaultBookFor, hoursOf, pricePerTwelveHours, ticketCostOf, type TicketProduct } from '../src/lib/domain/fishing/ticketBook';
import { conditionsShareFor, weatherSizeShift } from '../src/lib/domain/fishing/weatherConditions';
import { seededRandom } from '../src/lib/domain/random';
import { anglersArrivingToday } from '../src/lib/domain/simulation/anglerDemand';
import { affordabilityOf, chooseTicket, willingnessToPayFor } from '../src/lib/domain/simulation/ticketChoice';
import { classicLake } from '../src/lib/domain/sites/classicSite';
import { defaultRodSetup } from '../src/lib/domain/tackle/rodSetup';
import type { Lake } from '../src/lib/domain/types';
import type { Weather } from '../src/lib/domain/world/weather';
import { runMagicHourSweep } from './testMagicHours';

const Rolls = 400;

function product(kind: TicketProduct['kind'], price: number, days = 1): TicketProduct {
	return { id: `${kind}-${price}`, lake_id: 'lake-1', kind, days, price, is_on_sale: true };
}

function windowsScenario() {
	const night = sessionWindowFor('night');
	assert.deepEqual(night, { fromHour: 19, toHour: 31 }, 'a night ticket runs 19:00 to 07:00');
	assert.equal(hoursInWindow(sessionWindowFor('day')), 12);
	assert.equal(hoursInWindow(sessionWindowFor('twenty_four_hours')), 24);
	assert.equal(hourOfDay(25), 1, 'hours past 24 are the next morning');
	assert.ok(isWindowOver(31, night) && !isWindowOver(30.9, night));
	assert.equal(timeOfDayBiteFactor(26), timeOfDayBiteFactor(2), 'the bite factor reads the clock hour');
}

function magicHoursScenario() {
	assert.equal(magicHourSizeFactor(6), 2.2, 'first light');
	assert.equal(magicHourSizeFactor(14), 0.6, 'the afternoon');
	assert.equal(magicHourSizeFactor(20), 2, 'into the dark');
	assert.equal(magicHourSizeFactor(27), 1.5, 'the small hours, read past midnight');
	assert.equal(magicHourShare(14), 0, 'the afternoon is the floor');
	assert.equal(magicHourShare(6), 1, 'first light is the ceiling');
}

function weatherScenario() {
	const base: Weather = { kind: 'overcast', cloudCover: 0.8, windStrength: 0.5, glass: 'falling', windDirection: 'south_west' };
	assert.equal(weatherSizeShift(base), 0.15, 'overcast, a falling glass and a warm south-westerly');
	assert.equal(weatherSizeShift({ ...base, kind: 'rain' }), 0.05, 'rain');
	assert.equal(weatherSizeShift({ ...base, kind: 'clear', glass: 'steady' }), 0, 'clear and steady');
	assert.equal(weatherSizeShift({ ...base, kind: 'clear', glass: 'rising', windStrength: 0.1 }), -0.15, 'bright, flat, calm and high');
	assert.equal(weatherSizeShift({ ...base, kind: 'heat' }), -0.2, 'a heatwave on the bottom');
	assert.equal(weatherSizeShift({ ...base, kind: 'heat' }, true), 0.2, 'a heatwave on a zig');
	assert.equal(conditionsShareFor(6, base), 1, 'the share is clamped at one');
	assert.equal(conditionsShareFor(14, { ...base, kind: 'clear', glass: 'rising', windStrength: 0.1 }), 0, 'and at nought');
}

function bookScenario() {
	const book = defaultBookFor('lake-1', 20);
	assert.equal(book[1].price, 50, 'a 24-hour ticket seeds at two and a half day tickets, to the nearest £5');
	assert.equal(hoursOf('night'), 12);
	assert.equal(ticketCostOf(product('multi_day', 40, 3)), 120, 'a multi-day ticket costs its days');
	assert.equal(pricePerTwelveHours(product('twenty_four_hours', 50)), 25, 'a £50 24-hour ticket is £25 a twelve hours');
	const willingness = willingnessToPayFor(50);
	assert.equal(affordabilityOf(product('day', willingness), willingness), 1, 'a day ticket at willingness sells');
	assert.ok(affordabilityOf(product('night', willingness), willingness) === 1, 'a night ticket at the day price is fine value');
	const dearNight = product('night', willingness * 2.5);
	const random = seededRandom(3);
	const chosen = Array.from({ length: Rolls }, () => chooseTicket([product('day', willingness), dearNight], willingness, random));
	assert.ok(chosen.every((ticket) => ticket?.kind === 'day'), 'nobody buys a night ticket at two and a half times what they will pay');
	const fairNight = product('night', willingness);
	const mixed = Array.from({ length: Rolls }, () => chooseTicket([product('day', willingness), fairNight], willingness, random));
	assert.ok(mixed.some((ticket) => ticket?.kind === 'night'), 'a fairly priced night ticket sells');
}

function demandScenario() {
	const lake: Lake = { id: 'lake-1', ...classicLake('owner-1', 'Demand Water', new Date('2026-01-01T00:00:00Z')) };
	const willingness = willingnessToPayFor(Number(lake.reputation), lake.region);
	const fair = anglersArrivingToday(lake, undefined, [product('day', willingness)]);
	const dear = anglersArrivingToday(lake, undefined, [product('day', willingness * 4)]);
	assert.ok(dear < fair, `a dear book turns anglers away (${dear} against ${fair})`);
	assert.equal(anglersArrivingToday(lake, undefined, []), anglersArrivingToday(lake), 'with no book the day ticket fee decides');
}

function ownersRuleScenario() {
	const barbed = { ...defaultRodSetup(), hook: 'bankside_basics-hook-4-barbed-matt' };
	assert.ok(whyTheOwnerRefusesRod({ is_barbed_banned: true }, barbed), 'a barbed hook is refused where it is banned');
	assert.equal(whyTheOwnerRefusesRod({ is_barbed_banned: false }, barbed), null);
	assert.equal(whyTheOwnerRefusesRod({ is_barbed_banned: true }, defaultRodSetup()), null, 'the starter micro-barb is allowed');
}

export function runTicketScenarios() {
	windowsScenario();
	magicHoursScenario();
	weatherScenario();
	bookScenario();
	demandScenario();
	ownersRuleScenario();
	runMagicHourSweep();
}
