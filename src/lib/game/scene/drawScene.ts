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
import { drawSanctuaries } from '../render/drawSanctuaries';
import { drawSnags } from '../render/drawSnags';
import { drawSoftBed, paintSoftBed } from '../render/softBed';
import { drawPegs, drawSwimLabels, swimScenePoint } from '../render/drawSwims';
import { drawDrafts, type DraftShape } from '../render/drawUnderConstruction';
import { drawClusters } from '../render/drawClusters';
import { clusterSwims, isClustered } from './clusterSwims';
import { drawWater } from '../render/drawWater';
import { drawReeds, drawWeedBeds } from '../render/drawWeedAndReeds';
import { createFacingTheWater } from './facingTheWater';
import { moveFishSchool, type SwimmingFish } from './fishSchool';
import { islandPathsFrom, lakeCentreOf, lakePathFrom, type Point } from './lakeShape';
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
	pixelsPerScenePixel?: number;
}

const LabelsFromPixelsPerScenePixel = 0.5;
const FullDetail = 1;

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
		drawSanctuaries(context, layout);
		const scale = input.pixelsPerScenePixel ?? FullDetail;
		const clusters = clusterSwims(input.swims, scale);
		const loosePegs = clusters.filter((cluster) => !isClustered(cluster)).flatMap((cluster) => cluster.swims);
		drawPegs(context, loosePegs, input.selectedSwimId, input.hoveredSwimId);
		drawClusters(context, clusters, scale);
		drawAnglerAndRods(context, input, timeSeconds, facingTheWaterFrom);
		if (scale >= LabelsFromPixelsPerScenePixel) drawSwimLabels(context, loosePegs, input.selectedSwimId, facingTheWaterFrom);
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

export { isCastClearOfIslands, isPointInWater } from './castClearance';
