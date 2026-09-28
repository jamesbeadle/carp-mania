import type { FoliageRegion } from './foliageAtlas';
import type { TreeKind } from './treeKinds';

export type FoliageForm = 'clump' | 'curtain' | 'spray';

export interface FoliageStyle {
	form: FoliageForm;
	region: FoliageRegion;
	clumpRadius: number;
	cards: number;
	cardSize: number;
	flatten: number;
	upward: number;
}

export const FoliageStyles: Record<TreeKind, FoliageStyle> = {
	oak: { form: 'clump', region: 'broadleaf', clumpRadius: 0.06, cards: 6, cardSize: 1.5, flatten: 0.85, upward: 0.15 },
	alder: { form: 'clump', region: 'broadleaf', clumpRadius: 0.05, cards: 5, cardSize: 1.5, flatten: 0.95, upward: 0.1 },
	willow: { form: 'curtain', region: 'willow', clumpRadius: 0.05, cards: 3, cardSize: 1.4, flatten: 0.9, upward: 0.1 },
	birch: { form: 'clump', region: 'birch', clumpRadius: 0.042, cards: 3, cardSize: 1.9, flatten: 1, upward: 0 },
	poplar: { form: 'clump', region: 'broadleaf', clumpRadius: 0.042, cards: 5, cardSize: 1.5, flatten: 1.3, upward: 0.2 },
	pine: { form: 'clump', region: 'needles', clumpRadius: 0.058, cards: 7, cardSize: 1.5, flatten: 0.5, upward: 0.7 },
	spruce: { form: 'spray', region: 'spray', clumpRadius: 0.5, cards: 2, cardSize: 0.55, flatten: 1, upward: 0.6 }
};

export const WinterTwigs: FoliageStyle = { form: 'clump', region: 'twigs', clumpRadius: 0.075, cards: 1, cardSize: 1.5, flatten: 1, upward: 0 };
