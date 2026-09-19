import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import { islandPathsFrom, isInsideWater, isPointInScenePath, lakePathFrom, type Point } from './lakeShape';

export function isPointInWater(context: CanvasRenderingContext2D, layout: LakeLayout, point: Point) {
	return isInsideWater(context, lakePathFrom(layout), islandPathsFrom(layout), point);
}

const CastLineSamples = 40;

function pointAlong(from: Point, to: Point, fraction: number): Point {
	const x = from.x + (to.x - from.x) * fraction;
	const y = from.y + (to.y - from.y) * fraction;
	return { x, y };
}

export function isCastClearOfIslands(context: CanvasRenderingContext2D, layout: LakeLayout, from: Point, to: Point) {
	const islands = islandPathsFrom(layout);
	for (let step = 1; step < CastLineSamples; step++) {
		const fraction = step / CastLineSamples;
		const sample = pointAlong(from, to, fraction);
		if (islands.some((island) => isPointInScenePath(context, island, sample))) return false;
	}
	return true;
}
