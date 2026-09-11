import assert from 'node:assert/strict';
import { classicLayout } from '../src/lib/domain/layout/classicLayout';
import { layoutScaleFor } from '../src/lib/domain/layout/layoutScale';
import { terrainAt } from '../src/lib/domain/layout/terrainAt';
import { isInWater, waterAcres } from '../src/lib/domain/layout/waterArea';
import { strainWeightsFor } from '../src/lib/domain/strains';
import { greatCircleKilometres } from '../src/lib/domain/world/greatCircle';
import { yearlyAverageGrowthFactor } from '../src/lib/domain/world/seasons';
import { seasonFraction, seasonNameFor } from '../src/lib/domain/world/worldClock';

export function runWorldScenarios() {
	const scale = layoutScaleFor(10);
	assert.ok(Math.abs(scale.feetAcross - 808) < 1, `ten acres is 808 ft across, got ${scale.feetAcross}`);

	const layout = classicLayout();
	const acres = waterAcres(layout, 10);
	assert.ok(acres > 5 && acres < 10, `the classic water is most of a ten-acre plot, got ${acres}`);
	assert.ok(isInWater(layout, { x: 0.5, y: 0.6 }), 'the middle is water');
	assert.ok(!isInWater(layout, { x: 0.65, y: 0.4 }), 'the island is not water');
	assert.ok(!isInWater(layout, { x: 0.02, y: 0.02 }), 'the corner is bank');
	assert.equal(terrainAt(layout, scale, { x: 0.65, y: 0.5 }).feature, 'island_margin', 'just off the island is island margin');
	assert.equal(terrainAt(layout, scale, { x: 0.4, y: 0.6 }).feature, 'open_water');

	assert.equal(seasonFraction(15, 'northern'), 0, 'midwinter');
	assert.ok(Math.abs(seasonFraction(15 + 182, 'northern') - 1) < 0.01, 'midsummer');
	assert.ok(Math.abs(seasonFraction(15, 'southern') - 1) < 0.01, 'the south has its summer at our midwinter');
	assert.equal(seasonNameFor(15, 'northern'), 'winter');
	assert.equal(seasonNameFor(15 + 182, 'northern'), 'summer');

	assert.ok(Math.abs(yearlyAverageGrowthFactor({ region: 'uk_ireland' }) - 0.675) < 0.001);
	assert.ok(Math.abs(yearlyAverageGrowthFactor({ region: 'danube' }) - 0.925) < 0.001);

	const weights = strainWeightsFor('france');
	const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
	assert.ok(Math.abs(total - 1) < 0.0001, 'strain weights renormalise');
	assert.ok(weights.mirror > weights.common, 'France leans to mirrors');

	const londonToParis = greatCircleKilometres({ latitude: 51.5, longitude: -0.12 }, { latitude: 48.86, longitude: 2.35 });
	assert.ok(londonToParis > 330 && londonToParis < 360, `London to Paris is about 344 km, got ${londonToParis}`);
	console.log('world:', { classicWaterAcres: acres, londonToParis });
}
