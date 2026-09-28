import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';
import { shadeOf } from '../grass/bladeStroke';

const Bark = { Pixels: 128, Base: '#9a9088', Streaks: 70, Knots: 5, Seed: 613, Repeat: [3, 2] } as const;
const Streak = { Widest: 3, Swing: 0.35 } as const;
const Knot = { Largest: 5, Smallest: 2, Shade: -0.45 } as const;

function paintStreaks(context: CanvasRenderingContext2D, random: () => number) {
	for (let streak = 0; streak < Bark.Streaks; streak++) {
		context.fillStyle = shadeOf(Bark.Base, (random() - 1 / 2) * Streak.Swing * 2);
		context.fillRect(random() * Bark.Pixels, 0, 1 + random() * Streak.Widest, Bark.Pixels);
	}
}

function paintKnots(context: CanvasRenderingContext2D, random: () => number) {
	context.fillStyle = shadeOf(Bark.Base, Knot.Shade);
	for (let knot = 0; knot < Bark.Knots; knot++) {
		const size = Knot.Smallest + random() * Knot.Largest;
		context.beginPath();
		context.ellipse(random() * Bark.Pixels, random() * Bark.Pixels, size / 2, size, 0, 0, Math.PI * 2);
		context.fill();
	}
}

export function barkTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = Bark.Pixels;
	canvas.height = Bark.Pixels;
	const context = canvas.getContext('2d');
	const random = seededRandom(Bark.Seed);
	if (context) {
		context.fillStyle = Bark.Base;
		context.fillRect(0, 0, Bark.Pixels, Bark.Pixels);
		paintStreaks(context, random);
		paintKnots(context, random);
	}
	const texture = new CanvasTexture(canvas);
	texture.repeat.set(...Bark.Repeat);
	Object.assign(texture, { colorSpace: SRGBColorSpace, wrapS: RepeatWrapping, wrapT: RepeatWrapping });
	return texture;
}
