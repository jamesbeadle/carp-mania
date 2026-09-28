import { Color } from 'three';

export interface Blade {
	root: { x: number; y: number };
	tip: { x: number; y: number };
	bend: number;
	width: number;
	colour: string;
}

const Shading = { RootDarkening: 0.55, TipLightening: 0.12 } as const;
const Lightening = new Color('#fff6d8');
const Darkening = new Color('#10180a');

export function shadeOf(colour: string, towardsLight: number) {
	const shade = new Color(colour);
	if (towardsLight > 0) shade.lerp(Lightening, towardsLight);
	if (towardsLight < 0) shade.lerp(Darkening, -towardsLight);
	return `#${shade.getHexString()}`;
}

export function paintBlade(context: CanvasRenderingContext2D, blade: Blade) {
	const { root, tip, bend, width, colour } = blade;
	const middle = { x: (root.x + tip.x) / 2 + bend, y: (root.y + tip.y) / 2 };
	const gradient = context.createLinearGradient(root.x, root.y, tip.x, tip.y);
	gradient.addColorStop(0, shadeOf(colour, -Shading.RootDarkening));
	gradient.addColorStop(1, shadeOf(colour, Shading.TipLightening));
	context.fillStyle = gradient;
	context.beginPath();
	context.moveTo(root.x - width / 2, root.y);
	context.quadraticCurveTo(middle.x - width / 3, middle.y, tip.x, tip.y);
	context.quadraticCurveTo(middle.x + width / 3, middle.y, root.x + width / 2, root.y);
	context.closePath();
	context.fill();
}

export function paintDot(context: CanvasRenderingContext2D, centre: { x: number; y: number }, radius: number, colour: string) {
	context.fillStyle = colour;
	context.beginPath();
	context.arc(centre.x, centre.y, radius, 0, Math.PI * 2);
	context.fill();
}

export function paintStem(context: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }, width: number, colour: string) {
	context.strokeStyle = colour;
	context.lineWidth = width;
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(from.x, from.y);
	context.quadraticCurveTo((from.x + to.x) / 2 + (to.x - from.x) * 0.3, (from.y + to.y) / 2, to.x, to.y);
	context.stroke();
}
