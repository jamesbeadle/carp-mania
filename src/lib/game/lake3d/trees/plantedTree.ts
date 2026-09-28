import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { TreeHeights, type TreeKind } from './treeKinds';
import { leanOf } from './treeLean';

export interface PlantedTree {
	kind: TreeKind;
	point: WorldPoint;
	height: number;
	turn: number;
	lean: number;
	leanHeading: number;
	girth: number;
	pick: number;
}

const Girth = { Least: 0.82, Range: 0.36 } as const;

export function treeAt(kind: TreeKind, point: WorldPoint, distanceFromWater: number, outline: WorldPoint[], random: RandomFraction): PlantedTree {
	const heights = TreeHeights[kind];
	const height = heights.least + random() * heights.range;
	const lean = leanOf(kind, point, distanceFromWater, outline, random);
	return { kind, point, height, turn: random() * Math.PI * 2, ...lean, girth: Girth.Least + random() * Girth.Range, pick: random() };
}
