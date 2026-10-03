import assert from 'node:assert/strict';
import { applyCompletedWork } from '../src/lib/domain/groundworks/applyCompletedWorks';
import { GetGroundworksQuote } from '../src/lib/domain/groundworks/quote';
import { carParkPlanFor } from '../src/lib/domain/groundworks/sites/carParkPlan';
import { anglersOnTheVerge, parkingCapacityOf } from '../src/lib/domain/groundworks/sites/carParkTrade';
import { siteOf } from '../src/lib/domain/groundworks/sites/sitesOf';
import type { WorkDraft } from '../src/lib/domain/groundworks/workKinds';
import type { CarParkSpec } from '../src/lib/domain/layout/facilitySite';
import { lakeWith, placedDraft, siteLake, siteSwims } from './testFacilitySites';

const Standard: CarParkSpec = { spaces: 20, surface: 'gravel', isLit: false };

function planScenarios() {
	const plan = carParkPlanFor(Standard);
	assert.equal(plan.bays.length, 20, 'every space is a marked bay');
	assert.equal(plan.widthFeet, 92, 'ten bays of 8 ft across, with a verge each side');
	assert.equal(plan.depthFeet, 64, 'two rows of 16 ft bays either side of a 20 ft aisle, with verges');
	assert.equal(carParkPlanFor({ ...Standard, spaces: 120 }).aislesDownFeet.length, 4, 'a big car park is laid out in several aisles');
}

function priceScenarios() {
	const standard = GetGroundworksQuote({ ...placedDraft('car_park'), carPark: Standard }, siteLake, siteSwims, []);
	assert.deepEqual(standard.failures, [], standard.failures.join('; '));
	assert.equal(standard.cost, 4000, 'twenty gravel spaces cost what the old car park did');
	assert.equal(standard.days, 4);
	const grand = GetGroundworksQuote({ ...placedDraft('car_park'), carPark: { spaces: 40, surface: 'tarmac', isLit: true } }, siteLake, siteSwims, []);
	assert.equal(grand.cost, 40 * 350 + 1500, 'tarmac spaces and lights are priced as laid');
	assert.equal(grand.days, 6);
}

function upgradeScenarios() {
	const built = applyCompletedWork(lakeWith([]), { ...placedDraft('car_park'), carPark: Standard }, 'work-car-park', siteSwims);
	const lake = { ...siteLake, layout: built.layout };
	assert.equal(siteOf(built.layout.sites ?? [], 'car_park')?.carPark?.spaces, 20, 'the finished car park keeps its spaces');
	const bigger: WorkDraft = { kind: 'upgrade_car_park', carPark: { ...Standard, spaces: 30 } };
	const quote = GetGroundworksQuote(bigger, lake, siteSwims, []);
	assert.equal(quote.cost, 2000, 'ten more gravel spaces cost £2,000');
	const smaller = GetGroundworksQuote({ kind: 'upgrade_car_park', carPark: { ...Standard, spaces: 10 } }, lake, siteSwims, []);
	assert.ok(smaller.failures.some((failure) => failure.includes('only grow')), 'a car park is never shrunk');
	const upgraded = applyCompletedWork(lake, bigger, 'work-upgrade', siteSwims);
	assert.equal(siteOf(upgraded.layout.sites ?? [], 'car_park')?.carPark?.spaces, 30, 'the upgrade is laid');
	assert.equal(parkingCapacityOf(upgraded.layout), 37, 'thirty spaces park thirty-seven with the verge');
	assert.equal(anglersOnTheVerge(upgraded.layout, 33), 3, 'the three past the spaces park on the verge');
	assert.equal(parkingCapacityOf(lakeWith([]).layout), Number.POSITIVE_INFINITY, 'with no car park the lane takes everyone');
}

export function runCarParkScenarios() {
	planScenarios();
	priceScenarios();
	upgradeScenarios();
}
