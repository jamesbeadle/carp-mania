import type { CarpStrain } from './types';
import { RegionCatalogue } from './world/regions';
import type { RegionCode } from './world/regionCodes';

export const StrainCatalogue: Record<CarpStrain, { label: string; rarity: number; valueFactor: number }> = {
	common: { label: 'Common', rarity: 0.38, valueFactor: 1 },
	mirror: { label: 'Mirror', rarity: 0.33, valueFactor: 1.05 },
	linear: { label: 'Linear', rarity: 0.12, valueFactor: 1.2 },
	fully_scaled: { label: 'Fully scaled', rarity: 0.04, valueFactor: 1.25 },
	leather: { label: 'Leather', rarity: 0.08, valueFactor: 1.3 },
	ghost: { label: 'Ghost', rarity: 0.05, valueFactor: 1.35 }
};

export const Strains = Object.keys(StrainCatalogue) as CarpStrain[];

export function strainWeightsFor(region: RegionCode | null): Record<CarpStrain, number> {
	const lean = region ? RegionCatalogue[region].strainLean : {};
	const weights = Object.fromEntries(Strains.map((strain) => [strain, lean[strain] ?? StrainCatalogue[strain].rarity])) as Record<CarpStrain, number>;
	const total = Strains.reduce((sum, strain) => sum + weights[strain], 0);
	for (const strain of Strains) weights[strain] = weights[strain] / total;
	return weights;
}

export function pickStrain(randomFraction: number, region: RegionCode | null = null): CarpStrain {
	const weights = strainWeightsFor(region);
	let remaining = randomFraction;
	for (const strain of Strains) {
		remaining -= weights[strain];
		if (remaining <= 0) return strain;
	}
	return 'common';
}
