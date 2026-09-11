import type { FarmBand } from '$lib/domain/market/fishFarm';

export interface FarmBandStock extends FarmBand {
	sold: number;
	left: number;
}
