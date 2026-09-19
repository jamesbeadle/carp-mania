import assert from 'node:assert/strict';
import { bailiffCapFor, feeCollectionOf, teamClearingShare, whyCannotHire } from '../src/lib/domain/bailiffs/bailiffTeam';
import { candidatesThisWeek } from '../src/lib/domain/bailiffs/candidates';
import { FacilityCatalogue, whyFacilityCannotBeBuilt } from '../src/lib/domain/groundworks/facilities';
import { driftWaterForOneDay } from '../src/lib/domain/simulation/driftWater';
import { classicLake } from '../src/lib/domain/sites/classicSite';
import type { Lake } from '../src/lib/domain/types';

const start = new Date('2026-01-01T00:00:00Z');

export function bailiffScenario() {
	assert.equal(bailiffCapFor(10), 1);
	assert.equal(bailiffCapFor(60), 4);
	assert.equal(bailiffCapFor(200), 14, 'fourteen bailiffs on two hundred acres');
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
	assert.equal(Object.keys(FacilityCatalogue).length, 8);
	assert.ok(whyFacilityCannotBeBuilt([], 'restaurant')?.includes('bar'), 'the restaurant needs the bar');
	assert.equal(whyFacilityCannotBeBuilt(['bar'], 'restaurant'), null);
	assert.ok(whyFacilityCannotBeBuilt(['bar'], 'bar') !== null, 'nothing is built twice');
}

