import { Color, DoubleSide, Group, InstancedMesh, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { WorldPoint } from '../lakeFrame';
import { barkTexture } from './barkTexture';
import { leafClusterTexture } from './leafTexture';
import { BarkColour, foliageFor } from './treeColours';
import type { PlantedTree, TreeKind } from './plantedTree';
import type { Woodland } from './treePlanting';
import { treeShapeOf } from './treeShapes';
import { WindSway } from './windSway';

const TreeKinds: TreeKind[] = ['poplar', 'broadleaf', 'willow', 'bush'];
const UpAxis = new Vector3(0, 1, 0);
const ShadeVariation = 0.08;
const LeafCutOff = 0.45;

function placementOf(tree: PlantedTree, groundAt: (point: WorldPoint) => number) {
	const { point } = tree;
	const position = new Vector3(point.x, groundAt(point), point.z);
	const turn = new Quaternion().setFromAxisAngle(UpAxis, tree.turn);
	return new Matrix4().compose(position, turn, new Vector3(tree.height, tree.height, tree.height));
}

export class Trees {
	readonly group = new Group();
	private readonly wind = new WindSway();
	private readonly leaves = leafClusterTexture();
	private readonly bark = this.wind.sway(new MeshStandardMaterial({ color: BarkColour, map: barkTexture(), roughness: 1 }));

	constructor(woodland: Woodland, season: SeasonName, groundAt: (point: WorldPoint) => number) {
		const trees = [...woodland.onTheBank, ...woodland.onTheIslands, ...woodland.inTheCountry];
		TreeKinds.forEach((kind) => {
			const ofKind = trees.filter((tree) => tree.kind === kind);
			if (ofKind.length === 0) return;
			this.group.add(...this.instancedFor(ofKind, kind, season, groundAt));
		});
	}

	blow(timeSeconds: number, windStrength: number) {
		this.wind.blow(timeSeconds, windStrength);
	}

	private instancedFor(trees: PlantedTree[], kind: TreeKind, season: SeasonName, groundAt: (point: WorldPoint) => number) {
		const shape = treeShapeOf(kind);
		const foliage = foliageFor(season, kind);
		const leafMaterial = this.wind.sway(new MeshStandardMaterial({ map: this.leaves, alphaTest: LeafCutOff, side: DoubleSide, roughness: 0.85, vertexColors: true }));
		const crowns = new InstancedMesh(shape.crown, leafMaterial, trees.length);
		const trunks = new InstancedMesh(shape.trunk, this.bark, trees.length);
		trees.forEach((tree, index) => {
			const placement = placementOf(tree, groundAt);
			crowns.setMatrixAt(index, placement);
			trunks.setMatrixAt(index, placement);
			crowns.setColorAt(index, new Color(foliage[index % foliage.length]).offsetHSL(0, 0, (Math.sin(index * 12.9898) * ShadeVariation) / 2));
		});
		crowns.castShadow = true;
		trunks.castShadow = true;
		return [crowns, trunks];
	}
}
