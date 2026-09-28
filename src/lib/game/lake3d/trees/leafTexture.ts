import { CanvasTexture, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';

const Leaves = { Pixels: 256, Count: 150, Seed: 71, Longest: 16, Shortest: 7, Margin: 0.12 } as const;
const LeafTones = ['#e9f2dc', '#c9d9b4', '#f4f8ec', '#aec39a', '#dbe7c8'];

function drawLeaf(context: CanvasRenderingContext2D, random: () => number) {
	const reach = Leaves.Pixels * (0.5 - Leaves.Margin);
	const angle = random() * Math.PI * 2;
	const distance = Math.sqrt(random()) * reach;
	const length = Leaves.Shortest + random() * (Leaves.Longest - Leaves.Shortest);
	context.save();
	context.translate(Leaves.Pixels / 2 + Math.cos(angle) * distance, Leaves.Pixels / 2 + Math.sin(angle) * distance);
	context.rotate(random() * Math.PI * 2);
	context.fillStyle = LeafTones[Math.floor(random() * LeafTones.length)];
	context.beginPath();
	context.ellipse(0, 0, length, length * 0.45, 0, 0, Math.PI * 2);
	context.fill();
	context.restore();
}

export function leafClusterTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = Leaves.Pixels;
	canvas.height = Leaves.Pixels;
	const context = canvas.getContext('2d');
	const random = seededRandom(Leaves.Seed);
	for (let index = 0; context && index < Leaves.Count; index++) drawLeaf(context, random);
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}
