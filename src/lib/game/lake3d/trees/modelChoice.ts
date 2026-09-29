import { TreeKinds } from './treeKinds';
import type { PlantedTree } from './treePlanting';

const VariantSpread = 3.7;

export function modelIndexOf(tree: PlantedTree, variants: number) {
	const variant = Math.floor(((tree.pick * VariantSpread) % 1) * variants);
	return TreeKinds.indexOf(tree.kind) * variants + variant;
}

export function plantingsByModel(trees: PlantedTree[], variants: number) {
	const counts = new Array<number>(TreeKinds.length * variants).fill(0);
	trees.forEach((tree) => counts[modelIndexOf(tree, variants)]++);
	return counts;
}
