import { Float32BufferAttribute, IcosahedronGeometry, Vector3 } from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { randomBetween, type RandomFraction } from '$lib/domain/random';
import { CoverNoise } from '../grass/coverNoise';
import { woodTube } from './woodTube';

const Roots = { Count: 18, Reach: [0.7, 1.6], Back: [0.1, 0.55], Droop: 0.45, Radius: [0.045, 0.1], TipRadius: 0.012, Sides: 5, Roughness: 0.25, Joints: 4, Kink: 0.55 } as const;
const Start = { Around: 0.28, Back: 0.05 } as const;
const Clod = { Radius: 0.85, Detail: 3, Thin: 0.42, Back: 0.3, Lumpiness: 0.55, Wavelength: 0.35, Seed: 29, Squash: 0.9 } as const;

function rootPoints(base: Vector3, turn: number, random: RandomFraction) {
	const outward = new Vector3(-randomBetween(random, ...Roots.Back), Math.sin(turn), Math.cos(turn)).normalize();
	const step = randomBetween(random, ...Roots.Reach) / Roots.Joints;
	const start = base.clone().add(new Vector3(-Start.Back, Math.sin(turn) * Start.Around, Math.cos(turn) * Start.Around));
	const points = [start];
	for (let joint = 0; joint < Roots.Joints; joint++) {
		outward.add(new Vector3(0, -Roots.Droop * (joint + 1) / Roots.Joints, (random() - 1 / 2) * Roots.Kink)).normalize();
		points.push(points[joint].clone().addScaledVector(outward, step));
	}
	return points;
}

export function rootsOf(base: Vector3, random: RandomFraction) {
	return Array.from({ length: Roots.Count }, (_, index) => {
		const turn = (index / Roots.Count) * Math.PI * 2 + random() * (Math.PI / Roots.Count);
		const limb = { points: rootPoints(base, turn, random), fromRadius: randomBetween(random, ...Roots.Radius), toRadius: Roots.TipRadius, sides: Roots.Sides, roughness: Roots.Roughness };
		return woodTube(limb, random);
	});
}

export function soilClod(base: Vector3, seed: number) {
	const clod = mergeVertices(new IcosahedronGeometry(Clod.Radius, Clod.Detail).deleteAttribute('normal').deleteAttribute('uv'));
	const noise = new CoverNoise(seed + Clod.Seed);
	const positions = clod.getAttribute('position');
	const corner = new Vector3();
	for (let index = 0; index < positions.count; index++) {
		corner.fromBufferAttribute(positions, index);
		const lump = 1 + (noise.at({ x: corner.x + corner.y, z: corner.z - corner.y }, Clod.Wavelength) - 1 / 2) * Clod.Lumpiness * 2;
		corner.multiplyScalar(lump);
		positions.setXYZ(index, corner.x * Clod.Thin, corner.y * Clod.Squash, corner.z);
	}
	clod.computeVertexNormals();
	clod.setAttribute('uv', new Float32BufferAttribute(new Float32Array(positions.count * 2), 2));
	return clod.translate(base.x - Clod.Back, base.y, base.z);
}
