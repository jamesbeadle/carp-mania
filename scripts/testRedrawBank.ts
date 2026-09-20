import assert from 'node:assert/strict';
import { anchorOnBank } from '../src/lib/domain/groundworks/bankAnchor';
import { redrawBank } from '../src/lib/domain/groundworks/redrawBank';
import type { LayoutPoint } from '../src/lib/domain/layout/layoutTypes';
import { isPointInPolygon } from '../src/lib/domain/layout/pointInPolygon';
import { polygonAreaFraction } from '../src/lib/domain/layout/polygonArea';
import { classicLake } from '../src/lib/domain/sites/classicSite';

const Scene = { Width: 960, Height: 640 } as const;
const GrabRadius = 18;
const distance = (first: LayoutPoint, second: LayoutPoint) => Math.hypot((first.x - second.x) * Scene.Width, (first.y - second.y) * Scene.Height);

export function runRedrawBankScenarios() {
	const outline = classicLake('owner-1', 'Redrawn Water', new Date('2026-01-01T00:00:00Z')).layout.outline;
	const [first, second] = [outline[1], outline[3]];
	const start = anchorOnBank(outline, nudged(first), GrabRadius, distance);
	const end = anchorOnBank(outline, nudged(second), GrabRadius, distance);
	assert.ok(start && end, 'clicks near the shoreline find an anchor');
	assert.equal(anchorOnBank(outline, { x: 0.5, y: 0.5 }, GrabRadius, distance), null, 'a click in the middle of the lake finds nothing');
	const rounded = redrawBank(outline, start!, [], end!, distance);
	assert.ok(rounded.length >= outline.length - 1, 'a two-click redraw keeps the rest of the bank');
	assert.ok(!rounded.some((vertex) => vertex === outline[2]), 'the vertex between the two clicks is gone');
	assert.ok(Math.abs(polygonAreaFraction(rounded) - polygonAreaFraction(outline)) < polygonAreaFraction(outline) * 0.2, 'a rounded stretch keeps roughly the same water');
	const drawn = redrawBank(outline, start!, [{ x: 0.5, y: 0.5 }], end!, distance);
	assert.ok(isPointInPolygon({ x: 0.5, y: 0.52 }, drawn) !== isPointInPolygon({ x: 0.5, y: 0.52 }, outline) || drawn.length > outline.length, 'a drawn path moves the bank to where it was drawn');
	console.log('redraw bank:', { before: outline.length, rounded: rounded.length, drawn: drawn.length });
}

function nudged(point: LayoutPoint): LayoutPoint {
	return { x: point.x + 0.004, y: point.y };
}
