import { Box3, IcosahedronGeometry, PlaneGeometry, Quaternion, Vector3, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { seededRandom } from '$lib/domain/random';
import { coverQuality } from '../renderQuality';
import { lobesOf, type BushLobe } from './bushLobes';
import { roundedAndShaded } from './bushShading';

const Blob = { Detail: 0, LowestCard: -0.3, Seed: 57 } as const;
const Card = { Size: 0.95, SizeSwing: 0.45, Placement: 0.45, PlacementSwing: 0.4 } as const;
const Sprig = { Every: 2, Size: 0.62, Placement: 0.85, PlacementSwing: 0.3 } as const;
const Lobes = { Detailed: 6, Light: 3 } as const;
const Facing = new Vector3(0, 0, 1);

function faceCentres() {
	const positions = new IcosahedronGeometry(1, Blob.Detail).getAttribute('position');
	const corners = [0, 1, 2];
	return Array.from({ length: positions.count / corners.length }, (_, face) => {
		const centre = new Vector3();
		corners.forEach((corner) => centre.add(new Vector3().fromBufferAttribute(positions, face * corners.length + corner)));
		return centre.divideScalar(corners.length).normalize();
	}).filter((centre) => centre.y > Blob.LowestCard);
}

function cardFacing(normal: Vector3, size: number, placed: Vector3, random: () => number) {
	const roll = new Quaternion().setFromAxisAngle(Facing, random() * Math.PI * 2);
	const facing = new Quaternion().setFromUnitVectors(Facing, normal);
	return new PlaneGeometry(size, size).applyQuaternion(roll).applyQuaternion(facing).translate(placed.x, placed.y, placed.z);
}

function leafCard(outward: Vector3, lobe: BushLobe, random: () => number) {
	const placed = outward.clone().multiplyScalar((Card.Placement + random() * Card.PlacementSwing) * lobe.size).add(lobe.centre);
	const size = (Card.Size + (random() - 1 / 2) * Card.SizeSwing) * lobe.size;
	return cardFacing(outward, size, placed, random);
}

function sprigCard(outward: Vector3, lobe: BushLobe, random: () => number) {
	const across = new Vector3(random() - 1 / 2, random() - 1 / 2, random() - 1 / 2).cross(outward).normalize();
	const placed = outward.clone().multiplyScalar((Sprig.Placement + random() * Sprig.PlacementSwing) * lobe.size).add(lobe.centre);
	return cardFacing(across, Sprig.Size * lobe.size, placed, random);
}

function lobeCards(lobe: BushLobe, random: () => number) {
	return faceCentres().flatMap((outward, index) => {
		const leaf = leafCard(outward, lobe, random);
		return index % Sprig.Every === 0 ? [leaf, sprigCard(outward, lobe, random)] : [leaf];
	});
}

function fittedToUnitBox(geometry: BufferGeometry) {
	geometry.computeBoundingBox();
	const bounds = geometry.boundingBox ?? new Box3();
	const size = bounds.getSize(new Vector3());
	const centre = bounds.getCenter(new Vector3());
	const { min } = bounds;
	return geometry.translate(-centre.x, -min.y, -centre.z).scale(1 / size.x, 1 / size.y, 1 / size.z);
}

export function bushBlob() {
	const random = seededRandom(Blob.Seed);
	const cover = coverQuality();
	const lobes = lobesOf(cover.isDetailed ? Lobes.Detailed : Lobes.Light, random);
	const cards = lobes.flatMap((lobe) => lobeCards(lobe, random));
	return roundedAndShaded(fittedToUnitBox(mergeGeometries(cards)));
}
