import { randomBetween, type RandomFraction } from '../../src/lib/domain/random';
import { guidePriceOf, newFish } from './fish';
import { potentialFor } from './potential';
import type { Lake } from './lake';
import { Clock } from './rules';
import { FarmShelf, FarmTerms, Feeds, Money, type FarmBand } from './shelf';
import { runningCostsFor } from './visitors';

export interface Purse {
	money: number;
}

export function farmPriceOf(band: FarmBand) {
	const midpointLb = (band.fromLb + band.toLb) / 2;
	const guide = guidePriceOf(newFish(midpointLb, band.condition.highest, band.ageYears, midpointLb));
	return Math.max(FarmTerms.PriceRounding, Math.round((guide * band.priceFactor) / FarmTerms.PriceRounding) * FarmTerms.PriceRounding);
}

export function orderCostOf(band: FarmBand, count: number) {
	return farmPriceOf(band) * count + FarmTerms.DeliveryPerOrder;
}

export function fishAffordable(band: FarmBand, moneyToSpend: number) {
	return Math.floor((moneyToSpend - FarmTerms.DeliveryPerOrder) / farmPriceOf(band));
}

export function bandsOpenTo(rating: number) {
	return FarmShelf.filter((band) => rating >= band.ratingNeeded);
}

export function biggestBandOpenTo(rating: number) {
	return bandsOpenTo(rating).reduce((biggest, band) => (band.toLb > biggest.toLb ? band : biggest));
}

export function buyFish(purse: Purse, lake: Lake, band: FarmBand, count: number, random: RandomFraction) {
	const cost = orderCostOf(band, count);
	const isAffordable = count > 0 && purse.money >= cost;
	if (!isAffordable) return 0;
	purse.money -= cost;
	for (let index = 0; index < count; index++) lake.fish.push(farmFishFrom(band, random));
	return count;
}

function farmFishFrom(band: FarmBand, random: RandomFraction) {
	const weightLb = randomBetween(random, band.fromLb, band.toLb);
	const condition = randomBetween(random, band.condition.lowest, band.condition.highest);
	return newFish(weightLb, condition, band.ageYears, potentialFor(band.bloodline, weightLb, random));
}

export function feedKilogramsPerDay(lake: Lake) {
	return (lake.fish.length / 100) * Money.KilogramsPerHundredFishPerDay;
}

export function feedCostPerDay(lake: Lake, feed: keyof typeof Feeds) {
	return feedKilogramsPerDay(lake) * Feeds[feed].pricePerKilogram;
}

export function reserveFor(lake: Lake, feed: keyof typeof Feeds) {
	return Money.ReserveDays * Clock.FisheryDaysPerRealDay * (runningCostsFor(lake) + feedCostPerDay(lake, feed));
}
