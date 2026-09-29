import type { DataTexture } from 'three';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { untilTheNextFrame } from '../frameYield';
import { renderQuality } from '../renderQuality';
import { foliageAtlas } from './foliageAtlas';
import { hasMultiDraw } from './multiDraw';
import { treeModels, type TreeModel } from './treeModels';

export interface TreeStock {
	models: TreeModel[];
	atlas: DataTexture;
	variants: number;
	isBatched: boolean;
}

const BatchedVariants = 4;

export async function gatherTreeStock(season: SeasonName): Promise<TreeStock> {
	const quality = renderQuality();
	const isBatched = hasMultiDraw();
	const variants = isBatched ? BatchedVariants : quality.treeVariantsSingleDraw;
	const models = treeModels({ season, cardShare: quality.treeCardShare }, variants);
	await untilTheNextFrame();
	const atlas = foliageAtlas(quality.treeAtlasPixels);
	return { models, atlas, variants, isBatched };
}
