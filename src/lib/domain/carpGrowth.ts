import { DailyFeed, FeedCatalogue, FeedTypes, totalFeedKilograms } from './feed';
import type { Carp, FeedType } from './types';

export const CarpWeight = { StarterMinimumLb: 10, StarterMaximumLb: 15 } as const;

export const GrowthRate = { PoundsGainedPerProteinDay: 0.035, SlowsAboveLb: 40, SlowingFactor: 0.4 } as const;
export const Hunger = { ShrinksBelowCondition: 40, PoundsLostPerDay: 0.02 } as const;

export function dailyRationKilograms(carpCount: number) {
	return (carpCount / 100) * DailyFeed.KilogramsPerHundredCarp;
}

export function feedProteinScore(feedStock: Record<FeedType, number>) {
	const total = totalFeedKilograms(feedStock);
	if (total === 0) return 0;
	return FeedTypes.reduce((score, feedType) => score + (feedStock[feedType] / total) * FeedCatalogue[feedType].proteinScore, 0);
}

export function feedConditionScore(feedStock: Record<FeedType, number>) {
	const total = totalFeedKilograms(feedStock);
	if (total === 0) return 0;
	return FeedTypes.reduce((score, feedType) => score + (feedStock[feedType] / total) * FeedCatalogue[feedType].conditionScore, 0);
}

export function growCarpForOneDay(carp: Carp, proteinScore: number, rationFraction: number, growthFactor: number, ceilingLb: number): Carp {
	const slowing = carp.weight_lb > GrowthRate.SlowsAboveLb ? GrowthRate.SlowingFactor : 1;
	const gained = GrowthRate.PoundsGainedPerProteinDay * proteinScore * rationFraction * slowing * growthFactor;
	const weight_lb = Math.min(Math.max(carp.weight_lb, ceilingLb), round(carp.weight_lb + gained));
	return { ...carp, weight_lb };
}

export function shrinkHungryCarp(carp: Carp): Carp {
	if (carp.condition >= Hunger.ShrinksBelowCondition) return carp;
	return { ...carp, weight_lb: Math.max(1, round(carp.weight_lb - Hunger.PoundsLostPerDay)) };
}

export function consumeFeedForOneDay(feedStock: Record<FeedType, number>, ration: number) {
	const total = totalFeedKilograms(feedStock);
	if (total === 0) return { feedStock, rationFraction: 0 };
	const eaten = Math.min(total, ration);
	const remaining = { ...feedStock };
	for (const feedType of FeedTypes) remaining[feedType] = round(feedStock[feedType] - (feedStock[feedType] / total) * eaten);
	return { feedStock: remaining, rationFraction: eaten / ration };
}

function round(value: number) {
	return Math.round(value * 100) / 100;
}
