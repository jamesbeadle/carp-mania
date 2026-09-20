import assert from 'node:assert/strict';
import { takeWeightOf } from '../src/lib/domain/fishing/takeWeight';
import { noSpotBonus } from '../src/lib/domain/fishing/takeWeight';
import { classicCarp, classicLake } from '../src/lib/domain/sites/classicSite';
import { seededRandom } from '../src/lib/domain/random';
import type { Carp, Lake } from '../src/lib/domain/types';
import { demandBandOf } from '../src/lib/domain/water/demand';
import { lakeCeilingOf } from '../src/lib/domain/water/lakeCeiling';
import { nuisanceFishFor } from '../src/lib/domain/water/nuisanceBites';
import { pressureWariness, pressureWords } from '../src/lib/domain/water/pressure';
import { feedStolenShare, nuisanceBiteShare } from '../src/lib/domain/water/species';
import { drawAnglerFactor, drawPayFactor, stockDrawOf, stockRenownOf } from '../src/lib/domain/water/stockDraw';
import { runBookingScenarios } from './testBookings';

const start = new Date('2026-01-01T00:00:00Z');
const FullyFeatured = { fromFeatures: 1 } as const;

function fishOf(weightLb: number, count: number): Carp[] {
	const random = seededRandom(1);
	return classicCarp('lake-1', random).slice(0, 1).flatMap((fish) => Array.from({ length: count }, (_, index) => ({ ...fish, id: `${weightLb}-${index}`, weight_lb: weightLb })));
}

function ceilingsScenario() {
	const estate: Lake = { id: 'lake-estate', ...classicLake('owner-1', 'Estate Lake', start), acres: 10, silt: 30, weed: 30, transparency: 70 };
	const quarterFeatured = lakeCeilingOf(estate, 200, []);
	const confidence = quarterFeatured.feedingConfidence;
	assert.ok(confidence > 0.75 && confidence < 1, 'the classic layout is part featured');
	assert.equal(Math.round(quarterFeatured.mouthPressure * 100), 85, 'twenty fish an acre');
	const worked = { ...quarterFeatured, qualityFactor: 0.94, feedingConfidence: FullyFeatured.fromFeatures };
	const { mouthPressure, feedingConfidence, qualityFactor } = worked;
	assert.equal(Math.round(68 * mouthPressure * feedingConfidence * qualityFactor), 54, 'ten acres, 200 carp, a quarter featured, UK: 54 lb');
	const packed = lakeCeilingOf(estate, 400, []);
	const packedPressure = packed.mouthPressure;
	assert.equal(Math.round(68 * packedPressure * qualityFactor), 45, 'the same water at 400 carp: 45 lb');
	const bare: Lake = { ...estate, layout: { ...estate.layout, islands: [], features: [], depthZones: [] }, silt: 60, weed: 40, transparency: 40 };
	const bowl = lakeCeilingOf(bare, 400, [{ species: 'bream', count: 300 }]);
	assert.equal(bowl.feedingConfidence, 0.65, 'a bare bowl has no cover');
	assert.equal(bowl.competitionFactor, 0.7, 'three hundred bream on ten acres steal thirty per cent');
	const bowlLb = bowl.ceilingLb;
	assert.ok(bowlLb >= 19 && bowlLb <= 21, `the bare clay bowl: about 20 lb (${bowlLb})`);
	const danube: Lake = { ...estate, region: 'danube', acres: 40, silt: 5, weed: 10, transparency: 90 };
	const record = lakeCeilingOf(danube, 300, []);
	const cleanQuality = 0.98;
	const recordPressure = record.mouthPressure;
	assert.equal(Math.round(105 * recordPressure * cleanQuality), 97, 'forty Danube acres, 300 carp, clean: 97 lb');
	assert.equal(nuisanceBiteShare([{ species: 'bream', count: 300 }], 10), 0.1, 'and one bite in ten is a bream');
	assert.equal(feedStolenShare([{ species: 'bream', count: 300 }], 10), 0.3);
}

function drawsScenario() {
	const starter = stockDrawOf(fishOf(12, 200));
	const club = stockDrawOf([...fishOf(12, 100), ...fishOf(22, 40), ...fishOf(32, 8)]);
	const prize = club + stockDrawOf(fishOf(42, 2));
	const grail = prize + stockDrawOf(fishOf(52, 1));
	assert.equal(Math.round(starter), 4, `a starter water draws ${starter.toFixed(1)}`);
	assert.equal(Math.round(club), 17, `a club water draws ${club.toFixed(1)}`);
	assert.equal(Math.round(prize), 35, `a prize water draws ${prize.toFixed(1)}`);
	assert.equal(Math.round(grail), 95, `a holy-grail water draws ${grail.toFixed(1)}`);
	assert.equal(drawAnglerFactor(grail).toFixed(2), '3.37');
	assert.equal(drawPayFactor(grail).toFixed(2), '2.35');
	assert.equal(Math.round(stockRenownOf(club)), 38);
	assert.equal(stockRenownOf(grail), 100);
}

function demandAndPressureScenario() {
	assert.equal(demandBandOf(0.5), 'quiet');
	assert.equal(demandBandOf(1), 'busy');
	assert.equal(demandBandOf(1.5), 'turning_away');
	assert.equal(demandBandOf(2.5), 'waiting_list');
	assert.equal(pressureWariness(7), 0.4, 'a fish caught every day for a week is as wary as it gets');
	assert.ok(pressureWords(4).includes('wary'), 'caught four times this week — it will be wary');
	const fifty = fishOf(50, 1)[0];
	const take = { sizeReach: 0.8, hour: 6, spotBonusFor: noSpotBonus };
	const fresh = takeWeightOf(fifty, take);
	const wary = takeWeightOf(fifty, { ...take, warinessFor: () => pressureWariness(7) });
	assert.ok(wary < fresh * 0.61, 'a wary fifty comes out less');
	const bream = nuisanceFishFor('lake-1', [{ species: 'bream', count: 300 }], 7, 0, 8);
	const isABream = bream.id.startsWith('nuisance:') && bream.name === 'A bream';
	assert.ok(isABream && bream.weight_lb > 3, 'a nuisance bite is a bream with a weight');
}

export function runMakeUpScenarios() {
	ceilingsScenario();
	drawsScenario();
	demandAndPressureScenario();
	runBookingScenarios();
}
