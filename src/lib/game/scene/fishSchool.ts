import type { Carp, CarpStrain } from '$lib/domain/types';
import { seededRandom, type RandomFraction } from '$lib/domain/random';
import { isInsideWater, lakeCentre, type Point } from './lakeShape';

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

export function createFishSchool(carp: Carp[], pikeCount: number, seed: number): SwimmingFish[] {
	const random = seededRandom(seed);
	const centre = lakeCentre();
	const representatives = [...carp].sort((first, second) => Number(second.weight_lb) - Number(first.weight_lb)).slice(0, MaximumFishDrawn);
	const carpFish = representatives.map((fish) => spawn(fish.id, fish.strain, Number(fish.weight_lb), false, centre, random));
	const pike = Array.from({ length: Math.min(pikeCount, 6) }, (_, index) => spawn(`pike-${index}`, 'common', 7, true, centre, random));
	return [...carpFish, ...pike];
}

function spawn(carpId: string, strain: CarpStrain, weightPounds: number, isPike: boolean, centre: Point, random: RandomFraction): SwimmingFish {
	const angle = random() * Math.PI * 2;
	const distance = 40 + random() * 200;
	return {
		carpId,
		strain,
		weightPounds,
		position: { x: centre.x + Math.cos(angle) * distance, y: centre.y + Math.sin(angle) * distance },
		heading: random() * Math.PI * 2,
		speed: isPike ? 6 : 10 + random() * 10,
		phase: random() * Math.PI * 2,
		isPike
	};
}

export function moveFishSchool(school: SwimmingFish[], context: CanvasRenderingContext2D, lake: Path2D, island: Path2D, secondsElapsed: number, timeSeconds: number) {
	for (const fish of school) {
		const wander = Math.sin(timeSeconds * 0.7 + fish.phase) * 0.6;
		fish.heading += wander * secondsElapsed;
		const next = { x: fish.position.x + Math.cos(fish.heading) * fish.speed * secondsElapsed, y: fish.position.y + Math.sin(fish.heading) * fish.speed * secondsElapsed };
		if (isInsideWater(context, lake, island, next)) {
			fish.position = next;
			continue;
		}
		fish.heading += Math.PI * 0.75 + Math.sin(fish.phase) * 0.3;
	}
}
