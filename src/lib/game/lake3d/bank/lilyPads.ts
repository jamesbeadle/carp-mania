import { Color, DoubleSide, Float32BufferAttribute, Group, InstancedMesh, Matrix4, MeshStandardMaterial, PlaneGeometry, Quaternion, SphereGeometry, Vector3, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { WorldPoint } from '../lakeFrame';
import { lilyPadTexture } from './lilyTexture';

const Pads = { Radius: 0.3, SizeSpread: 0.7, Lift: 0.025, CutOff: 0.5 } as const;
const Flowers = { Share: 0.12, Lift: 0.04, Size: 1, Offset: 0.18 } as const;
const PadGreens = ['#3f6f2c', '#4a7a30', '#36612a', '#5a7a2c', '#6a5a2a'];
const FlowerTints = ['#ffffff', '#ffffff', '#f4c6d6'];
const Petal = { Width: 0.045, Length: 0.1, OuterCount: 9, InnerCount: 6, OuterTilt: 1.05, InnerTilt: 0.55, InnerShare: 0.7 } as const;
const Heart = { Radius: 0.022, Colour: [1, 0.78, 0.2] } as const;
const White = [1, 1, 1];
const UpAxis = new Vector3(0, 1, 0);

function coloured(geometry: BufferGeometry, colour: number[]) {
	const count = geometry.getAttribute('position').count;
	geometry.setAttribute('color', new Float32BufferAttribute(Array.from({ length: count }, () => colour).flat(), 3));
	return geometry;
}

function petalRing(count: number, tilt: number, share: number) {
	return Array.from({ length: count }, (_, index) => {
		const petal = new PlaneGeometry(Petal.Width * share, Petal.Length * share).translate(0, (Petal.Length * share) / 2, 0);
		return coloured(petal.rotateX(tilt - Math.PI / 2).rotateY((index / count) * Math.PI * 2), White);
	});
}

function flowerGeometry() {
	const heart = coloured(new SphereGeometry(Heart.Radius, 8, 6).deleteAttribute('uv'), [...Heart.Colour]);
	const petals = [...petalRing(Petal.OuterCount, Petal.OuterTilt, 1), ...petalRing(Petal.InnerCount, Petal.InnerTilt, Petal.InnerShare)].map((petal) => petal.deleteAttribute('uv'));
	return mergeGeometries([...petals, heart]);
}

function lying(point: WorldPoint, lift: number, size: number, random: () => number) {
	const turn = new Quaternion().setFromAxisAngle(UpAxis, random() * Math.PI * 2);
	return new Matrix4().compose(new Vector3(point.x, lift, point.z), turn, new Vector3(size, size, size));
}

function pads(points: WorldPoint[], random: () => number) {
	const geometry = new PlaneGeometry(Pads.Radius * 2, Pads.Radius * 2).rotateX(-Math.PI / 2);
	const mesh = new InstancedMesh(geometry, new MeshStandardMaterial({ map: lilyPadTexture(), alphaTest: Pads.CutOff, roughness: 0.45, side: DoubleSide }), Math.max(1, points.length));
	points.forEach((point, index) => {
		mesh.setMatrixAt(index, lying(point, Pads.Lift, 1 - Pads.SizeSpread / 2 + random() * Pads.SizeSpread, random));
		mesh.setColorAt(index, new Color(PadGreens[Math.floor(random() * PadGreens.length)]));
	});
	mesh.count = points.length;
	mesh.receiveShadow = true;
	return mesh;
}

function flowers(points: WorldPoint[], random: () => number) {
	const mesh = new InstancedMesh(flowerGeometry(), new MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: DoubleSide }), Math.max(1, points.length));
	points.forEach((point, index) => {
		const beside = { x: point.x + (random() - 0.5) * Flowers.Offset, z: point.z + (random() - 0.5) * Flowers.Offset };
		mesh.setMatrixAt(index, lying(beside, Flowers.Lift, Flowers.Size, random));
		mesh.setColorAt(index, new Color(FlowerTints[index % FlowerTints.length]));
	});
	mesh.count = points.length;
	return mesh;
}

export function createLilyPads(points: WorldPoint[], random: () => number) {
	const inFlower = points.filter(() => random() < Flowers.Share);
	return new Group().add(pads(points, random), flowers(inFlower, random));
}
