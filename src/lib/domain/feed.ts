import type { FeedType } from './types';

export interface FeedProfile {
	label: string;
	pricePerKilogram: number;
	proteinScore: number;
	conditionScore: number;
	baitCounterpart: string;
}

export const FeedCatalogue: Record<FeedType, FeedProfile> = {
	fishmeal_boilies: { label: 'Fishmeal boilies', pricePerKilogram: 9, proteinScore: 1, conditionScore: 0.6, baitCounterpart: 'fishmeal_boilie' },
	hemp: { label: 'Hemp', pricePerKilogram: 2.5, proteinScore: 0.35, conditionScore: 0.9, baitCounterpart: 'hemp' },
	maize: { label: 'Maize', pricePerKilogram: 1.5, proteinScore: 0.3, conditionScore: 0.5, baitCounterpart: 'sweetcorn' },
	particles: { label: 'Particle mix', pricePerKilogram: 2, proteinScore: 0.4, conditionScore: 0.8, baitCounterpart: 'particle' },
	worms: { label: 'Worms', pricePerKilogram: 12, proteinScore: 0.8, conditionScore: 1, baitCounterpart: 'worm' },
	shrimp: { label: 'Shrimp', pricePerKilogram: 14, proteinScore: 0.9, conditionScore: 1, baitCounterpart: 'shrimp' }
};

export const FeedTypes = Object.keys(FeedCatalogue) as FeedType[];

export const DailyFeed = {
	KilogramsPerHundredCarp: 4,
	MaximumConditionGainPerDay: 2,
	HungerConditionLossPerDay: 1.5
} as const;

export function emptyFeedStock(): Record<FeedType, number> {
	return { fishmeal_boilies: 0, hemp: 0, maize: 0, particles: 0, worms: 0, shrimp: 0 };
}

export function totalFeedKilograms(feedStock: Record<FeedType, number>) {
	return FeedTypes.reduce((total, feedType) => total + feedStock[feedType], 0);
}
