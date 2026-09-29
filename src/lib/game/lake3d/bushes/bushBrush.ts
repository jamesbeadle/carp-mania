import { shadeOf } from '../grass/bladeStroke';
import { pickColour } from '../grass/coverPalette';
import type { BushPalette } from './bushPalette';

export interface BushBrush {
	context: CanvasRenderingContext2D;
	size: number;
	random: () => number;
	palette: BushPalette;
}

export interface BlobSpot {
	x: number;
	y: number;
	depth: number;
}

const ReferenceCell = 256;
const Shade = { Inner: -0.24, Lowest: -0.16, Highest: 0.1 } as const;
const Lobes = { Count: 5, Phase: 1.3, Depth: 0.3 } as const;
const LeafAspect = 2.6;

export function pixels(brush: BushBrush) {
	return brush.size / ReferenceCell;
}

export function spotInBlob(brush: BushBrush, reach: number, spread = 1 / 2): BlobSpot {
	const { size, random } = brush;
	const turn = random() * Math.PI * 2;
	const lobes = 1 - Lobes.Depth + Lobes.Depth * Math.sin(turn * Lobes.Count + Lobes.Phase) * Math.sin(turn * 2);
	const distance = Math.pow(random(), spread) * reach * size * lobes;
	return { x: size / 2 + Math.cos(turn) * distance, y: size / 2 + Math.sin(turn) * distance, depth: distance / (reach * size) };
}

export function spotNear(brush: BushBrush, centre: BlobSpot, reach: number): BlobSpot {
	const { size, random } = brush;
	const turn = random() * Math.PI * 2;
	const distance = Math.sqrt(random()) * reach * size;
	const x = centre.x + Math.cos(turn) * distance;
	const y = centre.y + Math.sin(turn) * distance;
	return { x, y, depth: Math.min(1, Math.hypot(x - size / 2, y - size / 2) / (size / 2)) };
}

export function paintLeaf(brush: BushBrush, at: BlobSpot, length: number, colours: string[]) {
	const { context, size, random } = brush;
	const height = at.y / size;
	const light = Shade.Inner * (1 - at.depth) + Shade.Lowest * height + Shade.Highest * (1 - height);
	context.fillStyle = shadeOf(pickColour(colours, random), light);
	context.beginPath();
	context.ellipse(at.x, at.y, length / 2, length / LeafAspect, random() * Math.PI, 0, Math.PI * 2);
	context.fill();
}
