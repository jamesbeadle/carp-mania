import type { CarpStrain } from '$lib/domain/types';
import { carpProportions, drawCarp } from './drawCarp';

const PortraitLength = { Base: 150, PerPound: 4 } as const;

export function drawCarpPortrait(context: CanvasRenderingContext2D, strain: CarpStrain, weightPounds: number, canvasWidth: number, canvasHeight: number, timeSeconds: number) {
	drawMat(context, canvasWidth, canvasHeight);
	const length = Math.min(canvasWidth * 0.8, PortraitLength.Base + weightPounds * PortraitLength.PerPound);
	context.save();
	context.translate(canvasWidth / 2, canvasHeight / 2);
	drawCarp(context, strain, carpProportions(length), timeSeconds, 0);
	context.restore();
}

function drawMat(context: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
	context.fillStyle = 'hsl(95 25% 30%)';
	context.fillRect(0, 0, canvasWidth, canvasHeight);
	context.fillStyle = 'hsl(200 20% 22%)';
	context.beginPath();
	context.roundRect(canvasWidth * 0.08, canvasHeight * 0.16, canvasWidth * 0.84, canvasHeight * 0.68, 18);
	context.fill();
}
