import assert from 'node:assert/strict';
import { layoutScaleFor } from '../src/lib/domain/layout/layoutScale';
import { isPolygonInsidePolygon } from '../src/lib/domain/layout/pointInPolygon';
import { isClearOfOtherSwims, isOnTheBank } from '../src/lib/domain/layout/swimRules';
import { isInWater } from '../src/lib/domain/layout/waterArea';
import { seededRandom } from '../src/lib/domain/random';
import { estateCatchHistory, HistoryCatchesPerDay } from '../src/lib/domain/sites/estateHistory';
import { newLakeFor } from '../src/lib/domain/sites/newLake';
import { OfferedSites, PlotSizes, SiteCatalogue } from '../src/lib/domain/sites/siteCatalogue';
import { siteStartsWith } from '../src/lib/domain/sites/siteGuide';
import { priceOfSite, SiteTemplates, templateWaterAcresFor } from '../src/lib/domain/sites/siteTemplates';
import { NamedThirty, startingCarpFor } from '../src/lib/domain/sites/startingStock';
import type { Carp, SiteType } from '../src/lib/domain/types';

const SwimCounts: Record<SiteType, number> = { gravel_pit: 7, quarry: 4, clay_pit: 6, estate_lake: 8, farm_pond: 4, greenfield: 5, classic: 7 };

function templateScenario(site: SiteType) {
	const { layout, swims } = SiteTemplates[site];
	const pegs = swims();
	assert.equal(pegs.length, SwimCounts[site], `${site} has ${SwimCounts[site]} swims`);
	for (const plotAcres of PlotSizes) {
		const scale = layoutScaleFor(SiteCatalogue[site].fixedPlotAcres ?? plotAcres);
		for (const peg of pegs) {
			assert.ok(isOnTheBank(layout(), scale, peg.position), `${site} ${peg.name} is on the bank at ${plotAcres} acres`);
			const others = pegs.filter((other) => other !== peg).map((other) => ({ position_x: other.position.x, position_y: other.position.y }));
			assert.ok(isClearOfOtherSwims(scale, peg.position, others), `${site} ${peg.name} is clear of the other swims`);
		}
	}
	for (const island of layout().islands) assert.ok(isPolygonInsidePolygon(island.points, layout().outline), `${site} ${island.name} is in the water`);
	for (const zone of layout().depthZones) assert.ok(zone.points.every((point) => isInWater(layout(), point)), `${site} ${zone.id} is in the water`);
}

function stockScenario() {
	const random = seededRandom(11);
	const estate = startingCarpFor('estate_lake', 'lake-e', 'uk_ireland', random).map((fish, index) => ({ ...fish, id: `carp-${index}` }));
	assert.equal(estate.length, 60, 'the estate comes with sixty fish');
	assert.ok(estate.every((fish) => fish.is_catalogued && fish.origin === 'wild' && fish.origin_lake_id === 'lake-e' && fish.fame === 0));
	for (const name of SiteCatalogue.estate_lake.namedThirties) {
		const thirty = estate.find((fish) => fish.name === name);
		assert.ok(thirty && thirty.weight_lb >= NamedThirty.MinimumLb && thirty.weight_lb <= NamedThirty.MaximumLb, `${name} is a thirty`);
		assert.ok(thirty.age_years >= 10, `${name} is an old fish`);
	}
	const pit = startingCarpFor('gravel_pit', 'lake-p', 'uk_ireland', random);
	assert.ok(pit.length >= 4 && pit.length <= 8 && pit.every((fish) => !fish.is_catalogued), 'the pit hides four to eight originals');
	assert.equal(startingCarpFor('quarry', 'lake-q', 'uk_ireland', random).length, 0);
	assert.equal(startingCarpFor('farm_pond', 'lake-f', 'uk_ireland', random).filter((fish) => fish.origin === 'farm').length, 150);
	return estate;
}

function historyScenario(estate: Carp[]) {
	const now = new Date('2026-06-01T12:00:00Z');
	const lake = { id: 'lake-e', site_type: 'estate_lake' as const, simulated_until: now.toISOString() };
	const history = estateCatchHistory(lake, estate, SiteCatalogue.estate_lake.historyDays, seededRandom(3));
	assert.equal(SiteCatalogue.estate_lake.historyDays, 90);
	assert.ok(history.catches.length >= 90 * HistoryCatchesPerDay.Minimum && history.catches.length <= 90 * HistoryCatchesPerDay.Maximum, `ninety days of history, got ${history.catches.length}`);
	const swimNames = SiteTemplates.estate_lake.swims().map((peg) => peg.name);
	assert.ok(history.catches.every((caught) => swimNames.includes(caught.swim_name) && caught.angler_id === null && caught.lake_id === 'lake-e'));
	const earliest = Math.min(...history.catches.map((caught) => new Date(caught.caught_at).getTime()));
	assert.ok(earliest >= now.getTime() - 90 * 60 * 60 * 1000 && earliest < now.getTime() - 89 * 60 * 60 * 1000, 'history starts ninety fishery days ago');
	const timesCaught = history.carp.reduce((total, fish) => total + fish.times_caught, 0);
	assert.equal(timesCaught, history.catches.length, 'every catch is counted against its fish');
	assert.ok(estate.every((fish) => fish.times_caught === 0), 'the fish passed in are untouched');
	assert.equal(estateCatchHistory(lake, estate, 0, seededRandom(3)).catches.length, 0);
}

export function runSiteScenarios() {
	for (const site of OfferedSites) templateScenario(site);
	const pitAcres = templateWaterAcresFor('gravel_pit', 10);
	assert.ok(pitAcres >= 5 && pitAcres <= 9, `a ten-acre pit holds five to nine acres of water, got ${pitAcres}`);
	assert.ok(templateWaterAcresFor('farm_pond', 4) > 1.5, 'the farm pond is more than a puddle');
	assert.equal(priceOfSite('gravel_pit', 'uk_ireland', 10), 39000);
	assert.equal(priceOfSite('quarry', 'uk_ireland', 10), 33000);
	assert.equal(priceOfSite('clay_pit', 'uk_ireland', 10), 36000);
	assert.equal(priceOfSite('estate_lake', 'uk_ireland', 10), 47000);
	assert.equal(priceOfSite('farm_pond', 'uk_ireland', 10), 13000);
	assert.equal(priceOfSite('greenfield', 'uk_ireland', 10), 48000, 'six acres dug');
	assert.equal(priceOfSite('gravel_pit', 'danube', 20), 26000, 'the Danube pit');
	historyScenario(stockScenario());
	const profile = { id: 'owner-1', display_name: 'Ann', home_region: 'france' as const, plot_region: 'france' as const, plot_latitude: 47.1, plot_longitude: 2.3, current_lake_id: null };
	const lake = newLakeFor({ ...profile, avatar_url: null, money: 100000, line_selection: 25, rig_selection: 25, bait_selection: 25, watercraft: 25, experience: 0, saved_rods: [] }, 'quarry', 15, 'Ann\'s Water', new Date());
	assert.ok(!lake.is_public && !lake.is_setup_complete && lake.region === 'france' && lake.plot_acres === 15 && lake.acres > 7 && lake.fertility === 12);
	assert.ok(siteStartsWith('gravel_pit').includes('2 islands') && siteStartsWith('estate_lake').includes('2 named thirties'));
	console.log('sites:', Object.fromEntries(OfferedSites.map((site) => [site, templateWaterAcresFor(site, 10)])));
}
