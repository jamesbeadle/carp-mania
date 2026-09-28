import { paintBlade, paintStem } from '../grass/bladeStroke';
import { pickColour } from '../grass/coverPalette';
import type { ReedPalette } from './reedPalette';

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
const Plume = { Strands: 55, Length: 0.15, Spread: 0.08, Sway: 0.08, StrandWidth: 1.1, Opacity: 0.6 } as const;

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

function paintPlume(brush: ReedBrush, top: Point) {
	const { context, height, random, palette } = brush;
	const sway = height * Plume.Sway * (random() + 0.3);
	context.globalAlpha = Plume.Opacity;
	for (let strand = 0; strand < Plume.Strands; strand++) {
		const along = random();
		const from = { x: top.x + sway * along * along, y: top.y + along * height * Plume.Length };
		const to = { x: from.x + (random() - 0.2) * height * Plume.Spread, y: from.y + height * Plume.Spread * random() * 0.8 };
		paintStem(context, from, to, Plume.StrandWidth * pixelsAcross(brush), pickColour(palette.plumes, random));
	}
	context.globalAlpha = 1;
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
	if (random() < shape.plumeShare) paintPlume(brush, top);
}

export function paintPhragmites(brush: ReedBrush, shape: StandShape) {
	for (let stem = 0; stem < shape.stems; stem++) paintReedStem(brush, shape);
}
