import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { polylineLengthFraction } from '$lib/domain/layout/polygonArea';

export function polylineMidpoint(points: LayoutPoint[]): LayoutPoint {
	let remaining = polylineLengthFraction(points) / 2;
	for (let index = 1; index < points.length; index++) {
		const start = points[index - 1];
		const end = points[index];
		const length = Math.hypot(end.x - start.x, end.y - start.y);
		if (remaining <= length) return alongSegment(start, end, length === 0 ? 0 : remaining / length);
		remaining -= length;
	}
	return points[points.length - 1];
}

function alongSegment(start: LayoutPoint, end: LayoutPoint, fraction: number): LayoutPoint {
	return { x: start.x + (end.x - start.x) * fraction, y: start.y + (end.y - start.y) * fraction };
}
