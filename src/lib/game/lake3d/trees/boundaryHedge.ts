import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { isClearOfBankside } from './bankClearance';
import { treeAt, type PlantedTree } from './plantedTree';
import type { PlantingGround } from './treePlanting';
import type { WaterEdge } from './waterEdge';

const Hedge = { Kind: 'holly', Spacing: 3.3, Inset: 1.5, InsetRange: 3, Along: 0.8, Growth: 1.8 } as const;

function sidePoints(from: WorldPoint, to: WorldPoint, random: RandomFraction): WorldPoint[] {
	const length = Math.hypot(to.x - from.x, to.z - from.z);
	const count = Math.floor(length / Hedge.Spacing);
	return Array.from({ length: count }, (_, index) => {
		const share = (index + random() * Hedge.Along) / count;
		return { x: from.x + (to.x - from.x) * share, z: from.z + (to.z - from.z) * share };
	});
}

function insetFrom(point: WorldPoint, random: RandomFraction): WorldPoint {
	const inset = Hedge.Inset + random() * Hedge.InsetRange;
	return { x: point.x - Math.sign(point.x) * inset, z: point.z - Math.sign(point.z) * inset };
}

export function plantBoundaryHedge(ground: PlantingGround, water: WaterEdge, edge: WorldPoint, random: RandomFraction): PlantedTree[] {
	const corners: WorldPoint[] = [{ x: -edge.x, z: -edge.z }, { x: edge.x, z: -edge.z }, { x: edge.x, z: edge.z }, { x: -edge.x, z: edge.z }];
	const points = corners.flatMap((corner, index) => sidePoints(corner, corners[(index + 1) % corners.length], random)).map((point) => insetFrom(point, random));
	return points
		.filter((point) => water.isOnLand(point))
		.map((point) => treeAt(Hedge.Kind, point, water.metresFromWater(point), water, random))
		.map((shrub) => ({ ...shrub, height: shrub.height * Hedge.Growth }))
		.filter((shrub) => isClearOfBankside(shrub, ground.keepClear));
}
