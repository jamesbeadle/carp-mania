import { paintStem, shadeOf } from '../grass/bladeStroke';
import { pickColour } from '../grass/coverPalette';
import type { ReedBrush } from './reedPainters';

interface Point {
	x: number;
	y: number;
}

const ReferenceWidth = 256;
const Plume = { Strands: 90, Length: 0.14, Droop: 0.09, Spread: 0.05, StrandWidth: 1.3, Opacity: 0.75, Lightest: 0.18, Darkest: -0.2 } as const;
const Rachis = { Width: 1.4, Shade: -0.15 } as const;

export function paintFeatheryPlume(brush: ReedBrush, top: Point, scale = 1) {
	const { context, width, height, random, palette } = brush;
	const pixels = width / ReferenceWidth;
	const length = height * Plume.Length * scale;
	const droop = (random() < 1 / 2 ? -1 : 1) * height * Plume.Droop * scale * (1 / 2 + random() / 2);
	const tip = { x: top.x + droop, y: top.y + length * (1 / 2 + random() / 4) };
	const colour = pickColour(palette.plumes, random);
	paintStem(context, top, tip, Rachis.Width * pixels, shadeOf(colour, Rachis.Shade));
	context.globalAlpha = Plume.Opacity;
	for (let strand = 0; strand < Plume.Strands; strand++) {
		const along = Math.sqrt(random());
		const from = { x: top.x + (tip.x - top.x) * along, y: top.y + (tip.y - top.y) * along };
		const reach = height * Plume.Spread * scale * (1 - along / 2);
		const to = { x: from.x + (random() - 1 / 2) * reach * 2, y: from.y + reach * random() };
		const tone = Plume.Darkest + random() * (Plume.Lightest - Plume.Darkest);
		paintStem(context, from, to, Plume.StrandWidth * pixels, shadeOf(pickColour(palette.plumes, random), tone));
	}
	context.globalAlpha = 1;
}
