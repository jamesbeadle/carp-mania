import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import { scenePathOf } from '../scene/lakeShape';
import { BedPalette } from '../scene/palette';
import { areaFeaturesOfKind } from './layoutShapes';

const BarRidgeWidth = 2;

export function drawBars(context: CanvasRenderingContext2D, lake: Path2D, layout: LakeLayout) {
	context.save();
	context.clip(lake);
	context.fillStyle = BedPalette.BarStreak;
	context.strokeStyle = BedPalette.BarRidge;
	context.lineWidth = BarRidgeWidth;
	for (const bar of areaFeaturesOfKind(layout, 'gravel_bar')) {
		const streak = scenePathOf(bar.points);
		context.fill(streak);
		context.stroke(streak);
	}
	context.restore();
}
