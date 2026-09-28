import { BufferGeometry, Float32BufferAttribute, MathUtils } from 'three';

export interface SquareRing {
	innerHalf: number;
	outerRadius: number;
	stepsPerSide: number;
	rings: number;
}

const Sides = 4;
const RingSpacing = 2.2;

function squarePoint(half: number, share: number) {
	const corners = [[half, -half], [half, half], [-half, half], [-half, -half]];
	const side = Math.min(Sides - 1, Math.floor(share * Sides));
	const along = share * Sides - side;
	const [fromX, fromZ] = corners[side];
	const [toX, toZ] = corners[(side + 1) % Sides];
	return { x: MathUtils.lerp(fromX, toX, along), z: MathUtils.lerp(fromZ, toZ, along) };
}

function ringPositions(ring: SquareRing, around: number) {
	const positions: number[] = [];
	for (let step = 0; step <= ring.rings; step++) {
		const outward = (step / ring.rings) ** RingSpacing;
		for (let index = 0; index <= around; index++) {
			const inner = squarePoint(ring.innerHalf, (index % around) / around);
			const angle = Math.atan2(inner.z, inner.x);
			positions.push(MathUtils.lerp(inner.x, Math.cos(angle) * ring.outerRadius, outward), 0, MathUtils.lerp(inner.z, Math.sin(angle) * ring.outerRadius, outward));
		}
	}
	return positions;
}

function ringIndices(rings: number, around: number) {
	const indices: number[] = [];
	const row = around + 1;
	for (let step = 0; step < rings; step++) {
		for (let index = 0; index < around; index++) {
			const corner = step * row + index;
			indices.push(corner, corner + 1, corner + row, corner + 1, corner + row + 1, corner + row);
		}
	}
	return indices;
}

export function squareRingGeometry(ring: SquareRing) {
	const around = ring.stepsPerSide * Sides;
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new Float32BufferAttribute(ringPositions(ring, around), 3));
	geometry.setIndex(ringIndices(ring.rings, around));
	return geometry;
}
