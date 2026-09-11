import type { CarpStrain } from './types';

export const StrainCatalogue: Record<CarpStrain, { label: string; rarity: number }> = {
	common: { label: 'Common', rarity: 0.4 },
	mirror: { label: 'Mirror', rarity: 0.35 },
	linear: { label: 'Linear', rarity: 0.12 },
	leather: { label: 'Leather', rarity: 0.08 },
	ghost: { label: 'Ghost', rarity: 0.05 }
};

export const Strains = Object.keys(StrainCatalogue) as CarpStrain[];

export function pickStrain(randomFraction: number): CarpStrain {
	let remaining = randomFraction;
	for (const strain of Strains) {
		remaining -= StrainCatalogue[strain].rarity;
		if (remaining <= 0) return strain;
	}
	return 'common';
}
