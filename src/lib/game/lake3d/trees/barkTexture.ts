import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';

const Bark = { Width: 128, Height: 256, Fissures: 34, Seed: 53, RepeatAround: 2, RepeatUp: 3, RidgeEvery: 3 } as const;
const Tones = { Ground: '#d8d2c8', Fissure: 'rgba(40, 32, 24, 0.55)', Ridge: 'rgba(255, 250, 240, 0.25)' } as const;
const FissureStep = 16;

function fissure(context: CanvasRenderingContext2D, random: () => number, style: string, width: number) {
	let x = random() * Bark.Width;
	context.strokeStyle = style;
	context.lineWidth = width;
	context.beginPath();
	context.moveTo(x, 0);
	for (let y = FissureStep; y <= Bark.Height; y += FissureStep) {
		x += (random() - 0.5) * 6;
		context.lineTo(x, y);
	}
	context.stroke();
}

export function barkTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = Bark.Width;
	canvas.height = Bark.Height;
	const context = canvas.getContext('2d');
	const random = seededRandom(Bark.Seed);
	if (context) {
		context.fillStyle = Tones.Ground;
		context.fillRect(0, 0, Bark.Width, Bark.Height);
		for (let index = 0; index < Bark.Fissures; index++) fissure(context, random, index % Bark.RidgeEvery === 0 ? Tones.Ridge : Tones.Fissure, 1 + random() * 3);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.repeat.set(Bark.RepeatAround, Bark.RepeatUp);
	return texture;
}
