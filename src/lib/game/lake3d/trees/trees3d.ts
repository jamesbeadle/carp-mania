import { Group, Vector3, type BatchedMesh, type Camera } from 'three';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { WorldPoint } from '../lakeFrame';
import { renderQuality } from '../renderQuality';
import { barkMaterial } from './barkMaterial';
import { barkTexture } from './barkTexture';
import { CrownSway } from './crownSway';
import { DetailChooser, type Distant } from './detailChooser';
import { foliageAtlas } from './foliageAtlas';
import { leafMaterial, leafShadowMaterial } from './leafMaterial';
import { TreeBatch } from './treeBatch';
import { crownColourOf } from './treeColours';
import { TreeKinds } from './treeKinds';
import { treeModels, DetailLevels } from './treeModels';
import { placementOf } from './treePlacement';
import type { PlantedTree, Woodland } from './treePlanting';

const Looks = { Variants: 3, BarkPixels: 512, ReferenceHeight: 16, ShadeSpread: 13.7, VariantSpread: 3.7 } as const;
const FarDetail = DetailLevels - 1;
const ReachShares = [1, 2.6, 5];

interface Planting extends Distant {
	model: number;
	leaves: number;
	wood: number;
}

function modelIndexOf(tree: PlantedTree) {
	const variant = Math.floor(((tree.pick * Looks.VariantSpread) % 1) * Looks.Variants);
	return TreeKinds.indexOf(tree.kind) * Looks.Variants + variant;
}

export class Trees {
	readonly group = new Group();
	private readonly sway = new CrownSway();
	private readonly plantings: Planting[] = [];
	private readonly leaves: TreeBatch;
	private readonly wood: TreeBatch;

	constructor(woodland: Woodland, season: SeasonName, groundAt: (point: WorldPoint) => number) {
		const quality = renderQuality();
		const trees = [...woodland.onTheBank, ...woodland.onTheIslands];
		const models = treeModels(season, Looks.Variants, quality.treeCardShare);
		const atlas = foliageAtlas(quality.treeAtlasPixels);
		this.leaves = new TreeBatch(models.map((model) => model.leaves), leafMaterial(atlas, this.sway, quality.multisamples > 0), trees.length);
		this.wood = new TreeBatch(models.map((model) => model.wood), barkMaterial(barkTexture(Looks.BarkPixels), this.sway), trees.length);
		trees.forEach((tree) => this.plant(tree, season, groundAt));
		const reaches = ReachShares.map((share) => share * quality.nearTreeMetres);
		const chooser = new DetailChooser(this.plantings, reaches, (index, detail) => this.show(index, detail));
		const leafMesh = this.leaves.mesh;
		const woodMesh = this.wood.mesh;
		leafMesh.customDepthMaterial = leafShadowMaterial(atlas);
		[leafMesh, woodMesh].forEach((mesh) => this.prepare(mesh, chooser));
		woodMesh.receiveShadow = true;
		this.group.add(woodMesh, leafMesh);
	}

	blow(timeSeconds: number, windStrength: number) {
		this.sway.blow(timeSeconds, windStrength);
	}

	private plant(tree: PlantedTree, season: SeasonName, groundAt: (point: WorldPoint) => number) {
		const model = modelIndexOf(tree);
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

	private prepare(mesh: BatchedMesh, chooser: DetailChooser) {
		const cullAndSort = mesh.onBeforeRender.bind(mesh);
		mesh.onBeforeRender = (renderer, scene, camera: Camera, geometry, material, group) => {
			chooser.look(camera);
			cullAndSort(renderer, scene, camera, geometry, material, group);
		};
		mesh.castShadow = true;
	}
}
