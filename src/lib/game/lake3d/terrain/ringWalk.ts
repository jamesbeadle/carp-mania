import type { WorldPoint } from '../lakeFrame';

export interface RingStation {
	point: WorldPoint;
	landward: WorldPoint;
}

const SmoothingMetres = 2.5;

function lengthsAlong(points: WorldPoint[]) {
	const lengths = [0];
	points.forEach((point, index) => {
		const next = points[(index + 1) % points.length];
		lengths.push(lengths[index] + Math.hypot(next.x - point.x, next.z - point.z));
	});
	return lengths;
}

function evenPoints(points: WorldPoint[], spacing: number) {
	const lengths = lengthsAlong(points);
	const total = lengths[points.length];
	const count = Math.max(points.length, Math.round(total / spacing));
	let edge = 0;
	return Array.from({ length: count }, (_, index) => {
		const distance = (index / count) * total;
		while (lengths[edge + 1] < distance) edge++;
		const start = points[edge];
		const end = points[(edge + 1) % points.length];
		const share = (distance - lengths[edge]) / Math.max(1e-9, lengths[edge + 1] - lengths[edge]);
		return { x: start.x + (end.x - start.x) * share, z: start.z + (end.z - start.z) * share };
	});
}

function smoothedTangent(points: WorldPoint[], index: number, reach: number) {
	const count = points.length;
	const behind = points[(index - reach + count * reach) % count];
	const ahead = points[(index + reach) % count];
	const length = Math.hypot(ahead.x - behind.x, ahead.z - behind.z) || 1;
	return { x: (ahead.x - behind.x) / length, z: (ahead.z - behind.z) / length };
}

function turnOf(points: WorldPoint[]) {
	const area = points.reduce((sum, point, index) => {
		const next = points[(index + 1) % points.length];
		return sum + point.x * next.z - next.x * point.z;
	}, 0);
	return Math.sign(area) || 1;
}

export function stationsAround(points: WorldPoint[], isIsland: boolean, spacing: number): RingStation[] {
	const stations = evenPoints(points, spacing);
	const reach = Math.max(1, Math.round(SmoothingMetres / spacing));
	const landwardTurn = turnOf(points) * (isIsland ? -1 : 1);
	return stations.map((point, index) => {
		const tangent = smoothedTangent(stations, index, reach);
		return { point, landward: { x: tangent.z * landwardTurn, z: -tangent.x * landwardTurn } };
	});
}
