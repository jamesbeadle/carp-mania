import type { FoliageRegion } from './atlasRegions';
import type { TreeKind } from './treeKinds';

export type FoliageForm = 'clump' | 'curtain';

export interface FoliageStyle {
	form: FoliageForm;
	region: FoliageRegion;
	fineRegion: FoliageRegion;
	clumpRadius: number;
	cards: number;
	cardSize: number;
	flatten: number;
	upward: number;
	spin: number;
	aspect: number;
	isAlongBranch: boolean;
	tipInset: number;
}

const Turn = Math.PI;
const Loose = { spin: Turn, aspect: 1, isAlongBranch: false, tipInset: 0 } as const;
const Hanging = { spin: 0.35, aspect: 1.15, isAlongBranch: false, tipInset: 0 } as const;

export const FoliageStyles: Record<TreeKind, FoliageStyle> = {
	oak: { ...Loose, form: 'clump', region: 'broadleaf', fineRegion: 'broadleafFine', clumpRadius: 0.055, cards: 7, cardSize: 1.25, flatten: 0.85, upward: 0.15 },
	alder: { ...Loose, form: 'clump', region: 'roundleaf', fineRegion: 'roundleafFine', clumpRadius: 0.048, cards: 6, cardSize: 1.25, flatten: 0.95, upward: 0.1 },
	willow: { ...Hanging, form: 'curtain', region: 'willow', fineRegion: 'willow', clumpRadius: 0.05, cards: 3, cardSize: 1.3, flatten: 0.9, upward: 0.1 },
	birch: { ...Hanging, form: 'clump', region: 'birch', fineRegion: 'birchFine', clumpRadius: 0.042, cards: 3, cardSize: 1.5, flatten: 1, upward: 0 },
	poplar: { ...Loose, form: 'clump', region: 'broadleafFine', fineRegion: 'broadleafFine', clumpRadius: 0.034, cards: 6, cardSize: 1.3, flatten: 1.4, upward: 0.2 },
	pine: { spin: 0.3, aspect: 0.8, isAlongBranch: false, tipInset: 0, form: 'clump', region: 'needles', fineRegion: 'needles', clumpRadius: 0.055, cards: 7, cardSize: 1.3, flatten: 0.45, upward: 0.7 },
	spruce: { spin: 0.08, aspect: 1.5, isAlongBranch: true, tipInset: 0.3, form: 'clump', region: 'spray', fineRegion: 'spray', clumpRadius: 0.05, cards: 3, cardSize: 1.3, flatten: 0.6, upward: 0.2 }
};

export const WinterTwigs: FoliageStyle = { spin: 0.2, aspect: 1, isAlongBranch: true, tipInset: 1, form: 'clump', region: 'twigs', fineRegion: 'twigs', clumpRadius: 0.045, cards: 1, cardSize: 1.4, flatten: 1, upward: 0 };
