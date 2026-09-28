import { BufferGeometry, LatheGeometry, Shape, ShapeGeometry, Vector2 } from 'three';

export const Body = { TailRoot: -0.38, Nose: 0.5, DeepestShare: 0.55, Depth: 0.155, Thinnest: 0.034, Slimness: 0.52, Profiles: 44, Around: 36 } as const;
const Rounding = { Tail: 0.7, Nose: 0.55 } as const;

function radiusAt(share: number) {
	const towardsDeepest = share < Body.DeepestShare ? share / Body.DeepestShare : (1 - share) / (1 - Body.DeepestShare);
	const rounding = share < Body.DeepestShare ? Rounding.Tail : Rounding.Nose;
	return Math.max(share >= 1 ? 0 : Body.Thinnest, Body.Depth * Math.sin((Math.PI / 2) * towardsDeepest) ** rounding);
}

const Hump = { Back: 1.2, Belly: 0.9 } as const;

function humpTheBack(geometry: BufferGeometry) {
	const positions = geometry.getAttribute('position');
	for (let index = 0; index < positions.count; index++) {
		const height = positions.getY(index);
		positions.setY(index, height * (height > 0 ? Hump.Back : Hump.Belly));
	}
}

export function carpBodyGeometry(): BufferGeometry {
	const length = Body.Nose - Body.TailRoot;
	const profile = Array.from({ length: Body.Profiles + 1 }, (_, index) => {
		const share = index / Body.Profiles;
		return new Vector2(radiusAt(share), Body.TailRoot + share * length);
	});
	const geometry = new LatheGeometry(profile, Body.Around);
	geometry.rotateX(Math.PI / 2);
	geometry.scale(Body.Slimness, 1, 1);
	humpTheBack(geometry);
	geometry.computeVertexNormals();
	return geometry;
}

const FinCurveSegments = 10;

export function finGeometry(outline: [number, number][]) {
	const [first, ...rest] = outline.map(([along, up]) => new Vector2(along, up));
	const shape = new Shape();
	shape.moveTo(first.x, first.y);
	shape.splineThru(rest);
	shape.lineTo(first.x, first.y);
	const geometry = new ShapeGeometry(shape, FinCurveSegments);
	geometry.rotateY(-Math.PI / 2);
	return geometry;
}

export const FinOutlines = {
	tail: [[-0.35, 0.03], [-0.47, 0.15], [-0.53, 0.16], [-0.5, 0.06], [-0.47, 0.0], [-0.5, -0.06], [-0.53, -0.16], [-0.47, -0.15], [-0.35, -0.03]] as [number, number][],
	dorsal: [[0.14, 0.16], [0.09, 0.25], [0.04, 0.23], [-0.18, 0.12], [-0.22, 0.09]] as [number, number][],
	anal: [[-0.16, -0.09], [-0.21, -0.15], [-0.25, -0.13], [-0.26, -0.06]] as [number, number][],
	pectoral: [[0.27, -0.08], [0.18, -0.15], [0.15, -0.12], [0.23, -0.07]] as [number, number][],
	pelvic: [[0.04, -0.12], [-0.04, -0.18], [-0.07, -0.15], [-0.01, -0.11]] as [number, number][]
};
