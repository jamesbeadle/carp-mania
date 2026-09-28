import { seededRandom, type RandomFraction } from '$lib/domain/random';
import type { ClearSpot } from '../bank/facilityGrounds';
import { metresBetween, type WorldPoint } from '../lakeFrame';
import { distanceToOutline, isInsideOutline } from '../worldGeometry';
import { plantAnIsland } from './islandPlanting';
import { treeAt, type PlantedTree } from './plantedTree';
import { Bands, kindFor } from './speciesChoice';
import { woodlandFields, type WoodlandFields } from './woodlandFields';

export type { TreeKind } from './treeKinds';
export type { PlantedTree } from './plantedTree';

export interface PlantingGround {
	outline: WorldPoint[];
	islands: WorldPoint[][];
	keepClear: ClearSpot[];
	plotReach: number;
	plotEdge: WorldPoint | null;
	seed: number;
}

const Planting = { ClearOfBankside: 6, SpreadOfPlot: 1.35, Attempts: 20000, MostTrees: 2600, TreeLineReach: 42, TreeLineDensity: 0.95, TreeLineFloor: 0.45, CrownClearOfEdge: 7 } as const;
const Density = { Clearing: 0.3, Contrast: 1.6, DeepWoodsFrom: 110, DeepWoodsShare: 0.6 } as const;

function densityAt(point: WorldPoint, distanceFromWater: number, fields: WoodlandFields) {
	const depthShare = distanceFromWater > Density.DeepWoodsFrom ? Density.DeepWoodsShare : 1;
	const woods = (fields.density(point) - Density.Clearing) * Density.Contrast * depthShare;
	const lineShare = Planting.TreeLineFloor + (1 - Planting.TreeLineFloor) * fields.treeLine(point);
	const treeLine = distanceFromWater < Planting.TreeLineReach ? Planting.TreeLineDensity * lineShare + woods / 2 : 0;
	return Math.min(1, Math.max(0, woods, treeLine));
}

function isClearOfBankside(point: WorldPoint, keepClear: ClearSpot[]) {
	return keepClear.every((spot) => metresBetween(spot.point, point) > spot.radius + Planting.ClearOfBankside);
}

function plantableEdgeOf(ground: PlantingGround): WorldPoint {
	const { plotEdge } = ground;
	const spread = (ground.plotReach * Planting.SpreadOfPlot) / 2;
	if (!plotEdge) return { x: spread, z: spread };
	return { x: plotEdge.x - Planting.CrownClearOfEdge, z: plotEdge.z - Planting.CrownClearOfEdge };
}

function plantTheBank(ground: PlantingGround, fields: WoodlandFields, random: RandomFraction) {
	const edge = plantableEdgeOf(ground);
	const trees: PlantedTree[] = [];
	for (let attempt = 0; attempt < Planting.Attempts && trees.length < Planting.MostTrees; attempt++) {
		const point = { x: (random() * 2 - 1) * edge.x, z: (random() * 2 - 1) * edge.z };
		if (isInsideOutline(point, ground.outline)) continue;
		const distanceFromWater = distanceToOutline(point, ground.outline);
		const isTooClose = distanceFromWater < Bands.NearestWater || !isClearOfBankside(point, ground.keepClear);
		if (isTooClose || random() > densityAt(point, distanceFromWater, fields)) continue;
		trees.push(treeAt(kindFor(point, distanceFromWater, fields, random), point, distanceFromWater, ground.outline, random));
	}
	return trees;
}

export interface Woodland {
	onTheBank: PlantedTree[];
	onTheIslands: PlantedTree[];
}

export function plantTrees(ground: PlantingGround): Woodland {
	const random = seededRandom(ground.seed);
	const fields = woodlandFields(random);
	return { onTheBank: plantTheBank(ground, fields, random), onTheIslands: ground.islands.flatMap((points) => plantAnIsland(points, fields, random)) };
}
