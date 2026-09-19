import { PikeRules } from '../economy';
import type { RandomFraction } from '../random';
import type { Shoal } from '../stock/shoals';
import type { Carp, Lake } from '../types';
import { pikeEatFromShoals } from './shoalsDay';

const NoShoals: Shoal[] = [];

export interface PikeOutcome {
	lake: Lake;
	carp: Carp[];
	shoals: Shoal[];
	carpTakenByPike: Carp[];
	shoalFishTakenByPike: number;
}

export function letPikeHuntForOneDay(lake: Lake, carp: Carp[], random: RandomFraction, shoals: Shoal[] = NoShoals): PikeOutcome {
	if (lake.pike_count === 0) return { lake, carp, shoals, carpTakenByPike: [], shoalFishTakenByPike: 0 };

	const foodNeeded = lake.pike_count * PikeRules.FoodEatenPerPikePerDay;
	const isFed = lake.pike_food >= foodNeeded;
	const pike_food = Math.max(0, round(lake.pike_food - foodNeeded));
	const pike_count = isFed ? lake.pike_count : starvedPikeCount(lake.pike_count, random);

	const meal = pikeEatFromShoals(shoals, pike_count, Number(lake.acres), random);
	const isStillHungry = meal.eaten < pike_count;
	const sickCarp = isStillHungry ? carp.filter((fish) => fish.condition < PikeRules.SickCarpConditionBelow) : [];
	const carpTakenByPike = sickCarp.filter(() => random() < huntSuccess(pike_count, lake.acres));
	const survivingCarp = carp.filter((fish) => !carpTakenByPike.includes(fish));

	return { lake: { ...lake, pike_food, pike_count }, carp: survivingCarp, shoals: meal.shoals, carpTakenByPike, shoalFishTakenByPike: meal.eaten };
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
