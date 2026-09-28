import type { ClearSpot } from '../bank/facilityGrounds';
import { metresBetween, type WorldPoint } from '../lakeFrame';
import { distanceToOutline, isInsideOutline } from '../worldGeometry';
import { treeAt, type PlantedTree } from './plantedTree';
import { woodlandDensityAt } from './woodlandDensity';

export interface UnderstoreyGround {
	outline: WorldPoint[];
	keepClear: ClearSpot[];
	edge: WorldPoint;
}

const Understorey = { Attempts: 3000, MostBushes: 700, NearestWater: 3.5, FarthestWater: 75, ClearOfBankside: 3, BankHugging: 0.3, HuggingReach: 16 } as const;

function isClearOf(point: WorldPoint, keepClear: ClearSpot[]) {
	return keepClear.every((spot) => metresBetween(spot.point, point) > spot.radius + Understorey.ClearOfBankside);
}

function bushinessAt(point: WorldPoint, fromWater: number) {
	const isHuggingTheBank = fromWater < Understorey.HuggingReach;
	return woodlandDensityAt(point) + (isHuggingTheBank ? Understorey.BankHugging : 0);
}

function isBushyGround(point: WorldPoint, ground: UnderstoreyGround, random: () => number) {
	if (isInsideOutline(point, ground.outline)) return false;
	const fromWater = distanceToOutline(point, ground.outline);
	const isOnTheBank = fromWater > Understorey.NearestWater && fromWater < Understorey.FarthestWater;
	return isOnTheBank && isClearOf(point, ground.keepClear) && random() < bushinessAt(point, fromWater);
}

export function plantTheUnderstorey(ground: UnderstoreyGround, random: () => number) {
	const { edge } = ground;
	const bushes: PlantedTree[] = [];
	for (let attempt = 0; attempt < Understorey.Attempts && bushes.length < Understorey.MostBushes; attempt++) {
		const point = { x: (random() * 2 - 1) * edge.x, z: (random() * 2 - 1) * edge.z };
		if (!isBushyGround(point, ground, random)) continue;
		bushes.push(treeAt('bush', point, random));
	}
	return bushes;
}
