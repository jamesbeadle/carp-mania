import { paintDot } from './bladeStroke';
import { pickColour } from './coverPalette';
import { paintTuft, pixelsPer, type CellBrush } from './grassPainters';

const Sward = { count: 420, shortest: 0.3, lean: 0.4, widest: 3.2, dryShare: 0.1, isSpread: true, dome: 0.72 } as const;
const Clover = { Leaves: 16, Heads: 3, LeafSize: 3.2, HeadSize: 3.6, Lowest: 0.62, Highest: 0.9, Edge: 0.12, SwardHeight: 0.8 } as const;
const Trefoil = [
	{ x: 0, y: -1 },
	{ x: -0.9, y: 0.5 },
	{ x: 0.9, y: 0.5 }
] as const;
const CloverLeaves = ['#3a6a2c', '#447432', '#4e7c36'];
const CloverHeads = ['#f2eee6', '#ece4e8', '#e6c2d4'];

export function paintSward(brush: CellBrush) {
	paintTuft(brush, Sward);
}

function paintTrefoil(brush: CellBrush, centre: { x: number; y: number }) {
	const { context, random } = brush;
	const radius = Clover.LeafSize * pixelsPer(brush) * (1 + random() / 2);
	const colour = pickColour(CloverLeaves, random);
	Trefoil.forEach((leaf) => paintDot(context, { x: centre.x + leaf.x * radius, y: centre.y + leaf.y * radius }, radius, colour));
}

function spotIn(brush: CellBrush) {
	const { size, random } = brush;
	const across = Clover.Edge + random() * (1 - Clover.Edge * 2);
	return { x: across * size, y: (Clover.Lowest + random() * (Clover.Highest - Clover.Lowest)) * size };
}

export function paintCloverSward(brush: CellBrush) {
	const { context, random, palette } = brush;
	paintTuft(brush, { ...Sward, count: Sward.count / 2 }, Clover.SwardHeight);
	for (let leaf = 0; leaf < Clover.Leaves; leaf++) paintTrefoil(brush, spotIn(brush));
	const heads = Math.round(Clover.Heads * palette.flowerShare);
	for (let head = 0; head < heads; head++) paintDot(context, spotIn(brush), Clover.HeadSize * pixelsPer(brush), pickColour(CloverHeads, random));
}
