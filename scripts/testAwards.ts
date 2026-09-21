import assert from 'node:assert/strict';
import { AwardKeys, NoTallies } from '../src/lib/domain/trophies/awards';
import { awardsEarnedBy, awardWordsFor, nextAwardsFor, newlyEarned, progressOf } from '../src/lib/domain/trophies/awardProgress';

export function runAwardScenarios() {
	assert.equal(AwardKeys.length, 19, 'nineteen awards');
	assert.deepEqual(awardsEarnedBy(NoTallies), [], 'nothing is won with nothing done');
	const firstDouble = { ...NoTallies, bestLb: 12.5, fishLanded: 1 };
	assert.deepEqual(awardsEarnedBy(firstDouble), ['first_double'], 'a twelve is the first double and nothing more');
	const aLife = { ...NoTallies, bestLb: 41, fishLanded: 600, regionsFished: 5, homeGrownBestLb: 31, lightRodBestLb: 40, recordsSet: 2, recordWaters: 3, lifetimeLb: 10400, nightFish: 50, morningFish: 12, ticketKindsFished: 3, fishSold: 100 };
	const earned = awardsEarnedBy(aLife);
	assert.equal(earned.length, 15, 'a full life short of the fifty, the thousandth fish, ten regions and the early bird');
	assert.ok(!earned.includes('early_bird') && !earned.includes('first_fifty'), 'twelve morning fish is not the early bird');
	assert.deepEqual(newlyEarned(aLife, earned), [], 'nothing new when everything is held');
	assert.deepEqual(newlyEarned({ ...aLife, morningFish: 50 }, earned), ['early_bird'], 'the fiftieth morning fish is the early bird');
	const next = nextAwardsFor(aLife, earned);
	assert.equal(next.length, 3, 'three next awards are shown');
	assert.equal(next[0].key, 'first_fifty', 'the fifty is the closest at 41 of 50');
	assert.equal(awardWordsFor(progressOf('first_fifty', aLife)), 'First fifty — 9 lb short');
	assert.equal(awardWordsFor(progressOf('early_bird', aLife)), 'Early bird — 38 to go');
	assert.equal(progressOf('thousand_fish', aLife).share, 0.6);
	const nextKeys = next.map((progress) => progress.key);
	console.log('awards:', { earnedInALife: earned.length, next: nextKeys });
}
