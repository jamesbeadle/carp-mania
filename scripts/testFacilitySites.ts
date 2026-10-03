import assert from 'node:assert/strict';
import { applyCompletedWork } from '../src/lib/domain/groundworks/applyCompletedWorks';
import { isWorkDraft } from '../src/lib/domain/groundworks/isWorkDraft';
import { GetGroundworksQuote } from '../src/lib/domain/groundworks/quote';
import { siteOf, sitesOf } from '../src/lib/domain/groundworks/sites/sitesOf';
import type { FacilityDraft, WorkDraft } from '../src/lib/domain/groundworks/workKinds';
import type { Facility } from '../src/lib/domain/layout/layoutTypes';
import { classicLake, classicSwims } from '../src/lib/domain/sites/classicSite';
import type { Lake, Swim } from '../src/lib/domain/types';
import { runCarParkScenarios } from './testCarPark';

const start = new Date('2026-01-01T00:00:00Z');
export const siteLake: Lake = { id: 'lake-1', ...classicLake('owner-1', 'Test Water', start) };
export const siteSwims: Swim[] = classicSwims(siteLake.id).map((swim, index) => ({ ...swim, id: `swim-${index}` }));

export function lakeWith(facilities: Facility[]): Lake {
	return { ...siteLake, layout: { ...siteLake.layout, facilities } };
}

export function placedDraft(facility: Facility): FacilityDraft {
	const site = siteOf(sitesOf(lakeWith([facility]).layout, Number(siteLake.plot_acres), siteSwims), facility)!;
	return { kind: facility, centre: site.centre, rotation: site.rotation, carPark: site.carPark } as FacilityDraft;
}

function placementScenarios() {
	const lodge = placedDraft('lodge');
	assert.deepEqual(GetGroundworksQuote(lodge, siteLake, siteSwims, []).failures, [], 'a lodge on its default site fits');
	const inTheWater: WorkDraft = { ...lodge, centre: { x: 0.5, y: 0.5 } };
	assert.ok(GetGroundworksQuote(inTheWater, siteLake, siteSwims, []).failures.some((failure) => failure.includes('dry land')), 'a lodge in the lake is refused');
	const offThePlot: WorkDraft = { ...lodge, centre: { x: 0.999, y: 0.999 } };
	assert.ok(GetGroundworksQuote(offThePlot, siteLake, siteSwims, []).failures.some((failure) => failure.includes('your land')), 'a lodge off the plot is refused');
	const sites = sitesOf(lakeWith(['car_park', 'lodge', 'toilets']).layout, Number(siteLake.plot_acres), siteSwims);
	assert.equal(sites.length, 3, 'every built facility is given a site');
}

function inputScenarios() {
	const lodge = placedDraft('lodge');
	assert.ok(isWorkDraft(lodge), 'a placed lodge is a work draft');
	assert.ok(!isWorkDraft({ kind: 'lodge' }), 'a facility with nowhere to stand is refused at the door');
	const carPark = { kind: 'car_park', centre: lodge.centre, rotation: 0 };
	assert.ok(isWorkDraft({ ...carPark, carPark: { spaces: 20, surface: 'gravel', isLit: false } }));
	assert.ok(!isWorkDraft({ ...carPark, carPark: { spaces: 500, surface: 'gravel', isLit: false } }), 'more spaces than the most allowed is refused');
	assert.ok(!isWorkDraft({ ...carPark, carPark: { spaces: 20.5, surface: 'gravel', isLit: false } }), 'half a space is refused, never rounded');
	assert.ok(!isWorkDraft({ ...carPark, carPark: { spaces: 20, surface: 'mud', isLit: false } }), 'an unknown surface is refused');
	assert.ok(!isWorkDraft({ ...lodge, carPark: { spaces: 20, surface: 'gravel', isLit: false } }), 'only the car park has spaces');
}

function upgradeInPlaceScenario() {
	const withToilets = applyCompletedWork(lakeWith([]), placedDraft('toilets'), 'work-toilets', siteSwims);
	const toiletsSite = siteOf(withToilets.layout.sites ?? [], 'toilets')!;
	const washrooms: WorkDraft = { kind: 'washrooms', centre: toiletsSite.centre, rotation: toiletsSite.rotation };
	const upgraded = applyCompletedWork({ ...siteLake, layout: withToilets.layout }, washrooms, 'work-washrooms', siteSwims);
	assert.deepEqual(upgraded.layout.facilities, ['washrooms'], 'the washrooms replace the toilets');
	assert.deepEqual((upgraded.layout.sites ?? []).map((site) => site.facility), ['washrooms'], 'and take over their site');
}

export function runFacilitySiteScenarios() {
	placementScenarios();
	inputScenarios();
	upgradeInPlaceScenario();
	runCarParkScenarios();
}
