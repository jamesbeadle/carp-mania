import { CanvasTexture, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';

const Blades = { Width: 128, Height: 128, Count: 34, Seed: 29, Widest: 5 } as const;
const BladeTones = ['#dfe9c8', '#c4d6a4', '#eef3de', '#b4c890'];

function drawBlade(context: CanvasRenderingContext2D, random: () => number) {
	const root = Blades.Width * (0.2 + random() * 0.6);
	const lean = (random() - 0.5) * Blades.Width * 0.5;
	const top = Blades.Height * (0.05 + random() * 0.45);
	const width = 1.5 + random() * Blades.Widest;
	context.fillStyle = BladeTones[Math.floor(random() * BladeTones.length)];
	context.beginPath();
	context.moveTo(root - width / 2, Blades.Height);
	context.quadraticCurveTo(root + lean * 0.3, (top + Blades.Height) / 2, root + lean, top);
	context.quadraticCurveTo(root + lean * 0.3 + width / 3, (top + Blades.Height) / 2, root + width / 2, Blades.Height);
	context.fill();
}

export function grassBladeTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = Blades.Width;
	canvas.height = Blades.Height;
	const context = canvas.getContext('2d');
	const random = seededRandom(Blades.Seed);
	for (let index = 0; context && index < Blades.Count; index++) drawBlade(context, random);
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}
