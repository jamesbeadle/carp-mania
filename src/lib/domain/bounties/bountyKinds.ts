export type BountyKind = 'top_of_the_water' | 'named_fish' | 'peg_prize' | 'over_the_line' | 'hard_graft';

export interface BountyKindWords {
	label: string;
	wonBy: string;
}

export const BountyKindCatalogue: Record<BountyKind, BountyKindWords> = {
	top_of_the_water: { label: 'Top of the water', wonBy: 'the heaviest fish an angler lands here inside the window' },
	named_fish: { label: 'Named fish', wonBy: 'the first angler to land one particular fish' },
	peg_prize: { label: 'Peg prize', wonBy: 'the heaviest fish from one named swim' },
	over_the_line: { label: 'Over the line', wonBy: 'the first angler to land a fish over the stated weight' },
	hard_graft: { label: 'Hard graft', wonBy: 'the most fish landed here inside the window' }
};

export const BountyKinds = Object.keys(BountyKindCatalogue) as BountyKind[];

const SettledOnTheSpot: BountyKind[] = ['named_fish', 'over_the_line'];

export function isSettledOnTheSpot(kind: BountyKind) {
	return SettledOnTheSpot.includes(kind);
}

export function isBountyKind(value: unknown): value is BountyKind {
	return (BountyKinds as string[]).includes(value as string);
}
