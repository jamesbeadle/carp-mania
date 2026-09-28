import type { RandomFraction } from '../../src/lib/domain/random';
import { Appetite, Condition, ConditionValue, Fame, Growth, Lifespan, Wariness } from './rules';
import { GuideBands } from './shelf';

export interface Fish {
	weightLb: number;
	condition: number;
	ageYears: number;
	potentialLb: number;
	fame: number;
	captureDays: number[];
}

export interface FeedingDay {
	ceilingLb: number;
	protein: number;
	fedFraction: number;
	seasonGrowth: number;
	isCrowded: boolean;
}

export function newFish(weightLb: number, condition: number, ageYears: number, potentialLb: number): Fish {
	return { weightLb, condition, ageYears, potentialLb, fame: 0, captureDays: [] };
}

export function growForOneDay(fish: Fish, day: FeedingDay) {
	const ceilingLb = Math.min(day.ceilingLb, fish.potentialLb);
	const isAtCeiling = fish.weightLb >= ceilingLb;
	if (!isAtCeiling) fish.weightLb = Math.min(ceilingLb, fish.weightLb + poundsGainedToday(fish, ceilingLb, day));
	fish.condition = conditionAfterToday(fish, day);
	const isStarving = fish.condition < Condition.ShrinksBelow;
	if (isStarving) fish.weightLb = Math.max(1, fish.weightLb - Condition.PoundsLostPerDay);
}

export function idealPoundsPerDayAt(weightLb: number) {
	return Growth.PoundsPerDayAtTwenty * Math.pow(2, -(weightLb - Growth.TwentyLb) / Growth.HalvesEveryLb);
}

function poundsGainedToday(fish: Fish, ceilingLb: number, day: FeedingDay) {
	const reach = 1 - Math.pow(fish.weightLb / ceilingLb, Growth.ReachPower);
	return idealPoundsPerDayAt(fish.weightLb) * reach * day.protein * day.fedFraction * day.seasonGrowth;
}

function conditionAfterToday(fish: Fish, day: FeedingDay) {
	const crowding = day.isCrowded ? Condition.CrowdedLossPerDay : 0;
	const isHungry = day.fedFraction < Condition.HungryBelow;
	const change = isHungry ? -Condition.HungerLossPerDay * (1 - day.fedFraction) : Condition.FedGainPerDay * day.fedFraction;
	const fed = Math.min(Condition.FedTarget, fish.condition + change);
	const settled = isHungry ? fish.condition + change : Math.max(fish.condition, fed);
	return Math.min(Condition.Highest, Math.max(Condition.Lowest, settled - crowding));
}

export function warinessOf(fish: Fish, today: number) {
	const since = today - Wariness.RecentDays;
	let recent = 0;
	for (const day of fish.captureDays) if (day > since) recent += 1;
	return Math.min(Wariness.Most, recent * Wariness.PerCapture);
}

export function rememberCapture(fish: Fish, today: number) {
	const since = today - Wariness.RecentDays;
	fish.captureDays = [...fish.captureDays.filter((day) => day > since), today];
}

export function appetiteOf(fish: Fish) {
	return Appetite.Floor + fish.condition * Appetite.PerConditionPoint;
}

export function chanceOfDyingAt(ageYears: number) {
	if (ageYears < Lifespan.SafeUntilYears) return 0;
	if (ageYears >= Lifespan.CertainAtYears) return 1;
	return Lifespan.ChanceInFirstOldYear + (ageYears - Lifespan.SafeUntilYears) * Lifespan.ExtraChancePerYear;
}

export function survivesTheNewYear(fish: Fish, random: RandomFraction) {
	fish.ageYears += 1;
	return random() >= chanceOfDyingAt(fish.ageYears);
}

export function bandPriceOf(weightLb: number) {
	return GuideBands.reduce((total, band) => total + Math.max(0, Math.min(weightLb, band.toLb) - band.fromLb) * band.poundsPerLb, 0);
}

export function guidePriceOf(fish: Fish) {
	const conditionFactor = ConditionValue.Floor + fish.condition * ConditionValue.PerConditionPoint;
	const fameFactor = 1 + Math.min(Fame.MostFactor, fish.fame * Fame.PerFamePoint);
	return Math.round(bandPriceOf(fish.weightLb) * conditionFactor * fameFactor);
}
