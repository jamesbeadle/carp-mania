import { FishPalette } from '../scene/palette';

export function drawPike(context: CanvasRenderingContext2D, length: number, timeSeconds: number, phase: number) {
	const width = length * 0.16;
	const colours = FishPalette.pike;
	const sway = Math.sin(timeSeconds * 4 + phase) * width * 0.4;

	context.fillStyle = colours.fin;
	context.beginPath();
	context.moveTo(-length * 0.42, 0);
	context.lineTo(-length * 0.55, -width * 0.9 + sway);
	context.lineTo(-length * 0.5, sway * 0.5);
	context.lineTo(-length * 0.55, width * 0.9 + sway);
	context.closePath();
	context.fill();
	for (const side of [-1, 1]) {
		context.beginPath();
		context.ellipse(-length * 0.28, side * width * 0.5, length * 0.07, width * 0.3, side * 0.6, 0, Math.PI * 2);
		context.fill();
		context.beginPath();
		context.ellipse(length * 0.22, side * width * 0.48, length * 0.06, width * 0.25, side * 0.8, 0, Math.PI * 2);
		context.fill();
	}

	context.fillStyle = colours.back;
	context.beginPath();
	context.moveTo(length * 0.5, 0);
	context.bezierCurveTo(length * 0.35, -width * 0.35, length * 0.1, -width * 0.5, -length * 0.15, -width * 0.45);
	context.bezierCurveTo(-length * 0.3, -width * 0.4, -length * 0.4, -width * 0.15, -length * 0.42, 0);
	context.bezierCurveTo(-length * 0.4, width * 0.15, -length * 0.3, width * 0.4, -length * 0.15, width * 0.45);
	context.bezierCurveTo(length * 0.1, width * 0.5, length * 0.35, width * 0.35, length * 0.5, 0);
	context.closePath();
	context.fill();

	context.strokeStyle = colours.flank;
	context.lineWidth = Math.max(1, width * 0.12);
	for (let x = length * 0.15; x > -length * 0.35; x -= length * 0.08) {
		context.beginPath();
		context.moveTo(x, -width * 0.42);
		context.lineTo(x - length * 0.03, width * 0.42);
		context.stroke();
	}
}
