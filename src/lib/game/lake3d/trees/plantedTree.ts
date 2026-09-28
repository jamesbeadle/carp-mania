import type { WorldPoint } from '../lakeFrame';

export type TreeKind = 'poplar' | 'broadleaf' | 'willow' | 'bush';

export interface PlantedTree {
	kind: TreeKind;
	point: WorldPoint;
	height: number;
	turn: number;
}

const TreeHeights: Record<TreeKind, { least: number; range: number }> = { poplar: { least: 16, range: 10 }, broadleaf: { least: 9, range: 8 }, willow: { least: 7, range: 4 }, bush: { least: 1.8, range: 2 } };

export function treeAt(kind: TreeKind, point: WorldPoint, random: () => number): PlantedTree {
	const heights = TreeHeights[kind];
	return { kind, point, height: heights.least + random() * heights.range, turn: random() * Math.PI * 2 };
}
