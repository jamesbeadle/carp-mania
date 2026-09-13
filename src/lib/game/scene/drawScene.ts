import type { LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { Lake, Swim } from '$lib/domain/types';
import { drawAngler } from '../render/drawAngler';
import { drawBank } from '../render/drawBank';
import { drawBars } from '../render/drawBars';
import { drawGravelSpeckles } from '../render/drawBedPatches';
import { drawFishSchool } from '../render/drawFish';
import { drawIslands } from '../render/drawIslands';
import { drawLilies } from '../render/drawLilies';
import { drawRods } from '../render/drawRods';
import { drawShowingFish } from '../render/drawShowingFish';
import { drawSnags } from '../render/drawSnags';
import { drawSoftBed, paintSoftBed } from '../render/softBed';
import { drawPegs, drawSwimLabels, swimScenePoint } from '../render/drawSwims';
import { drawDrafts, type DraftShape } from '../render/drawUnderConstruction';
import { drawWater } from '../render/drawWater';
import { drawReeds, drawWeedBeds } from '../render/drawWeedAndReeds';
import { createFacingTheWater } from './facingTheWater';
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
	const softBed = paintSoftBed(layout);
	let facingTheWaterFrom: ((peg: Point) => number) | null = null;

	return function drawScene(context: CanvasRenderingContext2D, input: SceneInput, secondsElapsed: number, timeSeconds: number) {
		const transparency = Number(input.lake.transparency);
		facingTheWaterFrom ??= createFacingTheWater(context, { lakePath, islandPaths, centre });
		moveFishSchool(input.school, context, lakePath, islandPaths, secondsElapsed, timeSeconds);
		drawBank(context, lakePath);
		drawWater(context, lakePath, centre, transparency, timeSeconds);
		drawSoftBed(context, lakePath, softBed);
		drawGravelSpeckles(context, lakePath, layout);
		drawBars(context, lakePath, layout);
		drawWeedBeds(context, lakePath, layout, Number(input.lake.weed), timeSeconds);
		drawLilies(context, lakePath, layout, timeSeconds);
		drawFishSchool(context, input.school, lakePath, transparency, timeSeconds);
		drawIslands(context, islandPaths);
		drawSnags(context, layout);
		drawReeds(context, layout, timeSeconds);
		drawPegs(context, input.swims, input.selectedSwimId, input.hoveredSwimId);
		drawAnglerAndRods(context, input, timeSeconds, facingTheWaterFrom);
		drawSwimLabels(context, input.swims, input.selectedSwimId, facingTheWaterFrom);
		drawDrafts(context, input.drafts ?? []);
		drawShowingFish(context, input.showingAt ?? [], timeSeconds);
	};

	function drawAnglerAndRods(context: CanvasRenderingContext2D, input: SceneInput, timeSeconds: number, facingTheWaterFrom: (peg: Point) => number) {
		const swim = input.swims.find((candidate) => candidate.id === input.selectedSwimId);
		if (!swim || !input.isAnglerOnBank) return;
		const position = swimScenePoint(swim);
		const facing = facingTheWaterFrom(position);
		drawAngler(context, position, facing);
		drawRods(context, position, facing, input.rods, timeSeconds);
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
