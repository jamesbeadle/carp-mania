import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import type { TreeKind } from './treeKinds';
import type { WoodlandFields } from './woodlandFields';

export const Bands = { NearestWater: 3.2, Waterside: 11, OtherKindsFromWater: 9 } as const;
const Groves = { Conifer: 0.78, Birch: 0.8, Poplar: 0.84, Pine: 0.5 } as const;

type Weights = [TreeKind, number][];

const Waterside: Weights = [['willow', 0.4], ['alder', 0.45], ['birch', 0.1], ['oak', 0.05]];
const Woods: Weights = [['oak', 0.66], ['alder', 0.14], ['birch', 0.08], ['willow', 0.02], ['pine', 0.05], ['spruce', 0.05]];
const Close: Weights = [['willow', 0.55], ['alder', 0.45]];

function pickWeighted(weights: Weights, random: RandomFraction): TreeKind {
	const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
	let roll = random() * total;
	for (const [kind, weight] of weights) {
		roll -= weight;
		if (roll <= 0) return kind;
	}
	return weights[0][0];
}

function groveKindAt(point: WorldPoint, fields: WoodlandFields): TreeKind | null {
	if (fields.conifer(point) > Groves.Conifer) return fields.pine(point) > Groves.Pine ? 'pine' : 'spruce';
	if (fields.birch(point) > Groves.Birch) return 'birch';
	if (fields.poplar(point) > Groves.Poplar) return 'poplar';
	return null;
}

export function kindFor(point: WorldPoint, distanceFromWater: number, fields: WoodlandFields, random: RandomFraction): TreeKind {
	if (distanceFromWater < Bands.OtherKindsFromWater) return pickWeighted(Close, random);
	if (distanceFromWater < Bands.Waterside) return pickWeighted(Waterside, random);
	return groveKindAt(point, fields) ?? pickWeighted(Woods, random);
}
