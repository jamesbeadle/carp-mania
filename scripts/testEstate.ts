import assert from 'node:assert/strict';
import { nothingHappened } from '../src/lib/contracts/WhileYouWereAway';
import { currentWaterOf, Estate, whyCannotBuyAnotherWater } from '../src/lib/domain/estate/estateRules';
import { summariseEstate } from '../src/lib/domain/estate/summariseEstate';

export function runEstateScenarios() {
	const open = (name: string) => ({ id: name.toLowerCase(), name, is_setup_complete: true });
	assert.equal(whyCannotBuyAnotherWater([open('Willow Pool')]), null, 'one open water leaves room for another');
	assert.match(whyCannotBuyAnotherWater([open('Willow Pool'), { id: 'new', name: 'New Pit', is_setup_complete: false }]) ?? '', /Finish setting up New Pit/, 'an unfinished water must be finished first');
	const estate = Array.from({ length: Estate.MostWaters }, (_, index) => open(`Water ${index}`));
	assert.match(whyCannotBuyAnotherWater(estate) ?? '', /as far as it goes/, 'the estate has a ceiling');
	assert.equal(currentWaterOf(estate, 'water 3')?.name, 'Water 3', 'the chosen water is current');
	assert.equal(currentWaterOf(estate, null)?.name, 'Water 0', 'with nothing chosen the first water is current');
	assert.equal(currentWaterOf([], null), null, 'no waters, no current water');

	const quiet = { waterName: 'Quiet Pool', summary: nothingHappened() };
	const busy = { waterName: 'Busy Pit', summary: { ...nothingHappened(), daysSimulated: 3, anglersVisited: 9, feesCollected: 180, visitorsBigFish: ['A visitor had 28 lb — bigger than any angler has had here.'] } };
	const busier = { waterName: 'Mere', summary: { ...nothingHappened(), daysSimulated: 2, anglersVisited: 4, feesCollected: 80, carpTakenByPike: ['Poorly Pete'] } };
	assert.equal(summariseEstate([quiet]).daysSimulated, 0, 'a quiet estate has nothing to report');
	assert.deepEqual(summariseEstate([quiet, busy]), busy.summary, 'one busy water reports as itself');
	const combined = summariseEstate([busy, busier]);
	assert.equal(combined.anglersVisited, 13, 'anglers are added up across the estate');
	assert.equal(combined.feesCollected, 260, 'so is the money');
	assert.equal(combined.daysSimulated, 3, 'the days are the longest any water ran');
	assert.deepEqual(combined.visitorsBigFish, ['Busy Pit: A visitor had 28 lb — bigger than any angler has had here.'], 'lines name their water');
	assert.deepEqual(combined.carpTakenByPike, ['Mere: Poorly Pete']);
	console.log('estate:', { mostWaters: Estate.MostWaters });
}
