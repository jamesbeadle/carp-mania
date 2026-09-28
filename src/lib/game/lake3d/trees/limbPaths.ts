import { Vector3 } from 'three';
import type { RandomFraction } from '$lib/domain/random';

export interface Limb {
	points: Vector3[];
	radii: number[];
	level: number;
}

export interface LimbSample {
	point: Vector3;
	direction: Vector3;
	radius: number;
}

export const UpAxis = new Vector3(0, 1, 0);
const SideAxis = new Vector3(1, 0, 0);
const NearlyUpright = 0.95;

export function randomUnit(random: RandomFraction) {
	return new Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize();
}

export function deviate(direction: Vector3, angle: number, azimuth: number) {
	const isUpright = Math.abs(direction.y) > NearlyUpright;
	const first = new Vector3().crossVectors(direction, isUpright ? SideAxis : UpAxis).normalize();
	const second = new Vector3().crossVectors(direction, first).normalize();
	const axis = first.multiplyScalar(Math.cos(azimuth)).addScaledVector(second, Math.sin(azimuth));
	return direction.clone().multiplyScalar(Math.cos(angle)).addScaledVector(axis, Math.sin(angle)).normalize();
}

export function sampleLimb(limb: Limb, along: number): LimbSample {
	const { points, radii } = limb;
	const spans = points.length - 1;
	const position = Math.min(spans, Math.max(0, along * spans));
	const index = Math.min(spans - 1, Math.floor(position));
	const share = position - index;
	const start = points[index];
	const end = points[index + 1];
	const point = start.clone().lerp(end, share);
	const direction = end.clone().sub(start).normalize();
	return { point, direction, radius: radii[index] + (radii[index + 1] - radii[index]) * share };
}
