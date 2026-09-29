import { paintStem } from '../grass/bladeStroke';
import { pickColour } from '../grass/coverPalette';
import { paintLeaf, pixels, spotInBlob, spotNear, type BlobSpot, type BushBrush } from './bushBrush';

export interface ShrubLeaves {
	colours: string[];
	share: number;
	length: number;
}

const Core = { Leaves: 170, Reach: 0.26 } as const;
const Sprays = { Count: 11, Reach: 0.36, Spread: 0.13, Leaves: 34 } as const;
const Leaf = { Smallest: 0.6, Swing: 0.7 } as const;
const Twig = { Width: 2, Base: 0.95, BaseSpread: 0.2, Forks: 4, ForkWidth: 1, ForkReach: 0.12 } as const;

function paintForks(brush: BushBrush, from: BlobSpot) {
	const { context, size, random, palette } = brush;
	for (let fork = 0; fork < Twig.Forks; fork++) {
		const turn = -Math.PI * random();
		const reach = size * Twig.ForkReach * (1 / 2 + random() / 2);
		const to = { x: from.x + Math.cos(turn) * reach, y: from.y + Math.sin(turn) * reach };
		paintStem(context, from, to, Twig.ForkWidth * pixels(brush), pickColour(palette.canes, random));
	}
}

function paintTwig(brush: BushBrush, to: BlobSpot) {
	const { context, size, random, palette } = brush;
	const from = { x: size / 2 + (random() - 1 / 2) * size * Twig.BaseSpread, y: size * Twig.Base };
	paintStem(context, from, to, Twig.Width * pixels(brush), pickColour(palette.canes, random));
	paintForks(brush, to);
}

function paintLeaves(brush: BushBrush, count: number, leaves: ShrubLeaves, spotAt: () => BlobSpot) {
	const { random } = brush;
	const shown = Math.round(count * leaves.share);
	for (let leaf = 0; leaf < shown; leaf++) {
		const length = leaves.length * pixels(brush) * (Leaf.Smallest + random() * Leaf.Swing);
		paintLeaf(brush, spotAt(), length, leaves.colours);
	}
}

export function paintShrub(brush: BushBrush, leaves: ShrubLeaves) {
	const sprays = Array.from({ length: Sprays.Count }, () => spotInBlob(brush, Sprays.Reach, 1 / 3));
	sprays.forEach((spray) => paintTwig(brush, spray));
	paintLeaves(brush, Core.Leaves, leaves, () => spotInBlob(brush, Core.Reach));
	sprays.forEach((spray) => paintLeaves(brush, Sprays.Leaves, leaves, () => spotNear(brush, spray, Sprays.Spread)));
}
