import { BufferAttribute, IcosahedronGeometry, PlaneGeometry, Quaternion, Vector3, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { seededRandom } from '$lib/domain/random';

const Blob = { Detail: 0, CardSize: 0.95, CardSizeSwing: 0.4, Placement: 0.5, PlacementSwing: 0.35, LowestCard: -0.35, Squash: 0.8, Lift: 0.55, Seed: 57 } as const;
const Lobes = [
	{ x: 0, y: 0.15, z: 0, size: 0.75 },
	{ x: 0.45, y: -0.05, z: 0.2, size: 0.6 },
	{ x: -0.4, y: 0, z: -0.25, size: 0.62 },
	{ x: 0.05, y: 0.2, z: -0.45, size: 0.5 }
];
const Shade = { Lowest: 0.5, Range: 0.5 } as const;
const Facing = new Vector3(0, 0, 1);
const Up = new Vector3(0, 1, 0);

function faceCentres() {
	const positions = new IcosahedronGeometry(1, Blob.Detail).getAttribute('position');
	const corners = [0, 1, 2];
	return Array.from({ length: positions.count / corners.length }, (_, face) => {
		const centre = new Vector3();
		corners.forEach((corner) => centre.add(new Vector3().fromBufferAttribute(positions, face * corners.length + corner)));
		return centre.divideScalar(corners.length);
	}).filter((centre) => centre.y > Blob.LowestCard);
}

function cardAt(centre: Vector3, lobe: (typeof Lobes)[number], random: () => number) {
	const outward = centre.clone().normalize();
	const roll = new Quaternion().setFromAxisAngle(Facing, random() * Math.PI * 2);
	const facing = new Quaternion().setFromUnitVectors(Facing, outward);
	const placed = outward.clone().multiplyScalar((Blob.Placement + random() * Blob.PlacementSwing) * lobe.size).add(new Vector3(lobe.x, lobe.y, lobe.z));
	const size = (Blob.CardSize + (random() - 0.5) * Blob.CardSizeSwing) * (lobe.size + 1) / 2;
	return new PlaneGeometry(size, size).applyQuaternion(roll).applyQuaternion(facing).translate(placed.x, placed.y, placed.z);
}

function roundedAndShaded(geometry: BufferGeometry) {
	const positions = geometry.getAttribute('position');
	const normals = geometry.getAttribute('normal');
	const colours = new Float32Array(positions.count * 3);
	const direction = new Vector3();
	for (let index = 0; index < positions.count; index++) {
		direction.fromBufferAttribute(positions, index).normalize().lerp(Up, 1 / 4).normalize();
		normals.setXYZ(index, direction.x, direction.y, direction.z);
		const shade = Shade.Lowest + Shade.Range * Math.min(1, Math.max(0, (positions.getY(index) + 1) / 2));
		colours.set([shade, shade, shade], index * 3);
	}
	geometry.setAttribute('color', new BufferAttribute(colours, 3));
	return geometry;
}

export function bushBlob() {
	const random = seededRandom(Blob.Seed);
	const cards = Lobes.flatMap((lobe) => faceCentres().map((centre) => cardAt(centre, lobe, random)));
	return roundedAndShaded(mergeGeometries(cards)).scale(1, Blob.Squash, 1).translate(0, Blob.Lift, 0);
}
