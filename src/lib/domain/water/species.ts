import type { SiteType } from '../types';

export type Species = 'bream' | 'tench' | 'crucian' | 'roach_rudd' | 'perch';

export interface LakeSpecies {
	lake_id: string;
	species: Species;
	count: number;
}

export interface SpeciesProfile {
	label: string;
	steal: number;
	nuisance: number;
	reputationBonus: number;
	pricePerFish: number;
	typicalLb: number;
	note: string;
}

export const SpeciesCatalogue: Record<Species, SpeciesProfile> = {
	bream: { label: 'Bream', steal: 0.9, nuisance: 0.3, reputationBonus: 0, pricePerFish: 2, typicalLb: 6, note: 'The vacuum. First to the bait, and they clear it.' },
	tench: { label: 'Tench', steal: 0.4, nuisance: 0.12, reputationBonus: 2, pricePerFish: 8, typicalLb: 5, note: 'Tidy feeders. A water with tench reads as a healthy water.' },
	crucian: { label: 'Crucian', steal: 0.3, nuisance: 0.1, reputationBonus: 0, pricePerFish: 5, typicalLb: 2, note: 'Harmless and popular — visitors like them.' },
	roach_rudd: { label: 'Roach and rudd', steal: 0.15, nuisance: 0.06, reputationBonus: 0, pricePerFish: 1, typicalLb: 1, note: 'Pike food that breeds, so the pike feed themselves.' },
	perch: { label: 'Perch', steal: 0.1, nuisance: 0.05, reputationBonus: 0, pricePerFish: 3, typicalLb: 1.5, note: 'Eat fry, which holds the silvers down for you.' }
};

export const SpeciesNames = Object.keys(SpeciesCatalogue) as Species[];
export const SpeciesShare = { MouthsPerAcre: 90, MostStolen: 0.45, MostNuisance: 0.4 } as const;
export const Netting = { CostPerAcre: 900, Days: 4, Disturbance: 8, TakenShare: 0.6 } as const;
export const SeededSpecies: Partial<Record<SiteType, Partial<Record<Species, number>>>> = {
	estate_lake: { bream: 150, tench: 40, roach_rudd: 300 },
	clay_pit: { bream: 300, roach_rudd: 200 },
	gravel_pit: { tench: 30, perch: 60, roach_rudd: 200 },
	farm_pond: { crucian: 80, roach_rudd: 100 }
};

type Counted = Pick<LakeSpecies, 'species' | 'count'>;

function weightedMouths(species: Counted[], weightOf: (profile: SpeciesProfile) => number) {
	return species.reduce((total, line) => total + line.count * weightOf(SpeciesCatalogue[line.species]), 0);
}

export function feedStolenShare(species: Counted[], waterAcres: number) {
	const mouths = weightedMouths(species, (profile) => profile.steal);
	return Math.min(SpeciesShare.MostStolen, mouths / (Math.max(0.1, waterAcres) * SpeciesShare.MouthsPerAcre));
}

export function nuisanceBiteShare(species: Counted[], waterAcres: number) {
	const mouths = weightedMouths(species, (profile) => profile.nuisance);
	return Math.min(SpeciesShare.MostNuisance, mouths / (Math.max(0.1, waterAcres) * SpeciesShare.MouthsPerAcre));
}

export function speciesReputationBonus(species: Counted[]) {
	return species.filter((line) => line.count > 0).reduce((total, line) => total + SpeciesCatalogue[line.species].reputationBonus, 0);
}

export function nettingQuoteFor(waterAcres: number) {
	return { cost: Math.round(waterAcres * Netting.CostPerAcre), days: Netting.Days, disturbance: Netting.Disturbance };
}

export function isSpecies(value: string): value is Species {
	return (SpeciesNames as string[]).includes(value);
}
