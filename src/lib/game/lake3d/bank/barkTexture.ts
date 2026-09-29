import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';
import { shadeOf } from '../grass/bladeStroke';

const Bark = { Width: 256, Height: 128, Base: '#9c8e7e', Seed: 613 } as const;
const Furrow = { Count: 46, Thickest: 3.2, Thinnest: 0.8, Shade: -0.62, Steps: 12, Wander: 2.4 } as const;
const Ridge = { Count: 70, Shade: 0.22, Thickness: 1.2 } as const;
const Crack = { Count: 24, Length: 7, Shade: -0.5 } as const;
const Knot = { Count: 4, Largest: 6, Smallest: 2.5, Shade: -0.55, Ring: 0.15 } as const;

function wavyLine(context: CanvasRenderingContext2D, y: number, random: () => number) {
	const step = Bark.Width / Furrow.Steps;
	context.beginPath();
	context.moveTo(0, y);
	for (let point = 1; point <= Furrow.Steps; point++) context.lineTo(point * step, y + (random() - 1 / 2) * Furrow.Wander);
	context.stroke();
}

function paintLines(context: CanvasRenderingContext2D, count: number, shade: number, thickness: () => number, random: () => number) {
	for (let line = 0; line < count; line++) {
		context.strokeStyle = shadeOf(Bark.Base, shade * (1 / 2 + random() / 2));
		context.lineWidth = thickness();
		wavyLine(context, random() * Bark.Height, random);
	}
}

function paintCracks(context: CanvasRenderingContext2D, random: () => number) {
	context.strokeStyle = shadeOf(Bark.Base, Crack.Shade);
	context.lineWidth = 1;
	for (let crack = 0; crack < Crack.Count; crack++) {
		const x = random() * Bark.Width;
		const y = random() * Bark.Height;
		context.beginPath();
		context.moveTo(x, y);
		context.lineTo(x + (random() - 1 / 2) * 2, y + Crack.Length * (random() + 1 / 2));
		context.stroke();
	}
}

function paintOval(context: CanvasRenderingContext2D, centre: { x: number; y: number }, size: number, shade: number) {
	context.fillStyle = shadeOf(Bark.Base, shade);
	context.beginPath();
	context.ellipse(centre.x, centre.y, size, size / 2, 0, 0, Math.PI * 2);
	context.fill();
}

function paintKnots(context: CanvasRenderingContext2D, random: () => number) {
	for (let knot = 0; knot < Knot.Count; knot++) {
		const size = Knot.Smallest + random() * Knot.Largest;
		const centre = { x: random() * Bark.Width, y: random() * Bark.Height };
		paintOval(context, centre, size * 2, Knot.Ring);
		paintOval(context, centre, size, Knot.Shade);
	}
}

export function barkTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = Bark.Width;
	canvas.height = Bark.Height;
	const context = canvas.getContext('2d');
	const random = seededRandom(Bark.Seed);
	if (context) {
		context.fillStyle = Bark.Base;
		context.fillRect(0, 0, Bark.Width, Bark.Height);
		paintLines(context, Ridge.Count, Ridge.Shade, () => Ridge.Thickness, random);
		paintLines(context, Furrow.Count, Furrow.Shade, () => Furrow.Thinnest + random() * (Furrow.Thickest - Furrow.Thinnest), random);
		paintCracks(context, random);
		paintKnots(context, random);
	}
	const texture = new CanvasTexture(canvas);
	Object.assign(texture, { colorSpace: SRGBColorSpace, wrapS: RepeatWrapping, wrapT: RepeatWrapping, anisotropy: 4 });
	return texture;
}
