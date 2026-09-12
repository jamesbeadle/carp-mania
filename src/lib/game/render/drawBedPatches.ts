import type { BedPatch, LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { scenePathOf } from '../scene/lakeShape';
import { BedPalette } from '../scene/palette';
import { largestFirst } from './layoutShapes';
import { countForArea, scatterWithin, sceneBoundsOf } from './scatter';

const Speckle = { Radius: 1.2, PixelsEach: 220, Maximum: 240 } as const;

export function drawBedPatches(context: CanvasRenderingContext2D, lake: Path2D, layout: LakeLayout) {
	context.save();
	context.clip(lake);
	for (const patch of largestFirst(layout.bedPatches)) drawPatch(context, patch);
	context.restore();
}

function drawPatch(context: CanvasRenderingContext2D, patch: BedPatch) {
	const path = scenePathOf(patch.points);
	context.fillStyle = BedPalette.Tint[patch.bed];
	context.fill(path);
	if (patch.bed === 'gravel') drawSpeckles(context, path, patch.points);
}

function drawSpeckles(context: CanvasRenderingContext2D, path: Path2D, points: LayoutPoint[]) {
	const bounds = sceneBoundsOf(points);
	context.save();
	context.clip(path);
	context.fillStyle = BedPalette.GravelSpeckle;
	for (const speckle of scatterWithin(bounds, countForArea(bounds, Speckle.PixelsEach, Speckle.Maximum))) {
		context.beginPath();
		context.arc(speckle.x, speckle.y, Speckle.Radius, 0, Math.PI * 2);
		context.fill();
	}
	context.restore();
}
