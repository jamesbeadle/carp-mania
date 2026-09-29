import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { isClearOfBankside } from './bankClearance';
import { treeAt, type PlantedTree } from './plantedTree';
import { shoreCandidates } from './shoreCandidates';
import type { PlantingGround } from './treePlanting';
import type { WaterEdge } from './waterEdge';
import type { WoodlandFields } from './woodlandFields';

const Understorey = { Kind: 'holly', NearestWater: 13, FarthestWater: 60, Density: 0.9, Clearing: 0.25, MostShareOfCandidates: 0.5 } as const;

function isInTheBand(point: WorldPoint, water: WaterEdge, edge: WorldPoint) {
	const isOnThePlot = Math.abs(point.x) < edge.x && Math.abs(point.z) < edge.z;
	if (!isOnThePlot || !water.isOnLand(point)) return false;
	const distanceFromWater = water.metresFromWater(point);
	return distanceFromWater > Understorey.NearestWater && distanceFromWater < Understorey.FarthestWater;
}

export function plantUnderstorey(ground: PlantingGround, water: WaterEdge, edge: WorldPoint, fields: WoodlandFields, random: RandomFraction): PlantedTree[] {
	const candidates = shoreCandidates(ground.outline, Understorey.FarthestWater, random);
	const mostShrubs = candidates.length * Understorey.MostShareOfCandidates;
	const shrubs: PlantedTree[] = [];
	for (const point of candidates) {
		if (shrubs.length >= mostShrubs) break;
		const chance = (fields.density(point) - Understorey.Clearing) * Understorey.Density;
		if (random() > chance || !isInTheBand(point, water, edge)) continue;
		const shrub = treeAt(Understorey.Kind, point, water.metresFromWater(point), water, random);
		if (isClearOfBankside(shrub, ground.keepClear)) shrubs.push(shrub);
	}
	return shrubs;
}
