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
	thinnestShare: number;
}

const Root = { Sink: 0.03, Flare: 1.25 } as const;
const Tip = { Share: 0.2 } as const;
const Collar = { Flare: 1.6, Reach: 2.2, MostShare: 0.35, LeastSides: 4, LeastRadius: 0.006 } as const;
const FinestThinnedLevel = 1;
const Texture = { AroundRepeats: 2, AlongPerCircumference: 1 } as const;
const FullTurn = Math.PI * 2;
const ReferenceSide = new Vector3(1, 0, 0.3).normalize();

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

function collared(limb: Limb, sides: number): Limb {
	if (limb.level === 0 || sides < Collar.LeastSides || limb.radii[0] < Collar.LeastRadius) return limb;
	const [base, next, ...rest] = limb.points;
	const [baseRadius, ...restRadii] = limb.radii;
	const reach = Math.min(baseRadius * Collar.Reach, base.distanceTo(next) * Collar.MostShare);
	const neck = base.clone().addScaledVector(next.clone().sub(base).normalize(), reach);
	return { ...limb, points: [base, neck, next, ...rest], radii: [baseRadius * Collar.Flare, baseRadius, ...restRadii] };
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
	const circumference = FullTurn * limb.radii[0];
	const first = writer.vertexCount;
	for (let side = 0; side <= sides; side++) {
		const angle = (side / sides) * FullTurn;
		const normal = frame.side.clone().multiplyScalar(Math.cos(angle)).addScaledVector(second, Math.sin(angle));
		const position = point.clone().addScaledVector(normal, limb.radii[index]);
		const paint = barkPaintAt(kind, limb.level, point.y, angle);
		writer.vertex(position, normal, (side / sides) * Texture.AroundRepeats, (frame.along / circumference) * Texture.AlongPerCircumference, paint.colour, paint.style);
	}
	return first;
}

function writeLimb(writer: GeometryWriter, kind: TreeKind, limb: Limb, sides: number) {
	const firstDirection = tangentAt(limb.points, 0);
	const frame = { side: new Vector3().crossVectors(firstDirection, ReferenceSide).normalize(), along: 0 };
	let previous = -1;
	limb.points.forEach((point, index) => {
		frame.along += index === 0 ? 0 : point.distanceTo(limb.points[index - 1]);
		const ring = writeRing(writer, kind, limb, index, frame, sides);
		for (let side = 0; previous >= 0 && side < sides; side++) writer.quad(previous + side, previous + side + 1, ring + side + 1, ring + side);
		previous = ring;
	});
}

function thinned(limb: Limb, pointStride: number): Limb {
	const { points, radii } = limb;
	const last = points.length - 1;
	const stride = limb.level > FinestThinnedLevel ? 1 : pointStride;
	const isKept = (index: number) => index % stride === 0 || index === last;
	const keptRadii = radii.filter((_, index) => isKept(index));
	const tip = keptRadii.length - 1;
	return { ...limb, points: points.filter((_, index) => isKept(index)), radii: keptRadii.map((radius, index) => (index === tip ? radius * Tip.Share : radius)) };
}

export function woodGeometry(kind: TreeKind, skeleton: Skeleton, detail: WoodDetail) {
	const writer = woodWriter();
	const [trunk] = skeleton.limbs;
	const thinnest = trunk.radii[0] * detail.thinnestShare;
	const limbs = skeleton.limbs.filter((limb) => limb.level <= detail.deepestLevel && limb.radii[0] >= thinnest);
	limbs.forEach((limb) => {
		const sides = detail.sides[limb.level];
		writeLimb(writer, kind, collared(rooted(thinned(limb, detail.pointStride)), sides), sides);
	});
	return writer.build();
}
