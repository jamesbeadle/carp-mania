export type TreeKind = 'oak' | 'alder' | 'willow' | 'birch' | 'poplar' | 'pine' | 'spruce';

export const TreeKinds: TreeKind[] = ['oak', 'alder', 'willow', 'birch', 'poplar', 'pine', 'spruce'];

const Evergreens: TreeKind[] = ['pine', 'spruce'];

export function isEvergreen(kind: TreeKind) {
	return Evergreens.includes(kind);
}

export const TreeHeights: Record<TreeKind, { least: number; range: number }> = {
	oak: { least: 13, range: 9 },
	alder: { least: 10, range: 6 },
	willow: { least: 8, range: 5 },
	birch: { least: 12, range: 6 },
	poplar: { least: 17, range: 4 },
	pine: { least: 15, range: 7 },
	spruce: { least: 14, range: 8 }
};
