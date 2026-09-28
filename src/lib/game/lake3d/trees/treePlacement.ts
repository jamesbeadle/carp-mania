import { Matrix4, Quaternion, Vector3 } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { UpAxis } from './limbPaths';
import type { PlantedTree } from './treePlanting';

export function placementOf(tree: PlantedTree, groundAt: (point: WorldPoint) => number) {
	const { point, height, girth, leanHeading } = tree;
	const position = new Vector3(point.x, groundAt(point), point.z);
	const turn = new Quaternion().setFromAxisAngle(UpAxis, tree.turn);
	const leanAxis = new Vector3(Math.cos(leanHeading), 0, -Math.sin(leanHeading));
	const lean = new Quaternion().setFromAxisAngle(leanAxis, tree.lean);
	return new Matrix4().compose(position, lean.multiply(turn), new Vector3(height * girth, height, height * girth));
}
