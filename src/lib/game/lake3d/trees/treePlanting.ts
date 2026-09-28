import { seededRandom, type RandomFraction } from '$lib/domain/random';
import type { ClearSpot } from '../bank/facilityGrounds';
import { metresBetween, type WorldPoint } from '../lakeFrame';
import { distanceToOutline, isInsideOutline } from '../worldGeometry';
import { Bands, kindFor } from './speciesChoice';
import { TreeHeights, type TreeKind } from './treeKinds';
import { leanOf } from './treeLean';
import { woodlandFields, type WoodlandFields } from './woodlandFields';

export type { TreeKind } from './treeKinds';

export interface PlantedTree {
	kind: TreeKind;
	point: WorldPoint;
	height: number;
	turn: number;
	lean: number;
	leanHeading: number;
	girth: number;
	pick: number;
}

export interface PlantingGround {
	outline: WorldPoint[];
	islands: WorldPoint[][];
	keepClear: ClearSpot[];
	plotReach: number;
	plotEdge: WorldPoint | null;
	seed: number;
}

const Planting = { ClearOfBankside: 6, SpreadOfPlot: 1.35, Attempts: 20000, MostTrees: 2600, TreeLineReach: 42, TreeLineDensity: 0.95, TreeLineFloor: 0.45 } as const;
const Girth = { Least: 0.82, Range: 0.36 } as const;
const Density = { Clearing: 0.3, Contrast: 1.6, DeepWoodsFrom: 110, DeepWoodsShare: 0.6 } as const;

function densityAt(point: WorldPoint, distanceFromWater: number, fields: WoodlandFields) {
	const depthShare = distanceFromWater > Density.DeepWoodsFrom ? Density.DeepWoodsShare : 1;
	const woods = (fields.density(point) - Density.Clearing) * Density.Contrast * depthShare;
	const lineShare = Planting.TreeLineFloor + (1 - Planting.TreeLineFloor) * fields.treeLine(point);
	const treeLine = distanceFromWater < Planting.TreeLineReach ? Planting.TreeLineDensity * lineShare + woods / 2 : 0;
	return Math.min(1, Math.max(0, woods, treeLine));
}

function treeAt(kind: TreeKind, point: WorldPoint, distanceFromWater: number, outline: WorldPoint[], random: RandomFraction): PlantedTree {
	const heights = TreeHeights[kind];
	const height = heights.least + random() * heights.range;
	const lean = leanOf(kind, point, distanceFromWater, outline, random);
	return { kind, point, height, turn: random() * Math.PI * 2, ...lean, girth: Girth.Least + random() * Girth.Range, pick: random() };
}

function isClearOfBankside(point: WorldPoint, keepClear: ClearSpot[]) {
	return keepClear.every((spot) => metresBetween(spot.point, point) > spot.radius + Planting.ClearOfBankside);
}

function plantTheBank(ground: PlantingGround, fields: WoodlandFields, random: RandomFraction) {
	const edge = ground.plotEdge ?? { x: (ground.plotReach * Planting.SpreadOfPlot) / 2, z: (ground.plotReach * Planting.SpreadOfPlot) / 2 };
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

const Islands = { TreesPerSquareMetre: 0.006, EdgeSetback: 2.5, Waterside: 5 } as const;

function plantAnIsland(points: WorldPoint[], fields: WoodlandFields, random: RandomFraction) {
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

export interface Woodland {
	onTheBank: PlantedTree[];
	onTheIslands: PlantedTree[];
}

export function plantTrees(ground: PlantingGround): Woodland {
	const random = seededRandom(ground.seed);
	const fields = woodlandFields(random);
	return { onTheBank: plantTheBank(ground, fields, random), onTheIslands: ground.islands.flatMap((points) => plantAnIsland(points, fields, random)) };
}
