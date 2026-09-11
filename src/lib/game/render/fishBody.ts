export function drawShadow(context: CanvasRenderingContext2D, length: number, width: number) {
	context.fillStyle = 'hsla(0 0% 0% / 0.25)';
	context.beginPath();
	context.ellipse(4, 6, length / 2, width / 2, 0, 0, Math.PI * 2);
	context.fill();
}

export function drawBody(context: CanvasRenderingContext2D, length: number, width: number, body: string, belly: string) {
	const shade = context.createLinearGradient(0, -width / 2, 0, width / 2);
	shade.addColorStop(0, body);
	shade.addColorStop(0.5, belly);
	shade.addColorStop(1, body);
	context.fillStyle = shade;
	context.beginPath();
	context.moveTo(length / 2, 0);
	context.bezierCurveTo(length / 4, -width / 2, -length / 4, -width / 2, -length / 2, 0);
	context.bezierCurveTo(-length / 4, width / 2, length / 4, width / 2, length / 2, 0);
	context.fill();
	context.fillStyle = 'hsla(0 0% 0% / 0.5)';
	context.beginPath();
	context.arc(length * 0.34, -width * 0.18, Math.max(1.2, width * 0.07), 0, Math.PI * 2);
	context.fill();
}

export function drawTail(context: CanvasRenderingContext2D, length: number, width: number, sway: number, fin: string) {
	context.fillStyle = fin;
	context.beginPath();
	context.moveTo(-length / 2 + 4, 0);
	context.lineTo(-length / 2 - width * 0.55, -width * 0.45 + sway);
	context.lineTo(-length / 2 - width * 0.35, sway * 0.4);
	context.lineTo(-length / 2 - width * 0.55, width * 0.45 + sway);
	context.closePath();
	context.fill();
}

export function drawFins(context: CanvasRenderingContext2D, length: number, width: number, fin: string) {
	context.fillStyle = fin;
	for (const side of [-1, 1]) {
		context.beginPath();
		context.ellipse(length * 0.12, side * width * 0.5, width * 0.32, width * 0.14, side * 0.7, 0, Math.PI * 2);
		context.fill();
	}
}

export function drawMirrorScales(context: CanvasRenderingContext2D, length: number, width: number, belly: string) {
	context.fillStyle = belly;
	for (const offset of [-0.2, 0.05, 0.3]) {
		context.beginPath();
		context.ellipse(length * offset, -width * 0.12, width * 0.12, width * 0.08, 0, 0, Math.PI * 2);
		context.fill();
	}
}

export function drawLinearLine(context: CanvasRenderingContext2D, length: number, belly: string) {
	context.strokeStyle = belly;
	context.lineWidth = 1.5;
	context.beginPath();
	context.moveTo(-length * 0.35, 0);
	context.lineTo(length * 0.35, 0);
	context.stroke();
}
