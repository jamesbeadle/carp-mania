import { seededRandom } from '$lib/domain/random';
import type { ClearSpot } from '../bank/facilityGrounds';
import { metresBetween, type WorldPoint } from '../lakeFrame';
import type { Country } from '../terrain/lakeLand';
import { distanceToOutline, isInsideOutline } from '../worldGeometry';
import { plantTheCountry } from './countryTrees';
import { treeAt, type PlantedTree, type TreeKind } from './plantedTree';
import { plantTheUnderstorey } from './understorey';
import { woodlandDensityAt } from './woodlandDensity';

export interface PlantingGround {
	outline: WorldPoint[];
	islands: WorldPoint[][];
	keepClear: ClearSpot[];
	plotReach: number;
	plotEdge: WorldPoint | null;
	seed: number;
}

const Planting = { SetbackFromWater: 9, WillowReach: 7, ClearOfBankside: 6, SpreadOfPlot: 1.35, Attempts: 5200, MostTrees: 1100, IslandTreesPerSquareMetre: 0.004, IslandEdgeSetback: 2.5 } as const;
const PoplarShare = 0.28;

function isClearOfBankside(point: WorldPoint, keepClear: ClearSpot[]) {
	return keepClear.every((spot) => metresBetween(spot.point, point) > spot.radius + Planting.ClearOfBankside);
}

function bankTreeKind(distanceFromWater: number, random: () => number): TreeKind {
	if (distanceFromWater < Planting.WillowReach + Planting.SetbackFromWater) return 'willow';
	return random() < PoplarShare ? 'poplar' : 'broadleaf';
}

function edgeOf(ground: PlantingGround) {
	return ground.plotEdge ?? { x: (ground.plotReach * Planting.SpreadOfPlot) / 2, z: (ground.plotReach * Planting.SpreadOfPlot) / 2 };
}

function plantTheBank(ground: PlantingGround, random: () => number) {
	const edge = edgeOf(ground);
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
		if (!isOnTheIsland) continue;
		trees.push(treeAt(random() < PoplarShare ? 'poplar' : 'broadleaf', point, random));
	}
	return trees;
}

export interface Woodland {
	onTheBank: PlantedTree[];
	onTheIslands: PlantedTree[];
	inTheCountry: PlantedTree[];
}

export function plantTrees(ground: PlantingGround, country: Country | null): Woodland {
	const random = seededRandom(ground.seed);
	const inTheCountry = country ? plantTheCountry(country, ground.seed) : [];
	const onTheBank = [...plantTheBank(ground, random), ...plantTheUnderstorey({ outline: ground.outline, keepClear: ground.keepClear, edge: edgeOf(ground) }, random)];
	return { onTheBank, onTheIslands: ground.islands.flatMap((points) => plantAnIsland(points, random)), inTheCountry };
}
