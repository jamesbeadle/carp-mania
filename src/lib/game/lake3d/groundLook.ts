import type { BedType } from '$lib/domain/types';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { Speckling } from './speckledTexture';

const GrassFlecks = ['#46652a', '#58762f', '#3d5a22', '#62803a', '#4f6a2c'];
const GrassBase: Record<SeasonName, string> = { spring: '#4f7a2a', summer: '#56782c', autumn: '#6a6a2e', winter: '#5f6e4a' };

export function grassSpeckling(season: SeasonName): Speckling {
	return { base: GrassBase[season], flecks: GrassFlecks, fleckCount: 9000, largestFleck: 2, metresPerTile: 5, seed: 11 };
}

const BedBase: Record<BedType, string> = { gravel: '#8a7a58', clay: '#6b4a2e', silt: '#3a3524', rock: '#6d6d68' };
const BedFlecks: Record<BedType, string[]> = {
	gravel: ['#b5a37a', '#6e6146', '#cfc19a'],
	clay: ['#7d5a3a', '#553a24'],
	silt: ['#2c281b', '#4a4430'],
	rock: ['#8a8a85', '#4f4f4a']
};

export function bedSpeckling(bed: BedType): Speckling {
	return { base: BedBase[bed], flecks: BedFlecks[bed], fleckCount: 1800, largestFleck: 4, metresPerTile: 6, seed: 23 };
}

export const ShoreLook = { Earth: '#4a3a26', Path: '#8c7a55' } as const;
