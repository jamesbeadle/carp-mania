import assert from 'node:assert/strict';
import { biteChanceThisHour, type RodInTheWater, type WaterToday } from '../src/lib/domain/fishing/biteRoll';
import { castTerrainFor } from '../src/lib/domain/fishing/castTerrain';
import { pickCarpByWeight } from '../src/lib/domain/fishing/pickCarp';
import { combinedSpotBonus, SnagHold, snagBiteShareFactor, snagHoldFor } from '../src/lib/domain/fishing/snagHold';
import { noSpotBonus, takeWeightsFor, type SpotBonus } from '../src/lib/domain/fishing/takeWeight';
import { EasyWater } from '../src/lib/domain/fishing/waterDifficulty';
import { seededRandom } from '../src/lib/domain/random';
import { classicCarp, classicLake } from '../src/lib/domain/sites/classicSite';
import { defaultRodSetup, kitFor } from '../src/lib/domain/tackle/rodSetup';
import type { Carp, Lake } from '../src/lib/domain/types';
import { seasonFor } from '../src/lib/domain/world/seasons';
import { weatherFor } from '../src/lib/domain/world/weather';

const TakesToSample = 4000;
const MiddlingReach = 0.5;
const MidMorning = 9;
const BigFishFromLb = 14;
const DecentRating = 60;
const CastPoint = { x: 0.5, y: 0.5 };
const TackleMatchWobble = 0.02;

export function runSnagHoldScenarios() {
	const lake: Lake = { id: 'lake-snag', ...classicLake('owner-1', 'Snag Water', new Date('2026-01-01T00:00:00Z')) };
	const carp: Carp[] = classicCarp(lake.id, seededRandom(5)).map((fish, index) => ({ ...fish, id: `carp-${index}` }));
	assertTheSnagBitesAtItsShare(lake);
	assertTheSnagHoldsTheBigFish(carp);
}

function assertTheSnagBitesAtItsShare(lake: Lake) {
	const june = new Date('2026-06-01T00:00:00Z');
	const water: WaterToday = { lake, rating: DecentRating, watercraft: DecentRating, season: seasonFor(lake, june), weather: weatherFor(lake, june), shoals: [], difficulty: EasyWater, recentCaptures: {}, nuisanceShare: 0, streakDays: 1 };
	const kit = kitFor(defaultRodSetup());
	const openWater: RodInTheWater = { terrain: { ...castTerrainFor(lake, CastPoint), feature: 'open_water' }, kit };
	const snag: RodInTheWater = { terrain: { ...openWater.terrain, feature: 'snag' }, kit };
	const openChance = biteChanceThisHour(MidMorning, openWater, water);
	const snagChance = biteChanceThisHour(MidMorning, snag, water);
	assert.equal(snagBiteShareFactor(snag.terrain), SnagHold.BiteShareOfOpenWater);
	assert.equal(snagBiteShareFactor(openWater.terrain), 1);
	assert.ok(Math.abs(snagChance / openChance - SnagHold.BiteShareOfOpenWater) < TackleMatchWobble, `a snag bites at its share of open water: ${snagChance} vs ${openChance}`);
	console.log('snag bites:', { openChance: openChance.toFixed(4), snagChance: snagChance.toFixed(4) });
}

function assertTheSnagHoldsTheBigFish(carp: Carp[]) {
	const isBig = (fish: Carp) => fish.weight_lb >= BigFishFromLb;
	assert.ok(carp.some(isBig) && carp.some((fish) => !isBig(fish)), 'the classic stock has big and small fish');
	const inOpenWater = snagHoldFor({ feature: 'open_water' });
	const inTheSnag = snagHoldFor({ feature: 'snag' });
	assert.equal(inOpenWater(carp[0]), 1, 'open water holds nothing back');
	const openShare = shareOfBigTakes(carp, isBig, combinedSpotBonus(noSpotBonus, inOpenWater), seededRandom(3));
	const snagShare = shareOfBigTakes(carp, isBig, combinedSpotBonus(noSpotBonus, inTheSnag), seededRandom(3));
	assert.ok(snagShare > openShare, `the big fish take more often in the snag: ${snagShare} vs ${openShare}`);
	console.log('snag hold:', { openShare: openShare.toFixed(3), snagShare: snagShare.toFixed(3) });
}

function shareOfBigTakes(carp: Carp[], isCounted: (fish: Carp) => boolean, spotBonusFor: SpotBonus, random: () => number) {
	let counted = 0;
	const weights = takeWeightsFor(carp, { sizeReach: MiddlingReach, hour: MidMorning, spotBonusFor });
	for (let take = 0; take < TakesToSample; take++) {
		const taker = pickCarpByWeight(carp, weights, random());
		if (taker && isCounted(taker)) counted += 1;
	}
	return counted / TakesToSample;
}
