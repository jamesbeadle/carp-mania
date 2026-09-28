import { paintDot, paintStem, shadeOf } from '../grass/bladeStroke';
import { pickColour } from '../grass/coverPalette';
import type { BushPalette } from './bushPalette';

export interface BushBrush {
	context: CanvasRenderingContext2D;
	size: number;
	random: () => number;
	palette: BushPalette;
}

const ReferenceCell = 256;
const Shrub = { Leaves: 420, Reach: 0.47, Length: 15, Twigs: 7 } as const;
const Bramble = { Clusters: 150, Reach: 0.47, Length: 20, Canes: 6, Fruit: 26 } as const;
const Shade = { Inner: -0.35, Lowest: -0.3, Highest: 0.12 } as const;
const Strokes = { Twig: 2.2, Berry: 3.4, LeafAspect: 4.5 } as const;
const Lobes = { Count: 5, Phase: 1.3, Depth: 0.3 } as const;
const Leaflets = [{ x: -0.45, y: 0 }, { x: 0, y: -0.3 }, { x: 0.45, y: 0 }];

function pixels(brush: BushBrush) {
	return brush.size / ReferenceCell;
}

function spotInBlob(brush: BushBrush, reach: number) {
	const { size, random } = brush;
	const turn = random() * Math.PI * 2;
	const lobes = 1 - Lobes.Depth + Lobes.Depth * Math.sin(turn * Lobes.Count + Lobes.Phase) * Math.sin(turn * 2);
	const distance = Math.sqrt(random()) * reach * size * lobes;
	return { x: size / 2 + Math.cos(turn) * distance, y: size / 2 + Math.sin(turn) * distance, depth: distance / (reach * size) };
}

function paintLeaf(brush: BushBrush, at: { x: number; y: number; depth: number }, length: number, colours: string[]) {
	const { context, size, random } = brush;
	const height = at.y / size;
	const light = Shade.Inner * (1 - at.depth) + Shade.Lowest * height + Shade.Highest * (1 - height);
	context.fillStyle = shadeOf(pickColour(colours, random), light);
	context.beginPath();
	context.ellipse(at.x, at.y, length / 2, length / Strokes.LeafAspect, random() * Math.PI, 0, Math.PI * 2);
	context.fill();
}

function paintTwigs(brush: BushBrush, count: number, reach: number) {
	const { context, size, random, palette } = brush;
	for (let twig = 0; twig < count; twig++) {
		const end = spotInBlob(brush, reach);
		paintStem(context, { x: size / 2 + (random() - 0.5) * size * 0.2, y: size * 0.95 }, end, Strokes.Twig * pixels(brush), pickColour(palette.canes, random));
	}
}

export function paintShrub(brush: BushBrush) {
	const { palette, random } = brush;
	paintTwigs(brush, Shrub.Twigs, Shrub.Reach);
	const leaves = Math.round(Shrub.Leaves * palette.leafShare);
	for (let leaf = 0; leaf < leaves; leaf++) paintLeaf(brush, spotInBlob(brush, Shrub.Reach), Shrub.Length * pixels(brush) * (0.7 + random() * 0.6), palette.leaves);
}

export function paintBramble(brush: BushBrush) {
	const { context, palette, random } = brush;
	paintTwigs(brush, Bramble.Canes, Bramble.Reach);
	for (let cluster = 0; cluster < Bramble.Clusters; cluster++) {
		const at = spotInBlob(brush, Bramble.Reach);
		const length = Bramble.Length * pixels(brush) * (0.7 + random() * 0.5);
		Leaflets.forEach((leaflet) => paintLeaf(brush, { x: at.x + leaflet.x * length, y: at.y + leaflet.y * length, depth: at.depth }, length, palette.brambleLeaves));
	}
	for (let berry = 0; berry < Bramble.Fruit; berry++) paintDot(context, spotInBlob(brush, Bramble.Reach * 0.9), Strokes.Berry * pixels(brush), pickColour(palette.fruit, random));
}
