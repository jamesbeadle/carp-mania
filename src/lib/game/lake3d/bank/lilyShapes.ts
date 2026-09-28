import { BufferAttribute, CircleGeometry, Color, ConeGeometry, PlaneGeometry, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const Pad = { Segments: 22, Notch: 0.42, RimLift: 0.05 } as const;
const Petals = { Outer: 9, Inner: 7, Length: 0.55, Width: 0.22, OuterTilt: 0.5, InnerTilt: 1.05, InnerScale: 0.75 } as const;
const Centre = { Radius: 0.14, Height: 0.16, Colour: '#e8b82a' } as const;
const PetalRoot = new Color('#ffffff');

function withColour(geometry: BufferGeometry, colour: Color) {
	const count = geometry.getAttribute('position').count;
	const colours = new Float32Array(count * 3);
	for (let index = 0; index < count; index++) colour.toArray(colours, index * 3);
	geometry.setAttribute('color', new BufferAttribute(colours, 3));
	return geometry;
}

export function lilyPadGeometry() {
	const pad = new CircleGeometry(1, Pad.Segments, Pad.Notch / 2, Math.PI * 2 - Pad.Notch).rotateX(-Math.PI / 2);
	const positions = pad.getAttribute('position');
	for (let index = 0; index < positions.count; index++) {
		const reach = Math.hypot(positions.getX(index), positions.getZ(index));
		positions.setY(index, reach * reach * Pad.RimLift);
	}
	pad.computeVertexNormals();
	return pad;
}

function petalRing(count: number, tilt: number, scale: number, twist: number) {
	return Array.from({ length: count }, (_, index) => {
		const petal = new PlaneGeometry(Petals.Width * scale, Petals.Length * scale).translate(0, (Petals.Length * scale) / 2, 0);
		return petal.rotateX(-Math.PI / 2 + tilt).rotateY((index / count) * Math.PI * 2 + twist);
	});
}

export function lilyFlowerGeometry() {
	const outer = petalRing(Petals.Outer, Petals.OuterTilt, 1, 0);
	const inner = petalRing(Petals.Inner, Petals.InnerTilt, Petals.InnerScale, Math.PI / Petals.Inner);
	const petals = mergeGeometries([...outer, ...inner].map((petal) => petal.toNonIndexed()));
	const centre = new ConeGeometry(Centre.Radius, Centre.Height, 8).translate(0, Centre.Height / 2, 0).toNonIndexed();
	return mergeGeometries([withColour(petals, PetalRoot), withColour(centre, new Color(Centre.Colour))]);
}
