import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { toScene, type Point } from '../scene/lakeShape';
import { showingRippleColour } from '../scene/waterPalette';

const Ripple = { PeriodSeconds: 2.6, RingCount: 2, SmallestRadius: 3, Growth: 22, PeakAlpha: 0.6, LineWidth: 1.5, StaggerSeconds: 0.9 } as const;

export function drawShowingFish(context: CanvasRenderingContext2D, showingAt: LayoutPoint[], timeSeconds: number) {
	context.save();
	context.lineWidth = Ripple.LineWidth;
	showingAt.forEach((fraction, index) => drawRipple(context, toScene(fraction), timeSeconds + index * Ripple.StaggerSeconds));
	context.restore();
}

function drawRipple(context: CanvasRenderingContext2D, centre: Point, phase: number) {
	for (let ring = 0; ring < Ripple.RingCount; ring++) {
		const ringPhase = phase + (ring * Ripple.PeriodSeconds) / Ripple.RingCount;
		const progress = (ringPhase % Ripple.PeriodSeconds) / Ripple.PeriodSeconds;
		context.strokeStyle = showingRippleColour((1 - progress) * Ripple.PeakAlpha);
		context.beginPath();
		context.arc(centre.x, centre.y, Ripple.SmallestRadius + progress * Ripple.Growth, 0, Math.PI * 2);
		context.stroke();
	}
}
