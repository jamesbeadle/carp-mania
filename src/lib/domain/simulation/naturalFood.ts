import { targetFertilityFor } from '../sites/siteWater';
import type { Lake } from '../types';
import { clampToScale } from '../waterQuality';

export const NaturalFood = {
	FreeRationShareAtFullFertility: 0.4,
	HealthyWeedBonus: 5,
	HealthyWeedFrom: 25,
	HealthyWeedTo: 40,
	FertilityClimbPerDay: 0.6
} as const;

export function effectiveFertility(lake: Pick<Lake, 'fertility' | 'weed'>) {
	const weed = Number(lake.weed);
	const isHealthyWeed = weed >= NaturalFood.HealthyWeedFrom && weed <= NaturalFood.HealthyWeedTo;
	return clampToScale(Number(lake.fertility) + (isHealthyWeed ? NaturalFood.HealthyWeedBonus : 0));
}

export function freeRationFraction(lake: Pick<Lake, 'fertility' | 'weed'>) {
	return (effectiveFertility(lake) / 100) * NaturalFood.FreeRationShareAtFullFertility;
}

export function driftFertilityForOneDay(lake: Pick<Lake, 'fertility' | 'site_type'>) {
	const target = targetFertilityFor(lake.site_type);
	const current = Number(lake.fertility);
	if (current >= target) return current;
	return clampToScale(Math.min(target, current + NaturalFood.FertilityClimbPerDay));
}
