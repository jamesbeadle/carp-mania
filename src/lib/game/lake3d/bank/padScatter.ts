import { randomBetween, type RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { CoverNoise } from '../grass/coverNoise';
import { distanceToOutline, isInsideOutline } from '../worldGeometry';

export interface FloatingPad {
	point: WorldPoint;
	radius: number;
	turn: number;
	tilt: number;
	lift: number;
}

const Pads = { PerSquareMetre: 7, Most: 24000, Radius: [0.14, 0.36], Large: [0.4, 0.6], LargeShare: 0.12, Lift: 0.016, Stacking: 0.0022, MostTilt: 0.16, TiltShare: 0.3, Layers: 7 } as const;
const Rafts = { Wavelength: 3.6, BroadWavelength: 10, Threshold: 0.3, Softness: 0.22, NoiseSeed: 91 } as const;
const Edge = { StrayReach: 1.6, FullDepth: 3, StrayShare: 0.1 } as const;

function boundsOf(area: WorldPoint[]) {
	const xs = area.map((point) => point.x - Edge.StrayReach);
	const zs = area.map((point) => point.z - Edge.StrayReach);
	const least = { x: Math.min(...xs), z: Math.min(...zs) };
	const most = { x: Math.max(...xs) + Edge.StrayReach * 2, z: Math.max(...zs) + Edge.StrayReach * 2 };
	return { least, size: { x: most.x - least.x, z: most.z - least.z } };
}

function padAt(point: WorldPoint, index: number, random: RandomFraction): FloatingPad {
	const isTilted = random() < Pads.TiltShare;
	const isLarge = random() < Pads.LargeShare;
	const lift = Pads.Lift + (index % Pads.Layers) * Pads.Stacking;
	const [least, most] = isLarge ? Pads.Large : Pads.Radius;
	const radius = randomBetween(random, least, most);
	return { point, radius, turn: random() * Math.PI * 2, tilt: isTilted ? random() * Pads.MostTilt : 0, lift };
}

function depthInside(point: WorldPoint, area: WorldPoint[]) {
	const toEdge = distanceToOutline(point, area);
	return isInsideOutline(point, area) ? toEdge : -toEdge;
}

function raftShare(point: WorldPoint, area: WorldPoint[], noise: CoverNoise) {
	const depth = depthInside(point, area);
	if (depth < -Edge.StrayReach) return 0;
	const raft = noise.at(point, Rafts.Wavelength) * (1 / 2 + noise.at(point, Rafts.BroadWavelength));
	const inRaft = Math.min(1, Math.max(0, (raft - Rafts.Threshold) / Rafts.Softness));
	const towardsMiddle = Math.min(1, Math.max(0, depth / Edge.FullDepth));
	return Math.max(Edge.StrayShare * (1 - Math.abs(depth) / Edge.StrayReach), inRaft * towardsMiddle);
}

export function scatterPads(area: WorldPoint[], density: number, random: RandomFraction) {
	const { least, size } = boundsOf(area);
	const noise = new CoverNoise(Rafts.NoiseSeed);
	const attempts = Math.round(Math.min(Pads.Most, size.x * size.z * Pads.PerSquareMetre) * density);
	const points = Array.from({ length: attempts }, () => ({ x: least.x + random() * size.x, z: least.z + random() * size.z }));
	const floating = points.filter((point) => random() < raftShare(point, area, noise));
	return floating.map((point, index) => padAt(point, index, random));
}
