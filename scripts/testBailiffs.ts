import assert from 'node:assert/strict';
import type { TicketProduct } from '../src/lib/domain/fishing/ticketBook';
import { chooseTicket } from '../src/lib/domain/simulation/ticketChoice';
import { seededRandom } from '../src/lib/domain/random';
import { acresUntilAnotherBailiff, bailiffCapFor, feeCollectionOf, teamClearingShare, teamRoomWords, whyCannotHire } from '../src/lib/domain/bailiffs/bailiffTeam';
import { candidatesThisWeek } from '../src/lib/domain/bailiffs/candidates';
import { FacilityCatalogue, whyFacilityCannotBeBuilt, builtAfter, upgradeOf, multiDayFactorOf } from '../src/lib/domain/groundworks/facilities';
import { driftWaterForOneDay } from '../src/lib/domain/simulation/driftWater';
import { classicLake } from '../src/lib/domain/sites/classicSite';
import type { Lake } from '../src/lib/domain/types';

const start = new Date('2026-01-01T00:00:00Z');

export function bailiffScenario() {
	assert.equal(bailiffCapFor(10), 1);
	assert.equal(bailiffCapFor(60), 4);
	assert.equal(bailiffCapFor(200), 14, 'fourteen bailiffs on two hundred acres');
	assert.equal(acresUntilAnotherBailiff(10), 5, 'ten acres is five short of a second bailiff');
	assert.ok(teamRoomWords([{ id: 'a' }], 10).includes('Another 5 acres'), 'a full team says how much water would make room');
	assert.ok(teamRoomWords([], 10).includes('1 more can be hired'), 'an empty team says how many can be hired');
	const good = { performance: 80 };
	assert.ok(teamClearingShare([good, good], 60) > teamClearingShare([good], 60), 'two bailiffs on sixty acres clear more than one');
	assert.ok(teamClearingShare([good], 60) > teamClearingShare([good], 200), 'and one on two hundred acres clears less still');
	assert.equal(feeCollectionOf([]), 0.55, 'with nobody on the bank fees are the floor');
	assert.ok(feeCollectionOf([{ performance: 100 }]) === 1 && feeCollectionOf([{ performance: 50 }]) < 1, 'collection follows the team');
	assert.ok(whyCannotHire([{ id: 'a' }], 10) !== null && whyCannotHire([{ id: 'a' }], 60) === null, 'the cap holds');
	const candidates = candidatesThisWeek('lake-1', start);
	assert.equal(candidates.length, 3);
	assert.deepEqual(candidatesThisWeek('lake-1', start), candidates, 'the week\'s candidates are seeded');
	const sixty: Lake = { id: 'lake-sixty', ...classicLake('owner-1', 'Sixty', start), acres: 60, silt: 40 };
	const oneBailiff = driftWaterForOneDay(sixty, [good]);
	const twoBailiffs = driftWaterForOneDay(sixty, [good, good]);
	assert.ok(twoBailiffs.silt < oneBailiff.silt, 'a two-bailiff team on 60 acres silts up slower than one');
}

export function facilitiesScenario() {
	assert.equal(Object.keys(FacilityCatalogue).length, 11);
	assert.ok(whyFacilityCannotBeBuilt([], 'restaurant')?.includes('bar'), 'the restaurant needs the bar');
	assert.equal(whyFacilityCannotBeBuilt(['bar'], 'restaurant'), null);
	assert.ok(whyFacilityCannotBeBuilt(['bar'], 'bar') !== null, 'nothing is built twice');
	comfortLadderScenario();
}

function comfortLadderScenario() {
	assert.ok(whyFacilityCannotBeBuilt([], 'washrooms')?.includes('toilets'), 'the washrooms need the toilets');
	assert.equal(whyFacilityCannotBeBuilt(['toilets'], 'washrooms'), null);
	assert.ok(whyFacilityCannotBeBuilt(['toilets'], 'estate_house')?.includes('club house'), 'the estate house needs the club house');
	assert.deepEqual(builtAfter(['car_park', 'toilets'], 'washrooms'), ['car_park', 'washrooms'], 'the washrooms replace the toilets');
	assert.deepEqual(builtAfter(['bar'], 'restaurant'), ['bar', 'restaurant'], 'the restaurant sits beside the bar');
	assert.ok(whyFacilityCannotBeBuilt(['club_house'], 'toilets')?.includes('club house'), 'no going back down the ladder');
	assert.equal(upgradeOf(['estate_house'], 'washrooms'), 'estate_house');
	assert.ok(multiDayFactorOf(['estate_house']) > multiDayFactorOf(['club_house']), 'each rung fills the long sits more');
	stayingOnScenario();
}

function stayingOnScenario() {
	const ticket = (kind: TicketProduct['kind']): TicketProduct => ({ id: kind, lake_id: 'lake-1', kind, days: 1, price: 20, is_on_sale: true });
	const book = [ticket('day'), ticket('twenty_four_hours')];
	const stayersWith = (factor: number) => {
		const random = seededRandom(11);
		return Array.from({ length: 400 }, () => chooseTicket(book, 40, random, factor)).filter((chosen) => chosen?.kind === 'twenty_four_hours').length;
	};
	assert.ok(stayersWith(multiDayFactorOf(['estate_house'])) > stayersWith(1), 'an estate house sells more 24-hour sits than a bare bank');
}

