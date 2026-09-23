import assert from 'node:assert/strict';
import { anglerRatingOf, craftOf, pedigreeOf, whatHoldsRatingBack, type Skills } from '../src/lib/domain/anglerRating';
import { feedingWindowOf, isInsideFeedingWindow } from '../src/lib/domain/fishing/feedingWindow';
import { strikeWindowFor } from '../src/lib/domain/fishing/strikeWindow';
import { CatchSettleSeconds, isSettledAfter } from '../src/lib/domain/fishing/catchSettle';

const Maxed: Skills = { line_selection: 100, rig_selection: 100, bait_selection: 100, watercraft: 100 };
const Middling: Skills = { line_selection: 71, rig_selection: 71, bait_selection: 71, watercraft: 71 };
const RatingTable: [number, number][] = [[0, 0], [12, 24], [20, 40], [29, 58], [30, 60], [40, 80], [50, 100], [60, 100]];

export function runRatingScenarios() {
	for (const [bestLb, expected] of RatingTable) assert.equal(pedigreeOf(bestLb), expected, `a ${bestLb} lb best is a pedigree of ${expected}`);
	assert.equal(craftOf(Maxed), 100, 'four maxed skills are a craft of 100');
	assert.equal(anglerRatingOf(Maxed, 29).rating, 58, 'a maxed angler with a twenty-nine reads 58');
	assert.equal(anglerRatingOf(Middling, 50).rating, 71, 'an angler with a fifty reads his craft');
	assert.ok(whatHoldsRatingBack(anglerRatingOf(Maxed, 29), Maxed).startsWith('Your craft is ahead of your fish. A 30-pounder takes you to 60.'), 'the page says what a thirty would do');
	assert.ok(whatHoldsRatingBack(anglerRatingOf(Middling, 50), { ...Middling, watercraft: 40 }).includes('watercraft'), 'the page names the weakest skill');
	assert.equal(strikeWindowFor(0), 4, 'a novice gets four seconds to strike');
	assert.equal(strikeWindowFor(100), 5.5, 'full watercraft gets a beat longer');
	assert.ok(!isSettledAfter(CatchSettleSeconds - 1), 'the session is still settling a second before the delay is up');
	assert.ok(isSettledAfter(CatchSettleSeconds), 'and settled after the delay');
	const window = feedingWindowOf({ id: 'carp-1' });
	assert.equal(feedingWindowOf({ id: 'carp-1' }), window, 'a fish keeps its feeding window');
	assert.ok(isInsideFeedingWindow('night', 26), 'the night window runs past midnight');
	assert.ok(!isInsideFeedingWindow('first_light', 14), 'first light is not the afternoon');
	console.log('rating:', { maxedWithTwentyNine: anglerRatingOf(Maxed, 29).rating });
}
