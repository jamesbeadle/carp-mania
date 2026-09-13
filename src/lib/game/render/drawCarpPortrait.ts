import type { CarpStrain } from '$lib/domain/types';
import { PortraitPalette } from '../scene/portraitPalette';
import { traceCarpBody } from './carpOutline';
import { carpProportions, drawCarp } from './drawCarp';
import { drawGrass, drawLight, drawMat, drawVignette } from './drawUnhookingMat';

const PortraitLength = { Base: 210, PerPound: 4.5, WidestShare: 0.8 } as const;
const Lay = { TiltRadians: -0.12, RestBelowCentre: 0.04 } as const;
const Sheen = { AcrossBody: -0.22, Length: 0.9, Width: 0.16 } as const;
const Droplets: [alongBody: number, acrossBody: number, radius: number][] = [
	[0.32, 0.1, 2.2],
	[0.12, 0.28, 1.6],
	[-0.08, -0.05, 2.6],
	[-0.22, 0.22, 1.4],
	[0.2, -0.3, 1.5]
];

export function drawCarpPortrait(context: CanvasRenderingContext2D, strain: CarpStrain, weightPounds: number, canvasWidth: number, canvasHeight: number, timeSeconds: number) {
	drawGrass(context, canvasWidth, canvasHeight);
	drawMat(context, canvasWidth, canvasHeight);
	const length = Math.min(canvasWidth * PortraitLength.WidestShare, PortraitLength.Base + weightPounds * PortraitLength.PerPound);
	const proportions = carpProportions(length);
	context.save();
	context.translate(canvasWidth / 2, canvasHeight / 2 + canvasHeight * Lay.RestBelowCentre);
	context.rotate(Lay.TiltRadians);
	drawCarp(context, strain, proportions, timeSeconds, 0);
	drawWetSheen(context, proportions);
	context.restore();
	drawLight(context, canvasWidth, canvasHeight);
	drawVignette(context, canvasWidth, canvasHeight);
}

function drawWetSheen(context: CanvasRenderingContext2D, proportions: ReturnType<typeof carpProportions>) {
	context.save();
	traceCarpBody(context, proportions);
	context.clip();
	const sheen = context.createLinearGradient(0, proportions.width * (Sheen.AcrossBody - Sheen.Width), 0, proportions.width * (Sheen.AcrossBody + Sheen.Width));
	sheen.addColorStop(0, PortraitPalette.SheenEdge);
	sheen.addColorStop(0.5, PortraitPalette.Sheen);
	sheen.addColorStop(1, PortraitPalette.SheenEdge);
	context.fillStyle = sheen;
	context.beginPath();
	context.ellipse(0, proportions.width * Sheen.AcrossBody, (proportions.length * Sheen.Length) / 2, proportions.width * Sheen.Width, 0, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = PortraitPalette.Droplet;
	for (const [along, across, radius] of Droplets) {
		context.beginPath();
		context.arc(proportions.length * along, proportions.width * across, radius, 0, Math.PI * 2);
		context.fill();
	}
	context.restore();
}
