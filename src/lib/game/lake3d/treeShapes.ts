import { BufferGeometry, CylinderGeometry, IcosahedronGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { TreeKind } from './treePlanting';

export interface TreeShape {
	crown: BufferGeometry;
	trunk: BufferGeometry;
}

const CrownDetail = 1;
const TrunkSides = 5;

function blob(radius: number, stretch: [number, number, number], lift: number, shift: [number, number] = [0, 0]) {
	const geometry = new IcosahedronGeometry(radius, CrownDetail);
	geometry.scale(...stretch);
	geometry.translate(shift[0], lift, shift[1]);
	return geometry;
}

function trunkOf(height: number, radius: number) {
	const geometry = new CylinderGeometry(radius * 0.7, radius, height, TrunkSides);
	geometry.translate(0, height / 2, 0);
	return geometry;
}

function poplar(): TreeShape {
	const crown = mergeGeometries([blob(0.5, [0.26, 1, 0.26], 0.55), blob(0.35, [0.3, 1, 0.3], 0.82)]);
	return { crown, trunk: trunkOf(0.3, 0.025) };
}

function broadleaf(): TreeShape {
	const crown = mergeGeometries([blob(0.36, [1, 0.8, 1], 0.62), blob(0.26, [1, 0.85, 1], 0.72, [0.2, 0.1]), blob(0.24, [1, 0.85, 1], 0.7, [-0.18, -0.12]), blob(0.22, [1, 0.9, 1], 0.86, [0.02, 0.05])]);
	return { crown, trunk: trunkOf(0.45, 0.04) };
}

function willow(): TreeShape {
	const crown = mergeGeometries([blob(0.55, [1, 0.62, 1], 0.55), blob(0.4, [1, 0.7, 1], 0.72, [0.15, 0.1])]);
	return { crown, trunk: trunkOf(0.4, 0.06) };
}

export const TreeShapes: Record<TreeKind, () => TreeShape> = { poplar, broadleaf, willow };
