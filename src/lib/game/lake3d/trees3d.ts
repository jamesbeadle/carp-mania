import { Color, Group, InstancedMesh, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { BarkColour, foliageFor } from './treeColours';
import { Heights } from './lakeGround';
import type { PlantedTree, TreeKind, Woodland } from './treePlanting';
import { TreeShapes } from './treeShapes';

const TreeKinds: TreeKind[] = ['poplar', 'broadleaf', 'willow'];
const UpAxis = new Vector3(0, 1, 0);
const ShadeVariation = 0.08;

function placementOf(tree: PlantedTree, groundHeight: number) {
	const { point } = tree;
	const position = new Vector3(point.x, groundHeight, point.z);
	const turn = new Quaternion().setFromAxisAngle(UpAxis, tree.turn);
	return new Matrix4().compose(position, turn, new Vector3(tree.height, tree.height, tree.height));
}

function instancedFor(trees: PlantedTree[], kind: TreeKind, season: SeasonName, groundHeight: number) {
	const shape = TreeShapes[kind]();
	const foliage = foliageFor(season, kind);
	const crowns = new InstancedMesh(shape.crown, new MeshStandardMaterial({ flatShading: true, roughness: 0.9 }), trees.length);
	const trunks = new InstancedMesh(shape.trunk, new MeshStandardMaterial({ color: BarkColour, roughness: 1 }), trees.length);
	trees.forEach((tree, index) => {
		const placement = placementOf(tree, groundHeight);
		crowns.setMatrixAt(index, placement);
		trunks.setMatrixAt(index, placement);
		const shade = new Color(foliage[index % foliage.length]).offsetHSL(0, 0, (Math.sin(index * 12.9898) * ShadeVariation) / 2);
		crowns.setColorAt(index, shade);
	});
	crowns.castShadow = true;
	return [crowns, trunks];
}

export function createTrees(woodland: Woodland, season: SeasonName) {
	const group = new Group();
	TreeKinds.forEach((kind) => {
		const ofKind = woodland.onTheBank.filter((tree) => tree.kind === kind);
		const onIslands = woodland.onTheIslands.filter((tree) => tree.kind === kind);
		if (ofKind.length > 0) group.add(...instancedFor(ofKind, kind, season, Heights.Bank));
		if (onIslands.length > 0) group.add(...instancedFor(onIslands, kind, season, Heights.Island));
	});
	return group;
}
