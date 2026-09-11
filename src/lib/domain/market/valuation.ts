import { StrainCatalogue } from '../strains';
import type { Carp } from '../types';

export interface PriceBand {
	fromLb: number;
	toLb: number;
	poundsPerLb: number;
}

export const PriceBands: PriceBand[] = [
	{ fromLb: 0, toLb: 10, poundsPerLb: 30 },
	{ fromLb: 10, toLb: 20, poundsPerLb: 70 },
	{ fromLb: 20, toLb: 30, poundsPerLb: 200 },
	{ fromLb: 30, toLb: 40, poundsPerLb: 550 },
	{ fromLb: 40, toLb: 50, poundsPerLb: 1400 },
	{ fromLb: 50, toLb: Number.POSITIVE_INFINITY, poundsPerLb: 3000 }
];

const ConditionFactor = { Floor: 0.6, PerConditionPoint: 1 / 250 } as const;
const FameFactor = { Cap: 1.5, PerFamePoint: 1 / 100 } as const;

export function bandPrice(weightLb: number) {
	return PriceBands.reduce((total, band) => total + Math.max(0, Math.min(weightLb, band.toLb) - band.fromLb) * band.poundsPerLb, 0);
}

export function conditionFactor(condition: number) {
	return ConditionFactor.Floor + condition * ConditionFactor.PerConditionPoint;
}

export function fameFactor(fame: number) {
	return 1 + Math.min(FameFactor.Cap, fame * FameFactor.PerFamePoint);
}

export function guidePriceOf(carp: Pick<Carp, 'weight_lb' | 'strain' | 'condition' | 'fame'>) {
	const price = bandPrice(Number(carp.weight_lb)) * StrainCatalogue[carp.strain].valueFactor * conditionFactor(Number(carp.condition)) * fameFactor(carp.fame);
	return Math.round(price);
}

export function priceBandLabel(weightLb: number) {
	const tens = Math.floor(weightLb / 10) * 10;
	return `${tens}s`;
}
