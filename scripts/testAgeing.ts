import assert from 'node:assert/strict';
import { seededRandom } from '../src/lib/domain/random';
import { ageCarpIfNewYear, CarpLifespan, chanceOfDyingAt } from '../src/lib/domain/simulation/ageing';
import type { Carp } from '../src/lib/domain/types';

const Hour = 60 * 60 * 1000;

const adults: Carp[] = Array.from({ length: 12 }, (_, index) => ({ id: `adult-${index}`, lake_id: 'lake-a', name: `Adult ${index}`, strain: 'mirror', weight_lb: 15, age_years: 5, condition: 80, times_caught: 0, origin: 'wild', origin_lake_id: 'lake-a', fame: 0, is_catalogued: true, transit_until: null, quarantine_until: null }));

export function runAgeingScenarios() {
	const anyDay = new Date(Date.UTC(2026, 3, 10));
	const stillYoung = ageCarpIfNewYear(adults, anyDay, new Date(anyDay.getTime() + Hour), seededRandom(1));
	assert.equal(stillYoung.carp.length, adults.length, 'no fish dies of old age on an ordinary day');
	assert.equal(chanceOfDyingAt(CarpLifespan.SafeUntilYears - 1), 0, 'a fish under the safe age never dies of old age');
	assert.equal(chanceOfDyingAt(CarpLifespan.CertainAtYears), 1, 'a fish at the certain age always dies');
	assert.ok(chanceOfDyingAt(30) > chanceOfDyingAt(25), 'the chance rises with age');
	const newYear = yearBoundary();
	const ancients = adults.map((fish) => ({ ...fish, age_years: CarpLifespan.CertainAtYears }));
	const gone = ageCarpIfNewYear(ancients, newYear.dayStart, newYear.dayEnd, seededRandom(1));
	assert.equal(gone.diedOfOldAge.length, ancients.length, 'every ancient fish dies at the new year');
	assert.equal(gone.carp.length, 0, 'and none is left in the water');
	const middleAged = adults.map((fish) => ({ ...fish, age_years: 9 }));
	const survivors = ageCarpIfNewYear(middleAged, newYear.dayStart, newYear.dayEnd, seededRandom(1));
	assert.ok(survivors.carp.every((fish) => fish.age_years === 10) && survivors.diedOfOldAge.length === 0, 'young fish just get a year older');
	console.log('ageing:', { chanceAt30: chanceOfDyingAt(30) });
}

function yearBoundary() {
	const start = Date.UTC(2026, 0, 1);
	for (let day = 0; day < 400; day++) {
		const dayStart = new Date(start + day * Hour);
		const dayEnd = new Date(dayStart.getTime() + Hour);
		if (Math.floor(dayEnd.getTime() / Hour) % 365 < Math.floor(dayStart.getTime() / Hour) % 365) return { dayStart, dayEnd };
	}
	throw new Error('no fishery new year in 400 days');
}
