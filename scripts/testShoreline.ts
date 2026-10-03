import assert from 'node:assert/strict';
import { isWorkDraft } from '../src/lib/domain/groundworks/isWorkDraft';
import { GetGroundworksQuote } from '../src/lib/domain/groundworks/quote';
import { evenlySpaced, spacingFor } from '../src/lib/domain/groundworks/shoreline/bankSpacing';
import { drawnBankOf } from '../src/lib/domain/groundworks/shoreline/drawnBank';
import { pushBank, smoothBank } from '../src/lib/domain/groundworks/shoreline/sculptBank';
import { doesBankCrossItself } from '../src/lib/domain/groundworks/shoreline/shorelineGuards';
import { siteOf, sitesOf } from '../src/lib/domain/groundworks/sites/sitesOf';
import type { LayoutPoint } from '../src/lib/domain/layout/layoutTypes';
import { waterAcres } from '../src/lib/domain/layout/waterArea';
import { lakeWith, siteSwims } from './testFacilitySites';

const ScenePixels = { Width: 960, Height: 640 } as const;
const sceneDistance = (first: LayoutPoint, second: LayoutPoint) => Math.hypot((first.x - second.x) * ScenePixels.Width, (first.y - second.y) * ScenePixels.Height);

function spacingScenarios() {
	const lake = lakeWith([]);
	const outline = lake.layout.outline;
	const spaced = evenlySpaced(outline, spacingFor(outline, sceneDistance), sceneDistance);
	assert.ok(spaced.length > outline.length && spaced.length <= 200, `the bank is resampled evenly within the point limit: ${spaced.length}`);
	const plot = Number(lake.plot_acres);
	assert.ok(Math.abs(waterAcres({ ...lake.layout, outline: spaced }, plot) - waterAcres(lake.layout, plot)) < 0.01, 'resampling keeps the water the same');
}

function sculptScenarios() {
	const lake = lakeWith([]);
	const plot = Number(lake.plot_acres);
	const outline = drawnBankOf(lake.layout.outline, spacingFor(lake.layout.outline, sceneDistance), sceneDistance);
	const untouched = GetGroundworksQuote({ kind: 'reshape_shoreline', outline }, lake, siteSwims, []);
	assert.ok(untouched.effects.includes('Bank reworked along 0 ft'), `picking up the bank as drawn reworks none of it: ${untouched.effects.join('; ')}`);
	assert.equal(untouched.cost, 0, 'and costs nothing');
	const leftmost = outline.reduce((best, point) => (point.x < best.x ? point : best));
	const pulled = pushBank(outline, { at: leftmost, radiusScenePixels: 70 }, { x: -0.03, y: 0 }, sceneDistance);
	assert.ok(waterAcres({ ...lake.layout, outline: pulled }, plot) > waterAcres({ ...lake.layout, outline }, plot), 'pulling the bank out into the land adds water');
	const farAway = outline.find((point) => sceneDistance(point, leftmost) > 300)!;
	assert.ok(pulled.some((point) => point.x === farAway.x && point.y === farAway.y), 'the bank far from the brush stays where it was');
	const quote = GetGroundworksQuote({ kind: 'reshape_shoreline', outline: pulled }, lake, siteSwims, []);
	assert.ok(quote.effects.some((effect) => effect.startsWith('Water gained')), quote.effects.join('; '));
	assert.ok(isWorkDraft({ kind: 'reshape_shoreline', outline: pulled }), 'a sculpted bank is a work draft the order route accepts');
	const spike: LayoutPoint[] = [{ x: 0.2, y: 0.2 }, { x: 0.3, y: 0.2 }, { x: 0.35, y: 0.05 }, { x: 0.4, y: 0.2 }, { x: 0.5, y: 0.2 }, { x: 0.5, y: 0.5 }, { x: 0.2, y: 0.5 }];
	const smoothed = smoothBank(spike, { at: spike[2], radiusScenePixels: 60 }, sceneDistance);
	assert.ok(smoothed[2].y > spike[2].y, 'smoothing pulls a spike back towards its neighbours');
}

function guardScenarios() {
	const bowTie: LayoutPoint[] = [{ x: 0.2, y: 0.2 }, { x: 0.6, y: 0.6 }, { x: 0.6, y: 0.2 }, { x: 0.2, y: 0.6 }];
	assert.ok(doesBankCrossItself(bowTie), 'a bank that crosses itself is caught');
	assert.ok(!doesBankCrossItself(lakeWith([]).layout.outline), 'the classic bank does not cross itself');
	const lake = lakeWith(['lodge']);
	const lodge = siteOf(sitesOf(lake.layout, Number(lake.plot_acres), siteSwims), 'lodge')!;
	const outline = evenlySpaced(lake.layout.outline, spacingFor(lake.layout.outline, sceneDistance), sceneDistance);
	const nearest = outline.reduce((best, point) => (sceneDistance(point, lodge.centre) < sceneDistance(best, lodge.centre) ? point : best));
	const towardsTheLodge = { x: (lodge.centre.x - nearest.x) * 1.2, y: (lodge.centre.y - nearest.y) * 1.2 };
	const flooded = pushBank(outline, { at: nearest, radiusScenePixels: 60 }, towardsTheLodge, sceneDistance);
	const failures = GetGroundworksQuote({ kind: 'reshape_shoreline', outline: flooded }, lake, siteSwims, []).failures;
	assert.ok(failures.some((failure) => failure.includes('lodge')), `digging into the lodge is refused: ${failures.join('; ')}`);
}

export function runShorelineScenarios() {
	spacingScenarios();
	sculptScenarios();
	guardScenarios();
}
