import type { CarpOrigin } from '../types';

export type FarmBandKey = 'stockies' | 'doubles' | 'mid_doubles' | 'twenties';

export interface FarmBand {
	key: FarmBandKey;
	label: string;
	minimumLb: number;
	maximumLb: number;
	weeklySupply: number;
	pricePerFish: number;
}

export const FarmBands: FarmBand[] = [
	{ key: 'stockies', label: '4–6 lb stockies', minimumLb: 4, maximumLb: 6, weeklySupply: 200, pricePerFish: 150 },
	{ key: 'doubles', label: '8–12 lb', minimumLb: 8, maximumLb: 12, weeklySupply: 80, pricePerFish: 300 },
	{ key: 'mid_doubles', label: '14–18 lb', minimumLb: 14, maximumLb: 18, weeklySupply: 30, pricePerFish: 720 },
	{ key: 'twenties', label: '20–25 lb', minimumLb: 20, maximumLb: 25, weeklySupply: 10, pricePerFish: 1500 }
];

export const FarmDelivery = { CostPerOrder: 250, FisheryDays: 1, RealHoursPerFisheryWeek: 7 } as const;

export const FarmFishCondition = { Minimum: 80, Maximum: 90 } as const;
export const FarmFishOrigin: CarpOrigin = 'farm';

export type FarmOrder = Partial<Record<FarmBandKey, number>>;

export const FarmBandKeys = FarmBands.map((band) => band.key);

export function farmBand(key: FarmBandKey) {
	return FarmBands.find((band) => band.key === key)!;
}

export function farmOrderFishCost(order: FarmOrder) {
	return FarmBands.reduce((total, band) => total + (order[band.key] ?? 0) * band.pricePerFish, 0);
}

export function farmOrderTotalCost(order: FarmOrder) {
	const fishCount = farmOrderFishCount(order);
	return fishCount === 0 ? 0 : farmOrderFishCost(order) + FarmDelivery.CostPerOrder;
}

export function farmOrderFishCount(order: FarmOrder) {
	return FarmBands.reduce((total, band) => total + (order[band.key] ?? 0), 0);
}

export function farmOrderHeaviestPossibleLb(order: FarmOrder) {
	return FarmBands.reduce((total, band) => total + (order[band.key] ?? 0) * band.maximumLb, 0);
}

export function fisheryWeekNumber(now: Date) {
	return Math.floor(now.getTime() / (FarmDelivery.RealHoursPerFisheryWeek * 60 * 60 * 1000));
}

export function fisheryWeekStart(now: Date) {
	return new Date(fisheryWeekNumber(now) * FarmDelivery.RealHoursPerFisheryWeek * 60 * 60 * 1000);
}

export function ageForFarmFish(weightLb: number) {
	return Math.round(2 + weightLb / 4);
}
