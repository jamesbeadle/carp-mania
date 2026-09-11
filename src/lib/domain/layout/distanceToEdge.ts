import { feetBetween, type LayoutScale } from './layoutScale';
import type { LayoutPoint } from './layoutTypes';

export function feetToNearestEdge(scale: LayoutScale, point: LayoutPoint, polygon: LayoutPoint[], isClosed = true) {
	let nearest = Number.POSITIVE_INFINITY;
	const lastIndex = isClosed ? polygon.length : polygon.length - 1;
	for (let index = 0; index < lastIndex; index++) {
		const start = polygon[index];
		const end = polygon[(index + 1) % polygon.length];
		nearest = Math.min(nearest, feetBetween(scale, point, closestPointOnSegment(point, start, end)));
	}
	return nearest;
}

export function closestPointOnSegment(point: LayoutPoint, start: LayoutPoint, end: LayoutPoint): LayoutPoint {
	const segmentX = end.x - start.x;
	const segmentY = end.y - start.y;
	const lengthSquared = segmentX * segmentX + segmentY * segmentY;
	if (lengthSquared === 0) return start;
	const projection = ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) / lengthSquared;
	const clamped = Math.min(1, Math.max(0, projection));
	return { x: start.x + segmentX * clamped, y: start.y + segmentY * clamped };
}
