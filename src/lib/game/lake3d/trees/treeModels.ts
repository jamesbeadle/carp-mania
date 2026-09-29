import type { BufferGeometry } from 'three';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { withTwigs } from './bareTwigs';
import { woodGeometry } from './barkGeometry';
import { foliageGeometry, type FoliageDetail } from './crownFoliage';
import { FoliageStyles, WinterStyles } from './foliageStyles';
import { clumpTintFor, isBare } from './treeColours';
import { BareDetails, Details } from './treeDetails';
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

export interface ModelLook {
	season: SeasonName;
	cardShare: number;
}

function leafyModel(kind: TreeKind, seed: number, look: ModelLook): TreeModel {
	const skeleton = growSkeleton(Habits[kind], seed);
	const tint = clumpTintFor(look.season);
	const leaves = Details.map(({ foliage }) => foliageGeometry(skeleton, FoliageStyles[kind], { ...foliage, cardShare: foliage.cardShare * look.cardShare }, tint, seed));
	return { kind, leaves, wood: Details.map((detail) => woodGeometry(kind, skeleton, detail.wood)) };
}

function bareModel(kind: TreeKind, seed: number, look: ModelLook): TreeModel {
	const skeleton = growSkeleton(withTwigs(Habits[kind], kind), seed);
	const tint = clumpTintFor(look.season);
	const veil = (foliage: FoliageDetail) => foliageGeometry(skeleton, WinterStyles[kind], { ...foliage, siteStride: Math.round(foliage.siteStride / look.cardShare) }, tint, seed);
	const leaves = BareDetails.map(({ foliage }) => veil(foliage));
	return { kind, leaves, wood: BareDetails.map((detail) => woodGeometry(kind, skeleton, detail.wood)) };
}

function modelOf(kind: TreeKind, variant: number, look: ModelLook): TreeModel {
	const seed = (TreeKinds.indexOf(kind) + 1) * Seeds.PerKind + variant * Seeds.PerVariant;
	const build = isBare(look.season, kind) ? bareModel : leafyModel;
	return build(kind, seed, look);
}

export function treeModels(look: ModelLook, variants: number): TreeModel[] {
	return TreeKinds.flatMap((kind) => Array.from({ length: variants }, (_, variant) => modelOf(kind, variant, look)));
}
