export interface FishProportions {
	length: number;
	width: number;
}

export function traceCarpBody(context: CanvasRenderingContext2D, { length, width }: FishProportions) {
	const nose = length * 0.5;
	const tailRoot = -length * 0.36;
	const halfWidth = width * 0.5;
	context.beginPath();
	context.moveTo(nose, 0);
	context.bezierCurveTo(nose, -halfWidth * 0.55, length * 0.28, -halfWidth, length * 0.08, -halfWidth);
	context.bezierCurveTo(-length * 0.1, -halfWidth, -length * 0.25, -halfWidth * 0.4, tailRoot, -halfWidth * 0.16);
	context.lineTo(tailRoot, halfWidth * 0.16);
	context.bezierCurveTo(-length * 0.25, halfWidth * 0.4, -length * 0.1, halfWidth, length * 0.08, halfWidth);
	context.bezierCurveTo(length * 0.28, halfWidth, nose, halfWidth * 0.55, nose, 0);
	context.closePath();
}

export function traceCarpTail(context: CanvasRenderingContext2D, { length, width }: FishProportions, sway: number) {
	const root = -length * 0.36;
	const tip = -length * 0.5 - width * 0.35;
	const spread = width * 0.55;
	context.beginPath();
	context.moveTo(root + length * 0.02, -width * 0.14);
	context.quadraticCurveTo(tip + length * 0.06, -spread * 0.5 + sway, tip, -spread + sway);
	context.quadraticCurveTo(tip + length * 0.08, sway * 0.6, tip, spread + sway);
	context.quadraticCurveTo(tip + length * 0.06, spread * 0.5 + sway, root + length * 0.02, width * 0.14);
	context.closePath();
}

export function backShading(context: CanvasRenderingContext2D, width: number, back: string, flank: string) {
	const shade = context.createLinearGradient(0, -width / 2, 0, width / 2);
	shade.addColorStop(0, flank);
	shade.addColorStop(0.42, back);
	shade.addColorStop(0.58, back);
	shade.addColorStop(1, flank);
	return shade;
}
