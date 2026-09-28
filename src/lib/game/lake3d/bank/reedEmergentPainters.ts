import { paintBlade, paintStem } from '../grass/bladeStroke';
import { pickColour } from '../grass/coverPalette';
import { paintFeatheryPlume } from './reedPlume';
import { paintMaceHead } from './reedmacePainter';
import { pixelsAcross, type ReedBrush } from './reedPainters';

const Emergent = { Stems: 4, Edge: 0.3, Shortest: 0.72, Lean: 0.14, Width: 2, Leaves: 3, LeafLowest: 0.2, LeafSpan: 0.4, LeafLength: 0.3, LeafWidth: 5, PlumeScale: 1.5, TopSpread: 0.9, LeafRise: 0.4, LeafBend: 0.04 } as const;
const MaceStems = { Heads: 3, Swords: 3, SwordShortest: 0.3, SwordSpread: 0.4, SwordLean: 0.3, SwordWidth: 7, StemWidth: 2.6 } as const;

function stemTop(brush: ReedBrush) {
	const { width, height, random } = brush;
	const rootX = width * (Emergent.Edge + random() * (1 - Emergent.Edge * 2));
	const top = { x: rootX + (random() - 1 / 2) * width * Emergent.Lean * 2, y: height * (1 - Emergent.Shortest - random() * (1 - Emergent.Shortest) * Emergent.TopSpread) };
	return { root: { x: rootX, y: height }, top };
}

function paintStemLeaves(brush: ReedBrush, root: { x: number; y: number }, top: { x: number; y: number }) {
	const { context, width, random, palette } = brush;
	for (let leaf = 0; leaf < Emergent.Leaves; leaf++) {
		const along = Emergent.LeafLowest + random() * Emergent.LeafSpan;
		const from = { x: root.x + (top.x - root.x) * along, y: root.y + (top.y - root.y) * along };
		const side = leaf % 2 === 0 ? 1 : -1;
		const tip = { x: from.x + side * width * Emergent.LeafLength, y: from.y - width * Emergent.LeafLength * random() * Emergent.LeafRise };
		paintBlade(context, { root: from, tip, bend: side * width * Emergent.LeafBend, width: Emergent.LeafWidth * pixelsAcross(brush), colour: pickColour(palette.leaves, random) });
	}
}

export function paintEmergentReeds(brush: ReedBrush) {
	const { context, random, palette } = brush;
	for (let stem = 0; stem < Emergent.Stems; stem++) {
		const { root, top } = stemTop(brush);
		paintStem(context, root, top, Emergent.Width * pixelsAcross(brush), pickColour(palette.stems, random));
		paintStemLeaves(brush, root, top);
		paintFeatheryPlume(brush, top, Emergent.PlumeScale);
	}
}

export function paintMaceStems(brush: ReedBrush) {
	const { context, width, height, random, palette } = brush;
	for (let sword = 0; sword < MaceStems.Swords; sword++) {
		const rootX = width * (Emergent.Edge + random() * (1 - Emergent.Edge * 2));
		const tip = { x: rootX + (random() - 1 / 2) * width * MaceStems.SwordLean, y: height * (1 - MaceStems.SwordShortest - random() * MaceStems.SwordSpread) };
		paintBlade(context, { root: { x: rootX, y: height }, tip, bend: (tip.x - rootX) / 2, width: MaceStems.SwordWidth * pixelsAcross(brush), colour: pickColour(palette.maceLeaves, random) });
	}
	for (let head = 0; head < MaceStems.Heads; head++) {
		const { root, top } = stemTop(brush);
		paintStem(context, root, top, MaceStems.StemWidth * pixelsAcross(brush), pickColour(palette.stems, random));
		paintMaceHead(brush, top);
	}
}
