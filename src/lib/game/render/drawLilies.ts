import type { LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { scenePathOf, type Point } from '../scene/lakeShape';
import { LilyPalette } from '../scene/palette';
import { areaFeaturesOfKind } from './layoutShapes';
import { countForArea, scatterWithin, sceneBoundsOf } from './scatter';

const Pad = { PixelsEach: 260, Maximum: 140, SmallestRadius: 4, SizeSteps: 4, RadiusStep: 0.9, Bob: 0.6 } as const;
const PadNotch = { StartTurns: 0.15, EndTurns: 1.85 } as const;
const PadHighlight = { RadiusFraction: 0.68, StartTurns: 1.08, EndTurns: 1.62 } as const;

export function drawLilies(context: CanvasRenderingContext2D, lake: Path2D, layout: LakeLayout, timeSeconds: number) {
	context.save();
	context.clip(lake);
	for (const patch of areaFeaturesOfKind(layout, 'lily_pads')) drawPadsWithin(context, patch.points, timeSeconds);
	context.restore();
}

function drawPadsWithin(context: CanvasRenderingContext2D, points: LayoutPoint[], timeSeconds: number) {
	const bounds = sceneBoundsOf(points);
	context.save();
	context.clip(scenePathOf(points));
	scatterWithin(bounds, countForArea(bounds, Pad.PixelsEach, Pad.Maximum)).forEach((centre, index) => {
		const radius = Pad.SmallestRadius + (index % Pad.SizeSteps) * Pad.RadiusStep;
		drawPad(context, { x: centre.x, y: centre.y + Math.sin(timeSeconds + index) * Pad.Bob }, radius);
	});
	context.restore();
}

function drawPad(context: CanvasRenderingContext2D, centre: Point, radius: number) {
	context.fillStyle = LilyPalette.Pad;
	context.beginPath();
	context.moveTo(centre.x, centre.y);
	context.arc(centre.x, centre.y, radius, Math.PI * PadNotch.StartTurns, Math.PI * PadNotch.EndTurns);
	context.closePath();
	context.fill();
	context.strokeStyle = LilyPalette.Highlight;
	context.lineWidth = 1;
	context.beginPath();
	context.arc(centre.x, centre.y, radius * PadHighlight.RadiusFraction, Math.PI * PadHighlight.StartTurns, Math.PI * PadHighlight.EndTurns);
	context.stroke();
}
