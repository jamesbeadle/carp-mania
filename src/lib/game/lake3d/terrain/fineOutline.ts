import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { worldPointOf, type LakeFrame, type WorldPoint } from '../lakeFrame';

const Fineness = { LongestChordMetres: 2.5, FewestPerCorner: 2 } as const;
const MinimumPolygonPoints = 3;

function midpoint(first: WorldPoint, second: WorldPoint): WorldPoint {
	return { x: (first.x + second.x) / 2, z: (first.z + second.z) / 2 };
}

function quadraticAt(start: WorldPoint, control: WorldPoint, end: WorldPoint, t: number): WorldPoint {
	const rest = 1 - t;
	const x = rest * rest * start.x + 2 * rest * t * control.x + t * t * end.x;
	const z = rest * rest * start.z + 2 * rest * t * control.z + t * t * end.z;
	return { x, z };
}

function cornerSamples(start: WorldPoint, control: WorldPoint, end: WorldPoint) {
	const length = Math.hypot(control.x - start.x, control.z - start.z) + Math.hypot(end.x - control.x, end.z - control.z);
	const count = Math.max(Fineness.FewestPerCorner, Math.ceil(length / Fineness.LongestChordMetres));
	return Array.from({ length: count }, (_, index) => quadraticAt(start, control, end, index / count));
}

export function fineWorldOutline(frame: LakeFrame, fractions: LayoutPoint[]): WorldPoint[] {
	const corners = fractions.map((fraction) => worldPointOf(frame, fraction));
	if (corners.length < MinimumPolygonPoints) return corners;
	const count = corners.length;
	return corners.flatMap((corner, index) => {
		const control = corners[(index + 1) % count];
		return cornerSamples(midpoint(corner, control), control, midpoint(control, corners[(index + 2) % count]));
	});
}
