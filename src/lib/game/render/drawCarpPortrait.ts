import type { CarpStrain } from '$lib/domain/types';
import { FishPalette } from '../scene/palette';
import { drawBody, drawFins, drawLinearLine, drawMirrorScales, drawShadow, drawTail } from './fishBody';

const PortraitLength = { Base: 120, PerPound: 3.2 } as const;

export function drawCarpPortrait(context: CanvasRenderingContext2D, strain: CarpStrain, weightPounds: number, canvasWidth: number, canvasHeight: number, timeSeconds: number) {
	drawMat(context, canvasWidth, canvasHeight);
	const length = Math.min(canvasWidth * 0.8, PortraitLength.Base + weightPounds * PortraitLength.PerPound);
	const width = length * 0.42;
	const colours = FishPalette[strain];
	context.save();
	context.translate(canvasWidth / 2, canvasHeight / 2);
	drawShadow(context, length, width);
	drawTail(context, length, width, Math.sin(timeSeconds * 3) * 4, colours.fin);
	drawFins(context, length, width, colours.fin);
	drawBody(context, length, width, colours.body, colours.belly);
	if (strain === 'mirror') drawMirrorScales(context, length, width, colours.belly);
	if (strain === 'linear') drawLinearLine(context, length, colours.belly);
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
