import type { BufferGeometry } from 'three';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { woodGeometry, type WoodDetail } from './barkGeometry';
import { foliageGeometry, type FoliageDetail } from './crownFoliage';
import { FoliageStyles, WinterTwigs } from './foliageStyles';
import { clumpTintFor, isBare } from './treeColours';
import { Habits } from './treeHabits';
import { TreeKinds, type TreeKind } from './treeKinds';
import { growSkeleton } from './treeSkeleton';

export interface TreeDetail {
	foliage: FoliageDetail;
	wood: WoodDetail;
}

export interface TreeModel {
	kind: TreeKind;
	leaves: BufferGeometry[];
	wood: BufferGeometry[];
}

const Details: TreeDetail[] = [
	{ foliage: { siteStride: 1, cardShare: 1 }, wood: { sides: [9, 6, 4, 3], deepestLevel: 3, pointStride: 1 } },
	{ foliage: { siteStride: 2, cardShare: 0.7 }, wood: { sides: [6, 4, 3, 3], deepestLevel: 2, pointStride: 1 } },
	{ foliage: { siteStride: 4, cardShare: 0.55 }, wood: { sides: [5, 3, 3, 3], deepestLevel: 1, pointStride: 2 } },
	{ foliage: { siteStride: 9, cardShare: 0.5 }, wood: { sides: [4, 3, 3, 3], deepestLevel: 0, pointStride: 3 } }
];
export const DetailLevels = Details.length;
const SeedsPerKind = 101;

function modelOf(kind: TreeKind, variant: number, season: SeasonName, cardShare: number): TreeModel {
	const seed = (TreeKinds.indexOf(kind) + 1) * SeedsPerKind + variant * 7;
	const skeleton = growSkeleton(Habits[kind], seed);
	const style = isBare(season, kind) ? WinterTwigs : FoliageStyles[kind];
	const tint = clumpTintFor(season);
	const leaves = Details.map(({ foliage }) => foliageGeometry(skeleton, style, { ...foliage, cardShare: foliage.cardShare * cardShare }, tint, seed));
	const wood = Details.map((detail) => woodGeometry(kind, skeleton, detail.wood));
	return { kind, leaves, wood };
}

export function treeModels(season: SeasonName, variants: number, cardShare: number): TreeModel[] {
	return TreeKinds.flatMap((kind) => Array.from({ length: variants }, (_, variant) => modelOf(kind, variant, season, cardShare)));
}
