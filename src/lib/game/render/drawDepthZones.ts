import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import { scenePathOf } from '../scene/lakeShape';
import { depthShadeColour } from '../scene/palette';
import { largestFirst } from './layoutShapes';

export function drawDepthZones(context: CanvasRenderingContext2D, lake: Path2D, layout: LakeLayout) {
	context.save();
	context.clip(lake);
	for (const zone of largestFirst(layout.depthZones)) {
		context.fillStyle = depthShadeColour(zone.depthFeet - layout.baseDepthFeet);
		context.fill(scenePathOf(zone.points));
	}
	context.restore();
}
