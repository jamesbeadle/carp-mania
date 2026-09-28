import { BufferAttribute, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { metresBetween, type WorldPoint } from '../lakeFrame';
import { NearDetailLayer } from '../renderQuality';
import { distanceToSegment } from '../worldGeometry';
import { CoverNoise } from './coverNoise';
import type { SurveyedBank } from './coverGround';
import { dirtTexture } from './dirtTexture';
import { SwimGround, type SwimClearing } from './swimClearings';

const Patch = { Radius: SwimGround.PodRadius + 0.4, PegRadius: SwimGround.PegRadius + 0.3, PathRadius: SwimGround.PathRadius, SolidShare: 0.4, CellMetres: 0.33, Lift: 0.035, NoiseWavelength: 0.9, Raggedness: 0.9, TextureMetres: 2.2 } as const;
const Water = { FadeFrom: 0.15, FadeTo: 0.8 } as const;
const Offset = { Factor: -2, Units: -4 } as const;
const Channels = 4;

function smoothStep(value: number, from: number, to: number) {
	const share = Math.min(1, Math.max(0, (value - from) / (to - from)));
	return share * share * (3 - 2 * share);
}

function wornWithin(metres: number, radius: number) {
	return 1 - smoothStep(metres, radius * Patch.SolidShare, radius);
}

function wearAt(point: WorldPoint, clearing: SwimClearing, noise: CoverNoise) {
	const { peg, pod } = clearing;
	const ragged = (noise.at(point, Patch.NoiseWavelength) - 1 / 2) * Patch.Raggedness;
	const aroundPod = wornWithin(metresBetween(point, pod) + ragged, Patch.Radius);
	const aroundPeg = wornWithin(metresBetween(point, peg) + ragged, Patch.PegRadius);
	return Math.max(aroundPod, aroundPeg, wornWithin(distanceToSegment(point, peg, pod) + ragged, Patch.PathRadius));
}

function stripAlong(clearing: SwimClearing) {
	const { peg, pod } = clearing;
	const length = metresBetween(peg, pod) + Patch.Radius * 2;
	const width = Patch.Radius * 2;
	const geometry = new PlaneGeometry(width, length, Math.ceil(width / Patch.CellMetres), Math.ceil(length / Patch.CellMetres)).rotateX(-Math.PI / 2);
	return geometry.rotateY(Math.atan2(pod.x - peg.x, pod.z - peg.z)).translate((peg.x + pod.x) / 2, 0, (peg.z + pod.z) / 2);
}

function patchAround(clearing: SwimClearing, bank: SurveyedBank, noise: CoverNoise) {
	const geometry = stripAlong(clearing);
	const positions = geometry.getAttribute('position');
	const colours = new Float32Array(positions.count * Channels);
	for (let index = 0; index < positions.count; index++) {
		const point: WorldPoint = { x: positions.getX(index), z: positions.getZ(index) };
		const worn = wearAt(point, clearing, noise) * smoothStep(bank.shore.distanceAt(point), Water.FadeFrom, Water.FadeTo);
		positions.setY(index, bank.groundAt(point) + Patch.Lift);
		colours.set([1, 1, 1, worn], index * Channels);
	}
	geometry.setAttribute('color', new BufferAttribute(colours, Channels));
	return geometry;
}

function worldUvs(geometry: PlaneGeometry) {
	const positions = geometry.getAttribute('position');
	const uvs = geometry.getAttribute('uv');
	for (let index = 0; index < positions.count; index++) uvs.setXY(index, positions.getX(index) / Patch.TextureMetres, positions.getZ(index) / Patch.TextureMetres);
	return geometry;
}

export function createWornPatches(bank: SurveyedBank) {
	const noise = new CoverNoise(bank.seed);
	const patches = bank.swims.map((clearing) => worldUvs(patchAround(clearing, bank, noise)));
	const material = new MeshStandardMaterial({ map: dirtTexture(), vertexColors: true, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: Offset.Factor, polygonOffsetUnits: Offset.Units });
	const mesh = new Mesh(patches.length > 0 ? mergeGeometries(patches) : new PlaneGeometry(0, 0), material);
	mesh.layers.set(NearDetailLayer);
	mesh.receiveShadow = true;
	mesh.name = 'worn-patches';
	return mesh;
}
