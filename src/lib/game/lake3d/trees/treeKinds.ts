export type TreeKind = 'oak' | 'alder' | 'willow' | 'birch' | 'poplar' | 'pine' | 'spruce';

export const TreeKinds: TreeKind[] = ['oak', 'alder', 'willow', 'birch', 'poplar', 'pine', 'spruce'];

const Evergreens: TreeKind[] = ['pine', 'spruce'];

export function isEvergreen(kind: TreeKind) {
	return Evergreens.includes(kind);
}

export const TreeHeights: Record<TreeKind, { least: number; range: number }> = {
	oak: { least: 12, range: 11 },
	alder: { least: 9, range: 8 },
	willow: { least: 7, range: 6 },
	birch: { least: 9, range: 10 },
	poplar: { least: 16, range: 7 },
	pine: { least: 13, range: 10 },
	spruce: { least: 11, range: 11 }
};

export const CrownReach: Record<TreeKind, number> = { oak: 0.3, alder: 0.2, willow: 0.35, birch: 0.18, poplar: 0.1, pine: 0.2, spruce: 0.2 };
