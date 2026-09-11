import type { Lake, Swim } from '$lib/domain/types';
import { drawAngler } from '../render/drawAngler';
import { drawBank, drawIsland } from '../render/drawBank';
import { drawFishSchool } from '../render/drawFish';
import { drawRods } from '../render/drawRods';
import { drawSwims, swimScenePoint } from '../render/drawSwims';
import { drawWater } from '../render/drawWater';
import { drawReeds, drawWeedBeds } from '../render/drawWeedAndReeds';
import { moveFishSchool, type SwimmingFish } from './fishSchool';
import { IslandPath, LakePath, lakeCentre, type Point } from './lakeShape';
import type { RodOnBank } from './rodState';

export interface SceneInput {
	lake: Lake;
	swims: Swim[];
	school: SwimmingFish[];
	selectedSwimId: string | null;
	hoveredSwimId: string | null;
	rods: RodOnBank[];
	isAnglerOnBank: boolean;
}

export function createSceneDrawer() {
	const lakePath = LakePath();
	const islandPath = IslandPath();

	return function drawScene(context: CanvasRenderingContext2D, input: SceneInput, secondsElapsed: number, timeSeconds: number) {
		const transparency = Number(input.lake.transparency);
		moveFishSchool(input.school, context, lakePath, islandPath, secondsElapsed, timeSeconds);
		drawBank(context, lakePath);
		drawWater(context, lakePath, transparency, timeSeconds);
		drawWeedBeds(context, lakePath, Number(input.lake.weed), timeSeconds);
		drawFishSchool(context, input.school, lakePath, transparency, timeSeconds);
		drawIsland(context, islandPath);
		drawReeds(context, input.swims, timeSeconds);
		drawSwims(context, input.swims, input.selectedSwimId, input.hoveredSwimId);
		drawAnglerAndRods(context, input, timeSeconds);
	};

	function drawAnglerAndRods(context: CanvasRenderingContext2D, input: SceneInput, timeSeconds: number) {
		const swim = input.swims.find((candidate) => candidate.id === input.selectedSwimId);
		if (!swim || !input.isAnglerOnBank) return;
		const position = swimScenePoint(swim);
		const centre = lakeCentre();
		drawRods(context, position, input.rods, timeSeconds);
		drawAngler(context, position, Math.atan2(centre.y - position.y, centre.x - position.x));
	}
}

export function isPointInWater(context: CanvasRenderingContext2D, x: number, y: number) {
	return context.isPointInPath(LakePath(), x, y) && !context.isPointInPath(IslandPath(), x, y);
}

const CastLineSamples = 40;

export function isCastClearOfIsland(context: CanvasRenderingContext2D, from: Point, to: Point) {
	const island = IslandPath();
	for (let step = 1; step < CastLineSamples; step++) {
		const fraction = step / CastLineSamples;
		const x = from.x + (to.x - from.x) * fraction;
		const y = from.y + (to.y - from.y) * fraction;
		if (context.isPointInPath(island, x, y)) return false;
	}
	return true;
}
