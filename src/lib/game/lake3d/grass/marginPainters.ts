import { paintBlade, paintDot, paintStem, shadeOf } from './bladeStroke';
import { pickRandom } from '$lib/domain/random';
import { pickColour } from './coverPalette';
import { paintTuft, pixelsPer, type CellBrush } from './grassPainters';

const Rush = { Stems: 38, Fan: 0.8, Shortest: 0.4, Width: 2.6, FlowerShare: 0.18, FlowerColour: '#7a6440', FlowerAt: 0.72, FlowerRadius: 3.2 } as const;
const Sedge = { Leaves: 26, Widest: 7, Droop: 0.45 } as const;
const Sides = [-1, 1];
const Floret = { Largest: 2.8, Taper: 1.4 } as const;
const Spike = { Stems: 6, Florets: 18, SpikeShare: 0.35 } as const;

function paintRushFlower(brush: CellBrush, at: { x: number; y: number }) {
	paintDot(brush.context, at, Rush.FlowerRadius * pixelsPer(brush), Rush.FlowerColour);
}

export function paintRushes(brush: CellBrush) {
	const { context, size, random, palette } = brush;
	for (let index = 0; index < Rush.Stems; index++) {
		const rootX = size * (0.3 + random() * 0.4);
		const height = size * (Rush.Shortest + random() * (1 - Rush.Shortest));
		const tip = { x: rootX + (rootX / size - 0.5) * Rush.Fan * height, y: size - height };
		const colour = pickColour(palette.rushes, random);
		paintBlade(context, { root: { x: rootX, y: size }, tip, bend: 0, width: Rush.Width * pixelsPer(brush), colour });
		const hasFlower = random() < Rush.FlowerShare;
		if (hasFlower) paintRushFlower(brush, { x: rootX + (tip.x - rootX) * Rush.FlowerAt, y: size - height * Rush.FlowerAt });
	}
}

export function paintSedge(brush: CellBrush) {
	const { context, size, random, palette } = brush;
	for (let index = 0; index < Sedge.Leaves; index++) {
		const rootX = size * (0.4 + random() * 0.2);
		const side = pickRandom(random, Sides);
		const height = size * (0.35 + random() * 0.6);
		const reach = side * size * (0.1 + random() * Sedge.Droop) * (1 - height / size / 2);
		const colour = index < Sedge.Leaves / 3 ? shadeOf(pickColour(palette.sedges, random), -0.3) : pickColour(palette.sedges, random);
		const tip = { x: rootX + reach, y: size - height + Math.abs(reach) * 0.4 };
		paintBlade(context, { root: { x: rootX, y: size }, tip, bend: reach * 0.5, width: (3 + random() * Sedge.Widest) * pixelsPer(brush), colour });
	}
}

function paintFlowerSpike(brush: CellBrush, from: { x: number; y: number }, to: { x: number; y: number }) {
	const { context, random, palette } = brush;
	for (let floret = 0; floret < Spike.Florets; floret++) {
		const along = floret / Spike.Florets;
		const centre = { x: from.x + (to.x - from.x) * along + (random() - 0.5) * 5, y: from.y + (to.y - from.y) * along };
		paintDot(context, centre, (Floret.Largest - along * Floret.Taper) * pixelsPer(brush), pickColour(palette.spikes, random));
	}
}

export function paintSpikes(brush: CellBrush) {
	const { context, size, random, palette } = brush;
	paintTuft(brush, { count: 26, shortest: 0.3, lean: 0.4, widest: 4, dryShare: 0.2 }, 0.55);
	for (let index = 0; index < Spike.Stems; index++) {
		const rootX = size * (0.3 + random() * 0.4);
		const top = { x: rootX + (random() - 0.5) * size * 0.3, y: size * (0.03 + random() * 0.25) };
		paintStem(context, { x: rootX, y: size }, top, 2 * pixelsPer(brush), pickColour(palette.rushes, random));
		const spikeStart = { x: top.x + (rootX - top.x) * Spike.SpikeShare, y: top.y + (size - top.y) * Spike.SpikeShare };
		paintFlowerSpike(brush, spikeStart, top);
	}
}
