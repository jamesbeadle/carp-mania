import { BufferAttribute, BufferGeometry, PlaneGeometry, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface CardShape {
	planes: number;
	segments: number;
	upwardNormals: number;
	rootShade: number;
}

const Up = new Vector3(0, 1, 0);
const RootShadeCurve = 0.6;

function litLikeTheGround(geometry: BufferGeometry, shape: CardShape) {
	const normals = geometry.getAttribute('normal');
	const positions = geometry.getAttribute('position');
	const colours = new Float32Array(positions.count * 3);
	const normal = new Vector3();
	for (let index = 0; index < positions.count; index++) {
		normal.fromBufferAttribute(normals, index).lerp(Up, shape.upwardNormals).normalize();
		normals.setXYZ(index, normal.x, normal.y, normal.z);
		const shade = shape.rootShade + (1 - shape.rootShade) * Math.pow(Math.max(0, positions.getY(index)), RootShadeCurve);
		colours.set([shade, shade, shade], index * 3);
	}
	geometry.setAttribute('color', new BufferAttribute(colours, 3));
	return geometry;
}

export function crossedCards(shape: CardShape) {
	const cards = Array.from({ length: shape.planes }, (_, index) => {
		const card = new PlaneGeometry(1, 1, 1, shape.segments).translate(0, 1 / 2, 0);
		return card.rotateY((index / shape.planes) * Math.PI);
	});
	return litLikeTheGround(mergeGeometries(cards), shape);
}

export function sharingShape(base: BufferGeometry) {
	const geometry = new BufferGeometry();
	['position', 'normal', 'uv', 'color'].forEach((name) => geometry.setAttribute(name, base.getAttribute(name)));
	geometry.setIndex(base.getIndex());
	return geometry;
}
