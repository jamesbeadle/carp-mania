import { BufferGeometry, CylinderGeometry, Float32BufferAttribute, PlaneGeometry, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { seededRandom } from '$lib/domain/random';
import type { TreeKind } from './treePlanting';

export interface TreeShape {
	crown: BufferGeometry;
	trunk: BufferGeometry;
}

interface Canopy {
	centre: number;
	radius: number;
	stretch: number;
	cards: number;
	cardSize: number;
	droop: number;
	trunkHeight: number;
	trunkRadius: number;
}

const Canopies: Record<TreeKind, Canopy> = {
	poplar: { centre: 0.58, radius: 0.13, stretch: 3.1, cards: 60, cardSize: 0.17, droop: 0, trunkHeight: 0.35, trunkRadius: 0.022 },
	broadleaf: { centre: 0.62, radius: 0.34, stretch: 0.85, cards: 78, cardSize: 0.24, droop: 0, trunkHeight: 0.5, trunkRadius: 0.035 },
	willow: { centre: 0.55, radius: 0.42, stretch: 0.7, cards: 75, cardSize: 0.26, droop: 0.35, trunkHeight: 0.42, trunkRadius: 0.05 }
};
const TrunkSides = 7;
const ShapeSeed = 17;

function card(canopy: Canopy, random: () => number) {
	const direction = new Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize();
	const reach = Math.cbrt(random()) * canopy.radius;
	const at = direction.clone().multiplyScalar(reach);
	at.y = at.y * canopy.stretch - canopy.droop * canopy.radius * (at.x * at.x + at.z * at.z) * 4;
	const geometry = new PlaneGeometry(canopy.cardSize, canopy.cardSize);
	geometry.rotateX(random() * Math.PI).rotateY(random() * Math.PI * 2).rotateZ(random() * Math.PI);
	geometry.translate(at.x, at.y + canopy.centre, at.z);
	const normals = new Float32Array(geometry.getAttribute('position').count * 3);
	for (let index = 0; index < normals.length; index += 3) direction.toArray(normals, index);
	geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
	return geometry;
}

function trunkOf(canopy: Canopy) {
	const trunk = new CylinderGeometry(canopy.trunkRadius * 0.55, canopy.trunkRadius, canopy.trunkHeight + canopy.centre * 0.3, TrunkSides);
	return trunk.translate(0, (canopy.trunkHeight + canopy.centre * 0.3) / 2, 0);
}

function shapeOf(kind: TreeKind): TreeShape {
	const canopy = Canopies[kind];
	const random = seededRandom(ShapeSeed + kind.length);
	const crown = mergeGeometries(Array.from({ length: canopy.cards }, () => card(canopy, random)));
	return { crown, trunk: trunkOf(canopy) };
}

export const TreeShapes: Record<TreeKind, () => TreeShape> = { poplar: () => shapeOf('poplar'), broadleaf: () => shapeOf('broadleaf'), willow: () => shapeOf('willow') };
