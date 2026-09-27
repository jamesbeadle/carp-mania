import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';

const SamplesPerCorner = 6;
const MinimumPolygonPoints = 3;

function midpoint(first: LayoutPoint, second: LayoutPoint): LayoutPoint {
	return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
}

function quadraticAt(start: LayoutPoint, control: LayoutPoint, end: LayoutPoint, t: number): LayoutPoint {
	const rest = 1 - t;
	const x = rest * rest * start.x + 2 * rest * t * control.x + t * t * end.x;
	const y = rest * rest * start.y + 2 * rest * t * control.y + t * t * end.y;
	return { x, y };
}

function cornerSamples(start: LayoutPoint, control: LayoutPoint, end: LayoutPoint) {
	return Array.from({ length: SamplesPerCorner }, (_, index) => quadraticAt(start, control, end, index / SamplesPerCorner));
}

export function smoothOutline(points: LayoutPoint[]): LayoutPoint[] {
	if (points.length < MinimumPolygonPoints) return points;
	const count = points.length;
	return points.flatMap((_, index) => {
		const control = points[(index + 1) % count];
		const start = midpoint(points[index], control);
		const end = midpoint(control, points[(index + 2) % count]);
		return cornerSamples(start, control, end);
	});
}
