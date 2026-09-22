import assert from 'node:assert/strict';
import { biteRollFor, type RodInTheWater, type WaterToday } from '../src/lib/domain/fishing/biteRoll';
import { castTerrainFor } from '../src/lib/domain/fishing/castTerrain';
import { sessionWindowFor, type SessionWindow } from '../src/lib/domain/fishing/sessionWindow';
import { isInsideShortBand } from '../src/lib/domain/fishing/sessionCatches';
import { isInsideTheBand, landedFromTakes, SessionCatches } from '../src/lib/domain/fishing/sessionCatches';
import { biasExponentFor, sizeBiasOf } from '../src/lib/domain/fishing/takeWeight';
import { carpForRolledBite } from '../src/lib/domain/fishing/whoTookTheBait';
import { classicLake } from '../src/lib/domain/sites/classicSite';
import { defaultRodSetup, kitFor, MaximumRods, type RodSetup } from '../src/lib/domain/tackle/rodSetup';
import type { Carp, Lake } from '../src/lib/domain/types';
import { stockWithThirties, waterOn } from './testSizeReachSupport';

const Ratings = [0, 25, 50, 75, 100];
const Months = ['2026-01-15', '2026-04-15', '2026-07-15', '2026-10-15'];
const SeedsPerCell = 120;
const CompetentRating = 50;
const CastPoint = { x: 0.5, y: 0.5 };
const CellSpread = { Lowest: 0.85, Highest: 1.15 } as const;
const SupermarketSetup: RodSetup = { ...defaultRodSetup(), line: 'bankside_basics-line-20-brown', hook: 'bankside_basics-hook-2-barbed-shiny', rig: 'bankside_basics-rig-zig', bait: 'meadowmill-bait-bread', tubing: 'bankside_basics-tubing-yellow' };
const TwentyFourHours = sessionWindowFor('twenty_four_hours');
const DayTicket = sessionWindowFor('day');
const NightTicket = sessionWindowFor('night');

export function runSizeReachScenarios() {
	const lake: Lake = { id: 'lake-reach', ...classicLake('owner-1', 'Reach Water', new Date('2026-01-01T00:00:00Z')) };
	assertTheBiasTurnsWithReach();
	const competent = meanTakesPerSession(lake, CompetentRating, defaultRodSetup(), TwentyFourHours);
	const landed = landedFromTakes(competent);
	const band = `${SessionCatches.Fewest}–${SessionCatches.Most}`;
	assert.ok(isInsideTheBand(landed), `a competent angler lands ${landed.toFixed(1)} in 24 hours, inside ${band}`);
	for (const window of [DayTicket, NightTicket]) {
		const shortLanded = landedFromTakes(meanTakesPerSession(lake, CompetentRating, defaultRodSetup(), window));
		assert.ok(isInsideShortBand(shortLanded), `a day or night ticket lands ${shortLanded.toFixed(1)}, three to fourteen`);
	}
	for (const rating of Ratings) {
		for (const setup of [SupermarketSetup, defaultRodSetup()]) {
			const takes = meanTakesPerSession(lake, rating, setup, TwentyFourHours);
			const ratio = takes / competent;
			const isWithinSpread = ratio >= CellSpread.Lowest && ratio <= CellSpread.Highest;
			assert.ok(isWithinSpread, `rating ${rating} on ${setup.line} moves the count by ${ratio.toFixed(2)}, within the band`);
		}
	}
	assertTheCalibreRisesWithReach(lake);
	console.log('size reach:', { competentTakes: competent.toFixed(2), landed: landed.toFixed(2) });
}

function meanTakesPerSession(lake: Lake, rating: number, setup: RodSetup, window: SessionWindow) {
	const rod = { terrain: castTerrainFor(lake, CastPoint), kit: kitFor(setup) };
	let takes = 0;
	for (const month of Months) {
		const water = waterOn(lake, rating, month);
		for (let seed = 1; seed <= SeedsPerCell; seed++) takes += takesInASession(seed, rod, water, window);
	}
	return takes / (Months.length * SeedsPerCell);
}

function takesInASession(seed: number, rod: RodInTheWater, water: WaterToday, window: SessionWindow) {
	let takes = 0;
	for (let rodIndex = 0; rodIndex < MaximumRods; rodIndex++) {
		for (let hour = window.fromHour; hour < window.toHour; hour++) if (biteRollFor(seed, rodIndex, hour, rod, water).isTaking) takes += 1;
	}
	return takes;
}

function assertTheBiasTurnsWithReach() {
	assert.equal(biasExponentFor(0.5), 0, 'at half reach every fish is as likely as every other');
	assert.ok(sizeBiasOf(40, 0) < sizeBiasOf(12, 0), 'with no reach the small fish win');
	assert.ok(sizeBiasOf(40, 1) > sizeBiasOf(12, 1), 'with full reach the big fish win');
}

function assertTheCalibreRisesWithReach(lake: Lake) {
	const carp = stockWithThirties(lake.id);
	const novice = meanWeightOfTakes(lake, carp, 0, SupermarketSetup);
	const expert = meanWeightOfTakes(lake, carp, 100, defaultRodSetup());
	assert.ok(expert > novice, `the expert's fish average ${expert.toFixed(1)} lb against the novice's ${novice.toFixed(1)} lb`);
}

function meanWeightOfTakes(lake: Lake, carp: Carp[], rating: number, setup: RodSetup) {
	const water = waterOn(lake, rating, Months[2]);
	let weight = 0;
	let takes = 0;
	for (let seed = 1; seed <= SeedsPerCell; seed++) {
		for (let hour = TwentyFourHours.fromHour; hour < TwentyFourHours.toHour; hour++) {
			const taker = carpForRolledBite({ seed, rodIndex: 0, hour, castPoint: CastPoint, setup }, water, carp);
			if (!taker) continue;
			weight += Number(taker.weight_lb);
			takes += 1;
		}
	}
	return weight / Math.max(1, takes);
}
