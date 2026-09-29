import type { BufferGeometry, Matrix4, Mesh, Texture, Vector4 } from 'three';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { emptyFoliage } from './crownFoliage';
import type { CrownSway } from './crownSway';
import { leafMaterial } from './leafMaterial';
import { isBare } from './treeColours';
import type { TreeModel } from './treeModels';
import type { TreeParts, TreePartsMaker } from './treeParts';

class LayeredParts implements TreeParts {
	readonly meshes: Mesh[];
	readonly distantMeshes: Mesh[];
	private readonly planted: number[][] = [];

	constructor(private readonly layers: TreeParts[]) {
		this.meshes = layers.flatMap((layer) => layer.meshes);
		this.distantMeshes = layers.flatMap((layer) => layer.distantMeshes);
	}

	plant(model: number, detail: number, placement: Matrix4, colour: Vector4 | null) {
		this.planted.push(this.layers.map((layer) => layer.plant(model, detail, placement, colour)));
		return this.planted.length - 1;
	}

	show(planting: number, model: number, detail: number) {
		const indices = this.planted[planting];
		this.layers.forEach((layer, index) => layer.show(indices[index], model, detail));
	}
}

export interface LeafLayering {
	models: TreeModel[];
	season: SeasonName;
	isMultisampled: boolean;
	counts: number[];
}

function leavesWhere(models: TreeModel[], isKept: (model: TreeModel) => boolean): BufferGeometry[][] {
	return models.map((model) => (isKept(model) ? model.leaves : model.leaves.map(() => emptyFoliage())));
}

export function leafLayers(layering: LeafLayering, Parts: TreePartsMaker, atlas: Texture, sway: CrownSway): TreeParts {
	const { models, season, isMultisampled, counts } = layering;
	const isAnyBare = models.some((model) => isBare(season, model.kind));
	const opaque = leafMaterial(atlas, sway, { isMultisampled, isVeilBlended: false });
	const isSingleLayer = isMultisampled || !isAnyBare;
	const allLeaves = models.map((model) => model.leaves);
	if (isSingleLayer) return new Parts(allLeaves, opaque, counts);
	const isBareModel = (model: TreeModel) => isBare(season, model.kind);
	const evergreens = new Parts(leavesWhere(models, (model) => !isBareModel(model)), opaque, counts);
	const veils = new Parts(leavesWhere(models, isBareModel), leafMaterial(atlas, sway, { isMultisampled, isVeilBlended: true }), counts);
	return new LayeredParts([evergreens, veils]);
}
