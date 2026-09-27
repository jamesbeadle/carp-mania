import type { WorldPoint } from './lakeFrame';

function distanceToSegment(point: WorldPoint, start: WorldPoint, end: WorldPoint) {
	const spanX = end.x - start.x;
	const spanZ = end.z - start.z;
	const lengthSquared = spanX * spanX + spanZ * spanZ;
	const along = lengthSquared === 0 ? 0 : ((point.x - start.x) * spanX + (point.z - start.z) * spanZ) / lengthSquared;
	const clamped = Math.min(1, Math.max(0, along));
	return Math.hypot(point.x - (start.x + clamped * spanX), point.z - (start.z + clamped * spanZ));
}

export function distanceToOutline(point: WorldPoint, outline: WorldPoint[]) {
	return outline.reduce((nearest, start, index) => Math.min(nearest, distanceToSegment(point, start, outline[(index + 1) % outline.length])), Infinity);
}

export function isInsideOutline(point: WorldPoint, outline: WorldPoint[]) {
	let isInside = false;
	for (let index = 0, previous = outline.length - 1; index < outline.length; previous = index++) {
		const current = outline[index];
		const before = outline[previous];
		const crossesRay = current.z > point.z !== before.z > point.z;
		if (!crossesRay) continue;
		const crossingX = ((before.x - current.x) * (point.z - current.z)) / (before.z - current.z) + current.x;
		if (point.x < crossingX) isInside = !isInside;
	}
	return isInside;
}

export function centreOf(points: WorldPoint[]): WorldPoint {
	const total = points.reduce((sum, point) => ({ x: sum.x + point.x, z: sum.z + point.z }), { x: 0, z: 0 });
	return { x: total.x / Math.max(1, points.length), z: total.z / Math.max(1, points.length) };
}

export function headingFrom(from: WorldPoint, to: WorldPoint) {
	return Math.atan2(to.x - from.x, to.z - from.z);
}

export function pointToward(from: WorldPoint, heading: number, metres: number): WorldPoint {
	return { x: from.x + Math.sin(heading) * metres, z: from.z + Math.cos(heading) * metres };
}
