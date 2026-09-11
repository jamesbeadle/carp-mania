import assert from 'node:assert/strict';
import { classicLayout } from '../src/lib/domain/layout/classicLayout';
import { layoutScaleFor } from '../src/lib/domain/layout/layoutScale';
import { terrainAt } from '../src/lib/domain/layout/terrainAt';
import { isInWater, waterAcres } from '../src/lib/domain/layout/waterArea';
import { strainWeightsFor } from '../src/lib/domain/strains';
import { greatCircleKilometres } from '../src/lib/domain/world/greatCircle';
import { isOnLand } from '../src/lib/domain/world/landCheck';
import { whyPlotIsRefused } from '../src/lib/domain/world/plotRules';
import { yearlyAverageGrowthFactor } from '../src/lib/domain/world/seasons';
import { seasonFraction, seasonNameFor } from '../src/lib/domain/world/worldClock';
import { seededRandom } from '../src/lib/domain/random';
import { isFirstDayOfSpring, spawnFry } from '../src/lib/domain/simulation/spawning';
import { filterWorldPins, NoWorldFilters } from '../src/lib/domain/world/worldFilters';
import type { WorldPin } from '../src/lib/contracts/WorldPin';

const pinsOnTheMap: WorldPin[] = [
	{ id: 'kent', name: 'Bluebell Pit', ownerName: 'Sam', region: 'uk_ireland', latitude: 51.2, longitude: 0.6, reputation: 62, heaviestLb: 41.5, acres: 10, dayTicketFee: 35, listingCount: 3, anglersOnBankNow: 2 },
	{ id: 'der', name: 'Lac du Der', ownerName: 'Luc', region: 'france', latitude: 48.6, longitude: 4.8, reputation: 80, heaviestLb: 58, acres: 30, dayTicketFee: 60, listingCount: 0, anglersOnBankNow: 0 },
	{ id: 'tisza', name: 'Tisza Pit', ownerName: 'Márk', region: 'central_europe', latitude: 47.5, longitude: 20.5, reputation: 45, heaviestLb: 36, acres: 8, dayTicketFee: 20, listingCount: 1, anglersOnBankNow: 0 }
];

function runWorldFilterScenarios() {
	const nobodysFavourites = new Set<string>();
	assert.deepEqual(filterWorldPins(pinsOnTheMap, { ...NoWorldFilters, region: 'france' }, nobodysFavourites).map((pin) => pin.id), ['der'], 'region keeps only French waters');
	assert.deepEqual(filterWorldPins(pinsOnTheMap, { ...NoWorldFilters, isFavouritesOnly: true }, new Set(['tisza'])).map((pin) => pin.id), ['tisza'], 'favourites only');
	assert.deepEqual(filterWorldPins(pinsOnTheMap, { ...NoWorldFilters, sort: 'biggest' }, nobodysFavourites).map((pin) => pin.id), ['der', 'kent', 'tisza'], 'biggest fish first');
	assert.deepEqual(filterWorldPins(pinsOnTheMap, { ...NoWorldFilters, sort: 'biggest' }, new Set(['tisza'])).map((pin) => pin.id), ['tisza', 'der', 'kent'], 'a favourite comes first whatever the sort');
	assert.deepEqual(filterWorldPins(pinsOnTheMap, { ...NoWorldFilters, search: 'luc' }, nobodysFavourites).map((pin) => pin.id), ['der'], 'search finds the owner');
	assert.deepEqual(filterWorldPins(pinsOnTheMap, { ...NoWorldFilters, isForSaleOnly: true, maximumDayTicketFee: 30 }, nobodysFavourites).map((pin) => pin.id), ['tisza'], 'fish for sale under £30');
	assert.deepEqual(filterWorldPins(pinsOnTheMap, { ...NoWorldFilters, isOnTheBankOnly: true, minimumReputation: 60 }, nobodysFavourites).map((pin) => pin.id), ['kent'], 'anglers on the bank at a reputable water');
}

export function runWorldScenarios() {
	runWorldFilterScenarios();
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

	assert.ok(isOnLand(51.5, -0.12), 'London is on land');
	assert.ok(isOnLand(47.5, 19.05), 'Budapest is on land');
	assert.ok(isOnLand(43.7, -79.4), 'Toronto is on land');
	assert.ok(!isOnLand(30, -40), 'the middle of the Atlantic is sea');
	assert.ok(!isOnLand(56, 3), 'the North Sea is sea');
	const parisForABritishLake = whyPlotIsRefused('uk_ireland', 48.86, 2.35);
	assert.ok(parisForABritishLake?.includes('UK & Ireland'), `Paris is outside the UK: ${parisForABritishLake}`);
	assert.equal(whyPlotIsRefused('france', 48.86, 2.35), null, 'Paris is a fine French plot');
	assert.equal(whyPlotIsRefused('uk_ireland', 53.5, -5.2), 'That spot is in the sea', 'the Irish Sea is inside the bounds but wet');
	console.log('world:', { classicWaterAcres: acres, londonToParis });
}

export function runSpawningScenarios() {
	const fertile = { id: 'lake-s', weed: 30, fertility: 70 };
	const adults = Array.from({ length: 12 }, (_, index) => ({ id: `adult-${index}`, lake_id: 'lake-s', name: `Adult ${index}`, strain: 'mirror' as const, weight_lb: 15, age_years: 5, condition: 80, times_caught: 0, origin: 'wild' as const, origin_lake_id: 'lake-s', fame: 0, is_catalogued: true, transit_until: null, quarantine_until: null }));
	const fry = spawnFry(fertile, adults, seededRandom(3));
	assert.ok(fry.length >= 3 && fry.length <= 8, `a fertile lake spawns 3–8 fry, got ${fry.length}`);
	assert.ok(fry.every((fish) => fish.origin === 'bred' && !fish.is_catalogued && fish.weight_lb <= 4), 'fry are small, bred and unseen');
	assert.equal(spawnFry({ id: 'lake-s', weed: 10, fertility: 70 }, adults, seededRandom(3)).length, 0, 'no weed, no spawning');
	const hour = 60 * 60 * 1000;
	const yearOfDays = Array.from({ length: 365 }, (_, day) => new Date(Date.UTC(2026, 0, 1) + day * hour));
	const springStarts = yearOfDays.filter((dayStart) => isFirstDayOfSpring(dayStart, new Date(dayStart.getTime() + hour), 51)).length;
	assert.equal(springStarts, 1, 'spring starts exactly once a fishery year in the north');
	console.log('spawning:', { fry: fry.length });
}
