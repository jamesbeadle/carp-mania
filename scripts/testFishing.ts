import assert from 'node:assert/strict';
import { pickCarpThatTookTheBait, sameChanceForEveryFish } from '../src/lib/domain/fishing/pickCarp';
import { favouriteSpotOf, FavouriteSpotBiteBonus } from '../src/lib/domain/layout/favouriteFeature';
import { seededRandom } from '../src/lib/domain/random';
import { classicCarp, classicLake } from '../src/lib/domain/sites/classicSite';
import type { Carp, Lake } from '../src/lib/domain/types';

const TakesToSample = 4000;

export function runFishingScenarios() {
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
}

function shareOfTakes(carp: Carp[], isCounted: (fish: Carp) => boolean, bonusFor: (fish: Carp) => number, random: () => number) {
	let counted = 0;
	for (let take = 0; take < TakesToSample; take++) {
		const taker = pickCarpThatTookTheBait(carp, random(), bonusFor);
		if (taker && isCounted(taker)) counted += 1;
	}
	return counted / TakesToSample;
}
