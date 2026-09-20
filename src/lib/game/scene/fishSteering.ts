import { easeSpeed, freeIfStuck, headingTo, keepRoaming } from './fishRoaming';
import type { SwimmingFish } from './fishSchool';
import { clearWaterAhead, isOpenWater, Whisker, type ClearAhead, type WaterBody } from './fishWhiskers';

const Turn = { CarpRadiansPerSecond: 1.3, PikeRadiansPerSecond: 2.2, CorneredRadiansPerSecond: 3.2, AwayFromTheBank: Whisker.Angle * 1.6, Graze: 0.3 } as const;
const Avoid = { MemorySeconds: 1.5 } as const;
const Wander = { Rate: 0.35, Strength: 0.5 } as const;
const TailBeat = { Idle: 0.3, AtCruise: 1 } as const;
const Side = { Left: -1, Right: 1, None: 0 } as const;
const FullTurn = Math.PI * 2;

export function moveFishSchool(school: SwimmingFish[], water: WaterBody, secondsElapsed: number, timeSeconds: number) {
	for (const fish of school) swim(fish, water, secondsElapsed, timeSeconds);
}

function swim(fish: SwimmingFish, water: WaterBody, secondsElapsed: number, timeSeconds: number) {
	const ahead = clearWaterAhead(fish, water);
	const isCornered = !ahead.centre;
	turnTowards(fish, wantedHeading(fish, ahead, timeSeconds), turnRateOf(fish, isCornered), secondsElapsed);
	easeSpeed(fish, isCornered, timeSeconds, secondsElapsed);
	advance(fish, water, secondsElapsed);
	fish.tailTime += secondsElapsed * tailBeatOf(fish);
	keepRoaming(fish, water, timeSeconds);
	freeIfStuck(fish, water, timeSeconds, secondsElapsed);
}

function wantedHeading(fish: SwimmingFish, ahead: ClearAhead, timeSeconds: number) {
	if (ahead.centre) return headingAlongTheBank(fish, ahead, timeSeconds);
	const side = sideToTurn(fish, ahead, timeSeconds);
	fish.avoidingSide = side;
	fish.avoidingUntil = timeSeconds + Avoid.MemorySeconds;
	return fish.heading + side * Turn.AwayFromTheBank;
}

function headingAlongTheBank(fish: SwimmingFish, ahead: ClearAhead, timeSeconds: number) {
	const wander = Math.sin(timeSeconds * Wander.Rate + fish.phase) * Wander.Strength;
	const towardsTheGoal = headingTo(fish.position, fish.goal) + wander;
	if (!ahead.left && ahead.right) return towardsTheGoal + Turn.Graze;
	if (!ahead.right && ahead.left) return towardsTheGoal - Turn.Graze;
	return towardsTheGoal;
}

function sideToTurn(fish: SwimmingFish, ahead: ClearAhead, timeSeconds: number) {
	const isRemembering = timeSeconds < fish.avoidingUntil && fish.avoidingSide !== Side.None;
	if (isRemembering) return fish.avoidingSide;
	if (ahead.left && !ahead.right) return Side.Left;
	if (ahead.right && !ahead.left) return Side.Right;
	const goalIsToTheRight = shortestTurn(headingTo(fish.position, fish.goal) - fish.heading) > 0;
	return goalIsToTheRight ? Side.Right : Side.Left;
}

function turnRateOf(fish: SwimmingFish, isCornered: boolean) {
	if (isCornered) return Turn.CorneredRadiansPerSecond;
	return fish.isPike ? Turn.PikeRadiansPerSecond : Turn.CarpRadiansPerSecond;
}

function turnTowards(fish: SwimmingFish, wanted: number, radiansPerSecond: number, secondsElapsed: number) {
	const difference = shortestTurn(wanted - fish.heading);
	const step = Math.min(Math.abs(difference), radiansPerSecond * secondsElapsed);
	fish.heading += Math.sign(difference) * step;
}

function shortestTurn(angle: number) {
	const wrapped = (((angle + Math.PI) % FullTurn) + FullTurn) % FullTurn;
	return wrapped - Math.PI;
}

function advance(fish: SwimmingFish, water: WaterBody, secondsElapsed: number) {
	const next = { x: fish.position.x + Math.cos(fish.heading) * fish.speed * secondsElapsed, y: fish.position.y + Math.sin(fish.heading) * fish.speed * secondsElapsed };
	if (isOpenWater(water, next)) fish.position = next;
}

function tailBeatOf(fish: SwimmingFish) {
	const effort = fish.speed / fish.cruiseSpeed;
	return TailBeat.Idle + effort * (TailBeat.AtCruise - TailBeat.Idle);
}
