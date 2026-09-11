import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import { isInWater } from '$lib/domain/layout/waterArea';
import { seededRandom, type RandomFraction } from '$lib/domain/random';
import type { Carp, CarpStrain } from '$lib/domain/types';
import { isInsideWater, lakeCentreOf, toScene, type Point } from './lakeShape';

export interface SwimmingFish {
	carpId: string;
	strain: CarpStrain;
	weightPounds: number;
	position: Point;
	heading: number;
	speed: number;
	phase: number;
	isPike: boolean;
}

const MaximumFishDrawn = 34;
const MaximumPikeDrawn = 6;
const PikeWeightPounds = 7;
const Speed = { Pike: 6, CarpSlowest: 10, CarpSpread: 10 } as const;
const SpawnAttempts = 60;
const Wander = { Rate: 0.7, Strength: 0.6 } as const;
const TurnAway = { Angle: Math.PI * 0.75, Variation: 0.3 } as const;

export function createFishSchool(carp: Carp[], pikeCount: number, seed: number, layout: LakeLayout): SwimmingFish[] {
	const random = seededRandom(seed);
	const inTheLake = carp.filter((fish) => fish.transit_until === null);
	const representatives = [...inTheLake].sort((first, second) => Number(second.weight_lb) - Number(first.weight_lb)).slice(0, MaximumFishDrawn);
	const carpFish = representatives.map((fish) => spawn(fish.id, fish.strain, Number(fish.weight_lb), false, layout, random));
	const pike = Array.from({ length: Math.min(pikeCount, MaximumPikeDrawn) }, (_, index) => spawn(`pike-${index}`, 'common', PikeWeightPounds, true, layout, random));
	return [...carpFish, ...pike];
}

function spawn(carpId: string, strain: CarpStrain, weightPounds: number, isPike: boolean, layout: LakeLayout, random: RandomFraction): SwimmingFish {
	return {
		carpId,
		strain,
		weightPounds,
		position: randomWaterPoint(layout, random),
		heading: random() * Math.PI * 2,
		speed: isPike ? Speed.Pike : Speed.CarpSlowest + random() * Speed.CarpSpread,
		phase: random() * Math.PI * 2,
		isPike
	};
}

function randomWaterPoint(layout: LakeLayout, random: RandomFraction): Point {
	for (let attempt = 0; attempt < SpawnAttempts; attempt++) {
		const fraction = { x: random(), y: random() };
		if (isInWater(layout, fraction)) return toScene(fraction);
	}
	return lakeCentreOf(layout);
}

export function moveFishSchool(school: SwimmingFish[], context: CanvasRenderingContext2D, lake: Path2D, islands: Path2D[], secondsElapsed: number, timeSeconds: number) {
	for (const fish of school) {
		const wander = Math.sin(timeSeconds * Wander.Rate + fish.phase) * Wander.Strength;
		fish.heading += wander * secondsElapsed;
		const next = { x: fish.position.x + Math.cos(fish.heading) * fish.speed * secondsElapsed, y: fish.position.y + Math.sin(fish.heading) * fish.speed * secondsElapsed };
		if (isInsideWater(context, lake, islands, next)) {
			fish.position = next;
			continue;
		}
		fish.heading += TurnAway.Angle + Math.sin(fish.phase) * TurnAway.Variation;
	}
}
