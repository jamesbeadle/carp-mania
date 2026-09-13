import { PortraitPalette } from '../scene/portraitPalette';

const Mat = { Inset: 0.07, Top: 0.14, Bottom: 0.86, Corner: 22, Padding: 12, ShadowBlur: 24, ShadowDrop: 10 } as const;
const StitchDash: number[] = [6, 5];
const BladeCount = 70;
const Puddles: [across: number, down: number, width: number, height: number][] = [
	[0.3, 0.72, 0.16, 0.05],
	[0.7, 0.3, 0.1, 0.04]
];

export function drawGrass(context: CanvasRenderingContext2D, width: number, height: number) {
	const grass = context.createLinearGradient(0, 0, 0, height);
	grass.addColorStop(0, PortraitPalette.GrassFar);
	grass.addColorStop(1, PortraitPalette.GrassNear);
	context.fillStyle = grass;
	context.fillRect(0, 0, width, height);
	context.strokeStyle = PortraitPalette.Blade;
	context.lineWidth = 1.5;
	for (let blade = 0; blade < BladeCount; blade++) {
		const x = ((blade * 149) % width) + 3;
		const y = ((blade * 83) % height) + 6;
		context.beginPath();
		context.moveTo(x, y);
		context.lineTo(x - 2, y - 8);
		context.moveTo(x, y);
		context.lineTo(x + 3, y - 7);
		context.stroke();
	}
}

export function drawMat(context: CanvasRenderingContext2D, width: number, height: number) {
	const left = width * Mat.Inset;
	const top = height * Mat.Top;
	const matWidth = width * (1 - Mat.Inset * 2);
	const matHeight = height * (Mat.Bottom - Mat.Top);
	context.save();
	context.shadowColor = PortraitPalette.MatShadow;
	context.shadowBlur = Mat.ShadowBlur;
	context.shadowOffsetY = Mat.ShadowDrop;
	context.fillStyle = PortraitPalette.MatEdge;
	context.beginPath();
	context.roundRect(left, top, matWidth, matHeight, Mat.Corner);
	context.fill();
	context.restore();
	const pad = context.createLinearGradient(left, top, left + matWidth, top + matHeight);
	pad.addColorStop(0, PortraitPalette.MatPadLit);
	pad.addColorStop(1, PortraitPalette.MatPad);
	context.fillStyle = pad;
	context.beginPath();
	context.roundRect(left + Mat.Padding, top + Mat.Padding, matWidth - Mat.Padding * 2, matHeight - Mat.Padding * 2, Mat.Corner - Mat.Padding / 2);
	context.fill();
	context.save();
	context.setLineDash(StitchDash);
	context.strokeStyle = PortraitPalette.Stitch;
	context.lineWidth = 1;
	context.stroke();
	context.restore();
	drawPuddles(context, left, top, matWidth, matHeight);
}

function drawPuddles(context: CanvasRenderingContext2D, left: number, top: number, matWidth: number, matHeight: number) {
	context.fillStyle = PortraitPalette.Puddle;
	for (const [across, down, puddleWidth, puddleHeight] of Puddles) {
		context.beginPath();
		context.ellipse(left + matWidth * across, top + matHeight * down, matWidth * puddleWidth, matHeight * puddleHeight, 0, 0, Math.PI * 2);
		context.fill();
	}
}

export function drawLight(context: CanvasRenderingContext2D, width: number, height: number) {
	const light = context.createRadialGradient(width * 0.2, height * 0.1, 0, width * 0.2, height * 0.1, width * 0.7);
	light.addColorStop(0, PortraitPalette.Light);
	light.addColorStop(1, PortraitPalette.LightEdge);
	context.save();
	context.globalCompositeOperation = 'soft-light';
	context.fillStyle = light;
	context.fillRect(0, 0, width, height);
	context.restore();
}

export function drawVignette(context: CanvasRenderingContext2D, width: number, height: number) {
	const vignette = context.createRadialGradient(width / 2, height / 2, height * 0.35, width / 2, height / 2, width * 0.72);
	vignette.addColorStop(0, PortraitPalette.VignetteCentre);
	vignette.addColorStop(1, PortraitPalette.VignetteEdge);
	context.fillStyle = vignette;
	context.fillRect(0, 0, width, height);
}
