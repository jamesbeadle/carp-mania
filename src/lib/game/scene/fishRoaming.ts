import { randomWaterPoint, type SwimmingFish } from './fishSchool';
import { isOpenWater, type WaterBody } from './fishWhiskers';
import { distanceBetween, type Point } from './lakeShape';

const Arrival = { WithinPixels: 18 } as const;
const CarpRest = { Chance: 0.4, ShortestSeconds: 2.5, LongestSeconds: 8 } as const;
const PikeRest = { Chance: 0.7, ShortestSeconds: 4, LongestSeconds: 14 } as const;
const Drift = { RestingShare: 0.12, CorneredShare: 0.45, EaseRate: 1.8, PulseRate: 0.5, PulseDepth: 0.15 } as const;
const Stuck = { CheckEverySeconds: 2, MovedLessThanPixels: 6 } as const;
const ClearLine = { Candidates: 8, StepPixels: 16 } as const;

export function headingTo(from: Point, to: Point) {
	return Math.atan2(to.y - from.y, to.x - from.x);
}

export function keepRoaming(fish: SwimmingFish, water: WaterBody, timeSeconds: number) {
	const hasArrived = distanceBetween(fish.position, fish.goal) < Arrival.WithinPixels;
	if (!hasArrived) return;
	fish.goal = goalInOpenWater(fish, water);
	const rest = fish.isPike ? PikeRest : CarpRest;
	const isStoppingToRest = fish.random() < rest.Chance;
	if (isStoppingToRest) fish.restingUntil = timeSeconds + rest.ShortestSeconds + fish.random() * (rest.LongestSeconds - rest.ShortestSeconds);
}

export function easeSpeed(fish: SwimmingFish, isCornered: boolean, timeSeconds: number, secondsElapsed: number) {
	const wanted = wantedSpeed(fish, isCornered, timeSeconds);
	fish.speed += (wanted - fish.speed) * Math.min(1, Drift.EaseRate * secondsElapsed);
}

export function freeIfStuck(fish: SwimmingFish, water: WaterBody, timeSeconds: number, secondsElapsed: number) {
	fish.stuckSeconds += secondsElapsed;
	if (fish.stuckSeconds < Stuck.CheckEverySeconds) return;
	fish.stuckSeconds = 0;
	const isResting = timeSeconds < fish.restingUntil;
	const hasMoved = distanceBetween(fish.position, fish.lastSeenAt) >= Stuck.MovedLessThanPixels;
	fish.lastSeenAt = fish.position;
	if (isResting || hasMoved) return;
	fish.goal = goalInOpenWater(fish, water);
}

function wantedSpeed(fish: SwimmingFish, isCornered: boolean, timeSeconds: number) {
	const isResting = timeSeconds < fish.restingUntil;
	if (isResting) return fish.cruiseSpeed * Drift.RestingShare;
	if (isCornered) return fish.cruiseSpeed * Drift.CorneredShare;
	const pulse = 1 + Math.sin(timeSeconds * Drift.PulseRate + fish.phase) * Drift.PulseDepth;
	return fish.cruiseSpeed * pulse;
}

function goalInOpenWater(fish: SwimmingFish, water: WaterBody): Point {
	let candidate = randomWaterPoint(water.layout, fish.random);
	for (let attempt = 0; attempt < ClearLine.Candidates; attempt++) {
		if (isLineClear(water, fish.position, candidate)) return candidate;
		candidate = randomWaterPoint(water.layout, fish.random);
	}
	return candidate;
}

function isLineClear(water: WaterBody, from: Point, to: Point) {
	const length = distanceBetween(from, to);
	const steps = Math.ceil(length / ClearLine.StepPixels);
	for (let step = 1; step < steps; step++) {
		const along = step / steps;
		const point = { x: from.x + (to.x - from.x) * along, y: from.y + (to.y - from.y) * along };
		if (!isOpenWater(water, point)) return false;
	}
	return true;
}
