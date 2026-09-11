import type { CarpStrain } from '$lib/domain/types';
import { FishPalette } from '../scene/palette';
import { drawDorsalRidge, drawHead, drawPairedFins } from './carpFins';
import { backShading, traceCarpBody, traceCarpTail, type FishProportions } from './carpOutline';
import { drawStrainMarkings } from './carpMarkings';

export function carpProportions(length: number): FishProportions {
	return { length, width: length * 0.36 };
}

export function drawCarp(context: CanvasRenderingContext2D, strain: CarpStrain, proportions: FishProportions, timeSeconds: number, phase: number) {
	const colours = FishPalette[strain];
	const sway = Math.sin(timeSeconds * 5 + phase) * proportions.width * 0.3;
	const beat = Math.sin(timeSeconds * 3 + phase);

	drawShadow(context, proportions);
	context.fillStyle = colours.fin;
	traceCarpTail(context, proportions, sway);
	context.fill();
	drawPairedFins(context, proportions, colours.fin, beat);

	traceCarpBody(context, proportions);
	context.fillStyle = backShading(context, proportions.width, colours.back, colours.flank);
	context.fill();
	context.save();
	context.clip();
	drawStrainMarkings(context, strain, proportions, colours.scale, colours.patch);
	drawHead(context, proportions, colours.snout, colours.eye);
	context.restore();
	drawDorsalRidge(context, proportions, colours.ridge);
}

function drawShadow(context: CanvasRenderingContext2D, proportions: FishProportions) {
	context.save();
	context.translate(proportions.length * 0.04, proportions.width * 0.35);
	context.fillStyle = 'hsla(0 0% 0% / 0.28)';
	traceCarpBody(context, proportions);
	context.fill();
	context.restore();
}
