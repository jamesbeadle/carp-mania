import { shoalsBiomassLb, type Shoal } from '../stock/shoals';
import type { Carp } from '../types';

type Weighed = Pick<Carp, 'weight_lb' | 'is_catalogued'>;
type Shoaled = Pick<Shoal, 'count' | 'average_weight_lb'>;
const NoShoals: Shoaled[] = [];

export const StockingDensity = {
	ConditionLossAboveLbPerAcre: 400,
	FarmRefusesAboveLbPerAcre: 500,
	ExtraConditionLossPerDay: 1
} as const;

export function biomassLb(carp: Weighed[], shoals: Shoaled[] = NoShoals) {
	const catalogued = carp.filter((fish) => fish.is_catalogued);
	const named = catalogued.reduce((total, fish) => total + Number(fish.weight_lb), 0);
	return named + shoalsBiomassLb(shoals);
}

export function biomassPerAcre(carp: Weighed[], waterAcres: number, shoals: Shoaled[] = NoShoals) {
	return biomassLb(carp, shoals) / Math.max(0.1, waterAcres);
}

export function isOverstocked(carp: Weighed[], waterAcres: number, shoals: Shoaled[] = NoShoals) {
	return biomassPerAcre(carp, waterAcres, shoals) > StockingDensity.ConditionLossAboveLbPerAcre;
}

export function wouldFarmRefuse(carp: Weighed[], waterAcres: number, incomingLb: number, shoals: Shoaled[] = NoShoals) {
	const biomass = biomassLb(carp, shoals) + incomingLb;
	return biomass / Math.max(0.1, waterAcres) > StockingDensity.FarmRefusesAboveLbPerAcre;
}
