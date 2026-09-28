import { paintBlade, paintStem, shadeOf } from '../grass/bladeStroke';
import { pickColour } from '../grass/coverPalette';
import { pixelsAcross, type ReedBrush } from './reedPainters';

const Sword = { Count: 16, Edge: 0.25, Shortest: 0.45, Width: 8, Arch: 0.12, Thinnest: 0.7, WidthSwing: 0.5 } as const;
const Mace = { Heads: 5, Shortest: 0.7, HeadLength: 0.1, HeadWidth: 21, Spike: 0.05, StemWidth: 2.6, Highlight: 0.18, Shadow: -0.3 } as const;

function paintSword(brush: ReedBrush) {
	const { context, width, height, random, palette } = brush;
	const rootX = width * (Sword.Edge + random() * (1 - Sword.Edge * 2));
	const tall = height * (Sword.Shortest + random() * (1 - Sword.Shortest));
	const arch = (random() - 0.5) * width * Sword.Arch * 2;
	const tip = { x: rootX + arch * 1.6, y: height - tall };
	const swordWidth = Sword.Width * pixelsAcross(brush) * (Sword.Thinnest + random() * Sword.WidthSwing);
	paintBlade(context, { root: { x: rootX, y: height }, tip, bend: arch, width: swordWidth, colour: pickColour(palette.maceLeaves, random) });
}

export function paintMaceHead(brush: ReedBrush, top: { x: number; y: number }) {
	const { context, height, random, palette } = brush;
	const headLength = height * Mace.HeadLength;
	const headWidth = Mace.HeadWidth * pixelsAcross(brush);
	const colour = pickColour(palette.maceHeads, random);
	const headTop = top.y + height * Mace.Spike;
	const shading = context.createLinearGradient(top.x - headWidth / 2, 0, top.x + headWidth / 2, 0);
	shading.addColorStop(0, shadeOf(colour, Mace.Highlight));
	shading.addColorStop(1, shadeOf(colour, Mace.Shadow));
	context.fillStyle = shading;
	context.beginPath();
	context.roundRect(top.x - headWidth / 2, headTop, headWidth, headLength, headWidth / 2);
	context.fill();
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
