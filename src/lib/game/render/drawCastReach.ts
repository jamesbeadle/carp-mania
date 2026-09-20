import type { CastReach } from '../session/castReach';
import { AnglerPalette } from '../scene/palette';

const Ring = { LineWidth: 1.5, Dash: [10, 8] as number[], DriftPerSecond: 6 } as const;

export function drawCastReach(context: CanvasRenderingContext2D, lake: Path2D, reach: CastReach | null, timeSeconds: number) {
	if (!reach) return;
	context.save();
	context.clip(lake);
	context.strokeStyle = AnglerPalette.CastReach;
	context.lineWidth = Ring.LineWidth;
	context.setLineDash(Ring.Dash);
	context.lineDashOffset = -timeSeconds * Ring.DriftPerSecond;
	context.beginPath();
	context.arc(reach.centre.x, reach.centre.y, reach.radiusScenePixels, 0, Math.PI * 2);
	context.stroke();
	context.restore();
}
