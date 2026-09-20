import type { Shoal } from '$lib/domain/stock/shoals';
import type { Carp, Lake } from '$lib/domain/types';
import type { LakeSpecies } from '$lib/domain/water/species';

export interface WaterAsFound {
	lake: Lake;
	carp: Carp[];
	shoals: Shoal[];
	species: LakeSpecies[];
}
