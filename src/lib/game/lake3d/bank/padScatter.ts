import { randomBetween, type RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { CoverNoise } from '../grass/coverNoise';
import { isInsideOutline } from '../worldGeometry';

export interface FloatingPad {
	point: WorldPoint;
	radius: number;
	turn: number;
	tilt: number;
	lift: number;
}

const Pads = { PerSquareMetre: 4, Most: 3200, Radius: [0.13, 0.38], Lift: 0.016, Stacking: 0.0022, MostTilt: 0.14, TiltShare: 0.25, Layers: 7 } as const;
const Clumping = { Wavelength: 2.6, Floor: 0.15, NoiseSeed: 91 } as const;

function boundsOf(area: WorldPoint[]) {
	const xs = area.map((point) => point.x);
	const zs = area.map((point) => point.z);
	const least = { x: Math.min(...xs), z: Math.min(...zs) };
	return { least, size: { x: Math.max(...xs) - least.x, z: Math.max(...zs) - least.z } };
}

function padAt(point: WorldPoint, index: number, random: RandomFraction): FloatingPad {
	const isTilted = random() < Pads.TiltShare;
	return { point, radius: randomBetween(random, ...Pads.Radius), turn: random() * Math.PI * 2, tilt: isTilted ? random() * Pads.MostTilt : 0, lift: Pads.Lift + (index % Pads.Layers) * Pads.Stacking };
}

export function scatterPads(area: WorldPoint[], density: number, random: RandomFraction) {
	const { least, size } = boundsOf(area);
	const noise = new CoverNoise(Clumping.NoiseSeed);
	const attempts = Math.min(Pads.Most, Math.round(size.x * size.z * Pads.PerSquareMetre * density));
	const points = Array.from({ length: attempts }, () => ({ x: least.x + random() * size.x, z: least.z + random() * size.z }));
	const clumped = points.filter((point) => isInsideOutline(point, area) && random() < Clumping.Floor + noise.at(point, Clumping.Wavelength));
	return clumped.map((point, index) => padAt(point, index, random));
}
