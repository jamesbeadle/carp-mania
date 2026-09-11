import type { FishProportions } from './carpOutline';

export function drawPairedFins(context: CanvasRenderingContext2D, { length, width }: FishProportions, fin: string, beat: number) {
	context.fillStyle = fin;
	for (const side of [-1, 1]) {
		drawFin(context, length * 0.22, side * width * 0.5, length * 0.16, width * 0.16, side * (0.85 + beat * 0.15));
		drawFin(context, -length * 0.06, side * width * 0.42, length * 0.11, width * 0.12, side * (0.95 + beat * 0.1));
	}
}

function drawFin(context: CanvasRenderingContext2D, x: number, y: number, radiusX: number, radiusY: number, angle: number) {
	context.beginPath();
	context.ellipse(x - radiusX * 0.5, y, radiusX, radiusY, angle, 0, Math.PI * 2);
	context.fill();
}

export function drawDorsalRidge(context: CanvasRenderingContext2D, { length, width }: FishProportions, ridge: string) {
	context.strokeStyle = ridge;
	context.lineCap = 'round';
	context.lineWidth = Math.max(1, width * 0.07);
	context.beginPath();
	context.moveTo(length * 0.1, 0);
	context.lineTo(-length * 0.3, 0);
	context.stroke();
	context.lineWidth = Math.max(1.5, width * 0.13);
	context.beginPath();
	context.moveTo(length * 0.1, 0);
	context.lineTo(length * 0.02, 0);
	context.stroke();
}

export function drawHead(context: CanvasRenderingContext2D, { length, width }: FishProportions, snout: string, eye: string) {
	context.fillStyle = snout;
	context.beginPath();
	context.ellipse(length * 0.43, 0, length * 0.07, width * 0.3, 0, 0, Math.PI * 2);
	context.fill();
	context.strokeStyle = eye;
	context.lineWidth = Math.max(0.8, width * 0.04);
	for (const side of [-1, 1]) {
		context.beginPath();
		context.moveTo(length * 0.47, side * width * 0.2);
		context.lineTo(length * 0.53, side * width * 0.3);
		context.stroke();
		context.fillStyle = eye;
		context.beginPath();
		context.arc(length * 0.33, side * width * 0.36, Math.max(1, width * 0.07), 0, Math.PI * 2);
		context.fill();
	}
}
