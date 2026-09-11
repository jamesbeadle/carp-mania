import type { LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { Lake, Swim } from '$lib/domain/types';
import { drawAngler } from '../render/drawAngler';
import { drawBank } from '../render/drawBank';
import { drawBars } from '../render/drawBars';
import { drawBedPatches } from '../render/drawBedPatches';
import { drawDepthZones } from '../render/drawDepthZones';
import { drawFishSchool } from '../render/drawFish';
import { drawIslands } from '../render/drawIslands';
import { drawLilies } from '../render/drawLilies';
import { drawRods } from '../render/drawRods';
import { drawShowingFish } from '../render/drawShowingFish';
import { drawSnags } from '../render/drawSnags';
import { drawSwims, swimScenePoint } from '../render/drawSwims';
import { drawDrafts, type DraftShape } from '../render/drawUnderConstruction';
import { drawWater } from '../render/drawWater';
import { drawReeds, drawWeedBeds } from '../render/drawWeedAndReeds';
import { moveFishSchool, type SwimmingFish } from './fishSchool';
import { islandPathsFrom, isInsideWater, isPointInScenePath, lakeCentreOf, lakePathFrom, type Point } from './lakeShape';
import type { RodOnBank } from './rodState';

export interface SceneInput {
	lake: Lake;
	swims: Swim[];
	school: SwimmingFish[];
	selectedSwimId: string | null;
	hoveredSwimId: string | null;
	rods: RodOnBank[];
	isAnglerOnBank: boolean;
	drafts?: DraftShape[];
	showingAt?: LayoutPoint[];
}

export function createSceneDrawer(layout: LakeLayout) {
	const lakePath = lakePathFrom(layout);
	const islandPaths = islandPathsFrom(layout);
	const centre = lakeCentreOf(layout);

	return function drawScene(context: CanvasRenderingContext2D, input: SceneInput, secondsElapsed: number, timeSeconds: number) {
		const transparency = Number(input.lake.transparency);
		moveFishSchool(input.school, context, lakePath, islandPaths, secondsElapsed, timeSeconds);
		drawBank(context, lakePath);
		drawWater(context, lakePath, centre, transparency, timeSeconds);
		drawDepthZones(context, lakePath, layout);
		drawBedPatches(context, lakePath, layout);
		drawBars(context, lakePath, layout);
		drawWeedBeds(context, lakePath, layout, Number(input.lake.weed), timeSeconds);
		drawLilies(context, lakePath, layout, timeSeconds);
		drawFishSchool(context, input.school, lakePath, transparency, timeSeconds);
		drawIslands(context, islandPaths);
		drawSnags(context, layout);
		drawReeds(context, layout, timeSeconds);
		drawSwims(context, input.swims, input.selectedSwimId, input.hoveredSwimId);
		drawAnglerAndRods(context, input, timeSeconds);
		drawDrafts(context, input.drafts ?? []);
		drawShowingFish(context, input.showingAt ?? [], timeSeconds);
	};

	function drawAnglerAndRods(context: CanvasRenderingContext2D, input: SceneInput, timeSeconds: number) {
		const swim = input.swims.find((candidate) => candidate.id === input.selectedSwimId);
		if (!swim || !input.isAnglerOnBank) return;
		const position = swimScenePoint(swim);
		drawRods(context, position, input.rods, timeSeconds);
		drawAngler(context, position, Math.atan2(centre.y - position.y, centre.x - position.x));
	}
}

export function isPointInWater(context: CanvasRenderingContext2D, layout: LakeLayout, point: Point) {
	return isInsideWater(context, lakePathFrom(layout), islandPathsFrom(layout), point);
}

const CastLineSamples = 40;

export function isCastClearOfIslands(context: CanvasRenderingContext2D, layout: LakeLayout, from: Point, to: Point) {
	const islands = islandPathsFrom(layout);
	for (let step = 1; step < CastLineSamples; step++) {
		const fraction = step / CastLineSamples;
		const sample = { x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction };
		if (islands.some((island) => isPointInScenePath(context, island, sample))) return false;
	}
	return true;
}
