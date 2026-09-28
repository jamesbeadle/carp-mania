import { paintBlade, paintStem, shadeOf } from '../grass/bladeStroke';
import { pickColour } from '../grass/coverPalette';
import type { ReedPalette } from './reedPalette';
import { paintFeatheryPlume } from './reedPlume';

export interface ReedBrush {
	context: CanvasRenderingContext2D;
	width: number;
	height: number;
	random: () => number;
	palette: ReedPalette;
}

export interface StandShape {
	stems: number;
	plumeShare: number;
	leavesPerStem: number;
}

interface Point {
	x: number;
	y: number;
}

const ReferenceWidth = 256;
const Stem = { Edge: 0.14, Shortest: 0.62, Lean: 0.1, Width: 2.2, LowestLeaf: 0.08, HighestLeaf: 0.8 } as const;
const Leaf = { Shortest: 0.16, Longest: 0.34, Width: 6.5, Droop: 0.2, Thinnest: 0.7, WidthSwing: 0.5, Bend: 0.1 } as const;
const Understorey = { Blades: 30, Tallest: 0.34, Shortest: 0.1, Width: 7, Shade: -0.38, Lean: 0.18 } as const;

export function pixelsAcross(brush: ReedBrush) {
	return brush.width / ReferenceWidth;
}

function paintLeaf(brush: ReedBrush, from: Point, side: number) {
	const { context, width, random, palette } = brush;
	const length = width * (Leaf.Shortest + random() * (Leaf.Longest - Leaf.Shortest));
	const tip = { x: from.x + side * length * 0.85, y: from.y - length * (0.35 - random() * Leaf.Droop) };
	const leafWidth = Leaf.Width * pixelsAcross(brush) * (Leaf.Thinnest + random() * Leaf.WidthSwing);
	paintBlade(context, { root: from, tip, bend: side * length * Leaf.Bend, width: leafWidth, colour: pickColour(palette.leaves, random) });
}

function paintReedStem(brush: ReedBrush, shape: StandShape) {
	const { context, width, height, random, palette } = brush;
	const root = { x: width * (Stem.Edge + random() * (1 - Stem.Edge * 2)), y: height };
	const tall = height * (Stem.Shortest + random() * (1 - Stem.Shortest));
	const top = { x: root.x + (random() - 0.5) * width * Stem.Lean * 2, y: height - tall };
	paintStem(context, root, top, Stem.Width * pixelsAcross(brush), pickColour(palette.stems, random));
	for (let leaf = 0; leaf < shape.leavesPerStem; leaf++) {
		const along = Stem.LowestLeaf + (leaf / shape.leavesPerStem) * (Stem.HighestLeaf - Stem.LowestLeaf);
		paintLeaf(brush, { x: root.x + (top.x - root.x) * along, y: height - tall * along }, (leaf % 2) * 2 - 1);
	}
	if (random() < shape.plumeShare) paintFeatheryPlume(brush, top);
}

function paintUnderstorey(brush: ReedBrush) {
	const { context, width, height, random, palette } = brush;
	for (let blade = 0; blade < Understorey.Blades; blade++) {
		const root = { x: width * (Stem.Edge + random() * (1 - Stem.Edge * 2)), y: height };
		const tall = height * (Understorey.Shortest + random() * (Understorey.Tallest - Understorey.Shortest));
		const tip = { x: root.x + (random() - 1 / 2) * width * Understorey.Lean * 2, y: height - tall };
		const colour = shadeOf(pickColour(palette.leaves, random), Understorey.Shade * random());
		paintBlade(context, { root, tip, bend: (tip.x - root.x) / 2, width: Understorey.Width * pixelsAcross(brush), colour });
	}
}

export function paintPhragmites(brush: ReedBrush, shape: StandShape) {
	paintUnderstorey(brush);
	for (let stem = 0; stem < shape.stems; stem++) paintReedStem(brush, shape);
}
