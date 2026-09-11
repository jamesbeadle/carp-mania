import type { Carp } from '../types';

export const StockingDensity = {
	ConditionLossAboveLbPerAcre: 400,
	FarmRefusesAboveLbPerAcre: 500,
	ExtraConditionLossPerDay: 1
} as const;

export function biomassPerAcre(carp: Pick<Carp, 'weight_lb' | 'is_catalogued'>[], waterAcres: number) {
	const catalogued = carp.filter((fish) => fish.is_catalogued);
	const biomass = catalogued.reduce((total, fish) => total + Number(fish.weight_lb), 0);
	return biomass / Math.max(0.1, waterAcres);
}

export function isOverstocked(carp: Pick<Carp, 'weight_lb' | 'is_catalogued'>[], waterAcres: number) {
	return biomassPerAcre(carp, waterAcres) > StockingDensity.ConditionLossAboveLbPerAcre;
}

export function wouldFarmRefuse(carp: Pick<Carp, 'weight_lb' | 'is_catalogued'>[], waterAcres: number, incomingLb: number) {
	const biomass = biomassPerAcre(carp, waterAcres) * Math.max(0.1, waterAcres) + incomingLb;
	return biomass / Math.max(0.1, waterAcres) > StockingDensity.FarmRefusesAboveLbPerAcre;
}
