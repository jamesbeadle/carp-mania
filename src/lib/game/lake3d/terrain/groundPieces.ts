import { Box3, BufferGeometry, Sphere, Vector3 } from 'three';

export interface GroundPiece {
	geometry: BufferGeometry;
	isUnderwater: boolean;
}

export type PieceKey = (x: number, z: number, isUnderwater: boolean) => number;

const HighestUnderwaterMetres = -0.02;
const KindsPerKey = 2;

function pieceGeometry(source: BufferGeometry, triangles: number[]) {
	const positions = source.getAttribute('position');
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', positions);
	geometry.setAttribute('normal', source.getAttribute('normal'));
	geometry.setIndex(triangles);
	const box = new Box3();
	const corner = new Vector3();
	triangles.forEach((vertex) => box.expandByPoint(corner.fromBufferAttribute(positions, vertex)));
	geometry.boundingSphere = box.getBoundingSphere(new Sphere());
	return geometry;
}

export function splitIntoPieces(source: BufferGeometry, index: ArrayLike<number>, keyOf: PieceKey): GroundPiece[] {
	const positions = source.getAttribute('position');
	const buckets = new Map<number, number[]>();
	for (let corner = 0; corner < index.length; corner += 3) {
		const [first, second, third] = [index[corner], index[corner + 1], index[corner + 2]];
		const isUnderwater = Math.max(positions.getY(first), positions.getY(second), positions.getY(third)) < HighestUnderwaterMetres;
		const x = (positions.getX(first) + positions.getX(second) + positions.getX(third)) / 3;
		const z = (positions.getZ(first) + positions.getZ(second) + positions.getZ(third)) / 3;
		const key = keyOf(x, z, isUnderwater) * KindsPerKey + (isUnderwater ? 1 : 0);
		const bucket = buckets.get(key) ?? [];
		bucket.push(first, second, third);
		buckets.set(key, bucket);
	}
	return [...buckets].map(([key, triangles]) => ({ geometry: pieceGeometry(source, triangles), isUnderwater: key % KindsPerKey === 1 }));
}
