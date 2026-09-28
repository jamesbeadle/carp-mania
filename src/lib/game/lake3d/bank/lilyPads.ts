import { Color, DoubleSide, Group, InstancedMesh, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import { pickRandom, randomBetween, type RandomFraction } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { WorldPoint } from '../lakeFrame';
import { withSoftSheen } from '../grass/softSheen';
import { NearDetailLayer } from '../renderQuality';
import { lilyFlowerGeometry, lilyPadGeometry } from './lilyShapes';
import { lilyPadTexture } from './lilyTexture';
import { scatterPads, type FloatingPad } from './padScatter';

const Look = { PadRoughness: 0.6, PadSheen: 0.3, FlowerRoughness: 0.55, FlowerLift: 0.012, FlowerSize: [0.1, 0.16] } as const;
const PadTints: Record<SeasonName, string[]> = {
	spring: ['#ffffff', '#eef6e0', '#dfeccc', '#f4ecd0'],
	summer: ['#ffffff', '#e0ecd0', '#c8d8b0', '#f0e2b4', '#d8a888'],
	autumn: ['#e8e0b0', '#d8c890', '#c89e70', '#f0e8c8', '#b88a60'],
	winter: ['#b89a70', '#a88a64', '#c8a878']
};
const FlowerShare: Record<SeasonName, number> = { spring: 0.05, summer: 0.14, autumn: 0.03, winter: 0 };
const FlowerColours = ['#ffffff', '#ffffff', '#fff0f4', '#f6d23a'];
const Up = new Vector3(0, 1, 0);

function padPlacement(pad: FloatingPad) {
	const { point } = pad;
	const tilt = new Quaternion().setFromAxisAngle(new Vector3(Math.cos(pad.turn), 0, Math.sin(pad.turn)), pad.tilt);
	const turn = new Quaternion().setFromAxisAngle(Up, pad.turn);
	return new Matrix4().compose(new Vector3(point.x, pad.lift, point.z), tilt.multiply(turn), new Vector3(pad.radius, pad.radius, pad.radius));
}

function padMesh(pads: FloatingPad[], season: SeasonName, random: RandomFraction) {
	const material = withSoftSheen(new MeshStandardMaterial({ map: lilyPadTexture(), roughness: Look.PadRoughness }), Look.PadSheen);
	const mesh = new InstancedMesh(lilyPadGeometry(), material, Math.max(1, pads.length));
	mesh.count = pads.length;
	pads.forEach((pad, index) => {
		mesh.setMatrixAt(index, padPlacement(pad));
		mesh.setColorAt(index, new Color(pickRandom(random, PadTints[season])));
	});
	mesh.receiveShadow = true;
	return mesh;
}

function flowerMesh(pads: FloatingPad[], season: SeasonName, random: RandomFraction) {
	const flowering = pads.filter(() => random() < FlowerShare[season]);
	const material = new MeshStandardMaterial({ vertexColors: true, roughness: Look.FlowerRoughness, side: DoubleSide });
	const mesh = new InstancedMesh(lilyFlowerGeometry(), material, Math.max(1, flowering.length));
	mesh.count = flowering.length;
	flowering.forEach((pad, index) => {
		const { point } = pad;
		const size = randomBetween(random, ...Look.FlowerSize);
		mesh.setMatrixAt(index, new Matrix4().compose(new Vector3(point.x, pad.lift + Look.FlowerLift, point.z), new Quaternion().setFromAxisAngle(Up, pad.turn), new Vector3(size, size, size)));
		mesh.setColorAt(index, new Color(pickRandom(random, FlowerColours)));
	});
	return mesh;
}

export function createLilyBeds(areas: WorldPoint[][], season: SeasonName, density: number, random: RandomFraction) {
	const pads = areas.flatMap((area) => scatterPads(area, density, random));
	const group = new Group().add(padMesh(pads, season, random), flowerMesh(pads, season, random));
	group.children.forEach((child) => child.layers.set(NearDetailLayer));
	return group;
}
