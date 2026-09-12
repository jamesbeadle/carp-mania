import type { Point } from '../scene/lakeShape';

export function pointsAlongPolyline(points: Point[], spacing: number): Point[] {
	const placed: Point[] = [];
	let distanceToNext = 0;
	for (let index = 1; index < points.length; index++) {
		const from = points[index - 1];
		const to = points[index];
		const length = Math.hypot(to.x - from.x, to.y - from.y);
		if (length === 0) continue;
		let along = distanceToNext;
		while (along <= length) {
			placed.push(pointAlong(from, to, along / length));
			along += spacing;
		}
		distanceToNext = along - length;
	}
	return placed;
}

function pointAlong(from: Point, to: Point, fraction: number): Point {
	return { x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction };
}
