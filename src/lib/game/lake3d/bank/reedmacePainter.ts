import { paintBlade, paintStem, shadeOf } from '../grass/bladeStroke';
import { pickColour } from '../grass/coverPalette';
import { pixelsAcross, type ReedBrush } from './reedPainters';

const Sword = { Count: 16, Edge: 0.25, Shortest: 0.45, Width: 8, Arch: 0.12 } as const;
const Mace = { Heads: 4, Shortest: 0.7, HeadLength: 0.12, HeadWidth: 11, Spike: 0.06, StemWidth: 2.4, Highlight: 0.25 } as const;

function paintSword(brush: ReedBrush) {
	const { context, width, height, random, palette } = brush;
	const rootX = width * (Sword.Edge + random() * (1 - Sword.Edge * 2));
	const tall = height * (Sword.Shortest + random() * (1 - Sword.Shortest));
	const arch = (random() - 0.5) * width * Sword.Arch * 2;
	const tip = { x: rootX + arch * 1.6, y: height - tall };
	paintBlade(context, { root: { x: rootX, y: height }, tip, bend: arch, width: Sword.Width * pixelsAcross(brush) * (0.7 + random() * 0.5), colour: pickColour(palette.maceLeaves, random) });
}

function paintMaceHead(brush: ReedBrush, top: { x: number; y: number }) {
	const { context, height, random, palette } = brush;
	const headLength = height * Mace.HeadLength;
	const headWidth = Mace.HeadWidth * pixelsAcross(brush);
	const colour = pickColour(palette.maceHeads, random);
	context.fillStyle = colour;
	context.beginPath();
	context.roundRect(top.x - headWidth / 2, top.y + height * Mace.Spike, headWidth, headLength, headWidth / 2);
	context.fill();
	context.fillStyle = shadeOf(colour, Mace.Highlight);
	context.fillRect(top.x - headWidth / 4, top.y + height * Mace.Spike + headWidth / 2, headWidth / 5, headLength - headWidth);
}

export function paintReedmace(brush: ReedBrush) {
	const { context, width, height, random, palette } = brush;
	for (let sword = 0; sword < Sword.Count / 2; sword++) paintSword(brush);
	for (let head = 0; head < Mace.Heads; head++) {
		const rootX = width * (0.3 + random() * 0.4);
		const top = { x: rootX + (random() - 0.5) * width * 0.08, y: height * (1 - Mace.Shortest - random() * (1 - Mace.Shortest) * 0.9) };
		paintStem(context, { x: rootX, y: height }, top, Mace.StemWidth * pixelsAcross(brush), pickColour(palette.stems, random));
		paintMaceHead(brush, top);
	}
	for (let sword = 0; sword < Sword.Count / 2; sword++) paintSword(brush);
}
