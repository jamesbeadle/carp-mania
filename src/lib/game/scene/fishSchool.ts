import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import { isInWater } from '$lib/domain/layout/waterArea';
import { seededRandom, type RandomFraction } from '$lib/domain/random';
import type { Carp, CarpStrain } from '$lib/domain/types';
import { lakeCentreOf, toScene, type Point } from './lakeShape';

export interface SwimmingFish {
	carpId: string;
	strain: CarpStrain;
	weightPounds: number;
	position: Point;
	heading: number;
	speed: number;
	cruiseSpeed: number;
	phase: number;
	tailTime: number;
	isPike: boolean;
	goal: Point;
	restingUntil: number;
	lastSeenAt: Point;
	stuckSeconds: number;
	avoidingSide: number;
	avoidingUntil: number;
	random: RandomFraction;
}

const MaximumFishDrawn = 34;
const MaximumPikeDrawn = 6;
const PikeWeightPounds = 7;
export const Speed = { Pike: 7, CarpSlowest: 9, CarpSpread: 9 } as const;
const SpawnAttempts = 60;
const SeedStride = 104729;

export function createFishSchool(carp: Carp[], pikeCount: number, seed: number, layout: LakeLayout): SwimmingFish[] {
	const random = seededRandom(seed);
	const inTheLake = carp.filter((fish) => fish.transit_until === null);
	const representatives = [...inTheLake].sort((first, second) => Number(second.weight_lb) - Number(first.weight_lb)).slice(0, MaximumFishDrawn);
	const carpFish = representatives.map((fish, index) => spawn(fish.id, fish.strain, Number(fish.weight_lb), false, layout, seed + index * SeedStride, random));
	const pike = Array.from({ length: Math.min(pikeCount, MaximumPikeDrawn) }, (_, index) => spawn(`pike-${index}`, 'common', PikeWeightPounds, true, layout, seed - (index + 1) * SeedStride, random));
	return [...carpFish, ...pike];
}

function spawn(carpId: string, strain: CarpStrain, weightPounds: number, isPike: boolean, layout: LakeLayout, ownSeed: number, random: RandomFraction): SwimmingFish {
	const position = randomWaterPoint(layout, random);
	const cruiseSpeed = isPike ? Speed.Pike : Speed.CarpSlowest + random() * Speed.CarpSpread;
	return {
		carpId,
		strain,
		weightPounds,
		position,
		heading: random() * Math.PI * 2,
		speed: cruiseSpeed,
		cruiseSpeed,
		phase: random() * Math.PI * 2,
		tailTime: random() * Math.PI * 2,
		isPike,
		goal: randomWaterPoint(layout, random),
		restingUntil: 0,
		lastSeenAt: position,
		stuckSeconds: 0,
		avoidingSide: 0,
		avoidingUntil: 0,
		random: seededRandom(ownSeed)
	};
}

export function randomWaterPoint(layout: LakeLayout, random: RandomFraction): Point {
	for (let attempt = 0; attempt < SpawnAttempts; attempt++) {
		const fraction = { x: random(), y: random() };
		if (isInWater(layout, fraction)) return toScene(fraction);
	}
	return lakeCentreOf(layout);
}
