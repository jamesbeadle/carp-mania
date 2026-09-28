import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';
import { pickColour } from './coverPalette';

const Dirt = { Pixels: 256, Base: '#4a4230', Specks: 2600, Pebbles: 24, Seed: 3319 } as const;
const Tones = ['#40392a', '#554c36', '#363024', '#5e553c', '#4c442f', '#3c3a2a'];
const PebbleTones = ['#6a665c', '#76706a', '#5a5850'];
const Bits = ['#4e6030', '#5a6c36', '#66683a', '#4a5a2c'];
const Speck = { Largest: 3, BitShare: 0.3 } as const;
const Pebble = { Largest: 4.5, Smallest: 1.5, Flatness: 0.6 } as const;

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
		const across = Pebble.Smallest + random() * Pebble.Largest;
		context.ellipse(random() * Dirt.Pixels, random() * Dirt.Pixels, across, across * Pebble.Flatness, random() * Math.PI, 0, Math.PI * 2);
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
