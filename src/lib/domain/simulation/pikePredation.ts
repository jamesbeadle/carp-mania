import { PikeRules } from '../economy';
import type { RandomFraction } from '../random';
import type { Carp, Lake } from '../types';

export interface PikeOutcome {
	lake: Lake;
	carp: Carp[];
	carpTakenByPike: Carp[];
}

export function letPikeHuntForOneDay(lake: Lake, carp: Carp[], random: RandomFraction): PikeOutcome {
	if (lake.pike_count === 0) return { lake, carp, carpTakenByPike: [] };

	const foodNeeded = lake.pike_count * PikeRules.FoodEatenPerPikePerDay;
	const isFed = lake.pike_food >= foodNeeded;
	const pike_food = Math.max(0, round(lake.pike_food - foodNeeded));
	const pike_count = isFed ? lake.pike_count : starvedPikeCount(lake.pike_count, random);

	const sickCarp = carp.filter((fish) => fish.condition < PikeRules.SickCarpConditionBelow);
	const carpTakenByPike = sickCarp.filter(() => random() < huntSuccess(pike_count, lake.acres));
	const survivingCarp = carp.filter((fish) => !carpTakenByPike.includes(fish));

	return { lake: { ...lake, pike_food, pike_count }, carp: survivingCarp, carpTakenByPike };
}

function starvedPikeCount(pikeCount: number, random: RandomFraction) {
	const isDieBack = random() < PikeRules.StarveDieBackChance;
	return isDieBack ? pikeCount - 1 : pikeCount;
}

function huntSuccess(pikeCount: number, acres: number) {
	return Math.min(0.8, (pikeCount / acres) * 0.5);
}

function round(value: number) {
	return Math.round(value * 100) / 100;
}
