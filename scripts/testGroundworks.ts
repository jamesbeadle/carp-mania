import assert from 'node:assert/strict';
import { applyCompletedWork } from '../src/lib/domain/groundworks/applyCompletedWorks';
import { GetGroundworksQuote } from '../src/lib/domain/groundworks/quote';
import { shelfPolygonFor } from '../src/lib/domain/groundworks/shelfStrip';
import { validateDraft } from '../src/lib/domain/groundworks/validateDraft';
import type { WorkDraft } from '../src/lib/domain/groundworks/workKinds';
import { completesOn, refundFor } from '../src/lib/domain/groundworks/worksLedger';
import { layoutScaleFor } from '../src/lib/domain/layout/layoutScale';
import { isInWater } from '../src/lib/domain/layout/waterArea';
import { FisheryClock } from '../src/lib/domain/simulation/elapsedDays';
import { completeDueWorks } from '../src/lib/domain/simulation/completeWorks';
import { classicLake, classicSwims } from '../src/lib/domain/sites/classicSite';
import type { Lake, Swim } from '../src/lib/domain/types';
import type { LakeWork } from '../src/lib/domain/worldTypes';

const start = new Date('2026-01-01T00:00:00Z');
const lake: Lake = { id: 'lake-1', ...classicLake('owner-1', 'Test Water', start) };
const swims: Swim[] = classicSwims(lake.id).map((swim, index) => ({ ...swim, id: `swim-${index}` }));
const plotAcres = Number(lake.plot_acres);

const island: WorkDraft = { kind: 'island', size: 'medium', centre: { x: 0.35, y: 0.5 }, rotation: 0.4, name: 'Long Island' };
const dredge: WorkDraft = { kind: 'dredge', points: [{ x: 0.2, y: 0.25 }, { x: 0.6, y: 0.25 }, { x: 0.6, y: 0.75 }, { x: 0.2, y: 0.75 }] };
const snagFar: WorkDraft = { kind: 'snag', point: { x: 0.8, y: 0.5 }, name: 'The Oak' };

function workRow(draft: WorkDraft, id: string, cost: number, startsOn: Date, days: number): LakeWork {
	const { kind, ...parameters } = draft;
	return { id, lake_id: lake.id, kind, parameters, cost, ordered_at: startsOn.toISOString(), starts_on: startsOn.toISOString(), completes_on: completesOn(startsOn, days).toISOString(), status: 'in_progress' };
}

function islandScenarios() {
	const quote = GetGroundworksQuote(island, lake, swims, []);
	assert.deepEqual(quote.failures, [], `a medium island in open water validates: ${quote.failures.join('; ')}`);
	assert.equal(quote.cost, 6000, 'a medium island costs £6,000');
	assert.equal(quote.days, 10, 'a medium island takes 10 days');
	assert.equal(quote.disturbance, 8);
	assert.ok(quote.effects.includes('Water lost 0.4 acre'), quote.effects.join('; '));

	const onTheBank = validateDraft(lake.layout, plotAcres, swims, [], { ...island, centre: { x: 0.1, y: 0.5 } });
	assert.ok(onTheBank.some((failure) => failure.includes('wholly in water')), `an island on the bank fails: ${onTheBank.join('; ')}`);

	const threeEarthworks: WorkDraft[] = [snagFar, { ...snagFar, point: { x: 0.85, y: 0.55 } }, { ...snagFar, point: { x: 0.8, y: 0.6 } }];
	const fourth = validateDraft(lake.layout, plotAcres, swims, threeEarthworks, island);
	assert.ok(fourth.some((failure) => failure.includes('already in progress')), `a fourth earthwork fails: ${fourth.join('; ')}`);
	assert.deepEqual(validateDraft(lake.layout, plotAcres, swims, threeEarthworks, { kind: 'lodge' }), [], 'facilities do not count as earthworks');
}

function dredgeScenarios() {
	const quote = GetGroundworksQuote(dredge, lake, swims, []);
	assert.equal(quote.cost, 3600, `dredging two acres costs £3,600, got ${quote.cost}`);
	assert.equal(quote.days, 10);
	const applied = applyCompletedWork(lake, dredge, 'work-dredge');
	assert.ok(Number(applied.lake.silt) < Number(lake.silt), 'dredging lowers silt');
	assert.ok(Number(applied.lake.fertility) < Number(lake.fertility), 'dredging costs fertility');
	assert.equal(applied.layout.depthZones.length, lake.layout.depthZones.length + 1, 'dredging adds a depth zone');
}

function shelfScenario() {
	const strip = shelfPolygonFor([{ x: 0.22, y: 0.16 }, { x: 0.4, y: 0.12 }, { x: 0.6, y: 0.18 }], lake.layout, layoutScaleFor(plotAcres));
	assert.equal(strip.length, 6, 'the strip closes back along the water side');
	assert.ok(strip.slice(3).every((point) => isInWater(lake.layout, point)), 'the shelf strip lies in water');
	const quote = GetGroundworksQuote({ kind: 'margin_shelf', points: strip.slice(0, 3), bed: 'gravel' }, lake, swims, []);
	assert.deepEqual(quote.failures, [], quote.failures.join('; '));
	assert.equal(quote.cost, 1400 * 4, 'about 330 ft of shelf is four hundred-foot units');
}

function completionScenarios() {
	const applied = applyCompletedWork(lake, island, 'work-island');
	assert.equal(applied.layout.islands.length, 2, 'completing an island adds it to the layout');
	assert.equal(applied.layout.islands[1].id, 'work-island');
	assert.ok(Number(applied.lake.acres) < Number(lake.acres), 'an island lowers the water acreage');

	const due = workRow(island, 'work-1', 6000, start, 10);
	const notDue = workRow(snagFar, 'work-2', 700, start, 30);
	const completion = completeDueWorks(lake, [due, notDue], completesOn(start, 10));
	assert.deepEqual(completion.completed.map((work) => work.id), ['work-1'], 'only works past their completion are finished');
	assert.equal(completion.completed[0].status, 'complete');
	assert.equal(completion.lake.layout.islands.length, 2);

	assert.equal(refundFor(due, new Date(start.getTime() + FisheryClock.RealMillisecondsPerFisheryDay / 2)), 3000, 'cancelling within the first day refunds half');
	assert.equal(refundFor(due, completesOn(start, 1)), 0, 'after the first day the diggers have started');
}

export function runGroundworksScenarios() {
	islandScenarios();
	dredgeScenarios();
	shelfScenario();
	completionScenarios();
	console.log('groundworks:', { island: GetGroundworksQuote(island, lake, swims, []), dredge: GetGroundworksQuote(dredge, lake, swims, []).effects });
}
