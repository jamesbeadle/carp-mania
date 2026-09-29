import { Group, Vector3, type Camera, type Mesh } from 'three';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { WorldPoint } from '../lakeFrame';
import { renderQuality } from '../renderQuality';
import { barkMaterial } from './barkMaterial';
import { barkTexture } from './barkTexture';
import { CrownSway } from './crownSway';
import { DetailChooser, type Distant } from './detailChooser';
import { foliageAtlas } from './foliageAtlas';
import { leafLayers } from './leafLayers';
import { leafShadowMaterial } from './leafMaterial';
import { modelIndexOf, plantingsByModel } from './modelChoice';
import { hasMultiDraw } from './multiDraw';
import { TreeBatch } from './treeBatch';
import { TreeInstances } from './treeInstances';
import type { TreeParts } from './treeParts';
import { crownColourOf } from './treeColours';
import { treeModels, DetailLevels } from './treeModels';
import { placementOf } from './treePlacement';
import type { PlantedTree, Woodland } from './treePlanting';

const Looks = { Variants: 4, BarkPixels: 512, ReferenceHeight: 16, ShadeSpread: 13.7 } as const;
const FarDetail = DetailLevels - 1;
const ReachShares = [1, 2.3, 4.3];

interface Planting extends Distant {
	model: number;
	leaves: number;
	wood: number;
}

export class Trees {
	readonly group = new Group();
	private readonly sway = new CrownSway();
	private readonly plantings: Planting[] = [];
	private readonly leaves: TreeParts;
	private readonly wood: TreeParts;
	private readonly variants: number;

	constructor(woodland: Woodland, season: SeasonName, groundAt: (point: WorldPoint) => number) {
		const quality = renderQuality();
		const trees = [...woodland.onTheBank, ...woodland.onTheIslands];
		const isMultisampled = quality.multisamples > 0;
		const isBatched = hasMultiDraw();
		this.variants = isBatched ? Looks.Variants : quality.treeVariantsSingleDraw;
		const models = treeModels({ season, cardShare: quality.treeCardShare }, this.variants);
		const atlas = foliageAtlas(quality.treeAtlasPixels);
		const Parts = isBatched ? TreeBatch : TreeInstances;
		const counts = plantingsByModel(trees, this.variants);
		this.leaves = leafLayers({ models, season, isMultisampled, counts }, Parts, atlas, this.sway);
		this.wood = new Parts(models.map((model) => model.wood), barkMaterial(barkTexture(Looks.BarkPixels), this.sway), counts);
		trees.forEach((tree) => this.plant(tree, season, groundAt));
		const reaches = ReachShares.map((share) => share * quality.nearTreeMetres);
		const chooser = new DetailChooser(this.plantings, reaches, (index, detail) => this.show(index, detail));
		const shadowMaterial = leafShadowMaterial(atlas);
		this.leaves.meshes.forEach((mesh) => Object.assign(mesh, { customDepthMaterial: shadowMaterial }));
		this.wood.meshes.forEach((mesh) => Object.assign(mesh, { receiveShadow: true }));
		const meshes = [...this.wood.meshes, ...this.leaves.meshes];
		meshes.forEach((mesh) => this.prepare(mesh, chooser));
		[...this.wood.distantMeshes, ...this.leaves.distantMeshes].forEach((mesh) => Object.assign(mesh, { castShadow: false }));
		this.group.add(...meshes);
	}

	blow(timeSeconds: number, windStrength: number) {
		this.sway.blow(timeSeconds, windStrength);
	}

	private plant(tree: PlantedTree, season: SeasonName, groundAt: (point: WorldPoint) => number) {
		const model = modelIndexOf(tree, this.variants);
		const placement = placementOf(tree, groundAt);
		const colour = crownColourOf(season, tree.kind, tree.pick, (tree.pick * Looks.ShadeSpread) % 1);
		const leaves = this.leaves.plant(model, FarDetail, placement, colour);
		const wood = this.wood.plant(model, FarDetail, placement, null);
		this.plantings.push({ position: new Vector3().setFromMatrixPosition(placement), scale: tree.height / Looks.ReferenceHeight, detail: FarDetail, model, leaves, wood });
	}

	private show(index: number, detail: number) {
		const planting = this.plantings[index];
		this.leaves.show(planting.leaves, planting.model, detail);
		this.wood.show(planting.wood, planting.model, detail);
	}

	private prepare(mesh: Mesh, chooser: DetailChooser) {
		const cullAndSort = mesh.onBeforeRender.bind(mesh);
		mesh.onBeforeRender = (renderer, scene, camera: Camera, geometry, material, group) => {
			chooser.look(camera);
			cullAndSort(renderer, scene, camera, geometry, material, group);
		};
		mesh.castShadow = true;
	}
}
