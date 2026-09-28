import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';
import { pickColour } from './coverPalette';

const Dirt = { Pixels: 256, Base: '#4e3e2a', Specks: 1800, Pebbles: 24, Seed: 3319 } as const;
const Tones = ['#44362a', '#5e4c34', '#3a2e20', '#6a5638', '#524028'];
const PebbleTones = ['#6e665a', '#7a7064', '#5e584e'];
const Bits = ['#5a6a34', '#6a7a3c', '#7a7440'];
const Speck = { Largest: 3, BitShare: 0.2 } as const;
const Pebble = { Largest: 4.5, Smallest: 1.5 } as const;

function scatterSpecks(context: CanvasRenderingContext2D, random: () => number) {
	for (let speck = 0; speck < Dirt.Specks; speck++) {
		const isGrassBit = random() < Speck.BitShare;
		context.fillStyle = pickColour(isGrassBit ? Bits : Tones, random);
		context.fillRect(random() * Dirt.Pixels, random() * Dirt.Pixels, 1 + random() * Speck.Largest, 1 + random() * Speck.Largest);
	}
}

function scatterPebbles(context: CanvasRenderingContext2D, random: () => number) {
	for (let pebble = 0; pebble < Dirt.Pebbles; pebble++) {
		context.fillStyle = pickColour(PebbleTones, random);
		context.beginPath();
		context.ellipse(random() * Dirt.Pixels, random() * Dirt.Pixels, Pebble.Smallest + random() * Pebble.Largest, Pebble.Smallest + random() * Pebble.Largest * 0.6, random() * Math.PI, 0, Math.PI * 2);
		context.fill();
	}
}

export function dirtTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = Dirt.Pixels;
	canvas.height = Dirt.Pixels;
	const context = canvas.getContext('2d');
	const random = seededRandom(Dirt.Seed);
	if (context) {
		context.fillStyle = Dirt.Base;
		context.fillRect(0, 0, Dirt.Pixels, Dirt.Pixels);
		scatterSpecks(context, random);
		scatterPebbles(context, random);
	}
	const texture = new CanvasTexture(canvas);
	Object.assign(texture, { colorSpace: SRGBColorSpace, wrapS: RepeatWrapping, wrapT: RepeatWrapping });
	return texture;
}
