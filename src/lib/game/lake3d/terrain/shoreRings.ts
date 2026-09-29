import type { WorldPoint } from '../lakeFrame';

export interface ShoreEdge {
	ring: number;
	index: number;
	startX: number;
	startZ: number;
	spanX: number;
	spanZ: number;
	lengthSquared: number;
	outward: WorldPoint;
}

export interface ShoreRing {
	points: WorldPoint[];
	isIsland: boolean;
	edges: ShoreEdge[];
	cornerOutwards: WorldPoint[];
}

function signedArea(points: WorldPoint[]) {
	return points.reduce((sum, point, index) => {
		const next = points[(index + 1) % points.length];
		return sum + point.x * next.z - next.x * point.z;
	}, 0);
}

function edgesOf(points: WorldPoint[], ring: number): ShoreEdge[] {
	const turn = Math.sign(signedArea(points)) || 1;
	return points.map((start, index) => {
		const end = points[(index + 1) % points.length];
		const spanX = end.x - start.x;
		const spanZ = end.z - start.z;
		const length = Math.hypot(spanX, spanZ) || 1;
		const outward = { x: (spanZ / length) * turn, z: (-spanX / length) * turn };
		return { ring, index, startX: start.x, startZ: start.z, spanX, spanZ, lengthSquared: spanX * spanX + spanZ * spanZ || 1, outward };
	});
}

function cornerOutwardsOf(edges: ShoreEdge[]): WorldPoint[] {
	return edges.map((edge, index) => {
		const before = edges[(index + edges.length - 1) % edges.length].outward;
		const after = edge.outward;
		return { x: before.x + after.x, z: before.z + after.z };
	});
}

export function shoreRingOf(points: WorldPoint[], isIsland: boolean, ring: number): ShoreRing {
	const edges = edgesOf(points, ring);
	return { points, isIsland, edges, cornerOutwards: cornerOutwardsOf(edges) };
}

export function outwardAt(ring: ShoreRing, edge: ShoreEdge, along: number): WorldPoint {
	const corners = ring.cornerOutwards;
	if (along <= 0) return corners[edge.index];
	if (along >= 1) return corners[(edge.index + 1) % corners.length];
	return edge.outward;
}
