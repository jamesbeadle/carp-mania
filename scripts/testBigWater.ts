import assert from 'node:assert/strict';
import { biteRollFor, type RodInTheWater } from '../src/lib/domain/fishing/biteRoll';
import { castTerrainFor } from '../src/lib/domain/fishing/castTerrain';
import { sessionWindowFor } from '../src/lib/domain/fishing/sessionWindow';
import { spotSpreadFactor } from '../src/lib/domain/fishing/spotSpread';
import { LandPurchase } from '../src/lib/domain/groundworks/landPurchase';
import { Difficulty, difficultyWord, lakeDifficultyOf } from '../src/lib/domain/lakeDifficulty';
import { featureCoverageShare } from '../src/lib/domain/layout/featureCoverage';
import { classicLake } from '../src/lib/domain/sites/classicSite';
import { headCapFor } from '../src/lib/domain/stock/headCount';
import { defaultRodSetup, kitFor } from '../src/lib/domain/tackle/rodSetup';
import type { Lake } from '../src/lib/domain/types';
import { bailiffScenario, facilitiesScenario } from './testBailiffs';
import { waterOn } from './testSizeReachSupport';

const start = new Date('2026-01-01T00:00:00Z');
const Seeds = 60;
const BandSpread = { Lowest: 0.9, Highest: 1.1 } as const;
const CastPoints = [
	{ x: 0.5, y: 0.5 },
	{ x: 0.3, y: 0.8 },
	{ x: 0.62, y: 0.35 },
	{ x: 0.85, y: 0.68 }
];

function difficultyScenario() {
	const tenAcres: Lake = { id: 'lake-ten', ...classicLake('owner-1', 'Ten Acres', start), acres: 10 };
	const coverage = featureCoverageShare(tenAcres.layout, Number(tenAcres.plot_acres));
	assert.ok(coverage > 0 && coverage < 1, `the classic water is ${(coverage * 100).toFixed(0)}% featured`);
	const classicReading = lakeDifficultyOf(tenAcres, 200);
	const classic = classicReading.difficulty;
	assert.ok(classic >= 45 && classic <= 70, `a ten-acre, 200-fish, featured water reads ${classic}`);
	const bare: Lake = { ...tenAcres, acres: 200, plot_acres: 240, layout: { ...tenAcres.layout, islands: [], features: [], depthZones: [] } };
	const bareReading = lakeDifficultyOf(bare, 200 * 20);
	assert.equal(difficultyWord(bareReading.difficulty), 'hard', `two hundred bare acres at 20 fish an acre reads ${bareReading.difficulty} — hard`);
	const stocked = lakeDifficultyOf(bare, 200 * 120);
	assert.ok(stocked.difficulty > bareReading.difficulty, 'stocking heavier eases it');
	const featured = lakeDifficultyOf({ ...bare, layout: tenAcres.layout }, 200 * 120);
	assert.ok(featured.difficulty > stocked.difficulty, 'building features eases it');
	const cleared = lakeDifficultyOf({ ...bare, layout: tenAcres.layout, silt: 5, weed: 10, transparency: 90 }, 200 * 120);
	assert.ok(cleared.difficulty >= featured.difficulty, 'clearing the water eases it');
	assert.equal(LandPurchase.MaximumPlotAcres, 200);
	assert.equal(headCapFor(200), 40000, 'a 200-acre water caps at forty thousand fish');
}

function spreadScenario() {
	assert.equal(spotSpreadFactor(100, 1.2), 1, 'an easy water fishes the same everywhere');
	const goodSpot = 1.2;
	const poorSpot = 0.7;
	const isWider = spotSpreadFactor(20, goodSpot) > goodSpot && spotSpreadFactor(20, poorSpot) < poorSpot;
	assert.ok(isWider, 'a hard water makes the good spots better and the bad spots worse');
	const lake: Lake = { id: 'lake-spread', ...classicLake('owner-1', 'Spread Water', start) };
	const easy = meanTakes(lake, 100);
	const hard = meanTakes(lake, Difficulty.HardBelow - 10);
	const ratio = hard / easy;
	const isInsideTheBand = ratio >= BandSpread.Lowest && ratio <= BandSpread.Highest;
	assert.ok(isInsideTheBand, `difficulty moves the count by ${ratio.toFixed(2)} across the spots, within the band`);
}

function meanTakes(lake: Lake, difficulty: number) {
	const window = sessionWindowFor('twenty_four_hours');
	const water = { ...waterOn(lake, 50, '2026-07-15'), difficulty };
	let takes = 0;
	for (const castPoint of CastPoints) {
		const rod: RodInTheWater = { terrain: castTerrainFor(lake, castPoint), kit: kitFor(defaultRodSetup()) };
		for (let seed = 1; seed <= Seeds; seed++) {
			for (let hour = window.fromHour; hour < window.toHour; hour++) if (biteRollFor(seed, 0, hour, rod, water).isTaking) takes += 1;
		}
	}
	return takes / (CastPoints.length * Seeds);
}

export function runBigWaterScenarios() {
	difficultyScenario();
	spreadScenario();
	bailiffScenario();
	facilitiesScenario();
}
