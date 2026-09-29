import { paintBlade, paintStem, shadeOf } from './bladeStroke';
import { pickColour, type CoverPalette } from './coverPalette';

export interface CellBrush {
	context: CanvasRenderingContext2D;
	size: number;
	random: () => number;
	palette: CoverPalette;
}

export interface TuftShape {
	count: number;
	shortest: number;
	lean: number;
	widest: number;
	dryShare: number;
	isSpread?: boolean;
	dome?: number;
}

const ReferenceCell = 256;
const Clump = { Centre: 0.5, Spread: 0.36, BackShade: -0.14, BackShare: 0.45, Edge: 0.06, RaggedRoots: 0.24 } as const;
const Seeds = { Stems: 11, HeadLength: 0.16, Spikelets: 9, SpikeletLength: 7, StemWidth: 1.4 } as const;

export function pixelsPer(brush: CellBrush) {
	return brush.size / ReferenceCell;
}

function clumpedAcross(random: () => number) {
	return Clump.Centre + (random() + random() - 1) * Clump.Spread;
}

export function paintTuft(brush: CellBrush, shape: TuftShape, heightShare = 1) {
	const { context, size, random, palette } = brush;
	for (let index = 0; index < shape.count; index++) {
		const isBack = index < shape.count * Clump.BackShare;
		const isDry = random() < shape.dryShare;
		const base = pickColour(isDry ? palette.dryBlades : palette.blades, random);
		const rootX = (shape.isSpread ? Clump.Edge + random() * (1 - Clump.Edge * 2) : clumpedAcross(random)) * size;
		const envelope = 1 - (shape.dome ?? 0) * Math.pow((rootX / size - Clump.Centre) * 2, 2);
		const height = (shape.shortest + random() * (1 - shape.shortest)) * size * heightShare * envelope;
		const fan = shape.isSpread ? 0 : (rootX - size / 2) * Clump.Spread;
		const lean = (random() - Clump.Centre) * shape.lean * size + fan;
		const colour = isBack ? shadeOf(base, Clump.BackShade) : base;
		const width = (1.5 + random() * shape.widest) * pixelsPer(brush);
		const rootY = size * (1 - random() * Clump.RaggedRoots);
		paintBlade(context, { root: { x: rootX, y: rootY }, tip: { x: rootX + lean, y: rootY * (1 - height / size) }, bend: lean * 0.25, width, colour });
	}
}

function paintSeedHead(brush: CellBrush, top: { x: number; y: number }) {
	const { context, size, random, palette } = brush;
	const colour = pickColour(palette.seedHeads, random);
	const length = Seeds.HeadLength * size;
	for (let index = 0; index < Seeds.Spikelets; index++) {
		const along = (index / Seeds.Spikelets) * length;
		const side = (index % 2) * 2 - 1;
		const from = { x: top.x, y: top.y + along };
		const reach = Seeds.SpikeletLength * pixelsPer(brush) * (1 - along / length / 2);
		paintStem(context, from, { x: from.x + side * reach * 0.6, y: from.y - reach * 0.5 }, 2.2 * pixelsPer(brush), colour);
	}
}

export function paintMeadow(brush: CellBrush) {
	const { context, size, random, palette } = brush;
	paintTuft(brush, { count: 55, shortest: 0.3, lean: 0.35, widest: 4.5, dryShare: 0.15 }, 0.75);
	for (let index = 0; index < Seeds.Stems; index++) {
		const rootX = clumpedAcross(random) * size;
		const top = { x: rootX + (random() - Clump.Centre) * size * 0.3, y: size * (0.04 + random() * 0.3) };
		paintStem(context, { x: rootX, y: size }, top, Seeds.StemWidth * pixelsPer(brush), pickColour(palette.blades, random));
		paintSeedHead(brush, top);
	}
}
