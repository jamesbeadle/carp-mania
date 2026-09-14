import assert from 'node:assert/strict';
import { honourKindsOf, honoursFor, isARecord, raiseTheBar } from '../src/lib/domain/fishing/honours';
import { hourAfterMovingSwim, SwimMove } from '../src/lib/domain/fishing/movingSwims';
import { FishingDay } from '../src/lib/domain/fishing/sessionClock';
import { pickCarpThatTookTheBait, sameChanceForEveryFish } from '../src/lib/domain/fishing/pickCarp';
import { favouriteSpotOf, FavouriteSpotBiteBonus } from '../src/lib/domain/layout/favouriteFeature';
import { seededRandom } from '../src/lib/domain/random';
import { classicCarp, classicLake } from '../src/lib/domain/sites/classicSite';
import type { Carp, Lake } from '../src/lib/domain/types';
import { runBiteRollScenarios } from './testBiteRoll';

const TakesToSample = 4000;

export function runFishingScenarios() {
	runHonourScenarios();
	runSwimMoveScenarios();
	const random = seededRandom(11);
	const lake: Lake = { id: 'lake-fishing', ...classicLake('owner-1', 'Bonus Water', new Date('2026-01-01T00:00:00Z')) };
	const carp: Carp[] = classicCarp(lake.id, random).map((fish, index) => ({ ...fish, id: `carp-${index}` }));
	const lovesTheIsland = (fish: Carp) => {
		const favourite = favouriteSpotOf(fish, lake.layout, false);
		return favourite.kind === 'feature' && favourite.feature === 'island_margin';
	};
	const islandLovers = carp.filter(lovesTheIsland);
	assert.ok(islandLovers.length > 0, 'some classic carp favour the island margin');

	const bonusForIslandLovers = (fish: Carp) => (lovesTheIsland(fish) ? FavouriteSpotBiteBonus : 1);
	const plainShare = shareOfTakes(carp, lovesTheIsland, sameChanceForEveryFish, seededRandom(3));
	const bonusShare = shareOfTakes(carp, lovesTheIsland, bonusForIslandLovers, seededRandom(3));
	assert.ok(bonusShare > plainShare, `a bait on the favourite spot skews the take: ${bonusShare} vs ${plainShare}`);
	assert.equal(pickCarpThatTookTheBait([], 0.5, bonusForIslandLovers), null, 'an empty lake gives no fish');
	console.log('fishing:', { islandLovers: islandLovers.length, plainShare: plainShare.toFixed(3), bonusShare: bonusShare.toFixed(3) });
	runBiteRollScenarios();
}

function shareOfTakes(carp: Carp[], isCounted: (fish: Carp) => boolean, bonusFor: (fish: Carp) => number, random: () => number) {
	let counted = 0;
	for (let take = 0; take < TakesToSample; take++) {
		const taker = pickCarpThatTookTheBait(carp, random(), bonusFor);
		if (taker && isCounted(taker)) counted += 1;
	}
	return counted / TakesToSample;
}

function runHonourScenarios() {
	const bar = { standing: { lakeRecordLb: 20, regionRecordLb: 30, worldRecordLb: 50 }, personalBestLb: 12 };
	assert.deepEqual(honourKindsOf(honoursFor(10, bar)), [], 'a small fish earns nothing');
	assert.deepEqual(honourKindsOf(honoursFor(15, bar)), ['personal_best'], 'beating your own best is an honour');
	assert.deepEqual(honourKindsOf(honoursFor(31, bar)), ['region_record', 'lake_record', 'personal_best'], 'a region record is a lake record and a personal best too, biggest first');
	assert.equal(isARecord(honoursFor(15, bar)), false);
	assert.equal(isARecord(honoursFor(21, bar)), true);
	const raised = raiseTheBar(31, bar);
	assert.deepEqual(raised, { standing: { lakeRecordLb: 31, regionRecordLb: 31, worldRecordLb: 50 }, personalBestLb: 31 }, 'the bar rises to the fish');
	assert.deepEqual(honourKindsOf(honoursFor(31, raised)), [], 'the same weight again is no longer an honour');
}

function runSwimMoveScenarios() {
	assert.equal(hourAfterMovingSwim(9), 9 + SwimMove.HoursToPackUpAndWalk, 'a move costs the pack-up-and-walk time');
	assert.equal(hourAfterMovingSwim(FishingDay.EndHour - 0.25), FishingDay.EndHour, 'a move late in the day ends at dusk, not after it');
	assert.equal(hourAfterMovingSwim(FishingDay.EndHour), FishingDay.EndHour, 'no move goes past the end of the day');
	console.log('swim moves:', { cost: SwimMove.HoursToPackUpAndWalk });
}
