import type { Carp, CarpOrigin } from '../types';
import { sizeBandOf, type SizeBandName } from './stockBySize';

export type ShoalBand = 'fry' | SizeBandName;

export interface Shoal {
	id: string;
	lake_id: string;
	size_band: ShoalBand;
	count: number;
	average_weight_lb: number;
	weight_spread_lb: number;
	age_years: number;
	condition: number;
	origin: CarpOrigin;
	farm_pack_id: string | null;
	transit_until: string | null;
	quarantine_until: string | null;
}

export type NewShoal = Omit<Shoal, 'id'>;

export const ShoalRules = { NamedFishThreshold: 20, NamedFromLb: 20, FryBelowLb: 4 } as const;
export const ShoalBandWords: Record<ShoalBand, string> = {
	fry: 'fry',
	singles: 'singles',
	doubles: 'doubles',
	twenties: 'twenties',
	thirties: 'thirties',
	forties: 'forties',
	fifties: 'fifties'
};

const RepresentativeName = 'the shoal';
const NeverCaught = 0;

export function shoalBandOf(averageWeightLb: number): ShoalBand {
	if (averageWeightLb < ShoalRules.FryBelowLb) return 'fry';
	return sizeBandOf(averageWeightLb).name;
}

export function shoalBiomassLb(shoal: Pick<Shoal, 'count' | 'average_weight_lb'>) {
	return shoal.count * Number(shoal.average_weight_lb);
}

export function shoalsBiomassLb(shoals: Pick<Shoal, 'count' | 'average_weight_lb'>[]) {
	return shoals.reduce((total, shoal) => total + shoalBiomassLb(shoal), 0);
}

export function headCountOf(shoals: Pick<Shoal, 'count'>[]) {
	return shoals.reduce((total, shoal) => total + shoal.count, 0);
}

export function isShoalFishable(shoal: Pick<Shoal, 'transit_until' | 'quarantine_until' | 'count'>) {
	return shoal.count > 0 && shoal.transit_until === null && shoal.quarantine_until === null;
}

export function representativeOf(shoal: Shoal): Carp {
	return {
		id: shoal.id,
		lake_id: shoal.lake_id,
		name: RepresentativeName,
		strain: 'common',
		weight_lb: Number(shoal.average_weight_lb),
		age_years: shoal.age_years,
		condition: Number(shoal.condition),
		times_caught: NeverCaught,
		origin: shoal.origin,
		origin_lake_id: null,
		fame: 0,
		is_catalogued: true,
		transit_until: shoal.transit_until,
		quarantine_until: shoal.quarantine_until
	};
}

export function withRepresentative(shoal: Shoal, grown: Pick<Carp, 'weight_lb' | 'condition'>): Shoal {
	const average_weight_lb = Number(grown.weight_lb);
	return { ...shoal, average_weight_lb, condition: Number(grown.condition), size_band: shoalBandOf(average_weight_lb) };
}

export function isShoalWorthNaming(shoal: Pick<Shoal, 'average_weight_lb' | 'count'>) {
	return shoal.count > 0 && Number(shoal.average_weight_lb) >= ShoalRules.NamedFromLb;
}
