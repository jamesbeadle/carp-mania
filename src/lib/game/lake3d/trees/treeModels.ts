import type { BufferGeometry } from 'three';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { withTwigs } from './bareTwigs';
import { woodGeometry } from './barkGeometry';
import { emptyFoliage, foliageGeometry, type FoliageDetail } from './crownFoliage';
import { FoliageStyles, WinterTwigs } from './foliageStyles';
import { clumpTintFor, isBare } from './treeColours';
import { BareDetails, Details, FirstHazeDetail } from './treeDetails';
import { Habits } from './treeHabits';
import { TreeKinds, type TreeKind } from './treeKinds';
import { growSkeleton } from './treeSkeleton';

export { DetailLevels } from './treeDetails';

export interface TreeModel {
	kind: TreeKind;
	leaves: BufferGeometry[];
	wood: BufferGeometry[];
}

const Seeds = { PerKind: 101, PerVariant: 7 } as const;

function leafyModel(kind: TreeKind, seed: number, season: SeasonName, cardShare: number): TreeModel {
	const skeleton = growSkeleton(Habits[kind], seed);
	const tint = clumpTintFor(season);
	const leaves = Details.map(({ foliage }) => foliageGeometry(skeleton, FoliageStyles[kind], { ...foliage, cardShare: foliage.cardShare * cardShare }, tint, seed));
	return { kind, leaves, wood: Details.map((detail) => woodGeometry(kind, skeleton, detail.wood)) };
}

function bareModel(kind: TreeKind, seed: number, season: SeasonName, cardShare: number): TreeModel {
	const skeleton = growSkeleton(withTwigs(Habits[kind], kind), seed);
	const tint = clumpTintFor(season);
	const haze = (foliage: FoliageDetail) => foliageGeometry(skeleton, WinterTwigs, { ...foliage, cardShare: foliage.cardShare * cardShare }, tint, seed);
	const leaves = BareDetails.map(({ foliage }, level) => (level < FirstHazeDetail ? emptyFoliage() : haze(foliage)));
	return { kind, leaves, wood: BareDetails.map((detail) => woodGeometry(kind, skeleton, detail.wood)) };
}

function modelOf(kind: TreeKind, variant: number, season: SeasonName, cardShare: number): TreeModel {
	const seed = (TreeKinds.indexOf(kind) + 1) * Seeds.PerKind + variant * Seeds.PerVariant;
	const build = isBare(season, kind) ? bareModel : leafyModel;
	return build(kind, seed, season, cardShare);
}

export function treeModels(season: SeasonName, variants: number, cardShare: number): TreeModel[] {
	return TreeKinds.flatMap((kind) => Array.from({ length: variants }, (_, variant) => modelOf(kind, variant, season, cardShare)));
}
