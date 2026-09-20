import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import { SceneSize } from '../scene/palette';
import { DepthShade } from '../scene/waterPalette';
import { drawBedTints } from './drawBedPatches';
import { drawDepthZones } from './drawDepthZones';

export type SoftBed = HTMLCanvasElement | null;

export function paintSoftBed(layout: LakeLayout): SoftBed {
	if (typeof document === 'undefined') return null;
	const layer = document.createElement('canvas');
	layer.width = SceneSize.Width;
	layer.height = SceneSize.Height;
	const context = layer.getContext('2d');
	if (!context) return null;
	softenTheEdges(context);
	drawDepthZones(context, layout);
	drawBedTints(context, layout);
	return layer;
}

export function drawSoftBed(context: CanvasRenderingContext2D, lake: Path2D, bed: SoftBed) {
	if (!bed) return;
	context.save();
	context.clip(lake);
	context.drawImage(bed, 0, 0);
	context.restore();
}

function softenTheEdges(context: CanvasRenderingContext2D) {
	const canBlur = 'filter' in context;
	if (canBlur) context.filter = `blur(${DepthShade.SoftEdgePixels}px)`;
}
