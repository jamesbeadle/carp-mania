import type { WorldPoint } from '../lakeFrame';

export interface Bounds {
	least: WorldPoint;
	most: WorldPoint;
}

export function boundsOf(points: WorldPoint[]): Bounds {
	const xs = points.map((point) => point.x);
	const zs = points.map((point) => point.z);
	return { least: { x: Math.min(...xs), z: Math.min(...zs) }, most: { x: Math.max(...xs), z: Math.max(...zs) } };
}

export function distanceOutside(point: WorldPoint, bounds: Bounds) {
	const { least, most } = bounds;
	const across = Math.max(least.x - point.x, 0, point.x - most.x);
	const down = Math.max(least.z - point.z, 0, point.z - most.z);
	return Math.hypot(across, down);
}
