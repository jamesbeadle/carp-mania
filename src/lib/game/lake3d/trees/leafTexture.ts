import { CanvasTexture, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';

const Leaves = { Pixels: 512, Count: 900, Seed: 71, Longest: 22, Shortest: 10, Margin: 0.06 } as const;
const LeafTones = ['#e9f2dc', '#c2d4aa', '#f4f8ec', '#9fb88a', '#dbe7c8', '#8aa676'];
const LeafEdge = 'rgba(70, 90, 50, 0.4)';

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
	context.strokeStyle = LeafEdge;
	context.stroke();
	context.beginPath();
	context.moveTo(-length, 0);
	context.lineTo(length, 0);
	context.stroke();
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
