import { Mesh, type Material } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { scaledBox } from './scaledBox';

export interface BoxSpec {
	size: [number, number, number];
	at: [number, number, number];
	turn?: number;
	tilt?: number;
}

function placedBox(box: BoxSpec) {
	const [width, height, depth] = box.size;
	const [x, y, z] = box.at;
	return scaledBox(width, height, depth).rotateX(box.tilt ?? 0).rotateY(box.turn ?? 0).translate(x, y, z);
}

export function mergedBoxes(boxes: BoxSpec[], material: Material) {
	const mesh = new Mesh(mergeGeometries(boxes.map(placedBox)), material);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
}
