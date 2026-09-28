import { Vector3 } from 'three';
import { GeometryWriter } from './geometryWriter';
import { barkPaintAt } from './barkLooks';
import { UpAxis, type Limb } from './limbPaths';
import type { TreeKind } from './treeKinds';
import type { Skeleton } from './treeSkeleton';

export interface WoodDetail {
	sides: number[];
	deepestLevel: number;
	pointStride: number;
}

const Root = { Sink: 0.03, Flare: 1.35 } as const;
const Texture = { AroundRepeats: 2, AlongPerCircumference: 1 } as const;
const FullTurn = Math.PI * 2;

export function woodWriter() {
	return new GeometryWriter([{ name: 'barkStyle', size: 3 }]);
}

function rooted(limb: Limb): Limb {
	if (limb.level > 0) return limb;
	const [base, ...rest] = limb.points;
	const [baseRadius, ...restRadii] = limb.radii;
	const sunk = base.clone().addScaledVector(UpAxis, -Root.Sink);
	return { ...limb, points: [sunk, base, ...rest], radii: [baseRadius * Root.Flare, baseRadius * Root.Flare, ...restRadii] };
}

function tangentAt(points: Vector3[], index: number) {
	const before = points[Math.max(0, index - 1)];
	const after = points[Math.min(points.length - 1, index + 1)];
	return after.clone().sub(before).normalize();
}

function writeRing(writer: GeometryWriter, kind: TreeKind, limb: Limb, index: number, frame: { side: Vector3; along: number }, sides: number) {
	const point = limb.points[index];
	const direction = tangentAt(limb.points, index);
	frame.side.addScaledVector(direction, -frame.side.dot(direction)).normalize();
	const second = new Vector3().crossVectors(direction, frame.side);
	const paint = barkPaintAt(kind, limb.level, point.y);
	const circumference = FullTurn * limb.radii[0];
	const first = writer.vertexCount;
	for (let side = 0; side <= sides; side++) {
		const angle = (side / sides) * FullTurn;
		const normal = frame.side.clone().multiplyScalar(Math.cos(angle)).addScaledVector(second, Math.sin(angle));
		const position = point.clone().addScaledVector(normal, limb.radii[index]);
		writer.vertex(position, normal, (side / sides) * Texture.AroundRepeats, (frame.along / circumference) * Texture.AlongPerCircumference, paint.colour, paint.style);
	}
	return first;
}

function writeLimb(writer: GeometryWriter, kind: TreeKind, limb: Limb, sides: number) {
	const firstDirection = tangentAt(limb.points, 0);
	const frame = { side: new Vector3().crossVectors(firstDirection, new Vector3(1, 0, 0.3)).normalize(), along: 0 };
	let previous = -1;
	limb.points.forEach((point, index) => {
		frame.along += index === 0 ? 0 : point.distanceTo(limb.points[index - 1]);
		const ring = writeRing(writer, kind, limb, index, frame, sides);
		for (let side = 0; previous >= 0 && side < sides; side++) writer.quad(previous + side, previous + side + 1, ring + side + 1, ring + side);
		previous = ring;
	});
}

function thinned(limb: Limb, stride: number): Limb {
	const { points, radii } = limb;
	const last = points.length - 1;
	const isKept = (index: number) => index % stride === 0 || index === last;
	return { ...limb, points: points.filter((_, index) => isKept(index)), radii: radii.filter((_, index) => isKept(index)) };
}

export function woodGeometry(kind: TreeKind, skeleton: Skeleton, detail: WoodDetail) {
	const writer = woodWriter();
	const limbs = skeleton.limbs.filter((limb) => limb.level <= detail.deepestLevel);
	limbs.forEach((limb) => writeLimb(writer, kind, rooted(thinned(limb, detail.pointStride)), detail.sides[limb.level]));
	return writer.build();
}
