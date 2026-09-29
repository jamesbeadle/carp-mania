import { Vector3, type BufferGeometry } from 'three';
import { pickRandom, randomBetween, type RandomFraction } from '$lib/domain/random';
import { trunkRadiusAlong } from './fallenTrunk';
import { woodTube } from './woodTube';

interface Bough {
	from: Vector3;
	heading: Vector3;
	length: number;
	radius: number;
	depth: number;
}

const Branch = { Count: 10, FirstShare: 0.3, Length: [2.4, 4.8], RadiusShare: 0.3, UprightShare: 0.6, Shortening: 0.45, BrokenShare: 0.3, Broken: 0.3 } as const;
const Kink = { Joints: 4, Swing: 0.3, Lift: 0.05, TipShare: 0.14 } as const;
const Fork = { MostDepth: 2, Chance: 0.7, LengthShare: 0.55, RadiusShare: 0.6, Spread: 0.45 } as const;
const Build = { Sides: [7, 5, 4], Roughness: 0.1, Thinnest: 0.006 } as const;
const Reach = { Rise: [0.7, 1.3], Lean: [0, 0.3], Level: [-0.04, 0.16], Out: [0.3, 0.9], Side: [0.6, 1.4] } as const;
const Sides = [-1, 1];
const Up = new Vector3(0, 1, 0);

function jitter(random: RandomFraction, swing: number) {
	return new Vector3(random() - 1 / 2, random() - 1 / 2, random() - 1 / 2).multiplyScalar(swing * 2);
}

function kinkedPoints(bough: Bough, random: RandomFraction) {
	const points = [bough.from.clone()];
	const heading = bough.heading.clone();
	const step = bough.length / Kink.Joints;
	for (let joint = 0; joint < Kink.Joints; joint++) {
		heading.add(jitter(random, Kink.Swing)).addScaledVector(Up, Kink.Lift).normalize();
		points.push(points[joint].clone().addScaledVector(heading, step));
	}
	return points;
}

function forksOf(bough: Bough, points: Vector3[], random: RandomFraction): Bough[] {
	if (bough.depth >= Fork.MostDepth) return [];
	return points.slice(1, -1).filter(() => random() < Fork.Chance).map((joint) => ({
		from: joint,
		heading: bough.heading.clone().add(jitter(random, Fork.Spread)).normalize(),
		length: bough.length * Fork.LengthShare,
		radius: bough.radius * Fork.RadiusShare,
		depth: bough.depth + 1
	}));
}

function grownBough(bough: Bough, random: RandomFraction): BufferGeometry[] {
	const points = kinkedPoints(bough, random);
	const toRadius = Math.max(Build.Thinnest, bough.radius * Kink.TipShare);
	const tube = woodTube({ points, fromRadius: bough.radius, toRadius, sides: Build.Sides[bough.depth], roughness: Build.Roughness }, random);
	return [tube, ...forksOf(bough, points, random).flatMap((fork) => grownBough(fork, random))];
}

function reachingHeading(random: RandomFraction) {
	const out = randomBetween(random, ...Reach.Out);
	const side = pickRandom(random, Sides);
	const isUpright = random() < Branch.UprightShare;
	if (isUpright) return new Vector3(out, randomBetween(random, ...Reach.Rise), side * randomBetween(random, ...Reach.Lean)).normalize();
	return new Vector3(out, randomBetween(random, ...Reach.Level), side * randomBetween(random, ...Reach.Side)).normalize();
}

function pointOnTrunk(trunk: Vector3[], along: number) {
	const place = along * (trunk.length - 1);
	const joint = Math.min(trunk.length - 2, Math.floor(place));
	return trunk[joint].clone().lerp(trunk[joint + 1], place - joint);
}

export function branchesOf(trunk: Vector3[], random: RandomFraction) {
	return Array.from({ length: Branch.Count }, (_, index) => {
		const along = Branch.FirstShare + ((index + random() / 2) / Branch.Count) * (1 - Branch.FirstShare);
		const snapped = random() < Branch.BrokenShare ? Branch.Broken : 1;
		const length = randomBetween(random, ...Branch.Length) * (1 - along * Branch.Shortening) * snapped;
		const radius = trunkRadiusAlong(along) * Branch.RadiusShare;
		return grownBough({ from: pointOnTrunk(trunk, along), heading: reachingHeading(random), length, radius, depth: 0 }, random);
	}).flat();
}
