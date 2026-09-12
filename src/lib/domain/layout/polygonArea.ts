import type { LayoutPoint } from './layoutTypes';

export function polygonAreaFraction(points: LayoutPoint[]) {
	if (points.length < 3) return 0;
	let twiceArea = 0;
	for (let index = 0; index < points.length; index++) {
		const current = points[index];
		const next = points[(index + 1) % points.length];
		twiceArea += current.x * next.y - next.x * current.y;
	}
	return Math.abs(twiceArea) / 2;
}

export function polygonCentroid(points: LayoutPoint[]): LayoutPoint {
	const total = points.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
	return { x: total.x / points.length, y: total.y / points.length };
}

export function polylineLengthFraction(points: LayoutPoint[]) {
	let length = 0;
	for (let index = 1; index < points.length; index++) length += Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
	return length;
}
