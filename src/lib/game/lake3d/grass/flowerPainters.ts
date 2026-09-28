import { paintDot, paintStem } from './bladeStroke';
import { pickColour } from './coverPalette';
import { paintTuft, pixelsPer, type CellBrush } from './grassPainters';

const Flower = { Buttercup: '#f0cc1e', ButtercupShade: '#c89a10', Daisy: '#f6f4ec', DaisyEye: '#e8b828', Clover: '#e2b4cc', WhiteClover: '#f0ecea', Leaf: '#3c6a26' } as const;
const Heads = { Buttercups: 11, Daisies: 7, Clovers: 6, Petals: 5, PetalReach: 0.6 } as const;

function paintBloom(brush: CellBrush, centre: { x: number; y: number }, radius: number, colours: { petal: string; eye: string }) {
	const { context } = brush;
	for (let petal = 0; petal < Heads.Petals; petal++) {
		const turn = (petal / Heads.Petals) * Math.PI * 2;
		paintDot(context, { x: centre.x + Math.cos(turn) * radius * Heads.PetalReach, y: centre.y + Math.sin(turn) * radius * Heads.PetalReach * 0.7 }, radius * 0.62, colours.petal);
	}
	paintDot(context, centre, radius * 0.4, colours.eye);
}

function flowerStems(brush: CellBrush, count: number, reach: [number, number]) {
	const { size, random } = brush;
	return Array.from({ length: count }, () => {
		const rootX = size * (0.2 + random() * 0.6);
		const top = { x: rootX + (random() - 0.5) * size * 0.25, y: size * (1 - reach[0] - random() * (reach[1] - reach[0])) };
		return { root: { x: rootX, y: size }, top };
	});
}

export function paintButtercups(brush: CellBrush) {
	const { context, random, palette } = brush;
	paintTuft(brush, { count: 38, shortest: 0.2, lean: 0.4, widest: 3.5, dryShare: 0.1 }, 0.62);
	flowerStems(brush, Heads.Buttercups, [0.45, 0.92]).forEach(({ root, top }) => {
		paintStem(context, root, top, 1.4 * pixelsPer(brush), pickColour(palette.blades, random));
		paintBloom(brush, top, (5 + random() * 3) * pixelsPer(brush), { petal: Flower.Buttercup, eye: Flower.ButtercupShade });
	});
}

function paintCloverHead(brush: CellBrush, centre: { x: number; y: number }) {
	const { context, random } = brush;
	const radius = (5 + random() * 2) * pixelsPer(brush);
	paintDot(context, { x: centre.x - radius * 0.9, y: centre.y + radius * 1.4 }, radius * 0.8, Flower.Leaf);
	paintDot(context, { x: centre.x + radius * 0.9, y: centre.y + radius * 1.4 }, radius * 0.8, Flower.Leaf);
	paintDot(context, centre, radius, pickColour([Flower.Clover, Flower.WhiteClover], random));
}

export function paintDaisiesAndClover(brush: CellBrush) {
	const { context, random, palette } = brush;
	paintTuft(brush, { count: 30, shortest: 0.2, lean: 0.5, widest: 3, dryShare: 0.1 }, 0.5);
	flowerStems(brush, Heads.Clovers, [0.2, 0.45]).forEach(({ root, top }) => {
		paintStem(context, root, top, 1.6 * pixelsPer(brush), Flower.Leaf);
		paintCloverHead(brush, top);
	});
	flowerStems(brush, Heads.Daisies, [0.3, 0.62]).forEach(({ root, top }) => {
		paintStem(context, root, top, 1.3 * pixelsPer(brush), pickColour(palette.blades, random));
		paintBloom(brush, top, (5 + random() * 2.5) * pixelsPer(brush), { petal: Flower.Daisy, eye: Flower.DaisyEye });
	});
}
