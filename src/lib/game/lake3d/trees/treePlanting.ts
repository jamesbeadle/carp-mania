import { seededRandom } from '$lib/domain/random';
import type { ClearSpot } from '../bank/facilityGrounds';
import { metresBetween, type WorldPoint } from '../lakeFrame';
import { distanceToOutline, isInsideOutline } from '../worldGeometry';

export type TreeKind = 'poplar' | 'broadleaf' | 'willow';

export interface PlantedTree {
	kind: TreeKind;
	point: WorldPoint;
	height: number;
	turn: number;
}

export interface PlantingGround {
	outline: WorldPoint[];
	islands: WorldPoint[][];
	keepClear: ClearSpot[];
	plotReach: number;
	plotEdge: WorldPoint | null;
	seed: number;
}

const Planting = { SetbackFromWater: 9, WillowReach: 7, ClearOfBankside: 6, SpreadOfPlot: 1.35, Attempts: 5200, MostTrees: 1100, IslandTreesPerSquareMetre: 0.004, IslandEdgeSetback: 2.5 } as const;
const TreeHeights: Record<TreeKind, { least: number; range: number }> = { poplar: { least: 16, range: 10 }, broadleaf: { least: 9, range: 8 }, willow: { least: 7, range: 4 } };
const PoplarShare = 0.28;

const Clumping = { Wavelength: 45, Clearing: 0.35 } as const;

function woodlandDensityAt(point: WorldPoint) {
	const wave = Math.sin(point.x / Clumping.Wavelength) * Math.cos(point.z / (Clumping.Wavelength * 0.7)) + Math.sin((point.x + point.z) / (Clumping.Wavelength * 1.9));
	return Math.min(1, Math.max(0, wave * 0.5 + Clumping.Clearing));
}

function treeAt(kind: TreeKind, point: WorldPoint, random: () => number): PlantedTree {
	const heights = TreeHeights[kind];
	return { kind, point, height: heights.least + random() * heights.range, turn: random() * Math.PI * 2 };
}

function isClearOfBankside(point: WorldPoint, keepClear: ClearSpot[]) {
	return keepClear.every((spot) => metresBetween(spot.point, point) > spot.radius + Planting.ClearOfBankside);
}

function bankTreeKind(distanceFromWater: number, random: () => number): TreeKind {
	if (distanceFromWater < Planting.WillowReach + Planting.SetbackFromWater) return 'willow';
	return random() < PoplarShare ? 'poplar' : 'broadleaf';
}

function plantTheBank(ground: PlantingGround, random: () => number) {
	const edge = ground.plotEdge ?? { x: (ground.plotReach * Planting.SpreadOfPlot) / 2, z: (ground.plotReach * Planting.SpreadOfPlot) / 2 };
	const trees: PlantedTree[] = [];
	for (let attempt = 0; attempt < Planting.Attempts && trees.length < Planting.MostTrees; attempt++) {
		const point = { x: (random() * 2 - 1) * edge.x, z: (random() * 2 - 1) * edge.z };
		if (isInsideOutline(point, ground.outline)) continue;
		const distanceFromWater = distanceToOutline(point, ground.outline);
		const isTooClose = distanceFromWater < Planting.SetbackFromWater || !isClearOfBankside(point, ground.keepClear);
		if (isTooClose || random() > woodlandDensityAt(point)) continue;
		trees.push(treeAt(bankTreeKind(distanceFromWater, random), point, random));
	}
	return trees;
}

function plantAnIsland(points: WorldPoint[], random: () => number) {
	const xs = points.map((point) => point.x);
	const zs = points.map((point) => point.z);
	const least = { x: Math.min(...xs), z: Math.min(...zs) };
	const size = { x: Math.max(...xs) - least.x, z: Math.max(...zs) - least.z };
	const attempts = Math.ceil(size.x * size.z * Planting.IslandTreesPerSquareMetre * 2) + 3;
	const trees: PlantedTree[] = [];
	for (let attempt = 0; attempt < attempts; attempt++) {
		const point = { x: least.x + random() * size.x, z: least.z + random() * size.z };
		const isOnTheIsland = isInsideOutline(point, points) && distanceToOutline(point, points) > Planting.IslandEdgeSetback;
		if (isOnTheIsland) trees.push(treeAt(random() < PoplarShare ? 'poplar' : 'broadleaf', point, random));
	}
	return trees;
}

export interface Woodland {
	onTheBank: PlantedTree[];
	onTheIslands: PlantedTree[];
}

export function plantTrees(ground: PlantingGround): Woodland {
	const random = seededRandom(ground.seed);
	return { onTheBank: plantTheBank(ground, random), onTheIslands: ground.islands.flatMap((points) => plantAnIsland(points, random)) };
}
