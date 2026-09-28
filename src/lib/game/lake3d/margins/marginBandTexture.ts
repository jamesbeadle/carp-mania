import { RepeatWrapping } from 'three';
import { seededRandom } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { paintAtlas } from '../grass/atlasTexture';
import { paintBlade, paintDot, shadeOf } from '../grass/bladeStroke';
import { CoverPalettes, pickColour, type CoverPalette } from '../grass/coverPalette';

interface StripBrush {
	context: CanvasRenderingContext2D;
	width: number;
	height: number;
	random: () => number;
	palette: CoverPalette;
}

const Strip = { WidthPerCell: 4, HeightPerCell: 1, Seed: 6211 } as const;
const Clumps = { Count: 46, Stems: 26, Spread: 0.02, Shortest: 0.3, Swing: 0.7, Lean: 0.05 } as const;
const Stroke = { Rush: 2.4, Sedge: 6, SedgeShare: 0.35, BackShade: -0.25, BackShare: 0.4, FlowerShare: 0.08, Flower: 3, FlowerAt: 0.8, Bend: 0.33 } as const;
const ReferenceHeight = 256;

function paintStem(brush: StripBrush, centre: number, clumpHeight: number, isBack: boolean) {
	const { context, width, height, random, palette } = brush;
	const isSedge = random() < Stroke.SedgeShare;
	const rootX = centre + (random() + random() - 1) * width * Clumps.Spread;
	const tall = clumpHeight * (Clumps.Shortest + random() * (1 - Clumps.Shortest));
	const lean = (random() - 1 / 2) * width * Clumps.Lean + (isSedge ? (rootX - centre) * 2 : 0);
	const base = pickColour(isSedge ? palette.sedges : palette.rushes, random);
	const colour = isBack ? shadeOf(base, Stroke.BackShade) : base;
	const scale = height / ReferenceHeight;
	const tip = { x: rootX + lean, y: height - tall };
	paintBlade(context, { root: { x: rootX, y: height }, tip, bend: lean * Stroke.Bend, width: (isSedge ? Stroke.Sedge : Stroke.Rush) * scale, colour });
	const hasFlower = !isSedge && random() < Stroke.FlowerShare;
	if (!hasFlower) return;
	const flowerAt = { x: rootX + lean * Stroke.FlowerAt, y: height - tall * Stroke.FlowerAt };
	paintDot(context, flowerAt, Stroke.Flower * scale, pickColour(palette.spikes, random));
}

function paintClump(brush: StripBrush, centre: number) {
	const { height, random } = brush;
	const clumpHeight = height * (Clumps.Shortest + random() * Clumps.Swing);
	for (let stem = 0; stem < Clumps.Stems; stem++) paintStem(brush, centre, clumpHeight, stem < Clumps.Stems * Stroke.BackShare);
}

function paintStrip(brush: StripBrush) {
	const { width, random } = brush;
	for (let clump = 0; clump < Clumps.Count; clump++) paintClump(brush, (clump + random()) * (width / Clumps.Count));
}

export function marginBandTexture(season: SeasonName, cellPixels: number) {
	const width = cellPixels * Strip.WidthPerCell;
	const height = cellPixels * Strip.HeightPerCell;
	const grid = { columns: 1, rows: 1, cellWidth: width, cellHeight: height, padding: 0 };
	const random = seededRandom(Strip.Seed);
	const palette = CoverPalettes[season];
	const texture = paintAtlas(grid, (context) => paintStrip({ context, width, height, random, palette }));
	texture.wrapS = RepeatWrapping;
	return texture;
}
