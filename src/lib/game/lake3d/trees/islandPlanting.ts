import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { distanceToOutline, isInsideOutline } from '../worldGeometry';
import { treeAt, type PlantedTree } from './plantedTree';
import { Bands, kindFor } from './speciesChoice';
import type { WoodlandFields } from './woodlandFields';

const Islands = { TreesPerSquareMetre: 0.006, EdgeSetback: 2.5, Waterside: 5 } as const;

export function plantAnIsland(points: WorldPoint[], fields: WoodlandFields, random: RandomFraction) {
	const xs = points.map((point) => point.x);
	const zs = points.map((point) => point.z);
	const least = { x: Math.min(...xs), z: Math.min(...zs) };
	const size = { x: Math.max(...xs) - least.x, z: Math.max(...zs) - least.z };
	const attempts = Math.ceil(size.x * size.z * Islands.TreesPerSquareMetre * 2) + 3;
	const trees: PlantedTree[] = [];
	for (let attempt = 0; attempt < attempts; attempt++) {
		const point = { x: least.x + random() * size.x, z: least.z + random() * size.z };
		const fromEdge = distanceToOutline(point, points);
		if (!isInsideOutline(point, points) || fromEdge < Islands.EdgeSetback) continue;
		const kind = fromEdge < Islands.Waterside ? kindFor(point, Bands.OtherKindsFromWater - 1, fields, random) : kindFor(point, Bands.Waterside, fields, random);
		trees.push(treeAt(kind, point, fromEdge, points, random));
	}
	return trees;
}
