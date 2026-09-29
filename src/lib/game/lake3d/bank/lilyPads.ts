import { Color, DoubleSide, Group, InstancedMesh, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import { pickRandom, randomBetween, type RandomFraction } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { WorldPoint } from '../lakeFrame';
import { withSoftSheen } from '../grass/softSheen';
import { CoverNoise } from '../grass/coverNoise';
import { NearDetailLayer, renderQuality } from '../renderQuality';
import { lilyFlowerGeometry, lilyPadGeometry } from './lilyShapes';
import { lilyPadTexture } from './lilyTexture';
import { scatterPads, type FloatingPad } from './padScatter';

const Look = { PadRoughness: 0.36, PadSheen: 0.42, PadCutOff: 0.5, FlowerRoughness: 0.55, FlowerLift: 0.012, FlowerSize: [0.17, 0.26] } as const;
const PadTints: Record<SeasonName, string[]> = {
	spring: ['#dce4d0', '#ccd8bc', '#bcc8a8', '#d4ccb0'],
	summer: ['#d4dcc8', '#bccaae', '#a8b894', '#ccc098', '#b89478'],
	autumn: ['#e8e0b0', '#d8c890', '#c89e70', '#f0e8c8', '#b88a60'],
	winter: ['#b89a70', '#a88a64', '#c8a878']
};
const FlowerShare: Record<SeasonName, number> = { spring: 0.012, summer: 0.03, autumn: 0.006, winter: 0 };
const Clusters = { Wavelength: 4.5, From: 0.55, To: 0.8, Weight: 3, Seed: 57 } as const;
const FlowerColours = ['#ffffff', '#ffffff', '#fff0f4', '#f6d23a'];
const Up = new Vector3(0, 1, 0);

function padPlacement(pad: FloatingPad) {
	const { point } = pad;
	const tilt = new Quaternion().setFromAxisAngle(new Vector3(Math.cos(pad.turn), 0, Math.sin(pad.turn)), pad.tilt);
	const turn = new Quaternion().setFromAxisAngle(Up, pad.turn);
	return new Matrix4().compose(new Vector3(point.x, pad.lift, point.z), tilt.multiply(turn), new Vector3(pad.radius, pad.radius, pad.radius));
}

function padMesh(pads: FloatingPad[], season: SeasonName, random: RandomFraction) {
	const surface = { map: lilyPadTexture(), roughness: Look.PadRoughness, alphaTest: Look.PadCutOff, alphaToCoverage: renderQuality().multisamples > 0 };
	const material = withSoftSheen(new MeshStandardMaterial(surface), Look.PadSheen);
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
	const noise = new CoverNoise(Clusters.Seed);
	const clustering = (pad: FloatingPad) => Math.min(1, Math.max(0, (noise.at(pad.point, Clusters.Wavelength) - Clusters.From) / (Clusters.To - Clusters.From)));
	const flowering = pads.filter((pad) => random() < FlowerShare[season] * clustering(pad) * Clusters.Weight);
	const material = new MeshStandardMaterial({ vertexColors: true, roughness: Look.FlowerRoughness, side: DoubleSide });
	const mesh = new InstancedMesh(lilyFlowerGeometry(), material, Math.max(1, flowering.length));
	mesh.count = flowering.length;
	flowering.forEach((pad, index) => {
		const { point } = pad;
		const size = randomBetween(random, ...Look.FlowerSize);
		const turn = new Quaternion().setFromAxisAngle(Up, pad.turn);
		mesh.setMatrixAt(index, new Matrix4().compose(new Vector3(point.x, pad.lift + Look.FlowerLift, point.z), turn, new Vector3(size, size, size)));
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
